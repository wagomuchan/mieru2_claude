// 戦いの計算（全自動）。画面のことは知らない。
// step() を呼ぶたびに、だれか1人が動き、その「できごと」の列を返す。
import { STATS, STAT_NAMES, SKILLS, PARTY_DEFS, ENEMY_DEFS, enemyStats } from './data.js';

// ───────── 仲間の 育ち ─────────
export function newMember(id) {
  const def = PARTY_DEFS[id];
  const max = { ...def.base };
  const m = { id, name: def.name, awaken: 0, max, hp: max.hp, mp: max.mp, skills: [] };
  learnSkills(m);
  return m;
}

function learnSkills(m) {
  const got = [];
  for (const [n, sk] of PARTY_DEFS[m.id].learn) {
    if (m.awaken >= n && !m.skills.includes(sk)) { m.skills.push(sk); got.push(sk); }
  }
  return got;
}

// 何回か 覚醒した ところまで そだてる（「第二章から」や、途中から 仲間になる子）
export function growMember(m, n, rand) {
  for (let i = 0; i < n; i++) doAwaken(m, rand);
  m.hp = m.max.hp; m.mp = m.max.mp;
  return m;
}

// 覚醒：ステータスが1つ上がる
export function doAwaken(m, rand) {
  const w = PARTY_DEFS[m.id].weight;
  let total = 0;
  for (const k of STATS) total += w[k];
  let r = rand() * total, stat = 'hp';
  for (const k of STATS) { r -= w[k]; if (r < 0) { stat = k; break; } }
  const amount = stat === 'hp' ? 4 + Math.floor(rand() * 3)
    : stat === 'mp' ? 2 + Math.floor(rand() * 2)
      : 1 + Math.floor(rand() * 2);
  m.max[stat] += amount;
  if (stat === 'hp' && m.hp > 0) m.hp += amount;
  if (stat === 'mp') m.mp += amount;
  m.awaken++;
  const learned = learnSkills(m);
  return { stat, amount, learned };
}

// 覚醒の起こりやすさ（見える1と同じ式）
export function awakenChance(groupLv, count) {
  const r = (groupLv + 20) / (count + 20);
  let f;
  if (r < 0.55) f = 0;
  else if (r < 1) f = (r - 0.55) / 0.45;
  else f = Math.min(2.5, r);
  return 0.36 * f / (1 + count / 150);
}

export function groupLevel(enemyIds, lvAdd = 0) {
  const lvs = enemyIds.map(id => ENEMY_DEFS[id].lv + lvAdd);
  return Math.max(...lvs) + 4 * (lvs.length - 1);
}

// ───────── 戦い ─────────
const STAGE = 0.3; // つよさ変化 1段階の 大きさ

export class Battle {
  // opts.hearts(a, b): 2人の ハートの数（仲良し度）
  // opts.tune: その場所の 強さの つまみ { lv: 足す強さ, hp: HPの 倍率 }
  constructor(members, enemyIds, rand = Math.random, opts = {}) {
    this.rand = rand;
    this.hearts = opts.hearts || (() => 0);
    this.nakaLog = [];   // [a, b, 点数]
    const tune = opts.tune || {};
    this.groupLv = groupLevel(enemyIds, tune.lv || 0);
    // 全滅したら 覚醒を取り消すための 控え
    this.snapshot = members.map(m => JSON.parse(JSON.stringify({ awaken: m.awaken, max: m.max, skills: m.skills })));
    this.members = members;
    this.allies = members.map((m, i) => this.wrapAlly(m, i));
    const count = {};
    this.enemies = enemyIds.map((id, i) => {
      const def = ENEMY_DEFS[id];
      count[id] = (count[id] || 0) + 1;
      const st = enemyStats(def, tune.lv || 0, tune.hp || 1);
      return {
        side: 'enemy', id, def, idx: i, name: def.name, letter: '',
        max: st, hp: st.hp, mp: st.mp, ...unitState(),
      };
    });
    // 同じ敵が2体以上なら A, B…
    const seen = {};
    for (const e of this.enemies) {
      if (count[e.id] > 1) { seen[e.id] = (seen[e.id] || 0) + 1; e.name = e.def.name + ' ' + 'ABCD'[seen[e.id] - 1]; }
    }
    this.queue = [];
    this.round = 0;
    this.result = null;
    this.awakenLog = [];
    this.cheersUsed = 0;
  }

  wrapAlly(m, i) {
    const u = { side: 'ally', id: m.id, idx: i, member: m, name: m.name, ...unitState() };
    Object.defineProperty(u, 'hp', { get: () => m.hp, set: v => { m.hp = v; } });
    Object.defineProperty(u, 'mp', { get: () => m.mp, set: v => { m.mp = v; } });
    Object.defineProperty(u, 'max', { get: () => m.max });
    return u;
  }

  get units() { return [...this.allies, ...this.enemies]; }
  alive(list) { return list.filter(u => u.hp > 0); }

  // 1人ぶん 進める。終わったら null
  step() {
    if (this.result) return null;
    if (!this.queue.length) this.newRound();
    const u = this.queue.shift();
    if (!u || u.hp <= 0) return [];
    const ev = [];
    this.act(u, ev);
    this.tickStatus(u);
    this.checkEnd(ev);
    return ev;
  }

  newRound() {
    this.round++;
    const list = this.alive(this.units);
    const key = u => this.stat(u, 'spd') * (0.85 + this.rand() * 0.3);
    this.queue = list.map(u => [key(u), u]).sort((a, b) => b[0] - a[0]).map(x => x[1]);
  }

  stat(u, k) {
    const b = u.buffs[k];
    const v = u.max[k] * (b ? 1 + STAGE * b.stage : 1);
    return Math.max(1, v);
  }

  checkEnd(ev) {
    if (this.result) return;
    if (!this.alive(this.enemies).length) {
      this.result = 'win';
      ev.push({ t: 'msg', text: 'たたかいに かった！' });
      ev.push({ t: 'end', result: 'win' });
    } else if (!this.alive(this.allies).length) {
      this.result = 'lose';
      // その戦いで起きた覚醒は とりけし
      this.members.forEach((m, i) => {
        const s = this.snapshot[i];
        m.awaken = s.awaken; m.max = s.max; m.skills = s.skills;
      });
      ev.push({ t: 'msg', text: '目の前が まっくらに なった……' });
      ev.push({ t: 'end', result: 'lose' });
    }
  }

  // おうえん（プレイヤーが できる ただ1つのこと）
  cheer() {
    const ev = [{ t: 'msg', text: 'がんばれ！ みんなの げんきが もどってきた！' }];
    for (const a of this.allies) {
      const from = a.hp;
      if (a.hp <= 0) {
        a.hp = Math.ceil(a.max.hp * 0.35);
        ev.push({ t: 'revive', unit: a }, { t: 'hp', unit: a, from, to: a.hp });
      } else {
        a.hp = Math.min(a.max.hp, a.hp + Math.ceil(a.max.hp * 0.35));
        ev.push({ t: 'hp', unit: a, from, to: a.hp });
      }
      a.sleep = 0; a.confused = 0;
    }
    this.cheersUsed++;
    return ev;
  }

  // ───────── 行動 ─────────
  act(u, ev) {
    if (u.stun) { u.stun = 0; ev.push({ t: 'msg', text: `${u.name}は うごけない！` }); return; }
    if (u.sleep > 0) { ev.push({ t: 'msg', text: `${u.name}は ぐっすり ねむっている……` }); return; }
    let plan = u.side === 'ally' ? this.allyPlan(u) : this.enemyPlan(u);
    if (u.confused > 0 && this.rand() < 0.5) {
      // こんらん：てきと みかたの 区別が つかない
      const all = this.alive(this.units).filter(x => x !== u);
      plan = { kind: 'attack', verb: 'ふらふらしながら こうげき！', targets: [all[Math.floor(this.rand() * all.length)]] };
    }
    this.run(u, plan, ev);
    if (u.side === 'ally' && (plan.kind === 'attack' || plan.kind === 'magic')) this.followUp(u, plan, ev);
    if (u.side === 'ally' && (plan.kind === 'heal' || plan.kind === 'revive')) {
      for (const t of plan.targets) if (t !== u && t.side === 'ally') this.nakaLog.push([u.id, t.id, 1]);
    }
    if (u.side === 'ally' && plan.kind !== 'idle') this.tryAwaken(u, ev);
  }

  // ハート1〜：仲良しの子が つづけて こうげき
  followUp(u, plan, ev) {
    const enemies = this.alive(this.enemies);
    if (!enemies.length) return;
    for (const a of this.alive(this.allies)) {
      if (a === u || a.sleep || a.stun) continue;
      const h = this.hearts(u.id, a.id);
      if (h >= 1 && this.rand() < Math.min(0.3, 0.06 * h)) {
        const t = plan.targets.find(x => x.hp > 0 && x.side === 'enemy') || this.pick(enemies);
        ev.push({ t: 'msg', text: `${a.name}も つづけて こうげき！` });
        this.physical(a, t, 1, ev);
        this.nakaLog.push([u.id, a.id, 1]);
        return;
      }
    }
  }

  // ハート2〜：ピンチの 仲間を かばう
  cover(t) {
    if (t.side !== 'ally' || t.hp > t.max.hp * 0.35) return t;
    for (const a of this.alive(this.allies)) {
      if (a === t || a.hp < a.max.hp * 0.5 || a.sleep) continue;
      const h = this.hearts(t.id, a.id);
      if (h >= 2 && this.rand() < Math.min(0.4, 0.08 * h)) { this.covered = [a, t]; return a; }
    }
    return t;
  }

  tryAwaken(u, ev) {
    const m = u.member;
    if (this.rand() >= awakenChance(this.groupLv, m.awaken)) return;
    const res = doAwaken(m, this.rand);
    this.awakenLog.push(u.id);
    ev.push({ t: 'awaken', unit: u, stat: res.stat, amount: res.amount, label: STAT_NAMES[res.stat] });
    for (const sk of res.learned) {
      ev.push({ t: 'learn', unit: u, skill: sk });
      ev.push({ t: 'msg', text: `${u.name}は 「${SKILLS[sk].name}」を おぼえた！` });
    }
  }

  tickStatus(u) {
    for (const k in u.buffs) if (--u.buffs[k].turns <= 0) delete u.buffs[k];
    if (u.confused > 0) u.confused--;
    if (u.sleep > 0) u.sleep--;
  }

  pick(list) { return list[Math.floor(this.rand() * list.length)]; }
  canUse(u, sk) { return u.member.skills.includes(sk) && u.mp >= SKILLS[sk].mp; }

  // 仲間の 考え方（性格ごと）
  allyPlan(u) {
    const allies = this.alive(this.allies), enemies = this.alive(this.enemies);
    const fallen = this.allies.filter(a => a.hp <= 0);
    const ratio = a => a.hp / a.max.hp;
    const weakest = list => list.reduce((x, y) => (ratio(y) < ratio(x) ? y : x));
    const lowHp = list => list.reduce((x, y) => (y.hp < x.hp ? y : x));
    const highHp = list => list.reduce((x, y) => (y.hp > x.hp ? y : x));
    const skill = (sk, targets) => ({ skill: sk, ...SKILLS[sk], targets });

    if (u.id === 'shimeru') {
      // ちゃっかり：回復が いちばん。でも 手があいたら こすいことをする
      if (fallen.length && this.canUse(u, 'kitsuke')) return skill('kitsuke', [fallen[0]]);
      const hurt = allies.filter(a => ratio(a) < 0.55);
      if (hurt.length >= 2 && this.canUse(u, 'minnakusuri')) return skill('minnakusuri', allies);
      const w = weakest(allies);
      if (ratio(w) < 0.3 && this.canUse(u, 'tokkuyaku')) return skill('tokkuyaku', [w]);
      if (ratio(w) < 0.5 && this.canUse(u, 'kusuri')) return skill('kusuri', [w]);
      if (this.rand() < 0.22) {
        const strong = highHp(enemies);
        if (enemies.length >= 2 && this.canUse(u, 'nemurigusa') && this.rand() < 0.4 && !enemies.some(e => e.sleep)) return skill('nemurigusa', enemies);
        if (this.canUse(u, 'kuchiguruma') && this.rand() < 0.5 && !strong.confused) return skill('kuchiguruma', [strong]);
        if (this.canUse(u, 'hattari') && !strong.buffs.atk) return skill('hattari', [strong]);
      }
      // とどめを ちゃっかり いただく
      return { kind: 'attack', verb: `${PARTY_DEFS.shimeru.weapon}で ぺしっと たたいた！`, targets: [lowHp(enemies)] };
    }

    if (u.id === 'elesia') {
      // かんぺき：歌で 大物から たおす。MPを おしまない
      if (enemies.length >= 2) {
        if (this.canUse(u, 'duet') && this.rand() < 0.55) return skill('duet', enemies);
        if (this.canUse(u, 'arashi') && this.rand() < 0.6) return skill('arashi', enemies);
        if (this.canUse(u, 'komoriuta') && this.rand() < 0.15 && !enemies.some(e => e.sleep)) return skill('komoriuta', enemies);
        if (this.canUse(u, 'hibiku') && this.rand() < 0.65) return skill('hibiku', enemies);
      }
      const big = highHp(enemies);
      if (this.canUse(u, 'utahime') && this.rand() < 0.55) return skill('utahime', [big]);
      if (this.canUse(u, 'takanaru') && this.rand() < 0.6) return skill('takanaru', [big]);
      if (this.canUse(u, 'uta')) return skill('uta', [big]);
      return { kind: 'attack', verb: 'マイクで ぽかっと なぐった！', targets: [big] };
    }

    if (u.id === 'sakura') {
      // のんびり：みんなを まもって、敵を にぶくする。たまに ぼーっと している
      if (this.rand() < 0.08) return { kind: 'idle', verb: 'さくらもちの ことを 考えている……', targets: [] };
      const w = weakest(allies);
      if (ratio(w) < 0.4 && this.canUse(u, 'sakuramochi') && this.rand() < 0.6) return skill('sakuramochi', [w]);
      if (this.canUse(u, 'kekkai') && !allies.some(a => a.buffs.def && a.buffs.def.stage > 0) && this.rand() < 0.45) return skill('kekkai', allies);
      if (this.canUse(u, 'hanaikada') && !allies.some(a => a.buffs.spd && a.buffs.spd.stage > 0) && this.rand() < 0.25) return skill('hanaikada', allies);
      const strong = highHp(enemies);
      if (this.canUse(u, 'shibire') && !strong.stun && this.rand() < 0.3) return skill('shibire', [strong]);
      if (this.canUse(u, 'nibui') && !strong.buffs.spd && this.rand() < 0.25) return skill('nibui', [strong]);
      if (enemies.length >= 2 && this.canUse(u, 'fubuki') && this.rand() < 0.5) return skill('fubuki', enemies);
      return { kind: 'attack', verb: 'つえで こつんと たたいた！', targets: [this.pick(enemies)] };
    }

    // メイナ（ごうかい）：なんでも できる
    const w = weakest(allies);
    if (ratio(w) < 0.3 && w !== u && this.canUse(u, 'hitohada')) return skill('hitohada', [w]);
    if (this.canUse(u, 'gahaha') && !allies.some(a => a.buffs.atk) && this.rand() < 0.3) return skill('gahaha', allies);
    if (this.canUse(u, 'nagenawa') && this.rand() < 0.15) {
      const t = highHp(enemies);
      if (!t.stun) return skill('nagenawa', [t]);
    }
    if (enemies.length >= 2 && this.canUse(u, 'daifunsen') && this.rand() < 0.35) return skill('daifunsen', enemies);
    if (this.canUse(u, 'zachou') && this.rand() < 0.25) return skill('zachou', [highHp(enemies)]);
    if (this.canUse(u, 'ikki') && this.rand() < 0.25) return skill('ikki', [this.pick(enemies)]);
    return { kind: 'attack', verb: 'むちを ふるった！', targets: [this.pick(enemies)], combo: true };
  }

  enemyPlan(u) {
    const moves = u.def.moves;
    let total = moves.reduce((s, m) => s + m[0], 0), r = this.rand() * total, mv = moves[0][1];
    for (const [w, m] of moves) { r -= w; if (r < 0) { mv = m; break; } }
    const allies = this.alive(this.allies);
    let targets;
    if (mv.kind === 'buff') targets = [u];
    else if (mv.target === 'all') targets = allies;
    else targets = [this.cover(this.pick(allies))];
    return { ...mv, targets };
  }

  run(u, p, ev) {
    if (p.mp) { u.mp -= p.mp; ev.push({ t: 'mp', unit: u }); }
    if (u.side === 'ally' && p.skill) {
      ev.push({ t: 'msg', text: `${u.name}の ${p.name}！`, actor: u }, { t: 'msg', text: p.verb });
    } else {
      ev.push({ t: 'msg', text: `${u.name}は ${p.verb}`, actor: u });
    }

    if (this.covered) {
      const [a, t] = this.covered;
      this.covered = null;
      ev.push({ t: 'msg', text: `${a.name}が ${t.name}を かばった！` });
      this.nakaLog.push([a.id, t.id, 1]);
    }
    const targets = p.targets.filter(t => p.kind === 'revive' ? t.hp <= 0 : t.hp > 0);
    switch (p.kind) {
      case 'attack': {
        const hits = p.hits || 1;
        for (const t of targets) for (let i = 0; i < hits && t.hp > 0; i++) this.physical(u, t, p.power || 1, ev);
        // ごうかい：たまに もう1回
        if (p.combo && this.rand() < 0.15) {
          const t = this.pick(this.alive(this.enemies));
          if (t) { ev.push({ t: 'msg', text: 'もう いっぱつ！' }); this.physical(u, t, 1, ev); }
        }
        break;
      }
      case 'magic':
        for (const t of targets) this.magical(u, t, p.power, ev);
        break;
      case 'heal':
        for (const t of targets) {
          const amt = Math.round((p.power + this.stat(u, 'mag') * 1.2) * (0.9 + this.rand() * 0.2));
          const from = t.hp;
          t.hp = Math.min(t.max.hp, t.hp + amt);
          ev.push({ t: 'hp', unit: t, from, to: t.hp }, { t: 'msg', text: `${t.name}の HPが ${t.hp - from} かいふくした！` });
        }
        break;
      case 'revive':
        for (const t of targets) {
          const from = t.hp;
          t.hp = Math.ceil(t.max.hp * p.power);
          ev.push({ t: 'revive', unit: t }, { t: 'hp', unit: t, from, to: t.hp }, { t: 'msg', text: `${t.name}は 目を さました！` });
        }
        break;
      case 'buff':
      case 'debuff': {
        const d = p.kind === 'buff' ? 1 : -1;
        for (const t of targets) {
          const b = t.buffs[p.stat] || { stage: 0, turns: 0 };
          b.stage = Math.max(-2, Math.min(2, b.stage + d)); b.turns = 4;
          t.buffs[p.stat] = b;
          ev.push({ t: 'msg', text: `${t.name}の ${STAT_NAMES[p.stat]}が ${d > 0 ? 'あがった' : 'さがった'}！` });
        }
        break;
      }
      case 'confuse':
        for (const t of targets) {
          if (this.rand() < 0.7) { t.confused = 3; ev.push({ t: 'msg', text: `${t.name}は こんらんした！` }); }
          else ev.push({ t: 'msg', text: `${t.name}には きかなかった！` });
        }
        break;
      case 'drain':
        for (const t of targets) {
          const n = Math.min(t.mp, p.amount);
          t.mp -= n;
          ev.push({ t: 'mp', unit: t }, { t: 'msg', text: n ? `${t.name}の MPが ${n} へった！` : `${t.name}には きかなかった！` });
        }
        break;
      case 'sleep':
        for (const t of targets) {
          if (this.rand() < 0.5) { t.sleep = 3; ev.push({ t: 'msg', text: `${t.name}は ねむってしまった！` }); }
          else ev.push({ t: 'msg', text: `${t.name}は ねむらなかった！` });
        }
        break;
      case 'stun':
        for (const t of targets) {
          if (this.rand() < 0.75) { t.stun = 1; ev.push({ t: 'msg', text: `${t.name}を しばりあげた！` }); }
          else ev.push({ t: 'msg', text: `${t.name}は ひらりと かわした！` });
        }
        break;
    }
  }

  physical(u, t, power, ev) {
    let base = this.stat(u, 'atk') * 2 * power - this.stat(t, 'def');
    const crit = this.rand() < (u.side === 'ally' ? 0.06 : 0.03);
    if (crit) base = this.stat(u, 'atk') * 2.4 * power;
    const miss = !crit && this.rand() < 0.05;
    if (miss) { ev.push({ t: 'msg', text: `${t.name}は ひらりと よけた！` }); return; }
    this.damage(t, Math.max(1, Math.round(base * (0.85 + this.rand() * 0.3))), ev, crit);
  }

  magical(u, t, power, ev) {
    const base = power + this.stat(u, 'mag') * 1.6 - this.stat(t, 'def') * 0.5;
    this.damage(t, Math.max(1, Math.round(base * (0.9 + this.rand() * 0.2))), ev, false);
  }

  damage(t, amt, ev, crit) {
    const from = t.hp;
    t.hp = Math.max(0, t.hp - amt);
    if (crit) ev.push({ t: 'msg', text: 'かいしんの いちげき！' });
    ev.push({ t: 'hit', unit: t }, { t: 'hp', unit: t, from, to: t.hp });
    ev.push({ t: 'msg', text: `${t.name}に ${amt}の ダメージ！`, target: t });
    if (t.sleep && this.rand() < 0.5) { t.sleep = 0; ev.push({ t: 'msg', text: `${t.name}は 目を さました！` }); }
    if (t.hp <= 0) {
      t.sleep = 0; t.confused = 0; t.buffs = {};
      ev.push({ t: 'faint', unit: t });
      ev.push({ t: 'msg', text: t.side === 'enemy' ? `${t.name}を やっつけた！` : `${t.name}は きぜつした……` });
      // ハート3〜：仲良しの子が 気絶すると、気合いが入る
      if (t.side === 'ally') {
        for (const a of this.alive(this.allies)) {
          if (this.hearts(t.id, a.id) >= 3 && !(a.buffs.atk && a.buffs.atk.stage > 0)) {
            a.buffs.atk = { stage: 1, turns: 4 };
            ev.push({ t: 'msg', text: `${a.name}に きあいが はいった！` });
          }
        }
      }
    }
  }
}

function unitState() { return { buffs: {}, sleep: 0, confused: 0, stun: 0 }; }

// 場所ごとの 強さを 「ものさし」に 合わせて 計算する：node dev/tune.mjs [1|2]
//
// ものさし（決定メモと 同じ）
//  ふつうの妖怪：着いたとき 全滅 5%（3〜8%）、1戦 40〜90秒（まんなか 65秒を めざす）
//                「楽に なったら つぎへ」：いちばん苦しい時の HPの へり が 30% を 切ったら つぎの 場所へ
//  黒い妖怪：着いたとき 全滅 33%（25〜40%）、ボスに 挑めるころ 10%以下
//  ボス：まっすぐ 来ると 0〜20%、黒い妖怪で 20分 鍛えると 60〜70%（65%を めざす）
import { Battle, newMember, growMember } from '../js/battle/core.js';
import { AREAS } from '../js/battle/areas.js';
import { ENEMY_DEFS } from '../js/battle/data.js';
import { rng } from '../js/util.js';

const RUNS = +(process.env.RUNS || 400);
const ids = n => (n === 4 ? ['shimeru', 'elesia', 'meina', 'sakura'] : ['shimeru', 'elesia', 'meina']);
const makeParty = (A, n, R) => ids(n).map(id => growMember(newMember(id), Math.max(0, Math.round(id === 'sakura' ? A + 4 : A)), R));
const msgSec = ev => { const l = ev.filter(e => e.t === 'msg').length; return l ? 0.8 + (l - 1) * 0.28 : 0; };

// その場所で 1戦した ときの 手ごたえ（同じ 乱数の ならびで くらべる）
export function measure(area, A, n, tune, runs = RUNS, groups = AREAS[area]) {
  let lose = 0, dip = 0, sec = 0;
  const perGroup = groups.map(() => ({ n: 0, lose: 0 }));
  for (let r = 0; r < runs; r++) {
    const R = rng(9000 + r * 13);
    const party = makeParty(A, n, R);
    const total = party.reduce((s, m) => s + m.max.hp, 0);
    const gi = r % groups.length;
    const b = new Battle(party, groups[gi], R, { tune });
    let ev, low = 1;
    while ((ev = b.step())) {
      sec += msgSec(ev);
      low = Math.min(low, b.allies.reduce((s, a) => s + Math.max(0, a.hp), 0) / total);
      if (b.round > 200) break;
    }
    perGroup[gi].n++;
    if (b.result !== 'win') { lose++; perGroup[gi].lose++; }
    dip += 1 - low;
  }
  return { lose: lose / runs, dip: dip / runs, sec: sec / runs, perGroup: perGroup.map(g => g.lose / g.n) };
}

// グループ1つの 全滅率が target に なる lv を さがす（hp 倍率は 固定）
function solveGroupLv(area, gi, A, n, hp, target) {
  const g = [AREAS[area][gi]];
  let lo = -80, hi = 80;
  for (let i = 0; i < 8; i++) {
    const mid = (lo + hi) / 2;
    if (measure(area, A, n, { lv: mid, hp }, 240, g).lose < target) lo = mid; else hi = mid;
  }
  return Math.round((lo + hi) / 2);
}

// つまみ { hp, lv:[グループごと] } で 1戦ぶん はかる（グループを 順に まぜる）
export function measureT(area, A, n, t, runs = RUNS) {
  const gs = AREAS[area];
  let lose = 0, dip = 0, sec = 0;
  const perGroup = [];
  for (let i = 0; i < gs.length; i++) {
    const m = measure(area, A, n, { lv: t.lv[i], hp: t.hp }, Math.ceil(runs / gs.length), [gs[i]]);
    lose += m.lose; dip += m.dip; sec += m.sec; perGroup.push(m.lose);
  }
  const k = gs.length;
  return { lose: lose / k, dip: dip / k, sec: sec / k, perGroup };
}

// グループごとに 全滅 target。hp 倍率は、1戦の 長さ（40〜90秒、まんなか secGoal）と
// 「その場所を はなれるころでも 楽勝に ならない（HPの へり 30%以上）」を みて えらぶ
function tuneArea(area, A, n, target, secGoal, band, count) {
  let best = null;
  for (const hp of [0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.15, 1.3]) {
    const t = { hp, lv: AREAS[area].map((_, gi) => solveGroupLv(area, gi, A, n, hp, target)) };
    const m = measureT(area, A, n, t);
    let leave = null, leaveM = null, score = Math.abs(m.sec - secGoal);
    if (m.lose < band[0] || m.lose > band[1]) score += 100;
    if (m.sec < 40 || m.sec > 90) score += 50;
    if (count) {
      leave = fightN(area, A, n, t, count).aw;
      leaveM = measureT(area, leave, n, t, 240);
      if (leaveM.dip < 0.3) score += 200 * (0.3 - leaveM.dip) + 20;
    }
    if (!best || score < best.score) best = { ...t, m, leave, leaveM, score };
  }
  return best;
}
export const tuneNormal = (area, A, n, count) => tuneArea(area, A, n, 0.05, 65, [0.03, 0.08], count);
export const tuneBlack = (area, A, n) => tuneArea(area, A, n, 0.33, 70, [0.25, 0.40]);

// count 戦 したあとの 平均覚醒と 時間
export function fightN(area, A, n, tune, count, runs = 80) {
  let aw = 0, sec = 0;
  for (let r = 0; r < runs; r++) {
    const R = rng(600 + r);
    const party = makeParty(A, n, R);
    for (let k = 0; k < count; k++) {
      for (const m of party) { m.hp = m.max.hp; m.mp = m.max.mp; }
      const gi = Math.floor(R() * AREAS[area].length);
      const b = new Battle(party, AREAS[area][gi], R, { tune: { lv: tune.lv[gi], hp: tune.hp } });
      let ev; while ((ev = b.step())) { sec += msgSec(ev); if (b.round > 200) break; }
    }
    aw += party.reduce((s, m) => s + m.awaken, 0) / n;
  }
  return { aw: aw / runs, min: sec / runs / 60 };
}

// 楽に なる（HPの へりが 30%を 切る）覚醒回数
export function easyAt(area, A, n, t) {
  let lo = A, hi = A + 150;
  if (measureT(area, hi, n, t, 240).dip > 0.3) return hi;
  for (let i = 0; i < 9; i++) {
    const mid = (lo + hi) / 2;
    if (measureT(area, mid, n, t, 240).dip > 0.3) lo = mid; else hi = mid;
  }
  return Math.round((lo + hi) / 2);
}

// じっさいに 戦いつづけて、A から B まで 何戦・何分 かかるか
export function grind(area, A, B, n, tune, runs = 60) {
  let battles = 0, sec = 0;
  for (let r = 0; r < runs; r++) {
    const R = rng(500 + r);
    const party = makeParty(A, n, R);
    let k = 0;
    while (party.reduce((s, m) => s + m.awaken, 0) / n < B && k < 400) {
      for (const m of party) { m.hp = m.max.hp; m.mp = m.max.mp; }
      const gi = Math.floor(R() * AREAS[area].length);
      const b = new Battle(party, AREAS[area][gi], R, { tune: { lv: tune.lv[gi], hp: tune.hp } });
      let ev; while ((ev = b.step())) { sec += msgSec(ev); if (b.round > 200) break; }
      k++;
    }
    battles += k;
  }
  return { battles: battles / runs, min: sec / runs / 60 };
}

// 黒い妖怪で minutes 分 鍛えたあとの 平均覚醒
export function grindFor(area, A, n, tune, minutes, runs = 60) {
  let aw = 0;
  for (let r = 0; r < runs; r++) {
    const R = rng(700 + r);
    const party = makeParty(A, n, R);
    let sec = 0;
    while (sec < minutes * 60) {
      for (const m of party) { m.hp = m.max.hp; m.mp = m.max.mp; }
      const gi = Math.floor(R() * AREAS[area].length);
      const b = new Battle(party, AREAS[area][gi], R, { tune: { lv: tune.lv[gi], hp: tune.hp } });
      let ev; while ((ev = b.step())) { sec += msgSec(ev); if (b.round > 200) break; }
    }
    aw += party.reduce((s, m) => s + m.awaken, 0) / n;
  }
  return aw / runs;
}

// ボスの 勝率（おうえん 3回つき）
export function bossWin(boss, A, n, lvAdd = 0, runs = 300) {
  let wins = 0;
  for (let r = 0; r < runs; r++) {
    const R = rng(3000 + r);
    const party = makeParty(A, n, R);
    const b = new Battle(party, [boss], R, { tune: { lv: lvAdd } });
    let cheers = 3, ev;
    while ((ev = b.step())) {
      if (cheers > 0 && !b.result && b.allies.filter(a => a.hp < a.max.hp * 0.3).length >= 2) { cheers--; b.cheer(); }
      if (b.round > 300) break;
    }
    if (b.result === 'win') wins++;
  }
  return wins / runs;
}

// ボスの lv：鍛えたあと 65%
function solveBoss(boss, A, n) {
  let lo = -60, hi = 120;
  for (let i = 0; i < 8; i++) {
    const mid = (lo + hi) / 2;
    if (bossWin(boss, A, n, mid, 200) > 0.65) lo = mid; else hi = mid;
  }
  return Math.round((lo + hi) / 2);
}

const pct = x => (x * 100).toFixed(0) + '%';
const show = m => !m ? '' : `全滅${pct(m.lose)} HPのへり${pct(m.dip)} 1戦${m.sec.toFixed(0)}秒 グループ別全滅[${m.perGroup.map(pct).join(' ')}]`;

// 章の 道すじ（まっすぐ 進む人が、道の とちゅうで 出会う 妖怪と 戦う 回数）
// black：[場所, 人数, いつ 着くか（'end'＝ボスの 手前）]
const ROUTES = {
  1: { start: 0, normal: [['beach', 3, 5], ['cape', 3, 6], ['tower1', 3, 6], ['tower2', 3, 5]], black: [['black', 3, 'end']], boss: ['usokuidori', 3], grindIn: 'black' },
  2: { start: 74, normal: [['farm', 3, 4], ['maze', 3, 4], ['factory1', 4, 4], ['factory2', 4, 3]], black: [['maze_black', 3, 'maze'], ['factory_black', 4, 'end']], boss: ['botankakushi', 4], grindIn: 'factory_black' },
};

export function runChapter(ch, start) {
  const R = ROUTES[ch];
  const out = { tune: {}, arrive: {}, log: [] };
  let A = start ?? R.start, total = 0;
  for (const [area, n, count] of R.normal) {
    const t = tuneNormal(area, A, n, count);
    const f = fightN(area, A, n, t, count);
    out.tune[area] = { hp: t.hp, lv: t.lv };
    out.arrive[area] = A;
    total += f.min;
    out.log.push(`${area.padEnd(13)} 着く${A.toFixed(0).padStart(4)} → はなれる${f.aw.toFixed(0).padStart(4)}（${count}戦 ${f.min.toFixed(0)}分）  つまみ hp×${t.hp} lv[${t.lv.join(',')}]\n    着いたとき ${show(t.m)}\n    はなれるとき ${show(t.leaveM)}`);
    A = f.aw;
  }
  const straight = A;
  out.arrive.end = A;
  for (const [area, n, at] of R.black) {
    const a0 = out.arrive[at];
    const t = tuneBlack(area, a0, n);
    out.tune[area] = { hp: t.hp, lv: t.lv };
    out.log.push(`${area.padEnd(13)} 着く${a0.toFixed(0).padStart(4)}  つまみ hp×${t.hp} lv[${t.lv.join(',')}]\n    着いたとき ${show(t.m)}`);
  }
  const [boss, bn] = R.boss;
  const gt = out.tune[R.grindIn];
  const after = grindFor(R.grindIn, straight, bn, gt, 20);
  const bl = solveBoss(boss, after, bn);
  const ready = measureT(R.grindIn, after, bn, gt);
  out.bossLv = ENEMY_DEFS[boss].lv + bl;
  out.end = after;
  out.log.push(`ボス ${boss}: lv${ENEMY_DEFS[boss].lv}→${out.bossLv}  まっすぐ(覚醒${straight.toFixed(0)}) 勝率${pct(bossWin(boss, straight, bn, bl))}  黒で20分(覚醒${after.toFixed(0)}) 勝率${pct(bossWin(boss, after, bn, bl))}`);
  out.log.push(`ボスに 挑めるころの ${R.grindIn}: ${show(ready)}`);
  out.log.push(`まっすぐ 進む 戦いの 時間 ${total.toFixed(0)}分 ＋ 黒で 20分`);
  return out;
}

if ((process.argv[1] || '').endsWith('tune.mjs')) {
  const ch = +(process.argv[2] || 1);
  const start = process.argv[3] != null ? +process.argv[3] : undefined;
  const r = runChapter(ch, start);
  console.log(r.log.join('\n'));
  console.log('AREA_TUNE', JSON.stringify(r.tune), 'BOSS', r.bossLv, 'END', r.end.toFixed(1));
}

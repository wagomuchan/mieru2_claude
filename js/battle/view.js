// 戦闘画面（MOTHER風）
// 上：ぐにゃぐにゃ動く背景と 敵　下：顔つきHP欄・メッセージ・ボタン
import { Battle } from './core.js';
import { SKILLS } from './data.js';
import { enemyImage } from './enemygfx.js';
import { game } from '../game.js';
import { getFaces } from '../ui.js';
import { paintPortrait } from '../portraits.js';
import { PARTY_DEFS } from './data.js';

const $ = id => document.getElementById(id);

// 背景の 色の組み合わせ
const BG = {
  beach: ['#2a1a5a', '#4a2a8a', '#e86aa0', '#ffd27a'],
  cape: ['#0a2a4a', '#1a5a7a', '#5ad0c0', '#f0f8a0'],
  rocks: ['#3a1a1a', '#7a2a3a', '#e88a4a', '#ffe0a0'],
  black: ['#000000', '#1a0a2a', '#5a1a4a', '#c83a5a'],
};

function makePattern(cols, seed) {
  const S = 32, cv = document.createElement('canvas');
  cv.width = S * 12; cv.height = S;
  const ctx = cv.getContext('2d');
  for (let x = 0; x < cv.width; x++) for (let y = 0; y < S; y++) {
    const u = (x % S) - 16, v = y - 16;
    const d = Math.abs(u) + Math.abs(v);               // ひし形の わっか
    ctx.fillStyle = cols[Math.floor((d + seed) / 5) % cols.length];
    ctx.fillRect(x, y, 1, 1);
  }
  return cv;
}

export class BattleView {
  constructor() {
    this.active = false;
    this.t = 0;
    this.waitLeft = 0;
    this.waitDone = null;
    $('bcheer').addEventListener('click', () => { if (this.active && game.cheers > 0 && !this.cheerPending) { this.cheerPending = true; this.refreshButtons(); } });
    $('bfast').addEventListener('click', () => {
      game.speed = game.speed === 1 ? 2 : game.speed === 2 ? 4 : 1;
      this.refreshButtons();
    });
  }

  // 戦いを はじめて、終わるまで待つ。'win' か 'lose' を返す
  async run(enemyIds, area) {
    this.active = true;
    this.area = area;
    const cols = BG[area] || BG.beach;
    this.pat1 = makePattern(cols, 0);
    this.pat2 = makePattern([...cols].reverse(), 2);
    this.battle = new Battle(game.party, enemyIds);
    this.cheerPending = false;
    this.intro = 0.6;
    this.sprites = this.battle.enemies.map(u => ({ u, img: enemyImage(u.def.look, u.def.dark), flash: 0, alpha: 1, dying: false, shake: 0 }));
    this.buildBoxes();
    this.refreshButtons();
    $('battleui').classList.remove('hidden');
    this.setText('');
    const names = [...new Set(this.battle.enemies.map(e => e.def.name))].join('と ');
    this.setText(`${names}が あらわれた！`);
    await this.wait(1.0);

    while (true) {
      if (this.cheerPending && !this.battle.result) {
        this.cheerPending = false;
        game.cheers--;
        this.refreshButtons();
        this.setText('');
        for (const e of this.battle.cheer()) await this.handle(e, true);
        await this.wait(0.5);
      }
      const ev = this.battle.step();
      if (!ev) break;
      if (!ev.length) continue;
      this.setText('');
      let first = true;
      for (const e of ev) {
        await this.handle(e, first);
        if (e.t === 'msg') first = false;
      }
      await this.wait(0.25);
    }
    await this.wait(0.8);
    this.active = false;
    $('battleui').classList.add('hidden');
    return this.battle.result;
  }

  setText(s) { this.lines = s ? [s] : []; $('bmsgtext').textContent = s; }
  addLine(s) {
    this.lines.push(s);
    if (this.lines.length > 3) this.lines.shift();
    $('bmsgtext').textContent = this.lines.join('\n');
  }

  async handle(e, first) {
    const box = e.unit && e.unit.side === 'ally' ? this.boxes[e.unit.idx] : null;
    const spr = e.unit && e.unit.side === 'enemy' ? this.sprites[e.unit.idx] : null;
    switch (e.t) {
      case 'msg':
        this.addLine(e.text);
        await this.wait(first ? 0.55 : 0.3);
        break;
      case 'hp': if (box) box.hpTo = e.to; break;
      case 'mp': if (box) box.mpTo = e.unit.mp; break;
      case 'hit':
        if (spr) { spr.flash = 0.3; spr.shake = 0.3; }
        if (box) { box.el.classList.remove('shake'); void box.el.offsetWidth; box.el.classList.add('shake'); this.setFace(box, 'hurt', 0.6); }
        break;
      case 'faint':
        if (spr) spr.dying = true;
        if (box) { box.el.classList.add('fainted'); this.setFace(box, 'hurt', 999); }
        break;
      case 'revive':
        if (box) { box.el.classList.remove('fainted'); this.setFace(box, 'normal', 0); }
        break;
      case 'awaken':
        if (box) {
          this.card(box, `✦覚醒！ ${e.label}+${e.amount}`);
          this.setFace(box, 'smile', 1.2);
          box.mpTo = e.unit.mp; box.hpTo = e.unit.hp;
        }
        await this.wait(0.2);
        break;
      case 'learn':
        if (box) this.card(box, `✦「${SKILLS[e.skill].name}」`, true);
        break;
    }
  }

  // 戦闘中の 待ち時間（はやおくりで 短くなる）
  wait(sec) {
    return new Promise(r => { this.waitLeft = sec; this.waitDone = r; });
  }

  update(dt) {
    if (!this.active) return;
    this.t += dt;
    const sp = game.speed;
    if (this.intro > 0) this.intro -= dt;
    if (this.waitDone) {
      this.waitLeft -= dt * sp;
      if (this.waitLeft <= 0) { const r = this.waitDone; this.waitDone = null; r(); }
    }
    for (const s of this.sprites) {
      if (s.flash > 0) s.flash -= dt * sp;
      if (s.shake > 0) s.shake -= dt * sp;
      if (s.dying) s.alpha = Math.max(0, s.alpha - dt * sp * 2.2);
    }
    // HPと MPの ドラムロール
    for (const b of this.boxes) {
      const m = b.member;
      const rate = Math.max(24, m.max.hp * 0.5) * sp;
      if (b.hp !== b.hpTo) b.hp += Math.sign(b.hpTo - b.hp) * Math.min(Math.abs(b.hpTo - b.hp), rate * dt);
      if (b.mp !== b.mpTo) b.mp += Math.sign(b.mpTo - b.mp) * Math.min(Math.abs(b.mpTo - b.mp), 20 * sp * dt);
      const hpS = String(Math.round(b.hp)), mpS = String(Math.round(b.mp));
      if (b.hpEl.textContent !== hpS) b.hpEl.textContent = hpS;
      if (b.mpEl.textContent !== mpS) b.mpEl.textContent = mpS;
      b.hpRow.classList.toggle('low', b.hpTo > 0 && b.hpTo < m.max.hp * 0.3);
      if (b.faceT > 0 && (b.faceT -= dt) <= 0) this.setFace(b, this.restFace(b), 0);
    }
  }

  restFace(b) {
    const m = b.member;
    if (m.hp <= 0) return 'hurt';
    return m.hp < m.max.hp * 0.3 ? 'sad' : 'normal';
  }

  setFace(b, ex, sec) {
    if (b.face !== ex) { paintPortrait(b.canvas, getFaces(PARTY_DEFS[b.member.id].face)[ex], 48); b.face = ex; }
    b.faceT = sec;
  }

  card(box, text, learn) {
    const c = document.createElement('div');
    c.className = 'pcard' + (learn ? ' learn' : '') + ' at' + this.boxes.indexOf(box);
    c.textContent = text;
    box.el.appendChild(c);
    setTimeout(() => c.remove(), 1700);
  }

  buildBoxes() {
    const wrap = $('pboxes');
    wrap.innerHTML = '';
    this.boxes = game.party.map(m => {
      const el = document.createElement('div');
      el.className = 'pbox' + (m.hp <= 0 ? ' fainted' : '');
      el.innerHTML = `<div class="pname">${m.name}</div><canvas></canvas>
        <div class="prow hp"><b>HP</b><span class="roll"></span></div>
        <div class="prow"><b>MP</b><span class="roll"></span></div>`;
      wrap.appendChild(el);
      const rolls = el.querySelectorAll('.roll');
      const b = { el, member: m, canvas: el.querySelector('canvas'), hpEl: rolls[0], mpEl: rolls[1], hpRow: el.querySelector('.prow.hp'),
        hp: m.hp, hpTo: m.hp, mp: m.mp, mpTo: m.mp, face: null, faceT: 0 };
      this.setFace(b, this.restFace(b), 0);
      return b;
    });
  }

  refreshButtons() {
    $('bcheerleft').textContent = this.cheerPending ? '…' : `のこり${game.cheers}`;
    $('bcheer').disabled = game.cheers <= 0 || this.cheerPending;
    $('bfastx').textContent = `×${game.speed}`;
  }

  // ───────── 描く ─────────
  draw(ctx, W, H) {
    const t = this.t;
    // ぐにゃぐにゃ背景
    for (let y = 0; y < H; y++) {
      const off = Math.sin(y * 0.07 + t * 1.8) * 10 + Math.sin(y * 0.023 - t * 0.9) * 14;
      const sy = Math.floor(y + t * 12) & 31;
      const sx = ((Math.floor(off + t * 8) % 32) + 64) % 32;
      ctx.drawImage(this.pat1, sx, sy, W, 1, 0, y, W, 1);
    }
    ctx.globalAlpha = 0.18;
    for (let y = 0; y < H; y += 1) {
      const off = Math.sin(y * 0.05 - t * 1.3) * 16;
      const sy = Math.floor(y - t * 7) & 31;
      const sx = ((Math.floor(off - t * 5) % 32) + 64) % 32;
      ctx.drawImage(this.pat2, sx, sy, W, 1, 0, y, W, 1);
    }
    ctx.globalAlpha = 1;

    // 敵が 見やすいように、うしろを すこし暗く
    const g = ctx.createLinearGradient(0, H * 0.3, 0, H * 0.75);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.5, 'rgba(0,0,0,.28)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(0, H * 0.3, W, H * 0.45);

    // 敵
    const list = this.sprites;
    const scale = list.reduce((s, x) => s + x.img.width, 0) * 2 + (list.length - 1) * 8 <= W - 8 ? 2 : 1;
    const total = list.reduce((s, x) => s + x.img.width * scale, 0) + (list.length - 1) * 8;
    let x = Math.round((W - total) / 2);
    const base = Math.round(H * 0.62);
    for (const s of list) {
      const w = s.img.width * scale, h = s.img.height * scale;
      if (s.alpha > 0 && !(s.dying && Math.floor(t * 20) % 2)) {
        const bob = Math.round(Math.sin(t * 2.4 + x) * 2);
        const sh = s.shake > 0 ? Math.round(Math.sin(t * 80) * 3) : 0;
        ctx.globalAlpha = s.alpha;
        ctx.fillStyle = 'rgba(0,0,0,.35)';
        ctx.fillRect(x + 4, base + 2, w - 8, 4);
        ctx.drawImage(s.img, x + sh, base - h + bob, w, h);
        if (s.flash > 0 && Math.floor(t * 30) % 2) {
          ctx.globalCompositeOperation = 'lighter';
          ctx.drawImage(s.img, x + sh, base - h + bob, w, h);
          ctx.globalCompositeOperation = 'source-over';
        }
        ctx.globalAlpha = 1;
      }
      x += w + 8;
    }

    // はじまりの 演出（白く光って ひらく）
    if (this.intro > 0) {
      const k = this.intro / 0.6;
      ctx.fillStyle = `rgba(255,255,255,${k})`;
      ctx.fillRect(0, 0, W, H);
    }
  }
}

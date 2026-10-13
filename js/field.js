// マップを歩く部分
import { T, tileImage, drawSea, drawLandEdge, SOLID_TILES } from './tiles.js';
import { drawProp, PASSABLE_PROPS } from './props.js';
import { buildCharacter, buildYokai, SW, SH } from './sprites.js';
import { CHARS } from './chars.js';
import { clamp, rng } from './util.js';
import { enemyImage } from './battle/enemygfx.js';
import { AREA_LOOK } from './battle/areas.js';

// ガタつかないよう、1/60秒ごとに「きっちり整数ドット」ずつ動かす
const TICK = 1 / 60;
const WALK_STEP = 1;      // 1コマで進むドット
const NPC_STEP = 0.5;     // 町の人（2コマに1ドット）
const REACH = 16;         // しらべられる距離

const DIRS = { down: [0, 1], up: [0, -1], left: [-1, 0], right: [1, 0] };

export class Field {
  constructor(data) {
    this.data = data;
    this.w = data.w; this.h = data.h;
    this.rows = data.tiles;
    this.objects = data.objects.map(o => ({ ...o, talkCount: 0 }));
    this.rand = rng(4242);
    this.t = 0;

    const look = id => buildCharacter(CHARS[id]);
    this.player = this.makeActor({ x: data.start.x, y: data.start.y, dir: data.start.dir }, look('shimeru'));
    this.player.isPlayer = true;
    const cache = {};
    this.npcs = data.npcs.map(n => this.makeActor(n, cache[n.look] ||= look(n.look)));
    const yk = buildYokai();
    this.yokai = data.yokai.map(y => Object.assign(this.makeActor(y, null), { yokai: true, frames2: yk }));
    this.actors = [this.player, ...this.npcs, ...this.yokai];
    // うしろを ついてくる 仲間
    this.trail = [];
    this.followers = (data.followers || []).map((id, i) => ({ id, frames: look(id), gap: 14 * (i + 1), x: this.player.x, y: this.player.y, dir: 'down', walkDist: 0, moving: false }));
    // マップ上の 妖怪シンボル（ぶつかると 戦闘）
    this.symbols = (data.symbols || []).map(d => {
      const a = this.makeActor(d, null);
      return Object.assign(a, { sym: true, img: enemyImage(AREA_LOOK[d.area], d.area === 'black'), sub: 0 });
    });
    this.safe = 0;
    this.encounter = null;
    this.cam = { x: 0, y: 0 };
    this.target = null;
  }

  // ワープ（休んだあと・全滅したあと）
  teleport(x, y, dir) {
    Object.assign(this.player, { x, y, dir });
    this.trail = [];
    for (const f of this.followers) Object.assign(f, { x, y, dir });
  }

  resetSymbols() {
    for (const s of this.symbols) Object.assign(s, { x: s.homeX, y: s.homeY, gone: false, goal: null });
  }

  // 戦いに勝ったら シンボルは しばらく いなくなる
  defeat(sym) { sym.gone = true; sym.respawnAt = this.t + 40; this.safe = 2; }
  escape() { this.safe = 2.5; }

  makeActor(def, frames) {
    const x = def.x * T + 8, y = def.y * T + 12;
    return {
      ...def, frames, x, y, homeX: x, homeY: y,
      dir: def.dir || 'down', walkDist: 0, moving: false,
      wait: 1 + Math.random() * 3, goal: null, talkCount: 0,
    };
  }

  tile(x, y) {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return null;
    return this.rows[y][x];
  }

  // そのドットに 立てるか
  blocked(px, py, self) {
    const tx = Math.floor(px / T), ty = Math.floor(py / T);
    const c = this.tile(tx, ty);
    if (c === null || SOLID_TILES.has(c)) return true;
    for (const o of this.objects) {
      if (PASSABLE_PROPS.has(o.type)) continue;
      if (px >= o.x * T && px < (o.x + o.w) * T && py >= o.y * T && py < (o.y + o.h) * T) return true;
    }
    for (const a of this.actors) {
      if (a === self) continue;
      if (Math.abs(a.x - px) < 6 && Math.abs(a.y - py) < 4) return true;
    }
    return false;
  }

  // 足もとの 四角（横10×縦5）が 空いているか
  free(a, x, y) {
    for (const [ox, oy] of [[-5, -4], [5, -4], [-5, 1], [5, 1], [0, -4], [0, 1]]) {
      if (this.blocked(x + ox, y + oy, a)) return false;
    }
    return true;
  }

  // 壁ぞいに すべるように動く
  move(a, dx, dy) {
    let moved = false;
    if (dx) {
      if (this.free(a, a.x + dx, a.y)) { a.x += dx; moved = true; }
      else if (Math.abs(dx) > Math.abs(dy) * 1.5) {
        for (const n of [1, -1, 2, -2, 3, -3, 4, -4, 5, -5, 6, -6]) {
          if (this.free(a, a.x + dx, a.y + n) && this.free(a, a.x, a.y + Math.sign(n))) { a.y += Math.sign(n); moved = true; break; }
        }
      }
    }
    if (dy) {
      if (this.free(a, a.x, a.y + dy)) { a.y += dy; moved = true; }
      else if (Math.abs(dy) > Math.abs(dx) * 1.5) {
        for (const n of [1, -1, 2, -2, 3, -3, 4, -4, 5, -5, 6, -6]) {
          if (this.free(a, a.x + n, a.y + dy) && this.free(a, a.x + Math.sign(n), a.y)) { a.x += Math.sign(n); moved = true; break; }
        }
      }
    }
    return moved;
  }

  faceFrom(dx, dy) {
    if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? 'right' : 'left';
    return dy > 0 ? 'down' : 'up';
  }

  update(dt, stick, frozen) {
    this.t += dt;
    this.acc = Math.min((this.acc || 0) + dt, TICK * 4);
    while (this.acc >= TICK) {
      this.acc -= TICK;
      this.tick(stick, frozen);
    }
    this.target = frozen ? null : this.findTarget();
  }

  tick(stick, frozen) {
    const p = this.player;
    p.moving = false;
    if (!frozen && stick) {
      // 8方向に そろえる
      const [sx, sy] = stick;
      const oct = Math.round(Math.atan2(sy, sx) / (Math.PI / 4));
      const dx = Math.round(Math.cos(oct * Math.PI / 4)), dy = Math.round(Math.sin(oct * Math.PI / 4));
      // ななめのときは、いま向いている向きを なるべく保つ
      if (!(dx && dy && (DIRS[p.dir][0] === dx || DIRS[p.dir][1] === dy))) p.dir = this.faceFrom(dx, dy);
      const bx = p.x, by = p.y;
      for (let i = 0; i < WALK_STEP; i++) this.move(p, dx, dy);
      p.walkDist += WALK_STEP;
      p.moving = true;
      if (p.x !== bx || p.y !== by) { this.trail.push({ x: p.x, y: p.y, dir: p.dir }); if (this.trail.length > 80) this.trail.shift(); }
    }
    for (const a of this.actors) if (!a.isPlayer) this.updateNpc(a, frozen);
    this.updateFollowers(p.moving);
    if (!frozen) this.updateSymbols();
  }

  updateFollowers(moving) {
    for (const f of this.followers) {
      const at = this.trail[this.trail.length - 1 - f.gap];
      const before = f.x + ',' + f.y;
      if (at) { f.x = at.x; f.y = at.y; f.dir = at.dir; }
      f.moving = moving && before !== f.x + ',' + f.y;
      if (f.moving) f.walkDist++;
    }
  }

  updateSymbols() {
    if (this.safe > 0) this.safe -= TICK;
    const p = this.player;
    for (const s of this.symbols) {
      if (s.gone) {
        if (this.t > s.respawnAt && Math.hypot(s.homeX - p.x, s.homeY - p.y) > 140) Object.assign(s, { gone: false, x: s.homeX, y: s.homeY, goal: null });
        continue;
      }
      const d = Math.hypot(p.x - s.x, p.y - s.y);
      if (this.safe <= 0 && d < 15) { this.encounter = s; return; }
      const chase = this.safe <= 0 && d < 64;
      s.sub += chase ? (s.area === 'black' ? 0.75 : 0.6) : 0.35;
      if (chase) s.goal = [p.x, p.y];
      else if (!s.goal && (s.wait -= TICK) <= 0) {
        s.goal = [Math.round(s.homeX + (this.rand() * 2 - 1) * 28), Math.round(s.homeY + (this.rand() * 2 - 1) * 20)];
      }
      if (!s.goal) continue;
      const vx = s.goal[0] - s.x, vy = s.goal[1] - s.y;
      if (Math.abs(vx) < 1 && Math.abs(vy) < 1) { s.goal = null; s.wait = 1 + this.rand() * 2; continue; }
      while (s.sub >= 1) {
        s.sub -= 1;
        const dx = Math.abs(vx) >= 1 ? Math.sign(vx) : 0, dy = Math.abs(vy) >= 1 ? Math.sign(vy) : 0;
        if (!this.move(s, dx, dy)) { s.goal = null; s.wait = 0.5; }
        s.dir = dx < 0 ? 'left' : dx > 0 ? 'right' : s.dir;
      }
    }
  }

  updateNpc(a, frozen) {
    a.moving = false;
    if (!a.wander || frozen) return;
    if (a.goal) {
      const vx = a.goal[0] - a.x, vy = a.goal[1] - a.y;
      if ((Math.abs(vx) < 1 && Math.abs(vy) < 1) || a.stuck > 36) { a.goal = null; a.wait = 1.5 + this.rand() * 3; return; }
      // 町の人は 4方向に、ゆっくり歩く
      const horiz = Math.abs(vx) >= 1 && (Math.abs(vx) > Math.abs(vy) || Math.abs(vy) < 1);
      const dx = horiz ? Math.sign(vx) : 0, dy = horiz ? 0 : Math.sign(vy);
      a.dir = this.faceFrom(dx, dy);
      a.moving = true;
      a.sub = (a.sub || 0) + NPC_STEP;
      if (a.sub >= 1) {
        a.sub -= 1;
        const ok = this.move(a, dx, dy);
        a.stuck = ok ? 0 : (a.stuck || 0) + 1;
        a.walkDist += 1;
      }
    } else if ((a.wait -= TICK) <= 0) {
      const r = a.wander * T;
      a.goal = [Math.round(a.homeX + (this.rand() * 2 - 1) * r), Math.round(a.homeY + (this.rand() * 2 - 1) * r)];
      a.stuck = 0;
    }
  }

  // 目の前の しらべられるもの
  findTarget() {
    const p = this.player;
    const [fx, fy] = DIRS[p.dir];
    const qx = p.x + fx * 12, qy = p.y - 2 + fy * 12;
    let best = null, bestD = REACH;
    // 人には、屋台の カウンターごしにも 話しかけられる
    const qx2 = p.x + fx * 28, qy2 = p.y - 2 + fy * 28;
    for (const a of this.actors) {
      if (a.isPlayer || !a.talk) continue;
      const d = Math.min(Math.hypot(a.x - qx, a.y - 2 - qy), Math.hypot(a.x - qx2, a.y - 2 - qy2) + 2);
      if (d < bestD) { best = a; bestD = d; }
    }
    for (const o of this.objects) {
      if (!o.talk) continue;
      const [ax, ay] = talkPoint(o);
      const d = Math.hypot(ax - qx, ay - qy);
      if (d < bestD) { best = o; bestD = d; }
    }
    return best;
  }

  // しらべたときの せりふ（話した回数で かわる）
  interact() {
    const t = this.target;
    if (!t) return null;
    const lines = t.talk[Math.min(t.talkCount, t.talk.length - 1)];
    t.talkCount++;
    if (t.frames || t.yokai) {
      // 話しかけた人は、こちらを向く
      const p = this.player;
      t.dir = this.faceFrom(p.x - t.x, p.y - t.y);
      t.goal = null; t.wait = 2;
    }
    return { lines, target: t };
  }

  // ───────── 描く ─────────
  draw(ctx, W, H) {
    const p = this.player;
    const mw = this.w * T, mh = this.h * T;
    const cx = mw <= W ? (mw - W) / 2 : clamp(p.x - W / 2, 0, mw - W);
    const cy = mh <= H ? (mh - H) / 2 : clamp(p.y - 8 - H / 2, 0, mh - H);
    this.cam.x = Math.round(cx); this.cam.y = Math.round(cy);
    const ox = -this.cam.x, oy = -this.cam.y;

    ctx.fillStyle = '#3d7bd2'; ctx.fillRect(0, 0, W, H);
    const tx0 = Math.floor(this.cam.x / T), ty0 = Math.floor(this.cam.y / T);
    const tx1 = Math.ceil((this.cam.x + W) / T), ty1 = Math.ceil((this.cam.y + H) / T);
    for (let ty = ty0; ty <= ty1; ty++) for (let tx = tx0; tx <= tx1; tx++) {
      const c = this.tile(tx, ty);
      if (c === null) continue;
      const sx = tx * T + ox, sy = ty * T + oy;
      if (c === '~') drawSea(ctx, sx, sy, tx, ty, this.t, this);
      else {
        ctx.drawImage(tileImage(c, tx, ty), sx, sy);
        drawLandEdge(ctx, sx, sy, tx, ty, this);
      }
    }

    // 奥から順に描く（手前のものが 上にくる）
    const list = [];
    for (const o of this.objects) list.push({ y: (o.y + o.h) * T - 1, o });
    for (const a of this.actors) list.push({ y: a.y, a });
    for (const f of this.followers) list.push({ y: f.y - 0.5, a: f });
    for (const sy of this.symbols) if (!sy.gone) list.push({ y: sy.y, a: sy });
    list.sort((m, n) => m.y - n.y);
    for (const it of list) {
      if (it.o) {
        const sx = it.o.x * T + ox, sy = it.o.y * T + oy;
        if (sx > W + 64 || sx < -96 || sy > H + 48 || sy < -120) continue;
        drawProp(ctx, it.o, sx, sy, this.t);
      } else this.drawActor(ctx, it.a, ox, oy);
    }

    // 建物のうしろに 隠れても、うっすら見える
    ctx.globalAlpha = 0.35;
    this.drawActor(ctx, p, ox, oy, true);
    ctx.globalAlpha = 1;

    // しらべられるものの 上に「！」
    if (this.target) {
      let bx, by;
      if (this.target.frames || this.target.yokai) { bx = this.target.x; by = this.target.y - (this.target.yokai ? 22 : 30); }
      else { const [ax, ay] = talkPoint(this.target); bx = ax; by = ay - 26; }
      drawBang(ctx, Math.round(bx + ox), Math.round(by + oy + Math.sin(this.t * 6) * 1.5));
    }
  }

  drawActor(ctx, a, ox, oy, ghost) {
    const x = Math.round(a.x + ox), y = Math.round(a.y + oy);
    if (a.sym) {
      const bob = Math.round(Math.sin(this.t * 4 + a.homeX) * 1.5);
      const img = a.img;
      ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(x - 6, y, 13, 2);
      // 戦ったあとの 安全な あいだは 点めつ
      if (this.safe > 0 && Math.floor(this.t * 10) % 2) return;
      if (a.dir === 'left') {
        ctx.save(); ctx.translate(x, 0); ctx.scale(-1, 1);
        ctx.drawImage(img, -Math.floor(img.width / 2), y - img.height + 1 + bob); ctx.restore();
      } else ctx.drawImage(img, x - Math.floor(img.width / 2), y - img.height + 1 + bob);
      return;
    }
    if (a.yokai) {
      const bob = Math.round(Math.sin(this.t * 3 + a.homeX) * 2);
      if (!ghost) { ctx.fillStyle = 'rgba(40,10,80,.18)'; ctx.fillRect(x - 4, y, 9, 2); }
      const f = a.frames2[Math.floor(this.t * 3 + a.homeX) % 2];
      if (a.dir === 'left') {
        ctx.save(); ctx.translate(x + 6, 0); ctx.scale(-1, 1);
        ctx.drawImage(f, 0, y - 14 + bob); ctx.restore();
      } else ctx.drawImage(f, x - 6, y - 14 + bob);
      return;
    }
    if (!ghost) {
      ctx.fillStyle = 'rgba(0,0,0,.2)';
      ctx.fillRect(x - 5, y, 11, 2); ctx.fillRect(x - 4, y - 1, 9, 1);
    }
    const step = a.moving ? Math.floor(a.walkDist / 7) % 4 : 0;
    const img = a.frames[a.dir][step];
    ctx.drawImage(img, x - SW / 2, y - SH + 1);
  }
}

export function talkPoint(o) {
  if (o.type === 'house') return [(o.x + o.door) * T + 8, (o.y + o.h) * T];
  return [(o.x + o.w / 2) * T, (o.y + o.h) * T];
}

function drawBang(ctx, x, y) {
  const INK = '#2b1d2e';
  ctx.fillStyle = INK; ctx.fillRect(x - 5, y - 6, 11, 13);
  ctx.fillStyle = '#fff'; ctx.fillRect(x - 4, y - 5, 9, 11);
  ctx.fillStyle = INK; ctx.fillRect(x - 2, y + 7, 3, 2); ctx.fillRect(x - 1, y + 9, 1, 1);
  ctx.fillStyle = '#e8466a'; ctx.fillRect(x - 1, y - 4, 3, 6); ctx.fillRect(x - 1, y + 3, 3, 2);
}

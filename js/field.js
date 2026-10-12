// マップを歩く部分
import { T, tileImage, drawSea, drawLandEdge, SOLID_TILES } from './tiles.js';
import { drawProp, PASSABLE_PROPS } from './props.js';
import { buildCharacter, buildYokai, SW, SH } from './sprites.js';
import { CHARS } from './chars.js';
import { clamp, rng } from './util.js';

// ガタつかないよう、1/60秒ごとに「きっちり整数ドット」ずつ動かす
const TICK = 1 / 60;
const WALK_STEP = 1;      // 1コマで進むドット（ふつう）
const RUN_STEP = 2;       // 指を大きく すべらせたとき
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
    this.cam = { x: 0, y: 0 };
    this.target = null;
  }

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
      const [sx, sy, run] = stick;
      const oct = Math.round(Math.atan2(sy, sx) / (Math.PI / 4));
      const dx = Math.round(Math.cos(oct * Math.PI / 4)), dy = Math.round(Math.sin(oct * Math.PI / 4));
      // ななめのときは、いま向いている向きを なるべく保つ
      if (!(dx && dy && (DIRS[p.dir][0] === dx || DIRS[p.dir][1] === dy))) p.dir = this.faceFrom(dx, dy);
      const steps = run ? RUN_STEP : WALK_STEP;
      for (let i = 0; i < steps; i++) this.move(p, dx, dy);
      p.walkDist += steps;
      p.moving = true;
    }
    for (const a of this.actors) if (!a.isPlayer) this.updateNpc(a, frozen);
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
    return lines;
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

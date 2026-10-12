// 建物や木など、マップの上に立っているもの
// o.x, o.y, o.w, o.h は 足もと（ふみこめない場所）をタイル単位で表す。
// 絵は 足もとより上に はみ出して描く（立体っぽく見せるため）。
import { T } from './tiles.js';
import { hash2 } from './util.js';

const INK = '#2b1d2e';

function rect(ctx, x, y, w, h, c) { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); }
function box(ctx, x, y, w, h, fill) { rect(ctx, x, y, w, h, INK); rect(ctx, x + 1, y + 1, w - 2, h - 2, fill); }

// ───────── 家 ─────────
export const HOUSE_STYLES = {
  plaster: { wall: '#f4ead8', wallShade: '#d8c8ae', beam: '#7a5232' },
  peach: { wall: '#f6d0b0', wallShade: '#dcae8c', beam: '#8a5a3a' },
  blue: { wall: '#d4e2f0', wallShade: '#b0c2d8', beam: '#4a5a7a' },
  wood: { wall: '#b98a56', wallShade: '#94683a', beam: '#6a4426' },
};
export const ROOFS = {
  red: ['#c8503c', '#a23a2c', '#e07a5a'],
  blue: ['#4a72b8', '#34558e', '#6e96d6'],
  green: ['#4f9a6a', '#3a7650', '#72bc8a'],
  brown: ['#8a5a3a', '#6a4228', '#aa7a52'],
  orange: ['#e0883a', '#b86828', '#f4aa62'],
  patch: ['#7a6a52', '#5c4e3a', '#9a8a6e'],
};

function drawHouse(ctx, o, sx, sy, t) {
  const st = HOUSE_STYLES[o.style || 'plaster'];
  const [roof, roofDark, roofLight] = ROOFS[o.roof || 'red'];
  const fw = o.w * T, fh = o.h * T;
  const bottom = sy + fh;
  const wallH = o.wallH || 26;
  const wallTop = bottom - wallH;
  const roofTop = sy - (o.rise ?? 12);

  // 影
  ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.fillRect(sx + 2, bottom - 1, fw, 3);

  // 壁
  box(ctx, sx + 1, wallTop, fw - 2, wallH, st.wall);
  rect(ctx, sx + 2, bottom - 4, fw - 4, 3, st.wallShade);
  if (o.style !== 'wood' && o.style !== 'blue') {
    // 木わく（ハーフティンバー）
    rect(ctx, sx + 2, wallTop + 9, fw - 4, 2, st.beam);
    for (let i = 0; i <= o.w; i++) {
      const bx = sx + 1 + Math.min(i * T, fw - 4);
      rect(ctx, bx, wallTop + 1, 2, wallH - 2, st.beam);
    }
  }
  if (o.style === 'wood') {
    for (let y = wallTop + 5; y < bottom - 2; y += 5) rect(ctx, sx + 2, y, fw - 4, 1, st.beam);
  }

  // 窓と とびら
  for (let i = 0; i < o.w; i++) {
    const cx = sx + i * T;
    if (i === o.door) {
      const dx = cx + 3, dy = bottom - 17;
      rect(ctx, dx - 1, dy - 1, 12, 18, INK);
      rect(ctx, dx, dy, 10, 17, '#7a4a2a');
      rect(ctx, dx + 1, dy + 1, 8, 1, '#a06838');
      rect(ctx, dx + 4, dy + 1, 1, 15, '#5e3820');
      rect(ctx, dx + 7, dy + 9, 1, 2, '#ffd060');
      rect(ctx, dx - 1, bottom - 1, 12, 1, '#8a8070');
    } else if (!o.noWindows) {
      const wx = cx + 4, wy = wallTop + 12;
      rect(ctx, wx - 1, wy - 1, 10, 9, INK);
      rect(ctx, wx, wy, 8, 7, '#9fd0f0');
      rect(ctx, wx, wy, 8, 2, '#d8f0ff');
      rect(ctx, wx + 3, wy, 2, 7, INK);
      rect(ctx, wx, wy + 3, 8, 1, INK);
      // 窓辺の花
      if ((hash2(o.x + i, o.y) & 3) !== 0) {
        rect(ctx, wx - 1, wy + 8, 10, 2, '#8a5a3a');
        const fc = ['#ff6a8a', '#ffd040', '#ffffff', '#c890ff'][hash2(i, o.x) & 3];
        rect(ctx, wx, wy + 7, 2, 1, fc); rect(ctx, wx + 3, wy + 7, 2, 1, '#5aa04a'); rect(ctx, wx + 6, wy + 7, 2, 1, fc);
      }
    }
  }

  // 屋根
  const rh = wallTop + 3 - roofTop;
  rect(ctx, sx - 2, roofTop, fw + 4, rh, INK);
  rect(ctx, sx - 1, roofTop + 1, fw + 2, rh - 2, roof);
  for (let y = roofTop + 4, k = 0; y < wallTop; y += 4, k++) {
    rect(ctx, sx - 1, y, fw + 2, 1, roofDark);
    for (let x = sx + (k % 2 ? 2 : 6); x < sx + fw; x += 8) rect(ctx, x, y - 3, 1, 3, roofDark);
  }
  rect(ctx, sx - 1, roofTop + 1, fw + 2, 2, roofLight);
  rect(ctx, sx - 1, wallTop, fw + 2, 2, roofDark);

  // えんとつ
  if (o.chimney != null) {
    const cx = sx + o.chimney * T + 4;
    box(ctx, cx, roofTop - 9, 8, 12, '#a86a50');
    rect(ctx, cx + 1, roofTop - 8, 6, 2, '#c88a6a');
    const ph = (t * 0.8 + o.x) % 3;
    ctx.fillStyle = 'rgba(255,255,255,.55)';
    ctx.fillRect(cx + 2 + (ph | 0), roofTop - 14 - ph * 3, 3, 3);
    ctx.fillStyle = 'rgba(255,255,255,.35)';
    ctx.fillRect(cx + 4 - (ph | 0), roofTop - 21 - ph * 3, 4, 3);
  }

  // かんばん
  if (o.sign) drawSignIcon(ctx, sx + (o.door + 1) * T + 2, wallTop + 2, o.sign);
}

function drawSignIcon(ctx, x, y, kind) {
  rect(ctx, x + 5, y, 1, 3, INK);
  box(ctx, x, y + 3, 12, 9, '#f0dca8');
  if (kind === 'bread') {
    rect(ctx, x + 3, y + 6, 6, 3, '#c8803a'); rect(ctx, x + 4, y + 6, 4, 1, '#e8a860');
  } else if (kind === 'inn') {
    rect(ctx, x + 3, y + 6, 6, 3, '#4a72b8'); rect(ctx, x + 3, y + 5, 2, 1, '#4a72b8');
  } else if (kind === 'fish') {
    rect(ctx, x + 3, y + 7, 5, 2, '#5a8ac8'); rect(ctx, x + 8, y + 6, 1, 4, '#5a8ac8');
  }
}

// ───────── 木 ─────────
function drawTree(ctx, o, sx, sy) {
  const cx = sx + 8, base = sy + 14;
  ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.fillRect(cx - 7, base - 1, 14, 3);
  rect(ctx, cx - 3, base - 9, 6, 10, INK);
  rect(ctx, cx - 2, base - 8, 4, 9, '#8a5a32');
  rect(ctx, cx - 2, base - 8, 1, 9, '#a87040');
  const blob = (x, y, r, c) => {
    ctx.fillStyle = c;
    for (let dy = -r; dy <= r; dy++) {
      const w = Math.round(Math.sqrt(r * r - dy * dy));
      ctx.fillRect(x - w, y + dy, w * 2, 1);
    }
  };
  const top = base - 20;
  blob(cx, top, 12, INK);
  blob(cx, top, 11, '#3e7a34');
  blob(cx - 1, top - 1, 9, '#4f9a3e');
  blob(cx - 3, top - 4, 5, '#6cb84e');
  rect(ctx, cx - 5, top - 6, 2, 1, '#9ad870');
  if (o.fruit) {
    for (const [fx, fy] of [[-5, 2], [4, -3], [2, 5], [-1, -7]]) rect(ctx, cx + fx, top + fy, 2, 2, '#ff9a30');
  }
}

// ───────── ふんすい ─────────
function drawFountain(ctx, o, sx, sy, t) {
  const fw = o.w * T, fh = o.h * T;
  ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.fillRect(sx + 1, sy + fh - 2, fw, 3);
  box(ctx, sx, sy + 4, fw, fh - 4, '#c8bcaa');
  rect(ctx, sx + 1, sy + 5, fw - 2, 2, '#e4dac8');
  rect(ctx, sx + 1, sy + fh - 7, fw - 2, 6, '#a89a86');
  rect(ctx, sx + 3, sy + 8, fw - 6, fh - 17, '#4a8ad8');
  const ph = t * 3;
  ctx.fillStyle = '#a8d4ff';
  ctx.fillRect(sx + 5 + (ph % 4 | 0), sy + 10, 3, 1);
  ctx.fillRect(sx + fw - 10 - (ph % 3 | 0), sy + 13, 3, 1);
  // まんなかの柱と しぶき
  const cx = sx + fw / 2;
  box(ctx, cx - 3, sy - 6, 6, 18, '#d8ccb8');
  box(ctx, cx - 6, sy - 9, 12, 4, '#d8ccb8');
  ctx.fillStyle = '#cfe8ff';
  for (let i = 0; i < 4; i++) {
    const k = (t * 1.5 + i / 4) % 1;
    const dx = (i % 2 ? 1 : -1) * (3 + k * 6);
    ctx.fillRect(cx + dx, sy - 12 + k * k * 20, 1, 2);
  }
  rect(ctx, cx - 1, sy - 14, 2, 4, '#e8f4ff');
}

// ───────── 屋台 ─────────
const STALL_GOODS = {
  fruit: ['#ff9a30', '#ffcc30', '#e84a3a', '#7ac04a'],
  fish: ['#8ab0d8', '#6a90c0', '#c0d8f0', '#8ab0d8'],
  cloth: ['#e86a9a', '#6ab0e8', '#f4d050', '#9a7ad8'],
  potion: ['#e8466a', '#5ad0a0', '#b080ff', '#ffd060'],
};
const AWNING = { fruit: ['#e85a4a', '#fff4e4'], fish: ['#4a7ac8', '#fff4e4'], cloth: ['#9a5ad0', '#fff4e4'], potion: ['#4aa070', '#fff4e4'] };

function drawStall(ctx, o, sx, sy, t) {
  const fw = o.w * T;
  const goods = STALL_GOODS[o.goods] || STALL_GOODS.fruit;
  const [c1, c2] = AWNING[o.goods] || AWNING.fruit;
  ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.fillRect(sx + 1, sy + T - 1, fw, 3);
  // 柱
  rect(ctx, sx + 1, sy - 34, 2, 46, INK); rect(ctx, sx + fw - 3, sy - 34, 2, 46, INK);
  // 台
  box(ctx, sx, sy + 2, fw, 13, '#b07a42');
  rect(ctx, sx + 1, sy + 3, fw - 2, 2, '#d09a5a');
  for (let x = sx + 4; x < sx + fw - 2; x += 6) rect(ctx, x, sy + 6, 1, 8, '#8a5a2a');
  // 品物
  if (!o.empty) {
    for (let i = 0; i < o.w * 3; i++) {
      const gx = sx + 3 + i * 5, c = goods[i % goods.length];
      if (o.goods === 'potion') {
        rect(ctx, gx, sy - 3, 3, 5, c); rect(ctx, gx + 1, sy - 5, 1, 2, '#e8e0d0');
      } else {
        rect(ctx, gx, sy - 1, 4, 3, c); rect(ctx, gx + 1, sy - 2, 2, 1, c);
        rect(ctx, gx + 1, sy - 1, 1, 1, '#ffffff');
      }
    }
  }
  // 日よけ
  const ay = sy - 40;
  rect(ctx, sx - 2, ay, fw + 4, 10, INK);
  for (let x = 0; x < fw + 2; x++) {
    ctx.fillStyle = ((x >> 2) & 1) ? c2 : c1;
    ctx.fillRect(sx - 1 + x, ay + 1, 1, 8);
  }
  // すそのギザギザ
  for (let x = 0; x < fw + 2; x += 4) {
    ctx.fillStyle = ((x >> 2) & 1) ? c2 : c1;
    ctx.fillRect(sx - 1 + x, ay + 9, 3, 2);
    rect(ctx, sx - 1 + x + 3, ay + 9, 1, 2, INK);
  }
}

// ───────── 灯台 ─────────
function drawLighthouse(ctx, o, sx, sy, t) {
  const cx = sx + o.w * T / 2, base = sy + o.h * T;
  ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.fillRect(cx - 18, base - 2, 38, 4);
  // 土台
  box(ctx, cx - 17, base - 12, 34, 12, '#9a9488');
  rect(ctx, cx - 16, base - 11, 32, 2, '#b8b2a4');
  // 塔（下ほど太い）
  const H = 62, top = base - 12 - H;
  for (let y = 0; y < H; y++) {
    const half = Math.round(9 + (y / H) * 5);
    const band = Math.floor(y / 11) % 2 === 0;
    const yy = top + y;
    rect(ctx, cx - half - 1, yy, half * 2 + 2, 1, INK);
    rect(ctx, cx - half, yy, half * 2, 1, band ? '#e8e4dc' : '#d04a3e');
    rect(ctx, cx - half, yy, 3, 1, band ? '#ffffff' : '#e86a5a');
    rect(ctx, cx + half - 3, yy, 3, 1, band ? '#c8c2b6' : '#a83a30');
  }
  // 窓と入口
  box(ctx, cx - 3, top + 22, 6, 7, '#3a4a6a');
  box(ctx, cx - 5, base - 26, 10, 14, '#6a4a2a');
  rect(ctx, cx - 4, base - 25, 8, 1, '#8a6a4a');
  // 回廊
  box(ctx, cx - 13, top - 3, 26, 5, '#4a4a5a');
  for (let x = cx - 11; x < cx + 12; x += 3) rect(ctx, x, top - 7, 1, 4, INK);
  rect(ctx, cx - 12, top - 8, 24, 1, INK);
  // 灯室
  const glow = 0.7 + 0.3 * Math.sin(t * 2);
  box(ctx, cx - 8, top - 18, 16, 11, '#3a3a4a');
  ctx.fillStyle = `rgba(255, 230, 120, ${glow})`;
  ctx.fillRect(cx - 6, top - 16, 12, 7);
  rect(ctx, cx - 1, top - 16, 2, 7, '#fff8d0');
  // 屋根
  for (let y = 0; y < 9; y++) {
    const half = 2 + y;
    rect(ctx, cx - half - 1, top - 27 + y, half * 2 + 2, 1, INK);
    rect(ctx, cx - half, top - 27 + y, half * 2, 1, y < 2 ? '#e86a5a' : '#c8403a');
  }
  rect(ctx, cx - 1, top - 31, 2, 4, INK);
}

// ───────── 小物 ─────────
function drawLamp(ctx, o, sx, sy, t) {
  const cx = sx + 8, base = sy + 13;
  ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.fillRect(cx - 4, base - 1, 8, 2);
  rect(ctx, cx - 3, base - 3, 6, 3, INK);
  rect(ctx, cx - 1, base - 26, 3, 24, INK);
  rect(ctx, cx, base - 25, 1, 22, '#5a5a6a');
  box(ctx, cx - 4, base - 33, 9, 8, '#3a3a4a');
  rect(ctx, cx - 2, base - 31, 5, 4, '#ffe490');
  rect(ctx, cx - 3, base - 35, 7, 2, INK);
}

function drawBarrel(ctx, o, sx, sy) {
  const x = sx + 2, y = sy - 2;
  ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.fillRect(x, sy + 13, 13, 3);
  box(ctx, x, y, 12, 16, '#a8703a');
  rect(ctx, x + 1, y + 1, 10, 2, '#c08850');
  rect(ctx, x + 1, y + 4, 10, 1, '#5a5a62'); rect(ctx, x + 1, y + 11, 10, 1, '#5a5a62');
  rect(ctx, x + 2, y + 5, 1, 6, '#c08850');
}

function drawCrate(ctx, o, sx, sy) {
  const x = sx + 1, y = sy - 1;
  ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.fillRect(x + 1, sy + 13, 14, 3);
  box(ctx, x, y, 14, 15, '#c89a5a');
  rect(ctx, x + 1, y + 1, 12, 1, '#e0b878');
  rect(ctx, x + 1, y + 6, 12, 1, '#8a6a3a');
  rect(ctx, x + 6, y + 1, 1, 13, '#8a6a3a');
}

function drawSign(ctx, o, sx, sy) {
  const cx = sx + 8;
  rect(ctx, cx - 1, sy + 2, 3, 12, INK);
  rect(ctx, cx, sy + 3, 1, 10, '#8a5a32');
  box(ctx, cx - 8, sy - 6, 17, 11, '#d8b07a');
  rect(ctx, cx - 7, sy - 5, 15, 1, '#f0cc94');
  for (let i = 0; i < 3; i++) rect(ctx, cx - 5, sy - 3 + i * 3, 11, 1, '#8a6a4a');
}

function drawBench(ctx, o, sx, sy) {
  const fw = o.w * T;
  ctx.fillStyle = 'rgba(0,0,0,.15)'; ctx.fillRect(sx + 2, sy + 12, fw - 2, 3);
  box(ctx, sx + 1, sy, fw - 2, 5, '#a8703a');
  box(ctx, sx + 1, sy + 4, fw - 2, 5, '#c08850');
  rect(ctx, sx + 3, sy + 8, 2, 5, INK); rect(ctx, sx + fw - 5, sy + 8, 2, 5, INK);
}

function drawBoat(ctx, o, sx, sy, t) {
  const bob = Math.round(Math.sin(t * 1.4 + o.x) * 1);
  const x = sx, y = sy + bob;
  ctx.fillStyle = 'rgba(20,40,90,.35)'; ctx.fillRect(x + 2, sy + 12, 30, 2);
  for (let i = 0; i < 8; i++) {
    const inset = Math.max(0, 3 - i) + Math.max(0, i - 5);
    rect(ctx, x + inset, y + 4 + i, 32 - inset * 2, 1, i === 0 ? INK : i < 3 ? '#f4f0e4' : '#c84a3a');
  }
  rect(ctx, x, y + 4, 1, 4, INK); rect(ctx, x + 31, y + 4, 1, 4, INK);
  rect(ctx, x + 3, y + 11, 26, 1, INK);
  if (o.mast) {
    rect(ctx, x + 15, y - 20, 2, 24, '#6a4a2a');
    for (let i = 0; i < 14; i++) rect(ctx, x + 17, y - 18 + i, Math.max(1, 10 - Math.abs(i - 7)), 1, '#fff8ea');
  }
}

function drawRock(ctx, o, sx, sy) {
  box(ctx, sx + 1, sy + 2, 14, 12, '#8a8478');
  rect(ctx, sx + 2, sy + 3, 8, 3, '#aaa498');
  rect(ctx, sx + 9, sy + 9, 5, 4, '#6a645a');
}

function drawTent(ctx, o, sx, sy) {
  // 予約地（いまは ロープと くいだけ）
  const fw = o.w * T, fh = o.h * T;
  for (const [x, y] of [[0, 0], [fw - 3, 0], [0, fh - 4], [fw - 3, fh - 4]]) {
    rect(ctx, sx + x, sy + y - 6, 3, 9, INK); rect(ctx, sx + x + 1, sy + y - 5, 1, 7, '#a87040');
  }
  ctx.fillStyle = '#e8dcc0';
  ctx.fillRect(sx + 3, sy - 4, fw - 6, 1); ctx.fillRect(sx + 3, sy + fh - 2, fw - 6, 1);
}

const DRAW = {
  house: drawHouse, tree: drawTree, fountain: drawFountain, stall: drawStall,
  lighthouse: drawLighthouse, lamp: drawLamp, barrel: drawBarrel, crate: drawCrate,
  sign: drawSign, bench: drawBench, boat: drawBoat, rock: drawRock, tent: drawTent,
};

export function drawProp(ctx, o, sx, sy, t) {
  const fn = DRAW[o.type];
  if (fn) fn(ctx, o, sx, sy, t);
}

// どの種類が ふみこめないか（boat は海の上なので不要、tent は ロープだけ）
export const PASSABLE_PROPS = new Set(['boat', 'tent']);

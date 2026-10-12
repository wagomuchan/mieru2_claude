// 地面のタイル（16×16ドット）を、プログラムで描いておく
import { rng, hash2, canvas } from './util.js';

export const T = 16;
const VARIANTS = 4;

// タイルの種類
//  g 草  f 花  c 石だたみ  d 土  s 砂  p 桟橋  ~ 海
export const SOLID_TILES = new Set(['~']);

function px(ctx, x, y, c) { ctx.fillStyle = c; ctx.fillRect(x, y, 1, 1); }

function grass(ctx, r) {
  ctx.fillStyle = '#6cb04a'; ctx.fillRect(0, 0, T, T);
  for (let i = 0; i < 12; i++) px(ctx, r() * T | 0, r() * T | 0, '#5c9e3e');
  for (let i = 0; i < 3; i++) {
    const x = 1 + (r() * 13 | 0), y = 2 + (r() * 12 | 0);
    px(ctx, x, y, '#8ccc5e'); px(ctx, x + 2, y, '#8ccc5e'); px(ctx, x + 1, y + 1, '#5c9e3e');
  }
}

function flowers(ctx, r) {
  grass(ctx, r);
  const cols = ['#ffffff', '#ffe066', '#ff8fb8', '#b8a0ff'];
  for (let i = 0; i < 3; i++) {
    const x = 2 + (r() * 11 | 0), y = 2 + (r() * 11 | 0);
    const c = cols[r() * cols.length | 0];
    px(ctx, x, y - 1, c); px(ctx, x - 1, y, c); px(ctx, x + 1, y, c); px(ctx, x, y + 1, c);
    px(ctx, x, y, '#ffb030');
  }
}

function cobble(ctx, r) {
  ctx.fillStyle = '#8f8576'; ctx.fillRect(0, 0, T, T);
  const rows = [[0, 4], [5, 4], [10, 5]];
  rows.forEach(([y, h], ri) => {
    let x = ri % 2 ? -3 : 0;
    while (x < T) {
      const w = 5 + (r() * 3 | 0);
      const base = ['#cbbfa9', '#c3b6a0', '#d2c7b2'][r() * 3 | 0];
      ctx.fillStyle = base; ctx.fillRect(x, y, w - 1, h - 1);
      ctx.fillStyle = '#e2d9c6'; ctx.fillRect(x, y, w - 2, 1);
      ctx.fillStyle = '#a99c86'; ctx.fillRect(x + 1, y + h - 2, w - 2, 1);
      x += w;
    }
  });
}

function dirt(ctx, r) {
  ctx.fillStyle = '#c4956a'; ctx.fillRect(0, 0, T, T);
  for (let i = 0; i < 10; i++) px(ctx, r() * T | 0, r() * T | 0, '#ac7c52');
  for (let i = 0; i < 4; i++) px(ctx, r() * T | 0, r() * T | 0, '#dcb088');
  const x = r() * 13 | 0, y = r() * 13 | 0;
  ctx.fillStyle = '#9a8a7a'; ctx.fillRect(x, y, 2, 2);
}

function sand(ctx, r) {
  ctx.fillStyle = '#eedca4'; ctx.fillRect(0, 0, T, T);
  for (let i = 0; i < 10; i++) px(ctx, r() * T | 0, r() * T | 0, '#d9c084');
  for (let i = 0; i < 5; i++) px(ctx, r() * T | 0, r() * T | 0, '#fff4cc');
}

function pier(ctx, r) {
  ctx.fillStyle = '#b07a42'; ctx.fillRect(0, 0, T, T);
  for (let y = 0; y < T; y += 4) {
    ctx.fillStyle = '#7e522a'; ctx.fillRect(0, y + 3, T, 1);
    ctx.fillStyle = '#c99258'; ctx.fillRect(0, y, T, 1);
    const seam = r() * 14 | 0;
    ctx.fillStyle = '#7e522a'; ctx.fillRect(seam, y, 1, 3);
  }
  px(ctx, 2, 1, '#4a3020'); px(ctx, 13, 9, '#4a3020');
}

const MAKERS = { g: grass, f: flowers, c: cobble, d: dirt, s: sand, p: pier };
const cache = {};

export function tileImage(ch, x, y) {
  const key = ch;
  if (!cache[key]) {
    const make = MAKERS[ch] || grass;
    cache[key] = [];
    for (let v = 0; v < VARIANTS; v++) {
      const [cv, ctx] = canvas(T, T);
      make(ctx, rng(1000 + v * 77 + ch.charCodeAt(0) * 13));
      cache[key].push(cv);
    }
  }
  return cache[key][hash2(x, y) % VARIANTS];
}

// 海は 毎フレーム 描く（波がうごく）
export function drawSea(ctx, sx, sy, tx, ty, t, map) {
  ctx.fillStyle = '#3d7bd2'; ctx.fillRect(sx, sy, T, T);
  const h = hash2(tx, ty);
  ctx.fillStyle = '#356cc0';
  ctx.fillRect(sx, sy + (h % 5) + 6, T, 1);
  // きらきら
  const phase = (t * 1.6 + (h % 100) / 25) % 4;
  if (phase < 2) {
    const wx = sx + (h % 11) + (phase < 1 ? 0 : 1), wy = sy + ((h >> 4) % 12) + 2;
    ctx.fillStyle = '#8fc0ff'; ctx.fillRect(wx, wy, 3, 1);
    ctx.fillStyle = '#d6ecff'; ctx.fillRect(wx + 1, wy, 1, 1);
  }
  const land = (x, y) => { const c = map.tile(x, y); return c && c !== '~' && c !== 'p'; };
  const above = map.tile(tx, ty - 1);
  // 上が砂浜なら、やさしい 波打ちぎわ
  if (above === 's') {
    ctx.fillStyle = '#5a9ae0'; ctx.fillRect(sx, sy, T, 4);
    const f = (t * 1.5 + tx * 0.4) % 2;
    ctx.fillStyle = '#e8f4ff'; ctx.fillRect(sx, sy + Math.round(f), T, 1);
    ctx.fillStyle = '#b8d8ff'; ctx.fillRect(sx + (tx % 3) * 4, sy + 3 + Math.round(f), 6, 1);
  } else if (land(tx, ty - 1)) {
  // 上が陸なら、岸壁の石がき
    ctx.fillStyle = '#7d7468'; ctx.fillRect(sx, sy, T, 6);
    ctx.fillStyle = '#968c7e'; ctx.fillRect(sx, sy, T, 1);
    ctx.fillStyle = '#625a50';
    ctx.fillRect(sx + (h % 4), sy + 3, 1, 3); ctx.fillRect(sx + 8 + (h % 4), sy + 1, 1, 2);
    ctx.fillRect(sx, sy + 2, T, 1);
    ctx.fillStyle = '#2d5ea8'; ctx.fillRect(sx, sy + 6, T, 2);
    const f = (t * 2 + tx * 0.7) % 2 < 1;
    ctx.fillStyle = '#e8f4ff'; ctx.fillRect(sx + (f ? 2 : 9), sy + 7, 4, 1);
  } else if (above === 'p') {
    // 桟橋の 柱
    ctx.fillStyle = '#2d5ea8'; ctx.fillRect(sx, sy, T, 3);
    ctx.fillStyle = '#5a3a1e'; ctx.fillRect(sx + 1, sy, 3, 7); ctx.fillRect(sx + 12, sy, 3, 7);
    ctx.fillStyle = '#d6ecff'; ctx.fillRect(sx, sy + 7, 5, 1); ctx.fillRect(sx + 11, sy + 7, 5, 1);
  }
  // 横や下が陸なら、白い波打ちぎわ
  const foam = (t * 2.2 + tx + ty) % 2 < 1;
  ctx.fillStyle = '#e8f4ff';
  if (land(tx - 1, ty)) ctx.fillRect(sx, sy + (foam ? 2 : 4), 1, 10);
  if (land(tx + 1, ty)) ctx.fillRect(sx + T - 1, sy + (foam ? 4 : 2), 1, 10);
  if (land(tx, ty + 1)) ctx.fillRect(sx + (foam ? 1 : 3), sy + T - 1, 12, 1);
}

// 陸のふち（下が海）に、すこし影
export function drawLandEdge(ctx, sx, sy, tx, ty, map) {
  if (map.tile(tx, ty + 1) === '~') {
    ctx.fillStyle = 'rgba(0,0,0,.12)'; ctx.fillRect(sx, sy + T - 2, T, 2);
  }
}

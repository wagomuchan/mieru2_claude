// 第二章：アメリカの 田舎町の 建物や もの
import { registerProps, box, rect, INK } from './props.js';
import { T } from './tiles.js';
import { drawText, textWidth } from './pixfont.js';

function disc(ctx, cx, cy, r, c) {
  ctx.fillStyle = c;
  for (let y = -r; y <= r; y++) { const w = Math.round(Math.sqrt(r * r - y * y)); ctx.fillRect(cx - w, cy + y, w * 2 + 1, 1); }
}
function shadow(ctx, x, y, w) { ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.fillRect(x, y, w, 3); }

// ダイナー（食堂）
function diner(ctx, o, sx, sy, t) {
  const fw = o.w * T, base = sy + o.h * T, top = base - 34;
  shadow(ctx, sx + 2, base - 1, fw);
  box(ctx, sx, top, fw, 34, '#cfe0e8');
  rect(ctx, sx + 1, top + 1, fw - 2, 3, '#e8f4f8');
  rect(ctx, sx + 1, top + 14, fw - 2, 2, '#d84a4a');                 // 赤い おび
  rect(ctx, sx + 1, base - 6, fw - 2, 5, '#9ab0bc');
  // 大きな まど
  for (let x = sx + 4; x < sx + fw - 14; x += 14) {
    box(ctx, x, top + 18, 12, 10, '#ffe8a0');
    rect(ctx, x + 1, top + 19, 10, 3, '#fff4c8');
  }
  // とびら
  const dx = sx + fw - 14;
  box(ctx, dx, base - 18, 10, 18, '#8ab0c8'); rect(ctx, dx + 2, base - 16, 6, 7, '#ffe8a0');
  // ネオンの かんばん
  const label = 'DINER', w = textWidth(label) + 6;
  const bx = sx + (fw - w) / 2 | 0, by = top - 12;
  box(ctx, bx, by, w, 11, '#2a2a4a');
  const on = Math.floor(t * 2) % 4 !== 0;
  drawText(ctx, bx + 3, by + 3, label, on ? '#ff6a8a' : '#7a3a4a');
  rect(ctx, bx + 4, by + 11, 1, 3, INK); rect(ctx, bx + w - 5, by + 11, 1, 3, INK);
}

// ガソリンスタンド
function gas(ctx, o, sx, sy, t) {
  const fw = o.w * T, base = sy + o.h * T;
  shadow(ctx, sx + 2, base - 1, fw);
  // 柱と 屋根
  rect(ctx, sx + 3, base - 30, 3, 30, INK); rect(ctx, sx + fw - 6, base - 30, 3, 30, INK);
  rect(ctx, sx + 4, base - 30, 1, 30, '#c8c8d0'); rect(ctx, sx + fw - 5, base - 30, 1, 30, '#c8c8d0');
  box(ctx, sx - 2, base - 38, fw + 4, 9, '#f4f4f4');
  rect(ctx, sx - 1, base - 33, fw + 2, 3, '#d84a4a');
  drawText(ctx, sx + fw / 2 - 6 | 0, base - 37, 'GAS', '#2a4a8a');
  // 給油機（ボタンが なくなると、ここが 空く）
  for (const x of [sx + fw / 2 - 10, sx + fw / 2 + 3]) {
    box(ctx, x | 0, base - 16, 8, 15, '#d84a4a');
    rect(ctx, (x | 0) + 2, base - 13, 4, 3, '#ffffff');
    if (!o.noButtons) { rect(ctx, (x | 0) + 2, base - 8, 1, 1, '#ffd040'); rect(ctx, (x | 0) + 4, base - 8, 1, 1, '#40d0ff'); }
    else rect(ctx, (x | 0) + 2, base - 8, 3, 1, '#7a2a2a');
  }
}

// 赤い 納屋
function barn(ctx, o, sx, sy) {
  const fw = o.w * T, base = sy + o.h * T, wallTop = base - 28;
  shadow(ctx, sx + 2, base - 1, fw);
  box(ctx, sx + 1, wallTop, fw - 2, 28, '#b83a3a');
  for (let x = sx + 4; x < sx + fw - 2; x += 4) rect(ctx, x, wallTop + 1, 1, 26, '#982a2a');
  // 大きな とびら（白い X）
  const dw = 22, dx = sx + (fw - dw) / 2 | 0;
  box(ctx, dx, base - 20, dw, 20, '#a83030');
  rect(ctx, dx, base - 20, dw, 2, '#f4f0e8'); rect(ctx, dx, base - 2, dw, 2, '#f4f0e8');
  rect(ctx, dx, base - 20, 2, 20, '#f4f0e8'); rect(ctx, dx + dw - 2, base - 20, 2, 20, '#f4f0e8');
  for (let i = 0; i < 18; i++) { rect(ctx, dx + 1 + i, base - 19 + i, 2, 1, '#f4f0e8'); rect(ctx, dx + dw - 3 - i, base - 19 + i, 2, 1, '#f4f0e8'); }
  // ぎざぎざ 屋根（ギャンブレル）
  const cx = sx + fw / 2;
  for (let y = 0; y < 22; y++) {
    const half = y < 10 ? 10 + y * 1.4 : 24 + (y - 10) * 0.35;
    rect(ctx, cx - half - 1, wallTop - 22 + y, half * 2 + 2, 1, INK);
    rect(ctx, cx - half, wallTop - 22 + y, half * 2, 1, y % 4 === 0 ? '#5a4a4a' : '#7a6a6a');
  }
  box(ctx, cx - 5, wallTop - 14, 10, 8, '#f4f0e8'); rect(ctx, cx - 3, wallTop - 12, 6, 4, '#3a2a2a');
}

// 給水塔
function watertower(ctx, o, sx, sy) {
  const cx = sx + o.w * T / 2, base = sy + o.h * T;
  shadow(ctx, cx - 14, base - 1, 28);
  for (const x of [cx - 12, cx + 10]) { rect(ctx, x, base - 44, 3, 44, INK); rect(ctx, x + 1, base - 44, 1, 44, '#8a8a9a'); }
  for (let i = 0; i < 20; i++) { rect(ctx, cx - 10 + i, base - 40 + i * 1.6 | 0, 1, 1, '#6a6a7a'); rect(ctx, cx + 9 - i, base - 40 + i * 1.6 | 0, 1, 1, '#6a6a7a'); }
  box(ctx, cx - 16, base - 70, 32, 26, '#c8d0dc');
  rect(ctx, cx - 15, base - 69, 30, 3, '#e8eef4'); rect(ctx, cx - 15, base - 50, 30, 5, '#a0aab8');
  for (let y = 0; y < 8; y++) { const h = 3 + y * 2; rect(ctx, cx - h - 1, base - 78 + y, h * 2 + 2, 1, INK); rect(ctx, cx - h, base - 78 + y, h * 2, 1, '#a0aab8'); }
  drawText(ctx, cx - 11, base - 62, 'MAPLE', '#3a5a9a');
  drawText(ctx, cx - 11, base - 56, 'HOLLW', '#3a5a9a');
}

// サイロ
function silo(ctx, o, sx, sy) {
  const cx = sx + o.w * T / 2, base = sy + o.h * T;
  shadow(ctx, cx - 12, base - 1, 24);
  box(ctx, cx - 11, base - 54, 22, 54, '#b8b0a0');
  for (let y = base - 50; y < base - 2; y += 6) rect(ctx, cx - 10, y, 20, 1, '#9a9282');
  rect(ctx, cx - 10, base - 53, 4, 51, '#d0c8b8');
  disc(ctx, cx, base - 54, 11, INK); disc(ctx, cx, base - 54, 10, '#a8b0bc');
  rect(ctx, cx - 11, base - 54, 22, 2, INK);
}

// 風車（くみあげ ポンプ）
function windmill(ctx, o, sx, sy, t) {
  const cx = sx + 8, base = sy + 14;
  shadow(ctx, cx - 6, base - 1, 12);
  for (let i = 0; i < 40; i++) { rect(ctx, cx - 6 + i * 0.15 | 0, base - i, 1, 1, '#6a6a7a'); rect(ctx, cx + 6 - i * 0.15 | 0, base - i, 1, 1, '#6a6a7a'); }
  const hx = cx, hy = base - 42;
  for (let k = 0; k < 12; k++) {
    const a = t * 2 + k / 12 * Math.PI * 2;
    for (let r = 2; r < 11; r++) rect(ctx, hx + Math.cos(a) * r | 0, hy + Math.sin(a) * r | 0, 1, 1, '#d8d8e0');
  }
  disc(ctx, hx, hy, 2, INK);
  rect(ctx, hx, hy - 1, 10, 2, '#9a9aa8'); rect(ctx, hx + 9, hy - 4, 3, 8, '#9a9aa8');
}

// さく
function fence(ctx, o, sx, sy) {
  const fw = o.w * T, fh = o.h * T;
  if (o.w >= o.h) {
    for (let x = sx + 1; x < sx + fw; x += 8) { rect(ctx, x, sy - 2, 3, 14, INK); rect(ctx, x + 1, sy - 1, 1, 12, '#c8a070'); }
    rect(ctx, sx, sy + 1, fw, 3, INK); rect(ctx, sx, sy + 2, fw, 1, '#e0c090');
    rect(ctx, sx, sy + 6, fw, 3, INK); rect(ctx, sx, sy + 7, fw, 1, '#e0c090');
  } else {
    for (let y = sy; y < sy + fh; y += 8) { rect(ctx, sx + 6, y - 2, 3, 14, INK); rect(ctx, sx + 7, y - 1, 1, 12, '#c8a070'); }
  }
}

function hay(ctx, o, sx, sy) {
  shadow(ctx, sx + 1, sy + 12, 15);
  disc(ctx, sx + 8, sy + 6, 8, INK); disc(ctx, sx + 8, sy + 6, 7, '#e8c860');
  for (let k = 0; k < 4; k++) rect(ctx, sx + 3, sy + 1 + k * 3, 10, 1, '#c8a840');
  disc(ctx, sx + 5, sy + 4, 2, '#f8e090');
}

function mailbox(ctx, o, sx, sy) {
  rect(ctx, sx + 7, sy + 1, 2, 12, '#6a4a2a');
  box(ctx, sx + 3, sy - 6, 10, 8, '#4a7ac8'); rect(ctx, sx + 4, sy - 5, 8, 2, '#6a9ae0');
  rect(ctx, sx + 12, sy - 6, 2, 4, '#d84a4a');
}

function pumpkin(ctx, o, sx, sy) {
  disc(ctx, sx + 8, sy + 9, 5, INK); disc(ctx, sx + 8, sy + 9, 4, '#f08a2a');
  rect(ctx, sx + 7, sy + 5, 1, 8, '#c86a1a'); rect(ctx, sx + 9, sy + 5, 1, 8, '#c86a1a');
  rect(ctx, sx + 8, sy + 2, 1, 3, '#4a7a2a');
}

function truck(ctx, o, sx, sy) {
  const x = sx, base = sy + 14;
  shadow(ctx, x + 2, base - 1, 30);
  box(ctx, x, base - 10, 32, 8, '#3a7ab8');
  box(ctx, x + 16, base - 17, 14, 8, '#3a7ab8');
  rect(ctx, x + 18, base - 15, 9, 4, '#bfe0f0');
  rect(ctx, x + 1, base - 9, 30, 1, '#6a9ad8');
  for (const wx of [x + 6, x + 24]) { disc(ctx, wx, base - 2, 3, INK); disc(ctx, wx, base - 2, 1, '#9a9aa8'); }
}

function scarecrow(ctx, o, sx, sy) {
  const cx = sx + 8, base = sy + 14;
  rect(ctx, cx, base - 22, 2, 22, '#7a5a3a');
  rect(ctx, cx - 9, base - 17, 20, 2, '#7a5a3a');
  box(ctx, cx - 4, base - 18, 10, 10, '#8a4a3a');
  disc(ctx, cx + 1, base - 23, 4, INK); disc(ctx, cx + 1, base - 23, 3, '#e8d8a0');
  rect(ctx, cx - 4, base - 28, 11, 2, '#c8a040'); rect(ctx, cx - 2, base - 30, 7, 2, '#c8a040');
}

// 観覧車（大きい。ゆっくり まわる）
function ferris(ctx, o, sx, sy, t) {
  const cx = sx + o.w * T / 2, base = sy + o.h * T, r = 34, hy = base - 44;
  shadow(ctx, cx - 26, base - 1, 52);
  for (const d of [-1, 1]) for (let i = 0; i < 44; i++) rect(ctx, cx + d * (i * 0.45) | 0, hy + i, 2, 1, '#6a5a7a');
  const bulbs = ['#ffe070', '#ff7a8a', '#7ae0ff', '#a0ff8a'];
  const rot = t * 0.15;
  for (let k = 0; k < 12; k++) {
    const a = rot + k / 12 * Math.PI * 2;
    for (let q = 3; q < r; q += 2) rect(ctx, cx + Math.cos(a) * q | 0, hy + Math.sin(a) * q | 0, 1, 1, '#9a8ab0');
  }
  for (let k = 0; k < 120; k++) {
    const a = k / 120 * Math.PI * 2;
    rect(ctx, cx + Math.cos(a) * r | 0, hy + Math.sin(a) * r | 0, 1, 1, '#c8b8e0');
  }
  for (let k = 0; k < 24; k++) {
    const a = rot + k / 24 * Math.PI * 2;
    const on = (Math.floor(t * 3) + k) % 3 !== 0;
    rect(ctx, cx + Math.cos(a) * r | 0, hy + Math.sin(a) * r | 0, 1, 1, on ? bulbs[k % 4] : '#5a4a6a');
  }
  for (let k = 0; k < 8; k++) {
    const a = rot + k / 8 * Math.PI * 2;
    const gx = cx + Math.cos(a) * r | 0, gy = hy + Math.sin(a) * r | 0;
    box(ctx, gx - 3, gy + 1, 7, 5, ['#d84a5a', '#4a7ac8', '#f0c040', '#5aa04a'][k % 4]);
  }
  disc(ctx, cx, hy, 3, INK); disc(ctx, cx, hy, 2, '#c8b8e0');
  box(ctx, cx - 10, base - 6, 20, 6, '#8a6a4a');
}

// サクラの 魔術研究所（古い 納屋に ガラスの ドーム）
function lab(ctx, o, sx, sy, t) {
  const fw = o.w * T, base = sy + o.h * T, wallTop = base - 26;
  shadow(ctx, sx + 2, base - 1, fw);
  box(ctx, sx + 1, wallTop, fw - 2, 26, '#e8d8c8');
  for (let x = sx + 4; x < sx + fw - 2; x += 5) rect(ctx, x, wallTop + 1, 1, 24, '#d0c0b0');
  box(ctx, sx + fw / 2 - 5, base - 17, 10, 17, '#c87a9a');
  rect(ctx, sx + fw / 2 + 2, base - 9, 1, 2, '#ffd040');
  for (const x of [sx + 5, sx + fw - 15]) { box(ctx, x, wallTop + 7, 10, 8, '#ffd8ec'); rect(ctx, x + 4, wallTop + 7, 1, 8, INK); }
  // 屋根と ドーム
  for (let y = 0; y < 10; y++) rect(ctx, sx - 1 + y, wallTop - 10 + y, fw + 2 - y * 2 > 0 ? fw + 2 - y * 2 : 0, 1, y % 3 ? '#8a5a6a' : '#6a3a4a');
  const cx = sx + fw / 2;
  for (let y = 0; y < 12; y++) {
    const w = Math.round(Math.sqrt(144 - (11 - y) * (11 - y)));
    rect(ctx, cx - w - 1, wallTop - 22 + y, w * 2 + 2, 1, INK);
    rect(ctx, cx - w, wallTop - 22 + y, w * 2, 1, y < 4 ? '#e0f4ff' : '#a8d8f0');
  }
  rect(ctx, cx - 6, wallTop - 19, 3, 2, '#ffffff');
  // アンテナと 光る 魔法陣
  rect(ctx, cx, wallTop - 32, 1, 10, INK);
  const glow = Math.floor(t * 3) % 2;
  rect(ctx, cx - 1, wallTop - 34, 3, 3, glow ? '#ff8ab8' : '#f4c0d8');
  // かんばん
  box(ctx, sx + 2, base - 12, 14, 8, '#fff4e8');
  drawText(ctx, sx + 4, base - 10, 'LAB', '#c86890');
}

// 古い ボタン工場
function factory(ctx, o, sx, sy, t) {
  const fw = o.w * T, base = sy + o.h * T, wallTop = base - 40;
  shadow(ctx, sx + 2, base - 1, fw);
  box(ctx, sx + 1, wallTop, fw - 2, 40, '#9a5a4a');
  for (let y = wallTop + 3; y < base - 1; y += 4) {
    rect(ctx, sx + 2, y, fw - 4, 1, '#7a4236');
    for (let x = sx + ((y / 4) % 2 ? 4 : 8); x < sx + fw - 2; x += 8) rect(ctx, x, y - 3, 1, 3, '#7a4236');
  }
  for (let x = sx + 6; x < sx + fw - 10; x += 14) { box(ctx, x, wallTop + 8, 10, 10, '#3a3a4a'); rect(ctx, x + 1, wallTop + 9, 8, 2, '#5a5a6a'); }
  // 入口
  box(ctx, sx + fw / 2 - 9, base - 20, 18, 20, '#2a2228');
  // ノコギリ屋根
  for (let k = 0; k < fw; k += 16) for (let y = 0; y < 12; y++) rect(ctx, sx + k, wallTop - 12 + y, Math.min(16, y * 1.4 + 2), 1, y === 0 ? INK : '#6a6a78');
  // えんとつ
  box(ctx, sx + fw - 18, wallTop - 34, 10, 34, '#8a4a3a');
  const ph = (t * 0.7) % 3;
  ctx.fillStyle = 'rgba(200,200,210,.5)'; ctx.fillRect(sx + fw - 16 + ph, wallTop - 42 - ph * 4, 5, 4);
  // 大きな ボタンの かんばん
  const bx = sx + 20, by = wallTop - 8;
  disc(ctx, bx, by, 10, INK); disc(ctx, bx, by, 9, '#e8466a'); disc(ctx, bx, by, 6, '#c8304a');
  for (const [dx, dy] of [[-2, -2], [2, -2], [-2, 2], [2, 2]]) disc(ctx, bx + dx, by + dy, 1, '#2a1018');
  drawText(ctx, sx + 34, wallTop + 22, 'BUTTON', '#f4e8c8');
}

// 工場の なかの もの
function conveyor(ctx, o, sx, sy, t) {
  const fw = o.w * T;
  box(ctx, sx, sy + 2, fw, 12, '#3a3a48');
  const off = Math.floor(t * 8) % 4;
  for (let x = sx + 1 + off; x < sx + fw - 1; x += 4) rect(ctx, x, sy + 3, 1, 10, '#5a5a68');
  rect(ctx, sx + 1, sy + 3, fw - 2, 1, '#7a7a88');
  for (let x = sx + 4; x < sx + fw - 4; x += 10) disc(ctx, x + (Math.floor(t * 8) % 10), sy + 7, 2, '#e8466a');
}
function spool(ctx, o, sx, sy) {
  shadow(ctx, sx + 2, sy + 13, 12);
  box(ctx, sx + 2, sy - 6, 12, 4, '#a87a4a'); box(ctx, sx + 2, sy + 10, 12, 4, '#a87a4a');
  box(ctx, sx + 4, sy - 3, 8, 14, '#5a8ad8');
  for (let y = sy - 2; y < sy + 10; y += 2) rect(ctx, sx + 5, y, 6, 1, '#7aaaf0');
}
function bigbutton(ctx, o, sx, sy) {
  shadow(ctx, sx + 1, sy + 12, 15);
  disc(ctx, sx + 8, sy + 6, 8, INK); disc(ctx, sx + 8, sy + 6, 7, o.color || '#f0c040');
  disc(ctx, sx + 8, sy + 6, 4, '#00000022');
  for (const [dx, dy] of [[-2, -2], [2, -2], [-2, 2], [2, 2]]) rect(ctx, sx + 8 + dx, sy + 6 + dy, 1, 1, INK);
}
// ボタンの 山（ボスの すみか）
function buttons(ctx, o, sx, sy) {
  const cols = ['#e8466a', '#f0c040', '#4a7ac8', '#5aa04a', '#ffffff', '#c890ff'];
  const fw = o.w * T, fh = o.h * T;
  for (let k = 0; k < fw * fh / 6; k++) {
    const x = sx + (k * 37 % fw), y = sy + (k * 53 % fh) - (k % 5);
    disc(ctx, x, y, 2, INK); disc(ctx, x, y, 1, cols[k % cols.length]);
  }
}

registerProps({ diner, gas, barn, watertower, silo, windmill, fence, hay, mailbox, pumpkin, truck, scarecrow, ferris, lab, factory, conveyor, spool, bigbutton, buttons });

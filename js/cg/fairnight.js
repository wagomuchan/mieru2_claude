// 一枚絵（ためし）：収穫祭の夜、観覧車の てっぺんから 花火を見る ふたり
// 240×180 ドット。プログラムで 描く。
import { rng } from '../util.js';

export const CG_W = 240, CG_H = 180;

const BAYER = [
  [0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5],
];

export function drawFairNight(ctx, t = 0) {
  const W = CG_W, H = CG_H;
  const R = rng(20251013);
  const px = (x, y, c) => { ctx.fillStyle = c; ctx.fillRect(x | 0, y | 0, 1, 1); };
  const rect = (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x | 0, y | 0, w | 0, h | 0); };
  const disc = (cx, cy, r, c) => {
    for (let y = -r; y <= r; y++) {
      const w = Math.floor(Math.sqrt(r * r - y * y) + 0.5);
      rect(cx - w, cy + y, w * 2 + 1, 1, c);
    }
  };
  const line = (x0, y0, x1, y1, c) => {
    const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
    for (let i = 0; i <= n; i++) px(Math.round(x0 + (x1 - x0) * i / n), Math.round(y0 + (y1 - y0) * i / n), c);
  };

  // ───── 空（ディザで なめらかに） ─────
  const sky = ['#0a0a26', '#141238', '#22184a', '#35205a', '#522a64', '#7a3866', '#a84a62', '#d06a5a'];
  for (let y = 0; y < 132; y++) {
    const f = Math.pow(y / 132, 1.35) * (sky.length - 1);
    const i = Math.floor(f), frac = f - i;
    for (let x = 0; x < W; x++) {
      const th = (BAYER[y & 3][x & 3] + 0.5) / 16;
      px(x, y, sky[Math.min(sky.length - 1, i + (frac > th ? 1 : 0))]);
    }
  }
  // 星
  for (let k = 0; k < 90; k++) {
    const x = R() * W, y = R() * 80;
    px(x, y, R() < 0.3 ? '#ffffff' : '#9a98d8');
  }
  for (const [x, y] of [[22, 14], [61, 30], [104, 9], [140, 40], [214, 18]]) {
    px(x, y, '#ffffff'); px(x - 1, y, '#8a88c8'); px(x + 1, y, '#8a88c8'); px(x, y - 1, '#8a88c8'); px(x, y + 1, '#8a88c8');
  }
  // 月
  disc(38, 34, 11, '#fff2c8');
  disc(42, 31, 10, sky[1]);
  disc(38, 34, 11, 'rgba(255,242,200,0)');

  // ───── 花火 ─────
  const firework = (cx, cy, r, cols, n) => {
    for (let k = 0; k < n; k++) {
      const a = (k / n) * Math.PI * 2 + 0.2;
      for (let d = r * 0.35; d < r; d += 2.2) {
        const fade = d / r;
        const c = fade > 0.8 ? cols[2] : fade > 0.55 ? cols[1] : cols[0];
        const sag = (d / r) * (d / r) * 3;
        px(cx + Math.cos(a) * d, cy + Math.sin(a) * d + sag, c);
      }
      px(cx + Math.cos(a) * r, cy + Math.sin(a) * r + 3, '#ffffff');
    }
    disc(cx, cy, 2, cols[0]);
    px(cx, cy, '#ffffff');
  };
  firework(92, 40, 26, ['#fff0a0', '#ffb040', '#d05030'], 22);
  firework(196, 30, 20, ['#ffe0f0', '#ff7ab0', '#b03a8a'], 18);
  firework(150, 64, 13, ['#e0fff0', '#6ae0c0', '#2a8a8a'], 14);

  // ───── 遠くの 町と 収穫祭 ─────
  const silo = '#2a1838', silo2 = '#3a2248';
  // 丘
  for (let x = 0; x < W; x++) {
    const h = 124 + Math.round(Math.sin(x / 31) * 3 + Math.sin(x / 13 + 1) * 1.5);
    rect(x, h, 1, 140 - h, '#24163a');
  }
  // 給水塔
  rect(14, 92, 2, 36, silo); rect(30, 92, 2, 36, silo);
  line(15, 110, 31, 124, silo); line(31, 110, 15, 124, silo);
  disc(23, 88, 11, silo2); rect(12, 88, 23, 8, silo2);
  rect(13, 84, 21, 2, '#4a3060');
  // 赤い納屋
  rect(196, 106, 30, 22, '#5a2238');
  for (let i = 0; i < 12; i++) rect(194 + i, 106 - i, 34 - i * 2, 1, '#3a1830');
  rect(208, 116, 6, 12, '#2a1020');
  // テントと ひもの あかり
  for (const [x, w, c] of [[44, 26, '#5a2a4a'], [120, 30, '#4a2a5a'], [166, 22, '#5a2a4a']]) {
    for (let i = 0; i < 12; i++) rect(x + i, 128 - 12 + i, w - i * 2 > 0 ? w : 0, 1, c);
    for (let i = 0; i < w / 2; i++) rect(x + w / 2 - i, 112 + i, i * 2, 1, c);
  }
  const bulb = ['#ffe070', '#ff7a8a', '#7ae0ff', '#a0ff8a'];
  for (let x = 0; x < W; x += 3) {
    const y = 118 + Math.round(Math.sin(x / 18) * 4 + Math.cos(x / 7) * 1);
    if (x % 6 === 0) px(x, y, bulb[(x / 3) % 4 | 0]);
    else px(x, y, '#3a2a4a');
  }
  // まちの 窓あかり
  for (let k = 0; k < 40; k++) px(R() * W, 126 + R() * 10, R() < 0.5 ? '#ffd070' : '#ffb050');

  // ───── 観覧車（となりの ゴンドラが 見える） ─────
  const wx = 210, wy = 10, wr = 70;
  for (let k = 0; k < 16; k++) {
    const a = (k / 16) * Math.PI * 2 + 0.1;
    line(wx, wy, wx + Math.cos(a) * wr, wy + Math.sin(a) * wr, '#5a4a7a');
  }
  for (let k = 0; k < 360; k++) {
    const a = k / 360 * Math.PI * 2;
    px(wx + Math.cos(a) * wr, wy + Math.sin(a) * wr, '#7a6a9a');
    px(wx + Math.cos(a) * (wr - 1), wy + Math.sin(a) * (wr - 1), '#4a3a6a');
  }
  for (let k = 0; k < 32; k++) {
    const a = k / 32 * Math.PI * 2;
    const c = bulb[k % 4];
    px(wx + Math.cos(a) * wr, wy + Math.sin(a) * wr, c);
    px(wx + Math.cos(a) * (wr + 1), wy + Math.sin(a) * wr, c);
  }

  // ───── ふたり（うしろ姿）：マスクに 陰影を つけて 描く ─────
  const INK = '#1a0f22';
  // mask(x, y) → { n: [nx, ny] } か null。光は 右うえ（花火）から
  const paintMask = (x0, y0, x1, y1, mask, tones, light = [0.6, -0.8]) => {
    const inside = (x, y) => !!mask(x, y);
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const m = mask(x, y);
      if (!m) {
        if (inside(x - 1, y) || inside(x + 1, y) || inside(x, y - 1) || inside(x, y + 1)) px(x, y, INK);
        continue;
      }
      const [nx, ny] = m.n;
      let v = 0.5 + 0.5 * (nx * light[0] + ny * light[1]);   // 0〜1
      v = Math.max(0, Math.min(0.999, v + (m.bias || 0)));
      const f = v * (tones.length - 1);
      const i = Math.floor(f), frac = f - i;
      const th = 0.5 + ((BAYER[y & 3][x & 3] + 0.5) / 16 - 0.5) * 0.45;
      px(x, y, tones[Math.min(tones.length - 1, i + (frac > th ? 1 : 0))]);
    }
  };

  // シメール：栗色の ふわふわロング
  const sx = 82, sy = 96;
  // 肩（みどりの 服）
  paintMask(sx - 30, sy + 16, sx + 30, sy + 50, (x, y) => {
    const dx = (x - sx) / 29, dy = (y - (sy + 38)) / 16;
    return dx * dx + dy * dy <= 1 ? { n: [dx, dy] } : null;
  }, ['#2e5a3a', '#3e7a4c', '#5a9a68', '#7aba84']);
  const sMask = (x, y) => {
    const dx = x - sx, dy = y - sy;
    const ang = Math.atan2(dy, dx);
    // 頭
    if (dx * dx + dy * dy <= 17 * 17) return { n: [dx / 17, dy / 17] };
    // ふわふわの 下がみ（なみなみの ふち）
    const ex = dx / (21 + Math.sin(dy / 4) * 1.5), ey = (dy - 16) / 22;
    const wav = 1 + 0.06 * Math.sin(ang * 9);
    if (ey > -0.6 && ex * ex + ey * ey <= wav) return { n: [ex, ey * 0.6], bias: -0.08 };
    return null;
  };
  paintMask(sx - 26, sy - 20, sx + 26, sy + 40, sMask, ['#4a2214', '#6a3420', '#8a4a2a', '#a85e36', '#c87a48', '#e8a066']);
  // ふわふわの カール（Cの字の つや）
  const curl = (cx, cy, r, c) => {
    for (let k = 0; k <= 10; k++) {
      const a = Math.PI * 0.15 + k / 10 * Math.PI * 1.1;
      const x = Math.round(cx + Math.cos(a) * r), y = Math.round(cy - Math.sin(a) * r * 0.8);
      if (sMask(x, y)) px(x, y, c);
    }
  };
  // つむじから 流れる 線
  for (const k of [-9, -4, 2, 8]) line(sx + k * 0.3, sy - 12, sx + k, sy + 2, '#8a4a2a');
  // 下がみの ゆるい 毛すじ
  for (const k of [-14, -8, -2, 4, 10]) {
    for (let i = 0; i < 26; i++) {
      const x = Math.round(sx + k + Math.sin(i / 4 + k) * 1.2), y = sy + 10 + i;
      if (sMask(x, y) && i % 4 !== 3) px(x, y, '#7a3e24');
    }
  }
  // 花火の 光が あたる ふち
  for (let y = sy - 16; y < sy + 30; y++) for (let x = sx; x < sx + 26; x++) {
    if (sMask(x, y) && !sMask(x + 1, y)) { px(x, y, '#ffd0a0'); break; }
  }
  // 大きな リボン（右うえ。ちょうちょ むすび）
  const bow = (cx, cy) => {
    const wing = (dir) => paintMask(cx + (dir < 0 ? -12 : 0), cy - 8, cx + (dir < 0 ? 0 : 12), cy + 6, (x, y) => {
      const dx = (x - cx) * dir, dy = y - cy;
      if (dx < 1) return null;
      const w = 2 + dx * 0.55;
      return Math.abs(dy + dx * 0.15) <= w && dx <= 10 ? { n: [dx / 10 * dir, dy / w] } : null;
    }, ['#8a1a34', '#b82a4a', '#e8466a', '#ff8fae']);
    wing(-1); wing(1);
    disc(cx, cy, 2, INK); rect(cx - 1, cy - 1, 3, 3, '#c8304a'); px(cx, cy - 1, '#ff8fae');
    line(cx - 1, cy + 2, cx - 4, cy + 11, '#b82a4a'); line(cx + 1, cy + 2, cx + 3, cy + 10, '#b82a4a');
    px(cx - 4, cy + 12, INK); px(cx + 3, cy + 11, INK);
  };
  bow(sx + 8, sy - 15);

  // エレシア：銀髪の まっすぐロング。すこし シメールの ほうへ かたむく
  const ex0 = 120, ey0 = 98;
  paintMask(ex0 - 28, ey0 + 14, ex0 + 28, ey0 + 50, (x, y) => {
    const dx = (x - ex0) / 27, dy = (y - (ey0 + 34)) / 16;
    return dx * dx + dy * dy <= 1 ? { n: [dx, dy] } : null;
  }, ['#1e2a6a', '#2a3e9a', '#3a58c0', '#5a7ae0']);
  const tilt = y => Math.round((ey0 + 10 - y) * 0.12); // 上ほど 左へ
  const eMask = (x, y) => {
    const cx = ex0 - tilt(y);
    const dx = x - cx, dy = y - ey0;
    if (dx * dx + dy * dy <= 16 * 16) return { n: [dx / 16, dy / 16] };
    if (dy > 0 && dy < 44) {
      const half = 16 + dy * 0.08;
      const tip = dy > 38 ? Math.abs(Math.sin(x * 1.3)) * 3 : 0;
      if (Math.abs(dx) <= half && dy < 44 - tip) return { n: [dx / half, 0.1], bias: 0.05 };
    }
    return null;
  };
  paintMask(ex0 - 26, ey0 - 20, ex0 + 26, ey0 + 46, eMask, ['#5a6288', '#7a82a8', '#9aa2c0', '#bcc4dc', '#dfe4f2', '#ffffff']);
  // まっすぐな 毛すじ
  for (let k = -14; k <= 14; k += 3) {
    for (let y = ey0 - 6; y < ey0 + 42; y++) {
      const x = ex0 - tilt(y) + k + Math.round(Math.sin(y / 9 + k) * 0.6);
      if (eMask(x, y) && (y + k) % 7 !== 0) px(x, y, k < 0 ? '#9aa2c0' : '#bcc4dc');
    }
  }
  // 天使の輪
  for (let k = -11; k <= 11; k++) {
    const y = ey0 - 7 + Math.round(k * k / 34);
    const x = ex0 - tilt(y) + k;
    px(x, y, '#ffffff'); px(x, y + 1, '#f0f4ff');
  }
  // ピンクの 花火の 光
  for (let y = ey0 - 14; y < ey0 + 40; y++) for (let x = ex0 + 24; x > ex0; x--) {
    if (eMask(x, y)) { px(x, y, '#ffd8ec'); break; }
  }
  // 星の 髪かざり
  {
    const stx = ex0 - 12 - tilt(ey0 - 4), sty = ey0 - 4;
    rect(stx - 2, sty, 5, 1, '#ffd860'); rect(stx, sty - 2, 1, 5, '#ffd860'); rect(stx - 1, sty - 1, 3, 3, '#ffd860');
    px(stx, sty, '#fff8c0'); px(stx - 3, sty, INK); px(stx + 3, sty, INK); px(stx, sty - 3, INK); px(stx, sty + 3, INK);
  }

  // ───── 手前：ゴンドラの まど わく ─────
  const frame = '#1a1226', frameL = '#3a2a4a', frameH = '#6a5a7a';
  rect(0, 0, W, 6, frame); rect(0, 6, W, 2, frameL);
  rect(0, 0, 6, H, frame); rect(6, 0, 2, H, frameL);
  rect(W - 6, 0, 6, H, frame); rect(W - 8, 0, 2, H, frameL);
  rect(0, 138, W, H - 138, '#24182e');
  for (let y = 142; y < H; y += 6) rect(8, y, W - 16, 1, '#2e2038');
  rect(0, 136, W, 3, frameH); rect(0, 139, W, 2, frameL);
  // 手すり
  rect(8, 134, W - 16, 3, '#8a6a4a'); rect(8, 134, W - 16, 1, '#c09a6a'); rect(8, 137, W - 16, 1, '#5a4030');
  // 手すりの上の 手（小指が そっと かさなる）
  const hand = (x, y) => {
    rect(x - 1, y, 9, 4, INK);
    rect(x, y - 1, 7, 4, INK);
    rect(x, y, 7, 3, '#ffd9b8'); rect(x + 1, y - 0, 5, 1, '#ffe8d4');
    for (let i = 0; i < 3; i++) px(x + 1 + i * 2, y + 2, '#d8a080');
  };
  hand(89, 131); hand(106, 131);
  // 小指どうし
  rect(96, 132, 4, 1, '#ffd9b8'); rect(101, 131, 4, 1, '#ffd9b8'); px(100, 131, '#ffd9b8'); px(100, 132, '#ffd9b8');
  rect(96, 133, 9, 1, INK); rect(96, 131, 4, 1, INK);
  // ふたりの あいだに 小さな ハートの 光
  px(102, 120, '#ffb0d0'); px(104, 120, '#ffb0d0'); rect(101, 121, 5, 1, '#ffb0d0'); rect(102, 122, 3, 1, '#ff8ab8'); px(103, 123, '#ff8ab8');

  // ふちの 光の にじみ（花火の いろ）
  for (let y = 8; y < 132; y += 2) { px(9, y, 'rgba(255,180,90,.35)'); px(W - 10, y, 'rgba(255,120,170,.3)'); }
}

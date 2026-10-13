// 会話や戦闘で使う「顔グラフィック」（32×32ドット）
// 顔の土台＋表情（目・口・まゆ・ほお）＋髪型 を重ねて作る。

export const PW = 32, PH = 32;
const OUTLINE = '#2b1d2e';

// 表情の一覧
export const EXPRESSIONS = ['normal', 'smile', 'shy', 'angry', 'sad', 'surprise', 'think', 'hurt'];

class Grid {
  constructor() { this.a = Array.from({ length: PH }, () => Array(PW).fill(null)); }
  put(x, y, k) { if (x >= 0 && y >= 0 && x < PW && y < PH && k) this.a[y][x] = k; }
  get(x, y) { return x >= 0 && y >= 0 && x < PW && y < PH ? this.a[y][x] : null; }
  rect(x, y, w, h, k) { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) this.put(i, j, k); }
  ellipse(cx, cy, rx, ry, k) {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
      for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
        const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry;
        if (dx * dx + dy * dy <= 1) this.put(x, y, k);
      }
    }
  }
  // 文字列で 小さい絵を置く（'.' は とばす）
  stamp(x, y, rows) {
    rows.forEach((line, j) => {
      for (let i = 0; i < line.length; i++) if (line[i] !== '.') this.put(x + i, y + j, line[i]);
    });
  }
  mirrorStamp(x, y, rows) { this.stamp(x, y, rows.map(r => [...r].reverse().join(''))); }
}

// ───────── 顔の土台 ─────────
const FACE_ROWS = {
  6: [11, 20], 7: [10, 21], 8: [9, 22],
  21: [9, 22], 22: [9, 22], 23: [10, 21], 24: [11, 20], 25: [13, 18],
};
function face(g) {
  for (let y = 6; y <= 25; y++) {
    const [a, b] = FACE_ROWS[y] || [8, 23];
    for (let x = a; x <= b; x++) g.put(x, y, 's');
  }
  // 耳
  g.rect(7, 16, 1, 4, 's'); g.rect(24, 16, 1, 4, 's');
  g.put(7, 17, 'S'); g.put(24, 17, 'S');
  // あごの かげ
  for (let x = 11; x <= 20; x++) g.put(x, 24, x < 13 || x > 18 ? 'S' : 's');
  g.put(16, 19, 'S'); // はな
  // 首
  g.rect(14, 26, 4, 2, 's'); g.rect(14, 26, 4, 1, 'S');
}

function body(g, def) {
  const c = 'c', C = 'C';
  g.rect(9, 27, 14, 1, c);
  g.rect(7, 28, 18, 1, c);
  g.rect(5, 29, 22, 1, c);
  g.rect(4, 30, 24, 2, c);
  g.rect(4, 31, 24, 1, C);
  if (def.collar === 'round') { g.rect(12, 27, 8, 1, 'a'); g.rect(11, 28, 3, 1, 'a'); g.rect(18, 28, 3, 1, 'a'); }
  if (def.collar === 'v') { g.stamp(12, 27, ['aa....aa', '.aa..aa.', '..aaaa..']); }
  if (def.collar === 'open') { g.stamp(13, 27, ['ss..ss', '.ssss.', '..ss..']); g.rect(9, 28, 3, 3, 'a'); g.rect(20, 28, 3, 3, 'a'); }
}

// ───────── 目 ─────────
const EYES = {
  normal: ['kkk', 'wee', 'eee', 'eEe'],
  smile: ['...', '.k.', 'k.k', '...'],
  shy: ['...', 'kkk', 'wee', 'eEe'],
  angry: ['...', 'kkk', 'wee', 'eee'],
  sad: ['...', 'kkk', 'wee', 'eEe'],
  surprise: ['kkk', 'wew', 'wew', 'www'],
  think: ['kkk', 'wwe', 'wwe', 'wEe'],
  hurt: ['k..', '.kk', 'k..', '...'],
};
// まゆ（左目の上。右は左右反転）
const BROWS = {
  angry: ['k..', '.kk'],
  sad: ['..k', 'kk.'],
  surprise: ['.k.', 'k.k'],
  think: ['...', 'kkk'],
};
const MOUTHS = {
  normal: ['....', '.mm.'],
  smile: ['mmmm', '.MM.'],
  shy: ['..m.', '.m..'],
  angry: ['.mm.', 'm..m'],
  sad: ['.mm.', 'm..m'],
  surprise: ['.mm.', 'mMMm', '.mm.'],
  think: ['....', '..mm'],
  hurt: ['mmmm', 'mMMm'],
};

function expression(g, ex, def) {
  const eyes = EYES[ex];
  g.stamp(11, 15, eyes);
  if (ex === 'hurt') g.mirrorStamp(18, 15, eyes); else g.stamp(18, 15, eyes);
  if (BROWS[ex]) { g.stamp(11, 12, BROWS[ex]); g.mirrorStamp(18, 12, BROWS[ex]); }
  if (def.eyes === 'sharp' && eyes[0] === 'kkk') {
    g.put(10, 15, 'k'); g.put(21, 15, 'k');
    g.rect(11, 19, 3, 1, 'S'); g.rect(18, 19, 3, 1, 'S');
  }
  g.stamp(14, 21, MOUTHS[ex]);
  // ほお
  if (ex === 'shy' || ex === 'smile' || ex === 'normal') {
    const k = ex === 'shy' ? 'P' : 'p';
    g.rect(10, 19, 2, 1, k); g.rect(20, 19, 2, 1, k);
    if (ex === 'shy') { g.rect(11, 20, 2, 1, 'P'); g.rect(19, 20, 2, 1, 'P'); }
  }
  if (ex === 'sad') { g.put(12, 19, 'b'); g.put(12, 20, 'b'); }
  if (ex === 'think' || ex === 'hurt') { g.stamp(23, 10, ['.b', 'bb', 'bb']); }
}

// ───────── 髪型 ─────────
// back: 顔より うしろ、front: 顔の上
const HAIRS = {
  // シメール：ふわふわロング
  fluffy: {
    back(g) {
      g.ellipse(16, 13, 12, 10, 'h');
      g.rect(4, 13, 24, 19, 'h');
      for (const x of [4, 9, 22, 27]) g.ellipse(x, 30, 2.5, 3, 'h');
      g.rect(5, 26, 2, 6, 'd'); g.rect(25, 26, 2, 6, 'd');
    },
    front(g) {
      g.ellipse(16, 9, 10, 7, 'h');
      g.rect(7, 9, 18, 4, 'h');
      // 前髪の毛先
      g.stamp(8, 13, ['hhhh.hhhhhh.hhhh', 'hhh...hhhh...hhh', '.h.....hh.....h.']);
      // 横の ふわふわ
      for (let y = 13; y < 30; y++) {
        const wob = (y % 4 < 2) ? 0 : 1;
        g.rect(5 + wob, y, 3, 1, 'h'); g.rect(24 - wob, y, 3, 1, 'h');
      }
      g.rect(6, 22, 2, 7, 'd'); g.rect(24, 22, 2, 7, 'd');
      // つや
      g.rect(11, 5, 4, 1, 'H'); g.rect(10, 6, 2, 1, 'H'); g.rect(19, 6, 3, 1, 'H');
    },
  },
  // エレシア：まっすぐな銀髪ロング、横に流した前髪
  straight: {
    back(g) {
      g.ellipse(16, 13, 12, 10, 'h');
      g.rect(5, 13, 22, 19, 'h');
      g.rect(6, 20, 1, 12, 'd'); g.rect(25, 20, 1, 12, 'd');
    },
    front(g) {
      g.ellipse(16, 9, 10, 7, 'h');
      g.rect(7, 9, 18, 3, 'h');
      // 横に流した前髪（右から左へ）
      g.stamp(8, 12, ['hhhhhhhhhhhhh...', 'hhhhhhhhhh......', 'hhhhhhh.........', 'hhhh............', 'hh..............']);
      g.stamp(21, 12, ['hhhh', '.hhh', '..hh']);
      for (let y = 12; y < 32; y++) { g.rect(6, y, 2, 1, 'h'); g.rect(24, y, 2, 1, 'h'); }
      g.rect(7, 18, 1, 12, 'd'); g.rect(24, 18, 1, 12, 'd');
      // つや（天使の輪）
      g.rect(10, 6, 12, 1, 'H'); g.rect(9, 7, 2, 1, 'H'); g.rect(21, 7, 2, 1, 'H');
    },
  },
  // メイナ：赤いロング、ゆるいウェーブで 片目に少しかかる
  wavy: {
    back(g) {
      g.ellipse(16, 13, 13, 10, 'h');
      g.rect(3, 13, 26, 19, 'h');
      for (let y = 14; y < 32; y += 3) { g.put(3, y, 'd'); g.put(28, y + 1, 'd'); }
    },
    front(g) {
      g.ellipse(16, 9, 11, 7, 'h');
      g.rect(6, 9, 20, 3, 'h');
      // 前髪：まんなか分けで おでこが見える（大人っぽく）
      for (let y = 6; y <= 15; y++) {
        const half = Math.min(6, y - 6);
        for (let x = 16 - half; x <= 15 + half; x++) if (g.get(x, y) === 'h') g.put(x, y, 's');
      }
      g.stamp(7, 12, ['hhhhh', 'hhhh.', 'hhh..', 'hh...', 'h....']);
      g.stamp(20, 12, ['hhhhh', '.hhhh', '..hhh', '...hh', '....h']);
      g.stamp(10, 6, ['.....hh', '....hh.', '...hh..']);
      for (let y = 12; y < 32; y++) {
        const wob = Math.round(Math.sin(y / 2.2));
        g.rect(4 + wob, y, 3, 1, 'h'); g.rect(25 + wob, y, 3, 1, 'h');
      }
      g.rect(5, 20, 1, 10, 'd'); g.rect(26, 20, 1, 10, 'd');
      g.rect(10, 5, 5, 1, 'H'); g.rect(18, 5, 4, 1, 'H'); g.rect(8, 7, 2, 1, 'H');
    },
  },
};

// かざり
const ACCS = {
  bigRibbon(g) {
    // 頭の右うえに、大きな リボン
    g.stamp(16, 0, [
      '.rr.......rr..',
      'rRRr.....rRRr.',
      'rRrrr...rrrRr.',
      'rRrrrrRrrrrrRr',
      '.rrrrRRRrrrrr.',
      '..rrrrRrrrrr..',
      '...rr.rr.rr...',
      '....r..r..r...',
    ]);
  },
  starClip(g) { g.stamp(21, 9, ['.y.', 'yYy', '.y.']); },
  earring(g) { g.put(7, 20, 'y'); g.put(7, 21, 'Y'); g.put(24, 20, 'y'); g.put(24, 21, 'Y'); },
  mole(g) { g.put(20, 21, 'S'); },
};

const BASE = {
  s: '#ffd9b8', S: '#eab090', p: '#ffb0b0', P: '#ff7c8c',
  k: '#2b1d2e', w: '#ffffff', e: '#4a3050', E: '#8a6a9a',
  m: '#b04048', M: '#ff8a90', b: '#a8d8ff',
  h: '#6a4a3a', H: '#9a7058', d: '#4a3028',
  c: '#6fae7a', C: '#4a8058', a: '#fff6e6',
  r: '#e8466a', R: '#ff8fae', y: '#ffd860', Y: '#f0a020',
};

function render(g, pal) {
  const cv = document.createElement('canvas');
  cv.width = PW; cv.height = PH;
  const ctx = cv.getContext('2d');
  for (let y = 0; y < PH; y++) for (let x = 0; x < PW; x++) {
    const k = g.a[y][x];
    if (!k) continue;
    ctx.fillStyle = pal[k] || '#f0f';
    ctx.fillRect(x, y, 1, 1);
  }
  // 外がわの ふちどり
  const img = ctx.getImageData(0, 0, PW, PH).data;
  const solid = (x, y) => x >= 0 && y >= 0 && x < PW && y < PH && img[(y * PW + x) * 4 + 3] > 0;
  ctx.fillStyle = OUTLINE;
  for (let y = 0; y < PH; y++) for (let x = 0; x < PW; x++) {
    if (!solid(x, y) && (solid(x - 1, y) || solid(x + 1, y) || solid(x, y - 1) || solid(x, y + 1))) ctx.fillRect(x, y, 1, 1);
  }
  return cv;
}

// 前髪の下のふちに こい色の線（顔との さかいめ）
function hairEdge(g) {
  for (let x = 0; x < PW; x++) for (let y = 1; y < PH; y++) {
    if ((g.get(x, y - 1) === 'h' || g.get(x, y - 1) === 'H') && g.get(x, y) === 's') g.put(x, y - 1, 'd');
  }
}

// def: { hair, acc:[], collar, pal }
export function buildPortraits(def) {
  const pal = { ...BASE, ...def.pal };
  const hair = HAIRS[def.hair];
  const out = {};
  for (const ex of EXPRESSIONS) {
    const g = new Grid();
    hair.back(g);
    body(g, def);
    face(g);
    expression(g, ex, def);
    hair.front(g);
    hairEdge(g);
    for (const a of def.acc || []) ACCS[a](g);
    if (ex === 'sad') { g.put(12, 19, 'b'); g.put(12, 20, 'b'); }
    out[ex] = render(g, pal);
  }
  return out;
}

// 顔グラフィックを、にじまない大きさで 描く
export function paintPortrait(canvasEl, img, cssSize) {
  const dpr = window.devicePixelRatio || 1;
  const scale = Math.max(1, Math.round(cssSize * dpr / PW));
  canvasEl.width = PW * scale; canvasEl.height = PH * scale;
  canvasEl.style.width = (PW * scale / dpr) + 'px';
  canvasEl.style.height = (PH * scale / dpr) + 'px';
  const ctx = canvasEl.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
  if (img) ctx.drawImage(img, 0, 0, canvasEl.width, canvasEl.height);
}

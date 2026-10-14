// キャラクターのドット絵を、部品（頭・髪・体・足・かざり）の組み合わせで作る。
// 1マスの文字が1ドット。'.' は透明。外側のふちどりは自動でつける。

export const SW = 16, SH = 24;
const OUTLINE = '#2b1d2e';

const HEAD = {
  down: [
    [4, '.....ssssss.....'],
    [5, '....ssssssss....'],
    [6, '...ssssssssss...'],
    [7, '...ssssssssss...'],
    [8, '...ssssssssss...'],
    [9, '...ssessssess...'],
    [10, '...ssessssess...'],
    [11, '...spssssssps...'],
    [12, '....sssmmsss....'],
    [13, '.....ssssss.....'],
  ],
  up: [
    [4, '.....ssssss.....'],
    [5, '....ssssssss....'],
    [6, '...ssssssssss...'],
    [7, '...ssssssssss...'],
    [8, '...ssssssssss...'],
    [9, '...ssssssssss...'],
    [10, '...ssssssssss...'],
    [11, '...ssssssssss...'],
    [12, '....ssssssss....'],
    [13, '.....ssssss.....'],
  ],
  right: [
    [4, '.....ssssss.....'],
    [5, '....ssssssss....'],
    [6, '...ssssssssss...'],
    [7, '...ssssssssss...'],
    [8, '...sssssssssss..'],
    [9, '...ssssssssess..'],
    [10, '...ssssssssess..'],
    [11, '...ssssssssps...'],
    [12, '....ssssssss....'],
    [13, '.....ssssss.....'],
  ],
};

const BODY = {
  down: [
    [14, '.....caaaac.....'],
    [15, '....cccccccc....'],
    [16, '...cCccccccCc...'],
    [17, '...sccccccccs...'],
    [18, '....cccccccc....'],
    [19, '...cccccccccc...'],
    [20, '...CCCCCCCCCC...'],
  ],
  up: [
    [14, '.....cccccc.....'],
    [15, '....cccccccc....'],
    [16, '...cCccccccCc...'],
    [17, '...sccccccccs...'],
    [18, '....cccccccc....'],
    [19, '...cccccccccc...'],
    [20, '...CCCCCCCCCC...'],
  ],
  right: [
    [14, '......cccc......'],
    [15, '.....cccccc.....'],
    [16, '.....cccCcc.....'],
    [17, '.....cccscc.....'],
    [18, '.....cccccc.....'],
    [19, '....cccccccc....'],
    [20, '....CCCCCCCC....'],
  ],
};

// 足：0=立ち 1=右足 2=左足
const LEGS = {
  down: [
    [[21, '.....ll..ll.....'], [22, '.....ff..ff.....']],
    [[21, '.....ll..ff.....'], [22, '.....ff.........']],
    [[21, '.....ff..ll.....'], [22, '..........ff....']],
  ],
  right: [
    [[21, '......lll.......'], [22, '......ffff......']],
    [[21, '.....ll..ll.....'], [22, '....ff....ff....']],
    [[21, '......lll.......'], [22, '.......fff......']],
  ],
};
LEGS.up = LEGS.down;

// 髪型。back＝体のうしろ、front＝顔の上に描く
const HAIR = {
  // ふわふわロング（シメール）
  long: {
    down: {
      back: [
        [4, '....hhhhhhhh....'],
        [5, '...hhhhhhhhhh...'],
        [6, '..hhhhhhhhhhhh..'],
        ...range(7, 17).map(r => [r, '.hhhhhhhhhhhhhh.']),
        [18, '.hhhh......hhhh.'],
        [19, '.hdh........hdh.'],
        [20, '..d..........d..'],
      ],
      front: [
        [2, '.....hhhhhh.....'],
        [3, '....hHHhhhhh....'],
        [4, '...hHhhhhhhhh...'],
        [5, '..hhhhhhhhhhhh..'],
        [6, '..hhhhhhhhhhhh..'],
        [7, '..hhhhhhhhhhhh..'],
        [8, '..hhh.hhhh.hhh..'],
        [9, '..hh........hh..'],
        [10, '..hh........hh..'],
        [11, '..hh........hh..'],
        [12, '.hh..........hh.'],
        [13, '.hh..........hh.'],
        [14, '.hh..........hh.'],
        [15, '.hh..........hh.'],
        [16, '.hH..........Hh.'],
        [17, '.hh..........hh.'],
        [18, '.hd..........dh.'],
      ],
    },
    up: {
      back: [],
      front: [
        [2, '.....hhhhhh.....'],
        [3, '....hHHhhhhh....'],
        [4, '...hHhhhhhhhh...'],
        [5, '..hhhhhhhhhhhh..'],
        ...range(6, 15).map(r => [r, '.hhhhhhhhhhhhhh.']),
        [15, '.hhhhhhhhhhhhhh.'],
        [16, '..hhhhhhhhhhhh..'],
        [17, '..hdhhhdhhhdhh..'],
        [18, '...d...d...d....'],
      ],
    },
    right: {
      back: [
        ...range(9, 18).map(r => [r, '.hhhhhh.........']),
        [18, '.hhhhh..........'],
        [19, '.hdhd...........'],
        [20, '..d.............'],
      ],
      front: [
        [2, '.....hhhhhh.....'],
        [3, '....hHHhhhhh....'],
        [4, '...hHhhhhhhhh...'],
        [5, '..hhhhhhhhhhhh..'],
        [6, '..hhhhhhhhhhhh..'],
        [7, '..hhhhhhhhhhhh..'],
        [8, '..hhhhhhhhh.hh..'],
        [9, '..hhhhhh........'],
        [10, '..hhhhhh........'],
        [11, '..hhhhh.........'],
        [12, '..hhhh..........'],
        [13, '..hhh...........'],
      ],
    },
  },
  // おだんご
  bun: {
    down: {
      back: [],
      front: [
        [0, '......hhhh......'],
        [1, '.....hHhhhh.....'],
        [2, '......hhhh......'],
        [3, '....hhhhhhhh....'],
        [4, '...hHhhhhhhhh...'],
        [5, '..hhhhhhhhhhhh..'],
        [6, '..hhhhhhhhhhhh..'],
        [7, '..hhhhhhhhhhhh..'],
        [8, '..hhh......hhh..'],
        [9, '..hh........hh..'],
        [10, '..h..........h..'],
      ],
    },
    up: {
      back: [],
      front: [
        [0, '......hhhh......'],
        [1, '.....hHhhhh.....'],
        [2, '......hhhh......'],
        [3, '....hhhhhhhh....'],
        [4, '...hHhhhhhhhh...'],
        ...range(5, 12).map(r => [r, '..hhhhhhhhhhhh..']),
        [12, '...hhhhhhhhhh...'],
        [13, '....hhhhhhhh....'],
      ],
    },
    right: {
      back: [],
      front: [
        [1, '..hhh...........'],
        [2, '.hHhhh..........'],
        [3, '.hhhhhhhhhhh....'],
        [4, '..hhhhhhhhhhh...'],
        [5, '..hhhhhhhhhhhh..'],
        [6, '..hhhhhhhhhhhh..'],
        [7, '..hhhhhhhhhhhh..'],
        [8, '..hhhhhhh.......'],
        [9, '..hhhhhh........'],
        [10, '..hhhhh.........'],
        [11, '...hhh..........'],
      ],
    },
  },
  // おかっぱ
  bob: {
    down: {
      back: [],
      front: [
        [2, '.....hhhhhh.....'],
        [3, '....hHHhhhhh....'],
        [4, '...hHhhhhhhhh...'],
        [5, '..hhhhhhhhhhhh..'],
        [6, '..hhhhhhhhhhhh..'],
        [7, '..hhhhhhhhhhhh..'],
        [8, '..hhhhhhhhhhhh..'],
        [9, '..hh........hh..'],
        [10, '..hh........hh..'],
        [11, '..hh........hh..'],
        [12, '..hd........dh..'],
      ],
    },
    up: {
      back: [],
      front: [
        [2, '.....hhhhhh.....'],
        [3, '....hHHhhhhh....'],
        [4, '...hHhhhhhhhh...'],
        ...range(5, 12).map(r => [r, '..hhhhhhhhhhhh..']),
        [12, '..hdhhhhhhhhdh..'],
      ],
    },
    right: {
      back: [],
      front: [
        [2, '.....hhhhhh.....'],
        [3, '....hHHhhhhh....'],
        [4, '...hHhhhhhhhh...'],
        [5, '..hhhhhhhhhhhh..'],
        [6, '..hhhhhhhhhhhh..'],
        [7, '..hhhhhhhhhhhh..'],
        [8, '..hhhhhhhhhhhh..'],
        [9, '..hhhhhh........'],
        [10, '..hhhhhh........'],
        [11, '..hhhhhh........'],
        [12, '..hdhhhd........'],
      ],
    },
  },
};

// おだんご ふたつ（サクラ。さくらもちみたいに まるい）
HAIR.twinbun = {
  down: { back: [], front: [
    [0, '..hhh....hhh....'.slice(0, 16)], [1, '.hHhhh..hhHhh...'], [2, '.hhhhhhhhhhhhh..'],
    [3, '..hhhhhhhhhhhh..'], [4, '..hHhhhhhhhhhh..'], [5, '..hhhhhhhhhhhh..'], [6, '..hhhhhhhhhhhh..'],
    [7, '..hhhhhhhhhhhh..'], [8, '..hhh.hhhh.hhh..'], [9, '..hh........hh..'], [10, '..hh........hh..'],
    [11, '..hd........dh..'],
  ] },
  up: { back: [], front: [
    [0, '..hhh....hhh....'], [1, '.hhhhh..hhhhh...'], [2, '.hhhhhhhhhhhhh..'],
    [3, '..hhhhhhhhhhhh..'], ...range(4, 12).map(r => [r, '..hhhhhhhhhhhh..']), [12, '..hdhhhhhhhhdh..'],
  ] },
  right: { back: [], front: [
    [0, '.hhh............'], [1, 'hhHhh...........'], [2, 'hhhhhhhhhhh.....'],
    [3, '..hhhhhhhhhhh...'], [4, '..hhhhhhhhhhhh..'], [5, '..hhhhhhhhhhhh..'], [6, '..hhhhhhhhhhhh..'],
    [7, '..hhhhhhhhhhhh..'], [8, '..hhhhhhhhh.hh..'], [9, '..hhhhhh........'], [10, '..hhhhhh........'],
    [11, '..hdhhhd........'],
  ] },
};

// 顔の 見えない フード
const HOOD_FULL = r => [r, '..hhhhhhhhhhhh..'];
HAIR.hood = {
  down: { back: [], front: [
    [1, '.....hhhhhh.....'], [2, '....hHhhhhhh....'], [3, '...hHhhhhhhhh...'],
    ...range(4, 8).map(HOOD_FULL),
    [8, '..hhhddddddhhh..'], [9, '..hhddddddddhh..'], [10, '..hhddddddddhh..'], [11, '..hhddddddddhh..'], [12, '..hhhddddddhhh..'],
    [13, '..hhhhhhhhhhhh..'], [14, '...hhhhhhhhhh...'],
  ] },
  up: { back: [], front: [
    [1, '.....hhhhhh.....'], [2, '....hhhhhhhh....'], [3, '...hhhhhhhhhh...'],
    ...range(4, 14).map(HOOD_FULL), [14, '...hhhhhhhhhh...'],
  ] },
  right: { back: [], front: [
    [1, '.....hhhhhh.....'], [2, '....hhhhhhHh....'], [3, '...hhhhhhhhHh...'],
    ...range(4, 8).map(HOOD_FULL),
    [8, '..hhhhhhhddhhh..'], [9, '..hhhhhhddddhh..'], [10, '..hhhhhhddddhh..'], [11, '..hhhhhhddddhh..'], [12, '..hhhhhhhddhhh..'],
    [13, '..hhhhhhhhhhhh..'], [14, '...hhhhhhhhhh...'],
  ] },
};

// かざり
const ACC = {
  bigRibbon: {
    down: [
      [0, '...rr......rr...'],
      [1, '...rRrr..rrRr...'],
      [2, '....rrrRRrrr....'],
      [3, '...rr......rr...'],
    ],
    up: [
      [0, '...rr......rr...'],
      [1, '...rRrr..rrRr...'],
      [2, '....rrrRRrrr....'],
      [3, '...rr..rr..rr...'],
      [4, '.......rr.......'],
    ],
    right: [
      [0, '.rr.............'],
      [1, '.rRrr.rr........'],
      [2, '..rrRRrr........'],
      [3, '.rRrr.rr........'],
      [4, '.rr.............'],
    ],
  },
  // さくらの 葉っぱの 髪かざり
  leaf: {
    down: [[1, '.......gG.......'], [2, '......gg........']],
    up: [[1, '.......gG.......']],
    right: [[1, '....gG..........'], [2, '...gg...........']],
  },
  // 背中で むすんだ リボン（エレシア：シメールの リボンを かりている）
  backRibbon: {
    down: [[17, '..r..........r..']],
    up: [[15, '.....rr..rr.....'], [16, '.....rRrrRr.....'], [17, '......rrrr......'], [18, '.....r....r.....']],
    right: [[15, '..rr............'], [16, '.rRr............'], [17, '..rr............'], [18, '..r.............']],
  },
  apron: {
    down: [
      [15, '.....aaaaaa.....'],
      [16, '.....aaaaaa.....'],
      [17, '.....aaaaaa.....'],
      [18, '.....aaaaaa.....'],
      [19, '.....AAAAAA.....'],
    ],
    up: [[15, '....a......a....']],
    right: [
      [16, '.........aa.....'],
      [17, '.........aa.....'],
      [18, '.........aa.....'],
      [19, '.........aaa....'],
    ],
  },
  bag: {
    down: [[17, '..b.............'], [18, '..bb............'], [19, '..bb............']],
    up: [[17, '.............b..'], [18, '............bb..'], [19, '............bb..']],
    right: [[16, '....bb..........'], [17, '...bbb..........'], [18, '...bBb..........'], [19, '....b...........']],
  },
};

function range(a, b) { const r = []; for (let i = a; i < b; i++) r.push(i); return r; }

const BASE_PAL = {
  s: '#ffd9b8', p: '#ffa4a4', e: '#3b2a40', m: '#c4544c',
  l: '#ffd9b8', f: '#6a3a2a',
  h: '#6a4a3a', H: '#9a7058', d: '#4a3028',
  c: '#7a8ab0', C: '#5a6890', a: '#fff6e6', A: '#d8ccb4',
  r: '#e8466a', R: '#ff8aa6', b: '#8a5a30', B: '#b07a40', g: '#5aa04a', G: '#8ad070',
};

function paint(ctx, rows, pal) {
  for (const [y, line] of rows) {
    for (let x = 0; x < line.length; x++) {
      const ch = line[x];
      if (ch === '.') continue;
      ctx.fillStyle = pal[ch] || '#f0f';
      ctx.fillRect(x, y, 1, 1);
    }
  }
}

function outline(cv) {
  const ctx = cv.getContext('2d');
  const { width: w, height: h } = cv;
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  const solid = (x, y) => x >= 0 && y >= 0 && x < w && y < h && d[(y * w + x) * 4 + 3] > 0;
  const mark = [];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (solid(x, y)) continue;
    if (solid(x - 1, y) || solid(x + 1, y) || solid(x, y - 1) || solid(x, y + 1)) mark.push([x, y]);
  }
  ctx.fillStyle = OUTLINE;
  for (const [x, y] of mark) ctx.fillRect(x, y, 1, 1);
}

function mirror(cv) {
  const out = document.createElement('canvas');
  out.width = cv.width; out.height = cv.height;
  const ctx = out.getContext('2d');
  ctx.translate(cv.width, 0); ctx.scale(-1, 1);
  ctx.drawImage(cv, 0, 0);
  return out;
}

// def: { hair: 'long', acc: ['bigRibbon'], pal: {...} }
// 戻り値: frames[dir][step] (dir = down/up/left/right, step = 0..3 の歩きサイクル)
export function buildCharacter(def) {
  const pal = { ...BASE_PAL, ...def.pal };
  const hair = HAIR[def.hair || 'bob'];
  const acc = (def.acc || []).map(n => ACC[n]);
  const frames = {};
  for (const dir of ['down', 'up', 'right']) {
    const legsSet = LEGS[dir];
    const cycle = [0, 1, 0, 2];
    frames[dir] = cycle.map(step => {
      const cv = document.createElement('canvas');
      cv.width = SW; cv.height = SH;
      const ctx = cv.getContext('2d');
      paint(ctx, hair[dir].back, pal);
      paint(ctx, legsSet[step], pal);
      paint(ctx, BODY[dir], pal);
      if (dir !== 'up') {
        for (const a of acc) if (a !== ACC.bigRibbon && a !== ACC.leaf) paint(ctx, a[dir] || [], pal);
      }
      paint(ctx, HEAD[dir], pal);
      paint(ctx, hair[dir].front, pal);
      if (dir === 'up') for (const a of acc) if (a !== ACC.bigRibbon && a !== ACC.leaf) paint(ctx, a[dir] || [], pal);
      if (acc.includes(ACC.bigRibbon)) paint(ctx, ACC.bigRibbon[dir], pal);
      if (acc.includes(ACC.leaf)) paint(ctx, ACC.leaf[dir], pal);
      outline(cv);
      return cv;
    });
  }
  frames.left = frames.right.map(mirror);
  return frames;
}

// 妖怪（小さな ひとつめ）
const HITOTSUME = [
  [
    '....kkkk....',
    '..kkvvvvkk..',
    '.kvvVVvvvvk.',
    '.kvvwwwwvvk.',
    'kvvwwwewwvvk',
    'kvvwwwewwvvk',
    'kvvvwwwwvvvk',
    'kvvvvvvvvvvk',
    'kvvvvvvvvvvk',
    '.kvvvvvvvvk.',
    '.kv.kvvk.vk.',
    '..k..kk..k..',
  ],
  [
    '....kkkk....',
    '..kkvvvvkk..',
    '.kvvVVvvvvk.',
    '.kvvwwwwvvk.',
    'kvvwwwewwvvk',
    'kvvwwwewwvvk',
    'kvvvwwwwvvvk',
    'kvvvvvvvvvvk',
    'kvvvvvvvvvvk',
    '.kvvvvvvvvk.',
    '..kvkvvkvk..',
    '...k.kk.k...',
  ],
];

export function buildYokai(pal) {
  const p = { k: '#3a2058', v: '#c9a8f2', V: '#efe2ff', w: '#ffffff', e: '#2a1840', ...pal };
  return HITOTSUME.map(rows => {
    const cv = document.createElement('canvas');
    cv.width = 12; cv.height = 12;
    paint(cv.getContext('2d'), rows.map((l, i) => [i, l]), p);
    return cv;
  });
}

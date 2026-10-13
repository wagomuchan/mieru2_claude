// 戦う妖怪たちの ドット絵
// 黒いシンボル（dark）は、色を こく して 目を赤くする。

const OUTLINE = '#22142e';

const LOOKS = {
  // ひそひそ ささやく 火の玉
  hisohiso: {
    pal: { v: '#8fd8d0', V: '#d8fff8', D: '#4a9a9a', w: '#ffffff', e: '#1a2a3a', m: '#3a2a4a' },
    rows: [
      '.......V........',
      '......VV........',
      '.....vVv...v....',
      '....vvvv..vv....',
      '...vvvvvvvvv....',
      '..vvvvvvvvvvv...',
      '..vvwwvvvwwvv...',
      '.vvvwevvvwevvv..',
      '.vvvwevvvwevvv..',
      '.vvvvvvvvvvvvv..',
      '.vvvvvvmmvvvvv..',
      '.vvvvvvmmvvvvv..',
      '..vvvvvvvvvvv...',
      '..DvvvvvvvvvD...',
      '...DDvvvvvDD....',
      '.....DDDDD......',
    ],
  },
  // ほらを ふく まき貝
  horagai: {
    pal: { s: '#f4dcb0', S: '#d8a870', T: '#b8784a', p: '#ffb0a0', w: '#ffffff', e: '#2a1a1a', m: '#a04040' },
    rows: [
      '.........sss..........',
      '.......ssSSss.........',
      '......sSTTTSss........',
      '.....sSTsssTSss.......',
      '....sSTsSSSsTSss......',
      '...ssSTsSTTsTSsss.....',
      '...sSSTsSTsSTSSsss....',
      '..ssSSTTsssTTSSssss...',
      '..sSSSSTTTTTSSSsssssp.',
      '.ssSwwSSSSSSwwSsssppp.',
      '.sSSweSSSSSSweSssspmp.',
      '.sSSweSSSSSSweSssspmp.',
      '.sSSSSSSSSSSSSSssssppp',
      '..sSSSSSmmmSSSSsssss..',
      '..ssSSSSSSSSSSSssss...',
      '...sssSSSSSSSSsss.....',
      '.....sssssssss........',
    ],
  },
  // からかさ おばけ
  karakasa: {
    pal: { r: '#d84a4a', R: '#f07a6a', y: '#f4d890', Y: '#c8a860', w: '#ffffff', e: '#2a1a1a', t: '#ff7a9a', b: '#8a5a32', f: '#f4c8a0' },
    rows: [
      '.........b..........',
      '........rrr.........',
      '......rrRrrrr.......',
      '.....rRRrryrrr......',
      '....rRrrryyrrrr.....',
      '...rrrrryyyyrrrr....',
      '..rrrrrryyyyyrrrr...',
      '..rrwwwrryyyyrrrr...',
      '.rrrweewryyyyyrrrr..',
      '.rrrweewrryyyyrrrr..',
      '.rrrrwwrrryyyyrrrrr.',
      'rrrrrrrrrrryyyyrrrrr',
      'rrrrrrtttrrryyyrrrrr',
      'YrYrrrtttrrrYyrrYrrY',
      '.Y.YYYrtYYYYY.YY.YY.',
      '.......t..b.........',
      '..........b.........',
      '..........b.........',
      '..........b.........',
      '.........fbf........',
      '.........fff........',
      '........ff.ff.......',
    ],
  },
  // かたほうだけ 大きな ハサミの カニ
  shiomaneki: {
    pal: { o: '#e86a3a', O: '#ff9a6a', D: '#a84020', w: '#ffffff', e: '#1a1a2a', y: '#ffe0a0' },
    rows: [
      'OOOO......................',
      'ooooO.....................',
      'oooooo.......w..w.........',
      '.ooooOo......e..e.........',
      '....oooo.....D..D.........',
      'ooo..ooo.....D..D.....o...',
      'oooooooo..ooooooooo..ooo..',
      '.oooooo..oooOOOoooooo.oo..',
      '...ooo..ooOOooooooooooo...',
      '....oooooooooooooooooooo..',
      '......oooooyyyyyyyooooo...',
      '.......ooooyyyyyyyoooo....',
      '........oooooooooooo......',
      '.......D.D.D....D.D.D.....',
      '......D..D..D..D..D..D....',
      '.....D...D...DD...D...D...',
    ],
  },
  // 海から あらわれる 大きな ぼうず
  umibozu: {
    pal: { n: '#3a4a8a', N: '#5a72c0', D: '#26306a', w: '#ffffff', e: '#101830', b: '#4a8ad8', B: '#a8d4ff' },
    rows: [
      '...........nnnnnnn...........',
      '........nnnNNNnnnnnn.........',
      '......nnnNNnnnnnnnnnnn.......',
      '.....nnNNnnnnnnnnnnnnnn......',
      '....nnNnnnnnnnnnnnnnnnnn.....',
      '...nnnnnnnnnnnnnnnnnnnnnn....',
      '...nnnnnwwwwnnnnnwwwwnnnn....',
      '..nnnnnwwwwwwnnnwwwwwwnnnn...',
      '..nnnnnwwweewnnnwweewwnnnn...',
      '..nnnnnwwweewnnnwweewwnnnn...',
      '..nnnnnnwwwwnnnnnwwwwnnnnn...',
      '.nnnnnnnnnnnnnnnnnnnnnnnnnn..',
      '.nnnnnnnnnnnDDDDDnnnnnnnnnn..',
      '.nnnnnnnnnnDDDDDDDnnnnnnnnn..',
      '.nnnnnnnnnnnDDDDDnnnnnnnnnn..',
      'nnnnnnnnnnnnnnnnnnnnnnnnnnnn.',
      'nnnnnnnnnnnnnnnnnnnnnnnnnnnn.',
      'bnnnnnnnnnnnnnnnnnnnnnnnnnnb.',
      'bbBnnnnnnnnnnnnnnnnnnnnnnBbb.',
      'bbbbBBbbnnnnnnnnnnnnbbBBbbbbb',
      '.bbbbbbbbBBbbbbbbBBbbbbbbbbb.',
      '...bbbbbbbbbbbbbbbbbbbbbbb...',
    ],
  },
};

function darken(hex, k) {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const f = v => Math.round(v * k).toString(16).padStart(2, '0');
  return '#' + f(r) + f(g) + f(b);
}

const cache = {};

// 戻り値: canvas（ふちどり つき）
export function enemyImage(look, dark) {
  const key = look + (dark ? ':d' : '');
  if (cache[key]) return cache[key];
  const L = LOOKS[look];
  const pal = { ...L.pal };
  if (dark) {
    for (const k in pal) pal[k] = k === 'w' ? '#ff4a4a' : k === 'e' ? '#ffe060' : darken(pal[k], 0.38);
  }
  const h = L.rows.length, w = Math.max(...L.rows.map(r => r.length));
  const cv = document.createElement('canvas');
  cv.width = w + 2; cv.height = h + 2;
  const ctx = cv.getContext('2d');
  L.rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const c = row[x];
      if (c === '.') continue;
      ctx.fillStyle = pal[c] || '#f0f';
      ctx.fillRect(x + 1, y + 1, 1, 1);
    }
  });
  const d = ctx.getImageData(0, 0, cv.width, cv.height).data;
  const solid = (x, y) => x >= 0 && y >= 0 && x < cv.width && y < cv.height && d[(y * cv.width + x) * 4 + 3] > 0;
  ctx.fillStyle = dark ? '#ff3a5a' : OUTLINE;
  for (let y = 0; y < cv.height; y++) for (let x = 0; x < cv.width; x++) {
    if (!solid(x, y) && (solid(x - 1, y) || solid(x + 1, y) || solid(x, y - 1) || solid(x, y + 1))) ctx.fillRect(x, y, 1, 1);
  }
  cache[key] = cv;
  return cv;
}

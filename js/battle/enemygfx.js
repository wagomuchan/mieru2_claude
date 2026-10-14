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
  // ひかる クラゲ
  kurage: {
    pal: { g: '#a8f0ff', G: '#ffffff', D: '#5ab0d8', w: '#ffffff', e: '#1a2a4a', y: '#ffff90', p: '#ff9ad0' },
    rows: [
      '.....gggggg.....',
      '...ggGGggggg....',
      '..gGGgggggyggg..',
      '.ggGgggggggyggg.',
      '.ggggwwgggwwggg.',
      'gggggweggggweggg',
      'gggggweggggweggg',
      'ggggggggppggggg.',
      '.DgDgDgDgDgDgDg.',
      '..g.D.g..g.D.g..',
      '..g..g..D..g.D..',
      '.D...g..g...g...',
      '..g..D...g..D...',
      '...g..g..D...g..',
      '..D...g...g..g..',
    ],
  },
  // ボス：うそを たべる 大きな鳥
  usokuidori: {
    pal: { b: '#4a3a6a', B: '#6a5a9a', D: '#2a1e44', y: '#ffd040', Y: '#f09020', w: '#ffffff', e: '#1a0a0a', r: '#d84a5a', R: '#ff8a9a', g: '#a0e8ff' },
    rows: [
      '..............bbb.......................',
      '............bbBBbb......................',
      '..........bbBBbbbbb.....bb..............',
      '.........bbBbbbbbbbb...bBb..............',
      '........bbBbbbbbbbbbbbbBb...............',
      '.......bbbbbbbwwwwbbbbbb................',
      '......bbbbbbbwwwwwwbbbbbb...............',
      '......bbbbbbwwyyyyywbbbbbb..............',
      '.....bbbbbbbwyyeeyywbbbbbbb.............',
      '.....bbbbbbbwyyeeyywbbbbbbbYYYY.........',
      '.....bbbbbbbbwyyyywbbbbbbYYYYYYYYY......',
      '....bbbbbbbbbbwwwwbbbbbYYYYYYYYYYYYY....',
      '....bbbbbbbbbbbbbbbbbbYYYrrrrrrrrrYYY...',
      '...bbbbbbbbbbbbbbbbbbbYYRRrrrrrRRrYY....',
      '...bbbBBbbbbbbbbbbbbbbbYYYYYYYYYYYY.....',
      '..bbbBBBBbbbbbbbbbbbbbbbbYYYYYYYY.......',
      '..bbBBgBBBbbbbbbbbbbbbbbbbb.............',
      '.bbBBBBBBBBbbbbbbbbbbbbbbbbb............',
      '.bbBBBgBBBBbbbbbbbbbbbbbbbbbb...........',
      'bbBBBBBBBBBBbbbbbbbbbbbbbbbbbb..........',
      'bbBBgBBBBBBbbbbbbbbbbbbbbbbbbbb.........',
      'bbBBBBBBBBbbbbbbbbbbbbbbbbbbbbbb........',
      '.bBBBBBBBbbbbDDDbbbbbbbbbbbbbbbbb.......',
      '.bbBBBBBbbbbDDDDDDbbbbbbbbbbbbbbbbb.....',
      '..bbBBBbbbbDDDDDDDDbbbbbbbbbbbbbbbbbb...',
      '...bbbbbbbDDDDDDDDDDbbbbbbbbbbbbbbbbbbb.',
      '....bbbbbDDDDDDDDDDDDbbbbbbbbbbbbbbbbbbb',
      '.....bbbbbDDDDDDDDDDbbbbbbbbbbbb..bbbbbb',
      '.......bbbbbbbbbbbbbbbbbbbbb.......bbbb.',
      '..........bbbbbbbbbbbbbbb...............',
      '...........YY.......YY..................',
      '...........YY.......YY..................',
      '..........YYYY.....YYYY.................',
      '.........Y.Y.Y....Y.Y.Y.................',
    ],
  },
  // ── 第二章 ──
  // カカシボウ（かぼちゃ頭の かかし）
  kakashi: {
    pal: { o: '#f08a2a', O: '#ffb060', D: '#b85a1a', g: '#4a7a2a', w: '#ffe080', e: '#2a1a0a', b: '#7a5a3a', c: '#8a4a3a', h: '#c8a040' },
    rows: [
      '......g.........',
      '.....gg.........',
      '...oooooooo.....',
      '..oOooOoooOo....',
      '.oOoooooooooo...',
      '.ooweoooooweo...',
      '.oowwooooowwo...',
      '.ooooooooooooo..',
      '.ooeeoeeoeeooo..',
      '..oDoeoeeoeoD...',
      '...oooooooooo...',
      '.....ccccc......',
      'bbbbccccccccbbbb',
      'h..cccbccccc..h.',
      '....ccbcccc.....',
      '....cc...cc.....',
      '......b.........',
      '......b.........',
      '......b.........',
    ],
  },
  // モロコシボウズ（とうもろこし）
  morokoshi: {
    pal: { y: '#f0d050', Y: '#fff090', D: '#c8a030', g: '#5aa03a', G: '#8ad060', w: '#ffffff', e: '#2a1a0a', m: '#a04040' },
    rows: [
      '.....hh.....',
      '....yyyy....',
      '...yYyyyy...',
      '..yyyYyyyy..',
      '..ywwyywwy..',
      '..yweyywey..',
      '..yyyyyyyy..',
      'g.yyymmyyy.g',
      'gg.yyyyyy.gg',
      'Ggg.yyyy.ggG',
      '.Gggyyyyggg.',
      '..GgDyyDgG..',
      '...ggDDgg...',
      '....gggg....',
    ].map(r => r.replace(/h/g, 'D')),
  },
  // コロコロクサ（ころがる 草の かたまり）
  korokoro: {
    pal: { b: '#b89a60', B: '#e0c890', D: '#7a6030', w: '#ffffff', e: '#1a1a0a' },
    rows: [
      '....bDbbDb....',
      '..bDbbBbDbbD..',
      '.bbD.bbBb.bDb.',
      'bDbbwwbbbwwbbD',
      'bb.bwebbbweb.b',
      'Dbbbbbb.bbbbbD',
      'bb.bbDbbbDbbbb',
      'bDbbbb.bbbbDbb',
      '.bbDbbbbbb.bD.',
      '..bbbDbbDbbb..',
      '....bbDbbb....',
    ],
  },
  // ボタンダマ（ボタンの 妖怪。4つの 穴が 目と口）
  botandama: {
    pal: { r: '#e8466a', R: '#ff8fae', D: '#a82a48', k: '#2a1018', w: '#ffffff' },
    rows: [
      '....rrrrrr....',
      '..rrRRrrrrrr..',
      '.rRRrrrrrrrrr.',
      '.rRrDDDDDDrrr.',
      'rrrDrrrrrrDrrr',
      'rrDrkkrrkkrDrr',
      'rrDrkkrrkkrDrr',
      'rrDrrrrrrrrDrr',
      'rrDrkkrrkkrDrr',
      'rrrDrkkkkrDrrr',
      '.rrrDDDDDDrrr.',
      '.rrrrrrrrrrrr.',
      '..rrrrrrrrrr..',
      '....rrrrrr....',
    ],
  },
  // チョキン（はさみの 妖怪）
  chokin: {
    pal: { s: '#c8d0dc', S: '#ffffff', D: '#7a8090', o: '#e8a040', O: '#ffc870', w: '#ffffff', e: '#1a1a2a' },
    rows: [
      'S...........S...',
      'sS.........Ss...',
      '.sS.......Ss....',
      '..sS.....Ss.....',
      '...sS...Ss......',
      '....sSwSs.......',
      '.....sesD.......',
      '.....DsD........',
      '....oD.Do.......',
      '...oOo.oOo......',
      '..oO..o..Oo.....',
      '..o...o...o.....',
      '..oO.oo..Oo.....',
      '...ooo...oo.....',
    ],
  },
  // イトマキ（糸まきの 妖怪）
  itomaki: {
    pal: { w: '#c8945a', W: '#e8b47a', D: '#8a5a2a', b: '#4a7ac8', B: '#7aaaf0', e: '#1a1a2a', x: '#ffffff' },
    rows: [
      '.wwwwwwwwwww....',
      'wWWWWWWWWWWWw...',
      '.DDDDDDDDDDD....',
      '..bBbBbBbBb.....',
      '..bxxbbbxxb.....',
      '..bxebbbxeb.....',
      '..bBbBbBbBb.....',
      '..bbbbBbbbb..b..',
      '..bBbBbBbBb.bb..',
      '..bbbbbbbbbbb...',
      '.DDDDDDDDDDD....',
      'wWWWWWWWWWWWw...',
      '.wwwwwwwwwww....',
    ],
  },
  // ボス：ボタン隠し（ボタンを つめた 大きな ふくろを かついだ いたずら妖怪）
  botankakushi: {
    pal: { f: '#8a6aa8', F: '#b090d0', D: '#5a3a7a', w: '#ffffff', e: '#1a0a2a', y: '#ffd040', p: '#ff8ab8', s: '#c8a070', S: '#e8c890', d: '#8a6a40',
      r: '#e8466a', g: '#5aa04a', b: '#4a7ac8', t: '#f4f0e8' },
    rows: [
      '...................ssssss.........',
      '................sssSSSSssss.......',
      '..............ssSSrSSgSSSsss......',
      '.............ssSySSSbSSrSSsss.....',
      '............ssSSSStSSySSgSSss.....',
      '............sSSrSSSSSSSSbSSSs.....',
      '...........ssSSSSgSSySSSSSSss.....',
      '....ff.....sSbSSSSSSSSSrSSSss.....',
      '...fFFf....ssSSySSrSSSSSSSss......',
      '..fFffFf....ssSSSSSSgSSSss........',
      '..ffffff.ff..ssssddddsssss........',
      '..fwwfwwfFf.....dd................',
      '..fwefwefff....dd.................',
      '..ffffffffff..dd..................',
      '..fpfffffpff.dd...................',
      '...ffyyyyfff.d....................',
      '...fffyyfffffd....................',
      '..fFfffffffFfd....................',
      '.fFffFFFFFFffF....................',
      '.ffffFFFFFFffff...................',
      'fff.ffFFFFffff.f..................',
      'ff..fffffffffff...................',
      '....ffff..ffff....................',
      '...fffff..fffff...................',
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

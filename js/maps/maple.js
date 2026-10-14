// 第二章：メイプルホロウ（アメリカの 田舎町）・とうもろこし畑の迷路・ボタン工場
import { game } from '../game.js';
import { PH2 } from '../story/phase.js';
import { rng } from '../util.js';
import { MAPLE_NPCS } from '../story/ch2_npcs.js';

const W = 48, H = 40;
const rows = s => s.trim().split('\n').map(r => r.trim());

export function buildMaple() {
  const P = game.phase;
  const g = Array.from({ length: H }, () => Array(W).fill('g'));
  const fill = (x, y, w, h, c) => {
    for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (j >= 0 && j < H && i >= 0 && i < W) g[j][i] = c;
  };
  fill(30, 0, 18, 10, 'C');        // とうもろこし畑
  fill(41, 5, 2, 5, 'd');          // 迷路の 入口への 道
  fill(0, 17, W, 3, 'a');          // 大通り
  fill(0, 18, W, 1, 'A');
  fill(6, 7, 1, 10, 'd');          // 納屋への 道
  fill(41, 10, 2, 7, 'd');
  fill(4, 20, 2, 15, 'd');         // 工場への 道
  fill(29, 20, 18, 18, 'z');       // 収穫祭の 会場
  fill(0, 37, W, 3, 'g');
  for (const [x, y] of [[2, 14], [18, 11], [27, 22], [14, 26], [9, 28], [24, 30], [16, 34], [2, 24], [46, 12], [36, 14]]) g[y][x] = 'f';

  const objects = [
    // 牧場
    { type: 'barn', x: 1, y: 3, w: 6, h: 4, talk: [['赤い 納屋。 ウシの なき声が きこえる。']] },
    { type: 'silo', x: 8, y: 5, w: 2, h: 2, talk: [['とうもろこしを ためておく サイロ。']] },
    { type: 'windmill', x: 12, y: 5, w: 1, h: 1 },
    { type: 'hay', x: 3, y: 9, w: 1, h: 1 }, { type: 'hay', x: 4, y: 10, w: 1, h: 1 }, { type: 'hay', x: 11, y: 9, w: 1, h: 1 },
    { type: 'fence', x: 0, y: 12, w: 6, h: 1 }, { type: 'fence', x: 7, y: 12, w: 8, h: 1 },
    { type: 'scarecrow', x: 14, y: 8, w: 1, h: 1, talk: [['かかし。 ふつうの かかしだ。', '……たぶん。']] },
    { type: 'watertower', x: 24, y: 2, w: 2, h: 2, talk: [['給水塔。 「MAPLE HOLLOW」と かいてある。']] },
    // 大通りの 北
    { type: 'diner', x: 7, y: 13, w: 6, h: 3, action: 'diner', talk: [['ダイナー 「ドリスの店」。']] },
    { type: 'gas', x: 15, y: 14, w: 5, h: 2, noButtons: P < PH2.FAIR && P >= PH2.ARRIVE, talk: [['ガソリンスタンド。 給油機の ボタンが ぜんぶ ない。']] },
    { type: 'house', x: 22, y: 13, w: 4, h: 3, door: 1, style: 'blue', roof: 'red', porch: true, talk: [['よろず屋。 「ボタン うりきれ」 の はり紙。', '……そもそも ボタンが この世から 消えているのだ。']] },
    { type: 'house', x: 27, y: 12, w: 4, h: 4, door: 2, style: 'plaster', roof: 'green', porch: true, chimney: 0, talk: [['保安官事務所。']] },
    { type: 'mailbox', x: 21, y: 16, w: 1, h: 1, talk: [['ゆうびんうけ。 なかに 手紙が 一通。', '「ボタン工場、 来月 とりこわし」']] },
    // 大通りの 南
    { type: 'house', x: 6, y: 21, w: 4, h: 3, door: 1, style: 'peach', roof: 'brown', porch: true, chimney: 3, talk: [['かぎが かかっている。', 'ポーチに ゆりいすが ゆれている。']] },
    { type: 'house', x: 12, y: 21, w: 4, h: 3, door: 2, style: 'blue', roof: 'blue', porch: true, talk: [['なかから ラジオの 雑音が きこえる。 ……ボタンが ないので 消せないらしい。']] },
    { type: 'lab', x: 19, y: 21, w: 5, h: 3, action: 'lab', talk: [['「サクラ魔術研究所」。 ドアに 「ノックしてね」 の はり紙。']] },
    { type: 'truck', x: 14, y: 26, w: 2, h: 1, talk: [['ピックアップトラック。 エンジンの ボタンが なくて 動かないらしい。']] },
    { type: 'mailbox', x: 9, y: 25, w: 1, h: 1 },
    // ボタン工場（西の はずれ）
    { type: 'factory', x: 0, y: 31, w: 9, h: 4, talk: P >= PH2.FACTORY ? [['古い ボタン工場。 とびらが すこし あいている。']] : [['古い ボタン工場。 くさりで とじられている。']] },
    { type: 'sign', x: 7, y: 36, w: 1, h: 1, talk: [['「メイプル ボタン工場」', '〜 おばあちゃんの ボタンは とれません 〜']] },
    // 迷路の 入口
    { type: 'sign', x: 43, y: 11, w: 1, h: 1, talk: [['「とうもろこし 迷路」', 'まよったら、 さけべ！']] },
    { type: 'scarecrow', x: 40, y: 11, w: 1, h: 1, talk: [['かかし。 なんだか こっちを 見ている 気がする。']] },
    // 収穫祭の 会場
    { type: 'ferris', x: 40, y: 22, w: 5, h: 2, action: P === PH2.FAIR ? 'walk2' : null, talk: P >= PH2.FAIR ? [['観覧車。 ゆっくり まわっている。']] : [['観覧車。 いまは 動いていない。', '「うんてんの ボタンが ない」 と はり紙が ある。']] },
    { type: 'stall', x: 31, y: 23, w: 3, h: 1, goods: 'pie' },
    { type: 'stall', x: 35, y: 23, w: 3, h: 1, goods: 'candy' },
    { type: 'stall', x: 31, y: 27, w: 3, h: 1, goods: 'corn' },
    { type: 'stage', x: 36, y: 27, w: 5, h: 2, action: P === PH2.FAIR ? 'contest' : null, talk: [['収穫祭の ぶたい。 一座の 公演も ここで やる。']] },
    { type: 'pumpkin', x: 29, y: 20, w: 1, h: 1 }, { type: 'pumpkin', x: 30, y: 21, w: 1, h: 1 }, { type: 'pumpkin', x: 46, y: 21, w: 1, h: 1 },
    { type: 'hay', x: 44, y: 27, w: 1, h: 1 }, { type: 'hay', x: 45, y: 28, w: 1, h: 1 },
    // 一座の キャンプ
    { type: 'tent', x: 40, y: 31, w: 5, h: 3, big: true, color: '#d84a5a', talk: [['一座の 大テント。']] },
    { type: 'tent', x: 31, y: 32, w: 3, h: 2, color: '#4a7ac8', action: 'rest', talk: [['一座の ねどこの テント。']] },
    { type: 'wagon', x: 35, y: 33, w: 3, h: 2, talk: [['一座の 馬車。']] },
    { type: 'lamp', x: 30, y: 25, w: 1, h: 1 }, { type: 'lamp', x: 45, y: 25, w: 1, h: 1 }, { type: 'lamp', x: 38, y: 30, w: 1, h: 1 },
  ];
  // 木
  for (const [x, y] of [[0, 1], [16, 2], [19, 3], [27, 6], [17, 9], [21, 8], [1, 15], [26, 23], [2, 27], [11, 30], [17, 31], [22, 33], [26, 36], [14, 37], [46, 36], [10, 37]]) {
    if (g[y][x] === 'g' || g[y][x] === 'f') objects.push({ type: 'tree', x, y, w: 1, h: 1, fruit: (x + y) % 4 === 0 });
  }

  const symbols = P >= PH2.MAZE && P < PH2.FAIR ? [
    { x: 4, y: 8, area: 'farm' }, { x: 10, y: 10, area: 'farm' }, { x: 15, y: 10, area: 'farm' },
    { x: 38, y: 13, area: 'farm' }, { x: 46, y: 14, area: 'farm' },
  ] : [];

  const warps = [];
  if (P >= PH2.MAZE && P < PH2.FAIR) warps.push({ x: 41, y: 5, w: 2, h: 1, to: 'maze', tx: 15.5, ty: 23, dir: 'up' });
  if (P >= PH2.FACTORY && P < PH2.FAIR) warps.push({ x: 4, y: 35, w: 2, h: 1, to: 'factory1', tx: 7.5, ty: 11, dir: 'up' });

  return {
    id: 'maple', name: 'メイプルホロウ', tint: P === PH2.FAIR ? 'night' : null,
    w: W, h: H, tiles: g.map(r => r.join('')),
    objects, npcs: MAPLE_NPCS(P).filter(Boolean), yokai: P >= PH2.FAIR ? [] : [
      { id: 'yk1', x: 24, y: 19, wander: 2, talk: [['？？？|ぷぅ？', 'ちいさな 妖怪が、 ボタンの とれた 給油機を ふしぎそうに 見ている。']] },
      { id: 'yk2', x: 10, y: 27, wander: 2, talk: [['？？？|ぷぅぷぅ。']] },
    ],
    symbols, warps,
    start: { x: 34, y: 36, dir: 'up' },
    triggers: [{ id: 'town', x: 0, y: 16, w: 28, h: 5 }],
  };
}

// とうもろこし畑の 迷路（決まった 種で 作る）
export function buildMaze() {
  const P = game.phase;
  const CW = 10, CH = 8, S = 3;
  const w = CW * S + 1, h = CH * S + 2;
  const g = Array.from({ length: h }, () => Array(w).fill('C'));
  const R = rng(9182);
  const seen = Array.from({ length: CH }, () => Array(CW).fill(false));
  const open = (cx, cy) => { for (let j = 0; j < 2; j++) for (let i = 0; i < 2; i++) g[cy * S + 1 + j][cx * S + 1 + i] = 'd'; };
  const stack = [[5, CH - 1]];
  seen[CH - 1][5] = true; open(5, CH - 1);
  while (stack.length) {
    const [cx, cy] = stack[stack.length - 1];
    const nb = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dx, dy]) => [cx + dx, cy + dy, dx, dy])
      .filter(([x, y]) => x >= 0 && y >= 0 && x < CW && y < CH && !seen[y][x]);
    if (!nb.length) { stack.pop(); continue; }
    const [nx, ny, dx, dy] = nb[Math.floor(R() * nb.length)];
    seen[ny][nx] = true; open(nx, ny);
    // あいだの かべを ぬく
    for (let k = 0; k < 2; k++) {
      if (dx) g[cy * S + 1 + k][(dx > 0 ? cx * S + 3 : cx * S)] = 'd';
      if (dy) g[(dy > 0 ? cy * S + 3 : cy * S)][cx * S + 1 + k] = 'd';
    }
    stack.push([nx, ny]);
  }
  // まんなかの ひろば
  for (let j = 9; j < 15; j++) for (let i = 12; i < 19; i++) g[j][i] = 'd';
  // ちょっとした ぬけみち（まよいすぎないように）
  for (const [x, y] of [[9, 12], [21, 12], [15, 8], [15, 15], [6, 18], [24, 6]]) g[y][x] = 'd';
  // 入口
  for (let j = CH * S; j < h; j++) { g[j][16] = 'd'; g[j][17] = 'd'; }

  const objects = [
    { type: 'scarecrow', x: 15, y: 10, w: 1, h: 1, talk: [['迷路の まんなかの かかし。', '首に 「ゴールは 入口です」 と かいた 札が かかっている。']] },
    { type: 'hay', x: 13, y: 13, w: 1, h: 1 }, { type: 'hay', x: 18, y: 10, w: 1, h: 1 },
  ];
  // 地面に 落ちている ボタン（ボタン隠しの 足あと）
  for (const [x, y] of [[16, 20], [10, 17], [22, 16], [16, 13], [4, 4], [26, 3]]) if (g[y][x] === 'd') objects.push({ type: 'bigbutton', x, y, w: 1, h: 1, color: ['#e8466a', '#f0c040', '#4a7ac8'][x % 3], talk: [['ボタンが ひとつ、 落ちている。', '……さわろうと すると、 すうっと 消えた。']] });

  const symbols = P >= PH2.MAZE && P < PH2.FAIR ? [
    { x: 4, y: 22, area: 'maze' }, { x: 25, y: 22, area: 'maze' }, { x: 7, y: 10, area: 'maze' },
    { x: 22, y: 4, area: 'maze' }, { x: 4, y: 2, area: 'maze_black' }, { x: 28, y: 13, area: 'maze_black' },
  ].filter(s2 => g[s2.y][s2.x] === 'd') : [];

  return {
    id: 'maze', name: 'とうもろこし畑の 迷路', bg: '#2a3a14',
    w, h, tiles: g.map(r => r.join('')),
    objects, npcs: [], yokai: [], symbols,
    start: { x: 16.5, y: h - 3, dir: 'up' },
    warps: [{ x: 16, y: h - 1, w: 2, h: 1, to: 'maple', tx: 41.5, ty: 7, dir: 'down' }],
    triggers: P === PH2.MAZE ? [{ id: 'mazeCenter', x: 12, y: 9, w: 7, h: 6 }] : [],
  };
}

export function buildFactory1() {
  return {
    id: 'factory1', name: 'ボタン工場 1かい', bg: '#0a0812', tint: 'dim',
    w: 18, h: 14,
    tiles: rows(`
      WWWWWWWWWWWWWWWWWW
      WWWWWWWWWWWWWWWWWW
      WFFFFFFFFFFFFFFFFW
      WFFFFFFFFFFFFFFFFW
      WFFFFFFFFFFFFFFFFW
      WFFFFFFFFFFFFFFFFW
      WFFFFFFFFFFFFFFFFW
      WFFFFFFFFFFFFFFFFW
      WFFFFFFFFFFFFFFFFW
      WFFFFFFFFFFFFFFFFW
      WFFFFFFFFFFFFFFFFW
      WFFFFFFFFFFFFFFFFW
      WFFFFFFFFFFFFFFFFW
      WWWWWWWFFWWWWWWWWW`),
    objects: [
      { type: 'conveyor', x: 2, y: 4, w: 7, h: 1, talk: [['ベルトコンベア。 ボタンを はこぶ ための ものらしい。', 'ボタンの かわりに、 ほこりが はこばれている。']] },
      { type: 'conveyor', x: 10, y: 8, w: 6, h: 1 },
      { type: 'conveyor', x: 2, y: 9, w: 5, h: 1 },
      { type: 'spool', x: 12, y: 3, w: 1, h: 1, talk: [['大きな 糸まき。']] },
      { type: 'spool', x: 13, y: 3, w: 1, h: 1 },
      { type: 'bigbutton', x: 15, y: 11, w: 1, h: 1, color: '#e8466a', talk: [['大きな 見本の ボタン。', '「1923年 創業」 と きざまれている。']] },
      { type: 'stairs', dir: 'up', x: 16, y: 2, w: 1, h: 1 },
      { type: 'window', x: 5, y: 1, w: 1, h: 1, night: false },
      { type: 'window', x: 12, y: 1, w: 1, h: 1, night: false },
    ],
    npcs: [], yokai: [],
    symbols: game.phase === PH2.FACTORY ? [{ x: 4, y: 7, area: 'factory1' }, { x: 13, y: 6, area: 'factory1' }, { x: 8, y: 11, area: 'factory1' }, { x: 3, y: 2, area: 'factory_black' }] : [],
    start: { x: 7.5, y: 11, dir: 'up' },
    warps: [
      { x: 7, y: 13, w: 2, h: 1, to: 'maple', tx: 4.5, ty: 36, dir: 'down' },
      { x: 16, y: 2, w: 1, h: 1, to: 'factory2', tx: 15, ty: 12, dir: 'left' },
    ],
  };
}

export function buildFactory2() {
  const boss = game.phase === PH2.FACTORY;
  return {
    id: 'factory2', name: 'ボタン工場 2かい', bg: '#0a0812', tint: 'dim',
    w: 18, h: 14,
    tiles: rows(`
      WWWWWWWWWWWWWWWWWW
      WWWWWWWWWWWWWWWWWW
      WFFFFFFFFFFFFFFFFW
      WFFFFFFFFFFFFFFFFW
      WFFFFFFFFFFFFFFFFW
      WFFFFFFFFFFFFFFFFW
      WFFFFFFFFFFFFFFFFW
      WFFFWWWWFFFFFFFFFW
      WFFFWWWWFFFFFFFFFW
      WFFFFFFFFFFFFFFFFW
      WFFFFFFFFFFFFFFFFW
      WFFFFFFFFFFFFFFFFW
      WFFFFFFFFFFFFFFFFW
      WWWWWWWWWWWWWWWWWW`),
    objects: [
      { type: 'stairs', dir: 'down', x: 16, y: 12, w: 1, h: 1 },
      { type: 'buttons', x: 4, y: 2, w: 6, h: 3, talk: [['ボタンの 山。', '町じゅうから あつめられた ボタンが、 ぎっしり つまれている。']] },
      { type: 'spool', x: 12, y: 3, w: 1, h: 1 }, { type: 'spool', x: 14, y: 5, w: 1, h: 1 },
      { type: 'conveyor', x: 10, y: 10, w: 5, h: 1 },
    ],
    npcs: [], yokai: [],
    symbols: boss ? [{ x: 12, y: 8, area: 'factory2' }, { x: 2, y: 10, area: 'factory_black' }] : [],
    bigs: boss ? [{ id: 'boss', look: 'botankakushi', x: 7, y: 5 }] : [],
    start: { x: 15, y: 12, dir: 'left' },
    warps: [{ x: 16, y: 12, w: 1, h: 1, to: 'factory1', tx: 15, ty: 2, dir: 'left' }],
    triggers: boss ? [{ id: 'boss2', x: 2, y: 2, w: 10, h: 5 }] : [],
  };
}

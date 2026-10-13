// 灯台の なか（3階）と てっぺん
import { game } from '../game.js';
import { PH } from '../story/phase.js';

const ME = 'シメール';
const rows = s => s.trim().split('\n').map(r => r.trim());

export function buildLh1() {
  return {
    id: 'lh1', name: '灯台 1かい', bg: '#0a0812', tint: 'dim',
    w: 16, h: 14,
    tiles: rows(`
      WWWWWWWWWWWWWWWW
      WWWWWWWWWWWWWWWW
      WFFFFFFFFFFFFFFW
      WFFFFFFFFFFFFFFW
      WFFFFFFFFFFFFFFW
      WFFFFFFFFFFFFFFW
      WWWWWWWWWWFFFFFW
      WWWWWWWWWWFFFFFW
      WFFFFFFFFFFFFFFW
      WFFFFFFFFFFFFFFW
      WFFFFFFFFFFFFFFW
      WFFFFFFFFFFFFFFW
      WFFFFFFFFFFFFFFW
      WWWWWWWFFWWWWWWW`),
    objects: [
      { type: 'stairs', dir: 'up', x: 14, y: 2, w: 1, h: 1 },
      { type: 'crate', x: 1, y: 2, w: 1, h: 1, talk: [['ふるい 木箱。 「灯台の あぶら」 と かいてある。']] },
      { type: 'barrel', x: 2, y: 2, w: 1, h: 1, talk: [['たるの なかは からっぽ だった。']] },
      { type: 'window', x: 4, y: 1, w: 1, h: 1, night: true },
      { type: 'window', x: 11, y: 1, w: 1, h: 1, night: true },
      { type: 'crate', x: 13, y: 11, w: 1, h: 1, talk: [['木箱の うらに、 らくがきが ある。', '「灯台守の ばあさん ねぼすけ」', `${ME}|（……町の 子の しわざかな。）`]] },
    ],
    npcs: [], yokai: [],
    symbols: [{ x: 4, y: 10, area: 'tower1' }, { x: 11, y: 4, area: 'tower1' }, { x: 4, y: 3, area: 'tower1' }],
    start: { x: 7.5, y: 11, dir: 'up' },
    warps: [
      { x: 7, y: 13, w: 2, h: 1, to: 'miramar', tx: 37.5, ty: 30, dir: 'down' },
      { x: 14, y: 2, w: 1, h: 1, to: 'lh2', tx: 13, ty: 12, dir: 'left' },
    ],
  };
}

export function buildLh2() {
  return {
    id: 'lh2', name: '灯台 2かい', bg: '#0a0812', tint: 'dim',
    w: 16, h: 14,
    tiles: rows(`
      WWWWWWWWWWWWWWWW
      WWWWWWWWWWWWWWWW
      WFFFFFFFFFFFFFFW
      WFFFFFFFFFFFFFFW
      WFFFFWWWWWWFFFFW
      WFFFFWWWWWWFFFFW
      WFFFFFFFFFFFFFFW
      WFFFFFFFFFFFFFFW
      WFFFFWWWWWWFFFFW
      WFFFFWWWWWWFFFFW
      WFFFFFFFFFFFFFFW
      WFFFFFFFFFFFFFFW
      WFFFFFFFFFFFFFFW
      WWWWWWWWWWWWWWWW`),
    objects: [
      { type: 'stairs', dir: 'down', x: 14, y: 12, w: 1, h: 1 },
      { type: 'stairs', dir: 'up', x: 1, y: 2, w: 1, h: 1 },
      { type: 'window', x: 7, y: 1, w: 1, h: 1, night: true },
      { type: 'barrel', x: 14, y: 2, w: 1, h: 1, talk: [['たるの なかに、 ふるい 日誌が はいっていた。', '「○月×日。 灯台の あかりは きょうも 町を てらした。 あしたも そうであるように」']] },
    ],
    npcs: [], yokai: [],
    symbols: [{ x: 7, y: 6, area: 'tower2' }, { x: 3, y: 11, area: 'tower2' }, { x: 12, y: 3, area: 'tower1' }, { x: 9, y: 11, area: 'black' }],
    start: { x: 13, y: 12, dir: 'left' },
    warps: [
      { x: 14, y: 12, w: 1, h: 1, to: 'lh1', tx: 13, ty: 2, dir: 'left' },
      { x: 1, y: 2, w: 1, h: 1, to: 'lh3', tx: 2, ty: 12, dir: 'right' },
    ],
  };
}

export function buildLh3() {
  return {
    id: 'lh3', name: '灯台 3かい', bg: '#0a0812', tint: 'dim',
    w: 16, h: 14,
    tiles: rows(`
      WWWWWWWWWWWWWWWW
      WWWWWWWWWWWWWWWW
      WFFFFFFFFFFFFFFW
      WFFFFFFFFFFFFFFW
      WFFFFFFFFFFFFFFW
      WWWWWWWFFWWWWWWW
      WWWWWWWFFWWWWWWW
      WFFFFFFFFFFFFFFW
      WFFFFFFFFFFFFFFW
      WFFFFFFFFFFFFFFW
      WFFFFFFFFFFFFFFW
      WFFFFFFFFFFFFFFW
      WFFFFFFFFFFFFFFW
      WWWWWWWWWWWWWWWW`),
    objects: [
      { type: 'stairs', dir: 'down', x: 1, y: 12, w: 1, h: 1 },
      { type: 'stairs', dir: 'up', x: 14, y: 2, w: 1, h: 1 },
      { type: 'window', x: 3, y: 1, w: 1, h: 1, night: true },
      { type: 'window', x: 12, y: 1, w: 1, h: 1, night: true },
    ],
    npcs: [],
    // ボスの手前の 案内役（町で 見かけた ちいさな妖怪）
    yokai: game.phase === PH.TOWER ? [{ id: 'puu', x: 12, y: 3, action: 'guide', talk: [['？？？|ぷぅ！']] }] : [],
    symbols: [{ x: 5, y: 9, area: 'black' }, { x: 11, y: 10, area: 'black' }, { x: 8, y: 8, area: 'tower2' }],
    start: { x: 2, y: 12, dir: 'right' },
    warps: [
      { x: 1, y: 12, w: 1, h: 1, to: 'lh2', tx: 2, ty: 2, dir: 'right' },
      { x: 14, y: 2, w: 1, h: 1, to: 'lhtop', tx: 4, ty: 10, dir: 'up' },
    ],
  };
}

export function buildLhTop() {
  const boss = game.phase === PH.TOWER;
  return {
    id: 'lhtop', name: '灯台の てっぺん', bg: '#0a0820', tint: boss ? 'night' : null, stars: true,
    w: 16, h: 13,
    tiles: rows(`
      VVVVVVVVVVVVVVVV
      VVVVVVVVVVVVVVVV
      VVFFFFFFFFFFFFVV
      VVFFFFFFFFFFFFVV
      VVFFFFFFFFFFFFVV
      VVFFFFFFFFFFFFVV
      VVFFFFFFFFFFFFVV
      VVFFFFFFFFFFFFVV
      VVFFFFFFFFFFFFVV
      VVFFFFFFFFFFFFVV
      VVFFFFFFFFFFFFVV
      VVFFFFFFFFFFFFVV
      VVVVVVVVVVVVVVVV`),
    objects: [
      { type: 'stairs', dir: 'down', x: 3, y: 11, w: 1, h: 1 },
      { type: 'lens', x: 10, y: 3, w: 2, h: 2, off: boss },
      { type: 'nest', x: 5, y: 4, w: 4, h: 2, talk: [['大きな 鳥の 巣。', 'こまかく 光る かけらが まざっている。']] },
    ],
    npcs: [], yokai: [], symbols: [],
    bigs: boss ? [{ id: 'boss', look: 'usokuidori', x: 7, y: 5 }] : [],
    start: { x: 4, y: 10, dir: 'up' },
    warps: [{ x: 3, y: 11, w: 1, h: 1, to: 'lh3', tx: 13, ty: 2, dir: 'left' }],
    triggers: boss ? [{ id: 'boss', x: 2, y: 2, w: 12, h: 6 }] : [],
  };
}

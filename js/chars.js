// 登場人物の見た目
// CHARS: マップを歩く ちびキャラ
// FACES: 会話や戦闘の 顔グラフィック
export const FACES = {
  shimeru: {
    hair: 'fluffy', acc: ['bigRibbon'], collar: 'round',
    pal: { h: '#b8693a', H: '#e39c64', d: '#874424', c: '#6fae7a', C: '#4a8058', e: '#5a3a2a', E: '#a0704a' },
  },
  elesia: {
    hair: 'straight', acc: ['starClip'], collar: 'v',
    pal: { h: '#dfe4f2', H: '#ffffff', d: '#9aa2c0', c: '#4a6ad0', C: '#3048a0', a: '#ffffff', e: '#2a4a9a', E: '#6a9ae0' },
  },
  meina: {
    hair: 'wavy', acc: ['earring', 'mole'], collar: 'open', eyes: 'sharp',
    pal: { h: '#d8402e', H: '#f07a5a', d: '#9a2a20', c: '#3a3a58', C: '#26263e', a: '#f4ead8', e: '#8a4a10', E: '#d89a40' },
  },
  sakura: {
    hair: 'twinbun', acc: ['leaf'], collar: 'round', eyes: 'soft',
    pal: { h: '#f4a0c0', H: '#ffd0e0', d: '#c86890', c: '#f4f0f8', C: '#c8c0d8', a: '#f4a0c0', e: '#7a3a5a', E: '#c87a9a' },
  },
};
// リボンの とりかえっこ（第二章）
FACES.shimeru_nr = { ...FACES.shimeru, acc: [] };
FACES.elesia_rb = { ...FACES.elesia };

export const NAME_TO_FACE = { 'シメール': 'shimeru', 'エレシア': 'elesia', 'メイナ': 'meina', 'サクラ': 'sakura' };

export const CHARS = {
  shimeru: {
    hair: 'long', acc: ['bigRibbon', 'bag'],
    pal: {
      h: '#b8693a', H: '#e39c64', d: '#874424',
      c: '#6fae7a', C: '#4a8058', a: '#fff6e6',
      l: '#fff6e6', f: '#7a4a2a', r: '#e8466a', R: '#ff8fae',
    },
  },
  elesia: {
    hair: 'long',
    pal: { h: '#dfe4f2', H: '#ffffff', d: '#9aa2c0', c: '#4a6ad0', C: '#3048a0', a: '#ffffff', l: '#f4f4ff', f: '#2a3a7a' },
  },
  meina: {
    hair: 'long',
    pal: { h: '#d8402e', H: '#f07a5a', d: '#9a2a20', c: '#3a3a58', C: '#26263e', a: '#f4ead8', f: '#3a2a20', l: '#5a4a3a' },
  },
  sakura: {
    hair: 'twinbun', acc: ['leaf'],
    pal: { h: '#f4a0c0', H: '#ffd0e0', d: '#c86890', c: '#f4f0f8', C: '#c8c0d8', a: '#f4a0c0', l: '#f4f0f8', f: '#8a5a7a' },
  },
  // 一座の なかま（パーティーには 入らない）
  rosa: { hair: 'bun', acc: ['apron'], pal: { h: '#3a2a4a', H: '#5a4a7a', d: '#24183a', c: '#7a4a8a', C: '#5a2a6a', a: '#f4e8d0' } },
  pipi: { hair: 'bob', pal: { h: '#f4c040', H: '#ffe080', d: '#c09020', c: '#e8584a', C: '#b83a30', a: '#ffffff' } },
  nono: { hair: 'long', pal: { h: '#5a7ac8', H: '#8aa8e8', d: '#3a5098', c: '#a8d880', C: '#78b058', a: '#ffffff' } },
  lover1: { hair: 'long', pal: { h: '#8a4a2a', H: '#b06a40', d: '#5a2a18', c: '#e8a0b8', C: '#c07890' } },
  lover2: { hair: 'bob', pal: { h: '#2a3a2a', H: '#4a5a4a', d: '#141a14', c: '#6a8ac8', C: '#4a6aa0' } },
  customer: { hair: 'bun', pal: { h: '#c88a5a', H: '#e8aa7a', d: '#9a6038', c: '#d8c050', C: '#a89030' } },
  hood: { hair: 'hood', pal: { h: '#eeeef6', H: '#ffffff', d: '#2a2638', s: '#e8e8f0', l: '#e8e8f0', c: '#eeeef6', C: '#c4c4d4', a: '#eeeef6', f: '#a8a8b8' } },
  baker: { hair: 'bun', acc: ['apron'], pal: { h: '#d8a040', H: '#f4cc70', d: '#a07020', c: '#d86a4a', C: '#a84a30' } },
  granny: { hair: 'bun', acc: ['apron'], pal: { h: '#c8c4d0', H: '#ecebf2', d: '#9894a4', c: '#7a6a9a', C: '#5a4a78', a: '#e8e0c8' } },
  fishwife: { hair: 'bob', acc: ['apron'], pal: { h: '#3a3a5a', H: '#5a5a80', d: '#24243a', c: '#4a90b8', C: '#306888' } },
  sailor: { hair: 'bob', pal: { h: '#e8d8a0', H: '#fff4cc', d: '#b0a070', c: '#f4f4f4', C: '#b8c4d8', a: '#3a5a9a', s: '#e8b088', l: '#e8b088' } },
  keeper: { hair: 'bun', pal: { h: '#8a5a8a', H: '#b07ab0', d: '#5a3a5a', c: '#3a4a6a', C: '#26324a', a: '#d0c060' } },
  gossip: { hair: 'long', pal: { h: '#2a2a2a', H: '#4a4a52', d: '#141418', c: '#c868a0', C: '#984878', a: '#ffe0f0' } },
  child: { hair: 'bob', pal: { h: '#e88a3a', H: '#ffb86a', d: '#b05a20', c: '#f0d050', C: '#c0a030', a: '#ffffff' } },
  guard: { hair: 'bob', pal: { h: '#5a3a2a', H: '#8a5a3a', d: '#3a2418', c: '#8a8a9a', C: '#5a5a6a', a: '#c0a040', f: '#3a3a44', l: '#3a3a44' } },
  clothgirl: { hair: 'long', pal: { h: '#7a4ab0', H: '#a070d8', d: '#4a2a78', c: '#f0e0b0', C: '#c8b480', a: '#6ab0e8' } },
  inn: { hair: 'bun', acc: ['apron'], pal: { h: '#7a3a3a', H: '#a85a50', d: '#4a2020', c: '#5a8a5a', C: '#3a6a3a' } },
  // 第二章：メイプルホロウの 人たち
  doris: { hair: 'bun', acc: ['apron'], pal: { h: '#e8c060', H: '#fff0a0', d: '#b09030', c: '#6ac0b8', C: '#4a9890', a: '#ffffff' } },
  hanna: { hair: 'bob', pal: { h: '#6a4a2a', H: '#9a7048', d: '#40281a', c: '#c8a060', C: '#987840', a: '#f0d040', f: '#3a3040', l: '#4a5a8a' } },
  joe: { hair: 'bob', pal: { h: '#3a2a20', H: '#5a4a3a', d: '#20160e', c: '#4a6a9a', C: '#2e4a70', a: '#e85a4a', l: '#2e4a70' } },
  martha: { hair: 'long', pal: { h: '#c87a3a', H: '#e8a060', d: '#8a4a20', c: '#c84a4a', C: '#983030', a: '#4a6ab0', l: '#4a6ab0' } },
  betty: { hair: 'bob', pal: { h: '#2a2a3a', H: '#4a4a62', d: '#141420', c: '#f4a0c8', C: '#c878a0', a: '#ffffff' } },
  peggy: { hair: 'bun', pal: { h: '#e8e0c0', H: '#ffffff', d: '#b8b090', c: '#e8a040', C: '#b87820', a: '#8a4a20' } },
  ann: { hair: 'twinbun', pal: { h: '#e88a3a', H: '#ffb86a', d: '#b05a20', c: '#8ac8f0', C: '#5a98c8', a: '#ffffff' } },
  nan: { hair: 'twinbun', pal: { h: '#e88a3a', H: '#ffb86a', d: '#b05a20', c: '#f0a0b8', C: '#c87890', a: '#ffffff' } },
  sgran: { hair: 'bun', acc: ['apron', 'leaf'], pal: { h: '#e0c8d4', H: '#fff0f6', d: '#b098a8', c: '#a85a7a', C: '#7a3a58', a: '#f4f0f8' } },
};

// リボンの とりかえっこ（第二章）
CHARS.shimeru_nr = { ...CHARS.shimeru, acc: ['bag'] };
CHARS.elesia_rb = { ...CHARS.elesia, acc: ['backRibbon'], pal: { ...CHARS.elesia.pal, r: '#e8466a', R: '#ff8fae' } };

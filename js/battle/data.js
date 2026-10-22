// 戦いのデータ（仲間・技・敵）
// 画面とは切りはなしてあるので、シミュレーターでも使える。

export const STATS = ['hp', 'mp', 'atk', 'def', 'mag', 'spd'];
export const STAT_NAMES = { hp: 'HP', mp: 'MP', atk: 'こうげき', def: 'ぼうぎょ', mag: 'まりょく', spd: 'すばやさ' };

// ───────── 技 ─────────
// kind: attack(ぶつりこうげき) / magic(まほうこうげき) / heal / revive / buff / debuff / confuse / sleep
// target: enemy / enemies / ally / allies / fallen / self
export const SKILLS = {
  // シメール
  kusuri: { name: 'くすり', kind: 'heal', target: 'ally', mp: 3, power: 14, verb: 'あやしい くすりを のませた！' },
  hattari: { name: 'ハッタリ', kind: 'debuff', target: 'enemy', mp: 2, stat: 'atk', verb: '「こっちには 伝説の くすりが あるんだから！」' },
  minnakusuri: { name: 'みんなに くすり', kind: 'heal', target: 'allies', mp: 7, power: 12, verb: 'くすりを みんなに ばらまいた！' },
  kuchiguruma: { name: 'くちぐるま', kind: 'confuse', target: 'enemy', mp: 4, verb: 'ぺらぺらと まくしたてた！' },
  kitsuke: { name: 'きつけぐすり', kind: 'revive', target: 'fallen', mp: 8, power: 0.5, verb: 'きつけぐすりを かがせた！' },
  // エレシア
  uta: { name: 'うた', kind: 'magic', target: 'enemy', mp: 2, power: 8, verb: 'すんだ 声で うたった！' },
  hibiku: { name: 'ひびく うた', kind: 'magic', target: 'enemies', mp: 5, power: 7, verb: 'ひびく 歌声が あたりを ふるわせた！' },
  takanaru: { name: 'たかなる うた', kind: 'magic', target: 'enemy', mp: 6, power: 22, verb: '高い 高い 声を はりあげた！' },
  komoriuta: { name: 'こもりうた', kind: 'sleep', target: 'enemies', mp: 6, verb: 'しずかな こもりうたを うたった……' },
  arashi: { name: 'あらしの うた', kind: 'magic', target: 'enemies', mp: 10, power: 20, verb: 'あらしのような 歌声！' },
  // メイナ
  gahaha: { name: 'ガハハ', kind: 'buff', target: 'allies', mp: 3, stat: 'atk', verb: '「ガハハ！ びびってんじゃないよ！」' },
  nagenawa: { name: 'なげなわ', kind: 'stun', target: 'enemy', mp: 3, verb: 'なげなわを ひゅんと なげた！' },
  hitohada: { name: 'ひとはだ', kind: 'heal', target: 'ally', mp: 4, power: 18, verb: '「しっかりしな！」 と せなかを たたいた！' },
  ikki: { name: 'いっきうち', kind: 'attack', target: 'enemy', mp: 5, power: 1.8, verb: 'おもいきり ふりかぶった！' },
  // ───── 第二章で おぼえる技 ─────
  tokkuyaku: { name: 'とっておきの くすり', kind: 'heal', target: 'ally', mp: 9, power: 48, verb: 'ほんものの 薬草を せんじた くすりだ！' },
  nemurigusa: { name: 'ねむり草', kind: 'sleep', target: 'enemies', mp: 7, verb: 'ねむり草の けむりを ふわっと ひろげた……' },
  utahime: { name: '歌姫の アリア', kind: 'magic', target: 'enemy', mp: 9, power: 46, verb: 'ぶたいの まんなかで 歌う ときの 声！' },
  duet: { name: 'ひびきあう うた', kind: 'magic', target: 'enemies', mp: 13, power: 30, verb: 'こだまが こだまを よんで、 歌が かさなっていく！' },
  daifunsen: { name: 'だいふんせん', kind: 'attack', target: 'enemies', mp: 8, power: 1.05, verb: 'むちを ぐるんと ふりまわした！' },
  zachou: { name: '座長の いちげき', kind: 'attack', target: 'enemy', mp: 9, power: 2.6, verb: '「一座に 手を だすんじゃないよ！」' },
  // サクラ
  shibire: { name: 'しびれの じゅつ', kind: 'stun', target: 'enemy', mp: 4, verb: '魔法陣が ぱちぱちと 光った！' },
  kekkai: { name: 'さくらの 結界', kind: 'buff', target: 'allies', mp: 6, stat: 'def', verb: 'さくら色の 結界が みんなを つつんだ！' },
  nibui: { name: 'のろのろの じゅつ', kind: 'debuff', target: 'enemy', mp: 3, stat: 'spd', verb: '「えーっと、 じかんの ながれを ちょっとだけ……」' },
  sakuramochi: { name: 'さくらもち', kind: 'heal', target: 'ally', mp: 5, power: 26, verb: '手作りの さくらもちを わたした！ もちもち！' },
  fubuki: { name: 'さくらふぶき', kind: 'magic', target: 'enemies', mp: 8, power: 18, verb: '魔法の 花びらが うずを まいた！' },
  hanaikada: { name: 'はないかだ', kind: 'buff', target: 'allies', mp: 8, stat: 'spd', verb: '花びらの いかだに のって、 みんなの 足が かるくなった！' },
};

// ───────── 仲間 ─────────
// base: 覚醒0回のときの 強さ
// weight: 覚醒したとき、どの強さが上がりやすいか
// learn: [覚醒回数, 技]
export const PARTY_DEFS = {
  shimeru: {
    name: 'シメール', job: 'みならい', personality: 'ちゃっかり', face: 'shimeru',
    base: { hp: 30, mp: 16, atk: 6, def: 6, mag: 9, spd: 9 },
    weight: { hp: 26, mp: 22, atk: 6, def: 16, mag: 20, spd: 10 },
    learn: [[0, 'kusuri'], [10, 'hattari'], [25, 'minnakusuri'], [42, 'kuchiguruma'], [62, 'kitsuke'], [98, 'tokkuyaku'], [122, 'nemurigusa']],
    weapon: 'ほうき',
  },
  elesia: {
    name: 'エレシア', job: '歌姫', personality: 'かんぺき', face: 'elesia',
    base: { hp: 26, mp: 18, atk: 5, def: 5, mag: 11, spd: 8 },
    weight: { hp: 22, mp: 22, atk: 4, def: 10, mag: 30, spd: 12 },
    learn: [[0, 'uta'], [8, 'hibiku'], [22, 'takanaru'], [45, 'komoriuta'], [68, 'arashi'], [96, 'utahime'], [124, 'duet']],
    weapon: 'マイク',
  },
  meina: {
    name: 'メイナ', job: '座長', personality: 'ごうかい', face: 'meina',
    base: { hp: 38, mp: 8, atk: 10, def: 8, mag: 6, spd: 7 },
    weight: { hp: 32, mp: 8, atk: 26, def: 20, mag: 6, spd: 8 },
    learn: [[0, 'ikki'], [12, 'gahaha'], [30, 'hitohada'], [50, 'nagenawa'], [94, 'daifunsen'], [120, 'zachou']],
    weapon: 'むち',
  },
  sakura: {
    name: 'サクラ', job: '魔術師', personality: 'のんびり', face: 'sakura',
    base: { hp: 28, mp: 20, atk: 5, def: 7, mag: 11, spd: 8 },
    weight: { hp: 24, mp: 24, atk: 4, def: 16, mag: 22, spd: 10 },
    learn: [[0, 'shibire'], [0, 'nibui'], [20, 'kekkai'], [45, 'sakuramochi'], [70, 'fubuki'], [110, 'hanaikada']],
    weapon: 'つえ',
  },
};

// ───────── 敵 ─────────
// lv: 「覚醒何回ぶんの仲間と同じくらいの強さか」
// mul: 標準からの 倍率
// moves: [重み, 動き]
export const ENEMY_DEFS = {
  hisohiso: {
    name: 'ヒソヒソダマ', lv: 2, look: 'hisohiso', mul: { hp: 0.6, atk: 0.75, spd: 1.2 },
    moves: [[3, { kind: 'attack', verb: 'ぶつかってきた！' }], [1, { kind: 'debuff', stat: 'def', verb: 'ひみつを ささやいた！ ……きいては いけない ひみつだ！' }]],
  },
  horagai: {
    name: 'ホラガイ', lv: 5, look: 'horagai', mul: { hp: 0.9, atk: 0.85, def: 1.2, spd: 0.8 },
    moves: [[3, { kind: 'attack', verb: 'からだごと ころがってきた！' }], [1, { kind: 'buff', stat: 'def', verb: 'ほらを ふいた！ 「おれは 海で いちばん かたい！」' }]],
  },
  karakasa: {
    name: 'カラカサ', lv: 8, look: 'karakasa', mul: { hp: 0.9, atk: 1.1, spd: 1.3 },
    moves: [[3, { kind: 'attack', verb: 'ぴょんと とびかかってきた！' }], [1, { kind: 'confuse', verb: 'くるくる まわって 目を まわさせた！' }]],
  },
  shiomaneki: {
    name: 'シオマネキ', lv: 12, look: 'shiomaneki', mul: { hp: 1.2, atk: 1.2, def: 1.2, spd: 0.9 },
    moves: [[3, { kind: 'attack', verb: 'おおきな ハサミで はさんだ！' }], [1, { kind: 'attack', hits: 2, power: 0.75, verb: 'ハサミを ふりまわした！' }]],
  },
  umibozu: {
    name: 'ウミボウズ', lv: 18, look: 'umibozu', mul: { hp: 1.5, atk: 1.1, mag: 1.2, spd: 0.8 },
    moves: [[2, { kind: 'attack', verb: 'のしかかってきた！' }], [1, { kind: 'magic', target: 'all', power: 6, verb: 'しおみずを ふきかけた！' }]],
  },
  hikarikurage: {
    name: 'ヒカリクラゲ', lv: 26, look: 'kurage', mul: { hp: 0.9, atk: 0.9, mag: 1.3, spd: 1.1 },
    moves: [[2, { kind: 'attack', verb: 'ふわりと からみついた！' }], [1, { kind: 'magic', target: 'all', power: 8, verb: 'ぴかっと 光って しびれさせた！' }], [1, { kind: 'sleep', verb: 'ゆらゆら ゆれて ねむけを さそった……' }]],
  },
  // ボス
  usokuidori: {
    name: 'ウソクイドリ', lv: 66, look: 'usokuidori', boss: true, mul: { hp: 4.4, atk: 1.0, def: 1.05, mag: 1.1, spd: 1.0 },
    moves: [
      [3, { kind: 'attack', verb: 'するどい くちばしで つついた！' }],
      [2, { kind: 'attack', target: 'all', power: 0.7, verb: 'おおきく はばたいた！ つよい 風！' }],
      [2, { kind: 'magic', target: 'all', power: 14, verb: '「ホントウノ コトヲ イエ！」 まことの さけび！' }],
      [1, { kind: 'drain', stat: 'mp', amount: 6, verb: 'うそを ついばんだ！' }],
    ],
  },
  // ── 第二章 ──
  kakashi: {
    name: 'カカシボウ', lv: 84, look: 'kakashi', mul: { hp: 1.0, atk: 1.0, spd: 0.9 },
    moves: [[3, { kind: 'attack', verb: 'うでの 棒で ぶんなぐった！' }], [1, { kind: 'debuff', stat: 'spd', verb: 'ギロリと にらんだ！ 足が すくむ！' }]],
  },
  morokoshi: {
    name: 'モロコシボウズ', lv: 86, look: 'morokoshi', mul: { hp: 0.9, atk: 1.05, spd: 1.1 },
    moves: [[3, { kind: 'attack', verb: 'からだを ぶつけてきた！' }], [1, { kind: 'attack', hits: 3, power: 0.45, verb: 'つぶを ポップコーンみたいに はじけさせた！' }]],
  },
  korokoro: {
    name: 'コロコロクサ', lv: 82, look: 'korokoro', mul: { hp: 0.8, atk: 0.9, spd: 1.4 },
    moves: [[3, { kind: 'attack', verb: 'ころころ ころがってきた！' }], [1, { kind: 'confuse', verb: 'ぐるぐる まわって 目を まわさせた！' }]],
  },
  botandama: {
    name: 'ボタンダマ', lv: 98, look: 'botandama', mul: { hp: 1.1, def: 1.25, spd: 0.9 },
    moves: [[3, { kind: 'attack', verb: 'ころがって ぶつかってきた！' }], [1, { kind: 'buff', stat: 'def', verb: 'ぴっちり ボタンを とめた！' }]],
  },
  chokin: {
    name: 'チョキン', lv: 104, look: 'chokin', mul: { hp: 0.9, atk: 1.25, spd: 1.2 },
    moves: [[3, { kind: 'attack', verb: 'チョキン！ と きりつけた！' }], [1, { kind: 'attack', hits: 2, power: 0.7, verb: 'チョキチョキ チョキン！' }]],
  },
  itomaki: {
    name: 'イトマキ', lv: 100, look: 'itomaki', mul: { hp: 1.2, atk: 0.9, mag: 1.2, spd: 0.9 },
    moves: [[2, { kind: 'attack', verb: '糸で ぐるぐる まきつけた！' }], [1, { kind: 'stun', verb: '糸で しばりつけようと した！' }], [1, { kind: 'magic', target: 'all', power: 10, verb: '糸を はりめぐらせた！' }]],
  },
  kurokakashi: {
    name: 'クロカカシボウ', lv: 122, look: 'kakashi', dark: true, mul: { hp: 1.3, atk: 1.1, spd: 0.9 },
    moves: [[3, { kind: 'attack', verb: 'うでの 棒で ぶんなぐった！' }], [1, { kind: 'magic', target: 'all', power: 14, verb: 'くろい カラスを よびよせた！' }]],
  },
  kurochokin: {
    name: 'クロチョキン', lv: 134, look: 'chokin', dark: true, mul: { hp: 1.2, atk: 1.25, spd: 1.2 },
    moves: [[3, { kind: 'attack', verb: 'チョキン！ と きりつけた！' }], [1, { kind: 'attack', hits: 3, power: 0.6, verb: 'チョキチョキ チョキチョキ チョキン！' }]],
  },
  botankakushi: {
    name: 'ボタン隠し', lv: 152, look: 'botankakushi', boss: true, mul: { hp: 4.4, atk: 1.0, def: 1.05, mag: 1.1, spd: 1.15 },
    moves: [
      [3, { kind: 'attack', verb: 'ふくろで ぼかっと なぐった！' }],
      [2, { kind: 'magic', target: 'all', power: 16, verb: 'ボタンを ばらまいた！ いたい いたい！' }],
      [1, { kind: 'confuse', verb: 'くすぐった！ わらいが とまらない！' }],
      [1, { kind: 'debuff', stat: 'def', verb: '服の ボタンを かくした！ すうすうする！' }],
    ],
  },
  // 黒いシンボル（強い）
  kurohora: {
    name: 'クロホラガイ', lv: 42, look: 'horagai', dark: true, mul: { hp: 1.3, def: 1.3, spd: 0.85 },
    moves: [[3, { kind: 'attack', verb: 'からだごと ころがってきた！' }], [1, { kind: 'buff', stat: 'def', verb: 'くろい ほらを ふいた！' }], [1, { kind: 'magic', target: 'all', power: 10, verb: 'くらい 音を ひびかせた！' }]],
  },
  kurobozu: {
    name: 'クロウミボウズ', lv: 58, look: 'umibozu', dark: true, mul: { hp: 1.6, atk: 1.15, mag: 1.2, spd: 0.85 },
    moves: [[2, { kind: 'attack', verb: 'のしかかってきた！' }], [1, { kind: 'magic', target: 'all', power: 12, verb: 'くろい しおみずを ふきかけた！' }]],
  },
};

// 敵の強さを lv から 計算する（仲間3人の 平均くらい）
export function enemyStats(def, lvAdd = 0, hpMul = 1) {
  const L = def.lv + lvAdd, m = def.mul || {};
  const s = {
    hp: (31 + 1.33 * L) * 6.5 * (m.hp ?? 1) * hpMul,
    mp: 99,
    atk: (6.4 + 0.25 * L) * (m.atk ?? 1),
    def: (6.3 + 0.25 * L) * (m.def ?? 1),
    mag: (8.7 + 0.3 * L) * (m.mag ?? 1),
    spd: (8 + 0.16 * L) * (m.spd ?? 1),
  };
  for (const k in s) s[k] = Math.max(1, Math.round(s[k]));
  return s;
}

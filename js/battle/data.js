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
    learn: [[0, 'kusuri'], [10, 'hattari'], [25, 'minnakusuri'], [42, 'kuchiguruma'], [62, 'kitsuke']],
    weapon: 'ほうき',
  },
  elesia: {
    name: 'エレシア', job: '歌姫', personality: 'かんぺき', face: 'elesia',
    base: { hp: 26, mp: 18, atk: 5, def: 5, mag: 11, spd: 8 },
    weight: { hp: 22, mp: 22, atk: 4, def: 10, mag: 30, spd: 12 },
    learn: [[0, 'uta'], [8, 'hibiku'], [22, 'takanaru'], [45, 'komoriuta'], [68, 'arashi']],
    weapon: 'マイク',
  },
  meina: {
    name: 'メイナ', job: '座長', personality: 'ごうかい', face: 'meina',
    base: { hp: 38, mp: 8, atk: 10, def: 8, mag: 6, spd: 7 },
    weight: { hp: 32, mp: 8, atk: 26, def: 20, mag: 6, spd: 8 },
    learn: [[0, 'ikki'], [12, 'gahaha'], [30, 'hitohada'], [50, 'nagenawa']],
    weapon: 'むち',
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
export function enemyStats(def) {
  const L = def.lv, m = def.mul || {};
  const s = {
    hp: (31 + 1.33 * L) * 6.5 * (m.hp ?? 1),
    mp: 99,
    atk: (6.4 + 0.25 * L) * (m.atk ?? 1),
    def: (6.3 + 0.25 * L) * (m.def ?? 1),
    mag: (8.7 + 0.3 * L) * (m.mag ?? 1),
    spd: (8 + 0.16 * L) * (m.spd ?? 1),
  };
  for (const k in s) s[k] = Math.max(1, Math.round(s[k]));
  return s;
}

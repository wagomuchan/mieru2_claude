// エリアごとに 出てくる 敵グループ
export const AREAS = {
  beach: [['hisohiso', 'hisohiso'], ['hisohiso', 'hisohiso', 'hisohiso'], ['horagai', 'hisohiso'], ['horagai', 'horagai', 'hisohiso']],
  cape: [['karakasa', 'karakasa'], ['karakasa', 'hisohiso', 'hisohiso'], ['shiomaneki', 'karakasa'], ['horagai', 'karakasa', 'horagai']],
  rocks: [['umibozu', 'karakasa'], ['shiomaneki', 'karakasa', 'karakasa'], ['umibozu', 'hisohiso', 'hisohiso'], ['shiomaneki', 'shiomaneki']],
  tower1: [['karakasa', 'karakasa', 'hisohiso'], ['hikarikurage', 'karakasa'], ['shiomaneki', 'hikarikurage'], ['umibozu', 'karakasa']],
  tower2: [['hikarikurage', 'hikarikurage'], ['umibozu', 'shiomaneki'], ['hikarikurage', 'umibozu'], ['shiomaneki', 'hikarikurage', 'karakasa']],
  farm: [['korokoro', 'korokoro', 'kakashi'], ['kakashi', 'morokoshi'], ['morokoshi', 'korokoro', 'korokoro'], ['kakashi', 'kakashi']],
  maze: [['morokoshi', 'morokoshi', 'kakashi'], ['kakashi', 'korokoro', 'morokoshi'], ['morokoshi', 'kakashi']],
  maze_black: [['kurokakashi', 'morokoshi'], ['kurokakashi', 'korokoro', 'korokoro']],
  factory1: [['botandama', 'botandama'], ['botandama', 'itomaki'], ['chokin', 'botandama'], ['itomaki', 'chokin']],
  factory2: [['chokin', 'chokin'], ['itomaki', 'itomaki', 'botandama'], ['chokin', 'itomaki', 'botandama']],
  factory_black: [['kurochokin', 'botandama'], ['kurochokin', 'itomaki']],
  black: [['kurohora', 'horagai'], ['kurobozu'], ['kurohora', 'karakasa', 'karakasa']],
};

// 場所ごとの 強さの つまみ { hp: HPの 倍率, lv: [グループごとに 足す強さ（覚醒何回ぶん）] }
// dev/tune.mjs で「ものさし」に 入るように 計算して 決める（ものさしは 決定メモに）
export const AREA_TUNE = {
  // 第一章
  beach: { hp: 0.7, lv: [15, 2, 10, 0] },
  cape: { hp: 0.9, lv: [5, 11, 1, 5] },
  tower1: { hp: 1.3, lv: [8, -12, -10, -10] },
  tower2: { hp: 1.3, lv: [-20, -3, -16, -9] },
  black: { hp: 0.9, lv: [8, -19, 1] },
  // 第二章
  farm: { hp: 0.7, lv: [-5, 9, -12, 17] },
  maze: { hp: 0.7, lv: [3, 1, 22] },
  maze_black: { hp: 0.9, lv: [-23, -32] },
  factory1: { hp: 0.5, lv: [53, 5, 33, -8] },
  factory2: { hp: 0.8, lv: [10, -33, -13] },
  factory_black: { hp: 0.5, lv: [57, 23] },
};

// その戦いに つかう つまみ（グループが 見つからなければ、その場所の 平均）
export function tuneFor(area, group) {
  const t = AREA_TUNE[area];
  if (!t) return null;
  const key = JSON.stringify(group);
  const i = (AREAS[area] || []).findIndex(g => JSON.stringify(g) === key);
  const lv = i >= 0 ? t.lv[i] : Math.round(t.lv.reduce((s, x) => s + x, 0) / t.lv.length);
  return { lv, hp: t.hp };
}

// シンボルの 見た目にする 敵（グループの 先頭）
export const AREA_LOOK = { beach: 'hisohiso', cape: 'karakasa', rocks: 'shiomaneki', tower1: 'kurage', tower2: 'kurage', black: 'umibozu',
  farm: 'korokoro', maze: 'morokoshi', maze_black: 'kakashi', factory1: 'botandama', factory2: 'chokin', factory_black: 'chokin' };
// 黒い（強い）シンボル
export const DARK_AREAS = new Set(['black', 'maze_black', 'factory_black']);

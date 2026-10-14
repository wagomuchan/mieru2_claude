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

// シンボルの 見た目にする 敵（グループの 先頭）
export const AREA_LOOK = { beach: 'hisohiso', cape: 'karakasa', rocks: 'shiomaneki', tower1: 'kurage', tower2: 'kurage', black: 'umibozu',
  farm: 'korokoro', maze: 'morokoshi', maze_black: 'kakashi', factory1: 'botandama', factory2: 'chokin', factory_black: 'chokin' };
// 黒い（強い）シンボル
export const DARK_AREAS = new Set(['black', 'maze_black', 'factory_black']);

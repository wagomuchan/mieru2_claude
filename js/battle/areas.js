// エリアごとに 出てくる 敵グループ
export const AREAS = {
  beach: [['hisohiso', 'hisohiso'], ['hisohiso', 'hisohiso', 'hisohiso'], ['horagai', 'hisohiso'], ['horagai', 'horagai', 'hisohiso']],
  cape: [['karakasa', 'karakasa'], ['karakasa', 'hisohiso', 'hisohiso'], ['shiomaneki', 'karakasa'], ['horagai', 'karakasa', 'horagai']],
  rocks: [['umibozu', 'karakasa'], ['shiomaneki', 'karakasa', 'karakasa'], ['umibozu', 'hisohiso', 'hisohiso'], ['shiomaneki', 'shiomaneki']],
  tower1: [['karakasa', 'karakasa', 'hisohiso'], ['hikarikurage', 'karakasa'], ['shiomaneki', 'hikarikurage'], ['umibozu', 'karakasa']],
  tower2: [['hikarikurage', 'hikarikurage'], ['umibozu', 'shiomaneki'], ['hikarikurage', 'umibozu'], ['shiomaneki', 'hikarikurage', 'karakasa']],
  black: [['kurohora', 'horagai'], ['kurobozu'], ['kurohora', 'karakasa', 'karakasa']],
};

// シンボルの 見た目にする 敵（グループの 先頭）
export const AREA_LOOK = { beach: 'hisohiso', cape: 'karakasa', rocks: 'shiomaneki', tower1: 'kurage', tower2: 'kurage', black: 'umibozu' };

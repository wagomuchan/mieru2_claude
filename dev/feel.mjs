// エリアの「手ごたえ」を はかる：node dev/feel.mjs <エリア> <覚醒回数,...> [人数3|4] [回数]
// 負け率・へったHP（パーティー全体の 何%）・1戦の 秒数・1分あたりの 覚醒（1人あたり）
import { Battle, newMember, growMember } from '../js/battle/core.js';
import { AREAS, tuneFor } from '../js/battle/areas.js';
import { rng } from '../js/util.js';

export function measure(area, aw, n = 3, runs = 300, groups = AREAS[area]) {
  let lose = 0, hpLost = 0, sec = 0, awk = 0, minHp = 0;
  for (let r = 0; r < runs; r++) {
    const R = rng(r * 7 + 1);
    const ids = n === 4 ? ['shimeru', 'elesia', 'meina', 'sakura'] : ['shimeru', 'elesia', 'meina'];
    const party = ids.map(id => growMember(newMember(id), id === 'sakura' ? aw + 4 : aw, R));
    const total = party.reduce((s, m) => s + m.max.hp, 0);
    const before = party.reduce((s, m) => s + m.awaken, 0);
    const gg = groups[r % groups.length]; const b = new Battle(party, gg, R, { tune: tuneFor(area, gg) });
    let ev, low = 1;
    while ((ev = b.step())) {
      const l = ev.filter(e => e.t === 'msg').length; if (l) sec += 0.8 + (l - 1) * 0.28;
      low = Math.min(low, b.allies.reduce((s, a) => s + Math.max(0, a.hp), 0) / total);
      if (b.round > 200) break;
    }
    if (b.result !== 'win') lose++;
    else { hpLost += 1 - b.allies.reduce((s, a) => s + Math.max(0, a.hp), 0) / total; awk += party.reduce((s, m) => s + m.awaken, 0) - before; }
    minHp += low;
  }
  const wins = runs - lose;
  return { lose: lose / runs, hpLost: hpLost / Math.max(1, wins), sec: sec / runs, awkPerMin: awk / Math.max(1, wins) / n / (sec / runs / 60), awkPerBattle: awk / Math.max(1, wins) / n, low: minHp / runs };
}

if ((process.argv[1] || '').endsWith('feel.mjs')) {
  const [area, list, n = '3', runs = '300'] = process.argv.slice(2);
  for (const aw of list.split(',').map(Number)) {
    const m = measure(area, aw, +n, +runs);
    console.log(`${area.padEnd(14)} 覚醒${String(aw).padStart(3)}  負け${(m.lose * 100).toFixed(0).padStart(3)}%  へったHP${(m.hpLost * 100).toFixed(0).padStart(3)}%  いちばん減った時${(100 - m.low * 100).toFixed(0).padStart(3)}%  1戦${m.sec.toFixed(0).padStart(3)}秒  覚醒/戦${m.awkPerBattle.toFixed(2)}  覚醒/分${m.awkPerMin.toFixed(2)}`);
  }
}

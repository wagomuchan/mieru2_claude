// ボス戦の 勝率：node dev/boss.mjs <エリア作戦> [回数]
// 例：node dev/boss.mjs beach:5,cape:6,tower1:6,tower2:5   （まっすぐ進んだ場合）
import { Battle, newMember } from '../js/battle/core.js';
import { AREAS } from '../js/battle/areas.js';
const pick = a => a[Math.floor(Math.random() * a.length)];
const plan = process.argv[2] || 'beach:5,cape:6,tower1:6,tower2:5';
const RUNS = +(process.argv[3] || 200);
let wins = 0, aw = 0, secs = 0, bsec = 0;
for (let r = 0; r < RUNS; r++) {
  const party = ['shimeru', 'elesia', 'meina'].map(newMember);
  for (const step of plan.split(',')) {
    const [area, n] = step.split(':');
    for (let i = 0; i < +n; i++) {
      for (const m of party) { m.hp = m.max.hp; m.mp = m.max.mp; }
      const b = new Battle(party, pick(AREAS[area]));
      let ev; while ((ev = b.step())) { const l = ev.filter(e => e.t === 'msg').length; if (l) secs += 0.8 + (l - 1) * 0.28; if (b.round > 200) break; }
    }
  }
  aw += party.reduce((s, m) => s + m.awaken, 0) / 3;
  for (const m of party) { m.hp = m.max.hp; m.mp = m.max.mp; }
  const b = new Battle(party, ['usokuidori']);
  let cheers = 3, ev;
  while ((ev = b.step())) {
    const l = ev.filter(e => e.t === 'msg').length; if (l) bsec += 0.8 + (l - 1) * 0.28;
    if (cheers > 0 && !b.result && b.allies.filter(a => a.hp < a.max.hp * 0.3).length >= 2) { cheers--; b.cheer(); }
    if (b.round > 300) break;
  }
  if (b.result === 'win') wins++;
}
console.log(`${plan}: 覚醒平均 ${(aw / RUNS).toFixed(1)}  ボス勝率 ${(100 * wins / RUNS).toFixed(0)}%  戦闘時間 ${(secs / RUNS / 60).toFixed(0)}分  ボス戦 ${(bsec / RUNS).toFixed(0)}秒`);

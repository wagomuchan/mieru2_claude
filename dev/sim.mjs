// 戦いのシミュレーター：node dev/sim.mjs
// 「エリアで何回戦うと、何回覚醒して、ボスに勝てるか」を 何百回も ためす
import { Battle, newMember } from '../js/battle/core.js';

const MSG_SEC = 0.8;
const pick = a => a[Math.floor(Math.random() * a.length)];

export function fight(party, group, { cheers = 0, heal = true } = {}) {
  if (heal) for (const m of party) { m.hp = m.max.hp; m.mp = m.max.mp; }
  const b = new Battle(party, group);
  let msgs = 0, left = cheers, ev;
  while ((ev = b.step())) {
    const lines = ev.filter(e => e.t === 'msg').length;
    if (lines) msgs += 1 + (lines - 1) * 0.35;
    // ピンチのときに おうえん
    if (left > 0 && !b.result && b.allies.filter(a => a.hp < a.max.hp * 0.3).length >= 2) { left--; b.cheer(); msgs += 1; }
    if (b.round > 200) break;
  }
  return { result: b.result, sec: msgs * MSG_SEC, rounds: b.round };
}

import { AREAS } from '../js/battle/areas.js';

const plan = process.argv[2] || 'beach:8,cape:10,rocks:10,black:12';
const RUNS = +(process.argv[3] || 200);
const totals = { aw: [0, 0, 0], sec: 0, lose: 0, battles: 0 };
const perArea = {};
for (let r = 0; r < RUNS; r++) {
  const party = ['shimeru', 'elesia', 'meina'].map(newMember);
  for (const step of plan.split(',')) {
    const [area, n] = step.split(':');
    for (let i = 0; i < +n; i++) {
      const res = fight(party, pick(AREAS[area]));
      const pa = perArea[area] ||= { sec: 0, n: 0, lose: 0 };
      pa.sec += res.sec; pa.n++; if (res.result !== 'win') pa.lose++;
      totals.sec += res.sec; totals.battles++; if (res.result !== 'win') totals.lose++;
    }
  }
  party.forEach((m, i) => totals.aw[i] += m.awaken);
  if (r === 0) console.log('例:', party.map(m => `${m.name} 覚醒${m.awaken} ${JSON.stringify(m.max)}`).join('\n    '));
}
console.log(`作戦 ${plan}`);
for (const [a, v] of Object.entries(perArea)) console.log(`  ${a}: 1戦 平均 ${(v.sec / v.n).toFixed(0)}秒  負け ${(100 * v.lose / v.n).toFixed(1)}%`);
console.log(`  覚醒(平均): ${totals.aw.map(x => (x / RUNS).toFixed(1)).join(' / ')}`);
console.log(`  戦闘の合計時間: ${(totals.sec / RUNS / 60).toFixed(1)}分`);

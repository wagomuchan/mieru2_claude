// 第二章 ボス戦の 勝率：node dev/boss2.mjs <作戦> [回数] [ボス]
// 作戦の「|」より あとは サクラも いっしょ。 例：farm:4,maze:4|maze:3,factory1:6,factory2:4
import { Battle, newMember, growMember } from '../js/battle/core.js';
import { AREAS } from '../js/battle/areas.js';
import { rng } from '../js/util.js';
const pick = a => a[Math.floor(Math.random() * a.length)];
const plan = process.argv[2] || 'farm:4,maze:4|factory1:6,factory2:4';
const RUNS = +(process.argv[3] || 200);
const BOSS = process.argv[4] || 'botankakushi';
const START = +(process.env.START || 82);
let wins = 0, aw = 0, secs = 0, bsec = 0, lose = 0, n = 0;
for (let r = 0; r < RUNS; r++) {
  const R = rng(1000 + r);
  const party = ['shimeru', 'elesia', 'meina'].map(id => growMember(newMember(id), START, R));
  const [before, after] = plan.split('|');
  const run = steps => {
    for (const step of (steps || '').split(',').filter(Boolean)) {
      const [area, k] = step.split(':');
      for (let i = 0; i < +k; i++) {
        for (const m of party) { m.hp = m.max.hp; m.mp = m.max.mp; }
        const b = new Battle(party, pick(AREAS[area]));
        let ev; while ((ev = b.step())) { const l = ev.filter(e => e.t === 'msg').length; if (l) secs += 0.8 + (l - 1) * 0.28; if (b.round > 200) break; }
        n++; if (b.result !== 'win') lose++;
      }
    }
  };
  run(before);
  const avg = Math.round(party.reduce((s, m) => s + m.awaken, 0) / 3);
  party.push(growMember(newMember('sakura'), Math.max(60, START + 4), rng(777 + r)));
  run(after);
  aw += party.reduce((s, m) => s + m.awaken, 0) / party.length;
  for (const m of party) { m.hp = m.max.hp; m.mp = m.max.mp; }
  const b = new Battle(party, [BOSS]);
  let cheers = 3, ev;
  while ((ev = b.step())) {
    const l = ev.filter(e => e.t === 'msg').length; if (l) bsec += 0.8 + (l - 1) * 0.28;
    if (cheers > 0 && !b.result && b.allies.filter(a => a.hp < a.max.hp * 0.3).length >= 2) { cheers--; b.cheer(); }
    if (b.round > 300) break;
  }
  if (b.result === 'win') wins++;
}
console.log(`${plan}: 覚醒平均 ${(aw / RUNS).toFixed(1)}  ボス勝率 ${(100 * wins / RUNS).toFixed(0)}%  戦闘 ${(secs / RUNS / 60).toFixed(0)}分 (${(n / RUNS).toFixed(0)}戦, 負け${(100 * lose / Math.max(1, n)).toFixed(0)}%)  ボス戦 ${(bsec / RUNS).toFixed(0)}秒`);

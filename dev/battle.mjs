// 戦闘を ためす：海辺の妖怪の前に ワープ → 戦闘 → スクショ
import { createRequire } from 'module';
import { execSync } from 'child_process';
const require = createRequire(execSync('npm root -g').toString().trim() + '/');
const { chromium } = require('playwright');
const out = process.argv[2];
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, hasTouch: true, isMobile: true })).newPage();
p.on('console', m => { if (m.type() === 'error') console.log('console:', m.text()); });
p.on('pageerror', e => console.log('pageerror:', e.message));
await p.goto('http://localhost:8123/index.html'); await p.waitForTimeout(800);
await p.mouse.click(195, 400); await p.waitForTimeout(1500);
await p.screenshot({ path: out + '/b0_face.png' });
for (let i = 0; i < 12; i++) { await p.mouse.click(195, 700); await p.waitForTimeout(200); }
await p.evaluate(() => { const f = window.__mieru.field; f.teleport(10 * 16 + 8, 27 * 16 + 12, 'down'); });
await p.waitForTimeout(1500);
await p.screenshot({ path: out + '/b1_field.png' });
for (let i = 0; i < 30 && (await p.evaluate(() => window.__mieru.mode)) !== 'battle'; i++) await p.waitForTimeout(200);
await p.waitForTimeout(5000);
await p.screenshot({ path: out + '/b2_battle.png' });
await p.click('#bfast'); await p.click('#bfast');
await p.click('#bcheer');
for (let i = 0; i < 120 && (await p.evaluate(() => window.__mieru.mode)) === 'battle'; i++) {
  await p.waitForTimeout(500);
  if (i === 6) await p.screenshot({ path: out + '/b3_battle.png' });
}
await p.waitForTimeout(800);
await p.screenshot({ path: out + '/b4_after.png' });
console.log(await p.evaluate(() => JSON.stringify(window.__mieru.game.party.map(m => [m.name, m.awaken, m.hp, m.max.hp]))));
await b.close();

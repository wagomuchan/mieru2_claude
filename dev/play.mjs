// iPhone風の画面で 起動 → タップ → 歩く を ためして スクショを撮る
import { createRequire } from 'module';
import { execSync } from 'child_process';
const require = createRequire(execSync('npm root -g').toString().trim() + '/');
const { chromium } = require('playwright');
const out = process.argv[2] || '/tmp';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, hasTouch: true, isMobile: true });
const p = await ctx.newPage();
p.on('console', m => console.log('console:', m.text()));
p.on('pageerror', e => console.log('pageerror:', e.message));
await p.goto('http://localhost:8123/index.html');
await p.waitForTimeout(800);
await p.screenshot({ path: out + '/p1_title.png' });
await p.mouse.click(195, 400);
await p.waitForTimeout(2500);
await p.screenshot({ path: out + '/p2_open.png' });
for (let i = 0; i < 6; i++) { await p.mouse.click(195, 700); await p.waitForTimeout(300); }
// ドラッグで 左上へ歩く
async function drag(dx, dy, ms) {
  await p.mouse.move(200, 650); await p.mouse.down();
  for (let i = 1; i <= 5; i++) { await p.mouse.move(200 + dx * i / 5, 650 + dy * i / 5); await p.waitForTimeout(20); }
  await p.waitForTimeout(ms); await p.mouse.up();
}
await drag(0, 60, 1200);
await p.screenshot({ path: out + '/p3_walk.png' });
await drag(-60, 0, 2500);
await drag(0, 60, 900);
await p.screenshot({ path: out + '/p4_walk.png' });
const st = await p.evaluate(() => 1);
await browser.close();

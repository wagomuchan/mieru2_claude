import { createRequire } from 'module';
import { execSync } from 'child_process';
const require = createRequire(execSync('npm root -g').toString().trim() + '/');
const { chromium } = require('playwright');
const out = process.argv[2];
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, hasTouch: true, isMobile: true });
const p = await ctx.newPage();
p.on('pageerror', e => console.log('pageerror:', e.message));
await p.goto('http://localhost:8123/index.html');
await p.waitForTimeout(800);
await p.mouse.click(195, 400);
await p.waitForTimeout(1200);
for (let i = 0; i < 8; i++) { await p.mouse.click(195, 700); await p.waitForTimeout(250); }
// くだもの屋の前へ
await p.evaluate(() => { const f = window.__mieru.field; f.player.x = 15*16+8; f.player.y = 18*16+12; f.player.dir = 'up'; });
await p.waitForTimeout(300);
await p.screenshot({ path: out + '/t1_bang.png' });
await p.mouse.click(195, 700); await p.waitForTimeout(2500);
await p.screenshot({ path: out + '/t2_talk.png' });
// 灯台へ
await p.evaluate(() => { const f = window.__mieru.field; f.player.x = 38*16; f.player.y = 29*16+10; f.player.dir = 'up'; });
for (let i = 0; i < 8; i++) { await p.mouse.click(195, 700); await p.waitForTimeout(250); }
await p.waitForTimeout(300);
await p.screenshot({ path: out + '/t3_lighthouse.png' });
await browser.close();

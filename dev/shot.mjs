// 使い方: node dev/shot.mjs <ページ> <出力png> [幅] [高さ] [待ちms]
import { createRequire } from 'module';
import { execSync } from 'child_process';
const require = createRequire(execSync('npm root -g').toString().trim() + '/');
const { chromium } = require('playwright');
const [,, page, out, w = '390', h = '844', wait = '600'] = process.argv;
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: +w, height: +h }, deviceScaleFactor: 3, hasTouch: true, isMobile: true });
const p = await ctx.newPage();
p.on('console', m => console.log('console:', m.text()));
p.on('pageerror', e => console.log('pageerror:', e.message));
await p.goto('http://localhost:8123/' + page);
await p.waitForTimeout(+wait);
await p.screenshot({ path: out });
await browser.close();

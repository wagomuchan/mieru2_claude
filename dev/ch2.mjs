// 第二章を 自動で すすめる テスト：node dev/ch2.mjs <出力フォルダ>
import { createRequire } from 'module';
import { execSync } from 'child_process';
const require = createRequire(execSync('npm root -g').toString().trim() + '/');
const { chromium } = require('playwright');
const out = process.argv[2];
const b = await chromium.launch();
let advance;
const p = await (await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, hasTouch: true, isMobile: true })).newPage();
const errors = [];
p.on('console', m => { if (m.type() === 'error') { errors.push(m.text()); console.log('console:', m.text()); } });
p.on('pageerror', e => { errors.push(e.message); console.log('pageerror:', e.message); });
await p.goto('http://localhost:8123/index.html');
await p.evaluate(() => localStorage.clear());
await p.reload();
await p.waitForTimeout(800);
await p.click('#tch2');
advance = async function (choice = 0, max = 400, shotAt) {
  for (let i = 0; i < max; i++) {
    const st = await p.evaluate(() => ({ busy: window.__mieru.busy, msg: !document.getElementById('msg').classList.contains('hidden'), ch: !document.getElementById('choices').classList.contains('hidden'), mode: window.__mieru.mode, txt: document.getElementById('msgtext')?.textContent || '' }));
    if (st.mode === 'battle') { await p.waitForTimeout(400); continue; }
    if (shotAt && st.txt.includes(shotAt.text) && !shotAt.done) { shotAt.done = true; await p.waitForTimeout(700); await p.screenshot({ path: out + '/' + shotAt.name }); }
    if (st.ch) { const c = typeof choice === 'function' ? choice() : choice; await p.click(`#choices button:nth-child(${c + 1})`); await p.waitForTimeout(250); continue; }
    if (st.msg) { await p.mouse.click(195, 760); await p.waitForTimeout(80); continue; }
    if (!st.busy) return;
    await p.waitForTimeout(150);
  }
  console.log('advance: timeout');
}
async function talkAt(tx, ty, dir) {
  await p.evaluate(([tx, ty, dir]) => { const f = window.__mieru.field; f.safe = 3; f.teleport(tx * 16 + 8, ty * 16 + 12, dir); }, [tx, ty, dir]);
  await p.waitForTimeout(300);
  await advance();   // 場所の イベントが 先に 出たら すすめる
  await p.evaluate(([tx, ty, dir]) => { const f = window.__mieru.field; f.teleport(tx * 16 + 8, ty * 16 + 12, dir); }, [tx, ty, dir]);
  await p.waitForTimeout(200);
  await p.mouse.click(195, 760);
  await p.waitForTimeout(300);
}
async function swipeFrom(tx, ty, dy) {
  await p.evaluate(([tx, ty]) => { const f = window.__mieru.field; f.teleport(tx * 16 + 8, ty * 16 + 12, 'up'); }, [tx, ty]);
  await p.mouse.move(200, 700); await p.mouse.down(); await p.mouse.move(200, 700 + dy);
  await p.waitForTimeout(900); await p.mouse.up();
  await p.waitForTimeout(200);
}
const state = () => p.evaluate(() => JSON.stringify({ phase: window.__mieru.game.phase, map: window.__mieru.field && window.__mieru.field.id, party: window.__mieru.game.partyIds, looks: window.__mieru.game.looks }));
await p.evaluate(() => { window.__mieru.game.speed = 4; });
await p.waitForTimeout(1200);
await advance(0, 400, { text: 'あったかい', name: 'd1_ribbon.png' });
console.log('after arrive', await state());
await p.screenshot({ path: out + '/d2_town.png' });
// 3人で 休む
await talkAt(32, 34, 'up'); await advance(0);
console.log('rest3', await p.evaluate(() => JSON.stringify(window.__mieru.game.naka)));
// ダイナー
await talkAt(9, 16, 'up'); await advance(0, 400, { text: '桜餅です', name: 'd3_diner.png' });
console.log('after diner', await state());
// 研究所
await talkAt(21, 24, 'up'); await advance(0, 400, { text: '季節を ちょっとだけ', name: 'd4_lab.png' });
console.log('after lab', await state());
await p.screenshot({ path: out + '/d5_maze_phase.png' });
// 迷路
await p.evaluate(() => { window.__mieru.api.goto('maze', 16.5, 23, 'up'); });
await p.waitForTimeout(1500); await advance();
await p.screenshot({ path: out + '/d6_maze.png' });
await talkAt(15, 12, 'up');
await advance(0, 600, { text: '結界、 展開', name: 'd7_barrier.png' });
console.log('after maze', await state());
// 4人で 休む
await p.evaluate(() => { window.__mieru.api.goto('maple', 32, 35, 'up'); });
await p.waitForTimeout(1500);
await talkAt(32, 34, 'up'); await advance((() => { let n = 0; return () => (n++ === 2 ? 2 : 0); })());
console.log('rest4', await p.evaluate(() => JSON.stringify(window.__mieru.game.naka)));
// テスト用に つよくする（工場の 妖怪に 負けないように）
await p.evaluate(async () => {
  const c = await import('./js/battle/core.js');
  for (const m of window.__mieru.game.party) { c.growMember(m, 150, Math.random); m.hp = m.max.hp; m.mp = m.max.mp; }
});
// 工場
await p.evaluate(() => { window.__mieru.api.goto('factory1', 7.5, 11, 'up'); });
await p.waitForTimeout(1500); await advance();
await p.screenshot({ path: out + '/d8_factory1.png' });
await p.evaluate(() => { window.__mieru.api.goto('factory2', 15, 12, 'left'); });
await p.waitForTimeout(1500); await advance();
await p.screenshot({ path: out + '/d9_factory2.png' });
await p.evaluate(() => { const f = window.__mieru.field; f.teleport(7 * 16 + 8, 6 * 16 + 12, 'up'); }); await p.waitForTimeout(400);
await advance(0, 800, { text: 'ボタンが 降ってきた', name: 'd10_rain.png' });
console.log('after boss', await state());
await p.screenshot({ path: out + '/d11_fair.png' });
// 観覧車で もういちど ふたり歩き（サクラと メイナ）
await talkAt(42, 24, 'up'); await advance((() => { let n = 0; return () => (n++ === 1 ? 5 : 0); })());
// コンテスト
await talkAt(38, 29, 'up'); await advance(0, 800, { text: '秋の 夜に、 桜が 咲いた', name: 'd12_sakura.png' });
console.log('after contest', await state());
await p.screenshot({ path: out + '/d13_end.png' });
const diary = await p.evaluate(() => JSON.stringify(window.__mieru.game.diary));
console.log('diary', diary);
// メニュー
await p.click('#menubtn'); await p.waitForTimeout(400);
await p.screenshot({ path: out + '/d14_menu.png' });
console.log('errors', errors.length);
await b.close();

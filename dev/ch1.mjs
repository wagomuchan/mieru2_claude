// 第一章を 自動で すすめる テスト：node dev/ch1.mjs <出力フォルダ>
import { createRequire } from 'module';
import { execSync } from 'child_process';
const require = createRequire(execSync('npm root -g').toString().trim() + '/');
const { chromium } = require('playwright');
const out = process.argv[2];
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, hasTouch: true, isMobile: true })).newPage();
const errors = [];
p.on('console', m => { if (m.type() === 'error') { errors.push(m.text()); console.log('console:', m.text()); } });
p.on('pageerror', e => { errors.push(e.message); console.log('pageerror:', e.message); });
await p.goto('http://localhost:8123/index.html');
await p.evaluate(() => localStorage.clear());
await p.reload();
await p.waitForTimeout(800);
await p.screenshot({ path: out + '/c0_title.png' });
await p.click('#tnew');
const M = () => window.__mieru;
// 会話を すすめる（選択肢が 出たら 指定の ボタン）
async function advance(choice = 0, max = 200) {
  for (let i = 0; i < max; i++) {
    const st = await p.evaluate(() => ({ busy: window.__mieru.busy, msg: !document.getElementById('msg').classList.contains('hidden'), ch: !document.getElementById('choices').classList.contains('hidden'), mode: window.__mieru.mode }));
    if (st.mode === 'battle') { await p.waitForTimeout(400); continue; }
    if (st.ch) { await p.click(`#choices button:nth-child(${choice + 1})`); await p.waitForTimeout(250); continue; }
    if (st.msg) { await p.mouse.click(195, 760); await p.waitForTimeout(90); continue; }
    if (!st.busy) return;
    await p.waitForTimeout(150);
  }
  console.log('advance: timeout');
}
// プレイヤーを タイル (tx, ty) に置いて、向きを決めて タップ
async function talkAt(tx, ty, dir) {
  await p.evaluate(([tx, ty, dir]) => { const f = window.__mieru.field; f.safe = 3; f.teleport(tx * 16 + 8, ty * 16 + 12, dir); }, [tx, ty, dir]);
  await p.waitForTimeout(200);
  await p.mouse.click(195, 760);
  await p.waitForTimeout(300);
}
const state = () => p.evaluate(() => JSON.stringify({ phase: window.__mieru.game.phase, map: window.__mieru.field && window.__mieru.field.id, party: window.__mieru.game.partyIds, flags: window.__mieru.game.flags }));
export { };
await p.waitForTimeout(1200);
await p.screenshot({ path: out + '/c1_open.png' });
await advance();
console.log('after opening', await state());
// 屋台
await talkAt(24, 21, 'up'); await advance();
console.log('after stall', await state());
await p.screenshot({ path: out + '/c2_troupe.png' });
// ひろばへ（トリガー）
await p.evaluate(() => { const f = window.__mieru.field; f.teleport(21 * 16 + 8, 13 * 16 + 12, 'up'); });
await p.mouse.move(200, 700); await p.mouse.down(); await p.mouse.move(200, 640);
await p.waitForTimeout(1200); await p.mouse.up();
await advance();
console.log('after camp', await state());
// ロザ → 公演
await talkAt(19, 9, 'up'); 
await p.waitForTimeout(500);
await p.screenshot({ path: out + '/c3_rosa.png' });
// 公演の とちゅうで スクショ
for (let i = 0; i < 60; i++) {
  const st = await p.evaluate(() => ({ ch: !document.getElementById('choices').classList.contains('hidden'), txt: document.getElementById('msgtext').textContent }));
  if (st.ch) { await p.click('#choices button:nth-child(1)'); await p.waitForTimeout(300); continue; }
  if (st.txt.includes('それから、 シメールを')) { await p.waitForTimeout(800); await p.screenshot({ path: out + '/c4_show.png' }); break; }
  await p.mouse.click(195, 760); await p.waitForTimeout(120);
}
await advance();
console.log('after show', await state());
// うそが つけない 屋台
await talkAt(24, 21, 'up'); await advance(0);
console.log('after curse', await state());
await p.screenshot({ path: out + '/c5_party.png' });
// ききこみ
await talkAt(28, 18, 'up'); await advance();
await talkAt(37, 29, 'down'); await advance();
await p.evaluate(() => { const f = window.__mieru.field; const c = f.actor('child'); c.wander = 0; c.x = 19 * 16 + 8; c.y = 20 * 16 + 12; });
await talkAt(19, 21, 'up'); await advance();
console.log('after clues', await state());
await p.screenshot({ path: out + '/c6_tower.png' });
// テントで 休む
await talkAt(15, 11, 'up'); await advance(0);
console.log('after rest', await state(), await p.evaluate(() => JSON.stringify(window.__mieru.game.naka)));
// メニュー
await p.click('#menubtn'); await p.waitForTimeout(300);
await p.screenshot({ path: out + '/c7_menu.png' });
await p.click('#mtabs button:nth-child(3)'); await p.waitForTimeout(200);
await p.screenshot({ path: out + '/c8_naka.png' });
await p.click('#mclose');
// 灯台へ
async function walkInto(tx, ty, dir, dx, dy) {
  await p.evaluate(([tx, ty, dir]) => { const f = window.__mieru.field; f.safe = 5; f.teleport(tx * 16 + 8, ty * 16 + 12, dir); }, [tx, ty, dir]);
  await p.mouse.move(200, 700); await p.mouse.down(); await p.mouse.move(200 + dx * 40, 700 + dy * 40);
  for (let i = 0; i < 30; i++) { await p.waitForTimeout(100); if (await p.evaluate(() => window.__mieru.busy)) break; }
  await p.mouse.up();
  await advance();
}
await walkInto(37.5, 30, 'up', 0, -1);
console.log('map', await state());
await p.waitForTimeout(400);
await p.screenshot({ path: out + '/d1_lh1.png' });
await walkInto(13, 2, 'right', 1, 0);
console.log('map', await state());
await walkInto(2, 2, 'left', -1, 0);
console.log('map', await state());
await p.screenshot({ path: out + '/d2_lh3.png' });
await talkAt(12, 4, 'up'); await advance(0);
console.log('guide done', await state());
await walkInto(13, 2, 'right', 1, 0);
console.log('map', await state());
await p.screenshot({ path: out + '/d3_top.png' });
// つよくして ボスへ
await p.evaluate(() => { for (const m of window.__mieru.game.party) { m.max.hp = 400; m.hp = 400; m.max.atk = 80; m.max.mag = 80; m.max.def = 60; m.max.mp = 99; m.mp = 99; } window.__mieru.game.speed = 4; });
await walkInto(6, 8, 'up', 0, -1);
for (let i = 0; i < 300; i++) {
  const st = await p.evaluate(() => ({ mode: window.__mieru.mode, phase: window.__mieru.game.phase, busy: window.__mieru.busy, txt: document.getElementById('msgtext').textContent, ch: !document.getElementById('choices').classList.contains('hidden') }));
  if (st.txt.includes('ガタゴト、 ガタゴト。') && !globalThis.shot) { globalThis.shot = 1; await p.screenshot({ path: out + '/d4_wagon.png' }); }
  if (st.txt.includes('白い フードの 女|') || st.txt.includes('保護する')) { if (!globalThis.shot2) { globalThis.shot2 = 1; await p.waitForTimeout(500); await p.screenshot({ path: out + '/d5_hood.png' }); } }
  if (st.ch) { await p.click('#choices button:nth-child(1)'); await p.waitForTimeout(250); continue; }
  if (!st.busy && st.mode === 'field' && st.phase === 6) break;
  if (st.mode === 'battle') { await p.waitForTimeout(500); continue; }
  await p.mouse.click(195, 760); await p.waitForTimeout(100);
}
console.log('end', await state());
await p.screenshot({ path: out + '/d6_end.png' });
await p.reload(); await p.waitForTimeout(800);
await p.screenshot({ path: out + '/d7_title.png' });
console.log('errors', errors.length);
await b.close();

// 見える2 ─ はじまり
import { Field } from './field.js';
import { buildMiramar } from './maps/miramar.js';
import { initInput, input, readKeys, takeTap } from './input.js';
import { say, ask, isTalking, updateTalk, advanceTalk, setPlace, fade } from './ui.js';
import { BattleView } from './battle/view.js';
import { AREAS } from './battle/areas.js';
import { game, restAll } from './game.js';

const app = document.getElementById('app');
const screenEl = document.getElementById('screen');
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const hint = document.getElementById('hint');
const place = document.getElementById('place');
const title = document.getElementById('title');

let W = 256, H = 256;
let field = null;
let battleView = null;
let mode = 'field';   // field / battle
let started = false;
let busy = false;     // 会話や イベントの あいだは 歩けない

// 画面の大きさを決める。ドットが にじまないよう、
// 実際の画面の ピクセルに対して 整数倍で ひきのばす。
function resize() {
  const dpr = window.devicePixelRatio || 1;
  const appRect = app.getBoundingClientRect();
  const style = getComputedStyle(app);
  const innerW = appRect.width - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
  const innerH = appRect.height - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
  const cssH = Math.round(Math.min(innerH * 0.58, innerW * 1.3));
  screenEl.style.height = cssH + 'px';
  const devW = Math.round(innerW * dpr), devH = Math.round(cssH * dpr);
  const scale = Math.max(1, Math.round(devW / 240));
  W = Math.floor(devW / scale); H = Math.floor(devH / scale);
  canvas.width = W; canvas.height = H;
  canvas.style.width = (W * scale / dpr) + 'px';
  canvas.style.height = (H * scale / dpr) + 'px';
  ctx.imageSmoothingEnabled = false;
}

let last = 0;
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000 || 0);
  last = now;

  let tap;
  while ((tap = takeTap())) {
    if (!started || mode !== 'field') continue;
    if (isTalking()) advanceTalk();
    else if (!busy) {
      const res = field.interact();
      if (res) onTalk(res);
    }
  }

  if (mode === 'field') {
    const stick = readKeys() || (input.dx || input.dy ? [input.dx, input.dy] : null);
    field.update(dt, stick, !started || busy || isTalking());
    updateTalk(dt);
    hint.classList.toggle('hidden', isTalking() || mode !== 'field');
    hint.classList.toggle('off', input.moved);
    if (field.encounter && !busy) startBattle(field.encounter);
    field.draw(ctx, W, H);
  } else {
    battleView.update(dt);
    updateTalk(dt);
    battleView.draw(ctx, W, H);
  }
  requestAnimationFrame(frame);
}

async function talk(lines) {
  busy = true;
  await say(lines);
  busy = false;
}

async function onTalk({ lines, target }) {
  busy = true;
  if (target.action === 'inn') await innFlow(lines);
  else await say(lines);
  busy = false;
}

// 宿屋で 休む
async function innFlow() {
  const pick = await ask(['宿屋の おかみ|ひとばん とまっていく？ ……今回は とくべつに タダで いいよ。'], ['とまる', 'やめる']);
  if (pick !== 0) { await say(['宿屋の おかみ|またおいで。']); return; }
  await fade(true);
  restAll();
  const p = field.player;
  game.rest = { x: p.x, y: p.y, dir: p.dir };
  await new Promise(r => setTimeout(r, 600));
  await fade(false);
  await say(['みんな ぐっすり ねむった。', 'HPと MPが ぜんぶ かいふくした！ おうえんも 3回に もどった！']);
}

// 戦闘
async function startBattle(sym) {
  busy = true;
  field.encounter = null;
  const groups = AREAS[sym.area];
  const group = groups[Math.floor(Math.random() * groups.length)];
  // MOTHER風の 切りかえ（画面が ちらつく）
  for (let i = 0; i < 3; i++) {
    canvas.style.filter = 'invert(1)'; await sleep(70);
    canvas.style.filter = ''; await sleep(70);
  }
  mode = 'battle';
  place.classList.add('hidden');
  hint.classList.add('hidden');
  const result = await battleView.run(group, sym.area);
  place.classList.remove('hidden');
  if (result === 'win') {
    field.defeat(sym);
    mode = 'field';
  } else {
    // 全滅：最後に 休んだ場所へ
    await fade(true);
    mode = 'field';
    restAll();
    const r = game.rest || startPos;
    field.teleport(r.x, r.y, r.dir);
    field.resetSymbols();
    field.escape();
    await sleep(500);
    await fade(false);
    await say(['……気がつくと、 最後に 休んだ 場所に いた。', 'その たたかいで おきた 覚醒は、 ゆめのように きえてしまった。']);
  }
  busy = false;
}

const sleep = ms => new Promise(r => setTimeout(r, ms));
let startPos;

async function boot() {
  try { await document.fonts.load('16px DotGothic16'); } catch (e) { /* フォントがなくても 動く */ }
  resize();
  addEventListener('resize', resize);
  // iPhoneは 向きを変えたあと 少しおくれて 大きさが決まる
  addEventListener('orientationchange', () => setTimeout(resize, 300));

  const data = buildMiramar();
  field = new Field(data);
  battleView = new BattleView();
  startPos = { x: field.player.x, y: field.player.y, dir: field.player.dir };
  window.__mieru = { get field() { return field; }, game, get mode() { return mode; }, get battle() { return battleView.battle; } }; // テスト用
  setPlace(data.name);
  initInput(document.body);

  // ホーム画面から ひらいていれば「ホーム画面に追加」の案内は いらない
  if (navigator.standalone || matchMedia('(display-mode: standalone)').matches) {
    document.getElementById('a2hs').classList.add('hidden');
  }

  requestAnimationFrame(t => { last = t; frame(t); });

  title.addEventListener('pointerup', async () => {
    if (started) return;
    started = true;
    input.taps.length = 0;
    title.classList.add('fade');
    setTimeout(() => title.remove(), 900);
    await sleep(700);
    await talk(data.opening);
  }, { once: true });
}

boot();

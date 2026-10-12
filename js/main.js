// 見える2 ─ はじまり
import { Field } from './field.js';
import { buildMiramar } from './maps/miramar.js';
import { initInput, input, readKeys, takeTap } from './input.js';
import { say, isTalking, updateTalk, advanceTalk, setPlace } from './ui.js';

const app = document.getElementById('app');
const screenEl = document.getElementById('screen');
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const hint = document.getElementById('hint');
const title = document.getElementById('title');

let W = 256, H = 256;
let field = null;
let started = false;
let busy = false;   // 会話の あいだは 歩けない

// 画面の大きさを決める。ドットが にじまないよう、
// 実際の画面の ピクセルに対して 整数倍で ひきのばす。
function resize() {
  const dpr = window.devicePixelRatio || 1;
  const appRect = app.getBoundingClientRect();
  const style = getComputedStyle(app);
  const innerW = appRect.width - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
  const innerH = appRect.height - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
  const cssH = Math.round(Math.min(innerH * 0.64, innerW * 1.4));
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

  // タップ
  let tap;
  while ((tap = takeTap())) {
    if (!started) continue;
    if (isTalking()) advanceTalk();
    else if (!busy) {
      const lines = field.interact();
      if (lines) talk(lines);
    }
  }

  const stick = readKeys() || (input.dx || input.dy ? [input.dx, input.dy] : null);
  field.update(dt, stick, !started || busy || isTalking());
  updateTalk(dt);
  hint.classList.toggle('hidden', isTalking());
  hint.classList.toggle('off', input.moved);

  field.draw(ctx, W, H);
  requestAnimationFrame(frame);
}

async function talk(lines) {
  busy = true;
  await say(lines);
  busy = false;
}

async function boot() {
  try { await document.fonts.load('16px DotGothic16'); } catch (e) { /* フォントがなくても 動く */ }
  resize();
  addEventListener('resize', resize);
  // iPhoneは 向きを変えたあと 少しおくれて 大きさが決まる
  addEventListener('orientationchange', () => setTimeout(resize, 300));

  const data = buildMiramar();
  field = new Field(data);
  window.__mieru = { get field() { return field; } }; // テスト用
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
    await new Promise(r => setTimeout(r, 700));
    await talk(data.opening);
  }, { once: true });
}

boot();

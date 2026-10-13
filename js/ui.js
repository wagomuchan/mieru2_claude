// 会話ウインドウ（MOTHER風）
// say(['名前|せりふ', '名前@smile|せりふ', 'ナレーション', ...]) を await すると、読み終わるまで待つ。
// 「@表情」をつけると、顔グラフィックの表情が かわる。
import { buildPortraits, paintPortrait } from './portraits.js';
import { FACES, NAME_TO_FACE } from './chars.js';

const CPS = 40; // 1秒に出る文字数

const $ = id => document.getElementById(id);
const faces = {};
export function getFaces(id) { return (faces[id] ||= buildPortraits(FACES[id])); }

let queue = null;   // { lines, i, shown, full, resolve }

export function isTalking() { return queue !== null || choosing; }

export function say(lines) {
  return new Promise(resolve => {
    queue = { lines, i: -1, shown: 0, full: '', resolve };
    $('msg').classList.remove('hidden');
    nextLine();
  });
}

function closeWindow() {
  $('msg').classList.add('hidden');
  $('msgname').textContent = '';
  $('msgtext').textContent = '';
  $('msgface').classList.add('hidden');
}

function nextLine() {
  queue.i++;
  if (queue.i >= queue.lines.length) {
    const r = queue.resolve;
    queue = null;
    if (!keepOpen) closeWindow();
    r();
    return;
  }
  const raw = queue.lines[queue.i];
  const bar = raw.indexOf('|');
  let name = bar >= 0 ? raw.slice(0, bar) : '';
  let ex = 'normal';
  const at = name.indexOf('@');
  if (at >= 0) { ex = name.slice(at + 1); name = name.slice(0, at); }
  queue.full = bar >= 0 ? raw.slice(bar + 1) : raw;
  queue.shown = 0;
  $('msgname').textContent = name;
  $('msgtext').textContent = '';
  $('msgnext').classList.remove('on');
  const faceId = NAME_TO_FACE[name];
  if (faceId) {
    paintPortrait($('msgface'), getFaces(faceId)[ex] || getFaces(faceId).normal, 64);
    $('msgface').classList.remove('hidden');
  } else $('msgface').classList.add('hidden');
}

// 毎フレーム呼ぶ
export function updateTalk(dt) {
  if (!queue) return;
  if (queue.shown < queue.full.length) {
    queue.shown = Math.min(queue.full.length, queue.shown + dt * CPS);
    $('msgtext').textContent = queue.full.slice(0, Math.floor(queue.shown));
    if (queue.shown >= queue.full.length) $('msgnext').classList.add('on');
  }
}

// タップされたとき
export function advanceTalk() {
  if (!queue) return;
  if (queue.shown < queue.full.length) {
    queue.shown = queue.full.length;
    $('msgtext').textContent = queue.full;
    $('msgnext').classList.add('on');
  } else {
    nextLine();
  }
}

// せりふのあとに 選択肢を出す。えらんだ番号を返す
let choosing = false, keepOpen = false;
export async function ask(lines, options) {
  keepOpen = true;
  await say(lines);
  keepOpen = false;
  choosing = true;
  $('msgnext').classList.remove('on');
  const box = $('choices');
  box.innerHTML = '';
  box.classList.remove('hidden');
  const picked = await new Promise(resolve => {
    options.forEach((label, i) => {
      const b = document.createElement('button');
      b.textContent = label;
      b.addEventListener('click', () => resolve(i));
      box.appendChild(b);
    });
  });
  box.classList.add('hidden');
  choosing = false;
  closeWindow();
  return picked;
}

export function setPlace(name) {
  $('place').textContent = name;
}

// 画面を まっくらにして もどす
export function fade(on) {
  return new Promise(r => {
    $('fader').classList.toggle('on', on);
    setTimeout(r, 450);
  });
}

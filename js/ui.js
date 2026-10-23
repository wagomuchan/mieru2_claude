// 会話ウインドウ（MOTHER風）
// say(['名前|せりふ', '名前@smile|せりふ', 'ナレーション', ...]) を await すると、読み終わるまで待つ。
// 「@表情」をつけると、顔グラフィックの表情が かわる。
import { buildPortraits, paintPortrait } from './portraits.js';
import { FACES, NAME_TO_FACE } from './chars.js';
import { game } from './game.js';

const CPS = 40; // 1秒に出る文字数

const $ = id => document.getElementById(id);
const faces = {};
export function getFaces(id) {
  const key = (game.looks && game.looks[id]) || id;
  return (faces[key] ||= buildPortraits(FACES[key]));
}

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
  box.classList.toggle('many', options.length > 2);
  box.classList.remove('hidden');
  box.scrollTop = 0;
  const picked = await new Promise(resolve => {
    options.forEach((opt, i) => {
      const b = document.createElement('button');
      if (typeof opt === 'string') b.textContent = opt;
      else optionWithFaces(b, opt);
      b.addEventListener('click', () => resolve(i));
      box.appendChild(b);
    });
    fitChoices(box);
  });
  box.classList.add('hidden');
  choosing = false;
  closeWindow();
  return picked;
}

// 選択肢に 小さな 顔を つける：{ label, faces: [['shimeru', 'elesia'], ['meina', 'sakura']], wide }
// faces は グループごと（へやわりの 2組 など）。グループの あいだに「／」
function optionWithFaces(b, opt) {
  b.classList.add('withfaces');
  if (opt.wide) b.classList.add('wide');
  const row = document.createElement('span');
  row.className = 'ofaces';
  opt.faces.forEach((group, gi) => {
    if (gi > 0) { const sep = document.createElement('span'); sep.className = 'osep'; sep.textContent = '／'; row.appendChild(sep); }
    for (const id of group) {
      const cv = document.createElement('canvas');
      paintPortrait(cv, getFaces(id).normal, 28);
      row.appendChild(cv);
    }
  });
  const lab = document.createElement('span');
  lab.className = 'olabel';
  lab.textContent = opt.label;
  b.appendChild(row);
  b.appendChild(lab);
}

// 選択肢が 多くて はみ出すときは、その中だけ 指で スクロールできるように 高さを きめる
function fitChoices(box) {
  box.style.maxHeight = '';
  if (!box.classList.contains('many')) return;
  const panel = $('panel').getBoundingClientRect();
  const top = box.getBoundingClientRect().top;
  const room = Math.floor(panel.bottom - top - 14);
  if (box.scrollHeight > room) box.style.maxHeight = Math.max(110, room) + 'px';
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

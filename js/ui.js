// 会話ウインドウ（MOTHER風）
// say(['名前|せりふ', 'ナレーション', ...]) を await すると、読み終わるまで待つ。

const CPS = 40; // 1秒に出る文字数

const el = {
  win: () => document.getElementById('msg'),
  name: () => document.getElementById('msgname'),
  text: () => document.getElementById('msgtext'),
  next: () => document.getElementById('msgnext'),
};

let queue = null;   // { lines, i, shown, full, resolve }

export function isTalking() { return queue !== null; }

export function say(lines) {
  return new Promise(resolve => {
    queue = { lines, i: -1, shown: 0, full: '', resolve };
    el.win().classList.remove('hidden');
    nextLine();
  });
}

function nextLine() {
  queue.i++;
  if (queue.i >= queue.lines.length) {
    const r = queue.resolve;
    queue = null;
    el.win().classList.add('hidden');
    el.name().textContent = '';
    el.text().textContent = '';
    r();
    return;
  }
  const raw = queue.lines[queue.i];
  const bar = raw.indexOf('|');
  const name = bar >= 0 ? raw.slice(0, bar) : '';
  queue.full = bar >= 0 ? raw.slice(bar + 1) : raw;
  queue.shown = 0;
  el.name().textContent = name;
  el.text().textContent = '';
  el.next().classList.remove('on');
}

// 毎フレーム呼ぶ
export function updateTalk(dt) {
  if (!queue) return;
  if (queue.shown < queue.full.length) {
    queue.shown = Math.min(queue.full.length, queue.shown + dt * CPS);
    el.text().textContent = queue.full.slice(0, Math.floor(queue.shown));
    if (queue.shown >= queue.full.length) el.next().classList.add('on');
  }
}

// タップされたとき
export function advanceTalk() {
  if (!queue) return;
  if (queue.shown < queue.full.length) {
    queue.shown = queue.full.length;
    el.text().textContent = queue.full;
    el.next().classList.add('on');
  } else {
    nextLine();
  }
}

export function setPlace(name) {
  document.getElementById('place').textContent = name;
}

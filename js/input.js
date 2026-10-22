// 指をすべらせて歩く／タップで しらべる
// 画面のどこを押しても、そこが スティックの まんなかになる。

const DEAD = 8;        // これより 小さい動きは「タップ」
const RADIUS = 44;     // スティックの 半径（CSSピクセル）

export const input = {
  dx: 0, dy: 0,        // 歩く向き（長さ 0〜1）
  taps: [],            // たまった タップ
  moved: false,        // いちどでも 歩いたか
};

const keys = new Set();

export function initInput(root) {
  const stick = document.getElementById('stick');
  const knob = document.getElementById('knob');
  let pid = null, ox = 0, oy = 0, t0 = 0, dragging = false;

  const reset = () => {
    pid = null; dragging = false;
    input.dx = 0; input.dy = 0;
    stick.classList.remove('on');
    knob.style.transform = '';
  };

  root.addEventListener('pointerdown', e => {
    if (pid !== null) return;
    if (e.target.closest && e.target.closest('button')) return; // ボタンは べつあつかい
    if (e.target.closest && e.target.closest('#menu')) return;   // メニューの なかは 歩かない（スクロール用）
    pid = e.pointerId; ox = e.clientX; oy = e.clientY; t0 = performance.now();
    dragging = false;
    stick.style.left = ox + 'px'; stick.style.top = oy + 'px';
  });

  root.addEventListener('pointermove', e => {
    if (e.pointerId !== pid) return;
    let vx = e.clientX - ox, vy = e.clientY - oy;
    let len = Math.hypot(vx, vy);
    if (!dragging && len < DEAD) return;
    dragging = true;
    // 指が 遠くへ行ったら、スティックが ついてくる
    if (len > RADIUS) {
      ox = e.clientX - vx / len * RADIUS; oy = e.clientY - vy / len * RADIUS;
      vx = e.clientX - ox; vy = e.clientY - oy; len = RADIUS;
      stick.style.left = ox + 'px'; stick.style.top = oy + 'px';
    }
    stick.classList.add('on');
    knob.style.transform = `translate(${vx}px, ${vy}px)`;
    const mag = Math.min(1, Math.max(0, (len - DEAD * 0.5) / (RADIUS * 0.6)));
    input.dx = vx / len * mag; input.dy = vy / len * mag;
    input.moved = true;
  });

  const end = e => {
    if (e.pointerId !== pid) return;
    if (!dragging && performance.now() - t0 < 500) input.taps.push({ x: e.clientX, y: e.clientY });
    reset();
  };
  root.addEventListener('pointerup', end);
  root.addEventListener('pointercancel', end);

  // iPhoneで 画面が動いたり 拡大したり しないように
  // ただし メニューの 中身は 指で スクロールできるように する
  document.addEventListener('touchmove', e => {
    if (e.target.closest && e.target.closest('#mbody')) return;
    e.preventDefault();
  }, { passive: false });
  document.addEventListener('gesturestart', e => e.preventDefault());
  document.addEventListener('dblclick', e => e.preventDefault());

  // パソコンで ためす用
  addEventListener('keydown', e => {
    keys.add(e.key);
    if (e.key === ' ' || e.key === 'Enter' || e.key === 'z') input.taps.push({ key: true });
  });
  addEventListener('keyup', e => keys.delete(e.key));
}

export function readKeys() {
  let x = 0, y = 0;
  if (keys.has('ArrowLeft')) x -= 1;
  if (keys.has('ArrowRight')) x += 1;
  if (keys.has('ArrowUp')) y -= 1;
  if (keys.has('ArrowDown')) y += 1;
  if (x || y) {
    const l = Math.hypot(x, y);
    return [x / l, y / l];
  }
  return null;
}

export function takeTap() {
  return input.taps.shift();
}

// 見える2 ─ はじまり
import { Field } from './field.js';
import { MAPS } from './maps/index.js';
import { T } from './tiles.js';
import { initInput, input, readKeys, takeTap } from './input.js';
import { say, ask, isTalking, updateTalk, advanceTalk, setPlace, fade } from './ui.js';
import { BattleView } from './battle/view.js';
import { AREAS } from './battle/areas.js';
import { game, restAll, joinParty, newGame, newGameChapter2, enterChapter2, autoSave, saveGame, latestSave, loadSave } from './game.js';
import { currentStory } from './story/index.js';
import { openMenu, isMenuOpen } from './menu.js';

const app = document.getElementById('app');
const screenEl = document.getElementById('screen');
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const hint = document.getElementById('hint');
const place = document.getElementById('place');
const title = document.getElementById('title');
const menuBtn = document.getElementById('menubtn');

let W = 256, H = 256;
let field = null;
let battleView = null;
let mode = 'title';   // title / field / battle
let busy = false;     // 会話や イベントの あいだは 歩けない

// 画面の大きさを決める。ドットが にじまないよう、
// 実際の画面の ピクセルに対して 整数倍で ひきのばす。
function resize() {
  const dpr = window.devicePixelRatio || 1;
  const appRect = app.getBoundingClientRect();
  const style = getComputedStyle(app);
  const innerW = appRect.width - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
  const innerH = appRect.height - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
  let cssH = Math.round(Math.min(innerH * 0.58, innerW * 1.3));
  // 戦闘中は、下の 戦闘画面（4人の 箱・メッセージ・ボタン）が ぜんぶ 入るように 上の 絵を ちぢめる
  if (mode === 'battle') {
    const ui = document.getElementById('battleui'), panel = document.getElementById('panel');
    const ps = getComputedStyle(panel), us = getComputedStyle(ui);
    const need = ui.offsetHeight + parseFloat(us.marginTop) + parseFloat(ps.paddingTop) + parseFloat(ps.paddingBottom) + parseFloat(ps.borderTopWidth) + 4;
    cssH = Math.max(Math.round(innerH * 0.3), Math.min(cssH, Math.floor(innerH - need)));
  }
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
  if (mode !== 'title') game.playSec += dt;

  let tap;
  while ((tap = takeTap())) {
    if (mode !== 'field' || isMenuOpen()) continue;
    if (isTalking()) advanceTalk();
    else if (!busy) {
      const res = field.interact();
      if (res) runEvent(() => currentStory().onTalk(res.target, res.lines, api));
    }
  }

  if (mode === 'field' && field) {
    const frozen = busy || isTalking() || isMenuOpen();
    const stick = frozen ? null : readKeys() || (input.dx || input.dy ? [input.dx, input.dy] : null);
    field.update(dt, stick, frozen);
    updateTalk(dt);
    hint.classList.toggle('hidden', isTalking() || busy);
    hint.classList.toggle('off', input.moved);
    menuBtn.classList.toggle('hidden', busy || isTalking());
    if (!busy) {
      if (field.warp) { const w = field.warp; field.warp = null; runEvent(() => api.goto(w.to, w.tx, w.ty, w.dir)); }
      else if (field.trigger) { const t = field.trigger; field.trigger = null; runEvent(() => currentStory().onTrigger(t.id, api)); }
      else if (field.encounter) { const s = field.encounter; runEvent(() => fieldBattle(s)); }
    }
    field.draw(ctx, W, H);
  } else if (mode === 'battle') {
    battleView.update(dt);
    battleView.draw(ctx, W, H);
  }
  requestAnimationFrame(frame);
}

// イベント（会話や 物語）を ひとつずつ 動かす
async function runEvent(fn) {
  if (busy) return;
  busy = true;
  try { await fn(); } catch (e) { console.error(e); }
  busy = false;
  if (mode === 'field') { rememberPos(); autoSave(); }
}

function rememberPos() {
  const p = field.player;
  game.map = field.id;
  game.pos = { x: p.x, y: p.y, dir: p.dir };
}

const sleep = ms => new Promise(r => setTimeout(r, ms));
const followerIds = () => game.partyIds.filter(id => id !== 'shimeru');

// マップを 読みこむ（tx, ty はタイル単位。pos はドット単位）
function loadMap(id, opts = {}) {
  document.getElementById('version').textContent = game.chapter === 2 ? '第二章' : '第一章';
  const data = MAPS[id]();
  const start = opts.pos ? opts.pos
    : opts.tx != null ? { x: opts.tx * T + 8, y: opts.ty * T + 12, dir: opts.dir || 'down' } : null;
  field = new Field(data, { followers: followerIds(), start });
  setPlace(data.name);
  game.map = id;
  rememberPos();
}

// 戦闘（マップの 妖怪シンボルに ぶつかった）
async function fieldBattle(sym) {
  field.encounter = null;
  const groups = AREAS[sym.area];
  const res = await api.battle(groups[Math.floor(Math.random() * groups.length)], sym.area);
  if (res === 'win') field.defeat(sym);
}

// ───────── 物語から つかう 道具 ─────────
const api = {
  say, ask, fade,
  wait: ms => sleep(ms),
  get field() { return field; },
  walk: (id, tx, ty, speed) => field.walkTo(id, tx, ty, speed),
  face(id, dir) { const a = field.actor(id); if (a) a.dir = dir; },
  emote: (id, kind, sec) => field.emote(id, kind, sec),
  add: def => field.addActor(def),
  remove: id => field.removeActor(id),
  hide(id, on = true) { const a = field.actor(id); if (a) a.hidden = on; },
  tint(t) { field.tint = t; },
  addBig: (id, look, tx, ty, dark) => field.addBig(id, look, tx, ty, dark),
  removeBig: id => field.removeBig(id),
  tp(tx, ty, dir) { field.teleport(tx * T + 8, ty * T + 12, dir); },
  // 別の マップへ（フェードつき）
  async goto(id, tx, ty, dir) {
    await fade(true);
    loadMap(id, { tx, ty, dir });
    await sleep(150);
    await fade(false);
    await currentStory().onEnter(id, api);
  },
  // 物語を 進めて、いまの マップを 作りなおす
  setPhase(p) {
    game.phase = p;
    const pos = { x: field.player.x, y: field.player.y, dir: field.player.dir };
    loadMap(field.id, { pos });
  },
  reload() { const p = field.player; loadMap(field.id, { pos: { x: p.x, y: p.y, dir: p.dir } }); },
  join(id) { joinParty(id); field.setFollowers(followerIds()); },
  setFollowersHere() { field.setFollowers(followerIds()); },
  flag(k, v = true) { game.flags[k] = v; },
  has: k => !!game.flags[k],
  restHere() {
    restAll();
    const p = field.player;
    game.rest = { map: field.id, x: p.x, y: p.y, dir: p.dir };
  },
  save: () => saveGame(),
  // 戦闘。'win' か 'lose' を返す。負けたら 最後に 休んだ場所へ
  async battle(group, area, opts = {}) {
    for (let i = 0; i < 3; i++) {
      canvas.style.filter = 'invert(1)'; await sleep(70);
      canvas.style.filter = ''; await sleep(70);
    }
    mode = 'battle';
    place.classList.add('hidden');
    hint.classList.add('hidden');
    menuBtn.classList.add('hidden');
    const running = battleView.run(group, area);
    resize();
    const result = await running;
    place.classList.remove('hidden');
    if (result === 'win') { mode = 'field'; resize(); return 'win'; }
    if (opts.noLoseReturn) { mode = 'field'; resize(); return 'lose'; }
    await fade(true);
    mode = 'field';
    resize();
    restAll();
    const r = game.rest || { map: 'miramar', x: 15.5 * T + 8, y: 12 * T + 12, dir: 'down' };
    loadMap(r.map, { pos: { x: r.x, y: r.y, dir: r.dir } });
    field.escape();
    await sleep(500);
    await fade(false);
    await say(['……気がつくと、 最後に 休んだ 場所に いた。', 'その たたかいで おきた 覚醒は、 ゆめのように きえてしまった。']);
    return 'lose';
  },
  sleep,
  // 第二章を はじめる（一章の 強さは そのまま）
  async startChapter2() {
    await fade(true);
    enterChapter2();
    loadMap(currentStory().startMap);
    await sleep(300);
    await fade(false);
    await currentStory().onNewGame(api);
  },
  refreshLooks() { field.refreshLooks(); },
};

// ───────── タイトル ─────────
function showTitle() {
  mode = 'title';
  const save = latestSave();
  const cont = document.getElementById('tcontinue');
  cont.classList.toggle('hidden', !save);
  if (save) {
    const m = Math.floor((save.playSec || 0) / 60);
    document.getElementById('tcontinue').querySelector('small').textContent = `${Math.floor(m / 60)}時間${m % 60}分`;
  }
}

async function startGame(fromSave, chapter2) {
  title.classList.add('fade');
  setTimeout(() => title.classList.add('hidden'), 900);
  input.taps.length = 0;
  if (fromSave) {
    loadSave(fromSave);
    loadMap(game.map, game.pos ? { pos: game.pos } : {});
  } else if (chapter2) {
    newGameChapter2();
    loadMap(currentStory().startMap);
  } else {
    newGame();
    loadMap('miramar');
  }
  mode = 'field';
  await sleep(600);
  runEvent(() => (fromSave ? currentStory().onResume(api) : currentStory().onNewGame(api)));
}

async function boot() {
  try { await document.fonts.load('16px DotGothic16'); } catch (e) { /* フォントがなくても 動く */ }
  resize();
  addEventListener('resize', resize);
  // iPhoneは 向きを変えたあと 少しおくれて 大きさが決まる
  addEventListener('orientationchange', () => setTimeout(resize, 300));

  battleView = new BattleView();
  window.__mieru = { get field() { return field; }, game, get mode() { return mode; }, get battle() { return battleView.battle; }, api, get busy() { return busy; } }; // テスト用
  initInput(document.body);

  // ホーム画面から ひらいていれば「ホーム画面に追加」の案内は いらない
  if (navigator.standalone || matchMedia('(display-mode: standalone)').matches) {
    document.getElementById('a2hs').classList.add('hidden');
  }

  showTitle();
  document.getElementById('tnew').addEventListener('click', async () => {
    if (latestSave()) {
      if (!confirm('はじめから あそびますか？\n（つづきの セーブは、 つぎに セーブするまで のこります）')) return;
    }
    startGame(null);
  });
  document.getElementById('tcontinue').addEventListener('click', () => startGame(latestSave()));
  document.getElementById('tch2').addEventListener('click', () => {
    if (latestSave() && !confirm('第二章から あそびますか？\n（一章を クリアしたくらいの 強さで はじまります）')) return;
    startGame(null, true);
  });
  menuBtn.addEventListener('click', () => { if (mode === 'field' && !busy && !isTalking()) openMenu(api); });

  requestAnimationFrame(t => { last = t; frame(t); });
}

boot();

// ゲーム全体の 状態（仲間・物語の進み具合・仲良し度・セーブ）
import { newMember, growMember } from './battle/core.js';
import { rng } from './util.js';

export const MAX_CHEERS = 3;
const SAVE_KEY = 'mieru2.save';
const AUTO_KEY = 'mieru2.auto';

export const game = {
  chapter: 1,         // いまの 章
  phase: 0,           // 物語の 進み具合（章ごと）
  flags: {},
  members: {},        // 仲間全員（パーティーに いない子も）
  partyIds: ['shimeru'],
  get party() { return this.partyIds.map(id => this.members[id]); },
  cheers: MAX_CHEERS,
  speed: 1,           // はやおくり（1・2・4）
  naka: {},           // 仲良し度 { 'elesia|shimeru': 点数 }
  map: 'miramar',
  pos: null,          // { x, y, dir }（ドット単位）
  rest: null,         // 最後に 休んだ場所 { map, x, y, dir }
  diary: [],          // 読める日記
  bedTalks: {},       // 見た ベッドトーク
  looks: {},          // 見た目の いれかえ { shimeru: 'shimeru_nr' } など
  playSec: 0,
};

export function newGame() {
  Object.assign(game, {
    chapter: 1, phase: 0, flags: {}, partyIds: ['shimeru'], cheers: MAX_CHEERS, naka: {},
    map: 'miramar', pos: null, rest: null, diary: [], bedTalks: {}, looks: {}, playSec: 0,
  });
  game.members = {};
  for (const id of ['shimeru', 'elesia', 'meina', 'sakura']) game.members[id] = newMember(id);
}

// 第二章へ（一章の 強さや 仲良し度は そのまま）
export function enterChapter2() {
  Object.assign(game, { chapter: 2, phase: 0, flags: {}, partyIds: ['shimeru', 'elesia', 'meina'], rest: null, pos: null, looks: {} });
  // 二章で 仲間になる サクラは、3人と 同じくらいの 強さで 来る
  const avg = Math.round(['shimeru', 'elesia', 'meina'].reduce((s, id) => s + game.members[id].awaken, 0) / 3);
  game.members.sakura = growMember(newMember('sakura'), Math.max(60, avg + 4), rng(777));
  restAll();
}

// タイトルの「第二章から」：一章を クリアしたくらいの 強さで はじめる
export function newGameChapter2() {
  newGame();
  const r = rng(4242);
  for (const id of ['shimeru', 'elesia', 'meina']) growMember(game.members[id], 82, r);
  for (const [a, b] of [['shimeru', 'elesia'], ['shimeru', 'meina'], ['elesia', 'meina']]) addNaka(a, b, 95);
  game.diary = ['d1', 'd2', 'e1', 'd3', 'm1', 'd4', 'e2'];
  enterChapter2();
}
newGame();

export function joinParty(id) {
  if (!game.partyIds.includes(id)) game.partyIds.push(id);
}

// 休む：全回復して、おうえんも もどる
export function restAll() {
  for (const m of Object.values(game.members)) { m.hp = m.max.hp; m.mp = m.max.mp; }
  game.cheers = MAX_CHEERS;
}

// ───────── 仲良し度（見える1と同じ） ─────────
export const HEART_STEPS = [30, 80, 150, 250, 380, 530, 680, 830, 920, 1000];
export const pairKey = (a, b) => [a, b].sort().join('|');
export function addNaka(a, b, n) {
  if (a === b) return;
  const k = pairKey(a, b);
  game.naka[k] = Math.min(1000, (game.naka[k] || 0) + n);
}
export function hearts(a, b) {
  const p = game.naka[pairKey(a, b)] || 0;
  return HEART_STEPS.filter(s => p >= s).length;
}

// ───────── セーブ ─────────
function snapshot() {
  return {
    v: 1, time: Date.now(), chapter: game.chapter, looks: game.looks,
    phase: game.phase, flags: game.flags, members: game.members, partyIds: game.partyIds,
    cheers: game.cheers, naka: game.naka, map: game.map, pos: game.pos, rest: game.rest,
    diary: game.diary, bedTalks: game.bedTalks, playSec: game.playSec, speed: game.speed,
  };
}

function apply(d) {
  newGame();
  Object.assign(game, {
    chapter: d.chapter || 1, looks: d.looks || {},
    phase: d.phase, flags: d.flags || {}, partyIds: d.partyIds, cheers: d.cheers, naka: d.naka || {},
    map: d.map, pos: d.pos, rest: d.rest, diary: d.diary || [], bedTalks: d.bedTalks || {}, playSec: d.playSec || 0, speed: d.speed || 1,
  });
  for (const [id, m] of Object.entries(d.members)) game.members[id] = m;
}

function write(key) {
  try { localStorage.setItem(key, JSON.stringify(snapshot())); return true; } catch (e) { return false; }
}
function read(key) {
  try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : null; } catch (e) { return null; }
}

export const saveGame = () => write(SAVE_KEY);
export const autoSave = () => write(AUTO_KEY);

// タイトルで「つづきから」に 出すもの（新しい ほう）
export function latestSave() {
  const a = read(SAVE_KEY), b = read(AUTO_KEY);
  if (!a) return b; if (!b) return a;
  return a.time >= b.time ? a : b;
}
export function loadSave(d) { apply(d); }

// おまもり：ファイルに 書き出す／読み込む
export function exportSave() {
  const blob = new Blob([JSON.stringify(snapshot(), null, 1)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const d = new Date();
  a.href = url;
  a.download = `mieru2-save-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}.json`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
export function importSave(file) {
  return file.text().then(t => {
    const d = JSON.parse(t);
    if (!d || d.v !== 1 || !d.members) throw new Error('bad');
    apply(d);
    saveGame();
  });
}

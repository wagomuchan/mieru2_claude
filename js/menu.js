// メニュー（きろく・なかま・なかよし・セーブ）
import { game, hearts, HEART_STEPS, pairKey, saveGame, exportSave, importSave } from './game.js';
import { PARTY_DEFS, SKILLS, STAT_NAMES } from './battle/data.js';
import { getFaces } from './ui.js';
import { paintPortrait } from './portraits.js';
import { currentStory, allDiary } from './story/index.js';

const $ = id => document.getElementById(id);
let open = false;
export const isMenuOpen = () => open;

const TABS = [
  ['kiroku', 'きろく'],
  ['nakama', 'なかま'],
  ['nakayoshi', 'なかよし'],
  ['save', 'セーブ'],
];

export function openMenu() {
  open = true;
  $('menu').classList.remove('hidden');
  const tabs = $('mtabs');
  tabs.innerHTML = '';
  for (const [id, label] of TABS) {
    const b = document.createElement('button');
    b.className = 'btn';
    b.textContent = label;
    b.addEventListener('click', () => show(id));
    b.dataset.tab = id;
    tabs.appendChild(b);
  }
  show('kiroku');
}

function close() {
  open = false;
  $('menu').classList.add('hidden');
}
$('mclose').addEventListener('click', close);

function show(tab) {
  for (const b of $('mtabs').children) b.classList.toggle('on', b.dataset.tab === tab);
  const body = $('mbody');
  body.innerHTML = '';
  body.scrollTop = 0;
  ({ kiroku, nakama, nakayoshi, save })[tab](body);
}

const el = (tag, cls, text) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
};

// ───────── きろく ─────────
function kiroku(body) {
  body.appendChild(el('div', 'mh', 'いまの もくひょう'));
  body.appendChild(el('div', 'goal', currentStory().goal()));
  body.appendChild(el('div', 'mh', 'こうかん日記'));
  // 書かれた じゅんばんに ならべる
  const entries = game.diary.map(id => allDiary().find(d => d.id === id)).filter(Boolean);
  if (!entries.length) body.appendChild(el('div', 'mnote', '（まだ なにも かいていない）'));
  for (const d of entries) {
    const b = el('button', 'btn diary-item', d.title);
    b.addEventListener('click', () => {
      body.innerHTML = '';
      body.appendChild(el('div', 'mh', d.title));
      body.appendChild(el('div', 'diary-text', d.text));
      const back = el('button', 'btn mbtn', 'もどる');
      back.addEventListener('click', () => show('kiroku'));
      body.appendChild(back);
    });
    body.appendChild(b);
  }
}

// ───────── なかま ─────────
function nakama(body) {
  for (const id of game.partyIds) {
    const m = game.members[id], def = PARTY_DEFS[id];
    const box = el('div', 'member');
    const cv = document.createElement('canvas');
    paintPortrait(cv, getFaces(def.face).normal, 56);
    box.appendChild(cv);
    box.appendChild(el('div', 'mname', `${def.name}　${def.job}・${def.personality}`));
    box.appendChild(el('div', 'mstats',
      `覚醒 ${m.awaken}回\nHP ${m.hp}/${m.max.hp}　MP ${m.mp}/${m.max.mp}\n` +
      ['atk', 'def', 'mag', 'spd'].map(k => `${STAT_NAMES[k]} ${m.max[k]}`).join('　')));
    box.lastChild.style.whiteSpace = 'pre-wrap';
    box.appendChild(el('div', 'mskills', 'わざ：' + m.skills.map(s => SKILLS[s].name).join('、')));
    body.appendChild(box);
  }
  body.appendChild(el('div', 'mnote', `おうえん：のこり ${game.cheers}回`));
}

// ───────── なかよし ─────────
function nakayoshi(body) {
  const ids = game.partyIds;
  if (ids.length < 2) { body.appendChild(el('div', 'mnote', '（まだ なかまが いない）')); return; }
  body.appendChild(el('div', 'mnote', 'いっしょに 戦ったり、 同じ テントで ねたり すると、 すこしずつ なかよくなる。'));
  for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) {
    const a = ids[i], b = ids[j];
    const row = el('div', 'pair');
    for (const id of [a, b]) {
      const cv = document.createElement('canvas');
      paintPortrait(cv, getFaces(PARTY_DEFS[id].face).normal, 32);
      row.appendChild(cv);
    }
    const h = hearts(a, b);
    const hs = el('div', 'hearts');
    for (let k = 0; k < 10; k++) hs.appendChild(el('span', k < h ? '' : 'off', '♥'));
    const pts = game.naka[pairKey(a, b)] || 0;
    const next = HEART_STEPS[h];
    const info = el('div', 'mnote', next ? `つぎの ハートまで ${next - pts}` : 'これ以上ないくらい なかよし！');
    const col = el('div');
    col.appendChild(el('div', null, `${PARTY_DEFS[a].name} と ${PARTY_DEFS[b].name}`));
    col.appendChild(hs);
    col.appendChild(info);
    row.appendChild(col);
    body.appendChild(row);
  }
}

// ───────── セーブ ─────────
function save(body) {
  body.appendChild(el('div', 'mnote', 'セーブは iPhoneの なかに のこります。 とちゅうで やめるときも、 ここで セーブしてね。'));
  const s = el('button', 'btn mbtn', 'セーブする');
  const msg = el('div', 'mnote');
  s.addEventListener('click', () => { msg.textContent = saveGame() ? 'セーブしました！' : 'セーブできませんでした……'; });
  body.appendChild(s);
  body.appendChild(msg);

  body.appendChild(el('div', 'mh', 'おまもり（バックアップ）'));
  body.appendChild(el('div', 'mnote', '機種変更や、 うっかり消えたときのために、 セーブを ファイルにして 「ファイル」アプリに しまっておけます。'));
  const ex = el('button', 'btn mbtn', 'ファイルに 書き出す');
  ex.addEventListener('click', () => exportSave());
  body.appendChild(ex);
  const im = el('button', 'btn mbtn', 'ファイルから 読み込む');
  const file = document.createElement('input');
  file.type = 'file'; file.accept = '.json,application/json'; file.style.display = 'none';
  file.addEventListener('change', () => {
    const f = file.files[0];
    if (!f) return;
    importSave(f).then(() => { alert('読み込みました！ タイトルに もどります。'); location.reload(); })
      .catch(() => alert('このファイルは 読み込めませんでした。'));
  });
  im.addEventListener('click', () => file.click());
  body.appendChild(im);
  body.appendChild(file);
}

// 第一章「うそつきと 歌姫」
// 物語の 場面（イベント）を ここに まとめる。
// a は main.js の api（say・walk・battle など）。
import { game, addNaka, hearts } from '../game.js';
import { PH } from './phase.js';

const ME = 'シメール', EL = 'エレシア', MA = 'メイナ';
const CAMP_REST = { tx: 15, ty: 11, dir: 'down' };   // テントの まえ

const avgAwaken = () => game.party.reduce((s, m) => s + m.awaken, 0) / game.party.length;
const addDiary = id => { if (!game.diary.includes(id)) game.diary.push(id); };

export const story = {
  startMap: 'miramar',
  // ───────── はじめから ─────────
  async onNewGame(a) {
    await a.wait(300);
    await a.say([
      '港町ミラマールの 朝は、 カモメの 声と 魚の においで はじまる。',
      `${ME}|（きょうも いい てんき。）`,
      `${ME}@smile|（カモが……じゃなくて、 おきゃくさんが たくさん 来そうな 日。）`,
    ]);
    // 足もとを 妖怪が 横切る
    a.add({ id: 'pass', yokai: true, x: 1, y: 9, dir: 'right' });
    await a.walk('pass', 8, 9, 0.6);
    a.emote('shimeru', '…', 1.5);
    await a.say([
      `${ME}|（……見えない 見えない。 わたしには なにも 見えない。）`,
      '？？？|ぷぅ？',
    ]);
    await a.walk('pass', 14, 9, 0.6);
    a.remove('pass');
    await a.say([`${ME}|（さあ、 市場の 屋台を ひらきに 行こう。）`]);
  },

  async onResume(a) {
    if (game.phase === PH.END) await offerChapter2(a);
  },

  async onEnter(mapId, a) {
    if (mapId === 'lh1' && !a.has('lhIn')) {
      a.flag('lhIn');
      await a.say([
        '灯台の なかは、 ひんやりと していた。',
        `${EL}|……なかにも ようかいが いるわ。 気を つけて。`,
        `${MA}|てっぺんまで 3かい。 ガハハ、 いい 運動だ。`,
      ]);
    }
    if (mapId === 'lhtop' && game.phase === PH.TOWER && !a.has('topIn')) {
      a.flag('topIn');
      await a.say(['灯台の てっぺん。 つめたい 夜風が ふいている。', 'あかりの 消えた レンズの そばに、 大きな 巣が ある。']);
    }
  },

  // ───────── 場所に 入ったとき ─────────
  async onTrigger(id, a) {
    if (id === 'camp' && game.phase === PH.TROUPE && !a.has('campSeen')) {
      a.flag('campSeen');
      await a.say([
        '北の ひろばに、 しましまの テントと 大きな 馬車が とまっている。',
        `${ME}|（わあ……。）`,
        `${ME}|（……あれ？ テントの まわりにだけ、 ようかいが ぜんぜん いない。）`,
        `${ME}|（めずらしいな。）`,
      ]);
    }
    if (id === 'boss' && game.phase === PH.TOWER) await bossEvent(a);
  },

  // ───────── 話しかけたとき ─────────
  async onTalk(t, lines, a) {
    const act = t.action;
    if (act === 'stall' && game.phase === PH.MORNING) return stallMorning(a);
    if (act === 'stall' && game.phase === PH.CURSE) return stallCurse(a);
    if (act === 'show') return showEvent(a, lines);
    if (act === 'rest') return restAtTent(a);
    if (act === 'guide') return guideEvent(a);
    if (act && act.startsWith('clue_')) return clueTalk(a, act, lines);
    // 一座の子に 話しかけると、なかよしの にこにこ
    await a.say(lines);
  },

  goal,
  diary: DIARY(),
};

// ───────── 朝：くすりを 売る ─────────
async function stallMorning(a) {
  await a.say([`${ME}|（よし、 屋台を ひらこう。）`]);
  a.face('shimeru', 'up');
  a.add({ id: 'cust', look: 'customer', x: 16, y: 21, dir: 'right', name: '旅の おきゃくさん' });
  await a.walk('cust', 22, 21, 0.7);
  a.face('cust', 'right');
  await a.say([
    `${ME}@smile|いらっしゃい いらっしゃい！ ミラマール名物、 「なんでも なおる ふしぎな くすり」 だよ！`,
    '旅の おきゃくさん|なんでも？ ……かたこりにも？',
    `${ME}@smile|かたこりにも！ こしいたにも！ 失恋にも！`,
    '旅の おきゃくさん|失恋にも!?',
    `${ME}|……失恋は、 飲んだあと 3日くらい 泣くと なおります。`,
    '旅の おきゃくさん|それ、 くすり 関係ある？',
    `${ME}@smile|あります！ 泣く ちからが わいてくるんです！`,
    '旅の おきゃくさん|……ふふ。 おもしろい子。 ひとつ ちょうだい。',
    'くすりが ひとつ 売れた！',
    `${ME}@smile|（……ちょろい。）`,
    `${ME}@sad|（……でも、 ちょっとだけ むねが ちくっと する。）`,
  ]);
  await a.walk('cust', 16, 21, 0.7);
  a.remove('cust');
  // 町の 女の子が かけてくる
  a.add({ id: 'kid', look: 'child', x: 21, y: 15, dir: 'down' });
  await a.walk('kid', 21, 20, 1.2);
  a.face('kid', 'right');
  a.emote('kid', '!', 1.2);
  await a.say([
    '町の 女の子|シメール！ たいへん たいへん！',
    '町の 女の子|旅の 一座が 来たよ！ 北の ひろばに、 しましまの テントが あるの！',
    `${ME}|旅の 一座……？`,
    `${ME}|（人が あつまる ところは、 くすりも 売れる。）`,
    `${ME}@smile|（……見に 行ってみよう。）`,
  ]);
  await a.walk('kid', 21, 14, 1.2);
  a.remove('kid');
  a.setPhase(PH.TROUPE);
}

// ───────── 夜の 公演 ─────────
async function showEvent(a, lines) {
  await a.say(lines);
  const pick = await a.ask(['ロザ|公演は 日が しずんでから。 ……見ていく？'], ['見る', 'あとで']);
  if (pick !== 0) { await a.say(['ロザ|まってるわね！']); return; }
  await a.fade(true);
  const f = a.field;
  a.tint('night');
  // 客席に 町の人と……
  f.teleport(22 * 16 + 8, 8 * 16 + 12, 'up');
  for (const id of ['rosa', 'pipi', 'nono', 'meina_npc']) a.hide(id);
  const crowd = [
    ['c1', 'clothgirl', 20, 9], ['c2', 'child', 24, 8], ['c3', 'baker', 26, 8], ['c4', 'granny', 20, 8],
    ['c5', 'gossip', 28, 8], ['c6', 'sailor', 23, 8], ['c7', 'guard', 19, 8],
  ];
  for (const [id, look, x, y] of crowd) a.add({ id, look, x, y, dir: 'up' });
  a.add({ id: 'stage_meina', look: 'meina', x: 24, y: 7, dir: 'down', lift: 14 });
  await a.wait(300);
  await a.fade(false);
  await a.say([
    '夜。 ひろばは 町の人で いっぱいに なった。',
    `${MA}@smile|ガハハ！ ミラマールの みなさん、 今夜は よく 来てくれた！`,
    `${MA}@smile|旅の一座 「ルミエール」、 開演だよ！`,
  ]);
  await a.walk('stage_meina', 23, 7, 1);
  a.add({ id: 'stage_elesia', look: 'elesia', x: 28, y: 7, dir: 'left', lift: 14 });
  await a.walk('stage_elesia', 25.5, 7, 0.6);
  a.face('stage_elesia', 'down');
  await a.say([
    '青い ドレスの 少女が、 ぶたいの まんなかに 立った。',
    `${EL}@smile|……みなさん、 こんばんは。 歌姫の エレシアです。`,
  ]);
  a.emote('stage_elesia', '♪', 3);
  await a.say(['エレシアが 歌いはじめた。', 'すきとおった 声が、 夜の 港に ひろがっていく。']);
  // 妖怪が あつまってくる
  const spots = [[18, 7], [18, 9], [25, 8], [27, 9], [19, 7], [28, 7], [21, 10], [29, 8]];
  for (let i = 0; i < spots.length; i++) {
    const [x, y] = spots[i];
    a.add({ id: 'sy' + i, yokai: true, x, y, dir: 'up' });
    a.emote('sy' + i, '♪', 2.5);
    await a.wait(180);
  }
  a.emote('shimeru', '!', 1.5);
  await a.say([
    `${ME}@surprise|（……！ ようかいが、 どんどん あつまってくる！）`,
    `${ME}|（町の人は だれも 気づいていない。 ようかいたちは、 うっとり 歌を きいている。）`,
    `${ME}|（……こんなに たくさん。 あの人、 こわく ないのかな。）`,
  ]);
  a.emote('stage_elesia', '…', 1.5);
  await a.say(['そのとき。', '歌姫が ほんの いっしゅん、 客席の ようかいたちを 見て――']);
  a.face('stage_elesia', 'left');
  await a.wait(500);
  a.emote('shimeru', '!', 1.5);
  await a.say([
    'それから、 シメールを 見て ほほえんだ。',
    `${ME}@shy|（……え？）`,
    `${ME}@shy|（いま、 わたしを 見た？）`,
    `${ME}@shy|（まるで 「あなたにも 見えてるでしょう」 って 言うみたいに。）`,
    'われるような 拍手の なか、 公演は おわった。',
  ]);
  await a.fade(true);
  for (const [id] of crowd) a.remove(id);
  for (let i = 0; i < spots.length; i++) a.remove('sy' + i);
  a.remove('stage_meina'); a.remove('stage_elesia');
  f.teleport(4 * 16 + 8, 8 * 16 + 12, 'down');
  await a.wait(400);
  await a.fade(false);
  await a.say([
    'その夜、 シメールは なかなか ねむれなかった。',
    `${ME}@think|（あの 歌姫さん……。）`,
    `${ME}@think|（もしかして、 わたしと おなじ……？）`,
  ]);
  addDiary('d1');
  await a.fade(true);
  a.setPhase(PH.CURSE);
  a.tint(null);
  await a.wait(500);
  await a.fade(false);
  await a.say([
    'つぎの 朝。',
    `${ME}|（ふわあ……。 きょうも 屋台を ひらかなきゃ。）`,
    `${ME}|（……なんだか、 町が ざわざわ してる。）`,
  ]);
}

// ───────── うそが つけない 屋台 ─────────
async function stallCurse(a) {
  a.face('shimeru', 'up');
  a.add({ id: 'cust', look: 'customer', x: 16, y: 21, dir: 'right', name: '旅の おきゃくさん' });
  await a.walk('cust', 22, 21, 0.7);
  a.face('cust', 'right');
  await a.say([
    '旅の おきゃくさん|きのうの くすり、 ちっとも きかなかったよ。',
    '旅の おきゃくさん|……でも おもしろかったから、 もう ひとつ ちょうだい。 こんどは ほんとに きくやつ。',
    `${ME}@smile|まいど！ こちら、 王都の 名医が 三日三晩 かけて つくった――`,
    `${ME}|――井戸の 水に、 イチゴの しるを まぜた ものです。`,
  ]);
  a.emote('shimeru', '!', 1.2);
  await a.say([
    '旅の おきゃくさん|……え？',
    `${ME}@surprise|（え!? いま わたし、 なんて 言った!?）`,
    `${ME}@surprise|ち、 ちがうんです！ これは なんでも なおる―― なにも なおらない くすりで――`,
    `${ME}@surprise|（口が、 かってに……！）`,
    '旅の おきゃくさん|……正直なのは いいことだけど、 さすがに 買えないねえ。',
  ]);
  await a.walk('cust', 16, 21, 0.9);
  a.remove('cust');
  await a.say([
    `${ME}@sad|（うそが…… つけない？）`,
    `${ME}@think|（そういえば 町の人も、 けさから みんな 本当のこと ばかり 言ってる……。）`,
  ]);
  // フードの 少女
  a.add({ id: 'hoodel', look: 'elesia', x: 28, y: 21, dir: 'left', name: 'フードの 少女' });
  await a.walk('hoodel', 25, 21, 0.6);
  a.face('hoodel', 'left');
  await a.say([
    'フードを かぶった 少女が、 屋台の まえに 立った。',
    'フードの 少女|……くすりを ひとつ、 いただける？',
    `${ME}@sad|……これ、 ただの 色水です。 なにも なおりません。`,
    'フードの 少女|知ってる。',
    'フードの 少女|……あなた、 見えてるでしょう。 ゆうべ、 客席の ようかいたちが。',
    `${ME}@surprise|みっ、 見え…… 見え……`,
    `${ME}@sad|……見えてます。`,
    `${ME}@surprise|（言っちゃった……！）`,
    'フードの 少女は、 フードを そっと おろした。',
    '銀色の 髪が、 さらりと こぼれた。',
    `${EL}@smile|よかった。 ……わたしも よ。`,
    `${ME}@surprise|歌姫の…… エレシアさん!?`,
    `${EL}|しーっ。 ……ここでは 話せないわ。 ついてきて。`,
  ]);
  await a.fade(true);
  a.remove('hoodel');
  a.field.teleport(21 * 16 + 8, 11 * 16 + 12, 'up');
  a.add({ id: 'sc_el', look: 'elesia', x: 22, y: 10, dir: 'left' });
  a.add({ id: 'sc_ma', look: 'meina', x: 21, y: 9, dir: 'down' });
  a.hide('rosa'); a.hide('pipi'); a.hide('nono');
  await a.wait(300);
  await a.fade(false);
  await a.say([
    `${MA}@smile|ガハハ！ エレシアが 女の子を ひろってきたよ！ ……ひっく。`,
    `${EL}|座長、 また 昼から 飲んでるの？`,
    `${MA}|の、 飲んでないよ。 これは 水。 ……ちょっと 強い 水。`,
    `${EL}|……きょうは うそが つけない はず なんだけど。`,
    `${MA}@surprise|…………お酒です。`,
    `${ME}|（……この人、 だいじょうぶかな。）`,
    `${MA}|で。 その子が 見える子かい。`,
    `${ME}@shy|……はい。`,
    `${MA}|そうかい。`,
    `${MA}|……よく ひとりで、 がんばってきたね。`,
    `${ME}@sad|（…………。）`,
    `${MA}|あたしは メイナ。 この一座 「ルミエール」の 座長さ。`,
    `${MA}|この一座はね、 見える子を あつめて かくまってるのさ。 表むきは 旅芸人。 ほんとは 「見える子の かくれが」 ってわけ。`,
  ]);
  a.add({ id: 'sc_pi', look: 'pipi', x: 23, y: 11, dir: 'left' });
  a.emote('sc_pi', '!', 1);
  await a.say([
    'ピピ|ピピも 見えるんだよ！',
    `${MA}@smile|こら、 ピピ。 大人の 話の とちゅうだよ。`,
  ]);
  a.remove('sc_pi');
  await a.say([
    `${EL}|この町の 「うそが つけない」 ふしぎ。 ようかいの しわざよ。`,
    `${EL}|ゆうべから、 町じゅうの うそが、 どこかへ 吸いこまれていくのが 見えたの。`,
    `${MA}|あたしらは 町に 来るたび、 こういう 事件を こっそり かたづけてるのさ。 もちろん、 だれにも ないしょで ね。`,
    `${MA}|シメール、 だっけ。 手を かしてくれないかい？ あんたの その 目が いるんだ。`,
  ]);
  const p = await a.ask([`${ME}|（どうしよう……。）`], ['てつだう', '……かんがえさせて']);
  if (p === 1) {
    await a.say([
      `${MA}@smile|ガハハ、 正直で いいね！`,
      `${MA}@smile|でも、 顔に 「やりたい」 って かいてあるよ。 きょうは うそが つけない 日だからね。`,
      `${ME}@shy|（……ばれてる。）`,
    ]);
  }
  await a.say([
    `${ME}|……でも、 わたし 戦えないですよ。 くすりも、 にせものだし。`,
    `${MA}|にせものの くすりを 売るには、 ほんものの 薬草を 知ってなきゃ だめだろ？`,
    `${ME}@surprise|……なんで わかるんですか。`,
    `${MA}@smile|あんたの かばんから、 いい においが するのさ。 カミツレと、 ヨモギと…… あと ハッカ。`,
    `${MA}|けがを なおすのは、 りっぱな 戦いだよ。`,
    `${EL}|……よろしくね、 シメール。`,
    `${ME}@shy|……はい、 エレシアさん。`,
    `${EL}@smile|エレシア、 で いいわ。`,
    `${ME}@shy|……エレシア。`,
  ]);
  a.emote('shimeru', '♥', 1.5);
  await a.wait(600);
  await a.fade(true);
  a.remove('sc_el'); a.remove('sc_ma');
  a.setPhase(PH.PARTY);
  a.join('elesia'); a.join('meina');
  a.field.teleport(CAMP_REST.tx * 16 + 8, CAMP_REST.ty * 16 + 12, 'down');
  a.setFollowersHere();
  a.restHere();
  await a.wait(300);
  await a.fade(false);
  await a.say([
    'エレシアと メイナが なかまに なった！',
    `${MA}|まずは 町で ききこみだ。 灯台の ことを 知ってそうな 人に、 話を きいておいで。`,
    `${MA}|町はずれの 砂浜や みさきには、 ようかいが 出る。 気を つけな。`,
    `${MA}|つかれたら、 この 青い テントで 休むんだよ。`,
  ]);
  addDiary('d2');
  addDiary('e1');
}

// ───────── ききこみ ─────────
const CLUES = ['clue_fish', 'clue_keeper', 'clue_child'];
async function clueTalk(a, act, lines) {
  await a.say(lines);
  if (a.has(act)) return;
  a.flag(act);
  const comment = {
    clue_fish: [`${EL}@think|「ウソ、 ウマイ」……。 町の うそを、 だれかが 食べているのかも。`],
    clue_keeper: [`${MA}@think|灯台の てっぺんに 大きな 影、 ねえ。 ……におうね。`],
    clue_child: [`${ME}@think|大きな 鳥……。`, `${EL}|灯台の 鳥。 ……きまりね。`],
  }[act];
  await a.say(comment);
  const n = CLUES.filter(c => a.has(c)).length;
  if (n < 3) { await a.say([`ききこみ：あと ${3 - n}人`]); return; }
  await exposureEvent(a);
}

// ───────── ばれる ─────────
async function exposureEvent(a) {
  await a.say([
    `${MA}|よし、 灯台だ！ ……と 言いたいところ だけど、 かぎが かかってるんだったね。`,
    `${EL}|いちど 市場に もどって、 作戦を たてましょう。`,
  ]);
  // 市場の ひろばで
  await a.fade(true);
  const tx = 21, ty = 22;
  a.field.teleport(tx * 16 + 8, ty * 16 + 12, 'left');
  a.setFollowersHere();
  await a.wait(300);
  await a.fade(false);
  await a.say(['そのとき、 うしろから 声が した。']);
  a.add({ id: 'ex_g', look: 'gossip', x: tx - 4, y: ty, dir: 'right', name: 'うわさずきの おくさん' });
  a.add({ id: 'ex_b', look: 'baker', x: tx - 5, y: ty - 1, dir: 'right' });
  a.add({ id: 'ex_c', look: 'clothgirl', x: tx - 5, y: ty + 1, dir: 'right' });
  await a.walk('ex_g', tx - 2, ty, 0.8);
  a.face('shimeru', 'left');
  await a.say([
    'うわさずきの おくさん|ねえ、 あんた。',
    'うわさずきの おくさん|さっきから、 だれも いない ところに 話しかけて なかった？',
    'うわさずきの おくさん|……あんた、 もしかして 見えるの？',
    `${ME}@surprise|（だめ。 いまは うそが つけない――）`,
    `${EL}@angry|この子は――`,
    'うわさずきの おくさん|あんたに きいてないわ。 シメールちゃん、 こたえて。',
    `${ME}@sad|…………見える。`,
    `${ME}@sad|わたし、 ようかいが 見える。`,
  ]);
  for (const id of ['ex_g', 'ex_b', 'ex_c']) a.emote(id, '!', 1.5);
  await a.say([
    'うわさずきの おくさん|やっぱり……！ 見える子……！',
    'パン屋の おかみ|シメールちゃんが……？',
    `${MA}|ガハハ！ みなさん、 この子は うちの 新人でね。 ちょっと 想像力が ゆたかで――`,
    `${MA}@angry|――いや、 見えてるけど…… くそっ、 うそが つけないってのは 不便だね！`,
  ]);
  a.add({ id: 'ex_k', look: 'keeper', x: tx + 5, y: ty, dir: 'left', name: '灯台守の おばあさん' });
  await a.walk('ex_k', tx + 2, ty, 0.6);
  await a.say([
    '灯台守の おばあさん|……おまちよ。',
    '灯台守の おばあさん|見える子だろうと なかろうと、 この子たちは 町の ために 動いてくれてる。',
    '灯台守の おばあさん|きょうは だれも うそが つけない。 だから、 わたしの 言うことも ほんとうだよ。',
    'ざわめきが、 すこしずつ しずかに なった。',
    '灯台守の おばあさん|灯台の かぎは あけておいた。 たのんだよ、 シメール。',
    'うわさずきの おくさん|……し、 知らないわよ。 どうなっても。',
  ]);
  for (const id of ['ex_g', 'ex_b', 'ex_c']) a.walk(id, tx - 9, ty, 1);
  await a.walk('ex_k', tx + 8, ty, 0.8);
  for (const id of ['ex_g', 'ex_b', 'ex_c', 'ex_k']) a.remove(id);
  await a.say([
    `${EL}|……だいじょうぶ？`,
    `${ME}|……うん。`,
    `${ME}@sad|……ちょっとだけ、 だいじょうぶ じゃない。`,
    `${EL}@sad|……わたしも はじめて ばれたとき、 そうだった。`,
    `${MA}|さ、 灯台へ 行こう。 町の 右下、 みさきの 先だ。`,
  ]);
  addDiary('d3');
  addDiary('m1');
  a.setPhase(PH.TOWER);
}

// ───────── 3かいの 案内役 ─────────
async function guideEvent(a) {
  if (!a.has('puuMet')) {
    a.flag('puuMet');
    await a.say([
      '？？？|ぷぅ！',
      `${ME}@surprise|あっ、 町に いた…… ぷぅちゃん!?`,
      `${MA}|知りあいかい？`,
      `${ME}@shy|（……かってに 名前を つけてたなんて 言えない。）`,
      `${EL}@smile|ついてきて くれたのね。`,
    ]);
  }
  const avg = avgAwaken();
  // ボスの 勝率が 2割より下／5割くらいまで／それより上（dev/tune.mjs の 計算から）
  if (avg < 64) {
    await a.say(['ぷぅちゃんは ぶるぶる ふるえている。', `${ME}|「この先の 鳥は、 とても つよい。 まだ あぶない」…… って 言ってる 気がする。`]);
  } else if (avg < 71) {
    await a.say(['ぷぅちゃんは すこし 心配そうに こちらを 見ている。', `${ME}|「もうすこし……」 かな。`]);
  } else {
    await a.say(['ぷぅちゃんは ぴょんぴょん はねている！', `${ME}@smile|「いまなら 勝てる！」 って 言ってる！`]);
  }
  const p = await a.ask(['ぷぅちゃんの そばで 休む？'], ['休む', '休まない']);
  if (p !== 0) return;
  await a.fade(true);
  a.restHere();
  await a.wait(500);
  await a.fade(false);
  await a.say(['ぷぅちゃんの そばで、 すこし 休んだ。', 'HPと MPが ぜんぶ かいふくした！ おうえんも 3回に もどった！']);
  await askSave(a);
}

// ───────── ボス ─────────
async function bossEvent(a) {
  await a.say([
    'ウソクイドリ|……ウソ。 ウソノ ニオイ……。',
    'ウソクイドリ|ウソ、 ウマイ。 コノ 町ノ ウソ、 ゼンブ ウマカッタ。',
    `${ME}@angry|あなたが、 町の うそを 食べてたの!?`,
    'ウソクイドリ|オマエカラモ ニオウ。 ズット ウソヲ ツイテキタ ニオイ。',
    'ウソクイドリ|……イチバン ウマソウ。',
    `${ME}@sad|（…………。）`,
    `${EL}@angry|シメールの うそは、 あなたの エサじゃ ない！`,
    `${MA}@smile|ガハハ！ 鳥は 焼き鳥に かぎるね！ いくよ！`,
  ]);
  const res = await a.battle(['usokuidori'], 'boss');
  if (res !== 'win') return;
  a.hide('boss');
  a.field.bigs.forEach(b => { b.hidden = true; });
  await a.say(['ウソクイドリ|ウ…… ウソガ…… タリナイ……', 'ウソクイドリは、 夜空に とけるように 消えていった。']);
  a.setPhase(PH.ESCAPE);
  a.tint('night');
  await a.say([
    '灯台の あかりが、 ふたたび ともった。',
    '吸いこまれていた 町じゅうの うそが、 夜空に ほどけて 町へ かえっていく。',
    `${ME}|……これで、 町の人も また うそが つけるね。`,
    `${MA}|ああ。 ……うそが つけるってのも、 わるくない。 ……ひっく。`,
    `${EL}|座長、 いつのまに 飲んだの。`,
    `${MA}@smile|ガハハ！ ……あたしは 先に おりてるよ。 わかいのは ゆっくり 来な。`,
  ]);
  const meina = a.field.followers.find(x => x.id === 'meina');
  if (meina) meina.hidden = true;
  game.partyIds = game.partyIds.filter(id => id !== 'meina');
  a.setFollowersHere();
  await a.say([
    `${EL}|シメール。 ……うそ、 また つけるように なったわね。`,
    `${ME}|うん。`,
    `${ME}|……でもね、 エレシア。 わたし、 エレシアには うそ つかないことに する。`,
    `${EL}@surprise|……どうして？`,
    `${ME}@shy|わかんない。 ……でも、 そう したいの。`,
    `${EL}@shy|…………。`,
    `${EL}@smile|……じゃあ、 わたしも。`,
    `${EL}@shy|シメールの 前でだけは、 「完璧な 歌姫」 じゃなくて いい？`,
    `${ME}@smile|うん。`,
  ]);
  a.emote('shimeru', '♥', 2);
  await a.wait(900);
  game.partyIds = ['shimeru', 'elesia', 'meina'];
  await escapeEvent(a);
}

// ───────── 夜の 町を 逃げる ─────────
async function escapeEvent(a) {
  await a.fade(true);
  await a.goto('miramar', 37.5, 30, 'left');
  a.tint('night');
  a.setFollowersHere();
  a.add({ id: 'es_r', look: 'rosa', x: 30, y: 30, dir: 'right', name: 'ロザ' });
  await a.walk('es_r', 35, 30, 1.4);
  a.emote('es_r', '!', 1.2);
  await a.say([
    'ロザ|たいへん！ 白い フードの 人たちが 町に 来てる！',
    'ロザ|「見える子を ひきとりに 来た」 って……！',
  ]);
  const hoods = [['h1', 29, 27], ['h2', 30, 28], ['h3', 28, 28]];
  for (const [id, x, y] of hoods) a.add({ id, look: 'hood', x, y, dir: 'right', name: '白い フードの 女' });
  for (const [id, x, y] of hoods) a.walk(id, x + 3, y, 0.5);
  await a.wait(1600);
  await a.say([
    '白い フードの 女|……見える子が いると きいた。',
    '白い フードの 女|保護する。 こちらへ。',
  ]);
  a.emote('shimeru', '!', 1.2);
  await a.say([
    `${ME}@sad|（あれが…… 見える子を 「つれていく」 人たち……。）`,
    `${MA}@angry|保護、 ねえ。`,
    `${MA}@angry|……いままで 「保護」された 子が かえってきたって 話、 あたしは いちども きいたこと ないね。`,
    '白い フードの 女|…………。',
    `${MA}|ロザ！ 馬車を！`,
    `${MA}@angry|……ずらかるよ！`,
  ]);
  await a.fade(true);
  for (const [id] of hoods) a.remove(id);
  a.remove('es_r');
  await a.wait(600);
  await wagonEnding(a);
}

async function wagonEnding(a) {
  // 画面は まっくらな まま、 馬車の 音と 会話
  await a.say([
    '一座の 馬車は、 夜の 港町を かけぬけた。',
    'ガタゴト、 ガタゴト。',
    `${ME}|（ふりかえると、 灯台の あかりが 見えた。）`,
    `${ME}|（百年 消えたことのない―― ううん、 ほんとは ときどき 消えてた あかり。）`,
    `${ME}@sad|（わたしの 町。 わたしの、 うその 町。）`,
    `${EL}|……ねむれない？`,
    `${ME}|うん。 ……町を 出るの、 はじめて だから。`,
    `${EL}|わたしも、 はじめて 町を 出た夜は ねむれなかった。`,
    `${EL}@sad|家族に 「見える」って 言ったら、 つぎの日には 馬車に のせられてたの。`,
    `${ME}@sad|…………。`,
    `${EL}@smile|でもね。 その 馬車が、 この一座 だった。 メイナが ひろってくれたの。`,
    `${ME}|……エレシアも、 ひろわれたんだ。`,
    `${EL}@smile|ええ。 だから、 シメールも きっと だいじょうぶ。`,
    `${ME}@shy|（……手、 にぎって くれてる。）`,
    `${MA}|ぐおー…… ガハハ…… もう いっぱい……`,
    `${EL}|……座長。`,
    'ふたりは 顔を 見あわせて、 小さく 笑った。',
    `${MA}|……ぜんぶ…… まもるから…… こんどは……`,
    `${ME}|……「こんどは」？`,
    `${EL}@sad|……座長、 ときどき ああやって うなされるの。`,
    `${EL}|いつか、 本人が 話してくれるわ。`,
    `${ME}|（……こんどは。）`,
    'ガタゴト、 ガタゴト。',
    '馬車は 夜の 道を、 つぎの 町へと はしっていく。',
  ]);
  addDiary('d4');
  addDiary('e2');
  game.phase = PH.END;
  game.rest = { map: 'miramar', x: 4 * 16 + 8, y: 8 * 16 + 12, dir: 'down' };
  await a.say(['第一章 「うそつきと 歌姫」', '―― おわり ――']);
  await askSave(a);
  a.reload();
  a.tint(null);
  await a.fade(false);
  await offerChapter2(a);
}

async function offerChapter2(a) {
  const p = await a.ask(['第二章 「なくしたボタンと 桜の魔術師」を はじめる？', '（3人の 強さや なかよし度は、 そのまま ひきつぎます）'], ['はじめる', 'あとで']);
  if (p === 0) await a.startChapter2();
  else await a.say(['また いつでも、 タイトルの 「つづきから」で はじめられます。']);
}

// ───────── テントで 休む ─────────
// 3人は 対等。自由時間も へやわりも 「2人組」を えらぶ。
const PAIRS = [['shimeru', 'elesia'], ['shimeru', 'meina'], ['elesia', 'meina']];
const PAIR_LABELS = ['シメールと エレシア', 'シメールと メイナ', 'エレシアと メイナ'];
// 選択肢に 小さな 顔を つける
const PAIR_OPTS = PAIRS.map((p, i) => ({ label: PAIR_LABELS[i], faces: [p] }));
const ALL_OPT = () => ({ label: 'みんなで すごす', faces: [game.partyIds] });
const NAMES = { shimeru: ME, elesia: EL, meina: MA };
const nakaUp = (x, y) => `${NAMES[x]}と ${NAMES[y]}の なかよし度が あがった！`;

async function restAtTent(a) {
  if (game.phase < PH.PARTY) { await a.say(['一座の ねどこの テント。 いまは 入れない。']); return; }
  const p = await a.ask(['テントで 休む？'], ['休む', 'やめる']);
  if (p !== 0) return;
  const lv = game.phase >= PH.TOWER ? 2 : 1;

  // 自由時間
  const ft = await a.ask(['ねるまえの 自由時間。', 'だれと だれが いっしょに すごす？'], [...PAIR_OPTS, ALL_OPT()]);
  await a.fade(true);
  a.tint('evening');
  await a.wait(300);
  await a.fade(false);
  if (ft < 3) {
    const [x, y] = PAIRS[ft];
    const pk = [x, y].sort().join('|');
    await a.say([...FREE_TIME[pk][lv], nakaUp(x, y)]);
    addNaka(x, y, 3);
  } else {
    await a.say(FREE_TIME.all);
  }

  // へやわり
  const room = await a.ask(['へやわり。 だれと だれが 同じ テントで ねる？', '（のこりの ひとりは、 ピピたちと ねるよ）'], PAIR_OPTS);
  const [x, y] = PAIRS[room];
  addNaka(x, y, 5);
  await a.fade(true);
  a.tint('night');
  await a.wait(300);
  await a.fade(false);
  const pk = [x, y].sort().join('|');
  const key = `${pk}|${lv}`;
  if (!game.bedTalks[key]) { game.bedTalks[key] = true; await a.say([...BED_TALK[pk][lv], nakaUp(x, y)]); }
  else await a.say(BED_TALK_AGAIN[pk]);

  await a.fade(true);
  a.tint(null);
  a.restHere();
  await a.wait(500);
  await a.fade(false);
  await a.say(['朝に なった。', 'HPと MPが ぜんぶ かいふくした！ おうえんも 3回に もどった！']);
  await askSave(a);
}

async function askSave(a) {
  const s = await a.ask(['セーブする？'], ['する', 'しない']);
  if (s === 0) { a.save(); await a.say(['セーブしました。']); }
}

// ───────── 自由時間（2人組ごと） ─────────
const FREE_TIME = {
  'elesia|shimeru': {
    1: [
      'テントの うらで、 エレシアが 歌の れんしゅうを している。',
      'シメールは そばに すわって、 じっと きいていた。',
      'ふたりの まわりに、 ちいさな ようかいたちが あつまってくる。',
      `${EL}|……歌うと、 あつまってくるの。 こわい？`,
      `${ME}|ううん。 みんな、 うっとりしてる。`,
      `${EL}@surprise|…………。`,
      `${EL}@shy|そんなふうに 言われたの、 はじめて。`,
    ],
    2: [
      'エレシアと シメールは、 ならんで 星を 見ていた。',
      'エレシアは フードを かぶっている。',
      `${EL}|ふだんは こうやって、 顔を かくしてるの。 「歌姫の 顔」は、 ぶたいの 上だけ。`,
      `${ME}|フードの エレシアも、 いいと 思う。`,
      `${EL}@shy|……シメールは、 たまに ずるい。`,
      `${ME}|え、 なんで？`,
      `${EL}@shy|……なんでも ない。`,
    ],
  },
  'meina|shimeru': {
    1: [
      'メイナが 酒びんを 3本、 くるくると お手玉している。',
      'シメールは 目を まるくして 見ていた。',
      `${MA}@smile|ガハハ！ 芸は ひととおり できるのさ。 歌いがい はね。`,
      `${ME}|座長って、 なんでも できるんですね。`,
      `${MA}|なんでも できる 「ふり」が、 いちばん とくい なのさ。`,
      `${ME}|……ふり？`,
      `${MA}@smile|さあね！ ……ひっく。`,
    ],
    2: [
      'メイナは めずらしく、 お酒を 飲んでいなかった。',
      'その 手が、 すこしだけ ふるえている。',
      `${MA}|……シメール。 あしたが 来るのがね、 ときどき こわいのさ。`,
      `${ME}|座長……？`,
      `${MA}@smile|――ガハハ！ なんてね！ よし、 飲みなおそう！`,
      `${ME}@sad|（……いまの、 うそ じゃなかった。）`,
    ],
  },
  'elesia|meina': {
    1: [
      'メイナが あたたかい カップを ふたつ もってきた。',
      `${MA}|ほら、 エレシア。 のどに いいよ。`,
      `${EL}|……座長の カップ、 においが ちがう。`,
      `${MA}@smile|あたしのは 大人の のみもの。 あんたのは はちみつ牛乳。`,
      `${EL}@angry|……子ども あつかい しないで。`,
      `${MA}@smile|子どもだよ。`,
      `${EL}|…………。`,
      `${EL}|……座長は、 シメールを ひろって よかったと 思う？`,
      `${MA}|あんたは どう 思うんだい？`,
      `${EL}@shy|…………思う。`,
      `${MA}@smile|ガハハ。 なら、 よかったのさ。`,
    ],
    2: [
      'エレシアは、 メイナの 手が ふるえているのに 気づいた。',
      `${EL}|座長、 手が。`,
      `${MA}|……さむい だけさ。`,
      `${EL}|うそ。 もう うそは つけるように なったけど…… わたしには わかるわ。`,
      `${MA}|……あんたには かなわないね。`,
      `${EL}|わたしを ひろってくれた日のこと、 おぼえてる？`,
      `${MA}|わすれるもんか。 雨の日で、 あんたは ずぶぬれで、 ひとことも しゃべらなかった。`,
      `${EL}@shy|……いまは、 しゃべるわ。 歌も 歌う。`,
      `${MA}@smile|ああ。 うるさいくらいにね。`,
    ],
  },
  all: [
    '3人は たき火を かこんで、 ピピと ノノと いっしょに すごした。',
    'ピピ|座長！ また お酒 のんでる！',
    `${MA}@surprise|の、 のんでないよ！`,
    'ノノ|……においが する。',
    `${EL}@smile|ふふっ。`,
    `${ME}@smile|あはは。`,
    'にぎやかな 夜が、 すこしずつ ふけていった。',
  ],
};

// ───────── ベッドトーク ─────────
const BED_TALK = {
  'elesia|shimeru': {
    1: [
      `${EL}|……シメールは、 どうして うそを つくの？`,
      `${ME}|……生きるため、 かな。 うそを つかないと、 見えることが ばれちゃうから。`,
      `${EL}|そう。`,
      `${EL}|……わたしも、 ぶたいの 上では うそつきよ。 あの 笑顔は、 ぜんぶ うそ。`,
      `${ME}|……ゆうべ、 わたしを 見て 笑ったのも？`,
      `${EL}@shy|…………あれは、 ほんと。`,
      `${ME}@shy|（……ねむれない。）`,
    ],
    2: [
      `${EL}|……ばれて、 こわかった？`,
      `${ME}|うん。 ……でも、 エレシアが 前に 出てくれた。`,
      `${EL}@shy|……かってに、 体が うごいたの。`,
      `${ME}@smile|完璧な 歌姫が、 かってに？`,
      `${EL}@angry|……わらわないで。`,
      `${ME}@smile|わらってないよ。 ……うれしかった。`,
      `${EL}@shy|…………おやすみ、 シメール。`,
    ],
  },
  'meina|shimeru': {
    1: [
      `${ME}|座長、 お酒 くさい。`,
      `${MA}@smile|ガハハ、 正直だね！`,
      `${MA}|……きょうは うそが つけない 日だから、 あたしも 言っとくよ。`,
      `${MA}|あんたが 来てくれて、 うれしい。`,
      `${ME}@shy|……わたしも。`,
      `${MA}|それと、 お酒は やめない。`,
      `${ME}|……それも 本当なんだ。`,
    ],
    2: [
      `${ME}|座長は、 どうして 見える子を あつめてるの？`,
      `${MA}|…………。`,
      `${MA}|……むかし、 まもれなかった 子が いてね。`,
      `${ME}|…………。`,
      `${MA}|――さ、 ねな。 子どもは ねる 時間だよ。`,
      `${ME}|14です。`,
      `${MA}@smile|子どもだよ。`,
    ],
  },
  'elesia|meina': {
    1: [
      'エレシアと メイナは、 ひとつの テントで ねころがっていた。',
      `${EL}|座長、 飲みすぎ。`,
      `${MA}|エレシアは きびしいねえ。`,
      `${EL}|……シメールのこと、 どう 思う？`,
      `${MA}|いい子だよ。 うそつきで、 まっすぐな 子だ。`,
      `${EL}|うそつきで、 まっすぐ……。`,
      `${MA}@smile|あんたに にてるね。`,
      `${EL}@shy|……にてない。`,
    ],
    2: [
      'エレシアと メイナは、 ひとつの テントで ねころがっていた。',
      `${EL}|……灯台、 だいじょうぶかしら。`,
      `${MA}|あんたが 心配するなんて、 めずらしいね。`,
      `${EL}|べつに、 心配なんか。`,
      `${MA}@smile|シメールが いるから かい？`,
      `${EL}@shy|……おやすみなさい。`,
      `${MA}@smile|ガハハ。`,
    ],
  },
};
const BED_TALK_AGAIN = {
  'elesia|shimeru': [`${EL}|……おやすみ、 シメール。`, `${ME}|おやすみ、 エレシア。`, 'ふたりは しずかに ねむった。'],
  'meina|shimeru': [`${MA}|ぐおー…… ぐおー……`, `${ME}|……座長の いびき、 すごい。`, 'シメールは 耳を ふさいで ねむった。'],
  'elesia|meina': [`${MA}|ぐおー…… ぐおー……`, `${EL}|……座長の いびき、 ほんとに うるさい。`, 'エレシアは ためいきを ついて、 毛布を かぶった。'],
};

// ───────── いまの もくひょう ─────────
function goal() {
  const P = game.phase, has = k => !!game.flags[k];
  if (P === PH.MORNING) return '市場の 自分の 屋台へ 行こう。\n\n市場は 町の まんなかの ふんすいの まわり。\nシメールの 屋台は、 ふんすいの 右下の、 みどりの しましま屋根。\n屋台の まえで タップすると、 店を ひらける。';
  if (P === PH.TROUPE && !has('campSeen')) return '旅の一座が 来たらしい。\n北の ひろばへ 行ってみよう。\n\nふんすいから 上へ、 道を まっすぐ。';
  if (P === PH.TROUPE) return '北の ひろばの 旅の一座 「ルミエール」。\n裏方の ロザさんに 話しかけると、 今夜の 公演が 見られる。\n\nロザさんは ひろばの まんなかへんに いる。';
  if (P === PH.CURSE) return '屋台を ひらこう。\n\nシメールの 屋台は、 市場の ふんすいの 右下、 みどりの しましま屋根。\n（町の人の ようすが、 なんだか へん……）';
  if (P === PH.PARTY) {
    const mark = k => (has(k) ? '✓' : '・');
    return '灯台の ことを ききこみ しよう。\n\n' +
      `${mark('clue_fish')} 魚屋の おねえさん（市場の 右上の 屋台）\n` +
      `${mark('clue_keeper')} 灯台守の おばあさん（町の 右下、 灯台の みさき）\n` +
      `${mark('clue_child')} 町の 女の子（市場の あたりで あそんでいる）\n\n` +
      'つかれたら、 北の ひろばの 青い テントで 休める。\n町はずれ（砂浜・みさき）には、 ようかいが 出る。';
  }
  if (P === PH.TOWER) return '灯台へ 行こう。\n\n灯台は 町の 右下、 みさきの 先。\n灯台の てっぺんに、 町の うそを 食べている ようかいが いるらしい。\n3かいには ぷぅちゃんが いて、 休ませてくれる。\n\n北の ひろばの 青い テントでも 休める。';
  return '第一章 おわり。\nタイトルの 「つづきから」で 第二章を はじめられる。';
}

// ───────── 交換日記（3人が 書く） ─────────
function DIARY() {
  return [
    { id: 'd1', title: 'シメール｜1日め　歌姫と 目が あった', text:
      'きょう、 くすりが ひとつ 売れた。 失恋に きく くすり。\n……きくわけ ないけど。\n\n夜、 旅の一座の 公演を 見た。\n歌姫の エレシアさんが 歌うと、 ようかいが いっぱい あつまってきた。\nだれも 気づいてなかった。 わたし いがいは。\n\nそれから、 エレシアさんと 目が あった。\nわらってた。 わたしに。\n\n……たぶん、 気のせい。\nでも、 気のせいじゃ なかったら いいなって、 ちょっと 思った。' },
    { id: 'd2', title: 'シメール｜2日め　うそが つけない 日', text:
      'うそが つけなくなった。\n町じゅう みんな そうらしい。\nくすりは ひとつも 売れなかった。 あたりまえだ。 「これは 色水です」って 言っちゃったんだから。\n\nかわりに、 一座に 入ることに なった。\n座長の メイナさんは お酒くさい。 でも、 「よく がんばってきたね」って 言ってくれた。\nあれは、 うそじゃない。 きょうは だれも うそが つけないから。\n\nエレシアさんの こと、 「エレシア」って よぶことに なった。\nよぶたびに、 ちょっと どきどきする。' },
    { id: 'd3', title: 'シメール｜2日め・夜　ばれた', text:
      '町の人に、 見えるって ばれた。\nうそを つけば ごまかせたのに、 つけなかった。\n\nこわかった。\nずっと かくしてきたことが、 いっしゅんで ぜんぶ なくなった。\n\nでも、 エレシアが 前に 出てくれた。\n座長は うそが つけなくて おこってた。\n灯台守の おばあちゃんが、 「ほんとうだよ」って 言ってくれた。\n\nうそが つけない 日に もらった ことばは、 ぜんぶ ほんもの だ。\nわすれないように、 ここに かいておく。' },
    { id: 'd4', title: 'シメール｜さよなら、 ミラマール', text:
      '灯台の 鳥を やっつけた。\n町に うそが もどった。\n\nわたしは、 エレシアには うそを つかないって きめた。\nなんでかは、 まだ わからない。\n\n白い フードの 人たちが 来て、 町を 出ることに なった。\n馬車の 中で、 エレシアが 手を にぎってくれた。\n座長は いびきを かいてた。 それから、 「こんどは まもる」って ねごとを 言ってた。\n\nさよなら、 ミラマール。\nわたしの、 うその 町。\n\nあしたからは、 ほんとうの ことを すこしずつ ふやしていこう。' },
    { id: 'e1', title: 'エレシア｜公演の夜と、 うそが つけない日', text:
      '客席に、 ようかいを 見ている 子が いた。\nわたしと 同じ 目を していた。\n\nつぎの日、 くすり屋の 屋台で 声を かけた。\n「見えてます」って、 泣きそうな 顔で 言っていた。\n\n……わたしが はじめて 見える子だと ばれた日も、 きっと あんな 顔を していた。\n\nシメール。\n「エレシア」と よばれるのは、 ちょっと くすぐったい。' },
    { id: 'm1', title: 'メイナ｜座長の きろく', text:
      '見える子 ひとり、 あたらしく 一座へ。\nなまえは シメール。 くすり屋。 口が うまい。 薬草の においが する。\n\n町の人に、 見える子だと ばれた。\n灯台守の ばあさんに 助けられた。\n\nうそが つけない日に、 あたしは あの子を まもるための うそすら 言えなかった。\nなさけない。\n\n……こんどこそ、 まもる。\n\n（ここから先は 字が ふにゃふにゃで 読めない。 お酒の しみが ついている）' },
    { id: 'e2', title: 'エレシア｜灯台の てっぺんで', text:
      'シメールが 「エレシアには うそを つかない」と 言った。\nどうして、 と きいたら、 わからない、 と 言った。\n\nわたしも わからない。\nでも、 ぶたいの 上で 歌うときより、 むねが うるさかった。\n\n……これは 交換日記だから、 シメールも 読むのよね。\n\nいまの 2行は、 わすれて。' },
  ];
}

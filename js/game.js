// ゲーム全体の 状態（仲間・おうえんの回数・休んだ場所など）
import { newMember } from './battle/core.js';

export const MAX_CHEERS = 3;

export const game = {
  party: ['shimeru', 'elesia', 'meina'].map(newMember),
  cheers: MAX_CHEERS,
  speed: 1,           // はやおくり（1・2・4）
  rest: null,         // 最後に休んだ場所 { x, y, dir }
};

// 休む：全回復して、おうえんも もどる
export function restAll() {
  for (const m of game.party) { m.hp = m.max.hp; m.mp = m.max.mp; }
  game.cheers = MAX_CHEERS;
}

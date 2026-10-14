// 章ごとの 物語
import { story as ch1 } from './ch1.js';
import { story as ch2 } from './ch2.js';
import { game } from '../game.js';

export const STORIES = { 1: ch1, 2: ch2 };
export const currentStory = () => STORIES[game.chapter] || ch1;
// 日記は 章を こえて 読める
export const allDiary = () => [...ch1.diary, ...ch2.diary];

// マップの 一覧
import { buildMiramar } from './miramar.js';
import { buildLh1, buildLh2, buildLh3, buildLhTop } from './lighthouse.js';

export const MAPS = {
  miramar: buildMiramar,
  lh1: buildLh1,
  lh2: buildLh2,
  lh3: buildLh3,
  lhtop: buildLhTop,
};

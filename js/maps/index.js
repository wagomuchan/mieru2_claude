// マップの 一覧
import { buildMiramar } from './miramar.js';
import { buildMaple, buildMaze, buildFactory1, buildFactory2 } from './maple.js';
import { buildLh1, buildLh2, buildLh3, buildLhTop } from './lighthouse.js';

export const MAPS = {
  miramar: buildMiramar,
  lh1: buildLh1,
  lh2: buildLh2,
  lh3: buildLh3,
  lhtop: buildLhTop,
  maple: buildMaple,
  maze: buildMaze,
  factory1: buildFactory1,
  factory2: buildFactory2,
};

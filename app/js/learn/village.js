// The quest village: the home of Learn.
//
// Pedagogy (see docs/PEDAGOGY.md):
// - Autonomy: the child chooses which friend to help. Every offer comes from
//   the adaptive path (the next skill, a nearby skill or a review), so the
//   choice is real but every option is useful.
// - Relatedness and purpose: each lesson helps someone. The math is the help
//   itself (intrinsic integration), not a reward wrapped around it.
// - No points, stars or streaks. A friend who has been helped moves into a
//   house and the village fills with life: a natural consequence, not a score.
import { s, C, replay } from '../lib.js';
import { avatar } from './characters.js';
import { ink, card } from './draw.js';
import { shade, line, ground } from './art.js';
import { feelFace } from './templates/feelings.js';
import { AVATARS } from './profiles.js';

const HOUSE_SPOTS = [[330, 300], [560, 250], [800, 230], [1040, 250], [1270, 300], [420, 450], [1180, 450], [800, 400]];
const HOUSE_COLORS = [C.terra, C.teal, C.ochre, C.plum, C.blue, C.sage, C.rose, C.cocoa];

// A round, bumpy outline (tree canopies, clouds, bushes).
function blob(cx, cy, r, n, depth, squash = 1) {
  let d = '';
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    const px = cx + Math.cos(a) * r * squash, py = cy + Math.sin(a) * r;
    if (!i) { d = `M${px.toFixed(1)} ${py.toFixed(1)}`; continue; }
    const m = a - Math.PI / n;
    d += ` Q${(cx + Math.cos(m) * (r + depth) * squash).toFixed(1)} ${(cy + Math.sin(m) * (r + depth)).toFixed(1)} ${px.toFixed(1)} ${py.toFixed(1)}`;
  }
  return d + ' Z';
}

export function tree(g, x, y, k) {
  ground(g, x + 10 * k, y + 70 * k, 60 * k, 11 * k, '#4f5b3a', 0.16);
  shade(g, 'path', { d: `M${x - 10 * k} ${y + 70 * k} L${x - 7 * k} ${y + 8 * k} L${x + 7 * k} ${y + 8 * k} L${x + 10 * k} ${y + 70 * k} Z` }, { fill: '#9a7250', shadow: '#7d5d4a', line: '#5e4434', w: 2.5, d: [5, 0] });
  const c = shade(g, 'path', { d: blob(x, y - 10 * k, 56 * k, 8, 12 * k) }, { fill: '#87a86e', shadow: '#6a8b62', line: '#4f6b45', w: 3, d: [16 * k, 14 * k], hi: [x - 22 * k, y - 38 * k, 24 * k, 16 * k], lo: 0.22 });
  line(c, `M${x + 8 * k} ${y - 30 * k} q10 -4 16 4 M${x - 26 * k} ${y + 4 * k} q8 -6 16 0`, '#6a8b62', 2.5);
}

export function flower(g, x, y, col) {
  line(g, `M${x} ${y + 6} L${x} ${y + 18}`, '#5f7f55', 2.5);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    s('circle', { cx: x + Math.cos(a) * 6, cy: y + Math.sin(a) * 6, r: 5.5, fill: col, stroke: '#7a6455', 'stroke-width': 1.4 }, g);
  }
  s('circle', { cx: x, cy: y, r: 3.6, fill: C.ochre }, g);
}

// A small house seen from three quarters: a gable front, a side wall in shade,
// a roof plane, a chimney and a round window where the friend looks out.
function house(g, x, y, roof, kind) {
  const L = '#5a4636';
  const wall = { fill: '#f3e6cc', shadow: '#e0ceb1', line: L, w: 3, d: [8, 6] };
  ground(g, x + 22, y + 46, 104, 14, '#4f4a32', 0.18);
  shade(g, 'path', { d: `M${x + 62} ${y + 44} L${x + 62} ${y - 40} L${x + 100} ${y - 62} L${x + 100} ${y + 24} Z` }, { fill: '#d8c3a0', shadow: '#c7b190', line: L, w: 3 });
  const front = shade(g, 'path', { d: `M${x - 62} ${y + 44} L${x - 62} ${y - 40} L${x} ${y - 96} L${x + 62} ${y - 40} L${x + 62} ${y + 44} Z` }, wall);
  line(front, `M${x - 62} ${y + 30} L${x + 62} ${y + 30}`, '#e0ceb1', 3);
  shade(g, 'path', { d: `M${x + 44} ${y - 136} L${x + 64} ${y - 136} L${x + 64} ${y - 80} L${x + 44} ${y - 80} Z` }, { fill: '#b9806a', shadow: '#9c6a5e', line: L, w: 2.5, d: [5, 0] });
  shade(g, 'rect', { x: x + 40, y: y - 142, width: 28, height: 9, rx: 2 }, { fill: '#a87260', line: L, w: 2.2 });
  const r = shade(g, 'path', { d: `M${x} ${y - 106} L${x + 78} ${y - 32} L${x + 114} ${y - 54} L${x + 36} ${y - 126} Z` }, { fill: roof, line: L, w: 3 });
  s('path', { d: `M${x} ${y - 106} L${x + 78} ${y - 32} L${x + 114} ${y - 54} L${x + 36} ${y - 126} Z`, fill: '#3b2f4a', opacity: 0.18 }, r);
  for (let i = 1; i < 4; i++) { const k = i / 4; line(r, `M${x + 36 * k} ${y - 106 - 20 * k} L${x + 78 + 36 * k} ${y - 32 - 22 * k}`, '#3b2f4a', 2, { opacity: 0.25 }); }
  // The near roof edge (bargeboard) over the gable.
  line(g, `M${x - 76} ${y - 30} L${x} ${y - 106} L${x + 78} ${y - 32}`, L, 15);
  line(g, `M${x - 76} ${y - 30} L${x} ${y - 106} L${x + 78} ${y - 32}`, roof, 9);
  // Door with a knob and a step.
  shade(g, 'path', { d: `M${x + 18} ${y + 44} L${x + 18} ${y + 2} Q${x + 34} ${y - 12} ${x + 50} ${y + 2} L${x + 50} ${y + 44} Z` }, { fill: '#b88a5e', shadow: '#9a7154', line: L, w: 2.6, d: [5, 4] });
  s('circle', { cx: x + 43, cy: y + 24, r: 3, fill: '#e7c477' }, g);
  shade(g, 'rect', { x: x + 12, y: y + 42, width: 44, height: 7, rx: 3 }, { fill: '#cbb390', line: L, w: 2 });
  // Round window with warm light and the friend inside.
  s('circle', { cx: x - 26, cy: y - 2, r: 27, fill: '#9a7154', stroke: L, 'stroke-width': 3 }, g);
  s('circle', { cx: x - 26, cy: y - 2, r: 21, fill: '#f6e3a4' }, g);
  avatar(g, kind, x - 26, y + 2, 15);
  shade(g, 'rect', { x: x - 56, y: y + 24, width: 60, height: 8, rx: 3 }, { fill: '#b88a5e', line: L, w: 2.2 });
  // A small round attic window in the gable.
  s('circle', { cx: x, cy: y - 58, r: 9, fill: '#f6e3a4', stroke: L, 'stroke-width': 2.5 }, g);
}

// Small pictures of what each kind of activity needs (no words).
export function activityIcon(g, template, x, y, k = 1) {
  const t = (d, o = {}) => s('path', ink({ d, fill: 'none', ...o }, 3.5), g);
  const sc = (v) => v * k;
  switch (template) {
    case 'give':
      s('path', ink({ d: `M${x - sc(34)} ${y - sc(4)} h${sc(68)} l${-sc(8)} ${sc(34)} h${-sc(52)} z`, fill: C.wood }, 3.5), g);
      for (const dx of [-14, 2, 18]) s('circle', ink({ cx: x + sc(dx) - sc(2), cy: y - sc(14), r: sc(10), fill: C.terra }, 2.5), g);
      break;
    case 'count': for (let i = 0; i < 3; i++) s('circle', ink({ cx: x + sc((i - 1) * 26), cy: y, r: sc(11), fill: C.ochre }, 2.5), g); t(`M${x - sc(36)} ${y + sc(24)} h${sc(72)}`); break;
    case 'compare': for (let i = 0; i < 2; i++) s('circle', ink({ cx: x - sc(26), cy: y + sc(10 - i * 22), r: sc(9), fill: C.teal }, 2.5), g); for (let i = 0; i < 4; i++) s('circle', ink({ cx: x + sc(26), cy: y + sc(16 - i * 16), r: sc(8), fill: C.teal }, 2.5), g); break;
    case 'numeral': s('rect', ink({ x: x - sc(24), y: y - sc(28), width: sc(48), height: sc(56), rx: sc(10), fill: C.white }, 3), g); s('text', { x, y: y + sc(2), 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': sc(40), 'font-weight': 800, fill: C.terra, 'font-family': 'ui-rounded, sans-serif', text: '3' }, g); break;
    case 'numberline': t(`M${x - sc(40)} ${y + sc(10)} h${sc(80)}`); for (let i = 0; i < 3; i++) s('circle', ink({ cx: x + sc((i - 1) * 30), cy: y - sc(8), r: sc(11), fill: i === 2 ? C.white : C.cream }, 2.5), g); break;
    case 'arith': s('path', ink({ d: `M${x} ${y - sc(22)} v${sc(44)} M${x - sc(22)} ${y} h${sc(44)}`, fill: 'none', stroke: C.terra }, 9), g); break;
    case 'bonds': s('rect', ink({ x: x - sc(40), y: y - sc(18), width: sc(80), height: sc(36), rx: sc(6), fill: C.cream }, 3), g); for (let i = 0; i < 3; i++) s('circle', { cx: x - sc(28) + sc(i * 16), cy: y - sc(6), r: sc(6), fill: C.terra }, g); break;
    case 'placevalue': for (let i = 0; i < 2; i++) s('rect', ink({ x: x - sc(30) + sc(i * 16), y: y - sc(30), width: sc(12), height: sc(60), rx: sc(3), fill: C.teal }, 2.5), g); for (let i = 0; i < 3; i++) s('rect', ink({ x: x + sc(10) + sc((i % 2) * 16), y: y + sc(14) - sc(Math.floor(i / 2) * 16), width: sc(12), height: sc(12), rx: sc(2), fill: C.ochre }, 2.5), g); break;
    case 'groups': for (let i = 0; i < 3; i++) { s('ellipse', ink({ cx: x + sc((i - 1) * 30), cy: y, rx: sc(13), ry: sc(17), fill: C.cream }, 2.5), g); s('circle', { cx: x + sc((i - 1) * 30), cy: y - sc(5), r: sc(4), fill: C.terra }, g); s('circle', { cx: x + sc((i - 1) * 30), cy: y + sc(6), r: sc(4), fill: C.terra }, g); } break;
    case 'fraction': case 'fracline':
      s('circle', ink({ cx: x, cy: y, r: sc(26), fill: C.white }, 3), g);
      s('path', ink({ d: `M${x} ${y} L${x} ${y - sc(26)} A${sc(26)} ${sc(26)} 0 0 1 ${x + sc(26)} ${y} Z`, fill: C.terra }, 3), g);
      t(`M${x - sc(26)} ${y} h${sc(52)} M${x} ${y - sc(26)} v${sc(52)}`);
      break;
    // Reading
    case 'letterSound': case 'firstSound': {
      const letter = (lx, ly, ch) => { s('rect', ink({ x: lx - sc(18), y: ly - sc(22), width: sc(36), height: sc(44), rx: sc(8), fill: '#d6e6e3' }, 2.5), g); s('text', { x: lx, y: ly + sc(1), 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': sc(32), 'font-weight': 800, fill: C.teal, 'font-family': 'ui-rounded, sans-serif', text: ch }, g); };
      if (template === 'letterSound') { s('path', ink({ d: `M${x - sc(34)} ${y + sc(12)} q${-sc(10)} ${-sc(36)} ${sc(10)} ${-sc(36)} q${sc(18)} 0 ${sc(14)} ${sc(20)} q${-sc(4)} ${sc(10)} ${-sc(12)} ${sc(18)}`, fill: '#f0c9a8' }, 2.5), g); letter(x + sc(20), y, 's'); }
      else { s('circle', ink({ cx: x - sc(20), cy: y, r: sc(16), fill: C.ochre }, 2.5), g); letter(x + sc(22), y, 's'); }
      break;
    }
    case 'rhyme':
      s('circle', ink({ cx: x - sc(24), cy: y, r: sc(15), fill: C.ochre }, 2.5), g); s('circle', ink({ cx: x + sc(24), cy: y, r: sc(15), fill: C.ochre }, 2.5), g);
      t(`M${x - sc(8)} ${y - sc(18)} q${sc(8)} ${-sc(12)} ${sc(16)} 0`, { stroke: C.teal });
      break;
    case 'blend': case 'spell':
      for (let i = 0; i < 3; i++) s('rect', ink({ x: x - sc(42) + sc(i * 29), y: y - sc(18), width: sc(25), height: sc(32), rx: sc(5), fill: i === 1 ? '#f2dcd2' : '#d6e6e3' }, 2.5), g);
      if (template === 'blend') t(`M${x - sc(36)} ${y + sc(26)} h${sc(66)} l${-sc(10)} ${-sc(6)} m${sc(10)} ${sc(6)} l${-sc(10)} ${sc(6)}`, { stroke: C.terra });
      break;
    // Logic and coding
    case 'pattern': [C.terra, C.teal, C.terra].forEach((col, i) => s('circle', ink({ cx: x + sc((i - 1.2) * 26), cy: y, r: sc(11), fill: col }, 2.5), g)); s('circle', ink({ cx: x + sc(1.8 * 26), cy: y, r: sc(11), fill: 'none', 'stroke-dasharray': '4 4' }, 2.5), g); break;
    case 'oddone': [C.ochre, C.ochre, C.teal].forEach((col, i) => s('rect', ink({ x: x + sc((i - 1) * 28) - sc(11), y: y - sc(11), width: sc(22), height: sc(22), rx: sc(4), fill: col }, 2.5), g)); break;
    case 'sortit': s('path', ink({ d: `M${x - sc(36)} ${y} h${sc(30)} l${-sc(4)} ${sc(20)} h${-sc(22)} z M${x + sc(6)} ${y} h${sc(30)} l${-sc(4)} ${sc(20)} h${-sc(22)} z`, fill: C.wood }, 2.5), g); s('circle', ink({ cx: x - sc(21), cy: y - sc(8), r: sc(7), fill: C.terra }, 2), g); s('circle', ink({ cx: x + sc(21), cy: y - sc(8), r: sc(7), fill: C.teal }, 2), g); break;
    case 'path': case 'debug':
      for (let i = 0; i < 3; i++) { s('rect', ink({ x: x - sc(42) + sc(i * 29), y: y - sc(14), width: sc(25), height: sc(28), rx: sc(5), fill: template === 'debug' && i === 1 ? C.terra : C.teal }, 2.5), g); s('path', { d: `M${x - sc(36) + sc(i * 29)} ${y} h${sc(12)} m${-sc(5)} ${-sc(5)} l${sc(5)} ${sc(5)} l${-sc(5)} ${sc(5)}`, fill: 'none', stroke: C.white, 'stroke-width': sc(3), 'stroke-linecap': 'round' }, g); }
      break;
    // Feelings
    case 'feelFind': case 'feelScene': case 'feelHelp':
      feelFace(g, x - sc(22), y, sc(18), 'happy', 'bear'); feelFace(g, x + sc(22), y, sc(18), template === 'feelHelp' ? 'sad' : 'surprised', 'cat');
      if (template === 'feelHelp') s('path', { d: `M${x} ${y - sc(30)} c${-sc(5)} ${-sc(7)} ${-sc(15)} ${-sc(2)} ${-sc(9)} ${sc(6)} l${sc(9)} ${sc(9)} l${sc(9)} ${-sc(9)} c${sc(6)} ${-sc(8)} ${-sc(4)} ${-sc(13)} ${-sc(9)} ${-sc(6)} Z`, fill: C.terra }, g);
      break;
    case 'breathe': s('circle', { cx: x, cy: y, r: sc(26), fill: 'none', stroke: C.teal, 'stroke-width': sc(4), opacity: 0.6 }, g); s('circle', { cx: x, cy: y, r: sc(14), fill: 'none', stroke: C.teal, 'stroke-width': sc(4) }, g); break;
    default: s('circle', ink({ cx: x, cy: y, r: sc(20), fill: C.ochre }, 3), g);
  }
}

// Which friend asks for help next: friends the child has not helped yet come first.
export function nextFriends(profile, n) {
  const helped = (profile.village && profile.village.helped) || [];
  const own = profile.avatar;
  const pool = AVATARS.filter((a) => a !== own && a !== 'owl'); // the owl is the guide
  const count = (k) => helped.filter((h) => h.kind === k).length;
  return pool.slice().sort((a, b) => count(a) - count(b) || pool.indexOf(a) - pool.indexOf(b)).slice(0, n);
}

// Draw the village. Returns the quest cards so the caller can wire them.
export function drawVillage(layer, profile, quests, opts = {}) {
  const helped = (profile.village && profile.village.helped) || [];
  // A layered landscape lit from the upper left (see the svg-illustration-finish
  // skill): sky gradient, far hills paler and bluer, near hills richer.
  const gid = `vsky${Math.floor(Math.random() * 1e6)}`;
  const defs = s('defs', null, layer);
  const sky = s('linearGradient', { id: gid, x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
  s('stop', { offset: '0', 'stop-color': '#c9dfe2' }, sky);
  s('stop', { offset: '0.55', 'stop-color': '#e3ece2' }, sky);
  s('stop', { offset: '1', 'stop-color': '#f1ecd9' }, sky);
  const halo = s('radialGradient', { id: gid + 'h' }, defs);
  s('stop', { offset: '0.45', 'stop-color': '#f6e2a6', 'stop-opacity': 0.55 }, halo);
  s('stop', { offset: '1', 'stop-color': '#f6e2a6', 'stop-opacity': 0 }, halo);
  s('rect', { x: -400, y: -200, width: 2400, height: 800, fill: `url(#${gid})` }, layer);
  s('circle', { cx: 1380, cy: 120, r: 150, fill: `url(#${gid}h)` }, layer);
  shade(layer, 'circle', { cx: 1380, cy: 120, r: 58 }, { fill: '#f5dc93', shadow: '#ecc979', d: [8, 7] });
  for (const [cx, cy, r] of [[300, 110, 46], [1010, 70, 36]]) {
    shade(layer, 'path', { d: blob(cx, cy, r, 7, r * 0.32, 2.2) }, { fill: '#fbfaf3', shadow: '#e2e9ea', d: [0, 9], line: '#d6e0e2', w: 2 });
  }
  s('path', { d: 'M-200 360 Q 150 270 520 320 T 1100 290 T 1800 310 V1100 H-200 Z', fill: '#c3d5bd' }, layer);
  s('path', { d: 'M-200 400 Q 300 300 800 350 T 1800 330 V1100 H-200 Z', fill: '#b4cb98' }, layer);
  s('path', { d: 'M-200 540 Q 400 460 800 520 T 1800 500 V1100 H-200 Z', fill: '#a2bf86' }, layer);
  s('path', { d: 'M-200 700 Q 500 640 900 690 T 1800 670 V1100 H-200 Z', fill: '#98b67e', opacity: 0.7 }, layer);
  // The path, with a darker edge so it sits in the grass.
  const road = 'M760 900 C 740 760 860 700 800 600 C 760 540 820 470 800 420';
  s('path', { d: road, fill: 'none', stroke: '#d3bf97', 'stroke-width': 84, 'stroke-linecap': 'round' }, layer);
  s('path', { d: road, fill: 'none', stroke: '#ecdcba', 'stroke-width': 68, 'stroke-linecap': 'round' }, layer);
  for (const [x, y] of [[776, 640], [818, 520], [760, 800], [804, 460]]) s('ellipse', { cx: x, cy: y, rx: 9, ry: 5, fill: '#d8c49d' }, layer);
  // Trees frame the village (behind the houses).
  for (const [x, y, k] of [[175, 330, 1], [690, 300, 0.8], [925, 290, 0.85], [1430, 335, 1], [110, 590, 1.2], [1505, 600, 1.2]]) tree(layer, x, y, k);
  // Flowers grow with every friend helped (up to a calm maximum).
  const blooms = Math.min(36, helped.length * 2);
  for (let i = 0; i < blooms; i++) {
    const x = 120 + ((i * 397) % 1360), y = 560 + ((i * 131) % 300);
    if (Math.abs(x - 800) < 90) continue;
    flower(layer, x, y, [C.rose, C.ochre, C.white, C.plum][i % 4]);
  }
  // Houses: one for each friend helped; empty plots show where friends could live.
  const houses = [];
  HOUSE_SPOTS.forEach(([x, y], i) => {
    const h = helped[i];
    const g = s('g', null, layer);
    if (!h) {
      // An empty plot: a mound of soil with a sprout, waiting for a new neighbour.
      ground(g, x, y + 42, 70, 14, '#5a4632', 0.12);
      shade(g, 'path', { d: `M${x - 58} ${y + 42} Q${x} ${y + 16} ${x + 58} ${y + 42} Z` }, { fill: '#c9ae82', shadow: '#ab9070', line: '#8a6f52', w: 2.5, d: [6, 4] });
      line(g, `M${x} ${y + 34} Q${x - 2} ${y + 22} ${x} ${y + 12}`, '#5f7f55', 4);
      shade(g, 'path', { d: `M${x} ${y + 16} Q${x - 18} ${y} ${x - 28} ${y + 12} Q${x - 14} ${y + 22} ${x} ${y + 16} Z` }, { fill: '#93b377', shadow: '#769a68', line: '#4f6b45', w: 2.5, d: [3, 3] });
      shade(g, 'path', { d: `M${x} ${y + 12} Q${x + 16} ${y - 6} ${x + 28} ${y + 6} Q${x + 14} ${y + 18} ${x} ${y + 12} Z` }, { fill: '#93b377', shadow: '#769a68', line: '#4f6b45', w: 2.5, d: [3, 3] });
    } else {
      const inner = s('g', { class: 'fbb' }, s('g', { transform: `translate(${x} ${y + 44}) scale(1.3) translate(${-x} ${-(y + 44)})` }, g));
      house(inner, x, y, HOUSE_COLORS[i % HOUSE_COLORS.length], h.kind);
      g.inner = inner;
    }
    houses.push(g);
  });
  // Friends waiting on the path, each with a bubble showing what they need.
  const cards = quests.map((q, i) => {
    const n = quests.length;
    const x = 800 + (i - (n - 1) / 2) * 400, y = 720;
    const c = card(layer, x, y, 300, 250, C.white);
    c.g.dataset.quest = q.skill.id;
    const bob = s('g', { class: 'fb bob', style: `animation-delay:${i * 0.4}s` }, c.inner);
    avatar(bob, q.friend, x - 60, y + 30, 62);
    s('path', ink({ d: `M${x + 6} ${y - 90} h110 a20 20 0 0 1 20 20 v70 a20 20 0 0 1 -20 20 h-70 l-24 22 l2 -22 h-18 a20 20 0 0 1 -20 -20 v-70 a20 20 0 0 1 20 -20 z`, fill: C.cream }, 3), c.inner);
    activityIcon(c.inner, q.skill.template, x + 61, y - 35, 1);
    if (q.review) s('path', ink({ d: `M${x + 112} ${y + 90} a14 14 0 1 1 -6 -11 l8 -6 v14 h-14`, fill: 'none', stroke: C.teal }, 3.5), c.inner);
    return c;
  });
  return { cards, houses };
}

// The quest friend shown inside a lesson (bottom-right), reacting to answers.
export function lessonFriend(layer, kind) {
  const g = s('g', { 'pointer-events': 'none' }, layer);
  const inner = s('g', { class: 'fbb' }, g);
  const bob = s('g', { class: 'fb bob' }, inner);
  avatar(bob, kind, 1470, 790, 68);
  return {
    happy() { replay(inner, 'hop'); },
    puzzled() { replay(inner, 'wiggle'); },
  };
}

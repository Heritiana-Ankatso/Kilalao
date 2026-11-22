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
import { AVATARS } from './profiles.js';

const HOUSE_SPOTS = [[330, 300], [560, 250], [800, 230], [1040, 250], [1270, 300], [420, 450], [1180, 450], [800, 400]];
const HOUSE_COLORS = [C.terra, C.teal, C.ochre, C.plum, C.blue, C.sage, C.rose, C.cocoa];

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
  // Sky, hills and path
  s('rect', { x: -400, y: -200, width: 2400, height: 1300, fill: '#dcebe6' }, layer);
  s('circle', { cx: 1380, cy: 120, r: 60, fill: '#f3dc9a', opacity: 0.9 }, layer);
  s('path', { d: 'M-200 380 Q 300 250 800 320 T 1800 300 V1100 H-200 Z', fill: '#b9cf96' }, layer);
  s('path', { d: 'M-200 520 Q 400 440 800 500 T 1800 480 V1100 H-200 Z', fill: '#a3c08a' }, layer);
  s('path', { d: 'M760 900 C 740 760 860 700 800 600 C 760 540 820 470 800 420', fill: 'none', stroke: '#e8d8b6', 'stroke-width': 70, 'stroke-linecap': 'round' }, layer);
  // Flowers grow with every friend helped (up to a calm maximum).
  const blooms = Math.min(36, helped.length * 2);
  for (let i = 0; i < blooms; i++) {
    const x = 120 + ((i * 397) % 1360), y = 560 + ((i * 131) % 300);
    if (Math.abs(x - 800) < 90) continue;
    s('circle', { cx: x, cy: y, r: 9, fill: [C.rose, C.ochre, C.white, C.plum][i % 4], stroke: C.ink, 'stroke-width': 2 }, layer);
  }
  // Houses: one for each friend helped; empty plots show where friends could live.
  const houses = [];
  HOUSE_SPOTS.forEach(([x, y], i) => {
    const h = helped[i];
    const g = s('g', null, layer);
    if (!h) {
      // An empty plot: a patch of soil with a sprout, waiting for a new neighbour.
      s('ellipse', { cx: x, cy: y + 40, rx: 64, ry: 16, fill: '#cdb58a', opacity: 0.7 }, g);
      s('path', ink({ d: `M${x} ${y + 40} v-26`, fill: 'none', stroke: C.moss }, 4), g);
      s('path', ink({ d: `M${x} ${y + 22} q-18 -16 -26 -2 q14 8 26 2 z M${x} ${y + 18} q16 -18 26 -4 q-12 10 -26 4 z`, fill: C.leaf }, 3), g);
    } else {
      const inner = s('g', { class: 'fbb' }, s('g', { transform: `translate(${x} ${y + 44}) scale(1.3) translate(${-x} ${-(y + 44)})` }, g));
      s('rect', ink({ x: x - 62, y: y - 40, width: 124, height: 84, rx: 10, fill: C.cream }, 4), inner);
      s('path', ink({ d: `M${x - 78} ${y - 34} L${x} ${y - 100} L${x + 78} ${y - 34} Z`, fill: HOUSE_COLORS[i % HOUSE_COLORS.length] }, 4), inner);
      s('rect', ink({ x: x + 20, y: y - 4, width: 28, height: 48, rx: 6, fill: C.wood }, 3), inner);
      s('circle', ink({ cx: x - 26, cy: y - 2, r: 24, fill: '#f6e3a4' }, 3), inner);
      avatar(inner, h.kind, x - 26, y, 17);
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

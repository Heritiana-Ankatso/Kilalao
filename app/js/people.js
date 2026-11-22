// Diverse, customisable people shared by the Town and House toys.
// Origin is the point between the feet; a standing person is about 195 units tall.
import { s } from './lib.js';

export const SKINS = ['#f3d6bd', '#e4b894', '#c98f66', '#9c6848', '#6b4632'];
export const HAIRS = ['#2f2520', '#5b3b27', '#a06c3c', '#dcb779', '#c9c3bb', '#9a4b36'];
export const CLOTH = ['#c97b63', '#d8a650', '#93ab8b', '#5e8f8f', '#7898b3', '#9b7c97', '#e8dcc4', '#6d6a8a'];
export const HATS = [null, 'cap', 'beanie', 'flower', 'helmet', 'chef'];

const INK = '#4a3f35';
const ink = (o) => ({ stroke: INK, 'stroke-width': 3, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', ...o });

function limb(parent, d, color, w = 15) {
  s('path', { d, stroke: INK, 'stroke-width': w + 6, fill: 'none', 'stroke-linecap': 'round' }, parent);
  s('path', { d, stroke: color, 'stroke-width': w, fill: 'none', 'stroke-linecap': 'round' }, parent);
}

export function person(g, sp) {
  while (g.firstChild) g.firstChild.remove();
  const sit = sp.wheelchair || sp.pose === 'sit';
  const b = s('g', null, g);
  if (sp.pose === 'lie') b.setAttribute('transform', 'rotate(-90)');
  s('rect', { x: -52, y: -205, width: 104, height: 210, fill: 'transparent' }, b);
  const skin = sp.skin, hc = sp.hairColor, top = sp.top, bot = sp.bottom;
  const hy = -152;

  // Wheelchair frame (behind the body)
  if (sp.wheelchair) {
    s('path', { d: 'M-40 -128 L-40 -60 L34 -60', fill: 'none', stroke: '#5f646d', 'stroke-width': 7, 'stroke-linecap': 'round' }, b);
    s('circle', { cx: -10, cy: -44, r: 42, fill: 'none', stroke: '#5f646d', 'stroke-width': 7 }, b);
    s('circle', { cx: -10, cy: -44, r: 36, fill: 'none', stroke: '#9aa0a8', 'stroke-width': 2 }, b);
    s('circle', { cx: -10, cy: -44, r: 6, fill: '#5f646d' }, b);
    s('circle', { cx: 40, cy: -8, r: 8, fill: '#5f646d' }, b);
    s('path', { d: 'M34 -60 L40 -16', stroke: '#5f646d', 'stroke-width': 5 }, b);
  }

  // Hair behind the head
  if (sp.hair === 1) s('path', ink({ d: `M-33 ${hy - 6} Q-42 ${hy + 48} -26 ${hy + 60} L26 ${hy + 60} Q42 ${hy + 48} 33 ${hy - 6} Z`, fill: hc }), b);
  if (sp.hair === 2) s('circle', ink({ cx: 0, cy: hy - 6, r: 44, fill: hc }), b);
  if (sp.hair === 4) s('path', ink({ d: `M26 ${hy - 18} q34 6 26 58 q-12 -16 -28 -34z`, fill: hc }), b);

  // Legs
  if (!sit) {
    for (const x of [-12, 12]) {
      const pro = sp.prosthetic && x > 0;
      if (pro) {
        s('rect', ink({ x: x - 10, y: -74, width: 20, height: 36, rx: 8, fill: bot }), b);
        s('path', { d: `M${x} -38 L${x} -8`, stroke: '#8d939c', 'stroke-width': 7, 'stroke-linecap': 'round' }, b);
        s('path', { d: `M${x - 6} -6 q12 8 24 -1`, stroke: '#5f646d', 'stroke-width': 6, fill: 'none', 'stroke-linecap': 'round' }, b);
      } else {
        s('rect', ink({ x: x - 10, y: -74, width: 20, height: 68, rx: 8, fill: bot }), b);
        s('ellipse', ink({ cx: x + 4, cy: -5, rx: 14, ry: 7, fill: '#5a4a40' }), b);
      }
    }
  } else {
    s('rect', ink({ x: -24, y: -80, width: 66, height: 24, rx: 10, fill: bot }), b);
    if (sp.prosthetic) {
      s('path', { d: 'M34 -58 L34 -10', stroke: '#8d939c', 'stroke-width': 7, 'stroke-linecap': 'round' }, b);
      s('path', { d: 'M28 -8 q12 8 24 -1', stroke: '#5f646d', 'stroke-width': 6, fill: 'none', 'stroke-linecap': 'round' }, b);
    } else {
      s('rect', ink({ x: 22, y: -64, width: 20, height: 58, rx: 8, fill: bot }), b);
      s('ellipse', ink({ cx: 38, cy: -5, rx: 14, ry: 7, fill: '#5a4a40' }), b);
    }
  }

  // Body and arms
  const by = sit ? -136 : -134;
  s('rect', ink({ x: -32, y: by, width: 64, height: 70, rx: 24, fill: top }), b);
  if (sp.wave) limb(b, `M28 ${by + 12} Q52 ${by - 6} 50 ${by - 36}`, top);
  else limb(b, `M28 ${by + 12} Q46 ${by + 34} 40 ${by + 62}`, top);
  limb(b, `M-28 ${by + 12} Q-46 ${by + 34} -40 ${by + 62}`, top);
  const hand = sp.wave ? [50, by - 40] : [40, by + 66];
  s('circle', ink({ cx: -40, cy: by + 66, r: 9, fill: skin }), b);
  s('circle', ink({ cx: hand[0], cy: hand[1], r: 9, fill: skin }), b);
  if (sp.wheelchair) s('path', { d: 'M-46 -96 L-46 -60', stroke: '#5f646d', 'stroke-width': 6, 'stroke-linecap': 'round' }, b);

  // Head
  const hdy = sit ? hy - 2 : hy;
  s('rect', { x: -8, y: hdy + 22, width: 16, height: 14, fill: skin }, b);
  s('circle', ink({ cx: -30, cy: hdy + 2, r: 7, fill: skin }), b);
  s('circle', ink({ cx: 30, cy: hdy + 2, r: 7, fill: skin }), b);
  s('circle', ink({ cx: 0, cy: hdy, r: 30, fill: skin }), b);
  if (sp.aid) s('path', ink({ d: `M33 ${hdy - 8} q10 4 6 18 q-4 2 -6 -2z`, fill: '#d8a650', 'stroke-width': 2 }), b);
  s('circle', { cx: -17, cy: hdy + 11, r: 5.5, fill: '#dca9a0', opacity: 0.6 }, b);
  s('circle', { cx: 17, cy: hdy + 11, r: 5.5, fill: '#dca9a0', opacity: 0.6 }, b);
  if (sp.pose === 'lie') {
    s('path', { d: `M-15 ${hdy + 2} q5 4 10 0 M5 ${hdy + 2} q5 4 10 0`, stroke: INK, 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }, b);
  } else {
    s('circle', { cx: -10, cy: hdy + 1, r: 3.8, fill: INK }, b);
    s('circle', { cx: 10, cy: hdy + 1, r: 3.8, fill: INK }, b);
  }
  s('path', { d: sp.happy ? `M-11 ${hdy + 11} Q0 ${hdy + 24} 11 ${hdy + 11} Z` : `M-9 ${hdy + 13} Q0 ${hdy + 20} 9 ${hdy + 13}`, stroke: INK, 'stroke-width': 3, fill: sp.happy ? '#a8574a' : 'none', 'stroke-linecap': 'round' }, b);

  // Hair in front
  const fringe = `M-31 ${hdy - 2} Q-30 ${hdy - 34} 0 ${hdy - 34} Q30 ${hdy - 34} 31 ${hdy - 2} Q16 ${hdy - 20} -10 ${hdy - 14} Q-22 ${hdy - 10} -31 ${hdy - 2} Z`;
  if (sp.hair === 0 || sp.hair === 1 || sp.hair === 4) s('path', ink({ d: fringe, fill: hc }), b);
  if (sp.hair === 2) {
    for (let i = 0; i < 7; i++) {
      const a = Math.PI * (1.05 + i * 0.15);
      s('circle', { cx: Math.cos(a) * 28, cy: hdy - 6 + Math.sin(a) * 26, r: 12, fill: hc }, b);
    }
  }
  if (sp.hair === 3) {
    s('path', ink({ d: fringe, fill: hc }), b);
    s('circle', ink({ cx: 0, cy: hdy - 40, r: 15, fill: hc }), b);
  }
  if (sp.hair === 5) s('path', { d: `M-12 ${hdy - 22} q8 -6 16 -4`, stroke: '#fff', 'stroke-width': 3, opacity: 0.5, fill: 'none', 'stroke-linecap': 'round' }, b);

  // Glasses
  if (sp.glasses) {
    s('circle', { cx: -11, cy: hdy + 1, r: 9.5, fill: 'rgba(255,255,255,.25)', stroke: INK, 'stroke-width': 2.6 }, b);
    s('circle', { cx: 11, cy: hdy + 1, r: 9.5, fill: 'rgba(255,255,255,.25)', stroke: INK, 'stroke-width': 2.6 }, b);
    s('path', { d: `M-2 ${hdy} q2 -2 4 0`, stroke: INK, 'stroke-width': 2.6, fill: 'none' }, b);
  }

  // Hats
  const hat = sp.hat;
  if (hat === 'cap') {
    s('path', ink({ d: `M-30 ${hdy - 10} Q-28 ${hdy - 40} 2 ${hdy - 40} Q30 ${hdy - 38} 30 ${hdy - 10} Z`, fill: '#7898b3' }), b);
    s('path', ink({ d: `M14 ${hdy - 12} q24 -4 36 4 q-18 6 -36 4z`, fill: '#7898b3' }), b);
  } else if (hat === 'beanie') {
    s('path', ink({ d: `M-31 ${hdy - 6} Q-30 ${hdy - 46} 0 ${hdy - 46} Q30 ${hdy - 46} 31 ${hdy - 6} Z`, fill: '#c97b63' }), b);
    s('rect', ink({ x: -33, y: hdy - 14, width: 66, height: 12, rx: 6, fill: '#e8dcc4' }), b);
    s('circle', ink({ cx: 0, cy: hdy - 50, r: 8, fill: '#e8dcc4' }), b);
  } else if (hat === 'flower') {
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      s('circle', ink({ cx: 22 + Math.cos(a) * 8, cy: hdy - 22 + Math.sin(a) * 8, r: 6, fill: '#dca9a0', 'stroke-width': 2 }), b);
    }
    s('circle', { cx: 22, cy: hdy - 22, r: 4, fill: '#d8a650' }, b);
  } else if (hat === 'helmet') {
    s('path', ink({ d: `M-32 ${hdy - 8} Q-30 ${hdy - 44} 0 ${hdy - 44} Q30 ${hdy - 44} 32 ${hdy - 8} Z`, fill: '#c0553f' }), b);
    s('path', ink({ d: `M-40 ${hdy - 6} h80`, 'stroke-width': 7, stroke: '#c0553f' }), b);
    s('circle', ink({ cx: 0, cy: hdy - 24, r: 7, fill: '#d8a650', 'stroke-width': 2 }), b);
  } else if (hat === 'chef') {
    s('path', ink({ d: `M-24 ${hdy - 20} q-18 -30 8 -34 q10 -18 30 -4 q26 -2 12 38 z`, fill: '#fbf7ef' }), b);
  }
  return { hand: sit ? [hand[0], hand[1]] : hand };
}

export function randomSpec(i = Math.floor(Math.random() * 99)) {
  const r = (n) => (i * 7 + n * 13) % n;
  return {
    skin: SKINS[i % SKINS.length],
    hair: i % 6,
    hairColor: HAIRS[(i * 3) % HAIRS.length],
    top: CLOTH[(i * 5) % CLOTH.length],
    bottom: CLOTH[(i * 3 + 4) % CLOTH.length],
    glasses: r(3) === 0,
    hat: null,
  };
}

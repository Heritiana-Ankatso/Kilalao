// Shared drawing pieces for Learn activities (SVG, 1600x900 world):
// countable objects, ten-frames, base-ten blocks, numerals and answer buttons.
import { s, C, replay } from '../lib.js';

export const INK = C.ink;
export const FONT = 'ui-rounded, "Nunito", "Varela Round", "Arial Rounded MT Bold", "Segoe UI", system-ui, sans-serif';
export const ink = (o, w = 4) => ({ stroke: INK, 'stroke-width': w, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', ...o });

// Layout bands
export const STAGE = { top: 170, bottom: 660 };
export const CHOICE_Y = 780;

// ---------- Countable objects (radius ~34) ----------
const KINDS = {
  apple(g, c) {
    s('path', ink({ d: 'M0 -26 C-34 -40 -42 4 -24 24 C-12 36 -4 30 0 28 C4 30 12 36 24 24 C42 4 34 -40 0 -26 Z', fill: c || C.terra }, 3.5), g);
    s('path', ink({ d: 'M0 -26 q2 -12 8 -16', fill: 'none' }, 3.5), g);
    s('path', ink({ d: 'M4 -34 q14 -10 22 -2 q-12 8 -22 2 z', fill: C.leaf }, 3), g);
  },
  fish(g, c) {
    s('path', ink({ d: 'M18 0 L38 -16 L38 16 Z', fill: c || C.teal }, 3.5), g);
    s('ellipse', ink({ cx: -4, cy: 0, rx: 28, ry: 20, fill: c || C.teal }, 3.5), g);
    s('circle', { cx: -16, cy: -4, r: 4, fill: INK }, g);
  },
  star(g, c) {
    let d = '';
    for (let i = 0; i < 10; i++) { const r = i % 2 ? 14 : 34, a = (i / 10) * Math.PI * 2 - Math.PI / 2; d += (i ? 'L' : 'M') + (Math.cos(a) * r).toFixed(1) + ' ' + (Math.sin(a) * r).toFixed(1); }
    s('path', ink({ d: d + 'Z', fill: c || C.ochre }, 3.5), g);
  },
  duck(g, c) {
    s('ellipse', ink({ cx: 0, cy: 8, rx: 32, ry: 22, fill: c || '#e8c56a' }, 3.5), g);
    s('circle', ink({ cx: 16, cy: -16, r: 15, fill: c || '#e8c56a' }, 3.5), g);
    s('path', ink({ d: 'M29 -16 l14 3 l-14 5 z', fill: C.terra }, 3), g);
    s('circle', { cx: 19, cy: -19, r: 3.5, fill: INK }, g);
  },
  flower(g, c) {
    for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; s('circle', ink({ cx: Math.cos(a) * 17, cy: Math.sin(a) * 17, r: 13, fill: c || C.rose }, 3), g); }
    s('circle', ink({ cx: 0, cy: 0, r: 11, fill: C.ochre }, 3), g);
  },
  ball(g, c) {
    s('circle', ink({ cx: 0, cy: 0, r: 30, fill: c || C.blue }, 3.5), g);
    s('path', { d: 'M-30 0 Q0 -16 30 0 M-30 0 Q0 16 30 0', stroke: INK, 'stroke-width': 3, fill: 'none', opacity: 0.4 }, g);
  },
  shell(g, c) {
    s('path', ink({ d: 'M-30 18 Q-34 -26 0 -30 Q34 -26 30 18 Z', fill: c || C.rose }, 3.5), g);
    s('path', { d: 'M0 16 V-26 M-14 16 L-8 -26 M14 16 L8 -26', stroke: INK, 'stroke-width': 2.5, opacity: 0.5 }, g);
  },
  leaf(g, c) {
    s('path', ink({ d: 'M-30 20 Q-30 -30 30 -24 Q28 26 -30 20 Z', fill: c || C.leaf }, 3.5), g);
    s('path', { d: 'M-28 18 L24 -20', stroke: INK, 'stroke-width': 2.5, opacity: 0.5 }, g);
  },
};
export const KIND_NAMES = Object.keys(KINDS);

// Draw one object; returns its outer group. The inner group takes CSS classes.
export function obj(parent, kind, x, y, scale = 1, color) {
  const o = s('g', { transform: `translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${scale})` }, parent);
  const inner = s('g', { class: 'fb' }, o);
  KINDS[kind](inner, color);
  o.inner = inner;
  o.x = x; o.y = y; o.scale = scale;
  return o;
}

// Move an object (keeps its scale) and remember where it is.
export function moveObj(o, x, y) {
  o.x = x; o.y = y;
  o.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${o.scale || 1})`);
}

// The guide's pointing hand. Its fingertip is at (0, 0). It moves with a CSS
// transition, so the outer group carries no transform attribute.
export function handPointer(parent) {
  const g = s('g', { class: 'guide-hand', 'pointer-events': 'none' }, parent);
  const inner = s('g', null, g);
  s('path', ink({ d: 'M-4 -2 C-10 -10 -12 -24 -6 -28 C0 -32 6 -26 8 -16 L12 2 C16 -6 26 -6 28 4 C34 -2 44 2 44 12 C50 8 60 14 58 26 L56 56 C54 74 40 86 22 86 L6 86 C-8 86 -20 76 -26 62 L-40 30 C-44 22 -36 14 -28 20 L-14 34 L-14 -2 Z', fill: '#f6dcc2' }, 3.5), inner);
  s('path', { d: 'M12 2 L14 26 M28 4 L30 28 M44 12 L44 30', stroke: INK, 'stroke-width': 2.5, opacity: 0.45, fill: 'none', 'stroke-linecap': 'round' }, inner);
  g.inner = inner;
  return g;
}

export const centerOf = (t) => (t && t.x !== undefined ? { x: t.x, y: t.y } : t && t.cx !== undefined ? { x: t.cx, y: t.cy } : { x: 800, y: 450 });

export function pulse(o) { replay(o.inner || o, 'hop'); }

// ---------- Arrangements ----------
// Scattered, non-overlapping positions inside a box.
export function scatter(rng, n, box, minDist = 100) {
  const pts = [];
  for (let tries = 0; pts.length < n && tries < 4000; tries++) {
    const p = { x: box.x + rng() * box.w, y: box.y + rng() * box.h };
    if (pts.every((q) => Math.hypot(q.x - p.x, q.y - p.y) >= minDist)) pts.push(p);
    if (tries > 2000) minDist *= 0.995;
  }
  return pts;
}

// Ten-frame grid positions: frames of 2 rows x 5, laid out side by side.
export function frames(n, cx, cy, cell = 76) {
  const count = Math.max(1, Math.ceil(n / 10));
  const fw = cell * 5 + 24, gap = 30;
  const total = count * fw + (count - 1) * gap;
  const out = { cells: [], frames: [] };
  for (let f = 0; f < count; f++) {
    const fx = cx - total / 2 + f * (fw + gap);
    out.frames.push({ x: fx, y: cy - cell - 12, w: fw, h: cell * 2 + 24 });
    for (let i = 0; i < 10; i++) out.cells.push({ x: fx + 12 + cell / 2 + (i % 5) * cell, y: cy - cell / 2 + Math.floor(i / 5) * cell });
  }
  return out;
}

export function drawFrames(parent, fr, cell = 76) {
  for (const f of fr.frames) {
    s('rect', ink({ x: f.x, y: f.y, width: f.w, height: f.h, rx: 14, fill: C.cream }, 4), parent);
    for (let i = 1; i < 5; i++) s('line', { x1: f.x + 12 + i * cell, y1: f.y + 12, x2: f.x + 12 + i * cell, y2: f.y + f.h - 12, stroke: INK, 'stroke-width': 2, opacity: 0.3 }, parent);
    s('line', { x1: f.x + 12, y1: f.y + f.h / 2, x2: f.x + f.w - 12, y2: f.y + f.h / 2, stroke: INK, 'stroke-width': 2, opacity: 0.3 }, parent);
  }
}

// Base-ten blocks: tens as rods, ones as cubes. Returns the pieces.
export function blocks(parent, n, x, y, unit = 22) {
  const tens = Math.floor(n / 10), ones = n % 10, out = [];
  for (let i = 0; i < tens; i++) {
    const g = s('g', null, parent);
    const r = s('g', { class: 'fb' }, g);
    s('rect', ink({ x: x + i * (unit + 8), y, width: unit, height: unit * 10, rx: 4, fill: C.teal }, 3), r);
    for (let k = 1; k < 10; k++) s('line', { x1: x + i * (unit + 8), y1: y + k * unit, x2: x + i * (unit + 8) + unit, y2: y + k * unit, stroke: INK, 'stroke-width': 1.5, opacity: 0.4 }, r);
    g.inner = r;
    out.push(g);
  }
  const ox = x + tens * (unit + 8) + (tens ? 16 : 0);
  for (let i = 0; i < ones; i++) {
    const g = s('g', null, parent);
    const r = s('g', { class: 'fb' }, g);
    s('rect', ink({ x: ox + (i % 2) * (unit + 6), y: y + unit * 10 - (Math.floor(i / 2) + 1) * (unit + 6) + 6, width: unit, height: unit, rx: 4, fill: C.ochre }, 3), r);
    g.inner = r;
    out.push(g);
  }
  return out;
}

// ---------- Text-like pieces (numerals and symbols are content here) ----------
export function numeral(parent, text, x, y, size = 120, fill = INK) {
  return s('text', { x, y, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-family': FONT, 'font-weight': 800, 'font-size': size, fill, text: String(text) }, parent);
}

export function fractionGlyph(parent, f, x, y, size = 90) {
  const [a, b] = f.split('/');
  const g = s('g', null, parent);
  numeral(g, a, x, y - size * 0.55, size, C.terra);
  s('line', { x1: x - size * 0.45, y1: y, x2: x + size * 0.45, y2: y, stroke: INK, 'stroke-width': size * 0.07, 'stroke-linecap': 'round' }, g);
  numeral(g, b, x, y + size * 0.6, size, C.teal);
  return g;
}

// A rounded card button. Returns { g, inner, x, y, w, h }.
export function card(parent, x, y, w, h, fill = C.white) {
  const g = s('g', { class: 'tap' }, parent);
  const inner = s('g', { class: 'fb' }, g);
  s('rect', { x: x - w / 2 + 5, y: y - h / 2 + 8, width: w, height: h, rx: 30, fill: '#cdb995' }, inner);
  const bg = s('rect', ink({ x: x - w / 2, y: y - h / 2, width: w, height: h, rx: 30, fill }, 4), inner);
  bg.style.transition = 'fill .3s';
  return { g, inner, bg, x, y, w, h };
}

// Pick n distinct distractors near the answer, within [lo, hi].
export function near(rng, answer, n, lo, hi, spread = [1, 2, -1, -2, 3, -3]) {
  const out = new Set();
  const opts = spread.map((d) => answer + d).filter((v) => v >= lo && v <= hi && v !== answer);
  while (out.size < n && opts.length) out.add(opts.splice(Math.floor(rng() * Math.min(opts.length, 4)), 1)[0]);
  for (let v = lo; out.size < n && v <= hi; v++) if (v !== answer) out.add(v);
  return [...out];
}

export function shuffle(rng, a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
export const randInt = (rng, a, b) => a + Math.floor(rng() * (b - a + 1));

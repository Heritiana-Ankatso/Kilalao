// Illustration helpers for the Learn cast, pictures and village.
// Technique: see .claude/skills/svg-illustration-finish (one light from the
// upper left, soft coloured form shadows, coloured line art, contact shadows).
// No SVG filters: everything here is cheap to render on low-end tablets.
import { s } from '../lib.js';

let uid = 0;
const GEOM = ['d', 'cx', 'cy', 'r', 'rx', 'ry', 'x', 'y', 'width', 'height', 'points', 'transform'];

function geom(attrs) {
  const o = {};
  for (const k of GEOM) if (attrs[k] !== undefined) o[k] = attrs[k];
  return o;
}

function shifted(attrs, dx, dy) {
  const o = geom(attrs);
  o.transform = `translate(${dx} ${dy})${attrs.transform ? ' ' + attrs.transform : ''}`;
  return o;
}

// Draws one shaded shape:
//   - the base colour,
//   - a crescent of `shadow` on the lower right (an offset copy of the shape,
//     clipped to the shape, so the shadow follows the outline exactly),
//   - an optional soft light patch `hi` = [cx, cy, rx, ry] (clipped),
//   - the outline on top in the character's own line colour.
// opts: { fill, shadow, line, w, d: [dx, dy], hi, light, lo }
export function shade(g, tag, attrs, opts) {
  const { fill, shadow, line, w = 3.2, d = [9, 8], hi, light = '#fffaf0', lo = 0.28 } = opts;
  const id = `kc${(uid++).toString(36)}`;
  const clip = s('clipPath', { id }, g);
  s(tag, geom(attrs), clip);
  s(tag, { ...geom(attrs), fill: shadow || fill }, g);
  const inner = s('g', { 'clip-path': `url(#${id})` }, g);
  if (shadow) s(tag, { ...shifted(attrs, -d[0], -d[1]), fill }, inner);
  if (hi) s('ellipse', { cx: hi[0], cy: hi[1], rx: hi[2], ry: hi[3], fill: light, opacity: lo }, inner);
  if (line) s(tag, { ...geom(attrs), fill: 'none', stroke: line, 'stroke-width': w, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, g);
  return inner; // details drawn here stay inside the shape
}

// An outline-only stroke for inner details (fur marks, feather edges).
export function line(g, d, color, w = 2.4, extra = {}) {
  return s('path', { d, fill: 'none', stroke: color, 'stroke-width': w, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', ...extra }, g);
}

// A soft contact shadow on the ground.
export function ground(g, cx, cy, rx, ry = rx * 0.16, color = '#5a4632', o = 0.16) {
  return s('ellipse', { cx, cy, rx, ry, fill: color, opacity: o }, g);
}

// An eye with an iris, pupil and two catch-lights (the light is upper left).
export function eye(g, cx, cy, r, { iris = '#4a3f35', pupil = '#2f2722', white = null, ring = null } = {}) {
  if (white) s('circle', { cx, cy, r, fill: white, stroke: ring || 'none', 'stroke-width': ring ? 3 : 0 }, g);
  const ir = white ? r * 0.64 : r;
  s('circle', { cx, cy: cy + (white ? r * 0.06 : 0), r: ir, fill: iris }, g);
  s('circle', { cx, cy: cy + (white ? r * 0.06 : 0), r: ir * (white ? 0.58 : 0.62), fill: pupil }, g);
  s('circle', { cx: cx - ir * 0.32, cy: cy - ir * 0.3, r: ir * 0.3, fill: '#fffdf8' }, g);
  s('circle', { cx: cx + ir * 0.3, cy: cy + ir * 0.34, r: ir * 0.12, fill: '#fffdf8', opacity: 0.85 }, g);
}

// A fluffy edge: a path of small scallops between two points (fur, feathers, clouds).
export function fluff(x1, y1, x2, y2, n, depth) {
  const dx = (x2 - x1) / n, dy = (y2 - y1) / n;
  const len = Math.hypot(dx, dy) || 1, nx = (-dy / len) * depth, ny = (dx / len) * depth;
  let p = '';
  for (let i = 0; i < n; i++) {
    const ax = x1 + dx * i, ay = y1 + dy * i;
    p += ` Q${(ax + dx / 2 + nx).toFixed(1)} ${(ay + dy / 2 + ny).toFixed(1)} ${(ax + dx).toFixed(1)} ${(ay + dy).toFixed(1)}`;
  }
  return p;
}

// ---------- Automatic finish for simple flat drawings ----------
// finish(g) lights a finished flat drawing (pictures, counting objects,
// village buildings) the same way as the cast: each filled shape gets a soft
// coloured form shadow on the lower right, a faint light patch on the upper
// left, and its dark outline becomes a deep tone of its own colour.
const INK_HEX = '#4a3f35';
const hex = (c) => {
  if (!c || c[0] !== '#') return null;
  const h = c.length === 4 ? c.slice(1).split('').map((x) => x + x).join('') : c.slice(1);
  if (h.length !== 6) return null;
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
};
const mix = (a, b, k) => '#' + a.map((v, i) => Math.round(v + (b[i] - v) * k).toString(16).padStart(2, '0')).join('');
const SHADOW_TO = [59, 47, 74]; // cool purple-brown, never grey
const LINE_TO = [46, 34, 40];

export function finish(root, { amount = 0.11, light = true, min = 16 } = {}) {
  const shapes = [...root.querySelectorAll('path, circle, ellipse, rect, polygon')];
  for (const el of shapes) {
    if (el.closest('clipPath') || el.dataset.flat !== undefined) continue;
    const rgb = hex(el.getAttribute('fill'));
    const stroked = el.getAttribute('stroke') === INK_HEX;
    if (rgb && stroked) el.setAttribute('stroke', mix(rgb, LINE_TO, 0.62));
    if (!rgb || (el.getAttribute('opacity') && Number(el.getAttribute('opacity')) < 1)) continue;
    let bb;
    try { bb = el.getBBox(); } catch (e) { continue; }
    const m = Math.min(bb.width, bb.height);
    if (!(m >= min)) continue;
    const dd = Math.max(2.5, Math.min(12, m * amount));
    const parent = el.parentNode, next = el.nextSibling;
    const id = `kf${(uid++).toString(36)}`;
    const clip = s('clipPath', { id }, null);
    const c0 = el.cloneNode(false); c0.removeAttribute('class'); c0.removeAttribute('style');
    clip.appendChild(c0);
    parent.insertBefore(clip, el);
    const g = s('g', { 'clip-path': `url(#${id})`, 'pointer-events': 'none' }, null);
    const sh = el.cloneNode(false);
    for (const a of ['stroke', 'stroke-width', 'class', 'style', 'opacity']) sh.removeAttribute(a);
    sh.setAttribute('fill', mix(rgb, SHADOW_TO, 0.2));
    g.appendChild(sh);
    const base = sh.cloneNode(false);
    base.setAttribute('fill', el.getAttribute('fill'));
    const mv = s('g', { transform: `translate(${-dd} ${-dd * 0.9})` }, g);
    mv.appendChild(base);
    if (light && m >= 40) {
      const t = el.getAttribute('transform');
      s('ellipse', { cx: bb.x + bb.width * 0.32, cy: bb.y + bb.height * 0.28, rx: bb.width * 0.2, ry: bb.height * 0.13, fill: '#fffaf0', opacity: 0.22, transform: t || undefined }, g);
    }
    parent.insertBefore(g, next);
    if (el.getAttribute('stroke') && el.getAttribute('stroke') !== 'none') {
      const o = el.cloneNode(false);
      o.setAttribute('fill', 'none'); o.removeAttribute('class'); o.removeAttribute('style');
      o.setAttribute('pointer-events', 'none');
      parent.insertBefore(o, next);
    }
  }
  return root;
}

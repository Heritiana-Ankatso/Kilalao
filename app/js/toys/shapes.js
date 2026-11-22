// Shapes: one soft shape breathes in the middle. Tap it and it slowly melts
// into the next shape. Drag it and it follows, then drifts home.
import { s, C, makeStage, pt, mixHex, ease, clamp } from '../lib.js';

const N = 180;
const TAU = Math.PI * 2;

function rayPoly(verts, th) {
  // Distance from the centre to a closed polygon along angle th.
  const dx = Math.cos(th), dy = Math.sin(th);
  let best = 0;
  for (let i = 0; i < verts.length; i++) {
    const [ax, ay] = verts[i], [bx, by] = verts[(i + 1) % verts.length];
    const ex = bx - ax, ey = by - ay;
    const den = dx * ey - dy * ex;
    if (Math.abs(den) < 1e-9) continue;
    const t = (ax * ey - ay * ex) / den;
    const u = (ax * dy - ay * dx) / den;
    if (t > 0 && u >= -1e-6 && u <= 1 + 1e-6) best = Math.max(best, t);
  }
  return best;
}
const regular = (k, R, rot = -Math.PI / 2) => Array.from({ length: k }, (_, i) => [R * Math.cos(rot + (i * TAU) / k), R * Math.sin(rot + (i * TAU) / k)]);
const star = (k, R, r) => Array.from({ length: k * 2 }, (_, i) => { const a = -Math.PI / 2 + (i * Math.PI) / k, q = i % 2 ? r : R; return [q * Math.cos(a), q * Math.sin(a)]; });
const fromPoly = (verts) => Array.from({ length: N }, (_, i) => { const th = -Math.PI / 2 + (i * TAU) / N, d = rayPoly(verts, th); return [d * Math.cos(th), d * Math.sin(th)]; });
const fromPolar = (f) => Array.from({ length: N }, (_, i) => { const th = -Math.PI / 2 + (i * TAU) / N, d = f(th); return [d * Math.cos(th), d * Math.sin(th)]; });
function heart(R) {
  // Sample the classic heart curve, then resample by angle so morphs line up.
  const raw = Array.from({ length: 720 }, (_, i) => {
    const t = (i / 720) * TAU;
    return [16 * Math.pow(Math.sin(t), 3) * R / 17, -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * R / 17 + R * 0.12];
  });
  return fromPoly(raw);
}

export default function shapes(root, kit) {
  const { sfx } = kit;
  const svg = makeStage(root, '#e9e1d2');
  const R = 230;
  const SHAPES = [
    fromPolar(() => R),
    fromPoly(regular(3, R * 1.25, -Math.PI / 2)),
    fromPoly(regular(4, R * 1.2, -Math.PI / 4)),
    fromPoly(star(5, R * 1.15, R * 0.55)),
    heart(R * 1.1),
    fromPoly(regular(6, R * 1.08)),
    fromPolar((th) => R * (0.78 + 0.22 * Math.cos(5 * (th + Math.PI / 2)))),
    fromPoly(regular(5, R * 1.12)),
    fromPolar((th) => R * (0.92 + 0.08 * Math.cos(8 * (th + Math.PI / 2)))),
  ];
  const COLORS = [C.terra, C.teal, C.ochre, C.plum, C.rose, C.sage, '#d98f5c', C.blue, '#b7a07a'];
  const BGS = ['#ece2d2', '#dfe7e4', '#efe6cf', '#e8e0e6', '#f1e3dd', '#e2e8dc', '#efe2d3', '#dfe5ec', '#ece6da'];
  const NOTES = [392, 440, 523, 587, 659, 784, 880, 1046, 659];

  // Background rings
  const bg = s('rect', { x: -800, y: -800, width: 3200, height: 2500, fill: BGS[0] }, svg);
  bg.style.transition = 'fill 2.5s ease';
  const rings = s('g', { opacity: 0.5 }, svg);
  for (let i = 6; i >= 1; i--) s('circle', { cx: 800, cy: 450, r: i * 120, fill: 'none', stroke: '#fff', 'stroke-width': 2, opacity: 0.35 + i * 0.05 }, rings);
  const motes = Array.from({ length: kit.calm ? 8 : 18 }, () => {
    const m = { x: Math.random() * 1600, y: Math.random() * 900, r: 3 + Math.random() * 6, v: 6 + Math.random() * 10, p: Math.random() * 6 };
    m.el = s('circle', { r: m.r, fill: '#fff', opacity: 0.5 }, svg);
    return m;
  });

  const shadow = s('path', { fill: '#000', opacity: 0.07 }, svg);
  const body = s('path', { fill: COLORS[0], stroke: C.ink, 'stroke-width': 5, 'stroke-linejoin': 'round', class: 'tap' }, svg);
  const shine = s('ellipse', { rx: 46, ry: 22, fill: '#fff', opacity: 0.22, 'pointer-events': 'none' }, svg);

  let idx = 0, from = SHAPES[0], to = SHAPES[0], t0 = 0, morphing = false;
  let col = COLORS[0], fromCol = col, toCol = col;
  let pos = { x: 800, y: 450 }, vel = { x: 0, y: 0 }, held = null, rot = 0, spin = 0;

  function next() {
    from = current();
    fromCol = col;
    idx = (idx + 1) % SHAPES.length;
    to = SHAPES[idx]; toCol = COLORS[idx];
    t0 = performance.now(); morphing = true;
    bg.setAttribute('fill', BGS[idx]);
    sfx.chime(NOTES[idx], 0.8);
    spin += 0.6;
  }
  let pts = SHAPES[0];
  function current() { return pts.map((p) => p.slice()); }

  let downAt = 0, downP = null;
  body.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    const p = pt(svg, e);
    held = { id: e.pointerId, off: { x: pos.x - p.x, y: pos.y - p.y }, moved: false, start: p };
    downAt = performance.now(); downP = p;
  });
  kit.on(window, 'pointermove', (e) => {
    if (!held || e.pointerId !== held.id) return;
    const p = pt(svg, e);
    if (Math.hypot(p.x - held.start.x, p.y - held.start.y) > 12) held.moved = true;
    if (held.moved) held.target = { x: p.x + held.off.x, y: p.y + held.off.y };
  });
  const up = (e) => {
    if (!held || e.pointerId !== held.id) return;
    if (!held.moved) next();
    held = null;
  };
  kit.on(window, 'pointerup', up);
  kit.on(window, 'pointercancel', up);
  // Tapping the background also gives a soft note and a small ripple.
  svg.addEventListener('pointerdown', (e) => {
    if (e.target === body) return;
    const p = pt(svg, e);
    const c = s('circle', { cx: p.x, cy: p.y, r: 10, fill: 'none', stroke: '#fff', 'stroke-width': 4, opacity: 0.8 }, svg);
    let k = 0;
    const stop = kit.loop((dt) => {
      k += dt;
      c.setAttribute('r', 10 + k * 140);
      c.setAttribute('opacity', Math.max(0, 0.8 - k));
      if (k > 0.8) { stop(); c.remove(); }
    });
    kit.audio.tone(NOTES[(Math.floor(p.x / 200)) % NOTES.length] / 2, { dur: 0.8, vol: 0.06, attack: 0.05 });
  });

  kit.loop((dt, t) => {
    if (morphing) {
      const k = clamp((performance.now() - t0) / 1600, 0, 1), e = ease(k);
      pts = from.map((p, i) => [p[0] + (to[i][0] - p[0]) * e, p[1] + (to[i][1] - p[1]) * e]);
      col = mixHex(fromCol, toCol, e);
      if (k >= 1) morphing = false;
    }
    // Spring towards the finger, or home.
    const target = held && held.target ? held.target : { x: 800, y: 450 };
    const kf = held ? 18 : 2.2;
    vel.x += (target.x - pos.x) * kf * dt; vel.y += (target.y - pos.y) * kf * dt;
    vel.x *= Math.exp(-(held ? 9 : 3) * dt); vel.y *= Math.exp(-(held ? 9 : 3) * dt);
    pos.x += vel.x * dt; pos.y += vel.y * dt;
    spin *= Math.exp(-1.5 * dt);
    rot += (0.05 + spin) * dt;
    const breath = 1 + Math.sin(t * 1.2) * 0.025;
    const c = Math.cos(rot), sn = Math.sin(rot);
    let d = '';
    pts.forEach(([x, y], i) => {
      const X = pos.x + (x * c - y * sn) * breath, Y = pos.y + (x * sn + y * c) * breath;
      d += (i ? 'L' : 'M') + X.toFixed(1) + ' ' + Y.toFixed(1);
    });
    d += 'Z';
    body.setAttribute('d', d);
    body.setAttribute('fill', col);
    shadow.setAttribute('d', d);
    shadow.setAttribute('transform', 'translate(14 22)');
    shine.setAttribute('cx', pos.x - 70); shine.setAttribute('cy', pos.y - 90);
    rings.setAttribute('transform', `rotate(${(t * 2) % 360} 800 450)`);
    for (const m of motes) {
      m.y -= m.v * dt;
      if (m.y < -20) { m.y = 920; m.x = Math.random() * 1600; }
      m.el.setAttribute('cx', (m.x + Math.sin(t * 0.5 + m.p) * 20).toFixed(1));
      m.el.setAttribute('cy', m.y.toFixed(1));
    }
  });
}

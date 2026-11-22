// Silly Blocks: drag bodies, eyes, mouths, arms, legs, horns and wheels out
// of the tray. Drop a part on a creature and it sticks. Tap a creature to
// make it wiggle. Pull a part off to move it; drop it on the tray to tidy.
import { s, C, makeStage, pt, rand, pick, replay } from '../lib.js';

const INK = C.ink;
const o = (extra) => ({ stroke: INK, 'stroke-width': 4, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', ...extra });
const BODY_COLS = [C.sage, C.terra, C.ochre, C.teal, C.plum, C.blue, C.rose, '#b7a07a'];

function eye(g, x, y, r) {
  s('circle', o({ cx: x, cy: y, r, fill: '#fff' }), g);
  const p = s('circle', { cx: x, cy: y, r: r * 0.45, fill: INK, class: 'pupil' }, g);
  p.dataset.cx = x; p.dataset.cy = y; p.dataset.r = r * 0.4;
  s('circle', { cx: x - r * 0.2, cy: y - r * 0.25, r: r * 0.15, fill: '#fff', 'pointer-events': 'none' }, g);
}

// Each part: draw(g, color), body?: boolean
const PARTS = {
  blob: { body: true, draw: (g, c) => s('path', o({ d: 'M0 -90 C60 -92 96 -40 88 10 C82 64 40 92 0 90 C-46 92 -88 60 -90 8 C-92 -44 -56 -88 0 -90Z', fill: c }), g) },
  box: { body: true, draw: (g, c) => s('rect', o({ x: -80, y: -70, width: 160, height: 140, rx: 26, fill: c }), g) },
  bean: { body: true, draw: (g, c) => s('ellipse', o({ cx: 0, cy: 0, rx: 62, ry: 105, fill: c }), g) },
  tri: { body: true, draw: (g, c) => s('path', o({ d: 'M0 -95 Q14 -95 90 60 Q96 76 76 76 L-76 76 Q-96 76 -90 60 Q-14 -95 0 -95Z', fill: c }), g) },
  eyes2: { draw: (g) => { eye(g, -26, 0, 20); eye(g, 26, 0, 20); } },
  eye1: { draw: (g) => { eye(g, 0, 0, 34); } },
  stalks: { draw: (g) => { s('path', o({ d: 'M-20 20 Q-26 -14 -34 -40 M20 20 Q26 -14 34 -40', fill: 'none', 'stroke-width': 6 }), g); eye(g, -34, -50, 17); eye(g, 34, -50, 17); } },
  smile: { draw: (g) => s('path', o({ d: 'M-40 -8 Q0 34 40 -8', fill: 'none', 'stroke-width': 6 }), g) },
  teeth: { draw: (g) => { s('path', o({ d: 'M-42 -14 Q0 50 42 -14 Z', fill: '#7d3f36' }), g); s('rect', o({ x: -14, y: -14, width: 13, height: 15, fill: '#fff', 'stroke-width': 3 }), g); s('rect', o({ x: 2, y: -14, width: 13, height: 15, fill: '#fff', 'stroke-width': 3 }), g); } },
  tongue: { draw: (g) => { s('path', o({ d: 'M-36 -10 Q0 16 36 -10', fill: 'none', 'stroke-width': 6 }), g); s('path', o({ d: 'M-10 2 Q-12 34 4 34 Q18 32 14 2', fill: '#d98f8f', 'stroke-width': 3 }), g); } },
  nose: { draw: (g) => s('circle', o({ cx: 0, cy: 0, r: 18, fill: '#d98f7a' }), g) },
  arm: { draw: (g, c) => { s('path', { d: 'M0 0 Q40 -30 74 -6', stroke: INK, 'stroke-width': 22, fill: 'none', 'stroke-linecap': 'round' }, g); s('path', { d: 'M0 0 Q40 -30 74 -6', stroke: c, 'stroke-width': 14, fill: 'none', 'stroke-linecap': 'round' }, g); s('circle', o({ cx: 80, cy: -4, r: 15, fill: c }), g); } },
  legs: { draw: (g, c) => { for (const x of [-30, 30]) { s('rect', o({ x: x - 11, y: -10, width: 22, height: 60, rx: 10, fill: c }), g); s('ellipse', o({ cx: x + 8, cy: 52, rx: 22, ry: 11, fill: '#6b5444' }), g); } } },
  wheel: { draw: (g) => { const w = s('g', { class: 'wheel' }, g); s('circle', o({ cx: 0, cy: 0, r: 36, fill: '#5a4a40' }), w); s('circle', o({ cx: 0, cy: 0, r: 16, fill: '#d9d2c4' }), w); s('line', { x1: -30, y1: 0, x2: 30, y2: 0, stroke: '#8a7a6a', 'stroke-width': 4 }, w); } },
  horns: { draw: (g) => { s('path', o({ d: 'M-50 10 Q-70 -30 -40 -56 Q-44 -20 -22 6Z', fill: '#efe3cc' }), g); s('path', o({ d: 'M50 10 Q70 -30 40 -56 Q44 -20 22 6Z', fill: '#efe3cc' }), g); } },
  antenna: { draw: (g) => { s('path', o({ d: 'M-16 20 Q-24 -20 -40 -44 M16 20 Q24 -20 40 -44', fill: 'none', 'stroke-width': 5 }), g); s('circle', o({ cx: -40, cy: -48, r: 11, fill: C.ochre }), g); s('circle', o({ cx: 40, cy: -48, r: 11, fill: C.terra }), g); } },
  tail: { draw: (g, c) => { s('path', { d: 'M0 0 Q40 10 50 -30 Q56 -54 80 -50', stroke: INK, 'stroke-width': 20, fill: 'none', 'stroke-linecap': 'round' }, g); s('path', { d: 'M0 0 Q40 10 50 -30 Q56 -54 80 -50', stroke: c, 'stroke-width': 12, fill: 'none', 'stroke-linecap': 'round' }, g); } },
  hat: { draw: (g) => { s('rect', o({ x: -30, y: -70, width: 60, height: 62, rx: 6, fill: '#5a4a40' }), g); s('rect', o({ x: -52, y: -12, width: 104, height: 16, rx: 8, fill: '#5a4a40' }), g); s('rect', { x: -30, y: -26, width: 60, height: 10, fill: C.terra }, g); } },
  spots: { draw: (g) => { [[-20, -10, 12], [18, 8, 9], [-6, 24, 7], [24, -22, 6]].forEach(([x, y, r]) => s('circle', { cx: x, cy: y, r, fill: '#fff', opacity: 0.5 }, g)); } },
};
const TRAY = ['blob', 'box', 'bean', 'tri', 'eyes2', 'eye1', 'stalks', 'smile', 'teeth', 'tongue', 'nose', 'arm', 'legs', 'wheel', 'horns', 'antenna', 'tail', 'hat'];
const TRAY_W = 250;

export default function silly(root, kit) {
  const { sfx } = kit;
  const svg = makeStage(root, '#f0e6d4');
  s('rect', { x: -800, y: 760, width: 3200, height: 600, fill: '#e2d3b6' }, svg);
  s('ellipse', { cx: 920, cy: 800, rx: 520, ry: 54, fill: '#d6a99a', opacity: 0.55 }, svg);
  for (let i = 0; i < 9; i++) s('circle', { cx: 330 + i * 150, cy: 120 + (i % 3) * 40, r: 6, fill: C.ochre, opacity: 0.25 }, svg);

  // Tray
  const tray = s('g', null, svg);
  s('rect', { x: -400, y: -400, width: TRAY_W + 400, height: 1800, fill: '#e3d2b4' }, tray);
  s('line', { x1: TRAY_W, y1: 0, x2: TRAY_W, y2: 900, stroke: INK, 'stroke-width': 3, opacity: 0.2 }, tray);
  const world = s('g', null, svg);
  let colorN = 0;
  TRAY.forEach((type, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = 72 + col * 110, y = 125 + row * 86;
    const g = s('g', { transform: `translate(${x} ${y}) scale(0.38)`, class: 'tap' }, tray);
    s('circle', { cx: 0, cy: 0, r: 120, fill: '#fff', opacity: 0.35 }, g);
    PARTS[type].draw(g, BODY_COLS[i % BODY_COLS.length]);
    g.addEventListener('pointerdown', (e) => {
      e.preventDefault(); e.stopPropagation();
      const p = pt(svg, e);
      const c = BODY_COLS[colorN++ % BODY_COLS.length];
      const cr = newCreature(p.x, p.y);
      addPart(cr, type, 0, 0, c, false);
      sfx.pop(1 + (i % 4) * 0.1);
      startDrag(cr, e, p, true);
    });
  });

  const creatures = [];
  function newCreature(x, y) {
    const g = s('g', null, world);
    const wrap = s('g', { class: 'fb' }, g);
    const cr = { g, wrap, x, y, parts: [] };
    creatures.push(cr);
    place(cr);
    return cr;
  }
  const place = (cr) => cr.g.setAttribute('transform', `translate(${cr.x.toFixed(1)} ${cr.y.toFixed(1)})`);
  function addPart(cr, type, x, y, color, flip) {
    const g = s('g', { class: 'tap' }, cr.wrap);
    const inner = s('g', null, g);
    PARTS[type].draw(inner, color);
    const part = { g, type, x, y, color, flip, body: !!PARTS[type].body };
    // Bodies go behind faces and limbs.
    if (part.body) cr.wrap.insertBefore(g, cr.wrap.firstChild);
    setPart(part);
    cr.parts.push(part);
    g.addEventListener('pointerdown', (e) => onPartDown(cr, part, e));
    return part;
  }
  const setPart = (p) => p.g.setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})${p.flip ? ' scale(-1 1)' : ''}`);

  function onPartDown(cr, part, e) {
    e.preventDefault(); e.stopPropagation();
    const p = pt(svg, e);
    const owner = creatures.find((c) => c.parts.includes(part));
    if (!owner) return;
    if (part.body || owner.parts.length === 1) { startDrag(owner, e, p, false); return; }
    // Pull an accessory off into its own creature.
    owner.parts.splice(owner.parts.indexOf(part), 1);
    const n = newCreature(owner.x + part.x, owner.y + part.y);
    part.g.remove();
    const moved = addPart(n, part.type, 0, 0, part.color, part.flip);
    startDrag(n, e, p, false, true, owner, moved);
  }

  function hitCreature(x, y, except) {
    for (let i = creatures.length - 1; i >= 0; i--) {
      const c = creatures[i];
      if (c === except) continue;
      const bb = c.wrap.getBBox();
      if (x > c.x + bb.x - 10 && x < c.x + bb.x + bb.width + 10 && y > c.y + bb.y - 10 && y < c.y + bb.y + bb.height + 10) return c;
    }
    return null;
  }

  function merge(src, dst) {
    const bodyX = dst.parts.filter((p) => p.body).reduce((a, p) => a + p.x, 0) / Math.max(1, dst.parts.filter((p) => p.body).length);
    for (const p of src.parts) {
      const nx = src.x + p.x - dst.x, ny = src.y + p.y - dst.y;
      const flip = (p.type === 'arm' || p.type === 'tail') ? nx < bodyX : p.flip;
      addPart(dst, p.type, nx, ny, p.color, flip);
    }
    removeCreature(src);
    replay(dst.wrap, 'wiggle');
    sfx.clack(1.3, 0.6);
    kit.after(120, () => sfx.boing(1.2 + Math.random() * 0.4));
  }
  function removeCreature(c) {
    c.g.remove();
    creatures.splice(creatures.indexOf(c), 1);
  }

  function startDrag(cr, e, p0, fresh, detached = false) {
    world.appendChild(cr.g);
    const id = e.pointerId;
    const off = { x: cr.x - p0.x, y: cr.y - p0.y };
    let moved = fresh || detached;
    const mv = (ev) => {
      if (ev.pointerId !== id) return;
      const p = pt(svg, ev);
      if (!moved && Math.hypot(p.x - p0.x, p.y - p0.y) > 10) moved = true;
      if (!moved) return;
      cr.x = p.x + off.x; cr.y = p.y + off.y;
      place(cr);
    };
    const up = (ev) => {
      if (ev.pointerId !== id) return;
      window.removeEventListener('pointermove', mv);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      if (!moved) {
        replay(cr.wrap, 'wiggle');
        cr.wrap.querySelectorAll('.pupil').forEach((pp) => { pp.style.transition = 'transform .12s'; pp.style.transform = 'scaleY(.1)'; pp.style.transformBox = 'fill-box'; pp.style.transformOrigin = 'center'; kit.after(160, () => (pp.style.transform = '')); });
        sfx.boing(0.8 + Math.random() * 0.6);
        return;
      }
      const p = pt(svg, ev);
      if (p.x < TRAY_W) { removeCreature(cr); sfx.pop(0.6); return; }
      const target = hitCreature(p.x, p.y, cr);
      if (target) merge(cr, target);
      else sfx.clack(1, 0.3);
    };
    window.addEventListener('pointermove', mv);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
  }

  // A friendly first creature.
  const first = newCreature(900, 470);
  addPart(first, 'blob', 0, 0, C.sage, false);
  addPart(first, 'eyes2', 0, -26, null, false);
  addPart(first, 'smile', 0, 34, null, false);
  addPart(first, 'legs', 0, 96, C.sage, false);
  addPart(first, 'arm', 76, 10, C.sage, false);
  addPart(first, 'arm', -76, 10, C.sage, true);
  addPart(first, 'antenna', 0, -100, null, false);

  // Pupils gently follow the finger.
  kit.on(svg, 'pointermove', (e) => {
    const p = pt(svg, e);
    for (const c of creatures) {
      for (const part of c.parts) {
        part.g.querySelectorAll('.pupil').forEach((pp) => {
          const cx = +pp.dataset.cx, cy = +pp.dataset.cy, r = +pp.dataset.r;
          const wx = c.x + part.x + (part.flip ? -cx : cx), wy = c.y + part.y + cy;
          const a = Math.atan2(p.y - wy, (p.x - wx) * (part.flip ? -1 : 1));
          pp.setAttribute('cx', (cx + Math.cos(a) * r).toFixed(1));
          pp.setAttribute('cy', (cy + Math.sin(a) * r).toFixed(1));
        });
      }
    }
  });

  // Creatures breathe a little; wheels turn when they are dragged.
  kit.loop((dt, t) => {
    creatures.forEach((c, i) => {
      if (c.wrap.classList.contains('wiggle') && c.wrap.getAnimations().length) return;
      c.wrap.style.transform = `scale(${1 + Math.sin(t * 2 + i) * 0.012}, ${1 - Math.sin(t * 2 + i) * 0.012})`;
    });
  });
}

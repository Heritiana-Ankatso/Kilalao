// A small, dependency-free 2D rig for SVG characters.
//
// A character is data: a list of parts, each with a parent, an explicit pivot
// in the character's own coordinates and a draw() function. Every part is
// animated through three additive layers, so motions combine naturally:
//   base   – the rest pose (set once)
//   idle   – continuous life: breathing, blinking, gaze (set every frame)
//   act    – acting beats from tweens: nod, point, hop... (rig.to / rig.seq)
// Rotation and translation add up; scale and opacity multiply.
import { s } from '../lib.js';

export const EASE = {
  linear: (t) => t,
  sine: (t) => -(Math.cos(Math.PI * t) - 1) / 2, // calm default (in-out)
  out: (t) => 1 - Math.pow(1 - t, 3), // entrances, landings
  in: (t) => t * t * t, // departures, wind-ups
  back: (t) => { const c1 = 1.15, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); }, // gentle overshoot
};

const ZERO = () => ({ r: 0, tx: 0, ty: 0, sx: 1, sy: 1, o: 1 });
const ADD = ['r', 'tx', 'ty'];
const MUL = ['sx', 'sy', 'o'];

export function makeRig(parent, def, x, y, scale = 1) {
  const root = s('g', { transform: `translate(${x} ${y}) scale(${scale})` }, parent);
  const parts = {};
  for (const p of def.parts) {
    const host = p.parent ? parts[p.parent] : null;
    const g = s('g', null);
    const content = s('g', null, g);
    const art = s('g', null, content);
    if (!host) root.appendChild(g);
    else if (p.behind) host.content.insertBefore(g, host.art);
    else host.content.appendChild(g);
    if (p.draw) p.draw(art);
    // `act` may start away from neutral (e.g. hidden happy eyes start at o: 0 and are tweened in).
    parts[p.id] = { id: p.id, g, content, art, pivot: p.pivot || [0, 0], base: { ...ZERO(), ...(p.base || {}) }, idle: ZERO(), act: { ...ZERO(), ...(p.act || {}) }, last: '' };
  }

  const tweens = [];
  const rig = {
    root, parts, def, x, y, scale,
    state: {}, // free space for a character's idle logic (blink timers, gaze...)
    calm: false,
    // Tween the acting layer of one part. Returns a promise.
    to(id, props, ms = 500, ease = 'sine') {
      const part = parts[id];
      if (!part) return Promise.resolve();
      const from = {};
      for (const k in props) from[k] = part.act[k];
      return new Promise((resolve) => tweens.push({ part, from, to: props, ms: Math.max(1, ms), t: 0, ease: EASE[ease] || EASE.sine, resolve }));
    },
    // Several tweens at once: [[id, props], ...]
    all(list, ms, ease) { return Promise.all(list.map(([id, p]) => rig.to(id, p, ms, ease))); },
    // Beats in order: [[[id, props], ...], ms, ease] ...
    async seq(beats) { for (const [list, ms, ease] of beats) await rig.all(list, ms, ease); },
    tick(dt, t) {
      for (const id in parts) parts[id].idle = ZERO();
      if (def.idle) def.idle(rig, dt, t);
      for (let i = tweens.length - 1; i >= 0; i--) {
        const tw = tweens[i];
        tw.t += dt * 1000;
        const k = Math.min(1, tw.t / tw.ms), e = tw.ease(k);
        for (const key in tw.to) tw.part.act[key] = tw.from[key] + (tw.to[key] - tw.from[key]) * e;
        if (k >= 1) { tweens.splice(i, 1); tw.resolve(); }
      }
      render();
    },
    // Where is a part's pivot on the stage (approximately, ignoring rotations)?
    world(id) {
      const p = parts[id];
      return { x: x + p.pivot[0] * scale, y: y + p.pivot[1] * scale };
    },
  };

  function render() {
    for (const id in parts) {
      const p = parts[id];
      const v = {};
      for (const k of ADD) v[k] = p.base[k] + p.idle[k] + p.act[k];
      for (const k of MUL) v[k] = p.base[k] * p.idle[k] * p.act[k];
      const [px, py] = p.pivot;
      const tr = `translate(${(v.tx).toFixed(2)} ${(v.ty).toFixed(2)}) translate(${px} ${py}) rotate(${v.r.toFixed(2)}) scale(${v.sx.toFixed(4)} ${v.sy.toFixed(4)}) translate(${-px} ${-py})`;
      const key = tr + v.o.toFixed(3);
      if (key !== p.last) {
        p.g.setAttribute('transform', tr);
        p.g.setAttribute('opacity', Math.max(0, Math.min(1, v.o)).toFixed(3));
        p.last = key;
      }
    }
  }
  render();
  return rig;
}

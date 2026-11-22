// World Puzzle: drag land tiles from the side into the frame. Each tile snaps
// in and comes alive with its animal. Tap animals; move tiles around; drop a
// tile back on the side to take it away.
import { s, C, makeStage, pt, rand, replay } from '../lib.js';

const TW = 250, TH = 200, COLS = 4, ROWS = 3, BX = 90, BY = 110;
const INK = C.ink;
const o = (x) => ({ stroke: INK, 'stroke-width': 3, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', ...x });

function animal(g, cls) { const a = s('g', { class: 'tap critter' }, g); const inner = s('g', { class: cls }, a); return inner; }

const TILES = {
  meadow(g, sfx) {
    s('rect', { width: TW, height: TH, fill: '#b9cf96' }, g);
    for (let i = 0; i < 14; i++) s('circle', { cx: rand(10, 240), cy: rand(10, 190), r: 5, fill: ['#f3e3a3', '#f0c4c0', '#fbf7ef'][i % 3] }, g);
    s('path', { d: 'M0 150 Q60 130 125 150 T250 145 V200 H0Z', fill: '#a6c084' }, g);
    const a = animal(g, 'fbb hopLoop');
    s('ellipse', o({ cx: 120, cy: 140, rx: 30, ry: 22, fill: '#f6f1e8' }), a);
    s('ellipse', o({ cx: 104, cy: 100, rx: 8, ry: 24, fill: '#f6f1e8' }), a);
    s('ellipse', o({ cx: 120, cy: 100, rx: 8, ry: 24, fill: '#f6f1e8' }), a);
    s('circle', o({ cx: 110, cy: 124, r: 17, fill: '#f6f1e8' }), a);
    s('circle', { cx: 105, cy: 122, r: 3, fill: INK }, a);
    s('circle', o({ cx: 150, cy: 142, r: 7, fill: '#fff' }), a);
    return () => sfx.squeak(1.2);
  },
  forest(g, sfx) {
    s('rect', { width: TW, height: TH, fill: '#88a67f' }, g);
    [[30, 120], [80, 80], [200, 100], [230, 160], [20, 190]].forEach(([x, y]) => { s('rect', { x: x - 5, y, width: 10, height: 26, fill: C.cocoa }, g); s('path', o({ d: `M${x - 30} ${y + 4} L${x} ${y - 60} L${x + 30} ${y + 4}Z`, fill: '#4f7a55' }), g); });
    const a = animal(g, 'fbb nod');
    s('ellipse', o({ cx: 140, cy: 150, rx: 40, ry: 22, fill: '#b07a4f' }), a);
    s('path', o({ d: 'M110 160 v26 M120 162 v24 M160 162 v24 M170 160 v26', fill: 'none', 'stroke-width': 5 }), a);
    s('path', o({ d: 'M108 140 l-14 -36 l20 4z', fill: '#b07a4f' }), a);
    s('circle', o({ cx: 98, cy: 100, r: 14, fill: '#b07a4f' }), a);
    s('path', o({ d: 'M92 88 l-8 -18 m4 8 l-10 -2 M104 88 l8 -18 m-4 8 l10 -2', fill: 'none' }), a);
    s('circle', { cx: 94, cy: 98, r: 3, fill: INK }, a);
    for (let k = 0; k < 4; k++) s('circle', { cx: 130 + k * 12, cy: 142 + (k % 2) * 6, r: 3.5, fill: '#fbf7ef' }, a);
    return () => sfx.chirp();
  },
  lake(g, sfx) {
    s('rect', { width: TW, height: TH, fill: '#b9cf96' }, g);
    s('ellipse', o({ cx: 125, cy: 105, rx: 105, ry: 70, fill: '#8db8c8' }), g);
    s('path', { d: 'M60 90 q20 -8 40 0 M140 130 q20 -8 40 0', stroke: '#fbf7ef', 'stroke-width': 3, fill: 'none', opacity: 0.7 }, g);
    for (const x of [20, 30, 226]) s('path', { d: `M${x} 190 q4 -40 -2 -60`, stroke: '#6f8f6a', 'stroke-width': 4, fill: 'none' }, g);
    const a = animal(g, 'fb rock');
    s('path', o({ d: 'M100 110 q0 24 30 24 q36 0 36 -20 l-14 -6 q-20 6 -36 -4z', fill: '#fbf7ef' }), a);
    s('circle', o({ cx: 104, cy: 96, r: 14, fill: '#4f7a55' }), a);
    s('path', o({ d: 'M88 98 l-14 4 l14 4z', fill: C.ochre }), a);
    s('circle', { cx: 100, cy: 93, r: 3, fill: INK }, a);
    return () => sfx.quack();
  },
  mountain(g, sfx) {
    s('rect', { width: TW, height: TH, fill: '#cfd6c8' }, g);
    s('path', o({ d: 'M-10 200 L80 40 L170 200Z', fill: '#9fa49a' }), g);
    s('path', o({ d: 'M90 200 L180 60 L270 200Z', fill: '#b4b8ad' }), g);
    s('path', o({ d: 'M58 80 L80 40 L102 80 L90 72 L80 84 L70 72Z', fill: '#fbf7ef' }), g);
    s('path', o({ d: 'M160 92 L180 60 L200 92 L188 86 L180 96 L172 86Z', fill: '#fbf7ef' }), g);
    const a = animal(g, 'fbb nod');
    s('ellipse', o({ cx: 150, cy: 160, rx: 30, ry: 18, fill: '#efe7da' }), a);
    s('path', o({ d: 'M130 172 v18 M140 174 v16 M162 174 v16 M170 172 v18', fill: 'none', 'stroke-width': 4 }), a);
    s('circle', o({ cx: 122, cy: 142, r: 13, fill: '#efe7da' }), a);
    s('path', o({ d: 'M118 132 q-6 -14 4 -18 M126 132 q8 -12 2 -18', fill: 'none' }), a);
    s('circle', { cx: 118, cy: 141, r: 3, fill: INK }, a);
    return () => sfx.bleat();
  },
  desert(g, sfx) {
    s('rect', { width: TW, height: TH, fill: '#ecd6a4' }, g);
    s('circle', { cx: 210, cy: 40, r: 22, fill: '#f3c96c' }, g);
    s('path', { d: 'M0 140 Q70 100 140 140 T250 130 V200 H0Z', fill: '#dfc08a' }, g);
    s('path', o({ d: 'M40 180 v-60 q0 -10 10 -10 q10 0 10 10 v60 M40 150 h-12 v-20 M60 140 h12 v-22', fill: '#86a36f', 'stroke-width': 3 }), g);
    const a = animal(g, 'fbb stroll');
    s('path', o({ d: 'M110 150 q10 -40 30 -20 q14 -30 34 0 q10 6 6 20z', fill: '#c99a62' }), a);
    s('path', o({ d: 'M112 150 q-14 -10 -12 -40 q-2 -10 -14 -10 l-4 8 l10 2', fill: '#c99a62' }), a);
    s('path', o({ d: 'M120 150 v30 M134 150 v30 M164 150 v30 M176 148 v32', fill: 'none', 'stroke-width': 5 }), a);
    s('circle', { cx: 94, cy: 104, r: 2.5, fill: INK }, a);
    return () => sfx.roar(1.8);
  },
  snow(g, sfx) {
    s('rect', { width: TW, height: TH, fill: '#eef1f2' }, g);
    s('path', o({ d: 'M20 170 q60 -20 120 0 q50 14 90 -4 l0 34 h-210z', fill: '#cfe1e8' }), g);
    for (let i = 0; i < 12; i++) s('circle', { cx: rand(5, 245), cy: rand(5, 120), r: 3, fill: '#fff' }, g);
    const a = animal(g, 'fbb rock');
    s('ellipse', o({ cx: 130, cy: 130, rx: 26, ry: 38, fill: '#3d4a5c' }), a);
    s('ellipse', { cx: 130, cy: 138, rx: 17, ry: 28, fill: '#fbf7ef' }, a);
    s('circle', { cx: 122, cy: 110, r: 3.5, fill: '#fff' }, a); s('circle', { cx: 138, cy: 110, r: 3.5, fill: '#fff' }, a);
    s('path', o({ d: 'M124 118 l6 8 l6 -8z', fill: C.ochre, 'stroke-width': 2 }), a);
    s('path', o({ d: 'M118 168 h-10 M142 168 h10', stroke: C.ochre, 'stroke-width': 6 }), a);
    return () => sfx.squeak(0.8);
  },
  sea(g, sfx) {
    s('rect', { width: TW, height: TH, fill: '#8db8c8' }, g);
    for (let r = 0; r < 4; r++) s('path', { d: `M0 ${40 + r * 45} q31 -12 62 0 t62 0 t62 0 t62 0`, stroke: '#cfe3e8', 'stroke-width': 3, fill: 'none' }, g);
    const a = animal(g, 'fb jumpArc');
    s('path', o({ d: 'M70 140 q20 -20 46 0 q-20 20 -46 0z', fill: C.terra }), a);
    s('path', o({ d: 'M116 140 l16 -12 v24z', fill: C.terra }), a);
    s('circle', { cx: 82, cy: 136, r: 3, fill: INK }, a);
    s('path', o({ d: 'M180 60 q6 -20 20 -8 q10 -10 14 6', fill: 'none', stroke: '#fbf7ef' }), g);
    return () => sfx.splash(0.7);
  },
  farm(g, sfx) {
    s('rect', { width: TW, height: TH, fill: '#c9d69a' }, g);
    for (let i = 0; i < 6; i++) s('rect', { x: 0, y: 120 + i * 14, width: 250, height: 6, fill: '#b6c385' }, g);
    s('rect', o({ x: 150, y: 40, width: 80, height: 70, fill: C.terra }), g);
    s('path', o({ d: 'M144 42 L190 10 L236 42Z', fill: '#8f4f3e' }), g);
    s('rect', o({ x: 176, y: 70, width: 28, height: 40, fill: '#fbf7ef' }), g);
    const a = animal(g, 'fbb nod');
    s('ellipse', o({ cx: 80, cy: 150, rx: 42, ry: 24, fill: '#fbf7ef' }), a);
    s('circle', { cx: 70, cy: 144, r: 9, fill: INK }, a); s('circle', { cx: 96, cy: 156, r: 7, fill: INK }, a);
    s('path', o({ d: 'M50 166 v22 M62 168 v20 M98 168 v20 M110 166 v22', fill: 'none', 'stroke-width': 5 }), a);
    s('ellipse', o({ cx: 36, cy: 136, rx: 16, ry: 14, fill: '#fbf7ef' }), a);
    s('ellipse', o({ cx: 30, cy: 144, rx: 10, ry: 7, fill: '#e3b6a6' }), a);
    s('circle', { cx: 38, cy: 130, r: 2.5, fill: INK }, a);
    return () => sfx.moo();
  },
};
const KINDS = Object.keys(TILES);

export default function puzzle(root, kit) {
  const { sfx } = kit;
  const svg = makeStage(root, '#a9bd8a');
  s('clipPath', { id: 'tileclip' }, svg.defs).appendChild(s('rect', { width: TW, height: TH, rx: 16 }));

  // Table and frame
  s('rect', { x: BX - 30, y: BY - 30, width: COLS * TW + 60, height: ROWS * TH + 60, rx: 30, fill: '#c9a073', stroke: C.woodD, 'stroke-width': 6, filter: 'url(#wob)' }, svg);
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    s('rect', { x: BX + c * TW + 6, y: BY + r * TH + 6, width: TW - 12, height: TH - 12, rx: 14, fill: '#b48a5f', opacity: 0.55 }, svg);
  }
  const placedLayer = s('g', null, svg);
  // Side shelf
  const SX = 1180;
  s('rect', { x: SX - 20, y: 60, width: 420, height: 780, rx: 30, fill: '#e3d2b4', stroke: C.woodD, 'stroke-width': 4 }, svg);
  const dragLayer = s('g', null, svg);
  const thumbPos = KINDS.map((k, i) => ({ x: SX + 10 + (i % 2) * 195, y: 90 + Math.floor(i / 2) * 182 }));
  KINDS.forEach((kind, i) => {
    const g = s('g', { transform: `translate(${thumbPos[i].x} ${thumbPos[i].y}) scale(0.72)`, class: 'tap' }, svg);
    const clip = s('g', { 'clip-path': 'url(#tileclip)' }, g);
    TILES[kind](clip, sfx);
    s('rect', { width: TW, height: TH, rx: 16, fill: 'none', stroke: C.ink, 'stroke-width': 4 }, g);
    g.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      const p = pt(svg, e);
      const t = makeTile(kind, p.x - TW / 2, p.y - TH / 2);
      sfx.clack(1.4, 0.4);
      startDrag(t, e, p);
    });
  });

  const slots = Array(COLS * ROWS).fill(null);
  function makeTile(kind, x, y) {
    const g = s('g', null, dragLayer);
    const inner = s('g', { class: 'fb' }, g);
    const clip = s('g', { 'clip-path': 'url(#tileclip)' }, inner);
    const voice = TILES[kind](clip, sfx);
    s('rect', { width: TW, height: TH, rx: 16, fill: 'none', stroke: C.ink, 'stroke-width': 4 }, inner);
    const t = { kind, g, inner, x, y, slot: -1, voice };
    pos(t);
    g.addEventListener('pointerdown', (e) => {
      e.preventDefault(); e.stopPropagation();
      const p = pt(svg, e);
      if (e.target.closest('.critter')) {
        const crit = e.target.closest('.critter');
        replay(crit, 'hop'); crit.classList.add('fbb');
        voice();
      }
      startDrag(t, e, p);
    });
    return t;
  }
  const pos = (t) => t.g.setAttribute('transform', `translate(${t.x.toFixed(1)} ${t.y.toFixed(1)})`);
  const slotXY = (i) => ({ x: BX + (i % COLS) * TW, y: BY + Math.floor(i / COLS) * TH });

  function startDrag(t, e, p0) {
    const id = e.pointerId, off = { x: t.x - p0.x, y: t.y - p0.y };
    dragLayer.appendChild(t.g);
    let moved = t.slot < 0;
    t.inner.style.transform = 'scale(1.04)'; t.inner.style.transition = 'transform .15s';
    const mv = (ev) => {
      if (ev.pointerId !== id) return;
      const p = pt(svg, ev);
      if (!moved && Math.hypot(p.x - p0.x, p.y - p0.y) > 10) moved = true;
      if (moved) { t.x = p.x + off.x; t.y = p.y + off.y; pos(t); }
    };
    const up = (ev) => {
      if (ev.pointerId !== id) return;
      window.removeEventListener('pointermove', mv);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      t.inner.style.transform = '';
      if (!moved) { if (t.slot >= 0) placedLayer.appendChild(t.g); return; }
      const cx = t.x + TW / 2, cy = t.y + TH / 2;
      let best = -1, bd = 170;
      for (let i = 0; i < slots.length; i++) {
        const q = slotXY(i), d = Math.hypot(q.x + TW / 2 - cx, q.y + TH / 2 - cy);
        if (d < bd) { bd = d; best = i; }
      }
      if (best < 0) {
        if (t.slot >= 0) slots[t.slot] = null;
        t.g.style.transition = 'opacity .3s'; t.g.style.opacity = 0;
        kit.after(300, () => t.g.remove());
        sfx.pop(0.6);
        return;
      }
      const prev = slots[best];
      if (prev && prev !== t) {
        if (t.slot >= 0) { slots[t.slot] = prev; prev.slot = t.slot; const q = slotXY(prev.slot); prev.x = q.x; prev.y = q.y; pos(prev); }
        else { prev.g.remove(); }
      }
      if (t.slot >= 0 && slots[t.slot] === t) slots[t.slot] = null;
      slots[best] = t; t.slot = best;
      const q = slotXY(best); t.x = q.x; t.y = q.y; pos(t);
      placedLayer.appendChild(t.g);
      replay(t.inner, 'popin');
      sfx.clack(1, 0.8);
      kit.after(380, () => t.voice());
      if (slots.every(Boolean)) birds();
    };
    window.addEventListener('pointermove', mv);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
  }

  // When the whole world is laid out, a few birds glide across.
  function birds() {
    const g = s('g', { 'pointer-events': 'none' }, svg);
    for (let i = 0; i < 4; i++) s('path', { d: `M${i * 50} ${i % 2 * 30} q12 -12 24 0 q12 -12 24 0`, stroke: C.ink, 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round' }, g);
    let x = -200;
    const stop = kit.loop((dt, t) => {
      x += 160 * dt;
      g.setAttribute('transform', `translate(${x} ${200 + Math.sin(t) * 30})`);
      if (x > 1700) { stop(); g.remove(); }
    });
    kit.after(400, () => sfx.chirp());
  }

  // Start with two tiles in place so the frame is inviting.
  [['meadow', 5], ['lake', 6]].forEach(([k, i]) => {
    const q = slotXY(i);
    const t = makeTile(k, q.x, q.y);
    slots[i] = t; t.slot = i;
    placedLayer.appendChild(t.g);
  });
}

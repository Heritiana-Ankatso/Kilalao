// Code Factory: little workers walk across the floor. Put arrow tiles down to
// steer them; tap an arrow to turn it. Machines along the way give boxes,
// paint them, wrap them, ring bells and collect parcels. Tap the door for
// another worker. Loops make little songs.
import { s, C, makeStage, pt, replay } from '../lib.js';

const COLS = 12, ROWS = 7, CS = 100, GX = 80, GY = 110;
const DX = [1, 0, -1, 0], DY = [0, 1, 0, -1];
const INK = C.ink;
const BOXC = ['#d9b483', C.terra, C.teal, C.ochre, C.plum, C.sage];

export default function code(root, kit) {
  const { sfx } = kit;
  const svg = makeStage(root, '#cdbfa6');
  s('rect', { x: -800, y: -400, width: 3200, height: 1700, fill: '#d6c9b1' }, svg);
  for (let x = -800; x < 2400; x += 140) s('rect', { x, y: -400, width: 6, height: 500, fill: '#c7b89c' }, svg);
  s('path', { d: 'M0 60 H1600', stroke: '#9aa0a8', 'stroke-width': 14 }, svg);
  s('path', { d: 'M0 60 H1600', stroke: '#c8ccd1', 'stroke-width': 6 }, svg);

  // Floor grid
  const floor = s('g', null, svg);
  s('rect', { x: GX - 14, y: GY - 14, width: COLS * CS + 28, height: ROWS * CS + 28, rx: 22, fill: '#8f8578', stroke: INK, 'stroke-width': 4 }, floor);
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    s('rect', { x: GX + c * CS + 3, y: GY + r * CS + 3, width: CS - 6, height: CS - 6, rx: 10, fill: (r + c) % 2 ? '#efe6d4' : '#e8ddc7' }, floor);
  }
  // Entrance door on the left of row 3
  const door = s('g', { class: 'tap' }, svg);
  s('rect', { x: GX - 70, y: GY + 3 * CS - 10, width: 62, height: CS + 20, rx: 14, fill: C.terra, stroke: INK, 'stroke-width': 4 }, door);
  s('circle', { cx: GX - 22, cy: GY + 3 * CS + 54, r: 6, fill: C.ochre, stroke: INK, 'stroke-width': 2 }, door);
  const doorIn = s('g', { class: 'fb' }, door);
  s('path', { d: `M${GX - 54} ${GY + 3 * CS + 30} h30 l-10 -10 m10 10 l-10 10`, stroke: '#fbf7ef', 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round' }, doorIn);

  const arrowsLayer = s('g', null, svg);
  const machineLayer = s('g', null, svg);
  const workerLayer = s('g', null, svg);
  const dragLayer = s('g', null, svg);
  const cellXY = (c, r) => ({ x: GX + c * CS + CS / 2, y: GY + r * CS + CS / 2 });
  const key = (c, r) => c + ',' + r;

  // ---------- Arrows ----------
  const arrows = new Map();
  function arrowShape(g) {
    s('rect', { x: -42, y: -42, width: 84, height: 84, rx: 14, fill: C.ochre, stroke: INK, 'stroke-width': 4 }, g);
    s('path', { d: 'M-26 -10 h22 v-16 l30 26 l-30 26 v-16 h-22z', fill: '#fbf7ef', stroke: INK, 'stroke-width': 3, 'stroke-linejoin': 'round' }, g);
  }
  function makeArrow(c, r, dir) {
    const g = s('g', { class: 'tap' }, arrowsLayer);
    const rot = s('g', null, g);
    arrowShape(rot);
    const a = { c, r, dir, g, rot };
    setArrow(a);
    arrows.set(key(c, r), a);
    g.addEventListener('pointerdown', (e) => {
      e.preventDefault(); e.stopPropagation();
      const p0 = pt(svg, e);
      dragThing(e, p0, g, (moved, p) => {
        if (!moved) { a.dir = (a.dir + 1) % 4; setArrow(a); sfx.clack(1.3, 0.6); return; }
        arrows.delete(key(a.c, a.r));
        const cell = cellAt(p);
        if (cell && !machines.has(key(cell.c, cell.r))) {
          arrows.get(key(cell.c, cell.r))?.g.remove();
          a.c = cell.c; a.r = cell.r; arrows.set(key(a.c, a.r), a); setArrow(a); arrowsLayer.appendChild(g); sfx.clack(1, 0.6);
        } else { g.remove(); sfx.pop(0.6); }
      });
    });
    return a;
  }
  function setArrow(a) {
    const q = cellXY(a.c, a.r);
    a.g.setAttribute('transform', `translate(${q.x} ${q.y})`);
    a.rot.style.transition = 'transform .18s';
    a.rot.style.transform = `rotate(${a.dir * 90}deg)`;
  }
  function cellAt(p) {
    const c = Math.floor((p.x - GX) / CS), r = Math.floor((p.y - GY) / CS);
    return c >= 0 && r >= 0 && c < COLS && r < ROWS ? { c, r } : null;
  }

  // Generic drag for arrows and machines
  function dragThing(e, p0, g, done) {
    const id = e.pointerId;
    let moved = false;
    const base = g.getAttribute('transform');
    dragLayer.appendChild(g);
    const mv = (ev) => {
      if (ev.pointerId !== id) return;
      const p = pt(svg, ev);
      if (!moved && Math.hypot(p.x - p0.x, p.y - p0.y) > 10) moved = true;
      if (moved) g.setAttribute('transform', `translate(${p.x} ${p.y})`);
    };
    const up = (ev) => {
      if (ev.pointerId !== id) return;
      window.removeEventListener('pointermove', mv);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      if (!moved) g.setAttribute('transform', base);
      done(moved, pt(svg, ev));
    };
    window.addEventListener('pointermove', mv);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
  }

  // Arrow supply on the right
  const supply = s('g', null, svg);
  s('rect', { x: 1340, y: 110, width: 230, height: 700, rx: 26, fill: '#bfb29a', stroke: INK, 'stroke-width': 4 }, supply);
  [0, 1, 2, 3].forEach((dir, i) => {
    const x = 1400 + (i % 2) * 110, y = 200 + Math.floor(i / 2) * 120;
    const g = s('g', { transform: `translate(${x} ${y})`, class: 'tap' }, supply);
    const rot = s('g', { transform: `rotate(${dir * 90})` }, g);
    arrowShape(rot);
    g.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      const p0 = pt(svg, e);
      const ghost = s('g', { transform: `translate(${p0.x} ${p0.y})` }, dragLayer);
      arrowShape(s('g', { transform: `rotate(${dir * 90})` }, ghost));
      sfx.clack(1.5, 0.4);
      dragThing(e, p0, ghost, (moved, p) => {
        ghost.remove();
        const cell = cellAt(p);
        if (cell && !machines.has(key(cell.c, cell.r))) {
          arrows.get(key(cell.c, cell.r))?.g.remove();
          makeArrow(cell.c, cell.r, dir);
          sfx.clack(1, 0.7);
        }
      });
    });
  });

  // ---------- Machines ----------
  const machines = new Map();
  const NOTE = { bell1: 523, bell2: 659, bell3: 784 };
  const MDRAW = {
    box(g) { s('rect', { x: -40, y: -40, width: 80, height: 80, rx: 12, fill: C.blue, stroke: INK, 'stroke-width': 4 }, g); s('rect', { x: -20, y: -26, width: 40, height: 30, rx: 4, fill: BOXC[0], stroke: INK, 'stroke-width': 3 }, g); s('path', { d: 'M-24 22 h48', stroke: INK, 'stroke-width': 4 }, g); },
    paint(g) { s('rect', { x: -40, y: -40, width: 80, height: 80, rx: 12, fill: '#efe3cc', stroke: INK, 'stroke-width': 4 }, g); [C.terra, C.teal, C.ochre, C.plum].forEach((c, i) => s('circle', { cx: -16 + (i % 2) * 32, cy: -14 + Math.floor(i / 2) * 30, r: 12, fill: c, stroke: INK, 'stroke-width': 2.5 }, g)); },
    wrap(g) { s('rect', { x: -40, y: -40, width: 80, height: 80, rx: 12, fill: C.rose, stroke: INK, 'stroke-width': 4 }, g); s('path', { d: 'M0 -30 v60 M-30 0 h60', stroke: '#fbf7ef', 'stroke-width': 8 }, g); s('path', { d: 'M0 -4 q-20 -22 -24 -2 q4 10 24 2 q20 -22 24 -2 q-4 10 -24 2', fill: C.terra, stroke: INK, 'stroke-width': 2.5 }, g); },
    cart(g) { s('rect', { x: -44, y: -34, width: 88, height: 56, rx: 8, fill: '#8f6a48', stroke: INK, 'stroke-width': 4 }, g); s('circle', { cx: -24, cy: 30, r: 11, fill: '#5a4a40', stroke: INK, 'stroke-width': 3 }, g); s('circle', { cx: 24, cy: 30, r: 11, fill: '#5a4a40', stroke: INK, 'stroke-width': 3 }, g); },
    bell(g, n) { s('rect', { x: -40, y: -40, width: 80, height: 80, rx: 40, fill: ['#e7d7b2', '#e5cfa6', '#e2c799'][n], stroke: INK, 'stroke-width': 4 }, g); s('path', { d: 'M-22 18 q0 -38 22 -40 q22 2 22 40 l6 6 h-56z', fill: C.ochre, stroke: INK, 'stroke-width': 3, 'stroke-linejoin': 'round' }, g); s('circle', { cx: 0, cy: 26, r: 5, fill: INK }, g); for (let i = 0; i <= n; i++) s('circle', { cx: -10 + i * 10, cy: -30, r: 3, fill: INK }, g); },
  };
  function makeMachine(type, c, r) {
    const g = s('g', { class: 'tap' }, machineLayer);
    const inner = s('g', { class: 'fb' }, g);
    if (type.startsWith('bell')) MDRAW.bell(inner, Number(type.slice(4)) - 1);
    else MDRAW[type](inner);
    const pile = type === 'cart' ? s('g', null, inner) : null;
    const m = { type, c, r, g, inner, pile, count: 0 };
    const q = cellXY(c, r);
    g.setAttribute('transform', `translate(${q.x} ${q.y})`);
    machines.set(key(c, r), m);
    g.addEventListener('pointerdown', (e) => {
      e.preventDefault(); e.stopPropagation();
      dragThing(e, pt(svg, e), g, (moved, p) => {
        if (!moved) { trigger(m, null); return; }
        const cell = cellAt(p);
        const k = cell && key(cell.c, cell.r);
        if (cell && !machines.has(k)) {
          machines.delete(key(m.c, m.r));
          arrows.get(k)?.g.remove(); arrows.delete(k);
          m.c = cell.c; m.r = cell.r; machines.set(k, m);
          sfx.clack(0.8, 0.7);
        }
        const q2 = cellXY(m.c, m.r);
        g.setAttribute('transform', `translate(${q2.x} ${q2.y})`);
        machineLayer.appendChild(g);
      });
    });
    return m;
  }
  function trigger(m, w) {
    replay(m.inner, 'wiggle');
    if (m.type.startsWith('bell')) { sfx.bell(NOTE[m.type], 0.9); return; }
    if (m.type === 'box') { if (w && !w.box) { w.box = { c: 0, wrapped: false }; drawBox(w); } sfx.clack(1.2, 0.6); return; }
    if (m.type === 'paint') { if (w && w.box) { w.box.c = (w.box.c % (BOXC.length - 1)) + 1; drawBox(w); } sfx.splash(0.4); sfx.bubble(); return; }
    if (m.type === 'wrap') { if (w && w.box) { w.box.wrapped = true; drawBox(w); } sfx.paper(); return; }
    if (m.type === 'cart') {
      if (w && w.box) {
        const b = w.box; w.box = null; drawBox(w);
        const i = m.count++;
        const pb = s('g', { transform: `translate(${-24 + (i % 3) * 24} ${-40 - Math.floor(i / 3) * 20})` }, m.pile);
        parcel(pb, b, 0.5);
        sfx.thud(1.5, 0.5);
        if (m.count >= 6) kit.after(700, () => { m.pile.innerHTML = ''; m.count = 0; sfx.whoosh(0.6); replay(m.inner, 'popin'); });
      } else sfx.clack(0.7, 0.5);
    }
  }
  function parcel(g, b, sc = 1) {
    const k = s('g', { transform: `scale(${sc})` }, g);
    s('rect', { x: -20, y: -18, width: 40, height: 34, rx: 4, fill: BOXC[b.c], stroke: INK, 'stroke-width': 3 }, k);
    if (b.wrapped) { s('path', { d: 'M0 -18 v34 M-20 0 h40', stroke: '#fbf7ef', 'stroke-width': 5 }, k); s('circle', { cx: 0, cy: -20, r: 6, fill: C.terra, stroke: INK, 'stroke-width': 2 }, k); }
    else s('path', { d: 'M-20 -8 h40', stroke: INK, 'stroke-width': 2, opacity: 0.4 }, k);
  }

  // ---------- Workers ----------
  const workers = [];
  const WCOL = [C.teal, C.terra, C.plum, C.sage, C.blue, '#b7834f'];
  let wn = 0;
  function spawn() {
    if (workers.length >= 8) { replay(doorIn, 'wiggle'); sfx.clack(0.6, 0.4); return; }
    const g = s('g', null, workerLayer);
    const flip = s('g', null, g);
    const body = s('g', { class: 'bob' }, flip);
    const col = WCOL[wn++ % WCOL.length];
    s('ellipse', { cx: 0, cy: 34, rx: 24, ry: 7, fill: '#000', opacity: 0.12 }, g);
    s('rect', { x: -22, y: -18, width: 44, height: 50, rx: 18, fill: col, stroke: INK, 'stroke-width': 4 }, body);
    s('circle', { cx: 0, cy: -30, r: 20, fill: ['#e4b894', '#9c6848', '#c98f66', '#6b4632', '#f3d6bd'][wn % 5], stroke: INK, 'stroke-width': 4 }, body);
    s('path', { d: 'M-22 -36 q22 -30 44 0 z', fill: C.ochre, stroke: INK, 'stroke-width': 3.5 }, body);
    s('circle', { cx: 8, cy: -28, r: 3, fill: INK }, body);
    const boxG = s('g', { transform: 'translate(0 -70)' }, body);
    const w = { c: 0, r: 3, dir: 0, prog: 0, g, flip, boxG, box: null, leaving: false };
    workers.push(w);
    replay(doorIn, 'wiggle');
    sfx.pop(1.1);
    drawWorker(w);
    return w;
  }
  function drawBox(w) { w.boxG.innerHTML = ''; if (w.box) parcel(w.boxG, w.box); }
  function drawWorker(w) {
    const a = cellXY(w.c, w.r);
    const x = a.x + DX[w.dir] * CS * w.prog, y = a.y + DY[w.dir] * CS * w.prog;
    w.g.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
    w.flip.setAttribute('transform', w.dir === 2 ? 'scale(-1 1)' : '');
  }
  door.addEventListener('pointerdown', (e) => { e.preventDefault(); spawn(); });

  function arrive(w) {
    const m = machines.get(key(w.c, w.r));
    if (m) trigger(m, w);
    const a = arrows.get(key(w.c, w.r));
    if (a) { w.dir = a.dir; sfx.tick(0.6); }
    // Leaving through the door?
    const nc = w.c + DX[w.dir], nr = w.r + DY[w.dir];
    if (nc === -1 && nr === 3) { w.leaving = true; return; }
    if (nc < 0 || nr < 0 || nc >= COLS || nr >= ROWS) { w.dir = (w.dir + 2) % 4; }
  }

  // Starting layout: a loop with a bell, a paint machine and a box machine.
  makeMachine('box', 2, 3); makeMachine('bell1', 5, 1); makeMachine('paint', 8, 2);
  makeMachine('bell2', 6, 5); makeMachine('bell3', 10, 4); makeMachine('wrap', 10, 1); makeMachine('cart', 11, 6);
  makeArrow(3, 3, 3); makeArrow(3, 1, 0); makeArrow(8, 1, 1); makeArrow(8, 3, 2);
  kit.after(900, spawn);

  const SPEED = 1.9; // cells per second
  kit.loop((dt) => {
    for (let i = workers.length - 1; i >= 0; i--) {
      const w = workers[i];
      w.prog += dt * SPEED;
      if (w.leaving && w.prog > 0.9) { w.g.remove(); workers.splice(i, 1); sfx.pop(0.7); continue; }
      if (w.prog >= 1) { w.c += DX[w.dir]; w.r += DY[w.dir]; w.prog = 0; arrive(w); }
      drawWorker(w);
    }
  });
}

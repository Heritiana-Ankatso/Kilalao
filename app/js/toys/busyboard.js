// Busy Board: switches light bulbs, gears turn, a dial colours a lamp,
// a latch opens a little door, a button rings a bell, beads slide on a rod.
import { s, C, makeStage, pt, drag, rand, clamp, replay } from '../lib.js';

export default function busyboard(root, kit) {
  const { sfx } = kit;
  const svg = makeStage(root, '#b5c2a8');
  const INK = C.ink;

  // Board
  const board = s('g', null, svg);
  s('rect', { x: 40, y: 30, width: 1520, height: 840, rx: 44, fill: '#c9a073', stroke: '#8f6a48', 'stroke-width': 6, filter: 'url(#wob)' }, board);
  for (let i = 0; i < 15; i++) {
    const y = 55 + i * 56 + rand(-8, 8);
    s('path', { d: `M70 ${y} C 450 ${y + rand(-14, 14)}, 1000 ${y + rand(-14, 14)}, 1530 ${y + rand(-8, 8)}`, stroke: '#8f6a48', 'stroke-width': 2, fill: 'none', opacity: 0.2 }, board);
  }
  for (const [x, y] of [[82, 72], [1518, 72], [82, 828], [1518, 828]]) {
    s('circle', { cx: x, cy: y, r: 12, fill: C.stone, stroke: '#6f6a63', 'stroke-width': 3 }, board);
    s('line', { x1: x - 7, y1: y - 4, x2: x + 7, y2: y + 4, stroke: '#6f6a63', 'stroke-width': 3 }, board);
  }

  // ---------- Switches, wires and bulbs ----------
  const on = [false, false, false];
  const bulbX = [520, 650, 780];
  const lives = [];
  for (let i = 0; i < 3; i++) {
    const y = 180 + i * 125;
    const d = `M300 ${y} C 420 ${y}, ${bulbX[i]} 320, ${bulbX[i]} 190`;
    s('path', { d, stroke: '#5a4a40', 'stroke-width': 8, fill: 'none', 'stroke-linecap': 'round' }, svg);
    lives.push(s('path', { d, stroke: '#f2c66d', 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round', 'stroke-dasharray': '14 18', class: 'flow', opacity: 0 }, svg));
  }
  const bulbs = bulbX.map((x) => {
    const g = s('g', null, svg);
    s('line', { x1: x, y1: 34, x2: x, y2: 100, stroke: '#5a4a40', 'stroke-width': 4 }, g);
    const glow = s('circle', { cx: x, cy: 150, r: 80, fill: '#ffd98a', filter: 'url(#glow)' }, g);
    glow.style.opacity = 0; glow.style.transition = 'opacity .6s';
    s('rect', { x: x - 16, y: 96, width: 32, height: 22, rx: 4, fill: C.stone, stroke: INK, 'stroke-width': 3 }, g);
    const glass = s('circle', { cx: x, cy: 150, r: 36, fill: '#ece6d6', stroke: INK, 'stroke-width': 3 }, g);
    glass.style.transition = 'fill .5s';
    s('path', { d: `M${x - 9} 162 q9 -24 18 0`, stroke: '#b0a690', 'stroke-width': 3, fill: 'none' }, g);
    return { set(v) { glow.style.opacity = v ? 0.9 : 0; glass.style.fill = v ? '#ffe9a8' : '#ece6d6'; } };
  });
  let wasAll = false;
  for (let i = 0; i < 3; i++) {
    const y = 180 + i * 125;
    const sw = s('g', { class: 'tap' }, svg);
    s('rect', { x: 130, y: y - 52, width: 180, height: 104, rx: 22, fill: C.cream, stroke: INK, 'stroke-width': 3 }, sw);
    s('circle', { cx: 230, cy: y, r: 30, fill: '#d9d2c4', stroke: INK, 'stroke-width': 3 }, sw);
    const led = s('circle', { cx: 164, cy: y, r: 10, fill: '#7d746a', stroke: INK, 'stroke-width': 2 }, sw);
    const lever = s('g', null, sw);
    lever.style.transformOrigin = `230px ${y}px`;
    lever.style.transition = 'transform .14s cubic-bezier(.4,1.6,.6,1)';
    lever.style.transform = 'rotate(40deg)';
    s('line', { x1: 230, y1: y, x2: 230, y2: y - 56, stroke: INK, 'stroke-width': 17, 'stroke-linecap': 'round' }, lever);
    s('line', { x1: 230, y1: y, x2: 230, y2: y - 56, stroke: '#ece8e0', 'stroke-width': 10, 'stroke-linecap': 'round' }, lever);
    s('circle', { cx: 230, cy: y - 60, r: 14, fill: [C.terra, C.teal, C.ochre][i], stroke: INK, 'stroke-width': 3 }, lever);
    sw.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      on[i] = !on[i];
      lever.style.transform = on[i] ? 'rotate(-40deg)' : 'rotate(40deg)';
      led.setAttribute('fill', on[i] ? '#f2c66d' : '#7d746a');
      lives[i].setAttribute('opacity', on[i] ? 1 : 0);
      bulbs[i].set(on[i]);
      sfx.click();
      const all = on.every(Boolean);
      if (all && !wasAll) [523, 659, 784, 1046].forEach((f, k) => kit.after(k * 170, () => sfx.chime(f, 0.7)));
      wasAll = all;
    });
  }

  // Pinwheel that spins when every switch is on
  const fan = s('g', null, svg);
  s('line', { x1: 960, y1: 170, x2: 960, y2: 300, stroke: '#6b5444', 'stroke-width': 8, 'stroke-linecap': 'round' }, fan);
  const blades = s('g', null, fan);
  [C.terra, C.ochre, C.teal, C.sage].forEach((c, k) => {
    s('path', { d: 'M0 0 Q 18 -46 0 -64 Q -8 -30 0 0 Z', fill: c, stroke: INK, 'stroke-width': 3, transform: `rotate(${k * 90})` }, blades);
  });
  s('circle', { cx: 960, cy: 170, r: 9, fill: C.cream, stroke: INK, 'stroke-width': 3 }, fan);
  let fanA = 0, fanW = 0;

  // ---------- Gears ----------
  function gearPath(r, n) {
    let d = '';
    const st = (Math.PI * 2) / n;
    for (let i = 0; i < n; i++) {
      const a = i * st;
      [[r - 4, a], [r + 12, a + st * 0.18], [r + 12, a + st * 0.48], [r - 4, a + st * 0.66]].forEach(([rr, aa], k) => {
        d += (i === 0 && k === 0 ? 'M' : 'L') + (rr * Math.cos(aa)).toFixed(1) + ' ' + (rr * Math.sin(aa)).toFixed(1) + ' ';
      });
    }
    return d + 'Z';
  }
  const G = [{ x: 640, y: 520, r: 120, n: 16, c: C.terra }, { r: 75, n: 10, c: C.ochre }, { r: 60, n: 8, c: C.teal }];
  const f12 = (-25 * Math.PI) / 180, f23 = (40 * Math.PI) / 180;
  const d12 = G[0].r + G[1].r + 8, d23 = G[1].r + G[2].r + 8;
  G[1].x = G[0].x + d12 * Math.cos(f12); G[1].y = G[0].y + d12 * Math.sin(f12);
  G[2].x = G[1].x + d23 * Math.cos(f23); G[2].y = G[1].y + d23 * Math.sin(f23);
  G.forEach((g) => (g.st = (Math.PI * 2) / g.n));
  G[0].p = f12 - 0.33 * G[0].st;
  G[1].p = f12 + Math.PI - 0.83 * G[1].st;
  let e = ((G[1].p + 0.33 * G[1].st - f23) % G[1].st + G[1].st) % G[1].st;
  if (e > G[1].st / 2) e -= G[1].st;
  G[2].p = f23 + Math.PI - e * (G[2].st / G[1].st) - 0.83 * G[2].st;
  G[0].k = 1; G[1].k = -G[0].n / G[1].n; G[2].k = G[0].n / G[2].n;
  for (const g of G) {
    g.el = s('g', { class: 'tap' }, svg);
    s('circle', { cx: g.x, cy: g.y, r: 10, fill: '#5a4a40' }, svg);
    const rot = s('g', null, g.el);
    g.rot = rot;
    s('path', { d: gearPath(g.r, g.n), fill: g.c, stroke: INK, 'stroke-width': 3, 'stroke-linejoin': 'round' }, rot);
    s('circle', { cx: 0, cy: 0, r: g.r * 0.62, fill: 'none', stroke: INK, 'stroke-width': 2, opacity: 0.35 }, rot);
    for (let k = 0; k < 3; k++) {
      const a = (k / 3) * Math.PI * 2;
      s('circle', { cx: Math.cos(a) * g.r * 0.5, cy: Math.sin(a) * g.r * 0.5, r: g.r * 0.14, fill: '#b48a5f', stroke: INK, 'stroke-width': 2 }, rot);
    }
    s('circle', { cx: 0, cy: 0, r: g.r * 0.22, fill: C.cream, stroke: INK, 'stroke-width': 3 }, rot);
  }
  s('circle', { cx: G[0].r * 0.75, cy: 0, r: 18, fill: C.cream, stroke: INK, 'stroke-width': 3 }, G[0].rot);
  let delta = 0, omega = 0, lastTooth = 0, lastTick = 0, grabbing = 0;
  function drawGears() {
    for (const g of G) g.rot.setAttribute('transform', `translate(${g.x.toFixed(1)} ${g.y.toFixed(1)}) rotate(${(((g.p + delta * g.k) * 180) / Math.PI).toFixed(2)})`);
  }
  drawGears();
  G.forEach((g) => {
    let prevA = 0, prevT = 0;
    drag(g.el, svg, {
      startMoved: true,
      down(p) { prevA = Math.atan2(p.y - g.y, p.x - g.x); prevT = performance.now(); grabbing++; omega = 0; },
      move(p) {
        const a = Math.atan2(p.y - g.y, p.x - g.x);
        let da = a - prevA;
        if (da > Math.PI) da -= Math.PI * 2;
        if (da < -Math.PI) da += Math.PI * 2;
        prevA = a;
        const t = performance.now();
        const dd = da / g.k;
        delta += dd;
        omega = omega * 0.6 + (dd / Math.max(0.008, (t - prevT) / 1000)) * 0.4;
        prevT = t;
      },
      up() { grabbing = Math.max(0, grabbing - 1); omega = clamp(omega, -14, 14); },
    });
  });

  // ---------- Dial and coloured lamp ----------
  const DX = 1110, DY = 230;
  const detents = [-120, -72, -24, 24, 72, 120];
  const lampColors = ['#f2c66d', '#e59a80', '#9fc6a0', '#8fb8d8', '#c9a6d6', '#f3efe3'];
  let dialI = 0;
  detents.forEach((a) => {
    const r = (a * Math.PI) / 180;
    s('circle', { cx: DX + Math.sin(r) * 96, cy: DY - Math.cos(r) * 96, r: 7, fill: C.ink, opacity: 0.55 }, svg);
  });
  const dial = s('g', { class: 'tap' }, svg);
  s('circle', { cx: DX, cy: DY, r: 74, fill: C.cream, stroke: INK, 'stroke-width': 3 }, dial);
  const ptr = s('g', null, dial);
  ptr.style.transformOrigin = `${DX}px ${DY}px`;
  ptr.style.transition = 'transform .18s cubic-bezier(.4,1.5,.6,1)';
  s('rect', { x: DX - 16, y: DY - 70, width: 32, height: 140, rx: 16, fill: '#e0d4bd', stroke: INK, 'stroke-width': 3 }, ptr);
  s('circle', { cx: DX, cy: DY - 50, r: 8, fill: C.terra }, ptr);
  const lampGlow = s('circle', { cx: 1310, cy: 230, r: 80, fill: lampColors[0], filter: 'url(#glow)', opacity: 0.7 }, svg);
  const lamp = s('circle', { cx: 1310, cy: 230, r: 52, fill: lampColors[0], stroke: INK, 'stroke-width': 3 }, svg);
  lamp.style.transition = lampGlow.style.transition = 'fill .4s';
  s('path', { d: 'M1290 210 q10 -14 26 -12', stroke: '#fff', 'stroke-width': 5, fill: 'none', opacity: 0.6, 'stroke-linecap': 'round' }, svg);
  function setDial(i) {
    if (i === dialI) return;
    dialI = i;
    ptr.style.transform = `rotate(${detents[i]}deg)`;
    lamp.style.fill = lampGlow.style.fill = lampColors[i];
    sfx.click();
    sfx.chime([523, 587, 659, 784, 880, 1046][i], 0.4);
  }
  ptr.style.transform = `rotate(${detents[0]}deg)`;
  drag(dial, svg, {
    move(p) {
      const a = (Math.atan2(p.x - DX, -(p.y - DY)) * 180) / Math.PI;
      let best = 0;
      detents.forEach((d, k) => { if (Math.abs(d - a) < Math.abs(detents[best] - a)) best = k; });
      setDial(best);
    },
    tap() { setDial((dialI + 1) % detents.length); },
  });

  // ---------- Door with a sliding bolt ----------
  s('rect', { x: 1150, y: 410, width: 320, height: 390, rx: 16, fill: '#8f6a48', stroke: INK, 'stroke-width': 3 }, svg);
  s('rect', { x: 1166, y: 426, width: 288, height: 358, rx: 10, fill: '#4f3e31' }, svg);
  const critterG = s('g', null, svg);
  const door = s('g', { class: 'tap' }, svg);
  door.style.transformOrigin = '1166px 605px';
  door.style.transition = 'transform .7s cubic-bezier(.3,.7,.3,1)';
  s('rect', { x: 1166, y: 426, width: 288, height: 358, rx: 10, fill: C.blue, stroke: INK, 'stroke-width': 3 }, door);
  s('rect', { x: 1192, y: 452, width: 236, height: 130, rx: 10, fill: 'none', stroke: INK, 'stroke-width': 3, opacity: 0.35 }, door);
  s('rect', { x: 1192, y: 610, width: 236, height: 150, rx: 10, fill: 'none', stroke: INK, 'stroke-width': 3, opacity: 0.35 }, door);
  s('circle', { cx: 1420, cy: 640, r: 13, fill: C.ochre, stroke: INK, 'stroke-width': 3 }, door);
  s('rect', { x: 1300, y: 520, width: 150, height: 30, rx: 8, fill: '#9aa0a8', stroke: INK, 'stroke-width': 3 }, door);
  const bolt = s('g', { class: 'tap' }, door);
  s('rect', { x: 0, y: 527, width: 120, height: 16, rx: 6, fill: '#d9dde2', stroke: INK, 'stroke-width': 3 }, bolt);
  s('circle', { cx: 24, cy: 535, r: 16, fill: C.terra, stroke: INK, 'stroke-width': 3 }, bolt);
  s('rect', { x: 1446, y: 512, width: 40, height: 46, rx: 6, fill: '#9aa0a8', stroke: INK, 'stroke-width': 3 }, svg);
  const BOLT_LOCK = 1370, BOLT_OPEN = 1300;
  let boltX = BOLT_LOCK, open = false;
  const locked = () => boltX > 1345;
  const setBolt = (x) => { boltX = clamp(x, BOLT_OPEN, BOLT_LOCK); bolt.setAttribute('transform', `translate(${boltX} 0)`); };
  setBolt(BOLT_LOCK);
  let boltOff = 0, wasLocked = true;
  drag(bolt, svg, {
    down(p) { if (open) return false; boltOff = p.x - boltX; },
    move(p) {
      setBolt(p.x - boltOff);
      if (locked() !== wasLocked) { wasLocked = locked(); sfx.clack(wasLocked ? 1.2 : 0.9); }
    },
    tap() { setBolt(locked() ? BOLT_OPEN : BOLT_LOCK); wasLocked = locked(); sfx.clack(wasLocked ? 1.2 : 0.9); },
  });
  const critters = [
    (g) => { // mouse
      s('ellipse', { cx: 1310, cy: 720, rx: 60, ry: 40, fill: '#b9b2a8', stroke: INK, 'stroke-width': 3 }, g);
      s('circle', { cx: 1270, cy: 676, r: 22, fill: '#dca9a0', stroke: INK, 'stroke-width': 3 }, g);
      s('circle', { cx: 1350, cy: 676, r: 22, fill: '#dca9a0', stroke: INK, 'stroke-width': 3 }, g);
      s('circle', { cx: 1310, cy: 700, r: 44, fill: '#c9c2b8', stroke: INK, 'stroke-width': 3 }, g);
      s('circle', { cx: 1294, cy: 696, r: 5, fill: INK }, g); s('circle', { cx: 1326, cy: 696, r: 5, fill: INK }, g);
      s('circle', { cx: 1310, cy: 714, r: 7, fill: '#c97b63' }, g);
      return () => sfx.squeak(1);
    },
    (g) => { // bird
      s('circle', { cx: 1310, cy: 700, r: 54, fill: C.ochre, stroke: INK, 'stroke-width': 3 }, g);
      s('path', { d: 'M1262 712 q30 30 60 0', fill: '#e8c27a', stroke: INK, 'stroke-width': 3 }, g);
      s('circle', { cx: 1292, cy: 688, r: 6, fill: INK }, g); s('circle', { cx: 1328, cy: 688, r: 6, fill: INK }, g);
      s('path', { d: 'M1300 702 l10 14 l10 -14 z', fill: C.terra, stroke: INK, 'stroke-width': 3, 'stroke-linejoin': 'round' }, g);
      return () => sfx.chirp();
    },
    (g) => { // frog
      s('ellipse', { cx: 1310, cy: 715, rx: 70, ry: 48, fill: C.sage, stroke: INK, 'stroke-width': 3 }, g);
      s('circle', { cx: 1284, cy: 670, r: 20, fill: C.sage, stroke: INK, 'stroke-width': 3 }, g);
      s('circle', { cx: 1336, cy: 670, r: 20, fill: C.sage, stroke: INK, 'stroke-width': 3 }, g);
      s('circle', { cx: 1284, cy: 670, r: 7, fill: INK }, g); s('circle', { cx: 1336, cy: 670, r: 7, fill: INK }, g);
      s('path', { d: 'M1280 720 q30 18 60 0', fill: 'none', stroke: INK, 'stroke-width': 3, 'stroke-linecap': 'round' }, g);
      return () => sfx.boing(0.8);
    },
  ];
  let critterN = 0, critterSound = null;
  function showCritter() {
    critterG.innerHTML = '';
    const inner = s('g', { class: 'fbb' }, critterG);
    critterSound = critters[critterN++ % critters.length](inner);
    replay(inner, 'popin');
  }
  drag(door, svg, {
    tap() {
      if (!open && locked()) {
        door.style.transform = 'translateX(5px)';
        kit.after(80, () => (door.style.transform = 'translateX(-4px)'));
        kit.after(160, () => (door.style.transform = ''));
        sfx.clack(0.7);
        return;
      }
      open = !open;
      if (open) { showCritter(); door.style.transform = 'scaleX(0.1)'; sfx.squeak(0.5); kit.after(400, () => critterSound && critterSound()); }
      else { door.style.transform = ''; sfx.thud(1.4, 0.6); }
    },
  });
  critterG.addEventListener('pointerdown', () => { if (open && critterSound) { critterSound(); replay(critterG.firstChild, 'wiggle'); } });

  // ---------- Button and bell ----------
  const btn = s('g', { class: 'tap' }, svg);
  s('circle', { cx: 240, cy: 700, r: 74, fill: '#d9d2c4', stroke: INK, 'stroke-width': 3 }, btn);
  const cap = s('g', null, btn);
  cap.style.transition = 'transform .08s';
  s('circle', { cx: 240, cy: 700, r: 52, fill: C.terra, stroke: INK, 'stroke-width': 3 }, cap);
  s('path', { d: 'M212 684 q14 -16 34 -12', stroke: '#fff', 'stroke-width': 6, fill: 'none', opacity: 0.45, 'stroke-linecap': 'round' }, cap);
  s('path', { d: 'M430 600 v28', stroke: '#5a4a40', 'stroke-width': 6 }, svg);
  s('rect', { x: 400, y: 592, width: 60, height: 12, rx: 6, fill: '#5a4a40' }, svg);
  const bellG = s('g', { class: 'tap' }, svg);
  bellG.style.transformOrigin = '430px 626px';
  s('circle', { cx: 430, cy: 728, r: 10, fill: '#8a6a3a', stroke: INK, 'stroke-width': 3 }, bellG);
  s('path', { d: 'M388 716 Q392 640 430 628 Q468 640 472 716 L484 728 L376 728 Z', fill: C.ochre, stroke: INK, 'stroke-width': 3, 'stroke-linejoin': 'round' }, bellG);
  s('path', { d: 'M404 700 q2 -40 18 -54', stroke: '#fff', 'stroke-width': 5, fill: 'none', opacity: 0.4, 'stroke-linecap': 'round' }, bellG);
  const ring = () => { replay(bellG, 'swing'); sfx.bell(784); };
  btn.addEventListener('pointerdown', (e) => { e.preventDefault(); cap.style.transform = 'translateY(6px) scale(.96)'; sfx.click(); ring(); });
  const release = () => (cap.style.transform = '');
  btn.addEventListener('pointerup', release);
  btn.addEventListener('pointerleave', release);
  bellG.addEventListener('pointerdown', ring);

  // ---------- Beads on a rod ----------
  const RY = 785, RMIN = 606, RMAX = 1044, BR = 26;
  s('rect', { x: 570, y: RY - 70, width: 10, height: 90, rx: 5, fill: '#6b5444' }, svg);
  s('rect', { x: 1070, y: RY - 70, width: 10, height: 90, rx: 5, fill: '#6b5444' }, svg);
  s('line', { x1: 575, y1: RY, x2: 1075, y2: RY, stroke: '#6b5444', 'stroke-width': 8, 'stroke-linecap': 'round' }, svg);
  const beadC = [C.terra, C.ochre, C.sage, C.teal, C.blue, C.plum];
  const xs = [606, 658, 710, 940, 992, 1044];
  let touching = xs.map((x, i) => i < xs.length - 1 && xs[i + 1] - x <= 52.5);
  const beads = xs.map((x, i) => {
    const g = s('g', { class: 'tap' }, svg);
    s('circle', { cx: 0, cy: 0, r: BR, fill: beadC[i], stroke: INK, 'stroke-width': 3 }, g);
    s('ellipse', { cx: -8, cy: -10, rx: 8, ry: 5, fill: '#fff', opacity: 0.35 }, g);
    return g;
  });
  const drawBeads = () => beads.forEach((b, i) => b.setAttribute('transform', `translate(${xs[i].toFixed(1)} ${RY})`));
  drawBeads();
  function resolve(i) {
    const n = xs.length, gap = BR * 2;
    for (let j = i + 1; j < n; j++) xs[j] = Math.max(xs[j], xs[j - 1] + gap);
    for (let j = i - 1; j >= 0; j--) xs[j] = Math.min(xs[j], xs[j + 1] - gap);
    if (xs[n - 1] > RMAX) { xs[n - 1] = RMAX; for (let j = n - 2; j >= 0; j--) xs[j] = Math.min(xs[j], xs[j + 1] - gap); }
    if (xs[0] < RMIN) { xs[0] = RMIN; for (let j = 1; j < n; j++) xs[j] = Math.max(xs[j], xs[j - 1] + gap); }
    let clacked = false;
    touching = touching.map((was, j) => {
      if (j >= n - 1) return false;
      const now = xs[j + 1] - xs[j] <= gap + 0.5;
      if (now && !was && !clacked) { sfx.clack(1.4 + j * 0.05, 0.8); clacked = true; }
      return now;
    });
    drawBeads();
  }
  beads.forEach((b, i) => {
    let off = 0;
    drag(b, svg, {
      down(p) { off = p.x - xs[i]; },
      move(p) { xs[i] = clamp(p.x - off, RMIN, RMAX); resolve(i); },
      tap() { xs[i] += i < 3 ? 300 : -300; xs[i] = clamp(xs[i], RMIN, RMAX); resolve(i); },
    });
  });

  // ---------- Animation loop ----------
  kit.loop((dt) => {
    const all = on.every(Boolean);
    fanW += ((all ? 7 : 0) - fanW) * Math.min(1, dt * 1.2);
    fanA += fanW * dt;
    blades.setAttribute('transform', `translate(960 170) rotate(${((fanA * 180) / Math.PI).toFixed(1)})`);
    if (!grabbing) {
      if (all) omega += (1.4 - omega) * Math.min(1, dt * 1.5);
      else omega *= Math.exp(-1.1 * dt);
      delta += omega * dt;
    }
    drawGears();
    const tooth = Math.floor(delta / G[0].st);
    const t = performance.now();
    if (tooth !== lastTooth && t - lastTick > 45) { sfx.tick(0.8); lastTick = t; }
    lastTooth = tooth;
  });
}

// Dinosaurs: a warm prehistoric valley. Friendly dinosaurs stroll slowly and
// can be carried anywhere on the ground; each one does its own little thing
// when tapped. The volcano rumbles and puffs, a pterosaur circles the sky and
// three eggs in a nest hatch after a few gentle taps.
import { s, C, makeStage, drag, rand, pick, clamp, replay } from '../lib.js';

const GROUND = 600, GMAX = 820;

export default function dinos(root, kit) {
  const { sfx, audio } = kit;
  const svg = makeStage(root, '#ecd3a8');
  const INK = C.ink;
  const ink = (o, w = 4) => ({ stroke: INK, 'stroke-width': w, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', ...o });
  const tapOn = (el, f) => el.addEventListener('pointerdown', (e) => { if (e.button > 0) return; e.preventDefault(); e.stopPropagation(); f(e); });

  const lg = s('linearGradient', { id: 'dn-sky', x1: 0, y1: 0, x2: 0, y2: 1 }, svg.defs);
  [[0, '#e7c79b'], [0.7, '#f3dfbd'], [1, '#f6e6c6']].forEach(([o, c]) => s('stop', { offset: o, 'stop-color': c }, lg));
  const rg = s('radialGradient', { id: 'dn-lava' }, svg.defs);
  [[0, '#ffcf73', 1], [1, '#e2774a', 0]].forEach(([o, c, op]) => s('stop', { offset: o, 'stop-color': c, 'stop-opacity': op }, rg));

  // ---------- Landscape ----------
  s('rect', { x: -400, y: -200, width: 2400, height: 1300, fill: 'url(#dn-sky)' }, svg);
  s('circle', { cx: 1040, cy: 200, r: 80, fill: '#f6d88f', opacity: 0.85 }, svg);
  const cloudG = s('g', null, svg);
  const clouds = [[600, 140, 6], [1180, 90, 9], [200, 210, 4]].map(([x, y, v]) => {
    const c = s('g', null, cloudG);
    s('path', ink({ d: 'M0 30 q-4 -30 30 -30 q16 -28 52 -12 q36 -12 44 20 q26 4 18 22 Z', fill: '#f8efdf' }, 3), c);
    return { el: c, x, y, v };
  });
  s('path', { d: 'M-200 560 Q 200 420 520 500 T 1100 470 T 1800 500 V700 H-200 Z', fill: '#d4b07c' }, svg);
  s('path', { d: 'M-200 600 Q 300 540 800 580 T 1800 570 V1100 H-200 Z', fill: '#b9b06e' }, svg);
  s('rect', { x: -200, y: 640, width: 2000, height: 500, fill: '#a9a466' }, svg);
  for (let i = 0; i < 40; i++) {
    const x = rand(0, 1600), y = rand(640, 880);
    s('path', { d: `M${x} ${y} l-6 -14 M${x} ${y} l2 -18 M${x} ${y} l8 -12`, stroke: '#7f8a4f', 'stroke-width': 3, 'stroke-linecap': 'round' }, svg);
  }

  // ---------- Volcano ----------
  const VX = 330, VY = 300;
  const smokeG = s('g', { 'pointer-events': 'none' }, svg);
  const volc = s('g', { class: 'tap' }, svg);
  const vin = s('g', { class: 'fbb' }, volc);
  s('path', ink({ d: `M60 620 L${VX - 60} ${VY + 10} Q${VX} ${VY - 12} ${VX + 60} ${VY + 10} L600 620 Z`, fill: '#8a6c58' }, 4), vin);
  s('path', { d: `M${VX - 40} ${VY + 30} q20 80 -10 160 M${VX + 30} ${VY + 30} q-10 110 30 200`, stroke: '#6f5646', 'stroke-width': 5, fill: 'none', 'stroke-linecap': 'round' }, vin);
  s('path', ink({ d: `M${VX - 60} ${VY + 10} Q${VX} ${VY - 12} ${VX + 60} ${VY + 10} Q${VX + 40} ${VY + 40} ${VX + 18} ${VY + 22} Q${VX + 4} ${VY + 60} ${VX - 14} ${VY + 26} Q${VX - 36} ${VY + 44} ${VX - 60} ${VY + 10} Z`, fill: '#d9784f' }, 3), vin);
  const craterGlow = s('ellipse', { cx: VX, cy: VY, rx: 120, ry: 70, fill: 'url(#dn-lava)', opacity: 0 }, vin);
  craterGlow.style.transition = 'opacity .6s';
  const lavaG = s('g', { 'pointer-events': 'none' }, svg);
  const blobs = [], puffs = [];
  let erupt = 0;
  function puff(x, y, big) {
    const p = { x, y, r: big ? rand(26, 40) : rand(16, 26), t: 0, vx: rand(-8, 18), el: s('circle', { fill: '#d6cfc6', stroke: INK, 'stroke-width': 2, 'stroke-opacity': 0.3 }, smokeG) };
    puffs.push(p);
  }
  tapOn(volc, () => {
    if (erupt > 1) return;
    erupt = 3;
    replay(vin, 'wiggle');
    craterGlow.setAttribute('opacity', 1);
    sfx.rumble();
    kit.after(700, () => sfx.sizzle(1.8));
  });
  kit.every(2600, () => { if (!erupt) puff(VX + rand(-10, 10), VY - 6, false); });

  // ---------- Tree for the long-neck ----------
  const TX = 1400;
  const treeG = s('g', null, svg);
  s('path', ink({ d: `M${TX - 22} 640 Q${TX - 10} 480 ${TX - 16} 300 L${TX + 16} 300 Q${TX + 8} 480 ${TX + 22} 640 Z`, fill: C.cocoa }, 4), treeG);
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    s('path', ink({ d: `M${TX} 290 Q${TX + Math.cos(a) * 70} ${280 + Math.sin(a) * 30 - 40} ${TX + Math.cos(a) * 140} ${290 + Math.sin(a) * 50}`, fill: 'none', stroke: C.moss, 'stroke-width': 26 }, 4), treeG);
    s('path', { d: `M${TX} 290 Q${TX + Math.cos(a) * 70} ${280 + Math.sin(a) * 30 - 40} ${TX + Math.cos(a) * 140} ${290 + Math.sin(a) * 50}`, fill: 'none', stroke: C.leaf, 'stroke-width': 18, 'stroke-linecap': 'round' }, treeG);
  }
  const fallG = s('g', { 'pointer-events': 'none' }, svg);
  const falling = [];
  function dropLeaf(x, y) {
    const el = s('ellipse', ink({ rx: 12, ry: 6, fill: C.leaf }, 2.5), fallG);
    falling.push({ x, y, vy: rand(30, 60), ph: rand(0, 6), t: 0, gy: rand(650, 720), el });
  }

  // ---------- Ferns ----------
  [[640, 640], [980, 630], [180, 700], [1500, 700]].forEach(([x, y]) => {
    for (let k = -2; k <= 2; k++) {
      s('path', { d: `M${x} ${y} q${k * 20} -50 ${k * 46} -${80 - Math.abs(k) * 12}`, stroke: C.moss, 'stroke-width': 10, fill: 'none', 'stroke-linecap': 'round' }, svg);
    }
  });

  // ---------- Dinosaurs ----------
  const herdG = s('g', null, svg);
  const herd = [];
  function legs(g, xs, top, len, col, w = 30) {
    xs.forEach((x, i) => s('rect', ink({ x: x - w / 2, y: top, width: w, height: len, rx: w / 2.4, fill: col, class: `fbt ${i % 2 ? 'legB' : 'legA'}` }, 3.5), g));
  }
  function eye(g, x, y, r = 6) { s('circle', { cx: x, cy: y, r, fill: INK }, g); s('circle', { cx: x + r * 0.35, cy: y - r * 0.35, r: r * 0.35, fill: '#fff' }, g); }
  function blush(g, x, y) { s('circle', { cx: x, cy: y, r: 8, fill: C.rose, opacity: 0.6 }, g); }

  function dino(kind, x, y, scale, range, build, onTap) {
    const D = { kind, x, y, scale, range, dir: pick([-1, 1]), speed: rand(18, 28), walk: true, pause: rand(2, 5), held: false, act: 0 };
    D.g = s('g', { class: 'tap' }, herdG);
    D.inner = s('g', { class: 'walking' }, D.g);
    D.parts = build(D.inner);
    D.tap = onTap;
    drag(D.g, svg, {
      down(p) { D.off = { x: D.x - p.x, y: D.y - p.y }; },
      move(p) {
        if (!D.held) { D.held = true; D.inner.classList.remove('walking'); sfx.boing(0.6); }
        D.x = clamp(p.x + D.off.x, 120, 1480); D.y = clamp(p.y + D.off.y, GROUND + 20, GMAX);
      },
      up(p, e, moved) {
        if (!moved) return;
        D.held = false; sfx.thud(0.8, 0.6);
        D.range = [clamp(D.x - 170, 120, 1480), clamp(D.x + 170, 120, 1480)];
        D.walk = false; D.pause = 1.5;
      },
      tap() { onTap(D); },
    });
    herd.push(D);
    return D;
  }

  // Long-neck
  const longneck = dino('longneck', 1120, 660, 1, [1020, 1220], (g) => {
    s('path', ink({ d: 'M-90 -110 Q-200 -100 -270 -40 Q-200 -70 -90 -70 Z', fill: '#8fa98a' }, 4), g);
    legs(g, [-80, 70], -80, 80, '#7e9779', 34);
    const neck = s('g', null, g);
    s('path', { d: 'M70 -120 Q150 -190 150 -320', stroke: INK, 'stroke-width': 50, fill: 'none', 'stroke-linecap': 'round' }, neck);
    s('path', { d: 'M70 -120 Q150 -190 150 -320', stroke: '#93ab8b', 'stroke-width': 42, fill: 'none', 'stroke-linecap': 'round' }, neck);
    const head = s('g', null, neck);
    s('ellipse', ink({ cx: 168, cy: -334, rx: 44, ry: 26, fill: '#93ab8b' }, 4), head);
    eye(head, 172, -342, 6);
    blush(head, 192, -326);
    const jaw = s('path', { d: 'M180 -322 Q196 -316 208 -326', stroke: INK, 'stroke-width': 3.5, fill: 'none', 'stroke-linecap': 'round' }, head);
    s('ellipse', ink({ cx: 0, cy: -110, rx: 130, ry: 66, fill: '#93ab8b' }, 4), g);
    for (const [x, y] of [[-40, -140], [10, -150], [50, -130], [-70, -112]]) s('circle', { cx: x, cy: y, r: 9, fill: '#7e9779' }, g);
    legs(g, [-50, 100], -70, 70, '#93ab8b', 36);
    return { neck, jaw };
  }, (D) => {
    if (D.act > 0) return;
    D.act = 2.6; D.dir = 1; D.walk = false; D.pause = 3;
    sfx.munch(); kit.after(700, () => sfx.munch());
    for (let i = 0; i < 5; i++) kit.after(300 + i * 220, () => dropLeaf(TX + rand(-120, 120), rand(270, 330)));
  });

  // Small friendly T-rex type
  const rex = dino('rex', 640, 690, 0.95, [520, 820], (g) => {
    s('path', ink({ d: 'M-30 -90 Q-120 -90 -170 -40 Q-110 -56 -30 -50 Z', fill: '#c98a6b' }, 4), g);
    legs(g, [-12], -60, 60, '#b3775b', 30);
    s('ellipse', ink({ cx: 0, cy: -100, rx: 62, ry: 52, fill: '#d0937a', transform: 'rotate(-18 0 -100)' }, 4), g);
    s('ellipse', { cx: 14, cy: -90, rx: 30, ry: 32, fill: '#ecd3b6', transform: 'rotate(-18 14 -90)' }, g);
    legs(g, [22], -58, 58, '#d0937a', 32);
    s('path', ink({ d: 'M44 -110 q22 6 20 20 M48 -96 q18 8 14 20', fill: 'none' }, 4), g);
    const head = s('g', null, g);
    s('rect', ink({ x: 10, y: -210, width: 110, height: 72, rx: 34, fill: '#d0937a' }, 4), head);
    eye(head, 64, -186, 7);
    blush(head, 88, -160);
    s('circle', { cx: 112, cy: -190, r: 3, fill: INK }, head);
    const mouth = s('path', ink({ d: 'M70 -160 Q94 -146 116 -162', fill: 'none' }, 3.5), head);
    return { mouth };
  }, (D) => {
    replay(D.inner, 'hop');
    D.inner.classList.add('fbb');
    sfx.roar(1.7);
    D.parts.mouth.setAttribute('d', 'M70 -162 Q94 -132 116 -164 Z');
    D.parts.mouth.setAttribute('fill', '#a8574a');
    kit.after(800, () => { D.parts.mouth.setAttribute('d', 'M70 -160 Q94 -146 116 -162'); D.parts.mouth.setAttribute('fill', 'none'); });
  });

  // Triceratops
  const trike = dino('trike', 400, 760, 0.95, [250, 560], (g) => {
    s('path', ink({ d: 'M-90 -90 Q-150 -80 -170 -50 Q-130 -60 -90 -56 Z', fill: '#c4a064' }, 4), g);
    legs(g, [-60, 50], -56, 56, '#b08d55', 34);
    s('ellipse', ink({ cx: 0, cy: -92, rx: 108, ry: 56, fill: '#d2ad6f' }, 4), g);
    const head = s('g', null, g);
    s('path', ink({ d: 'M70 -150 Q150 -190 170 -100 Q140 -70 90 -70 Z', fill: C.terra }, 4), head);
    for (let k = 0; k < 4; k++) s('circle', { cx: 112 + k * 12, cy: -150 + k * 16, r: 5, fill: C.ochre }, head);
    s('path', ink({ d: 'M110 -120 Q170 -130 200 -90 Q190 -60 140 -58 Q100 -70 110 -120 Z', fill: '#d2ad6f' }, 4), head);
    s('path', ink({ d: 'M140 -124 l20 -50 l6 46 Z M170 -118 l26 -40 l-6 44 Z', fill: C.cream }, 3), head);
    s('path', ink({ d: 'M196 -96 l18 -16 l-6 22 Z', fill: C.cream }, 3), head);
    eye(head, 158, -100, 6);
    blush(head, 176, -80);
    s('path', ink({ d: 'M170 -72 q14 6 24 -4', fill: 'none' }, 3), head);
    legs(g, [-34, 76], -52, 52, '#d2ad6f', 36);
    return { head };
  }, (D) => { D.act = 2; D.walk = false; D.pause = 2.4; audio.tone(140, { type: 'triangle', dur: 0.25, vol: 0.12, glide: 110 }); audio.tone(150, { type: 'triangle', dur: 0.25, vol: 0.1, glide: 115, at: audio.now() + 0.5 }); });

  // Stegosaurus
  const stego = dino('stego', 1000, 800, 0.9, [860, 1100], (g) => {
    s('path', ink({ d: 'M-100 -80 Q-170 -70 -210 -30 Q-160 -46 -100 -48 Z', fill: '#7e9f95' }, 4), g);
    for (const x of [-200, -180]) s('path', ink({ d: `M${x} -40 l-12 -30 l18 22 Z`, fill: C.cream }, 3), g);
    const plates = s('g', null, g);
    const glow = s('g', { opacity: 0 }, g);
    glow.style.transition = 'opacity .5s';
    [[-90, -120, 30], [-50, -150, 38], [-5, -160, 42], [40, -150, 38], [80, -125, 30]].forEach(([x, y, h]) => {
      s('circle', { cx: x, cy: y - h / 4, r: h * 1.1, fill: 'url(#dn-lava)' }, glow);
      s('path', ink({ d: `M${x - h / 2} ${y + h / 2} L${x - h / 3} ${y - h / 3} L${x} ${y - h} L${x + h / 3} ${y - h / 3} L${x + h / 2} ${y + h / 2} Z`, fill: C.terra }, 3.5), plates);
    });
    legs(g, [-60, 50], -56, 56, '#6f8f86', 32);
    s('path', ink({ d: 'M-120 -60 Q-60 -170 40 -150 Q110 -130 130 -70 Q60 -40 -120 -60 Z', fill: '#86a89d' }, 4), g);
    s('ellipse', ink({ cx: 150, cy: -60, rx: 36, ry: 22, fill: '#86a89d' }, 4), g);
    eye(g, 158, -66, 5);
    blush(g, 172, -52);
    legs(g, [-30, 80], -52, 52, '#86a89d', 34);
    return { glow, plates };
  }, (D) => {
    D.parts.glow.setAttribute('opacity', 1);
    D.parts.plates.querySelectorAll('path').forEach((p) => p.setAttribute('fill', '#ec9a6c'));
    [0, 1, 2, 3, 4].forEach((k) => kit.after(k * 110, () => sfx.chime([523, 587, 659, 784, 880][k], 0.35)));
    kit.after(2600, () => { D.parts.glow.setAttribute('opacity', 0); D.parts.plates.querySelectorAll('path').forEach((p) => p.setAttribute('fill', C.terra)); });
  });

  // ---------- Nest with three eggs ----------
  const NX = 1240, NY = 820;
  const nest = s('g', null, svg);
  s('ellipse', ink({ cx: NX, cy: NY, rx: 120, ry: 34, fill: '#9c7a52' }, 4), nest);
  const eggsG = s('g', null, svg);
  for (let i = 0; i < 9; i++) s('path', { d: `M${NX - 110 + i * 26} ${NY + 8} q14 -16 30 -2`, stroke: '#7a5a44', 'stroke-width': 5, fill: 'none', 'stroke-linecap': 'round' }, svg);
  const eggCols = ['#efe3cc', '#dfe6d6', '#ead8cf'];
  const babies = [];
  [-62, 0, 62].forEach((dx, i) => {
    const eg = s('g', { class: 'tap', transform: `translate(${NX + dx} ${NY - 8})` }, eggsG);
    const inner = s('g', { class: 'fbb' }, eg);
    const shellBack = s('g', null, inner);
    const babyG = s('g', null, inner);
    const top = s('g', null, inner);
    const bottom = s('g', null, inner);
    s('path', ink({ d: 'M-30 -30 Q-30 -84 0 -86 Q30 -84 30 -30 L20 -40 L10 -28 L0 -40 L-10 -28 L-20 -40 Z', fill: eggCols[i] }, 3.5), top);
    s('path', ink({ d: 'M-30 -30 L-20 -40 L-10 -28 L0 -40 L10 -28 L20 -40 L30 -30 Q34 0 0 2 Q-34 0 -30 -30 Z', fill: eggCols[i] }, 3.5), bottom);
    [[-12, -60], [10, -70], [14, -14], [-14, -16]].forEach(([x, y]) => s('circle', { cx: x, cy: y, r: 5, fill: C.sage, opacity: 0.6 }, y < -30 ? top : bottom));
    const crack = s('path', { d: 'M-30 -30 L-20 -40 L-10 -28 L0 -40 L10 -28 L20 -40 L30 -30', stroke: INK, 'stroke-width': 2.5, fill: 'none', opacity: 0 }, inner);
    const E = { taps: 0, hatched: false };
    tapOn(eg, () => {
      if (E.hatched) {
        const b = babies[i];
        replay(b, 'hop'); sfx.chirp();
        return;
      }
      E.taps++;
      replay(inner, 'wiggle');
      sfx.clack(1.4, 0.4);
      if (E.taps === 1) crack.setAttribute('opacity', 0.4);
      if (E.taps === 2) crack.setAttribute('opacity', 1);
      if (E.taps >= 3) {
        E.hatched = true;
        top.setAttribute('class', 'rise');
        kit.after(1700, () => top.remove());
        crack.remove();
        s('path', { d: 'M-28 -32 Q0 -46 28 -32 L28 -20 L-28 -20 Z', fill: '#b9a487' }, shellBack);
        const baby = s('g', { class: 'fbb popin' }, babyG);
        const col = ['#93ab8b', '#d0937a', '#d2ad6f'][i];
        s('ellipse', ink({ cx: 0, cy: -52, rx: 26, ry: 24, fill: col }, 3.5), baby);
        s('ellipse', ink({ cx: 14, cy: -62, rx: 22, ry: 16, fill: col }, 3.5), baby);
        eye(baby, 16, -68, 4.5);
        blush(baby, 28, -56);
        s('path', { d: 'M22 -54 q8 4 14 -2', stroke: INK, 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }, baby);
        babies[i] = baby;
        sfx.pop(1.2); kit.after(400, () => sfx.chirp());
        [784, 988, 1175].forEach((f, k) => kit.after(500 + k * 150, () => sfx.chime(f, 0.35)));
      }
    });
  });
  kit.every(5200, () => {
    const live = babies.filter(Boolean);
    if (live.length && Math.random() < 0.6) { const b = pick(live); replay(b, 'wiggle'); sfx.chirp(); }
  });

  // ---------- Pterosaur ----------
  const ptero = { a: 0, swoop: 0 };
  ptero.g = s('g', { class: 'tap' }, svg);
  s('circle', { cx: 0, cy: 0, r: 80, fill: 'transparent' }, ptero.g);
  ptero.wl = s('g', null, ptero.g);
  ptero.wr = s('g', null, ptero.g);
  s('path', ink({ d: 'M-10 0 Q-60 -50 -120 -20 Q-70 -14 -10 12 Z', fill: C.plum }, 3.5), ptero.wl);
  s('path', ink({ d: 'M10 0 Q60 -50 120 -20 Q70 -14 10 12 Z', fill: C.plum }, 3.5), ptero.wr);
  s('ellipse', ink({ cx: 0, cy: 4, rx: 22, ry: 14, fill: '#b49ab0' }, 3.5), ptero.g);
  s('path', ink({ d: 'M14 -6 Q40 -24 66 -6 Q40 2 14 6 Z', fill: '#b49ab0' }, 3), ptero.g);
  s('path', ink({ d: 'M22 -10 L0 -30 L30 -14', fill: C.terra }, 3), ptero.g);
  eye(ptero.g, 34, -8, 4);
  tapOn(ptero.g, () => { if (ptero.swoop <= 0) { ptero.swoop = 1; sfx.whoosh(0.8); audio.tone(1200, { dur: 0.3, vol: 0.04, glide: 800, type: 'triangle' }); } });

  // ---------- Animation ----------
  kit.loop((dt, t) => {
    for (const c of clouds) { c.x += c.v * dt; if (c.x > 1750) c.x = -200; c.el.setAttribute('transform', `translate(${c.x.toFixed(1)} ${c.y})`); }

    // Volcano
    if (erupt > 0) {
      erupt -= dt;
      if (Math.random() < dt * 9 && blobs.length < 30) {
        const el = s('circle', ink({ r: rand(8, 16), fill: pick([C.terra, C.ochre, '#e9925f']) }, 3), lavaG);
        blobs.push({ x: VX + rand(-20, 20), y: VY, vx: rand(-90, 90), vy: rand(-380, -260), el });
      }
      if (Math.random() < dt * 5) puff(VX + rand(-30, 30), VY - 10, true);
      if (erupt <= 0) { erupt = 0; craterGlow.setAttribute('opacity', 0); }
    }
    for (let i = blobs.length - 1; i >= 0; i--) {
      const b = blobs[i];
      b.vy += 420 * dt; b.x += b.vx * dt; b.y += b.vy * dt;
      if (b.y > VY + 120 && b.vy > 0) { b.el.remove(); blobs.splice(i, 1); continue; }
      b.el.setAttribute('cx', b.x.toFixed(1)); b.el.setAttribute('cy', b.y.toFixed(1));
    }
    for (let i = puffs.length - 1; i >= 0; i--) {
      const p = puffs[i];
      p.t += dt / 4;
      if (p.t >= 1) { p.el.remove(); puffs.splice(i, 1); continue; }
      p.y -= 40 * dt; p.x += p.vx * dt;
      p.el.setAttribute('cx', p.x.toFixed(1)); p.el.setAttribute('cy', p.y.toFixed(1));
      p.el.setAttribute('r', (p.r * (0.6 + p.t * 1.2)).toFixed(1));
      p.el.setAttribute('opacity', (0.8 * (1 - p.t)).toFixed(2));
    }

    // Falling leaves from the tree
    for (let i = falling.length - 1; i >= 0; i--) {
      const L = falling[i];
      if (L.y < L.gy) { L.y += L.vy * dt; L.x += Math.sin(t * 2 + L.ph) * 30 * dt; }
      else { L.t += dt; if (L.t > 3) { L.el.remove(); falling.splice(i, 1); continue; } L.el.setAttribute('opacity', (1 - L.t / 3).toFixed(2)); }
      L.el.setAttribute('transform', `translate(${L.x.toFixed(1)} ${L.y.toFixed(1)}) rotate(${(Math.sin(t * 2 + L.ph) * 40).toFixed(0)})`);
    }

    // Dinosaurs
    for (const D of herd) {
      if (!D.held) {
        if (D.walk) {
          D.x += D.dir * D.speed * dt;
          if (D.x < D.range[0]) { D.x = D.range[0]; D.dir = 1; }
          if (D.x > D.range[1]) { D.x = D.range[1]; D.dir = -1; }
          D.pause -= dt;
          if (D.pause <= 0) { D.walk = false; D.pause = rand(2, 4); D.inner.classList.remove('walking'); }
        } else {
          D.pause -= dt;
          if (D.pause <= 0 && D.act <= 0) { D.walk = true; D.pause = rand(5, 9); if (Math.random() < 0.4) D.dir *= -1; D.inner.classList.add('walking'); }
        }
      }
      if (D.act > 0) D.act -= dt;
      const k = D.scale * (0.78 + ((D.y - GROUND) / (GMAX - GROUND)) * 0.32);
      const bob = D.walk && !D.held ? Math.abs(Math.sin(t * 4.5 + D.x * 0.01)) * -3 : 0;
      const lift = D.held ? -18 : 0;
      D.g.setAttribute('transform', `translate(${D.x.toFixed(1)} ${(D.y + bob + lift).toFixed(1)}) scale(${(k * D.dir).toFixed(3)} ${k.toFixed(3)})`);
    }
    // Long-neck eating
    {
      const a = longneck.act > 0 ? Math.sin(Math.min(1, (2.6 - longneck.act) / 0.5) * Math.PI / 2) * (longneck.act < 0.5 ? longneck.act / 0.5 : 1) : 0;
      const chew = longneck.act > 0 ? Math.sin(t * 14) * 4 : 0;
      longneck.parts.neck.setAttribute('transform', `rotate(${(a * 14).toFixed(2)} 70 -120)`);
      longneck.parts.jaw.setAttribute('d', `M180 -322 Q196 ${(-316 + chew).toFixed(1)} 208 -326`);
    }
    // Triceratops nod
    {
      const n = trike.act > 0 ? Math.sin((2 - trike.act) * Math.PI * 2.5) * 12 * Math.min(1, trike.act) : 0;
      trike.parts.head.setAttribute('transform', `rotate(${n.toFixed(2)} 100 -90)`);
    }
    // Keep closer dinosaurs in front
    if (Math.floor(t * 4) !== Math.floor((t - dt) * 4)) {
      [...herd].sort((a, b) => a.y - b.y).forEach((D) => herdG.appendChild(D.g));
    }

    // Pterosaur loop
    ptero.a += dt * 0.32;
    let dy = 0;
    if (ptero.swoop > 0) { ptero.swoop -= dt / 1.6; dy = Math.sin((1 - ptero.swoop) * Math.PI) * 220; }
    const px = 820 + Math.cos(ptero.a) * 480, py = 190 + Math.sin(ptero.a * 2) * 50 + dy;
    const dir = -Math.sin(ptero.a) >= 0 ? 1 : -1;
    const flap = ptero.swoop > 0 ? 0.35 : 0.4 + 0.6 * Math.abs(Math.sin(t * 3.2));
    ptero.g.setAttribute('transform', `translate(${px.toFixed(1)} ${py.toFixed(1)}) scale(${dir} 1)`);
    ptero.wl.setAttribute('transform', `scale(1 ${flap.toFixed(3)})`);
    ptero.wr.setAttribute('transform', `scale(1 ${flap.toFixed(3)})`);
  });
}

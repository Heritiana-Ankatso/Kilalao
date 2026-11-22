// Busy Book: six calm picture pages that come alive when touched. Round
// buttons turn the page; stickers from the strip below can be dragged onto any
// page and stay there.
import { s, C, makeStage, pt, drag, rand, pick, clamp, lerp, replay } from '../lib.js';

const PX = 180, PY = 60, PW = 1240, PH = 620, SPINE = 800;
const PENTA = [523, 587, 659, 784, 880, 1046, 1175, 1318];

export default function book(root, kit) {
  const { sfx, audio } = kit;
  const svg = makeStage(root, '#c8b18f');
  const INK = C.ink;
  const ink = (o, w = 4) => ({ stroke: INK, 'stroke-width': w, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', ...o });
  const calm = kit.calm;

  function grad(id, stops, x2 = 0, y2 = 1) {
    const g = s('linearGradient', { id, x1: 0, y1: 0, x2, y2 }, svg.defs);
    stops.forEach(([o, c]) => s('stop', { offset: o, 'stop-color': c }, g));
  }
  function rgrad(id, stops) {
    const g = s('radialGradient', { id }, svg.defs);
    stops.forEach(([o, c, op = 1]) => s('stop', { offset: o, 'stop-color': c, 'stop-opacity': op }, g));
  }
  grad('bk-night', [[0, '#2f3a4f'], [1, '#5d5070']]);
  grad('bk-diwali', [[0, '#3f3450'], [1, '#6a4c58']]);
  grad('bk-spring', [[0, '#c4dcd8'], [1, '#eef0dc']]);
  grad('bk-winter', [[0, '#aebdcb'], [1, '#e6e8e6']]);
  grad('bk-autumn', [[0, '#e6c99c'], [1, '#f3e4c6']]);
  grad('bk-dusk', [[0, '#5f5476'], [0.6, '#b98a8c'], [1, '#e2b18f']]);
  grad('bk-spine', [[0, 'rgba(74,63,53,0)'], [0.45, 'rgba(74,63,53,.22)'], [0.5, 'rgba(74,63,53,.32)'], [0.55, 'rgba(74,63,53,.22)'], [1, 'rgba(74,63,53,0)']], 1, 0);
  rgrad('bk-ff', [[0, '#fff2b0', 1], [0.35, '#f3dc7a', 0.6], [1, '#f3dc7a', 0]]);
  rgrad('bk-warm', [[0, '#ffd98a', 0.9], [1, '#ffd98a', 0]]);
  const clip = s('clipPath', { id: 'bk-clip' }, svg.defs);
  s('rect', { x: PX, y: PY, width: PW, height: PH, rx: 18 }, clip);

  // ---------- The book itself ----------
  s('rect', { x: 140, y: 30, width: 1320, height: 690, rx: 34, fill: '#7f5a45', stroke: INK, 'stroke-width': 4 }, svg);
  s('rect', { x: 160, y: 44, width: 1280, height: 660, rx: 24, fill: '#efe3cc', stroke: INK, 'stroke-width': 3 }, svg);
  for (let i = 1; i <= 3; i++) {
    s('path', { d: `M${PX - 4 - i * 3} ${PY + PH + i * 4} H${PX + PW + 4 + i * 3}`, stroke: '#d8c9ad', 'stroke-width': 3 }, svg);
  }
  const pagesG = s('g', { 'clip-path': 'url(#bk-clip)' }, svg);
  const flipG = s('g', { 'pointer-events': 'none' }, svg);
  s('rect', { x: SPINE - 50, y: PY, width: 100, height: PH, fill: 'url(#bk-spine)', 'pointer-events': 'none' }, svg);
  s('rect', { x: PX, y: PY, width: PW, height: PH, rx: 18, fill: 'none', stroke: INK, 'stroke-width': 4, 'pointer-events': 'none' }, svg);

  const pages = [];
  function page(bgFill) {
    const g = s('g', null, pagesG);
    const bg = s('rect', { x: PX, y: PY, width: PW, height: PH, fill: bgFill }, g);
    const scene = s('g', null, g);
    const stickers = s('g', null, g);
    const p = { g, bg, scene, stickers, tick: null };
    g.style.transition = 'opacity .35s ease';
    pages.push(p);
    return p;
  }
  const tapOn = (el, f) => el.addEventListener('pointerdown', (e) => { if (e.button > 0) return; e.preventDefault(); f(pt(svg, e), e); });

  // =====================================================================
  // Page 1: lantern festival at night
  // =====================================================================
  {
    const P = page('url(#bk-night)');
    const g = P.scene;
    for (let i = 0; i < 34; i++) {
      s('circle', { cx: rand(PX + 20, PX + PW - 20), cy: rand(PY + 10, 330), r: rand(1.2, 3.2), fill: C.white, style: `animation:twinkle ${rand(2.5, 5)}s ease-in-out ${rand(0, 3)}s infinite` }, g);
    }
    s('circle', { cx: 1310, cy: 140, r: 90, fill: '#f1e3bd', opacity: 0.18, filter: 'url(#glow)' }, g);
    s('circle', { cx: 1310, cy: 140, r: 46, fill: '#f1e3bd', stroke: INK, 'stroke-width': 3 }, g);
    // Rooftops with gently upturned eaves
    const roofs = s('g', { fill: '#3a3346' }, g);
    s('rect', { x: PX, y: 600, width: PW, height: 90 }, roofs);
    [[260, 560, 220], [520, 520, 260], [1040, 540, 240], [1280, 570, 200]].forEach(([x, y, w]) => {
      s('path', { d: `M${x - w / 2 - 20} ${y} q20 6 40 -8 L${x - w / 2 + 40} ${y - 50} H${x + w / 2 - 40} L${x + w / 2 - 20} ${y - 2} q20 14 40 8 L${x + w / 2 - 10} ${y + 16} V700 H${x - w / 2 + 10} V${y + 16} Z` }, roofs);
      for (let k = 0; k < 2; k++) s('rect', { x: x - 50 + k * 70, y: y + 40, width: 30, height: 34, rx: 4, fill: '#d8a650', opacity: 0.55 }, roofs);
    });
    // String and lanterns
    const P0 = [PX, 120], P1 = [800, 330], P2 = [PX + PW, 120];
    const bz = (t) => [(1 - t) ** 2 * P0[0] + 2 * (1 - t) * t * P1[0] + t * t * P2[0], (1 - t) ** 2 * P0[1] + 2 * (1 - t) * t * P1[1] + t * t * P2[1]];
    s('path', { d: `M${P0} Q${P1} ${P2}`, fill: 'none', stroke: '#2a2430', 'stroke-width': 3 }, g);
    const lanterns = [0.12, 0.28, 0.44, 0.6, 0.76].map((t, i) => {
      const [x, y] = bz(t);
      const col = [C.terra, C.ochre, '#c96a5a', C.rose, C.terra, C.ochre][i];
      const L = { x, y, home: [x, y], state: 0, vy: 0, ph: rand(0, 6), col };
      L.g = s('g', { class: 'tap' }, g);
      L.cord = s('line', { x1: 0, y1: 0, x2: 0, y2: 22, stroke: '#2a2430', 'stroke-width': 3 }, L.g);
      const inner = s('g', null, L.g);
      L.inner = inner;
      L.glow = s('circle', { cx: 0, cy: 60, r: 70, fill: 'url(#bk-warm)', opacity: 0 }, inner);
      s('rect', ink({ x: -16, y: 20, width: 32, height: 10, rx: 3, fill: '#5a4a40' }, 3), inner);
      L.body = s('ellipse', ink({ cx: 0, cy: 60, rx: 38, ry: 32, fill: col }, 3), inner);
      L.body.style.filter = 'brightness(.62)';
      L.body.style.transition = 'filter .6s';
      for (const k of [-18, 0, 18]) s('path', { d: `M${k} 30 Q${k * 1.7} 60 ${k} 90`, fill: 'none', stroke: INK, 'stroke-width': 2, opacity: 0.35 }, inner);
      s('rect', ink({ x: -14, y: 88, width: 28, height: 9, rx: 3, fill: '#5a4a40' }, 3), inner);
      s('path', { d: 'M0 97 v24 M-5 100 v18 M5 100 v18', stroke: col, 'stroke-width': 3, 'stroke-linecap': 'round' }, inner);
      tapOn(L.g, () => {
        if (L.state === 0) {
          L.state = 1; L.body.style.filter = 'none'; L.glow.setAttribute('opacity', 1);
          sfx.chime(PENTA[i], 0.6); replay(inner, 'wiggle');
        } else if (L.state === 1) {
          L.state = 2; L.vy = 0; L.cord.setAttribute('opacity', 0); sfx.whoosh(0.35); audio.tone(PENTA[i] / 2, { dur: 1.4, vol: 0.06, attack: 0.2 });
        }
      });
      return L;
    });
    // Paper dragon held up on poles
    const dragonG = s('g', { class: 'tap' }, g);
    const N = 9;
    const segs = [];
    for (let i = N - 1; i >= 0; i--) {
      const pole = s('line', { stroke: '#5a4a40', 'stroke-width': 6, 'stroke-linecap': 'round' }, dragonG);
      const sg = s('g', null, dragonG);
      if (i === 0) {
        s('path', ink({ d: 'M30 -30 Q-10 -56 -50 -34 Q-82 -20 -74 8 Q-60 36 -10 34 Q30 30 34 0 Z', fill: C.terra }, 4), sg);
        s('path', ink({ d: 'M-6 -44 l-6 -30 l18 22 M14 -40 l6 -28 l8 26', fill: C.ochre }, 3), sg);
        s('circle', ink({ cx: -30, cy: -12, r: 11, fill: C.white }, 3), sg);
        s('circle', { cx: -33, cy: -12, r: 5, fill: INK }, sg);
        s('path', { d: 'M-72 14 Q-50 22 -28 16', fill: 'none', stroke: INK, 'stroke-width': 3, 'stroke-linecap': 'round' }, sg);
        s('path', { d: 'M-70 2 q-30 -8 -40 -30 M-64 20 q-26 12 -44 40', fill: 'none', stroke: C.ochre, 'stroke-width': 4, 'stroke-linecap': 'round' }, sg);
      } else {
        const r = 36 - Math.max(0, i - 5) * 4;
        s('path', ink({ d: `M${-r} 0 Q${-r} ${-r * 1.1} 0 ${-r * 1.1} Q${r} ${-r * 1.1} ${r} 0 Q${r} ${r * 0.9} 0 ${r * 0.9} Q${-r} ${r * 0.9} ${-r} 0 Z`, fill: i % 2 ? C.ochre : C.terra }, 3), sg);
        s('path', { d: `M${-r * 0.6} ${-r * 0.2} q${r * 0.3} ${r * 0.4} ${r * 0.6} 0 q${r * 0.3} ${r * 0.4} ${r * 0.6} 0`, fill: 'none', stroke: INK, 'stroke-width': 2, opacity: 0.45 }, sg);
        s('path', { d: `M${-r * 0.5} ${-r} l${r * 0.25} ${-r * 0.4} l${r * 0.25} ${r * 0.4} l${r * 0.25} ${-r * 0.4} l${r * 0.25} ${r * 0.4}`, fill: 'none', stroke: C.rose, 'stroke-width': 3, 'stroke-linejoin': 'round' }, sg);
      }
      segs[i] = { g: sg, pole };
    }
    let dance = 0;
    tapOn(dragonG, () => {
      if (dance > 1.5) return;
      dance = 4.5;
      const t0 = audio.now() + 0.02;
      for (let b = 0; b < 16; b++) {
        if (b % 4 === 3) continue;
        audio.inst.drum({ at: t0 + b * 0.27, vol: b % 4 === 0 ? 0.32 : 0.18 });
      }
      [0, 8].forEach((b) => audio.noise({ at: t0 + b * 0.27, dur: 0.6, vol: 0.03, freq: 5000, type: 'highpass', attack: 0.02 }));
    });
    P.tick = (dt, t) => {
      dance = Math.max(0, dance - dt);
      const amp = 7 + Math.min(1, dance / 1.2) * 34;
      const w = 1.6 + Math.min(1, dance) * 3;
      for (let i = 0; i < N; i++) {
        const x = 430 + i * 62, y = 560 + Math.sin(t * w - i * 0.75) * amp;
        const rot = Math.cos(t * w - i * 0.75) * amp * 0.25;
        segs[i].g.setAttribute('transform', `translate(${x} ${y.toFixed(1)}) rotate(${rot.toFixed(1)})`);
        segs[i].pole.setAttribute('x1', x); segs[i].pole.setAttribute('y1', y + 20);
        segs[i].pole.setAttribute('x2', x); segs[i].pole.setAttribute('y2', 700);
      }
      for (const L of lanterns) {
        if (L.state === 2) {
          L.vy = Math.min(55, L.vy + 30 * dt);
          L.y -= L.vy * dt;
          L.x = L.home[0] + Math.sin(t * 0.8 + L.ph) * 18;
          if (L.y < -140) {
            L.state = 3;
            kit.after(3500, () => {
              L.state = 0; [L.x, L.y] = L.home; L.cord.setAttribute('opacity', 1);
              L.body.style.filter = 'brightness(.62)'; L.glow.setAttribute('opacity', 0);
              replay(L.inner, 'popin');
            });
          }
        }
        const sway = L.state < 2 ? Math.sin(t * 1.1 + L.ph) * 3 : Math.sin(t * 1.6 + L.ph) * 6;
        L.g.setAttribute('transform', `translate(${L.x.toFixed(1)} ${L.y.toFixed(1)}) rotate(${sway.toFixed(2)})`);
      }
    };
  }

  // =====================================================================
  // Page 2: festival of lights
  // =====================================================================
  {
    const P = page('url(#bk-diwali)');
    const g = P.scene;
    s('rect', { x: PX, y: 300, width: PW, height: 400, fill: '#7a5a50' }, g);
    s('rect', { x: PX, y: 300, width: PW, height: 10, fill: '#5e443d' }, g);
    // Marigold garland
    for (let k = 0; k < 2; k++) {
      const y0 = 70 + k * 6, sag = 70 - k * 20;
      for (let i = 0; i <= 40; i++) {
        const t = i / 40, x = PX + t * PW, y = y0 + Math.sin(t * Math.PI * 3) ** 2 * sag;
        s('circle', { cx: x, cy: y, r: 11 - k * 2, fill: (i + k) % 2 ? C.ochre : C.terra, stroke: INK, 'stroke-width': 2 }, g);
      }
    }
    // Window with a soft moon
    s('rect', ink({ x: 1120, y: 130, width: 200, height: 140, rx: 70, fill: '#2d2a3c' }, 4), g);
    s('circle', { cx: 1250, cy: 190, r: 22, fill: '#f1e3bd' }, g);
    // Rangoli
    const rg = s('g', { class: 'tap', transform: 'translate(800 445) scale(.8)' }, g);
    const rot = s('g', null, rg);
    s('ellipse', { cx: 0, cy: 0, rx: 190, ry: 190, fill: '#6a4c45', opacity: 0.6 }, rot);
    for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2; s('circle', { cx: Math.cos(a) * 168, cy: Math.sin(a) * 168, r: 9, fill: i % 2 ? C.white : C.ochre }, rot); }
    for (let i = 0; i < 8; i++) s('path', ink({ d: 'M0 -40 Q40 -100 0 -150 Q-40 -100 0 -40 Z', fill: C.terra, transform: `rotate(${i * 45})` }, 3), rot);
    for (let i = 0; i < 8; i++) s('path', ink({ d: 'M0 -40 Q24 -80 0 -112 Q-24 -80 0 -40 Z', fill: C.ochre, transform: `rotate(${i * 45 + 22.5})` }, 3), rot);
    s('circle', ink({ cx: 0, cy: 0, r: 52, fill: C.teal }, 3), rot);
    for (let i = 0; i < 8; i++) s('path', { d: 'M0 -8 Q10 -26 0 -42 Q-10 -26 0 -8 Z', fill: C.rose, transform: `rotate(${i * 45})` }, rot);
    s('circle', ink({ cx: 0, cy: 0, r: 12, fill: C.white }, 3), rot);
    let ang = 0, av = 0.05;
    tapOn(rg, () => {
      av = Math.min(3.2, av + 1.6);
      [0, 2, 4].forEach((k, j) => kit.after(j * 120, () => sfx.chime(PENTA[k + Math.floor(rand(0, 3))], 0.4)));
      audio.inst.shaker({ vol: 0.4 });
    });
    // Clay lamps
    const lamps = [];
    for (let i = 0; i < 8; i++) {
      const x = 250 + i * 157, y = 640;
      const lg = s('g', { class: 'tap', transform: `translate(${x} ${y})` }, g);
      const warm = s('ellipse', { cx: 0, cy: 6, rx: 110, ry: 40, fill: 'url(#bk-warm)', opacity: 0 }, lg);
      warm.style.transition = 'opacity .8s';
      s('rect', { x: -60, y: -90, width: 120, height: 130, fill: 'transparent' }, lg);
      const flame = s('g', { opacity: 0 }, lg);
      s('circle', { cx: 18, cy: -40, r: 46, fill: 'url(#bk-warm)' }, flame);
      const fl = s('g', { class: 'fbb flicker' }, flame);
      s('path', ink({ d: 'M18 -8 Q-2 -26 18 -64 Q38 -26 18 -8 Z', fill: '#f2bd5e' }, 3), fl);
      s('path', { d: 'M18 -14 Q8 -26 18 -44 Q28 -26 18 -14 Z', fill: '#fbe6ad' }, fl);
      const bowl = s('g', { class: 'fb' }, lg);
      s('path', ink({ d: 'M-52 -14 Q0 46 52 -14 Q34 -6 26 -16 Q0 -4 -26 -16 Q-34 -6 -52 -14 Z', fill: '#b5694f' }, 4), bowl);
      s('path', { d: 'M-30 6 q30 16 60 0', fill: 'none', stroke: C.ochre, 'stroke-width': 4, 'stroke-dasharray': '2 10', 'stroke-linecap': 'round' }, bowl);
      s('line', { x1: 14, y1: -10, x2: 20, y2: -22, stroke: INK, 'stroke-width': 3, 'stroke-linecap': 'round' }, bowl);
      const L = { lit: false };
      tapOn(lg, () => {
        if (!L.lit) { L.lit = true; flame.setAttribute('opacity', 1); warm.style.opacity = 1; replay(fl, 'popin'); }
        else replay(bowl, 'wiggle');
        sfx.chime(PENTA[i], 0.55); audio.tone(PENTA[i] * 1.5, { dur: 1, vol: 0.03, at: audio.now() + 0.08 });
      });
      lamps.push(L);
    }
    P.tick = (dt) => {
      av = Math.max(0.05, av * Math.pow(0.55, dt));
      ang += av * dt * 57.3;
      rot.setAttribute('transform', `rotate(${(ang % 360).toFixed(2)})`);
    };
  }

  // =====================================================================
  // Page 3: spring garden
  // =====================================================================
  {
    const P = page('url(#bk-spring)');
    const g = P.scene;
    const sunG = s('g', { transform: 'translate(1290 150)' }, g);
    const rays = s('g', { class: 'fb spinSlow' }, sunG);
    for (let i = 0; i < 12; i++) s('path', { d: 'M0 -62 L8 -84 L-8 -84 Z', fill: C.ochre, opacity: 0.7, transform: `rotate(${i * 30})` }, rays);
    s('circle', ink({ cx: 0, cy: 0, r: 50, fill: '#efc46e' }, 3), sunG);
    const clouds = [0, 1].map((k) => {
      const c = s('g', null, g);
      s('path', ink({ d: 'M0 30 q-6 -34 30 -32 q14 -30 50 -14 q34 -14 44 18 q28 4 20 28 Z', fill: C.white }, 3), c);
      return { el: c, x: 300 + k * 520, y: 110 + k * 60, v: 8 + k * 5 };
    });
    s('path', { d: `M${PX} 470 Q 420 400 700 450 T 1200 430 T ${PX + PW} 440 V700 H${PX} Z`, fill: C.sage }, g);
    const ground = s('path', { d: `M${PX} 510 Q 500 470 900 500 T ${PX + PW} 490 V700 H${PX} Z`, fill: C.leaf, class: 'tap' }, g);
    for (let i = 0; i < 40; i++) {
      const x = rand(PX + 20, PX + PW - 20), y = rand(540, 670);
      s('path', { d: `M${x} ${y} l-4 -12 M${x} ${y} l4 -14`, stroke: C.moss, 'stroke-width': 3, 'stroke-linecap': 'round', 'pointer-events': 'none' }, g);
    }
    const flowersG = s('g', null, g);
    const flowers = [];
    const petalCols = [C.rose, C.ochre, C.white, C.plum, C.terra, '#e7c3cf', '#b9c9e4'];
    function flower(x, y, quiet) {
      const k = 0.65 + clamp((y - 480) / 200, 0, 1) * 0.55;
      const fg = s('g', { transform: `translate(${x} ${y}) scale(${k.toFixed(2)})` }, flowersG);
      const inner = s('g', { class: 'fbb grow' }, fg);
      const h = rand(70, 110);
      s('path', { d: `M0 0 Q${rand(-12, 12)} ${-h / 2} 0 ${-h}`, stroke: C.moss, 'stroke-width': 6, fill: 'none', 'stroke-linecap': 'round' }, inner);
      s('path', ink({ d: `M0 ${-h * 0.35} q22 -20 36 -6 q-18 14 -36 6z`, fill: C.leaf }, 3), inner);
      const col = pick(petalCols);
      const n = pick([5, 6, 8]);
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        s('ellipse', ink({ cx: Math.cos(a) * 18, cy: -h + Math.sin(a) * 18, rx: 15, ry: 11, fill: col, transform: `rotate(${(a * 180) / Math.PI} ${Math.cos(a) * 18} ${-h + Math.sin(a) * 18})` }, 3), inner);
      }
      s('circle', ink({ cx: 0, cy: -h, r: 11, fill: col === C.ochre ? C.cocoa : C.ochre }, 3), inner);
      const f = { x, y: y - h * k, el: fg };
      flowers.push(f);
      if (flowers.length > 28) { const o = flowers.shift(); o.el.remove(); }
      if (!quiet) { sfx.pop(1.3); audio.inst.kalimba(pick(PENTA) / 2, { vol: 0.2 }); }
    }
    [[420, 590], [760, 620], [1120, 580]].forEach(([x, y]) => flower(x, y, true));
    tapOn(ground, (p) => { if (p.y > 470) flower(p.x, p.y); });
    // Butterflies
    const flies = [C.terra, C.blue, C.ochre].map((col, i) => {
      const B = { x: 400 + i * 350, y: 220 + i * 40, tx: 0, ty: 0, mode: 'drift', rest: 0, ph: rand(0, 6), dir: 1 };
      B.tx = B.x; B.ty = B.y;
      B.g = s('g', { class: 'tap' }, g);
      s('circle', { cx: 0, cy: 0, r: 56, fill: 'transparent' }, B.g);
      B.wl = s('g', null, B.g); B.wr = s('g', null, B.g);
      for (const [w, sx] of [[B.wl, -1], [B.wr, 1]]) {
        s('path', ink({ d: `M0 -4 Q${sx * 50} -54 ${sx * 44} -6 Q${sx * 30} 6 0 0 Z`, fill: col }, 3), w);
        s('path', ink({ d: `M0 2 Q${sx * 40} 10 ${sx * 30} 36 Q${sx * 10} 34 0 4 Z`, fill: col === C.ochre ? C.rose : C.ochre }, 3), w);
        s('circle', { cx: sx * 28, cy: -22, r: 6, fill: C.white, opacity: 0.7 }, w);
      }
      s('ellipse', ink({ cx: 0, cy: 4, rx: 6, ry: 22, fill: C.cocoa }, 3), B.g);
      s('path', { d: 'M-2 -16 q-8 -16 -16 -20 M2 -16 q8 -16 16 -20', stroke: INK, 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }, B.g);
      tapOn(B.g, () => {
        const f = flowers.length ? pick(flowers) : null;
        B.mode = 'go'; B.tx = f ? f.x : rand(300, 1300); B.ty = f ? f.y - 18 : rand(180, 400);
        sfx.squeak(1.3);
      });
      return B;
    });
    P.tick = (dt, t) => {
      for (const c of clouds) { c.x += c.v * dt; if (c.x > PX + PW + 40) c.x = PX - 180; c.el.setAttribute('transform', `translate(${c.x.toFixed(1)} ${c.y})`); }
      for (const B of flies) {
        if (B.mode === 'drift' && Math.hypot(B.tx - B.x, B.ty - B.y) < 20) { B.tx = clamp(B.x + rand(-260, 260), PX + 80, PX + PW - 80); B.ty = clamp(B.y + rand(-140, 140), 150, 520); }
        const sp = B.mode === 'go' ? 230 : B.mode === 'rest' ? 0 : 60;
        const dx = B.tx - B.x, dy = B.ty - B.y, d = Math.hypot(dx, dy);
        if (d > 1 && sp) { const m = Math.min(d, sp * dt); B.x += (dx / d) * m; B.y += (dy / d) * m; if (Math.abs(dx) > 4) B.dir = dx > 0 ? 1 : -1; }
        if (B.mode === 'go' && d < 6) { B.mode = 'rest'; B.rest = rand(3.5, 6); sfx.chime(pick(PENTA) * 2, 0.25); }
        if (B.mode === 'rest') { B.rest -= dt; if (B.rest <= 0) { B.mode = 'drift'; B.tx = B.x; B.ty = B.y - 60; } }
        const flap = B.mode === 'rest' ? 0.55 + 0.4 * Math.abs(Math.sin(t * 1.4 + B.ph)) : 0.25 + 0.75 * Math.abs(Math.sin(t * 9 + B.ph));
        const bob = B.mode === 'rest' ? 0 : Math.sin(t * 3 + B.ph) * 6;
        B.g.setAttribute('transform', `translate(${B.x.toFixed(1)} ${(B.y + bob).toFixed(1)}) rotate(${(B.dir * 10).toFixed(0)})`);
        B.wl.setAttribute('transform', `scale(${flap.toFixed(3)} 1)`);
        B.wr.setAttribute('transform', `scale(${flap.toFixed(3)} 1)`);
      }
    };
  }

  // =====================================================================
  // Page 4: winter
  // =====================================================================
  {
    const P = page('url(#bk-winter)');
    const g = P.scene;
    const sky = s('rect', { x: PX, y: PY, width: PW, height: 480, fill: 'transparent', class: 'tap' }, g);
    s('path', { d: `M${PX} 470 Q 400 380 650 440 T 1100 410 T ${PX + PW} 420 V700 H${PX} Z`, fill: '#dfe5ea' }, g);
    s('path', { d: `M${PX} 520 Q 500 480 900 510 T ${PX + PW} 500 V700 H${PX} Z`, fill: '#f6f4ef' }, g);
    const flakesG = s('g', { 'pointer-events': 'none' }, g);
    const flakes = [];
    function flake(x, y, temp, fast) {
      const f = { x, y, r: rand(3, 7), vy: fast ? rand(120, 180) : rand(28, 60), ph: rand(0, 6), temp, fast };
      f.el = s('circle', { r: f.r, fill: '#fbfaf7', opacity: 0.95 }, flakesG);
      flakes.push(f);
    }
    for (let i = 0; i < (calm ? 30 : 55); i++) flake(rand(PX, PX + PW), rand(PY, 680), false);
    tapOn(sky, (p) => {
      if (flakes.length > 220) return;
      for (let i = 0; i < 26; i++) flake(p.x + rand(-260, 260), rand(PY - 60, PY + 40), true);
      audio.noise({ dur: 1.2, vol: 0.03, freq: 4000, type: 'highpass', attack: 0.3 });
      sfx.chime(pick(PENTA) * 2, 0.2);
    });
    // Pine trees with snow on their branches
    [[330, 600, 1], [500, 560, 0.7], [1220, 610, 1.1], [1360, 560, 0.75]].forEach(([x, y, k]) => {
      const tg = s('g', { class: 'tap', transform: `translate(${x} ${y}) scale(${k})` }, g);
      const inner = s('g', { class: 'fbb' }, tg);
      s('rect', ink({ x: -12, y: -30, width: 24, height: 40, fill: C.cocoa }, 3), inner);
      [[0, 130], [-70, 104], [-130, 78]].forEach(([oy, w]) => {
        s('path', ink({ d: `M0 ${oy - 160} L${w / 2 + 10} ${oy - 20} H${-w / 2 - 10} Z`, fill: '#5f7d66' }, 3), inner);
        s('path', { d: `M0 ${oy - 160} L${w / 4} ${oy - 100} q-12 8 -${w / 4} 0 q-12 8 -${w / 4} 0 Z`, fill: '#fbfaf7' }, inner);
      });
      tapOn(tg, () => {
        replay(inner, 'wiggle');
        sfx.whoosh(0.3); audio.noise({ dur: 0.5, vol: 0.06, freq: 900, type: 'lowpass' });
        for (let i = 0; i < 16; i++) flake(x + rand(-60, 60) * k, y - rand(40, 220) * k, true, true);
      });
    });
    // Snowman, one piece per tap
    const SX = 820, SY = 640;
    const sm = s('g', { class: 'tap' }, g);
    s('rect', { x: SX - 120, y: SY - 330, width: 240, height: 360, fill: 'transparent' }, sm);
    s('ellipse', { cx: SX, cy: SY + 8, rx: 100, ry: 18, fill: '#e3e7eb' }, sm);
    const ghost = s('circle', { cx: SX, cy: SY - 70, r: 70, fill: 'none', stroke: INK, 'stroke-width': 3, 'stroke-dasharray': '6 12', opacity: 0.25 }, sm);
    const piecesG = s('g', null, sm);
    const PIECES = [
      (p) => s('circle', ink({ cx: SX, cy: SY - 70, r: 72, fill: '#fbfaf7' }, 4), p),
      (p) => s('circle', ink({ cx: SX, cy: SY - 178, r: 54, fill: '#fbfaf7' }, 4), p),
      (p) => s('circle', ink({ cx: SX, cy: SY - 260, r: 40, fill: '#fbfaf7' }, 4), p),
      (p) => {
        s('circle', { cx: SX - 14, cy: SY - 268, r: 5, fill: INK }, p); s('circle', { cx: SX + 14, cy: SY - 268, r: 5, fill: INK }, p);
        s('path', ink({ d: `M${SX} ${SY - 258} l34 8 l-34 6 z`, fill: '#e2955f' }, 3), p);
        for (let i = 0; i < 5; i++) s('circle', { cx: SX - 16 + i * 8, cy: SY - 240 + Math.sin((i / 4) * Math.PI) * 5, r: 3, fill: INK }, p);
      },
      (p) => {
        s('path', ink({ d: `M${SX - 46} ${SY - 228} q46 22 92 0 l2 16 q-48 22 -96 0 z`, fill: C.terra }, 3), p);
        s('path', ink({ d: `M${SX + 22} ${SY - 214} l14 56 l-22 4 l-4 -54 z`, fill: C.terra }, 3), p);
      },
      (p) => {
        s('path', { d: `M${SX - 50} ${SY - 186} l-70 -40 m30 18 l-10 -26 M${SX + 50} ${SY - 186} l70 -44 m-26 16 l20 -18`, stroke: C.cocoa, 'stroke-width': 6, fill: 'none', 'stroke-linecap': 'round' }, p);
        for (let i = 0; i < 3; i++) s('circle', { cx: SX, cy: SY - 200 + i * 24, r: 6, fill: INK }, p);
      },
      (p) => {
        s('rect', ink({ x: SX - 52, y: SY - 300, width: 104, height: 12, rx: 6, fill: '#5a4a5e' }, 3), p);
        s('path', ink({ d: `M${SX - 34} ${SY - 296} Q${SX - 36} ${SY - 344} ${SX} ${SY - 346} Q${SX + 36} ${SY - 344} ${SX + 34} ${SY - 296} Z`, fill: '#5a4a5e' }, 3), p);
        s('circle', ink({ cx: SX, cy: SY - 350, r: 10, fill: C.ochre }, 3), p);
      },
    ];
    let built = 0, melting = false;
    tapOn(sm, () => {
      if (melting) return;
      if (built < PIECES.length) {
        const p = s('g', { class: 'fb popin' }, piecesG);
        PIECES[built](p);
        built++;
        ghost.setAttribute('opacity', 0);
        audio.noise({ dur: 0.18, vol: 0.18, freq: 500, type: 'lowpass' });
        audio.tone(200 + built * 40, { dur: 0.15, vol: 0.08 });
        if (built === PIECES.length) [0, 1, 2].forEach((k) => kit.after(150 + k * 160, () => sfx.chime(PENTA[k * 2 + 2], 0.45)));
      } else {
        melting = true;
        piecesG.classList.add('fbb');
        piecesG.style.transition = 'transform 1.4s ease-in, opacity 1.4s ease-in';
        piecesG.style.transform = 'scaleY(.2)';
        piecesG.style.opacity = '0';
        sfx.whoosh(0.4);
        kit.after(1500, () => {
          while (piecesG.firstChild) piecesG.firstChild.remove();
          piecesG.style.transition = 'none'; piecesG.style.transform = ''; piecesG.style.opacity = '';
          built = 0; melting = false; ghost.setAttribute('opacity', 0.25);
        });
      }
    });
    P.tick = (dt, t) => {
      for (let i = flakes.length - 1; i >= 0; i--) {
        const f = flakes[i];
        f.y += f.vy * dt;
        const x = f.x + Math.sin(t * 0.9 + f.ph) * (f.fast ? 6 : 22);
        if (f.y > 690) {
          if (f.temp) { f.el.remove(); flakes.splice(i, 1); continue; }
          f.y = PY - 10; f.x = rand(PX, PX + PW);
        }
        f.el.setAttribute('cx', x.toFixed(1)); f.el.setAttribute('cy', f.y.toFixed(1));
      }
    };
  }

  // =====================================================================
  // Page 5: autumn
  // =====================================================================
  {
    const P = page('url(#bk-autumn)');
    const g = P.scene;
    s('circle', { cx: 1000, cy: 330, r: 70, fill: '#f0c47a', opacity: 0.8 }, g);
    s('path', { d: `M${PX} 440 Q 450 360 760 420 T 1250 400 T ${PX + PW} 410 V700 H${PX} Z`, fill: '#cfa56c' }, g);
    s('path', { d: `M${PX} 540 Q 520 500 900 530 T ${PX + PW} 520 V700 H${PX} Z`, fill: '#b98d5a' }, g);
    const LEAFC = [C.terra, C.ochre, '#b8643f', '#c9934a', '#a8574a'];
    const leafD = 'M0 -16 Q14 -10 12 4 Q6 14 0 18 Q-6 14 -12 4 Q-14 -10 0 -16 Z';
    const fallG = s('g', { 'pointer-events': 'none' }, g);
    const leaves = [];
    function leaf(x, y, up) {
      const L = { x, y, vy: up ? rand(-260, -160) : rand(10, 40), vx: up ? rand(-70, 70) : 0, ph: rand(0, 6), rot: rand(0, 360), settled: false, gy: rand(560, 675) };
      L.el = s('g', null, fallG);
      s('path', ink({ d: leafD, fill: pick(LEAFC) }, 2.5), L.el);
      s('path', { d: 'M0 -12 V16', stroke: INK, 'stroke-width': 2, opacity: 0.5 }, L.el);
      leaves.push(L);
      const settled = leaves.filter((l) => l.settled);
      if (settled.length > 70) { const o = settled[0]; o.el.remove(); leaves.splice(leaves.indexOf(o), 1); }
    }
    // Trees
    [[400, 560, 1], [1230, 550, 0.9]].forEach(([x, y, k]) => {
      const tg = s('g', { class: 'tap', transform: `translate(${x} ${y}) scale(${k})` }, g);
      const inner = s('g', { class: 'fbb' }, tg);
      s('path', ink({ d: 'M-14 -170 Q-60 -220 -90 -230 M10 -150 Q50 -200 90 -210', fill: 'none' }, 18), inner);
      s('path', { d: 'M-14 -170 Q-60 -220 -90 -230 M10 -150 Q50 -200 90 -210', fill: 'none', stroke: C.cocoa, 'stroke-width': 10, 'stroke-linecap': 'round' }, inner);
      s('path', ink({ d: 'M-22 10 L-12 -180 L12 -180 L22 10 Z', fill: C.cocoa }, 4), inner);
      [[-90, -250, 70], [0, -300, 90], [90, -240, 72], [-40, -200, 66], [50, -190, 66], [-120, -190, 50], [120, -180, 50]].forEach(([cx, cy, r], i) => {
        s('circle', ink({ cx, cy, r, fill: LEAFC[i % LEAFC.length] }, 3.5), inner);
      });
      tapOn(tg, () => {
        replay(inner, 'wiggle');
        sfx.paper();
        for (let i = 0; i < (calm ? 4 : 7); i++) leaf(x + rand(-150, 150) * k, y + rand(-320, -170) * k);
      });
    });
    // Leaf pile with a hedgehog hiding behind it
    const HX = 800, HY = 650;
    const hog = s('g', { transform: `translate(${HX} ${HY})` }, g);
    const peek = s('g', null, hog);
    peek.style.transition = 'transform .7s cubic-bezier(.3,1.3,.5,1)';
    peek.style.transform = 'translateY(80px)';
    for (let i = 0; i < 13; i++) { const a = Math.PI * (1.05 + i * 0.07); s('path', { d: `M${Math.cos(a) * 40} ${-30 + Math.sin(a) * 40} l${Math.cos(a) * 34} ${Math.sin(a) * 34}`, stroke: '#6b5444', 'stroke-width': 10, 'stroke-linecap': 'round' }, peek); }
    s('ellipse', ink({ cx: 0, cy: -30, rx: 62, ry: 46, fill: '#8a6c55' }, 4), peek);
    s('path', ink({ d: 'M10 -60 Q60 -54 78 -26 Q58 -6 18 -10 Z', fill: '#e3c6a4' }, 3), peek);
    s('circle', { cx: 80, cy: -26, r: 8, fill: INK }, peek);
    s('circle', { cx: 42, cy: -40, r: 5, fill: INK }, peek);
    s('circle', { cx: 36, cy: -24, r: 6, fill: C.rose, opacity: 0.7 }, peek);
    const pile = s('g', { class: 'tap' }, g);
    s('path', ink({ d: `M${HX - 160} ${HY + 34} Q${HX - 140} ${HY - 40} ${HX} ${HY - 46} Q${HX + 140} ${HY - 40} ${HX + 160} ${HY + 34} Z`, fill: '#b8643f' }, 4), pile);
    for (let i = 0; i < 26; i++) {
      const a = rand(0, 1), x = HX + (a * 2 - 1) * 140, y = HY + 20 - Math.sin(a * Math.PI) * 50 + rand(0, 30);
      s('path', ink({ d: leafD, fill: pick(LEAFC), transform: `translate(${x.toFixed(0)} ${y.toFixed(0)}) rotate(${rand(0, 360).toFixed(0)}) scale(1.3)` }, 2.5), pile);
    }
    let hogT = null;
    tapOn(pile, () => {
      sfx.paper();
      for (let i = 0; i < (calm ? 3 : 5); i++) leaf(HX + rand(-100, 100), HY - 30, true);
      peek.style.transform = 'translateY(-38px)';
      kit.after(500, () => sfx.squeak(0.8));
      if (hogT) clearTimeout(hogT);
      hogT = kit.after(2800, () => { peek.style.transform = 'translateY(80px)'; hogT = null; });
    });
    // Squirrel that scampers between two spots
    const sq = { x: 1040, y: 660, spots: [1040, 560], at: 0, run: 0, dir: -1 };
    sq.g = s('g', { class: 'tap' }, g);
    const sqb = s('g', null, sq.g);
    s('rect', { x: -60, y: -110, width: 120, height: 120, fill: 'transparent' }, sqb);
    s('path', ink({ d: 'M22 -10 Q70 -20 64 -70 Q58 -110 26 -96 Q50 -70 30 -46 Q18 -30 10 -14 Z', fill: '#c9874f' }, 3.5), sqb);
    s('ellipse', ink({ cx: -4, cy: -24, rx: 28, ry: 24, fill: '#b8743f' }, 3.5), sqb);
    s('circle', ink({ cx: -28, cy: -52, r: 20, fill: '#b8743f' }, 3.5), sqb);
    s('path', ink({ d: 'M-32 -70 l2 -16 l10 12', fill: '#b8743f' }, 3), sqb);
    s('circle', { cx: -36, cy: -54, r: 4, fill: INK }, sqb);
    s('circle', { cx: -47, cy: -48, r: 3, fill: INK }, sqb);
    s('ellipse', { cx: -6, cy: -18, rx: 14, ry: 12, fill: '#e3c6a4' }, sqb);
    tapOn(sq.g, () => {
      if (sq.run) return;
      sq.at = 1 - sq.at; sq.run = 1; sq.from = sq.x;
      sq.dir = sq.spots[sq.at] < sq.x ? -1 : 1;
      for (let i = 0; i < 10; i++) audio.noise({ at: audio.now() + i * 0.15, dur: 0.02, vol: 0.06, freq: 3000, q: 4 });
    });
    P.tick = (dt, t) => {
      for (const L of leaves) {
        if (L.settled) continue;
        L.vy = Math.min(70, L.vy + 220 * dt);
        L.vx *= Math.pow(0.4, dt);
        L.y += L.vy * dt;
        L.x += L.vx * dt + Math.sin(t * 2.2 + L.ph) * 50 * dt;
        L.rot += Math.cos(t * 2.2 + L.ph) * 120 * dt;
        if (L.vy > 0 && L.y >= L.gy) { L.y = L.gy; L.settled = true; L.rot = rand(60, 120) * (Math.random() < 0.5 ? 1 : -1); }
        L.el.setAttribute('transform', `translate(${L.x.toFixed(1)} ${L.y.toFixed(1)}) rotate(${L.rot.toFixed(0)})`);
      }
      if (sq.run) {
        sq.run += dt;
        const k = Math.min(1, (sq.run - 1) / 1.6);
        sq.x = lerp(sq.from, sq.spots[sq.at], k);
        if (k >= 1) sq.run = 0;
      }
      const hop = sq.run ? -Math.abs(Math.sin(t * 11)) * 22 : 0;
      const tail = sq.run ? 0 : Math.sin(t * 1.5) * 3;
      sq.g.setAttribute('transform', `translate(${sq.x.toFixed(1)} ${(sq.y + hop).toFixed(1)}) scale(${-sq.dir === 1 ? 1 : -1} 1) rotate(${tail.toFixed(1)})`);
    };
  }

  // =====================================================================
  // Page 6: dusk pond
  // =====================================================================
  {
    const P = page('url(#bk-dusk)');
    const g = P.scene;
    const sky = s('rect', { x: PX, y: PY, width: PW, height: 330, fill: 'transparent', class: 'tap' }, g);
    s('circle', { cx: 980, cy: 360, r: 60, fill: '#f0c08e', opacity: 0.85 }, g);
    s('path', { d: `M${PX} 360 q60 -60 120 -20 q50 -70 120 -10 q70 -50 140 0 q60 -40 120 10 q80 -60 160 0 q60 -30 120 10 q70 -60 140 -10 q60 -40 120 10 q60 -30 100 0 q60 -50 120 -10 q50 -20 90 10 V420 H${PX} Z`, fill: '#4f4a5c' }, g);
    s('rect', { x: PX, y: 400, width: PW, height: 300, fill: '#5f6b55' }, g);
    const pond = s('ellipse', { cx: 800, cy: 555, rx: 560, ry: 120, fill: '#4f6f78', stroke: '#3f5560', 'stroke-width': 6, class: 'tap' }, g);
    s('ellipse', { cx: 860, cy: 520, rx: 220, ry: 20, fill: '#e2b18f', opacity: 0.25, 'pointer-events': 'none' }, g);
    const ripG = s('g', { 'pointer-events': 'none' }, g);
    const ripples = [];
    function ripple(x, y, big) {
      const r = { x, y, t: 0, big, el: s('ellipse', { cx: x, cy: y, rx: 4, ry: 1, fill: 'none', stroke: '#cfe0e0', 'stroke-width': 3 }, ripG) };
      ripples.push(r);
    }
    const pads = [[420, 545], [610, 610], [800, 515], [1010, 600], [1200, 540]].map(([x, y], i) => {
      const pg = s('g', { transform: `translate(${x} ${y})`, 'pointer-events': 'none' }, g);
      const inner = s('g', null, pg);
      s('path', ink({ d: 'M0 0 L60 -10 A72 26 0 1 1 52 12 Z', fill: C.moss }, 3), inner);
      if (i === 2) {
        for (let k = 0; k < 6; k++) s('ellipse', ink({ cx: -30 + Math.cos(k) * 10, cy: -14, rx: 9, ry: 18, fill: C.rose, transform: `rotate(${k * 30 - 75} -30 -6)` }, 2.5), inner);
        s('circle', { cx: -30, cy: -10, r: 6, fill: C.ochre }, inner);
      }
      return { x, y, inner, frog: null };
    });
    // Reeds and cattails
    [[240, 520], [270, 540], [1340, 500], [1370, 530], [1310, 560]].forEach(([x, y]) => {
      s('path', { d: `M${x} ${y + 120} Q${x - 6} ${y + 40} ${x + 4} ${y - 20}`, stroke: '#6f8f6a', 'stroke-width': 6, fill: 'none', 'stroke-linecap': 'round' }, g);
      s('rect', ink({ x: x - 6, y: y - 46, width: 16, height: 40, rx: 8, fill: C.cocoa }, 3), g);
    });
    const frogs = [0, 3].map((pi, i) => {
      const F = { pad: pi, x: pads[pi].x - 10, y: pads[pi].y - 14, jump: 0, dir: i ? -1 : 1 };
      pads[pi].frog = F;
      F.g = s('g', { class: 'tap' }, g);
      const b = s('g', null, F.g);
      F.body = b;
      s('rect', { x: -60, y: -80, width: 120, height: 90, fill: 'transparent' }, b);
      s('ellipse', ink({ cx: 0, cy: -22, rx: 46, ry: 32, fill: i ? '#8fae74' : '#9bb57f' }, 3.5), b);
      s('ellipse', ink({ cx: -30, cy: 2, rx: 18, ry: 8, fill: i ? '#8fae74' : '#9bb57f' }, 3), b);
      s('ellipse', ink({ cx: 30, cy: 2, rx: 18, ry: 8, fill: i ? '#8fae74' : '#9bb57f' }, 3), b);
      s('ellipse', { cx: 0, cy: -12, rx: 26, ry: 16, fill: '#dfe3b8' }, b);
      for (const ex of [-18, 18]) {
        s('circle', ink({ cx: ex, cy: -54, r: 13, fill: i ? '#8fae74' : '#9bb57f' }, 3), b);
        s('circle', { cx: ex + 2, cy: -55, r: 6, fill: INK }, b);
      }
      s('path', { d: 'M-16 -30 Q0 -20 16 -30', stroke: INK, 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }, b);
      tapOn(F.g, () => {
        if (F.jump) return;
        const free = pads.map((p, k) => k).filter((k) => !pads[k].frog);
        const to = pick(free);
        pads[F.pad].frog = null; pads[to].frog = F;
        F.from = [F.x, F.y]; F.to = [pads[to].x - 10, pads[to].y - 14]; F.pad = to; F.jump = 0.0001;
        F.dir = F.to[0] > F.x ? 1 : -1;
        sfx.boing(0.7);
      });
      return F;
    });
    const ffG = s('g', { 'pointer-events': 'none' }, g);
    const flies = Array.from({ length: calm ? 9 : 16 }, () => {
      const f = { x: rand(PX + 40, PX + PW - 40), y: rand(160, 520), vx: 0, vy: 0, ph: rand(0, 6), sp: rand(0.6, 1.4) };
      f.el = s('g', null, ffG);
      s('circle', { r: 16, fill: 'url(#bk-ff)' }, f.el);
      s('circle', { r: 3, fill: '#fff6c8' }, f.el);
      return f;
    });
    let attract = null, attractT = 0;
    tapOn(sky, (p) => { attract = p; attractT = 3; audio.inst.musicbox(pick(PENTA) / 2, { vol: 0.15 }); });
    tapOn(pond, (p) => { ripple(p.x, p.y, true); sfx.drip(); });
    P.tick = (dt, t) => {
      attractT = Math.max(0, attractT - dt);
      for (const f of flies) {
        let ax = Math.sin(t * 0.7 * f.sp + f.ph) * 30, ay = Math.cos(t * 0.9 * f.sp + f.ph * 1.3) * 24;
        if (attractT && attract) { ax += (attract.x - f.x) * 0.9; ay += (attract.y - f.y) * 0.9; }
        f.vx = lerp(f.vx, ax, dt * 1.5); f.vy = lerp(f.vy, ay, dt * 1.5);
        f.x = clamp(f.x + f.vx * dt, PX + 20, PX + PW - 20); f.y = clamp(f.y + f.vy * dt, PY + 40, 560);
        const o = 0.15 + 0.85 * Math.max(0, Math.sin(t * 1.3 * f.sp + f.ph)) ** 2;
        f.el.setAttribute('transform', `translate(${f.x.toFixed(1)} ${f.y.toFixed(1)})`);
        f.el.setAttribute('opacity', o.toFixed(2));
      }
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.t += dt / (r.big ? 1.6 : 1.1);
        if (r.t >= 1) { r.el.remove(); ripples.splice(i, 1); continue; }
        const rx = 6 + r.t * (r.big ? 90 : 60);
        r.el.setAttribute('rx', rx.toFixed(1)); r.el.setAttribute('ry', (rx * 0.28).toFixed(1));
        r.el.setAttribute('opacity', (1 - r.t).toFixed(2));
      }
      for (const F of frogs) {
        let yOff = 0, rot = 0;
        if (F.jump) {
          F.jump += dt / 0.9;
          const k = Math.min(1, F.jump);
          F.x = lerp(F.from[0], F.to[0], k); F.y = lerp(F.from[1], F.to[1], k);
          yOff = -Math.sin(Math.PI * k) * 170; rot = (k - 0.5) * 30 * F.dir;
          if (k >= 1) {
            F.jump = 0; ripple(F.x + 10, F.y + 16, false); sfx.splash(0.35);
            audio.tone(170, { type: 'triangle', dur: 0.1, vol: 0.12 }); audio.tone(150, { type: 'triangle', dur: 0.12, vol: 0.12, at: audio.now() + 0.16 });
            replay(pads[F.pad].inner, 'hop');
          }
        }
        const breathe = F.jump ? 1 : 1 + Math.sin(t * 2 + F.x) * 0.02;
        F.g.setAttribute('transform', `translate(${F.x.toFixed(1)} ${(F.y + yOff).toFixed(1)}) rotate(${rot.toFixed(1)}) scale(${F.dir * breathe} ${breathe})`);
      }
    };
  }

  // ---------- Page turning ----------
  let cur = 0, flipping = 0, swapped = false, next = 0;
  pages.forEach((p, i) => { p.g.style.opacity = i === 0 ? 1 : 0; p.g.style.pointerEvents = i === 0 ? 'auto' : 'none'; if (i) p.g.style.display = 'none'; });
  const flipPage = s('rect', { y: PY, width: PW / 2, height: PH, fill: C.paper, stroke: INK, 'stroke-width': 3 }, flipG);
  flipG.style.display = 'none';
  function show(i) {
    pages.forEach((p, k) => {
      if (k === i) { p.g.style.display = ''; p.g.style.pointerEvents = 'auto'; requestAnimationFrame(() => (p.g.style.opacity = 1)); }
      else { p.g.style.opacity = 0; p.g.style.pointerEvents = 'none'; const pp = p; kit.after(400, () => { if (pages[cur] !== pp) pp.g.style.display = 'none'; }); }
    });
  }
  function turn(d) {
    if (flipping) return;
    next = (cur + d + pages.length) % pages.length;
    flipping = 0.0001; swapped = false;
    flipPage.setAttribute('x', d > 0 ? SPINE : SPINE - PW / 2);
    flipG.style.display = '';
    sfx.paper();
  }
  function turnButton(x, d) {
    const b = s('g', { class: 'tap', transform: `translate(${x} 380)` }, svg);
    const inner = s('g', { class: 'fb' }, b);
    s('circle', ink({ cx: 0, cy: 0, r: 52, fill: C.cream }, 4), inner);
    s('path', ink({ d: d > 0 ? 'M-12 -24 L16 0 L-12 24' : 'M12 -24 L-16 0 L12 24', fill: 'none' }, 9), inner);
    tapOn(b, () => { replay(inner, 'wiggle'); turn(d); });
  }
  turnButton(70, -1);
  turnButton(1530, 1);

  // ---------- Stickers ----------
  const STICK = {
    star(g) { let d = ''; for (let i = 0; i < 10; i++) { const r = i % 2 ? 17 : 38, a = (i / 10) * Math.PI * 2 - Math.PI / 2; d += (i ? 'L' : 'M') + (Math.cos(a) * r).toFixed(1) + ' ' + (Math.sin(a) * r).toFixed(1); } s('path', ink({ d: d + 'Z', fill: C.ochre }, 3.5), g); },
    heart(g) { s('path', ink({ d: 'M0 32 C-46 2 -36 -36 -12 -32 C-4 -30 0 -22 0 -18 C0 -22 4 -30 12 -32 C36 -36 46 2 0 32 Z', fill: C.rose }, 3.5), g); },
    flower(g) { for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; s('circle', ink({ cx: Math.cos(a) * 20, cy: Math.sin(a) * 20, r: 15, fill: C.plum }, 3), g); } s('circle', ink({ cx: 0, cy: 0, r: 13, fill: C.ochre }, 3), g); },
    fish(g) { s('path', ink({ d: 'M22 0 L44 -20 L44 20 Z', fill: C.teal }, 3), g); s('ellipse', ink({ cx: -4, cy: 0, rx: 32, ry: 22, fill: C.teal }, 3.5), g); s('circle', { cx: -18, cy: -5, r: 5, fill: INK }, g); s('path', { d: 'M2 -14 q8 14 0 28', stroke: INK, 'stroke-width': 3, fill: 'none', opacity: 0.5 }, g); },
    bird(g) { s('circle', ink({ cx: 0, cy: 4, r: 30, fill: C.blue }, 3.5), g); s('path', ink({ d: 'M-6 6 q14 18 28 0 q-14 -6 -28 0z', fill: '#5f7f9a' }, 3), g); s('path', ink({ d: 'M-28 -2 l-16 6 l16 6 z', fill: C.ochre }, 3), g); s('circle', { cx: -14, cy: -6, r: 4.5, fill: INK }, g); },
    moon(g) { s('path', ink({ d: 'M10 -36 A38 38 0 1 0 10 36 A28 28 0 1 1 10 -36 Z', fill: '#efd99a' }, 3.5), g); },
    ladybug(g) { s('circle', ink({ cx: 0, cy: -28, r: 13, fill: INK }, 3), g); s('circle', ink({ cx: 0, cy: 4, r: 32, fill: C.terra }, 3.5), g); s('line', { x1: 0, y1: -28, x2: 0, y2: 36, stroke: INK, 'stroke-width': 3 }, g); [[-14, -6], [16, -4], [-16, 18], [14, 20]].forEach(([x, y]) => s('circle', { cx: x, cy: y, r: 6, fill: INK }, g)); },
    mushroom(g) { s('rect', ink({ x: -12, y: -4, width: 24, height: 38, rx: 10, fill: C.cream }, 3.5), g); s('path', ink({ d: 'M-40 2 Q-40 -38 0 -38 Q40 -38 40 2 Z', fill: C.terra }, 3.5), g); [[-18, -16], [8, -26], [20, -8]].forEach(([x, y]) => s('circle', { cx: x, cy: y, r: 6, fill: C.white }, g)); },
  };
  const KINDS = Object.keys(STICK);
  function makeSticker(parent, kind) {
    const o = s('g', null, parent);
    const inner = s('g', { class: 'fb' }, o);
    const art = s('g', null, inner);
    STICK[kind](art);
    const halo = art.cloneNode(true);
    halo.querySelectorAll('*').forEach((e) => { e.setAttribute('stroke', C.white); e.setAttribute('stroke-width', 16); e.setAttribute('fill', C.white); e.setAttribute('stroke-linejoin', 'round'); });
    halo.setAttribute('filter', 'drop-shadow(0 3px 3px rgba(74,63,53,.25))');
    inner.insertBefore(halo, art);
    return { o, inner };
  }
  // Strip
  s('rect', ink({ x: 300, y: 738, width: 1000, height: 136, rx: 40, fill: '#e3d2b4' }, 4), svg);
  s('rect', { x: 318, y: 752, width: 964, height: 108, rx: 30, fill: 'none', stroke: INK, 'stroke-width': 2, 'stroke-dasharray': '8 10', opacity: 0.25 }, svg);
  const dragLayer = s('g', { 'pointer-events': 'none' }, svg);
  const inPage = (p) => p.x > PX + 20 && p.x < PX + PW - 20 && p.y > PY + 20 && p.y < PY + PH - 20;
  function placed(kind, x, y) {
    const st = makeSticker(pages[cur].stickers, kind);
    st.o.classList.add('tap');
    let X = x, Y = y, off = null;
    st.o.setAttribute('transform', `translate(${X} ${Y})`);
    replay(st.inner, 'popin');
    drag(st.o, svg, {
      down(p) { off = { x: X - p.x, y: Y - p.y }; st.o.parentNode.appendChild(st.o); },
      move(p) { X = p.x + off.x; Y = p.y + off.y; st.o.setAttribute('transform', `translate(${X.toFixed(1)} ${Y.toFixed(1)}) scale(1.1)`); },
      up(p, e, moved) {
        if (!moved) return;
        if (!inPage({ x: X, y: Y })) { st.o.style.transition = 'opacity .3s'; st.o.style.opacity = 0; kit.after(320, () => st.o.remove()); sfx.whoosh(0.3); return; }
        st.o.setAttribute('transform', `translate(${X.toFixed(1)} ${Y.toFixed(1)})`);
        sfx.pop(1.1);
      },
      tap() { replay(st.inner, 'wiggle'); sfx.boing(1.4); },
    });
  }
  KINDS.forEach((kind, i) => {
    const x = 362 + i * 125, y = 806;
    const st = makeSticker(svg, kind);
    st.o.setAttribute('transform', `translate(${x} ${y}) scale(.9)`);
    st.o.classList.add('tap');
    let ghost = null;
    drag(st.o, svg, {
      move(p) {
        if (!ghost) { ghost = makeSticker(dragLayer, kind); sfx.paper(); }
        ghost.o.setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) scale(1.15)`);
      },
      up(p, e, moved) {
        if (!moved || !ghost) return;
        ghost.o.remove(); ghost = null;
        if (inPage(p) && !flipping) placed(kind, p.x, p.y);
      },
      tap() { replay(st.inner, 'wiggle'); sfx.pop(1.4); },
    });
  });

  kit.loop((dt, t) => {
    if (flipping) {
      flipping += dt / 0.6;
      const k = Math.min(1, flipping);
      if (!swapped && k >= 0.5) { swapped = true; cur = next; show(cur); }
      const sx = Math.cos(k * Math.PI);
      flipG.setAttribute('transform', `translate(${SPINE} 0) scale(${sx.toFixed(3)} 1) translate(${-SPINE} 0)`);
      flipPage.setAttribute('fill', k < 0.5 ? C.paper : '#e6d8be');
      if (k >= 1) { flipping = 0; flipG.style.display = 'none'; }
    }
    const p = pages[cur];
    if (p.tick) p.tick(dt, t);
  });
}

// Picture library for reading and phonics: simple drawn objects, each drawn
// around (0, 0) at about 200 x 160. Shared by the Phonics toy and Learn.
import { s, C } from '../lib.js';

const INK = C.ink;
const ink = (o, w = 4) => ({ stroke: INK, 'stroke-width': w, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', ...o });

export const PICTURES = {
  cat(g) {
    s('path', ink({ d: 'M-40 70 Q-60 10 -20 -6 L20 -6 Q60 10 40 70 Z', fill: C.ochre }), g);
    s('path', ink({ d: 'M40 60 Q90 50 76 0', fill: 'none' }, 9), g);
    s('path', { d: 'M40 60 Q90 50 76 0', fill: 'none', stroke: C.ochre, 'stroke-width': 4, 'stroke-linecap': 'round' }, g);
    s('path', ink({ d: 'M-46 -40 L-40 -90 L-10 -62 Z M46 -40 L40 -90 L10 -62 Z', fill: C.ochre }), g);
    s('ellipse', ink({ cx: 0, cy: -34, rx: 52, ry: 42, fill: C.ochre }), g);
    s('path', { d: 'M-38 -72 l-2 -10 M38 -72 l2 -10', stroke: C.rose, 'stroke-width': 6, 'stroke-linecap': 'round' }, g);
    s('circle', { cx: -18, cy: -40, r: 6, fill: INK }, g); s('circle', { cx: 18, cy: -40, r: 6, fill: INK }, g);
    s('path', ink({ d: 'M-6 -26 h12 l-6 7 z', fill: C.rose }, 3), g);
    s('path', { d: 'M0 -19 q-6 8 -12 4 M0 -19 q6 8 12 4 M-24 -24 h-30 M-24 -18 l-28 6 M24 -24 h30 M24 -18 l28 6', stroke: INK, 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }, g);
  },
  sun(g) {
    const r = s('g', { class: 'fb spinSlow' }, g);
    for (let i = 0; i < 12; i++) s('path', ink({ d: 'M-10 -64 L0 -92 L10 -64 Z', fill: C.ochre, transform: `rotate(${i * 30})` }, 3), r);
    s('circle', ink({ cx: 0, cy: 0, r: 58, fill: '#efc46e' }), g);
    s('circle', { cx: -20, cy: -8, r: 6, fill: INK }, g); s('circle', { cx: 20, cy: -8, r: 6, fill: INK }, g);
    s('circle', { cx: -32, cy: 12, r: 8, fill: C.terra, opacity: 0.5 }, g); s('circle', { cx: 32, cy: 12, r: 8, fill: C.terra, opacity: 0.5 }, g);
    s('path', ink({ d: 'M-18 16 Q0 32 18 16', fill: 'none' }, 4), g);
  },
  dog(g) {
    s('ellipse', ink({ cx: 0, cy: 0, rx: 58, ry: 54, fill: '#c79b6e' }), g);
    s('path', ink({ d: 'M-50 -30 Q-86 -20 -78 40 Q-56 40 -44 4 Z M50 -30 Q86 -20 78 40 Q56 40 44 4 Z', fill: C.cocoa }), g);
    s('ellipse', { cx: 22, cy: -16, rx: 18, ry: 16, fill: C.cream }, g);
    s('circle', { cx: -20, cy: -14, r: 6, fill: INK }, g); s('circle', { cx: 22, cy: -14, r: 6, fill: INK }, g);
    s('ellipse', ink({ cx: 0, cy: 22, rx: 30, ry: 22, fill: C.cream }, 3.5), g);
    s('ellipse', { cx: 0, cy: 12, rx: 11, ry: 8, fill: INK }, g);
    s('path', ink({ d: 'M0 20 v8 M-12 32 q12 10 24 0', fill: 'none' }, 3), g);
    s('path', ink({ d: 'M-6 38 q6 18 12 0', fill: C.rose }, 3), g);
  },
  hat(g) {
    s('ellipse', ink({ cx: 0, cy: 40, rx: 100, ry: 26, fill: '#d9b77e' }), g);
    s('path', ink({ d: 'M-56 40 Q-60 -50 0 -54 Q60 -50 56 40 Z', fill: '#e3c590' }), g);
    s('path', ink({ d: 'M-56 22 Q0 34 56 22 L56 40 Q0 52 -56 40 Z', fill: C.terra }, 3.5), g);
    for (let i = 0; i < 5; i++) s('circle', ink({ cx: 34 + Math.cos(i * 1.256) * 9, cy: 14 + Math.sin(i * 1.256) * 9, r: 6, fill: C.white }, 2.5), g);
    s('circle', { cx: 34, cy: 14, r: 4, fill: C.ochre }, g);
  },
  bus(g) {
    s('rect', ink({ x: -100, y: -60, width: 200, height: 110, rx: 22, fill: C.ochre }), g);
    for (let i = 0; i < 3; i++) s('rect', ink({ x: -84 + i * 50, y: -44, width: 40, height: 40, rx: 8, fill: '#cfe0e3' }, 3), g);
    s('rect', ink({ x: 66, y: -44, width: 22, height: 74, rx: 6, fill: '#cfe0e3' }, 3), g);
    s('rect', { x: -100, y: 8, width: 160, height: 10, fill: C.terra }, g);
    s('circle', ink({ cx: 92, cy: 30, r: 7, fill: '#f6e3a4' }, 3), g);
    for (const x of [-56, 56]) { s('circle', ink({ cx: x, cy: 52, r: 22, fill: '#5a4a40' }), g); s('circle', { cx: x, cy: 52, r: 8, fill: C.stone }, g); }
  },
  cup(g) {
    s('path', ink({ d: 'M48 -24 Q96 -24 90 14 Q84 46 44 40', fill: 'none' }, 18), g);
    s('path', { d: 'M48 -24 Q96 -24 90 14 Q84 46 44 40', fill: 'none', stroke: C.teal, 'stroke-width': 10, 'stroke-linecap': 'round' }, g);
    s('path', ink({ d: 'M-60 -44 H60 L50 54 Q48 70 30 70 H-30 Q-48 70 -50 54 Z', fill: C.teal }), g);
    s('ellipse', ink({ cx: 0, cy: -44, rx: 60, ry: 12, fill: '#8a6c58' }, 3.5), g);
    s('path', { d: 'M-30 4 q30 16 60 0', stroke: C.white, 'stroke-width': 6, fill: 'none', 'stroke-linecap': 'round', opacity: 0.6 }, g);
    const steam = s('g', { class: 'bob' }, g);
    s('path', { d: 'M-20 -64 q-12 -14 0 -28 q12 -14 0 -28 M16 -64 q-12 -14 0 -28 q12 -14 0 -28', stroke: C.stone, 'stroke-width': 5, fill: 'none', 'stroke-linecap': 'round', opacity: 0.7 }, steam);
  },
  pig(g) {
    s('path', ink({ d: 'M-56 -36 L-50 -84 L-18 -52 Z M56 -36 L50 -84 L18 -52 Z', fill: '#e3a9a0' }), g);
    s('ellipse', ink({ cx: 0, cy: 0, rx: 70, ry: 58, fill: C.rose }), g);
    s('circle', { cx: -24, cy: -14, r: 6, fill: INK }, g); s('circle', { cx: 24, cy: -14, r: 6, fill: INK }, g);
    s('ellipse', ink({ cx: 0, cy: 18, rx: 28, ry: 20, fill: '#e8b5ac' }, 3.5), g);
    s('ellipse', { cx: -9, cy: 18, rx: 5, ry: 7, fill: INK }, g); s('ellipse', { cx: 9, cy: 18, rx: 5, ry: 7, fill: INK }, g);
    s('path', ink({ d: 'M-14 44 q14 8 28 0', fill: 'none' }, 3), g);
  },
  bed(g) {
    s('rect', ink({ x: -100, y: -70, width: 26, height: 130, rx: 8, fill: C.wood }), g);
    s('rect', ink({ x: 74, y: -30, width: 26, height: 90, rx: 8, fill: C.wood }), g);
    s('rect', ink({ x: -80, y: -10, width: 160, height: 40, rx: 10, fill: C.white }), g);
    s('ellipse', ink({ cx: -46, cy: -20, rx: 30, ry: 16, fill: C.cream }, 3.5), g);
    s('path', ink({ d: 'M-22 -14 H80 V30 H-22 Q-34 8 -22 -14 Z', fill: C.blue }), g);
    s('path', { d: 'M0 -14 v44 M30 -14 v44 M60 -14 v44', stroke: '#5f7f9a', 'stroke-width': 3 }, g);
    s('rect', ink({ x: -90, y: 30, width: 180, height: 18, rx: 6, fill: C.woodD }), g);
  },
  fox(g) {
    s('path', ink({ d: 'M-70 -70 L-50 -10 L-20 -40 Z M70 -70 L50 -10 L20 -40 Z', fill: C.terra }), g);
    s('path', { d: 'M-60 -52 L-48 -22 L-34 -36 Z M60 -52 L48 -22 L34 -36 Z', fill: INK, opacity: 0.6 }, g);
    s('path', ink({ d: 'M-72 -20 Q-60 -54 0 -54 Q60 -54 72 -20 Q60 40 0 70 Q-60 40 -72 -20 Z', fill: C.terra }), g);
    s('path', ink({ d: 'M-72 -20 Q-40 0 -14 20 Q0 60 0 70 Q-60 40 -72 -20 Z M72 -20 Q40 0 14 20 Q0 60 0 70 Q60 40 72 -20 Z', fill: C.white }, 3), g);
    s('circle', { cx: -26, cy: -14, r: 6, fill: INK }, g); s('circle', { cx: 26, cy: -14, r: 6, fill: INK }, g);
    s('ellipse', { cx: 0, cy: 58, rx: 10, ry: 7, fill: INK }, g);
  },
};

// ---------- More words for reading (English and French) ----------
const more = {
  bat(g) {
    s('path', ink({ d: 'M-20 -10 Q-60 -50 -100 -20 Q-80 -10 -84 10 Q-60 0 -50 20 Q-36 6 -20 14 Z M20 -10 Q60 -50 100 -20 Q80 -10 84 10 Q60 0 50 20 Q36 6 20 14 Z', fill: C.plum }), g);
    s('ellipse', ink({ cx: 0, cy: 0, rx: 28, ry: 34, fill: '#7d6a86' }), g);
    s('path', ink({ d: 'M-18 -30 L-14 -52 L-4 -32 M18 -30 L14 -52 L4 -32', fill: '#7d6a86' }), g);
    s('circle', { cx: -9, cy: -6, r: 5, fill: INK }, g); s('circle', { cx: 9, cy: -6, r: 5, fill: INK }, g);
    s('path', ink({ d: 'M-8 10 q8 6 16 0', fill: 'none' }, 3), g);
  },
  mat(g) {
    // A rug seen from above, with fringes, so it reads as a mat.
    for (let k = -4; k <= 4; k++) s('path', ink({ d: `M-100 ${k * 12} h-16 M100 ${k * 12} h16`, fill: 'none' }, 3), g);
    s('rect', ink({ x: -100, y: -56, width: 200, height: 112, rx: 10, fill: C.terra }), g);
    s('rect', { x: -80, y: -38, width: 160, height: 76, rx: 6, fill: 'none', stroke: C.ochre, 'stroke-width': 8 }, g);
    s('path', ink({ d: 'M-30 0 L0 -22 L30 0 L0 22 Z', fill: C.cream }, 3), g);
  },
  log(g) {
    s('rect', ink({ x: -90, y: -30, width: 170, height: 60, rx: 30, fill: C.cocoa }), g);
    s('ellipse', ink({ cx: 80, cy: 0, rx: 22, ry: 30, fill: '#d2b48c' }), g);
    s('ellipse', { cx: 80, cy: 0, rx: 10, ry: 15, fill: 'none', stroke: C.cocoa, 'stroke-width': 3 }, g);
    s('path', { d: 'M-60 -10 h60 M-30 12 h70', stroke: '#5f4636', 'stroke-width': 3, 'stroke-linecap': 'round' }, g);
  },
  wig(g) {
    s('path', ink({ d: 'M-70 40 Q-90 -60 0 -70 Q90 -60 70 40 Q50 10 40 -20 Q0 -40 -40 -20 Q-50 10 -70 40 Z', fill: C.ochre }), g);
    for (const x of [-50, -20, 10, 40]) s('path', { d: `M${x} -50 q10 20 0 40`, stroke: '#b5862f', 'stroke-width': 4, fill: 'none' }, g);
  },
  bun(g) {
    s('path', ink({ d: 'M-80 20 Q-80 -50 0 -50 Q80 -50 80 20 Z', fill: '#d9a35f' }), g);
    s('rect', ink({ x: -84, y: 18, width: 168, height: 26, rx: 12, fill: '#c98d4c' }), g);
    for (const [x, y] of [[-30, -24], [10, -32], [40, -14], [-6, -8]]) s('ellipse', { cx: x, cy: y, rx: 5, ry: 3, fill: C.cream }, g);
  },
  box(g) {
    s('path', ink({ d: 'M-70 -20 L0 -50 L70 -20 L0 10 Z', fill: '#e1c28f' }), g);
    s('path', ink({ d: 'M-70 -20 L-70 50 L0 80 L0 10 Z', fill: C.wood }), g);
    s('path', ink({ d: 'M70 -20 L70 50 L0 80 L0 10 Z', fill: '#b98c5c' }), g);
  },
  bug(g) {
    s('circle', ink({ cx: 0, cy: -46, r: 20, fill: INK }), g);
    s('circle', ink({ cx: 0, cy: 6, r: 52, fill: C.terra }), g);
    s('line', { x1: 0, y1: -46, x2: 0, y2: 58, stroke: INK, 'stroke-width': 4 }, g);
    for (const [x, y] of [[-24, -10], [26, -6], [-22, 28], [24, 30]]) s('circle', { cx: x, cy: y, r: 9, fill: INK }, g);
    s('path', ink({ d: 'M-10 -62 q-10 -20 -24 -22 M10 -62 q10 -20 24 -22', fill: 'none' }, 3), g);
  },
  mug(g) {
    s('path', ink({ d: 'M50 -30 Q90 -30 86 6 Q82 36 48 32', fill: 'none' }, 16), g);
    s('path', { d: 'M50 -30 Q90 -30 86 6 Q82 36 48 32', fill: 'none', stroke: C.ochre, 'stroke-width': 9, 'stroke-linecap': 'round' }, g);
    s('rect', ink({ x: -56, y: -56, width: 110, height: 116, rx: 14, fill: C.ochre }), g);
    s('circle', { cx: 0, cy: 0, r: 16, fill: C.white, opacity: 0.7 }, g);
  },
  hen(g) {
    s('ellipse', ink({ cx: 0, cy: 10, rx: 70, ry: 50, fill: '#e9d6b4' }), g);
    s('path', ink({ d: 'M60 -10 L96 -40 L84 0 Z', fill: '#e9d6b4' }), g);
    s('circle', ink({ cx: -46, cy: -40, r: 28, fill: '#e9d6b4' }), g);
    s('path', ink({ d: 'M-56 -66 q6 -16 14 -2 q8 -14 14 2', fill: C.terra }, 3), g);
    s('path', ink({ d: 'M-74 -40 l-16 6 l16 6 z', fill: C.ochre }, 3), g);
    s('circle', { cx: -50, cy: -44, r: 4, fill: INK }, g);
    s('path', ink({ d: 'M-10 58 v20 M14 58 v20', fill: 'none', stroke: C.ochre }, 5), g);
  },
  pen(g) {
    s('path', ink({ d: 'M-90 40 L60 -50 L80 -24 L-70 66 Z', fill: C.blue }), g);
    s('path', ink({ d: 'M-90 40 L-70 66 L-104 74 Z', fill: C.cream }), g);
    s('path', { d: 'M-104 74 l8 -10', stroke: INK, 'stroke-width': 5, 'stroke-linecap': 'round' }, g);
  },
  ten(g) {
    s('text', { x: 0, y: -50, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': 70, 'font-weight': 800, fill: C.teal, 'font-family': 'ui-rounded, sans-serif', text: '10' }, g);
    for (let i = 0; i < 10; i++) s('circle', ink({ cx: -80 + (i % 5) * 40, cy: 20 + Math.floor(i / 5) * 36, r: 15, fill: C.terra }, 3), g);
  },
  map(g) {
    s('path', ink({ d: 'M-90 -50 L-30 -66 L30 -50 L90 -66 L90 54 L30 70 L-30 54 L-90 70 Z', fill: '#e8d9b4' }), g);
    s('path', { d: 'M-30 -66 V54 M30 -50 V70', stroke: INK, 'stroke-width': 3, opacity: 0.4 }, g);
    s('path', ink({ d: 'M-70 30 q30 -40 60 -10 t60 -30', fill: 'none', 'stroke-dasharray': '8 10', stroke: C.terra }, 4), g);
    s('path', ink({ d: 'M44 -28 l16 16 M60 -28 l-16 16', fill: 'none', stroke: C.terra }, 5), g);
  },
  cap(g) {
    s('path', ink({ d: 'M-70 10 Q-70 -60 0 -60 Q60 -60 64 10 Z', fill: C.teal }), g);
    s('path', ink({ d: 'M40 6 Q100 0 110 20 Q70 30 30 18 Z', fill: C.teal }), g);
    s('circle', ink({ cx: 0, cy: -60, r: 8, fill: C.ochre }, 3), g);
  },
  van(g) {
    s('path', ink({ d: 'M-100 40 V-40 Q-100 -56 -84 -56 H40 Q60 -56 70 -30 L100 10 V40 Z', fill: C.sage }), g);
    s('path', ink({ d: 'M44 -46 L64 -14 H44 Z', fill: '#cfe0e3' }, 3), g);
    s('rect', ink({ x: -80, y: -40, width: 50, height: 34, rx: 6, fill: '#cfe0e3' }, 3), g);
    for (const x of [-60, 60]) { s('circle', ink({ cx: x, cy: 44, r: 20, fill: '#5a4a40' }), g); s('circle', { cx: x, cy: 44, r: 7, fill: C.stone }, g); }
  },
  net(g) {
    s('line', ink({ x1: 40, y1: 30, x2: 100, y2: 80 }, 9), g);
    s('ellipse', ink({ cx: -10, cy: -10, rx: 70, ry: 56, fill: 'none' }, 5), g);
    for (let i = -2; i <= 2; i++) { s('line', { x1: -10 + i * 26, y1: -60, x2: -10 + i * 26, y2: 40, stroke: INK, 'stroke-width': 2, opacity: 0.5 }, g); s('line', { x1: -76, y1: -10 + i * 22, x2: 56, y2: -10 + i * 22, stroke: INK, 'stroke-width': 2, opacity: 0.5 }, g); }
  },
  jet(g) {
    s('path', ink({ d: 'M-100 0 Q-60 -20 60 -14 Q100 -10 110 0 Q100 10 60 14 Q-60 20 -100 0 Z', fill: C.white }), g);
    s('path', ink({ d: 'M-10 -12 L-50 -60 L-30 -60 L30 -12 Z M-10 12 L-50 60 L-30 60 L30 12 Z', fill: C.blue }), g);
    s('path', ink({ d: 'M-90 -4 L-104 -36 L-86 -36 L-70 -8 Z', fill: C.blue }), g);
  },
  // French words
  rat(g) {
    s('path', ink({ d: 'M70 20 Q120 30 110 -10', fill: 'none' }, 4), g);
    s('ellipse', ink({ cx: 10, cy: 10, rx: 70, ry: 40, fill: C.stone }), g);
    s('path', ink({ d: 'M-56 0 Q-90 10 -100 20 Q-80 30 -50 26 Z', fill: C.stone }), g);
    s('circle', ink({ cx: -40, cy: -26, r: 16, fill: '#c9c3bb' }), g);
    s('circle', { cx: -66, cy: 6, r: 4, fill: INK }, g); s('circle', { cx: -100, cy: 20, r: 5, fill: C.rose }, g);
  },
  sac(g) {
    s('path', ink({ d: 'M-30 -40 Q-30 -80 0 -80 Q30 -80 30 -40', fill: 'none' }, 6), g);
    s('path', ink({ d: 'M-70 -40 H70 L80 70 H-80 Z', fill: C.terra }), g);
    s('rect', ink({ x: -30, y: 0, width: 60, height: 36, rx: 6, fill: '#e59a80' }, 3), g);
  },
  bol(g) {
    s('path', ink({ d: 'M-90 -10 H90 Q86 60 0 64 Q-86 60 -90 -10 Z', fill: C.teal }), g);
    s('ellipse', ink({ cx: 0, cy: -10, rx: 90, ry: 16, fill: '#f3e3c4' }, 3), g);
    s('path', { d: 'M-40 30 q40 14 80 0', stroke: C.white, 'stroke-width': 5, fill: 'none', opacity: 0.6, 'stroke-linecap': 'round' }, g);
  },
  os(g) {
    s('path', ink({ d: 'M-60 -10 H60 A18 18 0 1 1 80 -26 A18 18 0 1 1 80 26 A18 18 0 1 1 60 10 H-60 A18 18 0 1 1 -80 26 A18 18 0 1 1 -80 -26 A18 18 0 1 1 -60 -10 Z', fill: C.white }), g);
  },
  lune(g) {
    s('path', ink({ d: 'M30 -78 A80 80 0 1 0 30 78 A96 96 0 0 1 30 -78 Z', fill: '#efd99a' }), g);
    s('circle', { cx: -40, cy: 30, r: 7, fill: '#d9bd6f' }, g); s('circle', { cx: -50, cy: -20, r: 5, fill: '#d9bd6f' }, g);
  },
  moto(g) {
    for (const x of [-70, 70]) { s('circle', ink({ cx: x, cy: 40, r: 30, fill: 'none' }, 7), g); s('circle', { cx: x, cy: 40, r: 6, fill: INK }, g); }
    s('path', ink({ d: 'M-70 40 L-20 -10 H40 L70 40 M40 -10 L60 -40 H80', fill: 'none' }, 7), g);
    s('rect', ink({ x: -30, y: -30, width: 60, height: 26, rx: 10, fill: C.terra }, 3), g);
  },
  velo(g) {
    for (const x of [-70, 70]) s('circle', ink({ cx: x, cy: 40, r: 34, fill: 'none' }, 5), g);
    s('path', ink({ d: 'M-70 40 L-20 -20 H40 L70 40 M-20 -20 L10 40 L40 -20 M40 -20 L50 -46 H70 M-30 -34 H-6', fill: 'none', stroke: C.blue }, 6), g);
  },
};
Object.assign(PICTURES, more);

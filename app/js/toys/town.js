// Town & Shops: drag people anywhere. Pick food from the grocery, cook it on
// the café stove, give it to someone (drop it on them), then tap them to eat.
// Leave food on the stove too long and a small fire starts; drag the hose
// from the fire truck to put it out. Tap the traffic light to stop the cars;
// cars also wait for anyone standing on the road. Sit someone on the swing.
import { s, C, makeStage, pt, rand, pick, clamp, replay } from '../lib.js';
import { person, SKINS, HAIRS, CLOTH } from '../people.js';

const INK = C.ink;
const o = (x) => ({ stroke: INK, 'stroke-width': 3, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', ...x });
const PS = 0.78; // people scale

const FOODS = {
  apple: (g) => { s('circle', o({ cx: 0, cy: 0, r: 17, fill: '#c9574a' }), g); s('path', o({ d: 'M0 -16 q2 -10 8 -12', fill: 'none' }), g); s('ellipse', o({ cx: 8, cy: -22, rx: 7, ry: 4, fill: C.leaf }), g); },
  banana: (g) => s('path', o({ d: 'M-22 -6 q22 30 46 -8 q-6 -4 -10 0 q-16 16 -32 2z', fill: '#e8c25c' }), g),
  carrot: (g) => { s('path', o({ d: 'M-6 -16 l12 0 l-6 34z', fill: '#dd8a4a' }), g); s('path', o({ d: 'M0 -16 l-8 -12 M0 -16 l0 -14 M0 -16 l8 -12', stroke: C.moss, 'stroke-width': 4, fill: 'none' }), g); },
  bread: (g) => { s('path', o({ d: 'M-26 8 q-4 -26 26 -26 q30 0 26 26 z', fill: '#d0a064' }), g); s('path', { d: 'M-12 -8 l6 -6 M0 -8 l6 -6 M12 -8 l6 -6', stroke: '#a2733c', 'stroke-width': 3 }, g); },
  fish: (g) => { s('path', o({ d: 'M-24 0 q20 -18 40 0 q-20 18 -40 0z', fill: '#9fb3c4' }), g); s('path', o({ d: 'M16 0 l12 -10 v20z', fill: '#9fb3c4' }), g); s('circle', { cx: -14, cy: -3, r: 2.5, fill: INK }, g); },
  egg: (g) => s('ellipse', o({ cx: 0, cy: 0, rx: 13, ry: 17, fill: '#f6efe2' }), g),
  cheese: (g) => { s('path', o({ d: 'M-20 10 l40 0 l0 -18 l-40 -8z', fill: '#e9c86a' }), g); s('circle', { cx: -6, cy: 2, r: 3, fill: '#c9a446' }, g); s('circle', { cx: 8, cy: -3, r: 2.5, fill: '#c9a446' }, g); },
  milk: (g) => { s('path', o({ d: 'M-12 -10 l12 -12 l12 12 v26 h-24z', fill: '#fbf7ef' }), g); s('rect', { x: -12, y: 0, width: 24, height: 10, fill: C.blue }, g); },
};

export default function town(root, kit) {
  const { sfx, audio } = kit;
  const svg = makeStage(root, '#cfe0e0');

  // ---------- Scenery ----------
  s('rect', { x: -800, y: -400, width: 3200, height: 960, fill: '#cfe0e0' }, svg);
  const clouds = [0, 1, 2].map((i) => {
    const g = s('g', { opacity: 0.9 }, svg);
    s('ellipse', { cx: 0, cy: 0, rx: 70, ry: 26, fill: '#f6f3ec' }, g); s('ellipse', { cx: 40, cy: -14, rx: 44, ry: 26, fill: '#f6f3ec' }, g);
    return { g, x: 200 + i * 550, y: 70 + i * 40, v: 6 + i * 3 };
  });
  s('rect', { x: -800, y: 560, width: 3200, height: 60, fill: '#d9cbb3' }, svg);
  s('rect', { x: -800, y: 620, width: 3200, height: 180, fill: '#8a8478' }, svg);
  for (let x = -40; x < 1640; x += 90) s('rect', { x, y: 706, width: 50, height: 8, rx: 4, fill: '#e6dccb' }, svg);
  for (let i = 0; i < 6; i++) s('rect', { x: 1232, y: 628 + i * 28, width: 80, height: 16, fill: '#efe7d8' }, svg);
  s('rect', { x: -800, y: 800, width: 3200, height: 500, fill: '#a9bd8a' }, svg);
  const back = s('g', null, svg);

  // Fire station
  s('rect', o({ x: 30, y: 300, width: 300, height: 260, fill: '#c97b63', filter: 'url(#wob)' }), back);
  s('rect', o({ x: 22, y: 280, width: 316, height: 30, fill: '#a5604d' }), back);
  s('rect', o({ x: 140, y: 214, width: 80, height: 70, fill: '#c97b63' }), back);
  s('circle', o({ cx: 180, cy: 248, r: 20, fill: C.ochre }), back);
  s('rect', o({ x: 55, y: 380, width: 250, height: 180, fill: '#4f4239' }), back);
  // Fire truck
  const truck = s('g', { class: 'tap' }, svg);
  const truckIn = s('g', { class: 'fbb' }, truck);
  s('rect', o({ x: 70, y: 460, width: 170, height: 70, rx: 10, fill: '#c0553f' }), truckIn);
  s('path', o({ d: 'M240 470 h40 l22 28 v32 h-62z', fill: '#c0553f' }), truckIn);
  s('rect', o({ x: 250, y: 478, width: 30, height: 22, rx: 4, fill: '#cfe0e0' }), truckIn);
  s('rect', o({ x: 80, y: 446, width: 150, height: 12, rx: 6, fill: '#d9d2c4' }), truckIn);
  for (const x of [110, 260]) { s('circle', o({ cx: x, cy: 534, r: 20, fill: '#4f4239' }), truckIn); s('circle', { cx: x, cy: 534, r: 8, fill: '#d9d2c4' }, truckIn); }
  const siren = s('circle', o({ cx: 262, cy: 462, r: 9, fill: '#e8a08a' }), truckIn);
  s('circle', o({ cx: 150, cy: 494, r: 20, fill: '#d8a650' }), truckIn);
  // House
  s('rect', o({ x: 370, y: 330, width: 240, height: 230, fill: '#efe3cc', filter: 'url(#wob)' }), back);
  s('path', o({ d: 'M352 336 L490 220 L628 336Z', fill: '#a5604d' }), back);
  const chimney = s('g', { class: 'tap' }, svg);
  s('rect', o({ x: 548, y: 236, width: 34, height: 60, fill: '#8f6a48' }), chimney);
  const lights = [];
  for (const x of [400, 520]) {
    const w = s('rect', o({ x, y: 370, width: 62, height: 60, fill: '#b7cfd6', class: 'tap' }), svg);
    s('path', { d: `M${x + 31} 370 v60 M${x} 400 h62`, stroke: INK, 'stroke-width': 3 }, svg);
    lights.push(w);
    w.addEventListener('pointerdown', () => { const on = w.getAttribute('fill') !== '#f6dc98'; w.setAttribute('fill', on ? '#f6dc98' : '#b7cfd6'); sfx.click(); });
  }
  s('rect', o({ x: 466, y: 470, width: 50, height: 90, rx: 6, fill: C.teal }), back);
  // Grocery
  s('rect', o({ x: 650, y: 300, width: 320, height: 260, fill: '#efe3cc', filter: 'url(#wob)' }), back);
  for (let i = 0; i < 8; i++) s('path', o({ d: `M${650 + i * 40} 300 h40 v36 q-20 16 -40 0z`, fill: i % 2 ? '#fbf7ef' : C.sage }), back);
  s('rect', o({ x: 670, y: 360, width: 280, height: 190, fill: '#f8f1e2' }), back);
  for (const y of [420, 492]) s('rect', o({ x: 676, y, width: 268, height: 10, fill: '#b48a5f' }), back);
  // Café
  s('rect', o({ x: 1000, y: 320, width: 300, height: 240, fill: '#d9b483', filter: 'url(#wob)' }), back);
  s('rect', o({ x: 990, y: 300, width: 320, height: 30, fill: C.plum }), back);
  s('circle', o({ cx: 1150, cy: 274, r: 30, fill: '#fbf7ef' }), back);
  s('path', o({ d: 'M1136 266 h24 v18 q-12 8 -24 0z M1160 270 q8 0 6 8 q-2 4 -6 2', fill: C.terra }), back);
  s('rect', o({ x: 1016, y: 360, width: 268, height: 190, fill: '#f8f1e2' }), back);
  s('rect', o({ x: 1016, y: 500, width: 268, height: 50, fill: '#b48a5f' }), back);
  const STOVE = { x: 1080, y: 490 };
  s('rect', o({ x: 1030, y: 470, width: 100, height: 30, rx: 6, fill: '#6b6f78' }), back);
  const hob = s('ellipse', { cx: STOVE.x, cy: 474, rx: 38, ry: 8, fill: '#e07b4f', opacity: 0 }, back);
  s('path', o({ d: 'M1040 470 q40 18 80 0 h22', fill: '#4f4239', 'stroke-width': 4 }), back);
  s('ellipse', o({ cx: 1220, cy: 494, rx: 46, ry: 10, fill: '#fbf7ef' }), back);
  // Traffic light
  s('rect', { x: 1335, y: 400, width: 10, height: 162, fill: '#5f646d' }, svg);
  const tl = s('g', { class: 'tap' }, svg);
  s('rect', o({ x: 1312, y: 300, width: 56, height: 120, rx: 14, fill: '#4f4239' }), tl);
  const lamps = ['#cf6a55', '#e2b55a', '#8fb37c'].map((c, i) => s('circle', { cx: 1340, cy: 324 + i * 36, r: 13, fill: c, opacity: 0.25 }, tl));
  let light = 2;
  const showLight = () => lamps.forEach((l, i) => l.setAttribute('opacity', i === light ? 1 : 0.22));
  showLight();
  tl.addEventListener('pointerdown', () => {
    light = light === 2 ? 1 : light === 1 ? 0 : 2;
    showLight(); sfx.click();
    if (light === 1) kit.after(1400, () => { if (light === 1) { light = 0; showLight(); } });
  });
  // Park: tree and swing
  s('rect', o({ x: 1510, y: 300, width: 30, height: 262, fill: C.cocoa }), back);
  const tree = s('g', { class: 'tap' }, svg);
  const treeIn = s('g', { class: 'fbb' }, tree);
  s('circle', o({ cx: 1525, cy: 250, r: 100, fill: '#86a36f' }), treeIn);
  s('circle', o({ cx: 1460, cy: 300, r: 60, fill: '#7a9a64' }), treeIn);
  for (const [x, y] of [[1490, 230], [1560, 270], [1520, 190], [1450, 300]]) s('circle', o({ cx: x, cy: y, r: 11, fill: '#c9574a', 'stroke-width': 2 }), treeIn);
  s('path', o({ d: 'M1370 562 L1390 420 L1470 420 L1490 562', fill: 'none', stroke: '#6b6f78', 'stroke-width': 7 }), svg);
  const SWING = { x: 1430, y: 424 };
  const swing = s('g', null, svg);
  s('path', { d: 'M-24 0 v100 M24 0 v100', stroke: '#5a4a40', 'stroke-width': 3 }, swing);
  s('rect', o({ x: -34, y: 96, width: 68, height: 12, rx: 4, fill: C.ochre }), swing);
  const swingSeat = s('g', null, swing);

  // ---------- Layers ----------
  const fireLayer = s('g', null, svg);
  const carLayer = s('g', null, svg);
  const foodShelf = s('g', null, svg);
  const peopleLayer = s('g', null, svg);
  const waterLayer = s('g', { 'pointer-events': 'none' }, svg);
  const hoseLayer = s('g', null, svg);
  const top = s('g', null, svg);

  // ---------- Cars ----------
  const cars = [
    { x: -100, lane: 760, dir: 1, v: 0, col: C.teal, bus: false },
    { x: 900, lane: 664, dir: -1, v: 0, col: C.ochre, bus: true },
    { x: 500, lane: 760, dir: 1, v: 0, col: C.plum, bus: false },
  ].map((c) => {
    c.g = s('g', { class: 'tap' }, carLayer);
    c.flip = s('g', null, c.g);
    const b = s('g', { class: 'fbb' }, c.flip);
    c.body = b;
    if (c.bus) {
      s('rect', o({ x: -110, y: -86, width: 220, height: 78, rx: 18, fill: c.col }), b);
      for (let i = 0; i < 4; i++) s('rect', o({ x: -90 + i * 46, y: -74, width: 34, height: 28, rx: 5, fill: '#cfe0e0' }), b);
    } else {
      s('path', o({ d: 'M-70 -14 v-26 q0 -10 12 -12 l20 -24 h56 l26 26 q30 2 30 16 v20z', fill: c.col }), b);
      s('path', o({ d: 'M-32 -50 l14 -18 h22 v18z M10 -50 v-18 h14 l16 18z', fill: '#cfe0e0' }), b);
    }
    for (const x of c.bus ? [-70, 70] : [-42, 46]) { s('circle', o({ cx: x, cy: -8, r: 17, fill: '#4f4239' }), b); s('circle', { cx: x, cy: -8, r: 6, fill: '#d9d2c4' }, b); }
    c.half = c.bus ? 112 : 74;
    c.g.addEventListener('pointerdown', () => { sfx.honk(); replay(b, 'hop'); });
    return c;
  });

  // ---------- People ----------
  const SPECS = [
    { skin: SKINS[0], hair: 3, hairColor: HAIRS[3], top: CLOTH[0], bottom: CLOTH[4] },
    { skin: SKINS[2], hair: 2, hairColor: HAIRS[0], top: CLOTH[1], bottom: CLOTH[7], glasses: true },
    { skin: SKINS[4], hair: 0, hairColor: HAIRS[0], top: '#c0553f', bottom: '#4f4239', hat: 'helmet' },
    { skin: SKINS[1], hair: 1, hairColor: HAIRS[1], top: CLOTH[3], bottom: CLOTH[6], wheelchair: true },
    { skin: SKINS[3], hair: 4, hairColor: HAIRS[0], top: CLOTH[5], bottom: CLOTH[2], prosthetic: true, aid: true },
    { skin: SKINS[1], hair: 0, hairColor: HAIRS[2], top: CLOTH[2], bottom: CLOTH[4], hat: 'chef', small: true },
  ];
  const START = [[620, 600], [820, 880], [250, 610], [960, 880], [1250, 880], [1180, 556]];
  const people = SPECS.map((sp, i) => {
    const g = s('g', { class: 'tap' }, peopleLayer);
    const wrap = s('g', { class: 'fbb' }, g);
    const body = s('g', null, wrap);
    const handG = s('g', null, wrap);
    const p = { sp: { ...sp }, g, wrap, body, handG, x: START[i][0], y: START[i][1], held: null, onSwing: false, sc: sp.small ? 0.62 : PS };
    redraw(p); placeP(p);
    return p;
  });
  function redraw(p) {
    const r = person(p.body, p.sp);
    p.hand = r.hand;
    p.handG.setAttribute('transform', `translate(${p.hand[0]} ${p.hand[1]})`);
  }
  function placeP(p) {
    if (p.onSwing) p.g.setAttribute('transform', `translate(0 ${100 + 62 * p.sc}) scale(${p.sc})`);
    else p.g.setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) scale(${p.sc})`);
  }
  function personAt(x, y, except) {
    for (let i = people.length - 1; i >= 0; i--) {
      const p = people[i];
      if (p === except || p.onSwing) continue;
      if (Math.abs(x - p.x) < 50 * p.sc * 1.3 && y < p.y + 10 && y > p.y - 200 * p.sc) return p;
    }
    return null;
  }
  people.forEach((p) => {
    p.g.addEventListener('pointerdown', (e) => {
      e.preventDefault(); e.stopPropagation();
      const p0 = pt(svg, e);
      if (p.onSwing) {
        p.onSwing = false; p.sp.pose = null; redraw(p);
        p.x = p0.x; p.y = p0.y + 80; peopleLayer.appendChild(p.g); placeP(p);
      }
      peopleLayer.appendChild(p.g);
      const off = { x: p.x - p0.x, y: p.y - p0.y };
      let moved = false;
      const id = e.pointerId;
      const mv = (ev) => {
        if (ev.pointerId !== id) return;
        const q = pt(svg, ev);
        if (!moved && Math.hypot(q.x - p0.x, q.y - p0.y) > 10) { moved = true; p.wrap.style.transform = 'rotate(-4deg)'; }
        if (moved) { p.x = q.x + off.x; p.y = q.y + off.y; placeP(p); }
      };
      const up = (ev) => {
        if (ev.pointerId !== id) return;
        window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up);
        p.wrap.style.transform = '';
        if (!moved) { tapPerson(p); return; }
        if (!swingTaken() && Math.hypot(p.x - SWING.x, p.y - (SWING.y + 160)) < 90) {
          p.onSwing = true; p.sp.pose = 'sit'; redraw(p); swingSeat.appendChild(p.g); placeP(p); sfx.boing(1.3);
          return;
        }
        if (p.y < 580) fall(p); else { p.y = clamp(p.y, 580, 895); placeP(p); }
        sfx.thud(1.6, 0.3);
      };
      window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
    });
  });
  const swingTaken = () => people.some((p) => p.onSwing);
  function fall(p) {
    const target = rand(585, 612);
    const stop = kit.loop((dt) => {
      p.vy = (p.vy || 0) + 1600 * dt; p.y += p.vy * dt;
      if (p.y >= target) { p.y = target; p.vy = 0; stop(); replay(p.wrap, 'hop'); }
      placeP(p);
    });
  }
  function tapPerson(p) {
    if (p.held && p.held.edible) {
      const f = p.held; p.held = null;
      f.g.classList.add('fb'); f.g.style.transition = 'transform .9s, opacity .9s'; f.g.style.transform = 'scale(.2)'; f.g.style.opacity = 0;
      kit.after(950, () => f.g.remove());
      sfx.munch();
      p.sp.happy = true; redraw(p); replay(p.wrap, 'hop');
      kit.after(2200, () => { p.sp.happy = false; redraw(p); });
      return;
    }
    p.sp.wave = true; redraw(p); replay(p.wrap, 'hop');
    audio.tone(p.sp.small ? 660 : 440, { dur: 0.18, vol: 0.06, glide: p.sp.small ? 880 : 560, type: 'triangle' });
    kit.after(900, () => { p.sp.wave = false; redraw(p); });
  }

  // ---------- Food ----------
  const SHELF = [['apple', 700, 405], ['banana', 760, 408], ['carrot', 820, 402], ['bread', 890, 408], ['fish', 710, 478], ['egg', 770, 476], ['cheese', 830, 480], ['milk', 896, 472]];
  const foods = [];
  function makeFood(kind, x, y, onShelf) {
    const g = s('g', { class: 'tap' }, onShelf ? foodShelf : top);
    const inner = s('g', null, g);
    FOODS[kind](inner);
    const f = { kind, g, inner, x, y, cooked: 0, onShelf, owner: null, onPan: false, edible: kind !== 'milk' || true };
    foods.push(f);
    placeF(f);
    g.addEventListener('pointerdown', (e) => onFoodDown(f, e));
    return f;
  }
  const placeF = (f) => f.g.setAttribute('transform', `translate(${f.x.toFixed(1)} ${f.y.toFixed(1)})`);
  SHELF.forEach(([k, x, y]) => makeFood(k, x, y, true));
  function onFoodDown(f, e) {
    e.preventDefault(); e.stopPropagation();
    const p0 = pt(svg, e);
    if (f.onShelf) { f.onShelf = false; kit.after(900, () => { const q = SHELF.find((s0) => s0[0] === f.kind); makeFood(f.kind, q[1], q[2], true); }); sfx.pop(1.2); }
    if (f.owner) { const pp = f.owner; pp.held = null; f.owner = null; const m = f.g.getCTM(); const r = svg.getCTM ? svg.getScreenCTM().inverse().multiply(f.g.getScreenCTM()) : m; f.x = r.e; f.y = r.f; }
    f.onPan = false;
    top.appendChild(f.g); placeF(f);
    const id = e.pointerId;
    const off = { x: f.x - p0.x, y: f.y - p0.y };
    const mv = (ev) => { if (ev.pointerId !== id) return; const q = pt(svg, ev); f.x = q.x + off.x; f.y = q.y + off.y; placeF(f); };
    const up = (ev) => {
      if (ev.pointerId !== id) return;
      window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up);
      const who = personAt(f.x, f.y);
      if (who) { giveTo(f, who); return; }
      if (Math.hypot(f.x - STOVE.x, f.y - (STOVE.y - 18)) < 70) { f.onPan = true; f.x = STOVE.x; f.y = STOVE.y - 22; placeF(f); f.panT = 0; sfx.sizzle(2); return; }
      sfx.clack(1.6, 0.3);
    };
    window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
  }
  function giveTo(f, p) {
    if (p.held) { const old = p.held; old.owner = null; top.appendChild(old.g); old.x = p.x + 60; old.y = p.y; placeF(old); }
    p.held = f; f.owner = p;
    p.handG.appendChild(f.g);
    f.g.setAttribute('transform', `translate(0 -6) scale(${1 / p.sc * 0.8})`);
    sfx.pop(1.4);
    replay(p.wrap, 'hop');
  }

  // ---------- Fires and the hose ----------
  const fires = [];
  function startFire(x, y, size = 0.4) {
    if (fires.some((f) => Math.hypot(f.x - x, f.y - y) < 40)) return;
    const g = s('g', { 'pointer-events': 'none' }, fireLayer);
    const fl = s('g', { class: 'fbb flicker' }, g);
    s('path', o({ d: 'M0 0 q-40 -10 -26 -50 q8 18 18 14 q-8 -40 22 -64 q2 34 22 40 q10 -12 6 -26 q30 30 14 72 q-10 14 -56 14z', fill: '#e9925e' }), fl);
    s('path', { d: 'M0 -6 q-18 -8 -10 -28 q8 10 14 4 q0 -18 12 -28 q4 22 14 26 q6 18 -6 26z', fill: '#f4cd6e' }, fl);
    const f = { x, y, size, g };
    fires.push(f);
    sfx.whoosh(0.5);
  }
  let chimneyTaps = 0;
  chimney.addEventListener('pointerdown', () => {
    chimneyTaps++;
    puff(565, 230);
    sfx.whoosh(0.4);
    if (chimneyTaps >= 3) { chimneyTaps = 0; startFire(470 + rand(-40, 40), 330, 0.5); }
  });
  function puff(x, y) {
    const c = s('circle', { cx: x, cy: y, r: 16, fill: '#e8e4dc', opacity: 0.9, class: 'fb rise' }, top);
    kit.after(1700, () => c.remove());
  }
  // Hose
  const NOZ_REST = { x: 300, y: 500 };
  const nozzle = { x: NOZ_REST.x, y: NOZ_REST.y, held: false };
  const hose = s('path', { stroke: '#5a4a40', 'stroke-width': 9, fill: 'none', 'stroke-linecap': 'round' }, hoseLayer);
  const nozG = s('g', { class: 'tap' }, hoseLayer);
  const nozRot = s('g', null, nozG);
  s('circle', { cx: 0, cy: 0, r: 34, fill: 'transparent' }, nozRot);
  s('rect', o({ x: -10, y: -34, width: 20, height: 40, rx: 6, fill: C.ochre }), nozRot);
  s('rect', o({ x: -6, y: -46, width: 12, height: 14, rx: 3, fill: '#9aa0a8' }), nozRot);
  const drops = [];
  nozG.addEventListener('pointerdown', (e) => {
    e.preventDefault(); e.stopPropagation();
    const id = e.pointerId;
    nozzle.held = true;
    const mv = (ev) => { if (ev.pointerId !== id) return; const q = pt(svg, ev); nozzle.x = q.x; nozzle.y = q.y; };
    const up = (ev) => { if (ev.pointerId !== id) return; nozzle.held = false; window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up); };
    window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
  });
  truck.addEventListener('pointerdown', () => {
    replay(truckIn, 'hop');
    [0, 0.35, 0.7].forEach((d, i) => audio.tone(i % 2 ? 560 : 700, { dur: 0.3, vol: 0.035, type: 'triangle', at: audio.now() + d }));
    let k = 0; const id = setInterval(() => { siren.setAttribute('fill', k++ % 2 ? '#e8a08a' : '#7fb0d0'); if (k > 8) clearInterval(id); }, 150);
    kit.add(() => clearInterval(id));
  });
  tree.addEventListener('pointerdown', () => {
    replay(treeIn, 'wiggle'); sfx.paper();
    if (foods.filter((f) => !f.onShelf).length < 18) {
      const f = makeFood('apple', 1460 + rand(-30, 60), 260, false);
      const target = rand(590, 620);
      const stop = kit.loop((dt) => { f.vy = (f.vy || 0) + 1500 * dt; f.y += f.vy * dt; if (f.y > target) { f.y = target; stop(); sfx.thud(2, 0.3); } placeF(f); });
    }
  });

  // ---------- Loop ----------
  let splashT = 0;
  kit.loop((dt, t) => {
    clouds.forEach((c) => { c.x += c.v * dt; if (c.x > 1800) c.x = -200; c.g.setAttribute('transform', `translate(${c.x} ${c.y})`); });
    // Swing
    const swA = swingTaken() ? Math.sin(t * 2.2) * 22 : Math.sin(t * 1.3) * 3;
    swing.setAttribute('transform', `translate(${SWING.x} ${SWING.y}) rotate(${swA.toFixed(2)})`);
    // Cars
    for (const c of cars) {
      const front = c.x + c.dir * c.half;
      let stop = false;
      if (light === 0 && (c.dir > 0 ? front < 1226 && front > 1060 : front > 1318 && front < 1480)) stop = true;
      for (const p of people) if (!p.onSwing && Math.abs(p.y - c.lane) < 55 && (c.dir > 0 ? p.x - front : front - p.x) > 0 && (c.dir > 0 ? p.x - front : front - p.x) < 90) stop = true;
      for (const o2 of cars) if (o2 !== c && o2.lane === c.lane) { const gap = (o2.x - c.x) * c.dir - o2.half - c.half; if (gap > 0 && gap < 40) stop = true; }
      c.v += ((stop ? 0 : 120) - c.v) * Math.min(1, dt * (stop ? 4 : 1.2));
      c.x += c.dir * c.v * dt;
      if (c.dir > 0 && c.x > 1800) c.x = -200;
      if (c.dir < 0 && c.x < -200) c.x = 1800;
      c.g.setAttribute('transform', `translate(${c.x.toFixed(1)} ${c.lane})`);
      c.flip.setAttribute('transform', c.dir < 0 ? 'scale(-1 1)' : '');
    }
    // Cooking
    let cooking = false;
    for (const f of foods) {
      if (!f.onPan) continue;
      cooking = true;
      f.panT += dt;
      const k = clamp(f.panT / 3, 0, 1);
      f.inner.style.filter = `sepia(${0.6 * k}) saturate(${1 + 0.5 * k}) brightness(${1 - 0.15 * k})`;
      if (Math.random() < dt * 3) puff(f.x + rand(-10, 10), f.y - 20);
      if (f.panT > 9 && !f.burnt) { f.burnt = true; startFire(STOVE.x, STOVE.y - 10, 0.5); }
    }
    hob.setAttribute('opacity', cooking ? 0.7 + Math.sin(t * 8) * 0.2 : 0);
    // Fires grow slowly
    for (let i = fires.length - 1; i >= 0; i--) {
      const f = fires[i];
      f.size = Math.min(1, f.size + dt * 0.04);
      f.g.setAttribute('transform', `translate(${f.x} ${f.y}) scale(${(0.5 + f.size * 0.7).toFixed(3)})`);
      if (f.size <= 0.05) { f.g.remove(); fires.splice(i, 1); sfx.sizzle(0.6); puff(f.x, f.y - 30); }
    }
    // Hose and water
    if (!nozzle.held) { nozzle.x += (NOZ_REST.x - nozzle.x) * Math.min(1, dt * 6); nozzle.y += (NOZ_REST.y - nozzle.y) * Math.min(1, dt * 6); }
    const ang = nozzle.held ? Math.atan2(-1, nozzle.x > 300 ? 0.7 : -0.7) : -Math.PI / 2;
    nozG.setAttribute('transform', `translate(${nozzle.x.toFixed(1)} ${nozzle.y.toFixed(1)})`);
    nozRot.setAttribute('transform', `rotate(${(ang * 180) / Math.PI + 90})`);
    const mx = (250 + nozzle.x) / 2, my = Math.max(500, nozzle.y) + 90;
    hose.setAttribute('d', `M240 500 Q${mx} ${my} ${nozzle.x} ${nozzle.y + 6}`);
    if (nozzle.held) {
      for (let k = 0; k < 2; k++) {
        const sp = rand(520, 640), a = ang + rand(-0.08, 0.08);
        const el = s('circle', { r: rand(5, 8), fill: '#9cc6d8', opacity: 0.85 }, waterLayer);
        drops.push({ x: nozzle.x + Math.cos(ang) * 40, y: nozzle.y + Math.sin(ang) * 40, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, el, t: 0 });
      }
      splashT -= dt;
      if (splashT <= 0) { audio.noise({ dur: 0.35, vol: 0.05, freq: 3000, q: 0.6 }); splashT = 0.3; }
    }
    for (let i = drops.length - 1; i >= 0; i--) {
      const d = drops[i];
      d.t += dt; d.vy += 900 * dt; d.x += d.vx * dt; d.y += d.vy * dt;
      for (const f of fires) if (Math.hypot(d.x - f.x, d.y - (f.y - 40)) < 70) { f.size -= 0.012; d.t = 9; }
      if (d.t > 1.4 || d.y > 900) { d.el.remove(); drops.splice(i, 1); continue; }
      d.el.setAttribute('cx', d.x.toFixed(1)); d.el.setAttribute('cy', d.y.toFixed(1));
    }
  });
}

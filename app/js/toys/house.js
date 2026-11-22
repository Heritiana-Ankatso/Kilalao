// House & Dress-Up: a cut-away dollhouse with four rooms and a wardrobe.
// Tap someone to choose them; the wardrobe changes their skin tone, hair,
// clothes and accessories (glasses, hats, hearing aid, wheelchair,
// prosthetic leg). Drag people into rooms: the bed, the sofa and the bath
// each do something. Lamps, the fridge, the stove, the TV and the tap work.
import { s, C, makeStage, pt, clamp, replay } from '../lib.js';
import { person, SKINS, HAIRS, CLOTH, HATS } from '../people.js';

const INK = C.ink;
const o = (x) => ({ stroke: INK, 'stroke-width': 3, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', ...x });
const SC = 0.72;
const FLOORS = [515, 835];

export default function house(root, kit) {
  const { sfx, audio } = kit;
  const svg = makeStage(root, '#cfe0e0');
  s('rect', { x: -800, y: 860, width: 3200, height: 400, fill: '#a9bd8a' }, svg);

  // ---------- House shell ----------
  s('path', o({ d: 'M40 236 L560 36 L1080 236Z', fill: '#a5604d', 'stroke-width': 5, filter: 'url(#wob)' }), svg);
  s('circle', o({ cx: 560, cy: 160, r: 40, fill: '#f6dc98' }), svg);
  s('rect', o({ x: 70, y: 230, width: 980, height: 630, fill: '#efe3cc', 'stroke-width': 5 }), svg);
  // Rooms backgrounds
  const rooms = [
    { x: 80, y: 240, w: 480, h: 275, fill: '#e8d5c4' }, { x: 560, y: 240, w: 480, h: 275, fill: '#d6e3e4' },
    { x: 80, y: 535, w: 480, h: 300, fill: '#efe0bf' }, { x: 560, y: 535, w: 480, h: 300, fill: '#e3d6e0' },
  ];
  const darkness = [];
  rooms.forEach((r, i) => {
    s('rect', { x: r.x, y: r.y, width: r.w, height: r.h, fill: r.fill }, svg);
    for (let k = 0; k < 7; k++) s('circle', { cx: r.x + 40 + k * 68, cy: r.y + 30, r: 5, fill: '#fff', opacity: 0.45 }, svg);
    s('rect', { x: r.x, y: r.y + r.h - 18, width: r.w, height: 18, fill: '#b48a5f' }, svg);
  });
  s('rect', o({ x: 70, y: 515, width: 980, height: 22, fill: '#8f6a48' }), svg);
  s('rect', { x: 552, y: 240, width: 16, height: 600, fill: '#d9c6a3' }, svg);
  s('rect', { x: 548, y: 360, width: 24, height: 155, fill: rooms[0].fill, opacity: 0.6 }, svg);

  // ---------- Bedroom ----------
  const BED = { x: 130, y: 430, w: 240, h: 70 };
  s('rect', o({ x: BED.x - 10, y: BED.y - 60, width: 26, height: 140, rx: 8, fill: '#8f6a48' }), svg);
  s('rect', o({ x: BED.x, y: BED.y, width: BED.w, height: 50, rx: 12, fill: '#fbf7ef' }), svg);
  s('rect', o({ x: BED.x + 10, y: BED.y + 46, width: BED.w - 20, height: 30, fill: '#8f6a48' }), svg);
  s('ellipse', o({ cx: BED.x + 50, cy: BED.y - 4, rx: 38, ry: 16, fill: '#fbf7ef' }), svg);
  const blanket = s('rect', o({ x: BED.x + 90, y: BED.y - 6, width: BED.w - 90, height: 40, rx: 10, fill: C.plum }), svg);
  // Window (sky turns to night when the lamp is off)
  const sky = s('rect', o({ x: 400, y: 280, width: 110, height: 90, fill: '#bcd6e0' }), svg);
  s('path', { d: 'M455 280 v90 M400 325 h110', stroke: INK, 'stroke-width': 3 }, svg);
  const lamp = s('g', { class: 'tap' }, svg);
  s('rect', o({ x: 400, y: 440, width: 90, height: 60, fill: '#b48a5f' }), lamp);
  s('rect', { x: 440, y: 400, width: 8, height: 40, fill: '#6b5444' }, lamp);
  const shade = s('path', o({ d: 'M418 404 l14 -40 h24 l14 40z', fill: '#f6dc98' }), lamp);
  const lampGlow = s('circle', { cx: 444, cy: 400, r: 70, fill: '#ffe9a8', opacity: 0.5, filter: 'url(#glow)', 'pointer-events': 'none' }, svg);
  const night = s('rect', { x: 80, y: 240, width: 480, height: 275, fill: '#2c3448', opacity: 0, 'pointer-events': 'none' }, svg);
  night.style.transition = 'opacity .8s';
  let lampOn = true;
  lamp.addEventListener('pointerdown', () => {
    lampOn = !lampOn; sfx.click();
    shade.setAttribute('fill', lampOn ? '#f6dc98' : '#d9d2c4'); lampGlow.setAttribute('opacity', lampOn ? 0.5 : 0);
    night.style.opacity = lampOn ? 0 : 0.35; sky.setAttribute('fill', lampOn ? '#bcd6e0' : '#3d4a5c');
  });

  // ---------- Bathroom ----------
  const TUB = { x: 620, y: 430, w: 230 };
  s('rect', o({ x: 900, y: 290, width: 90, height: 100, rx: 40, fill: '#e8f1f3' }), svg);
  s('path', o({ d: 'M900 440 h90 v20 q-45 30 -90 0z', fill: '#fbf7ef' }), svg);
  s('rect', { x: 940, y: 460, width: 10, height: 40, fill: '#c9c3bb' }, svg);
  const tap = s('g', { class: 'tap' }, svg);
  s('path', o({ d: 'M944 440 v-22 h22 v8', fill: 'none', 'stroke-width': 6, stroke: '#9aa0a8' }), tap);
  s('circle', { cx: 952, cy: 426, r: 22, fill: 'transparent' }, tap);
  const stream = s('rect', { x: 962, y: 428, width: 6, height: 0, fill: '#9cc6d8' }, svg);
  tap.addEventListener('pointerdown', () => {
    stream.setAttribute('height', 20); sfx.splash(0.5);
    kit.after(1200, () => stream.setAttribute('height', 0));
  });
  const bubbles = s('g', { 'pointer-events': 'none' }, svg);
  const tubBack = s('rect', o({ x: TUB.x, y: TUB.y, width: TUB.w, height: 70, rx: 30, fill: '#fbf7ef' }), svg);
  tubBack.classList.add('tap');
  tubBack.addEventListener('pointerdown', () => blowBubbles());
  function blowBubbles() {
    for (let i = 0; i < 6; i++) {
      const b = s('circle', { cx: TUB.x + 30 + Math.random() * (TUB.w - 60), cy: TUB.y + 10, r: 8 + Math.random() * 10, fill: '#e3f1f5', stroke: '#9cc6d8', 'stroke-width': 2, class: 'fb rise' }, bubbles);
      b.style.animationDelay = `${i * 0.15}s`;
      kit.after(2600, () => b.remove());
    }
    sfx.bubble(); kit.after(200, () => sfx.bubble());
  }

  // ---------- Kitchen ----------
  const fridge = s('g', { class: 'tap' }, svg);
  s('rect', o({ x: 100, y: 620, width: 110, height: 200, rx: 12, fill: '#e8eef0' }), fridge);
  const inside = s('g', null, fridge);
  s('rect', { x: 108, y: 630, width: 94, height: 180, fill: '#fbf7ef' }, inside);
  s('circle', o({ cx: 132, cy: 672, r: 12, fill: '#c9574a' }), inside);
  s('rect', o({ x: 150, y: 656, width: 30, height: 32, rx: 4, fill: C.blue }), inside);
  s('ellipse', o({ cx: 154, cy: 740, rx: 26, ry: 14, fill: '#e9c86a' }), inside);
  const fdoor = s('g', null, fridge);
  fdoor.style.transformOrigin = '100px 720px'; fdoor.style.transition = 'transform .5s';
  s('rect', o({ x: 100, y: 620, width: 110, height: 200, rx: 12, fill: '#dde6e9' }), fdoor);
  s('rect', { x: 186, y: 660, width: 8, height: 50, rx: 4, fill: '#9aa0a8' }, fdoor);
  let fOpen = false;
  fridge.addEventListener('pointerdown', () => { fOpen = !fOpen; fdoor.style.transform = fOpen ? 'scaleX(0.12)' : ''; sfx.clack(0.7, 0.6); });
  const stove = s('g', { class: 'tap' }, svg);
  s('rect', o({ x: 300, y: 720, width: 140, height: 100, rx: 8, fill: '#d9d2c4' }), stove);
  s('rect', o({ x: 316, y: 750, width: 108, height: 56, rx: 6, fill: '#4f4239' }), stove);
  s('path', o({ d: 'M320 690 h100 v24 q-50 14 -100 0z', fill: C.terra }), stove);
  s('path', o({ d: 'M310 690 h120', 'stroke-width': 6 }), stove);
  stove.addEventListener('pointerdown', () => {
    for (let i = 0; i < 4; i++) { const c = s('circle', { cx: 340 + i * 20, cy: 680, r: 10, fill: '#efeae2', opacity: 0.9, class: 'fb rise' }, svg); c.style.animationDelay = `${i * 0.2}s`; kit.after(2400, () => c.remove()); }
    [0, 0.2, 0.4].forEach((d) => kit.after(d * 1000, () => sfx.bubble()));
  });
  s('rect', o({ x: 470, y: 760, width: 70, height: 12, fill: '#b48a5f' }), svg);
  s('path', o({ d: 'M478 772 v48 M532 772 v48', fill: 'none', 'stroke-width': 5, stroke: '#8f6a48' }), svg);

  // ---------- Living room ----------
  const SOFA = { x: 610, y: 740, w: 250 };
  s('rect', o({ x: SOFA.x, y: SOFA.y - 60, width: SOFA.w, height: 70, rx: 20, fill: C.teal }), svg);
  s('rect', o({ x: SOFA.x - 10, y: SOFA.y, width: SOFA.w + 20, height: 50, rx: 16, fill: '#6f9e9e' }), svg);
  s('rect', o({ x: SOFA.x + 10, y: SOFA.y + 48, width: 16, height: 24, fill: '#5a4a40' }), svg);
  s('rect', o({ x: SOFA.x + SOFA.w - 26, y: SOFA.y + 48, width: 16, height: 24, fill: '#5a4a40' }), svg);
  s('ellipse', { cx: 760, cy: 826, rx: 200, ry: 10, fill: C.rose, opacity: 0.6 }, svg);
  const tv = s('g', { class: 'tap' }, svg);
  s('rect', o({ x: 900, y: 730, width: 120, height: 90, fill: '#8f6a48' }), tv);
  s('rect', o({ x: 890, y: 620, width: 140, height: 100, rx: 12, fill: '#4f4239' }), tv);
  const screen = s('g', null, tv);
  const channels = [
    (g) => { s('rect', { x: 902, y: 632, width: 116, height: 76, rx: 6, fill: '#8db8c8' }, g); s('path', o({ d: 'M930 670 q20 -16 40 0 q-20 16 -40 0z', fill: C.ochre }), g); s('path', o({ d: 'M970 670 l12 -9 v18z', fill: C.ochre }), g); },
    (g) => { s('rect', { x: 902, y: 632, width: 116, height: 76, rx: 6, fill: '#2c3448' }, g); for (let i = 0; i < 6; i++) s('circle', { cx: 915 + i * 18, cy: 645 + (i % 3) * 20, r: 3, fill: '#f4ecdc' }, g); s('circle', { cx: 990, cy: 680, r: 14, fill: '#f1e3bd' }, g); },
    (g) => { ['#c97b63', '#d8a650', '#93ab8b', '#7898b3'].forEach((c, i) => s('rect', { x: 902 + i * 29, y: 632, width: 29, height: 76, fill: c }, g)); },
    (g) => { s('rect', { x: 902, y: 632, width: 116, height: 76, rx: 6, fill: '#b9cf96' }, g); s('circle', o({ cx: 960, cy: 668, r: 20, fill: '#fbf7ef' }), g); s('ellipse', o({ cx: 950, cy: 640, rx: 5, ry: 14, fill: '#fbf7ef' }), g); s('ellipse', o({ cx: 966, cy: 640, rx: 5, ry: 14, fill: '#fbf7ef' }), g); },
  ];
  let ch = 0;
  channels[0](screen);
  tv.addEventListener('pointerdown', () => { ch = (ch + 1) % channels.length; screen.innerHTML = ''; channels[ch](screen); sfx.click(); audio.noise({ dur: 0.15, vol: 0.05, freq: 3000, q: 0.5 }); });
  const plant = s('g', { class: 'tap' }, svg);
  const plantIn = s('g', { class: 'fbb' }, plant);
  s('path', o({ d: 'M1000 760 q-30 -60 0 -100 q30 40 0 100 M1000 760 q-50 -30 -40 -70 M1000 760 q50 -30 40 -70', fill: C.moss }), plantIn);
  s('path', o({ d: 'M980 760 h40 l-6 60 h-28z', fill: C.terra }), plantIn);
  plant.addEventListener('pointerdown', () => { replay(plantIn, 'wiggle'); sfx.paper(); });

  // ---------- People ----------
  const peopleLayer = s('g', null, svg);
  const tubFront = s('path', o({ d: `M${TUB.x} 470 h${TUB.w} v20 q0 26 -30 26 h-${TUB.w - 60} q-30 0 -30 -26z`, fill: '#fbf7ef', 'pointer-events': 'none' }), svg);
  const SPECS = [
    { skin: SKINS[1], hair: 1, hairColor: HAIRS[1], top: CLOTH[0], bottom: CLOTH[4] },
    { skin: SKINS[4], hair: 2, hairColor: HAIRS[0], top: CLOTH[1], bottom: CLOTH[3], small: true },
    { skin: SKINS[2], hair: 5, hairColor: HAIRS[4], top: CLOTH[5], bottom: CLOTH[7], glasses: true, wheelchair: true },
  ];
  const people = SPECS.map((sp, i) => {
    const g = s('g', { class: 'tap' }, peopleLayer);
    const wrap = s('g', { class: 'fbb' }, g);
    const zz = s('g', { 'pointer-events': 'none' }, g);
    const p = { sp: { ...sp }, g, wrap, zz, x: [700, 460, 760][i], y: [835, 835, 515][i], spot: null, sc: sp.small ? SC * 0.75 : SC };
    draw(p);
    return p;
  });
  function draw(p) {
    const sp = { ...p.sp, pose: p.spot === 'bed' ? 'lie' : p.spot === 'sofa' || p.spot === 'tub' ? 'sit' : null };
    person(p.wrap, sp);
    p.zz.innerHTML = '';
    if (p.spot === 'bed') {
      ['z', 'z'].forEach((_, i) => { const t = s('text', { x: 20 + i * 18, y: -70 - i * 16, 'font-size': 34 - i * 6, fill: C.ink, opacity: 0.7, class: 'zzz', text: 'z' }, p.zz); t.style.animationDelay = `${i * 1.1}s`; });
    }
    let x = p.x, y = p.y;
    if (p.spot === 'bed') { x = BED.x + 205; y = BED.y + 12; }
    p.g.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${p.sc})`);
  }
  let selected = people[0];
  const ring = s('ellipse', { rx: 56, ry: 12, fill: 'none', stroke: C.ochre, 'stroke-width': 5, opacity: 0.9, 'pointer-events': 'none' }, peopleLayer);
  function showRing() {
    const p = selected;
    let x = p.x, y = p.y;
    if (p.spot === 'bed') { x = BED.x + 120; y = BED.y + 30; }
    ring.setAttribute('cx', x); ring.setAttribute('cy', y);
    ring.setAttribute('rx', 60 * p.sc); peopleLayer.insertBefore(ring, peopleLayer.firstChild);
    drawMirror();
  }
  people.forEach((p) => {
    p.g.addEventListener('pointerdown', (e) => {
      e.preventDefault(); e.stopPropagation();
      const p0 = pt(svg, e);
      const off = { x: p.x - p0.x, y: p.y - p0.y };
      if (p.spot === 'bed') { off.x = 0; off.y = 60; }
      const id = e.pointerId;
      let moved = false;
      peopleLayer.appendChild(p.g);
      const mv = (ev) => {
        if (ev.pointerId !== id) return;
        const q = pt(svg, ev);
        if (!moved && Math.hypot(q.x - p0.x, q.y - p0.y) > 10) { moved = true; p.spot = null; }
        if (moved) { p.x = q.x + off.x; p.y = q.y + off.y; draw(p); showRing(); }
      };
      const up = (ev) => {
        if (ev.pointerId !== id) return;
        window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up);
        if (!moved) {
          selected = p; showRing(); replay(p.wrap, 'hop');
          audio.tone(p.sp.small ? 660 : 440, { dur: 0.18, vol: 0.06, glide: p.sp.small ? 880 : 560, type: 'triangle' });
          return;
        }
        drop(p);
      };
      window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
    });
  });
  function drop(p) {
    const { x, y } = p;
    p.spot = null;
    if (x > BED.x - 20 && x < BED.x + BED.w + 20 && y > 300 && y < 530) { p.spot = 'bed'; sfx.paper(); }
    else if (x > SOFA.x && x < SOFA.x + SOFA.w && y > 640 && y < 860) { p.spot = 'sofa'; p.y = SOFA.y + 46; p.x = clamp(x, SOFA.x + 40, SOFA.x + SOFA.w - 40); sfx.thud(1.4, 0.3); }
    else if (x > TUB.x && x < TUB.x + TUB.w && y > 360 && y < 530) { p.spot = 'tub'; p.y = TUB.y + 80; p.x = clamp(x, TUB.x + 50, TUB.x + TUB.w - 50); blowBubbles(); sfx.splash(0.6); }
    else {
      p.x = clamp(x, 110, x > 1060 ? 1040 : 1020);
      p.y = y < 530 ? FLOORS[0] : FLOORS[1];
      sfx.thud(1.6, 0.3);
    }
    if (p.spot === 'tub') peopleLayer.parentNode.insertBefore(tubFront, peopleLayer.nextSibling);
    draw(p);
    selected = p; showRing();
  }

  // ---------- Wardrobe ----------
  s('rect', o({ x: 1090, y: 30, width: 490, height: 840, rx: 30, fill: '#c9a073', 'stroke-width': 5, filter: 'url(#wob)' }), svg);
  s('rect', o({ x: 1120, y: 60, width: 430, height: 300, rx: 120, fill: '#dfeaec' }), svg);
  s('path', { d: 'M1160 120 q20 -30 60 -40', stroke: '#fff', 'stroke-width': 8, fill: 'none', opacity: 0.6, 'stroke-linecap': 'round' }, svg);
  const mirror = s('g', null, svg);
  function drawMirror() {
    mirror.innerHTML = '';
    const g = s('g', { transform: `translate(1335 350) scale(${selected.sp.small ? 1.1 : 1.35})` }, mirror);
    const inner = s('g', null, g);
    person(inner, { ...selected.sp, pose: null });
  }
  const rows = [
    { kind: 'skin', opts: SKINS },
    { kind: 'hair', opts: [0, 1, 2, 3, 4, 5] },
    { kind: 'hairColor', opts: HAIRS },
    { kind: 'top', opts: CLOTH.slice(0, 6) },
    { kind: 'bottom', opts: [CLOTH[4], CLOTH[7], CLOTH[2], CLOTH[0], '#4f4239', CLOTH[6]] },
    { kind: 'extra', opts: ['glasses', 'hat', 'aid', 'wheelchair', 'prosthetic', 'small'] },
  ];
  rows.forEach((row, ri) => {
    const y = 420 + ri * 74;
    s('rect', { x: 1110, y: y - 32, width: 450, height: 64, rx: 32, fill: '#b48a5f', opacity: 0.45 }, svg);
    row.opts.forEach((opt, i) => {
      const x = 1150 + i * 74;
      const g = s('g', { class: 'tap', transform: `translate(${x} ${y})` }, svg);
      s('circle', { cx: 0, cy: 0, r: 30, fill: '#efe3cc', stroke: INK, 'stroke-width': 3 }, g);
      swatch(g, row.kind, opt);
      g.addEventListener('pointerdown', (e) => { e.preventDefault(); choose(row.kind, opt); replay(g, 'popin'); });
    });
  });
  function swatch(g, kind, opt) {
    if (kind === 'skin' || kind === 'hairColor') s('circle', o({ cx: 0, cy: 0, r: 20, fill: opt }), g);
    else if (kind === 'top') s('path', o({ d: 'M-18 -16 l-10 8 l6 10 l6 -4 v18 h32 v-18 l6 4 l6 -10 l-10 -8 q-18 8 -36 0z', fill: opt }), g);
    else if (kind === 'bottom') s('path', o({ d: 'M-14 -18 h28 l4 36 h-14 l-4 -22 l-4 22 h-14z', fill: opt }), g);
    else if (kind === 'hair') { const k = s('g', { transform: 'translate(0 42) scale(0.36)' }, g); person(k, { skin: SKINS[1], hair: opt, hairColor: HAIRS[1], top: 'transparent', bottom: 'transparent' }); }
    else {
      const d = {
        glasses: () => { s('circle', { cx: -10, cy: 0, r: 9, fill: 'none', stroke: INK, 'stroke-width': 3 }, g); s('circle', { cx: 10, cy: 0, r: 9, fill: 'none', stroke: INK, 'stroke-width': 3 }, g); },
        hat: () => { s('path', o({ d: 'M-18 6 q0 -24 18 -24 q18 0 18 24z', fill: C.terra }), g); s('rect', o({ x: -22, y: 2, width: 44, height: 8, rx: 4, fill: '#e8dcc4' }), g); },
        aid: () => { s('path', o({ d: 'M-4 -16 q16 4 10 26 q-6 2 -8 -4z', fill: C.ochre }), g); },
        wheelchair: () => { s('circle', { cx: -2, cy: 6, r: 14, fill: 'none', stroke: '#5f646d', 'stroke-width': 4 }, g); s('path', { d: 'M-12 -18 v14 h20 l4 14', stroke: '#5f646d', 'stroke-width': 4, fill: 'none' }, g); },
        prosthetic: () => { s('path', { d: 'M0 -18 v28 M-6 14 q10 6 18 0', stroke: '#5f646d', 'stroke-width': 5, fill: 'none', 'stroke-linecap': 'round' }, g); s('rect', o({ x: -6, y: -22, width: 12, height: 12, rx: 4, fill: C.blue })); },
        small: () => { s('circle', o({ cx: -8, cy: -4, r: 7, fill: SKINS[2] }), g); s('circle', o({ cx: 10, cy: -10, r: 10, fill: SKINS[0] }), g); },
      }[opt];
      d && d();
    }
  }
  function choose(kind, opt) {
    const sp = selected.sp;
    if (kind === 'extra') {
      if (opt === 'hat') { const i = HATS.indexOf(sp.hat || null); sp.hat = HATS[(i + 1) % HATS.length]; }
      else if (opt === 'small') { sp.small = !sp.small; selected.sc = sp.small ? SC * 0.75 : SC; }
      else sp[opt] = !sp[opt];
    } else sp[kind] = opt;
    sfx.pop(1 + Math.random() * 0.3);
    draw(selected); showRing();
    replay(selected.wrap, 'hop');
  }
  showRing();
}

// The Learn cast, designed with the character-appeal principles:
//
// OWL (the guide): patient, curious, warm. Pear-shaped body, big head with a
//   heart-shaped face and uneven ear tufts, a teal scarf knotted on one side.
//   Slow, deliberate tempo (600–900 ms). Signature: a curious head tilt, slow
//   blinks, pointing with a wing. Sits on a little branch.
// FOX (the friend who asks for things): eager, friendly. Sitting fox with a big
//   curled tail. Quick tempo (250–450 ms). Signature: tail sway, ear flicks,
//   leaning towards whatever is coming.
// AVATARS (the child): eight animals with clearly different silhouettes, soft
//   CSS blinking.
//
// Rigs are data (see rig.js): each part has a pivot in the character's own
// coordinates, with the origin between the feet.
import { s, C } from '../lib.js';
import { makeRig } from './rig.js';

const INK = C.ink;
const ink = (o, w = 4) => ({ stroke: INK, 'stroke-width': w, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', ...o });
const rnd = (a, b) => a + Math.random() * (b - a);

// Shared idle helpers ---------------------------------------------------------
function breathe(rig, id, t, period, amount) {
  const k = Math.sin((t * 2 * Math.PI) / period);
  rig.parts[id].idle.sy = 1 + amount * k;
  rig.parts[id].idle.sx = 1 - amount * 0.35 * k;
}

function blink(rig, dt, lidsId) {
  const st = rig.state;
  st.nextBlink ??= rnd(1.5, 4);
  st.nextBlink -= dt;
  if (st.nextBlink <= 0 && st.blinkT === undefined) { st.blinkT = 0; st.double = Math.random() < 0.2; }
  const lids = rig.parts[lidsId];
  if (st.blinkT !== undefined) {
    st.blinkT += dt;
    const d = rig.state.slowBlink ? 0.42 : 0.2;
    const k = st.blinkT / d;
    lids.idle.o = 1;
    lids.idle.sy = k < 0.5 ? k * 2 : Math.max(0, 2 - k * 2);
    if (k >= 1) {
      if (st.double) { st.double = false; st.blinkT = -0.08; }
      else { st.blinkT = undefined; st.nextBlink = rnd(2.5, 5.5); }
    }
  } else { lids.idle.o = 0; lids.idle.sy = 0; }
}

function gaze(rig, eyesId, pupilsId, max) {
  const target = rig.state.look;
  const p = rig.parts[pupilsId];
  if (!target) { p.idle.tx = 0; p.idle.ty = 0; return; }
  const e = rig.world(eyesId);
  const dx = target.x - e.x, dy = target.y - e.y, d = Math.hypot(dx, dy) || 1;
  const want = { x: (dx / d) * max * Math.min(1, d / 200), y: (dy / d) * max * Math.min(1, d / 200) };
  rig.state.g ??= { x: 0, y: 0 };
  rig.state.g.x += (want.x - rig.state.g.x) * 0.15;
  rig.state.g.y += (want.y - rig.state.g.y) * 0.15;
  p.idle.tx = rig.state.g.x; p.idle.ty = rig.state.g.y;
}

function talking(rig, jawId, t, open) {
  if (rig.state.talkUntil && performance.now() < rig.state.talkUntil) {
    rig.parts[jawId].idle.ty = open * (0.35 + 0.65 * Math.abs(Math.sin(t * 13)));
    return true;
  }
  return false;
}

// =============================================================================
// OWL — the guide
// =============================================================================
const OWL = { body: '#8a6a52', dark: '#6c5242', face: '#f3e6cc', belly: '#ecdcbf' };

const OWL_DEF = {
  parts: [
    { id: 'perch', draw(g) {
      s('path', ink({ d: 'M-110 6 Q0 -6 110 10', fill: 'none', stroke: C.cocoa }, 16), g);
      s('path', { d: 'M-110 6 Q0 -6 110 10', fill: 'none', stroke: '#a07856', 'stroke-width': 9, 'stroke-linecap': 'round' }, g);
      s('path', ink({ d: 'M78 9 q14 -18 32 -16 q-10 18 -32 16 z', fill: C.leaf }, 3), g);
    } },
    { id: 'body', parent: 'perch', pivot: [0, 0], draw(g) {
      s('path', ink({ d: 'M-64 -8 C-76 -78 -54 -142 0 -146 C54 -142 76 -78 64 -8 C46 8 -46 8 -64 -8 Z', fill: OWL.body }), g);
      s('path', { d: 'M-40 -14 C-50 -60 -36 -104 0 -106 C36 -104 50 -60 40 -14 C26 -4 -26 -4 -40 -14 Z', fill: OWL.belly }, g);
      for (const [x, y] of [[-16, -84], [14, -84], [-24, -60], [2, -62], [26, -58], [-12, -38], [14, -38]]) {
        s('path', { d: `M${x - 7} ${y} q7 7 14 0`, fill: 'none', stroke: '#b59878', 'stroke-width': 3, 'stroke-linecap': 'round' }, g);
      }
      // Feet gripping the perch
      for (const fx of [-24, 22]) s('path', ink({ d: `M${fx - 12} -2 q4 10 8 2 q4 10 8 0 q4 10 8 -2`, fill: C.ochre }, 3), g);
    } },
    { id: 'wingL', parent: 'body', pivot: [-56, -112], draw(g) {
      s('path', ink({ d: 'M-54 -116 C-88 -92 -92 -40 -66 -10 C-56 -44 -46 -84 -54 -116 Z', fill: OWL.dark }), g);
      s('path', { d: 'M-74 -70 q6 14 2 30 M-64 -84 q6 18 2 40', stroke: OWL.body, 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }, g);
    } },
    { id: 'wingR', parent: 'body', pivot: [56, -112], draw(g) {
      s('path', ink({ d: 'M54 -116 C88 -92 92 -40 66 -10 C56 -44 46 -84 54 -116 Z', fill: OWL.dark }), g);
      s('path', { d: 'M74 -70 q-6 14 -2 30 M64 -84 q-6 18 -2 40', stroke: OWL.body, 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }, g);
    } },
    { id: 'head', parent: 'body', pivot: [0, -138], draw(g) {
      s('path', ink({ d: 'M-82 -186 C-84 -236 -44 -256 0 -256 C44 -256 84 -236 82 -186 C80 -150 44 -132 0 -132 C-44 -132 -80 -150 -82 -186 Z', fill: OWL.body }), g);
      // Heart-shaped facial disc
      s('path', { d: 'M0 -232 C-20 -248 -70 -242 -70 -196 C-70 -160 -30 -146 0 -142 C30 -146 70 -160 70 -196 C70 -242 20 -248 0 -232 Z', fill: OWL.face }, g);
      s('circle', { cx: -52, cy: -170, r: 9, fill: C.rose, opacity: 0.55 }, g);
      s('circle', { cx: 52, cy: -170, r: 9, fill: C.rose, opacity: 0.55 }, g);
    } },
    { id: 'tuftL', parent: 'head', behind: true, pivot: [-50, -240], draw(g) { s('path', ink({ d: 'M-70 -228 L-86 -282 L-34 -246 Z', fill: OWL.dark }), g); } },
    { id: 'tuftR', parent: 'head', behind: true, pivot: [50, -240], base: { r: 8 }, draw(g) { s('path', ink({ d: 'M70 -230 L80 -272 L36 -248 Z', fill: OWL.dark }), g); } },
    { id: 'eyes', parent: 'head', pivot: [0, -196], draw(g) {
      for (const ex of [-30, 30]) s('circle', ink({ cx: ex, cy: -196, r: 25, fill: C.white }, 3.5), g);
    } },
    { id: 'pupils', parent: 'eyes', draw(g) {
      for (const ex of [-30, 30]) { s('circle', { cx: ex, cy: -194, r: 12.5, fill: INK }, g); s('circle', { cx: ex - 4, cy: -199, r: 4.5, fill: C.white }, g); }
    } },
    { id: 'lids', parent: 'eyes', pivot: [0, -222], draw(g) {
      // Each lid is a disc over the eye, scaled down from the top of the eye.
      for (const ex of [-30, 30]) s('circle', ink({ cx: ex, cy: -196, r: 26, fill: '#e5d2ae' }, 3.5), g);
    } },
    { id: 'happy', parent: 'head', act: { o: 0 }, draw(g) {
      for (const ex of [-30, 30]) {
        s('circle', { cx: ex, cy: -196, r: 27, fill: OWL.face }, g);
        s('path', ink({ d: `M${ex - 18} -190 Q${ex} -212 ${ex + 18} -190`, fill: 'none' }, 5), g);
      }
    } },
    { id: 'jaw', parent: 'head', pivot: [0, -168], draw(g) { s('path', ink({ d: 'M-9 -168 L9 -168 L0 -153 Z', fill: '#c48f45' }, 3), g); } },
    { id: 'beak', parent: 'head', draw(g) { s('path', ink({ d: 'M-13 -176 L13 -176 L0 -156 Z', fill: C.ochre }, 3), g); } },
    // The scarf sits over the neck, knotted on the owl's left: a specific, asymmetric detail.
    { id: 'scarf', parent: 'body', draw(g) {
      s('path', ink({ d: 'M-56 -142 Q0 -118 56 -142 L54 -124 Q0 -100 -54 -124 Z', fill: C.teal }, 3.5), g);
      s('path', ink({ d: 'M-40 -124 l-14 46 l20 -4 l6 -40 z', fill: C.teal }, 3), g);
      s('path', { d: 'M-50 -96 h16 M-48 -88 h14', stroke: '#e3ece9', 'stroke-width': 3, 'stroke-linecap': 'round' }, g);
    } },
  ],
  idle(rig, dt, t) {
    const calm = rig.calm ? 0.6 : 1;
    breathe(rig, 'body', t, 4.2, 0.016 * calm);
    // A slow, curious sway of the head; the tufts follow a beat later (follow-through).
    const sway = Math.sin((t * 2 * Math.PI) / 7.5) * 2.5 * calm;
    rig.parts.head.idle.r = sway;
    rig.parts.tuftL.idle.r = Math.sin((t * 2 * Math.PI) / 7.5 - 0.9) * 4 * calm;
    rig.parts.tuftR.idle.r = Math.sin((t * 2 * Math.PI) / 7.5 - 1.1) * 5 * calm;
    rig.state.slowBlink = true; // warm, unhurried blinks
    blink(rig, dt, 'lids');
    gaze(rig, 'eyes', 'pupils', 8);
    if (talking(rig, 'jaw', t, 7)) rig.parts.head.idle.ty = Math.sin(t * 6.5) * 1.5;
  },
};

export function makeOwl(parent, x, y, scale = 1, calm = false) {
  const rig = makeRig(parent, OWL_DEF, x, y, scale);
  rig.calm = calm;
  const k = calm ? 0.6 : 1;
  Object.assign(rig, {
    lookAt(p) { rig.state.look = p; },
    talk(ms) { rig.state.talkUntil = performance.now() + ms; },
    // Points a wing towards a stage position (right wing: the activity is to the owl's right).
    point(p) {
      const w = rig.world('wingR');
      const a = (Math.atan2(p.y - w.y, p.x - w.x) * 180) / Math.PI;
      const r = Math.max(-150, Math.min(10, a - 90));
      rig.lookAt(p);
      return rig.to('wingR', { r }, 650, 'sine');
    },
    rest() { return rig.all([['wingR', { r: 0 }], ['wingL', { r: 0 }], ['head', { r: 0, ty: 0 }]], 700, 'sine'); },
    // A warm nod with closed, smiling eyes: anticipation (dip), nod, settle.
    async nod() {
      rig.to('happy', { o: 1 }, 200);
      rig.to('eyes', { o: 0 }, 200);
      await rig.seq([
        [[['head', { ty: -4 * k, r: -3 * k }]], 220, 'out'],
        [[['head', { ty: 10 * k, r: 2 * k }], ['body', { sy: 0.97 }]], 300, 'sine'],
        [[['head', { ty: -2 * k, r: 0 }], ['body', { sy: 1 }]], 320, 'sine'],
        [[['head', { ty: 0 }]], 260, 'sine'],
      ]);
      await new Promise((r) => setTimeout(r, 400));
      rig.to('happy', { o: 0 }, 250);
      await rig.to('eyes', { o: 1 }, 250);
    },
    // Hmm: head tilts, a wing goes to the chin, eyes look up. Thinking, not disappointment.
    async think() {
      rig.state.look = null;
      // Pose to read: tilted head, eyes up, one wing lifted a little away from the body.
      await rig.all([['head', { r: -12 * k }], ['wingR', { r: -38 }], ['tuftR', { r: 10 }], ['pupils', { tx: -4, ty: -8 }]], 700, 'sine');
      await new Promise((r) => setTimeout(r, 700));
      await rig.all([['head', { r: 0 }], ['wingR', { r: 0 }], ['tuftR', { r: 0 }], ['pupils', { tx: 0, ty: 0 }]], 700, 'sine');
    },
    // A small hop of joy with anticipation and a soft landing (end of a lesson).
    async hop() {
      rig.to('happy', { o: 1 }, 200); rig.to('eyes', { o: 0 }, 200);
      await rig.seq([
        [[['body', { sy: 0.92, sx: 1.04 }]], 220, 'out'],
        [[['body', { ty: -34 * k, sy: 1.05, sx: 0.98 }], ['wingL', { r: 30 }], ['wingR', { r: -30 }]], 320, 'out'],
        [[['body', { ty: 0, sy: 0.95, sx: 1.03 }], ['wingL', { r: 0 }], ['wingR', { r: 0 }]], 300, 'in'],
        [[['body', { sy: 1, sx: 1 }]], 380, 'back'],
      ]);
      rig.to('happy', { o: 0 }, 300); rig.to('eyes', { o: 1 }, 300);
    },
  });
  return rig;
}

// =============================================================================
// FOX — the friend who asks for things
// =============================================================================
const FOX = { fur: C.terra, dark: '#9d5a46', white: '#f8efe2' };

const FOX_DEF = {
  parts: [
    { id: 'tail', pivot: [44, -30], draw(g) {
      s('path', ink({ d: 'M40 -24 C110 -20 136 -90 108 -150 C96 -176 70 -174 76 -150 C92 -100 74 -64 34 -56 Z', fill: FOX.fur }), g);
      s('path', ink({ d: 'M108 -150 C96 -176 70 -174 76 -150 C82 -138 98 -132 108 -150 Z', fill: FOX.white }, 3), g);
    } },
    { id: 'body', pivot: [0, 0], draw(g) {
      s('path', ink({ d: 'M-62 -6 C-74 -70 -50 -130 0 -132 C50 -130 74 -70 62 -6 C44 8 -44 8 -62 -6 Z', fill: FOX.fur }), g);
      s('path', { d: 'M-30 -10 C-40 -50 -28 -104 0 -112 C28 -104 40 -50 30 -10 Z', fill: FOX.white }, g);
      for (const fx of [-30, 30]) s('path', ink({ d: `M${fx - 16} 0 q16 -16 32 0 z`, fill: FOX.dark }, 3), g);
    } },
    { id: 'pawL', parent: 'body', pivot: [-36, -96], draw(g) { s('path', ink({ d: 'M-44 -96 C-50 -60 -46 -30 -36 -8 L-20 -10 C-24 -40 -26 -70 -28 -96 Z', fill: FOX.fur }, 3.5), g); } },
    { id: 'pawR', parent: 'body', pivot: [36, -96], draw(g) { s('path', ink({ d: 'M44 -96 C50 -60 46 -30 36 -8 L20 -10 C24 -40 26 -70 28 -96 Z', fill: FOX.fur }, 3.5), g); } },
    { id: 'head', parent: 'body', pivot: [0, -124], draw(g) {
      // Fluffy cheeks give the head its fox silhouette.
      s('path', ink({ d: 'M-74 -176 C-76 -222 -40 -238 0 -238 C40 -238 76 -222 74 -176 C88 -160 72 -150 58 -146 C40 -122 -40 -122 -58 -146 C-72 -150 -88 -160 -74 -176 Z', fill: FOX.fur }), g);
      s('path', { d: 'M-58 -150 C-44 -170 -16 -172 0 -150 C16 -172 44 -170 58 -150 C40 -126 -40 -126 -58 -150 Z', fill: FOX.white }, g);
      s('ellipse', ink({ cx: 0, cy: -152, rx: 11, ry: 8, fill: INK }, 2), g);
      s('path', ink({ d: 'M-12 -138 q12 10 24 0', fill: 'none' }, 3), g);
      s('circle', { cx: -46, cy: -160, r: 8, fill: C.rose, opacity: 0.5 }, g);
      s('circle', { cx: 46, cy: -160, r: 8, fill: C.rose, opacity: 0.5 }, g);
    } },
    { id: 'earL', parent: 'head', behind: true, pivot: [-40, -226], draw(g) {
      s('path', ink({ d: 'M-64 -214 L-58 -284 L-18 -232 Z', fill: FOX.fur }), g);
      s('path', { d: 'M-54 -226 L-54 -266 L-32 -236 Z', fill: FOX.dark }, g);
    } },
    { id: 'earR', parent: 'head', behind: true, pivot: [40, -226], base: { r: 6 }, draw(g) {
      s('path', ink({ d: 'M64 -214 L58 -284 L18 -232 Z', fill: FOX.fur }), g);
      s('path', { d: 'M54 -226 L54 -266 L32 -236 Z', fill: FOX.dark }, g);
    } },
    { id: 'eyes', parent: 'head', pivot: [0, -188], draw(g) { for (const ex of [-28, 28]) s('ellipse', { cx: ex, cy: -188, rx: 10, ry: 12, fill: INK }, g); } },
    { id: 'pupils', parent: 'eyes', draw(g) { for (const ex of [-28, 28]) s('circle', { cx: ex - 3, cy: -192, r: 3.5, fill: C.white }, g); } },
    { id: 'lids', parent: 'eyes', pivot: [0, -201], draw(g) { for (const ex of [-28, 28]) s('rect', { x: ex - 13, y: -201, width: 26, height: 26, rx: 12, fill: FOX.fur }, g); } },
    { id: 'happy', parent: 'head', act: { o: 0 }, draw(g) {
      for (const ex of [-28, 28]) { s('rect', { x: ex - 14, y: -204, width: 28, height: 30, rx: 12, fill: FOX.fur }, g); s('path', ink({ d: `M${ex - 12} -184 Q${ex} -200 ${ex + 12} -184`, fill: 'none' }, 4.5), g); }
    } },
    { id: 'jaw', parent: 'head', pivot: [0, -138], draw() {} },
  ],
  idle(rig, dt, t) {
    const calm = rig.calm ? 0.6 : 1;
    breathe(rig, 'body', t, 2.8, 0.02 * calm); // quicker breathing: an eager character
    rig.parts.tail.idle.r = Math.sin((t * 2 * Math.PI) / 2.6) * 7 * calm + (rig.state.wag ? Math.sin(t * 14) * 14 * calm : 0);
    // Ear flicks now and then (secondary action).
    rig.state.flick ??= rnd(2, 5);
    rig.state.flick -= dt;
    if (rig.state.flick <= 0) { rig.state.flickT = 0; rig.state.flick = rnd(3, 7); rig.state.flickEar = Math.random() < 0.5 ? 'earL' : 'earR'; }
    if (rig.state.flickT !== undefined) {
      rig.state.flickT += dt;
      const k = rig.state.flickT / 0.3;
      rig.parts[rig.state.flickEar].idle.r = Math.sin(Math.min(1, k) * Math.PI) * (rig.state.flickEar === 'earL' ? -14 : 14);
      if (k >= 1) rig.state.flickT = undefined;
    }
    blink(rig, dt, 'lids');
    gaze(rig, 'eyes', 'pupils', 3);
  },
};

export function makeFox(parent, x, y, scale = 1, calm = false) {
  const rig = makeRig(parent, FOX_DEF, x, y, scale);
  rig.calm = calm;
  const k = calm ? 0.6 : 1;
  Object.assign(rig, {
    lookAt(p) { rig.state.look = p; },
    // Leans towards something arriving (anticipation of receiving).
    lean(on) { return rig.all([['head', { r: on ? -8 * k : 0, tx: on ? -6 * k : 0 }], ['pawL', { r: on ? 18 : 0 }]], 300, 'out'); },
    // Joy: crouch, little hop, tail wag, settle.
    async happy() {
      rig.state.wag = true;
      rig.to('happy', { o: 1 }, 150); rig.to('eyes', { o: 0 }, 150);
      await rig.seq([
        [[['body', { sy: 0.92, sx: 1.05 }]], 160, 'out'],
        [[['body', { ty: -30 * k, sy: 1.06, sx: 0.97 }], ['pawL', { r: 30 }], ['pawR', { r: -30 }], ['earL', { r: -10 }], ['earR', { r: 10 }]], 260, 'out'],
        [[['body', { ty: 0, sy: 0.95, sx: 1.03 }], ['pawL', { r: 0 }], ['pawR', { r: 0 }], ['earL', { r: 0 }], ['earR', { r: 0 }]], 240, 'in'],
        [[['body', { sy: 1, sx: 1 }]], 320, 'back'],
      ]);
      await new Promise((r) => setTimeout(r, 600));
      rig.state.wag = false;
      rig.to('happy', { o: 0 }, 200); rig.to('eyes', { o: 1 }, 200);
    },
    // Puzzled: a head tilt with one ear down. Not sad, just "hmm, not quite".
    async puzzled() {
      await rig.all([['head', { r: 12 * k }], ['earL', { r: -20 }]], 350, 'out');
      await new Promise((r) => setTimeout(r, 900));
      await rig.all([['head', { r: 0 }], ['earL', { r: 0 }]], 400, 'sine');
    },
  });
  return rig;
}

// =============================================================================
// AVATARS — the child's animal (static drawing with a soft CSS blink)
// =============================================================================
function eyes(g, x, y, r, face, gap = 0.36, size = 0.17) {
  const delay = (Math.random() * 4).toFixed(2);
  for (const sx of [-1, 1]) {
    const ex = x + sx * r * gap, ey = y - r * 0.08;
    s('circle', { cx: ex, cy: ey, r: r * size, fill: INK }, g);
    s('circle', { cx: ex - r * size * 0.3, cy: ey - r * size * 0.35, r: r * size * 0.35, fill: C.white }, g);
    s('rect', { x: ex - r * size * 1.3, y: ey - r * size * 1.3, width: r * size * 2.6, height: r * size * 2.6, fill: face, class: 'lid', style: `animation-delay:${delay}s` }, g);
  }
}
const smile = (g, x, y, r, w = 0.2) => s('path', ink({ d: `M${x - r * w} ${y + r * 0.3} q${r * w} ${r * 0.2} ${r * w * 2} 0`, fill: 'none' }, 3.5), g);
const cheeks = (g, x, y, r, spread = 0.62) => { for (const sx of [-1, 1]) s('circle', { cx: x + sx * r * spread, cy: y + r * 0.25, r: r * 0.13, fill: C.rose, opacity: 0.55 }, g); };

const AV = {
  fox(g, x, y, r) {
    for (const sx of [-1, 1]) {
      s('path', ink({ d: `M${x + sx * r * 0.85} ${y - r * 0.2} L${x + sx * r * 0.78} ${y - r * 1.2} L${x + sx * r * 0.2} ${y - r * 0.82} Z`, fill: C.terra }), g);
      s('path', { d: `M${x + sx * r * 0.7} ${y - r * 0.4} L${x + sx * r * 0.7} ${y - r * 0.98} L${x + sx * r * 0.36} ${y - r * 0.74} Z`, fill: '#9d5a46' }, g);
    }
    s('path', ink({ d: `M${x - r} ${y} C${x - r} ${y - r * 0.9} ${x + r} ${y - r * 0.9} ${x + r} ${y} C${x + r * 1.15} ${y + r * 0.25} ${x + r * 0.7} ${y + r * 0.35} ${x + r * 0.55} ${y + r * 0.45} C${x + r * 0.3} ${y + r * 0.85} ${x - r * 0.3} ${y + r * 0.85} ${x - r * 0.55} ${y + r * 0.45} C${x - r * 0.7} ${y + r * 0.35} ${x - r * 1.15} ${y + r * 0.25} ${x - r} ${y} Z`, fill: C.terra }), g);
    s('path', { d: `M${x - r * 0.7} ${y + r * 0.3} C${x - r * 0.4} ${y + r * 0.05} ${x - r * 0.1} ${y + r * 0.1} ${x} ${y + r * 0.35} C${x + r * 0.1} ${y + r * 0.1} ${x + r * 0.4} ${y + r * 0.05} ${x + r * 0.7} ${y + r * 0.3} C${x + r * 0.4} ${y + r * 0.75} ${x - r * 0.4} ${y + r * 0.75} ${x - r * 0.7} ${y + r * 0.3} Z`, fill: '#f8efe2' }, g);
    eyes(g, x, y, r, C.terra);
    s('ellipse', { cx: x, cy: y + r * 0.32, rx: r * 0.12, ry: r * 0.09, fill: INK }, g);
  },
  owl(g, x, y, r) {
    s('path', ink({ d: `M${x - r * 0.8} ${y - r * 0.6} L${x - r * 0.95} ${y - r * 1.2} L${x - r * 0.35} ${y - r * 0.85} Z M${x + r * 0.8} ${y - r * 0.6} L${x + r * 0.88} ${y - r * 1.12} L${x + r * 0.35} ${y - r * 0.85} Z`, fill: '#6c5242' }), g);
    s('circle', ink({ cx: x, cy: y, r, fill: '#8a6a52' }), g);
    s('path', { d: `M${x} ${y - r * 0.62} C${x - r * 0.25} ${y - r * 0.82} ${x - r * 0.82} ${y - r * 0.72} ${x - r * 0.82} ${y - r * 0.12} C${x - r * 0.82} ${y + r * 0.42} ${x - r * 0.3} ${y + r * 0.62} ${x} ${y + r * 0.7} C${x + r * 0.3} ${y + r * 0.62} ${x + r * 0.82} ${y + r * 0.42} ${x + r * 0.82} ${y - r * 0.12} C${x + r * 0.82} ${y - r * 0.72} ${x + r * 0.25} ${y - r * 0.82} ${x} ${y - r * 0.62} Z`, fill: '#f3e6cc' }, g);
    for (const sx of [-1, 1]) s('circle', ink({ cx: x + sx * r * 0.36, cy: y - r * 0.12, r: r * 0.28, fill: C.white }, 3), g);
    eyes(g, x, y, r, '#f3e6cc', 0.36, 0.15);
    s('path', ink({ d: `M${x - r * 0.12} ${y + r * 0.14} L${x + r * 0.12} ${y + r * 0.14} L${x} ${y + r * 0.38} Z`, fill: C.ochre }, 3), g);
  },
  turtle(g, x, y, r) {
    s('circle', ink({ cx: x, cy: y + r * 0.08, r: r * 0.92, fill: '#9cbf86' }), g);
    // A shell cap: the turtle's own shell worn like a helmet
    s('path', ink({ d: `M${x - r * 0.98} ${y - r * 0.2} C${x - r * 0.9} ${y - r * 1.2} ${x + r * 0.9} ${y - r * 1.2} ${x + r * 0.98} ${y - r * 0.2} Z`, fill: '#7a8f5a' }), g);
    for (const [dx, dy] of [[-0.45, -0.45], [0, -0.68], [0.45, -0.45]]) s('path', ink({ d: `M${x + dx * r - r * 0.17} ${y + dy * r} l${r * 0.17} ${-r * 0.13} l${r * 0.17} ${r * 0.13} l${-r * 0.06} ${r * 0.17} h${-r * 0.22} z`, fill: '#97a96e' }, 2.5), g);
    eyes(g, x, y + r * 0.15, r, '#9cbf86');
    smile(g, x, y + r * 0.2, r); cheeks(g, x, y + r * 0.2, r);
  },
  cat(g, x, y, r) {
    for (const sx of [-1, 1]) {
      s('path', ink({ d: `M${x + sx * r * 0.9} ${y - r * 0.25} L${x + sx * r * 0.72} ${y - r * 1.15} L${x + sx * r * 0.2} ${y - r * 0.85} Z`, fill: C.ochre }), g);
      s('path', { d: `M${x + sx * r * 0.72} ${y - r * 0.45} L${x + sx * r * 0.66} ${y - r * 0.92} L${x + sx * r * 0.38} ${y - r * 0.78} Z`, fill: C.rose }, g);
    }
    s('ellipse', ink({ cx: x, cy: y + r * 0.05, rx: r * 1.02, ry: r * 0.9, fill: C.ochre }), g);
    s('path', { d: `M${x - r * 0.2} ${y - r * 0.82} l${r * 0.08} ${r * 0.28} M${x} ${y - r * 0.85} v${r * 0.3} M${x + r * 0.2} ${y - r * 0.82} l${-r * 0.08} ${r * 0.28}`, stroke: '#b58434', 'stroke-width': 5, 'stroke-linecap': 'round' }, g);
    eyes(g, x, y, r, C.ochre);
    s('path', ink({ d: `M${x - r * 0.08} ${y + r * 0.18} h${r * 0.16} l${-r * 0.08} ${r * 0.1} z`, fill: C.rose }, 2.5), g);
    s('path', { d: `M${x - r * 0.3} ${y + r * 0.28} h${-r * 0.5} M${x - r * 0.3} ${y + r * 0.38} l${-r * 0.45} ${r * 0.12} M${x + r * 0.3} ${y + r * 0.28} h${r * 0.5} M${x + r * 0.3} ${y + r * 0.38} l${r * 0.45} ${r * 0.12}`, stroke: INK, 'stroke-width': 2.5, 'stroke-linecap': 'round' }, g);
    smile(g, x, y + r * 0.05, r, 0.12);
  },
  frog(g, x, y, r) {
    for (const sx of [-1, 1]) s('circle', ink({ cx: x + sx * r * 0.48, cy: y - r * 0.62, r: r * 0.36, fill: '#8fae74' }), g);
    s('ellipse', ink({ cx: x, cy: y + r * 0.08, rx: r * 1.12, ry: r * 0.82, fill: '#8fae74' }), g);
    for (const sx of [-1, 1]) s('circle', { cx: x + sx * r * 0.48, cy: y - r * 0.62, r: r * 0.24, fill: C.white }, g);
    eyes(g, x, y - r * 0.55, r, '#8fae74', 0.48, 0.15);
    s('path', ink({ d: `M${x - r * 0.62} ${y + r * 0.18} Q${x} ${y + r * 0.62} ${x + r * 0.62} ${y + r * 0.18}`, fill: 'none' }, 3.5), g);
    cheeks(g, x, y + r * 0.05, r, 0.78);
  },
  bear(g, x, y, r) {
    for (const sx of [-1, 1]) { s('circle', ink({ cx: x + sx * r * 0.72, cy: y - r * 0.72, r: r * 0.32, fill: '#a07856' }), g); s('circle', { cx: x + sx * r * 0.72, cy: y - r * 0.72, r: r * 0.16, fill: '#c9a07a' }, g); }
    s('circle', ink({ cx: x, cy: y, r, fill: '#a07856' }), g);
    s('ellipse', ink({ cx: x, cy: y + r * 0.35, rx: r * 0.42, ry: r * 0.32, fill: '#e3c6a4' }, 3), g);
    eyes(g, x, y - r * 0.05, r, '#a07856');
    s('ellipse', { cx: x, cy: y + r * 0.22, rx: r * 0.13, ry: r * 0.09, fill: INK }, g);
    s('path', ink({ d: `M${x - r * 0.14} ${y + r * 0.44} q${r * 0.14} ${r * 0.12} ${r * 0.28} 0`, fill: 'none' }, 3), g);
  },
  whale(g, x, y, r) {
    // Water spout: a little fountain on top
    s('path', ink({ d: `M${x} ${y - r * 0.85} q-${r * 0.05} -${r * 0.35} -${r * 0.35} -${r * 0.42} M${x} ${y - r * 0.85} q${r * 0.05} -${r * 0.35} ${r * 0.35} -${r * 0.42} M${x} ${y - r * 0.85} v-${r * 0.45}`, fill: 'none', stroke: C.sky }, 5), g);
    s('path', ink({ d: `M${x - r * 1.1} ${y + r * 0.2} C${x - r * 1.1} ${y - r * 0.95} ${x + r * 1.1} ${y - r * 0.95} ${x + r * 1.1} ${y + r * 0.2} C${x + r * 1.05} ${y + r * 0.8} ${x - r * 1.05} ${y + r * 0.8} ${x - r * 1.1} ${y + r * 0.2} Z`, fill: C.blue }), g);
    s('path', { d: `M${x - r * 0.9} ${y + r * 0.4} C${x - r * 0.4} ${y + r * 0.72} ${x + r * 0.4} ${y + r * 0.72} ${x + r * 0.9} ${y + r * 0.4} C${x + r * 0.6} ${y + r * 0.62} ${x - r * 0.6} ${y + r * 0.62} ${x - r * 0.9} ${y + r * 0.4} Z`, fill: '#c9d9e4' }, g);
    eyes(g, x, y - r * 0.05, r, C.blue, 0.42);
    smile(g, x, y + r * 0.0, r, 0.25); cheeks(g, x, y - r * 0.05, r, 0.7);
  },
  bee(g, x, y, r) {
    for (const sx of [-1, 1]) s('ellipse', ink({ cx: x + sx * r * 0.85, cy: y - r * 0.65, rx: r * 0.42, ry: r * 0.26, fill: '#eef3f5', transform: `rotate(${sx * -30} ${x + sx * r * 0.85} ${y - r * 0.65})`, opacity: 0.9 }, 3), g);
    for (const sx of [-1, 1]) { s('path', ink({ d: `M${x + sx * r * 0.25} ${y - r * 0.85} q${sx * r * 0.1} -${r * 0.35} ${sx * r * 0.32} -${r * 0.42}`, fill: 'none' }, 3.5), g); s('circle', { cx: x + sx * r * 0.58, cy: y - r * 1.28, r: r * 0.1, fill: INK }, g); }
    s('circle', ink({ cx: x, cy: y, r, fill: '#e8c56a' }), g);
    s('path', { d: `M${x - r * 0.62} ${y - r * 0.78} Q${x} ${y - r * 0.6} ${x + r * 0.62} ${y - r * 0.78} L${x + r * 0.8} ${y - r * 0.56} Q${x} ${y - r * 0.36} ${x - r * 0.8} ${y - r * 0.56} Z`, fill: INK, opacity: 0.75 }, g);
    eyes(g, x, y + r * 0.05, r, '#e8c56a');
    smile(g, x, y + r * 0.08, r); cheeks(g, x, y + r * 0.08, r);
  },
};

export function avatar(g, kind, x, y, r) {
  (AV[kind] || AV.fox)(g, x, y, r);
}

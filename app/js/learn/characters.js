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
import { shade, line, ground, fluff } from './art.js';

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
const OWL = {
  body: '#8f6e55', bodyS: '#6f5458', dark: '#6f5243', darkS: '#56414a', line: '#4b372d',
  face: '#f4e7cd', faceS: '#e2cdb2', belly: '#efdfc2', bellyS: '#dcc5a8', iris: '#d99a3f',
};
// Mirrors a path made only of absolute commands with x,y pairs (M, L, C, Q, Z).
const mirror = (d) => { let i = 0; return d.replace(/-?\d+(\.\d+)?/g, (n) => (i++ % 2 === 0 ? String(-Number(n)) : n)); };
const owlWing = 'M-54 -118 C-92 -98 -98 -48 -76 -10 Q-70 -2 -66 -16 Q-60 -4 -56 -22 Q-50 -10 -47 -30 C-44 -64 -46 -96 -54 -118 Z';

const OWL_DEF = {
  parts: [
    { id: 'perch', draw(g) {
      const bark = shade(g, 'path', { d: 'M-118 2 Q0 -12 118 5 L116 17 Q0 5 -116 15 Z' }, { fill: '#a47c59', shadow: '#86624f', line: '#5e4434', w: 3, d: [0, 5] });
      line(bark, 'M-80 6 q14 -2 26 1 M20 2 q16 0 30 3', '#86624f', 2);
      shade(g, 'path', { d: 'M84 9 C92 -8 112 -14 128 -10 C120 6 104 14 84 9 Z' }, { fill: '#8fae74', shadow: '#6f9064', line: '#4f6b45', w: 2.5, d: [4, 4] });
      line(g, 'M88 8 Q106 -2 124 -9', '#4f6b45', 1.8);
    } },
    { id: 'body', parent: 'perch', pivot: [0, 0], draw(g) {
      const b = shade(g, 'path', { d: 'M-64 -8 C-76 -78 -54 -142 0 -146 C54 -142 76 -78 64 -8 C46 8 -46 8 -64 -8 Z' }, { fill: OWL.body, shadow: OWL.bodyS, line: OWL.line, w: 3.4, d: [12, 8], hi: [-28, -110, 30, 40] });
      shade(b, 'path', { d: 'M-40 -14 C-50 -60 -36 -104 0 -106 C36 -104 50 -60 40 -14 C26 -4 -26 -4 -40 -14 Z' }, { fill: OWL.belly, shadow: OWL.bellyS, d: [8, 6] });
      for (const [x, y] of [[-16, -86], [14, -86], [-26, -64], [0, -66], [26, -62], [-14, -42], [14, -42]]) line(b, `M${x - 6} ${y} L${x} ${y + 6} L${x + 6} ${y}`, '#c4a684', 2.6);
      // Feet gripping the perch: three round toes each.
      for (const fx of [-24, 22]) for (const t of [-8, 0, 8]) shade(g, 'ellipse', { cx: fx + t, cy: -1, rx: 5, ry: 6.5 }, { fill: '#dba552', shadow: '#bb8640', line: '#7d5a2c', w: 2, d: [2, 2] });
    } },
    { id: 'wingL', parent: 'body', pivot: [-56, -112], draw(g) {
      const w = shade(g, 'path', { d: owlWing }, { fill: OWL.dark, shadow: OWL.darkS, line: OWL.line, w: 3.2, d: [6, 6], hi: [-74, -84, 10, 22] });
      line(w, 'M-80 -66 Q-74 -46 -72 -26 M-68 -86 Q-62 -60 -60 -34', '#8a6b58', 2.6);
    } },
    { id: 'wingR', parent: 'body', pivot: [56, -112], draw(g) {
      const w = shade(g, 'path', { d: mirror(owlWing) }, { fill: OWL.dark, shadow: OWL.darkS, line: OWL.line, w: 3.2, d: [6, 6] });
      line(w, mirror('M-80 -66 Q-74 -46 -72 -26 M-68 -86 Q-62 -60 -60 -34'), '#8a6b58', 2.6);
    } },
    { id: 'head', parent: 'body', pivot: [0, -138], draw(g) {
      const h = shade(g, 'path', { d: 'M-82 -186 C-84 -236 -44 -256 0 -256 C44 -256 84 -236 82 -186 C80 -150 44 -132 0 -132 C-44 -132 -80 -150 -82 -186 Z' }, { fill: OWL.body, shadow: OWL.bodyS, line: OWL.line, w: 3.4, d: [12, 9], hi: [-34, -232, 34, 14] });
      // Heart-shaped facial disc with a soft rim.
      shade(h, 'path', { d: 'M0 -232 C-20 -248 -70 -242 -70 -196 C-70 -160 -30 -146 0 -142 C30 -146 70 -160 70 -196 C70 -242 20 -248 0 -232 Z' }, { fill: OWL.face, shadow: OWL.faceS, line: '#c9ac8c', w: 2.4, d: [7, 6] });
      s('ellipse', { cx: -50, cy: -166, rx: 10, ry: 7, fill: C.rose, opacity: 0.5 }, h);
      s('ellipse', { cx: 50, cy: -166, rx: 10, ry: 7, fill: C.rose, opacity: 0.5 }, h);
      // Brow feathers: give the face its kind, attentive expression.
      line(h, 'M-52 -230 Q-32 -240 -12 -228 M52 -230 Q32 -240 12 -228', '#a9876b', 3);
    } },
    { id: 'tuftL', parent: 'head', behind: true, pivot: [-50, -240], draw(g) { shade(g, 'path', { d: 'M-72 -226 Q-84 -258 -86 -284 Q-60 -266 -34 -246 Z' }, { fill: OWL.dark, shadow: OWL.darkS, line: OWL.line, w: 3, d: [5, 5] }); } },
    { id: 'tuftR', parent: 'head', behind: true, pivot: [50, -240], base: { r: 8 }, draw(g) { shade(g, 'path', { d: 'M72 -228 Q80 -254 80 -274 Q58 -262 36 -248 Z' }, { fill: OWL.dark, shadow: OWL.darkS, line: OWL.line, w: 3, d: [5, 5] }); } },
    { id: 'eyes', parent: 'head', pivot: [0, -196], draw(g) {
      for (const ex of [-30, 30]) s('circle', { cx: ex, cy: -196, r: 25, fill: '#fffaf0', stroke: OWL.line, 'stroke-width': 3.2 }, g);
    } },
    { id: 'pupils', parent: 'eyes', draw(g) {
      for (const ex of [-30, 30]) {
        s('circle', { cx: ex, cy: -194, r: 16, fill: OWL.iris }, g);
        s('circle', { cx: ex, cy: -194, r: 16, fill: 'none', stroke: '#b57a2e', 'stroke-width': 2 }, g);
        s('circle', { cx: ex, cy: -194, r: 9.5, fill: '#2f2722' }, g);
        s('circle', { cx: ex - 5, cy: -200, r: 4.6, fill: '#fffdf8' }, g);
        s('circle', { cx: ex + 5, cy: -189, r: 2, fill: '#fffdf8', opacity: 0.85 }, g);
      }
    } },
    { id: 'lids', parent: 'eyes', pivot: [0, -222], draw(g) {
      // Each lid is a disc over the eye, scaled down from the top of the eye.
      for (const ex of [-30, 30]) s('circle', { cx: ex, cy: -196, r: 26, fill: '#e6d1ae', stroke: OWL.line, 'stroke-width': 3.2 }, g);
    } },
    { id: 'happy', parent: 'head', act: { o: 0 }, draw(g) {
      for (const ex of [-30, 30]) {
        s('circle', { cx: ex, cy: -196, r: 27, fill: OWL.face }, g);
        line(g, `M${ex - 17} -190 Q${ex} -210 ${ex + 17} -190`, OWL.line, 5);
      }
    } },
    { id: 'jaw', parent: 'head', pivot: [0, -168], draw(g) { shade(g, 'path', { d: 'M-9 -168 L9 -168 L0 -153 Z' }, { fill: '#c08640', line: '#7d5a2c', w: 2.4 }); } },
    { id: 'beak', parent: 'head', draw(g) { shade(g, 'path', { d: 'M-13 -178 Q0 -182 13 -178 Q6 -166 0 -155 Q-6 -166 -13 -178 Z' }, { fill: '#e0aa52', shadow: '#bb8640', line: '#7d5a2c', w: 2.6, d: [4, 3] }); } },
    // The scarf sits over the neck, knotted on the owl's left: a specific, asymmetric detail.
    { id: 'scarf', parent: 'body', draw(g) {
      const sc = { fill: C.teal, shadow: '#4a6f77', line: '#36555a', w: 3, d: [6, 5] };
      const tail = shade(g, 'path', { d: 'M-40 -124 Q-50 -100 -56 -76 L-34 -80 Q-30 -100 -26 -122 Z' }, sc);
      line(tail, 'M-50 -96 L-32 -98 M-52 -87 L-33 -89', '#e3ece9', 3);
      const band = shade(g, 'path', { d: 'M-58 -142 Q0 -116 58 -142 L55 -122 Q0 -98 -55 -122 Z' }, sc);
      line(band, 'M-40 -128 Q0 -110 40 -128', '#7aa6a6', 2.2);
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
const FOX = { fur: '#cf7c5c', furS: '#a85e58', line: '#6b3a2e', white: '#fbf1e4', whiteS: '#e8d3c8', sock: '#5d3b33', inner: '#f2d6c4' };
const foxLeg = 'M-28 -108 C-44 -84 -46 -44 -42 -12 C-42 2 -14 3 -13 -8 C-15 -38 -16 -74 -22 -108 Z';
const foxEar = 'M-66 -208 L-62 -288 C-48 -276 -28 -252 -14 -228 Z';

const FOX_DEF = {
  parts: [
    { id: 'ground', draw(g) { ground(g, 14, 2, 96, 12); } },
    { id: 'tail', parent: 'body', behind: true, pivot: [44, -30], draw(g) {
      const t = shade(g, 'path', { d: 'M34 -22 C100 -12 144 -64 128 -124 C122 -148 102 -172 82 -168 C70 -150 92 -118 86 -92 C80 -66 60 -56 30 -54 Z' }, { fill: FOX.fur, shadow: FOX.furS, line: FOX.line, w: 3.4, d: [10, 8], hi: [92, -110, 12, 30] });
      // White tip, with a fluffy edge where it meets the orange.
      s('path', { d: `M60 -190 L150 -190 L150 -128${fluff(150, -128, 90, -150, 4, 7)} Z`, fill: FOX.white }, t);
      line(t, 'M58 -40 Q84 -50 100 -72 M92 -60 Q112 -80 116 -100', FOX.furS, 2.4);
    } },
    { id: 'body', pivot: [0, 0], draw(g) {
      const b = shade(g, 'path', { d: 'M-60 -6 C-72 -70 -48 -128 0 -130 C48 -128 72 -70 60 -6 C42 8 -42 8 -60 -6 Z' }, { fill: FOX.fur, shadow: FOX.furS, line: FOX.line, w: 3.4, d: [12, 6], hi: [-30, -100, 18, 34] });
      // Chest ruff, ending in a soft zigzag.
      shade(b, 'path', { d: `M-34 -116 C-20 -126 20 -126 34 -116 C42 -86 36 -58 24 -40${fluff(24, -40, -24, -40, 4, -9)} C-36 -58 -42 -86 -34 -116 Z` }, { fill: FOX.white, shadow: FOX.whiteS, d: [8, 6] });
      // Haunches.
      line(b, 'M-62 -34 Q-48 -60 -30 -46 M62 -34 Q48 -60 30 -46', FOX.furS, 2.6);
    } },
    { id: 'pawL', parent: 'body', pivot: [-31, -96], draw(g) {
      const l = shade(g, 'path', { d: foxLeg }, { fill: FOX.fur, shadow: FOX.furS, line: FOX.line, w: 3, d: [5, 0] });
      s('path', { d: 'M-60 -40 Q-50 -46 -40 -40 Q-30 -34 -20 -40 Q-14 -44 0 -40 L0 10 L-60 10 Z', fill: FOX.sock }, l); // dark "socks", a real fox marking
      line(l, 'M-34 -2 L-33 -9 M-25 -1 L-25 -8', '#8a5c4c', 2);
    } },
    { id: 'pawR', parent: 'body', pivot: [31, -96], draw(g) {
      const l = shade(g, 'path', { d: mirror(foxLeg) }, { fill: FOX.fur, shadow: FOX.furS, line: FOX.line, w: 3, d: [5, 0] });
      s('path', { d: 'M60 -40 Q50 -46 40 -40 Q30 -34 20 -40 Q14 -44 0 -40 L0 10 L60 10 Z', fill: FOX.sock }, l);
      line(l, 'M34 -2 L33 -9 M25 -1 L25 -8', '#8a5c4c', 2);
    } },
    { id: 'head', parent: 'body', pivot: [0, -124], draw(g) {
      // Cheek ruffs sweeping out to the sides give the head its fox silhouette.
      const h = shade(g, 'path', { d: 'M-70 -182 C-72 -224 -38 -242 0 -242 C38 -242 72 -224 70 -182 C78 -170 90 -158 94 -146 C76 -146 64 -140 54 -132 C36 -120 -36 -120 -54 -132 C-64 -140 -76 -146 -94 -146 C-90 -158 -78 -170 -70 -182 Z' }, { fill: FOX.fur, shadow: FOX.furS, line: FOX.line, w: 3.4, d: [12, 9], hi: [-28, -218, 34, 14] });
      shade(h, 'path', { d: 'M-96 -146 C-72 -150 -54 -170 -32 -170 C-16 -170 -6 -160 0 -152 C6 -160 16 -170 32 -170 C54 -170 72 -150 96 -146 C72 -128 40 -116 0 -116 C-40 -116 -72 -128 -96 -146 Z' }, { fill: FOX.white, shadow: FOX.whiteS, d: [8, 6] });
      s('ellipse', { cx: -48, cy: -158, rx: 10, ry: 6.5, fill: C.rose, opacity: 0.5 }, h);
      s('ellipse', { cx: 48, cy: -158, rx: 10, ry: 6.5, fill: C.rose, opacity: 0.5 }, h);
      shade(h, 'path', { d: 'M-12 -158 Q0 -162 12 -158 Q12 -148 0 -144 Q-12 -148 -12 -158 Z' }, { fill: '#3d2a25', line: '#2a1d19', w: 2 });
      s('ellipse', { cx: -4, cy: -156, rx: 3.5, ry: 2, fill: '#fffdf8', opacity: 0.6 }, h);
      line(h, 'M0 -144 L0 -137 M-12 -136 Q-6 -130 0 -137 Q6 -130 12 -136', FOX.line, 2.6);
      line(h, 'M-40 -214 Q-30 -220 -18 -215 M40 -214 Q30 -220 18 -215', FOX.furS, 3);
    } },
    { id: 'earL', parent: 'head', behind: true, pivot: [-40, -226], draw(g) {
      const e = shade(g, 'path', { d: foxEar }, { fill: FOX.fur, shadow: FOX.furS, line: FOX.line, w: 3.2, d: [6, 4] });
      s('path', { d: 'M-80 -300 L-20 -300 L-20 -264 Q-40 -258 -80 -262 Z', fill: FOX.sock }, e);
      s('path', { d: 'M-56 -222 L-55 -262 C-46 -252 -36 -240 -28 -230 Z', fill: FOX.inner }, e);
    } },
    { id: 'earR', parent: 'head', behind: true, pivot: [40, -226], base: { r: 6 }, draw(g) {
      const e = shade(g, 'path', { d: mirror(foxEar) }, { fill: FOX.fur, shadow: FOX.furS, line: FOX.line, w: 3.2, d: [6, 4] });
      s('path', { d: 'M80 -300 L20 -300 L20 -264 Q40 -258 80 -262 Z', fill: FOX.sock }, e);
      s('path', { d: 'M56 -222 L55 -262 C46 -252 36 -240 28 -230 Z', fill: FOX.inner }, e);
    } },
    { id: 'eyes', parent: 'head', pivot: [0, -190], draw(g) {
      for (const ex of [-28, 28]) { s('ellipse', { cx: ex, cy: -190, rx: 11, ry: 13.5, fill: '#3a2823' }, g); s('ellipse', { cx: ex, cy: -186, rx: 7, ry: 8, fill: '#6b4434' }, g); }
    } },
    { id: 'pupils', parent: 'eyes', draw(g) { for (const ex of [-28, 28]) { s('circle', { cx: ex - 3.5, cy: -195, r: 4, fill: '#fffdf8' }, g); s('circle', { cx: ex + 4, cy: -184, r: 1.8, fill: '#fffdf8', opacity: 0.8 }, g); } } },
    { id: 'lids', parent: 'eyes', pivot: [0, -204], draw(g) { for (const ex of [-28, 28]) s('rect', { x: ex - 14, y: -204, width: 28, height: 29, rx: 12, fill: FOX.fur }, g); } },
    { id: 'happy', parent: 'head', act: { o: 0 }, draw(g) {
      for (const ex of [-28, 28]) { s('rect', { x: ex - 15, y: -206, width: 30, height: 32, rx: 12, fill: FOX.fur }, g); line(g, `M${ex - 12} -186 Q${ex} -201 ${ex + 12} -186`, FOX.line, 4.5); }
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
// Eyes with catch-lights and a lid (the lid is a CSS-animated rect for the blink).
function eyes(g, x, y, r, face, gap = 0.36, size = 0.17, iris = '#3a2e27') {
  const delay = (Math.random() * 4).toFixed(2);
  for (const sx of [-1, 1]) {
    const ex = x + sx * r * gap, ey = y - r * 0.08, er = r * size;
    s('ellipse', { cx: ex, cy: ey, rx: er, ry: er * 1.12, fill: iris }, g);
    s('circle', { cx: ex - er * 0.32, cy: ey - er * 0.38, r: er * 0.38, fill: '#fffdf8' }, g);
    s('circle', { cx: ex + er * 0.34, cy: ey + er * 0.4, r: er * 0.15, fill: '#fffdf8', opacity: 0.85 }, g);
    s('rect', { x: ex - er * 1.3, y: ey - er * 1.45, width: er * 2.6, height: er * 2.9, fill: face, class: 'lid', style: `animation-delay:${delay}s` }, g);
  }
}
const smile = (g, x, y, r, col, w = 0.2) => line(g, `M${x - r * w} ${y + r * 0.3} Q${x} ${y + r * 0.46} ${x + r * w} ${y + r * 0.3}`, col, Math.max(2, r * 0.06));
const cheeks = (g, x, y, r, spread = 0.62) => { for (const sx of [-1, 1]) s('ellipse', { cx: x + sx * r * spread, cy: y + r * 0.25, rx: r * 0.14, ry: r * 0.1, fill: C.rose, opacity: 0.55 }, g); };
// A shaded round shape, lit from the upper left; returns the clipped inner group.
const ball = (g, tag, a, fill, shadow, ln, r) => shade(g, tag, a, { fill, shadow, line: ln, w: Math.max(2, r * 0.065), d: [r * 0.16, r * 0.13], hi: [(a.cx ?? 0) - r * 0.38, (a.cy ?? 0) - r * 0.48, r * 0.38, r * 0.2], lo: 0.3 });
const P = (pts) => pts.map((v) => (typeof v === 'number' ? v.toFixed(1) : v)).join(' ');

const AV = {
  fox(g, x, y, r) {
    const L = '#6b3a2e';
    for (const sx of [-1, 1]) {
      const e = shade(g, 'path', { d: P(['M', x + sx * r * 0.88, y - r * 0.2, 'L', x + sx * r * 0.8, y - r * 1.22, 'Q', x + sx * r * 0.5, y - r * 1.0, x + sx * r * 0.18, y - r * 0.8, 'Z']) }, { fill: FOX.fur, shadow: FOX.furS, line: L, w: Math.max(2, r * 0.06), d: [r * 0.08, r * 0.06] });
      s('path', { d: P(['M', x + sx * r * 0.72, y - r * 0.42, 'L', x + sx * r * 0.72, y - r * 0.98, 'L', x + sx * r * 0.38, y - r * 0.76, 'Z']), fill: FOX.inner }, e);
      s('path', { d: P(['M', x + sx * r * 1.0, y - r * 1.4, 'L', x + sx * r * 0.5, y - r * 1.4, 'L', x + sx * r * 0.62, y - r * 1.02, 'L', x + sx * r * 1.0, y - r * 1.0, 'Z']), fill: FOX.sock }, e);
    }
    const h = ball(g, 'path', { cx: x, cy: y, d: P(['M', x - r, y, 'C', x - r, y - r * 0.92, x + r, y - r * 0.92, x + r, y, 'C', x + r * 1.18, y + r * 0.26, x + r * 0.72, y + r * 0.36, x + r * 0.55, y + r * 0.46, 'C', x + r * 0.3, y + r * 0.86, x - r * 0.3, y + r * 0.86, x - r * 0.55, y + r * 0.46, 'C', x - r * 0.72, y + r * 0.36, x - r * 1.18, y + r * 0.26, x - r, y, 'Z']) }, FOX.fur, FOX.furS, L, r);
    s('path', { d: P(['M', x - r * 1.2, y + r * 0.28, 'C', x - r * 0.5, y + r * 0.02, x - r * 0.12, y + r * 0.08, x, y + r * 0.3, 'C', x + r * 0.12, y + r * 0.08, x + r * 0.5, y + r * 0.02, x + r * 1.2, y + r * 0.28, 'L', x, y + r, 'Z']), fill: FOX.white }, h);
    eyes(g, x, y, r, FOX.fur);
    s('ellipse', { cx: x, cy: y + r * 0.3, rx: r * 0.13, ry: r * 0.09, fill: '#3d2a25' }, g);
    cheeks(g, x, y + r * 0.02, r, 0.6);
  },
  owl(g, x, y, r) {
    for (const sx of [-1, 1]) shade(g, 'path', { d: P(['M', x + sx * r * 0.78, y - r * 0.55, 'Q', x + sx * r * 0.96, y - r * 0.9, x + sx * r * 0.98, y - r * 1.22, 'Q', x + sx * r * 0.6, y - r * 1.02, x + sx * r * 0.32, y - r * 0.84, 'Z']) }, { fill: OWL.dark, shadow: OWL.darkS, line: OWL.line, w: Math.max(2, r * 0.06), d: [r * 0.06, r * 0.06] });
    const h = ball(g, 'circle', { cx: x, cy: y, r }, OWL.body, OWL.bodyS, OWL.line, r);
    shade(h, 'path', { d: P(['M', x, y - r * 0.6, 'C', x - r * 0.25, y - r * 0.82, x - r * 0.84, y - r * 0.72, x - r * 0.84, y - r * 0.12, 'C', x - r * 0.84, y + r * 0.42, x - r * 0.3, y + r * 0.64, x, y + r * 0.72, 'C', x + r * 0.3, y + r * 0.64, x + r * 0.84, y + r * 0.42, x + r * 0.84, y - r * 0.12, 'C', x + r * 0.84, y - r * 0.72, x + r * 0.25, y - r * 0.82, x, y - r * 0.6, 'Z']) }, { fill: OWL.face, shadow: OWL.faceS, d: [r * 0.08, r * 0.08] });
    for (const sx of [-1, 1]) { s('circle', { cx: x + sx * r * 0.36, cy: y - r * 0.12, r: r * 0.29, fill: '#fffaf0', stroke: OWL.line, 'stroke-width': Math.max(1.5, r * 0.045) }, g); s('circle', { cx: x + sx * r * 0.36, cy: y - r * 0.1, r: r * 0.19, fill: OWL.iris }, g); }
    eyes(g, x, y, r, '#fffaf0', 0.36, 0.12, '#2f2722');
    shade(g, 'path', { d: P(['M', x - r * 0.13, y + r * 0.12, 'Q', x, y + r * 0.08, x + r * 0.13, y + r * 0.12, 'L', x, y + r * 0.4, 'Z']) }, { fill: '#e0aa52', shadow: '#bb8640', line: '#7d5a2c', w: Math.max(1.5, r * 0.04), d: [r * 0.04, r * 0.03] });
  },
  turtle(g, x, y, r) {
    const L = '#4f5f3a';
    // The shell rises behind the head like a little hill.
    const sh = shade(g, 'path', { d: P(['M', x - r * 1.15, y + r * 0.2, 'C', x - r * 1.1, y - r * 1.25, x + r * 1.1, y - r * 1.25, x + r * 1.15, y + r * 0.2, 'Z']) }, { fill: '#8a9e5e', shadow: '#6c7d55', line: L, w: Math.max(2, r * 0.065), d: [r * 0.14, r * 0.1], hi: [x - r * 0.5, y - r * 0.7, r * 0.35, r * 0.16] });
    for (const [dx, dy] of [[-0.62, -0.42], [0, -0.78], [0.62, -0.42]]) s('path', { d: P(['M', x + dx * r - r * 0.22, y + dy * r, 'L', x + dx * r, y + dy * r - r * 0.16, 'L', x + dx * r + r * 0.22, y + dy * r, 'L', x + dx * r + r * 0.14, y + dy * r + r * 0.2, 'L', x + dx * r - r * 0.14, y + dy * r + r * 0.2, 'Z']), fill: '#a7b878', stroke: L, 'stroke-width': Math.max(1.4, r * 0.035), 'stroke-linejoin': 'round' }, sh);
    s('path', { d: P(['M', x - r * 1.15, y + r * 0.2, 'L', x + r * 1.15, y + r * 0.2]), stroke: '#d9c58f', 'stroke-width': r * 0.14, 'stroke-linecap': 'round' }, g);
    const h = ball(g, 'circle', { cx: x, cy: y + r * 0.2, r: r * 0.7 }, '#abc58e', '#8ca577', L, r * 0.7);
    eyes(g, x, y + r * 0.18, r, '#abc58e', 0.3, 0.13);
    smile(g, x, y + r * 0.18, r, L, 0.16); cheeks(g, x, y + r * 0.2, r, 0.46);
  },
  cat(g, x, y, r) {
    const L = '#7d5a2c';
    for (const sx of [-1, 1]) {
      const e = shade(g, 'path', { d: P(['M', x + sx * r * 0.92, y - r * 0.2, 'Q', x + sx * r * 0.9, y - r * 0.8, x + sx * r * 0.74, y - r * 1.16, 'Q', x + sx * r * 0.4, y - r * 1.0, x + sx * r * 0.18, y - r * 0.84, 'Z']) }, { fill: C.ochre, shadow: '#b8874a', line: L, w: Math.max(2, r * 0.06), d: [r * 0.08, r * 0.06] });
      s('path', { d: P(['M', x + sx * r * 0.74, y - r * 0.44, 'L', x + sx * r * 0.68, y - r * 0.94, 'L', x + sx * r * 0.38, y - r * 0.8, 'Z']), fill: '#eebcae' }, e);
    }
    const h = ball(g, 'ellipse', { cx: x, cy: y + r * 0.05, rx: r * 1.04, ry: r * 0.9 }, C.ochre, '#b8874a', L, r);
    line(h, P(['M', x - r * 0.24, y - r * 0.86, 'L', x - r * 0.16, y - r * 0.56, 'M', x, y - r * 0.9, 'L', x, y - r * 0.58, 'M', x + r * 0.24, y - r * 0.86, 'L', x + r * 0.16, y - r * 0.56, 'M', x - r * 1.05, y - r * 0.05, 'L', x - r * 0.78, y - r * 0.02, 'M', x + r * 1.05, y - r * 0.05, 'L', x + r * 0.78, y - r * 0.02]), '#b07a35', Math.max(2, r * 0.07));
    s('ellipse', { cx: x, cy: y + r * 0.4, rx: r * 0.44, ry: r * 0.3, fill: '#f7e7c8' }, h);
    eyes(g, x, y, r, C.ochre, 0.38, 0.17, '#4d5a2f');
    s('path', { d: P(['M', x - r * 0.09, y + r * 0.2, 'L', x + r * 0.09, y + r * 0.2, 'L', x, y + r * 0.31, 'Z']), fill: '#d98b84' }, g);
    line(g, P(['M', x - r * 0.34, y + r * 0.3, 'L', x - r * 0.86, y + r * 0.24, 'M', x - r * 0.34, y + r * 0.4, 'L', x - r * 0.82, y + r * 0.5, 'M', x + r * 0.34, y + r * 0.3, 'L', x + r * 0.86, y + r * 0.24, 'M', x + r * 0.34, y + r * 0.4, 'L', x + r * 0.82, y + r * 0.5]), '#6b5440', Math.max(1.2, r * 0.03));
    line(g, P(['M', x, y + r * 0.31, 'L', x, y + r * 0.38, 'M', x - r * 0.12, y + r * 0.4, 'Q', x - r * 0.06, y + r * 0.46, x, y + r * 0.38, 'Q', x + r * 0.06, y + r * 0.46, x + r * 0.12, y + r * 0.4]), L, Math.max(1.5, r * 0.04));
  },
  frog(g, x, y, r) {
    const L = '#4f6b45', F = '#93b377', S = '#769a68';
    for (const sx of [-1, 1]) ball(g, 'circle', { cx: x + sx * r * 0.48, cy: y - r * 0.6, r: r * 0.36 }, F, S, L, r * 0.36);
    const h = ball(g, 'ellipse', { cx: x, cy: y + r * 0.1, rx: r * 1.12, ry: r * 0.8 }, F, S, L, r);
    s('ellipse', { cx: x, cy: y + r * 0.52, rx: r * 0.7, ry: r * 0.28, fill: '#cfe0b4' }, h);
    for (const sx of [-1, 1]) s('circle', { cx: x + sx * r * 0.48, cy: y - r * 0.62, r: r * 0.25, fill: '#fffaf0' }, g);
    eyes(g, x, y - r * 0.55, r, '#fffaf0', 0.48, 0.15);
    line(g, P(['M', x - r * 0.6, y + r * 0.16, 'Q', x, y + r * 0.58, x + r * 0.6, y + r * 0.16]), L, Math.max(2, r * 0.06));
    for (const sx of [-1, 1]) s('circle', { cx: x + sx * r * 0.1, cy: y - r * 0.04, r: r * 0.035, fill: L }, g);
    cheeks(g, x, y + r * 0.02, r, 0.78);
  },
  bear(g, x, y, r) {
    const L = '#5e4434', F = '#a47c59', S = '#86624f';
    for (const sx of [-1, 1]) { const e = ball(g, 'circle', { cx: x + sx * r * 0.72, cy: y - r * 0.72, r: r * 0.32 }, F, S, L, r * 0.32); s('circle', { cx: x + sx * r * 0.72, cy: y - r * 0.7, r: r * 0.16, fill: '#d6b08a' }, e); }
    ball(g, 'circle', { cx: x, cy: y, r }, F, S, L, r);
    shade(g, 'ellipse', { cx: x, cy: y + r * 0.36, rx: r * 0.44, ry: r * 0.33 }, { fill: '#e7cba9', shadow: '#d3b18e', line: L, w: Math.max(1.5, r * 0.04), d: [r * 0.06, r * 0.05] });
    eyes(g, x, y - r * 0.05, r, F);
    s('ellipse', { cx: x, cy: y + r * 0.24, rx: r * 0.14, ry: r * 0.1, fill: '#3d2a25' }, g);
    s('ellipse', { cx: x - r * 0.04, cy: y + r * 0.21, rx: r * 0.05, ry: r * 0.025, fill: '#fffdf8', opacity: 0.6 }, g);
    line(g, P(['M', x, y + r * 0.33, 'L', x, y + r * 0.42, 'M', x - r * 0.14, y + r * 0.44, 'Q', x - r * 0.07, y + r * 0.52, x, y + r * 0.42, 'Q', x + r * 0.07, y + r * 0.52, x + r * 0.14, y + r * 0.44]), L, Math.max(1.5, r * 0.045));
    cheeks(g, x, y, r, 0.64);
  },
  whale(g, x, y, r) {
    const L = '#3f5a70', F = '#7f9fba', S = '#62829f';
    line(g, P(['M', x - r * 0.15, y - r * 0.7, 'Q', x - r * 0.25, y - r * 1.05, x - r * 0.55, y - r * 1.12, 'M', x - r * 0.15, y - r * 0.7, 'Q', x - r * 0.05, y - r * 1.05, x + r * 0.25, y - r * 1.12, 'M', x - r * 0.15, y - r * 0.7, 'L', x - r * 0.15, y - r * 1.2]), C.sky, Math.max(2.5, r * 0.08));
    // Tail fluke flicking up behind the body.
    shade(g, 'path', { d: P(['M', x + r * 0.7, y + r * 0.1, 'Q', x + r * 1.0, y - r * 0.3, x + r * 0.92, y - r * 0.62, 'Q', x + r * 1.1, y - r * 0.56, x + r * 1.22, y - r * 0.74, 'Q', x + r * 1.2, y - r * 0.48, x + r * 1.06, y - r * 0.4, 'Q', x + r * 1.12, y - r * 0.1, x + r * 0.9, y + r * 0.3, 'Z']) }, { fill: F, shadow: S, line: L, w: Math.max(2, r * 0.06), d: [r * 0.06, r * 0.05] });
    const b = ball(g, 'path', { cx: x - r * 0.15, cy: y, d: P(['M', x - r * 1.12, y + r * 0.2, 'C', x - r * 1.12, y - r * 0.9, x + r * 0.9, y - r * 0.8, x + r * 0.98, y + r * 0.2, 'C', x + r * 0.9, y + r * 0.78, x - r * 1.05, y + r * 0.8, x - r * 1.12, y + r * 0.2, 'Z']) }, F, S, L, r);
    s('path', { d: P(['M', x - r * 1.2, y + r * 0.3, 'Q', x - r * 0.1, y + r * 0.5, x + r, y + r * 0.3, 'L', x + r, y + r, 'L', x - r * 1.2, y + r, 'Z']), fill: '#d3e0ea' }, b);
    line(b, P(['M', x - r * 0.6, y + r * 0.52, 'L', x - r * 0.56, y + r * 0.66, 'M', x - r * 0.3, y + r * 0.55, 'L', x - r * 0.28, y + r * 0.7, 'M', x, y + r * 0.55, 'L', x, y + r * 0.7]), '#a9bccb', Math.max(1.2, r * 0.035));
    eyes(g, x - r * 0.2, y - r * 0.02, r, F, 0.4);
    smile(g, x - r * 0.2, y - r * 0.02, r, L, 0.24); cheeks(g, x - r * 0.2, y - r * 0.05, r, 0.68);
  },
  bee(g, x, y, r) {
    const L = '#6b5426';
    for (const sx of [-1, 1]) shade(g, 'ellipse', { cx: x + sx * r * 0.86, cy: y - r * 0.66, rx: r * 0.44, ry: r * 0.27, transform: `rotate(${sx * -30} ${x + sx * r * 0.86} ${y - r * 0.66})` }, { fill: '#eef4f6', shadow: '#d6e2e8', line: '#8fa3ad', w: Math.max(1.5, r * 0.045), d: [r * 0.05, r * 0.05] });
    for (const sx of [-1, 1]) { line(g, P(['M', x + sx * r * 0.25, y - r * 0.86, 'Q', x + sx * r * 0.35, y - r * 1.2, x + sx * r * 0.56, y - r * 1.26]), L, Math.max(2, r * 0.06)); s('circle', { cx: x + sx * r * 0.58, cy: y - r * 1.28, r: r * 0.1, fill: '#4a3a22' }, g); }
    const h = ball(g, 'circle', { cx: x, cy: y, r }, '#ebc766', '#c9a052', L, r);
    // Stripes, clipped to the round body.
    for (const yy of [-0.62, 0.78]) s('rect', { x: x - r * 1.1, y: y + yy * r - r * 0.13, width: r * 2.2, height: r * 0.26, fill: '#5a4630', opacity: 0.85 }, h);
    eyes(g, x, y + r * 0.05, r, '#ebc766');
    smile(g, x, y + r * 0.06, r, L); cheeks(g, x, y + r * 0.06, r);
  },
};

export function avatar(g, kind, x, y, r) {
  (AV[kind] || AV.fox)(g, x, y, r);
}

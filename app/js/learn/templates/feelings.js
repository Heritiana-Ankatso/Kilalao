// Feelings (social-emotional) templates. Same contract as the math templates.
//   feelFind  – who feels {feel}? (naming emotions; emotion vocabulary)
//   feelScene – a small situation: how does your friend feel? Then why.
//   feelHelp  – your friend is sad: what could help? (empathy, kind action)
//   breathe   – calm breathing: smell the flower, blow out the candle
// Ideas behind them (see docs/BENCHMARK.md): naming feelings and linking
// them to causes is the core of early emotional literacy (as in Daniel
// Tiger, Sesame Street's "Breathe, Think, Do" and Khan Academy Kids); slow
// breathing is a simple self-regulation strategy children can use offline.
import { s, C, replay } from '../../lib.js';
import { avatar } from '../characters.js';
import { shade, line, ground } from '../art.js';
import { ink, card, shuffle, obj } from '../draw.js';

export const FEELINGS = ['happy', 'sad', 'angry', 'scared', 'surprised'];
const FACE_KINDS = {
  bear: { fill: '#a47c59', shadow: '#86624f', line: '#5e4434', ears: 'round', inner: '#d6b08a' },
  cat: { fill: '#d8a650', shadow: '#b8874a', line: '#7d5a2c', ears: 'point', inner: '#eebcae' },
  fox: { fill: '#cf7c5c', shadow: '#a85e58', line: '#6b3a2e', ears: 'point', inner: '#f2d6c4' },
  frog: { fill: '#93b377', shadow: '#769a68', line: '#4f6b45', ears: 'none', inner: '#cfe0b4' },
  bee: { fill: '#ebc766', shadow: '#c9a052', line: '#6b5426', ears: 'antenna', inner: '#5a4630' },
};
const faceKind = (k) => FACE_KINDS[k] || (k === 'owl' ? FACE_KINDS.bear : k === 'turtle' || k === 'whale' ? FACE_KINDS.frog : FACE_KINDS.bear);

// A round animal face showing one feeling. Features are exaggerated a little
// so young children can read them at a glance (brows, eyes, mouth, one extra cue).
export function feelFace(g, x, y, r, feeling, kind = 'bear') {
  const K = faceKind(kind);
  const w = Math.max(2, r * 0.06), L = K.line;
  if (K.ears === 'round') for (const sx of [-1, 1]) { shade(g, 'circle', { cx: x + sx * r * 0.72, cy: y - r * 0.72, r: r * 0.3 }, { fill: K.fill, shadow: K.shadow, line: L, w, d: [r * 0.05, r * 0.05] }); s('circle', { cx: x + sx * r * 0.72, cy: y - r * 0.7, r: r * 0.15, fill: K.inner }, g); }
  if (K.ears === 'point') for (const sx of [-1, 1]) shade(g, 'path', { d: `M${x + sx * r * 0.9} ${y - r * 0.25} Q${x + sx * r * 0.9} ${y - r * 0.85} ${x + sx * r * 0.76} ${y - r * 1.15} Q${x + sx * r * 0.42} ${y - r} ${x + sx * r * 0.2} ${y - r * 0.84} Z` }, { fill: K.fill, shadow: K.shadow, line: L, w, d: [r * 0.06, r * 0.05] });
  if (K.ears === 'antenna') for (const sx of [-1, 1]) { line(g, `M${x + sx * r * 0.25} ${y - r * 0.86} Q${x + sx * r * 0.35} ${y - r * 1.2} ${x + sx * r * 0.56} ${y - r * 1.26}`, L, w); s('circle', { cx: x + sx * r * 0.58, cy: y - r * 1.28, r: r * 0.1, fill: L }, g); }
  shade(g, 'circle', { cx: x, cy: y, r }, { fill: K.fill, shadow: K.shadow, line: L, w, d: [r * 0.15, r * 0.12], hi: [x - r * 0.38, y - r * 0.48, r * 0.36, r * 0.18], lo: 0.25 });
  const ex = r * 0.34, ey = y - r * 0.08, er = r * 0.12;
  const dot = (cx, rr = er) => { s('circle', { cx, cy: ey, r: rr, fill: '#2f2722' }, g); s('circle', { cx: cx - rr * 0.35, cy: ey - rr * 0.38, r: rr * 0.36, fill: '#fffdf8' }, g); };
  const brow = (d) => line(g, d, L, w * 1.4);
  const cheeks = (o = 0.5) => { for (const sx of [-1, 1]) s('ellipse', { cx: x + sx * r * 0.6, cy: y + r * 0.25, rx: r * 0.14, ry: r * 0.1, fill: C.rose, opacity: o }, g); };
  switch (feeling) {
    case 'happy':
      for (const sx of [-1, 1]) line(g, `M${x + sx * ex - er * 1.2} ${ey + er * 0.4} Q${x + sx * ex} ${ey - er * 1.4} ${x + sx * ex + er * 1.2} ${ey + er * 0.4}`, '#2f2722', w * 1.5);
      s('path', { d: `M${x - r * 0.36} ${y + r * 0.2} Q${x} ${y + r * 0.78} ${x + r * 0.36} ${y + r * 0.2} Z`, fill: '#7a3b35', stroke: L, 'stroke-width': w, 'stroke-linejoin': 'round' }, g);
      s('path', { d: `M${x - r * 0.16} ${y + r * 0.5} Q${x} ${y + r * 0.38} ${x + r * 0.16} ${y + r * 0.5} Q${x} ${y + r * 0.6} ${x - r * 0.16} ${y + r * 0.5} Z`, fill: '#e08f86' }, g);
      cheeks(0.7);
      break;
    case 'sad':
      for (const sx of [-1, 1]) { dot(x + sx * ex); brow(`M${x + sx * (ex + er * 1.6)} ${ey - er * 1.6} L${x + sx * (ex - er * 1.2)} ${ey - er * 2.8}`); }
      line(g, `M${x - r * 0.26} ${y + r * 0.48} Q${x} ${y + r * 0.26} ${x + r * 0.26} ${y + r * 0.48}`, '#2f2722', w * 1.4);
      s('path', { d: `M${x + ex + er * 0.4} ${ey + er * 1.4} q${-er * 0.8} ${er * 1.4} 0 ${er * 2} q${er * 0.8} ${-er * 0.6} 0 ${-er * 2} Z`, fill: '#9cc4dc', stroke: '#5f8fae', 'stroke-width': w * 0.6 }, g);
      break;
    case 'angry':
      for (const sx of [-1, 1]) { dot(x + sx * ex, er * 0.9); brow(`M${x + sx * (ex + er * 1.6)} ${ey - er * 2.6} L${x + sx * (ex - er * 1.4)} ${ey - er * 1.2}`); }
      s('rect', { x: x - r * 0.26, y: y + r * 0.3, width: r * 0.52, height: r * 0.16, rx: r * 0.06, fill: '#fffaf0', stroke: L, 'stroke-width': w }, g);
      line(g, `M${x - r * 0.1} ${y + r * 0.3} V${y + r * 0.46} M${x + r * 0.1} ${y + r * 0.3} V${y + r * 0.46}`, L, w * 0.7);
      for (const sx of [-1, 1]) s('ellipse', { cx: x + sx * r * 0.6, cy: y + r * 0.22, rx: r * 0.17, ry: r * 0.11, fill: '#d9665a', opacity: 0.55 }, g);
      break;
    case 'scared':
      for (const sx of [-1, 1]) { s('circle', { cx: x + sx * ex, cy: ey, r: er * 1.7, fill: '#fffaf0', stroke: L, 'stroke-width': w }, g); s('circle', { cx: x + sx * ex, cy: ey + er * 0.3, r: er * 0.6, fill: '#2f2722' }, g); brow(`M${x + sx * (ex + er * 1.6)} ${ey - er * 2.6} Q${x + sx * ex} ${ey - er * 3.6} ${x + sx * (ex - er * 1.6)} ${ey - er * 2.8}`); }
      line(g, `M${x - r * 0.28} ${y + r * 0.42} q${r * 0.07} ${-r * 0.09} ${r * 0.14} 0 q${r * 0.07} ${r * 0.09} ${r * 0.14} 0 q${r * 0.07} ${-r * 0.09} ${r * 0.14} 0 q${r * 0.07} ${r * 0.09} ${r * 0.14} 0`, '#2f2722', w * 1.3);
      s('path', { d: `M${x + r * 0.78} ${y - r * 0.5} q${-r * 0.1} ${r * 0.18} 0 ${r * 0.24} q${r * 0.1} ${-r * 0.06} 0 ${-r * 0.24} Z`, fill: '#9cc4dc', stroke: '#5f8fae', 'stroke-width': w * 0.6 }, g);
      break;
    case 'surprised':
      for (const sx of [-1, 1]) { s('circle', { cx: x + sx * ex, cy: ey, r: er * 1.5, fill: '#fffaf0', stroke: L, 'stroke-width': w }, g); dot(x + sx * ex, er * 0.85); brow(`M${x + sx * (ex + er * 1.5)} ${ey - er * 2.7} Q${x + sx * ex} ${ey - er * 4} ${x + sx * (ex - er * 1.5)} ${ey - er * 2.7}`); }
      s('ellipse', { cx: x, cy: y + r * 0.42, rx: r * 0.14, ry: r * 0.2, fill: '#7a3b35', stroke: L, 'stroke-width': w }, g);
      cheeks(0.45);
      break;
    default: for (const sx of [-1, 1]) dot(x + sx * ex);
  }
}

// ---------- Little situation scenes (no words) ----------
function scene(ctx, feeling, kind) {
  const L = ctx.layer, x = 640, y = 470;
  const stage = s('g', null, L);
  shade(stage, 'rect', { x: 330, y: 170, width: 940, height: 470, rx: 40 }, { fill: '#f6eedf', shadow: '#ead9bd', line: '#c9b48f', w: 3, d: [12, 10] });
  ground(stage, x, y + 110, 120, 16);
  const who = s('g', null, stage);
  avatar(who, kind, x, y, 92);
  const prop = s('g', null, stage);
  switch (feeling) {
    case 'sad': { // a balloon floats away
      const b = s('g', null, prop);
      shade(b, 'ellipse', { cx: x + 180, cy: y - 160, rx: 48, ry: 58 }, { fill: C.terra, shadow: '#a85e58', line: '#6b3a2e', w: 3, d: [8, 8], hi: [x + 165, y - 185, 14, 18] });
      line(b, `M${x + 180} ${y - 102} q-14 40 6 70 q14 30 -6 60`, '#6b5440', 2.5);
      b.style.transition = 'transform 3.5s ease-in-out'; requestAnimationFrame(() => requestAnimationFrame(() => { b.style.transform = 'translate(160px, -160px)'; }));
      break;
    }
    case 'happy': { // a present
      shade(prop, 'rect', { x: x + 150, y: y + 10, width: 150, height: 110, rx: 8 }, { fill: C.teal, shadow: '#4a6f77', line: '#36555a', w: 3, d: [10, 8] });
      s('rect', { x: x + 215, y: y + 10, width: 20, height: 110, fill: C.ochre }, prop);
      shade(prop, 'rect', { x: x + 140, y: y - 14, width: 170, height: 30, rx: 6 }, { fill: C.teal, shadow: '#4a6f77', line: '#36555a', w: 3, d: [6, 5] });
      s('path', { d: `M${x + 225} ${y - 14} q-40 -50 -50 -10 q10 14 50 10 q40 -50 50 -10 q-10 14 -50 10 Z`, fill: C.ochre, stroke: '#7d5a2c', 'stroke-width': 3 }, prop);
      break;
    }
    case 'angry': { // the tower was knocked down; a ball rolled into it
      [[x + 170, y + 92, 18], [x + 240, y + 100, -12], [x + 300, y + 88, 30], [x + 210, y + 50, 6]].forEach(([bx, by, rot], i) => shade(prop, 'rect', { x: bx - 26, y: by - 22, width: 52, height: 44, rx: 6, transform: `rotate(${rot} ${bx} ${by})` }, { fill: [C.terra, C.teal, C.ochre, C.plum][i], shadow: '#5a4a52', line: '#4a3f35', w: 3, d: [5, 4] }));
      obj(prop, 'ball', x + 380, y + 96, 1.0);
      break;
    }
    case 'scared': { // a storm cloud with lightning, above and beside the friend
      prop.setAttribute('transform', 'translate(170 -10)');
      shade(prop, 'path', { d: `M${x - 40} ${y - 170} q-10 -60 60 -60 q30 -50 90 -10 q70 -20 70 50 q40 20 0 50 h-200 q-40 -10 -20 -30 Z` }, { fill: '#8d96a3', shadow: '#727b8c', line: '#4d5562', w: 3, d: [10, 8] });
      s('path', { d: `M${x + 80} ${y - 130} l-30 60 h30 l-24 56 l60 -76 h-30 l20 -40 Z`, fill: '#f3d36b', stroke: '#9b7a25', 'stroke-width': 3, 'stroke-linejoin': 'round' }, prop);
      for (let i = 0; i < 6; i++) line(prop, `M${x - 20 + i * 40} ${y - 110} l-8 18`, '#7898b3', 3);
      break;
    }
    case 'surprised': { // a jack-in-the-box springs up
      shade(prop, 'rect', { x: x + 170, y: y + 20, width: 130, height: 100, rx: 8 }, { fill: C.plum, shadow: '#7c5f78', line: '#4f3a4c', w: 3, d: [10, 8] });
      line(prop, `M${x + 235} ${y + 20} q-20 -14 0 -26 q20 -14 0 -26 q-20 -14 0 -26 q20 -14 0 -26`, '#7a6455', 4);
      const head = s('g', { class: 'fb bob' }, prop);
      shade(head, 'circle', { cx: x + 235, cy: y - 110, r: 36 }, { fill: '#f3e6cc', shadow: '#e0ceb1', line: '#5a4636', w: 3, d: [6, 5] });
      s('path', { d: `M${x + 200} ${y - 130} L${x + 235} ${y - 180} L${x + 270} ${y - 130} Z`, fill: C.terra, stroke: '#6b3a2e', 'stroke-width': 3, 'stroke-linejoin': 'round' }, head);
      s('circle', { cx: x + 222, cy: y - 112, r: 4, fill: '#2f2722' }, head); s('circle', { cx: x + 248, cy: y - 112, r: 4, fill: '#2f2722' }, head);
      line(head, `M${x + 222} ${y - 96} Q${x + 235} ${y - 86} ${x + 248} ${y - 96}`, '#5a4636', 3);
      break;
    }
  }
  who.x = x; who.y = y; prop.x = x + 230; prop.y = y - 40;
  return { who, prop };
}

const SCENE_KEY = { sad: 'sceneSad', happy: 'sceneHappy', angry: 'sceneAngry', scared: 'sceneScared', surprised: 'sceneSurprised' };
const WHY_KEY = { sad: 'whySad', happy: 'whyHappy', angry: 'whyAngry', scared: 'whyScared', surprised: 'whySurprised' };

function faceChoices(ctx, rng, options, answer, kind, y = 780, size = 260) {
  const n = options.length, gap = 50, cards = {};
  options.forEach((f, i) => {
    const x = 800 + (i - (n - 1) / 2) * (size + gap);
    const c = card(ctx.layer, x, y, size, size * 0.72 + 30, C.white);
    feelFace(c.inner, x, y + 6, size * 0.27, f, kind);
    c.x = x; c.y = y;
    c.g.addEventListener('pointerdown', (e) => { e.preventDefault(); ctx.pick(f === answer, c); });
    if (f === answer) ctx.correct(c);
    cards[f] = c;
  });
  return cards;
}

export const TEMPLATES = {
  feelFind: {
    make(rng, P) {
      const pool = (P.feelings || FEELINGS).slice();
      const answer = pool[Math.floor(rng() * pool.length)];
      const others = shuffle(rng, pool.filter((f) => f !== answer)).slice(0, (P.choices || 3) - 1);
      const opts = shuffle(rng, [answer, ...others]);
      const kinds = Object.keys(FACE_KINDS);
      const kind = kinds[Math.floor(rng() * kinds.length)];
      return {
        key: 'whoFeels', vars: { feel: answer }, guess: 1 / opts.length,
        build(ctx) {
          const cards = {};
          opts.forEach((f, i) => {
            const x = 800 + (i - (opts.length - 1) / 2) * 400;
            const c = card(ctx.layer, x, 450, 340, 380, C.white);
            feelFace(c.inner, x, 470, 120, f, kind);
            c.x = x; c.y = 450;
            c.g.addEventListener('pointerdown', (e) => { e.preventDefault(); ctx.pick(f === answer, c); });
            if (f === answer) ctx.correct(c);
            cards[f] = c;
          });
          const name = async (f) => { await ctx.point(cards[f]); replay(cards[f].inner, 'hop'); ctx.say('feelIs', { feel: f }); await ctx.wait(1300); };
          return {
            fb: 'fbFeel',
            step: async () => { await name(others[0]); },
            help: async () => { for (const f of opts) await name(f); },
          };
        },
      };
    },
  },

  feelScene: {
    make(rng, P) {
      const pool = (P.feelings || FEELINGS).slice();
      const answer = pool[Math.floor(rng() * pool.length)];
      const others = shuffle(rng, FEELINGS.filter((f) => f !== answer)).slice(0, 2);
      const opts = shuffle(rng, [answer, ...others]);
      return {
        key: SCENE_KEY[answer], vars: {}, guess: 1 / 3,
        build(ctx) {
          const kind = ctx.friend || 'bear';
          const sc = scene(ctx, answer, kind);
          const cards = faceChoices(ctx, rng, opts, answer, kind);
          return {
            fb: 'fbFeel', ownFriend: true,
            cue: async () => { await ctx.point(sc.prop); replay(sc.prop, 'hop'); await ctx.wait(900); },
            help: async () => { await ctx.point(sc.prop); ctx.say(WHY_KEY[answer]); await ctx.wait(3600); await ctx.point(cards[answer]); ctx.say('feelIs', { feel: answer }); await ctx.wait(1300); },
          };
        },
      };
    },
  },

  feelHelp: {
    make(rng) {
      const kindFirst = rng() < 0.5;
      return {
        key: 'whatHelps', vars: {}, guess: 1 / 2,
        build(ctx) {
          const kind = ctx.friend || 'bear';
          const L = ctx.layer;
          const c0 = card(L, 800, 340, 360, 330, C.cream);
          feelFace(c0.inner, 800, 350, 110, 'sad', kind);
          const opts = kindFirst ? ['kind', 'away'] : ['away', 'kind'];
          const cards = {};
          opts.forEach((o, i) => {
            const x = 800 + (i - 0.5) * 560;
            const c = card(L, x, 760, 440, 230, C.white);
            if (o === 'kind') {
              // Two friends close together, with a heart: comfort.
              avatar(c.inner, ctx.avatar || 'bee', x - 70, 770, 58);
              feelFace(c.inner, x + 70, 770, 58, 'sad', kind);
              s('path', { d: `M${x} ${712} c-10 -14 -30 -4 -18 12 l18 18 l18 -18 c12 -16 -8 -26 -18 -12 Z`, fill: C.terra, stroke: '#6b3a2e', 'stroke-width': 2.5 }, c.inner);
            } else {
              // Walking away: the friend alone, the other one leaving with motion lines.
              feelFace(c.inner, x - 90, 770, 58, 'sad', kind);
              avatar(c.inner, ctx.avatar || 'bee', x + 110, 780, 46);
              line(c.inner, `M${x + 30} ${760} h30 M${x + 24} ${780} h30 M${x + 30} ${800} h30`, '#a9a39a', 4);
            }
            c.x = x; c.y = 760;
            c.g.addEventListener('pointerdown', (e) => { e.preventDefault(); ctx.pick(o === 'kind', c); });
            if (o === 'kind') ctx.correct(c);
            cards[o] = c;
          });
          return {
            fb: 'fbKind', ownFriend: true,
            help: async () => { await ctx.point(c0); ctx.say('feelIs', { feel: 'sad' }); await ctx.wait(1300); await ctx.point(cards.kind); ctx.say('helpKind'); await ctx.wait(3000); },
          };
        },
      };
    },
  },

  // Calm breathing: smell the flower (breathe in), blow out the candle (breathe out), three times.
  breathe: {
    make() {
      return {
        key: 'breatheStart', vars: {}, guess: 0.9,
        build(ctx) {
          const L = ctx.layer;
          const fl = card(L, 560, 470, 380, 420, '#f3ecdc');
          const ca = card(L, 1040, 470, 380, 420, '#f3ecdc');
          // Flower
          line(fl.inner, 'M560 620 Q556 540 560 480', '#5f7f55', 7);
          shade(fl.inner, 'path', { d: 'M560 560 Q520 530 530 510 Q550 520 560 560 Z' }, { fill: '#93b377', line: '#4f6b45', w: 2.5 });
          const petals = s('g', null, fl.inner);
          for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; shade(petals, 'circle', { cx: 560 + Math.cos(a) * 42, cy: 420 + Math.sin(a) * 42, r: 30 }, { fill: C.rose, shadow: '#c48f88', line: '#8a5a55', w: 2.5, d: [5, 4] }); }
          shade(petals, 'circle', { cx: 560, cy: 420, r: 24 }, { fill: C.ochre, shadow: '#b8874a', line: '#7d5a2c', w: 2.5, d: [4, 4] });
          // Candle
          shade(ca.inner, 'rect', { x: 1010, y: 480, width: 60, height: 150, rx: 10 }, { fill: '#f6efe0', shadow: '#e2d6bf', line: '#8a7a62', w: 3, d: [8, 0] });
          const flame = s('g', { class: 'fb' }, ca.inner);
          s('path', { d: 'M1040 400 Q1066 440 1056 462 Q1040 482 1024 462 Q1014 440 1040 400 Z', fill: '#f3c35d', stroke: '#c7802c', 'stroke-width': 3 }, flame);
          s('path', { d: 'M1040 430 Q1050 448 1046 458 Q1040 466 1034 458 Q1030 448 1040 430 Z', fill: '#fff1c4' }, flame);
          flame.style.transition = 'opacity .8s, transform .8s'; flame.style.transformOrigin = '1040px 470px';
          line(ca.inner, 'M1040 480 V466', '#4a3f35', 3);
          // A breath ring that grows (in) and shrinks (out).
          const ring = s('circle', { cx: 800, cy: 470, r: 30, fill: 'none', stroke: C.teal, 'stroke-width': 6, opacity: 0.5 }, L);
          ring.style.transition = 'r 3s ease-in-out';
          let phase = 'in', count = 0, done = false;
          const glow = (c, on) => { c.inner.classList.toggle('invite', on); };
          const next = () => { glow(fl, phase === 'in'); glow(ca, phase === 'out'); ctx.say(phase === 'in' ? 'smell' : 'blow'); };
          fl.x = 560; fl.y = 470; ca.x = 1040; ca.y = 470;
          const tapFlower = async () => {
            if (done || phase !== 'in') return;
            phase = 'busy'; glow(fl, false); replay(fl.inner, 'hop');
            ring.setAttribute('r', 150); petals.style.transition = 'transform 3s'; petals.style.transformOrigin = '560px 420px'; petals.style.transform = 'scale(1.12)';
            flame.style.opacity = 1; flame.style.transform = 'none';
            await ctx.wait(3000); petals.style.transform = 'none';
            phase = 'out'; next();
          };
          const tapCandle = async () => {
            if (done || phase !== 'out') return;
            phase = 'busy'; glow(ca, false);
            ring.setAttribute('r', 30); flame.style.opacity = 0.15; flame.style.transform = 'scale(.6, .5) skewX(-12deg)';
            await ctx.wait(3000);
            count++;
            if (count >= 3) { done = true; ctx.pick(true, ca); return; }
            phase = 'in'; next();
          };
          fl.g.addEventListener('pointerdown', (e) => { e.preventDefault(); tapFlower(); });
          ca.g.addEventListener('pointerdown', (e) => { e.preventDefault(); tapCandle(); });
          ctx.correct(fl);
          ctx.later(2600, next);
          return {
            fb: 'fbCalm', guided: true, ownFriend: false,
            solve: async () => { for (let i = 0; i < 3; i++) { await ctx.wait(400); await ctx.press(fl); await ctx.wait(3100); await ctx.press(ca); await ctx.wait(3100); } },
          };
        },
      };
    },
  },
};

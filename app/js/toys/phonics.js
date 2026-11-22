// Phonics: nine picture cards. Tapping one brings it to the middle; its
// letters appear underneath and each one lights up with its sound, then the
// letters slide together and the whole word is said. Letters are the only
// text anywhere in Kilalao's toys.
import { s, C, makeStage, ease, lerp, replay } from '../lib.js';

const WORDS = ['cat', 'sun', 'dog', 'hat', 'bus', 'cup', 'pig', 'bed', 'fox'];
const PHONEME = { c: 'kuh', a: 'ah', t: 'tuh', s: 'sss', u: 'uh', n: 'nnn', d: 'duh', o: 'aw', g: 'guh', h: 'hhh', b: 'buh', p: 'puh', i: 'ih', e: 'eh', f: 'fff', x: 'ks' };
const VOWELS = 'aeiou';
const NOTE = { a: 523, e: 587, i: 659, o: 784, u: 880 };
const FONT = 'ui-rounded, "Nunito", "Varela Round", "Arial Rounded MT Bold", "Segoe UI", system-ui, sans-serif';

const CW = 300, CH = 230, GAP = 30, GX = 320, GY = 75;
const FOCUS = { x: 800, y: 320, k: 1.65 };
const LY = 700;

export default function phonics(root, kit) {
  const { sfx, audio } = kit;
  const svg = makeStage(root, '#e9dcc3');
  const INK = C.ink;
  const ink = (o, w = 4) => ({ stroke: INK, 'stroke-width': w, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', ...o });

  // ---------- Pictures (drawn around 0,0, about 200 x 160) ----------
  const DRAW = {
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

  // ---------- Grid of cards ----------
  const bg = s('rect', { x: -400, y: -200, width: 2400, height: 1300, fill: 'transparent' }, svg);
  for (let i = 0; i < 26; i++) s('circle', { cx: Math.random() * 1600, cy: Math.random() * 900, r: 2 + Math.random() * 3, fill: C.woodD, opacity: 0.08, 'pointer-events': 'none' }, svg);
  const cardsG = s('g', null, svg);
  const cards = WORDS.map((w, i) => {
    const hx = GX + (i % 3) * (CW + GAP) + CW / 2, hy = GY + Math.floor(i / 3) * (CH + GAP) + CH / 2;
    const c = { w, i, hx, hy, x: hx, y: hy, k: 1 };
    c.g = s('g', { class: 'tap', transform: `translate(${hx} ${hy})` }, cardsG);
    c.fade = s('g', null, c.g);
    c.fade.style.transition = 'opacity .5s';
    const wob = s('g', { class: 'fb' }, c.fade);
    c.wob = wob;
    s('rect', { x: -CW / 2 + 6, y: -CH / 2 + 10, width: CW, height: CH, rx: 30, fill: '#cdb995' }, wob);
    s('rect', ink({ x: -CW / 2, y: -CH / 2, width: CW, height: CH, rx: 30, fill: ['#f6eedf', '#f3ead4', '#f6eedf'][i % 3] }), wob);
    const art = s('g', { transform: 'scale(.9)' }, wob);
    DRAW[w](art);
    c.g.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); tapCard(c); });
    return c;
  });

  // ---------- Letters ----------
  const lettersG = s('g', null, svg);
  let focus = null, seq = 0, tiles = [], spread = 1, spreadTo = 1, anim = null;
  const speech = () => !!kit.settings.get('speech');

  function speak(text, rate = 0.75) {
    if (!speech()) return;
    try { speechSynthesis.cancel(); } catch (e) {}
    audio.say(text, { rate });
  }
  function bounce(L) { L.pop.style.animationDelay = '0s'; L.pop.classList.remove('popin'); replay(L.pop, 'hop'); }
  function letterSound(L, withVoice = true) {
    bounce(L);
    L.hi.style.opacity = 1;
    kit.after(700, () => { L.hi.style.opacity = 0; });
    const f = NOTE[L.ch] || 392 + (L.ch.charCodeAt(0) % 7) * 33;
    audio.inst.marimba(f, { vol: 0.2 });
    if (withVoice) speak(PHONEME[L.ch], 0.7);
  }
  function layout() {
    const n = tiles.length, gap = lerp(174, 236, spread);
    tiles.forEach((L, j) => L.g.setAttribute('transform', `translate(${(800 + (j - (n - 1) / 2) * gap).toFixed(1)} ${LY})`));
  }
  function showLetters(word) {
    lettersG.innerHTML = '';
    tiles = [...word].map((ch, j) => {
      const vowel = VOWELS.includes(ch);
      const g = s('g', { class: 'tap' }, lettersG);
      const pop = s('g', { class: 'fb popin', style: `animation-delay:${0.15 + j * 0.15}s` }, g);
      s('rect', { x: -84, y: -100, width: 168, height: 200, rx: 40, fill: vowel ? '#f2dcd2' : '#d6e6e3' }, pop);
      const hi = s('rect', { x: -84, y: -100, width: 168, height: 200, rx: 40, fill: vowel ? '#e9b9a5' : '#a9cdc8' }, pop);
      hi.style.opacity = 0; hi.style.transition = 'opacity .3s';
      s('rect', { x: -84, y: -100, width: 168, height: 200, rx: 40, fill: 'none', stroke: INK, 'stroke-width': 4 }, pop);
      s('text', { x: 0, y: 8, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-family': FONT, 'font-weight': 800, 'font-size': 170, fill: vowel ? C.terra : C.teal, stroke: INK, 'stroke-width': 3, 'paint-order': 'stroke', text: ch }, pop);
      const L = { ch, g, pop, hi };
      g.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); letterSound(L); });
      return L;
    });
    spread = spreadTo = 1;
    layout();
  }
  function play(c) {
    const my = ++seq;
    spreadTo = 1;
    const step = 1150;
    const t0 = 900;
    tiles.forEach((L, j) => kit.after(t0 + j * step, () => { if (seq === my) letterSound(L); }));
    const tEnd = t0 + tiles.length * step + 200;
    kit.after(tEnd, () => { if (seq === my) { spreadTo = 0; sfx.whoosh(0.3); } });
    kit.after(tEnd + 800, () => {
      if (seq !== my) return;
      tiles.forEach((L) => { bounce(L); L.hi.style.opacity = 1; });
      kit.after(900, () => tiles.forEach((L) => (L.hi.style.opacity = 0)));
      [523, 659, 784].forEach((f, k) => audio.inst.musicbox(f, { vol: 0.18, at: audio.now() + k * 0.06 }));
      speak(c.w, 0.7);
      replay(c.wob, 'wiggle');
    });
  }

  function animate(c, to, done) {
    anim = { c, from: { x: c.x, y: c.y, k: c.k }, to, t: 0, done };
  }
  function tapCard(c) {
    if (anim) return;
    if (focus === c) { sfx.pop(1.2); spread = spreadTo = 1; layout(); play(c); return; }
    if (focus) return;
    focus = c;
    sfx.paper();
    cardsG.appendChild(c.g);
    cards.forEach((o) => { if (o !== c) { o.fade.style.opacity = 0.12; o.g.style.pointerEvents = 'none'; } });
    animate(c, FOCUS, () => { showLetters(c.w); play(c); });
  }
  function back() {
    if (!focus || anim) return;
    const c = focus;
    seq++;
    try { speechSynthesis.cancel(); } catch (e) {}
    lettersG.style.transition = 'opacity .3s';
    lettersG.style.opacity = 0;
    sfx.whoosh(0.4);
    kit.after(300, () => { lettersG.innerHTML = ''; lettersG.style.opacity = 1; tiles = []; });
    animate(c, { x: c.hx, y: c.hy, k: 1 }, () => {
      focus = null;
      cards.forEach((o) => { o.fade.style.opacity = 1; o.g.style.pointerEvents = ''; });
    });
  }
  bg.addEventListener('pointerdown', (e) => { e.preventDefault(); back(); });
  kit.add(() => { seq++; try { speechSynthesis.cancel(); } catch (e) {} });

  kit.loop((dt) => {
    if (anim) {
      anim.t = Math.min(1, anim.t + dt / 0.6);
      const e = ease(anim.t), c = anim.c;
      c.x = lerp(anim.from.x, anim.to.x, e); c.y = lerp(anim.from.y, anim.to.y, e); c.k = lerp(anim.from.k, anim.to.k, e);
      c.g.setAttribute('transform', `translate(${c.x.toFixed(1)} ${c.y.toFixed(1)}) scale(${c.k.toFixed(3)})`);
      if (anim.t >= 1) { const d = anim.done; anim = null; d && d(); }
    }
    if (tiles.length && Math.abs(spread - spreadTo) > 0.001) {
      spread += (spreadTo - spread) * Math.min(1, dt * 5);
      layout();
    }
  });
}

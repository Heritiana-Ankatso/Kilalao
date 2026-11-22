// Phonics: nine picture cards. Tapping one brings it to the middle; its
// letters appear underneath and each one lights up with its sound, then the
// letters slide together and the whole word is said. Letters are the only
// text anywhere in Kilalao's toys.
import { s, C, makeStage, ease, lerp, replay } from '../lib.js';
import { PICTURES } from '../learn/pictures.js';

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
  const DRAW = PICTURES;


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
    audio.hush();
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
    audio.hush();
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
  kit.add(() => { seq++; audio.hush(); });

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

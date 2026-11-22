// Learn: lessons on an adaptive path. Every new skill is taught in three
// stages, the way a teacher would: the guide shows one example with a moving
// hand ("watch"), the child does two with support ("together"), then practises
// alone ("your turn"). The mastery engine picks the skill. There are no
// scores, stars or streaks; progress is shown only to adults.
import { s, C, makeStage, replay } from '../lib.js';
import * as profiles from '../learn/profiles.js';
import * as mastery from '../learn/mastery.js';
import * as voice from '../learn/voice.js';
import { prompt } from '../learn/i18n.js';
import { MATH } from '../learn/curriculum/math.js';
import { TEMPLATES } from '../learn/templates/math.js';
import { ink, card, FONT, CHOICE_Y, handPointer, centerOf } from '../learn/draw.js';

export const SUBJECTS = { math: MATH };
const GUIDE = { x: 150, y: 760 };

export default function learn(root, kit) {
  const { sfx, audio } = kit;
  const svg = makeStage(root, '#efe4cf');
  const layer = s('g', null, svg);
  const top = s('g', null, svg); // guide hand and input shield live above the activity
  let alive = true;
  kit.add(() => { alive = false; voice.stop(); });
  const wait = (ms) => new Promise((r) => kit.after(ms, r));

  function clear() { voice.stop(); layer.innerHTML = ''; top.innerHTML = ''; }
  function fadeIn() { layer.style.transition = 'none'; layer.style.opacity = 0; requestAnimationFrame(() => { layer.style.transition = 'opacity .45s'; layer.style.opacity = 1; }); }

  // ---------- Choose who is learning ----------
  function chooseProfile() {
    const list = profiles.list();
    if (list.length <= 1) { start(profiles.active()); return; }
    clear(); fadeIn();
    const n = list.length, w = Math.min(300, 1300 / n);
    list.forEach((p, i) => {
      const x = 800 + (i - (n - 1) / 2) * (w + 20);
      const c = card(layer, x, 450, w, w + 40, C.cream);
      avatar(c.inner, p.avatar, x, 450, w * 0.36);
      c.g.addEventListener('pointerdown', (e) => { e.preventDefault(); replay(c.inner, 'hop'); sfx.pop(1.1); profiles.setActive(p.id); kit.after(350, () => start(p)); });
    });
  }

  // ---------- A lesson ----------
  async function start(profile) {
    audio.init();
    const skills = SUBJECTS.math;
    // ?skill=<id> forces one skill (used by tools/learn-test.py and curriculum authors).
    const forced = skills.find((sk) => sk.id === new URLSearchParams(location.search).get('skill'));
    const lesson = mastery.planLesson(skills, profile.id, profile, forced);
    let lastMode = null;
    for (let i = 0; i < lesson.steps.length && alive; i++) {
      const st = lesson.steps[i];
      await runItem(profile, st.skill, st.mode, i, lesson.steps, st.mode !== lastMode);
      lastMode = st.mode;
    }
    if (alive) ending(profile);
  }

  function runItem(profile, skill, mode, index, steps, newStage) {
    return new Promise((resolve) => {
      clear(); fadeIn();
      const lang = profile.lang;
      const item = TEMPLATES[skill.template].make(Math.random, skill.params);
      progressDots(index, steps);
      stageMarker(mode, profile);
      layer.dataset.mode = mode;
      const guide = s('g', { class: 'tap' }, layer);
      guide.inner = s('g', { class: 'fbb' }, guide);
      avatar(guide.inner, 'owl', GUIDE.x, GUIDE.y, 62);
      const speak = () => { replay(guide.inner, 'hop'); voice.sayPrompt(lang, item.key, item.vars); };
      guide.addEventListener('pointerdown', (e) => { e.preventDefault(); speak(); });
      // Listen button (replays the question) and, for readers, the question text.
      const lb = card(layer, 800, 64, 110, 84, C.white);
      speaker(lb.inner, 800, 64);
      lb.g.addEventListener('pointerdown', (e) => { e.preventDefault(); replay(lb.inner, 'wiggle'); speak(); });
      if (profile.age >= 7) s('text', { x: 800, y: 140, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-family': FONT, 'font-weight': 700, 'font-size': 40, fill: C.ink, text: prompt(item.key, item.vars, lang, false) }, layer);

      // The guide's hand
      const hand = handPointer(top);
      let handAt = { x: GUIDE.x + 40, y: GUIDE.y - 40 };
      hand.style.transform = `translate(${handAt.x}px, ${handAt.y}px)`;
      const posOf = (t) => {
        if (t && (t.x !== undefined || t.cx !== undefined)) return centerOf(t);
        const el = t && (t.g || t);
        try { const b = el.getBBox(); return { x: b.x + b.width / 2, y: b.y + b.height / 2 }; } catch (e) { return { x: 800, y: 450 }; }
      };
      async function handTo(t) {
        if (!alive) return;
        const p = posOf(t);
        hand.classList.add('show');
        const far = Math.hypot(p.x - handAt.x, p.y - handAt.y);
        hand.style.transitionDuration = `${Math.min(0.8, 0.25 + far / 1800)}s, .4s`;
        hand.style.transform = `translate(${p.x.toFixed(1)}px, ${(p.y + 6).toFixed(1)}px)`;
        handAt = p;
        await wait(Math.min(800, 250 + far / 1.8));
      }
      const handAway = () => hand.classList.remove('show');

      let first = true, locked = false, correctCard = null, help = null, solved = false;
      const choiceCards = [];
      const ctx = {
        layer, rng: Math.random, lang, calm: kit.calm, wait, mode,
        later: (ms, f) => kit.after(ms, f),
        say: (key, vars) => voice.sayPrompt(lang, key, vars || {}),
        sayNumber: (n) => voice.sayNumber(lang, n),
        tick: () => sfx.tick(0.8),
        click: () => sfx.click(),
        point: (t) => handTo(t),
        async press(t, action) {
          await handTo(t);
          if (!alive) return;
          replay(hand.inner, 'pressing');
          await wait(170);
          if (action) action();
          else (t.g || t).dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
          await wait(kit.calm ? 420 : 260);
        },
        correct(c) { correctCard = c; c.g.dataset.ok = '1'; },
        dimChoices(on) { choiceCards.forEach((c) => { c.g.style.transition = 'opacity .4s'; c.g.style.opacity = on ? 0.35 : 1; c.g.style.pointerEvents = on ? 'none' : ''; }); },
        choices(vals, render, answer, size = { w: 300, h: 170 }) {
          const gap = 60, n = vals.length, by = {};
          vals.forEach((v, i) => {
            const x = 800 + (i - (n - 1) / 2) * (size.w + gap);
            const c = card(layer, x, CHOICE_Y, size.w, size.h, C.white);
            render(c.inner, v, c);
            c.g.addEventListener('pointerdown', (e) => { e.preventDefault(); ctx.pick(v === answer, c); });
            if (v === answer) ctx.correct(c);
            choiceCards.push(c);
            by[v] = c;
          });
          return by;
        },
        async pick(ok, c) {
          if (!alive || solved || (locked && mode !== 'watch')) return;
          if (ok) {
            solved = true;
            if (mode === 'own' && first) mastery.update(profile.id, skill, profile, true, item.guess);
            if (c.bg) c.bg.style.fill = '#dfe9d5';
            replay(c.inner, 'hop');
            sfx.chime([659, 784, 880, 1046][Math.floor(Math.random() * 4)], 0.45);
            await wait(mode === 'watch' ? 1600 : 1100);
            handAway();
            resolve();
            return;
          }
          replay(c.inner, 'wiggle');
          audio.tone(220, { dur: 0.25, vol: 0.08, type: 'triangle' });
          if (first) {
            first = false;
            if (mode === 'own') mastery.update(profile.id, skill, profile, false, item.guess);
            locked = true;
            await wait(500);
            if (help) await help();
            handAway();
            locked = false;
          }
          if (correctCard && correctCard.bg) { correctCard.bg.style.fill = '#e6efd9'; replay(correctCard.inner, 'hop'); }
        },
      };
      const out = item.build(ctx) || {};
      help = out.help || null;

      (async () => {
        if (newStage) { voice.sayPrompt(lang, mode === 'watch' ? 'watch' : mode === 'together' ? 'tryTogether' : 'yourTurn'); await wait(1500); }
        if (!alive) return;
        speak();
        await wait(1600);
        if (!alive) return;
        if (mode === 'watch') {
          // The guide solves one example. The child's touches are paused meanwhile.
          const shield = s('rect', { x: -400, y: -200, width: 2400, height: 1300, fill: 'transparent' }, top);
          top.insertBefore(shield, hand);
          if (out.solve) await out.solve();
          else { if (help) await help(); await ctx.press(correctCard); }
        } else if (mode === 'together' && !out.guided && help) {
          // Show the method on this item, then let the child answer.
          locked = true;
          await help();
          handAway();
          locked = false;
        }
      })();
    });
  }

  // Soft dots at the bottom-left show where we are in the lesson (no score).
  function progressDots(i, steps) {
    steps.forEach((st, k) => s('circle', { cx: 290 + k * 28, cy: 876, r: 9, fill: k < i ? C.sage : k === i ? C.ochre : C.sand }, layer));
  }

  // Which stage we are in, without words: the guide alone (watch), the guide
  // and the child (together), or the child alone (your turn).
  function stageMarker(mode, profile) {
    const g = s('g', { opacity: 0.9 }, layer);
    s('rect', ink({ x: 560, y: 30, width: 150, height: 70, rx: 35, fill: mode === 'watch' ? '#f3e3c4' : mode === 'together' ? '#e3ecd9' : '#dde8ea' }, 3), g);
    if (mode === 'watch') { avatar(g, 'owl', 610, 65, 22); eye(g, 665, 65); }
    else if (mode === 'together') { avatar(g, 'owl', 610, 65, 22); avatar(g, profile.avatar, 662, 65, 22); }
    else avatar(g, profile.avatar, 635, 65, 24);
  }

  // ---------- End of a lesson: calm, no reward ----------
  function ending(profile) {
    clear(); fadeIn();
    layer.dataset.mode = 'end';
    const g = s('g', { class: 'fb popin' }, layer);
    avatar(g, profile.avatar, 800, 380, 130);
    const again = card(layer, 800, 700, 200, 150, C.sage);
    s('path', ink({ d: 'M780 660 L840 700 L780 740 Z', fill: C.white }, 5), again.inner);
    again.g.addEventListener('pointerdown', (e) => { e.preventDefault(); replay(again.inner, 'hop'); sfx.pop(1); kit.after(300, () => start(profile)); });
    [523, 659, 784].forEach((f, k) => audio.inst.musicbox(f, { vol: 0.15, at: audio.now() + k * 0.18 }));
  }

  chooseProfile();
}

function eye(g, x, y) {
  s('path', ink({ d: `M${x - 22} ${y} Q${x} ${y - 20} ${x + 22} ${y} Q${x} ${y + 20} ${x - 22} ${y} Z`, fill: C.white }, 3), g);
  s('circle', { cx: x, cy: y, r: 7, fill: C.ink }, g);
}

// ---------- Small drawings ----------
function speaker(g, x, y) {
  s('path', ink({ d: `M${x - 30} ${y - 12} h14 l18 -16 v56 l-18 -16 h-14 z`, fill: C.ochre }, 3.5), g);
  s('path', ink({ d: `M${x + 10} ${y - 12} q10 12 0 24 M${x + 20} ${y - 22} q20 22 0 44`, fill: 'none' }, 3.5), g);
}

const AV = {
  fox: { c: C.terra, ears: 'pointy' }, owl: { c: C.cocoa, ears: 'tufts' }, turtle: { c: C.sage, ears: null },
  cat: { c: C.ochre, ears: 'pointy' }, frog: { c: '#8fae74', ears: 'eyes' }, bear: { c: '#a07856', ears: 'round' },
  whale: { c: C.blue, ears: null }, bee: { c: '#e8c56a', ears: 'antennae' },
};
export function avatar(g, kind, x, y, r) {
  const a = AV[kind] || AV.fox;
  if (a.ears === 'pointy') s('path', ink({ d: `M${x - r * 0.9} ${y - r * 0.3} L${x - r * 0.75} ${y - r * 1.15} L${x - r * 0.25} ${y - r * 0.8} Z M${x + r * 0.9} ${y - r * 0.3} L${x + r * 0.75} ${y - r * 1.15} L${x + r * 0.25} ${y - r * 0.8} Z`, fill: a.c }, 4), g);
  if (a.ears === 'round') for (const sx of [-1, 1]) s('circle', ink({ cx: x + sx * r * 0.72, cy: y - r * 0.72, r: r * 0.32, fill: a.c }, 4), g);
  if (a.ears === 'tufts') s('path', ink({ d: `M${x - r * 0.7} ${y - r * 0.6} l-${r * 0.2} -${r * 0.5} l${r * 0.5} ${r * 0.25} Z M${x + r * 0.7} ${y - r * 0.6} l${r * 0.2} -${r * 0.5} l-${r * 0.5} ${r * 0.25} Z`, fill: a.c }, 4), g);
  if (a.ears === 'antennae') s('path', ink({ d: `M${x - r * 0.3} ${y - r * 0.9} q-${r * 0.2} -${r * 0.4} -${r * 0.4} -${r * 0.45} M${x + r * 0.3} ${y - r * 0.9} q${r * 0.2} -${r * 0.4} ${r * 0.4} -${r * 0.45}`, fill: 'none' }, 4), g);
  if (a.ears === 'eyes') for (const sx of [-1, 1]) s('circle', ink({ cx: x + sx * r * 0.45, cy: y - r * 0.8, r: r * 0.3, fill: a.c }, 4), g);
  s('circle', ink({ cx: x, cy: y, r, fill: a.c }, 4), g);
  if (kind === 'owl') {
    for (const sx of [-1, 1]) s('circle', ink({ cx: x + sx * r * 0.38, cy: y - r * 0.1, r: r * 0.3, fill: C.cream }, 3), g);
    s('path', ink({ d: `M${x - r * 0.13} ${y + r * 0.12} L${x + r * 0.13} ${y + r * 0.12} L${x} ${y + r * 0.36} Z`, fill: C.ochre }, 2.5), g);
    s('path', ink({ d: `M${x - r * 0.5} ${y + r * 0.6} q${r * 0.25} ${r * 0.18} ${r * 0.5} 0 q${r * 0.25} ${r * 0.18} ${r * 0.5} 0`, fill: 'none' }, 2.5), g);
  }
  if (kind === 'bee') for (const k of [0.25, 0.6]) s('path', { d: `M${x - r * 0.9} ${y + r * k} H${x + r * 0.9}`, stroke: INKC, 'stroke-width': r * 0.14, opacity: 0.7 }, g);
  if (kind === 'turtle') for (const [dx, dy] of [[-0.35, -0.6], [0.2, -0.7], [0.55, -0.45]]) s('circle', { cx: x + dx * r, cy: y + dy * r, r: r * 0.12, fill: C.moss }, g);
  for (const sx of [-1, 1]) s('circle', { cx: x + sx * r * 0.38, cy: y - r * 0.1, r: r * 0.11, fill: INKC }, g);
  for (const sx of [-1, 1]) s('circle', { cx: x + sx * r * 0.62, cy: y + r * 0.25, r: r * 0.13, fill: C.rose, opacity: 0.6 }, g);
  if (kind !== 'owl') s('path', ink({ d: `M${x - r * 0.22} ${y + r * 0.3} q${r * 0.22} ${r * 0.2} ${r * 0.44} 0`, fill: 'none' }, 3.5), g);
}
const INKC = C.ink;

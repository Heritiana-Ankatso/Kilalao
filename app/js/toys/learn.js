// Learn: the adaptive learning path. A child picks their animal (when there
// are several profiles), then works through short sessions chosen by the
// mastery engine. There are no scores, stars or streaks: a correct answer
// gets a soft chime, a first wrong answer gets a calm demonstration, and
// progress is visible only to adults in the grown-ups corner.
import { s, C, makeStage, replay } from '../lib.js';
import * as profiles from '../learn/profiles.js';
import * as mastery from '../learn/mastery.js';
import * as voice from '../learn/voice.js';
import { prompt } from '../learn/i18n.js';
import { MATH } from '../learn/curriculum/math.js';
import { TEMPLATES } from '../learn/templates/math.js';
import { ink, card, FONT, CHOICE_Y } from '../learn/draw.js';

export const SUBJECTS = { math: MATH };
const SESSION = 6;

export default function learn(root, kit) {
  const { sfx, audio } = kit;
  const svg = makeStage(root, '#efe4cf');
  const layer = s('g', null, svg);
  let alive = true;
  kit.add(() => { alive = false; voice.stop(); });
  const wait = (ms) => new Promise((r) => kit.after(ms, r));

  function clear() { voice.stop(); layer.innerHTML = ''; }
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

  // ---------- A session ----------
  async function start(profile) {
    audio.init();
    const skills = SUBJECTS.math;
    // ?skill=<id> forces one skill (used by tools/learn-test.py and curriculum authors).
    const forced = skills.find((sk) => sk.id === new URLSearchParams(location.search).get('skill'));
    const plan = forced ? Array(SESSION).fill(forced) : mastery.planSession(skills, profile.id, profile, Math.random, SESSION);
    for (let i = 0; i < plan.length && alive; i++) {
      await runItem(profile, plan[i], i);
    }
    if (alive) ending(profile);
  }

  function runItem(profile, skill, index) {
    return new Promise((resolve) => {
      clear(); fadeIn();
      const lang = profile.lang;
      const item = TEMPLATES[skill.template].make(Math.random, skill.params);
      progressDots(index);
      // Listen button (replays the question) and, for readers, the question text.
      const lb = card(layer, 800, 64, 110, 84, C.white);
      speaker(lb.inner, 800, 64);
      lb.g.addEventListener('pointerdown', (e) => { e.preventDefault(); replay(lb.inner, 'wiggle'); voice.sayPrompt(lang, item.key, item.vars); });
      if (profile.age >= 7) s('text', { x: 800, y: 140, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-family': FONT, 'font-weight': 700, 'font-size': 40, fill: C.ink, text: prompt(item.key, item.vars, lang, false) }, layer);

      let first = true, locked = false, correctCard = null, help = null;
      const ctx = {
        layer, rng: Math.random, lang, calm: kit.calm, wait,
        later: (ms, f) => kit.after(ms, f),
        say: (key, vars) => voice.sayPrompt(lang, key, vars || {}),
        sayNumber: (n) => voice.sayNumber(lang, n),
        tick: () => sfx.tick(0.8),
        click: () => sfx.click(),
        correct(c) { correctCard = c; c.g.dataset.ok = '1'; },
        choices(vals, render, answer, size = { w: 300, h: 170 }) {
          const gap = 60, n = vals.length;
          vals.forEach((v, i) => {
            const x = 800 + (i - (n - 1) / 2) * (size.w + gap);
            const c = card(layer, x, CHOICE_Y, size.w, size.h, C.white);
            render(c.inner, v, c);
            c.g.addEventListener('pointerdown', (e) => { e.preventDefault(); ctx.pick(v === answer, c); });
            if (v === answer) ctx.correct(c);
          });
        },
        async pick(ok, c) {
          if (locked || !alive) return;
          if (ok) {
            locked = true;
            if (first) mastery.update(profile.id, skill, profile, true, item.guess);
            if (c.bg) c.bg.style.fill = '#dfe9d5';
            replay(c.inner, 'hop');
            sfx.chime([659, 784, 880, 1046][Math.floor(Math.random() * 4)], 0.45);
            await wait(1100);
            resolve();
            return;
          }
          replay(c.inner, 'wiggle');
          audio.tone(220, { dur: 0.25, vol: 0.08, type: 'triangle' });
          if (first) {
            first = false;
            mastery.update(profile.id, skill, profile, false, item.guess);
            locked = true;
            await wait(500);
            if (help) await help();
            locked = false;
          }
          if (correctCard && correctCard.bg) { correctCard.bg.style.fill = '#e6efd9'; replay(correctCard.inner, 'hop'); }
        },
      };
      const out = item.build(ctx) || {};
      help = out.help || null;
      kit.after(350, () => voice.sayPrompt(lang, item.key, item.vars));
    });
  }

  // Six soft dots at the bottom-left show where we are in the session (no score).
  function progressDots(i) {
    for (let k = 0; k < SESSION; k++) s('circle', { cx: 60 + k * 30, cy: 870, r: 9, fill: k < i ? C.sage : k === i ? C.ochre : C.sand }, layer);
  }

  // ---------- End of a session: calm, no reward ----------
  function ending(profile) {
    clear(); fadeIn();
    const g = s('g', { class: 'fb popin' }, layer);
    avatar(g, profile.avatar, 800, 380, 130);
    const again = card(layer, 800, 700, 200, 150, C.sage);
    s('path', ink({ d: 'M780 660 L840 700 L780 740 Z', fill: C.white }, 5), again.inner);
    again.g.addEventListener('pointerdown', (e) => { e.preventDefault(); replay(again.inner, 'hop'); sfx.pop(1); kit.after(300, () => start(profile)); });
    [523, 659, 784].forEach((f, k) => audio.inst.musicbox(f, { vol: 0.15, at: audio.now() + k * 0.18 }));
  }

  chooseProfile();
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
  if (kind === 'owl') for (const sx of [-1, 1]) s('circle', ink({ cx: x + sx * r * 0.38, cy: y - r * 0.1, r: r * 0.3, fill: C.cream }, 3), g);
  if (kind === 'bee') for (const k of [0.25, 0.6]) s('path', { d: `M${x - r * 0.9} ${y + r * k} H${x + r * 0.9}`, stroke: INKC, 'stroke-width': r * 0.14, opacity: 0.7 }, g);
  if (kind === 'turtle') for (const [dx, dy] of [[-0.35, -0.6], [0.2, -0.7], [0.55, -0.45]]) s('circle', { cx: x + dx * r, cy: y + dy * r, r: r * 0.12, fill: C.moss }, g);
  for (const sx of [-1, 1]) s('circle', { cx: x + sx * r * 0.38, cy: y - r * 0.1, r: r * 0.11, fill: INKC }, g);
  for (const sx of [-1, 1]) s('circle', { cx: x + sx * r * 0.62, cy: y + r * 0.25, r: r * 0.13, fill: C.rose, opacity: 0.6 }, g);
  s('path', ink({ d: `M${x - r * 0.22} ${y + r * 0.3} q${r * 0.22} ${r * 0.2} ${r * 0.44} 0`, fill: 'none' }, 3.5), g);
}
const INKC = C.ink;

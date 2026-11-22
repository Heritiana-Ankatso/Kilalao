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
import { makeOwl, avatar } from '../learn/characters.js';
import { drawVillage, nextFriends, lessonFriend } from '../learn/village.js';
export { avatar };

export const SUBJECTS = { math: MATH };
const GUIDE = { x: 165, y: 885, scale: 0.7 };

export default function learn(root, kit) {
  const { sfx, audio } = kit;
  const svg = makeStage(root, '#efe4cf');
  const layer = s('g', null, svg);
  const top = s('g', null, svg); // guide hand and input shield live above the activity
  let alive = true;
  kit.add(() => { alive = false; voice.stop(); });
  // Animated characters (rigs) on screen; ticked every frame.
  let rigs = [];
  kit.loop((dt, t) => { for (const r of rigs) r.tick(dt, t); });
  const wait = (ms) => new Promise((r) => kit.after(ms, r));

  function clear() { voice.stop(); layer.innerHTML = ''; top.innerHTML = ''; rigs = []; }
  function fadeIn() { layer.style.transition = 'none'; layer.style.opacity = 0; requestAnimationFrame(() => { layer.style.transition = 'opacity .45s'; layer.style.opacity = 1; }); }

  // ---------- Choose who is learning ----------
  function chooseProfile() {
    const list = profiles.list();
    if (list.length <= 1) { home(profiles.active()); return; }
    clear(); fadeIn();
    const n = list.length, w = Math.min(300, 1300 / n);
    list.forEach((p, i) => {
      const x = 800 + (i - (n - 1) / 2) * (w + 20);
      const c = card(layer, x, 450, w, w + 40, C.cream);
      avatar(c.inner, p.avatar, x, 450, w * 0.36);
      c.g.addEventListener('pointerdown', (e) => { e.preventDefault(); replay(c.inner, 'hop'); sfx.pop(1.1); profiles.setActive(p.id); kit.after(350, () => home(p)); });
    });
  }

  // ---------- The village: choose who to help ----------
  function home(profile, justHelped) {
    audio.init();
    const skills = SUBJECTS.math;
    // ?skill=<id> skips the village (used by tools/learn-test.py and curriculum authors).
    const forced = skills.find((sk) => sk.id === new URLSearchParams(location.search).get('skill'));
    if (forced) { start(profile, { skill: forced, friend: nextFriends(profile, 1)[0], forced: true }); return; }
    clear(); fadeIn();
    layer.dataset.mode = 'village';
    const offers = mastery.offerQuests(skills, profile.id, profile);
    const friends = nextFriends(profile, offers.length);
    const quests = offers.map((o, i) => ({ ...o, friend: friends[i] }));
    const { cards, houses } = drawVillage(layer, profile, quests);
    const owlHit = s('g', { class: 'tap' }, layer);
    const owl = makeOwl(owlHit, 150, 885, 0.7, kit.calm);
    rigs.push(owl);
    owl.lookAt({ x: 800, y: 720 });
    const sayChoose = () => { owl.talk(1300); voice.sayPrompt(profile.lang, 'choose'); };
    owlHit.addEventListener('pointerdown', (e) => { e.preventDefault(); sayChoose(); });
    cards.forEach((c, i) => c.g.addEventListener('pointerdown', (e) => {
      e.preventDefault(); replay(c.inner, 'hop'); sfx.pop(1.1);
      kit.after(400, () => start(profile, quests[i]));
    }));
    if (justHelped) {
      // The friend just helped has moved in: their new house pops up and the owl hops.
      const house = houses[Math.min(houses.length, ((profile.village && profile.village.helped) || []).length) - 1];
      if (house && house.inner) { house.inner.classList.add('popin'); }
      voice.sayPrompt(profile.lang, 'thanks');
      kit.after(500, () => owl.hop());
      kit.after(2200, sayChoose);
    } else kit.after(600, sayChoose);
  }

  // ---------- A quest (one lesson) ----------
  async function start(profile, quest) {
    const skills = SUBJECTS.math;
    const lesson = mastery.planLesson(skills, profile.id, profile, quest.skill, !quest.forced);
    let lastMode = null, missRun = 0, stuckRun = 0, easier = false;
    for (let i = 0; i < lesson.steps.length && alive; i++) {
      const st = lesson.steps[i];
      // Flow: after two first-try misses in a row, support comes back (guided
      // mode, smaller numbers) instead of repeating the same difficulty.
      let mode = st.mode;
      if (mode === 'own' && missRun >= 2) mode = 'together';
      const res = await runItem(profile, st.skill, mode, i, lesson.steps, mode !== lastMode, quest, easier && st.skill === lesson.skill);
      lastMode = mode;
      if (res.firstOk) { missRun = 0; stuckRun = 0; if (mode === 'own' && res.hint === 0) easier = false; }
      else { missRun++; easier = true; stuckRun = res.hint >= 3 ? stuckRun + 1 : 0; }
      // Stuck at the top of the hint ladder twice: stop gently; the path will
      // offer an easier skill next. No endless repetition.
      if (stuckRun >= 2) break;
    }
    if (!alive) return;
    if (quest.forced) { ending(profile); return; }
    const v = profile.village || { helped: [] };
    v.helped = [...(v.helped || []), { kind: quest.friend, skill: quest.skill.id, t: Date.now() }];
    profiles.update(profile.id, { village: v });
    home(profiles.get(profile.id), true);
  }

  function runItem(profile, skill, mode, index, steps, newStage, quest, easier) {
    return new Promise((done) => {
      clear(); fadeIn();
      const lang = profile.lang;
      const item = TEMPLATES[skill.template].make(Math.random, easier ? easierParams(skill.params) : skill.params);
      let hintLevel = 0;
      const resolve = () => done({ firstOk: first && hintLevel === 0, hint: hintLevel });
      progressDots(index, steps);
      stageMarker(mode, profile);
      layer.dataset.mode = mode;
      // The guide owl: a rigged character that talks, looks, points, nods and thinks.
      const owlHit = s('g', { class: 'tap' }, layer);
      const owl = makeOwl(owlHit, GUIDE.x, GUIDE.y, GUIDE.scale, kit.calm);
      rigs.push(owl);
      owl.lookAt({ x: 800, y: 450 });
      const promptLen = prompt(item.key, item.vars, lang, true).length;
      const speak = () => { owl.talk(Math.max(900, promptLen * 75)); voice.sayPrompt(lang, item.key, item.vars); };
      owlHit.addEventListener('pointerdown', (e) => { e.preventDefault(); speak(); });
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
        owl.lookAt(p);
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
        addRig: (r) => { rigs.push(r); return r; },
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
            if (mode !== 'watch') profiles.logAttempt(profile.id, { t: Date.now(), s: skill.id, hint: hintLevel, m: mode });
            if (c.bg) c.bg.style.fill = '#dfe9d5';
            replay(c.inner, 'hop');
            owl.rest(); owl.nod();
            if (friend) friend.happy();
            // Specific, process-focused feedback (what the child did), never "you're clever".
            if (mode !== 'watch') voice.sayPrompt(lang, hintLevel ? 'fbKeptGoing' : (out.fb || 'fbLook'));
            sfx.chime([659, 784, 880, 1046][Math.floor(Math.random() * 4)], 0.45);
            await wait(mode === 'watch' ? 1600 : 1100);
            handAway();
            resolve();
            return;
          }
          replay(c.inner, 'wiggle');
          audio.tone(220, { dur: 0.25, vol: 0.08, type: 'triangle' });
          if (friend) friend.puzzled();
          if (first && mode === 'own') mastery.update(profile.id, skill, profile, false, item.guess);
          first = false;
          // Hint ladder, from the least help to the most (the child always gives the answer):
          //   1 look again: what matters glows   2 first step: the hand starts, then hands back
          //   3 show me: a full demonstration     4 the right answer glows (no endless loops)
          hintLevel = Math.min(4, hintLevel + 1);
          locked = true;
          if (hintLevel === 1) { await owl.think(); voice.sayPrompt(lang, 'lookAgain'); if (out.cue) await out.cue(); else await wait(900); }
          else if (hintLevel === 2) { await owl.point({ x: 800, y: 450 }); if (out.step) await out.step(); else if (help) await help(); }
          else if (hintLevel === 3) { await owl.point({ x: 800, y: 450 }); if (help) await help(); }
          handAway(); owl.rest(); owl.lookAt({ x: 800, y: 450 });
          locked = false;
          if (hintLevel >= 3 && correctCard && correctCard.bg) { correctCard.bg.style.fill = '#e6efd9'; replay(correctCard.inner, 'hop'); }
        },
      };
      const out = item.build(ctx) || {};
      help = out.help || null;
      const friend = quest && !out.ownFriend ? lessonFriend(layer, quest.friend) : null;

      (async () => {
        if (newStage) { owl.talk(1100); voice.sayPrompt(lang, mode === 'watch' ? 'watch' : mode === 'together' ? 'tryTogether' : 'yourTurn'); await wait(1500); }
        if (!alive) return;
        speak();
        await wait(1600);
        if (!alive) return;
        if (mode === 'watch') {
          // The guide solves one example. The child's touches are paused meanwhile.
          const shield = s('rect', { x: -400, y: -200, width: 2400, height: 1300, fill: 'transparent' }, top);
          top.insertBefore(shield, hand);
          await owl.point({ x: 800, y: 450 });
          if (out.solve) await out.solve();
          else { if (help) await help(); await ctx.press(correctCard); }
        } else if (mode === 'together' && !out.guided && help) {
          // Show the method on this item, then let the child answer.
          locked = true;
          await owl.point({ x: 800, y: 450 });
          await help();
          handAway(); owl.rest(); owl.lookAt({ x: 800, y: 450 });
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
    // The child's animal and the owl, side by side; the owl gives a small hop of joy.
    const g = s('g', { class: 'fb popin' }, layer);
    const b = s('g', { class: 'fb bob' }, g);
    avatar(b, profile.avatar, 900, 400, 130);
    const owl = makeOwl(layer, 560, 600, 0.95, kit.calm);
    rigs.push(owl);
    owl.lookAt({ x: 900, y: 400 });
    kit.after(700, () => owl.hop());
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

// Smaller numbers for the same skill: used after two misses in a row (flow).
function easierParams(P) {
  const q = { ...P };
  if (q.max !== undefined) q.max = Math.max((q.min || 1) + 1, Math.ceil(q.max * 0.6));
  if (q.maxA !== undefined) q.maxA = Math.max(q.minA || 2, Math.ceil(q.maxA * 0.6));
  if (q.maxB !== undefined) q.maxB = Math.max(q.minB || 1, Math.ceil(q.maxB * 0.6));
  if (q.dens) q.dens = q.dens.slice(0, 2);
  return q;
}

// ---------- Small drawings ----------
function speaker(g, x, y) {
  s('path', ink({ d: `M${x - 30} ${y - 12} h14 l18 -16 v56 l-18 -16 h-14 z`, fill: C.ochre }, 3.5), g);
  s('path', ink({ d: `M${x + 10} ${y - 12} q10 12 0 24 M${x + 20} ${y - 22} q20 22 0 44`, fill: 'none' }, 3.5), g);
}

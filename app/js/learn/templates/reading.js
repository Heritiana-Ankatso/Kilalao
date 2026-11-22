// Reading activity templates (same interface as templates/math.js):
//   make(rng, params) -> { key, vars, guess, extra(ctx), build(ctx) }
// extra(ctx) speaks the sound or word that goes with the question (after the
// prompt). build() returns { help, solve, cue, step, guided, fb }.
//
// Pedagogy (docs/PEDAGOGY.md): sounds before letter names; touch-to-sound
// blending mirrors touch-to-count; pictures carry meaning so non-readers
// can answer; every hint gives less than the answer.
import { s, C, replay } from '../../lib.js';
import { ink, card, FONT, shuffle, INK, CHOICE_Y } from '../draw.js';
import { PICTURES } from '../pictures.js';
import { finish } from '../art.js';
import { WORDS, SPELLING, PICTURE, ANCHOR, RHYMES } from '../curriculum/reading.js';

const pick = (rng, a) => a[Math.floor(rng() * a.length)];
const units = (lang, w) => WORDS[lang][w].split(' ');
const spoken = (u) => !u.startsWith('_');
const shown = (u) => u.replace(/^_/, '');
const written = (lang, w) => (SPELLING[lang] && SPELLING[lang][w]) || w;
const picName = (lang, w) => (PICTURE[lang] && PICTURE[lang][w]) || w;

function letterText(parent, text, x, y, size, fill = INK, opacity = 1) {
  return s('text', { x, y, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-family': FONT, 'font-weight': 800, 'font-size': size, fill, opacity, text }, parent);
}
function picture(parent, name, x, y, scale = 1) {
  const g = s('g', { transform: `translate(${x} ${y}) scale(${scale})` }, parent);
  (PICTURES[name] || PICTURES.cat)(g);
  finish(g);
  return g;
}
const vowel = (u) => /^[aeiouéy]/.test(shown(u));
const tint = (u) => (vowel(u) ? C.terra : C.teal);
// A big ear and sound waves: "listen" (the sound to find is heard, not read).
function ear(parent, x, y) {
  const g = s('g', { class: 'fb' }, parent);
  s('path', ink({ d: `M${x - 30} ${y + 40} C${x - 70} ${y - 10} ${x - 50} ${y - 90} ${x + 10} ${y - 90} C${x + 60} ${y - 90} ${x + 70} ${y - 30} ${x + 40} ${y} C${x + 20} ${y + 20} ${x + 20} ${y + 50} ${x - 10} ${y + 60} C${x - 26} ${y + 66} ${x - 34} ${y + 54} ${x - 30} ${y + 40} Z`, fill: '#f0c9a8' }), g);
  s('path', ink({ d: `M${x - 10} ${y - 40} C${x + 20} ${y - 60} ${x + 30} ${y - 20} ${x + 6} ${y - 6}`, fill: 'none' }, 3.5), g);
  for (const r of [70, 100]) s('path', { d: `M${x + r} ${y - r * 0.6} Q${x + r * 1.25} ${y - 20} ${x + r} ${y + r * 0.4}`, fill: 'none', stroke: C.teal, 'stroke-width': 6, 'stroke-linecap': 'round', opacity: 0.7 }, g);
  return g;
}

export const TEMPLATES = {
  // ---------------------------------------------------------------------
  // Hear a sound, choose its letter (or syllable).
  letterSound: {
    make(rng, P) {
      const all = Array.isArray(P.units) ? P.units : [...P.units];
      const pool = Array.isArray(P.pool) ? P.pool : [...P.pool];
      const u = pick(rng, all);
      const others = shuffle(rng, pool.filter((x) => x !== u)).slice(0, 2);
      return {
        key: 'whichLetter', vars: {}, guess: 1 / 3,
        extra: (ctx) => ctx.sound(u),
        build(ctx) {
          const e = ear(ctx.layer, 760, 420);
          const hear = s('g', { class: 'tap' }, ctx.layer);
          s('circle', { cx: 790, cy: 400, r: 160, fill: 'transparent' }, hear);
          hear.addEventListener('pointerdown', (ev) => { ev.preventDefault(); replay(e, 'wiggle'); ctx.sound(u); });
          const vals = shuffle(rng, [u, ...others]);
          const by = ctx.choices(vals, (g, v, c) => letterText(g, v, c.x, c.y, P.syllables ? 110 : 140, tint(v)), u, { w: 260, h: 190 });
          const anchor = ANCHOR[P.lang] && ANCHOR[P.lang][u];
          return {
            fb: 'fbSound',
            cue: async () => { replay(e, 'wiggle'); ctx.sound(u); await ctx.wait(1300); ctx.sound(u); await ctx.wait(1000); },
            // First step: one wrong letter fades away (two left).
            step: async () => { const wrong = vals.find((v) => v !== u && by[v].g.style.opacity !== '0.25'); if (wrong) { await ctx.point(by[wrong]); by[wrong].g.style.opacity = 0.25; by[wrong].g.style.pointerEvents = 'none'; } await ctx.wait(500); },
            help: async () => {
              // Show a picture that starts with the sound, then point at the letter while saying it.
              if (anchor) { const g = s('g', { class: 'fb popin' }, ctx.layer); picture(g, anchor, 1150, 400, 0.9); ctx.word(anchor); await ctx.wait(1400); }
              await ctx.point(by[u]); replay(by[u].inner, 'hop'); ctx.sound(u); await ctx.wait(1200);
            },
          };
        },
      };
    },
  },

  // ---------------------------------------------------------------------
  // See and hear a word, choose the letter of its first sound.
  firstSound: {
    make(rng, P) {
      const w = pick(rng, P.words);
      const first = units(P.lang, w)[0];
      const pool = [...P.units].filter((x) => x !== first);
      const others = shuffle(rng, pool).slice(0, 2);
      return {
        key: 'firstSound', vars: {}, guess: 1 / 3,
        extra: (ctx) => ctx.word(w),
        build(ctx) {
          const c = card(ctx.layer, 800, 420, 340, 300, C.cream);
          picture(c.inner, picName(P.lang, w), 800, 420, 1.1);
          c.g.addEventListener('pointerdown', (ev) => { ev.preventDefault(); replay(c.inner, 'hop'); ctx.word(w); });
          const vals = shuffle(rng, [first, ...others]);
          const by = ctx.choices(vals, (g, v, cc) => letterText(g, v, cc.x, cc.y, 140, tint(v)), first, { w: 260, h: 190 });
          return {
            fb: 'fbSound',
            cue: async () => { replay(c.inner, 'hop'); ctx.word(w); await ctx.wait(1300); },
            step: async () => { ctx.sound(first); await ctx.wait(900); const wrong = vals.find((v) => v !== first); await ctx.point(by[wrong]); by[wrong].g.style.opacity = 0.25; by[wrong].g.style.pointerEvents = 'none'; },
            help: async () => { ctx.word(w); await ctx.wait(1100); ctx.sound(first); await ctx.wait(900); await ctx.point(by[first]); replay(by[first].inner, 'hop'); ctx.sound(first); await ctx.wait(900); },
          };
        },
      };
    },
  },

  // ---------------------------------------------------------------------
  // Hear a word, choose the picture that rhymes with it (phonological awareness).
  rhyme: {
    make(rng, P) {
      const fams = RHYMES[P.lang] || RHYMES.en;
      const fam = pick(rng, fams);
      const [target, mate] = shuffle(rng, fam.slice()).slice(0, 2);
      const others = shuffle(rng, fams.filter((f) => f !== fam)).slice(0, 2).map((f) => pick(rng, f));
      return {
        key: 'rhymes', vars: {}, guess: 1 / 3,
        extra: (ctx) => ctx.word(target),
        build(ctx) {
          const c = card(ctx.layer, 800, 390, 340, 290, C.cream);
          picture(c.inner, target, 800, 390, 1.2);
          c.g.addEventListener('pointerdown', (ev) => { ev.preventDefault(); replay(c.inner, 'hop'); ctx.word(target); });
          const vals = shuffle(rng, [mate, ...others]);
          const by = ctx.choices(vals, (g, v, cc) => picture(g, v, cc.x, cc.y, 0.8), mate, { w: 320, h: 210 });
          vals.forEach((v) => by[v].g.addEventListener('pointerdown', () => ctx.word(v)));
          return {
            fb: 'fbLook',
            cue: async () => { ctx.word(target); await ctx.wait(1100); for (const v of vals) { await ctx.point(by[v]); ctx.word(v); await ctx.wait(900); } },
            step: async () => { const wrong = vals.find((v) => v !== mate); await ctx.point(by[wrong]); by[wrong].g.style.opacity = 0.25; by[wrong].g.style.pointerEvents = 'none'; await ctx.wait(400); },
            help: async () => { ctx.word(target); await ctx.wait(1000); await ctx.point(by[mate]); replay(by[mate].inner, 'hop'); ctx.word(mate); await ctx.wait(1000); ctx.word(target); await ctx.wait(1000); },
          };
        },
      };
    },
  },

  // ---------------------------------------------------------------------
  // Touch each letter to hear its sound, blend, and choose the picture.
  blend: {
    make(rng, P) {
      const w = pick(rng, P.words);
      const others = shuffle(rng, Object.keys(WORDS[P.lang]).filter((x) => x !== w)).slice(0, 2);
      return {
        key: 'readWord', vars: {}, guess: 1 / 3,
        build(ctx) {
          const us = units(P.lang, w);
          const n = us.length, gap = 150, x0 = 800 - ((n - 1) * gap) / 2;
          let heard = 0;
          const tiles = us.map((u, i) => {
            const g = s('g', { class: 'tap' }, ctx.layer);
            g.x = x0 + i * gap; g.y = 330;
            g.inner = s('g', { class: 'fb' }, g);
            const silent = !spoken(u);
            s('rect', ink({ x: g.x - 64, y: 250, width: 128, height: 160, rx: 26, fill: silent ? '#efe8da' : (vowel(u) ? '#f2dcd2' : '#d6e6e3') }, 4), g.inner);
            letterText(g.inner, shown(u), g.x, 330, 120, silent ? C.stone : tint(u), silent ? 0.7 : 1);
            g.dataset.tile = '1';
            g.addEventListener('pointerdown', (ev) => {
              ev.preventDefault(); replay(g.inner, 'hop');
              if (spoken(u)) ctx.sound(u); else ctx.tick();
              if (!g.heard) { g.heard = true; g.inner.classList.remove('invite'); heard++; if (heard === n && ctx.onAllHeard) ctx.onAllHeard(); }
            });
            return g;
          });
          const vals = shuffle(rng, [w, ...others]);
          const by = ctx.choices(vals, (g, v, cc) => picture(g, picName(P.lang, v), cc.x, cc.y, 0.8), w, { w: 320, h: 210 });
          // After every sound has been heard, the letters slide together and the word is said.
          const blendAll = async () => {
            for (const t of tiles) if (!t.heard) await ctx.press(t);
            await ctx.wait(400);
            tiles.forEach((t, i) => { t.style.transition = 'transform .6s ease'; t.style.transform = `translateX(${(x0 + i * 112 - (x0 + i * gap)) + ((n - 1) * (gap - 112)) / 2}px)`; });
            await ctx.wait(700); ctx.word(w); await ctx.wait(1100);
          };
          if (ctx.mode === 'together') {
            ctx.dimChoices(true);
            tiles.forEach((t) => t.inner.classList.add('invite'));
            ctx.onAllHeard = async () => { await ctx.wait(600); tiles.forEach((t, i) => { t.style.transition = 'transform .6s ease'; t.style.transform = `translateX(${(x0 + i * 112 - (x0 + i * gap)) + ((n - 1) * (gap - 112)) / 2}px)`; }); await ctx.wait(700); ctx.word(w); ctx.dimChoices(false); };
          }
          return {
            guided: true,
            fb: 'fbBlend',
            cue: async () => { tiles.filter((t) => !t.heard).forEach((t) => t.inner.classList.add('invite')); ctx.say('touchSounds'); await ctx.wait(1500); },
            step: async () => { let k = 0; for (const t of tiles) { if (k >= 2) break; if (!t.heard) { await ctx.press(t); k++; await ctx.wait(300); } } },
            help: async () => { await blendAll(); await ctx.point(by[w]); replay(by[w].inner, 'hop'); },
            solve: async () => { ctx.say('touchSounds'); await ctx.wait(1500); await blendAll(); await ctx.press(by[w]); },
          };
        },
      };
    },
  },

  // ---------------------------------------------------------------------
  // Build a word: hear it, see its picture, put the letter tiles in order.
  spell: {
    make(rng, P) {
      const w = pick(rng, P.words);
      return {
        key: 'buildWord', vars: {}, guess: 0.05,
        extra: (ctx) => ctx.word(w),
        build(ctx) {
          const us = units(P.lang, w).map(shown);
          const extras = shuffle(rng, 'abcdefghilmnoprstu'.split('').filter((l) => !us.includes(l))).slice(0, Math.max(2, 6 - us.length));
          const bank = shuffle(rng, [...us, ...extras]);
          const pc = card(ctx.layer, 330, 360, 280, 240, C.cream);
          picture(pc.inner, picName(P.lang, w), 330, 360, 0.95);
          pc.g.addEventListener('pointerdown', (ev) => { ev.preventDefault(); replay(pc.inner, 'hop'); ctx.word(w); });
          const n = us.length, sx0 = 1000 - ((n - 1) * 140) / 2;
          const slots = us.map((u, i) => { const x = sx0 + i * 140; s('rect', ink({ x: x - 60, y: 270, width: 120, height: 150, rx: 22, fill: C.white, 'stroke-dasharray': '10 10' }, 3), ctx.layer); return { x, y: 345, tile: null }; });
          const bx0 = 800 - ((bank.length - 1) * 140) / 2;
          const tiles = bank.map((l, i) => {
            const g = s('g', { class: 'tap' }, ctx.layer);
            g.home = { x: bx0 + i * 140, y: 560 }; g.x = g.home.x; g.y = g.home.y; g.letter = l; g.slot = -1;
            g.dataset.letter = l;
            g.inner = s('g', { class: 'fb' }, g);
            s('rect', ink({ x: -58, y: -66, width: 116, height: 132, rx: 22, fill: vowel(l) ? '#f2dcd2' : '#d6e6e3' }, 4), g.inner);
            letterText(g.inner, l, 0, 0, 100, tint(l));
            const place = () => { g.style.transition = 'transform .3s ease'; g.setAttribute('transform', `translate(${g.x} ${g.y})`); };
            g.place = place;
            g.addEventListener('pointerdown', (ev) => {
              ev.preventDefault();
              if (g.slot >= 0) { slots[g.slot].tile = null; g.slot = -1; g.x = g.home.x; g.y = g.home.y; }
              else { const k = slots.findIndex((sl) => !sl.tile); if (k < 0) return; slots[k].tile = g; g.slot = k; g.x = slots[k].x; g.y = slots[k].y; ctx.sound(l); }
              replay(g.inner, 'hop'); place();
              if (ctx.mode === 'together') guideNext();
            });
            place();
            return g;
          });
          // Together: the next letter needed pulses (the sounds are still the child's to hear and place).
          function guideNext() {
            tiles.forEach((t) => t.inner.classList.remove('invite'));
            const k = slots.findIndex((sl) => !sl.tile);
            if (k < 0) return;
            const t = tiles.find((q) => q.letter === us[k] && q.slot < 0);
            if (t) t.inner.classList.add('invite');
          }
          if (ctx.mode === 'together') ctx.later(1800, guideNext);
          const ok = card(ctx.layer, 800, CHOICE_Y + 10, 200, 130, C.sage);
          s('path', ink({ d: `M760 ${CHOICE_Y + 10} l28 28 l52 -58`, fill: 'none', stroke: C.white }, 14), ok.inner);
          ok.g.dataset.word = us.join('');
          const spelled = () => slots.map((sl) => (sl.tile ? sl.tile.letter : '')).join('');
          ok.g.addEventListener('pointerdown', (ev) => { ev.preventDefault(); ctx.pick(spelled() === us.join(''), ok); });
          ctx.correct(ok);
          const fill = async (upTo) => {
            // Take out wrong letters, then place the right ones in order.
            for (const sl of slots) if (sl.tile && sl.tile.letter !== us[slots.indexOf(sl)]) await ctx.press(sl.tile);
            for (let i = 0; i < Math.min(upTo, n); i++) {
              if (slots[i].tile) continue;
              const t = tiles.find((q) => q.letter === us[i] && q.slot < 0);
              if (t) await ctx.press(t);
            }
          };
          return {
            guided: true,
            fb: 'fbSpell',
            cue: async () => { ctx.word(w); await ctx.wait(1000); for (const u of us) { ctx.sound(u); await ctx.wait(700); } },
            step: async () => { await fill(1); },
            help: async () => { for (const u of us) { ctx.sound(u); await ctx.wait(600); } await fill(n); },
            solve: async () => { ctx.word(w); await ctx.wait(1000); await fill(n); await ctx.wait(500); await ctx.press(ok); },
          };
        },
      };
    },
  },
};

// Math activity templates. Each template turns parameters into a fresh item:
//   make(rng, params) -> { key, vars, guess, build(ctx) }
// build() draws into ctx.layer and wires answers through ctx.choices() or
// ctx.pick(ok). It may return { help } — an async demonstration shown after a
// first wrong answer (for example, counting the objects together).
import { s, C, replay } from '../../lib.js';
import { ink, obj, moveObj, scatter, frames, drawFrames, blocks, numeral, fractionGlyph, card, near, shuffle, randInt, KIND_NAMES, INK, STAGE, CHOICE_Y } from '../draw.js';

const pickKind = (rng) => KIND_NAMES[Math.floor(rng() * KIND_NAMES.length)];
const COLORS = [C.terra, C.teal, C.ochre, C.plum, C.blue, C.sage];

// Lay out n objects: scattered when few, ten-frames when many.
function group(ctx, n, kind, box, opts = {}) {
  const out = [];
  if (n > 10 || opts.frame) {
    const cell = n > 20 ? 56 : 76;
    const fr = frames(n, box.x + box.w / 2, box.y + box.h / 2, cell);
    drawFrames(ctx.layer, fr, cell);
    for (let i = 0; i < n; i++) out.push(obj(ctx.layer, kind, fr.cells[i].x, fr.cells[i].y, cell / 90, opts.color));
  } else {
    // Bigger objects when there are few of them (easier for small hands and eyes).
    const sc = opts.scale || (n <= 5 ? 1.45 : 1.15);
    const pts = scatter(ctx.rng, n, box, opts.minDist || 110 * sc);
    pts.sort((a, b) => a.x - b.x);
    for (const p of pts) out.push(obj(ctx.layer, kind, p.x, p.y, sc, opts.color));
  }
  return out;
}

// Count objects aloud, one by one, with the guide's hand pointing at each.
async function countTogether(ctx, objs, from = 1) {
  for (let i = 0; i < objs.length; i++) {
    await ctx.point(objs[i]);
    replay(objs[i].inner, 'hop');
    ctx.sayNumber(from + i);
    ctx.tick();
    await ctx.wait(ctx.calm ? 650 : 420);
  }
}

// A small numbered badge next to a counted object.
function badge(ctx, o, k) {
  const sc = o.scale || 1;
  const b = s('g', { class: 'fb popin', 'pointer-events': 'none' }, ctx.layer);
  s('circle', ink({ cx: o.x + 30 * sc, cy: o.y - 36 * sc, r: 25, fill: C.white }, 3), b);
  numeral(b, k, o.x + 30 * sc, o.y - 36 * sc + 2, 32, C.teal);
  return b;
}

const digits = (size) => (g, v, c) => { numeral(g, v, c.x, c.y, size); };
function dotsUnder(g, v, c) {
  numeral(g, v, c.x, c.y - 18, 100);
  for (let i = 0; i < v; i++) s('circle', { cx: c.x - (v - 1) * 11 + i * 22, cy: c.y + 58, r: 7, fill: C.terra }, g);
}

export const TEMPLATES = {
  // ---------------------------------------------------------------------
  count: {
    make(rng, P) {
      const n = randInt(rng, P.min || 1, P.max);
      return {
        key: P.flash ? 'quick' : 'howMany', vars: {}, guess: 1 / 3,
        build(ctx) {
          const kind = pickKind(rng);
          const box = { x: 380, y: STAGE.top + 50, w: 840, h: STAGE.bottom - STAGE.top - 100 };
          const objs = group(ctx, n, kind, box, { frame: P.frame });
          // Touch each object to count it: it gets the next number (one-to-one counting).
          let counted = 0, last = null;
          const countObj = (o) => {
            if (o.counted) return;
            o.counted = ++counted;
            o.inner.classList.remove('invite');
            if (last) last.classList.remove('invite');
            last = badge(ctx, o, counted);
            replay(o.inner, 'hop'); ctx.sayNumber(counted); ctx.tick();
            if (counted === n) { last.classList.add('invite'); if (ctx.onAllCounted) ctx.onAllCounted(); }
          };
          let cloth = null;
          if (P.flash) {
            ctx.later(1600, () => {
              cloth = s('g', { class: 'fb popin' }, ctx.layer);
              s('rect', ink({ x: box.x - 40, y: box.y - 40, width: box.w + 80, height: box.h + 80, rx: 40, fill: C.sand }, 4), cloth);
              for (let i = 0; i < 6; i++) s('path', { d: `M${box.x + 40 + i * 140} ${box.y - 30} q20 ${box.h / 2} 0 ${box.h + 60}`, stroke: C.woodL, 'stroke-width': 6, fill: 'none', opacity: 0.6 }, cloth);
            });
          } else {
            objs.forEach((o) => { o.classList.add('tap'); o.addEventListener('pointerdown', (e) => { e.preventDefault(); countObj(o); }); });
          }
          const vals = shuffle(rng, [n, ...near(rng, n, 2, Math.max(0, (P.min || 1) - 1), P.max + 2)]);
          const cards = ctx.choices(vals, P.max <= 5 ? dotsUnder : digits(120), n);
          const countAll = async () => { for (const o of objs) if (!o.counted) await ctx.press(o, () => countObj(o)); };
          if (ctx.mode === 'together' && !P.flash) {
            // Guided: the choices wait until every object has been touched and counted.
            ctx.dimChoices(true);
            objs.forEach((o) => o.inner.classList.add('invite'));
            ctx.onAllCounted = async () => { await ctx.wait(900); ctx.dimChoices(false); ctx.say('lastNumber'); };
          }
          return {
            guided: !P.flash,
            help: async () => { if (cloth) { cloth.remove(); cloth = null; } ctx.say('together'); await ctx.wait(1100); await countAll(); await ctx.wait(500); ctx.say('lastNumber'); await ctx.wait(1400); },
            solve: async () => {
              if (P.flash) { await ctx.wait(2400); if (cloth) { cloth.remove(); cloth = null; } }
              ctx.say('touchCount'); await ctx.wait(1300);
              await countAll(); await ctx.wait(700);
              ctx.say('lastNumber'); await ctx.wait(1500);
              await ctx.press(cards[n]);
            },
          };
        },
      };
    },
  },

  // ---------------------------------------------------------------------
  // Put exactly n objects in the basket (producing a quantity, not choosing one).
  give: {
    make(rng, P) {
      const n = randInt(rng, P.min || 1, P.max);
      return {
        key: 'give', vars: { n }, guess: 0.1,
        build(ctx) {
          const kind = pickKind(rng);
          const total = Math.min(n + 3, 14);
          // The friend asking, with a speech bubble that shows the number and that many dots.
          const fox = s('g', null, ctx.layer);
          fox.inner = s('g', { class: 'fbb' }, fox);
          drawFriend(fox.inner, 1330, 520);
          const bub = s('g', null, ctx.layer);
          s('path', ink({ d: 'M1170 170 h320 a30 30 0 0 1 30 30 v150 a30 30 0 0 1 -30 30 h-120 l-30 40 l-10 -40 h-160 a30 30 0 0 1 -30 -30 v-150 a30 30 0 0 1 30 -30 z', fill: C.white }, 4), bub);
          numeral(bub, n, 1250, 275, 110, C.terra);
          const dots = [];
          const showDots = n <= 10;
          for (let i = 0; showDots && i < n; i++) {
            const dx = 1360 + (i % 5) * 30, dy = 245 + Math.floor(i / 5) * 32;
            dots.push(s('circle', ink({ cx: dx, cy: dy, r: 11, fill: C.white }, 2.5), bub));
          }
          // Table of objects and the basket.
          s('rect', ink({ x: 250, y: 600, width: 700, height: 26, rx: 10, fill: C.woodL }, 4), ctx.layer);
          const basket = s('g', null, ctx.layer);
          s('path', ink({ d: 'M930 560 h300 l-30 150 h-240 z', fill: C.wood }, 4), basket);
          for (let i = 0; i < 4; i++) s('line', { x1: 950 + i * 20, y1: 600 + i * 25, x2: 1210 - i * 20, y2: 600 + i * 25, stroke: C.woodD, 'stroke-width': 3, opacity: 0.6 }, basket);
          const count = numeral(ctx.layer, '', 1080, 500, 80, C.teal);
          const home = scatter(rng, total, { x: 300, y: 290, w: 600, h: 260 }, 92);
          const items = home.map((p) => { const o = obj(ctx.layer, kind, p.x, p.y, 1.05); o.home = p; o.inBasket = false; return o; });
          const inBasket = [];
          const slot = (i) => ({ x: 990 + (i % 4) * 62, y: 610 - Math.floor(i / 4) * 34 });
          const refresh = () => {
            count.textContent = inBasket.length ? String(inBasket.length) : '';
            dots.forEach((d, i) => d.setAttribute('fill', ctx.mode !== 'own' && i < inBasket.length ? C.terra : C.white));
          };
          const toggle = (o) => {
            if (!o.inBasket) { if (inBasket.length >= 12) return; o.inBasket = true; inBasket.push(o); const sp = slot(inBasket.length - 1); moveObj(o, sp.x, sp.y); ctx.sayNumber(inBasket.length); }
            else { o.inBasket = false; inBasket.splice(inBasket.indexOf(o), 1); moveObj(o, o.home.x, o.home.y); inBasket.forEach((q, i) => { const sp = slot(i); moveObj(q, sp.x, sp.y); }); ctx.sayNumber(inBasket.length); }
            o.style.transition = 'transform .35s ease';
            o.dataset.inb = o.inBasket ? '1' : '';
            replay(o.inner, 'hop'); ctx.tick(); refresh();
          };
          items.forEach((o) => { o.style.transition = 'transform .35s ease'; o.classList.add('tap'); o.addEventListener('pointerdown', (e) => { e.preventDefault(); toggle(o); }); });
          // "Give" button: a basket with an arrow to the friend.
          const give = card(ctx.layer, 1080, CHOICE_Y + 10, 220, 140, C.sage);
          s('path', ink({ d: 'M1030 790 h60 M1070 770 l24 20 l-24 20', fill: 'none', stroke: C.white }, 10), give.inner);
          give.g.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            const ok = inBasket.length === n;
            if (ok) { replay(fox.inner, 'hop'); inBasket.forEach((o) => { o.style.transition = 'transform .6s ease, opacity .6s'; moveObj(o, 1330, 470); o.style.opacity = 0; }); }
            else replay(fox.inner, 'wiggle');
            ctx.pick(ok, give);
          });
          ctx.correct(give);
          give.g.dataset.give = String(n);
          items.forEach((o) => { o.dataset.item = '1'; });
          refresh();
          const fix = async () => {
            while (inBasket.length > n) { const o = inBasket[inBasket.length - 1]; await ctx.press(o, () => toggle(o)); }
            for (const o of items) { if (inBasket.length >= n) break; if (!o.inBasket) await ctx.press(o, () => toggle(o)); }
          };
          if (ctx.mode === 'together') items.forEach((o) => o.inner.classList.add('invite'));
          return {
            guided: true, // the dots in the bubble fill as the child adds objects
            help: async () => {
              // Count what is in the basket, then add or take away until it matches.
              ctx.say('give', { n }); await ctx.wait(1500);
              await fix(); await ctx.wait(600);
            },
            solve: async () => { await ctx.wait(1500); await fix(); await ctx.wait(700); await ctx.press(give); },
          };
        },
      };
    },
  },

  // ---------------------------------------------------------------------
  compare: {
    make(rng, P) {
      if (P.numerals) {
        const a = randInt(rng, P.min || 0, P.max);
        let b = randInt(rng, P.min || 0, P.max);
        while (b === a) b = randInt(rng, P.min || 0, P.max);
        return {
          key: 'bigger', vars: {}, guess: 0.5,
          build(ctx) {
            const cards = [a, b].map((v, i) => {
              const c = card(ctx.layer, 520 + i * 560, 420, 380, 300);
              numeral(c.inner, v, c.x, c.y, 170);
              c.g.addEventListener('pointerdown', (e) => { e.preventDefault(); ctx.pick(v === Math.max(a, b), c); });
              return c;
            });
            ctx.correct(cards[a > b ? 0 : 1]);
            return { help: async () => { [a, b].forEach((v, i) => blocks(ctx.layer, v, 420 + i * 560, 380, 18)); await ctx.wait(1200); await ctx.point(cards[0]); ctx.sayNumber(a); await ctx.wait(1000); await ctx.point(cards[1]); ctx.sayNumber(b); await ctx.wait(1000); } };
          },
        };
      }
      const a = randInt(rng, 1, P.max);
      let b = randInt(rng, 1, P.max);
      while (b === a) b = randInt(rng, 1, P.max);
      return {
        key: 'more', vars: {}, guess: 0.5,
        build(ctx) {
          const kind = pickKind(rng);
          const trays = [a, b].map((v, i) => {
            const c = card(ctx.layer, 470 + i * 660, 470, 600, 520, C.cream);
            c.objs = group({ ...ctx, layer: c.inner }, v, kind, { x: c.x - 230, y: c.y - 190, w: 460, h: 380 }, { minDist: 115, scale: a <= 5 && b <= 5 ? 1.25 : 1 });
            c.g.addEventListener('pointerdown', (e) => { e.preventDefault(); ctx.pick(v === Math.max(a, b), c); });
            return c;
          });
          ctx.correct(trays[a > b ? 0 : 1]);
          return { help: async () => { ctx.say('together'); await ctx.wait(1200); await countTogether(ctx, trays[0].objs); await ctx.wait(500); await countTogether(ctx, trays[1].objs); } };
        },
      };
    },
  },

  // ---------------------------------------------------------------------
  numeral: {
    make(rng, P) {
      const n = randInt(rng, P.min || 1, P.max);
      return {
        key: 'find', vars: { n }, guess: 1 / 3,
        build(ctx) {
          const c = card(ctx.layer, 800, 380, 280, 260, C.cream);
          numeral(c.inner, n, 800, 380, 170, C.terra);
          const kind = pickKind(rng);
          const vals = shuffle(rng, [n, ...near(rng, n, 2, 1, P.max + 2)]);
          const groups = {};
          ctx.choices(vals, (g, v, cc) => {
            const fr = frames(v, cc.x, cc.y, v > 10 ? 22 : 34);
            drawFrames(g, fr, v > 10 ? 22 : 34);
            groups[v] = [];
            for (let i = 0; i < v; i++) {
              const o = s('g', { transform: `translate(${fr.cells[i].x} ${fr.cells[i].y})` }, g);
              o.x = fr.cells[i].x; o.y = fr.cells[i].y;
              o.inner = s('g', { class: 'fb' }, o);
              s('circle', ink({ r: v > 10 ? 8 : 12, fill: C.terra }, 2.5), o.inner);
              groups[v].push(o);
            }
          }, n, { w: 400, h: 170 });
          return { help: async () => { await countTogether(ctx, groups[n]); } };
        },
      };
    },
  },

  // ---------------------------------------------------------------------
  numberline: {
    make(rng, P) {
      const step = P.step || 1, len = 5;
      const startMax = Math.floor((P.max - step * (len - 1)) / step);
      const start = randInt(rng, Math.ceil((P.min || 0) / step), Math.max(Math.ceil((P.min || 0) / step), startMax)) * step;
      const seq = Array.from({ length: len }, (_, i) => start + i * step);
      const hole = P.next ? len - 1 : randInt(rng, 1, len - 1);
      const ans = seq[hole];
      return {
        key: P.next ? 'next' : 'missing', vars: P.next ? { s: step } : {}, guess: 1 / 3,
        build(ctx) {
          s('line', ink({ x1: 260, y1: 470, x2: 1340, y2: 470 }, 6), ctx.layer);
          const stones = seq.map((v, i) => {
            const x = 340 + i * 230;
            const g = s('g', null, ctx.layer);
            g.inner = s('g', { class: 'fb' }, g);
            s('circle', ink({ cx: x, cy: 400, r: 78, fill: i === hole ? C.white : C.cream, 'stroke-dasharray': i === hole ? '10 10' : null }, 4), g.inner);
            if (i !== hole) numeral(g.inner, v, x, 400, v > 99 ? 64 : 84);
            else numeral(g.inner, '?', x, 400, 84, C.stone);
            s('line', ink({ x1: x, y1: 455, x2: x, y2: 490 }, 5), ctx.layer);
            return g;
          });
          const vals = shuffle(rng, [ans, ...near(rng, ans, 2, 0, P.max + step * 2, [step, -step, 1, -1, 2 * step, 10])]);
          ctx.choices(vals, digits(110), ans);
          stones.forEach((g, i) => { g.x = 340 + i * 230; g.y = 400; });
          return { help: async () => { for (let i = 0; i < len; i++) { await ctx.point(stones[i]); replay(stones[i].inner, 'hop'); ctx.sayNumber(seq[i]); ctx.tick(); await ctx.wait(500); } } };
        },
      };
    },
  },

  // ---------------------------------------------------------------------
  arith: {
    make(rng, P) {
      const add = P.op === 'add';
      let a, b;
      if (add) { a = randInt(rng, P.minA || 1, P.max - 1); b = randInt(rng, 1, Math.min(P.maxB || P.max, P.max - a)); }
      else { a = randInt(rng, Math.max(2, P.minA || 2), P.max); b = randInt(rng, 1, Math.min(P.maxB || a, a)); }
      const ans = add ? a + b : a - b;
      return {
        key: add ? 'add' : 'sub', vars: { a, b }, guess: 1 / 3,
        build(ctx) {
          const eq = s('g', null, ctx.layer);
          numeral(eq, `${a} ${add ? '+' : '−'} ${b} = ?`, 800, STAGE.top + 60, 110);
          let objs = [], gone = [];
          if (P.visual) {
            const kind = pickKind(rng);
            const sc = P.max <= 5 ? 1.25 : 1;
            if (add) {
              // Two trays joined by a big plus: the structure of addition is visible.
              const trays = [490, 1110].map((x) => { const c = card(ctx.layer, x, 450, 470, 300, C.cream); c.g.classList.remove('tap'); return c; });
              numeral(ctx.layer, '+', 800, 450, 120, C.stone);
              objs = [...group(ctx, a, kind, { x: 310, y: 350, w: 360, h: 200 }, { minDist: 100 * sc, scale: sc, color: COLORS[0] }),
                ...group(ctx, b, kind, { x: 930, y: 350, w: 360, h: 200 }, { minDist: 100 * sc, scale: sc, color: COLORS[1] })];
            } else {
              const tray = card(ctx.layer, 800, 450, 1000, 300, C.cream); tray.g.classList.remove('tap');
              const all = group(ctx, a, kind, { x: 360, y: 350, w: 880, h: 200 }, { minDist: 100 * sc, scale: sc });
              gone = all.slice(a - b); objs = all.slice(0, a - b);
              gone.forEach((o) => { o.style.transition = 'opacity .8s'; o.style.opacity = 0.35; s('path', ink({ d: 'M-26 -26 L26 26 M26 -26 L-26 26', fill: 'none', stroke: C.terra }, 6), o); });
            }
          } else if (P.blocks) {
            blocks(ctx.layer, a, 330, 330, 24);
            blocks(ctx.layer, b, 950, 330, 24);
            numeral(ctx.layer, add ? '+' : '−', 800, 460, 100, C.stone);
          }
          const spread = P.max > 20 ? [1, -1, 10, -10, 2] : [1, -1, 2, -2];
          const vals = shuffle(rng, [ans, ...near(rng, ans, 2, 0, P.max + 10, spread)]);
          ctx.choices(vals, digits(110), ans);
          return {
            help: async () => {
              if (P.visual && objs.length) { ctx.say('together'); await ctx.wait(1200); await countTogether(ctx, objs); }
              else {
                // Show the jump on a small number line.
                const g = s('g', { class: 'fb popin' }, ctx.layer);
                s('rect', ink({ x: 300, y: 300, width: 1000, height: 300, rx: 30, fill: C.cream }, 3), g);
                blocks(g, ans, 700, 330, 22);
                numeral(g, ans, 560, 450, 100, C.teal);
                await ctx.wait(2000);
              }
            },
          };
        },
      };
    },
  },

  // ---------------------------------------------------------------------
  bonds: {
    make(rng, P) {
      const to = P.to || 10;
      const k = randInt(rng, 1, to - 1);
      const ans = to - k;
      return {
        key: 'makeTen', vars: { n: to }, guess: 1 / 3,
        build(ctx) {
          const cell = 100;
          const fr = frames(10, 800, 420, cell);
          drawFrames(ctx.layer, fr, cell);
          if (to === 5) s('rect', { x: fr.frames[0].x, y: 420, width: fr.frames[0].w, height: cell + 12, fill: C.paper, opacity: 0.85 }, ctx.layer);
          for (let i = 0; i < k; i++) obj(ctx.layer, 'ball', fr.cells[i].x, fr.cells[i].y, 1, C.terra);
          const vals = shuffle(rng, [ans, ...near(rng, ans, 2, 0, to)]);
          ctx.choices(vals, digits(120), ans);
          return {
            help: async () => {
              for (let i = k; i < to; i++) {
                await ctx.point(fr.cells[i]);
                const o = obj(ctx.layer, 'ball', fr.cells[i].x, fr.cells[i].y, 1, C.teal);
                replay(o.inner, 'popin');
                ctx.sayNumber(i - k + 1); ctx.tick();
                await ctx.wait(450);
              }
            },
          };
        },
      };
    },
  },

  // ---------------------------------------------------------------------
  // Build a number from tens rods and ones cubes (a manipulative).
  placevalue: {
    make(rng, P) {
      const n = randInt(rng, P.min || 11, P.max);
      return {
        key: 'build', vars: { n }, guess: 0.08,
        build(ctx) {
          numeral(ctx.layer, n, 800, STAGE.top + 40, 120, C.terra);
          let tens = 0, ones = 0;
          const tray = card(ctx.layer, 800, 470, 640, 330, C.cream);
          tray.g.classList.remove('tap');
          const trayG = s('g', null, ctx.layer);
          const live = numeral(ctx.layer, '', 800, 670, 60, C.stone);
          let showLive = ctx.mode !== 'own';
          function redraw() {
            trayG.innerHTML = '';
            const pieces = blocks(trayG, tens * 10 + ones, 520, 330, 24);
            pieces.forEach((pc, i) => {
              pc.classList.add('tap');
              pc.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); if (i < tens) tens--; else ones--; ctx.tick(); redraw(); });
            });
            live.textContent = showLive ? String(tens * 10 + ones) : '';
          }
          // Supply bins
          const binT = card(ctx.layer, 260, 470, 220, 330, C.sand);
          blocks(binT.inner, 30, 200, 360, 22);
          const binO = card(ctx.layer, 1340, 470, 220, 330, C.sand);
          for (let i = 0; i < 6; i++) s('rect', ink({ x: 1300 + (i % 2) * 40, y: 420 + Math.floor(i / 2) * 40, width: 28, height: 28, rx: 4, fill: C.ochre }, 3), binO.inner);
          binT.g.addEventListener('pointerdown', (e) => { e.preventDefault(); if (tens < 9) { tens++; replay(binT.inner, 'wiggle'); ctx.click(); redraw(); } });
          binO.g.addEventListener('pointerdown', (e) => { e.preventDefault(); if (ones < 19) { ones++; replay(binO.inner, 'wiggle'); ctx.click(); redraw(); } });
          // Check button
          const ok = card(ctx.layer, 800, CHOICE_Y, 200, 140, C.sage);
          s('path', ink({ d: 'M760 780 l28 28 l52 -58', fill: 'none', stroke: C.white }, 14), ok.inner);
          ok.g.addEventListener('pointerdown', (e) => { e.preventDefault(); ctx.pick(tens * 10 + ones === n, ok); });
          ctx.correct(ok);
          binT.g.dataset.bin = 'tens'; binO.g.dataset.bin = 'ones'; ok.g.dataset.target = String(n);
          redraw();
          const buildIt = async () => {
            while (tens * 10 + ones > n && trayG.firstChild) { const pcs = trayG.querySelectorAll('g.tap'); await ctx.press(pcs[pcs.length - 1]); }
            while (tens < Math.floor(n / 10)) await ctx.press(binT);
            while (ones < n % 10) await ctx.press(binO);
            while (tens > Math.floor(n / 10)) await ctx.press(trayG.querySelector('g.tap'));
          };
          return {
            guided: true, // in "together" the running total is shown while building
            help: async () => { showLive = true; redraw(); ctx.say('build', { n }); await ctx.wait(1200); await buildIt(); await ctx.wait(800); },
            solve: async () => { showLive = true; redraw(); await ctx.wait(1200); await buildIt(); await ctx.wait(800); await ctx.press(ok); },
          };
        },
      };
    },
  },

  // ---------------------------------------------------------------------
  groups: {
    make(rng, P) {
      const a = randInt(rng, P.minA || 2, P.maxA), b = randInt(rng, P.minB || 1, P.maxB);
      const share = P.mode === 'share';
      const ans = share ? a : a * b;
      return {
        key: share ? 'share' : 'times', vars: share ? { a: a * b, b } : { a, b }, guess: 1 / 3,
        build(ctx) {
          const kind = pickKind(rng);
          if (P.symbols) numeral(ctx.layer, share ? `${a * b} ÷ ${b} = ?` : `${a} × ${b} = ?`, 800, STAGE.top + 40, 96);
          const top = P.symbols ? 300 : 230;
          let rings = [], plates = [], pile = [];
          if (!share) {
            const cols = Math.min(a, 5), rows = Math.ceil(a / cols);
            for (let i = 0; i < a; i++) {
              const cx = 800 + ((i % cols) - (cols - 1) / 2) * 250, cy = top + (rows > 1 ? 70 : 150) + Math.floor(i / cols) * 175;
              const ring = s('g', null, ctx.layer);
              ring.x = cx; ring.y = cy;
              ring.inner = s('g', { class: 'fb' }, ring);
              s('ellipse', ink({ cx, cy, rx: 110, ry: 78, fill: C.cream }, 3.5), ring.inner);
              const pts = scatter(rng, b, { x: cx - 70, y: cy - 45, w: 140, h: 90 }, 44);
              pts.forEach((p) => obj(ring.inner, kind, p.x, p.y, 0.5));
              rings.push(ring);
            }
          } else {
            for (let i = 0; i < b; i++) {
              const cx = 800 + (i - (b - 1) / 2) * 260;
              const pl = s('g', null, ctx.layer);
              s('ellipse', ink({ cx, cy: 560, rx: 110, ry: 40, fill: C.white }, 3.5), pl);
              plates.push({ g: pl, cx, n: 0 });
            }
            pile = group(ctx, a * b, kind, { x: 360, y: top - 20, w: 880, h: 200 }, { minDist: 62, scale: 0.55 });
          }
          const vals = shuffle(rng, [ans, ...near(rng, ans, 2, 1, ans + b + 2, share ? [1, -1, 2] : [b, -b, 1, -1])]);
          ctx.choices(vals, digits(110), ans);
          return {
            help: async () => {
              if (!share) {
                for (let i = 0; i < a; i++) { await ctx.point(rings[i]); replay(rings[i].inner, 'hop'); ctx.sayNumber((i + 1) * b); ctx.tick(); await ctx.wait(850); }
              } else {
                for (let i = 0; i < pile.length; i++) {
                  const p = plates[i % b];
                  const o = pile[i];
                  o.setAttribute('transform', `translate(${p.cx - 60 + (p.n % 4) * 40} ${545 - Math.floor(p.n / 4) * 30}) scale(.5)`);
                  p.n++; ctx.tick();
                  await ctx.wait(260);
                }
                await ctx.wait(600);
              }
            },
          };
        },
      };
    },
  },

  // ---------------------------------------------------------------------
  fraction: {
    make(rng, P) {
      const d = P.dens[Math.floor(rng() * P.dens.length)];
      const k = P.unit ? 1 : randInt(rng, 1, d - 1);
      const f = `${k}/${d}`;
      return {
        key: 'fraction', vars: { f }, guess: 1 / 3,
        build(ctx) {
          fractionGlyph(ctx.layer, f, 800, STAGE.top + 80, 70);
          // Distractors: same parts with another count, or another number of parts.
          const opts = [[k, d]];
          const cands = [];
          for (let kk = 1; kk < d; kk++) if (kk !== k) cands.push([kk, d]);
          for (const dd of [2, 3, 4, 5, 6, 8]) if (dd !== d && k < dd) cands.push([k, dd]);
          shuffle(rng, cands);
          while (opts.length < 3 && cands.length) opts.push(cands.shift());
          shuffle(rng, opts);
          const shape = rng() < 0.5 ? 'pie' : 'bar';
          const cards = opts.map(([kk, dd], i) => {
            const c = card(ctx.layer, 360 + i * 440, 540, 380, 320, C.cream);
            c.parts = drawFraction(c.inner, shape, kk, dd, c.x, c.y);
            c.g.addEventListener('pointerdown', (e) => { e.preventDefault(); ctx.pick(kk === k && dd === d, c); });
            if (kk === k && dd === d) ctx.correct(c);
            return c;
          });
          // Help: count all the equal parts (the bottom number), then the coloured ones (the top number).
          const right = cards.find((c) => c.g.dataset.ok);
          return {
            help: async () => {
              for (let i = 0; i < d; i++) { await ctx.point(right.parts[i]); replay(right.parts[i].el, 'hop'); ctx.sayNumber(i + 1); await ctx.wait(350); }
              await ctx.wait(500);
              for (let i = 0; i < k; i++) { await ctx.point(right.parts[i]); replay(right.parts[i].el, 'hop'); ctx.sayNumber(i + 1); await ctx.wait(350); }
              await ctx.wait(400);
            },
          };
        },
      };
    },
  },

  // ---------------------------------------------------------------------
  fracline: {
    make(rng, P) {
      const d = P.dens[Math.floor(rng() * P.dens.length)];
      const k = randInt(rng, 1, d - 1);
      const f = `${k}/${d}`;
      return {
        key: 'fracLine', vars: { f }, guess: 1 / (d - 1),
        build(ctx) {
          fractionGlyph(ctx.layer, f, 800, STAGE.top + 80, 70);
          const x0 = 260, x1 = 1340, y = 560;
          s('line', ink({ x1: x0, y1: y, x2: x1, y2: y }, 7), ctx.layer);
          numeral(ctx.layer, 0, x0, y + 70, 60);
          numeral(ctx.layer, 1, x1, y + 70, 60);
          const ticks = [];
          for (let i = 0; i <= d; i++) {
            const x = x0 + ((x1 - x0) * i) / d;
            s('line', ink({ x1: x, y1: y - 30, x2: x, y2: y + 30 }, 5), ctx.layer);
            if (i === 0 || i === d) continue;
            const g = s('g', { class: 'tap' }, ctx.layer);
            g.x = x; g.y = y - 90;
            g.inner = s('g', { class: 'fb' }, g);
            s('circle', ink({ cx: x, cy: y - 90, r: 46, fill: C.white }, 4), g.inner);
            s('circle', { cx: x, cy: y, r: 40, fill: 'transparent' }, g);
            g.addEventListener('pointerdown', (e) => { e.preventDefault(); ctx.pick(i === k, { g, inner: g.inner, bg: g.inner.firstChild }); });
            if (i === k) ctx.correct({ g, inner: g.inner, bg: g.inner.firstChild });
            ticks.push(g);
          }
          return { help: async () => { for (let i = 0; i < k; i++) { await ctx.point(ticks[i]); replay(ticks[i].inner, 'hop'); ctx.sayNumber(i + 1); ctx.tick(); await ctx.wait(400); } } };
        },
      };
    },
  },
};

// Draws a shape cut into d equal parts with k coloured; returns each part's centre.
function drawFraction(parent, shape, k, d, cx, cy) {
  const parts = [];
  if (shape === 'pie') {
    const r = 110;
    for (let i = 0; i < d; i++) {
      const a0 = (i / d) * Math.PI * 2 - Math.PI / 2, a1 = ((i + 1) / d) * Math.PI * 2 - Math.PI / 2;
      const large = a1 - a0 > Math.PI ? 1 : 0;
      const el = s('path', ink({ class: 'fb', d: `M${cx} ${cy} L${cx + Math.cos(a0) * r} ${cy + Math.sin(a0) * r} A${r} ${r} 0 ${large} 1 ${cx + Math.cos(a1) * r} ${cy + Math.sin(a1) * r} Z`, fill: i < k ? C.terra : C.white }, 4), parent);
      const am = (a0 + a1) / 2;
      parts.push({ el, x: cx + Math.cos(am) * r * 0.6, y: cy + Math.sin(am) * r * 0.6 });
    }
  } else {
    const w = 300, h = 110, x = cx - w / 2;
    for (let i = 0; i < d; i++) {
      const el = s('rect', ink({ class: 'fb', x: x + (w / d) * i, y: cy - h / 2, width: w / d, height: h, fill: i < k ? C.teal : C.white }, 4), parent);
      parts.push({ el, x: x + (w / d) * (i + 0.5), y: cy });
    }
  }
  return parts;
}

// The friend who asks for things in the "give" activity.
function drawFriend(g, x, y) {
  s('path', ink({ d: `M${x - 70} ${y - 40} L${x - 60} ${y - 120} L${x - 20} ${y - 80} Z M${x + 70} ${y - 40} L${x + 60} ${y - 120} L${x + 20} ${y - 80} Z`, fill: C.terra }, 4), g);
  s('ellipse', ink({ cx: x, cy: y + 120, rx: 80, ry: 90, fill: C.terra }, 4), g);
  s('ellipse', { cx: x, cy: y + 140, rx: 46, ry: 60, fill: C.cream }, g);
  s('circle', ink({ cx: x, cy: y - 20, r: 82, fill: C.terra }, 4), g);
  s('path', ink({ d: `M${x - 60} ${y + 10} Q${x} ${y + 60} ${x + 60} ${y + 10} Q${x} ${y + 40} ${x - 60} ${y + 10} Z`, fill: C.cream }, 3), g);
  for (const sx of [-1, 1]) s('circle', { cx: x + sx * 30, cy: y - 30, r: 8, fill: INK }, g);
  s('ellipse', { cx: x, cy: y + 8, rx: 10, ry: 7, fill: INK }, g);
}

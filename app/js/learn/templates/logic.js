// Logic, STEM and coding templates. Same contract as the math templates:
//   make(rng, params) -> { key, vars, guess, build(ctx) }
// build() draws into ctx.layer and may return { help, cue, step, solve,
// guided, fb }. Templates here:
//   pattern  – what comes next in a repeating (or growing) pattern
//   oddone   – which one does not belong (colour, kind or category)
//   sortit   – which basket does this go in (colour, kind or category)
//   path     – program the friend's way along a road with arrow tiles
//   debug    – a program has one wrong arrow: find it (then watch it work)
// Ideas behind them (see docs/BENCHMARK.md): patterns and classification are
// early algebraic and scientific thinking; sequencing arrows is the core of
// early coding (Code Karts, Lightbot, ScratchJr); debugging an erroneous
// example deepens understanding more than only building (erroneous-example
// research).
import { s, C, replay } from '../../lib.js';
import { avatar } from '../characters.js';
import { PICTURES } from '../pictures.js';
import { finish, shade, line } from '../art.js';
import { ink, obj, card, shuffle, randInt, KIND_NAMES } from '../draw.js';

const PALETTE = [C.terra, C.teal, C.ochre, C.plum, C.blue];
const TONES = [523, 659, 784, 988, 440];
const ANIMALS = ['cat', 'dog', 'pig', 'hen', 'fox', 'bat', 'bug'];
const THINGS = ['bus', 'cup', 'hat', 'van', 'jet', 'box', 'bed', 'pen'];
const pickN = (rng, arr, n) => shuffle(rng, arr.slice()).slice(0, n);

function picture(g, name, x, y, sc) {
  const p = s('g', { transform: `translate(${x} ${y}) scale(${sc})` }, g);
  PICTURES[name](p);
  finish(p);
  return p;
}

// Draws one "symbol" of a pattern or a sort: an object of a kind and colour.
function symbol(g, sym, x, y, sc) {
  if (sym.pic) return picture(g, sym.pic, x, y, sc * 0.55);
  return obj(g, sym.kind, x, y, sc, sym.color);
}

function tone(ctx, i) { ctx.audio?.tone?.(TONES[i % TONES.length], { dur: 0.25, vol: 0.06, type: 'sine' }); }

export const TEMPLATES = {
  // ---------------------------------------------------------------------
  pattern: {
    make(rng, P) {
      if (P.grow) {
        // Growing towers: 1, 2, 3 ... what comes next?
        const startH = randInt(rng, 1, 2), stepH = 1;
        const hs = [0, 1, 2].map((i) => startH + i * stepH), ans = startH + 3 * stepH;
        return {
          key: 'whatNext', vars: {}, guess: 1 / 3,
          build(ctx) {
            const towers = hs.map((h, i) => tower(ctx.layer, 430 + i * 230, 560, h, C.teal));
            const q = s('g', null, ctx.layer);
            s('rect', ink({ x: 430 + 3 * 230 - 50, y: 280, width: 100, height: 280, rx: 16, fill: 'none', 'stroke-dasharray': '12 10', stroke: C.stone }, 4), q);
            const vals = shuffle(rng, [ans, ans + 1, Math.max(1, ans - 2)]);
            const by = ctx.choices(vals, (g, v, c) => tower(g, c.x, c.y + 60, v, C.teal, 22), ans, { w: 220, h: 200 });
            towers.forEach((t, i) => { t.x = 430 + i * 230; t.y = 560 - hs[i] * 22; });
            return {
              fb: 'fbPattern',
              cue: async () => { for (const t of towers) { replay(t.inner, 'hop'); ctx.tick(); await ctx.wait(450); } },
              help: async () => { for (let i = 0; i < towers.length; i++) { await ctx.point(towers[i]); ctx.sayNumber(hs[i]); await ctx.wait(700); } await ctx.point({ x: 430 + 3 * 230, y: 420 }); ctx.sayNumber(ans); await ctx.wait(900); await ctx.point(by[ans]); },
            };
          },
        };
      }
      const unit = P.unit || 'AB';
      const kinds = shuffle(rng, KIND_NAMES.slice());
      const cols = shuffle(rng, PALETTE.slice());
      const letters = [...new Set(unit.split(''))];
      const syms = {};
      letters.forEach((L, i) => { syms[L] = P.by === 'kind' ? { kind: kinds[i] } : { kind: kinds[0], color: cols[i] }; });
      const len = unit.length >= 3 ? 8 : 7;
      const seq = Array.from({ length: len }, (_, i) => unit[i % unit.length]);
      const ans = seq[len - 1];
      const others = letters.filter((L) => L !== ans);
      const extra = P.by === 'kind' ? { kind: kinds[letters.length] } : { kind: kinds[0], color: cols[letters.length] };
      return {
        key: 'whatNext', vars: {}, guess: 1 / 3,
        build(ctx) {
          const gap = Math.min(170, 1300 / len), x0 = 800 - ((len - 1) * gap) / 2, y = 400;
          const sc = gap > 150 ? 1.25 : 1.05;
          // Soft brackets around each repetition of the unit (used by the cue).
          const brackets = s('g', { opacity: 0 }, ctx.layer);
          brackets.style.transition = 'opacity .5s';
          for (let i = 0; i + unit.length <= len - 1 || i === 0; i += unit.length) {
            const w = Math.min(unit.length, len - 1 - i) * gap;
            if (w <= 0) break;
            s('rect', { x: x0 + i * gap - gap / 2 + 8, y: y - 80, width: w - 16, height: 160, rx: 30, fill: '#f6ecd9', stroke: '#d8c3a0', 'stroke-width': 3 }, brackets);
          }
          const items = seq.slice(0, len - 1).map((L, i) => symbol(ctx.layer, syms[L], x0 + i * gap, y, sc));
          s('circle', ink({ cx: x0 + (len - 1) * gap, cy: y, r: 58, fill: C.white, 'stroke-dasharray': '10 10', stroke: C.stone }, 4), ctx.layer);
          const opts = shuffle(rng, [ans, ...others.slice(0, 1), 'X']);
          const by = ctx.choices(opts, (g, v, c) => symbol(g, v === 'X' ? extra : syms[v], c.x, c.y, 1.3), ans, { w: 240, h: 180 });
          const sing = async (upto) => { for (let i = 0; i < upto; i++) { await ctx.point(items[i]); replay(items[i].inner, 'hop'); tone(ctx, letters.indexOf(seq[i])); await ctx.wait(ctx.calm ? 520 : 380); } };
          return {
            fb: 'fbPattern',
            cue: async () => { brackets.setAttribute('opacity', 1); await ctx.wait(1400); },
            step: async () => { brackets.setAttribute('opacity', 1); await sing(unit.length * 2 > len - 1 ? unit.length : unit.length * 2); },
            help: async () => { brackets.setAttribute('opacity', 1); await sing(len - 1); await ctx.point({ x: x0 + (len - 1) * gap, y }); tone(ctx, letters.indexOf(ans)); await ctx.wait(700); },
          };
        },
      };
    },
  },

  // ---------------------------------------------------------------------
  oddone: {
    make(rng, P) {
      let same, odd;
      if (P.by === 'category') {
        const flip = rng() < 0.5;
        const [a, b] = flip ? [ANIMALS, THINGS] : [THINGS, ANIMALS];
        const three = pickN(rng, a, 3);
        same = three.map((pic) => ({ pic })); odd = { pic: pickN(rng, b, 1)[0] };
      } else if (P.by === 'kind') {
        const [k1, k2] = pickN(rng, KIND_NAMES, 2);
        same = [0, 1, 2].map(() => ({ kind: k1 })); odd = { kind: k2 };
      } else {
        const k = pickN(rng, KIND_NAMES, 1)[0], [c1, c2] = pickN(rng, PALETTE, 2);
        same = [0, 1, 2].map(() => ({ kind: k, color: c1 })); odd = { kind: k, color: c2 };
      }
      const order = shuffle(rng, [0, 1, 2, 3]);
      return {
        key: 'oddOne', vars: {}, guess: 1 / 4,
        build(ctx) {
          const cards = order.map((k, i) => {
            const x = 800 + (i - 1.5) * 330;
            const c = card(ctx.layer, x, 470, 290, 290, C.white);
            symbol(c.inner, k === 3 ? odd : same[k], x, 470, 1.6);
            c.g.addEventListener('pointerdown', (e) => { e.preventDefault(); ctx.pick(k === 3, c); });
            if (k === 3) ctx.correct(c);
            return c;
          });
          const sames = cards.filter((_, i) => order[i] !== 3), oddCard = cards[order.indexOf(3)];
          return {
            fb: 'fbSort',
            cue: async () => { for (const c of sames) { replay(c.inner, 'hop'); tone(ctx, 0); await ctx.wait(400); } },
            step: async () => { for (const c of sames.slice(0, 2)) { await ctx.point(c); tone(ctx, 0); await ctx.wait(600); } },
            help: async () => { for (const c of sames) { await ctx.point(c); replay(c.inner, 'hop'); tone(ctx, 0); await ctx.wait(650); } await ctx.point(oddCard); tone(ctx, 3); await ctx.wait(700); },
          };
        },
      };
    },
  },

  // ---------------------------------------------------------------------
  sortit: {
    make(rng, P) {
      let groups;
      if (P.by === 'category') groups = [{ pic: pickN(rng, ANIMALS, 1)[0], cat: 0 }, { pic: pickN(rng, THINGS, 1)[0], cat: 1 }];
      else if (P.by === 'kind') { const [a, b] = pickN(rng, KIND_NAMES, 2); groups = [{ kind: a }, { kind: b }]; }
      else { const k = pickN(rng, KIND_NAMES, 1)[0], [a, b] = pickN(rng, PALETTE, 2); groups = [{ kind: k, color: a }, { kind: k, color: b }]; }
      const target = rng() < 0.5 ? 0 : 1;
      let item;
      if (P.by === 'category') { const pool = (target ? THINGS : ANIMALS).filter((x) => x !== groups[target].pic); item = { pic: pickN(rng, pool, 1)[0] }; }
      else if (P.by === 'kind') item = { kind: groups[target].kind, color: PALETTE[randInt(rng, 0, PALETTE.length - 1)] };
      else item = { kind: pickN(rng, KIND_NAMES, 1)[0], color: groups[target].color };
      // Two examples in each basket: they share only the sorting attribute.
      const examples = groups.map((gr, k) => {
        if (P.by === 'category') return [gr, { pic: pickN(rng, (k ? THINGS : ANIMALS).filter((x) => x !== gr.pic && x !== item.pic), 1)[0] }];
        if (P.by === 'kind') return [{ kind: gr.kind, color: PALETTE[(k * 2) % PALETTE.length] }, { kind: gr.kind, color: PALETTE[(k * 2 + 1) % PALETTE.length] }];
        const other = KIND_NAMES.filter((x) => x !== gr.kind);
        return [gr, { kind: other[(k * 3) % other.length], color: gr.color }];
      });
      return {
        key: 'whereGoes', vars: {}, guess: 1 / 2,
        build(ctx) {
          const c0 = card(ctx.layer, 800, 330, 300, 280, C.cream);
          const it = symbol(c0.inner, item, 800, 330, 1.7);
          const baskets = [0, 1].map((k) => {
            const x = 800 + (k - 0.5) * 640;
            const c = card(ctx.layer, x, 720, 460, 240, C.white);
            basket(c.inner, x, 760);
            examples[k].forEach((ex, j) => symbol(c.inner, ex, x + (j ? 70 : -70), 690, 1.0));
            c.g.addEventListener('pointerdown', (e) => { e.preventDefault(); ctx.pick(k === target, c); });
            if (k === target) ctx.correct(c);
            return c;
          });
          c0.x = 800; c0.y = 330;
          return {
            fb: 'fbSort',
            cue: async () => { replay(c0.inner, 'hop'); await ctx.wait(500); replay(baskets[target].inner, 'hop'); await ctx.wait(600); },
            help: async () => { await ctx.point(c0); tone(ctx, 1); await ctx.wait(600); await ctx.point(baskets[1 - target]); tone(ctx, 4); await ctx.wait(600); await ctx.point(baskets[target]); tone(ctx, 1); await ctx.wait(700); },
          };
        },
      };
    },
  },

  // ---------------------------------------------------------------------
  // Coding: a road on a grid; the child lays arrow tiles, then presses play.
  path: {
    make(rng, P) {
      const route = makeRoute(rng, P.len || 2, P.turns || 0);
      return {
        key: 'codePath', vars: {}, guess: 0.15,
        build(ctx) { return codeBoard(ctx, rng, route, P); },
      };
    },
  },

  debug: {
    make(rng, P) {
      const route = makeRoute(rng, P.len || 4, P.turns || 1);
      const wrong = randInt(rng, 1, route.moves.length - 1);
      return {
        key: 'fixCode', vars: {}, guess: 1 / route.moves.length,
        build(ctx) { return codeBoard(ctx, rng, route, P, wrong); },
      };
    },
  },
};

// ---------- Drawing helpers ----------
function tower(g, x, baseY, h, col, unit = 30) {
  const t = s('g', null, g);
  t.inner = s('g', { class: 'fb' }, t);
  for (let i = 0; i < h; i++) shade(t.inner, 'rect', { x: x - unit, y: baseY - (i + 1) * unit * 1.05, width: unit * 2, height: unit, rx: 5 }, { fill: col, shadow: '#4b7178', line: '#36555a', w: 2.5, d: [4, 3] });
  return t;
}

function basket(g, x, y) {
  shade(g, 'path', { d: `M${x - 150} ${y - 40} L${x + 150} ${y - 40} L${x + 120} ${y + 40} L${x - 120} ${y + 40} Z` }, { fill: '#c9a073', shadow: '#ab8460', line: '#7a5a44', w: 3, d: [8, 6] });
  line(g, `M${x - 130} ${y - 14} L${x + 130} ${y - 14} M${x - 122} ${y + 14} L${x + 122} ${y + 14}`, '#ab8460', 3);
}

// ---------- Coding board ----------
const DIRS = { r: [1, 0], l: [-1, 0], u: [0, -1], d: [0, 1] };
const ROT = { r: 0, d: 90, l: 180, u: -90 };
const COLS = 7, ROWS = 4, CELL = 110, GX = 800 - (COLS * CELL) / 2, GY = 150;

// A road of `len` moves with exactly `turns` changes of direction, inside the grid.
function makeRoute(rng, len, turns) {
  for (let tries = 0; tries < 400; tries++) {
    const start = [randInt(rng, 0, COLS - 1), randInt(rng, 0, ROWS - 1)];
    const segs = turns + 1, moves = [];
    // Split len into segs positive parts.
    const cuts = shuffle(rng, Array.from({ length: len - 1 }, (_, i) => i + 1)).slice(0, segs - 1).sort((a, b) => a - b);
    const parts = [...cuts, len].map((c, i, a) => c - (i ? a[i - 1] : 0));
    if (parts.some((p) => p <= 0)) continue;
    let dir = pickDir(rng, null);
    for (const p of parts) { for (let k = 0; k < p; k++) moves.push(dir); dir = pickDir(rng, dir); }
    // Walk and check it stays inside and never revisits a cell.
    let [x, y] = start; const seen = new Set([x + ',' + y]); let ok = true; const cells = [[x, y]];
    for (const m of moves) { x += DIRS[m][0]; y += DIRS[m][1]; const key = x + ',' + y; if (x < 0 || y < 0 || x >= COLS || y >= ROWS || seen.has(key)) { ok = false; break; } seen.add(key); cells.push([x, y]); }
    if (ok) return { start, moves, cells };
  }
  return { start: [1, 1], moves: Array(len).fill('r'), cells: Array.from({ length: len + 1 }, (_, i) => [1 + i, 1]) };
}
function pickDir(rng, not) {
  const opts = not ? (not === 'r' || not === 'l' ? ['u', 'd'] : ['r', 'l']) : ['r', 'l', 'u', 'd'];
  return opts[Math.floor(rng() * opts.length)];
}
const cellXY = ([cx, cy]) => ({ x: GX + cx * CELL + CELL / 2, y: GY + cy * CELL + CELL / 2 });

function arrowGlyph(g, dir, x, y, size = 1, col = C.white) {
  const a = s('g', { transform: `translate(${x} ${y}) rotate(${ROT[dir]}) scale(${size})` }, g);
  s('path', { d: 'M-26 -10 H6 V-26 L32 0 L6 26 V10 H-26 Z', fill: col, stroke: '#2e4b4f', 'stroke-width': 3.5, 'stroke-linejoin': 'round' }, a);
  return a;
}

function codeBoard(ctx, rng, route, P, wrongAt) {
  const L = ctx.layer;
  const debug = wrongAt !== undefined;
  // Grass with a road along the route.
  shade(L, 'rect', { x: GX - 16, y: GY - 16, width: COLS * CELL + 32, height: ROWS * CELL + 32, rx: 28 }, { fill: '#b4cb98', shadow: '#9fb986', line: '#6f8f6a', w: 3, d: [10, 8] });
  for (let i = 0; i < 9; i++) s('path', { d: `M${GX + ((i * 173) % (COLS * CELL))} ${GY + 20 + ((i * 97) % (ROWS * CELL - 40))} q6 -10 12 0`, fill: 'none', stroke: '#8fae74', 'stroke-width': 3, 'stroke-linecap': 'round' }, L);
  const road = route.cells.map(cellXY);
  const d = road.map((p, i) => `${i ? 'L' : 'M'}${p.x} ${p.y}`).join(' ');
  s('path', { d, fill: 'none', stroke: '#d3bf97', 'stroke-width': CELL * 0.78, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, L);
  s('path', { d, fill: 'none', stroke: '#ecdcba', 'stroke-width': CELL * 0.62, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, L);
  const marks = road.slice(1, -1).map((p) => s('circle', { cx: p.x, cy: p.y, r: 10, fill: '#d3bf97', opacity: 0 }, L));
  // Goal: an apple at the end of the road.
  const end = road[road.length - 1];
  const goal = obj(L, 'apple', end.x, end.y, 1.1);
  // The walker: the child's friend (fox) as a little round figure.
  const walker = s('g', null, L);
  const wInner = s('g', { class: 'fb' }, walker);
  avatar(wInner, ctx.friend || 'fox', 0, 0, 36);
  let pos = route.start.slice();
  const place = (p, ms = 0) => { const q = cellXY(p); walker.style.transition = ms ? `transform ${ms}ms ease-in-out` : 'none'; walker.style.transform = `translate(${q.x}px, ${q.y}px)`; };
  place(pos);

  // Program slots
  const n = route.moves.length;
  const slotW = Math.min(110, 760 / n), sx0 = 800 - ((n - 1) * (slotW + 10)) / 2 - 140, sy = 690;
  const program = debug ? route.moves.slice() : [];
  if (debug) {
    // The wrong arrow leads off the road from where it is used, so running the program shows the bug.
    const right = program[wrongAt], at = route.cells[wrongAt];
    const off = Object.keys(DIRS).filter((k) => k !== right && !route.cells.some((c) => c[0] === at[0] + DIRS[k][0] && c[1] === at[1] + DIRS[k][1]));
    const alts = off.length ? off : Object.keys(DIRS).filter((k) => k !== right);
    program[wrongAt] = alts[Math.floor(rng() * alts.length)];
  }
  const slots = [];
  const slotLayer = s('g', null, L);
  function drawSlots() {
    slotLayer.innerHTML = '';
    slots.length = 0;
    for (let i = 0; i < n; i++) {
      const x = sx0 + i * (slotW + 10);
      const g = s('g', { class: debug ? 'tap' : '' }, slotLayer);
      g.inner = s('g', { class: 'fb' }, g);
      const filled = program[i] !== undefined;
      s('rect', { x: x - slotW / 2, y: sy - 50, width: slotW, height: 100, rx: 16, fill: filled ? C.teal : C.white, stroke: filled ? '#36555a' : C.stone, 'stroke-width': 3.5, 'stroke-dasharray': filled ? null : '9 8' }, g.inner);
      if (filled) arrowGlyph(g.inner, program[i], x, sy, Math.min(1, slotW / 100));
      g.x = x; g.y = sy;
      if (debug) {
        g.addEventListener('pointerdown', (e) => { e.preventDefault(); if (running) return; ctx.pick(i === wrongAt, { g, inner: g.inner }); });
      }
      slots.push(g);
    }
    if (debug && slots[wrongAt]) ctx.correct({ g: slots[wrongAt], inner: slots[wrongAt].inner });
  }
  drawSlots();

  // Arrow palette (not in debug mode), undo and play.
  const pal = {};
  if (!debug) {
    ['l', 'u', 'd', 'r'].forEach((k, i) => {
      const x = 270 + i * 130, y = 830;
      const c = card(L, x, y, 112, 100, '#d6e6e3');
      arrowGlyph(c.inner, k, x, y, 0.9, C.teal);
      c.x = x; c.y = y;
      c.g.addEventListener('pointerdown', (e) => { e.preventDefault(); if (running || program.length >= n) return; replay(c.inner, 'hop'); ctx.click(); program.push(k); drawSlots(); if (guided) guideNext(); });
      c.g.dataset.arrow = k;
      pal[k] = c;
    });
    const u = card(L, 840, 830, 112, 100, C.cream);
    s('path', ink({ d: 'M866 812 H826 L840 798 M826 812 L840 826 M866 812 Q884 812 884 834 Q884 852 864 852 H824', fill: 'none' }, 5), u.inner);
    u.g.addEventListener('pointerdown', (e) => { e.preventDefault(); if (running || !program.length) return; replay(u.inner, 'wiggle'); program.pop(); drawSlots(); if (guided) guideNext(); });
    u.g.dataset.undo = '1';
    pal.undo = u;
  }
  const PX = 1120, PY = debug ? 830 : 830;
  const play = card(L, PX, PY, 200, 120, C.sage);
  s('path', ink({ d: `M${PX - 22} ${PY - 34} L${PX + 34} ${PY} L${PX - 22} ${PY + 34} Z`, fill: C.white }, 5), play.inner);
  play.x = PX; play.y = PY;
  play.g.dataset.route = debug ? '' : route.moves.join('');
  if (debug) play.g.dataset.play = '1';

  let running = false, guided = false;
  async function run(fromHelp) {
    if (running) return;
    running = true;
    pos = route.start.slice(); place(pos);
    await ctx.wait(250);
    let ok = true;
    for (let i = 0; i < n; i++) {
      const m = program[i];
      if (!m) { ok = false; break; }
      const next = [pos[0] + DIRS[m][0], pos[1] + DIRS[m][1]];
      const onRoad = route.cells.some((c) => c[0] === next[0] && c[1] === next[1]);
      if (!onRoad) {
        // Bump: a little lean towards the wrong way, then back.
        const q = cellXY(pos), dx = DIRS[m][0] * 26, dy = DIRS[m][1] * 26;
        walker.style.transition = 'transform 220ms ease-out'; walker.style.transform = `translate(${q.x + dx}px, ${q.y + dy}px)`;
        await ctx.wait(240); place(pos, 220); replay(wInner, 'wiggle'); await ctx.wait(400);
        ok = false; break;
      }
      pos = next; place(pos, ctx.calm ? 520 : 380); ctx.tick();
      replay(slots[i].inner, 'hop');
      await ctx.wait(ctx.calm ? 560 : 420);
    }
    ok = ok && pos[0] === route.cells[route.cells.length - 1][0] && pos[1] === route.cells[route.cells.length - 1][1];
    if (ok) { replay(goal.inner, 'hop'); replay(wInner, 'hop'); }
    running = false;
    return ok;
  }

  if (debug) {
    // In debug mode the play button only shows what the program does.
    play.g.addEventListener('pointerdown', (e) => { e.preventDefault(); replay(play.inner, 'hop'); run(); });
  } else {
    play.g.addEventListener('pointerdown', async (e) => {
      e.preventDefault(); if (running) return; replay(play.inner, 'hop');
      const ok = await run();
      ctx.pick(ok, play);
      if (!ok) { await ctx.wait(500); pos = route.start.slice(); place(pos, 300); }
    });
    ctx.correct(play);
  }

  function guideNext() {
    for (const k of Object.keys(DIRS)) pal[k].g.classList.remove('invite');
    const k = route.moves[program.length];
    if (k && program.every((m, i) => m === route.moves[i])) pal[k].g.classList.add('invite');
  }
  const showRoad = async () => { for (const m of marks) { m.setAttribute('opacity', 1); await ctx.wait(220); } await ctx.wait(600); marks.forEach((m) => m.setAttribute('opacity', 0)); };
  const buildAll = async (from = 0) => { while (program.length > from) program.pop(); drawSlots(); for (let i = from; i < n; i++) await ctx.press(pal[route.moves[i]]); };

  if (debug) {
    const fixed = async () => { program[wrongAt] = route.moves[wrongAt]; drawSlots(); await ctx.wait(300); await run(); };
    return {
      fb: 'fbDebug',
      cue: async () => { await run(); },
      step: async () => { await showRoad(); for (let i = 0; i < wrongAt; i++) { await ctx.point(slots[i]); ctx.tick(); await ctx.wait(400); } },
      help: async () => { await run(); await ctx.wait(300); for (let i = 0; i <= wrongAt; i++) { await ctx.point(slots[i]); ctx.tick(); await ctx.wait(500); } },
      after: fixed,
      ownFriend: true,
    };
  }
  return {
    fb: 'fbCode',
    ownFriend: true,
    guided: ctx.mode === 'together',
    init() { if (ctx.mode === 'together') { guided = true; guideNext(); } },
    cue: showRoad,
    step: async () => { while (program.length) program.pop(); drawSlots(); await ctx.press(pal[route.moves[0]]); },
    help: async () => { await showRoad(); await buildAll(0); },
    solve: async () => { await showRoad(); await buildAll(0); await ctx.press(play); },
  };
}

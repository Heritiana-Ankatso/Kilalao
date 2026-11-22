// Stories: a small library of read-along picture books.
// The book opens on its first page and is read aloud; each word lights up as
// it is read, and touching a word says it again. Round arrows turn the page.
// The last page asks one open question to talk about with an adult.
// No scores, no quiz, no hotspots that pull attention away from the story.
import { s, C, makeStage, replay } from '../lib.js';
import * as audio from '../audio.js';
import * as profiles from '../learn/profiles.js';
import { LANGS } from '../learn/i18n.js';
import { storiesFor } from '../stories/library.js';
import { makeOwl, makeFox, avatar } from '../learn/characters.js';
import { feelFace } from '../learn/templates/feelings.js';
import { PICTURES } from '../learn/pictures.js';
import { finish, shade, line, ground } from '../learn/art.js';
import { obj, card, ink, FONT } from '../learn/draw.js';
import { tree, flower } from '../learn/village.js';

const ART = { x: 120, y: 30, w: 1360, h: 600 };

export default function stories(root, kit) {
  const svg = makeStage(root, '#efe4cf');
  const layer = s('g', null, svg);
  let rigs = [];
  kit.loop((dt, t) => { for (const r of rigs) r.tick(dt, t); });
  let token = 0; // cancels reading when the page changes
  kit.add(() => { token++; audio.hush(); });
  const wait = (ms) => new Promise((r) => kit.after(ms, r));
  const profile = profiles.active();
  const books = storiesFor(profile.lang);
  const voiceOk = () => audio.hasVoice(books[0] ? books[0].lang : 'en');

  function clear() { token++; audio.hush(); layer.innerHTML = ''; rigs = []; }

  // ---------- Library ----------
  function library() {
    clear();
    layer.dataset.mode = 'library';
    // A wooden bookcase: two shelves of face-out books.
    const n = books.length, perRow = Math.ceil(n / 2);
    for (let r = 0; r < 2; r++) shade(layer, 'rect', { x: 150, y: 400 + r * 380, width: 1300, height: 26, rx: 8 }, { fill: '#c9a073', shadow: '#ab8460', line: '#7a5a44', w: 3, d: [0, 6] });
    books.forEach((b, i) => {
      const r = Math.floor(i / perRow), k = i % perRow, cols = r ? n - perRow : perRow;
      const x = 800 + (k - (cols - 1) / 2) * 330, y = 245 + r * 380;
      const g = s('g', { class: 'tap' }, layer);
      g.dataset.book = b.id;
      const inner = s('g', { class: 'fb' }, g);
      shade(inner, 'rect', { x: x - 130, y: y - 150, width: 260, height: 300, rx: 14 }, { fill: b.color, line: '#4a3f35', w: 3.5 });
      s('rect', { x: x - 130, y: y - 150, width: 22, height: 300, rx: 8, fill: '#000', opacity: 0.12 }, inner);
      // A small window onto the cover scene.
      const clipId = `bk${i}${Date.now() % 1e5}`;
      const cp = s('clipPath', { id: clipId }, inner);
      s('rect', { x: x - 100, y: y - 130, width: 210, height: 190, rx: 10 }, cp);
      const win = s('g', { 'clip-path': `url(#${clipId})` }, inner);
      const sc = s('g', { transform: `translate(${x - 100} ${y - 130}) scale(${210 / ART.w}) translate(${-ART.x} ${-ART.y})` }, win);
      drawScene(sc, b.cover, false);
      s('rect', { x: x - 100, y: y - 130, width: 210, height: 190, rx: 10, fill: 'none', stroke: '#4a3f35', 'stroke-width': 3 }, inner);
      s('text', { x: x + 5, y: y + 105, 'text-anchor': 'middle', 'font-family': FONT, 'font-weight': 800, 'font-size': b.title[b.lang].length > 18 ? 22 : 26, fill: '#fbf7ef', text: b.title[b.lang] }, inner);
      if (b.decodable) s('circle', { cx: x + 100, cy: y - 120, r: 20, fill: '#fbf7ef', stroke: '#4a3f35', 'stroke-width': 3 }, inner), s('text', { x: x + 100, y: y - 119, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-family': FONT, 'font-weight': 800, 'font-size': 24, fill: C.teal, text: 'a' }, inner);
      g.addEventListener('pointerdown', (e) => { e.preventDefault(); replay(inner, 'hop'); kit.sfx.pop(1); kit.after(300, () => open(b, 0)); });
    });
  }

  // ---------- A page ----------
  function open(book, p) {
    clear();
    layer.dataset.mode = 'page';
    layer.dataset.page = String(p);
    const last = p >= book.pages.length;
    const frame = s('g', null, layer);
    shade(frame, 'rect', { x: ART.x - 10, y: ART.y - 10, width: ART.w + 20, height: ART.h + 20, rx: 30 }, { fill: '#fbf6ec', line: '#c9b48f', w: 4 });
    const cid = `pg${Date.now() % 1e6}`;
    const cp = s('clipPath', { id: cid }, frame);
    s('rect', { x: ART.x, y: ART.y, width: ART.w, height: ART.h, rx: 24 }, cp);
    const art = s('g', { 'clip-path': `url(#${cid})` }, frame);
    let text;
    if (!last) { drawScene(art, book.pages[p].scene, true); text = book.pages[p][book.lang]; }
    else {
      // The closing page: the owl asks one open question to talk about.
      drawScene(art, [{ bg: 'meadow' }, { owl: [620, 640, 0.95] }, { av: [profile.avatar, 1000, 470, 110] }, { heart: [810, 300] }], true);
      text = book.ask[book.lang];
    }
    const words = layoutText(text, last);
    // Page turns: round arrow buttons (no words).
    if (p > 0) arrowBtn(70, 760, -1, () => open(book, p - 1));
    if (!last) arrowBtn(1530, 760, 1, () => open(book, p + 1));
    else bookBtn(1530, 760, () => library());
    const listen = card(layer, 800, 870 - 8, 110, 70, C.white);
    speaker(listen.inner, 800, 862);
    listen.g.addEventListener('pointerdown', (e) => { e.preventDefault(); replay(listen.inner, 'wiggle'); read(words, book.lang); });
    kit.after(600, () => read(words, book.lang));
  }

  // Lays out the words of a page in lines under the picture; each word is its own text element.
  function layoutText(text, question) {
    const g = s('g', null, layer);
    const size = text.length > 70 ? 46 : 56, maxW = 1240, lh = size * 1.32;
    const words = text.split(/\s+/).filter(Boolean).map((w) => {
      const t = s('text', { 'font-family': FONT, 'font-weight': 700, 'font-size': size, fill: question ? C.teal : C.ink, text: w, class: 'tap' }, g);
      t.dataset.word = w;
      t.addEventListener('pointerdown', (e) => { e.preventDefault(); token++; audio.hush(); light(words, t); audio.say(clean(w), { lang: langCode(), rate: 0.75 }); });
      return t;
    });
    // Measure and wrap.
    const lines = [[]]; let lw = 0; const space = size * 0.32;
    for (const t of words) {
      const w = t.getComputedTextLength ? t.getComputedTextLength() : t.textContent.length * size * 0.55;
      t.w = w;
      if (lw && lw + space + w > maxW) { lines.push([]); lw = 0; }
      lines[lines.length - 1].push(t); lw += (lw ? space : 0) + w;
    }
    const y0 = 700 + (lines.length === 1 ? lh * 0.4 : 0);
    lines.forEach((ln, i) => {
      const total = ln.reduce((a, t) => a + t.w, 0) + space * (ln.length - 1);
      let x = 800 - total / 2;
      for (const t of ln) { t.setAttribute('x', x.toFixed(1)); t.setAttribute('y', (y0 + i * lh).toFixed(1)); x += t.w + space; }
    });
    return words;
  }

  const langCode = () => (LANGS[books[0] ? books[0].lang : 'en'] || LANGS.en).tts;
  const clean = (w) => w.replace(/[.,!?;:«»"“”…]/g, '');
  function light(words, on) { for (const t of words) { t.setAttribute('fill', t === on ? C.terra : t.dataset.q ? C.teal : t.getAttribute('fill') === C.terra ? C.ink : t.getAttribute('fill')); t.classList.toggle('lit', t === on); } }

  // Reads the page sentence by sentence; each word lights up in turn (timing estimated).
  async function read(words, lang) {
    const my = ++token;
    audio.hush();
    if (!audio.hasVoice(lang)) { for (const t of words) { light(words, t); await wait(380); if (my !== token) return; } light(words, null); return; }
    let i = 0;
    while (i < words.length && my === token) {
      let j = i; while (j < words.length && !/[.!?…]$/.test(words[j].textContent)) j++;
      const sent = words.slice(i, Math.min(j + 1, words.length));
      audio.say(sent.map((t) => t.textContent).join(' '), { lang: langCode(), rate: 0.78 });
      for (const t of sent) {
        if (my !== token) return;
        light(words, t);
        await wait(Math.max(260, (clean(t.textContent).length + 1.5) * 78));
      }
      await wait(320);
      i = j + 1;
    }
    if (my === token) light(words, null);
  }

  function arrowBtn(x, y, dir, fn) {
    const c = card(layer, x, y, 110, 110, C.cream);
    c.g.dataset.turn = String(dir);
    s('path', ink({ d: dir > 0 ? `M${x - 18} ${y - 26} L${x + 20} ${y} L${x - 18} ${y + 26}` : `M${x + 18} ${y - 26} L${x - 20} ${y} L${x + 18} ${y + 26}`, fill: 'none' }, 9), c.inner);
    c.g.addEventListener('pointerdown', (e) => { e.preventDefault(); replay(c.inner, 'hop'); kit.sfx.whoosh(0.4); kit.after(200, fn); });
  }
  function bookBtn(x, y, fn) {
    const c = card(layer, x, y, 110, 110, C.cream);
    c.g.dataset.turn = 'library';
    for (const [dx, col] of [[-22, C.terra], [0, C.teal], [22, C.ochre]]) s('rect', ink({ x: x + dx - 9, y: y - 30, width: 18, height: 60, rx: 4, fill: col }, 3), c.inner);
    c.g.addEventListener('pointerdown', (e) => { e.preventDefault(); replay(c.inner, 'hop'); kit.after(200, fn); });
  }

  // ---------- Scene drawing ----------
  function drawScene(g, list, live) {
    for (const el of list) {
      const [k] = Object.keys(el), v = el[k];
      switch (k) {
        case 'bg': background(g, v); break;
        case 'fox': { const r = makeFox(g, v[0], v[1], v[2], kit.calm); if (live) rigs.push(r); else r.tick(0.016, 0.5); break; }
        case 'owl': { const r = makeOwl(g, v[0], v[1], v[2], kit.calm); if (live) rigs.push(r); else { r.state.nextBlink = 99; r.tick(0.016, 0.5); } break; }
        case 'av': { const b = s('g', { class: live ? 'fb bob' : '' }, g); avatar(b, v[0], v[1], v[2], v[3]); break; }
        case 'face': feelFace(g, v[2], v[3], v[4], v[0], v[1]); break;
        case 'pic': { const p = s('g', { transform: `translate(${v[1]} ${v[2]}) scale(${v[3]})` }, g); PICTURES[v[0]](p); finish(p); break; }
        case 'obj': obj(g, v[0], v[1], v[2], v[3]); break;
        case 'tree': tree(g, v[0], v[1], v[2]); break;
        case 'flower': bigFlower(g, v[0], v[1], v[2]); break;
        case 'stars': stars(g, v); break;
        case 'moon': shade(g, 'path', { d: 'M1320 110 A70 70 0 1 0 1390 220 A56 56 0 1 1 1320 110 Z' }, { fill: '#f1dc98', shadow: '#dcc27c', line: '#a88f4c', w: 3, d: [6, 6] }); break;
        case 'sun': shade(g, 'circle', { cx: 1300, cy: 130, r: 62 }, { fill: '#f5dc93', shadow: '#ecc979', d: [8, 7] }); break;
        case 'cloud': cloud(g, v[0], v[1]); break;
        case 'rain': for (let i = 0; i < 22; i++) line(g, `M${200 + ((i * 131) % 1200)} ${120 + ((i * 71) % 300)} l-10 24`, '#7898b3', 4); break;
        case 'rainbow': [C.terra, C.ochre, '#93b377', C.teal, C.plum].forEach((col, i) => s('path', { d: `M${420 + i * 22} 620 A${380 - i * 22} ${330 - i * 22} 0 0 1 ${1180 - i * 22} 620`, fill: 'none', stroke: col, 'stroke-width': 22, opacity: 0.75 }, g)); break;
        case 'heart': s('path', { d: `M${v[0]} ${v[1]} c-18 -26 -58 -8 -34 24 l34 34 l34 -34 c24 -32 -16 -50 -34 -24 Z`, fill: C.terra, stroke: '#6b3a2e', 'stroke-width': 3.5 }, g); break;
        case 'zzz': [0, 1, 2].forEach((i) => s('text', { x: v[0] + i * 34, y: v[1] - i * 34, 'font-family': FONT, 'font-weight': 800, 'font-size': 40 + i * 8, fill: C.blue, opacity: 0.8, text: 'z' }, g)); break;
        case 'ring': [70, 120].forEach((r) => s('circle', { cx: v[0], cy: v[1], r: r + 40, fill: 'none', stroke: C.teal, 'stroke-width': 5, opacity: 0.35 }, g)); break;
        case 'seed': shade(g, 'ellipse', { cx: v[0], cy: v[1], rx: 26, ry: 18 }, { fill: '#9a7250', shadow: '#7d5d4a', line: '#5e4434', w: 3, d: [4, 4] }); break;
        case 'sprout': line(g, `M${v[0]} ${v[1] + 70} Q${v[0] - 6} ${v[1] + 20} ${v[0]} ${v[1] - 30}`, '#5f7f55', 8); shade(g, 'path', { d: `M${v[0]} ${v[1] - 20} Q${v[0] - 50} ${v[1] - 60} ${v[0] - 76} ${v[1] - 24} Q${v[0] - 40} ${v[1]} ${v[0]} ${v[1] - 20} Z` }, { fill: '#93b377', shadow: '#769a68', line: '#4f6b45', w: 3, d: [5, 5] }); shade(g, 'path', { d: `M${v[0]} ${v[1] - 30} Q${v[0] + 50} ${v[1] - 76} ${v[0] + 80} ${v[1] - 40} Q${v[0] + 44} ${v[1] - 10} ${v[0]} ${v[1] - 30} Z` }, { fill: '#93b377', shadow: '#769a68', line: '#4f6b45', w: 3, d: [5, 5] }); break;
        case 'speed': line(g, `M${v[0] - 160} ${v[1] - 30} h120 M${v[0] - 190} ${v[1]} h140 M${v[0] - 160} ${v[1] + 30} h120`, '#a9a39a', 6); break;
        default: break;
      }
    }
  }
  function background(g, kind) {
    const { x, y, w, h } = ART;
    const sky = { meadow: '#dcebe6', garden: '#dcebe6', night: '#3d4a5c', storm: '#a9b3bd', room: '#f1e4cb' }[kind] || '#efe4cf';
    s('rect', { x, y, width: w, height: h, fill: sky }, g);
    if (kind === 'room') {
      s('rect', { x, y: y + h * 0.72, width: w, height: h * 0.28, fill: '#d9c19a' }, g);
      for (let i = 0; i < 8; i++) s('line', { x1: x + i * 180, y1: y + h * 0.72, x2: x + i * 180 - 60, y2: y + h, stroke: '#c9ad82', 'stroke-width': 3 }, g);
      shade(g, 'rect', { x: 260, y: 90, width: 220, height: 170, rx: 10 }, { fill: '#cfe0e3', line: '#8a6f52', w: 4 });
      line(g, 'M370 90 V260 M260 175 H480', '#8a6f52', 4);
    } else if (kind === 'night') {
      s('path', { d: `M${x} ${y + h * 0.78} Q${x + w * 0.4} ${y + h * 0.68} ${x + w} ${y + h * 0.76} V${y + h} H${x} Z`, fill: '#4e5d4a' }, g);
      for (let i = 0; i < 18; i++) s('circle', { cx: x + ((i * 233) % w), cy: y + 30 + ((i * 97) % 280), r: 2, fill: '#f6efd8', opacity: 0.6 }, g);
    } else {
      const grass = kind === 'storm' ? '#8ea377' : '#a9c48d';
      s('path', { d: `M${x} ${y + h * 0.7} Q${x + w * 0.3} ${y + h * 0.6} ${x + w * 0.6} ${y + h * 0.68} T${x + w} ${y + h * 0.66} V${y + h} H${x} Z`, fill: grass }, g);
      if (kind === 'garden') s('path', { d: `M${x + w * 0.3} ${y + h} Q${x + w * 0.5} ${y + h * 0.84} ${x + w * 0.7} ${y + h} Z`, fill: '#9a7a58' }, g);
    }
  }
  function stars(g, n) {
    const pos = [[800, 170], [600, 260], [1000, 260], [470, 140], [1140, 150]];
    for (let i = 0; i < n; i++) obj(g, 'star', pos[i][0], pos[i][1], 1.3, '#f1dc98');
    if (n === 3) s('path', { d: 'M800 170 L600 260 L1000 260 Z', fill: 'none', stroke: '#f1dc98', 'stroke-width': 3, 'stroke-dasharray': '8 10', opacity: 0.7 }, g);
  }
  function cloud(g, x, y) {
    shade(g, 'path', { d: `M${x - 150} ${y + 40} q-30 -70 50 -80 q30 -60 110 -30 q80 -30 110 40 q50 10 30 70 Z` }, { fill: '#8d96a3', shadow: '#727b8c', line: '#4d5562', w: 3, d: [10, 8] });
  }
  function bigFlower(g, x, y, k) {
    line(g, `M${x} ${y + 80 * k} Q${x - 6} ${y + 30 * k} ${x} ${y - 20 * k}`, '#5f7f55', 8);
    for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; shade(g, 'circle', { cx: x + Math.cos(a) * 30 * k, cy: y - 40 * k + Math.sin(a) * 30 * k, r: 22 * k }, { fill: C.rose, shadow: '#c48f88', line: '#8a5a55', w: 3, d: [4, 4] }); }
    shade(g, 'circle', { cx: x, cy: y - 40 * k, r: 18 * k }, { fill: C.ochre, shadow: '#b8874a', line: '#7d5a2c', w: 3, d: [4, 4] });
  }

  library();
}

function speaker(g, x, y) {
  s('path', ink({ d: `M${x - 30} ${y - 12} h14 l18 -16 v56 l-18 -16 h-14 z`, fill: C.ochre }, 3.5), g);
  s('path', ink({ d: `M${x + 10} ${y - 12} q10 12 0 24 M${x + 20} ${y - 22} q20 22 0 44`, fill: 'none' }, 3.5), g);
}

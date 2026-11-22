// Sequencer: tap the holes to place pebbles. A soft light sweeps across and
// every pebble it touches plays. All notes come from one pentatonic scale,
// so any pattern sounds gentle.
import { s, C, makeStage, replay } from '../lib.js';

export default function sequencer(root, kit) {
  const { sfx, audio } = kit;
  const svg = makeStage(root, '#e8dfd0');
  const STEPS = 8, ROWS = 7, X0 = 290, Y0 = 115, CW = 120, RH = 94;
  const NOTES = [440, 392, 330, 294, 262]; // A G E D C
  const ROWC = [C.rose, C.ochre, C.sage, C.teal, C.blue, '#c9a073', C.cocoa];
  const INSTS = ['marimba', 'musicbox', 'pluck'];
  let inst = 0, bpm = 100, playing = true;
  const grid = Array.from({ length: ROWS }, () => Array(STEPS).fill(false));
  // A gentle starting pattern.
  [[4, 0], [2, 2], [1, 4], [3, 6], [5, 0], [5, 4], [6, 2], [6, 6]].forEach(([r, c]) => (grid[r][c] = true));

  // Board
  s('rect', { x: X0 - 40, y: Y0 - 40, width: STEPS * CW + 80, height: ROWS * RH + 80, rx: 40, fill: '#c9a073', stroke: C.woodD, 'stroke-width': 6, filter: 'url(#wob)' }, svg);
  const head = s('rect', { x: X0, y: Y0 - 20, width: CW, height: ROWS * RH + 40, rx: 30, fill: '#fff6dc', opacity: 0.45 }, svg);
  const cells = [];
  for (let r = 0; r < ROWS; r++) {
    cells.push([]);
    for (let c = 0; c < STEPS; c++) {
      const cx = X0 + c * CW + CW / 2, cy = Y0 + r * RH + RH / 2;
      const g = s('g', { class: 'tap' }, svg);
      s('circle', { cx, cy, r: 30, fill: '#8f6a48', opacity: 0.45 }, g);
      s('circle', { cx, cy, r: 46, fill: 'transparent' }, g);
      const pebble = s('g', { class: 'fb' }, g);
      s('ellipse', { cx, cy, rx: 38, ry: 34, fill: ROWC[r], stroke: C.ink, 'stroke-width': 4 }, pebble);
      s('circle', { cx: cx - 11, cy: cy - 4, r: 4, fill: C.ink }, pebble);
      s('circle', { cx: cx + 11, cy: cy - 4, r: 4, fill: C.ink }, pebble);
      s('path', { d: `M${cx - 8} ${cy + 9} q8 7 16 0`, stroke: C.ink, 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }, pebble);
      s('ellipse', { cx: cx - 14, cy: cy - 18, rx: 9, ry: 5, fill: '#fff', opacity: 0.35 }, pebble);
      const cell = { g, pebble };
      cells[r].push(cell);
      g.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        grid[r][c] = !grid[r][c];
        render(r, c);
        if (grid[r][c]) { play(r, audio.now()); replay(pebble, 'popin'); }
        else sfx.pop(0.6);
      });
    }
  }
  function render(r, c) { cells[r][c].pebble.style.display = grid[r][c] ? '' : 'none'; }
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < STEPS; c++) render(r, c);

  // Row markers on the left
  for (let r = 0; r < ROWS; r++) {
    const y = Y0 + r * RH + RH / 2;
    if (r < 5) s('rect', { x: X0 - 150, y: y - 12, width: 30 + (4 - r) * 14 + 30, height: 24, rx: 12, fill: ROWC[r], stroke: C.ink, 'stroke-width': 3, transform: `translate(${-(4 - r) * 7} 0)` }, svg);
    else if (r === 5) s('rect', { x: X0 - 140, y: y - 18, width: 70, height: 36, rx: 8, fill: ROWC[r], stroke: C.ink, 'stroke-width': 3 }, svg);
    else { s('ellipse', { cx: X0 - 105, cy: y, rx: 40, ry: 26, fill: ROWC[r], stroke: C.ink, 'stroke-width': 3 }, svg); s('ellipse', { cx: X0 - 105, cy: y - 6, rx: 32, ry: 14, fill: '#e8d9bd', stroke: C.ink, 'stroke-width': 2 }, svg); }
  }

  // Controls on the right
  const CX = 1410;
  const playBtn = s('g', { class: 'tap' }, svg);
  s('circle', { cx: CX, cy: 190, r: 62, fill: C.terra, stroke: C.ink, 'stroke-width': 4 }, playBtn);
  const playIcon = s('path', { fill: '#fbf7ef', stroke: C.ink, 'stroke-width': 3, 'stroke-linejoin': 'round' }, playBtn);
  const setPlayIcon = () => playIcon.setAttribute('d', playing ? `M${CX - 22} 166 h14 v48 h-14z M${CX + 8} 166 h14 v48 h-14z` : `M${CX - 16} 160 l40 30 l-40 30z`);
  setPlayIcon();
  playBtn.addEventListener('pointerdown', () => { playing = !playing; setPlayIcon(); sfx.click(); });

  // Tempo: snail and rabbit
  const snail = s('g', { class: 'tap' }, svg);
  s('circle', { cx: CX - 70, cy: 370, r: 54, fill: '#efe3cc', stroke: C.ink, 'stroke-width': 3 }, snail);
  s('path', { d: `M${CX - 105} 392 h66 q6 -6 0 -10 h-10`, stroke: C.ink, 'stroke-width': 4, fill: C.sage, 'stroke-linecap': 'round' }, snail);
  s('circle', { cx: CX - 74, cy: 364, r: 22, fill: C.ochre, stroke: C.ink, 'stroke-width': 4 }, snail);
  s('path', { d: `M${CX - 74} 364 m-10 0 a10 10 0 1 1 10 10`, stroke: C.ink, 'stroke-width': 3, fill: 'none' }, snail);
  s('path', { d: `M${CX - 46} 382 l6 -22 M${CX - 40} 380 l12 -18`, stroke: C.ink, 'stroke-width': 3 }, snail);
  const rabbit = s('g', { class: 'tap' }, svg);
  s('circle', { cx: CX + 70, cy: 370, r: 54, fill: '#efe3cc', stroke: C.ink, 'stroke-width': 3 }, rabbit);
  s('ellipse', { cx: CX + 70, cy: 384, rx: 30, ry: 22, fill: '#f6f1e8', stroke: C.ink, 'stroke-width': 3 }, rabbit);
  s('ellipse', { cx: CX + 60, cy: 340, rx: 7, ry: 24, fill: '#f6f1e8', stroke: C.ink, 'stroke-width': 3 }, rabbit);
  s('ellipse', { cx: CX + 80, cy: 340, rx: 7, ry: 24, fill: '#f6f1e8', stroke: C.ink, 'stroke-width': 3 }, rabbit);
  s('circle', { cx: CX + 62, cy: 380, r: 3, fill: C.ink }, rabbit); s('circle', { cx: CX + 78, cy: 380, r: 3, fill: C.ink }, rabbit);
  const tempoDots = [];
  for (let i = 0; i < 5; i++) tempoDots.push(s('circle', { cx: CX - 60 + i * 30, cy: 450, r: 8, fill: C.ink, opacity: 0.2 }, svg));
  const TEMPOS = [66, 84, 100, 120, 140];
  const showTempo = () => tempoDots.forEach((d, i) => d.setAttribute('opacity', TEMPOS[i] <= bpm ? 0.75 : 0.2));
  showTempo();
  snail.addEventListener('pointerdown', () => { bpm = TEMPOS[Math.max(0, TEMPOS.indexOf(bpm) - 1)]; showTempo(); sfx.click(); replay(snail, 'wiggle'); });
  rabbit.addEventListener('pointerdown', () => { bpm = TEMPOS[Math.min(4, TEMPOS.indexOf(bpm) + 1)]; showTempo(); sfx.click(); replay(rabbit, 'wiggle'); });
  snail.classList.add('fb'); rabbit.classList.add('fb');

  // Instruments: bars, music box, strings
  const instBtns = [];
  const instIcons = [
    (g, x, y) => { [0, 1, 2, 3].forEach((k) => s('rect', { x: x - 34 + k * 18, y: y - 26 + k * 4, width: 14, height: 52 - k * 8, rx: 4, fill: [C.terra, C.ochre, C.sage, C.teal][k], stroke: C.ink, 'stroke-width': 2.5 }, g)); },
    (g, x, y) => { s('rect', { x: x - 30, y: y - 20, width: 60, height: 40, rx: 6, fill: '#c9a073', stroke: C.ink, 'stroke-width': 3 }, g); s('path', { d: `M${x + 30} ${y} h14 v-10`, stroke: C.ink, 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round' }, g); s('circle', { cx: x, cy: y, r: 9, fill: C.ochre, stroke: C.ink, 'stroke-width': 2.5 }, g); },
    (g, x, y) => { s('ellipse', { cx: x - 8, cy: y + 10, rx: 26, ry: 22, fill: '#d9b483', stroke: C.ink, 'stroke-width': 3 }, g); s('rect', { x: x + 10, y: y - 34, width: 12, height: 44, rx: 4, fill: C.cocoa, stroke: C.ink, 'stroke-width': 3, transform: `rotate(30 ${x + 16} ${y - 10})` }, g); s('circle', { cx: x - 8, cy: y + 10, r: 7, fill: C.ink }, g); },
  ];
  INSTS.forEach((_, i) => {
    const y = 560 + i * 110;
    const g = s('g', { class: 'tap' }, svg);
    const ring = s('circle', { cx: CX, cy: y, r: 48, fill: '#efe3cc', stroke: C.ink, 'stroke-width': 3 }, g);
    instIcons[i](g, CX, y);
    instBtns.push(ring);
    g.addEventListener('pointerdown', () => { inst = i; showInst(); play(1, audio.now()); });
  });
  const showInst = () => instBtns.forEach((r, i) => { r.setAttribute('fill', i === inst ? '#f6d9a4' : '#efe3cc'); r.setAttribute('stroke-width', i === inst ? 6 : 3); });
  showInst();

  // Broom: pebbles roll away
  const broom = s('g', { class: 'tap fb' }, svg);
  s('path', { d: 'M150 820 l70 -90', stroke: C.cocoa, 'stroke-width': 10, 'stroke-linecap': 'round' }, broom);
  s('path', { d: 'M110 820 q30 -40 70 -30 l20 30 q-40 30 -90 0z', fill: C.ochre, stroke: C.ink, 'stroke-width': 4, 'stroke-linejoin': 'round' }, broom);
  broom.addEventListener('pointerdown', () => {
    replay(broom, 'wiggle');
    sfx.whoosh(0.8);
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < STEPS; c++) if (grid[r][c]) { grid[r][c] = false; render(r, c); }
  });

  // Little frog that hops to the beat
  const frog = s('g', null, svg);
  place(frog, 110, 470);
  const frogBody = s('g', { class: 'fbb' }, frog);
  s('ellipse', { cx: 0, cy: 0, rx: 60, ry: 42, fill: C.sage, stroke: C.ink, 'stroke-width': 4 }, frogBody);
  s('circle', { cx: -26, cy: -38, r: 18, fill: C.sage, stroke: C.ink, 'stroke-width': 4 }, frogBody);
  s('circle', { cx: 26, cy: -38, r: 18, fill: C.sage, stroke: C.ink, 'stroke-width': 4 }, frogBody);
  s('circle', { cx: -26, cy: -38, r: 7, fill: C.ink }, frogBody); s('circle', { cx: 26, cy: -38, r: 7, fill: C.ink }, frogBody);
  s('path', { d: 'M-22 6 q22 16 44 0', stroke: C.ink, 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round' }, frogBody);
  function place(el, x, y) { el.setAttribute('transform', `translate(${x} ${y})`); }

  function play(r, at) {
    const o = { at, vol: 0.28 };
    if (r < 5) audio.inst[INSTS[inst]](NOTES[r] * (inst === 1 ? 0.5 : 1), o);
    else if (r === 5) audio.inst.wood({ at, vol: 0.35 });
    else audio.inst.kick({ at, vol: 0.4 });
  }

  // Look-ahead scheduler
  let step = 0, nextT = 0;
  const queue = [];
  kit.every(25, () => {
    const ac = audio.ctx();
    if (!ac || !playing) return;
    if (nextT < ac.currentTime) nextT = ac.currentTime + 0.06;
    while (nextT < ac.currentTime + 0.14) {
      for (let r = 0; r < ROWS; r++) if (grid[r][step]) play(r, nextT);
      queue.push({ step, t: nextT });
      nextT += 60 / bpm / 2;
      step = (step + 1) % STEPS;
    }
  });
  let shown = 0;
  kit.loop(() => {
    const ac = audio.ctx();
    if (!ac) return;
    while (queue.length && queue[0].t <= ac.currentTime) {
      shown = queue.shift().step;
      head.setAttribute('x', X0 + shown * CW);
      let any = false;
      for (let r = 0; r < ROWS; r++) if (grid[r][shown]) { replay(cells[r][shown].pebble, 'wiggle'); any = true; }
      if (any && shown % 2 === 0) replay(frogBody, 'hop');
    }
  });
}

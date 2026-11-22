// Radio: turn the big knob to tune between five stations. Each plays its own
// gentle, original, generated song; soft static sits between them. Three
// friends on top dance in their own way to each station.
import { s, C, makeStage, pt, drag, rng, clamp, lerp } from '../lib.js';

const MAJOR = [0, 2, 4, 5, 7, 9, 11], MINOR = [0, 2, 3, 5, 7, 8, 10], DORIAN = [0, 2, 3, 5, 7, 9, 10], MIXO = [0, 2, 4, 5, 7, 9, 10];
const STATIONS = [
  { pos: 0.1, seed: 11, bpm: 100, root: 60, scale: MAJOR, prog: [0, 4, 5, 3], meter: 4, lead: 'marimba', perc: 'shaker', pad: false, density: 0.45, dance: 'bob' },
  { pos: 0.3, seed: 23, bpm: 76, root: 57, scale: MINOR, prog: [0, 5, 2, 6], meter: 4, lead: 'musicbox', perc: null, pad: true, density: 0.3, dance: 'sway' },
  { pos: 0.5, seed: 37, bpm: 112, root: 55, scale: MIXO, prog: [0, 6, 3, 0], meter: 4, lead: 'pluck', perc: 'drum', pad: false, density: 0.55, dance: 'jump' },
  { pos: 0.7, seed: 41, bpm: 132, root: 65, scale: MAJOR, prog: [0, 3, 4, 0], meter: 3, lead: 'flute', perc: null, pad: true, density: 0.25, dance: 'waltz' },
  { pos: 0.9, seed: 53, bpm: 118, root: 62, scale: DORIAN, prog: [0, 3, 0, 4], meter: 4, lead: 'kalimba', perc: 'wood', pad: false, density: 0.5, dance: 'spin' },
];

function compose(st) {
  const R = rng(st.seed);
  const spb = st.meter * 2; // eighth notes per bar
  const pickR = (a) => a[Math.floor(R() * a.length)];
  function bar(chord, last) {
    const out = [];
    let cur = chord + pickR([0, 2, 4]);
    for (let k = 0; k < spb; k++) {
      const strong = k % (st.meter === 3 ? 2 : 4) === 0;
      if (strong || R() < st.density) {
        if (strong) cur = chord + pickR([0, 2, 4, 7]);
        else cur += pickR([-1, 1, 1, -2, 2]);
        cur = clamp(cur, 0, 11);
        out.push(cur);
      } else out.push(null);
    }
    if (last) { out.fill(null, spb - 2); out[spb - 2] = 7; }
    return out;
  }
  const A = [bar(st.prog[0]), bar(st.prog[1])];
  const B = [bar(st.prog[2]), bar(st.prog[3])];
  const A2 = [A[0], bar(st.prog[1])];
  const B2 = [B[0], bar(st.prog[3], true)];
  return { spb, bars: [...A, ...B, ...A2, ...B2], chords: [...st.prog, ...st.prog] };
}

export default function radio(root, kit) {
  const { audio, sfx } = kit;
  const svg = makeStage(root, '#d9cbb3');
  const songs = STATIONS.map(compose);
  const deg = (st, d) => st.root + st.scale[((d % 7) + 7) % 7] + 12 * Math.floor(d / 7);

  // Room
  s('rect', { x: -800, y: -400, width: 3200, height: 1150, fill: '#e3d6bf' }, svg);
  for (let x = -800; x < 2400; x += 80) s('rect', { x, y: -400, width: 40, height: 1150, fill: '#ddcfb6' }, svg);
  s('rect', { x: -800, y: 750, width: 3200, height: 600, fill: '#a98564' }, svg);
  s('rect', { x: 260, y: 740, width: 1080, height: 40, rx: 10, fill: '#8f6a48', stroke: C.ink, 'stroke-width': 4 }, svg);

  // Radio body
  const R = { x: 380, y: 300, w: 840, h: 440 };
  s('path', { d: `M${R.x + 200} ${R.y} Q${R.x + 420} ${R.y - 110} ${R.x + 640} ${R.y}`, stroke: '#6b5444', 'stroke-width': 18, fill: 'none', 'stroke-linecap': 'round' }, svg);
  s('rect', { x: R.x, y: R.y, width: R.w, height: R.h, rx: 60, fill: '#c9a073', stroke: C.ink, 'stroke-width': 5, filter: 'url(#wob)' }, svg);
  s('rect', { x: R.x + 20, y: R.y + 20, width: R.w - 40, height: R.h - 40, rx: 46, fill: 'none', stroke: '#8f6a48', 'stroke-width': 3, opacity: 0.6 }, svg);
  for (const fx of [R.x + 80, R.x + R.w - 120]) s('rect', { x: fx, y: R.y + R.h - 4, width: 40, height: 24, rx: 6, fill: '#6b5444' }, svg);

  // Speaker
  const SP = { x: R.x + 220, y: R.y + 225 };
  s('circle', { cx: SP.x, cy: SP.y, r: 160, fill: '#e3cfae', stroke: C.ink, 'stroke-width': 4 }, svg);
  const cone = s('g', null, svg);
  for (let i = 1; i <= 5; i++) s('circle', { cx: SP.x, cy: SP.y, r: i * 28, fill: 'none', stroke: '#b59a76', 'stroke-width': 3 }, cone);
  s('circle', { cx: SP.x, cy: SP.y, r: 22, fill: '#b59a76' }, cone);

  // Tuning window
  const WIN = { x: R.x + 440, y: R.y + 60, w: 340, h: 150 };
  s('rect', { x: WIN.x, y: WIN.y, width: WIN.w, height: WIN.h, rx: 18, fill: '#fbf3df', stroke: C.ink, 'stroke-width': 4 }, svg);
  for (let i = 0; i <= 30; i++) {
    const x = WIN.x + 20 + (i / 30) * (WIN.w - 40);
    s('line', { x1: x, y1: WIN.y + WIN.h - 30, x2: x, y2: WIN.y + WIN.h - (i % 5 ? 42 : 54), stroke: C.ink, 'stroke-width': 2, opacity: 0.6 }, svg);
  }
  const posX = (v) => WIN.x + 20 + v * (WIN.w - 40);
  const icons = [
    (g, x, y) => { s('circle', { cx: x, cy: y, r: 13, fill: C.ochre, stroke: C.ink, 'stroke-width': 2.5 }, g); for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2; s('line', { x1: x + Math.cos(a) * 17, y1: y + Math.sin(a) * 17, x2: x + Math.cos(a) * 23, y2: y + Math.sin(a) * 23, stroke: C.ink, 'stroke-width': 2.5, 'stroke-linecap': 'round' }, g); } },
    (g, x, y) => { s('path', { d: `M${x} ${y - 18} q16 20 0 32 q-16 -12 0 -32z`, fill: C.blue, stroke: C.ink, 'stroke-width': 2.5 }, g); },
    (g, x, y) => { s('path', { d: `M${x} ${y + 20} q-4 -20 2 -32 M${x + 2} ${y - 12} q-14 -6 -20 4 M${x + 2} ${y - 12} q14 -6 20 4 M${x + 2} ${y - 12} q-2 -12 -12 -14`, stroke: C.moss, 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round' }, g); },
    (g, x, y) => { s('path', { d: `M${x + 6} ${y - 18} a18 18 0 1 0 10 30 a14 14 0 1 1 -10 -30z`, fill: '#e9d8a6', stroke: C.ink, 'stroke-width': 2.5 }, g); },
    (g, x, y) => { s('ellipse', { cx: x, cy: y + 4, rx: 18, ry: 13, fill: C.sage, stroke: C.ink, 'stroke-width': 2.5 }, g); s('circle', { cx: x - 8, cy: y - 9, r: 6, fill: C.sage, stroke: C.ink, 'stroke-width': 2.5 }, g); s('circle', { cx: x + 8, cy: y - 9, r: 6, fill: C.sage, stroke: C.ink, 'stroke-width': 2.5 }, g); },
  ];
  const iconEls = STATIONS.map((st, i) => { const g = s('g', { opacity: 0.45 }, svg); icons[i](g, posX(st.pos), WIN.y + 46); return g; });
  const needle = s('line', { y1: WIN.y + 14, y2: WIN.y + WIN.h - 14, stroke: C.terra, 'stroke-width': 6, 'stroke-linecap': 'round' }, svg);
  const winHit = s('rect', { x: WIN.x, y: WIN.y, width: WIN.w, height: WIN.h, fill: 'transparent', class: 'tap' }, svg);

  // Knobs
  function knob(x, y, r, color) {
    const g = s('g', { class: 'tap' }, svg);
    s('circle', { cx: x, cy: y, r: r + 8, fill: '#8f6a48', stroke: C.ink, 'stroke-width': 3 }, g);
    const rot = s('g', null, g);
    s('circle', { cx: x, cy: y, r, fill: color, stroke: C.ink, 'stroke-width': 4 }, rot);
    for (let k = 0; k < 12; k++) { const a = (k / 12) * Math.PI * 2; s('line', { x1: x + Math.cos(a) * (r - 4), y1: y + Math.sin(a) * (r - 4), x2: x + Math.cos(a) * (r - 14), y2: y + Math.sin(a) * (r - 14), stroke: C.ink, 'stroke-width': 3, opacity: 0.4 }, rot); }
    s('circle', { cx: x, cy: y - r + 18, r: 8, fill: C.ink }, rot);
    return { g, rot, x, y };
  }
  const tune = knob(WIN.x + WIN.w - 70, R.y + 330, 66, '#efe3cc');
  const vol = knob(WIN.x + 70, R.y + 330, 46, '#efe3cc');

  let v = 0.1, volume = 0.8;
  function setTune(nv) { v = clamp(nv, 0, 1); }
  drag(tune.g, svg, {
    startMoved: true,
    down(p) { tune.prev = Math.atan2(p.y - tune.y, p.x - tune.x); },
    move(p) {
      const a = Math.atan2(p.y - tune.y, p.x - tune.x);
      let d = a - tune.prev; if (d > Math.PI) d -= 2 * Math.PI; if (d < -Math.PI) d += 2 * Math.PI;
      tune.prev = a; setTune(v + d / (Math.PI * 3));
    },
  });
  // A tap on the knob jumps to the next station.
  tune.g.addEventListener('pointerup', () => {});
  let tapStart = 0;
  tune.g.addEventListener('pointerdown', () => (tapStart = performance.now()));
  tune.g.addEventListener('click', () => {
    if (performance.now() - tapStart > 250) return;
    const nextSt = STATIONS.find((st) => st.pos > v + 0.05) || STATIONS[0];
    glideTo = nextSt.pos;
  });
  let glideTo = null;
  drag(winHit, svg, { startMoved: true, down(p) { glideTo = null; setTune((p.x - WIN.x - 20) / (WIN.w - 40)); }, move(p) { setTune((p.x - WIN.x - 20) / (WIN.w - 40)); } });
  drag(vol.g, svg, {
    startMoved: true,
    down(p) { vol.prev = Math.atan2(p.y - vol.y, p.x - vol.x); },
    move(p) {
      const a = Math.atan2(p.y - vol.y, p.x - vol.x);
      let d = a - vol.prev; if (d > Math.PI) d -= 2 * Math.PI; if (d < -Math.PI) d += 2 * Math.PI;
      vol.prev = a; volume = clamp(volume + d / (Math.PI * 1.6), 0, 1);
    },
  });

  // Dancers on top of the radio
  const dancers = [
    { x: R.x + 160, draw: (g) => { s('circle', { cx: 0, cy: -46, r: 42, fill: C.ochre, stroke: C.ink, 'stroke-width': 4 }, g); s('path', { d: 'M-8 -44 l8 12 l8 -12z', fill: C.terra, stroke: C.ink, 'stroke-width': 3 }, g); s('circle', { cx: -14, cy: -56, r: 5, fill: C.ink }, g); s('circle', { cx: 14, cy: -56, r: 5, fill: C.ink }, g); s('path', { d: 'M-40 -40 q-24 6 -26 -16 M40 -40 q24 6 26 -16', stroke: C.ink, 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round' }, g); s('path', { d: 'M-10 -4 v8 M10 -4 v8', stroke: C.terra, 'stroke-width': 5, 'stroke-linecap': 'round' }, g); } },
    { x: R.x + 420, draw: (g) => { s('ellipse', { cx: 0, cy: -44, rx: 40, ry: 44, fill: C.stone, stroke: C.ink, 'stroke-width': 4 }, g); s('path', { d: 'M-32 -76 l4 -30 l20 20z M32 -76 l-4 -30 l-20 20z', fill: C.stone, stroke: C.ink, 'stroke-width': 4, 'stroke-linejoin': 'round' }, g); s('circle', { cx: -14, cy: -52, r: 5, fill: C.ink }, g); s('circle', { cx: 14, cy: -52, r: 5, fill: C.ink }, g); s('path', { d: 'M-6 -38 q6 6 12 0', stroke: C.ink, 'stroke-width': 3, fill: 'none' }, g); s('path', { d: 'M36 -20 q30 0 26 -40', stroke: C.ink, 'stroke-width': 6, fill: 'none', 'stroke-linecap': 'round' }, g); } },
    { x: R.x + 680, draw: (g) => { s('circle', { cx: -30, cy: -86, r: 15, fill: C.cocoa, stroke: C.ink, 'stroke-width': 4 }, g); s('circle', { cx: 30, cy: -86, r: 15, fill: C.cocoa, stroke: C.ink, 'stroke-width': 4 }, g); s('ellipse', { cx: 0, cy: -48, rx: 46, ry: 48, fill: C.cocoa, stroke: C.ink, 'stroke-width': 4 }, g); s('ellipse', { cx: 0, cy: -38, rx: 18, ry: 13, fill: '#d9b483' }, g); s('circle', { cx: 0, cy: -42, r: 5, fill: C.ink }, g); s('circle', { cx: -16, cy: -60, r: 5, fill: C.ink }, g); s('circle', { cx: 16, cy: -60, r: 5, fill: C.ink }, g); } },
  ];
  dancers.forEach((d) => {
    d.outer = s('g', { transform: `translate(${d.x} ${R.y + 6})` }, svg);
    d.inner = s('g', null, d.outer);
    d.draw(d.inner);
  });

  // ---------- Sound ----------
  const musicBus = audio.bus(0);
  const stat = audio.noiseLoop({ freq: 2200, q: 0.4, vol: 0 });
  kit.add(() => { stat.stop(); if (musicBus) { musicBus.gain.setTargetAtTime(0, audio.now(), 0.05); setTimeout(() => musicBus.disconnect(), 400); } });
  let curSt = -1, step = 0, nextT = 0, songT0 = 0;
  function playStep(st, song, k, at) {
    const bar = Math.floor(k / song.spb) % song.bars.length, i = k % song.spb;
    const beat = 60 / st.bpm / 2;
    const n = song.bars[bar][i];
    const o = { at, dest: musicBus, vol: 0.26 };
    if (n !== null) audio.inst[st.lead](audio.midi(deg(st, n) + (st.lead === 'musicbox' ? 0 : 12) - (st.lead === 'flute' ? 0 : 0)), o);
    const ch = song.chords[bar];
    if (i === 0) audio.inst.bass(audio.midi(deg(st, ch) - 12), { at, dest: musicBus, vol: 0.32 });
    if (st.meter === 4 && i === 4) audio.inst.bass(audio.midi(deg(st, ch + 4) - 12), { at, dest: musicBus, vol: 0.22 });
    if (st.pad && i === 0) [0, 2, 4].forEach((d) => audio.inst.pad(audio.midi(deg(st, ch + d)), { at, dest: musicBus, vol: 0.2, dur: beat * song.spb }));
    if (st.meter === 3 && (i === 2 || i === 4)) [2, 4].forEach((d) => audio.inst.musicbox(audio.midi(deg(st, ch + d) - 12), { at, dest: musicBus, vol: 0.1 }));
    if (st.perc === 'shaker' && i % 2 === 1) audio.inst.shaker({ at, dest: musicBus, vol: 0.3 });
    if (st.perc === 'drum' && (i === 0 || i === 3 || i === 6)) audio.inst.drum({ at, dest: musicBus, vol: i === 0 ? 0.35 : 0.22 });
    if (st.perc === 'wood' && (i === 2 || i === 6 || i === 7)) audio.inst.wood({ at, dest: musicBus, vol: 0.2 });
  }
  kit.every(25, () => {
    const ac = audio.ctx();
    if (!ac || curSt < 0) return;
    const st = STATIONS[curSt], song = songs[curSt];
    if (nextT < ac.currentTime) nextT = ac.currentTime + 0.06;
    while (nextT < ac.currentTime + 0.15) {
      playStep(st, song, step, nextT);
      step++;
      nextT += 60 / st.bpm / 2;
    }
  });

  let knobA = 0;
  kit.loop((dt, t) => {
    if (glideTo !== null) { v += (glideTo - v) * Math.min(1, dt * 4); if (Math.abs(glideTo - v) < 0.002) { v = glideTo; glideTo = null; } }
    const x = posX(v);
    needle.setAttribute('x1', x); needle.setAttribute('x2', x);
    knobA = v * 540;
    tune.rot.setAttribute('transform', `rotate(${knobA.toFixed(1)} ${tune.x} ${tune.y})`);
    vol.rot.setAttribute('transform', `rotate(${(-140 + volume * 280).toFixed(1)} ${vol.x} ${vol.y})`);
    // Which station is closest, and how clear is it?
    let best = 0;
    STATIONS.forEach((st, i) => { if (Math.abs(st.pos - v) < Math.abs(STATIONS[best].pos - v)) best = i; });
    const clarity = clamp(1 - Math.abs(STATIONS[best].pos - v) / 0.07, 0, 1);
    if (clarity > 0 && best !== curSt) { curSt = best; step = 0; nextT = 0; songT0 = audio.now() + 0.06; sfx.click(); }
    if (clarity === 0 && curSt >= 0 && Math.abs(STATIONS[curSt].pos - v) > 0.09) curSt = -1;
    const ac = audio.ctx();
    if (ac && musicBus) musicBus.gain.setTargetAtTime(Math.pow(clarity, 1.5) * volume, ac.currentTime, 0.08);
    if (ac && stat.gain) stat.gain.gain.setTargetAtTime((1 - clarity) * 0.045 * volume, ac.currentTime, 0.08);
    iconEls.forEach((g, i) => g.setAttribute('opacity', i === best && clarity > 0.3 ? 1 : 0.4));
    // Dancing
    const st = curSt >= 0 ? STATIONS[curSt] : null;
    const beat = st ? Math.max(0, (audio.now() - songT0)) / (60 / st.bpm) : t * 0.5;
    const amp = st ? Math.pow(clarity, 1.2) * Math.min(1, volume * 2) : 0;
    dancers.forEach((d, i) => {
      const ph = beat * Math.PI * 2;
      let tx = 0, ty = 0, r = 0, sx = 1;
      switch (st ? st.dance : 'idle') {
        case 'bob': ty = -Math.abs(Math.sin(ph / 2)) * 22; r = Math.sin(ph / 2) * 4; break;
        case 'sway': r = Math.sin(ph / 4 + i) * 10; tx = Math.sin(ph / 4 + i) * 8; break;
        case 'jump': ty = -Math.max(0, Math.sin(ph / 2 + i * 1.1)) * 40; break;
        case 'waltz': r = Math.sin(ph / 3) * 14; ty = -Math.abs(Math.sin(ph / 3)) * 12; tx = Math.sin(ph / 3) * 16; break;
        case 'spin': sx = Math.cos(ph / 4 + i); ty = -Math.abs(Math.sin(ph / 2)) * 16; break;
        default: r = Math.sin(t * 0.8 + i) * 2;
      }
      d.inner.setAttribute('transform', `translate(${(tx * amp).toFixed(1)} ${(ty * amp).toFixed(1)}) rotate(${(r * (st ? amp : 1)).toFixed(1)}) scale(${lerp(1, sx, amp).toFixed(3)} 1)`);
    });
    const pulse = st ? 1 + Math.max(0, Math.cos(beat * Math.PI * 2)) * 0.05 * amp : 1;
    cone.setAttribute('transform', `translate(${SP.x} ${SP.y}) scale(${pulse.toFixed(3)}) translate(${-SP.x} ${-SP.y})`);
  });
}

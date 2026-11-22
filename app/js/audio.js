// Soft, synthesized foley. Nothing is loaded from the network: every sound is
// built from oscillators and filtered noise, so it works offline.
let ac = null, master = null, out = null, noiseBuf = null;
let volume = 0.7, muted = false;

export function init() {
  if (ac) {
    if (ac.state === 'suspended') ac.resume();
    return ac;
  }
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  ac = new AC();
  master = ac.createGain();
  master.gain.value = muted ? 0 : volume;
  const lp = ac.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 7000;
  const comp = ac.createDynamicsCompressor();
  comp.threshold.value = -18;
  comp.ratio.value = 4;
  master.connect(lp); lp.connect(comp); comp.connect(ac.destination);
  out = master;
  const len = ac.sampleRate * 2;
  noiseBuf = ac.createBuffer(1, len, ac.sampleRate);
  const d = noiseBuf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  return ac;
}

export const ctx = () => ac;
export const dest = () => out;
export const now = () => (ac ? ac.currentTime : 0);
const ok = () => !!ac && ac.state !== 'closed';

export function setVolume(v) { volume = v; if (master) master.gain.setTargetAtTime(muted ? 0 : v, ac.currentTime, 0.05); }
export function setMuted(m) { muted = m; if (master) master.gain.setTargetAtTime(m ? 0 : volume, ac.currentTime, 0.05); }

function env(g, t, attack, peak, dur) {
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + attack + dur);
}

export function tone(freq, o = {}) {
  if (!ok()) return;
  const { type = 'sine', dur = 0.4, vol = 0.3, attack = 0.005, at, dest: d, glide, detune = 0, vib = 0 } = o;
  const t = at ?? ac.currentTime;
  const osc = ac.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (glide) osc.frequency.exponentialRampToValueAtTime(glide, t + attack + dur);
  osc.detune.value = detune;
  const g = ac.createGain();
  env(g, t, attack, vol, dur);
  osc.connect(g); g.connect(d || out);
  if (vib) {
    const l = ac.createOscillator(), lg = ac.createGain();
    l.frequency.value = 5.5; lg.gain.value = vib;
    l.connect(lg); lg.connect(osc.frequency);
    l.start(t); l.stop(t + attack + dur + 0.05);
  }
  osc.start(t); osc.stop(t + attack + dur + 0.05);
}

export function noise(o = {}) {
  if (!ok()) return;
  const { dur = 0.2, vol = 0.2, freq = 1000, q = 1, type = 'bandpass', at, dest: d, attack = 0.003, sweep } = o;
  const t = at ?? ac.currentTime;
  const src = ac.createBufferSource();
  src.buffer = noiseBuf;
  const f = ac.createBiquadFilter();
  f.type = type; f.frequency.setValueAtTime(freq, t); f.Q.value = q;
  if (sweep) f.frequency.exponentialRampToValueAtTime(sweep, t + attack + dur);
  const g = ac.createGain();
  env(g, t, attack, vol, dur);
  src.connect(f); f.connect(g); g.connect(d || out);
  src.start(t, Math.random() * 1.5); src.stop(t + attack + dur + 0.05);
}

// A looping noise source (waves, radio static). Returns {gain, stop}.
export function noiseLoop({ freq = 800, q = 0.7, type = 'bandpass', vol = 0.05 } = {}) {
  if (!ok()) return { gain: null, stop() {} };
  const src = ac.createBufferSource();
  src.buffer = noiseBuf; src.loop = true;
  const f = ac.createBiquadFilter();
  f.type = type; f.frequency.value = freq; f.Q.value = q;
  const g = ac.createGain(); g.gain.value = vol;
  src.connect(f); f.connect(g); g.connect(out);
  src.start();
  return { gain: g, filter: f, stop() { try { g.gain.setTargetAtTime(0, ac.currentTime, 0.05); src.stop(ac.currentTime + 0.3); } catch (e) {} } };
}

export function bus(vol = 1) {
  if (!ok()) return null;
  const g = ac.createGain(); g.gain.value = vol; g.connect(out);
  return g;
}

// Plucked string (Karplus-Strong), cached per pitch.
const pluckCache = new Map();
export function pluck(freq, o = {}) {
  if (!ok()) return;
  const { at, dest: d, vol = 0.3, dur = 1.6 } = o;
  const key = Math.round(freq);
  let buf = pluckCache.get(key);
  if (!buf) {
    const sr = ac.sampleRate, n = Math.floor(sr * dur), p = Math.max(2, Math.round(sr / freq));
    buf = ac.createBuffer(1, n, sr);
    const x = buf.getChannelData(0);
    for (let i = 0; i < p; i++) x[i] = Math.random() * 2 - 1;
    for (let i = p; i < n; i++) x[i] = 0.497 * (x[i - p] + x[i - p + 1]);
    pluckCache.set(key, buf);
  }
  const t = at ?? ac.currentTime;
  const src = ac.createBufferSource(); src.buffer = buf;
  const g = ac.createGain(); g.gain.value = vol;
  const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2600;
  src.connect(lp); lp.connect(g); g.connect(d || out);
  src.start(t);
}

// Instruments used by the music toys.
export const inst = {
  marimba(f, o = {}) { tone(f, { ...o, dur: 0.9, vol: (o.vol ?? 0.3) }); tone(f * 4, { ...o, dur: 0.12, vol: (o.vol ?? 0.3) * 0.25 }); },
  musicbox(f, o = {}) { tone(f * 2, { ...o, dur: 1.4, vol: (o.vol ?? 0.3) * 0.55 }); tone(f * 4.01, { ...o, dur: 0.5, vol: (o.vol ?? 0.3) * 0.12 }); },
  pluck(f, o = {}) { pluck(f, { ...o, vol: (o.vol ?? 0.3) * 1.2 }); },
  flute(f, o = {}) { tone(f, { ...o, attack: 0.08, dur: 0.6, vol: (o.vol ?? 0.3) * 0.6, vib: 4 }); tone(f * 2, { ...o, attack: 0.08, dur: 0.4, vol: (o.vol ?? 0.3) * 0.08 }); },
  kalimba(f, o = {}) { tone(f, { ...o, type: 'triangle', dur: 0.7, vol: (o.vol ?? 0.3) * 0.7 }); tone(f * 5.9, { ...o, dur: 0.08, vol: (o.vol ?? 0.3) * 0.12 }); },
  bass(f, o = {}) { tone(f, { ...o, type: 'triangle', dur: 0.5, vol: (o.vol ?? 0.3) * 0.9 }); },
  pad(f, o = {}) { tone(f, { ...o, attack: 0.4, dur: o.dur ?? 2, vol: (o.vol ?? 0.3) * 0.25 }); tone(f * 1.003, { ...o, attack: 0.4, dur: o.dur ?? 2, vol: (o.vol ?? 0.3) * 0.2, type: 'triangle' }); },
  wood(o = {}) { tone(1100, { ...o, type: 'triangle', dur: 0.05, vol: (o.vol ?? 0.3) * 0.7 }); noise({ ...o, dur: 0.03, vol: (o.vol ?? 0.3) * 0.3, freq: 2500, q: 5 }); },
  kick(o = {}) { tone(130, { ...o, dur: 0.22, vol: (o.vol ?? 0.3) * 1.2, glide: 48 }); },
  shaker(o = {}) { noise({ ...o, dur: 0.06, vol: (o.vol ?? 0.3) * 0.25, freq: 6000, type: 'highpass', attack: 0.01 }); },
  drum(o = {}) { tone(190, { ...o, dur: 0.2, vol: (o.vol ?? 0.3) * 0.8, glide: 120 }); noise({ ...o, dur: 0.05, vol: (o.vol ?? 0.3) * 0.2, freq: 800, q: 2 }); },
};

export const midi = (m) => 440 * Math.pow(2, (m - 69) / 12);

export const sfx = {
  click() { noise({ dur: 0.025, vol: 0.35, freq: 3500, q: 3 }); tone(2200, { type: 'triangle', dur: 0.02, vol: 0.04 }); },
  clack(p = 1, v = 1) { tone(720 * p, { type: 'triangle', dur: 0.07, vol: 0.22 * v }); tone(1580 * p, { dur: 0.04, vol: 0.08 * v }); noise({ dur: 0.03, vol: 0.18 * v, freq: 2400 * p, q: 4 }); },
  thud(p = 1, v = 1) { tone(140 * p, { dur: 0.16, vol: 0.35 * v, glide: 70 * p }); noise({ dur: 0.06, vol: 0.12 * v, freq: 500, type: 'lowpass' }); },
  pop(p = 1) { tone(420 * p, { dur: 0.1, vol: 0.2, glide: 840 * p }); },
  tick(v = 1) { noise({ dur: 0.012, vol: 0.15 * v, freq: 5000, q: 6 }); },
  chime(f = 880, v = 1) { tone(f, { dur: 1.6, vol: 0.16 * v }); tone(f * 2.01, { dur: 0.9, vol: 0.05 * v }); tone(f * 3.98, { dur: 0.4, vol: 0.02 * v }); },
  bell(f = 660, v = 1) { tone(f, { dur: 2.2, vol: 0.14 * v }); tone(f * 2.76, { dur: 1, vol: 0.05 * v }); tone(f * 5.4, { dur: 0.5, vol: 0.025 * v }); tone(f * 1.5, { dur: 1.2, vol: 0.03 * v }); },
  splash(v = 1) { noise({ dur: 0.45, vol: 0.2 * v, freq: 2200, q: 0.7, sweep: 500 }); },
  drip() { tone(900, { dur: 0.08, vol: 0.12, glide: 1800 }); },
  whoosh(v = 1) { noise({ dur: 0.5, vol: 0.12 * v, freq: 300, q: 1.2, sweep: 1800, attack: 0.2 }); },
  rumble() { noise({ dur: 1.8, vol: 0.4, freq: 120, type: 'lowpass', attack: 0.3 }); tone(45, { dur: 1.6, vol: 0.25, attack: 0.3 }); },
  boing(p = 1) { tone(220 * p, { type: 'triangle', dur: 0.35, vol: 0.2, glide: 440 * p, vib: 30 }); },
  squeak(p = 1) { tone(1400 * p, { dur: 0.12, vol: 0.07, glide: 2000 * p, type: 'triangle' }); },
  chirp() { tone(2600, { dur: 0.06, vol: 0.06, glide: 3400 }); tone(2900, { dur: 0.07, vol: 0.05, glide: 3800, at: now() + 0.09 }); },
  honk() { tone(330, { type: 'square', dur: 0.14, vol: 0.035 }); tone(415, { type: 'square', dur: 0.14, vol: 0.03 }); },
  munch() { for (let i = 0; i < 3; i++) noise({ dur: 0.05, vol: 0.15, freq: 900, q: 1.5, at: now() + i * 0.13 }); },
  sizzle(d = 1.5) { noise({ dur: d, vol: 0.05, freq: 5000, type: 'highpass', attack: 0.1 }); },
  roar(p = 1) { tone(95 * p, { type: 'sawtooth', dur: 0.8, vol: 0.06, attack: 0.08, vib: 6, glide: 70 * p }); noise({ dur: 0.7, vol: 0.08, freq: 300, q: 0.8, attack: 0.08 }); },
  hum(f = 220) { tone(f, { dur: 1.5, vol: 0.08, attack: 0.3 }); tone(f * 1.5, { dur: 1.5, vol: 0.05, attack: 0.3 }); },
  bubble() { tone(400 + Math.random() * 300, { dur: 0.08, vol: 0.1, glide: 900 + Math.random() * 500 }); },
  paper() { noise({ dur: 0.35, vol: 0.1, freq: 3000, q: 0.5, sweep: 1500, attack: 0.05 }); },
  moo() { tone(150, { type: 'sawtooth', dur: 0.9, vol: 0.05, attack: 0.15, glide: 110, vib: 3 }); },
  quack() { tone(500, { type: 'square', dur: 0.12, vol: 0.03, glide: 320 }); tone(500, { type: 'square', dur: 0.12, vol: 0.03, glide: 320, at: now() + 0.18 }); },
  bleat() { tone(520, { type: 'triangle', dur: 0.5, vol: 0.08, vib: 40 }); },
};

// Gentle speech for the phonics toy. Uses the device's offline voices if any.
// Inside the Android app, the WebView has no working speechSynthesis, so the
// app exposes the system text-to-speech engine as window.KilalaoAndroid.
const nativeTTS = () => (typeof window !== 'undefined' && window.KilalaoAndroid && typeof window.KilalaoAndroid.say === 'function') ? window.KilalaoAndroid : null;

export function say(text, { rate = 0.8, pitch = 1.1, lang = 'en' } = {}) {
  const n = nativeTTS();
  if (n) {
    try { n.say(String(text), rate, pitch, muted ? 0 : Math.min(1, volume + 0.2), lang); return true; } catch (e) { return false; }
  }
  if (!('speechSynthesis' in window)) return false;
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.rate = rate; u.pitch = pitch; u.volume = muted ? 0 : Math.min(1, volume + 0.2);
    const l2 = String(lang).toLowerCase().slice(0, 2);
    const v = speechSynthesis.getVoices().find((x) => x.lang && x.lang.toLowerCase().startsWith(l2));
    if (v) u.voice = v;
    u.lang = v ? v.lang : (lang.length > 2 ? lang : 'en-US');
    speechSynthesis.speak(u);
    return true;
  } catch (e) { return false; }
}

// Is there a voice for this language (e.g. 'fr', 'mg')? Without one, the Learn
// area stays silent rather than reading a language with the wrong voice.
export function hasVoice(lang) {
  const n = nativeTTS();
  if (n) { try { return typeof n.hasVoice === 'function' ? !!n.hasVoice(lang) : lang === 'en'; } catch (e) { return false; } }
  if (!('speechSynthesis' in window)) return false;
  const l = String(lang).toLowerCase().slice(0, 2);
  return speechSynthesis.getVoices().some((v) => v.lang && v.lang.toLowerCase().startsWith(l));
}

// Stop any speech in progress.
export function hush() {
  const n = nativeTTS();
  try { if (n) n.stop(); else if ('speechSynthesis' in window) speechSynthesis.cancel(); } catch (e) {}
}

// Narration for the Learn area: recorded clips when a pack provides them, the
// device voice when it has the language, otherwise silence (never a voice in
// the wrong language). Prompts are always shown on screen as well.
import * as audio from '../audio.js';
import { LANGS, prompt, clipPlan, numberWord } from './i18n.js';

let manifest = null;
const loading = fetch('audio/manifest.json').then((r) => r.json()).then((m) => { manifest = m; }).catch(() => { manifest = {}; });
const buffers = new Map();

async function clip(lang, name) {
  const key = `${lang}/${name}`;
  if (buffers.has(key)) return buffers.get(key);
  const p = fetch(`audio/${key}.mp3`).then((r) => r.arrayBuffer()).then((b) => audio.ctx().decodeAudioData(b)).catch(() => null);
  buffers.set(key, p);
  return p;
}

let playing = [];
function stopClips() { playing.forEach((s) => { try { s.stop(); } catch (e) {} }); playing = []; }

async function playClips(lang, names) {
  const ac = audio.ctx();
  if (!ac) return false;
  const bufs = await Promise.all(names.map((n) => clip(lang, n)));
  if (bufs.some((b) => !b)) return false;
  stopClips();
  let t = ac.currentTime + 0.05;
  for (const b of bufs) {
    const src = ac.createBufferSource();
    src.buffer = b;
    src.connect(audio.dest());
    src.start(t);
    playing.push(src);
    t += b.duration;
  }
  return true;
}

const hasClips = (lang, names) => !!(manifest && manifest[lang] && names.every((n) => manifest[lang].includes(n)));

// Speak a prompt by key. Returns the text shown on screen.
export async function sayPrompt(lang, key, vars = {}) {
  await loading;
  stop();
  const names = clipPlan(key, vars, lang);
  if (hasClips(lang, names) && await playClips(lang, names)) return;
  if (audio.hasVoice(lang)) audio.say(prompt(key, vars, lang, true), { rate: 0.82, pitch: 1.05, lang: LANGS[lang].tts });
}

// Speak one number (used when counting together).
export async function sayNumber(lang, n) {
  await loading;
  if (hasClips(lang, [`n/${n}`]) && await playClips(lang, [`n/${n}`])) return;
  if (audio.hasVoice(lang)) audio.say(numberWord(n, lang), { rate: 0.9, pitch: 1.05, lang: LANGS[lang].tts });
}

export function stop() { stopClips(); audio.hush(); }

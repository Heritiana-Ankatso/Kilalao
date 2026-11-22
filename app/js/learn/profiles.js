// Child profiles and their learning records, stored only on this device.
const KEY = 'kilalao.learn.v1';
export const AVATARS = ['fox', 'owl', 'turtle', 'cat', 'frog', 'bear', 'whale', 'bee'];

function blank() { return { active: null, profiles: [], mastery: {}, log: {}, obs: {} }; }
let data = blank();
try { data = { ...blank(), ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch (e) {}

function save() { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) {} }

export function list() { return data.profiles.slice(); }

export function get(id) { return data.profiles.find((p) => p.id === id) || null; }

// Returns the active profile, creating a first one if there is none yet.
export function active() {
  if (!data.profiles.length) add({ name: 'Child 1', avatar: 'fox', age: 5, lang: guessLang() });
  return get(data.active) || data.profiles[0];
}

export function setActive(id) { if (get(id)) { data.active = id; save(); } }

export function add({ name, avatar, age, lang }) {
  const id = 'p' + Date.now().toString(36) + Math.floor(Math.random() * 1e4).toString(36);
  const p = { id, name: name || `Child ${data.profiles.length + 1}`, avatar: avatar || AVATARS[data.profiles.length % AVATARS.length], age: Number(age) || 5, lang: lang || guessLang(), created: Date.now() };
  data.profiles.push(p);
  if (!data.active) data.active = id;
  save();
  return p;
}

export function update(id, patch) {
  const p = get(id);
  if (!p) return;
  Object.assign(p, patch);
  if ('age' in patch) p.age = Number(patch.age) || p.age;
  save();
}

export function remove(id) {
  data.profiles = data.profiles.filter((p) => p.id !== id);
  delete data.mastery[id];
  delete data.log[id];
  if (data.obs) delete data.obs[id];
  if (data.active === id) data.active = data.profiles[0] ? data.profiles[0].id : null;
  save();
}

// Per-skill record: { p: P(known), n: attempts, c: correct, last: ms, assumed }
export function skill(pid, sid) { return (data.mastery[pid] || {})[sid] || null; }
export function setSkill(pid, sid, rec) { (data.mastery[pid] ||= {})[sid] = rec; save(); }
export function allSkills(pid) { return { ...(data.mastery[pid] || {}) }; }

// A short practice log for the adult report (newest last, capped).
export function logAttempt(pid, entry) {
  const l = (data.log[pid] ||= []);
  l.push(entry);
  if (l.length > 1500) l.splice(0, l.length - 1500);
  save();
}
export function log(pid) { return (data.log[pid] || []).slice(); }

// Adult observations for child testing (tags and notes), kept on the device.
export function addObs(pid, entry) {
  data.obs ||= {};
  const l = (data.obs[pid] ||= []);
  l.push({ t: Date.now(), ...entry });
  if (l.length > 500) l.splice(0, l.length - 500);
  save();
}
export function obs(pid) { return ((data.obs || {})[pid] || []).slice(); }
export function clearTesting(pid) { if (data.obs) delete data.obs[pid]; save(); }

export function guessLang() {
  const l = (navigator.language || 'en').toLowerCase();
  return l.startsWith('fr') ? 'fr' : l.startsWith('mg') ? 'mg' : 'en';
}

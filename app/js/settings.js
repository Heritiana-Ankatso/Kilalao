// Adult settings, kept on this device only.
const KEY = 'kilalao.settings.v1';
const DEFAULTS = {
  volume: 0.7,
  sound: true,
  calm: false,        // fewer particles, slower motion
  limit: 0,           // minutes of play per day, 0 = no limit
  season: 'auto',     // auto | none | winter | spring | summer | autumn
  hemisphere: 'auto', // auto | north | south
  speech: true,       // phonics voice
  hidden: [],         // toy ids hidden from the shelf
};

let data = { ...DEFAULTS };
try { data = { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch (e) {}
const subs = new Set();

export const settings = {
  get: (k) => data[k],
  all: () => ({ ...data }),
  set(k, v) {
    data[k] = v;
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) {}
    subs.forEach((f) => f(k, v));
  },
  subscribe(f) { subs.add(f); return () => subs.delete(f); },
};

// Daily play time, so a reload does not reset the limit.
const PKEY = 'kilalao.played.v1';
const today = () => new Date().toISOString().slice(0, 10);
export const playtime = {
  get() {
    try {
      const p = JSON.parse(localStorage.getItem(PKEY) || '{}');
      return p.day === today() ? p.ms || 0 : 0;
    } catch (e) { return 0; }
  },
  add(ms) {
    const v = this.get() + ms;
    try { localStorage.setItem(PKEY, JSON.stringify({ day: today(), ms: v })); } catch (e) {}
    return v;
  },
  reset() { try { localStorage.setItem(PKEY, JSON.stringify({ day: today(), ms: 0 })); } catch (e) {} },
};

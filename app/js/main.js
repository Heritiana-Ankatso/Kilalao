// Kilalao: the shelf, toy loading, play-time limit and adult corner.
import * as audio from './audio.js';
import { settings, playtime } from './settings.js';
import { ICONS, HOME_SVG } from './icons.js';
import { loop } from './lib.js';
import { installLock, openParent } from './parent.js';
import { startSeason } from './season.js';

export const VERSION = '1.2.0';

// Shelf order: calmer sensory toys first, richer story/logic toys after.
export const TOYS = ['learn', 'busyboard', 'shapes', 'blocks', 'silly', 'marble', 'town', 'house', 'code', 'sequencer',
  'radio', 'puzzle', 'islands', 'book', 'space', 'dinos', 'phonics', 'draw'];

const app = document.getElementById('app');
let current = null;
let bedtime = null;
let opening = false;

function applySettings() {
  audio.setVolume(settings.get('volume'));
  audio.setMuted(!settings.get('sound'));
  document.body.classList.toggle('calm', !!settings.get('calm'));
}
applySettings();

// Audio may only start after a touch.
window.addEventListener('pointerdown', () => audio.init(), { capture: true });

// ---------- Kit given to each toy: auto-cleaned timers and listeners ----------
function makeKit() {
  const cleanups = [];
  return {
    sfx: audio.sfx,
    audio,
    settings,
    calm: !!settings.get('calm'),
    loop(fn) { const stop = loop(fn); cleanups.push(stop); return stop; },
    on(t, ev, f, o) { t.addEventListener(ev, f, o); cleanups.push(() => t.removeEventListener(ev, f, o)); },
    every(ms, f) { const id = setInterval(f, ms); cleanups.push(() => clearInterval(id)); return id; },
    after(ms, f) { const id = setTimeout(f, ms); cleanups.push(() => clearTimeout(id)); return id; },
    add(fn) { cleanups.push(fn); },
    dispose() { cleanups.splice(0).reverse().forEach((f) => { try { f(); } catch (e) { console.error(e); } }); },
  };
}

// ---------- Shelf ----------
const shelf = document.createElement('div');
shelf.className = 'view shelf';
shelf.innerHTML = `<div class="shelf-scroll"><div class="shelf-inner"><div class="row"></div><div class="row"></div></div></div>`;
app.appendChild(shelf);
const rows = [...shelf.querySelectorAll('.row')];
let stopSeason = () => {};

function buildShelf() {
  const hidden = new Set(settings.get('hidden'));
  const list = TOYS.filter((id) => !hidden.has(id));
  rows.forEach((r) => (r.innerHTML = ''));
  const half = Math.ceil(list.length / 2);
  list.forEach((id, i) => {
    const b = document.createElement('button');
    b.className = 'toy';
    b.setAttribute('aria-label', id);
    b.innerHTML = ICONS[id];
    b.style.setProperty('--d', `${(i % half) * 45 + (i >= half ? 120 : 0)}ms`);
    b.addEventListener('click', () => openToy(id, b));
    rows[i < half ? 0 : 1].appendChild(b);
  });
  stopSeason();
  stopSeason = startSeason(shelf, rows);
}
buildShelf();

settings.subscribe((k) => {
  applySettings();
  if (k === 'hidden' || k === 'season' || k === 'hemisphere') buildShelf();
});

async function openToy(id, btn) {
  if (current || bedtime || opening) return;
  opening = true;
  audio.init();
  audio.sfx.pop(0.9);
  btn.classList.add('chosen');
  let mod;
  try {
    mod = await import(`./toys/${id}.js`);
  } catch (e) {
    console.error(e);
    btn.classList.remove('chosen');
    opening = false;
    return;
  }
  const view = document.createElement('div');
  view.className = 'view entering';
  const root = document.createElement('div');
  root.className = 'toyroot';
  view.appendChild(root);
  const home = document.createElement('button');
  home.className = 'home-btn';
  home.setAttribute('aria-label', 'Back to the shelf');
  home.innerHTML = HOME_SVG;
  view.appendChild(home);
  app.appendChild(view);
  const kit = makeKit();
  try { mod.default(root, kit); } catch (e) { console.error(e); }
  home.addEventListener('click', closeToy);
  current = { view, kit, id };
  requestAnimationFrame(() => requestAnimationFrame(() => {
    view.classList.remove('entering');
    shelf.classList.add('away');
    btn.classList.remove('chosen');
    opening = false;
  }));
}

function closeToy() {
  if (!current) return;
  audio.sfx.whoosh(0.7);
  const { view, kit } = current;
  current = null;
  view.classList.add('leaving');
  shelf.classList.remove('away');
  kit.dispose();
  setTimeout(() => view.remove(), 600);
}

// ---------- Play-time limit: the toys fall asleep ----------
let lastTick = performance.now();
setInterval(() => {
  const t = performance.now();
  const dt = t - lastTick;
  lastTick = t;
  if (document.hidden || bedtime || document.querySelector('.adult')) return;
  const played = playtime.add(Math.min(dt, 10000));
  const limit = settings.get('limit');
  if (limit > 0 && played >= limit * 60000) sleep();
}, 5000);

function sleep() {
  if (bedtime) return;
  closeToy();
  bedtime = document.createElement('div');
  bedtime.className = 'bedtime';
  let stars = '';
  for (let i = 0; i < 40; i++) {
    const x = Math.random() * 1000, y = Math.random() * 300;
    stars += `<circle cx="${x}" cy="${y}" r="${1 + Math.random() * 2.5}" fill="#f4ecdc" style="animation:twinkle ${3 + Math.random() * 4}s ease-in-out ${Math.random() * 3}s infinite"/>`;
  }
  bedtime.innerHTML = `<svg viewBox="0 0 1000 560" aria-hidden="true">${stars}
    <circle cx="760" cy="120" r="70" fill="#f1e3bd"/><circle cx="795" cy="100" r="62" fill="#4a5468"/>
    <rect x="120" y="420" width="760" height="22" rx="6" fill="#8f6a48"/>
    <g transform="translate(220 340)"><rect width="110" height="80" rx="18" fill="#93ab8b" stroke="#2f2a26" stroke-width="4"/><path d="M28 40 q10 8 20 0 M62 40 q10 8 20 0" stroke="#2f2a26" stroke-width="4" fill="none" stroke-linecap="round"/></g>
    <g transform="translate(450 330)"><circle cx="50" cy="45" r="46" fill="#d8a650" stroke="#2f2a26" stroke-width="4"/><path d="M26 44 q10 8 20 0 M56 44 q10 8 20 0" stroke="#2f2a26" stroke-width="4" fill="none" stroke-linecap="round"/></g>
    <g transform="translate(650 350)"><path d="M0 70 l55 -70 l55 70 z" fill="#c97b63" stroke="#2f2a26" stroke-width="4" stroke-linejoin="round"/><path d="M30 50 q8 6 16 0 M62 50 q8 6 16 0" stroke="#2f2a26" stroke-width="4" fill="none" stroke-linecap="round"/></g>
    <g fill="#f4ecdc" opacity=".8"><text x="330" y="300" font-size="40" style="animation:twinkle 3s infinite">z</text><text x="560" y="280" font-size="52" style="animation:twinkle 3.6s .6s infinite">z</text><text x="760" y="310" font-size="36" style="animation:twinkle 4s 1.2s infinite">z</text></g>
  </svg>`;
  app.appendChild(bedtime);
  requestAnimationFrame(() => requestAnimationFrame(() => bedtime && bedtime.classList.add('show')));
}

function wake() {
  if (!bedtime) return;
  const b = bedtime;
  bedtime = null;
  b.classList.remove('show');
  setTimeout(() => b.remove(), 2000);
}

// ---------- Adult corner ----------
// Inside the Android app every file is already packaged on the device.
const ANDROID = !!window.KilalaoAndroid;
const offline = { ready: ANDROID };
installLock(() => openParent({ toys: TOYS, version: VERSION, wake, offline: offline.ready }));

// ---------- Offline support ----------
if (!ANDROID && 'serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
  navigator.serviceWorker.register('sw.js').then(() => navigator.serviceWorker.ready).then(() => { offline.ready = true; }).catch(() => {});
}

// Keep the page from scrolling or zooming on touch devices.
// Android back button: close the open toy. On the shelf it does nothing, so a
// child cannot leave the app by accident (adults use the system home gesture).
window.kilalaoBack = () => {
  if (document.querySelector('.adult')) { document.querySelector('.adult [data-close]')?.click(); return true; }
  if (current) { closeToy(); return true; }
  return false;
};

document.addEventListener('gesturestart', (e) => e.preventDefault());
document.addEventListener('contextmenu', (e) => { if (!e.target.closest('.adult')) e.preventDefault(); });

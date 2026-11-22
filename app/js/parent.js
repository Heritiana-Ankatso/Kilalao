// The adult area: hold the top-right corner, answer a sum, then change settings.
import { settings, playtime } from './settings.js';

const HOLD_MS = 2200;
const NAMES = {
  busyboard: 'Busy Board', shapes: 'Shapes', blocks: 'Blocks', silly: 'Silly Blocks', marble: 'Marble Machine',
  town: 'Town & Shops', house: 'House & Dress-Up', code: 'Code Factory', sequencer: 'Sequencer', radio: 'Radio',
  puzzle: 'World Puzzle', islands: 'Islands', book: 'Busy Book', space: 'Space', dinos: 'Dinosaurs',
  phonics: 'Phonics', draw: 'Drawing',
};

export function installLock(onOpen) {
  const el = document.createElement('div');
  el.className = 'lock';
  el.setAttribute('aria-label', 'Grown-ups: press and hold');
  el.innerHTML = `<svg viewBox="0 0 54 54"><circle cx="27" cy="27" r="20" fill="none" stroke="#4a3f35" stroke-opacity=".18" stroke-width="3"/>
    <circle class="ring" cx="27" cy="27" r="20" fill="none" stroke="#c97b63" stroke-width="4" stroke-linecap="round"
      stroke-dasharray="125.7" stroke-dashoffset="125.7" transform="rotate(-90 27 27)"/>
    <rect x="19" y="25" width="16" height="12" rx="3" fill="#4a3f35" opacity=".55"/>
    <path d="M22 25 v-4 a5 5 0 0 1 10 0 v4" fill="none" stroke="#4a3f35" stroke-opacity=".55" stroke-width="2.5"/></svg>`;
  document.body.appendChild(el);
  const ring = el.querySelector('.ring');
  let t0 = 0, raf = 0, active = null;
  const reset = () => { cancelAnimationFrame(raf); active = null; ring.style.strokeDashoffset = 125.7; };
  el.addEventListener('contextmenu', (e) => e.preventDefault());
  el.addEventListener('pointerdown', (e) => {
    e.preventDefault(); e.stopPropagation();
    active = e.pointerId; t0 = performance.now();
    const step = () => {
      const k = Math.min(1, (performance.now() - t0) / HOLD_MS);
      ring.style.strokeDashoffset = 125.7 * (1 - k);
      if (k >= 1) { reset(); onOpen(); return; }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  });
  for (const ev of ['pointerup', 'pointercancel', 'pointerleave']) {
    el.addEventListener(ev, (e) => { if (e.pointerId === active) reset(); });
  }
}

function gate(card, onPass, onClose) {
  const a = 3 + Math.floor(Math.random() * 7), b = 4 + Math.floor(Math.random() * 6);
  card.innerHTML = `<h2>For grown-ups</h2>
    <p>To open the settings, type the answer to <b>${a} × ${b}</b>.</p>
    <p><input class="gate-in" type="number" inputmode="numeric" autocomplete="off" aria-label="Answer"></p>
    <p class="err"></p>
    <div class="btns"><button class="btn primary" data-ok>Open settings</button><button class="btn" data-close>Back to play</button></div>`;
  const input = card.querySelector('input');
  const err = card.querySelector('.err');
  const check = () => {
    if (Number(input.value) === a * b) onPass();
    else { err.textContent = 'Not quite. Try again.'; input.value = ''; input.focus(); }
  };
  card.querySelector('[data-ok]').onclick = check;
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') check(); });
  card.querySelector('[data-close]').onclick = onClose;
  setTimeout(() => input.focus(), 50);
}

function panel(card, ctx) {
  const s = settings.all();
  const minutes = Math.round(playtime.get() / 60000);
  const opt = (v, cur, label) => `<option value="${v}" ${String(v) === String(cur) ? 'selected' : ''}>${label}</option>`;
  card.innerHTML = `<h2>Settings</h2>
    <p class="muted">These stay on this device. Nothing is sent anywhere.</p>
    <section>
      <label class="row-set"><span>Sound</span><input type="checkbox" data-k="sound" ${s.sound ? 'checked' : ''}></label>
      <label class="row-set"><span>Volume</span><input type="range" min="0" max="1" step="0.05" value="${s.volume}" data-k="volume"></label>
      <label class="row-set"><span>Calm motion (fewer particles, slower animations)</span><input type="checkbox" data-k="calm" ${s.calm ? 'checked' : ''}></label>
      <label class="row-set"><span>Phonics voice</span><input type="checkbox" data-k="speech" ${s.speech ? 'checked' : ''}></label>
    </section>
    <section>
      <h3>Play time</h3>
      <label class="row-set"><span>Daily limit</span><select data-k="limit">
        ${opt(0, s.limit, 'No limit')}${opt(10, s.limit, '10 minutes')}${opt(20, s.limit, '20 minutes')}${opt(30, s.limit, '30 minutes')}${opt(45, s.limit, '45 minutes')}${opt(60, s.limit, '1 hour')}
      </select></label>
      <p class="muted">Played today: about ${minutes} min. When the limit is reached the toys fall asleep with a slow fade. No warning sounds, no countdown.</p>
      <div class="btns"><button class="btn" data-more>Reset today's time and wake the toys</button></div>
    </section>
    <section>
      <h3>Seasons</h3>
      <label class="row-set"><span>Seasonal decorations</span><select data-k="season">
        ${opt('auto', s.season, 'Follow the calendar')}${opt('none', s.season, 'Off')}${opt('winter', s.season, 'Winter')}${opt('spring', s.season, 'Spring')}${opt('summer', s.season, 'Summer')}${opt('autumn', s.season, 'Autumn')}
      </select></label>
      <label class="row-set"><span>Hemisphere</span><select data-k="hemisphere">
        ${opt('auto', s.hemisphere, 'Guess from time zone')}${opt('north', s.hemisphere, 'Northern')}${opt('south', s.hemisphere, 'Southern')}
      </select></label>
    </section>
    <section>
      <h3>Toys on the shelf</h3>
      <div class="toys-list">${ctx.toys.map((id) => `<label><input type="checkbox" data-toy="${id}" ${s.hidden.includes(id) ? '' : 'checked'}> ${NAMES[id] || id}</label>`).join('')}</div>
    </section>
    <section>
      <h3>About</h3>
      <p class="muted">Kilalao ${ctx.version} is free and open-source software (MIT licence). No ads, no accounts, no tracking, no purchases. ${ctx.offline ? 'All toys are saved on this device for offline play.' : 'Offline copy not ready yet: keep this page open online once.'}</p>
      <p class="muted">Tip: add it to the home screen and turn on your device's guided-access or screen-pinning mode so the child stays inside.</p>
    </section>
    <div class="btns"><button class="btn primary" data-close>Back to play</button></div>`;
  card.querySelectorAll('[data-k]').forEach((el) => {
    el.addEventListener('input', () => {
      const k = el.dataset.k;
      let v = el.type === 'checkbox' ? el.checked : el.value;
      if (k === 'volume') v = Number(v);
      if (k === 'limit') v = Number(v);
      settings.set(k, v);
    });
  });
  card.querySelectorAll('[data-toy]').forEach((el) => {
    el.addEventListener('change', () => {
      const hidden = new Set(settings.get('hidden'));
      if (el.checked) hidden.delete(el.dataset.toy); else hidden.add(el.dataset.toy);
      settings.set('hidden', [...hidden]);
    });
  });
  card.querySelector('[data-more]').onclick = () => { playtime.reset(); ctx.wake(); card.querySelector('[data-more]').textContent = 'Done: the toys are awake'; };
  card.querySelector('[data-close]').onclick = ctx.close;
}

export function openParent(ctx) {
  if (document.querySelector('.adult')) return;
  const wrap = document.createElement('div');
  wrap.className = 'adult';
  const card = document.createElement('div');
  card.className = 'card';
  wrap.appendChild(card);
  document.body.appendChild(wrap);
  const close = () => { wrap.remove(); ctx.onClose && ctx.onClose(); };
  wrap.addEventListener('pointerdown', (e) => { if (e.target === wrap) close(); });
  gate(card, () => panel(card, { ...ctx, close }), close);
}

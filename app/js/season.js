// Seasonal touches on the shelf: falling snow, petals or leaves, and a
// garland of soft lights in late December.
import { settings } from './settings.js';
import { loop } from './lib.js';

const SOUTH_TZ = /^(Australia|Pacific\/Auckland|Pacific\/Fiji|Indian\/(Antananarivo|Mauritius|Reunion|Comoro|Mayotte)|Africa\/(Johannesburg|Maputo|Harare|Lusaka|Windhoek|Gaborone|Maseru|Mbabane|Blantyre|Lubumbashi|Luanda)|America\/(Argentina|Sao_Paulo|Santiago|Montevideo|Asuncion|La_Paz|Lima|Bahia|Recife|Fortaleza|Belem|Manaus|Cuiaba|Campo_Grande|Porto_Velho)|Antarctica)/;

export function hemisphere() {
  const h = settings.get('hemisphere');
  if (h !== 'auto') return h;
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    return SOUTH_TZ.test(tz) ? 'south' : 'north';
  } catch (e) { return 'north'; }
}

export function currentSeason(date = new Date()) {
  const s = settings.get('season');
  if (s !== 'auto') return s;
  const m = date.getMonth(); // 0..11
  const north = ['winter', 'winter', 'spring', 'spring', 'spring', 'summer', 'summer', 'summer', 'autumn', 'autumn', 'autumn', 'winter'][m];
  if (hemisphere() === 'north') return north;
  return { winter: 'summer', summer: 'winter', spring: 'autumn', autumn: 'spring' }[north];
}

export function festiveLights(date = new Date()) {
  return settings.get('season') !== 'none' && date.getMonth() === 11 && date.getDate() >= 10;
}

// Draws the seasonal particles on a canvas inside `host`. Returns a stop function.
export function startSeason(host, rows) {
  const season = currentSeason();
  rows.forEach((r) => r.classList.toggle('snowy', season === 'winter'));
  let garland = null;
  if (festiveLights()) {
    garland = document.createElement('div');
    garland.className = 'garland';
    const cols = ['#e9b872', '#d98f7a', '#a7c4a0', '#9db6cf', '#e9d8a6'];
    let svg = '<svg viewBox="0 0 1000 70" preserveAspectRatio="none" width="100%" height="100%"><path d="M0 10 Q 125 60 250 14 T 500 14 T 750 14 T 1000 10" fill="none" stroke="#6f5a48" stroke-width="2"/>';
    for (let i = 0; i < 24; i++) {
      const x = 20 + i * 41;
      const y = 14 + Math.abs(Math.sin((x / 250) * Math.PI)) * 28;
      svg += `<circle cx="${x}" cy="${y + 8}" r="7" fill="${cols[i % 5]}" style="animation:twinkle ${3 + (i % 4)}s ease-in-out ${i * 0.3}s infinite"/>`;
    }
    garland.innerHTML = svg + '</svg>';
    host.appendChild(garland);
  }
  if (season === 'none' || season === 'summer') return () => { garland?.remove(); };

  const cv = document.createElement('canvas');
  cv.className = 'season-layer';
  host.appendChild(cv);
  const ctx = cv.getContext('2d');
  const calm = settings.get('calm');
  const N = calm ? 18 : 40;
  const parts = [];
  const colors = {
    winter: ['#ffffff'],
    spring: ['#f3c7c4', '#f6dcd4', '#fbeee6'],
    autumn: ['#d98f5c', '#c97b63', '#d8a650', '#b7834f'],
  }[season];
  function resize() {
    const r = host.getBoundingClientRect();
    cv.width = r.width; cv.height = r.height;
  }
  resize();
  const ro = new ResizeObserver(resize); ro.observe(host);
  for (let i = 0; i < N; i++) {
    parts.push({ x: Math.random(), y: Math.random(), s: 0.5 + Math.random(), p: Math.random() * 6, c: colors[i % colors.length] });
  }
  const stop = loop((dt, t) => {
    const w = cv.width, h = cv.height;
    ctx.clearRect(0, 0, w, h);
    for (const q of parts) {
      q.y += dt * (season === 'winter' ? 0.03 : 0.025) * q.s;
      q.x += dt * 0.01 * Math.sin(t * 0.6 + q.p);
      if (q.y > 1.05) { q.y = -0.05; q.x = Math.random(); }
      const x = q.x * w, y = q.y * h;
      ctx.fillStyle = q.c;
      ctx.globalAlpha = season === 'winter' ? 0.85 : 0.75;
      if (season === 'winter') {
        ctx.beginPath(); ctx.arc(x, y, 2.5 + q.s * 2.5, 0, Math.PI * 2); ctx.fill();
      } else {
        ctx.save(); ctx.translate(x, y); ctx.rotate(t * 0.8 * q.s + q.p);
        ctx.beginPath(); ctx.ellipse(0, 0, 7 * q.s + 3, 3.5 * q.s + 2, 0, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
    }
    ctx.globalAlpha = 1;
  });
  return () => { stop(); ro.disconnect(); cv.remove(); garland?.remove(); rows.forEach((r) => r.classList.remove('snowy')); };
}

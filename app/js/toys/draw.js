// Drawing: a sheet of paper and soft crayons. Several fingers can draw at once.
// The toolbar holds nine muted colours, a rainbow crayon, three sizes, an
// eraser and a new sheet (hold it for a moment; a quick tap only wiggles it).
import { C, replay } from '../lib.js';

const COLORS = ['#4a3f35', '#c97b63', '#d8a650', '#e2c15e', '#93ab8b', '#5e8f8f', '#7898b3', '#9b7c97', '#dca9a0'];
const SIZES = [5, 12, 26];
const HOLD = 800;

export default function draw(root, kit) {
  const { audio, sfx } = kit;

  // ---------- Paper ----------
  const tex = document.createElement('canvas');
  tex.width = tex.height = 160;
  const tc = tex.getContext('2d');
  tc.fillStyle = C.paper;
  tc.fillRect(0, 0, 160, 160);
  for (let i = 0; i < 2600; i++) {
    tc.fillStyle = Math.random() < 0.5 ? 'rgba(143,106,72,.06)' : 'rgba(255,255,255,.35)';
    tc.fillRect(Math.random() * 160, Math.random() * 160, 1 + Math.random() * 2, 1);
  }
  for (let i = 0; i < 30; i++) {
    tc.strokeStyle = 'rgba(143,106,72,.05)';
    tc.beginPath();
    const x = Math.random() * 160, y = Math.random() * 160;
    tc.moveTo(x, y); tc.lineTo(x + Math.random() * 20 - 10, y + Math.random() * 6 - 3);
    tc.stroke();
  }
  root.style.background = `url(${tex.toDataURL()}) repeat, ${C.paper}`;

  // ---------- Drawing surface at full device resolution ----------
  const cv = document.createElement('canvas');
  cv.className = 'stage';
  cv.style.transition = 'opacity .45s ease';
  root.appendChild(cv);
  const ctx = cv.getContext('2d');
  const keep = document.createElement('canvas'); // remembers parts hidden by a smaller window
  keep.width = keep.height = 1;
  let dpr = 1;
  function fit() {
    const r = root.getBoundingClientRect();
    const ndpr = Math.min(2, window.devicePixelRatio || 1);
    const w = Math.max(1, Math.round(r.width * ndpr)), h = Math.max(1, Math.round(r.height * ndpr));
    if (w === cv.width && h === cv.height && ndpr === dpr) return;
    // Merge what is visible into the keeper, then paint it back after resizing.
    const kw = Math.max(keep.width, cv.width, Math.round((w / ndpr) * dpr)), kh = Math.max(keep.height, cv.height, Math.round((h / ndpr) * dpr));
    if (kw !== keep.width || kh !== keep.height) {
      const old = document.createElement('canvas');
      old.width = keep.width; old.height = keep.height;
      old.getContext('2d').drawImage(keep, 0, 0);
      keep.width = kw; keep.height = kh;
      keep.getContext('2d').drawImage(old, 0, 0);
    }
    const kc = keep.getContext('2d');
    kc.clearRect(0, 0, cv.width, cv.height);
    kc.drawImage(cv, 0, 0);
    const scale = ndpr / dpr;
    cv.width = w; cv.height = h;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(keep, 0, 0, keep.width * scale, keep.height * scale);
    if (scale !== 1) {
      keep.width = Math.max(w, Math.round(keep.width * scale)); keep.height = Math.max(h, Math.round(keep.height * scale));
      keep.getContext('2d').drawImage(cv, 0, 0);
    }
    dpr = ndpr;
  }
  fit();
  const ro = new ResizeObserver(fit);
  ro.observe(root);
  kit.add(() => ro.disconnect());

  // ---------- Crayon texture: opaque grains with small holes ----------
  const patterns = new Map();
  function crayon(color) {
    let p = patterns.get(color);
    if (p) return p;
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const x = c.getContext('2d');
    x.fillStyle = color;
    x.fillRect(0, 0, 64, 64);
    const img = x.getImageData(0, 0, 64, 64), d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const r = Math.random();
      if (r < 0.16) d[i + 3] = 0;
      else {
        const k = r < 0.4 ? 0.9 : r > 0.92 ? 1.08 : 1;
        d[i] = Math.min(255, d[i] * k); d[i + 1] = Math.min(255, d[i + 1] * k); d[i + 2] = Math.min(255, d[i + 2] * k);
      }
    }
    x.putImageData(img, 0, 0);
    p = ctx.createPattern(c, 'repeat');
    patterns.set(color, p);
    return p;
  }
  const rainbowColor = (h) => `hsl(${Math.round(h / 12) * 12}, 48%, 64%)`;

  // ---------- Tools ----------
  const tool = { color: COLORS[1], rainbow: false, size: 1, erase: false };
  let hue = 0;

  const pens = new Map();
  let lastSound = 0;
  function pos(e) {
    const r = cv.getBoundingClientRect();
    return { x: (e.clientX - r.left) * dpr, y: (e.clientY - r.top) * dpr };
  }
  function segment(a, b, pen) {
    const w = SIZES[tool.size] * dpr * (tool.erase ? 2.2 : 1);
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = w * (0.9 + Math.random() * 0.15);
    if (pen.erase) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = '#000';
    } else {
      const col = pen.rainbow ? rainbowColor(hue) : pen.color;
      ctx.strokeStyle = crayon(col);
      ctx.globalAlpha = 0.92;
    }
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.quadraticCurveTo(a.x, a.y, (a.x + b.x) / 2, (a.y + b.y) / 2);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
    // A few loose grains along the edge, like wax on paper.
    if (!pen.erase && w > 8) {
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = ctx.strokeStyle;
      for (let i = 0; i < 3; i++) {
        const t = Math.random(), ang = Math.random() * Math.PI * 2, rr = w * 0.5;
        ctx.fillRect(a.x + (b.x - a.x) * t + Math.cos(ang) * rr, a.y + (b.y - a.y) * t + Math.sin(ang) * rr, dpr * 1.5, dpr * 1.5);
      }
    }
    ctx.restore();
    const dist = Math.hypot(b.x - a.x, b.y - a.y);
    if (pen.rainbow) hue = (hue + dist * 0.12) % 360;
    const now = performance.now();
    if (dist > 2 * dpr && now - lastSound > 70) {
      lastSound = now;
      audio.noise({ dur: 0.06, vol: pen.erase ? 0.03 : 0.025, freq: pen.erase ? 1400 : 2600, q: 0.8 });
    }
  }
  kit.on(cv, 'pointerdown', (e) => {
    if (e.button > 0) return;
    e.preventDefault();
    try { cv.setPointerCapture(e.pointerId); } catch (err) {}
    const p = pos(e);
    const pen = { last: p, color: tool.color, rainbow: tool.rainbow, erase: tool.erase };
    pens.set(e.pointerId, pen);
    segment(p, { x: p.x + 0.1, y: p.y + 0.1 }, pen);
  });
  kit.on(cv, 'pointermove', (e) => {
    const pen = pens.get(e.pointerId);
    if (!pen) return;
    const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
    for (const ev of (evs.length ? evs : [e])) {
      const p = pos(ev);
      if (Math.hypot(p.x - pen.last.x, p.y - pen.last.y) < 1.5) continue;
      segment(pen.last, p, pen);
      pen.last = p;
    }
  });
  const end = (e) => pens.delete(e.pointerId);
  kit.on(cv, 'pointerup', end);
  kit.on(cv, 'pointercancel', end);

  // ---------- Toolbar ----------
  const bar = document.createElement('div');
  bar.className = 'draw-bar';
  root.appendChild(bar);
  const ink = '#4a3f35';
  const icon = (inner) => `<svg viewBox="0 0 60 60" aria-hidden="true">${inner}</svg>`;
  const all = [];
  function button(cls, html, label, onTap) {
    const b = document.createElement('button');
    b.className = cls;
    b.innerHTML = html;
    b.setAttribute('aria-label', label);
    b.addEventListener('pointerdown', (e) => { e.preventDefault(); onTap(b, e); });
    bar.appendChild(b);
    all.push(b);
    return b;
  }
  const sep = () => { const d = document.createElement('div'); d.className = 'sep'; bar.appendChild(d); };
  const swatches = [];
  function selectColor(b) { [...swatches, rainbowBtn, eraserBtn].forEach((x) => x.classList.remove('on')); b.classList.add('on'); }
  COLORS.forEach((col, i) => {
    const b = button('sw', '', 'colour', (el) => {
      tool.color = col; tool.rainbow = false; tool.erase = false; selectColor(el);
      audio.tone(392 + i * 49, { dur: 0.15, vol: 0.06, type: 'triangle' });
    });
    b.style.background = col;
    swatches.push(b);
  });
  const rainbowBtn = button('ico', icon(`
    <path d="M10 44 A20 20 0 0 1 50 44" fill="none" stroke="#c97b63" stroke-width="6" stroke-linecap="round"/>
    <path d="M17 44 A13 13 0 0 1 43 44" fill="none" stroke="#d8a650" stroke-width="6" stroke-linecap="round"/>
    <path d="M24 44 A6 6 0 0 1 36 44" fill="none" stroke="#5e8f8f" stroke-width="6" stroke-linecap="round"/>
    <circle cx="30" cy="44" r="2" fill="#9b7c97"/>`), 'rainbow', (el) => {
    tool.rainbow = true; tool.erase = false; selectColor(el);
    [523, 659, 784].forEach((f, k) => audio.tone(f, { dur: 0.2, vol: 0.05, at: audio.now() + k * 0.06 }));
  });
  sep();
  const sizeBtns = SIZES.map((sz, i) => button('ico', icon(`<circle cx="30" cy="30" r="${[5, 9, 15][i]}" fill="${ink}"/>`), 'size', (el) => {
    tool.size = i; sizeBtns.forEach((x) => x.classList.remove('on')); el.classList.add('on');
    sfx.tick(1);
  }));
  sep();
  const eraserBtn = button('ico', icon(`
    <g transform="rotate(-35 30 30)"><rect x="14" y="20" width="32" height="20" rx="5" fill="#dca9a0" stroke="${ink}" stroke-width="3"/>
    <rect x="14" y="20" width="12" height="20" rx="4" fill="#fbf7ef" stroke="${ink}" stroke-width="3"/></g>`), 'eraser', (el) => {
    tool.erase = true; tool.rainbow = false; selectColor(el);
    sfx.squeak(0.8);
  });
  sep();
  // New sheet: needs a hold. A ring fills while holding.
  const R = 24, LEN = 2 * Math.PI * R;
  const newBtn = button('ico', icon(`
    <circle cx="30" cy="30" r="${R}" fill="none" stroke="rgba(74,63,53,.12)" stroke-width="5"/>
    <circle class="hold" cx="30" cy="30" r="${R}" fill="none" stroke="#c97b63" stroke-width="5" stroke-linecap="round"
      stroke-dasharray="${LEN}" stroke-dashoffset="${LEN}" transform="rotate(-90 30 30)"/>
    <g class="sheet"><path d="M20 16 h14 l8 8 v22 h-22 z" fill="#fbf7ef" stroke="${ink}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M34 16 v8 h8" fill="none" stroke="${ink}" stroke-width="3" stroke-linejoin="round"/></g>`), 'new page', () => {});
  const ring = newBtn.querySelector('.hold');
  const sheet = newBtn.querySelector('.sheet');
  sheet.classList.add('fb');
  let holdStart = 0, holdId = null;
  newBtn.addEventListener('pointerdown', (e) => {
    holdStart = performance.now(); holdId = e.pointerId;
    try { newBtn.setPointerCapture(e.pointerId); } catch (err) {}
  });
  const release = (e) => {
    if (holdId !== e.pointerId) return;
    holdId = null;
    if (holdStart) { replay(sheet, 'wiggle'); sfx.boing(1.2); }
    holdStart = 0;
    ring.setAttribute('stroke-dashoffset', LEN);
  };
  newBtn.addEventListener('pointerup', release);
  newBtn.addEventListener('pointercancel', release);
  kit.loop(() => {
    if (!holdStart) return;
    const k = Math.min(1, (performance.now() - holdStart) / HOLD);
    ring.setAttribute('stroke-dashoffset', (LEN * (1 - k)).toFixed(1));
    if (k >= 1) {
      holdStart = 0;
      sfx.paper();
      cv.style.opacity = 0;
      kit.after(460, () => {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, cv.width, cv.height);
        keep.getContext('2d').clearRect(0, 0, keep.width, keep.height);
        cv.style.opacity = 1;
        ring.setAttribute('stroke-dashoffset', LEN);
        sfx.chime(784, 0.4);
      });
    }
  });

  selectColor(swatches[1]);
  sizeBtns[1].classList.add('on');
}

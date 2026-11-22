// Shared drawing, input and timing helpers.
export const NS = 'http://www.w3.org/2000/svg';
export const W = 1600, H = 900;

// Muted, warm palette used everywhere.
export const C = {
  paper: '#f4ecdc', cream: '#efe3cc', sand: '#e3cfae', wood: '#c9a073', woodL: '#dcbb8e', woodD: '#8f6a48',
  ink: '#4a3f35', terra: '#c97b63', ochre: '#d8a650', sage: '#93ab8b', moss: '#6f8f6a', teal: '#5e8f8f',
  sky: '#b7cfd6', blue: '#7898b3', plum: '#9b7c97', rose: '#dca9a0', cocoa: '#7a5a44', night: '#3d4a5c',
  white: '#fbf7ef', stone: '#a9a39a', leaf: '#86a36f',
};

export const rand = (a, b) => a + Math.random() * (b - a);
export const pick = (a) => a[Math.floor(Math.random() * a.length)];
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

// Seeded random generator (mulberry32).
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function mixHex(a, b, t) {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const r = Math.round(lerp(pa >> 16, pb >> 16, t));
  const g = Math.round(lerp((pa >> 8) & 255, (pb >> 8) & 255, t));
  const bl = Math.round(lerp(pa & 255, pb & 255, t));
  return '#' + ((1 << 24) | (r << 16) | (g << 8) | bl).toString(16).slice(1);
}

// Create an SVG element.
export function s(tag, attrs, parent) {
  const e = document.createElementNS(NS, tag);
  if (attrs) for (const k in attrs) {
    if (k === 'text') e.textContent = attrs[k];
    else if (attrs[k] !== undefined && attrs[k] !== null) e.setAttribute(k, attrs[k]);
  }
  if (parent) parent.appendChild(e);
  return e;
}

export function place(el, x, y, extra = '') {
  el.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})${extra ? ' ' + extra : ''}`);
}

// An SVG stage with a fixed 1600x900 world, letterboxed to fit.
export function makeStage(root, bg) {
  root.style.background = bg;
  const svg = s('svg', { viewBox: `0 0 ${W} ${H}`, preserveAspectRatio: 'xMidYMid meet', class: 'stage' });
  root.appendChild(svg);
  const d = s('defs', null, svg);
  d.innerHTML = `
    <filter id="wob" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="2" seed="7"/><feDisplacementMap in="SourceGraphic" scale="6"/></filter>
    <filter id="soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="6"/></filter>
    <filter id="glow" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="16"/></filter>`;
  svg.defs = d;
  return svg;
}

// Pointer position in SVG world coordinates.
export function pt(svg, e) {
  const p = svg.createSVGPoint();
  p.x = e.clientX; p.y = e.clientY;
  return p.matrixTransform(svg.getScreenCTM().inverse());
}

// Drag/tap handling on an element. Listens on window so re-parenting during a
// drag never loses the pointer. Handlers: down(p,e) -> false to ignore,
// move(p,e,p0), up(p,e,moved), tap(p,e).
export function drag(el, svg, h) {
  el.addEventListener('pointerdown', (e) => {
    if (e.button > 0) return;
    const p0 = pt(svg, e);
    if (h.down && h.down(p0, e) === false) return;
    e.stopPropagation();
    e.preventDefault();
    const id = e.pointerId;
    let moved = !!h.startMoved;
    const mv = (ev) => {
      if (ev.pointerId !== id) return;
      const p = pt(svg, ev);
      if (!moved && Math.hypot(p.x - p0.x, p.y - p0.y) > 10) moved = true;
      if (moved && h.move) h.move(p, ev, p0);
    };
    const up = (ev) => {
      if (ev.pointerId !== id) return;
      window.removeEventListener('pointermove', mv);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      const p = pt(svg, ev);
      if (h.up) h.up(p, ev, moved);
      if (!moved && h.tap) h.tap(p, ev);
    };
    window.addEventListener('pointermove', mv);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
  });
}

// Run fn(dt, t) every animation frame until the returned stop() is called.
export function loop(fn) {
  let run = true, last = performance.now();
  function f(t) {
    if (!run) return;
    const dt = Math.min(0.05, (t - last) / 1000);
    last = t;
    fn(dt, t / 1000);
    requestAnimationFrame(f);
  }
  requestAnimationFrame(f);
  return () => { run = false; };
}

// A canvas stage with the same 1600x900 world, letterboxed.
export function makeCanvas(root, bg) {
  root.style.background = bg;
  const cv = document.createElement('canvas');
  cv.className = 'stage';
  root.appendChild(cv);
  const ctx = cv.getContext('2d');
  const st = { cv, ctx, scale: 1, ox: 0, oy: 0, dpr: 1, cw: 1, ch: 1 };
  function fit() {
    const r = root.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = Math.max(1, Math.round(r.width * dpr));
    cv.height = Math.max(1, Math.round(r.height * dpr));
    st.dpr = dpr; st.cw = r.width; st.ch = r.height;
    st.scale = Math.min(r.width / W, r.height / H);
    st.ox = (r.width - W * st.scale) / 2;
    st.oy = (r.height - H * st.scale) / 2;
  }
  fit();
  const ro = new ResizeObserver(fit);
  ro.observe(root);
  st.begin = (fill = bg) => {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = fill;
    ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.setTransform(st.dpr * st.scale, 0, 0, st.dpr * st.scale, st.dpr * st.ox, st.dpr * st.oy);
  };
  st.toWorld = (e) => {
    const r = cv.getBoundingClientRect();
    return { x: (e.clientX - r.left - st.ox) / st.scale, y: (e.clientY - r.top - st.oy) / st.scale };
  };
  st.destroy = () => ro.disconnect();
  return st;
}

export function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// Re-trigger a CSS animation class on an element.
export function replay(el, cls) {
  el.classList.remove(cls);
  void el.getBoundingClientRect();
  el.classList.add(cls);
}

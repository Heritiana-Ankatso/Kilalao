// Marble Machine: drop marbles from the jar (or tap the air), move and turn
// wooden pieces, drag new pieces from the tray, put pieces back to remove them.
import { makeCanvas, C, rand, pick, clamp, roundRect } from '../lib.js';

export default function marble(root, kit) {
  const { sfx } = kit;
  const st = makeCanvas(root, '#e9dcc3');
  const ctx = st.ctx;
  const FLOOR = 862, MR = 15, HT = 8, G = 1500, TRAY_X = 1478, MAXM = kit.calm ? 30 : 60;
  const MCOL = ['#c97b63', '#5e8f8f', '#d8a650', '#7898b3', '#9b7c97', '#93ab8b', '#e3b6a6'];
  const DEF = {
    ramp: { segs: [[-140, 0, 140, 0]], color: '#c9a073' },
    short: { segs: [[-85, 0, 85, 0]], color: '#d9b483' },
    funnel: { segs: [[-120, -70, -26, 30], [120, -70, 26, 30], [-26, 30, -26, 70], [26, 30, 26, 70]], color: C.teal },
    tube: { segs: [[-28, -110, -28, 110], [28, -110, 28, 110]], color: C.blue },
    flip: { segs: [[-75, 0, 75, 0]], color: C.terra },
    bell: { circle: 34, color: C.ochre },
  };
  const TRAY = ['ramp', 'short', 'funnel', 'tube', 'flip', 'bell'];
  const BELLS = [523, 587, 659, 784, 880, 1046];
  const pieces = [];
  function add(type, x, y, a = 0, f) {
    const p = { type, x, y, a, ring: 0, cool: 0, f: f || pick(BELLS), wig: 0 };
    if (type === 'flip') { p.state = 1; p.a = 0.45; p.target = 0.45; }
    pieces.push(p);
    return p;
  }
  add('ramp', 360, 230, 0.25); add('ramp', 560, 370, -0.25); add('ramp', 520, 500, 0.22);
  add('funnel', 760, 640); add('bell', 760, 790, 0, 659);
  add('flip', 1060, 560); add('ramp', 1250, 420, -0.3); add('bell', 1000, 760, 0, 880);
  add('tube', 1330, 690, 0.25); add('short', 1080, 300, 0.2);

  const marbles = [];
  const JAR = { x: 250, y: 70 };
  function dropMarble(x, y) {
    if (marbles.length >= MAXM) marbles.shift();
    marbles.push({ x, y, vx: rand(-10, 10), vy: 0, c: pick(MCOL), cool: 0, still: 0, a: 1 });
  }

  function segsOf(p) {
    const d = DEF[p.type];
    if (!d.segs) return [];
    const c = Math.cos(p.a), s = Math.sin(p.a);
    return d.segs.map(([x1, y1, x2, y2]) => [p.x + x1 * c - y1 * s, p.y + x1 * s + y1 * c, p.x + x2 * c - y2 * s, p.y + x2 * s + y2 * c]);
  }
  function closest(px, py, [x1, y1, x2, y2]) {
    const dx = x2 - x1, dy = y2 - y1;
    const t = clamp(((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy || 1), 0, 1);
    return [x1 + dx * t, y1 + dy * t];
  }

  function step(dt) {
    for (const p of pieces) {
      p.cool = Math.max(0, p.cool - dt);
      p.ring = Math.max(0, p.ring - dt);
      p.wig = Math.max(0, p.wig - dt);
      if (p.type === 'flip') p.a += (p.target - p.a) * Math.min(1, dt * 14);
    }
    const segCache = pieces.map(segsOf);
    for (const m of marbles) {
      m.cool = Math.max(0, m.cool - dt);
      m.vy += G * dt;
      m.x += m.vx * dt; m.y += m.vy * dt;
      pieces.forEach((p, pi) => {
        if (p.type === 'bell') {
          const dx = m.x - p.x, dy = m.y - p.y, d = Math.hypot(dx, dy), R = MR + 34;
          if (d < R && d > 0) {
            const nx = dx / d, ny = dy / d;
            m.x = p.x + nx * R; m.y = p.y + ny * R;
            const vn = m.vx * nx + m.vy * ny;
            if (vn < 0) {
              m.vx -= 1.6 * vn * nx; m.vy -= 1.6 * vn * ny;
              if (-vn > 90 && p.ring < 0.6) { sfx.bell(p.f, clamp(-vn / 700, 0.3, 1)); p.ring = 0.9; }
            }
          }
          return;
        }
        for (const sg of segCache[pi]) {
          const [qx, qy] = closest(m.x, m.y, sg);
          const dx = m.x - qx, dy = m.y - qy, d = Math.hypot(dx, dy), R = MR + HT;
          if (d < R && d > 0) {
            const nx = dx / d, ny = dy / d;
            m.x = qx + nx * R; m.y = qy + ny * R;
            const vn = m.vx * nx + m.vy * ny;
            if (vn < 0) {
              m.vx -= 1.25 * vn * nx; m.vy -= 1.25 * vn * ny;
              m.vx *= 1 - 0.25 * dt; m.vy *= 1 - 0.25 * dt;
              if (-vn > 220 && m.cool <= 0) { sfx.clack(0.8 + Math.random() * 0.4, clamp(-vn / 900, 0.15, 0.7)); m.cool = 0.08; }
              if (p.type === 'flip' && p.cool <= 0) {
                p.state = -p.state; p.target = 0.45 * p.state; p.cool = 0.7; sfx.click();
              }
            }
          }
        }
      });
      if (m.x < MR) { m.x = MR; m.vx = Math.abs(m.vx) * 0.5; }
      if (m.x > TRAY_X - MR) { m.x = TRAY_X - MR; m.vx = -Math.abs(m.vx) * 0.5; }
      if (m.y > FLOOR - MR) {
        m.y = FLOOR - MR;
        if (m.vy > 260) sfx.thud(1.6, clamp(m.vy / 1600, 0.1, 0.4));
        m.vy = m.vy > 120 ? -m.vy * 0.3 : 0;
        m.vx *= Math.exp(-1.2 * dt);
      }
      const sp = Math.hypot(m.vx, m.vy);
      if (sp > 1600) { m.vx *= 1600 / sp; m.vy *= 1600 / sp; }
      m.still = sp < 40 ? m.still + dt : 0;
      if (m.still > 4) m.a -= dt;
    }
    // Marble-marble contacts
    for (let i = 0; i < marbles.length; i++) {
      for (let j = i + 1; j < marbles.length; j++) {
        const a = marbles[i], b = marbles[j];
        const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy);
        if (d > 0 && d < MR * 2) {
          const nx = dx / d, ny = dy / d, o = (MR * 2 - d) / 2;
          a.x -= nx * o; a.y -= ny * o; b.x += nx * o; b.y += ny * o;
          const rv = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
          if (rv < 0) {
            const imp = -rv * 0.9;
            a.vx -= imp * nx * 0.5; a.vy -= imp * ny * 0.5; b.vx += imp * nx * 0.5; b.vy += imp * ny * 0.5;
            if (imp > 200 && a.cool <= 0) { sfx.clack(2.2, 0.35); a.cool = 0.1; }
          }
        }
      }
    }
    for (let i = marbles.length - 1; i >= 0; i--) if (marbles[i].a <= 0) marbles.splice(i, 1);
  }

  // ---------- Drawing ----------
  function drawPiece(p, scale = 1) {
    const d = DEF[p.type];
    ctx.save();
    if (p.type === 'bell') {
      const sw = p.ring > 0 ? Math.sin(p.ring * 30) * 0.15 * p.ring : 0;
      ctx.translate(p.x, p.y); ctx.scale(scale, scale); ctx.rotate(sw);
      ctx.fillStyle = '#5a4a40'; ctx.fillRect(-4, -52, 8, 18);
      ctx.beginPath(); ctx.arc(0, 0, 34, 0, Math.PI * 2);
      ctx.fillStyle = ['#e7c46d', '#d8a650', '#cf9a4a', '#c98f44', '#bd8540', '#b07a3c'][BELLS.indexOf(p.f) % 6];
      ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = C.ink; ctx.stroke();
      ctx.beginPath(); ctx.arc(-10, -10, 9, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255,255,255,.4)'; ctx.fill();
      ctx.restore();
      return;
    }
    const c = Math.cos(p.a), s = Math.sin(p.a);
    const wob = p.wig > 0 ? Math.sin(p.wig * 40) * 3 : 0;
    ctx.translate(p.x + wob, p.y); ctx.scale(scale, scale);
    if (p.type === 'tube') {
      ctx.save(); ctx.rotate(p.a);
      ctx.fillStyle = 'rgba(183,207,214,.45)';
      ctx.fillRect(-28, -110, 56, 220);
      ctx.restore();
    }
    ctx.lineCap = 'round';
    for (const [x1, y1, x2, y2] of d.segs) {
      const ax = x1 * c - y1 * s, ay = x1 * s + y1 * c, bx = x2 * c - y2 * s, by = x2 * s + y2 * c;
      ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by);
      ctx.lineWidth = HT * 2 + 6; ctx.strokeStyle = C.ink; ctx.stroke();
      ctx.lineWidth = HT * 2; ctx.strokeStyle = d.color; ctx.stroke();
      ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,255,255,.35)';
      ctx.beginPath(); ctx.moveTo(ax, ay - 4); ctx.lineTo(bx, by - 4); ctx.stroke();
    }
    if (p.type === 'flip') {
      ctx.beginPath(); ctx.arc(0, 0, 12, 0, Math.PI * 2); ctx.fillStyle = C.cream; ctx.fill();
      ctx.lineWidth = 4; ctx.strokeStyle = C.ink; ctx.stroke();
    }
    ctx.restore();
  }
  function drawJar() {
    const { x, y } = JAR;
    ctx.save(); ctx.translate(x, y);
    roundRect(ctx, -60, -40, 120, 90, 22);
    ctx.fillStyle = 'rgba(200,222,228,.7)'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = C.ink; ctx.stroke();
    for (let i = 0; i < 9; i++) {
      ctx.beginPath(); ctx.arc(-38 + (i % 5) * 19, 30 - Math.floor(i / 5) * 18, 9, 0, Math.PI * 2);
      ctx.fillStyle = MCOL[i % MCOL.length]; ctx.fill();
    }
    ctx.fillStyle = C.wood; roundRect(ctx, -68, -54, 136, 20, 8); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-14, 50); ctx.lineTo(-14, 64); ctx.lineTo(14, 64); ctx.lineTo(14, 50); ctx.stroke();
    ctx.restore();
  }
  function draw(t) {
    st.begin();
    // Pegboard wall
    ctx.fillStyle = 'rgba(143,106,72,.12)';
    for (let y = 30; y < FLOOR; y += 50) for (let x = 25; x < TRAY_X; x += 50) { ctx.beginPath(); ctx.arc(x, y, 3.5, 0, Math.PI * 2); ctx.fill(); }
    // Floor trough
    ctx.fillStyle = '#c9a073'; ctx.fillRect(-400, FLOOR, 2400, 400);
    ctx.fillStyle = 'rgba(0,0,0,.08)'; ctx.fillRect(-400, FLOOR, 2400, 8);
    // Tray
    ctx.fillStyle = '#d9c6a3'; ctx.fillRect(TRAY_X, -400, 1000, 1800);
    ctx.strokeStyle = 'rgba(74,63,53,.25)'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(TRAY_X, 0); ctx.lineTo(TRAY_X, 900); ctx.stroke();
    TRAY.forEach((type, i) => {
      const y = 140 + i * 125;
      ctx.fillStyle = 'rgba(255,255,255,.35)'; roundRect(ctx, TRAY_X + 12, y - 52, 96, 104, 16); ctx.fill();
      drawPiece({ type, x: TRAY_X + 60, y, a: type === 'tube' ? 0 : type === 'flip' ? 0.35 : 0, ring: 0, f: 659 }, type === 'tube' ? 0.4 : type === 'funnel' ? 0.38 : type === 'bell' ? 0.8 : 0.3);
    });
    drawJar();
    for (const p of pieces) drawPiece(p);
    for (const m of marbles) {
      ctx.globalAlpha = clamp(m.a, 0, 1);
      ctx.beginPath(); ctx.arc(m.x, m.y, MR, 0, Math.PI * 2);
      ctx.fillStyle = m.c; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke();
      ctx.beginPath(); ctx.arc(m.x - 5, m.y - 5, 5, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // ---------- Input ----------
  const pointers = new Map();
  function hitPiece(w) {
    for (let i = pieces.length - 1; i >= 0; i--) {
      const p = pieces[i];
      if (p.type === 'bell') { if (Math.hypot(w.x - p.x, w.y - p.y) < 48) return p; continue; }
      for (const sg of segsOf(p)) {
        const [qx, qy] = closest(w.x, w.y, sg);
        if (Math.hypot(w.x - qx, w.y - qy) < 32) return p;
      }
      if (p.type === 'funnel' && Math.abs(w.x - p.x) < 90 && w.y > p.y - 70 && w.y < p.y + 40) return p;
      if (p.type === 'tube') {
        const c = Math.cos(-p.a), s = Math.sin(-p.a), lx = (w.x - p.x) * c - (w.y - p.y) * s, ly = (w.x - p.x) * s + (w.y - p.y) * c;
        if (Math.abs(lx) < 32 && Math.abs(ly) < 112) return p;
      }
    }
    return null;
  }
  kit.on(st.cv, 'pointerdown', (e) => {
    e.preventDefault();
    const w = st.toWorld(e);
    const info = { start: w, moved: false, piece: null, off: { x: 0, y: 0 }, fresh: false, timer: 0 };
    if (w.x > TRAY_X) {
      const i = Math.round((w.y - 140) / 125);
      if (i >= 0 && i < TRAY.length) {
        const p = add(TRAY[i], w.x - 60, w.y);
        info.piece = p; info.moved = true; info.fresh = true;
        sfx.pop(0.8);
      }
    } else {
      const p = hitPiece(w);
      if (p) { info.piece = p; info.off = { x: p.x - w.x, y: p.y - w.y }; pieces.splice(pieces.indexOf(p), 1); pieces.push(p); }
      else if (Math.abs(w.x - JAR.x) < 75 && Math.abs(w.y - JAR.y) < 70) { dropMarble(JAR.x + rand(-6, 6), JAR.y + 80); sfx.clack(2, 0.4); }
      else {
        dropMarble(w.x, w.y);
        info.stream = kit.every(280, () => { const q = info.last || w; if (q.x < TRAY_X - 20) dropMarble(q.x + rand(-4, 4), q.y); });
      }
    }
    pointers.set(e.pointerId, info);
  });
  kit.on(window, 'pointermove', (e) => {
    const info = pointers.get(e.pointerId);
    if (!info) return;
    const w = st.toWorld(e);
    info.last = w;
    if (!info.moved && Math.hypot(w.x - info.start.x, w.y - info.start.y) > 10) info.moved = true;
    if (info.piece && info.moved) {
      info.piece.x = clamp(w.x + info.off.x, 20, 1580);
      info.piece.y = clamp(w.y + info.off.y, 20, FLOOR - 10);
    }
  });
  const end = (e) => {
    const info = pointers.get(e.pointerId);
    if (!info) return;
    pointers.delete(e.pointerId);
    if (info.stream) clearInterval(info.stream);
    const p = info.piece;
    if (!p) return;
    if (info.moved) {
      if (p.x > TRAY_X - 10) { pieces.splice(pieces.indexOf(p), 1); sfx.pop(0.6); }
      else sfx.clack(1, 0.5);
      return;
    }
    // Tap on a piece
    if (p.type === 'ramp' || p.type === 'short' || p.type === 'tube') {
      p.a += 0.26; if (p.a > 1.32) p.a = -1.3; sfx.clack(1.1, 0.6);
    } else if (p.type === 'flip') { p.state = -p.state; p.target = 0.45 * p.state; sfx.click(); }
    else if (p.type === 'bell') { p.f = BELLS[(BELLS.indexOf(p.f) + 1) % BELLS.length]; p.ring = 0.9; sfx.bell(p.f); }
    else { p.wig = 0.4; sfx.clack(0.8, 0.5); }
  };
  kit.on(window, 'pointerup', end);
  kit.on(window, 'pointercancel', end);

  // Start with a few marbles rolling.
  [0, 700, 1400].forEach((d) => kit.after(600 + d, () => dropMarble(JAR.x, JAR.y + 80)));

  kit.loop((dt, t) => {
    const n = 4;
    for (let i = 0; i < n; i++) step(dt / n);
    draw(t);
  });
  kit.add(() => st.destroy());
}

// Blocks: drag wooden blocks out of the tray, stack them, knock towers over
// with a quick swipe or a thrown block. Put a block back in the tray to tidy.
import { makeCanvas, C, rand, pick, clamp, roundRect } from '../lib.js';

export default function blocks(root, kit) {
  const { sfx } = kit;
  const st = makeCanvas(root, '#efe3cc');
  const ctx = st.ctx;
  const FLOOR = 830, G = 1800, TRAY_W = 190, MAX = 80;
  const Q = Math.PI / 2;
  const TYPES = [
    { w: 80, h: 80, s: 'rect' }, { w: 160, h: 40, s: 'rect' }, { w: 40, h: 160, s: 'rect' }, { w: 240, h: 40, s: 'rect' },
    { w: 80, h: 80, s: 'tri' }, { w: 160, h: 80, s: 'arch' }, { w: 60, h: 120, s: 'cyl' }, { w: 80, h: 40, s: 'dome' },
  ];
  const WOODS = ['#e1c29a', '#d9b483', '#c9a073', '#e7cfa8'];
  const PAINT = [C.terra, C.teal, C.ochre, C.sage, C.blue, C.plum];
  const list = [];

  function make(ti, x, y) {
    const T = TYPES[ti];
    const b = { ti, bw: T.w, bh: T.h, w: T.w, h: T.h, s: T.s, q: 0, x, y, vx: 0, vy: 0, a: 0, av: 0, mode: 'fall',
      c: Math.random() < 0.55 ? pick(WOODS) : pick(PAINT), grain: [rand(0.2, 0.8), rand(0.2, 0.8)] };
    if (list.length >= MAX) list.shift();
    list.push(b);
    return b;
  }
  const setQ = (b, q) => { b.q = ((q % 4) + 4) % 4; const odd = b.q % 2 === 1; b.w = odd ? b.bh : b.bw; b.h = odd ? b.bw : b.bh; };
  const ox = (a, b) => Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
  const oy = (a, b) => Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
  const solid = (o) => o.mode === 'rest' || o.mode === 'fall';

  // A little starting tower.
  [[0, 500], [0, 580], [1, 540], [4, 580]].forEach(([ti, x], i) => {
    const b = make(ti, x, FLOOR - 80 - i * 90);
  });
  const arch = make(5, 860, 400); arch.c = '#d9b483';
  const pillar1 = make(2, 900, 200); const pillar2 = make(2, 1100, 200);

  function placeAbove(b) {
    for (let k = 0; k < 12; k++) {
      let hit = null;
      for (const o of list) if (o !== b && solid(o) && ox(b, o) > 4 && oy(b, o) > 2) { if (!hit || o.y < hit.y) hit = o; }
      if (!hit) break;
      b.y = hit.y - b.h;
    }
    if (b.y + b.h > FLOOR) b.y = FLOOR - b.h;
  }

  function knock(o, vx, depth = 0) {
    if (o.mode === 'tumble' || o.mode === 'drag' || depth > 12) return;
    const above = list.filter((q) => q !== o && solid(q) && Math.abs(q.y + q.h - o.y) < 3 && ox(q, o) > 4);
    o.mode = 'tumble';
    o.vx = vx + rand(-50, 50); o.vy = rand(-160, -30); o.av = Math.sign(vx || 1) * rand(1.5, 4);
    above.forEach((q) => kit.after(50, () => knock(q, vx * 0.85, depth + 1)));
  }

  function settle(b) {
    const k = Math.round(b.a / Q);
    const cx = b.x + b.w / 2;
    setQ(b, b.q + k);
    b.a = 0; b.av = 0; b.vx = 0; b.vy = 0;
    b.x = clamp(cx - b.w / 2, TRAY_W, 1600 - b.w);
    b.y = FLOOR - b.h;
    placeAbove(b);
    b.mode = 'fall';
  }

  function update(dt) {
    const order = list.filter((b) => b.mode === 'fall' || b.mode === 'rest').sort((a, b) => b.y + b.h - (a.y + a.h));
    for (const b of order) {
      b.vy += G * dt;
      const ny = b.y + b.vy * dt;
      let landY = FLOOR - b.h, land = ny + b.h >= FLOOR;
      for (const o of list) {
        if (o === b || !solid(o) || ox(b, o) <= 4) continue;
        if (b.y + b.h <= o.y + 2 && ny + b.h >= o.y) {
          if (o.y - b.h < landY) landY = o.y - b.h;
          land = true;
        }
      }
      if (land && ny >= landY) {
        if (b.vy > 260) sfx.clack(clamp(90 / Math.sqrt(b.bw * b.bh) * 1.1, 0.6, 1.6), clamp(b.vy / 1100, 0.2, 0.9));
        b.y = landY; b.vy = 0; b.mode = 'rest';
      } else { b.y = ny; b.mode = 'fall'; }
    }
    // Balance: a block whose middle is not over anything tips over.
    for (const b of list) {
      if (b.mode !== 'rest' || b.y + b.h >= FLOOR - 1) continue;
      let lo = Infinity, hi = -Infinity;
      for (const o of list) {
        if (o === b || !solid(o) || Math.abs(o.y - (b.y + b.h)) > 2 || ox(b, o) <= 4) continue;
        lo = Math.min(lo, Math.max(o.x, b.x)); hi = Math.max(hi, Math.min(o.x + o.w, b.x + b.w));
      }
      const cx = b.x + b.w / 2;
      if (lo === Infinity) { b.mode = 'fall'; continue; }
      if (cx < lo - 3 || cx > hi + 3) {
        const dir = cx < lo ? -1 : 1;
        b.mode = 'tumble'; b.vx = dir * 90; b.vy = -20; b.av = dir * 2.6;
      }
    }
    for (const b of list) {
      if (b.mode !== 'tumble') continue;
      b.vy += G * dt; b.x += b.vx * dt; b.y += b.vy * dt; b.a += b.av * dt;
      const c = Math.abs(Math.cos(b.a)), s = Math.abs(Math.sin(b.a));
      const hw = (b.w * c + b.h * s) / 2, hh = (b.w * s + b.h * c) / 2;
      const cx = b.x + b.w / 2, cy = b.y + b.h / 2;
      if (cy + hh > FLOOR) {
        b.y -= cy + hh - FLOOR;
        if (b.vy > 200) sfx.clack(0.9, clamp(b.vy / 1400, 0.15, 0.7));
        b.vy = -Math.abs(b.vy) * 0.28; b.vx *= 0.65; b.av *= 0.55;
        const target = Math.round(b.a / Q) * Q;
        b.av += (target - b.a) * 6;
        if (Math.abs(b.vy) < 90 && Math.abs(b.vx) < 50) settle(b);
      }
      if (cx - hw < TRAY_W) { b.x += TRAY_W - (cx - hw); b.vx = Math.abs(b.vx) * 0.5; }
      if (cx + hw > 1600) { b.x -= cx + hw - 1600; b.vx = -Math.abs(b.vx) * 0.5; }
      const sp = Math.hypot(b.vx, b.vy);
      if (sp > 160 && b.mode === 'tumble') {
        const box = { x: cx - hw, y: cy - hh, w: hw * 2, h: hh * 2 };
        for (const o of list) {
          if (o === b || !solid(o)) continue;
          if (ox(box, o) > 6 && oy(box, o) > 6) { knock(o, b.vx * 0.6); b.vx *= 0.75; }
        }
      }
    }
  }

  // ---------- Drawing ----------
  function shape(b, w, h) {
    ctx.beginPath();
    if (b.s === 'tri') { ctx.moveTo(-w / 2, h / 2); ctx.lineTo(0, -h / 2); ctx.lineTo(w / 2, h / 2); ctx.closePath(); }
    else if (b.s === 'arch') {
      ctx.moveTo(-w / 2, h / 2); ctx.lineTo(-w / 2, -h / 2); ctx.lineTo(w / 2, -h / 2); ctx.lineTo(w / 2, h / 2);
      ctx.lineTo(w * 0.28, h / 2); ctx.arc(0, h / 2, w * 0.28, 0, Math.PI, true); ctx.closePath();
    } else if (b.s === 'dome') { ctx.moveTo(-w / 2, h / 2); ctx.ellipse(0, h / 2, w / 2, h, 0, Math.PI, 0); ctx.closePath(); }
    else if (b.s === 'cyl') roundRect(ctx, -w / 2, -h / 2, w, h, w * 0.3);
    else roundRect(ctx, -w / 2, -h / 2, w, h, 6);
  }
  function drawBlock(b, x, y, angle, scale = 1) {
    ctx.save();
    ctx.translate(x, y); ctx.rotate(angle); ctx.scale(scale, scale);
    const w = b.bw, h = b.bh;
    shape(b, w, h);
    ctx.fillStyle = b.c; ctx.fill();
    ctx.save(); ctx.clip();
    ctx.strokeStyle = 'rgba(120,80,40,.18)'; ctx.lineWidth = 2;
    for (const g of b.grain) {
      ctx.beginPath(); ctx.moveTo(-w / 2, -h / 2 + h * g);
      ctx.bezierCurveTo(-w / 6, -h / 2 + h * g - 6, w / 6, -h / 2 + h * g + 6, w / 2, -h / 2 + h * g); ctx.stroke();
    }
    ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.fillRect(-w / 2, -h / 2, w, 6);
    if (b.s === 'cyl') { ctx.fillStyle = 'rgba(255,255,255,.2)'; ctx.fillRect(-w / 2 + 8, -h / 2, 8, h); }
    ctx.restore();
    shape(b, w, h);
    ctx.lineWidth = 3.5; ctx.strokeStyle = C.ink; ctx.lineJoin = 'round'; ctx.stroke();
    ctx.restore();
  }
  function draw() {
    st.begin();
    // Wall and rug
    ctx.fillStyle = '#e8dcc4';
    for (let x = TRAY_W; x < 1700; x += 120) ctx.fillRect(x, 0, 2, FLOOR);
    ctx.fillStyle = '#c49a6c'; ctx.fillRect(-400, FLOOR, 2400, 400);
    ctx.fillStyle = 'rgba(0,0,0,.08)';
    for (let x = -400; x < 2000; x += 170) ctx.fillRect(x, FLOOR, 3, 400);
    ctx.fillStyle = 'rgba(147,171,139,.55)'; roundRect(ctx, 420, FLOOR + 14, 900, 40, 20); ctx.fill();
    // Tray
    ctx.fillStyle = '#d9c6a3'; ctx.fillRect(-400, -400, TRAY_W + 400, 1800);
    ctx.fillStyle = 'rgba(74,63,53,.18)'; ctx.fillRect(TRAY_W - 4, 0, 4, 900);
    TYPES.forEach((T, i) => {
      const y = 150 + i * 96;
      const k = Math.min(1, 70 / Math.max(T.w, T.h));
      drawBlock({ ...T, bw: T.w, bh: T.h, c: i % 2 ? '#d9b483' : '#e1c29a', grain: [0.4, 0.7] }, 95, y, 0, k);
    });
    for (const b of list) {
      const extra = b.q * Q;
      drawBlock(b, b.x + b.w / 2, b.y + b.h / 2, b.a + extra, 1);
    }
  }

  // ---------- Input ----------
  const pointers = new Map();
  function hit(w) {
    for (let i = list.length - 1; i >= 0; i--) {
      const b = list[i];
      if (w.x > b.x - 6 && w.x < b.x + b.w + 6 && w.y > b.y - 6 && w.y < b.y + b.h + 6) return b;
    }
    return null;
  }
  kit.on(st.cv, 'pointerdown', (e) => {
    e.preventDefault();
    const w = st.toWorld(e);
    const info = { last: w, t: performance.now(), vx: 0, vy: 0, b: null };
    if (w.x < TRAY_W) {
      const i = Math.round((w.y - 150) / 96);
      if (i >= 0 && i < TYPES.length) {
        const b = make(i, w.x - TYPES[i].w / 2, w.y - TYPES[i].h / 2);
        b.mode = 'drag'; info.b = b; info.off = { x: -b.w / 2, y: -b.h / 2 };
        sfx.clack(1.3, 0.4);
      }
    } else {
      const b = hit(w);
      if (b) {
        if (b.mode === 'tumble') { const cx = b.x + b.w / 2, cy = b.y + b.h / 2; setQ(b, b.q + Math.round(b.a / Q)); b.a = 0; b.x = cx - b.w / 2; b.y = cy - b.h / 2; }
        b.mode = 'drag'; b.vx = b.vy = 0;
        list.splice(list.indexOf(b), 1); list.push(b);
        info.b = b; info.off = { x: b.x - w.x, y: b.y - w.y };
        sfx.clack(1.5, 0.25);
      }
    }
    pointers.set(e.pointerId, info);
  });
  kit.on(window, 'pointermove', (e) => {
    const info = pointers.get(e.pointerId);
    if (!info) return;
    const w = st.toWorld(e), t = performance.now();
    const dt = Math.max(0.008, (t - info.t) / 1000);
    info.vx = info.vx * 0.5 + ((w.x - info.last.x) / dt) * 0.5;
    info.vy = info.vy * 0.5 + ((w.y - info.last.y) / dt) * 0.5;
    info.last = w; info.t = t;
    const b = info.b;
    if (b) {
      b.x = clamp(w.x + info.off.x, 0, 1600 - b.w);
      b.y = clamp(w.y + info.off.y, -100, FLOOR - b.h);
      if (Math.abs(info.vx) > 700) for (const o of list) if (o !== b && solid(o) && ox(b, o) > 6 && oy(b, o) > 6) knock(o, info.vx * 0.4);
    } else if (Math.abs(info.vx) > 800) {
      for (const o of list) if (solid(o) && w.x > o.x && w.x < o.x + o.w && w.y > o.y && w.y < o.y + o.h) { knock(o, info.vx * 0.45); sfx.whoosh(0.4); }
    }
  });
  const end = (e) => {
    const info = pointers.get(e.pointerId);
    if (!info) return;
    pointers.delete(e.pointerId);
    const b = info.b;
    if (!b) return;
    if (b.x + b.w / 2 < TRAY_W) { list.splice(list.indexOf(b), 1); sfx.pop(0.7); return; }
    const sp = Math.hypot(info.vx, info.vy);
    if (sp > 900 && performance.now() - info.t < 80) {
      b.mode = 'tumble'; b.vx = info.vx * 0.6; b.vy = info.vy * 0.6; b.av = Math.sign(info.vx || 1) * rand(2, 5); b.a = 0;
    } else { placeAbove(b); b.mode = 'fall'; b.vy = 0; }
  };
  kit.on(window, 'pointerup', end);
  kit.on(window, 'pointercancel', end);

  kit.loop((dt) => {
    const n = 3;
    for (let i = 0; i < n; i++) update(dt / n);
    draw();
  });
  kit.add(() => st.destroy());
}

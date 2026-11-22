// Space: everything floats. Grab planets, moons and astronauts and let them
// drift; they bump softly into each other. Tap them: astronauts wave and
// puff, planets spin and hum, the rocket fires, the satellite beeps.
import { makeCanvas, C, rand, clamp, roundRect } from '../lib.js';

export default function space(root, kit) {
  const { sfx, audio } = kit;
  const st = makeCanvas(root, '#2c3448');
  const ctx = st.ctx;
  const stars = Array.from({ length: 220 }, () => ({ x: rand(-300, 1900), y: rand(-200, 1100), r: rand(0.6, 2.4), p: rand(0, 6), s: rand(0.5, 2) }));
  const bigStars = Array.from({ length: 7 }, (_, i) => ({ x: 120 + i * 220 + rand(-40, 40), y: rand(60, 840), t: 0 }));
  const bodies = [];
  function add(kind, x, y, r, extra = {}) {
    const b = { kind, x, y, r, vx: rand(-20, 20), vy: rand(-20, 20), a: rand(0, 6), av: rand(-0.2, 0.2), act: 0, ...extra };
    b.m = r * r;
    bodies.push(b);
    return b;
  }
  add('planet', 420, 560, 110, { col: C.ochre, ring: true, band: '#c48f45' });
  add('planet', 1180, 300, 85, { col: C.blue, band: '#6585a1' });
  add('planet', 1300, 720, 70, { col: C.rose, band: '#c58f87', craters: true });
  add('moon', 760, 180, 44, {});
  add('astro', 860, 520, 58, { col: C.terra });
  add('astro', 250, 230, 54, { col: C.teal });
  add('rocket', 1000, 700, 62, { a: -1.2 });
  add('sat', 600, 360, 50, {});
  const puffs = [];

  function poke(b) {
    b.act = 1.6;
    if (b.kind === 'astro') { sfx.whoosh(0.5); const a = rand(0, 6); b.vx += Math.cos(a) * 80; b.vy += Math.sin(a) * 80; for (let i = 0; i < 8; i++) puffs.push({ x: b.x - Math.cos(a) * 40, y: b.y - Math.sin(a) * 40, vx: -Math.cos(a) * rand(40, 120) + rand(-30, 30), vy: -Math.sin(a) * rand(40, 120) + rand(-30, 30), t: 0 }); }
    else if (b.kind === 'planet') { b.av += 2.5; sfx.hum(b.r > 100 ? 110 : b.r > 80 ? 147 : 196); }
    else if (b.kind === 'moon') { b.av += 2; sfx.chime(330, 0.6); }
    else if (b.kind === 'rocket') { sfx.whoosh(1); audio.noise({ dur: 1.4, vol: 0.06, freq: 300, type: 'lowpass', attack: 0.1 }); }
    else if (b.kind === 'sat') { [0, 0.15, 0.3].forEach((d) => audio.tone(1320, { dur: 0.06, vol: 0.05, type: 'square', at: audio.now() + d })); b.av += 3; }
  }

  const held = new Map();
  kit.on(st.cv, 'pointerdown', (e) => {
    e.preventDefault();
    const w = st.toWorld(e);
    let hit = null;
    for (let i = bodies.length - 1; i >= 0; i--) { const b = bodies[i]; if (Math.hypot(b.x - w.x, b.y - w.y) < b.r + 14) { hit = b; break; } }
    if (!hit) {
      for (const s of bigStars) if (Math.hypot(s.x - w.x, s.y - w.y) < 40) { s.t = 1; sfx.chime([1046, 1175, 1318, 1568, 1760][Math.floor(Math.random() * 5)], 0.5); return; }
      return;
    }
    bodies.splice(bodies.indexOf(hit), 1); bodies.push(hit);
    held.set(e.pointerId, { b: hit, off: { x: hit.x - w.x, y: hit.y - w.y }, start: w, moved: false, last: w, t: performance.now(), vx: 0, vy: 0 });
    hit.held = true;
  });
  kit.on(window, 'pointermove', (e) => {
    const h = held.get(e.pointerId);
    if (!h) return;
    const w = st.toWorld(e), t = performance.now(), dt = Math.max(0.008, (t - h.t) / 1000);
    if (!h.moved && Math.hypot(w.x - h.start.x, w.y - h.start.y) > 10) h.moved = true;
    h.vx = h.vx * 0.5 + ((w.x - h.last.x) / dt) * 0.5; h.vy = h.vy * 0.5 + ((w.y - h.last.y) / dt) * 0.5;
    h.last = w; h.t = t;
    if (h.moved) { h.b.x = w.x + h.off.x; h.b.y = w.y + h.off.y; }
  });
  const up = (e) => {
    const h = held.get(e.pointerId);
    if (!h) return;
    held.delete(e.pointerId);
    h.b.held = false;
    if (!h.moved) { poke(h.b); return; }
    const fresh = performance.now() - h.t < 90;
    h.b.vx = fresh ? clamp(h.vx * 0.6, -600, 600) : 0; h.b.vy = fresh ? clamp(h.vy * 0.6, -600, 600) : 0;
  };
  kit.on(window, 'pointerup', up);
  kit.on(window, 'pointercancel', up);

  let lastBonk = 0;
  function update(dt) {
    for (const b of bodies) {
      b.act = Math.max(0, b.act - dt);
      if (b.kind === 'rocket' && b.act > 0) { b.vx += Math.cos(b.a) * 260 * dt; b.vy += Math.sin(b.a) * 260 * dt; if (Math.random() < 0.6) puffs.push({ x: b.x - Math.cos(b.a) * 60, y: b.y - Math.sin(b.a) * 60, vx: -Math.cos(b.a) * 120 + rand(-20, 20), vy: -Math.sin(b.a) * 120 + rand(-20, 20), t: 0, fire: true }); }
      if (b.held) continue;
      b.x += b.vx * dt; b.y += b.vy * dt; b.a += b.av * dt;
      b.vx *= Math.exp(-0.08 * dt); b.vy *= Math.exp(-0.08 * dt);
      b.av += (Math.sign(b.av || 1) * 0.15 - b.av) * 0.3 * dt;
      if (b.kind === 'rocket' && b.act <= 0) { const want = Math.atan2(b.vy, b.vx); if (Math.hypot(b.vx, b.vy) > 30) { let d = want - b.a; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; b.a += d * dt; } }
      if (b.x < b.r) { b.x = b.r; b.vx = Math.abs(b.vx) * 0.8; }
      if (b.x > 1600 - b.r) { b.x = 1600 - b.r; b.vx = -Math.abs(b.vx) * 0.8; }
      if (b.y < b.r) { b.y = b.r; b.vy = Math.abs(b.vy) * 0.8; }
      if (b.y > 900 - b.r) { b.y = 900 - b.r; b.vy = -Math.abs(b.vy) * 0.8; }
      // a gentle random drift so nothing is ever fully still
      b.vx += Math.sin(performance.now() / 4000 + b.r) * 2 * dt; b.vy += Math.cos(performance.now() / 5000 + b.r) * 2 * dt;
    }
    for (let i = 0; i < bodies.length; i++) for (let j = i + 1; j < bodies.length; j++) {
      const a = bodies[i], b = bodies[j];
      const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy), R = a.r + b.r;
      if (d > 0 && d < R) {
        const nx = dx / d, ny = dy / d, ov = R - d;
        const ia = a.held ? 0 : b.held ? 1 : b.m / (a.m + b.m), ib = a.held ? 1 : b.held ? 0 : a.m / (a.m + b.m);
        a.x -= nx * ov * ia; a.y -= ny * ov * ia; b.x += nx * ov * ib; b.y += ny * ov * ib;
        const rv = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
        if (rv < 0) {
          const j2 = (-1.6 * rv) / (1 / a.m + 1 / b.m);
          if (!a.held) { a.vx -= (j2 / a.m) * nx; a.vy -= (j2 / a.m) * ny; }
          if (!b.held) { b.vx += (j2 / b.m) * nx; b.vy += (j2 / b.m) * ny; }
          const t = performance.now();
          if (-rv > 40 && t - lastBonk > 120) { sfx.thud(1.6, clamp(-rv / 500, 0.1, 0.5)); lastBonk = t; }
        }
      }
    }
    for (let i = puffs.length - 1; i >= 0; i--) { const p = puffs[i]; p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; if (p.t > 1) puffs.splice(i, 1); }
    for (const s of bigStars) s.t = Math.max(0, s.t - dt * 0.7);
  }

  function drawBody(b, t) {
    ctx.save(); ctx.translate(b.x, b.y);
    ctx.lineWidth = 4; ctx.strokeStyle = C.ink;
    if (b.kind === 'planet') {
      if (b.ring) { ctx.save(); ctx.rotate(-0.35); ctx.strokeStyle = '#efe3cc'; ctx.lineWidth = 10; ctx.beginPath(); ctx.ellipse(0, 0, b.r * 1.6, b.r * 0.38, 0, Math.PI, 2 * Math.PI); ctx.stroke(); ctx.restore(); }
      ctx.beginPath(); ctx.arc(0, 0, b.r, 0, Math.PI * 2); ctx.fillStyle = b.col; ctx.fill();
      ctx.save(); ctx.clip(); ctx.rotate(b.a);
      ctx.fillStyle = b.band;
      for (let i = -2; i <= 2; i++) ctx.fillRect(-b.r * 1.5, i * b.r * 0.42 - b.r * 0.08, b.r * 3, b.r * 0.16);
      if (b.craters) { ctx.fillStyle = 'rgba(0,0,0,.12)'; [[-30, -20, 16], [26, 22, 12], [10, -36, 9]].forEach(([x, y, r]) => { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }); }
      ctx.restore();
      ctx.beginPath(); ctx.arc(0, 0, b.r, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.beginPath(); ctx.arc(-b.r * 0.35, -b.r * 0.35, b.r * 0.3, 0, Math.PI * 2); ctx.fill();
      if (b.ring) { ctx.save(); ctx.rotate(-0.35); ctx.strokeStyle = '#efe3cc'; ctx.lineWidth = 10; ctx.beginPath(); ctx.ellipse(0, 0, b.r * 1.6, b.r * 0.38, 0, 0, Math.PI); ctx.stroke(); ctx.restore(); }
      if (b.act > 0) { ctx.strokeStyle = `rgba(255,240,200,${b.act * 0.4})`; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(0, 0, b.r + 20 + (1.6 - b.act) * 40, 0, Math.PI * 2); ctx.stroke(); }
    } else if (b.kind === 'moon') {
      ctx.rotate(b.a);
      ctx.beginPath(); ctx.arc(0, 0, b.r, 0, Math.PI * 2); ctx.fillStyle = '#d9d4c9'; ctx.fill(); ctx.stroke();
      ctx.fillStyle = 'rgba(0,0,0,.12)';
      [[-14, -10, 10], [16, 8, 8], [-4, 20, 6]].forEach(([x, y, r]) => { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); });
      ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(-10, -2, 3, 0, Math.PI * 2); ctx.arc(10, -2, 3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(0, 6, 8, 0.2, Math.PI - 0.2); ctx.lineWidth = 3; ctx.stroke();
    } else if (b.kind === 'astro') {
      ctx.rotate(Math.sin(b.a) * 0.4);
      ctx.fillStyle = '#d9d2c4'; roundRect(ctx, -46, -12, 22, 50, 8); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#fbf7ef'; roundRect(ctx, -30, -8, 60, 58, 22); ctx.fill(); ctx.stroke();
      ctx.fillStyle = b.col; ctx.fillRect(-12, 10, 24, 14);
      // legs
      ctx.fillStyle = '#fbf7ef'; roundRect(ctx, -26, 40, 20, 26, 8); ctx.fill(); ctx.stroke(); roundRect(ctx, 6, 40, 20, 26, 8); ctx.fill(); ctx.stroke();
      // arms (one waves)
      const wave = b.act > 0 ? Math.sin(t * 14) * 0.6 - 1.2 : 0.3;
      ctx.save(); ctx.translate(28, 4); ctx.rotate(wave); ctx.fillStyle = '#fbf7ef'; roundRect(ctx, -8, -6, 16, 36, 8); ctx.fill(); ctx.stroke(); ctx.restore();
      ctx.save(); ctx.translate(-28, 4); ctx.rotate(-0.3); ctx.fillStyle = '#fbf7ef'; roundRect(ctx, -8, -6, 16, 36, 8); ctx.fill(); ctx.stroke(); ctx.restore();
      ctx.beginPath(); ctx.arc(0, -30, 30, 0, Math.PI * 2); ctx.fillStyle = '#fbf7ef'; ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(0, -28, 22, 17, 0, 0, Math.PI * 2); ctx.fillStyle = '#5e8f8f'; ctx.fill(); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.beginPath(); ctx.ellipse(-8, -34, 7, 4, -0.4, 0, Math.PI * 2); ctx.fill();
    } else if (b.kind === 'rocket') {
      ctx.rotate(b.a + Math.PI / 2);
      if (b.act > 0) { ctx.fillStyle = '#f2b46d'; ctx.beginPath(); ctx.moveTo(-14, 46); ctx.quadraticCurveTo(0, 90 + Math.sin(t * 40) * 10, 14, 46); ctx.fill(); }
      ctx.fillStyle = C.terra; ctx.beginPath(); ctx.moveTo(-18, 30); ctx.lineTo(-34, 54); ctx.lineTo(-14, 46); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(18, 30); ctx.lineTo(34, 54); ctx.lineTo(14, 46); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#efe3cc'; ctx.beginPath(); ctx.moveTo(0, -62); ctx.quadraticCurveTo(28, -30, 20, 46); ctx.lineTo(-20, 46); ctx.quadraticCurveTo(-28, -30, 0, -62); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = C.terra; ctx.beginPath(); ctx.moveTo(0, -62); ctx.quadraticCurveTo(16, -46, 19, -34); ctx.lineTo(-19, -34); ctx.quadraticCurveTo(-16, -46, 0, -62); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, -6, 11, 0, Math.PI * 2); ctx.fillStyle = C.sky; ctx.fill(); ctx.stroke();
    } else if (b.kind === 'sat') {
      ctx.rotate(b.a);
      ctx.fillStyle = '#7898b3';
      for (const sx of [-1, 1]) { ctx.save(); ctx.translate(sx * 44, 0); roundRect(ctx, -22, -14, 44, 28, 4); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, -14); ctx.lineTo(0, 14); ctx.stroke(); ctx.restore(); }
      ctx.fillStyle = C.ochre; roundRect(ctx, -18, -18, 36, 36, 6); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, -18); ctx.lineTo(0, -34); ctx.stroke();
      ctx.fillStyle = b.act > 0 && Math.sin(t * 20) > 0 ? '#f6d06d' : C.terra; ctx.beginPath(); ctx.arc(0, -36, 6, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    }
    ctx.restore();
  }

  function draw(t) {
    st.begin('#2c3448');
    const g1 = ctx.createRadialGradient(300, 250, 10, 300, 250, 600);
    g1.addColorStop(0, 'rgba(155,124,151,.35)'); g1.addColorStop(1, 'rgba(155,124,151,0)');
    ctx.fillStyle = g1; ctx.fillRect(-300, -300, 2200, 1500);
    const g2 = ctx.createRadialGradient(1300, 650, 10, 1300, 650, 650);
    g2.addColorStop(0, 'rgba(94,143,143,.3)'); g2.addColorStop(1, 'rgba(94,143,143,0)');
    ctx.fillStyle = g2; ctx.fillRect(-300, -300, 2200, 1500);
    for (const s of stars) { ctx.globalAlpha = 0.4 + 0.6 * Math.abs(Math.sin(t * s.s * 0.5 + s.p)); ctx.fillStyle = '#f4ecdc'; ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill(); }
    ctx.globalAlpha = 1;
    for (const s of bigStars) {
      const k = 10 + s.t * 14;
      ctx.save(); ctx.translate(s.x, s.y); ctx.rotate(t * 0.2 + s.t * 2);
      ctx.fillStyle = s.t > 0 ? '#fff3c4' : '#f1e3bd';
      ctx.beginPath();
      for (let i = 0; i < 8; i++) { const r = i % 2 ? k * 0.35 : k; const a = (i / 8) * Math.PI * 2; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
      ctx.closePath(); ctx.fill(); ctx.restore();
    }
    for (const p of puffs) { ctx.globalAlpha = 1 - p.t; ctx.fillStyle = p.fire ? '#f2b46d' : '#e8e4dc'; ctx.beginPath(); ctx.arc(p.x, p.y, 6 + p.t * 16, 0, Math.PI * 2); ctx.fill(); }
    ctx.globalAlpha = 1;
    for (const b of bodies) drawBody(b, t);
  }

  kit.loop((dt, t) => { update(dt); draw(t); });
  kit.add(() => st.destroy());
}

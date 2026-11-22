// Islands: hold anywhere on the sea and the little boat sails there. Mist
// lifts where you sail; islands wake up as you pass (a lighthouse, a chest,
// turtles, parrots...). Tap whales, dolphins, fish and jellyfish.
import { makeCanvas, C, rand, clamp, roundRect, rng } from '../lib.js';

export default function islands(root, kit) {
  const { sfx, audio } = kit;
  const st = makeCanvas(root, '#7fb0bd');
  const ctx = st.ctx;
  const WW = 4800, WH = 2700, CELL = 300;
  const R = rng(7);
  const boat = { x: 2400, y: 1350, a: 0, v: 0, target: null };
  const cam = { x: 0, y: 0 };
  const FX = Math.ceil(WW / CELL), FY = Math.ceil(WH / CELL);
  const fog = new Float32Array(FX * FY).fill(1);

  function blob(r, seed) {
    const q = rng(seed);
    const ph = [q() * 6, q() * 6, q() * 6];
    return Array.from({ length: 36 }, (_, i) => {
      const a = (i / 36) * Math.PI * 2;
      return r * (1 + 0.12 * Math.sin(a * 2 + ph[0]) + 0.08 * Math.sin(a * 3 + ph[1]) + 0.05 * Math.sin(a * 5 + ph[2]));
    });
  }
  const ISL = [
    { x: 2850, y: 1100, r: 170, kind: 'lighthouse' },
    { x: 1500, y: 800, r: 210, kind: 'parrots' },
    { x: 1300, y: 1900, r: 190, kind: 'chest' },
    { x: 3700, y: 700, r: 230, kind: 'volcano' },
    { x: 3900, y: 2000, r: 200, kind: 'turtles' },
    { x: 650, y: 1150, r: 170, kind: 'village' },
    { x: 2500, y: 2250, r: 160, kind: 'seals' },
    { x: 4400, y: 1350, r: 110, kind: 'rock' },
    { x: 400, y: 2300, r: 100, kind: 'rock' },
  ].map((o, i) => ({ ...o, shape: blob(o.r, i + 3), found: false, t: 0 }));

  const creatures = [];
  for (let i = 0; i < 3; i++) creatures.push({ kind: 'whale', x: rand(600, 4200), y: rand(400, 2300), a: rand(0, 6), t: rand(0, 8), act: 0 });
  for (let i = 0; i < 4; i++) creatures.push({ kind: 'dolphin', x: rand(400, 4400), y: rand(300, 2400), a: rand(0, 6), t: rand(0, 5), act: 0 });
  for (let i = 0; i < 6; i++) creatures.push({ kind: 'fish', x: rand(300, 4500), y: rand(300, 2400), a: rand(0, 6), t: 0, act: 0 });
  for (let i = 0; i < 5; i++) creatures.push({ kind: 'jelly', x: rand(300, 4500), y: rand(300, 2400), a: 0, t: rand(0, 5), act: 0 });
  const wake = [];
  const splashes = [];

  function clearFog(x, y, rad) {
    const c0 = Math.floor((x - rad) / CELL), c1 = Math.floor((x + rad) / CELL);
    const r0 = Math.floor((y - rad) / CELL), r1 = Math.floor((y + rad) / CELL);
    for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) {
      if (c < 0 || r < 0 || c >= FX || r >= FY) continue;
      const d = Math.hypot(c * CELL + CELL / 2 - x, r * CELL + CELL / 2 - y);
      if (d < rad) fog[r * FX + c] = Math.min(fog[r * FX + c], clamp((d - rad * 0.6) / (rad * 0.4), 0, 1));
    }
  }
  clearFog(boat.x, boat.y, 700);

  // Ambient sea
  const sea = audio.noiseLoop({ freq: 420, q: 0.5, type: 'lowpass', vol: 0.03 });
  kit.add(() => sea.stop());

  function islandR(isl, ang) {
    const n = isl.shape.length;
    let a = ((ang % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    const f = (a / (Math.PI * 2)) * n, i = Math.floor(f) % n, k = f - Math.floor(f);
    return isl.shape[i] * (1 - k) + isl.shape[(i + 1) % n] * k;
  }

  // ---------- Input ----------
  const held = new Map();
  kit.on(st.cv, 'pointerdown', (e) => {
    e.preventDefault();
    const w = st.toWorld(e);
    const wx = w.x + cam.x, wy = w.y + cam.y;
    for (const c of creatures) {
      if (Math.hypot(c.x - wx, c.y - wy) < 80) { poke(c); return; }
    }
    for (const isl of ISL) {
      if (Math.hypot(isl.x - wx, isl.y - wy) < isl.r * 0.8 && isl.found) { isl.t = 0.01; wakeIsland(isl, true); return; }
    }
    held.set(e.pointerId, true);
    boat.target = { x: wx, y: wy };
    splashes.push({ x: wx, y: wy, t: 0 });
    sfx.drip();
  });
  kit.on(window, 'pointermove', (e) => {
    if (!held.has(e.pointerId)) return;
    const w = st.toWorld(e);
    boat.target = { x: w.x + cam.x, y: w.y + cam.y };
  });
  const up = (e) => held.delete(e.pointerId);
  kit.on(window, 'pointerup', up);
  kit.on(window, 'pointercancel', up);

  function poke(c) {
    c.act = 1.6;
    if (c.kind === 'whale') { sfx.splash(0.8); audio.tone(110, { dur: 1.2, vol: 0.08, attack: 0.3, glide: 80 }); }
    else if (c.kind === 'dolphin') { sfx.chirp(); kit.after(200, () => sfx.splash(0.5)); }
    else if (c.kind === 'fish') { sfx.bubble(); c.a += Math.PI; }
    else { sfx.chime(1046, 0.4); }
  }
  function wakeIsland(isl, again) {
    const notes = { lighthouse: 784, parrots: 880, chest: 1046, volcano: 330, turtles: 659, village: 587, seals: 523, rock: 440 };
    if (isl.kind === 'volcano') sfx.rumble(); else if (isl.kind === 'parrots') sfx.chirp(); else if (isl.kind === 'seals') sfx.boing(0.7);
    sfx.chime(notes[isl.kind], again ? 0.5 : 0.9);
  }

  // ---------- Update ----------
  function update(dt, t) {
    if (boat.target) {
      const dx = boat.target.x - boat.x, dy = boat.target.y - boat.y, d = Math.hypot(dx, dy);
      if (d > 30) {
        const want = Math.atan2(dy, dx);
        let da = want - boat.a; while (da > Math.PI) da -= 2 * Math.PI; while (da < -Math.PI) da += 2 * Math.PI;
        boat.a += clamp(da, -2.4 * dt, 2.4 * dt);
        boat.v += ((Math.abs(da) < 1.2 ? Math.min(280, d * 1.4) : 60) - boat.v) * Math.min(1, dt * 1.5);
      } else { boat.target = held.size ? boat.target : null; boat.v *= Math.exp(-2 * dt); }
    } else boat.v *= Math.exp(-1.5 * dt);
    boat.x += Math.cos(boat.a) * boat.v * dt; boat.y += Math.sin(boat.a) * boat.v * dt;
    boat.x = clamp(boat.x, 60, WW - 60); boat.y = clamp(boat.y, 60, WH - 60);
    for (const isl of ISL) {
      const dx = boat.x - isl.x, dy = boat.y - isl.y, d = Math.hypot(dx, dy);
      const rr = islandR(isl, Math.atan2(dy, dx)) + 70;
      if (d < rr) { boat.x = isl.x + (dx / d) * rr; boat.y = isl.y + (dy / d) * rr; boat.v *= 0.9; }
      if (!isl.found && d < isl.r + 320) { isl.found = true; isl.t = 0.01; wakeIsland(isl); }
      if (isl.t > 0) isl.t += dt;
    }
    clearFog(boat.x, boat.y, 520);
    if (boat.v > 40 && Math.random() < dt * 20) wake.push({ x: boat.x - Math.cos(boat.a) * 40, y: boat.y - Math.sin(boat.a) * 40, t: 0 });
    for (let i = wake.length - 1; i >= 0; i--) { wake[i].t += dt; if (wake[i].t > 1.6) wake.splice(i, 1); }
    for (let i = splashes.length - 1; i >= 0; i--) { splashes[i].t += dt; if (splashes[i].t > 0.9) splashes.splice(i, 1); }
    for (const c of creatures) {
      c.t += dt; c.act = Math.max(0, c.act - dt);
      const sp = { whale: 30, dolphin: 90, fish: 60, jelly: 12 }[c.kind] * (c.act > 0 && c.kind === 'fish' ? 3 : 1);
      c.a += Math.sin(c.t * 0.3 + c.x * 0.001) * 0.3 * dt;
      c.x += Math.cos(c.a) * sp * dt; c.y += Math.sin(c.a) * sp * dt;
      if (c.x < 200 || c.x > WW - 200 || c.y < 200 || c.y > WH - 200) c.a = Math.atan2(WH / 2 - c.y, WW / 2 - c.x);
      for (const isl of ISL) if (Math.hypot(c.x - isl.x, c.y - isl.y) < isl.r + 80) c.a = Math.atan2(c.y - isl.y, c.x - isl.x);
    }
    cam.x += (clamp(boat.x - 800, 0, WW - 1600) - cam.x) * Math.min(1, dt * 2.5);
    cam.y += (clamp(boat.y - 450, 0, WH - 900) - cam.y) * Math.min(1, dt * 2.5);
  }

  // ---------- Drawing ----------
  function pathIsland(isl, grow = 0) {
    ctx.beginPath();
    isl.shape.forEach((r, i) => {
      const a = (i / isl.shape.length) * Math.PI * 2;
      const x = isl.x + Math.cos(a) * (r + grow), y = isl.y + Math.sin(a) * (r + grow);
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    });
    ctx.closePath();
  }
  function palm(x, y, s = 1, sway = 0) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.strokeStyle = C.cocoa; ctx.lineWidth = 8; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(6, -30, 2 + sway * 4, -60); ctx.stroke();
    ctx.fillStyle = '#6f9a5f'; ctx.strokeStyle = C.ink; ctx.lineWidth = 3;
    for (let k = 0; k < 5; k++) {
      ctx.save(); ctx.translate(2 + sway * 4, -60); ctx.rotate(-Math.PI / 2 + (k - 2) * 0.7 + sway * 0.1);
      ctx.beginPath(); ctx.ellipse(22, 0, 26, 8, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.restore();
    }
    ctx.restore();
  }
  function drawIsland(isl, t) {
    ctx.fillStyle = 'rgba(190,225,222,.6)'; pathIsland(isl, 46); ctx.fill();
    ctx.fillStyle = '#ecd6a4'; pathIsland(isl, 14); ctx.fill();
    ctx.fillStyle = isl.kind === 'rock' ? '#a9a39a' : '#9dbb80'; pathIsland(isl, -18); ctx.fill();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.stroke();
    const k = clamp(isl.t, 0, 1);
    const { x, y } = isl;
    switch (isl.kind) {
      case 'lighthouse': {
        if (isl.found) {
          const a = t * 1.2;
          ctx.save(); ctx.globalAlpha = 0.22 * k; ctx.fillStyle = '#fff3c4';
          ctx.beginPath(); ctx.moveTo(x, y - 140); ctx.arc(x, y - 140, 520, a - 0.18, a + 0.18); ctx.closePath(); ctx.fill(); ctx.restore();
        }
        ctx.fillStyle = '#fbf7ef'; ctx.strokeStyle = C.ink; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(x - 30, y + 20); ctx.lineTo(x - 18, y - 120); ctx.lineTo(x + 18, y - 120); ctx.lineTo(x + 30, y + 20); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = C.terra; ctx.fillRect(x - 24, y - 50, 48, 18); ctx.fillRect(x - 21, y - 100, 42, 16);
        ctx.fillStyle = isl.found ? '#ffe39a' : '#9aa0a8'; roundRect(ctx, x - 20, y - 150, 40, 32, 6); ctx.fill(); ctx.stroke();
        ctx.fillStyle = C.terra; ctx.beginPath(); ctx.moveTo(x - 26, y - 150); ctx.lineTo(x, y - 176); ctx.lineTo(x + 26, y - 150); ctx.closePath(); ctx.fill(); ctx.stroke();
        break;
      }
      case 'parrots': {
        palm(x - 60, y + 30, 1.3, Math.sin(t)); palm(x + 50, y + 10, 1.1, Math.sin(t + 1));
        const n = isl.found ? 3 : 0;
        for (let i = 0; i < n; i++) {
          const a = t * 1.3 + (i * Math.PI * 2) / 3, px = x + Math.cos(a) * 120 * k, py = y - 90 + Math.sin(a) * 50 * k;
          ctx.fillStyle = [C.terra, C.teal, C.ochre][i]; ctx.strokeStyle = C.ink; ctx.lineWidth = 3;
          ctx.beginPath(); ctx.ellipse(px, py, 16, 11, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(px - 4, py); ctx.lineTo(px - 18, py - 12 * Math.sin(t * 12 + i)); ctx.lineTo(px + 6, py - 4); ctx.fill(); ctx.stroke();
        }
        break;
      }
      case 'chest': {
        palm(x + 60, y - 20, 1.2, Math.sin(t * 0.8));
        ctx.save(); ctx.translate(x - 30, y + 30);
        ctx.fillStyle = '#a0703e'; ctx.strokeStyle = C.ink; ctx.lineWidth = 4;
        roundRect(ctx, -40, -20, 80, 46, 6); ctx.fill(); ctx.stroke();
        const lid = isl.found ? -1.1 * k : 0;
        if (isl.found) { ctx.fillStyle = `rgba(255,220,120,${0.6 * k})`; ctx.beginPath(); ctx.arc(0, -24, 40 + Math.sin(t * 4) * 4, 0, Math.PI * 2); ctx.fill(); }
        ctx.save(); ctx.translate(-40, -20); ctx.rotate(lid);
        ctx.fillStyle = '#b8824a'; roundRect(ctx, 0, -24, 80, 24, 10); ctx.fill(); ctx.stroke(); ctx.restore();
        ctx.fillStyle = C.ochre; ctx.fillRect(-6, -14, 12, 14);
        ctx.restore();
        break;
      }
      case 'volcano': {
        ctx.fillStyle = '#8c7b6e'; ctx.strokeStyle = C.ink; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(x - 140, y + 60); ctx.lineTo(x - 36, y - 110); ctx.lineTo(x + 36, y - 110); ctx.lineTo(x + 140, y + 60); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = isl.found ? '#e48a5a' : '#6b5d52'; ctx.beginPath(); ctx.ellipse(x, y - 110, 36, 10, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        if (isl.found) for (let i = 0; i < 4; i++) {
          const q = (t * 0.4 + i / 4) % 1;
          ctx.fillStyle = `rgba(230,225,218,${0.7 * (1 - q)})`;
          ctx.beginPath(); ctx.arc(x + Math.sin(q * 6 + i) * 20, y - 130 - q * 160, 18 + q * 30, 0, Math.PI * 2); ctx.fill();
        }
        break;
      }
      case 'turtles': {
        palm(x - 40, y - 30, 1.1, Math.sin(t));
        if (isl.found) for (let i = 0; i < 3; i++) {
          const q = clamp(isl.t * 0.15 - i * 0.12, 0, 1);
          const px = x + 40 + i * 30 + q * 260, py = y + 40 + i * 30 + q * 120;
          ctx.fillStyle = C.moss; ctx.strokeStyle = C.ink; ctx.lineWidth = 3;
          ctx.beginPath(); ctx.ellipse(px, py, 22, 16, 0.4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
          ctx.fillStyle = C.sage; ctx.beginPath(); ctx.arc(px + 20, py + 10, 8, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        }
        break;
      }
      case 'village': {
        for (let i = 0; i < 3; i++) {
          const hx = x - 70 + i * 70, hy = y + (i % 2) * 30;
          ctx.fillStyle = '#e8d2a8'; ctx.strokeStyle = C.ink; ctx.lineWidth = 3;
          ctx.fillRect(hx - 22, hy - 30, 44, 34); ctx.strokeRect(hx - 22, hy - 30, 44, 34);
          ctx.fillStyle = '#b08a52'; ctx.beginPath(); ctx.moveTo(hx - 32, hy - 28); ctx.lineTo(hx, hy - 62); ctx.lineTo(hx + 32, hy - 28); ctx.closePath(); ctx.fill(); ctx.stroke();
        }
        if (isl.found) {
          const px = x + 110, py = y + 50;
          ctx.fillStyle = C.terra; ctx.beginPath(); ctx.arc(px, py - 20, 12, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
          ctx.fillStyle = '#9c6848'; ctx.beginPath(); ctx.arc(px, py - 42, 10, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
          ctx.strokeStyle = '#9c6848'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(px + 10, py - 26); ctx.lineTo(px + 22, py - 46 + Math.sin(t * 8) * 6); ctx.stroke();
        }
        break;
      }
      case 'seals': {
        if (isl.found) for (let i = 0; i < 3; i++) {
          const px = x - 50 + i * 50, py = y + 10 + Math.sin(t * 2 + i) * 3;
          ctx.fillStyle = '#8d8a86'; ctx.strokeStyle = C.ink; ctx.lineWidth = 3;
          ctx.beginPath(); ctx.ellipse(px, py, 26, 14, -0.3, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
          ctx.beginPath(); ctx.arc(px + 20, py - 16, 11, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
          ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(px + 23, py - 18, 2.5, 0, Math.PI * 2); ctx.fill();
        }
        break;
      }
      default: break;
    }
  }
  function drawCreature(c, t) {
    const surf = c.kind === 'whale' ? Math.max(0, Math.sin(c.t * 0.5)) : 1;
    ctx.save(); ctx.translate(c.x, c.y);
    if (c.kind === 'whale') {
      ctx.rotate(c.a);
      ctx.globalAlpha = 0.35 + surf * 0.55;
      ctx.fillStyle = '#5d6f84'; ctx.strokeStyle = C.ink; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.ellipse(0, 0, 90, 38, 0, 0, Math.PI * 2); ctx.fill(); if (surf > 0.4) ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-80, 0); ctx.lineTo(-130, -30); ctx.lineTo(-120, 0); ctx.lineTo(-130, 30); ctx.closePath(); ctx.fill();
      ctx.globalAlpha = 1;
      if (surf > 0.85 || c.act > 0) {
        ctx.rotate(-c.a);
        ctx.fillStyle = 'rgba(240,248,250,.85)';
        for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.arc(Math.sin(t * 5 + i) * 18, -50 - i * 14, 10 - i, 0, Math.PI * 2); ctx.fill(); }
      }
    } else if (c.kind === 'dolphin') {
      const jump = c.act > 0 ? Math.sin((1.6 - c.act) / 1.6 * Math.PI) : Math.max(0, Math.sin(c.t * 1.4)) * 0.5;
      ctx.rotate(c.a);
      ctx.fillStyle = 'rgba(0,0,0,.08)'; ctx.beginPath(); ctx.ellipse(0, 0, 40, 12, 0, 0, Math.PI * 2); ctx.fill();
      ctx.translate(0, -jump * 70);
      ctx.fillStyle = '#7d93a8'; ctx.strokeStyle = C.ink; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.ellipse(0, 0, 44, 15, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, -12); ctx.lineTo(-10, -30); ctx.lineTo(12, -12); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-40, 0); ctx.lineTo(-60, -14); ctx.lineTo(-56, 0); ctx.lineTo(-60, 14); ctx.closePath(); ctx.fill(); ctx.stroke();
    } else if (c.kind === 'fish') {
      for (let i = 0; i < 7; i++) {
        const ox = Math.cos(i * 2.3) * 40 + Math.sin(t * 2 + i) * 6, oy = Math.sin(i * 1.7) * 30;
        ctx.save(); ctx.translate(ox, oy); ctx.rotate(c.a);
        ctx.fillStyle = [C.ochre, C.terra, '#e3b6a6'][i % 3]; ctx.globalAlpha = 0.8;
        ctx.beginPath(); ctx.ellipse(0, 0, 12, 6, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(-18, -6); ctx.lineTo(-18, 6); ctx.fill();
        ctx.restore();
      }
    } else {
      const pul = 1 + Math.sin(c.t * 3) * 0.1;
      ctx.globalAlpha = 0.75;
      ctx.fillStyle = c.act > 0 ? '#f6d9e8' : '#dcc3d9'; ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.ellipse(0, 0, 22 * pul, 18 / pul, 0, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = '#b8a0b6';
      for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(i * 7, 0); ctx.quadraticCurveTo(i * 7 + Math.sin(c.t * 3 + i) * 6, 18, i * 7, 34); ctx.stroke(); }
      if (c.act > 0) { ctx.fillStyle = `rgba(255,240,200,${c.act * 0.3})`; ctx.beginPath(); ctx.arc(0, 0, 50, 0, Math.PI * 2); ctx.fill(); }
    }
    ctx.restore();
  }
  function drawBoat(t) {
    ctx.save(); ctx.translate(boat.x, boat.y);
    const bob = Math.sin(t * 2.4) * 0.05;
    ctx.rotate(boat.a);
    ctx.fillStyle = 'rgba(0,0,0,.12)'; ctx.beginPath(); ctx.ellipse(4, 8, 54, 22, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = C.terra; ctx.strokeStyle = C.ink; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(56, 0); ctx.quadraticCurveTo(20, -26, -46, -20); ctx.lineTo(-46, 20); ctx.quadraticCurveTo(20, 26, 56, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#d9b483'; ctx.beginPath(); ctx.ellipse(0, 0, 34, 12, 0, 0, Math.PI * 2); ctx.fill();
    ctx.rotate(-boat.a + bob);
    ctx.strokeStyle = C.cocoa; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -80); ctx.stroke();
    ctx.fillStyle = '#fbf7ef'; ctx.strokeStyle = C.ink; ctx.lineWidth = 3;
    const side = Math.cos(boat.a) >= 0 ? 1 : -1;
    ctx.beginPath(); ctx.moveTo(0, -78); ctx.quadraticCurveTo(side * 50, -40, 0, -10); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = C.ochre; ctx.beginPath(); ctx.moveTo(0, -80); ctx.lineTo(side * -18, -74); ctx.lineTo(0, -68); ctx.fill();
    ctx.restore();
  }
  function draw(t) {
    st.begin('#7fb0bd');
    ctx.save(); ctx.translate(-cam.x, -cam.y);
    // Waves
    ctx.strokeStyle = 'rgba(230,244,246,.45)'; ctx.lineWidth = 3; ctx.lineCap = 'round';
    const x0 = Math.floor(cam.x / 160) * 160 - 160, y0 = Math.floor(cam.y / 120) * 120 - 120;
    for (let y = y0; y < cam.y + 1000; y += 120) for (let x = x0; x < cam.x + 1800; x += 160) {
      const ph = Math.sin((x * 0.7 + y * 1.3) * 0.01 + t * 1.2) * 8;
      const ox = ((y / 120) % 2) * 80;
      ctx.beginPath(); ctx.moveTo(x + ox, y + ph); ctx.quadraticCurveTo(x + ox + 15, y - 8 + ph, x + ox + 30, y + ph); ctx.stroke();
    }
    for (const w of wake) { ctx.strokeStyle = `rgba(255,255,255,${0.6 * (1 - w.t / 1.6)})`; ctx.beginPath(); ctx.arc(w.x, w.y, 10 + w.t * 30, 0, Math.PI * 2); ctx.stroke(); }
    for (const sp of splashes) { ctx.strokeStyle = `rgba(255,255,255,${0.8 * (1 - sp.t / 0.9)})`; ctx.beginPath(); ctx.arc(sp.x, sp.y, 8 + sp.t * 50, 0, Math.PI * 2); ctx.stroke(); }
    for (const c of creatures) if (c.kind !== 'dolphin') drawCreature(c, t);
    for (const isl of ISL) drawIsland(isl, t);
    for (const c of creatures) if (c.kind === 'dolphin') drawCreature(c, t);
    drawBoat(t);
    // Mist over unexplored sea
    for (let r = Math.max(0, Math.floor(cam.y / CELL) - 1); r < Math.min(FY, Math.ceil((cam.y + 900) / CELL) + 1); r++) {
      for (let c = Math.max(0, Math.floor(cam.x / CELL) - 1); c < Math.min(FX, Math.ceil((cam.x + 1600) / CELL) + 1); c++) {
        const f = fog[r * FX + c];
        if (f <= 0.02) continue;
        const cx = c * CELL + CELL / 2 + Math.sin(t * 0.3 + c) * 10, cy = r * CELL + CELL / 2 + Math.cos(t * 0.25 + r) * 10;
        const g = ctx.createRadialGradient(cx, cy, 20, cx, cy, CELL * 0.95);
        g.addColorStop(0, `rgba(244,240,232,${0.92 * f})`); g.addColorStop(1, 'rgba(244,240,232,0)');
        ctx.fillStyle = g; ctx.fillRect(cx - CELL, cy - CELL, CELL * 2, CELL * 2);
      }
    }
    if (boat.target && held.size) { ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(boat.target.x, boat.target.y, 18 + Math.sin(t * 6) * 4, 0, Math.PI * 2); ctx.stroke(); }
    ctx.restore();
  }

  kit.loop((dt, t) => { update(dt, t); draw(t); });
  kit.add(() => st.destroy());
}

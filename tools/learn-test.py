#!/usr/bin/env python3
"""Learn smoke test: plays every math skill once in headless Chromium.

For each skill it opens Learn with ?skill=<id>, answers the first item wrongly
(to run the help demonstration), then answers every item correctly. It fails
on any JavaScript error and saves one screenshot per skill to build/learn/.

Usage: python3 tools/learn-test.py [http://localhost:4210] [skill-id ...]
"""
import os, sys, json, pathlib, re
from playwright.sync_api import sync_playwright

BASE = sys.argv[1] if len(sys.argv) > 1 and sys.argv[1].startswith('http') else 'http://localhost:4210'
ONLY = [a for a in sys.argv[1:] if not a.startswith('http')]
OUT = pathlib.Path(__file__).resolve().parent.parent / 'build' / 'learn'
OUT.mkdir(parents=True, exist_ok=True)
src = (pathlib.Path(__file__).resolve().parent.parent / 'app/js/learn/curriculum/math.js').read_text()
SKILLS = ['math.' + m for m in re.findall(r"S\('([a-z0-9]+)'", src)]

errors = []
with sync_playwright() as p:
    exe = os.environ.get('CHROMIUM') or ('/opt/pw-browsers/chromium' if os.path.exists('/opt/pw-browsers/chromium') else None)
    try:
        b = p.chromium.launch()
    except Exception:
        b = p.chromium.launch(executable_path=exe)
    page = b.new_page(viewport={'width': 1280, 'height': 800})
    page.on('pageerror', lambda e: errors.append(f'pageerror: {e}'))
    page.on('console', lambda m: m.type == 'error' and errors.append(f'console: {m.text}'))
    for sk in SKILLS:
        if ONLY and sk not in ONLY and sk.split('.')[1] not in ONLY:
            continue
        before = len(errors)
        page.goto(f'{BASE}/?skill={sk}')
        page.wait_for_timeout(700)
        page.evaluate("document.querySelector('.toy[aria-label=\"learn\"]').click()")
        page.wait_for_timeout(1500)
        shot = False
        for i in range(6):
            page.wait_for_timeout(2000 if 'quick' in sk or 'subitize' in sk else 700)
            if i == 0:
                # A wrong answer first: any tappable card that is not the correct one.
                page.evaluate("""() => { const c = [...document.querySelectorAll('.toyroot g.tap')].filter(g => !g.dataset.ok && g.querySelector('rect,circle') && g.getBoundingClientRect().top > 120);
                  const w = c[c.length - 1]; if (w) w.dispatchEvent(new PointerEvent('pointerdown', {bubbles: true})); }""")
                page.wait_for_timeout(9000)
            if not shot:
                page.screenshot(path=str(OUT / f'{sk}.png')); shot = True
            # Place-value needs building before checking: build the number.
            page.evaluate("""() => { const t = document.querySelector('.toyroot g[data-target]');
              if (t) { const n = Number(t.dataset.target), tap = (k) => document.querySelector(`.toyroot g[data-bin=${k}]`).dispatchEvent(new PointerEvent('pointerdown', {bubbles: true}));
                const built = document.querySelectorAll('.toyroot g.tap g.fb rect').length;
                for (let i = 0; i < Math.floor(n / 10); i++) tap('tens'); for (let i = 0; i < n % 10; i++) tap('ones'); } }""")
            page.evaluate("""() => { const ok = document.querySelector('.toyroot g[data-ok]'); if (ok) ok.dispatchEvent(new PointerEvent('pointerdown', {bubbles: true})); }""")
            page.wait_for_timeout(1400)
        page.wait_for_timeout(500)
        ended = page.evaluate("!!document.querySelector('.toyroot g.popin')")
        rec = page.evaluate(f"JSON.parse(localStorage.getItem('kilalao.learn.v1')||'{{}}')")
        pid = rec.get('active')
        r = (rec.get('mastery', {}).get(pid, {}) or {}).get(sk)
        status = 'ok' if len(errors) == before and r and r['n'] >= 1 else 'ERRORS'
        print(f"{sk:20s} {status}  attempts={r['n'] if r else 0} p={r['p']:.2f}" if r else f'{sk:20s} {status}')
    b.close()
for e in errors:
    print(e)
sys.exit(1 if errors else 0)

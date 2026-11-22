#!/usr/bin/env python3
"""Learn test: plays a full lesson for every math skill in headless Chromium.

For each skill it starts a fresh profile, opens Learn with ?skill=<id>, lets
the guide's worked example play ("watch"), answers the guided items
("together"), answers the first independent item wrongly (to run the help),
then answers the rest correctly. It fails
on any JavaScript error and saves one screenshot per skill to build/learn/.

Usage: python3 tools/learn-test.py [http://localhost:4210] [skill-id ...]
"""
import os, sys, json, pathlib, re
from playwright.sync_api import sync_playwright

BASE = sys.argv[1] if len(sys.argv) > 1 and sys.argv[1].startswith('http') else 'http://localhost:4210'
ONLY = [a for a in sys.argv[1:] if not a.startswith('http')]
OUT = pathlib.Path(__file__).resolve().parent.parent / 'build' / 'learn'
OUT.mkdir(parents=True, exist_ok=True)
root = pathlib.Path(__file__).resolve().parent.parent / 'app/js/learn/curriculum'
SKILLS = ['math.' + m for m in re.findall(r"S\('([a-z0-9]+)'", (root / 'math.js').read_text())]
SKILLS += ['feel.' + m for m in re.findall(r"S\('([a-zA-Z0-9]+)'", (root / 'feelings.js').read_text())]
SKILLS += ['logic.' + m for m in re.findall(r"S\('([a-zA-Z0-9]+)'", (root / 'logic.js').read_text())]
SKILLS += [f'read.{l}.{m}' for l, m in re.findall(r"S\('(en|fr)', '([a-z0-9]+)'", (root / 'reading.js').read_text())]

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
    ACT_RIGHT = r"""() => {
      const q = (s) => document.querySelector('.toyroot ' + s), all = (s) => [...document.querySelectorAll('.toyroot ' + s)];
      const fire = (g) => g && g.dispatchEvent(new PointerEvent('pointerdown', {bubbles: true}));
      // touch-to-count objects first (as a child would)
      all('g.tap > g.fb.invite').forEach((inner) => fire(inner.parentNode));
      const t = q('g[data-target]');
      if (t) { let g;
        while ((g = all('g.tap').find(x => !x.dataset.bin && !x.dataset.target && x.querySelector('g.fb rect') && x.getBoundingClientRect().left > 300 && x.getBoundingClientRect().right < 980 && x.getBoundingClientRect().top > 250 && x.getBoundingClientRect().top < 620))) fire(g);
        const n = Number(t.dataset.target);
        for (let i = 0; i < Math.floor(n / 10); i++) fire(q('g[data-bin=tens]')); for (let i = 0; i < n % 10; i++) fire(q('g[data-bin=ones]'));
        fire(t); return 'built'; }
      const wd = q('g[data-word]');
      if (wd) { all('g[data-letter]').forEach((g) => { if (g.getAttribute('transform') && /translate\([0-9.]+ 345\)/.test(g.getAttribute('transform'))) fire(g); });
        for (const ch of wd.dataset.word) { const t = all('g[data-letter]').find((g) => g.dataset.letter === ch && !/ 345\)/.test(g.getAttribute('transform'))); fire(t); }
        fire(wd); return 'spelled'; }
      const gv = q('g[data-give]');
      if (gv) { all('g[data-inb="1"]').forEach(fire); const n = Number(gv.dataset.give); all('g[data-item]').slice(0, n).forEach(fire); fire(gv); return 'given'; }
      const rt = q('g[data-route]');
      if (rt && rt.dataset.route) { all('g[data-undo]').forEach((u) => { for (let i = 0; i < 12; i++) fire(u); });
        for (const ch of rt.dataset.route) fire(q(`g[data-arrow="${ch}"]`)); fire(rt); return 'coded'; }
      fire(q('g[data-ok]')); return 'picked'; }"""
    ACT_WRONG = """() => {
      const all = (s) => [...document.querySelectorAll('.toyroot ' + s)];
      const fire = (g) => g && g.dispatchEvent(new PointerEvent('pointerdown', {bubbles: true}));
      const t = document.querySelector('.toyroot g[data-target]');
      if (t) { fire(document.querySelector('.toyroot g[data-bin=ones]')); fire(t); return; }
      const gv = document.querySelector('.toyroot g[data-give]');
      if (gv) { fire(gv); return; }  // empty basket: wrong
      const wd = document.querySelector('.toyroot g[data-word]');
      if (wd) { fire(wd); return; }  // empty word: wrong
      const rt = document.querySelector('.toyroot g[data-route]');
      if (rt && rt.dataset.route) { const u = document.querySelector('.toyroot g[data-undo]'); for (let i = 0; i < 12; i++) fire(u); fire(rt); return; }  // empty program: wrong
      const c = all('g.tap').filter(g => !g.dataset.ok && !g.dataset.bin && !g.dataset.item && !g.dataset.tile && !g.dataset.letter && g.querySelector('rect,circle') && g.getBoundingClientRect().top > 120 && g.getBoundingClientRect().left > 250);
      fire(c[c.length - 1]); }"""
    for sk in SKILLS:
        if ONLY and sk not in ONLY and sk.split('.')[1] not in ONLY and sk.split('.')[0] not in ONLY:
            continue
        before = len(errors)
        page.goto(f'{BASE}/?skill={sk}')
        # A fresh 3-year-old, so every skill is new and gets its full lesson.
        page.evaluate("""localStorage.setItem('kilalao.learn.v1', JSON.stringify({active: 't', profiles: [{id: 't', name: 'Test', avatar: 'fox', age: 3, lang: 'en', created: 1}], mastery: {}, log: {}}))""")
        page.goto(f'{BASE}/?skill={sk}')
        page.wait_for_timeout(700)
        page.evaluate("document.querySelector('.toy[aria-label^=\"learn\"]').click()")
        page.wait_for_timeout(1200)
        seen, wrong_done, steps, shots = set(), False, 0, 0
        for _ in range(160):
            mode = page.evaluate("document.querySelector('.toyroot svg > g')?.dataset.mode || ''")
            if mode == 'end':
                break
            if mode == 'watch':
                if 'watch' not in seen:
                    page.wait_for_timeout(5000); page.screenshot(path=str(OUT / f'{sk}-1-watch.png')); seen.add('watch')
                page.wait_for_timeout(1000); continue
            page.wait_for_timeout(3200)  # stage intro + question
            if mode == 'together' and 'together' not in seen:
                page.screenshot(path=str(OUT / f'{sk}-2-together.png')); seen.add('together')
            if mode == 'own' and not wrong_done:
                page.screenshot(path=str(OUT / f'{sk}-3-own.png'))
                page.evaluate(ACT_WRONG); wrong_done = True
                page.wait_for_timeout(16000)
            page.evaluate(ACT_RIGHT)
            page.wait_for_timeout(1800)
            steps += 1
        rec = page.evaluate("JSON.parse(localStorage.getItem('kilalao.learn.v1')||'{}')")
        pid = rec.get('active')
        r = (rec.get('mastery', {}).get(pid, {}) or {}).get(sk)
        ended = page.evaluate("document.querySelector('.toyroot svg > g')?.dataset.mode") == 'end'
        status = 'ok' if len(errors) == before and ended and r and r['n'] >= 3 else 'ERRORS'
        print(f"{sk:20s} {status}  ended={ended} own-answers={r['n'] if r else 0} right={r['c'] if r else 0}", flush=True)
    b.close()
for e in errors:
    print(e)
sys.exit(1 if errors else 0)

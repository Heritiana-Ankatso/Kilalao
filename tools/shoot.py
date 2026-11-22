#!/usr/bin/env python3
"""Smoke test: open every toy in headless Chromium, report JS errors and save screenshots.

Usage: python3 tools/shoot.py [http://localhost:4210] [toy ...]
Needs: pip install playwright && playwright install chromium
(or set CHROMIUM=/path/to/chrome to use an existing browser binary)
"""
import os
import sys
import pathlib
from playwright.sync_api import sync_playwright

BASE = sys.argv[1] if len(sys.argv) > 1 and sys.argv[1].startswith('http') else 'http://localhost:4210'
ONLY = [a for a in sys.argv[1:] if not a.startswith('http')]
OUT = pathlib.Path(__file__).resolve().parent.parent / 'build' / 'shots'
OUT.mkdir(parents=True, exist_ok=True)
TOYS = ['busyboard', 'shapes', 'blocks', 'silly', 'marble', 'town', 'house', 'code', 'sequencer',
        'radio', 'puzzle', 'islands', 'book', 'space', 'dinos', 'phonics', 'draw']

errors = []
with sync_playwright() as p:
    args = ['--autoplay-policy=no-user-gesture-required']
    exe = os.environ.get('CHROMIUM') or next((c for c in ['/opt/pw-browsers/chromium'] if os.path.exists(c)), None)
    try:
        b = p.chromium.launch(args=args)
    except Exception:
        if not exe:
            raise
        b = p.chromium.launch(args=args, executable_path=exe)
    page = b.new_page(viewport={'width': 1280, 'height': 800}, has_touch=False)
    page.on('pageerror', lambda e: errors.append(f'pageerror: {e}'))
    page.on('console', lambda m: m.type == 'error' and 'sw.js' not in m.text and errors.append(f'console: {m.text}'))
    page.goto(BASE)
    page.wait_for_timeout(1200)
    page.screenshot(path=str(OUT / '00-shelf.png'))
    for i, toy in enumerate(TOYS, 1):
        if ONLY and toy not in ONLY:
            continue
        before = len(errors)
        page.evaluate(f"document.querySelector('.toy[aria-label=\"{toy}\"]').click()")
        page.wait_for_timeout(2500)
        page.mouse.click(700, 400)
        page.wait_for_timeout(1500)
        page.screenshot(path=str(OUT / f'{i:02d}-{toy}.png'))
        page.evaluate("document.querySelector('.home-btn')?.click()")
        page.wait_for_timeout(800)
        status = 'ok' if len(errors) == before else 'ERRORS'
        print(f'{toy:10s} {status}')
    b.close()

for e in errors:
    print(e)
sys.exit(1 if errors else 0)

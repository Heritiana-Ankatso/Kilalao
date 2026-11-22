# Kilalao

A calm digital playroom for children aged 2 to 7: open-ended toys, no text, no scores, no ads, works offline.

> Work in progress: 13 of 17 toys are done (see `app/js/toys/`). Still to come: Busy Book, Dinosaurs, Phonics, Drawing, offline service worker, app manifest and icons.

Run locally:

```bash
python3 -m http.server 4210 -d app
```

Then open http://localhost:4210. Smoke test: `python3 tools/shoot.py` (needs Playwright + Chromium).

Licence: MIT.

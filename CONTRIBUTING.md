# Contributing to Kilalao

Contributions are welcome, including new toys, fixes, accessibility work and translations of the adult corner. Kilalao is made for very young children, so the rules below apply to every change.

## Design rules

**For children**

- **No text in toys.** Children may not read yet. The only exceptions are the letters in Phonics and, in Learn, numerals and symbols, plus the question text shown to readers from age 7. Words belong only in the adult corner.
- **No goals, scores, stars, levels, timers, streaks or rewards.** Nothing is "correct" or "wrong" and nothing ends.
- **No ads, links, purchases, accounts, analytics or network requests.**
- **Calm by default:** slow easing, no flashing, no sudden loud sounds and no screen shake. Respect `kit.calm` (calm mode) by reducing particles and speed.
- **Big, forgiving touch targets.** Small hands miss, so add transparent hit areas where shapes are thin.
- **Original work only.** Do not copy names, characters, art, music or levels from existing apps or games.
- **Inclusive people.** Use the shared `people.js` characters, or follow their range of skin tones, hair and aids.

**Visual style**

- Use the muted palette `C` in `lib.js`.
- Outlines use `stroke: C.ink` with a width of 3 to 4.
- Keep the **top-left 90 × 90** area free (home button) and the **top-right corner** free (adult lock).

**Learn area**

- Children never see scores, stars, streaks, timers or rewards. Progress belongs in the adult report.
- Feedback stays calm: a soft chime for right answers, and a demonstration (not a buzzer) after a wrong one.
- **Teach, don't only test.** Every template needs a `help()` that shows the method with the guide's hand, and a worked example for *Watch*. A child must be able to learn the skill without sound and without reading.
- Every prompt must exist in English, French and Malagasy. Mark new French and Malagasy strings for native-speaker review in the pull request.
- New skills need an adult-facing description, a typical age and prerequisites. Ask a teacher to review the sequence.

## Technical rules

- Vanilla ES modules, no dependencies, no build step, no external assets or fonts. Sounds are synthesized with `audio.js` and art is drawn in SVG or canvas.
- A toy is `export default function (root, kit)`:
  - Use `makeStage(root, bg)` for SVG or `makeCanvas(root, bg)` for canvas. Both use a fixed 1600 × 900 world, letterboxed. Drawing is the exception and uses full resolution.
  - Create SVG with `s()`. Convert pointer positions with `pt()`. Handle drag and tap with `drag()`. Restart CSS animations with `replay()`.
  - Create timers and global listeners **only** through `kit.loop`, `kit.every`, `kit.after`, `kit.on` and `kit.add`. These are cleaned up automatically when the child goes back to the shelf. Listeners on the toy's own elements may use `addEventListener` directly.
  - Play sounds through `kit.sfx` and `kit.audio`.
- Put CSS animation classes (`wiggle`, `hop`, `popin`, ...) only on inner `<g>` elements that have **no** `transform` attribute. A CSS transform would replace the attribute.
- Keep each toy in one self-contained file (roughly 800 lines at most).
- Code style: 2-space indent, single quotes, semicolons. Explain the non-obvious parts in short comments.

## Before opening a pull request

1. Run `python3 -m http.server 4210 -d app` and try the change on a touch device or in device emulation.
2. Run `python3 tools/shoot.py`. Every toy must print `ok`. Look at the screenshots in `build/shots/`. For Learn changes, also run `python3 tools/learn-test.py` and look at `build/learn/`.
3. If you added or renamed files under `app/`, update `FILES` in `app/sw.js` and bump `VERSION`.
4. Check offline mode: load the app once, turn off the network and reload.
5. If you can, build the Android app (`cd android && ./gradlew assembleDebug`) and try it on a device. New file types under `app/` may need a MIME type in `MainActivity.java`.
6. Keep commits focused and describe what a child would see or hear differently.

## Reporting issues

Please include the device, the browser and the toy, plus what you expected and what happened. A screenshot helps.

By contributing, you agree that your work is released under the [MIT licence](LICENSE).

# Kilalao

**A calm digital playroom and adaptive learning app for children aged 2 to 12.** Seventeen open-ended toys sit on a wooden shelf. There is no text, no instructions, no scores, no levels, no timers, no ads, no links and no purchases. Everything is drawn and synthesized in the browser, so the whole app works offline once it has been opened.

*Kilalao* means "toy" or "play" in Malagasy.

- **Open-ended:** toys can't be won or lost. A child explores, builds, makes music and tells stories at their own pace.
- **Low stimulation:** slow movement, a muted warm palette, hand-drawn outlines and soft foley sounds. There are no flashing rewards or sudden noises.
- **Private:** no accounts, no analytics and no network requests. Settings stay on the device.
- **Small and dependency-free:** vanilla ES modules, no build step, no external fonts or assets.

## Design principles

Kilalao draws on Montessori and low-stimulation ideas about play:

| Principle | How the app applies it |
|---|---|
| Child-led exploration | Every toy is a sandbox with no goal, no right answer and no "next level". |
| Real cause and effect | Each touch does one clear, physical thing: a switch lights a bulb, a frog jumps to a lily pad. |
| Calm senses | A muted palette, slow easing, quiet synthesized sounds, no confetti, no stars and no praise voice-overs. |
| No reading required | Toys contain no words. The only letters are the ones in Phonics, which is about letters. |
| Order and care | Pieces can be tidied back into their trays. The shelf is a fixed and predictable place to come back to. |
| Limits set by adults | A daily play-time limit lets the toys gently fall asleep instead of cutting play off abruptly. |
| Inclusion | People in Town and House have a range of skin tones and hair. Some wear glasses or hearing aids, and some use a wheelchair or a prosthetic leg. |

## Learn: the adaptive learning path (ages 3–12)

The first item on the shelf, **Learn**, is a curriculum that adapts to each child. It complements the free-play toys:

- **Profiles:** each child picks their own animal. Adults set the name, age and language in the adult corner.
- **Adaptive path:** every answer updates a per-skill mastery estimate (Bayesian Knowledge Tracing). The next session targets the edge of what the child knows, mixes in spaced review, and starts near the child's age. Easier skills are checked rather than taught, and fall back into teaching if a child misses them.
- **Calm feedback:** a right answer gets a soft chime. A first wrong answer gets a short demonstration (for example, counting the objects together), then the correct answer glows. Children never see scores, stars, streaks or rewards.
- **Three languages:** English, French and Malagasy prompts and number words. Narration uses recorded voice packs when present (needed for Malagasy, see `app/audio/README.md`), otherwise the device voice. It stays silent rather than using a voice in the wrong language. From age 7, the question is also shown as text.
- **Adult report:** in the adult corner, each child's skills are listed as secure, in practice or not started, with recent accuracy and the skills being worked on.

**Phase 1 (this release): Math, 37 skills from age 3 to about 10,** built from 10 interactive templates. The skills run from counting, subitising and number bonds through place value with tens-and-ones blocks, addition and subtraction, skip counting and equal groups, to fractions on a number line. Reading, logic and coding, and social-emotional learning follow. See [docs/ROADMAP.md](docs/ROADMAP.md) for the full plan, scale targets and constraints.

## The 17 toys

| # | Toy | What happens |
|---|---|---|
| 1 | **Busy Board** | Switches light bulbs, gears turn, a dial colours a lamp, a bolted door opens, a bell rings and beads slide. |
| 2 | **Shapes** | One soft shape breathes in the middle. Tap it to melt it into the next shape, or drag it and watch it drift home. |
| 3 | **Blocks** | Stack wooden blocks from the tray and knock towers over with a swipe. |
| 4 | **Silly Blocks** | Build creatures from bodies, eyes, mouths, arms, legs, horns and wheels. |
| 5 | **Marble Machine** | Drop marbles and move and turn wooden ramps and pieces. |
| 6 | **Town & Shops** | Move people around, shop at the grocery, cook at the café, put out a small fire, stop traffic and use the swing. |
| 7 | **House & Dress-Up** | A cut-away dollhouse with a wardrobe for skin, hair, clothes and accessibility aids. Lamps, the stove and the tap work. |
| 8 | **Code Factory** | Arrow tiles steer little workers past machines that paint, wrap and ring. Loops become little songs. |
| 9 | **Sequencer** | Place pebbles in holes. A sweeping light plays them on a pentatonic scale, so any pattern sounds gentle. |
| 10 | **Radio** | Turn the knob between five generated songs while three friends dance. |
| 11 | **World Puzzle** | Land tiles snap into a frame and their animals come alive. |
| 12 | **Islands** | Sail a boat through the mist. Islands wake up as you pass, and the sea is full of creatures. |
| 13 | **Busy Book** | Six picture pages: a lantern festival, a festival of lights, a spring garden, winter, autumn and a dusk pond. A sticker strip lets children decorate any page. |
| 14 | **Space** | Planets, moons, astronauts and a rocket float and bump softly into each other. |
| 15 | **Dinosaurs** | Friendly dinosaurs stroll and can be carried. Each reacts when tapped, a volcano puffs, a pterosaur circles the sky and eggs hatch after three taps. |
| 16 | **Phonics** | Nine picture cards (cat, sun, dog, hat, bus, cup, pig, bed, fox). Each letter lights up with its sound, then the letters slide together and the word is said. |
| 17 | **Drawing** | A crayon-textured paper with nine colours, a rainbow crayon, three sizes and an eraser. Several fingers can draw at once. Starting a new sheet needs a short hold. |

## Adult corner

Adult settings are hidden from children:

1. Press and hold the faint lock in the **top-right corner** for about **2 seconds** until the ring fills.
2. Answer a short arithmetic question (a multiplication of two small numbers).

Adults can change the following:

- **Volume** and sound on/off.
- **Calm mode:** fewer particles and slower motion.
- **Daily play-time limit:** when the limit is reached, the toys fall asleep under a starry sky. Waking them from the adult corner resets the day's count.
- **Seasons** on the shelf (follow the calendar, off, or a fixed season) and the **hemisphere** (auto-detected from the time zone).
- **Learning:** add a profile for each child (name, age 3–12, language, animal). The panel shows each child's progress report.
- **Phonics voice:** the device's built-in, offline speech synthesis.
- **Hide toys** from the shelf.

Settings are stored in `localStorage` on the device only.

## Install and use offline

Kilalao is a Progressive Web App:

- Open it once in a browser. The service worker (`app/sw.js`) precaches every file.
- Use **Add to Home Screen** (iOS and Android) or **Install app** (desktop Chrome and Edge). It opens fullscreen in landscape mode.
- After the first visit it works without any network connection.

## Android app

The `android/` folder holds a small native Android wrapper. It packages the whole `app/` folder inside the APK, so the toys work offline from the first launch. The app asks for **no permissions**. It runs full screen in landscape on Android 7.0 (API 24) or newer, on phones and tablets.

**Install on a phone or tablet (sideloading)**

1. Copy `kilalao-<version>.apk` to the device, or download it from the repository's *Releases* page.
2. Open it. When Android asks, allow your browser or file manager to install unknown apps.
3. Tap **Install**. Kilalao then appears in the app drawer.

**How the app differs from the website**

- The **Back** button closes the open toy or the adult panel. On the shelf it does nothing, so a child cannot leave the app by accident. Adults can leave with the system Home gesture.
- Phonics speaks through Android's own **text-to-speech engine**, because the Android WebView has no speech synthesis. An English voice must be installed (Settings → System → Languages → Text-to-speech).
- Settings are kept per device, exactly as in the browser.

**Build it yourself** (needs JDK 17 or newer and the Android SDK with platform 35):

```bash
cd android
```

```bash
./gradlew assembleDebug
```

The APK is written to `android/app/build/outputs/apk/debug/`. For a signed release build, create `android/keystore.properties`. It is git-ignored and must never be committed:

```properties
storeFile=/path/to/kilalao-release.jks
storePassword=...
keyAlias=kilalao
keyPassword=...
```

Then run `./gradlew assembleRelease`. Every update must be signed with the **same key**, or Android refuses to install it over the existing app. Before each release, increase `versionCode` and `versionName` in `android/app/build.gradle`.

**Automatic builds:** `.github/workflows/android.yml` builds a debug APK on every push to `main`. Pushing a tag such as `v1.0.1` builds a signed APK and attaches it to a GitHub Release. This needs the repository secrets `KILALAO_KEYSTORE_BASE64` (`base64 -w0 kilalao-release.jks`), `KILALAO_KEYSTORE_PASSWORD` and `KILALAO_KEY_PASSWORD`.

## Run locally

```bash
python3 -m http.server 4210 -d app
```

Then open <http://localhost:4210>. Any static file server works. Service workers need `localhost` or HTTPS.

### Smoke test

`tools/shoot.py` opens every toy in headless Chromium, reports JavaScript errors and saves screenshots to `build/shots/`:

```bash
pip install playwright
```

```bash
python3 -m playwright install chromium
```

```bash
python3 tools/shoot.py
```

The script prints `ok` for each toy and exits non-zero if anything logs an error. To use an existing Chromium binary, set `CHROMIUM=/path/to/chrome`.

## Project layout

```
app/                     Everything that is served (deployed as-is)
  index.html             Single page; loads js/main.js
  manifest.webmanifest   PWA manifest
  sw.js                  Cache-first service worker (bump VERSION on change)
  css/style.css          Shell, shelf, adult panel, shared toy animations
  icons/                 App icons (SVG + PNG, incl. maskable)
  js/
    main.js              Shelf, toy loading, kit, play-time limit, SW registration
    lib.js               Palette, SVG/canvas stages, pointer helpers, loop
    audio.js             Synthesized sounds, instruments, speech
    settings.js          Adult settings and daily play time (localStorage)
    parent.js            Hold-to-open lock, arithmetic gate, settings panel
    season.js            Seasonal decorations on the shelf
    icons.js             Shelf icon for every toy
    people.js            Shared diverse characters (Town, House)
    toys/<id>.js         One file per toy (toys/learn.js runs the Learn sessions)
    learn/               Learning engine: profiles, mastery (BKT), scheduler,
                         i18n (en/fr/mg), voice, drawing kit,
                         curriculum/<subject>.js (skill graphs), templates/<subject>.js
  audio/                 Optional recorded voice packs (manifest.json + clips)
android/                 Native Android wrapper (WebView + bundled app/)
docs/ARCHITECTURE.md     How the pieces fit together
tools/shoot.py           Headless smoke test and screenshots
tools/learn-test.py      Plays every Learn skill (wrong answer, help, right answers)
tools/recording-script.mjs  Prints the voice-recording script for a language
.github/workflows/       GitHub Pages deployment and Android builds
```

## Adding a toy

1. Create `app/js/toys/<id>.js`:

   ```js
   import { s, C, makeStage, drag } from '../lib.js';

   export default function mytoy(root, kit) {
     const svg = makeStage(root, C.cream);          // fixed 1600x900 world
     const ball = s('circle', { cx: 800, cy: 450, r: 80, fill: C.terra,
       stroke: C.ink, 'stroke-width': 4, class: 'tap' }, svg);
     drag(ball, svg, { tap: () => kit.sfx.boing() });
     kit.loop((dt, t) => { /* animate */ });       // auto-stopped on exit
   }
   ```

2. Add `<id>` to `TOYS` in `app/js/main.js` and to the `TOYS` list in `tools/shoot.py`.
3. Add a shelf icon to `ICONS` in `app/js/icons.js` and a name to `NAMES` in `app/js/parent.js` (the name is only shown to adults).
4. Add the file to `FILES` in `app/sw.js` and bump `VERSION`.
5. Run `python3 tools/shoot.py` and check the screenshot.

See [CONTRIBUTING.md](CONTRIBUTING.md) for the design rules every toy must follow.

## Adding a skill or a template

Most curriculum work is data:

1. To add a **skill**, add one line to `app/js/learn/curriculum/math.js` with an id, typical age, prerequisites, template, parameters and an adult-facing description.
2. To add a **template** (a new interactive mechanic), add an entry to `TEMPLATES` in `app/js/learn/templates/<subject>.js`. Its `make(rng, params)` returns `{ key, vars, guess, build(ctx) }`. `build` draws the item and answers through `ctx.choices()` or `ctx.pick()`, and may return `{ help }` for the demonstration after a wrong answer.
3. New prompts go into all three languages in `app/js/learn/i18n.js`.
4. Run `python3 tools/learn-test.py <skill-id>` and look at `build/learn/`. To try a skill by hand, open `http://localhost:4210/?skill=math.<id>` and tap Learn.

## Licence

[MIT](LICENSE) © 2026 Heritiana Ankatso. All illustrations and sounds are original and generated in code.

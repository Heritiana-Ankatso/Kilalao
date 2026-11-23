# Architecture

Kilalao is a static single-page app: `app/index.html` loads one ES module, `js/main.js`. There is no bundler, framework or server code. Everything under `app/` is deployed exactly as it is.

```
index.html ──► main.js ──┬── themes.js     (six themed cubbies: entries, adult-facing goals)
                         ├── settings.js   (localStorage: settings + daily play time)
                         ├── audio.js      (Web Audio synth, instruments, speech)
                         ├── icons.js      (shelf icons, inline SVG strings)
                         ├── parent.js     (hold-to-open lock, arithmetic gate, settings panel)
                         ├── season.js     (seasonal layer on the shelf)
                         ├── lib.js        (palette, stages, pointer + loop helpers)
                         └── import('./toys/<id>.js')   lazily, on first open
```

## Shell (`main.js`)

- **Shelf:** one *cubby* per theme in `THEMES` (`themes.js`), each a tinted box with a small picture badge and the entries for that theme, without the ones hidden in settings. An entry is a toy id or `learn:<subject>`; `parseEntry()` turns `learn:logic` into the Learn toy opened with `kit.opts.subject = 'logic'`, which `tracksFor(profile, subject)` in `toys/learn.js` uses to offer only that subject. A seasonal decoration layer (`season.js`) goes on top. The shelf scrolls sideways if the screen is narrow.
- **Opening a toy:** the module is loaded with a dynamic `import()`. A full-screen `.view` holds a `.toyroot` and the round home button. The toy's default export is called as `toy(root, kit)`. The shelf and the view cross-fade with CSS transitions.
- **Closing:** the home button calls `kit.dispose()`, which runs every registered cleanup in reverse order. The view is then removed after its fade-out.
- **Play-time limit:** every 5 s the shell adds the elapsed time (not counting hidden tabs or an open adult panel) to the day's total in `settings.js`. When the limit is reached, the open toy closes and a "bedtime" scene fades in. Only the adult corner wakes the toys.
- **Service worker** registration (on HTTPS or localhost only).

## The kit

Each toy receives a fresh kit:

| Member | Purpose |
|---|---|
| `kit.sfx` | Ready-made soft sounds (`click`, `chime`, `thud`, `paper`, `roar`, ...). |
| `kit.audio` | Low-level synth: `tone`, `noise`, `pluck`, `inst.*` instruments, `now()`, `say()`. |
| `kit.settings` | Read adult settings, for example `kit.settings.get('speech')`. |
| `kit.calm` | `true` when calm mode is on. Toys reduce particles and speed. |
| `kit.loop(fn)` | Calls `fn(dt, t)` every animation frame (dt is capped at 50 ms). |
| `kit.every`, `kit.after` | Intervals and timeouts. |
| `kit.on(target, ev, fn)` | Event listeners on `window` or other shared targets. |
| `kit.add(fn)` | Any other cleanup, such as disconnecting a `ResizeObserver` or cancelling speech. |

Because everything goes through the kit, leaving a toy always stops its sounds, timers and frame loops. No toy can leak work onto the shelf.

## Rendering

- **SVG toys** call `makeStage(root, bg)`. It returns an `<svg>` with a fixed `viewBox` of 1600 × 900, letterboxed with `xMidYMid meet`. It includes shared filters (`#wob`, `#soft`, `#glow`) and a `defs` element for toy-specific gradients. Elements are created with `s(tag, attrs, parent)`. Positions are usually set every frame with a `transform` attribute.
- **Canvas toys** call `makeCanvas(root, bg)`. It uses the same world size, with device-pixel-ratio scaling, `begin()` to clear and set the transform, and `toWorld(e)` for pointer coordinates.
- **Drawing** is the exception. It uses a full-resolution canvas the size of the screen. A hidden "keeper" canvas remembers areas that a smaller window would cut off, so the drawing survives resizes and rotation.
- **CSS animations** (`style.css`, section *Shared toy animations*) such as `wiggle`, `hop`, `popin`, `grow`, `bob` and `flicker` are restarted with `replay(el, cls)`. They are placed on inner `<g>` elements that have no `transform` attribute, because a CSS transform would otherwise replace the attribute. The `fb`, `fbb` and `fbt` classes set the transform origin to the centre, bottom or top of the element's own box.

## Input

`drag(el, svg, handlers)` unifies mouse, pen and touch through Pointer Events. It listens on `window` after `pointerdown`, so moving an element to another parent during a drag never loses the pointer. A movement of less than 10 world units counts as a tap. Multi-touch works because each pointer is tracked by its `pointerId`. `body` uses `touch-action: none`, so the browser never scrolls or zooms during play.

## Audio

`audio.js` creates one `AudioContext` on the first touch (browser autoplay rules) and routes it through a master gain, a gentle low-pass filter and a compressor. All sounds are built from oscillators, filtered noise and a Karplus–Strong plucked string. Nothing is downloaded. `say()` uses the device's own `speechSynthesis` voices, which work offline on most devices. It is used only by Phonics and only when the adult setting allows it.

## Settings and privacy

`settings.js` keeps a small JSON object in `localStorage` (`kilalao.settings.v1`) and the day's play time (`kilalao.played.v1`). Subscribers such as the shelf and the volume control react to changes. No data leaves the device.

## Offline

`sw.js` precaches an explicit list of every file under `app/` in a versioned cache (`kilalao-vX.Y.Z`). It serves requests cache-first and falls back to the network, adding any extra same-origin file to the cache. On `activate` it deletes older `kilalao-*` caches. **When any served file changes, bump `VERSION`.** Otherwise installed copies keep the old files.

## Learn engine (`app/js/learn/`)

```
toys/learn.js ── profiles.js   children on this device (localStorage kilalao.learn.v1)
              ├─ mastery.js    BKT update, frontier, spaced review, session plan, report
              ├─ curriculum/   skill graphs: {id, age, prereq, template, params, desc}
              ├─ templates/    interactive mechanics: make(rng, params) -> item
              ├─ draw.js       objects, ten-frames, base-ten blocks, cards, numerals
              ├─ i18n.js       prompts + number words (en, fr, mg), feeling words, clip plans
              ├─ together.js   try-it-together cards (one per template, en + fr)
              ├─ report.js     anonymous testing report (all subjects)
              └─ voice.js      recorded clips -> device voice -> silence
```

- **Mastery** follows Bayesian Knowledge Tracing: slip 0.1, learning rate 0.12, and guess equal to the item's chance level (e.g. 1/3 for three choices). A skill is secure at P ≥ 0.95 after at least 3 attempts. Only the **first** answer to each item is recorded; later tries are for learning.
- **Placement:** skills a year or more below the child's age start as *assumed* (P = 0.96). They are not taught, but the scheduler probes them through review, hardest first. A miss drops them back onto the teaching frontier.
- **Scheduling:** the *frontier* is the set of unsecured skills whose prerequisites are secure. `planLesson()` picks the first frontier skill and builds a lesson:
  - A new skill gets `watch` ×1, `together` ×2 and `own` ×4. A skill already in practice gets `together` ×1 and `own` ×4.
  - One or two spaced-review items (`own`) close the lesson. Review intervals double from 1 to 64 days with each successful review.
  - Only `own` answers update mastery.
- **Lesson stages in the runner (`toys/learn.js`):**
  - `watch` shields input and runs the template's `solve()`, or by default `help()` then a press on the right answer. The hand performs every action by dispatching real pointer events.
  - `together` lets a template scaffold the item itself (`guided: true`), or otherwise runs `help()` on the new item before the child answers.
  - `own` waits for the child, and after a first wrong answer runs `help()` on the same item.
- **The guide's hand** (`handPointer` in `draw.js`) moves with a CSS transition above the activity. `ctx.point(target)` moves it to a target; `ctx.press(target, action?)` moves, presses, then runs `action` or dispatches `pointerdown` on the target.
- **Templates** generate items from a random source, so practice never repeats exactly. Each returns `help` (teaches the method on this example), optionally `solve` (the full worked example) and `guided`. A template draws in the 1600 × 900 world. Its answers go through `ctx.choices(values, render, answer)` (answer cards) or `ctx.pick(ok, card)` (custom interactions such as building with blocks). It may return `help()`, which runs after a first wrong answer.
- **Voice:** `clipPlan()` splits each prompt into fixed phrases and value clips (`p/add.0`, `n/7`, `f/3-4`). If every clip exists in `app/audio/manifest.json`, the recordings play back to back. Otherwise the device voice is used when it supports the language (`audio.hasVoice`). Otherwise nothing is spoken.
- **Reading** (`curriculum/reading.js`, `templates/reading.js`, `pictures.js`):
  - Skill graphs are per language (`READING.en`, `READING.fr`), with word lists split into sound units. A `_` prefix marks a silent letter.
  - The device-voice approximations of single sounds are in `PHON`.
  - The runner passes `ctx.sound(unit)` and `ctx.word(w)`, which play recorded clips `s/<unit>` and `w/<word>` first. An item's `extra(ctx)` speaks the sound or word right after the prompt.
  - `tracksFor(profile)` in `toys/learn.js` opens reading only in the child's language.
- **Logic and coding** (`curriculum/logic.js`, `templates/logic.js`): 18 skills on the templates `pattern`, `oddone`, `sortit`, `path` and `debug`. In `path` the child builds a program from arrow tiles and runs it; the walker is the quest friend (`ctx.friend`). `debug` shows a program with one wrong arrow to find and fix. The test script drives these through `data-route`, `data-arrow` and `data-undo` attributes.
- **Feelings** (`curriculum/feelings.js`, `templates/feelings.js`): 7 skills on `feelFind`, `feelScene` (five wordless situation scenes, followed by a spoken "why"), `feelHelp` and `breathe` (flower and candle, three slow cycles; the glowing target carries the `invite` class on its inner `g.fb`, like every other template). `feelFace()` draws the five feelings on any animal. Feeling words are spoken through `{feel}` and recorded as `e/<feeling>`.
- **Runner hooks** (`toys/learn.js`): templates receive `ctx.audio`, `ctx.friend` (the quest friend's kind), `ctx.avatar` (the child's animal); the returned item may have `init()` (called after `build`) and `after()` (awaited after a right answer, e.g. to let the walker finish its route).
- **Adult corner** (`parent.js`): `subjects(profile)` lists numbers, reading (in the child's language), thinking and coding, and feelings; each gets a `mastery.summary()` line and rows in the skills table. A *Themes* section lists each cubby's goals from `themes.js`. *Try it together* shows `recentCards()` from `together.js`: one card per template the child practised in the last 14 days (newest first, at most three), in English for English profiles and in French otherwise.
- **Testing kit** (`report.js`, adult panel):
  - The runner logs quest events (`ev: start | end | stuck`) and each solved item's hint level and time (`ms`).
  - Adults add tagged observations (`profiles.addObs`).
  - `buildReport()` writes an anonymous plain-text summary per child and per skill.
- **Village and quests** (`village.js`):
  - `offerQuests()` in `mastery.js` offers the next skill, a nearby skill and a review. `nextFriends()` picks animal friends (never the owl guide or the child's own animal).
  - A finished quest appends `{kind, skill, t}` to `profile.village.helped`, which adds a house and flowers.
  - In a lesson the friend reacts at the bottom right, unless the template has its own friend (`ownFriend`, e.g. the fox in *give*).
- **Hint ladder and flow** (`toys/learn.js`):
  - A wrong answer raises the hint level: 1 calls the template's `cue()`, 2 calls `step()`, 3 calls `help()` and then the right answer glows.
  - Each solved item logs `{hint, m}` for the adult report.
  - Two first-try misses in a row turn the next independent item into a guided one with `easierParams()`. Two items that needed level 3 end the quest.
  - Templates may also return `fb`, a process-feedback prompt key.
- **Characters** (`characters.js` on `rig.js`):
  - Each character is data: a list of parts with parents, explicit pivots and draw functions.
  - The runtime composes three layers per part. *base* is the rest pose. *idle* is recomputed every frame (breathing, blink timers, gaze, ear flicks, and tufts or a tail that follow a beat behind). *act* is tweened for acting beats (`rig.to`, `rig.all`, `rig.seq`, with `sine`, `out`, `in` and `back` easing).
  - Rotation and translation add up across the layers; scale and opacity multiply.
  - The owl exposes `talk`, `lookAt`, `point`, `nod`, `think`, `hop` and `rest`. The fox exposes `lean`, `happy` and `puzzled`.
  - The lesson runner ticks every on-screen rig and drives them: talk while prompting, look and point at the hand's target, nod on a right answer, think before the help.
  - Avatars are static drawings with a CSS eyelid blink.
- **Illustration finish** (`art.js`, rules in `.claude/skills/svg-illustration-finish`):
  - One light from the upper left. `shade()` draws a shape with a soft coloured form shadow (an offset copy clipped to the shape, so it follows the outline and moves with the rig), an optional light patch and an outline in a deep tone of the shape's own colour.
  - `finish(g)` applies the same lighting automatically to flat drawings after they are drawn: the 32 reading pictures, the counting objects and the Phonics cards.
  - Helpers for eyes with catch-lights, fluffy edges and contact shadows. No SVG filters, so drawing stays cheap on low-end tablets.
## Story library (`toys/stories.js`, `stories/library.js`)

Books are data: each has a title, pages (`{ scene, en, fr }`), a closing open question (`ask`) and an optional `decodable` language. `toys/stories.js` draws the shelf of covers and each page scene from a small vocabulary of elements (backgrounds, the fox, feeling faces, objects). Words are separate SVG `text` elements; while the device voice reads a sentence, each word lights up on an estimated timing, and touching a word says it alone. Malagasy profiles get the French books until Malagasy texts are written.

## Learn engine, continued

- **Privacy:** profiles and the attempt log (the last 1,500 answers) stay in `localStorage` and never leave the device.

## Android wrapper

`android/` is a Gradle project with a single class, `MainActivity.java`, and no library dependencies:

- **Bundled web app:** the `syncWebApp` task copies `app/` (without `sw.js`) into the APK assets under `www/` on every build, so the website and the app never drift apart.
- **Serving the files:** a full-screen `WebView` loads `https://appassets.androidplatform.net/www/index.html`. Every request to that reserved host is answered from the assets by `shouldInterceptRequest`, with correct MIME types (ES modules need `text/javascript`). Nothing reaches the network, and navigation to any other host is blocked.
- **Speech bridge:** `window.KilalaoAndroid` exposes `say(text, rate, pitch, volume, lang)`, `hasVoice(lang)` and `stop()`, which use Android `TextToSpeech` with the language chosen per utterance. `audio.say()` and `audio.hush()` prefer it when present, because the WebView has no working `speechSynthesis`.
- **Shell differences:** `main.js` detects the bridge, skips service-worker registration (the files are already on the device) and reports offline play as ready. It also defines `window.kilalaoBack()`, which the Back button calls. It closes the adult panel or the open toy and returns `false` on the shelf.
- **Lifecycle:** the app runs in immersive full screen with a landscape-only orientation. The WebView timers pause when the app goes to the background. The play-time counter already ignores hidden pages.

## Testing

`tools/learn-test.py [subject or skill ...]` plays a full lesson for each skill (watch, together, one wrong independent answer to trigger the help, then right answers) and fails on any JavaScript error or a lesson that does not end. `tools/shoot.py` starts headless Chromium with Playwright, opens the shelf and each shelf entry in turn, taps once in the middle, saves a screenshot to `build/shots/` and fails if any page error or console error occurs.

# Handoff: "best educational gaming app" update (1.7.0, complete on the branch)

**The request:** organise the app by theme, study the best educational apps and why they work, then add their key features to Kilalao.

## Done in this commit (development branch `claude/serene-sagan-ifgo32`)

- **Themed shelf** (`app/js/themes.js`, `main.js`, `icons.js`, CSS `.cubby`): six cubbies.
  - **Numbers & shapes:** `learn:math`, shapes, blocks.
  - **Letters & stories:** `learn:reading`, stories, phonics, book.
  - **Thinking & coding:** `learn:logic`, code, marble, busyboard.
  - **Nature & the world:** islands, space, dinos, puzzle.
  - **Me & others:** `learn:feel`, town, house, silly.
  - **Art & music:** draw, sequencer, radio.
  - `learn:<subject>` opens Learn on that subject: `kit.opts.subject` reaches `tracksFor(profile, subject)`.
- **Logic and coding track** (`learn/curriculum/logic.js`, 18 skills; `learn/templates/logic.js`): templates `pattern`, `oddone`, `sortit`, `path` (arrow coding along a road; the walker is the quest friend) and `debug` (find the wrong arrow).
  - **Tested:** the lesson test (`python3 tools/learn-test.py logic`) passed patAB, oddColor, sortColor, patKind, path1 and oddKind before it was stopped.
  - **Not yet tested:** the remaining 12 logic skills.
- **Feelings track** (`learn/curriculum/feelings.js`, 7 skills; `learn/templates/feelings.js`): `feelFind`, `feelScene` (5 situation scenes with a "why" explanation), `feelHelp` (kind choice) and `breathe` (calm breathing).
  - **Faces:** `feelFace()` draws 5 emotions.
  - **Prompts and words:** the new prompts and `FEEL_WORDS` are in en, fr and mg; mg needs a native speaker's review.
  - **Tested:** screenshots only. The lesson test has not been run.
- **Story library** (`app/js/toys/stories.js`, `app/js/stories/library.js`): 6 original books in en and fr.
  - **Features:** words light up while read (timing is estimated), touching a word says it, and each book ends with an open question.
  - **Decodable books:** *Sam Sat* (en) and *Le rat et la lune* (fr).
  - **Malagasy:** mg profiles get the French books.
- **Runner hooks** (`toys/learn.js`): `ctx.audio`, `ctx.friend`, `ctx.avatar`, `out.init()` (called after `build`), and `out.after()` (awaited after a correct answer).
- **Tests:** `tools/learn-test.py` covers the feel and logic skills, can filter by subject (`learn-test.py logic`), and can solve the coding activities through the `data-route`, `data-arrow` and `data-undo` attributes. `tools/shoot.py` uses the new shelf entry ids.
- **Version:** 1.7.0 (versionCode 8); `sw.js` cache list updated.

## Completed in the follow-up commit

1. **Tests run, one bug fixed.**
   - **Bug:** in `breathe`, the glow (`invite` class) went on the outer card group instead of the inner `g.fb`, unlike every other template. The glowing flower and candle therefore animated from the wrong origin, and the test script could not find them. Fixed in `templates/feelings.js`; the test needed no extra case.
   - `python3 tools/learn-test.py logic`: **all 18 logic skills ok**.
   - `python3 tools/learn-test.py feel`: **all 7 feelings skills ok** (including `breathe`).
   - `python3 tools/shoot.py`: **all 22 shelf entries ok**, no JavaScript errors.
   - The adult corner and the testing report were checked in headless Chromium with seeded data (a French profile and a Malagasy profile): no errors.
   - **Test gap:** for `sortit`, `debug` and `breathe`, the script's deliberate wrong answer is not registered as wrong (4 of 4 right), so the help-after-a-mistake path is not exercised for these templates. `breathe` cannot be answered wrongly by design.
   - The math and reading lessons were not re-run (their code did not change).
2. **Adult corner** (`parent.js`): every subject (numbers, reading in the child's language, thinking and coding, feelings) has a summary line and rows in the skills table; a new **Themes** section lists each cubby's goals and entries from `themes.js`. `learn/report.js` reports all four paths and every skill's description.
3. **Try it together** (`app/js/learn/together.js`, listed in `sw.js`): one at-home activity per template (25 templates) in English and French. The adult corner shows up to three cards for the templates practised in the last 14 days; the testing report includes them. French and Malagasy profiles get the French cards.
4. **`docs/BENCHMARK.md`** written from the notes below, with sources.
5. **Docs updated:** `README.md` (themed shelf, new tracks, Stories as the 18th toy, adult corner), `docs/ARCHITECTURE.md` (themes, logic and feelings tracks, runner hooks, story library, adult corner, tests), `docs/ROADMAP.md` (phase status), `tools/recording-script.mjs` (`e/<feeling>` clips; new prompt keys were already picked up automatically from `i18n.js`).
6. **APK not built:** `android/keystore.properties` is not in the cloud session, so the release build was skipped. Build it on the machine that has the keystore: `cd android && ./gradlew assembleRelease`.

## Still needs a person

- **Native-speaker review:** French and Malagasy prompts and feeling words (`i18n.js`), French story texts (`stories/library.js`), French try-it-together cards (`together.js`).
- **Recordings:** Malagasy voice pack (`node tools/recording-script.mjs mg`), including the new feelings prompts and `e/<feeling>` clips.
- **Testing with children:** see `docs/CHILD-TESTING.md`, especially the coding (`path`, `debug`) and feelings activities.
- **Educator review** of the logic and feelings skill order and ages.
- **Release:** signed APK, then the owner's permission to merge `claude/serene-sagan-ifgo32` into `main`.

## Benchmark notes (for docs/BENCHMARK.md)

- **Hirsh-Pasek et al. (2015), "Putting Education in 'Educational' Apps"** (Psychological Science in the Public Interest): four pillars (active, engaged, meaningful, socially interactive) within a scaffolded learning goal.
  - Distracting "enhancements" (hotspots, sounds) hurt learning.
  - A 2021 follow-up (PMC8916741) scored top apps low on these pillars, especially engagement in free apps with distracting features.
- **Khan Academy Kids:** a broad curriculum across subjects, an adaptive path, a book library, characters, no ads, and free. Reviewers rank it the best free all-round app.
- **Duolingo ABC:** short lessons and read-along stories; feels like a game.
- **Teach Your Monster to Read:** a narrative journey with the child's own creature and systematic phonics. No independent trial found; the closest evidence is the GraphoGame Rime RCT (Ahmed et al., 2020, Frontiers in Education).
- **DragonBox:** maths built into the game mechanics (intrinsic integration, Habgood and Ainsworth 2011). Evidence is mixed but includes a positive randomised trial with 1,850 middle schoolers.
- **Coding:** ScratchJr, Code Karts and Lightbot teach directional sequencing and debugging.
- **Social-emotional:** Daniel Tiger and Sesame "Breathe, Think, Do" use emotion naming and calm breathing.
- **Pok Pok:** a calm, open-ended, wordless playroom (the closest to Kilalao's toys).
- **What Kilalao already had:** adaptive mastery (BKT), worked-example fading (watch, together, your turn), a hint ladder, process feedback, the quest village (autonomy and relatedness), offline use, no ads, and 3 languages.

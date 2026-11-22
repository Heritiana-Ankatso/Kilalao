# Handoff: "best educational gaming app" update (1.7.0, in progress)

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

## Still to do (in order)

1. **Run the tests and fix failures.** Start `python3 -m http.server 4210 -d app` in the background, then run each of these (each takes 10–30 minutes):
   - `python3 tools/learn-test.py logic`
   - `python3 tools/learn-test.py feel`
   - `python3 tools/shoot.py`

   The `breathe` skill completes only after 3 slow cycles. Check that the test script presses the glowing flower and candle (`g.tap > g.fb.invite`); if not, add a case for it.
2. **Adult corner** (`app/js/parent.js`):
   - Make the per-child report loop over every subject: math, reading, logic and feel (today it shows only math and reading).
   - Add a **Themes** section that lists each theme's `goals` from `themes.js`.
   - Make `learn/report.js` include the LOGIC and FEEL skills.
3. **"Try it together" cards** (joint media engagement, the "socially interactive" pillar):
   - Write a short at-home activity for each template, e.g. *count the stairs together* or *find patterns on clothes*, in en and fr.
   - Show the cards in the adult corner for the skills the child practised recently, and include them in the report.
4. **Write `docs/BENCHMARK.md`**: the best apps, why they work, and what Kilalao takes from each. Sources and notes are below.
5. **Update the docs:**
   - `README.md` and `docs/ARCHITECTURE.md`: themes, the new tracks and stories.
   - `docs/ROADMAP.md`: phase status.
   - `tools/recording-script.mjs`: add the new prompt keys and the `e/<feeling>` clips.
6. **Release:**
   - Build the APK: `cd android && ./gradlew assembleRelease --offline`. Release signing needs `android/keystore.properties`, which is git-ignored and is **not** in a fresh cloud session. If it is missing, build debug only or skip the APK, and say so.
   - Commit and push to `claude/serene-sagan-ifgo32` only. Do not merge to `main` without the owner's permission.

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

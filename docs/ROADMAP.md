# Kilalao roadmap: from playroom to full learning app (ages 3–12)

## Goal

Kilalao grows from 17 free-play toys into a complete, free, offline learning app for ages 3 to 12. It has four subjects and three languages, and its learning path adapts to each child. It is measured against Khan Academy Kids, Duolingo ABC and Brilliant.org.

| Decision | Choice |
|---|---|
| Ages | 3–12, in three bands: **Early Years** (3–5), **Primary A** (5–8), **Primary B** (8–12) |
| Subjects | Reading & phonics · Math · Logic, STEM & coding · Social-emotional & creativity |
| Languages | English, French, Malagasy |
| Progress | **Silent adaptive path.** Lessons adapt to mastery. Progress is shown only to adults. Children see no scores, stars, streaks or rewards. |
| Play | The 17 free-play toys stay on the shelf, unchanged in spirit. |

## How Kilalao can reach that scale

The large apps grow by adding hand-made activities. Kilalao grows by **data**:

```
skill graph (data)  ×  activity templates (code)  ×  procedural item generator  ×  3 languages
```

- A **skill** is a small, testable learning goal, for example "add within 10". Each skill has prerequisites, a typical age and the template it uses.
- An **activity template** is one interactive mechanic, for example "count the objects" or "drag tens and ones". One template serves many skills through parameters.
- **Items are generated** from a seeded random generator. A child never runs out of fresh practice, and the curriculum team edits data rather than code.
- **Mastery** is tracked per child and per skill with Bayesian Knowledge Tracing. The scheduler picks the next skill at the edge of what the child knows and mixes in spaced review.

Because of this, "number of lessons" is not a meaningful target. The targets are **skills**, **templates** and **language coverage**.

## Scale targets

| Subject | Skills | Templates | Ages covered |
|---|---|---|---|
| Math | ~180 | ~30 | 3–12 (counting → fractions, decimals, ratio, early algebra, geometry, data) |
| Reading & phonics | ~200 | ~25 | 3–9 (sounds → blending → decodable books → fluency and comprehension) |
| Logic, STEM & coding | ~120 | ~25 | 4–12 (patterns, sorting, sequencing, block coding, simple physics, circuits, data) |
| Social-emotional & creativity | ~60 | ~12 | 3–8 (feelings, routines, empathy scenes, music and art studios) |
| **Total** | **~560 skills** | **~90 templates** | |

Each template yields effectively unlimited items. Each skill is designed for about 10–40 minutes of practice before mastery. Across all bands, that is several hundred hours of adaptive content.

## Phases

| Phase | Content | Status |
|---|---|---|
| **1. Foundation** | Learn area, child profiles, mastery engine (BKT), adaptive scheduler with placement by age and spaced review, three-language narration with recorded-audio packs, adult progress report, **Math track for ages 3–10 (39 skills, 11 templates)**, taught as *watch → together → your turn* lessons with a demonstrating guide | **This release** |
| 1b. Game layer | Quest village (choose a friend to help; friends move in), hint ladder, in-lesson flow adaptation, process feedback; see [PEDAGOGY.md](PEDAGOGY.md) | **Done** |
| 2. Reading A | Letter sounds, phonemic awareness, blending, building words: 14 English skills (phonics), 8 French skills (syllabic). **Still to do:** sight words, decodable readers, Malagasy (needs recordings) | **Done (first part)** |
| — Child testing | Facilitator guide, in-app observations and anonymous report | **Done**; sessions with families are next |
| 3. Math B | Ages 8–12: multi-digit operations, fractions to decimals, measurement, geometry, data | |
| 4. Logic & coding | Patterns, sorting, sequencing, a block-coding playground, simple physics labs (the Brilliant-style track) | |
| 5. Reading B | Fluency, comprehension and writing; leveled story library | |
| 6. Social-emotional & creativity | Feelings scenes, routines, a music studio, an art studio | |
| 7. Polish & reach | Accessibility review, educator review of every skill, classroom mode (several children on one tablet), optional export of progress reports | |

## Constraints

- **Malagasy narration needs human recordings.** Malagasy text-to-speech voices are rarely installed on Android devices. The engine already plays recorded clips from `app/audio/<lang>/` when they exist (see `app/audio/README.md`), and otherwise falls back to the device voice. Without either, the app shows the prompt visually and stays silent rather than mispronouncing. Recording volunteers are needed.
- **Native-speaker review.** All French and Malagasy strings in `app/js/learn/i18n.js` must be reviewed by native speakers, and Malagasy especially. Strings are marked in the code.
- **Educator review.** Skill order and age targets follow common early-years and primary progressions, but a qualified teacher should review each track before release.
- **Art and voice style.** Everything is drawn in code to match Kilalao's calm look, with soft storybook lighting (see `app/js/learn/art.js`). The commercial apps use large art and animation teams; an illustrator's review of the cast and pictures would still help.
- **Privacy.** Profiles and progress stay on the device and are never uploaded. Because nothing is collected, there is nothing to comply with for children's data collection. This must stay true as features are added.

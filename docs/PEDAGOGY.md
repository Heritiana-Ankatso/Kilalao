# Pedagogy and game design

Kilalao's Learn area is an educational game for children aged 3 to 12. This document records the teaching and game-design principles it follows and the evidence behind them. It is the reference for anyone adding a skill, an activity or a game mechanic.

The principles were worked out with the learning-science skills in `.claude/skills/` (see the README there for sources and licences). The main ones used are:
- motivation (`motivation-diagnostic-task-redesign`, Self-Determination Theory);
- flow (`flow-state-condition-designer`);
- hints (`progressive-hint-ladder`, `adaptive-hint-sequence-designer`);
- maths progression (`cpa-sequence-designer`, `three-part-lesson-designer`, `worked-example-fading-designer`);
- memory (`spaced-practice-scheduler`, `retrieval-practice-generator`, `interleaving-unit-planner`);
- screen design (`cognitive-load-analyser`, `dual-coding-designer`);
- feedback (`feedback-quality-analyser`, `self-efficacy-builder-sequence`).

## 1. What kind of game

**The learning is the game.** In the quest village, an animal friend needs help: apples counted into a basket, a number built from tens and ones, fruit shared equally. The maths *is* the help, not a quiz that unlocks a reward. Game designers call the opposite "chocolate-covered broccoli": a quiz with a game wrapped around it.

**No points, stars, streaks, badges or leaderboards.** Extrinsic rewards can undermine children's own interest in a task that is already interesting (the overjustification effect; Deci, Koestner & Ryan, 1999). The visible consequence of learning is natural instead. A friend you helped moves into the village, and flowers grow. Nothing is counted, ranked or lost.

**No failure states.** There is no "game over", no lives and no timer. A wrong answer opens a hint, never a penalty.

## 2. Motivation: autonomy, competence, relatedness (SDT)

| Need | How Kilalao supports it |
|---|---|
| **Autonomy** (choice that matters) | The child chooses which friend to help. All 2–3 offers come from the adaptive path: the next skill, a nearby skill, or a review. The choice is real and every option is useful. There is structure *and* choice (Jang, Reeve & Deci, 2010). |
| **Competence** (optimal challenge, useful feedback) | Lessons start at the edge of what the child knows. Difficulty adapts within a lesson. Feedback is immediate and specific, and hints keep success within reach. |
| **Relatedness** (someone it matters to) | Every lesson helps a friend who reacts: hops for joy, looks puzzled, says thank you. The guide owl is warm and patient. |

## 3. Each lesson: explicit instruction with gradual release

1. **Watch (I do):** a worked example. The owl's hand performs every step, so the method is visible without reading or sound (dual coding: pictures and narration together).
2. **Together (we do):** guided practice with the scaffold built into the activity:
   - counting: objects pulse until each one has been touched and numbered;
   - basket: the request dots fill one-to-one;
   - place value: the running total is shown.
3. **Your turn (you do):** independent practice. Only these answers update the mastery estimate.

This follows *worked-example fading*: full example, then partial support, then independent work. Within maths it also follows **Concrete → Pictorial → Abstract**. Objects and manipulatives come first (apples, rods and cubes), then pictures (dots and ten-frames), then symbols (`3 + 2 = ?`). Early skills are concrete; symbol-only skills come only after their pictorial versions are secure.

## 4. Hints: a ladder, not an answer key

After a wrong answer the help grows step by step. The child always gives the final answer.

| Level | Name | What happens |
|---|---|---|
| 1 | Look again | What matters glows (uncounted objects, the groups, the request dots). The owl tilts its head. Nothing is given away. |
| 2 | First step | The hand does only the first step (counts the first two, adds one apple, lays the tens rods), then hands back. |
| 3 | Show me | A full demonstration on this same item. The right answer then glows. |

The hint level reached is recorded as **evidence of support needed**, not as a grade. It appears in the adult report. This adapts the hint-ladder skill for children who cannot yet explain their thinking in words: reflection happens by *doing* the next step, not by talking.

## 5. Flow within a lesson

- **Two first-try misses in a row:** support returns (the next independent item becomes guided) and the numbers get smaller (`easierParams`).
- **Stuck at the top of the ladder on two items:** the lesson ends gently. The mastery engine then offers an easier or prerequisite skill. Children never repeat the same failing item endlessly.
- **Success:** the support fades again.

There are no timers, so pace belongs to the child.

## 6. Memory: spacing, retrieval, interleaving

- **Retrieval practice:** independent items ask the child to produce or recall an answer, not to re-read anything.
- **Spacing:** mastered skills come back for review at growing intervals (1, 2, 4 … 64 days).
- **Interleaving:** review items from other skills are mixed into the end of a lesson. The village also offers a review quest, marked with a small circular arrow.
- **Mastery estimate:** each child has a Bayesian Knowledge Tracing estimate per skill. Placement starts near the child's age, and skills that are only assumed are checked through review.

## 7. Feedback

- Feedback is **immediate, specific and about the process**: "You touched each one once", "Tens and ones, just right", "You kept trying and found it". It is never about the person ("You're so clever").
- Persistence is credited when hints were needed. This builds self-efficacy from real mastery experiences.
- A wrong answer gets a soft low tone and a curious "hmm" from the owl, never a buzzer or a sad face.

## 8. Screen design and inclusion

- **One idea per screen.** Calm palette, no decorative motion near the task, and the important element signalled by a glow (cognitive load).
- **Words and pictures together.** Spoken prompts arrive with matching visuals (dual coding). Children from age 7 also see the written question.
- **Works without sound or reading.** Demonstrations and hints are visual first.
- **Three languages:** English, French and Malagasy, with recorded clips preferred over the wrong voice (see `app/audio/README.md`).
- **Universal Design for Learning:**
  - several ways in: watch, guided, own;
  - several ways to act: tap, touch-count, place objects, build;
  - several ways to engage: choice of friend, a calm pace.

## 9. Checklist for a new activity or skill

1. Is the maths the action in the story, rather than a quiz bolted on?
2. Is there a `solve()` worked example and a `help()` that teaches the method using the hand?
3. Are there `cue()` (look again) and `step()` (first step) hints that give less than the answer?
4. Does *Together* have a built-in scaffold (`guided: true`), or does it show the method first?
5. Is there a process-focused feedback phrase (`fb`) in all three languages?
6. Can a non-reader with the sound off understand what to do?
7. Is there anything that counts, ranks, times or punishes? Remove it.
8. Has a teacher reviewed the skill's position, age and prerequisites?

## Limitations

These designs follow strong general evidence, but they have not yet been tested with Kilalao's own children. Before scaling, observe children using it and collect parent and teacher feedback. Then adjust from what you see: where children hesitate, which hints they need, and when they lose interest. The evidence base supports conditions for learning and motivation; it does not guarantee them for every child.

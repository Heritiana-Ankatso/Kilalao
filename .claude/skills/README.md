# Third-party agent skills used to build Kilalao

The skills are grouped as animation and character design (MIT), pedagogy and learning science (CC BY-SA 4.0) and K-12 teaching (Apache 2.0). The CC BY-SA skills keep their own licence and are not relicensed under Kilalao's MIT licence.

These Claude Code skills guide animation and character work on Kilalao. They are
instructions only (no code runs). Each folder keeps its original licence.

| Skill | Source | Licence |
|---|---|---|
| `motion-design` | [LottieFiles/motion-design-skill](https://github.com/lottiefiles/motion-design-skill) | MIT |
| `character-appeal`, `animator-traditional`, `anticipation-payoff`, `timing-mastery` | [dylantarre/animation-principles](https://github.com/dylantarre/animation-principles) | MIT |
| `cpa-sequence-designer`, `variation-theory-task-designer`, `learning-progression-builder`, `three-part-lesson-designer`, `prepared-environment-designer`, `worked-example-fading-designer`, `progressive-hint-ladder`, `adaptive-hint-sequence-designer`, `erroneous-example-designer`, `retrieval-practice-generator`, `spaced-practice-scheduler`, `interleaving-unit-planner`, `cognitive-load-analyser`, `dual-coding-designer`, `feedback-quality-analyser`, `flow-state-condition-designer`, `self-efficacy-builder-sequence`, `motivation-diagnostic-task-redesign`, `awe-wonder-experience-designer`, `udl-options-designer` | [GarethManning/education-agent-skills](https://github.com/GarethManning/education-agent-skills) (copied unmodified) | CC BY-SA 4.0 |
| `svg-illustration-finish` (Kilalao rules; technique notes copied unmodified) | [Emasoft/ai-maestro-webdesign](https://github.com/Emasoft/ai-maestro-webdesign) | Apache 2.0 (references) |
| `k12-check-for-understanding`, `k12-lesson-prep` | [anthropics/k12-teacher-skills](https://github.com/anthropics/k12-teacher-skills) (copied unmodified) | Apache 2.0 (with NOTICE) |

Kilalao-specific overrides (these win over the skills' defaults):

- Use the **Calm** emotion profile (sine ease-in-out, 500–1000 ms, little or no
  overshoot), not the "Playful" archetype's fast bounce. Kilalao is a
  low-stimulation app for young children.
- No external animation libraries (GSAP, Lottie runtimes, Framer Motion): vanilla
  SVG, CSS and `requestAnimationFrame` only. Do not connect the LottieFiles
  Creator MCP; nothing may require the network.
- Respect `body.calm` and `prefers-reduced-motion`.

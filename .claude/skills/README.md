# Third-party agent skills used to build Kilalao

These Claude Code skills guide animation and character work on Kilalao. They are
instructions only (no code runs). Each folder keeps its original licence.

| Skill | Source | Licence |
|---|---|---|
| `motion-design` | [LottieFiles/motion-design-skill](https://github.com/lottiefiles/motion-design-skill) | MIT |
| `character-appeal`, `animator-traditional`, `anticipation-payoff`, `timing-mastery` | [dylantarre/animation-principles](https://github.com/dylantarre/animation-principles) | MIT |

Kilalao-specific overrides (these win over the skills' defaults):

- Use the **Calm** emotion profile (sine ease-in-out, 500–1000 ms, little or no
  overshoot), not the "Playful" archetype's fast bounce. Kilalao is a
  low-stimulation app for young children.
- No external animation libraries (GSAP, Lottie runtimes, Framer Motion): vanilla
  SVG, CSS and `requestAnimationFrame` only. Do not connect the LottieFiles
  Creator MCP; nothing may require the network.
- Respect `body.calm` and `prefers-reduced-motion`.

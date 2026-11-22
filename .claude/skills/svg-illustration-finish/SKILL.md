---
name: svg-illustration-finish
description: Finish Kilalao's hand-coded SVG characters, pictures and scenes so they read as soft storybook illustrations rather than flat clip art. Covers soft form shadows lit from the upper left, coloured (never grey) shadows, coloured line art, contact shadows, layered landscapes with atmospheric perspective, and the render-and-look loop. Use when drawing or redrawing anything in app/js/learn/characters.js, pictures.js, village.js or a toy's art.
---

# SVG illustration finish (Kilalao)

The technique notes in `references/` are copied unmodified from
[Emasoft/ai-maestro-webdesign](https://github.com/Emasoft/ai-maestro-webdesign)
(`skills/amw-svg-creator/references`, commit d5b19a1). That folder is
licensed under Apache 2.0 (`references/LICENSE`). Some notes say that the
original plugin does not draw characters or scenes; that is the plugin's own
scope rule, not a licence term. Kilalao applies the techniques, adapted
below for a calm app for young children.

## Kilalao rules (these override the references)

1. **One light, upper left.** Every shape gets a soft form shadow on the
   lower right and, on large shapes, a faint light area on the upper left.
   Use `shade()` in `app/js/learn/art.js`: it clips an offset copy of the
   shape, so the shadow always follows the outline and moves with the rig.
   For simple flat drawings (pictures, counting objects), call `finish(g)`
   after drawing: it applies the same lighting to every filled shape.
2. **Low contrast.** Shadows are 10–18 % darker than the base, shifted
   towards cool purple-brown (`references/TECH-colored-shadows.md`). No
   gloss, no specular dots except the catch-lights in eyes.
3. **Coloured line art.** Outlines use a deep tone of the character's own
   colour (`line` in each palette), 3–3.5 units on silhouettes and 2–2.5 on
   inner details. Uniform near-black outlines look like clip art.
4. **Grounding.** Anything that stands gets a soft contact shadow (an
   ellipse in a warm dark tone at about 15 % opacity).
5. **Scenes in layers** (`references/TECH-landscape-composition.md`):
   sky gradient, far hills paler and bluer, near hills saturated, then
   objects with contact shadows. No vignette, no haze animation.
6. **No SVG filters.** `feTurbulence` and blurs are expensive on low-end
   Android tablets. If paper grain is ever wanted, make it once as a small
   static image, never as a live filter.
7. **Render and look.** After each part, render with `tools/shoot.py` or a
   Playwright script at deviceScaleFactor 1 and look at the PNG
   (`references/TECH-render-verify-loop.md`). Check the drawing at its real
   size in the app (avatars are about 40–90 px tall).
8. Keep rig part ids and pivots stable: `rig.js` and the acting methods
   depend on them.

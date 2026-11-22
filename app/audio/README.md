# Recorded voice packs

The Learn area speaks its prompts in English, French and Malagasy. It uses, in order:

1. **Recorded clips** from this folder, when every clip a prompt needs is present.
2. The device's **text-to-speech voice** for that language, if one is installed.
3. **Silence**: the prompt is still shown on screen. A wrong-language voice is never used.

Malagasy text-to-speech is rarely installed on Android devices, so Malagasy needs recorded clips.

## Layout

```
app/audio/
  manifest.json          {"mg": ["n/1", "n/2", "p/howMany.0", ...], "fr": [...], "en": [...]}
  mg/n/1.mp3             the number "iray"
  mg/p/add.0.mp3         the fixed phrase " sy " from the prompt "{a} sy {b}, firy izany?"
  mg/f/3-4.mp3           the fraction name "telo ampahefany"
```

- Clip names come from `clipPlan()` in `app/js/learn/i18n.js`. A prompt is split into fixed phrases (`p/<key>.<i>`) and values: numbers (`n/<number>`) and fractions (`f/<a>-<b>`).
- To print the full recording script for a language, with every clip name and the text to read, run:

  ```bash
  node tools/recording-script.mjs mg
  ```

- Record in a quiet room in a calm, warm voice. Save as mono MP3, 44.1 kHz, about 96 kbps, with roughly 50 ms of silence at each end. Then list the clip names in `manifest.json`.
- Add the new files to `FILES` in `app/sw.js` and bump `VERSION`, so they are available offline.

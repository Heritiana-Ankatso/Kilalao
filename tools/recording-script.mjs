#!/usr/bin/env node
// Prints the recording script for a Learn voice pack: every clip name and the
// text to read. Usage: node tools/recording-script.mjs mg [maxNumber]
// Prompt keys come straight from i18n.js, so new prompts (the feelings and
// logic tracks: whoFeels, scene*, why*, whatHelps, breatheStart, smell, blow,
// pattern and coding prompts...) are included automatically. Feeling words
// are recorded as e/<feeling>. The story library is read by the device voice
// for now (recorded story narration is a later step).
import { PROMPTS, FEEL_WORDS, numberWord, fractionName } from '../app/js/learn/i18n.js';
import { PHON, WORDS, SPELLING } from '../app/js/learn/curriculum/reading.js';

const lang = process.argv[2] || 'mg';
const maxN = Number(process.argv[3] || 100);
const table = PROMPTS[lang];
if (!table) { console.error(`Unknown language: ${lang}`); process.exit(1); }

const rows = [];
for (const [key, tpl] of Object.entries(table)) {
  let i = 0;
  tpl.split(/(\{[a-z]+\})/).forEach((part) => {
    if (part && !/^\{[a-z]+\}$/.test(part) && /\p{L}/u.test(part)) rows.push([`p/${key}.${i++}`, part.trim()]);
  });
}
for (let n = 0; n <= maxN; n++) rows.push([`n/${n}`, numberWord(n, lang)]);
for (const f of ['1/2', '1/3', '2/3', '1/4', '2/4', '3/4', '1/5', '2/5', '3/5', '4/5', '1/6', '5/6', '1/8', '3/8', '5/8', '7/8']) rows.push([`f/${f.replace('/', '-')}`, fractionName(f, lang)]);

// Feelings: the feeling word on its own, used for {feel} in prompts.
for (const [f, w] of Object.entries(FEEL_WORDS[lang] || FEEL_WORDS.en)) rows.push([`e/${f}`, w]);

// Reading: single speech sounds (say the sound, not the letter name) and whole words.
for (const u of Object.keys(PHON[lang] || {})) rows.push([`s/${u}`, `SOUND of "${u}" (as in the guide: ${PHON[lang][u]})`]);
for (const sy of lang === 'fr' ? ['la', 'li', 'lo', 'lu', 'ma', 'mi', 'mo', 'mu', 'ra', 'ri', 'ro', 'ru', 'sa', 'si', 'so', 'su'] : []) rows.push([`s/${sy}`, sy]);
for (const w of Object.keys(WORDS[lang] || {})) rows.push([`w/${w}`, (SPELLING[lang] && SPELLING[lang][w]) || w]);

console.log(`# Kilalao recording script (${lang}): ${rows.length} clips`);
console.log('# Save each clip as app/audio/<lang>/<clip>.mp3 and list it in app/audio/manifest.json\n');
for (const [clip, text] of rows) console.log(`${clip}\t${text}`);

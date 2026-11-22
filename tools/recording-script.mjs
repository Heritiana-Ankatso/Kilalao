#!/usr/bin/env node
// Prints the recording script for a Learn voice pack: every clip name and the
// text to read. Usage: node tools/recording-script.mjs mg [maxNumber]
import { PROMPTS, numberWord, fractionName } from '../app/js/learn/i18n.js';

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

console.log(`# Kilalao recording script (${lang}): ${rows.length} clips`);
console.log('# Save each clip as app/audio/<lang>/<clip>.mp3 and list it in app/audio/manifest.json\n');
for (const [clip, text] of rows) console.log(`${clip}\t${text}`);

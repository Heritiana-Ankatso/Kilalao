// Reading skill graphs (Phase 2, Reading A), by language. Each skill names a
// template from templates/reading.js, a typical age, prerequisites and an
// adult-facing description.
//
// English follows a systematic synthetic phonics order (letter sounds taught
// in small groups, blending and building from the first group onwards).
// French follows the syllabic method used in francophone schools (vowels,
// consonants, syllables, then words). Malagasy reading comes once recorded
// sounds exist (see docs/ROADMAP.md).
//
// REVIEW: sequences and ages should be checked by a reading specialist.

const S = (lang, id, age, prereq, template, params, desc) => ({ id: `read.${lang}.${id}`, subject: 'reading', lang, age, prereq: prereq.map((p) => `read.${lang}.${p}`), template, params: { ...params, lang }, desc });

// Approximate sounds for the device voice. Recorded clips (s/<unit>) are
// strongly preferred: voices pronounce isolated sounds poorly.
export const PHON = {
  en: { s: 'sss', a: 'ah', t: 'tuh', p: 'puh', i: 'ih', n: 'nnn', m: 'mmm', d: 'duh', g: 'guh', o: 'aw', c: 'kuh', k: 'kuh', e: 'eh', u: 'uh', r: 'rrr', h: 'hhh', b: 'buh', f: 'fff', l: 'lll', j: 'juh', v: 'vvv', w: 'wuh', x: 'ks', y: 'yuh', z: 'zzz' },
  fr: { a: 'a', i: 'i', o: 'o', u: 'u', e: 'eu', 'é': 'é', l: 'le', m: 'me', r: 're', s: 'sse', t: 'te', p: 'pe', n: 'ne', b: 'be', v: 've', f: 'fe', d: 'de', c: 'ke' },
};

// Words with pictures (pictures.js), split into letters (sound units).
export const WORDS = {
  en: {
    cat: 'c a t', hat: 'h a t', bat: 'b a t', mat: 'm a t', map: 'm a p', cap: 'c a p', van: 'v a n',
    dog: 'd o g', log: 'l o g', fox: 'f o x', box: 'b o x', pig: 'p i g', wig: 'w i g',
    sun: 's u n', bun: 'b u n', bus: 'b u s', cup: 'c u p', bug: 'b u g', mug: 'm u g',
    bed: 'b e d', hen: 'h e n', pen: 'p e n', ten: 't e n', net: 'n e t', jet: 'j e t',
  },
  // A unit starting with _ is a silent letter (written, not pronounced).
  fr: { os: 'o s', lit: 'l i _t', rat: 'r a _t', bus: 'b u s', sac: 's a c', bol: 'b o l', lune: 'l u n _e', moto: 'm o t o', velo: 'v é l o' },
};
// What the word looks like when written (accents) and which picture shows it.
export const SPELLING = { fr: { velo: 'vélo', lit: 'lit' } };
export const PICTURE = { fr: { lit: 'bed', velo: 'velo' } };

// A picture whose name starts with each sound (an anchor for the help).
export const ANCHOR = {
  en: { s: 'sun', t: 'ten', p: 'pig', n: 'net', m: 'map', d: 'dog', c: 'cat', r: 'rat', h: 'hat', b: 'bus', f: 'fox', l: 'log', j: 'jet', v: 'van', w: 'wig', g: 'bug' },
  fr: { o: 'os', l: 'lune', m: 'moto', r: 'rat', s: 'sac', b: 'bol', v: 'velo' },
};

export const RHYMES = { en: [['cat', 'hat', 'bat', 'mat'], ['dog', 'log'], ['pig', 'wig'], ['sun', 'bun'], ['fox', 'box'], ['bug', 'mug'], ['hen', 'pen', 'ten'], ['map', 'cap'], ['net', 'jet']] };

const EN = [
  S('en', 'rhyme', 4, [], 'rhyme', {}, 'Hear which words rhyme'),
  S('en', 'sounds1', 4, [], 'letterSound', { units: 'satp', pool: 'satp' }, 'Letter sounds: s, a, t, p'),
  S('en', 'first1', 4.5, ['sounds1'], 'firstSound', { units: 'stp', words: ['sun', 'ten', 'pig', 'pen', 'bus', 'cat'] }, 'Hear the first sound in a word (s, t, p)'),
  S('en', 'sounds2', 4.5, ['sounds1'], 'letterSound', { units: 'inmd', pool: 'satpinmd' }, 'Letter sounds: i, n, m, d'),
  S('en', 'blend1', 5, ['sounds2'], 'blend', { words: ['mat', 'map'] }, 'Blend sounds to read words (mat, map)'),
  S('en', 'sounds3', 5, ['sounds2'], 'letterSound', { units: 'gock', pool: 'satpinmdgock' }, 'Letter sounds: g, o, c, k'),
  S('en', 'first2', 5, ['first1', 'sounds2'], 'firstSound', { units: 'stpnmd', words: ['sun', 'ten', 'pig', 'net', 'map', 'dog', 'mug', 'pen'] }, 'First sounds (s, t, p, n, m, d)'),
  S('en', 'spell1', 5.5, ['blend1'], 'spell', { words: ['mat', 'map'] }, 'Build words from their sounds (mat, map)'),
  S('en', 'blend2', 5.5, ['sounds3', 'blend1'], 'blend', { words: ['cat', 'dog', 'pig', 'cap', 'mat', 'map'] }, 'Blend to read words (cat, dog, pig, cap)'),
  S('en', 'sounds4', 5.5, ['sounds3'], 'letterSound', { units: 'eurhbfl', pool: 'satpinmdgockeurhbfl' }, 'Letter sounds: e, u, r, h, b, f, l'),
  S('en', 'blend3', 6, ['sounds4', 'blend2'], 'blend', { words: ['sun', 'bun', 'bus', 'cup', 'bed', 'hen', 'pen', 'ten', 'net', 'bug', 'mug', 'log', 'hat', 'bat'] }, 'Blend to read words with all short vowels'),
  S('en', 'spell2', 6, ['spell1', 'blend2'], 'spell', { words: ['cat', 'dog', 'pig', 'sun', 'bed', 'hat', 'cup', 'hen'] }, 'Build words with all short vowels'),
  S('en', 'sounds5', 6, ['sounds4'], 'letterSound', { units: 'jvwxyz', pool: 'jvwxyzbfl' }, 'Letter sounds: j, v, w, x, y, z'),
  S('en', 'blend4', 6.5, ['sounds5', 'blend3'], 'blend', { words: ['fox', 'box', 'wig', 'van', 'jet', 'cap', 'map', 'net'] }, 'Read words with j, v, w, x'),
];

const FR = [
  S('fr', 'voyelles', 4, [], 'letterSound', { units: 'aiou', pool: 'aioué' }, 'Sons des voyelles : a, i, o, u'),
  S('fr', 'cons1', 4.5, ['voyelles'], 'letterSound', { units: 'lmrs', pool: 'lmrsaiou' }, 'Sons des consonnes : l, m, r, s'),
  S('fr', 'syll1', 5, ['cons1'], 'letterSound', { units: ['la', 'li', 'lo', 'ma', 'mi', 'mo', 'ra', 'ri', 'ro', 'sa', 'si', 'so'], pool: ['la', 'li', 'lo', 'lu', 'ma', 'mi', 'mo', 'mu', 'ra', 'ri', 'ro', 'ru', 'sa', 'si', 'so', 'su'], syllables: true }, 'Syllabes : la, mi, ro, su…'),
  S('fr', 'cons2', 5, ['cons1'], 'letterSound', { units: 'tpnbv', pool: 'tpnbvlmrs' }, 'Sons des consonnes : t, p, n, b, v'),
  S('fr', 'lire1', 5.5, ['syll1'], 'blend', { words: ['os', 'lit', 'rat', 'bus'] }, 'Lire des mots simples (os, lit, rat, bus)'),
  S('fr', 'premier', 5.5, ['cons2'], 'firstSound', { units: 'lmrsbv', words: ['lune', 'moto', 'rat', 'sac', 'bol', 'velo'] }, 'Entendre le premier son d’un mot'),
  S('fr', 'ecrire1', 6, ['lire1'], 'spell', { words: ['os', 'sac', 'bol', 'bus'] }, 'Écrire des mots simples'),
  S('fr', 'lire2', 6, ['lire1', 'cons2'], 'blend', { words: ['sac', 'bol', 'lune', 'moto', 'velo', 'rat', 'lit'] }, 'Lire des mots de deux syllabes (moto, vélo, lune)'),
];

export const READING = { en: EN, fr: FR, mg: [] };
export const READING_ALL = [...EN, ...FR];

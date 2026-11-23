// "Try it together": one short at-home activity per lesson template, for a
// grown-up and child to do away from the screen. Research on educational
// media (Hirsh-Pasek et al. 2015, "socially interactive" pillar; joint media
// engagement) finds children learn more when an adult connects what they did
// on screen to everyday life and talks about it with them. These cards are
// shown only to adults (adult corner and the testing report); children never
// see text. See docs/BENCHMARK.md.
//
// REVIEW: the French wording should be checked by a native speaker.
import * as profiles from './profiles.js';
import { MATH } from './curriculum/math.js';
import { READING_ALL } from './curriculum/reading.js';
import { LOGIC } from './curriculum/logic.js';
import { FEEL } from './curriculum/feelings.js';

export const TOGETHER = {
  // Math
  count: {
    en: 'Count the stairs together as you climb them, touching each step once. Then ask: "How many did we climb?"',
    fr: 'Comptez ensemble les marches en montant l\'escalier, en touchant chaque marche une fois. Puis demandez : « Combien en avons-nous monté ? »',
  },
  give: {
    en: 'At snack time, ask your child to give you exactly 3 (or 5) pieces of fruit, then count them together to check.',
    fr: 'Au goûter, demandez à votre enfant de vous donner exactement 3 (ou 5) morceaux de fruit, puis comptez-les ensemble pour vérifier.',
  },
  compare: {
    en: 'Make two small piles of spoons or stones. Ask "Which has more? How do you know?" and line them up to check.',
    fr: 'Faites deux petits tas de cuillères ou de cailloux. Demandez « Lequel en a le plus ? Comment le sais-tu ? » et alignez-les pour vérifier.',
  },
  numeral: {
    en: 'Go on a number hunt: find numbers on doors, clocks, buses or packets and say them together.',
    fr: 'Partez à la chasse aux nombres : cherchez des nombres sur les portes, les horloges, les bus ou les paquets et lisez-les ensemble.',
  },
  numberline: {
    en: 'Hop along a line of tiles or chalk marks counting each hop: "We are on 4. Where will we be after 2 more hops?"',
    fr: 'Sautez le long d\'une ligne de carreaux ou de traits à la craie en comptant : « Nous sommes sur 4. Où serons-nous après 2 sauts de plus ? »',
  },
  arith: {
    en: 'Tell little number stories with real things: "You have 4 grapes and eat 1. How many now?" Let your child act it out.',
    fr: 'Racontez de petites histoires de nombres avec de vrais objets : « Tu as 4 raisins et tu en manges 1. Combien en reste-t-il ? » Laissez votre enfant le mimer.',
  },
  bonds: {
    en: 'Hide some of 10 small objects under a cup. Show the rest and ask: "How many are hiding?" Lift the cup to check.',
    fr: 'Cachez une partie de 10 petits objets sous un gobelet. Montrez le reste et demandez : « Combien se cachent ? » Soulevez le gobelet pour vérifier.',
  },
  placevalue: {
    en: 'Bundle sticks or straws into tens with a rubber band. Make a number like 23 together: 2 bundles and 3 loose.',
    fr: 'Faites des paquets de 10 bâtonnets ou pailles avec un élastique. Construisez ensemble un nombre comme 23 : 2 paquets et 3 bâtonnets seuls.',
  },
  groups: {
    en: 'Set the table together: "3 plates, 2 spoons on each. How many spoons?" Count in twos as you place them.',
    fr: 'Mettez la table ensemble : « 3 assiettes, 2 cuillères pour chacune. Combien de cuillères ? » Comptez de 2 en 2 en les posant.',
  },
  fraction: {
    en: 'Share a fruit or a flatbread fairly into halves or quarters. Ask: "Are the pieces the same size?"',
    fr: 'Partagez équitablement un fruit ou une galette en moitiés ou en quarts. Demandez : « Les morceaux sont-ils de la même taille ? »',
  },
  fracline: {
    en: 'Fold a strip of paper in half, then in quarters. Mark the folds and talk about which part is bigger: one half or one quarter?',
    fr: 'Pliez une bande de papier en deux, puis en quatre. Marquez les plis et discutez : quelle part est la plus grande, une moitié ou un quart ?',
  },
  // Reading
  letterSound: {
    en: 'Play "I spy" with sounds, not letter names: "I spy something that starts with /s/..." Take turns.',
    fr: 'Jouez à « Je vois » avec les sons, pas les noms des lettres : « Je vois quelque chose qui commence par [sss]... » Chacun son tour.',
  },
  firstSound: {
    en: 'Walking or tidying up, pick an object and ask: "What sound does sock start with?" Stretch the first sound: "sss-ock".',
    fr: 'En marchant ou en rangeant, montrez un objet et demandez : « Par quel son commence le mot moto ? » Allongez le premier son : « mmm-oto ».',
  },
  rhyme: {
    en: 'Make up silly rhymes together: cat, hat, bat, zat! Nonsense words are fine; hearing the rhyme is what matters.',
    fr: 'Inventez ensemble des rimes rigolotes : chat, rat, plat, zat ! Les mots inventés sont permis ; c\'est entendre la rime qui compte.',
  },
  blend: {
    en: 'Say a word in slow sounds, "d-o-g", and let your child guess the word. Then swap: they say the sounds, you guess.',
    fr: 'Dites un mot syllabe par syllabe ou son par son, « ch-a-t » ou « vé-lo », et laissez votre enfant deviner. Puis inversez les rôles.',
  },
  spell: {
    en: 'Build short words with fridge magnets, bottle caps or letters on paper: say each sound as you place the letter.',
    fr: 'Construisez des mots courts avec des lettres aimantées ou écrites sur des bouchons : dites chaque son en posant la lettre.',
  },
  // Logic and coding
  pattern: {
    en: 'Look for patterns on clothes, mats and fences. Make one with spoons and forks (spoon, fork, spoon...) and ask what comes next.',
    fr: 'Cherchez des motifs sur les vêtements, les nattes et les clôtures. Faites-en un avec des cuillères et des fourchettes (cuillère, fourchette, cuillère...) et demandez ce qui vient ensuite.',
  },
  oddone: {
    en: 'Put four things in a row, three alike and one different (3 shoes and a cup). Ask: "Which one does not belong? Why?"',
    fr: 'Alignez quatre objets, trois semblables et un différent (3 chaussures et une tasse). Demandez : « Lequel n\'est pas à sa place ? Pourquoi ? »',
  },
  sortit: {
    en: 'Sort the laundry or toys together: by colour, then by kind. Ask your child to choose the rule next time.',
    fr: 'Triez ensemble le linge ou les jouets : par couleur, puis par sorte. La prochaine fois, laissez votre enfant choisir la règle.',
  },
  path: {
    en: 'Play "robot": your child gives you step-by-step directions (forward, forward, turn) to reach a hidden toy. Then swap.',
    fr: 'Jouez au « robot » : votre enfant vous guide pas à pas (avance, avance, tourne) jusqu\'à un jouet caché. Puis inversez les rôles.',
  },
  debug: {
    en: 'Play "robot" again, but make one wrong move on purpose. Ask your child to find the mistake and fix the instruction.',
    fr: 'Rejouez au « robot », mais faites exprès une erreur. Demandez à votre enfant de trouver l\'erreur et de corriger l\'instruction.',
  },
  // Feelings
  feelFind: {
    en: 'Make faces in a mirror together: happy, sad, angry, scared, surprised. Name each feeling and when you felt it.',
    fr: 'Faites des grimaces ensemble devant un miroir : content, triste, fâché, effrayé, surpris. Nommez chaque émotion et dites quand vous l\'avez ressentie.',
  },
  feelScene: {
    en: 'While reading a book or watching people, ask: "How do you think they feel? Why?" Share your own guess too.',
    fr: 'En lisant un livre ou en regardant les gens, demandez : « Comment se sent-il, à ton avis ? Pourquoi ? » Donnez aussi votre idée.',
  },
  feelHelp: {
    en: 'When someone is sad (a sibling, a friend, a toy), ask your child: "What could help?" Try their idea together.',
    fr: 'Quand quelqu\'un est triste (un frère, une amie, une peluche), demandez à votre enfant : « Qu\'est-ce qui pourrait l\'aider ? » Essayez son idée ensemble.',
  },
  breathe: {
    en: 'Practise "smell the flower, blow out the candle" with real fingers: breathe in slowly, then out. Use it together before a hard moment.',
    fr: 'Pratiquez « sentir la fleur, souffler la bougie » avec vos doigts : inspirez lentement, puis soufflez. Utilisez-le ensemble avant un moment difficile.',
  },
};

export const ALL_SKILLS = [...MATH, ...READING_ALL, ...LOGIC, ...FEEL];
const BY_ID = new Map(ALL_SKILLS.map((s) => [s.id, s]));

// Cards are written in English and French. French profiles (and Malagasy
// ones, as for the story library) get French cards.
export const cardLang = (lang) => (lang === 'en' ? 'en' : 'fr');

export function card(template, lang) {
  const c = TOGETHER[template];
  return c ? c[cardLang(lang)] || c.en : null;
}

// Cards for the templates a child practised most recently (newest first),
// one per template: [{ template, skill, text }].
export function recentCards(pid, lang, { days = 14, max = 3 } = {}) {
  const since = Date.now() - days * 86400000;
  const seen = new Set(), out = [];
  const log = profiles.log(pid);
  for (let i = log.length - 1; i >= 0 && out.length < max; i--) {
    const e = log[i];
    if (e.t < since) break;
    const s = BY_ID.get(e.s || e.q);
    if (!s || seen.has(s.template)) continue;
    seen.add(s.template);
    const text = card(s.template, lang);
    if (text) out.push({ template: s.template, skill: s, text });
  }
  return out;
}

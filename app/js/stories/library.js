// The story library: short, original read-along picture books.
//
// Why (see docs/BENCHMARK.md): shared book reading is one of the best-studied
// early-literacy practices; the leading apps (Khan Academy Kids, Duolingo ABC,
// Epic) all include a library. Kilalao keeps the e-book research in mind: no
// distracting hotspots or animations that compete with the story; words light
// up as they are read; touching a word says it; each book ends with one open
// question to talk about (dialogic reading), not a quiz.
//
// Each story: id, theme (shelf theme), langs, cover (scene), pages: [{ scene, en, fr }],
// ask: { en, fr }. Scenes are lists of elements drawn by toys/stories.js.
// `decodable: 'en'` marks a book written with early phonics letters only.
//
// REVIEW: French text needs a native speaker's check. Malagasy versions are
// still to be written (Malagasy profiles read the French books for now).

export const STORIES = [
  {
    id: 'friend', theme: 'me', color: '#c97b63',
    cover: [{ bg: 'meadow' }, { fox: [620, 640, 0.95] }, { face: ['happy', 'bee', 1020, 470, 90] }],
    title: { en: 'Fox Finds a Friend', fr: 'Le renard trouve un ami' },
    pages: [
      { scene: [{ bg: 'meadow' }, { tree: [1280, 330, 1.4] }, { fox: [640, 600, 0.95] }, { obj: ['apple', 830, 520, 1.6] }], en: 'Fox has a red apple.', fr: 'Le renard a une pomme rouge.' },
      { scene: [{ bg: 'meadow' }, { fox: [520, 600, 0.95] }, { obj: ['apple', 700, 520, 1.6] }, { face: ['sad', 'bee', 1100, 420, 95] }], en: 'Fox sees Bee. Bee looks sad.', fr: "Le renard voit l'abeille. L'abeille a l'air triste." },
      { scene: [{ bg: 'meadow' }, { face: ['sad', 'bee', 800, 400, 120] }], en: 'Bee has no apple. Her tummy goes grrr.', fr: "L'abeille n'a pas de pomme. Son ventre fait grrr." },
      { scene: [{ bg: 'meadow' }, { fox: [520, 600, 0.95] }, { obj: ['apple', 760, 500, 1.3] }, { obj: ['apple', 880, 500, 1.3] }, { face: ['surprised', 'bee', 1120, 420, 95] }], en: 'Fox gives Bee half of the apple.', fr: "Le renard donne la moitié de la pomme à l'abeille." },
      { scene: [{ bg: 'meadow' }, { fox: [600, 600, 0.95] }, { face: ['happy', 'bee', 1000, 430, 95] }, { heart: [810, 330] }], en: 'Now Bee is happy. And so is Fox!', fr: "Maintenant, l'abeille est contente. Et le renard aussi !" },
    ],
    ask: { en: 'How did Fox help Bee? Who could you help today?', fr: "Comment le renard a-t-il aidé l'abeille ? Qui pourrais-tu aider aujourd'hui ?" },
  },
  {
    id: 'stars', theme: 'numbers', color: '#3d4a5c',
    cover: [{ bg: 'night' }, { stars: 5 }, { owl: [800, 640, 0.95] }],
    title: { en: 'Owl Counts the Stars', fr: 'Le hibou compte les étoiles' },
    pages: [
      { scene: [{ bg: 'night' }, { moon: true }, { owl: [800, 640, 0.95] }], en: 'It is night. Owl looks up at the sky.', fr: 'C’est la nuit. Le hibou regarde le ciel.' },
      { scene: [{ bg: 'night' }, { stars: 1 }, { owl: [800, 640, 0.95] }], en: 'One star. Hello, star!', fr: 'Une étoile. Bonjour, l’étoile !' },
      { scene: [{ bg: 'night' }, { stars: 2 }, { owl: [800, 640, 0.95] }], en: 'Two stars, side by side.', fr: 'Deux étoiles, côte à côte.' },
      { scene: [{ bg: 'night' }, { stars: 3 }, { owl: [800, 640, 0.95] }], en: 'Three stars make a triangle.', fr: 'Trois étoiles font un triangle.' },
      { scene: [{ bg: 'night' }, { stars: 5 }, { moon: true }, { owl: [800, 640, 0.95] }], en: 'Four, five! So many stars. Good night, Owl.', fr: 'Quatre, cinq ! Que d’étoiles. Bonne nuit, le hibou.' },
    ],
    ask: { en: 'How many stars can you count tonight? Can you find a triangle?', fr: 'Combien d’étoiles peux-tu compter ce soir ? Vois-tu un triangle ?' },
  },
  {
    id: 'sam', theme: 'letters', color: '#d8a650', langs: ['en'], decodable: 'en',
    cover: [{ bg: 'room' }, { pic: ['cat', 800, 440, 1.6] }],
    title: { en: 'Sam Sat' },
    pages: [
      { scene: [{ bg: 'room' }, { pic: ['cat', 800, 440, 1.7] }], en: 'Sam is a cat.' },
      { scene: [{ bg: 'room' }, { pic: ['mat', 800, 520, 1.6] }, { pic: ['cat', 800, 400, 1.2] }], en: 'Sam sat on a mat.' },
      { scene: [{ bg: 'room' }, { pic: ['mat', 800, 520, 1.6] }, { pic: ['cat', 760, 420, 1.1] }, { pic: ['pig', 860, 330, 1.2] }], en: 'A pig sat on Sam!' },
      { scene: [{ bg: 'room' }, { face: ['sad', 'cat', 800, 400, 130] }], en: 'Sam is sad.' },
      { scene: [{ bg: 'room' }, { pic: ['mat', 800, 520, 1.6] }, { pic: ['cat', 700, 420, 1.1] }, { pic: ['pig', 920, 420, 1.1] }, { zzz: [800, 260] }], en: 'Pig and Sam nap.' },
    ],
    ask: { en: 'Why was Sam sad? What could Pig say to Sam?' },
  },
  {
    id: 'rat', theme: 'letters', color: '#a9a39a', langs: ['fr'], decodable: 'fr',
    cover: [{ bg: 'night' }, { moon: true }, { pic: ['rat', 800, 520, 1.5] }],
    title: { fr: 'Le rat et la lune' },
    pages: [
      { scene: [{ bg: 'meadow' }, { pic: ['rat', 640, 520, 1.4] }, { pic: ['moto', 1000, 520, 1.3] }], fr: 'Le rat a une moto.' },
      { scene: [{ bg: 'meadow' }, { pic: ['moto', 800, 520, 1.5] }, { speed: [560, 520] }], fr: 'La moto va vite.' },
      { scene: [{ bg: 'night' }, { moon: true }, { pic: ['rat', 800, 560, 1.3] }], fr: 'Le rat a vu la lune.' },
      { scene: [{ bg: 'night' }, { moon: true }, { pic: ['rat', 800, 560, 1.3] }, { stars: 3 }], fr: 'La lune luit. Le rat sourit.' },
      { scene: [{ bg: 'room' }, { pic: ['bed', 800, 500, 1.6] }, { pic: ['rat', 800, 420, 0.9] }, { zzz: [900, 300] }], fr: 'Le rat a fini. Il dort.' },
    ],
    ask: { fr: 'Où irais-tu avec une moto ? Que vois-tu la nuit ?' },
  },
  {
    id: 'storm', theme: 'me', color: '#7898b3',
    cover: [{ bg: 'storm' }, { cloud: [880, 200] }, { face: ['scared', 'frog', 800, 520, 100] }],
    title: { en: 'The Big Storm', fr: 'Le gros orage' },
    pages: [
      { scene: [{ bg: 'meadow' }, { av: ['turtle', 620, 540, 90] }, { owl: [1050, 650, 0.85] }], en: 'Turtle and Owl are in the garden.', fr: 'La tortue et le hibou sont au jardin.' },
      { scene: [{ bg: 'storm' }, { cloud: [900, 190] }, { rain: true }, { face: ['scared', 'frog', 620, 500, 100] }], en: 'Boom! Thunder! Turtle feels scared.', fr: 'Boum ! Le tonnerre ! La tortue a peur.' },
      { scene: [{ bg: 'storm' }, { rain: true }, { owl: [1050, 650, 0.85] }, { av: ['turtle', 620, 540, 90] }, { ring: [620, 540] }], en: "Owl says: let's breathe slowly. Smell the flower. Blow the candle.", fr: 'Le hibou dit : respirons doucement. Sens la fleur. Souffle la bougie.' },
      { scene: [{ bg: 'storm' }, { rain: true }, { av: ['turtle', 620, 540, 90] }, { owl: [1050, 650, 0.85] }], en: 'In, and out. Turtle feels calmer.', fr: 'On inspire, on souffle. La tortue est plus calme.' },
      { scene: [{ bg: 'meadow' }, { rainbow: true }, { sun: true }, { av: ['turtle', 620, 540, 90] }, { owl: [1050, 650, 0.85] }], en: 'The storm goes away. Look, a rainbow!', fr: 'L’orage s’en va. Regarde, un arc-en-ciel !' },
    ],
    ask: { en: 'What makes you feel scared? What helps you feel calm?', fr: 'Qu’est-ce qui te fait peur ? Qu’est-ce qui t’aide à te calmer ?' },
  },
  {
    id: 'ball', theme: 'thinking', color: '#93ab8b',
    cover: [{ bg: 'room' }, { av: ['frog', 800, 470, 110] }, { obj: ['ball', 1050, 560, 1.6] }],
    title: { en: 'Where Is the Ball?', fr: 'Où est la balle ?' },
    pages: [
      { scene: [{ bg: 'room' }, { face: ['sad', 'frog', 800, 430, 110] }], en: 'Frog has lost his ball.', fr: 'La grenouille a perdu sa balle.' },
      { scene: [{ bg: 'room' }, { pic: ['bed', 760, 480, 1.8] }, { av: ['frog', 1180, 520, 70] }], en: 'Is it under the bed? No.', fr: 'Est-elle sous le lit ? Non.' },
      { scene: [{ bg: 'room' }, { pic: ['box', 760, 480, 1.8] }, { av: ['frog', 1180, 520, 70] }], en: 'Is it in the box? No.', fr: 'Est-elle dans la boîte ? Non.' },
      { scene: [{ bg: 'meadow' }, { obj: ['ball', 1180, 520, 1.3] }, { tree: [1140, 380, 1.6] }, { av: ['frog', 560, 540, 70] }], en: 'Is it behind the tree? Yes!', fr: 'Est-elle derrière l’arbre ? Oui !' },
      { scene: [{ bg: 'meadow' }, { face: ['happy', 'frog', 680, 470, 100] }, { obj: ['ball', 960, 560, 1.6] }], en: 'Frog found the ball. Let’s play!', fr: 'La grenouille a trouvé sa balle. On joue !' },
    ],
    ask: { en: 'Where would you hide a ball: under, in, or behind?', fr: 'Où cacherais-tu une balle : sous, dans ou derrière ?' },
  },
  {
    id: 'seed', theme: 'nature', color: '#86a36f',
    cover: [{ bg: 'meadow' }, { flower: [800, 560, 2] }, { av: ['bee', 1000, 330, 50] }],
    title: { en: 'The Little Seed', fr: 'La petite graine' },
    pages: [
      { scene: [{ bg: 'garden' }, { seed: [800, 640] }], en: 'A little seed sleeps in the ground.', fr: 'Une petite graine dort dans la terre.' },
      { scene: [{ bg: 'garden' }, { cloud: [800, 160] }, { rain: true }, { seed: [800, 640] }], en: 'The rain gives it water.', fr: 'La pluie lui donne de l’eau.' },
      { scene: [{ bg: 'garden' }, { sun: true }, { seed: [800, 640] }], en: 'The sun gives it light and warmth.', fr: 'Le soleil lui donne de la lumière et de la chaleur.' },
      { scene: [{ bg: 'garden' }, { sun: true }, { sprout: [800, 560] }], en: 'A little green shoot comes up.', fr: 'Une petite pousse verte sort de la terre.' },
      { scene: [{ bg: 'garden' }, { sun: true }, { flower: [800, 560, 2] }, { av: ['bee', 1040, 300, 50] }], en: 'Now it is a flower. Bee says hello!', fr: 'Maintenant, c’est une fleur. L’abeille dit bonjour !' },
    ],
    ask: { en: 'What does a plant need to grow? Shall we plant a seed together?', fr: 'De quoi une plante a-t-elle besoin pour pousser ? On plante une graine ensemble ?' },
  },
];

// The books a child sees, in their language (Malagasy reads French for now).
export function storiesFor(lang) {
  const l = lang === 'mg' ? 'fr' : lang;
  return STORIES.filter((st) => (!st.langs || st.langs.includes(l)) && st.pages.every((p) => p[l])).map((st) => ({ ...st, lang: l }));
}

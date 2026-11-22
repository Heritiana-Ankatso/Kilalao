// The shelf is organised by theme, like the areas of a Montessori classroom:
// each cubby holds the guided lessons for that theme (the owl's path) next to
// the free-play toys that practise the same ideas. Children recognise a cubby
// by its colour and picture; the names and goals below are shown only to adults.
//
// An entry is a toy id, or 'learn:<subject>' for the Learn area opened on one
// subject (math, reading, logic, feel).

export const THEMES = [
  {
    id: 'numbers', tint: 'rgba(216,166,80,.16)', items: ['learn:math', 'shapes', 'blocks'],
    name: 'Numbers & shapes',
    goals: 'Counting, number sense, adding and taking away, place value, fractions; shapes, size and building (spatial thinking).',
  },
  {
    id: 'letters', tint: 'rgba(201,123,99,.14)', items: ['learn:reading', 'stories', 'phonics', 'book'],
    name: 'Letters & stories',
    goals: 'Letter sounds, rhyme, blending and spelling; listening to and talking about stories; new words.',
  },
  {
    id: 'thinking', tint: 'rgba(94,143,143,.15)', items: ['learn:logic', 'code', 'marble', 'busyboard'],
    name: 'Thinking & coding',
    goals: 'Patterns, sorting and classifying, sequencing instructions (coding), debugging; cause and effect with machines.',
  },
  {
    id: 'nature', tint: 'rgba(134,163,111,.17)', items: ['islands', 'space', 'dinos', 'puzzle'],
    name: 'Nature & the world',
    goals: 'Exploring places, animals, planets and long-ago creatures; curiosity and observation.',
  },
  {
    id: 'me', tint: 'rgba(155,124,151,.15)', items: ['learn:feel', 'town', 'house', 'silly'],
    name: 'Me & others',
    goals: 'Naming feelings and their causes, kindness, calming down; pretend play about everyday life.',
  },
  {
    id: 'making', tint: 'rgba(120,152,179,.15)', items: ['draw', 'sequencer', 'radio'],
    name: 'Art & music',
    goals: 'Drawing, rhythm, melody and listening; open-ended creating.',
  },
];

// Every shelf entry, in shelf order.
export const ENTRIES = THEMES.flatMap((t) => t.items);

// 'learn:math' -> { toy: 'learn', opts: { subject: 'math' } }
export function parseEntry(id) {
  const [toy, subject] = id.split(':');
  return { toy, opts: subject ? { subject } : {} };
}

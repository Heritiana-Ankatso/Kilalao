// Feelings (social-emotional) skill graph, ages 3 to 6 (Phase 6, first part):
// naming five basic emotions, linking them to causes, one kind response, and
// a calm-breathing routine.
//
// REVIEW: emotions and scenes follow common early-years social-emotional
// programmes and should be checked by an early-years practitioner.

const S = (id, age, prereq, template, params, desc) => ({ id: 'feel.' + id, subject: 'feel', age, prereq: prereq.map((p) => 'feel.' + p), template, params, desc });

export const FEEL = [
  S('find2', 3, [], 'feelFind', { feelings: ['happy', 'sad'], choices: 2 }, 'Tell happy and sad faces apart'),
  S('breathe', 3, [], 'breathe', {}, 'Calm down with slow breaths (flower and candle)'),
  S('find3', 3.5, ['find2'], 'feelFind', { feelings: ['happy', 'sad', 'angry'], choices: 3 }, 'Name happy, sad and angry'),
  S('scene1', 4, ['find2'], 'feelScene', { feelings: ['happy', 'sad'] }, 'Say how a friend feels in a situation (happy, sad)'),
  S('find5', 4.5, ['find3'], 'feelFind', { choices: 3 }, 'Name five feelings, including scared and surprised'),
  S('kind', 4.5, ['scene1'], 'feelHelp', {}, 'Choose what could help a sad friend'),
  S('scene5', 5, ['scene1', 'find5'], 'feelScene', {}, 'Say how a friend feels and why (five feelings)'),
];

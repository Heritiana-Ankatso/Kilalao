// Logic, STEM and coding skill graph, ages 3 to 9 (Phase 4, first part).
// Patterns and classification come first (early algebraic and scientific
// thinking), then sequencing arrows (coding), then debugging.
//
// REVIEW: sequence and ages follow common early-years progressions
// (patterning, sorting, then directional coding as in ScratchJr and Code
// Karts) and should be checked by a qualified teacher.

const S = (id, age, prereq, template, params, desc) => ({ id: 'logic.' + id, subject: 'logic', age, prereq: prereq.map((p) => 'logic.' + p), template, params, desc });

export const LOGIC = [
  S('patAB', 3, [], 'pattern', { unit: 'AB', by: 'color' }, 'Continue a colour pattern (AB)'),
  S('oddColor', 3.5, [], 'oddone', { by: 'color' }, 'Find the one with a different colour'),
  S('sortColor', 3.5, ['oddColor'], 'sortit', { by: 'color' }, 'Sort by colour'),
  S('patKind', 4, ['patAB'], 'pattern', { unit: 'AB', by: 'kind' }, 'Continue a pattern of shapes or objects (AB)'),
  S('path1', 4, [], 'path', { len: 2, turns: 0 }, 'Code a short straight path with arrows (2 steps)'),
  S('oddKind', 4.5, ['oddColor'], 'oddone', { by: 'kind' }, 'Find the object that does not belong'),
  S('sortKind', 4.5, ['sortColor', 'oddKind'], 'sortit', { by: 'kind' }, 'Sort by kind'),
  S('patAAB', 4.5, ['patKind'], 'pattern', { unit: 'AAB', by: 'color' }, 'Continue AAB and ABB patterns'),
  S('path3', 5, ['path1'], 'path', { len: 3, turns: 0 }, 'Code a straight path (3 steps)'),
  S('patABC', 5, ['patAAB'], 'pattern', { unit: 'ABC', by: 'kind' }, 'Continue an ABC pattern'),
  S('pathTurn', 5.5, ['path3'], 'path', { len: 4, turns: 1 }, 'Code a path with one turn'),
  S('oddCat', 5.5, ['oddKind'], 'oddone', { by: 'category' }, 'Find the one from another category (animals and things)'),
  S('sortCat', 6, ['oddCat', 'sortKind'], 'sortit', { by: 'category' }, 'Sort into categories'),
  S('debug1', 6, ['pathTurn'], 'debug', { len: 4, turns: 1 }, 'Find the wrong arrow in a program (debugging)'),
  S('pathLong', 6.5, ['pathTurn'], 'path', { len: 6, turns: 2 }, 'Code a longer path with two turns'),
  S('patGrow', 7, ['patABC'], 'pattern', { grow: true }, 'Continue a growing pattern'),
  S('debug2', 7.5, ['debug1', 'pathLong'], 'debug', { len: 6, turns: 2 }, 'Debug a longer program'),
  S('pathMaze', 8, ['pathLong'], 'path', { len: 8, turns: 3 }, 'Code a long winding path (8 steps)'),
];

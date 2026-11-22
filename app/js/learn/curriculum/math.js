// Math skill graph, ages 3 to 10 (Phase 1). Each skill names its activity
// template and parameters, a typical age, its prerequisites, and a short
// description shown only to adults. Order matters: earlier skills come first
// on the learning path.
//
// REVIEW: sequence and ages follow common early-years and primary
// progressions and should be checked by a qualified teacher.

const S = (id, age, prereq, template, params, desc) => ({ id: 'math.' + id, subject: 'math', age, prereq: prereq.map((p) => 'math.' + p), template, params, desc });

export const MATH = [
  // Early Years (3-5)
  S('count3', 3, [], 'count', { min: 1, max: 3 }, 'Count up to 3 objects'),
  S('count5', 3.5, ['count3'], 'count', { min: 1, max: 5 }, 'Count up to 5 objects'),
  S('give5', 3.5, ['count5'], 'give', { min: 1, max: 5 }, 'Count out a given number of objects (up to 5)'),
  S('more5', 3.5, ['count3'], 'compare', { max: 5 }, 'Tell which group has more (up to 5)'),
  S('subitize5', 4, ['count5'], 'count', { min: 1, max: 5, flash: true, frame: false }, 'Recognise small amounts at a glance (up to 5)'),
  S('numeral5', 4, ['count5'], 'numeral', { min: 1, max: 5 }, 'Match numerals 1–5 to amounts'),
  S('count10', 4, ['count5'], 'count', { min: 4, max: 10 }, 'Count up to 10 objects'),
  S('give10', 4.5, ['give5', 'count10'], 'give', { min: 4, max: 10 }, 'Count out a given number of objects (up to 10)'),
  S('more10', 4.5, ['more5', 'count10'], 'compare', { max: 10 }, 'Tell which group has more (up to 10)'),
  S('numeral10', 4.5, ['numeral5', 'count10'], 'numeral', { min: 4, max: 10 }, 'Match numerals to amounts up to 10'),
  S('order10', 5, ['numeral10'], 'numberline', { min: 0, max: 10 }, 'Find the missing number in a sequence to 10'),
  S('add5', 5, ['count10', 'numeral5'], 'arith', { op: 'add', max: 5, visual: true }, 'Add within 5 with pictures'),
  S('sub5', 5, ['add5'], 'arith', { op: 'sub', max: 5, visual: true }, 'Take away within 5 with pictures'),
  S('bonds5', 5, ['add5'], 'bonds', { to: 5 }, 'Number bonds to 5'),
  S('count20', 5, ['count10'], 'count', { min: 11, max: 20, frame: true }, 'Count 11–20 using ten-frames'),
  // Primary A (5-8)
  S('add10', 5.5, ['add5', 'numeral10'], 'arith', { op: 'add', max: 10, visual: true }, 'Add within 10 with pictures'),
  S('sub10', 6, ['sub5', 'add10'], 'arith', { op: 'sub', max: 10, visual: true }, 'Take away within 10 with pictures'),
  S('bonds10', 6, ['bonds5', 'add10'], 'bonds', { to: 10 }, 'Number bonds to 10'),
  S('order20', 6, ['order10', 'count20'], 'numberline', { min: 0, max: 20 }, 'Missing numbers to 20'),
  S('add10s', 6.5, ['add10', 'bonds10'], 'arith', { op: 'add', max: 10 }, 'Add within 10 with symbols only'),
  S('sub10s', 6.5, ['sub10', 'add10s'], 'arith', { op: 'sub', max: 10 }, 'Subtract within 10 with symbols only'),
  S('place99', 6.5, ['count20'], 'placevalue', { min: 11, max: 99 }, 'Build 2-digit numbers from tens and ones'),
  S('order100', 7, ['order20', 'place99'], 'numberline', { min: 0, max: 100 }, 'Missing numbers to 100'),
  S('bigger100', 7, ['place99'], 'compare', { numerals: true, min: 10, max: 99 }, 'Compare 2-digit numbers'),
  S('add20', 7, ['add10s', 'bonds10'], 'arith', { op: 'add', max: 20 }, 'Add within 20'),
  S('sub20', 7, ['sub10s', 'add20'], 'arith', { op: 'sub', max: 20 }, 'Subtract within 20'),
  S('skip2', 7, ['order100'], 'numberline', { min: 0, max: 30, step: 2, next: true }, 'Count in twos'),
  S('skip5', 7, ['skip2'], 'numberline', { min: 0, max: 60, step: 5, next: true }, 'Count in fives'),
  S('skip10', 7, ['order100'], 'numberline', { min: 0, max: 100, step: 10, next: true }, 'Count in tens'),
  S('add100', 7.5, ['add20', 'place99'], 'arith', { op: 'add', max: 99, minA: 10, maxB: 9, blocks: true }, 'Add a 1-digit number to a 2-digit number'),
  S('sub100', 8, ['sub20', 'add100'], 'arith', { op: 'sub', max: 99, minA: 20, maxB: 9, blocks: true }, 'Subtract a 1-digit number from a 2-digit number'),
  S('groups', 7.5, ['skip2', 'skip5', 'add20'], 'groups', { minA: 2, maxA: 5, minB: 2, maxB: 5 }, 'Equal groups (early multiplication)'),
  // Primary B (8-12), first steps
  S('times5', 8, ['groups', 'skip10'], 'groups', { minA: 2, maxA: 5, minB: 2, maxB: 5, symbols: true }, 'Multiplication facts up to 5 × 5'),
  S('share', 8, ['groups'], 'groups', { mode: 'share', minA: 2, maxA: 5, minB: 2, maxB: 4 }, 'Share equally (early division)'),
  S('times10', 8.5, ['times5'], 'groups', { minA: 2, maxA: 10, minB: 2, maxB: 5, symbols: true }, 'Multiplication facts up to 10 × 5'),
  S('divide', 9, ['share', 'times5'], 'groups', { mode: 'share', minA: 2, maxA: 6, minB: 2, maxB: 5, symbols: true }, 'Division facts'),
  S('unitfrac', 8, ['share'], 'fraction', { dens: [2, 3, 4], unit: true }, 'Recognise halves, thirds and quarters'),
  S('fractions', 9, ['unitfrac'], 'fraction', { dens: [3, 4, 5, 6, 8] }, 'Recognise fractions like 3/4 and 5/8'),
  S('fracline', 9.5, ['fractions'], 'fracline', { dens: [2, 3, 4, 5, 6, 8] }, 'Place fractions on a number line'),
];

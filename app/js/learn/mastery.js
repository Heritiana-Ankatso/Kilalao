// Mastery tracking (Bayesian Knowledge Tracing) and the adaptive scheduler.
//
// Each skill holds P(known). After every first attempt at an item:
//   correct: P = P(1-slip) / (P(1-slip) + (1-P)guess)
//   wrong:   P = P slip / (P slip + (1-P)(1-guess))
//   then learning: P = P + (1-P) * transit
// A skill is mastered at P >= 0.95 with at least 3 attempts. Skills well
// below the child's age start as "assumed" (P = 0.96): they are not taught,
// only checked through spaced review, and fall back into teaching if missed.
import * as profiles from './profiles.js';

export const MASTERED = 0.95;
const SLIP = 0.1, TRANSIT = 0.12, P0 = 0.12;
const DAY = 86400000;
// Spaced-review intervals by number of successful reviews.
const INTERVALS = [1, 2, 4, 8, 16, 32, 64].map((d) => d * DAY);

export function record(pid, skill, profile) {
  let r = profiles.skill(pid, skill.id);
  if (!r) {
    const assumed = skill.age <= profile.age - 1;
    r = { p: assumed ? 0.96 : P0, n: 0, c: 0, last: 0, reviews: 0, assumed };
  }
  return r;
}

export function isMastered(r) { return !!r && r.p >= MASTERED && (r.n >= 3 || r.assumed); }

export function update(pid, skill, profile, correct, guess = 0.33) {
  const r = record(pid, skill, profile);
  const g = Math.min(0.5, Math.max(0.05, guess));
  const wasMastered = isMastered(r);
  let p = r.p;
  p = correct ? (p * (1 - SLIP)) / (p * (1 - SLIP) + (1 - p) * g) : (p * SLIP) / (p * SLIP + (1 - p) * (1 - g));
  p = p + (1 - p) * TRANSIT;
  r.p = Math.min(0.999, p);
  r.n++;
  if (correct) r.c++;
  if (!correct) r.assumed = false;
  if (wasMastered && correct) r.reviews = (r.reviews || 0) + 1;
  if (!correct) r.reviews = 0;
  r.last = Date.now();
  profiles.setSkill(pid, skill.id, r);
  profiles.logAttempt(pid, { t: r.last, s: skill.id, ok: correct ? 1 : 0 });
  return r;
}

// The teaching frontier: unmastered skills whose prerequisites are mastered.
export function frontier(skills, pid, profile) {
  const byId = new Map(skills.map((s) => [s.id, s]));
  const m = (id) => isMastered(record(pid, byId.get(id), profile));
  return skills.filter((s) => !m(s.id) && s.prereq.every((q) => !byId.has(q) || m(q)));
}

// Mastered skills due for review, most overdue first.
export function due(skills, pid, profile, now = Date.now()) {
  return skills
    .map((s) => ({ s, r: record(pid, s, profile) }))
    .filter(({ r }) => isMastered(r))
    .map(({ s, r }) => ({ s, over: now - (r.last || 0) - INTERVALS[Math.min(INTERVALS.length - 1, r.reviews || 0)] }))
    .filter((x) => x.over >= 0)
    // Never-checked placement skills: probe the hardest ones first.
    .sort((a, b) => (b.over - a.over) || (b.s.age - a.s.age))
    .map((x) => x.s);
}

// Plan a short session: mostly the next skill, plus spaced review mixed in.
export function planSession(skills, pid, profile, rng = Math.random, length = 6) {
  const f = frontier(skills, pid, profile);
  const d = due(skills, pid, profile);
  // Assumed (placement) skills just below the frontier are checked early.
  const main = f[0] || d[0] || skills[skills.length - 1];
  const second = f[1] && rng() < 0.3 ? f[1] : null;
  const items = [];
  for (let i = 0; i < length; i++) items.push(main);
  if (second) items[2] = second;
  if (d.length) items[length - 2] = d[0];
  if (d.length > 1 && rng() < 0.5) items[1] = d[1];
  return items;
}

// Summary for the adult report.
export function summary(skills, pid, profile) {
  let mastered = 0, assumed = 0, practising = 0, notStarted = 0;
  const rows = skills.map((s) => {
    const r = profiles.skill(pid, s.id);
    const rec = record(pid, s, profile);
    const status = isMastered(rec) ? (rec.n ? 'mastered' : 'assumed') : r && r.n ? 'practising' : 'not started';
    if (status === 'mastered') mastered++;
    else if (status === 'assumed') assumed++;
    else if (status === 'practising') practising++;
    else notStarted++;
    return { skill: s, status, p: rec.p, n: rec.n, c: rec.c, last: rec.last };
  });
  return { mastered, assumed, practising, notStarted, rows, next: frontier(skills, pid, profile).slice(0, 3) };
}

// Plan a lesson in three stages (gradual release): the guide shows one example
// ("watch"), the child does two with support ("together"), then practises
// alone ("own"). A skill already in practice skips the demonstration. Only
// "own" answers are recorded. One or two spaced-review items close the lesson.
export function planLesson(skills, pid, profile, forced, withReview = !forced) {
  const f = frontier(skills, pid, profile);
  const d = due(skills, pid, profile);
  const skill = forced || f[0] || d[0] || skills[skills.length - 1];
  const r = record(pid, skill, profile);
  const fresh = (r.n || 0) < 3 && !isMastered(r);
  const steps = fresh
    ? [['watch', skill], ['together', skill], ['together', skill], ['own', skill], ['own', skill], ['own', skill], ['own', skill]]
    : [['together', skill], ['own', skill], ['own', skill], ['own', skill], ['own', skill]];
  if (withReview) d.filter((x) => x !== skill).slice(0, 2).forEach((x) => steps.push(['own', x]));
  return { skill, steps: steps.map(([mode, s]) => ({ mode, skill: s })) };
}

// Quests offered in the village: the next skill, a second frontier skill when
// there is one, and the most overdue review. Every option is useful, so the
// child's choice is real without leaving the adaptive path.
export function offerQuests(skills, pid, profile) {
  const f = frontier(skills, pid, profile), d = due(skills, pid, profile);
  const out = [];
  if (f[0]) out.push({ skill: f[0], review: false });
  if (f[1]) out.push({ skill: f[1], review: false });
  const r = d.find((x) => !out.some((o) => o.skill === x));
  if (r) out.push({ skill: r, review: true });
  if (!out.length) out.push({ skill: skills[skills.length - 1], review: true });
  return out.slice(0, 3);
}

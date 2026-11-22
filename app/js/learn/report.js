// Child-testing report: a plain-text summary an adult can copy and share.
// It is anonymised (children are "Child 1, age 5"; names are never included)
// and is only built when an adult asks for it. Nothing is sent anywhere.
import * as profiles from './profiles.js';
import * as mastery from './mastery.js';
import { MATH } from './curriculum/math.js';
import { READING } from './curriculum/reading.js';

export const TAGS = [
  ['understood', 'Understood what to do'],
  ['adulthelp', 'Needed an adult to explain'],
  ['hesitated', 'Hesitated / unsure'],
  ['enjoyed', 'Enjoyed it'],
  ['bored', 'Looked bored'],
  ['frustrated', 'Got frustrated'],
  ['village', 'Liked choosing friends'],
  ['voice', 'Voice hard to understand'],
  ['tapping', 'Taps missed / hard to tap'],
  ['left', 'Wanted to stop'],
];

const median = (a) => { if (!a.length) return null; const b = a.slice().sort((x, y) => x - y); return b[Math.floor(b.length / 2)]; };
const pct = (n, d) => (d ? `${Math.round((100 * n) / d)}%` : '–');
const day = (t) => new Date(t).toISOString().slice(0, 16).replace('T', ' ');

export function buildReport(version) {
  const out = [];
  out.push(`Kilalao testing report · app ${version} · ${day(Date.now())} UTC`);
  out.push(`Device: ${navigator.userAgent.replace(/\s+/g, ' ').slice(0, 140)}`);
  out.push('');
  profiles.list().forEach((p, i) => {
    const log = profiles.log(p.id);
    const skills = [...MATH, ...(READING[p.lang] || [])];
    const byId = new Map(skills.map((s) => [s.id, s]));
    const starts = log.filter((e) => e.ev === 'start'), ends = new Set(log.filter((e) => e.ev === 'end').map((e) => e.qid)), stuck = new Set(log.filter((e) => e.ev === 'stuck').map((e) => e.qid));
    const left = starts.filter((e) => !ends.has(e.qid) && !stuck.has(e.qid));
    out.push(`== Child ${i + 1} · age ${p.age} · language ${p.lang} · animal ${p.avatar}`);
    out.push(`Quests: ${starts.length} started, ${ends.size} finished, ${stuck.size} ended early (stuck), ${left.length} left before the end.`);
    const firsts = log.filter((e) => 'ok' in e), solved = log.filter((e) => 'hint' in e);
    out.push(`Independent answers: ${firsts.length}, right first time ${pct(firsts.filter((e) => e.ok).length, firsts.length)}.`);
    out.push(`Items solved: ${solved.length}; hint level needed: none ${solved.filter((e) => !e.hint).length}, look-again ${solved.filter((e) => e.hint === 1).length}, first-step ${solved.filter((e) => e.hint === 2).length}, demonstration ${solved.filter((e) => e.hint >= 3).length}.`);
    const ms = solved.map((e) => e.ms).filter(Boolean);
    if (ms.length) out.push(`Time per item: median ${(median(ms) / 1000).toFixed(1)} s.`);
    // Per skill
    const per = new Map();
    for (const e of log) {
      const id = e.s || e.q; if (!id) continue;
      const r = per.get(id) || { first: 0, right: 0, solved: 0, hints: 0, ms: [], started: 0, left: 0, stuck: 0 };
      if ('ok' in e) { r.first++; if (e.ok) r.right++; }
      if ('hint' in e) { r.solved++; r.hints += e.hint || 0; if (e.ms) r.ms.push(e.ms); }
      if (e.ev === 'start') { r.started++; if (left.some((l) => l.qid === e.qid)) r.left++; }
      if (e.ev === 'stuck') r.stuck++;
      per.set(id, r);
    }
    if (per.size) {
      out.push('Per skill (id · description · started/left/stuck · right first time · avg hint · median s):');
      for (const [id, r] of per) {
        const s = byId.get(id);
        out.push(`  ${id} · ${s ? s.desc : '?'} · ${r.started}/${r.left}/${r.stuck} · ${pct(r.right, r.first)} · ${r.solved ? (r.hints / r.solved).toFixed(1) : '–'} · ${r.ms.length ? (median(r.ms) / 1000).toFixed(1) : '–'}`);
      }
    }
    const sm = mastery.summary(MATH, p.id, p);
    out.push(`Math path: ${sm.mastered} secure, ${sm.practising} in practice, ${sm.assumed} assumed. Next: ${sm.next.map((s) => s.id).join(', ') || '–'}.`);
    if ((READING[p.lang] || []).length) { const sr = mastery.summary(READING[p.lang], p.id, p); out.push(`Reading path: ${sr.mastered} secure, ${sr.practising} in practice, ${sr.assumed} assumed. Next: ${sr.next.map((s) => s.id).join(', ') || '–'}.`); }
    const o = profiles.obs(p.id);
    if (o.length) {
      out.push('Adult observations:');
      for (const e of o) out.push(`  ${day(e.t)} · ${e.tag ? (TAGS.find((x) => x[0] === e.tag) || [, e.tag])[1] : 'note'}${e.q ? ` · during ${e.q}` : ''}${e.note ? ` · "${e.note.replace(/\s+/g, ' ').slice(0, 400)}"` : ''}`);
    }
    out.push('');
  });
  return out.join('\n');
}

// The quest a child is in (or was in last), for tagging observations.
export function lastQuest(pid) {
  const l = profiles.log(pid).filter((e) => e.ev === 'start');
  return l.length ? l[l.length - 1].q : null;
}

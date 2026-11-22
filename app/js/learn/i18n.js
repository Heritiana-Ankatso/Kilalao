// Languages for the Learn area: prompts and number words in English, French
// and Malagasy. Prompts use {placeholders}; numbers are spoken as words.
//
// REVIEW: every French and Malagasy string here needs checking by a native
// speaker (Malagasy especially) before release. See docs/ROADMAP.md.

export const LANGS = {
  en: { name: 'English', tts: 'en-US' },
  fr: { name: 'Français', tts: 'fr-FR' },
  mg: { name: 'Malagasy', tts: 'mg-MG' },
};

export const PROMPTS = {
  en: {
    howMany: 'How many?',
    quick: 'Look quickly. How many?',
    more: 'Which has more?',
    bigger: 'Which number is bigger?',
    find: 'Find {n}.',
    missing: 'Which number is missing?',
    next: 'Count by {s}. What comes next?',
    add: '{a} and {b} make how many?',
    sub: '{a} take away {b}. How many are left?',
    makeTen: 'How many more to make {n}?',
    build: 'Build {n}.',
    times: '{a} groups of {b}. How many in all?',
    share: 'Share {a} between {b}. How many each?',
    fraction: 'Which one shows {f}?',
    fracLine: 'Where is {f} on the line?',
    together: "Let's count together.",
    give: 'Put {n} in the basket.',
    touchCount: 'Touch each one and count.',
    lastNumber: 'The last number tells how many.',
    watch: 'Watch me first.',
    tryTogether: "Now let's do it together.",
    yourTurn: 'Your turn!',
    choose: 'Who will you help?',
    thanks: 'Thank you!',
    lookAgain: 'Look again.',
    fbCount: 'You touched each one once.',
    fbGive: 'Just the right number.',
    fbJoin: 'You put them together and counted.',
    fbBuild: 'Tens and ones, just right.',
    fbLook: 'You looked carefully.',
    fbKeptGoing: 'You kept trying and found it.',
  },
  fr: {
    howMany: 'Combien ?',
    quick: 'Regarde vite. Combien ?',
    more: 'Où y en a-t-il le plus ?',
    bigger: 'Quel nombre est le plus grand ?',
    find: 'Trouve {n}.',
    missing: 'Quel nombre manque ?',
    next: 'Compte de {s} en {s}. Quel nombre vient ensuite ?',
    add: '{a} et {b}, ça fait combien ?',
    sub: '{a} moins {b}. Combien en reste-t-il ?',
    makeTen: 'Combien en faut-il encore pour faire {n} ?',
    build: 'Construis {n}.',
    times: '{a} groupes de {b}. Combien en tout ?',
    share: 'Partage {a} entre {b}. Combien chacun ?',
    fraction: 'Quelle image montre {f} ?',
    fracLine: 'Où est {f} sur la ligne ?',
    together: 'Comptons ensemble.',
    give: 'Mets {n} dans le panier.',
    touchCount: 'Touche chacun et compte.',
    lastNumber: 'Le dernier nombre dit combien il y en a.',
    watch: "Regarde d'abord.",
    tryTogether: 'Maintenant, faisons-le ensemble.',
    yourTurn: 'À toi !',
    choose: 'Qui vas-tu aider ?',
    thanks: 'Merci !',
    lookAgain: 'Regarde encore.',
    fbCount: 'Tu as touché chacun une fois.',
    fbGive: 'Juste le bon nombre.',
    fbJoin: 'Tu les as réunis et comptés.',
    fbBuild: 'Des dizaines et des unités : c\'est juste.',
    fbLook: 'Tu as bien regardé.',
    fbKeptGoing: 'Tu as persévéré et tu as trouvé.',
  },
  mg: {
    howMany: 'Firy?',
    quick: 'Jereo haingana. Firy?',
    more: 'Aiza no betsaka kokoa?',
    bigger: 'Iza no isa lehibe kokoa?',
    find: 'Tadiavo ny {n}.',
    missing: 'Inona no isa tsy ao?',
    next: 'Manisà {s} {s}. Inona no manaraka?',
    add: '{a} sy {b}, firy izany?',
    sub: '{a} esorina {b}. Firy no sisa?',
    makeTen: 'Firy koa vao ho {n}?',
    build: 'Amboary ny {n}.',
    times: 'Vondrona {a} misy {b} avy. Firy daholo?',
    share: 'Zarao amin\'ny {b} ny {a}. Firy avy?',
    fraction: 'Iza no mampiseho {f}?',
    fracLine: 'Aiza ny {f} amin\'ny tsipika?',
    together: 'Andao isaina miaraka.',
    give: 'Ataovy ao anaty harona ny {n}.',
    touchCount: 'Tsindrio tsirairay ary isao.',
    lastNumber: 'Ny isa farany no milaza ny isany.',
    watch: 'Jereo aloha.',
    tryTogether: 'Andao hiara-hanao izao.',
    yourTurn: 'Anjaranao!',
    choose: 'Iza no hanampianao?',
    thanks: 'Misaotra!',
    lookAgain: 'Jereo indray.',
    fbCount: 'Nokasihinao indray mandeha avy ny tsirairay.',
    fbGive: 'Marina tsara ny isany.',
    fbJoin: 'Natambatrao ary nisainao.',
    fbBuild: 'Folo sy iray, marina tsara.',
    fbLook: 'Nojerenao tsara.',
    fbKeptGoing: 'Nanohy nanandrana ianao ka nahita.',
  },
};

// Fraction names, keyed "numerator/denominator".
const FRACTIONS = {
  en: { '1/2': 'one half', '1/3': 'one third', '2/3': 'two thirds', '1/4': 'one quarter', '2/4': 'two quarters', '3/4': 'three quarters', '1/5': 'one fifth', '2/5': 'two fifths', '3/5': 'three fifths', '4/5': 'four fifths', '1/6': 'one sixth', '5/6': 'five sixths', '1/8': 'one eighth', '3/8': 'three eighths', '5/8': 'five eighths', '7/8': 'seven eighths' },
  fr: { '1/2': 'un demi', '1/3': 'un tiers', '2/3': 'deux tiers', '1/4': 'un quart', '2/4': 'deux quarts', '3/4': 'trois quarts', '1/5': 'un cinquième', '2/5': 'deux cinquièmes', '3/5': 'trois cinquièmes', '4/5': 'quatre cinquièmes', '1/6': 'un sixième', '5/6': 'cinq sixièmes', '1/8': 'un huitième', '3/8': 'trois huitièmes', '5/8': 'cinq huitièmes', '7/8': 'sept huitièmes' },
  mg: { '1/2': 'antsasany', '1/3': 'ampahatelony', '2/3': 'roa ampahatelony', '1/4': 'ampahefany', '2/4': 'roa ampahefany', '3/4': 'telo ampahefany', '1/5': 'ampahadiminy', '2/5': 'roa ampahadiminy', '3/5': 'telo ampahadiminy', '4/5': 'efatra ampahadiminy', '1/6': 'ampahenina', '5/6': 'dimy ampahenina', '1/8': 'ampahavalony', '3/8': 'telo ampahavalony', '5/8': 'dimy ampahavalony', '7/8': 'fito ampahavalony' },
};

export function fractionName(f, lang) { return (FRACTIONS[lang] || FRACTIONS.en)[f] || f.replace('/', ' / '); }

// ---------- Number words ----------
const EN1 = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const EN10 = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
function en(n) {
  if (n < 20) return EN1[n];
  if (n < 100) return EN10[Math.floor(n / 10)] + (n % 10 ? '-' + EN1[n % 10] : '');
  if (n < 1000) return EN1[Math.floor(n / 100)] + ' hundred' + (n % 100 ? ' and ' + en(n % 100) : '');
  return String(n);
}

const FR1 = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
const FR10 = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante'];
function fr(n) {
  if (n < 20) return FR1[n];
  if (n < 70) {
    const t = Math.floor(n / 10), u = n % 10;
    return FR10[t] + (u === 0 ? '' : u === 1 ? ' et un' : '-' + FR1[u]);
  }
  if (n < 80) return n === 71 ? 'soixante et onze' : 'soixante-' + FR1[n - 60];
  if (n < 100) return n === 80 ? 'quatre-vingts' : 'quatre-vingt-' + FR1[n - 80];
  if (n < 1000) {
    const h = Math.floor(n / 100), r = n % 100;
    const head = h === 1 ? 'cent' : FR1[h] + (r === 0 ? ' cents' : ' cent');
    return r ? head + ' ' + fr(r) : head;
  }
  return String(n);
}

// Malagasy counts from the smallest unit up: 25 = "dimy amby roapolo".
const MG1 = ['aotra', 'iray', 'roa', 'telo', 'efatra', 'dimy', 'enina', 'fito', 'valo', 'sivy'];
const MG10 = ['', 'folo', 'roapolo', 'telopolo', 'efapolo', 'dimampolo', 'enimpolo', 'fitopolo', 'valopolo', 'sivifolo'];
const MG100 = ['', 'zato', 'roanjato', 'telonjato', 'efajato', 'dimanjato', 'eninjato', 'fitonjato', 'valonjato', 'sivinjato'];
function mg(n) {
  if (n < 10) return MG1[n];
  if (n >= 1000) return String(n);
  const u = n % 10, t = Math.floor(n / 10) % 10, h = Math.floor(n / 100);
  const unit = u === 1 ? 'iraika' : MG1[u];
  const parts = [];
  if (u) parts.push(unit);
  if (t) parts.push(MG10[t]);
  if (h) parts.push(MG100[h]);
  // "ambin'ny" joins units to ten (11-19); "amby" elsewhere.
  if (parts.length === 1) return parts[0];
  let out = parts[0];
  for (let i = 1; i < parts.length; i++) out += (i === 1 && u && t === 1 ? " ambin'ny " : ' amby ') + parts[i];
  return out;
}

export function numberWord(n, lang) {
  return lang === 'fr' ? fr(n) : lang === 'mg' ? mg(n) : en(n);
}

// Fill a prompt. Numbers become words for speech, digits for display.
export function prompt(key, vars, lang, forSpeech) {
  const table = PROMPTS[lang] || PROMPTS.en;
  let s = table[key] || PROMPTS.en[key] || key;
  for (const k in vars || {}) {
    const v = vars[k];
    const shown = typeof v === 'number' ? (forSpeech ? numberWord(v, lang) : String(v)) : k === 'f' ? (forSpeech ? fractionName(v, lang) : v) : String(v);
    s = s.split(`{${k}}`).join(shown);
  }
  return s;
}

// Split a prompt into recordable pieces: fixed phrases and number clips.
// Used by recorded-voice packs (see app/audio/README.md).
export function clipPlan(key, vars, lang) {
  const table = PROMPTS[lang] || PROMPTS.en;
  const tpl = table[key] || PROMPTS.en[key];
  const out = [];
  let i = 0;
  tpl.split(/(\{[a-z]+\})/).forEach((part) => {
    if (!part) return;
    const m = part.match(/^\{([a-z]+)\}$/);
    if (m) {
      const v = vars[m[1]];
      out.push(typeof v === 'number' ? `n/${v}` : `f/${String(v).replace('/', '-')}`);
    } else if (/\p{L}/u.test(part)) out.push(`p/${key}.${i++}`); // skip bare punctuation
  });
  return out;
}

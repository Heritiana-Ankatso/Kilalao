// Shelf icons, one small illustration per toy (viewBox 0 0 200 200).
const ink = '#4a3f35';
const box = (bg, inner) => `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
<rect x="10" y="14" width="180" height="176" rx="38" fill="${bg}" stroke="${ink}" stroke-width="5"/>
<rect x="22" y="24" width="156" height="34" rx="17" fill="#fff" opacity=".18"/>
<g stroke="${ink}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">${inner}</g></svg>`;

export const ICONS = {
  learn: box('#93ab8b', `
    <path d="M40 166 q40 -10 60 -40 q20 -30 60 -40" fill="none" stroke="#efe3cc" stroke-width="14"/>
    <ellipse cx="52" cy="160" rx="16" ry="9" fill="#efe3cc"/><ellipse cx="96" cy="130" rx="15" ry="8" fill="#efe3cc"/><ellipse cx="128" cy="100" rx="13" ry="7" fill="#efe3cc"/>
    <rect x="148" y="66" width="8" height="26" fill="#7a5a44"/><circle cx="152" cy="56" r="20" fill="#d8a650"/>
    <path d="M46 56 h26 M59 43 v26" stroke="#fbf7ef" stroke-width="8"/><path d="M86 48 l14 14 M100 48 l-14 14" stroke="#c97b63" stroke-width="7"/>`),
  busyboard: box('#c9a073', `
    <rect x="38" y="52" width="52" height="40" rx="12" fill="#efe3cc"/>
    <line x1="64" y1="72" x2="78" y2="54" stroke-width="9"/><circle cx="79" cy="52" r="8" fill="#c97b63"/>
    <circle cx="140" cy="74" r="24" fill="#ffe3a0"/><rect x="130" y="44" width="20" height="10" fill="#a9a39a"/>
    <path d="M58 150 l10 -10 l10 4 l8 -12 l12 4 l6 -10 l12 8 l12 -4 l8 12 l-8 10 l6 12 l-12 2 l-4 12 l-12 -6 l-10 8 l-8 -10 l-14 2 l2 -12 z" fill="#d8a650"/>
    <circle cx="94" cy="148" r="10" fill="#efe3cc"/>
    <circle cx="150" cy="142" r="20" fill="#7898b3"/><line x1="150" y1="142" x2="150" y2="126"/>`),
  shapes: box('#b7cfd6', `
    <circle cx="78" cy="88" r="34" fill="#dca9a0"/>
    <path d="M128 60 l30 52 h-60 z" fill="#efe3cc"/>
    <rect x="62" y="122" width="44" height="44" rx="6" fill="#93ab8b"/>
    <path d="M140 124 l8 16 l18 2 l-13 12 l4 18 l-17 -9 l-16 9 l4 -18 l-13 -12 l18 -2 z" fill="#d8a650"/>`),
  blocks: box('#93ab8b', `
    <rect x="46" y="128" width="108" height="34" rx="4" fill="#dcbb8e"/>
    <rect x="58" y="88" width="40" height="40" rx="4" fill="#c97b63"/>
    <rect x="102" y="88" width="40" height="40" rx="4" fill="#d8a650"/>
    <path d="M60 88 l40 -38 l40 38 z" fill="#5e8f8f"/>`),
  silly: box('#dca9a0', `
    <path d="M60 150 q-10 -70 40 -80 q50 10 40 80 z" fill="#93ab8b"/>
    <circle cx="86" cy="104" r="14" fill="#fff"/><circle cx="118" cy="98" r="18" fill="#fff"/>
    <circle cx="88" cy="106" r="6" fill="${ink}"/><circle cx="121" cy="101" r="8" fill="${ink}"/>
    <path d="M86 132 q16 14 32 0" fill="none"/>
    <path d="M80 72 l-12 -26 M120 70 l12 -26" /><circle cx="66" cy="42" r="7" fill="#d8a650"/><circle cx="134" cy="42" r="7" fill="#d8a650"/>
    <path d="M60 130 q-24 4 -26 -16 M140 130 q24 4 26 -16" fill="none"/>`),
  marble: box('#e3cfae', `
    <line x1="40" y1="64" x2="120" y2="88" stroke-width="12" stroke="#8f6a48"/>
    <line x1="160" y1="110" x2="78" y2="134" stroke-width="12" stroke="#8f6a48"/>
    <line x1="40" y1="160" x2="120" y2="172" stroke-width="12" stroke="#8f6a48"/>
    <circle cx="70" cy="56" r="13" fill="#5e8f8f" stroke-width="4"/>
    <circle cx="140" cy="100" r="13" fill="#c97b63" stroke-width="4"/>
    <circle cx="100" cy="150" r="13" fill="#d8a650" stroke-width="4"/>`),
  town: box('#b7cfd6', `
    <rect x="34" y="94" width="50" height="64" fill="#efe3cc"/><path d="M28 98 l31 -32 l31 32 z" fill="#c97b63"/>
    <rect x="96" y="76" width="66" height="82" fill="#93ab8b"/><rect x="108" y="92" width="18" height="18" fill="#fbf7ef"/><rect x="134" y="92" width="18" height="18" fill="#fbf7ef"/>
    <rect x="30" y="158" width="140" height="18" fill="#8a8478"/>
    <rect x="52" y="122" width="16" height="36" fill="#d8a650"/>`),
  house: box('#e3cfae', `
    <path d="M36 96 l64 -54 l64 54 z" fill="#c97b63"/>
    <rect x="46" y="96" width="108" height="76" fill="#efe3cc"/>
    <line x1="100" y1="96" x2="100" y2="172"/><line x1="46" y1="134" x2="154" y2="134"/>
    <circle cx="72" cy="118" r="9" fill="#e4b894"/><path d="M64 134 v-8 q8 -6 16 0 v8" fill="#5e8f8f"/>
    <circle cx="128" cy="150" r="9" fill="#9c6848"/><path d="M120 172 v-12 q8 -6 16 0 v12" fill="#d8a650"/>`),
  code: box('#d8a650', `
    <rect x="36" y="44" width="128" height="128" rx="10" fill="#efe3cc"/>
    <path d="M60 80 h44 v-14 l26 26 l-26 26 v-14 h-44 z" fill="#5e8f8f"/>
    <circle cx="76" cy="146" r="14" fill="#c97b63"/><rect x="66" y="126" width="20" height="8" rx="3" fill="#d8a650"/>
    <path d="M110 140 l20 0 l-6 -6 M130 140 l-6 6" fill="none"/>`),
  sequencer: box('#9b7c97', `
    <g fill="#efe3cc" stroke-width="4">
      <circle cx="54" cy="62" r="12"/><circle cx="84" cy="62" r="12" fill="#d8a650"/><circle cx="114" cy="62" r="12"/><circle cx="144" cy="62" r="12"/>
      <circle cx="54" cy="96" r="12" fill="#c97b63"/><circle cx="84" cy="96" r="12"/><circle cx="114" cy="96" r="12" fill="#93ab8b"/><circle cx="144" cy="96" r="12"/>
      <circle cx="54" cy="130" r="12"/><circle cx="84" cy="130" r="12"/><circle cx="114" cy="130" r="12"/><circle cx="144" cy="130" r="12" fill="#5e8f8f"/>
      <circle cx="54" cy="164" r="12" fill="#7898b3"/><circle cx="84" cy="164" r="12"/><circle cx="114" cy="164" r="12"/><circle cx="144" cy="164" r="12"/>
    </g>`),
  radio: box('#5e8f8f', `
    <line x1="64" y1="64" x2="132" y2="40"/>
    <rect x="34" y="66" width="132" height="100" rx="20" fill="#c9a073"/>
    <circle cx="80" cy="116" r="30" fill="#e3cfae"/><circle cx="80" cy="116" r="12" fill="none"/>
    <rect x="118" y="86" width="34" height="18" rx="4" fill="#fbf7ef"/>
    <circle cx="135" cy="134" r="14" fill="#efe3cc"/>`),
  puzzle: box('#86a36f', `
    <rect x="40" y="50" width="58" height="58" fill="#b9cf96"/><rect x="102" y="50" width="58" height="58" fill="#8db8c8"/>
    <rect x="40" y="112" width="58" height="58" fill="#e8cf98"/><rect x="102" y="112" width="58" height="58" fill="#7fa07a"/>
    <path d="M110 160 l14 -30 l14 30 z" fill="#4f7a55"/><path d="M48 160 l20 -22 l22 22" fill="#d8a650"/>
    <path d="M112 84 q16 -14 32 0" fill="none" stroke="#fbf7ef"/>`),
  islands: box('#7fb0bd', `
    <ellipse cx="120" cy="80" rx="40" ry="20" fill="#e8cf98"/><path d="M120 76 q-4 -26 4 -34 M124 44 q-18 -4 -26 8 M124 44 q18 -4 26 8" fill="none"/>
    <path d="M44 140 h76 l-12 22 h-52 z" fill="#c97b63"/><line x1="78" y1="140" x2="78" y2="100"/><path d="M80 102 l28 32 h-28 z" fill="#fbf7ef"/>
    <path d="M136 156 q10 -8 20 0 q10 8 20 0" fill="none" stroke="#fbf7ef"/>`),
  book: box('#c97b63', `
    <path d="M100 60 q-30 -14 -62 -6 v110 q32 -8 62 6 z" fill="#efe3cc"/>
    <path d="M100 60 q30 -14 62 -6 v110 q-32 -8 -62 6 z" fill="#fbf7ef"/>
    <circle cx="70" cy="100" r="14" fill="#d8a650"/><path d="M118 130 q12 -26 30 -6 q-10 12 -30 6" fill="#93ab8b"/>
    <circle cx="132" cy="92" r="9" fill="#dca9a0"/>`),
  space: box('#3d4a5c', `
    <circle cx="86" cy="104" r="36" fill="#d8a650"/>
    <ellipse cx="86" cy="104" rx="58" ry="14" fill="none" stroke="#efe3cc" stroke-width="6" transform="rotate(-18 86 104)"/>
    <circle cx="148" cy="60" r="12" fill="#efe3cc"/>
    <circle cx="146" cy="148" r="18" fill="#fbf7ef"/><circle cx="146" cy="148" r="9" fill="#5e8f8f"/>
    <path d="M44 166 l4 8 l8 2 l-8 3 l-4 8 l-3 -8 l-8 -3 l8 -2 z" fill="#fbf7ef" stroke-width="3"/>`),
  dinos: box('#b9cf96', `
    <path d="M150 168 l-10 -22 q-8 -26 -40 -24 q-22 -6 -32 -44 q-2 -16 -22 -12 q-10 6 -2 14 q14 4 14 22 q4 34 22 50 l-4 16 h14 l4 -12 h22 l4 12 h14" fill="#93ab8b"/>
    <circle cx="48" cy="76" r="3" fill="${ink}"/>
    <path d="M150 86 l12 -30 l12 30 z" fill="#c97b63"/><path d="M154 62 q4 -10 8 -12" fill="none"/>`),
  phonics: box('#efe3cc', `
    <circle cx="100" cy="76" r="30" fill="#d8a650"/>
    <path d="M78 58 l-6 -22 l18 12 M122 58 l6 -22 l-18 12" fill="#d8a650"/>
    <circle cx="90" cy="74" r="4" fill="${ink}"/><circle cx="110" cy="74" r="4" fill="${ink}"/>
    <rect x="36" y="124" width="38" height="46" rx="8" fill="#5e8f8f"/><rect x="81" y="124" width="38" height="46" rx="8" fill="#c97b63"/><rect x="126" y="124" width="38" height="46" rx="8" fill="#5e8f8f"/>
    <path d="M62 138 q-14 -4 -14 10 q0 12 14 8 M97 140 q12 -8 14 6 v12 M108 150 q-12 -4 -12 6 q4 6 12 0 M140 132 v26 M134 140 h12" fill="none" stroke="#fbf7ef" stroke-width="4"/>`),
  draw: box('#fbf7ef', `
    <path d="M44 150 q30 -60 60 -20 q30 40 54 -40" fill="none" stroke="#c97b63" stroke-width="10"/>
    <path d="M40 80 q20 -20 40 0" fill="none" stroke="#5e8f8f" stroke-width="10"/>
    <rect x="120" y="40" width="22" height="78" rx="6" fill="#d8a650" transform="rotate(30 131 79)"/>
    <path d="M110 112 l8 22 l12 -16 z" fill="#efe3cc" transform="rotate(0)"/>`),
};

export const HOME_SVG = `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
<g stroke="${ink}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
<rect x="14" y="18" width="36" height="30" rx="4" fill="#dcbb8e"/>
<line x1="14" y1="33" x2="50" y2="33"/>
<rect x="19" y="22" width="9" height="9" rx="2" fill="#c97b63" stroke-width="2"/>
<circle cx="40" cy="27" r="4.5" fill="#5e8f8f" stroke-width="2"/>
<rect x="21" y="37" width="12" height="9" rx="2" fill="#d8a650" stroke-width="2"/>
<path d="M38 46 l5 -8 l5 8 z" fill="#93ab8b" stroke-width="2"/>
</g></svg>`;

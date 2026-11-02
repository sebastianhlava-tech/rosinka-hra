// Postavička: plátno 200 × 300, díly se skládají na sebe.
// Každý díl má hlavní barvu `c`. Volba barvy ji v kresbě nahradí.
import { eye, eyes, round } from './art.js';

const tint = (markup, from, to) => {
  if (!to || !from) return markup;
  return [from].flat().reduce((m, c) => m.replaceAll(c, to), markup);
};

const NONE = { m: '' };
const line = (d, c, w = 5) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;

const starAt = (x, y, r, fill) => {
  const points = Array.from({ length: 10 }, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const d = i % 2 ? r * 0.45 : r;
    return `${(x + d * Math.cos(a)).toFixed(1)},${(y + d * Math.sin(a)).toFixed(1)}`;
  });
  return `<polygon points="${points.join(' ')}" fill="${fill}"/>`;
};

const heartAt = (x, y, s, fill) => `<path transform="translate(${x} ${y}) scale(${s})" d="M0 9 C-16 -2 -9 -12 0 -5 C9 -12 16 -2 0 9Z" fill="${fill}"/>`;

const flowerAt = (x, y, r, fill, middle = '#FFD432') => [0, 1, 2, 3, 4]
  .map((i) => { const a = (i * Math.PI * 2) / 5 - Math.PI / 2; return round(x + r * Math.cos(a), y + r * Math.sin(a), r * 0.75, r * 0.75, fill); })
  .join('') + round(x, y, r * 0.6, r * 0.6, middle);

const FACES = [
  { skin: '#FFE0C4', mouth: line('M84 122q16 14 32 0', '#7a3b2e', 4), eye: eyes(100, 24, 7) },
  { skin: '#F7CFA8', mouth: '<path d="M80 118q20 26 40 0z" fill="#B3372E"/>', eye: eyes(100, 24, 7) },
  { skin: '#E8B48A', mouth: '<circle cx="100" cy="124" r="8" fill="#B3372E"/>', eye: eyes(100, 24, 9) },
  { skin: '#B57F55', mouth: line('M84 122q16 14 32 0', '#4d2518', 4), eye: line('M66 102q10-12 20 0M114 102q10-12 20 0', '#2b2b2b') },
  { skin: '#7D5235', mouth: '<path d="M80 118q20 26 40 0z" fill="#E9A49C"/>', eye: eyes(100, 24, 7) },
  { skin: '#FFE0C4', mouth: line('M82 120q18 16 36 0', '#7a3b2e', 4), eye: eye(76, 100, 7) + line('M114 102q10-10 20 0', '#2b2b2b') },
  { skin: '#FFE0C4', mouth: '<path d="M76 116q24 34 48 0z" fill="#B3372E"/><path d="M80 116h40l-3 7h-34z" fill="#fff"/>', eye: line('M64 102q12-14 24 0M112 102q12-14 24 0', '#2b2b2b') },
  { skin: '#FFE0C4', mouth: line('M84 120q16 12 32 0', '#7a3b2e', 4) + '<path d="M95 126h16v8q-8 8-16 0z" fill="#F28BA8"/>', eye: eyes(100, 24, 7) },
  { skin: '#FFE0C4', mouth: line('M90 124q10 7 20 0', '#7a3b2e', 4), eye: eyes(100, 24, 8) + line('M62 94l-6-6M68 90l-3-8M138 94l6-6M132 90l3-8', '#2b2b2b', 3) },
  { skin: '#FFE0C4', mouth: line('M84 120q16 16 32 0', '#7a3b2e', 4), eye: eyes(102, 24, 7) + line('M64 84q12-8 24-2M112 82q12-6 24 2', '#2b2b2b', 4) },
];

const HAIR = [
  { c: '#E7B93F', back: round(100, 96, 72, 72, '#E7B93F'), front: '<path d="M36 96 C34 28 166 28 164 96 C140 60 60 60 36 96Z" fill="#E7B93F"/>' },
  { c: '#6B3F1E', back: '', front: '<path d="M38 100 C30 26 170 26 162 100 C138 64 112 72 100 58 C86 74 60 64 38 100Z" fill="#6B3F1E"/><circle cx="30" cy="84" r="24" fill="#6B3F1E"/><circle cx="170" cy="84" r="24" fill="#6B3F1E"/>' },
  { c: '#2B2320', back: '<rect x="30" y="60" width="140" height="130" rx="50" fill="#2B2320"/>', front: '<path d="M36 92 C34 24 166 24 164 92 C150 72 50 72 36 92Z" fill="#2B2320"/>' },
  { c: '#C8562B', back: '', front: '<path d="M40 96 C36 30 164 30 160 96 C150 76 130 72 100 72 C70 72 50 76 40 96Z" fill="#C8562B"/><path d="M36 92 q-30 24 -12 72 q14 -8 22 -60zM164 92 q30 24 12 72 q-14 -8 -22 -60z" fill="#C8562B"/>' },
  { c: '#4A3020', back: [[42, 76], [64, 40], [100, 28], [136, 40], [158, 76], [32, 112], [168, 112]].map(([x, y]) => round(x, y, 26, 26, '#4A3020')).join(''), front: '' },
  { c: '#6B3F1E', back: '<rect x="32" y="50" width="136" height="104" rx="44" fill="#6B3F1E"/>', front: '<path d="M38 86 C38 26 162 26 162 86Z" fill="#6B3F1E"/>' },
  { c: '#E7B93F', back: '', front: '<path d="M38 96 C34 26 166 26 162 96 C140 62 60 62 38 96Z" fill="#E7B93F"/>' + round(44, 34, 22, 30, '#E7B93F') + round(156, 34, 22, 30, '#E7B93F') + round(60, 52, 9, 9, '#E23B3B') + round(140, 52, 9, 9, '#E23B3B') },
  { c: '#8A5A33', back: [150, 172, 194, 216].map((y) => round(158, y, 17, 14, '#8A5A33')).join(''), front: '<path d="M36 96 C34 26 166 26 164 96 C146 62 56 62 36 96Z" fill="#8A5A33"/>' + round(158, 130, 22, 26, '#8A5A33') },
  { c: '#2B2320', back: '', front: round(100, 26, 30, 28, '#2B2320') + '<path d="M38 96 C34 28 166 28 162 96 C140 64 60 64 38 96Z" fill="#2B2320"/>' },
  { c: '#F28BBE', back: '<path d="M30 70 Q10 120 30 150 Q16 180 44 196 H156 Q184 180 170 150 Q190 120 170 70Z" fill="#F28BBE"/>', front: '<path d="M36 92 C34 24 166 24 164 92 C136 58 64 58 36 92Z" fill="#F28BBE"/>' },
];

const SHORT = (c) => `<path d="M38 96 C34 26 166 26 162 96 C146 66 54 66 38 96Z" fill="${c}"/>`;

const DAD_HAIR = [
  { c: '#3B2A1E', back: '', front: SHORT('#3B2A1E') },
  { c: '#8A5A33', back: '', front: '<path d="M38 100 C30 30 170 26 162 92 C130 60 90 84 38 100Z" fill="#8A5A33"/>' },
  { c: '#6B6B6B', back: '', front: line('M38 104 Q34 74 48 66 M162 104 Q166 74 152 66', '#6B6B6B', 16) },
  { c: '#2B2320', back: '', front: [[50, 66], [76, 44], [108, 40], [138, 48], [156, 72]].map(([x, y]) => round(x, y, 24, 24, '#2B2320')).join('') },
  { c: '#C8562B', back: '', front: `${SHORT('#C8562B')}<path d="M38 104 C40 190 160 190 162 104 C150 132 130 112 100 112 C70 112 50 132 38 104Z" fill="#C8562B"/>` },
  { c: '#E7B93F', back: '', front: SHORT('#E7B93F') },
  { c: '#6B3F1E', back: '', front: `${SHORT('#6B3F1E')}<path d="M72 118 Q100 100 128 118 Q100 112 72 118Z" fill="#6B3F1E" stroke="#6B3F1E" stroke-width="6"/>` },
  { c: '#2B2320', back: '<rect x="30" y="60" width="140" height="110" rx="46" fill="#2B2320"/>', front: '<path d="M36 92 C34 24 166 24 164 92 C150 72 50 72 36 92Z" fill="#2B2320"/>' },
  { c: '#9A9A9A', back: '', front: `${SHORT('#9A9A9A')}<path d="M42 106 C46 180 154 180 158 106 C144 128 56 128 42 106Z" fill="#9A9A9A"/>` },
  { c: '#E23B3B', back: '', front: '<path d="M78 56 L84 18 L94 44 L100 10 L106 44 L116 18 L122 56Z" fill="#E23B3B"/>' + line('M42 100 Q40 76 52 66 M158 100 Q160 76 148 66', '#E23B3B', 12) },
];

const DRESS = [
  { c: '#FF8FC0', extra: '' },
  { c: '#FFD432', extra: [[78, 196], [120, 180], [100, 226], [64, 236], [134, 228]].map(([x, y]) => round(x, y, 7, 7, '#fff')).join('') },
  { c: '#2F6FDE', extra: '<path d="M64 200h72M56 222h88M50 244h100" stroke="#fff" stroke-width="7"/>' },
  { c: '#3DAA4E', extra: '<rect x="82" y="205" width="36" height="26" rx="6" fill="#FFD432"/>' },
  { c: '#E23B3B', extra: [[80, 200], [120, 200], [70, 232], [100, 226], [130, 232]].map(([x, y]) => round(x, y, 6, 6, '#fff')).join('') },
  { c: '#8E4EC6', extra: '<path d="M100 214 C84 200 72 214 100 238 C128 214 116 200 100 214Z" fill="#FFD432"/>' },
  { c: '#FF8A1F', extra: '<path d="M60 214q10 12 20 0q10 12 20 0q10 12 20 0q10 12 20 0M48 246q13 12 26 0q13 12 26 0q13 12 26 0q13 12 26 0" fill="none" stroke="#fff" stroke-width="6"/>' },
  { c: '#2FB6B0', body: '<rect x="70" y="160" width="60" height="62" rx="14" fill="#2FB6B0"/><rect x="72" y="216" width="26" height="46" fill="#2F6FDE"/><rect x="102" y="216" width="26" height="46" fill="#2F6FDE"/>' },
  { c: '#3F6FB5', body: '<rect x="70" y="160" width="60" height="50" rx="12" fill="#FFD432"/><rect x="72" y="214" width="26" height="48" fill="#3F6FB5"/><rect x="102" y="214" width="26" height="48" fill="#3F6FB5"/><rect x="76" y="182" width="48" height="42" rx="5" fill="#3F6FB5"/><path d="M82 184V160M118 184V160" stroke="#3F6FB5" stroke-width="8"/>' },
  { c: '#FFC2DD', body: '<path d="M76 160 H124 L132 198 Q172 230 164 258 H36 Q28 230 68 198Z" fill="#FFC2DD"/><path d="M68 198 H132" stroke="#FFD432" stroke-width="8"/>' + [[62, 232], [100, 240], [138, 232]].map(([x, y]) => round(x, y, 7, 7, '#FFD432')).join('') },
];

const SHIRTS = [
  '',
  [[80, 150], [118, 146], [100, 176], [76, 192], [124, 190]].map(([x, y]) => round(x, y, 6, 6, '#fff')).join(''),
  '<path d="M63 152h74M63 172h74M63 192h74" stroke="#fff" stroke-width="7"/>',
  '<rect x="108" y="150" width="22" height="24" rx="4" fill="#fff" opacity=".85"/>',
  [[72, 144], [100, 144], [128, 144], [86, 166], [114, 166], [72, 188], [100, 188], [128, 188]].map(([x, y]) => round(x, y, 4, 4, '#FFD432')).join(''),
  heartAt(100, 168, 2.2, '#FFD432'),
  '<path d="M63 160l12-10 12 10 13-10 13 10 12-10 12 10" fill="none" stroke="#fff" stroke-width="6"/>',
  '<path d="M86 128l14 14 14-14z" fill="#fff"/><path d="M96 140h8l4 44-8 10-8-10z" fill="#E23B3B"/>',
  starAt(100, 170, 24, '#FFD432'),
  '<path d="M100 142l-18-10v20zM100 142l18-10v20z" fill="#E23B3B"/><path d="M100 160v50" stroke="#fff" stroke-width="3" stroke-dasharray="1 13" stroke-linecap="round"/>',
];

const SHOES = [
  { c: '#E23B3B', m: '<rect x="60" y="272" width="38" height="20" rx="10" fill="#E23B3B" stroke="#555" stroke-width="2"/>' },
  { c: '#2F6FDE', m: '<rect x="60" y="270" width="38" height="20" rx="9" fill="#2F6FDE" stroke="#555" stroke-width="2"/><rect x="58" y="286" width="42" height="8" rx="4" fill="#fff" stroke="#555" stroke-width="2"/><path d="M76 275h13M76 281h13" stroke="#fff" stroke-width="3"/>' },
  { c: '#FFD432', m: '<path d="M71 238h27v54H60q-3-14 11-19z" fill="#FFD432" stroke="#555" stroke-width="2"/><rect x="69" y="238" width="31" height="9" rx="4" fill="#fff" stroke="#555" stroke-width="2"/>' },
  { c: '#FF8A1F', m: '<rect x="60" y="272" width="38" height="20" rx="10" fill="SKIN"/><rect x="58" y="287" width="42" height="7" rx="3" fill="#8A5A33"/><path d="M66 288V276M80 288V272M92 288V276" stroke="#FF8A1F" stroke-width="6" stroke-linecap="round"/>' },
  { c: '#FF8FC0', m: '<path d="M60 284q0-10 12-10h16q10 0 10 10q0 8-10 8H70q-10 0-10-8z" fill="#FF8FC0" stroke="#555" stroke-width="2"/><path d="M79 278l-8-5v10zM79 278l8-5v10z" fill="#fff"/>' },
  { c: '#8E4EC6', m: '<rect x="72" y="244" width="24" height="32" fill="#fff"/><path d="M72 252h24M72 264h24" stroke="#8E4EC6" stroke-width="6"/><rect x="60" y="272" width="38" height="20" rx="10" fill="#8E4EC6" stroke="#555" stroke-width="2"/>' },
  { c: '#FFFFFF', m: '<rect x="58" y="268" width="42" height="25" rx="12" fill="#FFFFFF" stroke="#555" stroke-width="2"/><path d="M68 270q-5-18 3-20q6 6 3 20M86 270q5-18-3-20q-6 6-3 20" fill="#FFFFFF" stroke="#555" stroke-width="2"/><circle cx="72" cy="279" r="2.6" fill="#2b2b2b"/><circle cx="86" cy="279" r="2.6" fill="#2b2b2b"/><circle cx="79" cy="284" r="3" fill="#FF8FC0"/>' },
  { c: '#2FB6B0', m: `<rect x="60" y="272" width="38" height="20" rx="10" fill="#2FB6B0" stroke="#555" stroke-width="2"/>${starAt(79, 282, 8, '#FFD432')}` },
  { c: '#E23B3B', m: '<path d="M72 256h25v30H60q-1-10 12-14z" fill="#E23B3B" stroke="#555" stroke-width="2"/><rect x="60" y="285" width="38" height="6" fill="#ddd"/><circle cx="68" cy="294" r="5" fill="#333"/><circle cx="90" cy="294" r="5" fill="#333"/>' },
  { c: '#FFC2DD', m: '<path d="M72 248l22 12M94 248l-22 12M72 260l22 12M94 260l-22 12" stroke="#FFC2DD" stroke-width="4"/><rect x="60" y="273" width="38" height="19" rx="10" fill="#FFC2DD" stroke="#555" stroke-width="2"/>' },
];

const HATS = [
  NONE,
  { c: '#E23B3B', m: '<path d="M100 48 L66 26 Q58 48 66 66Z M100 48 L134 26 Q142 48 134 66Z" fill="#E23B3B"/><circle cx="100" cy="48" r="11" fill="#B9202A"/>' },
  { c: ['#F2D88C', '#E8C872'], m: '<ellipse cx="100" cy="46" rx="86" ry="15" fill="#E8C872"/><path d="M52 44 C52 2 148 2 148 44Z" fill="#F2D88C"/><rect x="52" y="34" width="96" height="11" fill="#E23B3B"/>' },
  { c: '#FFD432', m: '<path d="M56 54 L50 8 L78 30 L100 4 L122 30 L150 8 L144 54Z" fill="#FFD432" stroke="#E2B41C" stroke-width="4"/><circle cx="100" cy="42" r="6" fill="#E23B3B"/>' },
  { c: '#2F6FDE', m: '<path d="M48 52 C48 -6 152 -6 152 52Z" fill="#2F6FDE"/><rect x="42" y="44" width="116" height="16" rx="8" fill="#fff"/><circle cx="100" cy="6" r="13" fill="#fff"/>' },
  { c: '#3DAA4E', m: '<path d="M46 62 C44 0 156 0 154 62Z" fill="#3DAA4E"/><path d="M150 50 Q190 50 194 66 Q170 70 118 60Z" fill="#3DAA4E" stroke="#fff" stroke-width="3"/><circle cx="100" cy="16" r="5" fill="#fff"/>' },
  { c: '#8E4EC6', m: `<path d="M100 -12 L142 52 H58Z" fill="#8E4EC6"/>${round(88, 34, 5, 5, '#FFD432')}${round(112, 22, 5, 5, '#fff')}${round(114, 42, 5, 5, '#FF8FC0')}${round(100, -12, 10, 10, '#FFD432')}` },
  { c: '#FF8FC0', m: [[40, 72], [56, 50], [80, 38], [120, 38], [144, 50], [160, 72]].map(([x, y]) => flowerAt(x, y, 10, '#FF8FC0')).join('') + flowerAt(100, 34, 13, '#FF8FC0') },
  { c: '#FF8A1F', m: '<path d="M46 62 C60 26 140 26 154 62" fill="none" stroke="#FF8A1F" stroke-width="9"/><path d="M46 64 L44 10 L84 38Z M154 64 L156 10 L116 38Z" fill="#FF8A1F"/><path d="M54 48 L52 26 L70 38Z M146 48 L148 26 L130 38Z" fill="#FFC2DD"/>' },
  { c: '#FFFFFF', m: '<path d="M46 62 C60 26 140 26 154 62" fill="none" stroke="#FFFFFF" stroke-width="9"/><rect x="58" y="-16" width="30" height="66" rx="15" fill="#FFFFFF" stroke="#D5D9DE" stroke-width="3"/><rect x="112" y="-16" width="30" height="66" rx="15" fill="#FFFFFF" stroke="#D5D9DE" stroke-width="3"/><rect x="66" y="-6" width="14" height="46" rx="7" fill="#FFC2DD"/><rect x="120" y="-6" width="14" height="46" rx="7" fill="#FFC2DD"/>' },
  { c: '#FFD432', m: '<path d="M46 62 C60 26 140 26 154 62" fill="none" stroke="#FF8FC0" stroke-width="9"/><path d="M86 42 L100 -14 L114 42Z" fill="#FFD432" stroke="#E2B41C" stroke-width="3"/><path d="M90 32l18-8M93 18l12-5" stroke="#fff" stroke-width="4"/>' + flowerAt(64, 42, 9, '#FF8FC0') + flowerAt(136, 42, 9, '#8E4EC6') },
];

const twoEyes = (left) => left + `<g transform="matrix(-1 0 0 1 200 0)">${left}</g>`;

const GLASSES = [
  NONE,
  { c: '#2F6FDE', m: `<circle cx="76" cy="100" r="19" fill="rgba(255,255,255,.3)" stroke="#2F6FDE" stroke-width="5"/><circle cx="124" cy="100" r="19" fill="rgba(255,255,255,.3)" stroke="#2F6FDE" stroke-width="5"/>${line('M95 98q5-4 10 0', '#2F6FDE')}` },
  { c: '#222223', m: `<rect x="56" y="84" width="40" height="32" rx="7" fill="rgba(255,255,255,.3)" stroke="#222223" stroke-width="5"/><rect x="104" y="84" width="40" height="32" rx="7" fill="rgba(255,255,255,.3)" stroke="#222223" stroke-width="5"/>${line('M96 98h8', '#222223')}` },
  { c: '#E23B3B', m: `${heartAt(76, 102, 2.6, '#E23B3B')}${heartAt(124, 102, 2.6, '#E23B3B')}${heartAt(76, 102, 1.8, 'rgba(255,255,255,.72)')}${heartAt(124, 102, 1.8, 'rgba(255,255,255,.72)')}${eyes(100, 24, 5)}${line('M96 98h8', '#E23B3B')}` },
  { c: '#FFD432', m: `${starAt(76, 100, 30, '#FFD432')}${starAt(124, 100, 30, '#FFD432')}${round(76, 100, 11, 11, 'rgba(255,255,255,.75)')}${round(124, 100, 11, 11, 'rgba(255,255,255,.75)')}${eyes(100, 24, 5)}` },
  { c: '#2B2B2C', m: `<path d="M52 84H96V102Q94 120 74 120Q54 120 52 102Z M104 84H148V102Q146 120 126 120Q106 120 104 102Z" fill="#2B2B2C"/>${line('M96 90h8', '#2B2B2C')}${line('M60 92l10 10M112 92l10 10', 'rgba(255,255,255,.6)', 4)}` },
  { c: '#FF8FC0', m: `<path d="M50 80Q76 84 96 92Q98 120 74 118Q56 116 50 80Z M150 80Q124 84 104 92Q102 120 126 118Q144 116 150 80Z" fill="rgba(255,255,255,.35)" stroke="#FF8FC0" stroke-width="6" stroke-linejoin="round"/>${line('M96 98h8', '#FF8FC0')}` },
  { c: '#8E4EC6', m: twoEyes([0, 1, 2, 3, 4, 5, 6, 7].map((i) => { const a = (i * Math.PI) / 4; return round(76 + 21 * Math.cos(a), 100 + 21 * Math.sin(a), 8, 8, '#8E4EC6'); }).join('')) },
  { c: '#FF8A1F', m: '<rect x="38" y="94" width="124" height="10" fill="#333"/><rect x="50" y="78" width="100" height="44" rx="20" fill="rgba(170,226,250,.6)" stroke="#FF8A1F" stroke-width="7"/>' },
  { c: '#242425', m: `${line('M42 80 L158 118', '#242425', 4)}<ellipse cx="124" cy="102" rx="20" ry="18" fill="#242425"/>` },
  { c: '#E23B3C', m: '<path fill-rule="evenodd" d="M44 88Q72 74 100 88Q128 74 156 88Q152 122 124 120Q108 118 100 106Q92 118 76 120Q48 122 44 88Z M64 100a12 11 0 1 0 24 0a12 11 0 1 0-24 0Z M112 100a12 11 0 1 0 24 0a12 11 0 1 0-24 0Z" fill="#E23B3C"/>' },
];

const beads = (n, r, fill) => Array.from({ length: n }, (_, i) => {
  const t = (i + 0.5) / n;
  const x = 74 + 52 * t;
  const y = 162 + 34 * t * (1 - t) * 2;
  return round(x, y, r, r, typeof fill === 'function' ? fill(i) : fill);
}).join('');

const CHAIN = line('M74 162 Q100 196 126 162', '#E2B41C', 3);
const RAINBOW = ['#E23B3D', '#FF8A1F', '#FFD432', '#3DAA4E', '#2F6FDE', '#8E4EC6'];

const NECKLACES = [
  NONE,
  { c: '#F7F1E3', m: beads(11, 5, '#F7F1E3') },
  { c: '#E23B3B', m: CHAIN + heartAt(100, 188, 1.3, '#E23B3B') },
  { c: '#FFD433', m: CHAIN + starAt(100, 190, 13, '#FFD433') },
  { c: '#2F6FDE', m: '<path d="M78 158 L100 192 L122 158 L112 158 L100 176 L88 158Z" fill="#2F6FDE"/><circle cx="100" cy="198" r="14" fill="#FFD432" stroke="#E2B41C" stroke-width="3"/>' + starAt(100, 198, 8, '#fff') },
  { c: '#FF8FC0', m: [[76, 170], [88, 180], [100, 184], [112, 180], [124, 170]].map(([x, y]) => flowerAt(x, y, 7, '#FF8FC0')).join('') },
  { c: '#E23B3C', m: '<path d="M68 158 Q100 186 132 158 L136 172 Q100 200 64 172Z" fill="#E23B3C"/><path d="M112 178 L130 226 L110 226 L100 182Z" fill="#E23B3C"/><path d="M114 208l15-4M119 220l13-3" stroke="#fff" stroke-width="3"/>' },
  { c: '#2F6FDF', m: '<path d="M100 176 L76 164 V190Z M100 176 L124 164 V190Z" fill="#2F6FDF"/><circle cx="100" cy="176" r="7" fill="#1E4FA8"/>' },
  { c: '#E23B3D', m: beads(12, 5, (i) => RAINBOW[i % 6]) },
  { c: '#3DAA4F', m: `<path d="M72 164 Q100 190 128 164" fill="none" stroke="#3DAA4F" stroke-width="9" stroke-linecap="round"/>${round(100, 190, 13, 13, '#FFD432')}${line('M90 192h20', '#C99A10', 3)}${round(100, 197, 3, 3, '#7a5a10')}` },
  { c: '#8E4EC7', m: '<path d="M100 170 L112 178 L108 214 L100 226 L92 214 L88 178Z" fill="#8E4EC7"/><path d="M90 164h20l-5 12h-10z" fill="#8E4EC7" stroke="#fff" stroke-width="2"/><path d="M92 196l16-8M91 210l17-8" stroke="#fff" stroke-width="3"/>' },
];

const halves = (left) => left + `<g transform="matrix(-1 0 0 1 200 0)">${left}</g>`;

const BACK = [
  NONE,
  { c: '#8E4EC8', m: halves(`<ellipse cx="46" cy="158" rx="44" ry="40" fill="#8E4EC8" transform="rotate(-20 46 158)"/><ellipse cx="56" cy="226" rx="32" ry="30" fill="#FF8FC0"/>${round(40, 156, 13, 13, '#FFD432')}${round(54, 226, 10, 10, '#FFD432')}`) },
  { c: '#FDFDFD', m: halves('<path d="M84 180 C50 120 10 124 4 150 C16 152 18 156 10 168 C22 166 28 172 20 186 C32 182 40 188 34 202 C50 196 66 200 84 204Z" fill="#FDFDFD" stroke="#CFD8E0" stroke-width="3"/>') },
  { c: '#E23B3E', m: '<path d="M72 160 H128 L170 276 Q100 262 30 276Z" fill="#E23B3E"/>' },
  { c: '#FF8A1F', m: '<rect x="44" y="158" width="112" height="86" rx="24" fill="#FF8A1F" stroke="#C9650F" stroke-width="3"/><rect x="44" y="204" width="26" height="30" rx="8" fill="#FFD432"/><rect x="130" y="204" width="26" height="30" rx="8" fill="#FFD432"/>' },
  { c: '#3DAA50', m: halves('<path d="M84 186 L28 128 L6 182 L30 170 L22 214 L48 192 L46 232 L84 208Z" fill="#3DAA50" stroke="#2A7D38" stroke-width="3" stroke-linejoin="round"/>') },
  { c: '#FF8A20', m: '<path d="M126 236 C170 250 196 218 190 170 C168 176 150 196 124 206Z" fill="#FF8A20"/><path d="M190 170 C176 174 166 182 158 190 C172 196 186 198 193 196Z" fill="#fff"/>' },
  { c: '#4FA85A', m: `${round(100, 196, 76, 70, '#4FA85A')}${line('M100 130v130M30 196h140M50 148l100 96M150 148l-100 96', '#2F7A3B', 5)}` },
  { c: '#9BD6F2', m: halves('<ellipse cx="44" cy="164" rx="52" ry="20" fill="#9BD6F2" opacity=".75" transform="rotate(32 44 164)"/><ellipse cx="50" cy="224" rx="42" ry="16" fill="#FF8FC0" opacity=".75" transform="rotate(-32 50 224)"/>') },
  { c: '#AAB4BE', m: halves('<rect x="40" y="154" width="34" height="78" rx="17" fill="#AAB4BE" stroke="#7E8892" stroke-width="3"/><rect x="40" y="172" width="34" height="9" fill="#E23B3B"/><path d="M44 232 Q57 276 70 232Z" fill="#FF8A1F"/><path d="M50 232 Q57 258 64 232Z" fill="#FFD432"/>') },
  { c: '#E23B3F', m: halves(RAINBOW.map((c, i) => `<path d="M84 200 C60 ${112 + i * 10} ${10 + i * 7} ${124 + i * 8} ${6 + i * 7} 196 C${28 + i * 5} 188 ${50 + i * 3} 200 84 ${212 - i}Z" fill="${i ? c : '#E23B3F'}"/>`).join('')) },
];

const stick = (y, c = '#8A5A33', w = 5) => line(`M0 6 L0 ${y}`, c, w);

const HAND = [
  NONE,
  { c: '#FF8FC1', m: `${line('M0 0 Q-4 -30 6 -68', '#888', 2)}<ellipse cx="7" cy="-94" rx="20" ry="26" fill="#FF8FC1"/><path d="M7 -70l-5 6h10z" fill="#FF8FC1"/>${round(0, -102, 4, 7, 'rgba(255,255,255,.7)')}` },
  { c: '#E23B41', m: stick(-46, '#3DAA4E') + flowerAt(0, -56, 12, '#E23B41') },
  { c: '#FF8FC2', m: `${stick(-34, '#fff', 6)}<circle cx="0" cy="-54" r="23" fill="#FF8FC2"/>${line('M0 -54 q8 -8 12 2 q-2 14 -16 12 q-14 -8 -8 -22 q10 -12 24 -4', '#fff', 4)}` },
  { c: '#FFD435', m: stick(-48, '#8E4EC6') + starAt(0, -60, 21, '#FFD435') },
  { c: '#A9713F', m: `${round(-13, -56, 8, 8, '#A9713F')}${round(13, -56, 8, 8, '#A9713F')}${round(0, -16, 18, 20, '#A9713F')}${round(0, -44, 16, 16, '#A9713F')}${round(0, -39, 7, 5, '#EFD3B0')}${round(-6, -47, 2, 2, '#222')}${round(6, -47, 2, 2, '#222')}` },
  { c: '#2F6FE0', m: `${stick(-74, '#555')}<path d="M-34 -72 Q-32 -112 -2 -112 Q28 -112 28 -72 Q17 -82 8 -72 Q-2 -82 -13 -72 Q-24 -82 -34 -72Z" fill="#2F6FE0"/>` },
  { c: '#FFC2DE', m: `<path d="M-13 -32 L13 -32 L0 8Z" fill="#E0A85A"/>${round(0, -42, 16, 16, '#FFC2DE')}${round(0, -58, 12, 12, '#FFFFFF')}${round(3, -71, 5, 5, '#E23B3B')}` },
  { c: '#FF8A21', m: stick(-48, '#fff') + [0, 90, 180, 270].map((a) => `<path transform="translate(0 -52) rotate(${a})" d="M0 0 Q18 -24 0 -30 Z" fill="${a % 180 ? '#FFD432' : '#FF8A21'}"/>`).join('') },
  { c: '#3DAA51', m: `${stick(-84, '#8A5A33')}<path d="M0 -84 L-32 -74 L-22 -64 L-32 -54 L0 -54Z" fill="#3DAA51"/>` },
  { c: '#2FB6B1', m: `${stick(-50, '#8A5A33')}<circle cx="0" cy="-74" r="22" fill="rgba(255,255,255,.55)" stroke="#2FB6B1" stroke-width="6"/>${line('M-14 -86 L14 -62 M14 -86 L-14 -62', '#fff', 2)}` },
];

const cheeks = (draw) => draw(62, 120) + draw(138, 120);

const PAINT = [
  NONE,
  { c: '#A9602F', m: cheeks((x, y) => round(x - 8, y, 2.5, 2.5, '#A9602F') + round(x + 7, y - 3, 2.5, 2.5, '#A9602F') + round(x, y + 6, 2.5, 2.5, '#A9602F')) },
  { c: '#E23B42', m: heartAt(138, 120, 1.3, '#E23B42') },
  { c: '#FFD436', m: starAt(62, 120, 13, '#FFD436') },
  { c: '#2B2B2D', m: `<path d="M100 112m-7 0a7 5 0 1 0 14 0a7 5 0 1 0-14 0" fill="#2B2B2D"/>${line('M84 112 L46 104 M84 118 L46 122 M116 112 L154 104 M116 118 L154 122', '#2B2B2D', 3)}` },
  { c: '#E23B43', m: '<circle cx="100" cy="112" r="12" fill="#E23B43"/><circle cx="96" cy="108" r="3" fill="#fff"/>' },
  { c: '#FF8FC3', m: flowerAt(138, 122, 7, '#FF8FC3') },
  { c: '#2F6FE1', m: [[52, 92], [58, 80], [70, 74], [148, 92], [142, 80], [130, 74]].map(([x, y]) => round(x, y, 3.5, 3.5, '#2F6FE1')).join('') },
  { c: '#6B3F1F', m: '<path d="M100 112 C88 104 70 108 62 120 C76 120 90 120 100 116 C110 120 124 120 138 120 C130 108 112 104 100 112Z" fill="#6B3F1F"/>' },
  { c: '#6B3F20', m: '<path d="M46 124 C54 176 146 176 154 124 C146 148 124 142 100 142 C76 142 54 148 46 124Z" fill="#6B3F20"/>' },
  { c: '#E23B44', m: `${['#E23B44', '#FFD432', '#3DAA4E', '#2F6FDE'].map((c, i) => line(`M${48 + i * 4} 128 a${14 - i * 4} ${14 - i * 4} 0 0 1 ${28 - i * 8} 0`, c, 4)).join('')}` },
];

const paint = (entry, color) => tint(entry.m, entry.c, color);

const foot = (i, color, skin) => tint(SHOES[i].m, SHOES[i].c, color).replaceAll('SKIN', skin);
const shoesPart = (i, color, skin = '#F7CFA8') => { const f = foot(i, color, skin); return f + `<g transform="matrix(-1 0 0 1 200 0)">${f}</g>`; };
const dressPart = (i, color) => tint(DRESS[i].body ?? `<path d="M72 160 H128 L156 258 H44Z" fill="${DRESS[i].c}"/>${DRESS[i].extra}`, DRESS[i].c, color);
const shirtPart = (i, color) => `<rect x="62" y="126" width="76" height="92" rx="16" fill="${color ?? DRESS[i].c}"/>${SHIRTS[i]}<rect x="68" y="206" width="30" height="72" fill="#3F4A63"/><rect x="102" y="206" width="30" height="72" fill="#3F4A63"/>`;
const facePart = (i, skin = '#F7CFA8') => `${round(100, 104, 62, 62, skin)}${FACES[i].eye}${round(62, 118, 11, 8, '#F7A9A0')}${round(138, 118, 11, 8, '#F7A9A0')}${FACES[i].mouth}`;
const hairOf = (kind, i, color) => {
  const h = (kind === 'dad' ? DAD_HAIR : HAIR)[i];
  return { back: tint(h.back, h.c, color), front: tint(h.front, h.c, color) };
};

const figure = (body) => `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="320" viewBox="0 -20 200 320">${body}</svg>`;
const crop = (body, box) => `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="${box}">${body}</svg>`;
const head = (body) => `<g transform="translate(25 -6) scale(.75)">${body}</g>`;

const TOP_OF_HEAD = (c, hair) => facePart(c.face, c.colors.face) + paint(PAINT[c.paint], c.colors.paint) + hair.front + paint(GLASSES[c.glasses], c.colors.glasses) + paint(HATS[c.hat], c.colors.hat);

function childSvg(c) {
  const skin = c.colors.face;
  const hair = hairOf('child', c.hair, c.colors.hair);
  return figure(
    paint(BACK[c.back], c.colors.back)
    + hair.back
    + `<rect x="74" y="244" width="20" height="34" fill="${skin}"/><rect x="106" y="244" width="20" height="34" fill="${skin}"/>`
    + shoesPart(c.shoes, c.colors.shoes, skin)
    + `<path d="M70 174 L32 214" stroke="${skin}" stroke-width="17" stroke-linecap="round"/><path d="M130 174 L168 214" stroke="${skin}" stroke-width="17" stroke-linecap="round"/>`
    + dressPart(c.dress, c.colors.dress)
    + paint(NECKLACES[c.necklace], c.colors.necklace)
    + TOP_OF_HEAD(c, hair)
    + `<g transform="translate(168 212)">${paint(HAND[c.hand], c.colors.hand)}</g>`,
  );
}

function adultSvg(kind, c) {
  const skin = c.colors.face;
  const dad = kind === 'dad';
  const hair = hairOf(kind, c.hair, c.colors.hair);
  return figure(
    `<g transform="translate(0 -24)">${paint(BACK[c.back], c.colors.back)}</g>`
    + head(hair.back)
    + `<rect x="90" y="108" width="20" height="30" fill="${skin}"/>`
    + `<rect x="74" y="210" width="20" height="66" fill="${skin}"/><rect x="106" y="210" width="20" height="66" fill="${skin}"/>`
    + shoesPart(c.shoes, c.colors.shoes, skin)
    + `<path d="M72 142 L36 196" stroke="${skin}" stroke-width="16" stroke-linecap="round"/><path d="M128 142 L164 196" stroke="${skin}" stroke-width="16" stroke-linecap="round"/>`
    + (dad ? shirtPart(c.dress, c.colors.dress) : `<g transform="translate(20 -30) scale(.8 .98)">${dressPart(c.dress, c.colors.dress)}</g>`)
    + `<g transform="translate(20 -2) scale(.8)">${paint(NECKLACES[c.necklace], c.colors.necklace)}</g>`
    + head(TOP_OF_HEAD(c, hair))
    + `<g transform="translate(164 194)">${paint(HAND[c.hand], c.colors.hand)}</g>`,
  );
}

// Starší uložená postava měla barvu kůže v obličeji a barvu botiček v jejich čísle.
const OLD_SHOES = ['#E23B3B', '#2F6FDE', '#FFD432', '#FF8FC0', '#FFFFFF'];
const NO_EXTRAS = { glasses: 0, necklace: 0, back: 0, hand: 0, paint: 0 };

export function normalizeCharacter(choice) {
  if (choice.colors) return { ...NO_EXTRAS, ...choice, colors: { ...choice.colors } };
  return { ...NO_EXTRAS, ...choice, shoes: 0, colors: { face: FACES[choice.face].skin, shoes: OLD_SHOES[choice.shoes] } };
}

export function characterFor(kind, choice) {
  const c = normalizeCharacter(choice);
  return kind === 'child' ? childSvg(c) : adultSvg(kind, c);
}

const noneSign = crop('<circle cx="60" cy="60" r="40" fill="none" stroke="#C9D1D8" stroke-width="9"/><path d="M32 32 L88 88" stroke="#C9D1D8" stroke-width="9"/>', '0 0 120 120');

// Náhled jednoho dílu pro tvorbu postavičky.
export function partSvg(category, i, kind = 'child', choice = { colors: {} }) {
  const color = choice.colors[category];
  const skin = choice.colors.face ?? '#F7CFA8';
  const blank = round(100, 104, 62, 62, skin);
  if (category === 'face') return crop(facePart(i, color ?? FACES[i].skin), '30 34 140 140');
  if (category === 'hair') {
    const h = hairOf(kind, i, color);
    return crop(h.back + blank + h.front, '0 0 200 220');
  }
  if (category === 'dress') return kind === 'dad' ? crop(shirtPart(i, color), '30 120 140 165') : crop(dressPart(i, color), '20 150 160 120');
  if (category === 'shoes') return crop(shoesPart(i, color, skin), '50 232 100 70');
  if (i === 0) return noneSign;
  if (category === 'hat') return crop(paint(HATS[i], color), '10 -24 180 110');
  if (category === 'glasses') return crop(blank + paint(GLASSES[i], color), '36 50 128 100');
  if (category === 'necklace') return crop(`<rect x="64" y="150" width="72" height="90" rx="14" fill="#E9EDF2"/>${paint(NECKLACES[i], color)}`, '50 148 100 90');
  if (category === 'back') return crop(paint(BACK[i], color), '0 118 200 165');
  if (category === 'hand') return crop(`<g transform="translate(60 118)">${paint(HAND[i], color)}</g>`, '10 0 100 125');
  return crop(blank + paint(PAINT[i], color), '30 34 140 140');
}

const LISTS = { hat: HATS, glasses: GLASSES, necklace: NECKLACES, back: BACK, hand: HAND, paint: PAINT, shoes: SHOES, face: FACES, dress: DRESS };

export function optionCount(category, kind) {
  if (category === 'hair') return (kind === 'dad' ? DAD_HAIR : HAIR).length;
  return LISTS[category].length;
}

export const hasColor = (category, i) => ['face', 'hair', 'dress'].includes(category) || Boolean(LISTS[category][i].c);

const SKINS = ['#FFE9D6', '#FFE0C4', '#F7CFA8', '#E8B48A', '#D29A6B', '#B57F55', '#7D5235', '#5A3A25'];
const HAIR_COLORS = ['#F3DFA0', '#E7B93F', '#C8562B', '#8A5A33', '#4A3020', '#2B2320', '#9A9A9A', '#F28BBE', '#8E4EC6', '#2F6FDE', '#2FB6B0', '#3DAA4E'];
const BRIGHT = ['#E23B3B', '#FF8A1F', '#FFD432', '#3DAA4E', '#2FB6B0', '#2F6FDE', '#8E4EC6', '#FF8FC0', '#8A5A33', '#222222', '#AAB4BE', '#FFFFFF'];

export const paletteFor = (category) => ({ face: SKINS, hair: HAIR_COLORS }[category] ?? BRIGHT);

const dice = (n) => Math.floor(Math.random() * n);

// Kostka mění všechno kromě barvy kůže.
export function randomCharacter(kind, choice) {
  const c = { ...choice, colors: { face: choice.colors.face } };
  for (const { id } of CATEGORIES) c[id] = dice(optionCount(id, kind));
  return c;
}

export const CATEGORIES = [
  { id: 'face', label: 'Obličej' },
  { id: 'hair', label: 'Vlasy' },
  { id: 'dress', label: 'Oblečení' },
  { id: 'shoes', label: 'Botičky' },
  { id: 'hat', label: 'Čepice' },
  { id: 'glasses', label: 'Brýle' },
  { id: 'necklace', label: 'Na krk' },
  { id: 'back', label: 'Na záda' },
  { id: 'hand', label: 'Do ruky' },
  { id: 'paint', label: 'Na tvář' },
];

export const DEFAULT_CHARACTERS = {
  child: { face: 0, hair: 0, dress: 0, shoes: 0, hat: 1 },
  mom: { face: 0, hair: 2, dress: 4, shoes: 0, hat: 0 },
  dad: { face: 1, hair: 0, dress: 2, shoes: 1, hat: 0 },
};

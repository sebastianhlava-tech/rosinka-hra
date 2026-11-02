// Veškerá grafika je SVG v kódu. Každý obrázek má plátno 200 × 200.

const svg = (body, w = 200, h = 200) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`;

const eye = (x, y, r = 6) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#2b2b2b"/><circle cx="${x + 2}" cy="${y - 2}" r="${r / 3}" fill="#fff"/>`;
const eyes = (y = 85, gap = 28, r = 6) => eye(100 - gap, y, r) + eye(100 + gap, y, r);
const smile = (y = 120, w = 22, c = '#2b2b2b') => `<path d="M${100 - w} ${y} q${w} ${w * 0.8} ${w * 2} 0" fill="none" stroke="${c}" stroke-width="5" stroke-linecap="round"/>`;
const round = (cx, cy, rx, ry, fill) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}"/>`;

export const COLORS = {
  red: '#E23B3B', blue: '#2F6FDE', yellow: '#FFD432', green: '#3DAA4E', orange: '#FF8A1F',
  pink: '#FF8FC0', purple: '#8E4EC6', brown: '#8A5A33', black: '#222222', white: '#FFFFFF',
};

const ITEMS = {
  dog: round(50, 95, 24, 52, '#7A4B28') + round(150, 95, 24, 52, '#7A4B28') + round(100, 105, 66, 66, '#C68A52') + round(100, 133, 34, 26, '#EFD3B0') + eyes(92) + round(100, 120, 11, 8, '#2b2b2b') + smile(138, 12),
  cat: '<path d="M42 96 L48 28 L95 60Z M158 96 L152 28 L105 60Z" fill="#F0A23C"/>' + round(100, 108, 66, 62, '#F0A23C') + eyes(98) + '<path d="M92 118h16l-8 9z" fill="#E86A8A"/>' + smile(130, 12) + '<path d="M30 108h30M30 124h30M170 108h-30M170 124h-30" stroke="#6b4a1e" stroke-width="3"/>',
  cow: round(36, 72, 24, 13, '#E8C5B0') + round(164, 72, 24, 13, '#E8C5B0') + '<path d="M62 44q-8-26 8-30q2 18 10 24zM138 44q8-26-8-30q-2 18-10 24z" fill="#D9B16A"/>' + round(100, 95, 66, 62, '#fff') + round(68, 72, 22, 24, '#333') + round(140, 118, 18, 16, '#333') + round(100, 138, 48, 32, '#F6B8C6') + eyes(88) + round(84, 138, 6, 7, '#7d4957') + round(116, 138, 6, 7, '#7d4957'),
  duck: round(95, 138, 70, 46, '#FFD432') + round(112, 72, 44, 44, '#FFD432') + '<path d="M150 66 L190 78 L150 90Z" fill="#FF8A1F"/>' + eye(122, 62, 6) + '<path d="M50 130q40 34 76 0" fill="none" stroke="#E2B41C" stroke-width="6" stroke-linecap="round"/>',
  fish: '<path d="M40 100 L6 62 V138Z" fill="#E86A1F"/>' + round(108, 100, 76, 52, '#FF9A3C') + '<path d="M95 52q20-26 40-4z" fill="#E86A1F"/>' + '<path d="M84 72q18 28 0 56" fill="none" stroke="#fff" stroke-width="10"/><path d="M118 70q16 30 0 60" fill="none" stroke="#fff" stroke-width="10" opacity=".6"/>' + eye(152, 88, 8),
  horse: '<path d="M70 30 L82 6 L96 30zM130 30 L118 6 L104 30z" fill="#8A5A33"/><rect x="62" y="20" width="76" height="120" rx="38" fill="#A9713F"/><rect x="58" y="108" width="84" height="76" rx="36" fill="#D7B28D"/>' + eyes(76, 28) + round(84, 150, 6, 8, '#5b3a22') + round(116, 150, 6, 8, '#5b3a22') + '<path d="M100 14q-24 24-12 54q10-10 12-14q2 4 12 14q12-30-12-54z" fill="#3b2415"/>',
  pig: '<path d="M46 62 L40 22 L84 42zM154 62 L160 22 L116 42z" fill="#F295B2"/>' + round(100, 108, 72, 68, '#F9ADC4') + eyes(90) + round(100, 126, 32, 22, '#F295B2') + round(88, 126, 6, 9, '#a84f6c') + round(112, 126, 6, 9, '#a84f6c') + smile(156, 14),
  sheep: [[58, 66], [100, 48], [142, 66], [40, 108], [160, 108], [58, 150], [100, 164], [142, 150]].map(([x, y]) => round(x, y, 34, 34, '#F2EFE7')).join('') + round(32, 96, 20, 12, '#3b3b3b') + round(168, 96, 20, 12, '#3b3b3b') + round(100, 106, 50, 56, '#3b3b3b') + eye(80, 94, 6).replace('#2b2b2b', '#fff').replace('#fff"/>', '#222"/>') + eye(120, 94, 6).replace('#2b2b2b', '#fff').replace('#fff"/>', '#222"/>') + smile(132, 10, '#fff'),
  hen: '<path d="M78 34q6-26 18-10q6-20 18-2q14-12 12 16z" fill="#E23B3B"/>' + round(100, 80, 44, 46, '#fff') + round(92, 140, 66, 48, '#fff') + '<path d="M144 76 L178 88 L144 100Z" fill="#FF8A1F"/><path d="M136 102q12 26 2 30q-14-6-12-28z" fill="#E23B3B"/>' + eye(118, 72, 6) + '<path d="M52 128q30 34 58 0" fill="none" stroke="#ddd" stroke-width="7" stroke-linecap="round"/><path d="M80 186v12M110 186v12" stroke="#FF8A1F" stroke-width="7"/>',
  rabbit: '<rect x="56" y="4" width="34" height="96" rx="17" fill="#CFCFD6"/><rect x="110" y="4" width="34" height="96" rx="17" fill="#CFCFD6"/><rect x="66" y="18" width="14" height="66" rx="7" fill="#F6B8C6"/><rect x="120" y="18" width="14" height="66" rx="7" fill="#F6B8C6"/>' + round(100, 130, 62, 58, '#E4E4EA') + eyes(120, 26) + '<path d="M93 136h14l-7 8z" fill="#E86A8A"/><rect x="90" y="150" width="9" height="14" fill="#fff" stroke="#bbb"/><rect x="101" y="150" width="9" height="14" fill="#fff" stroke="#bbb"/>',
  bear: round(44, 50, 28, 28, '#7A4B28') + round(156, 50, 28, 28, '#7A4B28') + round(44, 50, 14, 14, '#C68A52') + round(156, 50, 14, 14, '#C68A52') + round(100, 105, 72, 72, '#8F5A30') + round(100, 132, 36, 28, '#D2A679') + eyes(90) + round(100, 120, 13, 9, '#2b2b2b') + smile(138, 12),
  elephant: round(30, 88, 30, 52, '#8D9DB0') + round(170, 88, 30, 52, '#8D9DB0') + round(30, 88, 16, 34, '#E8B9C4') + round(170, 88, 16, 34, '#E8B9C4') + round(100, 84, 58, 58, '#A5B4C6') + '<path d="M82 120 C80 170 90 192 118 190 L118 172 C104 172 118 150 118 120Z" fill="#A5B4C6"/>' + eyes(76, 28),
  giraffe: '<path d="M78 20v22M122 20v22" stroke="#C78A2E" stroke-width="9"/><circle cx="78" cy="16" r="9" fill="#8A5A33"/><circle cx="122" cy="16" r="9" fill="#8A5A33"/>' + round(46, 66, 22, 10, '#F4C24E') + round(154, 66, 22, 10, '#F4C24E') + '<rect x="58" y="34" width="84" height="130" rx="42" fill="#F4C24E"/>' + round(76, 58, 11, 9, '#B9772A') + round(130, 112, 11, 9, '#B9772A') + round(68, 116, 9, 8, '#B9772A') + round(132, 62, 8, 7, '#B9772A') + round(100, 150, 44, 32, '#F9DD9B') + eyes(90, 26) + round(86, 150, 5, 7, '#7c5a22') + round(114, 150, 5, 7, '#7c5a22') + smile(165, 12),
  lion: Array.from({ length: 14 }, (_, i) => { const a = (i / 14) * Math.PI * 2; return round(100 + 74 * Math.cos(a), 104 + 74 * Math.sin(a), 22, 22, '#B4631A'); }).join('') + round(100, 104, 78, 78, '#C8731F') + round(100, 106, 58, 58, '#F4C24E') + eyes(94, 24) + '<path d="M90 112h20l-10 11z" fill="#7a4310"/>' + smile(128, 14),
  monkey: round(30, 94, 24, 24, '#D7A77A') + round(170, 94, 24, 24, '#D7A77A') + round(100, 96, 68, 68, '#7A4B28') + round(80, 84, 26, 26, '#E9C6A0') + round(120, 84, 26, 26, '#E9C6A0') + round(100, 122, 46, 32, '#E9C6A0') + eyes(84, 20) + round(93, 112, 3, 4, '#5b3a22') + round(107, 112, 3, 4, '#5b3a22') + smile(126, 18),

  ball: round(100, 100, 82, 82, '#E23B3B') + '<path d="M100 18a82 82 0 0 1 0 164z" fill="#FFD432"/><path d="M26 66q74 34 148 0M26 134q74-34 148 0" fill="none" stroke="#fff" stroke-width="10"/>',
  car: '<path d="M46 102 L70 54 H130 L156 102Z" fill="#BFE3F5" stroke="#E23B3B" stroke-width="10"/><rect x="12" y="98" width="176" height="56" rx="20" fill="#E23B3B"/><circle cx="56" cy="156" r="24" fill="#333"/><circle cx="56" cy="156" r="10" fill="#ddd"/><circle cx="144" cy="156" r="24" fill="#333"/><circle cx="144" cy="156" r="10" fill="#ddd"/>',
  apple: '<path d="M100 58 C70 34 22 48 24 104 C26 150 62 192 84 186 Q100 180 116 186 C138 192 174 150 176 104 C178 48 130 34 100 58Z" fill="#E23B3B"/><path d="M100 58q-2-26 12-40" stroke="#6b4a1e" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M108 40q24-24 50-10q-22 26-50 10z" fill="#3DAA4E"/>',
  banana: '<path d="M38 28 C24 112 86 186 176 156 C184 150 180 138 170 138 C112 140 72 92 60 26 C56 16 40 16 38 28Z" fill="#FFD432" stroke="#D9AE12" stroke-width="5"/><rect x="38" y="12" width="20" height="22" rx="5" fill="#6b4a1e"/>',
  shoe: '<path d="M26 66 L92 66 Q104 116 170 122 Q190 128 188 158 H26Z" fill="#2F6FDE"/><rect x="20" y="152" width="172" height="20" rx="10" fill="#fff" stroke="#ccc" stroke-width="3"/><path d="M96 88l20-12M108 104l20-12M124 114l18-14" stroke="#fff" stroke-width="7" stroke-linecap="round"/>',
  flower: '<path d="M100 110V194" stroke="#3DAA4E" stroke-width="11"/><path d="M100 160q34-30 58-6q-30 28-58 6z" fill="#3DAA4E"/>' + [0, 1, 2, 3, 4, 5].map((i) => { const a = i * Math.PI / 3; return round(100 + 42 * Math.cos(a), 74 + 42 * Math.sin(a), 30, 30, '#FF8FC0'); }).join('') + round(100, 74, 26, 26, '#FFD432'),
  house: '<path d="M14 100 L100 22 L186 100Z" fill="#E23B3B"/><rect x="36" y="96" width="128" height="92" fill="#FFE6B8"/><rect x="86" y="130" width="36" height="58" fill="#8A5A33"/><rect x="48" y="112" width="26" height="26" fill="#9BD6F2"/><rect x="134" y="112" width="26" height="26" fill="#9BD6F2"/>',
  sun: Array.from({ length: 10 }, (_, i) => { const a = (i / 10) * 360; return `<rect x="93" y="2" width="14" height="36" rx="7" fill="#FFB52E" transform="rotate(${a} 100 100)"/>`; }).join('') + round(100, 100, 60, 60, '#FFD432') + eyes(90, 20) + smile(112, 18),
  moon: '<path d="M126 14 A88 88 0 1 0 186 134 A72 72 0 0 1 126 14Z" fill="#F8E27C"/>' + eye(70, 96, 6) + '<path d="M60 134q18 14 38 0" fill="none" stroke="#2b2b2b" stroke-width="5" stroke-linecap="round"/>',
  spoon: '<g transform="rotate(35 100 100)"><rect x="90" y="84" width="20" height="116" rx="10" fill="#AAB4BE"/><ellipse cx="100" cy="46" rx="38" ry="48" fill="#C3CCD4"/><ellipse cx="100" cy="46" rx="24" ry="33" fill="#9CA7B2"/></g>',

  circle: round(100, 100, 82, 82, '#2F6FDE'),
  square: '<rect x="24" y="24" width="152" height="152" rx="6" fill="#E23B3B"/>',
  triangle: '<path d="M100 18 L186 176 H14Z" fill="#3DAA4E"/>',
  star: '<path d="M100 10 L126 72 L192 78 L142 122 L158 188 L100 152 L42 188 L58 122 L8 78 L74 72Z" fill="#FFD432" stroke="#E2B41C" stroke-width="4"/>',
  heart: '<path d="M100 182 C30 130 8 92 18 58 C30 20 84 18 100 58 C116 18 170 20 182 58 C192 92 170 130 100 182Z" fill="#E23B3B"/>',

  gift: '<rect x="26" y="74" width="148" height="112" rx="10" fill="#FF8FC0"/><rect x="16" y="52" width="168" height="38" rx="8" fill="#F76AA8"/><rect x="86" y="52" width="28" height="134" fill="#FFD432"/><path d="M100 52C66 8 34 30 58 48q16 8 42 4zM100 52c34-44 66-22 42-4q-16 8-42 4z" fill="#FFD432"/>',
  stone: round(100, 136, 92, 62, '#9AA3AB') + round(70, 118, 40, 22, '#B4BCC3'),
  bed: '<rect x="10" y="80" width="14" height="108" rx="6" fill="#B07A43"/><rect x="176" y="50" width="14" height="138" rx="6" fill="#B07A43"/><rect x="16" y="120" width="170" height="44" rx="10" fill="#8FC8F2"/><rect x="26" y="100" width="56" height="30" rx="12" fill="#fff"/>',
  ear: '<path d="M60 92 C60 30 150 30 150 90 C150 130 112 124 112 158 C112 186 72 186 70 156" fill="none" stroke="#2F6FDE" stroke-width="18" stroke-linecap="round"/><path d="M94 96c0-28 32-28 32-2" fill="none" stroke="#2F6FDE" stroke-width="12" stroke-linecap="round"/>',
  play: round(100, 100, 92, 92, '#3DAA4E') + '<path d="M74 54 L146 100 L74 146Z" fill="#fff" stroke="#fff" stroke-width="10" stroke-linejoin="round"/>',
  check: round(100, 100, 92, 92, '#3DAA4E') + '<path d="M54 104 L88 138 L150 66" fill="none" stroke="#fff" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/>',
  tablet: '<g transform="rotate(90 100 100)"><rect x="50" y="20" width="100" height="160" rx="14" fill="#333"/><rect x="60" y="32" width="80" height="136" fill="#BFE3F5"/></g>',
};

const swatch = (id) => {
  const stroke = id === 'white' ? '#C9D1D8' : 'rgba(0,0,0,.12)';
  return svg(`<circle cx="100" cy="100" r="86" fill="${COLORS[id]}" stroke="${stroke}" stroke-width="6"/>`);
};

const ballAt = (r) => `<g transform="translate(100 100) scale(${r}) translate(-100 -100)">${ITEMS.ball}</g>`;

const stars = (n) => {
  const places = { 1: [[100, 100, 1]], 2: [[56, 100, 0.48], [144, 100, 0.48]], 3: [[100, 52, 0.46], [52, 146, 0.46], [148, 146, 0.46]] }[n];
  return places.map(([x, y, s]) => `<g transform="translate(${x} ${y}) scale(${s}) translate(-100 -100)">${ITEMS.star}</g>`).join('');
};

export function artSvg(key) {
  if (key.startsWith('color:')) return swatch(key.slice(6));
  if (key === 'size:big') return svg(ballAt(1));
  if (key === 'size:small') return svg(ballAt(0.4));
  if (key.startsWith('count:')) return svg(stars(Number(key.slice(6))));
  return svg(ITEMS[key]);
}

export const artKeys = () => Object.keys(ITEMS);

export const svgToDataUrl = (markup) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;

export function loadImage(markup) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = svgToDataUrl(markup);
  });
}

// --- Postavička: plátno 200 × 300, díly se skládají na sebe ---

const LEG = '#F2C7A5';

const FACES = [
  { skin: '#FFE0C4', mouth: `<path d="M84 122q16 14 32 0" fill="none" stroke="#7a3b2e" stroke-width="4" stroke-linecap="round"/>`, eye: eyes(100, 24, 7) },
  { skin: '#F7CFA8', mouth: `<path d="M80 118q20 26 40 0z" fill="#B3372E"/>`, eye: eyes(100, 24, 7) },
  { skin: '#E8B48A', mouth: `<circle cx="100" cy="124" r="8" fill="#B3372E"/>`, eye: eyes(100, 24, 9) },
  { skin: '#B57F55', mouth: `<path d="M84 122q16 14 32 0" fill="none" stroke="#4d2518" stroke-width="4" stroke-linecap="round"/>`, eye: `<path d="M66 102q10-12 20 0M114 102q10-12 20 0" fill="none" stroke="#2b2b2b" stroke-width="5" stroke-linecap="round"/>` },
  { skin: '#7D5235', mouth: `<path d="M80 118q20 26 40 0z" fill="#E9A49C"/>`, eye: eyes(100, 24, 7) },
];

const HAIR = [
  { back: round(100, 96, 72, 72, '#E7B93F'), front: '<path d="M36 96 C34 28 166 28 164 96 C140 60 60 60 36 96Z" fill="#E7B93F"/>' },
  { back: '', front: '<path d="M38 100 C30 26 170 26 162 100 C138 64 112 72 100 58 C86 74 60 64 38 100Z" fill="#6B3F1E"/><circle cx="30" cy="84" r="24" fill="#6B3F1E"/><circle cx="170" cy="84" r="24" fill="#6B3F1E"/>' },
  { back: '<rect x="30" y="60" width="140" height="130" rx="50" fill="#2B2320"/>', front: '<path d="M36 92 C34 24 166 24 164 92 C150 72 50 72 36 92Z" fill="#2B2320"/>' },
  { back: '', front: '<path d="M40 96 C36 30 164 30 160 96 C150 76 130 72 100 72 C70 72 50 76 40 96Z" fill="#C8562B"/><path d="M36 92 q-30 24 -12 72 q14 -8 22 -60zM164 92 q30 24 12 72 q-14 -8 -22 -60z" fill="#C8562B"/>' },
  { back: [[42, 76], [64, 40], [100, 28], [136, 40], [158, 76], [32, 112], [168, 112]].map(([x, y]) => round(x, y, 26, 26, '#4A3020')).join(''), front: '' },
  { back: '<rect x="32" y="50" width="136" height="104" rx="44" fill="#6B3F1E"/>', front: '<path d="M38 86 C38 26 162 26 162 86Z" fill="#6B3F1E"/>' },
  { back: '', front: '<path d="M38 96 C34 26 166 26 162 96 C140 62 60 62 38 96Z" fill="#E7B93F"/>' + round(44, 34, 22, 30, '#E7B93F') + round(156, 34, 22, 30, '#E7B93F') + round(60, 52, 9, 9, '#E23B3B') + round(140, 52, 9, 9, '#E23B3B') },
  { back: [150, 172, 194, 216].map((y) => round(158, y, 17, 14, '#8A5A33')).join(''), front: '<path d="M36 96 C34 26 166 26 164 96 C146 62 56 62 36 96Z" fill="#8A5A33"/>' + round(158, 130, 22, 26, '#8A5A33') },
  { back: '', front: round(100, 26, 30, 28, '#2B2320') + '<path d="M38 96 C34 28 166 28 162 96 C140 64 60 64 38 96Z" fill="#2B2320"/>' },
  { back: '<path d="M30 70 Q10 120 30 150 Q16 180 44 196 H156 Q184 180 170 150 Q190 120 170 70Z" fill="#F28BBE"/>', front: '<path d="M36 92 C34 24 166 24 164 92 C136 58 64 58 36 92Z" fill="#F28BBE"/>' },
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

const SHOES = ['#E23B3B', '#2F6FDE', '#FFD432', '#FF8FC0', '#FFFFFF'];

const HATS = [
  '',
  `<path d="M100 48 L66 26 Q58 48 66 66Z M100 48 L134 26 Q142 48 134 66Z" fill="#E23B3B"/><circle cx="100" cy="48" r="11" fill="#B9202A"/>`,
  `<ellipse cx="100" cy="46" rx="86" ry="15" fill="#E8C872"/><path d="M52 44 C52 2 148 2 148 44Z" fill="#F2D88C"/><rect x="52" y="34" width="96" height="11" fill="#E23B3B"/>`,
  `<path d="M56 54 L50 8 L78 30 L100 4 L122 30 L150 8 L144 54Z" fill="#FFD432" stroke="#E2B41C" stroke-width="4"/><circle cx="100" cy="42" r="6" fill="#E23B3B"/>`,
  `<path d="M48 52 C48 -6 152 -6 152 52Z" fill="#2F6FDE"/><rect x="42" y="44" width="116" height="16" rx="8" fill="#fff"/><circle cx="100" cy="6" r="13" fill="#fff"/>`,
];

const shoesPart = (i) => `<rect x="60" y="272" width="38" height="20" rx="10" fill="${SHOES[i]}" stroke="#555" stroke-width="2"/><rect x="102" y="272" width="38" height="20" rx="10" fill="${SHOES[i]}" stroke="#555" stroke-width="2"/>`;
const dressPart = (i) => DRESS[i].body ?? `<path d="M72 160 H128 L156 258 H44Z" fill="${DRESS[i].c}"/>${DRESS[i].extra}`;
const facePart = (i) => `${round(100, 104, 62, 62, FACES[i].skin)}${FACES[i].eye}${round(62, 118, 11, 8, '#F7A9A0')}${round(138, 118, 11, 8, '#F7A9A0')}${FACES[i].mouth}`;

export function characterSvg({ face, hair, dress, shoes, hat }) {
  const skin = FACES[face].skin;
  return figure(
    HAIR[hair].back
    + `<rect x="74" y="244" width="20" height="34" fill="${skin}"/><rect x="106" y="244" width="20" height="34" fill="${skin}"/>`
    + shoesPart(shoes)
    + `<path d="M70 174 L32 214" stroke="${skin}" stroke-width="17" stroke-linecap="round"/><path d="M130 174 L168 214" stroke="${skin}" stroke-width="17" stroke-linecap="round"/>`
    + dressPart(dress)
    + facePart(face)
    + HAIR[hair].front
    + HATS[hat],
  );
}

const DAD_HAIR = [
  { back: '', front: '<path d="M38 96 C34 26 166 26 162 96 C146 66 54 66 38 96Z" fill="#3B2A1E"/>' },
  { back: '', front: '<path d="M38 100 C30 30 170 26 162 92 C130 60 90 84 38 100Z" fill="#8A5A33"/>' },
  { back: '', front: '<path d="M38 104 Q34 74 48 66 M162 104 Q166 74 152 66" fill="none" stroke="#6B6B6B" stroke-width="16" stroke-linecap="round"/>' },
  { back: '', front: [[50, 66], [76, 44], [108, 40], [138, 48], [156, 72]].map(([x, y]) => round(x, y, 24, 24, '#2B2320')).join('') },
  { back: '', front: '<path d="M38 96 C34 26 166 26 162 96 C146 66 54 66 38 96Z" fill="#C8562B"/><path d="M38 104 C40 190 160 190 162 104 C150 132 130 112 100 112 C70 112 50 132 38 104Z" fill="#C8562B"/>' },
  { back: '', front: '<path d="M38 96 C34 26 166 26 162 96 C146 66 54 66 38 96Z" fill="#E7B93F"/>' },
  { back: '', front: '<path d="M38 96 C34 26 166 26 162 96 C146 66 54 66 38 96Z" fill="#6B3F1E"/><path d="M72 118 Q100 100 128 118 Q100 112 72 118Z" fill="#6B3F1E" stroke="#6B3F1E" stroke-width="6"/>' },
  { back: '<rect x="30" y="60" width="140" height="110" rx="46" fill="#2B2320"/>', front: '<path d="M36 92 C34 24 166 24 164 92 C150 72 50 72 36 92Z" fill="#2B2320"/>' },
  { back: '', front: '<path d="M38 96 C34 26 166 26 162 96 C146 66 54 66 38 96Z" fill="#9A9A9A"/><path d="M42 106 C46 180 154 180 158 106 C144 128 56 128 42 106Z" fill="#9A9A9A"/>' },
];

const shirtPart = (i) => `<rect x="62" y="126" width="76" height="92" rx="16" fill="${DRESS[i].c}"/><rect x="68" y="206" width="30" height="72" fill="#3F4A63"/><rect x="102" y="206" width="30" height="72" fill="#3F4A63"/>`;

const head = (body) => `<g transform="translate(25 -6) scale(.75)">${body}</g>`;

function adultSvg(kind, { face, hair, dress, shoes, hat }) {
  const skin = FACES[face].skin;
  const dad = kind === 'dad';
  const hairSet = dad ? DAD_HAIR : HAIR;
  return figure(
    head(hairSet[hair].back)
    + `<rect x="90" y="108" width="20" height="30" fill="${skin}"/>`
    + `<rect x="74" y="210" width="20" height="66" fill="${skin}"/><rect x="106" y="210" width="20" height="66" fill="${skin}"/>`
    + shoesPart(shoes)
    + `<path d="M72 142 L36 196" stroke="${skin}" stroke-width="16" stroke-linecap="round"/><path d="M128 142 L164 196" stroke="${skin}" stroke-width="16" stroke-linecap="round"/>`
    + (dad ? shirtPart(dress) : `<g transform="translate(20 -30) scale(.8 .98)">${dressPart(dress)}</g>`)
    + head(facePart(face) + hairSet[hair].front + HATS[hat]),
  );
}

export const characterFor = (kind, choice) => (kind === 'child' ? characterSvg(choice) : adultSvg(kind, choice));

const figure = (body) => `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="320" viewBox="0 -20 200 320">${body}</svg>`;

const crop = (body, box) =>`<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="${box}">${body}</svg>`;

// Náhled jednoho dílu pro tvorbu postavičky.
export function partSvg(category, i, kind = 'child') {
  const dad = kind === 'dad';
  if (category === 'face') return crop(facePart(i), '30 34 140 140');
  if (category === 'hair') {
    const h = (dad ? DAD_HAIR : HAIR)[i];
    return crop(h.back + round(100, 104, 62, 62, '#F7CFA8') + h.front, '0 0 200 220');
  }
  if (category === 'dress') return dad ? crop(shirtPart(i), '30 120 140 165') : crop(dressPart(i), '20 150 160 120');
  if (category === 'shoes') return crop(shoesPart(i), '50 232 100 70');
  if (i === 0) return crop(`<circle cx="100" cy="50" r="40" fill="none" stroke="#C9D1D8" stroke-width="9"/><path d="M72 22 L128 78" stroke="#C9D1D8" stroke-width="9"/>`, '30 -20 140 140');
  return crop(HATS[i], '10 -24 180 110');
}

export function optionCount(category, kind) {
  if (category === 'hair') return (kind === 'dad' ? DAD_HAIR : HAIR).length;
  if (category === 'dress') return DRESS.length;
  return 5;
}

export const CATEGORIES = ['face', 'hair', 'dress', 'shoes', 'hat'];
export const DEFAULT_CHARACTERS = {
  child: { face: 0, hair: 0, dress: 0, shoes: 0, hat: 1 },
  mom: { face: 0, hair: 2, dress: 4, shoes: 0, hat: 0 },
  dad: { face: 1, hair: 0, dress: 2, shoes: 1, hat: 0 },
};

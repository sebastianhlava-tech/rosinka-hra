// Veškerá grafika je SVG v kódu. Každý obrázek má plátno 200 × 200.

const svg = (body, w = 200, h = 200) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`;

export const eye = (x, y, r = 6) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#2b2b2b"/><circle cx="${x + 2}" cy="${y - 2}" r="${r / 3}" fill="#fff"/>`;
export const eyes = (y = 85, gap = 28, r = 6) => eye(100 - gap, y, r) + eye(100 + gap, y, r);
const smile = (y = 120, w = 22, c = '#2b2b2b') => `<path d="M${100 - w} ${y} q${w} ${w * 0.8} ${w * 2} 0" fill="none" stroke="${c}" stroke-width="5" stroke-linecap="round"/>`;
export const round = (cx, cy, rx, ry, fill) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}"/>`;

export const COLORS = {
  red: '#E23B3B', blue: '#2F6FDE', yellow: '#FFD432', green: '#3DAA4E', orange: '#FF8A1F',
  pink: '#FF8FC0', purple: '#8E4EC6', brown: '#8A5A33', black: '#222222', white: '#FFFFFF',
};

const ITEMS = {
  // Pejsek: světlá hlava, dlouhé visící uši, flek u oka a vyplazený jazyk, aby nevypadal jako medvěd.
  dog: '<ellipse cx="40" cy="118" rx="22" ry="54" fill="#7A4B28" transform="rotate(14 40 118)"/><ellipse cx="160" cy="118" rx="22" ry="54" fill="#7A4B28" transform="rotate(-14 160 118)"/>' + round(100, 98, 62, 60, '#F2DDB8') + round(128, 82, 22, 20, '#C68A52') + round(100, 132, 36, 26, '#FFFFFF') + '<ellipse cx="100" cy="164" rx="12" ry="16" fill="#F28BA8"/><path d="M100 152v18" stroke="#D9637F" stroke-width="3"/>' + eyes(88, 26) + round(100, 118, 15, 11, '#2b2b2b') + '<path d="M80 140 q20 14 40 0" fill="none" stroke="#2b2b2b" stroke-width="4" stroke-linecap="round"/>',
  cat: '<path d="M42 96 L48 28 L95 60Z M158 96 L152 28 L105 60Z" fill="#F0A23C"/>' + round(100, 108, 66, 62, '#F0A23C') + eyes(98) + '<path d="M92 118h16l-8 9z" fill="#E86A8A"/>' + smile(130, 12) + '<path d="M30 108h30M30 124h30M170 108h-30M170 124h-30" stroke="#6b4a1e" stroke-width="3"/>',
  cow: round(36, 72, 24, 13, '#E8C5B0') + round(164, 72, 24, 13, '#E8C5B0') + '<path d="M62 44q-8-26 8-30q2 18 10 24zM138 44q8-26-8-30q-2 18-10 24z" fill="#D9B16A"/>' + round(100, 95, 66, 62, '#fff') + round(68, 72, 22, 24, '#333') + round(140, 118, 18, 16, '#333') + round(100, 138, 48, 32, '#F6B8C6') + eyes(88) + round(84, 138, 6, 7, '#7d4957') + round(116, 138, 6, 7, '#7d4957'),
  duck: round(95, 138, 70, 46, '#FFD432') + round(112, 72, 44, 44, '#FFD432') + '<path d="M150 66 L190 78 L150 90Z" fill="#FF8A1F"/>' + eye(122, 62, 6) + '<path d="M50 130q40 34 76 0" fill="none" stroke="#E2B41C" stroke-width="6" stroke-linecap="round"/>',
  fish: '<path d="M40 100 L6 62 V138Z" fill="#E86A1F"/>' + round(108, 100, 76, 52, '#FF9A3C') + '<path d="M95 52q20-26 40-4z" fill="#E86A1F"/>' + '<path d="M84 72q18 28 0 56" fill="none" stroke="#fff" stroke-width="10"/><path d="M118 70q16 30 0 60" fill="none" stroke="#fff" stroke-width="10" opacity=".6"/>' + eye(152, 88, 8),
  horse: '<path d="M44 198 C40 140 50 96 78 62 C96 40 124 34 146 46 L182 92 C194 110 188 134 166 138 C150 140 136 132 124 122 C112 142 110 170 118 198Z" fill="#A9713F"/><path d="M96 52 L102 14 L122 44Z" fill="#8A5A33"/><path d="M101 26 L104 44 L114 42Z" fill="#E8B9A0"/>' + round(166, 118, 24, 21, '#D7B28D') + round(174, 112, 4, 6, '#5b3a22') + '<path d="M92 46 C68 54 52 82 46 122 C42 152 40 178 42 198 L26 198 C20 160 26 100 48 68 C62 50 78 42 92 46Z M106 44 q-12 14 2 28 q8 -16 -2 -28z" fill="#3b2415"/>' + eye(126, 76, 7) + '<path d="M150 134 q12 7 24 0" fill="none" stroke="#5b3a22" stroke-width="4" stroke-linecap="round"/>',
  pig: '<path d="M46 62 L40 22 L84 42zM154 62 L160 22 L116 42z" fill="#F295B2"/>' + round(100, 108, 72, 68, '#F9ADC4') + eyes(90) + round(100, 126, 32, 22, '#F295B2') + round(88, 126, 6, 9, '#a84f6c') + round(112, 126, 6, 9, '#a84f6c') + smile(156, 14),
  sheep: [[58, 66], [100, 48], [142, 66], [40, 108], [160, 108], [58, 150], [100, 164], [142, 150]].map(([x, y]) => round(x, y, 34, 34, '#F2EFE7')).join('') + round(32, 96, 20, 12, '#3b3b3b') + round(168, 96, 20, 12, '#3b3b3b') + round(100, 106, 50, 56, '#3b3b3b') + eye(80, 94, 6).replace('#2b2b2b', '#fff').replace('#fff"/>', '#222"/>') + eye(120, 94, 6).replace('#2b2b2b', '#fff').replace('#fff"/>', '#222"/>') + smile(132, 10, '#fff'),
  hen: '<path d="M70 46q-4-34 18-24q4-28 24-10q20-14 22 14q16 4 4 26z" fill="#E23B3B"/><ellipse cx="92" cy="140" rx="66" ry="48" fill="#fff" stroke="#C9CFD6" stroke-width="5"/><ellipse cx="100" cy="80" rx="44" ry="46" fill="#fff" stroke="#C9CFD6" stroke-width="5"/>' + '<path d="M144 76 L178 88 L144 100Z" fill="#FF8A1F"/><path d="M136 102q12 26 2 30q-14-6-12-28z" fill="#E23B3B"/>' + eye(118, 72, 6) + '<path d="M52 128q30 34 58 0" fill="none" stroke="#ddd" stroke-width="7" stroke-linecap="round"/><path d="M80 186v12M110 186v12" stroke="#FF8A1F" stroke-width="7"/>',
  rabbit: '<rect x="56" y="4" width="34" height="96" rx="17" fill="#B9A28E"/><rect x="110" y="4" width="34" height="96" rx="17" fill="#B9A28E"/><rect x="66" y="18" width="14" height="66" rx="7" fill="#F6B8C6"/><rect x="120" y="18" width="14" height="66" rx="7" fill="#F6B8C6"/>' + round(100, 130, 62, 58, '#CDB8A4') + eyes(120, 26) + '<path d="M93 136h14l-7 8z" fill="#E86A8A"/><rect x="90" y="150" width="9" height="14" fill="#fff" stroke="#bbb"/><rect x="101" y="150" width="9" height="14" fill="#fff" stroke="#bbb"/>',
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
  bush: round(60, 130, 52, 50, '#4FA85A') + round(140, 130, 52, 50, '#4FA85A') + round(100, 96, 60, 58, '#5FBB6A') + round(70, 96, 8, 8, '#E23B3B') + round(128, 120, 8, 8, '#E23B3B') + round(100, 146, 8, 8, '#E23B3B'),
  hedgehog: '<path d="M26 164 L40 96 L58 112 L72 74 L92 104 L116 68 L130 104 L156 96 L150 164Z" fill="#6B4A2E"/><path d="M122 168 Q180 168 190 146 Q160 112 118 128Z" fill="#E8C49A"/><circle cx="188" cy="146" r="8" fill="#2b2b2b"/><circle cx="150" cy="136" r="5" fill="#2b2b2b"/>',
  log: '<rect x="14" y="88" width="160" height="88" rx="30" fill="#8A5A33"/><ellipse cx="168" cy="132" rx="26" ry="44" fill="#D7B28D"/><ellipse cx="168" cy="132" rx="14" ry="26" fill="none" stroke="#A9713F" stroke-width="5"/><path d="M40 112h70M60 148h76" stroke="#6B4324" stroke-width="6" stroke-linecap="round"/>',
  mushroom: '<rect x="76" y="100" width="48" height="86" rx="18" fill="#FFF1DE"/><path d="M14 112 C14 10 186 10 186 112Z" fill="#E23B3B"/>' + round(64, 74, 15, 13, '#fff') + round(118, 56, 18, 15, '#fff') + round(150, 92, 12, 10, '#fff'),
  stump: '<path d="M38 72 L26 182 H174 L162 72Z" fill="#8A5A33"/><ellipse cx="100" cy="72" rx="62" ry="24" fill="#D7B28D"/><ellipse cx="100" cy="72" rx="34" ry="12" fill="none" stroke="#A9713F" stroke-width="5"/><path d="M60 112v50M100 118v56M140 110v48" stroke="#6B4324" stroke-width="6" stroke-linecap="round"/>',
  crab: '<path d="M38 118 L16 74 M162 118 L184 74" stroke="#D63A2C" stroke-width="12" stroke-linecap="round"/>' + round(16, 62, 17, 15, '#E8503F') + round(184, 62, 17, 15, '#E8503F') + '<path d="M44 158 L20 186 M62 170 L48 190 M156 158 L180 186 M138 170 L152 190" stroke="#D63A2C" stroke-width="9" stroke-linecap="round"/>' + round(100, 132, 70, 46, '#E8503F') + '<path d="M84 98V76M116 98V76" stroke="#D63A2C" stroke-width="7"/>' + eye(84, 72, 9) + eye(116, 72, 9) + '<path d="M78 142q22 16 44 0" fill="none" stroke="#7a1f16" stroke-width="5" stroke-linecap="round"/>',
  sandcastle: '<rect x="26" y="96" width="148" height="88" fill="#E8C87C"/><rect x="62" y="50" width="76" height="60" fill="#F0D592"/><path d="M26 96h20v-16h20v16h20v-16h28v16h20v-16h20v16h20zM62 50h16V36h14v14h16V36h14v14h16z" fill="#F0D592"/><rect x="86" y="140" width="28" height="44" rx="14" fill="#B58F4C"/><path d="M100 36V10l26 10-26 10" fill="#E23B3B" stroke="#6b4a1e" stroke-width="3"/>',
  shell: '<path d="M100 176 L22 96 C40 26 160 26 178 96Z" fill="#FFB7A8"/><path d="M100 176 L60 52M100 176 L100 42M100 176 L140 52M100 176 L34 76M100 176 L166 76" stroke="#E98A78" stroke-width="7"/>',
  snowman: round(100, 142, 56, 50, '#FFFFFF') + round(100, 66, 38, 36, '#FFFFFF') + '<ellipse cx="100" cy="142" rx="56" ry="50" fill="none" stroke="#C9DCEB" stroke-width="3"/><ellipse cx="100" cy="66" rx="38" ry="36" fill="none" stroke="#C9DCEB" stroke-width="3"/>' + eye(86, 58, 5) + eye(114, 58, 5) + '<path d="M98 66 L132 72 L98 78Z" fill="#FF8A1F"/><path d="M62 94 Q100 112 138 94" stroke="#E23B3B" stroke-width="12" fill="none" stroke-linecap="round"/>' + round(100, 130, 5, 5, '#333') + round(100, 152, 5, 5, '#333'),
  snowballs: [[62, 146, 44, 40], [138, 146, 44, 40], [100, 86, 40, 36]].map(([x, y, rx, ry]) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#fff" stroke="#C9DCEB" stroke-width="4"/>`).join('') + round(88, 76, 12, 9, '#EAF4FB'),
  gift2: '<rect x="30" y="74" width="140" height="110" rx="8" fill="#2F6FDE"/><rect x="88" y="74" width="24" height="110" fill="#fff"/><rect x="22" y="56" width="156" height="30" rx="6" fill="#4C86EA"/><rect x="88" y="56" width="24" height="30" fill="#fff"/>',
  cone: '<path d="M100 14 L150 164 H50Z" fill="#FF8A1F"/><path d="M80 74h40l10 32H70z" fill="#fff"/><rect x="24" y="160" width="152" height="24" rx="8" fill="#E2701A"/>',
  crate: '<rect x="28" y="40" width="144" height="144" rx="6" fill="#C99A5B"/><path d="M28 40h144v22H28zM28 162h144v22H28zM36 56 L164 168M164 56 L36 168" stroke="#8A5A33" stroke-width="12" fill="none"/>',
  hydrant: '<rect x="62" y="56" width="76" height="126" rx="10" fill="#E23B3B"/><path d="M58 60 Q100 8 142 60Z" fill="#E23B3B"/><rect x="88" y="10" width="24" height="18" rx="5" fill="#B9202A"/><rect x="34" y="92" width="132" height="34" rx="12" fill="#B9202A"/><rect x="50" y="172" width="100" height="14" rx="5" fill="#8E1A22"/>',
  bird: '<path d="M46 96 Q88 26 118 92Z" fill="#6FA8F2"/>' + round(100, 110, 62, 44, '#2F6FDE') + '<path d="M156 102 L196 112 L156 124Z" fill="#FF8A1F"/><path d="M42 106 L6 86 L14 124Z" fill="#2F6FDE"/>' + eye(134, 98, 7) + '<path d="M70 106 Q92 150 122 108Z" fill="#6FA8F2"/>',
  tree: '<rect x="86" y="120" width="28" height="80" fill="#8A5A33"/>' + round(100, 76, 72, 70, '#6DC06F') + round(58, 106, 42, 38, '#5FB565') + round(144, 106, 42, 38, '#5FB565'),
  pine: '<rect x="90" y="160" width="20" height="40" fill="#6B4324"/><path d="M100 4 L150 80 H124 L166 134 H134 L180 176 H20 L66 134 H34 L76 80 H50Z" fill="#3F8C5C"/>',
  snowpine: '<rect x="90" y="160" width="20" height="40" fill="#6B4324"/><path d="M100 4 L150 80 H124 L166 134 H134 L180 176 H20 L66 134 H34 L76 80 H50Z" fill="#6AA88A"/><path d="M100 4 L132 52 L114 44 L100 58 L86 44 L68 52ZM76 96 L100 86 L124 96 L150 124 L100 110 L50 124Z" fill="#fff"/>',
  palm: '<path d="M92 200 Q84 120 108 66 L120 70 Q100 130 112 200Z" fill="#A9713F"/><path d="M112 66 Q60 26 16 62 Q64 50 112 66ZM112 66 Q72 84 52 132 Q88 92 112 66ZM112 66 Q160 22 192 58 Q152 46 112 66ZM112 66 Q156 84 172 130 Q140 92 112 66Z" fill="#3DAA4E"/>' + round(104, 74, 9, 9, '#6B4324') + round(120, 76, 9, 9, '#6B4324'),
  building: '<rect x="30" y="20" width="140" height="180" fill="#A7A0C4"/>' + [40, 76, 112, 148].flatMap((y) => [48, 88, 128].map((x) => `<rect x="${x}" y="${y}" width="24" height="24" fill="#FFE9A8"/>`)).join(''),
  ear: '<path d="M60 92 C60 30 150 30 150 90 C150 130 112 124 112 158 C112 186 72 186 70 156" fill="none" stroke="#2F6FDE" stroke-width="18" stroke-linecap="round"/><path d="M94 96c0-28 32-28 32-2" fill="none" stroke="#2F6FDE" stroke-width="12" stroke-linecap="round"/>',
  play: round(100, 100, 92, 92, '#3DAA4E') + '<path d="M74 54 L146 100 L74 146Z" fill="#fff" stroke="#fff" stroke-width="10" stroke-linejoin="round"/>',
  dice: '<rect x="24" y="24" width="152" height="152" rx="34" fill="#FF8A1F"/>' + [[62, 62], [138, 62], [100, 100], [62, 138], [138, 138]].map(([x, y]) => round(x, y, 14, 14, '#fff')).join(''),
  check: round(100, 100, 92, 92, '#3DAA4E') + '<path d="M54 104 L88 138 L150 66" fill="none" stroke="#fff" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/>',
  balloon: '<path d="M100 144 q-18 26 6 54" fill="none" stroke="#888" stroke-width="4"/>' + round(100, 76, 56, 66, '#E23B3B') + '<path d="M92 140 h16 l-8 12z" fill="#B9202A"/>' + round(78, 50, 12, 20, 'rgba(255,255,255,.45)'),
  lollipop: '<rect x="94" y="96" width="12" height="100" rx="6" fill="#F2EFE7"/>' + round(100, 72, 62, 62, '#FF8FC0') + '<path d="M100 72 m-44 0 a44 44 0 0 1 88 0 a32 32 0 0 1 -64 0 a20 20 0 0 1 40 0 a8 8 0 0 1 -16 0" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round"/>',
  teddy: round(56, 46, 24, 24, '#B07A43') + round(144, 46, 24, 24, '#B07A43') + round(100, 150, 62, 50, '#C68A52') + round(100, 156, 34, 28, '#E9C6A0') + round(100, 76, 54, 50, '#C68A52') + round(100, 94, 24, 18, '#E9C6A0') + eyes(70, 22, 6) + round(100, 88, 8, 6, '#2b2b2b') + '<path d="M100 94 v8 M90 104 q10 6 20 0" fill="none" stroke="#2b2b2b" stroke-width="4" stroke-linecap="round"/>',
  pinecone: [[100, 46], [80, 72], [120, 72], [72, 102], [100, 100], [128, 102], [80, 132], [120, 132], [100, 158]].map(([x, y]) => round(x, y, 24, 18, '#9A6A3A') + round(x, y + 5, 16, 9, '#7A4B28')).join('') + '<path d="M100 18 v18" stroke="#6B4324" stroke-width="8" stroke-linecap="round"/>',
  cocoa: '<path d="M80 40 q-12 -14 0 -26 M104 40 q-12 -14 0 -26 M128 40 q-12 -14 0 -26" fill="none" stroke="#C9D1D8" stroke-width="6" stroke-linecap="round"/><path d="M146 86 q40 0 34 34 q-6 30 -38 26" fill="none" stroke="#2F6FDE" stroke-width="14"/><path d="M44 56 H156 L146 176 Q100 190 54 176Z" fill="#2F6FDE"/>' + round(100, 58, 56, 12, '#8A5A33') + round(80, 116, 10, 10, '#fff') + round(116, 136, 10, 10, '#fff') + round(124, 100, 8, 8, '#fff'),
  sled: '<path d="M20 150 H170 q24 0 22 -26" fill="none" stroke="#E23B3B" stroke-width="10" stroke-linecap="round"/><path d="M50 150 V124 M146 150 V124" stroke="#E23B3B" stroke-width="10"/><rect x="30" y="98" width="140" height="28" rx="8" fill="#B07A43"/><path d="M64 98v28M100 98v28M136 98v28" stroke="#8A5A33" stroke-width="5"/>',
  lantern: '<path d="M70 44 q30 -40 60 0" fill="none" stroke="#555" stroke-width="8"/><rect x="62" y="40" width="76" height="20" rx="6" fill="#555"/><rect x="66" y="58" width="68" height="104" rx="10" fill="#FFE58A"/>' + round(100, 110, 22, 30, '#FFB52E') + '<path d="M66 84 H134 M66 136 H134" stroke="#555" stroke-width="6"/><rect x="58" y="160" width="84" height="18" rx="6" fill="#555"/>',
  stall: '<rect x="26" y="70" width="12" height="120" fill="#B07A43"/><rect x="162" y="70" width="12" height="120" fill="#B07A43"/>' + [0, 1, 2, 3, 4].map((i) => `<path d="M${10 + i * 36} 34 h36 v34 q-18 18 -36 0z" fill="${i % 2 ? '#fff' : '#E23B3B'}"/>`).join('') + '<rect x="6" y="20" width="188" height="18" rx="6" fill="#B9202A"/><rect x="14" y="126" width="172" height="66" rx="8" fill="#C99A5B"/><rect x="14" y="126" width="172" height="14" rx="6" fill="#E0B878"/>',
  book: '<path d="M100 46 Q60 24 14 36 V170 Q60 158 100 180Z" fill="#FF8FC0"/><path d="M100 46 Q140 24 186 36 V170 Q140 158 100 180Z" fill="#8FC8F2"/><path d="M100 46 V180" stroke="#fff" stroke-width="5"/>' + round(56, 100, 18, 18, '#FFD432') + round(144, 100, 18, 18, '#3DAA4E'),
  petbow: '<path d="M100 100 L26 50 L26 150Z M100 100 L174 50 L174 150Z" fill="#FF8FC0"/>' + round(100, 100, 22, 22, '#F76AA8'),
  petcrown: '<path d="M30 150 L40 60 L72 104 L100 40 L128 104 L160 60 L170 150Z" fill="#FFD432" stroke="#E2B41C" stroke-width="6" stroke-linejoin="round"/>' + round(100, 122, 12, 12, '#E23B3B') + round(60, 128, 8, 8, '#2F6FDE') + round(140, 128, 8, 8, '#3DAA4E'),
  pethat: '<rect x="20" y="146" width="160" height="26" rx="13" fill="#222"/><rect x="50" y="40" width="100" height="116" rx="10" fill="#222"/><rect x="50" y="120" width="100" height="20" fill="#E23B3B"/>',
  basket: '<path d="M40 70 Q100 -10 160 70" fill="none" stroke="#8A5A33" stroke-width="12"/><path d="M20 80 H180 L158 180 H42Z" fill="#C99A5B"/><path d="M30 110 H170 M36 140 H164 M70 80 L76 180 M100 80 V180 M130 80 L124 180" stroke="#8A5A33" stroke-width="6"/>' + round(76, 76, 22, 20, '#E23B3B') + round(122, 74, 22, 20, '#E23B3B'),
  arrow: round(100, 100, 92, 92, '#EDF0F4') + '<path d="M50 100 H146 M110 62 L148 100 L110 138" fill="none" stroke="#667" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/>',
  tablet: '<g transform="rotate(90 100 100)"><rect x="50" y="20" width="100" height="160" rx="14" fill="#333"/><rect x="60" y="32" width="80" height="136" fill="#BFE3F5"/></g>',
};

const swatch = (id) => {
  const stroke = id === 'white' ? '#C9D1D8' : 'rgba(0,0,0,.12)';
  return svg(`<circle cx="100" cy="100" r="86" fill="${COLORS[id]}" stroke="${stroke}" stroke-width="6"/>`);
};

const ballAt = (r) => `<g transform="translate(100 100) scale(${r}) translate(-100 -100)">${ITEMS.ball}</g>`;

const stars = (n) => {
  // Všechny hvězdy jsou stejně velké, aby dítě vybíralo podle počtu, ne podle velikosti.
  const places = { 1: [[100, 100]], 2: [[54, 100], [146, 100]], 3: [[100, 52], [52, 146], [148, 146]] }[n];
  return places.map(([x, y]) => `<g transform="translate(${x} ${y}) scale(0.46) translate(-100 -100)">${ITEMS.star}</g>`).join('');
};

// Tvar má barvu podle otázky, aby si dítě nespojilo tvar s jednou barvou.
const SHAPE_FILLS = ['#E23B3B', '#2F6FDE', '#FFD432', '#3DAA4E', '#FF8A1F', '#8E4EC6'];
const recolor = (body, color) => body.replace(/fill="#[0-9A-Fa-f]{6}"/, `fill="${color}"`).replace(/ stroke="#E2B41C"/, ' stroke="rgba(0,0,0,.15)"');

export const shapeTint = (rng = Math.random) => SHAPE_FILLS[Math.floor(rng() * SHAPE_FILLS.length)];

// Zmrzlina: počet kopečků = cena, aby dítě vidělo, co počítá.
const SCOOPS = ['#FF8FC0', '#9BE3C4', '#FFE58A'];
const icecream = (n) => '<path d="M66 112 L100 194 L134 112Z" fill="#E8B46A"/><path d="M76 124 L118 168 M124 124 L84 168" stroke="#C9904A" stroke-width="4"/>'
  + SCOOPS.slice(0, n).map((c, i) => round(100, 102 - i * 32, 40, 34, c)).join('');

export function artSvg(key, tint) {
  if (key.startsWith('icecream')) return svg(icecream(Number(key.slice(8))));
  if (key.startsWith('color:')) return swatch(key.slice(6));
  if (key.startsWith('shape:')) return svg(recolor(ITEMS[key.slice(6)], tint ?? '#2F6FDE'));
  if (key.startsWith('car:')) return svg(ITEMS.car.replaceAll('#E23B3B', COLORS[key.slice(4)]));
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

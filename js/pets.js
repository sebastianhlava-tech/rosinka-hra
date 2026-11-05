// Kamarádi (mazlíčci): druh, barva srsti, oči a doplňky. Plátno 200 × 200.
// Některé doplňky se odemknou nákupem v krámku (state.petItems).
import { eye, eyes, round } from './art.js';

const line = (d, c, w = 5) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const flowerAt = (x, y, r, fill) => [0, 1, 2, 3, 4]
  .map((i) => { const a = (i * Math.PI * 2) / 5 - Math.PI / 2; return round(x + r * Math.cos(a), y + r * Math.sin(a), r * 0.75, r * 0.75, fill); })
  .join('') + round(x, y, r * 0.6, r * 0.6, '#FFD432');

// Každý druh: výchozí barva, bříško, co je za hlavou (uši) a co je na obličeji (čumák).
const SPECIES = [
  { id: 'dog', cs: 'pejsek', c: '#C68A52', belly: '#EFD3B0',
    back: (c) => round(52, 96, 17, 32, '#7A4B28') + round(148, 96, 17, 32, '#7A4B28'),
    face: () => round(100, 104, 20, 14, '#EFD3B0') + round(100, 98, 9, 7, '#2b2b2b') },
  { id: 'cat', cs: 'kočička', c: '#F0A23C', belly: '#FFE6C2',
    back: (c) => `<path d="M56 74 L60 28 L94 54Z M144 74 L140 28 L106 54Z" fill="${c}"/><path d="M64 60 L66 40 L82 54Z M136 60 L134 40 L118 54Z" fill="#F6B8C6"/>`,
    face: () => '<path d="M93 100h14l-7 8z" fill="#E86A8A"/>' + line('M48 102h26M48 112h26M152 102h-26M152 112h-26', '#6b4a1e', 3) },
  { id: 'rabbit', cs: 'zajíček', c: '#CDB8A4', belly: '#F2E8DC',
    back: (c) => `<rect x="62" y="0" width="28" height="80" rx="14" fill="${c}"/><rect x="110" y="0" width="28" height="80" rx="14" fill="${c}"/><rect x="70" y="12" width="12" height="56" rx="6" fill="#F6B8C6"/><rect x="118" y="12" width="12" height="56" rx="6" fill="#F6B8C6"/>`,
    face: () => '<path d="M94 100h12l-6 7z" fill="#E86A8A"/><rect x="92" y="110" width="7" height="10" fill="#fff" stroke="#bbb"/><rect x="101" y="110" width="7" height="10" fill="#fff" stroke="#bbb"/>' },
  { id: 'duck', cs: 'kachnička', c: '#FFD432', belly: '#FFF0A8',
    back: () => '',
    face: () => round(100, 106, 22, 11, '#FF8A1F') },
  { id: 'unicorn', cs: 'jednorožec', c: '#FFFFFF', belly: '#FFF3FA',
    back: (c) => `<path d="M62 70 L62 36 L86 56Z M138 70 L138 36 L114 56Z" fill="${c}" stroke="#E6D9E6" stroke-width="3"/>` + ['#FF8FC0', '#8E4EC6', '#2FB6B0'].map((m, i) => round(64 - i * 6, 82 + i * 22, 16, 18, m)).join(''),
    face: () => '<path d="M92 50 L100 6 L108 50Z" fill="#FFD432" stroke="#E2B41C" stroke-width="3"/>' + round(90, 106, 4, 3, '#C9A7C9') + round(110, 106, 4, 3, '#C9A7C9') },
  { id: 'dragon', cs: 'dráček', c: '#3DAA4E', belly: '#FFE58A',
    back: (c) => '<path d="M66 54 L58 24 L80 46Z M134 54 L142 24 L120 46Z" fill="#FFD432"/>' + [60, 84, 108].map((y) => `<path d="M150 ${y + 60} l24 6 l-20 14z" fill="${c}"/>`).join(''),
    face: () => round(92, 104, 3, 3, '#2b2b2b') + round(108, 104, 3, 3, '#2b2b2b') },
  { id: 'penguin', cs: 'tučňák', c: '#2B3A55', belly: '#FFFFFF',
    back: () => '',
    face: () => '<ellipse cx="100" cy="94" rx="36" ry="30" fill="#fff"/><path d="M90 102h20l-10 10z" fill="#FF8A1F"/>' },
  { id: 'fox', cs: 'liška', c: '#FF8A1F', belly: '#FFFFFF',
    back: (c) => `<path d="M54 76 L54 26 L92 56Z M146 76 L146 26 L108 56Z" fill="${c}"/><path d="M62 62 L62 40 L80 54Z M138 62 L138 40 L120 54Z" fill="#3b2415"/>`,
    face: () => '<path d="M62 96 Q100 140 138 96 Q100 108 62 96Z" fill="#fff"/>' + round(100, 108, 8, 6, '#2b2b2b') },
];

const EYES = [
  () => eyes(84, 22, 7),
  () => eye(78, 84, 11) + eye(122, 84, 11),
  () => line('M68 86q10-12 20 0M112 86q10-12 20 0', '#2b2b2b', 5),
];

const NECK = [
  { m: '' },
  { m: '<path d="M62 128 Q100 146 138 128 L138 140 Q100 158 62 140Z" fill="#E23B3B"/>' + round(100, 150, 7, 7, '#FFD432') },
  { m: '<path d="M100 138 L66 120 L66 156Z M100 138 L134 120 L134 156Z" fill="#FF8FC0"/>' + round(100, 138, 10, 10, '#F76AA8'), shop: 'petbow' },
  { m: '<path d="M62 128 Q100 146 138 128 L138 138 Q100 156 62 138Z" fill="#2F6FDE"/>' + round(100, 152, 12, 12, '#FFD432') + round(100, 158, 4, 3, '#8a6a12') },
  { m: '<path d="M60 126 Q100 148 140 126 L140 142 Q100 162 60 142Z" fill="#3DAA4E"/><path d="M118 144 l10 34 l14 -6 l-8 -32z" fill="#3DAA4E"/>' },
];

const HEAD = [
  { m: '' },
  { m: [56, 78, 100, 122, 144].map((x, i) => flowerAt(x, 46 - (i % 2) * 6, 9, ['#FF8FC0', '#FFFFFF', '#FF8A1F'][i % 3])).join('') },
  { m: '<rect x="62" y="40" width="76" height="12" rx="6" fill="#222"/><rect x="74" y="8" width="52" height="38" rx="6" fill="#222"/><rect x="74" y="34" width="52" height="8" fill="#E23B3B"/>', shop: 'pethat' },
  { m: '<path d="M64 48 L70 14 L86 34 L100 8 L114 34 L130 14 L136 48Z" fill="#FFD432" stroke="#E2B41C" stroke-width="3"/>' + round(100, 32, 5, 5, '#E23B3B'), shop: 'petcrown' },
  { m: '<path d="M58 54 Q60 18 100 18 Q140 18 142 54Z" fill="#2F6FDE"/><path d="M130 50 Q160 50 170 60 L136 60Z" fill="#2F6FDE"/>' + round(100, 18, 7, 7, '#fff') },
];

const BACK = [
  { m: '' },
  { m: '<path d="M54 138 Q6 96 18 70 Q40 96 60 112Z M146 138 Q194 96 182 70 Q160 96 140 112Z" fill="#F2F7FB" stroke="#C9DCEB" stroke-width="3"/>' },
  { m: '<path d="M64 112 Q40 170 46 196 H154 Q160 170 136 112Z" fill="#E23B3B"/>' },
];

export const PET_CATEGORIES = [
  { id: 'species', label: 'Druh' },
  { id: 'eyes', label: 'Oči' },
  { id: 'neck', label: 'Na krk' },
  { id: 'head', label: 'Na hlavu' },
  { id: 'back', label: 'Na záda' },
];

const LISTS = { species: SPECIES, eyes: EYES, neck: NECK, head: HEAD, back: BACK };
export const FUR = ['#C68A52', '#7A4B28', '#F0A23C', '#FFD432', '#FFFFFF', '#AAB4BE', '#222222', '#FF8FC0', '#8E4EC6', '#2F6FDE', '#3DAA4E', '#FF8A1F'];
export const SPECIES_IDS = SPECIES.map((s) => s.id);
export const speciesName = (pet) => SPECIES[pet.species]?.cs;

export const newPet = (species = 0) => ({ species, color: null, eyes: 0, neck: 0, head: 0, back: 0 });

// Volba, kterou dítě ještě nemá: doplněk z krámku, který nekoupilo.
export const petLocked = (cat, i, owned = []) => Boolean(LISTS[cat][i]?.shop) && !owned.includes(LISTS[cat][i].shop);

// Krámek: který doplněk patří ke které věci. Vrátí { cat, i }.
export function petSlotFor(shopId) {
  for (const cat of ['neck', 'head', 'back']) {
    const i = LISTS[cat].findIndex((o) => o.shop === shopId);
    if (i >= 0) return { cat, i };
  }
  return null;
}

export function petSvg(pet) {
  const sp = SPECIES[pet.species] ?? SPECIES[0];
  const c = pet.color ?? sp.c;
  const outline = c === '#FFFFFF' ? ' stroke="#E6D9E6" stroke-width="3"' : '';
  const body = `<ellipse cx="100" cy="148" rx="54" ry="44" fill="${c}"${outline}/>`
    + round(100, 156, 32, 28, sp.belly)
    + round(70, 188, 18, 10, c) + round(130, 188, 18, 10, c);
  const head = `<ellipse cx="100" cy="86" rx="50" ry="46" fill="${c}"${outline}/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">${
    BACK[pet.back]?.m ?? ''}${body}${NECK[pet.neck]?.m ?? ''}${sp.back(c)}${head}${sp.face()}${(EYES[pet.eyes] ?? EYES[0])()}${HEAD[pet.head]?.m ?? ''}</svg>`;
}

// Obrázek jedné volby pro okno tvorby.
export function petPartSvg(cat, i, pet) {
  return petSvg({ ...pet, [cat]: i, ...(cat === 'species' ? { color: null } : {}) });
}

export const petOptionCount = (cat) => LISTS[cat].length;
export const randomPet = (owned = []) => {
  const pick = (cat) => {
    const free = LISTS[cat].map((_, i) => i).filter((i) => !petLocked(cat, i, owned));
    return free[Math.floor(Math.random() * free.length)];
  };
  return { species: pick('species'), color: Math.random() < 0.5 ? null : FUR[Math.floor(Math.random() * FUR.length)], eyes: pick('eyes'), neck: pick('neck'), head: pick('head'), back: pick('back') };
};

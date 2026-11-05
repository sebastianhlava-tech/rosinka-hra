// Obsah a logika otázek. Bez DOM, aby šly testovat přes node --test.
// Učení má stopy (barvy, zvířata…). Každá stopa má vlastní stupně.
// Nový pojem = nový řádek ve stopě. Obrázek k němu patří do art.js.
// Id otázek se nesmí měnit: podle nich se hledají nahrávky hlasu.

const color = (id, cs, en) => ({ id: `color-${id}`, cat: 'color', art: `color:${id}`, text: `Kde je ${cs}?`, en: `Where is ${en}?`, word: `${cap(en)}!` });
const car = (id, cs, en) => ({ id: `car-${id}`, cat: 'car', art: `car:${id}`, text: `Kde je ${cs} auto?`, en: `Where is the ${en} car?`, word: `${cap(en)} car!` });
const animal = (id, cs, en) => ({ id: `animal-${id}`, cat: 'animal', art: id, text: `Kde je ${cs}?`, en: `Where is the ${en}?`, word: `${cap(en)}!` });
const thing = (id, cs, en) => ({ id: `thing-${id}`, cat: 'thing', art: id, text: `Kde je ${cs}?`, en: `Where is the ${en}?`, word: `${cap(en)}!` });
const shape = (id, cs, en) => ({ id: `shape-${id}`, cat: 'shape', art: `shape:${id}`, text: `Kde je ${cs}?`, en: `Where is the ${en}?`, word: `${cap(en)}!` });
const size = (id, cs, en) => ({ id: `size-${id}`, cat: 'size', art: `size:${id}`, text: `Kde je ${cs} míč?`, en: `Where is the ${en} ball?`, word: `${cap(en)}!` });
const count = (n, text, en, word) => ({ id: `count-${n}`, cat: 'count', art: `count:${n}`, text, en, word });
const sound = (id, cs, en) => ({ id: `sound-${id}`, cat: 'sound', answerId: `animal-${id}`, text: `Kdo dělá ${cs}?`, en: `Who says ${en}?` });
function cap(s) { return s[0].toUpperCase() + s.slice(1); }

export const TRACKS = [
  { id: 'colors', label: 'Barvy', openAfter: 0, stages: [
    { answers: 2, items: [color('red', 'červená', 'red'), color('blue', 'modrá', 'blue'), color('yellow', 'žlutá', 'yellow'), color('green', 'zelená', 'green')] },
    { answers: 2, items: [color('orange', 'oranžová', 'orange'), color('pink', 'růžová', 'pink'), color('purple', 'fialová', 'purple')] },
    { answers: 3, items: [color('brown', 'hnědá', 'brown'), color('black', 'černá', 'black'), color('white', 'bílá', 'white')] },
    { answers: 3, items: [car('red', 'červené', 'red'), car('blue', 'modré', 'blue'), car('yellow', 'žluté', 'yellow'), car('green', 'zelené', 'green')] },
  ] },
  { id: 'animals', label: 'Zvířata', openAfter: 4, stages: [
    { answers: 2, items: [animal('dog', 'pejsek', 'dog'), animal('cat', 'kočka', 'cat'), animal('cow', 'kráva', 'cow'), animal('duck', 'kachna', 'duck'), animal('fish', 'ryba', 'fish')] },
    { answers: 3, items: [animal('horse', 'kůň', 'horse'), animal('pig', 'prase', 'pig'), animal('sheep', 'ovce', 'sheep'), animal('hen', 'slepice', 'hen'), animal('rabbit', 'zajíc', 'bunny')] },
    { answers: 3, items: [animal('bear', 'medvěd', 'bear'), animal('elephant', 'slon', 'elephant'), animal('giraffe', 'žirafa', 'giraffe'), animal('lion', 'lev', 'lion'), animal('monkey', 'opice', 'monkey')] },
    { answers: 4, items: [sound('dog', 'haf', 'woof'), sound('cat', 'mňau', 'meow'), sound('cow', 'bú', 'moo'), sound('duck', 'kvá', 'quack'), sound('horse', 'ihaha', 'neigh'), sound('pig', 'chro', 'oink'), sound('sheep', 'bé', 'baa'), sound('hen', 'kokodák', 'cluck'), sound('lion', 'vrrr', 'roar'), sound('monkey', 'úa úa', 'ooh ooh')] },
  ] },
  { id: 'things', label: 'Věci', openAfter: 10, stages: [
    { answers: 2, items: [thing('ball', 'míč', 'ball'), thing('car', 'auto', 'car'), thing('apple', 'jablko', 'apple'), thing('banana', 'banán', 'banana'), thing('shoe', 'bota', 'shoe')] },
    { answers: 3, items: [thing('flower', 'kytka', 'flower'), thing('house', 'dům', 'house'), thing('sun', 'slunce', 'sun'), thing('moon', 'měsíc', 'moon'), thing('spoon', 'lžička', 'spoon')] },
  ] },
  { id: 'shapes', label: 'Tvary', openAfter: 20, stages: [
    { answers: 3, items: [shape('circle', 'kruh', 'circle'), shape('square', 'čtverec', 'square'), shape('triangle', 'trojúhelník', 'triangle'), shape('star', 'hvězda', 'star'), shape('heart', 'srdce', 'heart')] },
  ] },
  { id: 'opposites', label: 'Velký a malý', openAfter: 26, stages: [
    { answers: 2, items: [size('big', 'velký', 'big'), size('small', 'malý', 'small')] },
  ] },
  { id: 'counting', label: 'Počítání', openAfter: 26, stages: [
    { answers: 3, items: [count(1, 'Kde je jedna hvězda?', 'Where is one star?', 'One!'), count(2, 'Kde jsou dvě hvězdy?', 'Where are two stars?', 'Two!'), count(3, 'Kde jsou tři hvězdy?', 'Where are three stars?', 'Three!')] },
  ] },
];

export const ALL_ITEMS = TRACKS.flatMap((t) => t.stages.flatMap((s, stage) => s.items.map((item) => ({ ...item, track: t.id, stage: stage + 1 }))));
const byId = new Map(ALL_ITEMS.map((i) => [i.id, i]));

const COMMON = [
  ['praise-1', 'Výborně!', 'Great job!'],
  ['praise-2', 'To je ono!', 'That\'s it!'],
  ['praise-3', 'Ty jsi šikulka!', 'You are so clever!'],
  ['retry', 'Zkusíme to znovu.', 'Let\'s try again.'],
  ['up-big', 'Jsi velká!', 'You are big!'],
  ['up-fly', 'Letíš!', 'You can fly!'],
  ['up-rainbow', 'Máš duhu!', 'You have a rainbow!'],
  ['up-friend', 'Máš kamaráda!', 'You have a friend!'],
  ['up-bubble', 'Máš bublinu!', 'You have a bubble!'],
  ['up-flowers', 'Rostou kytičky!', 'Flowers are growing!'],
  ['up-magnet', 'Hvězdy letí k tobě!', 'The stars fly to you!'],
  ['up-sparkle', 'Třpytíš se!', 'You sparkle!'],
  ['up-butterfly', 'Máš motýlky!', 'You have butterflies!'],
  ['up-music', 'Hraje hudba!', 'Music is playing!'],
  ['up-party', 'Hurá!', 'Hooray!'],
  ['place-meadow', 'Jsme na louce.', 'We are in the meadow.'],
  ['place-forest', 'Jsme v lese.', 'We are in the forest.'],
  ['place-beach', 'Jsme na pláži.', 'We are at the beach.'],
  ['place-snow', 'Padá sníh.', 'It is snowing.'],
  ['place-city', 'Jsme ve městě.', 'We are in the town.'],
  ['place-dusk', 'Je tma.', 'It is dark.'],
  ['bum', 'Bum!', 'Bump!'],
  ['night', 'Dobrou noc.', 'Good night.'],
];

// Každá věta má klíč nahrávky. Česká věta má klíč jako dřív (id), anglická „en:id“.
export const sentenceKey = (id, lang) => (lang === 'en' ? `en:${id}` : id);

const sentence = (id, lang, text, group, stage = 0) => ({ key: sentenceKey(id, lang), id, lang, text, group, stage });

export const SENTENCES = [
  ...COMMON.map(([id, cs]) => sentence(id, 'cs', cs, 'common')),
  ...ALL_ITEMS.map((i) => sentence(i.id, 'cs', i.text, i.track, i.stage)),
  ...COMMON.map(([id, , en]) => sentence(id, 'en', en, 'common')),
  ...ALL_ITEMS.map((i) => sentence(i.id, 'en', i.en, i.track, i.stage)),
  ...ALL_ITEMS.filter((i) => i.word).map((i) => sentence(`word-${i.id}`, 'en', i.word, i.track, i.stage)),
];

// Soubor s hlasem: „mom__cs__color-red.mp3“. Stejné jméno používá export, skript i import.
export const voiceFileName = (kind, s, ext) => `${kind}__${s.lang}__${s.id}.${ext}`;

const knownKeys = new Set(SENTENCES.map((s) => s.key));

export function parseVoiceFile(path) {
  const m = path.split('/').pop().match(/^(mom|dad)__(cs|en)__(.+)\.\w+$/);
  if (!m) return null;
  const key = sentenceKey(m[3], m[2]);
  return knownKeys.has(key) ? { kind: m[1], key } : null;
}

const NEW_SHARE = 0.3;
const MASTERED_AFTER = 2;
const RETURN_AFTER = 2;

export const newProgress = () => ({ stages: { colors: 1 }, off: [], items: {}, due: [], last: null });

// Dřív byla jedna řada 10 úrovní. Tady je, které stupně stop každá úroveň otevřela.
const OLD_LEVELS = [
  [['colors', 1]], [['animals', 1]], [['colors', 2]], [['things', 1]], [['animals', 2]],
  [['shapes', 1]], [['colors', 3], ['opposites', 1]], [['animals', 3]], [['things', 2], ['counting', 1]], [['animals', 4]],
];

export function normalizeProgress(saved) {
  const p = { ...newProgress(), ...saved };
  if (saved && !saved.stages) {
    p.stages = {};
    OLD_LEVELS.slice(0, saved.level ?? 1).flat().forEach(([t, n]) => { p.stages[t] = Math.max(p.stages[t] ?? 0, n); });
    delete p.level;
  }
  p.due = p.due.filter((d) => byId.has(d.id));
  return p;
}

const stats = (p, id) => (p.items[id] ??= { right: 0, wrong: 0, firstTry: 0 });
const isMastered = (p, item) => (p.items[item.id]?.firstTry ?? 0) >= MASTERED_AFTER;
const trackOf = (id) => TRACKS.find((t) => t.id === id);

export function itemStatus(p, item) {
  if (isMastered(p, item)) return 'known';
  return p.items[item.id] ? 'learning' : 'new';
}

export const stageOf = (p, trackId) => p.stages[trackId] ?? 0;
export const isOff = (p, trackId) => p.off.includes(trackId);

function openTracks(p) {
  const open = TRACKS.filter((t) => stageOf(p, t.id) > 0 && !isOff(p, t.id));
  return open.length ? open : [TRACKS[0]];
}

// Rodič nastaví stupeň stopy. 0 = vypnuto.
export function setStage(p, trackId, stage) {
  const t = trackOf(trackId);
  p.off = p.off.filter((id) => id !== trackId);
  if (stage <= 0) p.off.push(trackId);
  else p.stages[trackId] = Math.min(t.stages.length, stage);
  p.due = [];
}

// Jak daleko dítě celkově je. Svět podle toho přidává překážky. 1 až 10.
export function playLevel(p) {
  const sum = TRACKS.reduce((n, t) => n + stageOf(p, t.id), 0);
  return Math.min(10, Math.max(1, sum));
}

const pickOne = (list, rng) => list[Math.floor(rng() * list.length)];

function pickWeighted(p, list, rng) {
  const weights = list.map((i) => 1 + 2 * (p.items[i.id]?.wrong ?? 0));
  let roll = rng() * weights.reduce((a, b) => a + b, 0);
  for (let i = 0; i < list.length; i++) {
    roll -= weights[i];
    if (roll < 0) return list[i];
  }
  return list[list.length - 1];
}

function shuffle(list, rng) {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function chooseItem(p, rng) {
  const open = openTracks(p);
  const isOpen = (i) => open.some((t) => t.id === i.track && i.stage <= Math.max(1, stageOf(p, t.id)));
  p.due.forEach((d) => d.wait--);
  const dueEntry = p.due.find((d) => d.wait <= 0 && d.id !== p.last && isOpen(byId.get(d.id)));
  if (dueEntry) {
    p.due = p.due.filter((d) => d !== dueEntry);
    return byId.get(dueEntry.id);
  }

  const notLast = (i) => i.id !== p.last;
  const unlocked = ALL_ITEMS.filter(isOpen);
  const current = unlocked.filter((i) => i.stage === Math.max(1, stageOf(p, i.track)));
  const fresh = current.filter((i) => !isMastered(p, i)).filter(notLast);
  const known = unlocked.filter((i) => !fresh.includes(i) && (i.stage < stageOf(p, i.track) || isMastered(p, i))).filter(notLast);

  if (fresh.length && (!known.length || rng() < NEW_SHARE)) return pickOne(fresh, rng);
  if (known.length) return pickWeighted(p, known, rng);
  return pickOne(unlocked.filter(notLast), rng);
}

function answerPool(p, item) {
  const cat = item.cat === 'sound' ? 'animal' : item.cat;
  const top = Math.max(1, stageOf(p, item.track));
  return ALL_ITEMS.filter((i) => i.cat === cat && i.stage <= top);
}

export function pickQuestion(p, rng = Math.random) {
  const item = chooseItem(p, rng);
  p.last = item.id;
  const answerId = item.answerId ?? item.id;
  const pool = answerPool(p, item);
  const correct = byId.get(answerId);
  const others = shuffle(pool.filter((i) => i.id !== answerId), rng);
  const t = trackOf(item.track);
  const n = t.stages[Math.max(1, stageOf(p, t.id)) - 1].answers;
  return { item, answerId, choices: shuffle([correct, ...others.slice(0, n - 1)], rng) };
}

// Po správné odpovědi: když dítě umí celý stupeň, stopa jde o stupeň dál.
// Když umí dost pojmů celkem, otevře se další stopa.
export function recordAnswer(p, id, firstTry) {
  const s = stats(p, id);
  if (firstTry) {
    s.right++;
    s.firstTry++;
  } else {
    s.wrong++;
    if (!p.due.some((d) => d.id === id)) p.due.push({ id, wait: RETURN_AFTER });
  }
  const t = trackOf(byId.get(id).track);
  const stage = stageOf(p, t.id);
  let levelUp = false;
  if (stage > 0 && stage < t.stages.length && t.stages[stage - 1].items.every((i) => isMastered(p, i))) {
    p.stages[t.id] = stage + 1;
    levelUp = true;
  }
  const mastered = ALL_ITEMS.filter((i) => isMastered(p, i)).length;
  for (const other of TRACKS) {
    if (!stageOf(p, other.id) && !isOff(p, other.id) && mastered >= other.openAfter) {
      p.stages[other.id] = 1;
      levelUp = true;
    }
  }
  return { levelUp };
}

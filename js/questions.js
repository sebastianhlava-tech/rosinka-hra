// Obsah a logika otázek. Bez DOM, aby šly testovat přes node --test.
// Nový pojem = nový řádek v LEVELS. Obrázek k němu patří do art.js.

const color = (id, word) => ({ id: `color-${id}`, cat: 'color', art: `color:${id}`, text: `Kde je ${word}?` });
const animal = (id, word) => ({ id: `animal-${id}`, cat: 'animal', art: id, text: `Kde je ${word}?` });
const thing = (id, word) => ({ id: `thing-${id}`, cat: 'thing', art: id, text: `Kde je ${word}?` });
const shape = (id, word) => ({ id: `shape-${id}`, cat: 'shape', art: id, text: `Kde je ${word}?` });
const size = (id, word) => ({ id: `size-${id}`, cat: 'size', art: `size:${id}`, text: `Kde je ${word} míč?` });
const count = (n, text) => ({ id: `count-${n}`, cat: 'count', art: `count:${n}`, text });
const sound = (id, noise) => ({ id: `sound-${id}`, cat: 'sound', answerId: `animal-${id}`, text: `Kdo dělá ${noise}?` });

export const LEVELS = [
  { answers: 2, items: [color('red', 'červená'), color('blue', 'modrá'), color('yellow', 'žlutá'), color('green', 'zelená')] },
  { answers: 2, items: [animal('dog', 'pejsek'), animal('cat', 'kočka'), animal('cow', 'kráva'), animal('duck', 'kachna'), animal('fish', 'ryba')] },
  { answers: 2, items: [color('orange', 'oranžová'), color('pink', 'růžová'), color('purple', 'fialová')] },
  { answers: 2, items: [thing('ball', 'míč'), thing('car', 'auto'), thing('apple', 'jablko'), thing('banana', 'banán'), thing('shoe', 'bota')] },
  { answers: 3, items: [animal('horse', 'kůň'), animal('pig', 'prase'), animal('sheep', 'ovce'), animal('hen', 'slepice'), animal('rabbit', 'zajíc')] },
  { answers: 3, items: [shape('circle', 'kruh'), shape('square', 'čtverec'), shape('triangle', 'trojúhelník'), shape('star', 'hvězda'), shape('heart', 'srdce')] },
  { answers: 3, items: [color('brown', 'hnědá'), color('black', 'černá'), color('white', 'bílá'), size('big', 'velký'), size('small', 'malý')] },
  { answers: 3, items: [animal('bear', 'medvěd'), animal('elephant', 'slon'), animal('giraffe', 'žirafa'), animal('lion', 'lev'), animal('monkey', 'opice')] },
  { answers: 3, items: [thing('flower', 'kytka'), thing('house', 'dům'), thing('sun', 'slunce'), thing('moon', 'měsíc'), thing('spoon', 'lžička'), count(1, 'Kde je jedna hvězda?'), count(2, 'Kde jsou dvě hvězdy?'), count(3, 'Kde jsou tři hvězdy?')] },
  { answers: 4, items: [sound('dog', 'haf'), sound('cat', 'mňau'), sound('cow', 'bú'), sound('duck', 'kvá'), sound('horse', 'ihaha'), sound('pig', 'chro'), sound('sheep', 'bé'), sound('hen', 'kokodák'), sound('lion', 'vrrr'), sound('monkey', 'úa úa')] },
];

const OTHER_SENTENCES = [
  { id: 'praise-1', text: 'Výborně!' },
  { id: 'praise-2', text: 'To je ono!' },
  { id: 'praise-3', text: 'Ty jsi šikulka!' },
  { id: 'retry', text: 'Zkusíme to znovu.' },
  { id: 'up-big', text: 'Jsi velká!' },
  { id: 'up-fly', text: 'Letíš!' },
  { id: 'up-rainbow', text: 'Máš duhu!' },
  { id: 'up-friend', text: 'Máš kamaráda!' },
  { id: 'bum', text: 'Bum!' },
  { id: 'night', text: 'Dobrou noc.' },
];

export const SENTENCES = [
  ...OTHER_SENTENCES.map((s) => ({ ...s, level: 0 })),
  ...LEVELS.flatMap((l, i) => l.items.map((item) => ({ id: item.id, text: item.text, level: i + 1 }))),
];

const NEW_SHARE = 0.3;
const MASTERED_AFTER = 2;
const RETURN_AFTER = 2;

export const newProgress = () => ({ level: 1, items: {}, due: [], last: null });

const stats = (p, id) => (p.items[id] ??= { right: 0, wrong: 0, firstTry: 0 });
const isMastered = (p, item) => (p.items[item.id]?.firstTry ?? 0) >= MASTERED_AFTER;
const byId = (id) => LEVELS.flatMap((l) => l.items).find((i) => i.id === id);

export function itemStatus(p, item) {
  if (isMastered(p, item)) return 'known';
  return p.items[item.id] ? 'learning' : 'new';
}

export function setLevel(p, level) {
  p.level = Math.min(LEVELS.length, Math.max(1, level));
  p.due = [];
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
  p.due.forEach((d) => d.wait--);
  const dueEntry = p.due.find((d) => d.wait <= 0 && d.id !== p.last);
  if (dueEntry) {
    p.due = p.due.filter((d) => d !== dueEntry);
    return byId(dueEntry.id);
  }

  const notLast = (i) => i.id !== p.last;
  const current = LEVELS[p.level - 1].items;
  const fresh = current.filter((i) => !isMastered(p, i)).filter(notLast);
  const known = [...LEVELS.slice(0, p.level - 1).flatMap((l) => l.items), ...current.filter((i) => isMastered(p, i))].filter(notLast);

  if (fresh.length && (!known.length || rng() < NEW_SHARE)) return pickOne(fresh, rng);
  if (known.length) return pickWeighted(p, known, rng);
  return pickOne(current.filter(notLast), rng);
}

function answerPool(p, item) {
  const unlocked = LEVELS.slice(0, p.level).flatMap((l) => l.items);
  const cat = item.cat === 'sound' ? 'animal' : item.cat;
  return unlocked.filter((i) => i.cat === cat);
}

export function pickQuestion(p, rng = Math.random) {
  const item = chooseItem(p, rng);
  p.last = item.id;
  const answerId = item.answerId ?? item.id;
  const pool = answerPool(p, item);
  const correct = pool.find((i) => i.id === answerId) ?? byId(answerId);
  const others = shuffle(pool.filter((i) => i.id !== answerId), rng);
  const n = LEVELS[p.level - 1].answers;
  return { item, answerId, choices: shuffle([correct, ...others.slice(0, n - 1)], rng) };
}

export function recordAnswer(p, id, firstTry) {
  const s = stats(p, id);
  if (firstTry) {
    s.right++;
    s.firstTry++;
  } else {
    s.wrong++;
    if (!p.due.some((d) => d.id === id)) p.due.push({ id, wait: RETURN_AFTER });
  }
  const done = LEVELS[p.level - 1].items.every((i) => isMastered(p, i));
  if (done && p.level < LEVELS.length) {
    p.level++;
    return { levelUp: true };
  }
  return { levelUp: false };
}

// Hvězdičky jako peníze a krámky. Jen data a počty, bez DOM, aby šly testovat.
// Ceny jsou 1 až 3 hvězdy: tolik dítě umí spočítat.

export const RUN_STARS_PER_STAR = 20;
export const ANSWER_STARS = 1;

// kind: 'hand' = drží v ruce do konce hry, 'room' = zůstane v pokojíčku.
const item = (id, art, price, kind, cs, en) => ({ id, art, price, kind, cs, en });

export const SHOPS = {
  meadow: { seller: 'rabbit', cs: 'Tady je stánek s ovocem. Vyber si.', en: 'Here is the fruit stand. Pick something.', items: [
    item('apple', 'apple', 1, 'hand', 'Jablko stojí jednu hvězdičku.', 'The apple costs one star.'),
    item('banana', 'banana', 2, 'hand', 'Banán stojí dvě hvězdičky.', 'The banana costs two stars.'),
    item('flower', 'flower', 3, 'hand', 'Kytička stojí tři hvězdičky.', 'The flower costs three stars.'),
  ] },
  forest: { seller: 'hedgehog', cs: 'Tady je lesní stánek. Vyber si.', en: 'Here is the forest stand. Pick something.', items: [
    item('pinecone', 'pinecone', 1, 'room', 'Šiška stojí jednu hvězdičku.', 'The pinecone costs one star.'),
    item('mushroom', 'mushroom', 2, 'room', 'Hříbek stojí dvě hvězdičky.', 'The mushroom costs two stars.'),
    item('lollipop', 'lollipop', 3, 'hand', 'Lízátko stojí tři hvězdičky.', 'The lollipop costs three stars.'),
  ] },
  beach: { seller: 'cat', cs: 'Tady je zmrzlinárna. Vyber si.', en: 'Here is the ice cream shop. Pick something.', items: [
    item('icecream-1', 'icecream1', 1, 'hand', 'Jeden kopeček stojí jednu hvězdičku.', 'One scoop costs one star.'),
    item('icecream-2', 'icecream2', 2, 'hand', 'Dva kopečky stojí dvě hvězdičky.', 'Two scoops cost two stars.'),
    item('icecream-3', 'icecream3', 3, 'hand', 'Tři kopečky stojí tři hvězdičky.', 'Three scoops cost three stars.'),
  ] },
  snow: { seller: 'sheep', cs: 'Tady je zimní stánek. Vyber si.', en: 'Here is the winter stand. Pick something.', items: [
    item('cocoa', 'cocoa', 1, 'hand', 'Kakao stojí jednu hvězdičku.', 'The cocoa costs one star.'),
    item('snowman', 'snowman', 2, 'room', 'Sněhulák stojí dvě hvězdičky.', 'The snowman costs two stars.'),
    item('sled', 'sled', 3, 'room', 'Sáňky stojí tři hvězdičky.', 'The sled costs three stars.'),
  ] },
  city: { seller: 'dog', cs: 'Tady je hračkářství. Vyber si.', en: 'Here is the toy shop. Pick something.', items: [
    item('balloon', 'balloon', 1, 'hand', 'Balónek stojí jednu hvězdičku.', 'The balloon costs one star.'),
    item('toycar', 'car', 2, 'room', 'Autíčko stojí dvě hvězdičky.', 'The toy car costs two stars.'),
    item('teddy', 'teddy', 3, 'room', 'Medvídek stojí tři hvězdičky.', 'The teddy bear costs three stars.'),
  ] },
  dusk: { seller: 'monkey', cs: 'Tady je noční stánek. Vyber si.', en: 'Here is the night stand. Pick something.', items: [
    item('nightstar', 'star', 1, 'room', 'Hvězdička stojí jednu hvězdičku.', 'The little star costs one star.'),
    item('nightmoon', 'moon', 2, 'room', 'Měsíček stojí dvě hvězdičky.', 'The little moon costs two stars.'),
    item('lantern', 'lantern', 3, 'hand', 'Lucernička stojí tři hvězdičky.', 'The lantern costs three stars.'),
  ] },
};

export const SHOP_ITEMS = Object.values(SHOPS).flatMap((s) => s.items);
export const ROOM_ITEMS = SHOP_ITEMS.filter((i) => i.kind === 'room');
const byId = new Map(SHOP_ITEMS.map((i) => [i.id, i]));
export const shopItem = (id) => byId.get(id);

// Věty pro hlas: [id, česky, anglicky]. Patří do skupiny „Krámek“.
export const SHOP_LINES = [
  ...Object.entries(SHOPS).map(([biome, s]) => [`shop-${biome}`, s.cs, s.en]),
  ...SHOP_ITEMS.map((i) => [`price-${i.id}`, i.cs, i.en]),
  ['tally-1', 'Jedna.', 'One.'],
  ['tally-2', 'Dvě.', 'Two.'],
  ['tally-3', 'Tři.', 'Three.'],
  ['thanks', 'Děkuji!', 'Thank you!'],
  ['need-more', 'Na to potřebujeme víc hvězdiček.', 'We need more stars for that.'],
];

// Co je dnes na pultu: věci do pokojíčku, které už má, tam nejsou.
export const shopItems = (biome, room = []) => SHOPS[biome].items.filter((i) => i.kind === 'hand' || !room.includes(i.id));

// Hvězdy z běhu: každých 20 sebraných dá 1 hvězdičku do peněženky. Vrátí, kolik přibylo.
export function addRunStar(state) {
  state.starBits = (state.starBits ?? 0) + 1;
  if (state.starBits < RUN_STARS_PER_STAR) return 0;
  state.starBits = 0;
  state.stars = (state.stars ?? 0) + 1;
  return 1;
}

export function addStars(state, n) {
  state.stars = (state.stars ?? 0) + n;
}

// Zaplatí věc. Vrátí false, když hvězdy nestačí. Nic se neztratí.
export function buy(state, id) {
  const it = shopItem(id);
  if (!it || (state.stars ?? 0) < it.price) return false;
  state.stars -= it.price;
  if (it.kind === 'room' && !state.room.includes(id)) state.room.push(id);
  return true;
}

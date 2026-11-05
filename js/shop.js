// Hvězdičky jako peníze a krámky. Jen data a počty, bez DOM, aby šly testovat.
// Ceny jsou 1 až 3 hvězdy: tolik dítě umí spočítat.
// Každá věc něco dělá:
//   eat  = drží ji v ruce a postupně ji sní („Mňam!“),
//   hand = drží ji do konce hry (balónek: skáče výš, lucerna: svítí),
//   room = zůstane na poličce v pokojíčku,
//   pet  = doplněk pro kamaráda, hned ho má na sobě.
import { petSlotFor } from './pets.js';

export const RUN_STARS_PER_STAR = 20;
export const ANSWER_STARS = 1;

const item = (id, art, price, kind, cs, en, extra = {}) => ({ id, art, price, kind, cs, en, sold: true, ...extra });
const BUY = 'Za hvězdičky si můžeš něco koupit.';
const BUY_EN = 'You can buy something with your stars.';

export const SHOPS = {
  meadow: { seller: 'rabbit', cs: `Tady je stánek s ovocem. ${BUY}`, en: `Here is the fruit stand. ${BUY_EN}`, items: [
    item('apple', 'apple', 1, 'eat', 'Jablko stojí jednu hvězdičku.', 'The apple costs one star.'),
    item('banana', 'banana', 2, 'eat', 'Banán stojí dvě hvězdičky.', 'The banana costs two stars.'),
    item('petbow', 'petbow', 3, 'pet', 'Mašle pro kamaráda stojí tři hvězdičky.', 'A bow for your friend costs three stars.', { wear: 'Kamarád má mašli!', wearEn: 'Your friend has a bow!' }),
  ] },
  forest: { seller: 'hedgehog', cs: `Tady je lesní stánek. ${BUY}`, en: `Here is the forest stand. ${BUY_EN}`, items: [
    item('pinecone', 'pinecone', 1, 'room', 'Šiška stojí jednu hvězdičku.', 'The pinecone costs one star.'),
    item('petcrown', 'petcrown', 2, 'pet', 'Korunka pro kamaráda stojí dvě hvězdičky.', 'A crown for your friend costs two stars.', { wear: 'Kamarád má korunku!', wearEn: 'Your friend has a crown!' }),
    item('lollipop', 'lollipop', 3, 'eat', 'Lízátko stojí tři hvězdičky.', 'The lollipop costs three stars.'),
    item('mushroom', 'mushroom', 2, 'room', 'Hříbek stojí dvě hvězdičky.', 'The mushroom costs two stars.', { sold: false }),
  ] },
  beach: { seller: 'cat', cs: `Tady je zmrzlinárna. ${BUY}`, en: `Here is the ice cream shop. ${BUY_EN}`, items: [
    item('icecream-1', 'icecream1', 1, 'eat', 'Jeden kopeček stojí jednu hvězdičku.', 'One scoop costs one star.'),
    item('icecream-2', 'icecream2', 2, 'eat', 'Dva kopečky stojí dvě hvězdičky.', 'Two scoops cost two stars.'),
    item('icecream-3', 'icecream3', 3, 'eat', 'Tři kopečky stojí tři hvězdičky.', 'Three scoops cost three stars.'),
  ] },
  snow: { seller: 'sheep', cs: `Tady je zimní stánek. ${BUY}`, en: `Here is the winter stand. ${BUY_EN}`, items: [
    item('cocoa', 'cocoa', 1, 'eat', 'Kakao stojí jednu hvězdičku.', 'The cocoa costs one star.'),
    item('snowman', 'snowman', 2, 'room', 'Sněhulák stojí dvě hvězdičky.', 'The snowman costs two stars.'),
    item('pethat', 'pethat', 3, 'pet', 'Klobouček pro kamaráda stojí tři hvězdičky.', 'A hat for your friend costs three stars.', { wear: 'Kamarád má klobouček!', wearEn: 'Your friend has a hat!' }),
    item('sled', 'sled', 3, 'room', 'Sáňky stojí tři hvězdičky.', 'The sled costs three stars.', { sold: false }),
  ] },
  city: { seller: 'dog', cs: `Tady je hračkářství. ${BUY}`, en: `Here is the toy shop. ${BUY_EN}`, items: [
    item('balloon', 'balloon', 1, 'hand', 'Balónek stojí jednu hvězdičku.', 'The balloon costs one star.'),
    item('toycar', 'car', 2, 'room', 'Autíčko stojí dvě hvězdičky.', 'The toy car costs two stars.'),
    item('teddy', 'teddy', 3, 'room', 'Medvídek stojí tři hvězdičky.', 'The teddy bear costs three stars.'),
  ] },
  dusk: { seller: 'monkey', cs: `Tady je noční stánek. ${BUY}`, en: `Here is the night stand. ${BUY_EN}`, items: [
    item('nightstar', 'star', 1, 'room', 'Hvězdička stojí jednu hvězdičku.', 'The little star costs one star.'),
    item('nightmoon', 'moon', 2, 'room', 'Měsíček stojí dvě hvězdičky.', 'The little moon costs two stars.'),
    item('lantern', 'lantern', 3, 'hand', 'Lucernička stojí tři hvězdičky.', 'The lantern costs three stars.'),
  ] },
};

// Nová místa (fáze 5). Některé věci jsou ve dvou krámcích, je to stejná věc.
const find = (id) => Object.values(SHOPS).flatMap((s) => s.items).find((i) => i.id === id);
Object.assign(SHOPS, {
  farm: { seller: 'cow', cs: `Tady je farma. ${BUY}`, en: `Here is the farm shop. ${BUY_EN}`, items: [
    item('milk', 'milk', 1, 'eat', 'Mléko stojí jednu hvězdičku.', 'The milk costs one star.'),
    item('carrot', 'carrot', 2, 'eat', 'Mrkev stojí dvě hvězdičky.', 'The carrot costs two stars.'),
    item('toytractor', 'tractor', 3, 'room', 'Traktůrek stojí tři hvězdičky.', 'The toy tractor costs three stars.'),
  ] },
  zoo: { seller: 'elephant', cs: `Tady je stánek v ZOO. ${BUY}`, en: `Here is the zoo stand. ${BUY_EN}`, items: [
    find('balloon'),
    find('icecream-2'),
    item('plushlion', 'lion', 3, 'room', 'Plyšový lev stojí tři hvězdičky.', 'The toy lion costs three stars.'),
  ] },
  castle: { seller: 'horse', cs: `Tady je hradní stánek. ${BUY}`, en: `Here is the castle stand. ${BUY_EN}`, items: [
    item('flag', 'flag', 1, 'hand', 'Vlaječka stojí jednu hvězdičku.', 'The flag costs one star.'),
    item('petcape', 'petcape', 2, 'pet', 'Plášť pro kamaráda stojí dvě hvězdičky.', 'A cape for your friend costs two stars.', { wear: 'Kamarád má plášť!', wearEn: 'Your friend has a cape!' }),
    item('toyshield', 'shield', 3, 'room', 'Štít stojí tři hvězdičky.', 'The shield costs three stars.'),
  ] },
  playground: { seller: 'pig', cs: `Tady je stánek u hřiště. ${BUY}`, en: `Here is the playground stand. ${BUY_EN}`, items: [
    find('icecream-1'),
    item('toyball', 'ball', 2, 'room', 'Míč stojí dvě hvězdičky.', 'The ball costs two stars.'),
    item('toybucket', 'bucket', 3, 'room', 'Kyblíček stojí tři hvězdičky.', 'The bucket costs three stars.'),
  ] },
});

export const SHOP_ITEMS = [...new Set(Object.values(SHOPS).flatMap((s) => s.items))];
export const ROOM_ITEMS = SHOP_ITEMS.filter((i) => i.kind === 'room');
const byId = new Map(SHOP_ITEMS.map((i) => [i.id, i]));
export const shopItem = (id) => byId.get(id);

// Věty pro hlas: [id, česky, anglicky]. Patří do skupiny „Krámek“.
export const SHOP_LINES = [
  ...Object.entries(SHOPS).map(([biome, s]) => [`shop-${biome}`, s.cs, s.en]),
  ...SHOP_ITEMS.map((i) => [`price-${i.id}`, i.cs, i.en]),
  ...SHOP_ITEMS.filter((i) => i.wear).map((i) => [`wear-${i.id}`, i.wear, i.wearEn]),
  ['tally-1', 'Jedna.', 'One.'],
  ['tally-2', 'Dvě.', 'Two.'],
  ['tally-3', 'Tři.', 'Three.'],
  ['thanks', 'Děkuji!', 'Thank you!'],
  ['need-more', 'Na to potřebujeme víc hvězdiček.', 'We need more stars for that.'],
  ['yum', 'Mňam, to bylo dobré!', 'Yum, that was good!'],
];

// Co je dnes na pultu. Věci do pokojíčku a doplňky, které už má, tam nejsou.
// Doplněk pro kamaráda jen tehdy, když má kamaráda.
export function shopItems(biome, state) {
  return SHOPS[biome].items.filter((i) => i.sold
    && !(i.kind === 'room' && state.room.includes(i.id))
    && !(i.kind === 'pet' && (!state.pets?.length || state.petItems?.includes(i.id))));
}

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
// Doplněk pro kamaráda si hned oblékne první kamarád.
export function buy(state, id) {
  const it = shopItem(id);
  if (!it || (state.stars ?? 0) < it.price) return false;
  state.stars -= it.price;
  if (it.kind === 'room' && !state.room.includes(id)) state.room.push(id);
  if (it.kind === 'pet') {
    state.petItems = [...new Set([...(state.petItems ?? []), id])];
    const slot = petSlotFor(id);
    if (slot && state.pets?.[0]) state.pets[0][slot.cat] = slot.i;
  }
  return true;
}

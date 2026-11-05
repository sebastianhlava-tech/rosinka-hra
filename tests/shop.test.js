import test from 'node:test';
import assert from 'node:assert/strict';
import { BIOMES } from '../js/biomes.js';
import { SENTENCES } from '../js/questions.js';
import { RUN_STARS_PER_STAR, SHOPS, SHOP_ITEMS, addRunStar, buy, shopItems } from '../js/shop.js';
import { artSvg } from '../js/art.js';

const fresh = (stars = 0) => ({ stars, starBits: 0, room: [] });

test('každé místo má krámek se 3 věcmi za 1, 2 a 3 hvězdy', () => {
  BIOMES.forEach((b) => {
    const shop = SHOPS[b.id];
    assert.ok(shop, b.id);
    assert.deepEqual(shop.items.map((i) => i.price), [1, 2, 3], b.id);
  });
  assert.equal(new Set(SHOP_ITEMS.map((i) => i.id)).size, SHOP_ITEMS.length);
});

test('každá věc a prodavač mají obrázek', () => {
  [...SHOP_ITEMS.map((i) => i.art), ...Object.values(SHOPS).map((s) => s.seller), 'stall', 'book', 'arrow']
    .forEach((art) => assert.ok(!artSvg(art).includes('undefined'), art));
});

test('každá věta krámku má češtinu i angličtinu', () => {
  SHOP_ITEMS.forEach((i) => {
    assert.ok(SENTENCES.some((s) => s.key === `price-${i.id}`), i.id);
    assert.ok(SENTENCES.some((s) => s.key === `en:price-${i.id}`), i.id);
  });
  ['tally-1', 'tally-2', 'tally-3', 'thanks', 'need-more', 'shop-beach'].forEach((id) => assert.ok(SENTENCES.some((s) => s.key === id), id));
});

test('každých 20 sebraných hvězd dá 1 hvězdičku do peněženky', () => {
  const st = fresh();
  let got = 0;
  for (let i = 0; i < RUN_STARS_PER_STAR * 3; i++) got += addRunStar(st);
  assert.equal(got, 3);
  assert.equal(st.stars, 3);
  assert.equal(st.starBits, 0);
});

test('nákup: málo hvězd nic nevezme, dost hvězd zaplatí přesně cenu', () => {
  const st = fresh(2);
  assert.equal(buy(st, 'teddy'), false);
  assert.equal(st.stars, 2);
  assert.equal(buy(st, 'toycar'), true);
  assert.equal(st.stars, 0);
  assert.deepEqual(st.room, ['toycar']);
});

test('věc do pokojíčku, kterou už má, v krámku není. Věc do ruky ano', () => {
  const st = fresh(10);
  buy(st, 'teddy');
  buy(st, 'balloon');
  assert.deepEqual(shopItems('city', st.room).map((i) => i.id), ['balloon', 'toycar']);
  assert.deepEqual(st.room, ['teddy']);
});

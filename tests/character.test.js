import assert from 'node:assert/strict';
import { test } from 'node:test';
import { categoriesFor, characterFor, hasColor, normalizeCharacter, optionCount, partSvg, randomCharacter } from '../js/character.js';

const KINDS = ['child', 'mom', 'dad'];

// Karty z fáze 6 mají méně možností.
const SMALL = ['eyes', 'mouth', 'hairclip', 'pattern', 'socks'];

test('každá kategorie má dost druhů pro každou postavu', () => {
  for (const kind of KINDS) {
    for (const { id } of categoriesFor(kind)) assert.ok(optionCount(id, kind) >= (SMALL.includes(id) ? 5 : 10), `${kind} ${id}`);
  }
});

test('stará uložená postava si nechá kůži a barvu botiček', () => {
  const c = normalizeCharacter({ face: 4, hair: 1, dress: 2, shoes: 3, hat: 2 });
  assert.equal(c.colors.face, '#7D5235');
  assert.equal(c.colors.shoes, '#FF8FC0');
  assert.equal(c.shoes, 0);
  assert.equal(c.glasses, 0);
  assert.ok(characterFor('child', { face: 4, hair: 1, dress: 2, shoes: 3, hat: 2 }).includes('#7D5235'));
});

test('zvolená barva změní každý barevný díl', () => {
  for (const kind of KINDS) {
    for (const { id } of categoriesFor(kind)) {
      for (let i = 1; i < optionCount(id, kind); i++) {
        if (!hasColor(id, i)) continue;
        const base = { face: 0, hair: 0, dress: 0, shoes: 0, hat: 0, colors: {}, [id]: i };
        const color = '#ABCDEF';
        const a = characterFor(kind, { ...base, colors: { face: '#123456' } });
        const b = characterFor(kind, { ...base, colors: { face: '#123456', [id]: color } });
        if (id !== 'face') assert.notEqual(a, b, `${kind} ${id} ${i}`);
      }
    }
  }
});

test('náhledy a náhodná postava se vykreslí bez undefined', () => {
  for (const kind of KINDS) {
    for (const { id } of categoriesFor(kind)) {
      for (let i = 0; i < optionCount(id, kind); i++) assert.ok(!partSvg(id, i, kind).includes('undefined'), `${id} ${i}`);
    }
    for (let n = 0; n < 50; n++) {
      const c = randomCharacter(kind, normalizeCharacter({ face: 0, hair: 0, dress: 0, shoes: 0, hat: 0 }));
      assert.ok(!characterFor(kind, c).includes('undefined'));
    }
  }
});

test('vylepšení jdou po řadě a nakonec je oslava', async () => {
  const { UPGRADES, nextUpgrade } = await import('../js/biomes.js');
  assert.equal(nextUpgrade([], 0), 'fly');
  assert.equal(nextUpgrade(['fly'], 0), 'big');
  const all = [...new Set(UPGRADES)];
  assert.equal(nextUpgrade(all, 3), 'party');
});

test('se 3 trvalými kamarády přijde místo kamaráda další vylepšení', async () => {
  const { nextUpgrade } = await import('../js/biomes.js');
  assert.equal(nextUpgrade(['fly', 'big', 'rainbow'], 0, 0), 'friend');
  assert.equal(nextUpgrade(['fly', 'big', 'rainbow'], 0, 3), 'bubble');
  assert.equal(nextUpgrade(['fly', 'big', 'rainbow', 'bubble'], 0, 3), 'basket');
  assert.equal(nextUpgrade(['fly', 'big', 'rainbow', 'friend'], 1, 1), 'bubble');
});

test('kostým z krámku: bez nákupu zamčený, po nákupu ho Rosinka hned má', async () => {
  const { characterLocked, costumeIndex, characterFor, CATEGORIES, optionCount, partSvg, normalizeCharacter, DEFAULT_CHARACTERS } = await import('../js/character.js');
  const { buy, shopItems } = await import('../js/shop.js');
  const knight = costumeIndex('costume-knight');
  assert.ok(knight > 0);
  assert.equal(characterLocked('costume', knight, []), true);
  assert.equal(characterLocked('costume', 1, []), false);
  const st = { stars: 3, room: [], pets: [], petItems: [], wardrobe: [], characters: { child: { ...DEFAULT_CHARACTERS.child } } };
  assert.ok(shopItems('castle', st).some((i) => i.id === 'costume-knight'));
  assert.equal(buy(st, 'costume-knight'), true);
  assert.equal(st.characters.child.costume, knight);
  assert.equal(characterLocked('costume', knight, st.wardrobe), false);
  assert.ok(!shopItems('castle', st).some((i) => i.id === 'costume-knight'));
  assert.ok(!characterFor('child', st.characters.child).includes('undefined'));
  const c = normalizeCharacter(DEFAULT_CHARACTERS.child);
  CATEGORIES.forEach(({ id }) => {
    for (let i = 0; i < optionCount(id, 'child'); i++) assert.ok(!partSvg(id, i, 'child', c).includes('undefined'), `${id} ${i}`);
  });
});

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { CATEGORIES, characterFor, hasColor, normalizeCharacter, optionCount, partSvg, randomCharacter } from '../js/character.js';

const KINDS = ['child', 'mom', 'dad'];

test('každá kategorie má aspoň 10 druhů pro každou postavu', () => {
  for (const kind of KINDS) {
    for (const { id } of CATEGORIES) assert.ok(optionCount(id, kind) >= 10, `${kind} ${id}`);
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
    for (const { id } of CATEGORIES) {
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
    for (const { id } of CATEGORIES) {
      for (let i = 0; i < optionCount(id, kind); i++) assert.ok(!partSvg(id, i, kind).includes('undefined'), `${id} ${i}`);
    }
    for (let n = 0; n < 50; n++) {
      const c = randomCharacter(kind, normalizeCharacter({ face: 0, hair: 0, dress: 0, shoes: 0, hat: 0 }));
      assert.ok(!characterFor(kind, c).includes('undefined'));
    }
  }
});

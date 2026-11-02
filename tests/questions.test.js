import test from 'node:test';
import assert from 'node:assert/strict';
import {
  LEVELS, SENTENCES, newProgress, pickQuestion, recordAnswer, itemStatus, setLevel,
} from '../js/questions.js';

const seeded = (seed) => () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const allItems = LEVELS.flatMap((l) => l.items);

test('10 levels and 55 unique questions', () => {
  assert.equal(LEVELS.length, 10);
  assert.equal(allItems.length, 55);
  assert.equal(new Set(allItems.map((i) => i.id)).size, 55);
});

test('78 sentences to record, each unique', () => {
  assert.equal(SENTENCES.length, 78);
  assert.equal(new Set(SENTENCES.map((s) => s.id)).size, 78);
});

test('every question has the right answer once and no repeated choice', () => {
  const rng = seeded(7);
  const p = newProgress();
  for (let n = 0; n < 3000; n++) {
    const q = pickQuestion(p, rng);
    const ids = q.choices.map((c) => c.id);
    assert.equal(new Set(ids).size, ids.length);
    assert.equal(ids.filter((id) => id === q.answerId).length, 1);
    assert.ok(ids.length >= 2 && ids.length <= LEVELS[p.level - 1].answers);
    recordAnswer(p, q.item.id, true);
  }
});

test('the same question never comes twice in a row', () => {
  const rng = seeded(11);
  const p = newProgress();
  let last = null;
  for (let n = 0; n < 2000; n++) {
    const q = pickQuestion(p, rng);
    assert.notEqual(q.item.id, last);
    last = q.item.id;
    recordAnswer(p, q.item.id, rng() > 0.3);
  }
});

test('level 1 asks only its 4 colours', () => {
  const p = newProgress();
  const rng = seeded(3);
  const ids = LEVELS[0].items.map((i) => i.id);
  for (let n = 0; n < 50; n++) assert.ok(ids.includes(pickQuestion(p, rng).item.id));
});

test('a level ends after each new item is right twice on the first try', () => {
  const p = newProgress();
  for (const item of LEVELS[0].items.slice(0, 3)) {
    recordAnswer(p, item.id, true);
    recordAnswer(p, item.id, true);
  }
  assert.equal(p.level, 1);
  const lastItem = LEVELS[0].items[3];
  assert.equal(recordAnswer(p, lastItem.id, true).levelUp, false);
  assert.equal(recordAnswer(p, lastItem.id, true).levelUp, true);
  assert.equal(p.level, 2);
});

test('a right answer after a mistake does not count as first try', () => {
  const p = newProgress();
  const id = LEVELS[0].items[0].id;
  recordAnswer(p, id, false);
  recordAnswer(p, id, false);
  assert.equal(itemStatus(p, LEVELS[0].items[0]), 'learning');
});

test('an item with a mistake comes back soon', () => {
  const p = newProgress();
  setLevel(p, 5);
  const rng = seeded(21);
  const target = LEVELS[4].items[0];
  recordAnswer(p, target.id, false);
  let found = false;
  for (let n = 0; n < 4; n++) {
    const q = pickQuestion(p, rng);
    if (q.item.id === target.id) found = true;
    recordAnswer(p, q.item.id, true);
  }
  assert.ok(found);
});

test('on level 5, about 3 of 10 questions are new', () => {
  const p = newProgress();
  setLevel(p, 5);
  const rng = seeded(5);
  const newIds = LEVELS[4].items.map((i) => i.id);
  let fresh = 0;
  for (let n = 0; n < 1000; n++) {
    if (newIds.includes(pickQuestion(p, rng).item.id)) fresh++;
  }
  assert.ok(fresh > 200 && fresh < 400, `new: ${fresh}`);
});

test('level never goes above 10 and the game keeps asking', () => {
  const p = newProgress();
  const rng = seeded(9);
  for (const item of allItems) { recordAnswer(p, item.id, true); recordAnswer(p, item.id, true); }
  assert.equal(p.level, 10);
  assert.equal(itemStatus(p, allItems[0]), 'known');
  assert.ok(pickQuestion(p, rng).choices.length >= 2);
});

test('sound questions show animals as answers', () => {
  const p = newProgress();
  setLevel(p, 10);
  const rng = seeded(13);
  let n = 0;
  while (n < 20) {
    const q = pickQuestion(p, rng);
    if (q.item.cat === 'sound') {
      n++;
      assert.ok(q.choices.every((c) => c.id.startsWith('animal-')));
      assert.equal(q.answerId, q.item.answerId);
    }
    recordAnswer(p, q.item.id, true);
  }
});

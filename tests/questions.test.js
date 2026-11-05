import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ALL_ITEMS, SENTENCES, TRACKS, itemStatus, newProgress, normalizeProgress, pickQuestion, playLevel, recordAnswer, setStage, stageOf,
} from '../js/questions.js';
import { artKeys, artSvg } from '../js/art.js';

const seeded = (seed) => () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const master = (p, item) => { recordAnswer(p, item.id, true); recordAnswer(p, item.id, true); };

test('6 stop, 59 otázek, každé id jednou', () => {
  assert.equal(TRACKS.length, 6);
  assert.equal(ALL_ITEMS.length, 59);
  assert.equal(new Set(ALL_ITEMS.map((i) => i.id)).size, 59);
});

test('staré id otázek zůstala, aby platily nahrávky', () => {
  const ids = new Set(ALL_ITEMS.map((i) => i.id));
  ['color-red', 'animal-rabbit', 'thing-spoon', 'shape-heart', 'size-big', 'count-3', 'sound-monkey'].forEach((id) => assert.ok(ids.has(id), id));
});

test('každá věta má češtinu i angličtinu a jedinečný klíč', () => {
  const keys = SENTENCES.map((s) => s.key);
  assert.equal(new Set(keys).size, keys.length);
  const cs = SENTENCES.filter((s) => s.lang === 'cs');
  const en = SENTENCES.filter((s) => s.lang === 'en');
  assert.equal(cs.length, en.filter((s) => !s.id.startsWith('word-')).length);
  cs.forEach((s) => assert.ok(en.some((e) => e.id === s.id && e.text), s.id));
  assert.ok(cs.every((s) => s.key === s.id), 'česká věta má starý klíč');
  ALL_ITEMS.forEach((i) => assert.ok(SENTENCES.some((s) => s.key === `en:word-${i.answerId ?? i.id}`), i.id));
});

test('každý obrázek otázky existuje', () => {
  const keys = new Set(artKeys());
  ALL_ITEMS.filter((i) => i.art).forEach((i) => {
    const svg = artSvg(i.art, '#123456');
    assert.ok(svg.includes('<svg') && !svg.includes('undefined'), i.art);
    if (!i.art.includes(':')) assert.ok(keys.has(i.art), i.art);
  });
});

test('tvar dostane barvu otázky', () => {
  assert.ok(artSvg('shape:triangle', '#123456').includes('#123456'));
});

test('každá otázka má správnou odpověď jednou a žádnou dvakrát', () => {
  const rng = seeded(7);
  const p = newProgress();
  for (let n = 0; n < 4000; n++) {
    const q = pickQuestion(p, rng);
    const ids = q.choices.map((c) => c.id);
    assert.equal(new Set(ids).size, ids.length);
    assert.equal(ids.filter((id) => id === q.answerId).length, 1);
    assert.ok(ids.length >= 2 && ids.length <= 4);
    recordAnswer(p, q.item.id, true);
  }
  TRACKS.forEach((t) => assert.equal(stageOf(p, t.id), t.stages.length, t.id));
});

test('stejná otázka nikdy dvakrát za sebou', () => {
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

test('na začátku se ptá jen na 4 barvy', () => {
  const p = newProgress();
  const rng = seeded(3);
  const ids = TRACKS[0].stages[0].items.map((i) => i.id);
  for (let n = 0; n < 50; n++) assert.ok(ids.includes(pickQuestion(p, rng).item.id));
});

test('po 4 umíněných barvách se posune stopa a otevřou se zvířata', () => {
  const p = newProgress();
  const colors = TRACKS[0].stages[0].items;
  colors.slice(0, 3).forEach((i) => master(p, i));
  assert.equal(stageOf(p, 'colors'), 1);
  assert.equal(recordAnswer(p, colors[3].id, true).levelUp, false);
  assert.equal(recordAnswer(p, colors[3].id, true).levelUp, true);
  assert.equal(stageOf(p, 'colors'), 2);
  assert.equal(stageOf(p, 'animals'), 1);
});

test('správně až po chybě se nepočítá jako napoprvé', () => {
  const p = newProgress();
  const item = ALL_ITEMS[0];
  recordAnswer(p, item.id, false);
  recordAnswer(p, item.id, false);
  assert.equal(itemStatus(p, item), 'learning');
});

test('pojem s chybou se brzy vrátí', () => {
  const p = newProgress();
  setStage(p, 'animals', 2);
  const rng = seeded(21);
  const target = TRACKS[1].stages[1].items[0];
  recordAnswer(p, target.id, false);
  let found = false;
  for (let n = 0; n < 4; n++) {
    const q = pickQuestion(p, rng);
    if (q.item.id === target.id) found = true;
    recordAnswer(p, q.item.id, true);
  }
  assert.ok(found);
});

test('vypnutá stopa se neptá', () => {
  const p = newProgress();
  setStage(p, 'animals', 3);
  setStage(p, 'colors', 0);
  const rng = seeded(5);
  for (let n = 0; n < 300; n++) {
    const q = pickQuestion(p, rng);
    assert.notEqual(q.item.track, 'colors');
    recordAnswer(p, q.item.id, true);
  }
  assert.equal(stageOf(p, 'colors'), 1, 'vypnutá stopa se sama neotevře');
});

test('zvuky mají za odpověď zvířata', () => {
  const p = newProgress();
  setStage(p, 'animals', 4);
  setStage(p, 'colors', 0);
  const rng = seeded(13);
  let n = 0;
  while (n < 20) {
    const q = pickQuestion(p, rng);
    if (q.item.cat === 'sound') {
      n++;
      assert.ok(q.choices.every((c) => c.id.startsWith('animal-')));
      assert.equal(q.choices.length, 4);
    }
    recordAnswer(p, q.item.id, true);
  }
});

test('auta v barvách mají za odpověď jen auta', () => {
  const p = newProgress();
  setStage(p, 'colors', 4);
  const rng = seeded(17);
  let n = 0;
  while (n < 10) {
    const q = pickQuestion(p, rng);
    if (q.item.cat === 'car') {
      n++;
      assert.ok(q.choices.every((c) => c.id.startsWith('car-')));
    }
    recordAnswer(p, q.item.id, true);
  }
});

test('starý postup (úroveň 7) se převede na stopy a nic neztratí', () => {
  const old = { level: 7, items: { 'color-red': { right: 3, wrong: 0, firstTry: 3 } }, due: [{ id: 'gone', wait: 1 }], last: null };
  const p = normalizeProgress(old);
  assert.deepEqual(p.stages, { colors: 3, animals: 2, things: 1, shapes: 1, opposites: 1 });
  assert.equal(p.items['color-red'].firstTry, 3);
  assert.deepEqual(p.due, []);
  assert.equal(p.level, undefined);
  assert.equal(playLevel(p), 8);
});

test('nový hráč má úroveň světa 1', () => {
  assert.equal(playLevel(normalizeProgress(undefined)), 1);
});

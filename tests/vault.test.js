import test from 'node:test';
import assert from 'node:assert/strict';
import { lock, newPassword, unlock } from '../js/vault.js';
import { makeZip, readZip } from '../js/zip.js';

test('ZIP zamčený heslem jde odemknout jen správným heslem', async () => {
  const zip = makeZip([{ name: 'mom__cs__bum.mp3', data: new Uint8Array([1, 2, 3, 4]) }]);
  const pw = newPassword();
  const sealed = await lock(zip, pw);
  assert.ok(!Buffer.from(sealed).includes(Buffer.from('mom__cs__bum')), 'jména souborů nejsou vidět');
  const back = await readZip(await unlock(sealed, pw));
  assert.deepEqual(back.map((e) => e.name), ['mom__cs__bum.mp3']);
  await assert.rejects(unlock(sealed, 'spatne-heslo'));
});

test('heslo má 4 skupiny po 5 písmenech a pokaždé jiné', () => {
  const a = newPassword();
  assert.match(a, /^[a-z]{5}(-[a-z]{5}){3}$/);
  assert.notEqual(a, newPassword());
});

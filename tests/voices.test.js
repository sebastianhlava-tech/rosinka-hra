import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { SENTENCES, parseVoiceFile, voiceFileName } from '../js/questions.js';
import { makeZip, readZip } from '../js/zip.js';

const bufferOf = (u8) => u8.buffer.slice(u8.byteOffset, u8.byteOffset + u8.byteLength);

test('jméno souboru s hlasem jde tam i zpět pro každou větu', () => {
  for (const s of SENTENCES) {
    const found = parseVoiceFile(`hlasy/${voiceFileName('dad', s, 'mp3')}`);
    assert.deepEqual(found, { kind: 'dad', key: s.key });
  }
});

test('cizí soubory se nenačtou', () => {
  ['foto.jpg', 'mom__cs__neznama-veta.mp3', 'babi__cs__color-red.mp3', '.DS_Store'].forEach((n) => assert.equal(parseVoiceFile(n), null, n));
});

test('ZIP ze hry se přečte zpět beze změny', async () => {
  const entries = [
    { name: 'mom__cs__color-red.mp3', data: new Uint8Array([1, 2, 3, 250]) },
    { name: 'dad__en__word-animal-dog.mp3', data: new Uint8Array(5000).map((_, i) => i % 256) },
  ];
  const back = await readZip(bufferOf(makeZip(entries)));
  assert.deepEqual(back.map((e) => e.name), entries.map((e) => e.name));
  back.forEach((e, i) => assert.deepEqual(e.data, entries[i].data));
});

test('ZIP z Macu (komprese) se přečte a skryté soubory se přeskočí', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'rosinka-'));
  const text = 'ahoj '.repeat(400);
  writeFileSync(join(dir, 'mom__cs__bum.mp3'), text);
  writeFileSync(join(dir, '.DS_Store'), 'x');
  execFileSync('zip', ['-q', '-9', 'out.zip', 'mom__cs__bum.mp3', '.DS_Store'], { cwd: dir });
  const back = await readZip(bufferOf(new Uint8Array(readFileSync(join(dir, 'out.zip')))));
  assert.deepEqual(back.map((e) => e.name), ['mom__cs__bum.mp3']);
  assert.equal(new TextDecoder().decode(back[0].data), text);
});

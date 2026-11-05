// Vytvoří hlasy maminky a tatínka přes ElevenLabs pro všechny věty hry.
//
// Použití (v Terminálu, ve složce hry):
//   node tools/make-voices.mjs                         jen ukáže, kolik vět chybí a kolik znaků to stojí
//   node tools/make-voices.mjs --go                    vytvoří chybějící věty a ZIP pro iPad
//   node tools/make-voices.mjs --skip nahravky.zip     přeskočí věty, které už máte nahrané sami
//
// Potřebuje proměnné prostředí (klíč nikdy nepatří do kódu):
//   ELEVENLABS_API_KEY   klíč z ElevenLabs
//   ELEVEN_VOICE_MOM     id klonu hlasu maminky (může chybět)
//   ELEVEN_VOICE_DAD     id klonu hlasu tatínka (může chybět)
//   ELEVEN_MODEL         model, výchozí eleven_multilingual_v2
//
// Výsledek je ve složce voices/. Ta se nikdy nenahraje na GitHub.
// Do iPadu jde jen soubor voices/rosinka-hlasy.zip (AirDrop nebo iCloud, potom Načíst hlasy).

import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { SENTENCES, parseVoiceFile, voiceFileName } from '../js/questions.js';
import { makeZip, readZip } from '../js/zip.js';

const OUT = new URL('../voices/', import.meta.url).pathname;
const ZIP = join(OUT, 'rosinka-hlasy.zip');
const args = process.argv.slice(2);
const go = args.includes('--go');
const model = process.env.ELEVEN_MODEL || 'eleven_multilingual_v2';
const voices = { mom: process.env.ELEVEN_VOICE_MOM, dad: process.env.ELEVEN_VOICE_DAD };

async function skipped() {
  const keys = new Set();
  args.forEach((a, i) => { if (a === '--skip' && args[i + 1]) keys.add(args[i + 1]); });
  const own = new Set();
  for (const file of keys) {
    const buf = readFileSync(file);
    for (const { name } of await readZip(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.length))) {
      const found = parseVoiceFile(name);
      if (found) own.add(`${found.kind}:${found.key}`);
    }
  }
  return own;
}

async function speak(voiceId, text) {
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`, {
    method: 'POST',
    headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY, 'content-type': 'application/json' },
    body: JSON.stringify({ text, model_id: model, voice_settings: { stability: 0.55, similarity_boost: 0.85 } }),
  });
  if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${await res.text()}`);
  return new Uint8Array(await res.arrayBuffer());
}

const own = await skipped();
const kinds = Object.keys(voices).filter((k) => voices[k]);
if (!kinds.length) {
  console.log('Chybí ELEVEN_VOICE_MOM nebo ELEVEN_VOICE_DAD. Nastav aspoň jeden.');
  process.exit(1);
}

mkdirSync(OUT, { recursive: true });
const todo = kinds.flatMap((kind) => SENTENCES
  .filter((s) => !own.has(`${kind}:${s.key}`))
  .map((s) => ({ kind, s, file: join(OUT, voiceFileName(kind, s, 'mp3')) }))
  .filter((t) => !existsSync(t.file)));
const chars = todo.reduce((n, t) => n + t.s.text.length, 0);

console.log(`Hlasy: ${kinds.join(', ')}. Model: ${model}.`);
console.log(`Chybí ${todo.length} vět, celkem ${chars} znaků.`);
if (own.size) console.log(`Přeskočeno ${own.size} vět, které máte nahrané sami.`);

if (!go) {
  console.log('Nic jsem nevytvořil. Pro vytvoření přidej --go.');
  process.exit(0);
}
if (!process.env.ELEVENLABS_API_KEY) {
  console.log('Chybí ELEVENLABS_API_KEY.');
  process.exit(1);
}

let done = 0;
for (const { kind, s, file } of todo) {
  writeFileSync(file, await speak(voices[kind], s.text));
  done++;
  console.log(`${done}/${todo.length} ${kind} ${s.lang}: ${s.text}`);
}

const entries = readdirSync(OUT).filter((f) => f.endsWith('.mp3') && parseVoiceFile(f))
  .map((name) => ({ name, data: new Uint8Array(readFileSync(join(OUT, name))) }));
writeFileSync(ZIP, makeZip(entries));
console.log(`Hotovo. ZIP pro iPad: ${ZIP} (${entries.length} vět).`);

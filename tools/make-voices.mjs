// Vytvoří hlasy maminky a tatínka přes ElevenLabs pro všechny věty hry.
//
// Použití (v Terminálu, ve složce hry):
//   node tools/make-voices.mjs                         jen ukáže, co udělá a kolik znaků to stojí
//   node tools/make-voices.mjs --go                    udělá klon hlasu, chybějící věty a ZIP pro iPad
//   node tools/make-voices.mjs --skip nahravky.zip     přidá další ZIP s vlastními nahrávkami
//
// Vlastní nahrávky hledá ve Stažených (rosinka-maminka-nahravky.zip, rosinka-tatinek-nahravky.zip).
// Z nich udělá klon hlasu a Voice ID si uloží do voices/voice-ids.json. Věty, které máte nahrané, přeskočí.
// Na API klíč se zeptá (při psaní není vidět). Klíč nikdy nepatří do kódu. Volitelné proměnné prostředí:
//   ELEVENLABS_API_KEY   klíč z ElevenLabs
//   ELEVEN_VOICE_MOM     id hotového klonu hlasu maminky
//   ELEVEN_VOICE_DAD     id hotového klonu hlasu tatínka
//   ELEVEN_MODEL         model, výchozí eleven_multilingual_v2
//
// Výsledek je ve složce voices/. Ta se nikdy nenahraje na GitHub.
// Do iPadu jde jen soubor voices/rosinka-hlasy.zip (AirDrop nebo iCloud, potom Načíst hlasy).

import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { SENTENCES, parseVoiceFile, voiceFileName } from '../js/questions.js';
import { makeZip, readZip } from '../js/zip.js';

const OUT = new URL('../voices/', import.meta.url).pathname;
const ZIP = join(OUT, 'rosinka-hlasy.zip');
const args = process.argv.slice(2);
const go = args.includes('--go');
const model = process.env.ELEVEN_MODEL || 'eleven_multilingual_v2';

// Zeptá se tak, že není vidět, co člověk píše.
function askHidden(question) {
  return new Promise((resolve) => {
    const { stdin } = process;
    let answer = '';
    process.stdout.write(question);
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');
    const onData = (chunk) => {
      for (const ch of chunk) {
        if (ch === '\u0003') process.exit(1);
        if (ch === '\r' || ch === '\n') {
          stdin.setRawMode(false);
          stdin.pause();
          stdin.off('data', onData);
          process.stdout.write('\n');
          resolve(answer.trim());
          return;
        }
        answer = ch === '\u007f' ? answer.slice(0, -1) : answer + ch;
      }
    };
    stdin.on('data', onData);
  });
}

const env = process.env;
const IDS = join(OUT, 'voice-ids.json');
const DOWNLOADS = join(homedir(), 'Downloads');
const OWN_ZIPS = { mom: 'rosinka-maminka-nahravky.zip', dad: 'rosinka-tatinek-nahravky.zip' };
const VOICE_NAMES = { mom: 'Rosinka maminka', dad: 'Rosinka tatínek' };
const MAX_SAMPLES = 25;

async function zipEntries(file) {
  const buf = readFileSync(file);
  return (await readZip(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.length)))
    .map((e) => ({ ...e, found: parseVoiceFile(e.name) }))
    .filter((e) => e.found);
}

// Vlastní nahrávky ze Stažených (ZIP z Pro rodiče) a ze všech --skip souborů.
const recordings = { mom: [], dad: [] };
for (const [kind, name] of Object.entries(OWN_ZIPS)) {
  if (existsSync(join(DOWNLOADS, name))) recordings[kind] = await zipEntries(join(DOWNLOADS, name));
}
for (const [i, a] of args.entries()) {
  if (a !== '--skip' || !args[i + 1]) continue;
  for (const e of await zipEntries(args[i + 1])) recordings[e.found.kind].push(e);
}
const own = new Set(Object.values(recordings).flat().map((e) => `${e.found.kind}:${e.found.key}`));

const saved = existsSync(IDS) ? JSON.parse(readFileSync(IDS, 'utf8')) : {};
const voices = { mom: env.ELEVEN_VOICE_MOM || saved.mom, dad: env.ELEVEN_VOICE_DAD || saved.dad };
const toClone = Object.keys(voices).filter((k) => !voices[k] && recordings[k].length);

// Udělá klon hlasu z nejdelších nahrávek. Vrátí Voice ID.
async function cloneVoice(kind) {
  const samples = [...recordings[kind]].sort((a, b) => b.data.length - a.data.length).slice(0, MAX_SAMPLES);
  const form = new FormData();
  form.append('name', VOICE_NAMES[kind]);
  form.append('description', 'Hlas pro hru Rosinka');
  for (const e of samples) form.append('files', new Blob([e.data], { type: e.name.endsWith('webm') ? 'audio/webm' : 'audio/mp4' }), e.name);
  const res = await fetch('https://api.elevenlabs.io/v1/voices/add', {
    method: 'POST',
    headers: { 'xi-api-key': env.ELEVENLABS_API_KEY },
    body: form,
  });
  if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${await res.text()}`);
  return (await res.json()).voice_id;
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

const kinds = Object.keys(voices).filter((k) => voices[k] || toClone.includes(k));
if (!kinds.length) {
  console.log(`Nenašel jsem nahrávky ve složce Stažené (${Object.values(OWN_ZIPS).join(', ')}).`);
  console.log('Na iPadu v Pro rodiče ťukni na Stáhnout nahrávky a pošli ZIP přes AirDrop do Macu.');
  process.exit(1);
}

mkdirSync(OUT, { recursive: true });
const todo = kinds.flatMap((kind) => SENTENCES
  .filter((s) => !own.has(`${kind}:${s.key}`))
  .map((s) => ({ kind, s, file: join(OUT, voiceFileName(kind, s, 'mp3')) }))
  .filter((t) => !existsSync(t.file)));
const chars = todo.reduce((n, t) => n + t.s.text.length, 0);

console.log(`Hlasy: ${kinds.join(', ')}. Model: ${model}.`);
for (const kind of toClone) console.log(`Klon hlasu ${kind} se udělá z ${Math.min(recordings[kind].length, MAX_SAMPLES)} nahrávek.`);
console.log(`Chybí ${todo.length} vět, celkem ${chars} znaků.`);
if (own.size) console.log(`Počet vět, které máte nahrané sami: ${own.size}. Ty přeskočím.`);

if (!go) {
  console.log('Nic jsem nevytvořil. Pro vytvoření přidej --go.');
  process.exit(0);
}
if (!env.ELEVENLABS_API_KEY && process.stdin.isTTY) {
  env.ELEVENLABS_API_KEY = await askHidden('API klíč z ElevenLabs (při psaní není vidět): ');
}
if (!env.ELEVENLABS_API_KEY) {
  console.log('Chybí ELEVENLABS_API_KEY.');
  process.exit(1);
}

for (const kind of toClone) {
  try {
    voices[kind] = await cloneVoice(kind);
  } catch (e) {
    console.log(`Chyba při klonu hlasu: ${e.message}`);
    console.log('Zkontroluj API klíč (potřebuje právo Voices) a placený tarif Starter.');
    process.exit(1);
  }
  saved[kind] = voices[kind];
  writeFileSync(IDS, JSON.stringify(saved, null, 2));
  console.log(`Klon hlasu ${kind} je hotový.`);
}

let done = 0;
for (const { kind, s, file } of todo) {
  try {
    writeFileSync(file, await speak(voices[kind], s.text));
  } catch (e) {
    console.log(`Chyba: ${e.message}`);
    console.log('Zkontroluj API klíč a Voice ID. Hotové věty zůstaly ve složce voices/. Další spuštění udělá jen zbytek.');
    process.exit(1);
  }
  done++;
  console.log(`${done}/${todo.length} ${kind} ${s.lang}: ${s.text}`);
}

const entries = readdirSync(OUT).filter((f) => f.endsWith('.mp3') && parseVoiceFile(f))
  .map((name) => ({ name, data: new Uint8Array(readFileSync(join(OUT, name))) }));
writeFileSync(ZIP, makeZip(entries));
console.log(`Hotovo. ZIP pro iPad: ${ZIP} (${entries.length} vět).`);

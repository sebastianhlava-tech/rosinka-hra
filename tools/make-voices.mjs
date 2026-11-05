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
//   node tools/make-voices.mjs --password              ukáže heslo k hlasům pro iPad
//   node tools/make-voices.mjs --lock                  jen znovu zašifruje hotový ZIP
//
// Čisté hlasy jsou ve složce voices/. Ta se nikdy nenahraje na GitHub.
// Do repa jde jen voices.enc (ZIP zamčený heslem) a voices.json (verze a počet vět).
// iPad si voices.enc stáhne sám a odemkne ho heslem, které rodič zadá jednou.

import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { SENTENCES, parseVoiceFile, voiceFileName } from '../js/questions.js';
import { lock, newPassword } from '../js/vault.js';
import { makeZip, readZip } from '../js/zip.js';

const OUT = fileURLToPath(new URL('../voices/', import.meta.url));
const ZIP = join(OUT, 'rosinka-hlasy.zip');
const ENC = fileURLToPath(new URL('../voices.enc', import.meta.url));
const INFO = fileURLToPath(new URL('../voices.json', import.meta.url));
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
      // Vložení (Cmd+V) přidá neviditelné značky. Ty se do klíče nesmí dostat.
      for (const ch of chunk.replace(/\x1b\[20[01]~/g, '')) {
        if (ch === '\u0003') process.exit(1);
        if (ch === '\r' || ch === '\n') {
          stdin.setRawMode(false);
          stdin.pause();
          stdin.off('data', onData);
          process.stdout.write('\n');
          resolve(answer.trim());
          return;
        }
        if (ch === '\u007f') answer = answer.slice(0, -1);
        else if (ch >= ' ') answer += ch;
      }
    };
    stdin.on('data', onData);
  });
}

const env = process.env;

// API klíč a heslo k hlasům jsou jen v Klíčence na Macu (Keychain), nikdy v souborech hry.
const KEYCHAIN = ['-s', 'rosinka-elevenlabs', '-a', 'elevenlabs'];
const PASSWORD = ['-s', 'rosinka-voices', '-a', 'rosinka'];
function keychainRead(entry) {
  try {
    return execFileSync('security', ['find-generic-password', ...entry, '-w'], { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  } catch {
    return '';
  }
}
const keychainKey = () => keychainRead(KEYCHAIN);

// Heslo k zašifrovaným hlasům. Poprvé ho skript vymyslí a uloží do Klíčenky.
function voicesPassword() {
  let pw = keychainRead(PASSWORD);
  if (!pw) {
    pw = newPassword();
    execFileSync('security', ['add-generic-password', '-U', ...PASSWORD, '-w', pw]);
    console.log('Vytvořil jsem heslo k hlasům. Ukáže ho: node tools/make-voices.mjs --password');
  }
  return pw;
}

// Zamkne ZIP heslem a uloží ho do repa jako voices.enc. Bez hesla ho nikdo neotevře.
async function publish(zip, count) {
  writeFileSync(ENC, await lock(zip, voicesPassword()));
  writeFileSync(INFO, `${JSON.stringify({ version: new Date().toISOString(), count })}\n`);
  console.log('Zašifrované hlasy jsou v voices.enc. Po nahrání na GitHub si je iPad stáhne sám.');
}

// --password: ukáže heslo k hlasům, aby šlo zadat do iPadu.
if (args.includes('--password')) {
  console.log(`Heslo k hlasům: ${voicesPassword()}`);
  console.log('Zadej ho v iPadu: Pro rodiče, Hlas z ElevenLabs, Heslo k hlasům.');
  process.exit(0);
}

// --lock: jen znovu zašifruje hotový ZIP. Nic nestojí.
if (args.includes('--lock')) {
  if (!existsSync(ZIP)) {
    console.log('Chybí voices/rosinka-hlasy.zip. Nejdřív spusť skript s --go.');
    process.exit(1);
  }
  const zip = new Uint8Array(readFileSync(ZIP));
  await publish(zip, (await readZip(zip.buffer)).length);
  process.exit(0);
}
async function askKey() {
  const key = await askHidden('Vlož API klíč z ElevenLabs a stiskni Enter (při psaní není vidět): ');
  if (key) execFileSync('security', ['add-generic-password', '-U', ...KEYCHAIN, '-w', key]);
  return key;
}

// --key: uloží klíč do Klíčenky a ukáže tarif. Nic nevytváří.
if (args.includes('--key')) {
  const key = await askKey();
  if (!key) process.exit(1);
  const get = (path) => fetch(`https://api.elevenlabs.io${path}`, { headers: { 'xi-api-key': key } });
  const voicesRes = await get('/v1/voices');
  if (!voicesRes.ok) {
    console.log(`Klíč je uložený, ale ElevenLabs ho odmítl (${voicesRes.status}).`);
    console.log((await voicesRes.json().catch(() => ({}))).detail?.message ?? 'Zkontroluj klíč.');
    process.exit(1);
  }
  console.log('Klíč je uložený v Klíčence a funguje.');
  const res = await get('/v1/user/subscription');
  if (res.ok) {
    const sub = await res.json();
    console.log(`Tarif: ${sub.tier}. Znaky tento měsíc: ${sub.character_count} z ${sub.character_limit}.`);
    console.log(sub.can_use_instant_voice_cloning ? 'Klon hlasu: ano.' : 'Klon hlasu: ne. Potřebuješ tarif Starter.');
  } else {
    console.log('Tarif nevidím, protože klíč nemá právo User (čtení). Pro hlasy to není nutné.');
  }
  process.exit(0);
}

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
env.ELEVENLABS_API_KEY ||= keychainKey();
if (!env.ELEVENLABS_API_KEY && process.stdin.isTTY) env.ELEVENLABS_API_KEY = await askKey();
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
const zip = makeZip(entries);
writeFileSync(ZIP, zip);
console.log(`Hotovo. ZIP: ${ZIP} (${entries.length} vět).`);
await publish(zip, entries.length);

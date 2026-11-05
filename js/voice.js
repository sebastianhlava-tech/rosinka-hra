// Každá věta má dvě nahrávky: maminky a tatínka. Mluví ten, kdo je průvodce.
// Když jeho věta chybí, hraje nahrávka druhého rodiče a potom hlas tabletu.
// Věta je česky, nebo anglicky. Česká nahrávka má klíč jako dřív, takže staré nahrávky platí.
// Hlasy z ElevenLabs mají vlastní klíč „ai:…“, takže nikdy nepřepíšou vlastní nahrávku.
import { SENTENCES, parseVoiceFile, sentenceKey, voiceFileName } from './questions.js';
import { deleteClip, loadClips, saveClip } from './storage.js';
import { makeZip, readZip } from './zip.js';

const textOf = new Map(SENTENCES.map((s) => [s.key, s.text]));
const urls = new Map();
const audio = new Audio();
const kidAudio = new Audio();
let finishCurrent = null;
let audioCtx = null;
let speaker = 'mom';
let chimes = true;
let voiceLang = 'cs';

const clipKey = (kind, id) => `${kind}:${id}`;
const aiKey = (kind, id) => `ai:${kind}:${id}`;
const otherOf = (kind) => (kind === 'mom' ? 'dad' : 'mom');

export function setChimes(on) {
  chimes = on;
}

// Jazyk otázek: 'en' = anglicky, jinak česky.
export function setLang(lang) {
  voiceLang = lang === 'en' ? 'en' : 'cs';
}

export function setSpeaker(kind) {
  speaker = kind;
}

export async function initVoice() {
  try {
    const clips = await loadClips();
    clips.forEach((blob, id) => urls.set(id, URL.createObjectURL(blob)));
  } catch {
    // Bez IndexedDB zůstane hlas tabletu.
  }
}

// iPad pustí zvuk až po ťuknutí. Volá se z tlačítka Hrát.
export function unlockAudio() {
  for (const a of [audio, kidAudio]) {
    a.src = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';
    a.play().catch(() => {});
  }
  try {
    audioCtx ??= new (window.AudioContext || window.webkitAudioContext)();
    audioCtx.resume();
  } catch {
    audioCtx = null;
  }
  if (window.speechSynthesis) speechSynthesis.getVoices();
}

export function stopVoice() {
  audio.pause();
  window.speechSynthesis?.cancel();
  finishCurrent?.();
}

function speakFallback(text, lang, done) {
  if (!window.speechSynthesis) return done();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang === 'en' ? 'en-US' : 'cs-CZ';
  u.rate = 0.85;
  const voice = speechSynthesis.getVoices().find((v) => v.lang.startsWith(lang));
  if (voice) u.voice = voice;
  u.onend = done;
  u.onerror = done;
  speechSynthesis.speak(u);
}

// Vrací Promise, která skončí s koncem věty. Pojistka hru nezasekne, když zvuk selže.
export function say(id, kind = speaker, lang = voiceLang) {
  const key = sentenceKey(id, lang);
  stopVoice();
  return new Promise((resolve) => {
    const guard = setTimeout(() => finishCurrent?.(), 6000);
    finishCurrent = () => {
      clearTimeout(guard);
      finishCurrent = null;
      resolve();
    };
    const done = () => finishCurrent?.();
    // Pořadí: vlastní nahrávka, hlas z ElevenLabs, totéž od druhého rodiče, nakonec hlas tabletu.
    const other = otherOf(kind);
    const url = urls.get(clipKey(kind, key)) ?? urls.get(aiKey(kind, key)) ?? urls.get(clipKey(other, key)) ?? urls.get(aiKey(other, key));
    if (url) {
      audio.src = url;
      audio.onended = done;
      audio.onerror = done;
      audio.play().catch(done);
    } else {
      speakFallback(textOf.get(key) ?? '', lang, done);
    }
  });
}

export function chime(freq = 660) {
  if (!audioCtx || !chimes) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  const t = audioCtx.currentTime;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.08, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
  osc.connect(gain).connect(audioCtx.destination);
  osc.start(t);
  osc.stop(t + 0.35);
}

export const hasClip = (kind, id) => urls.has(clipKey(kind, id));
export const isSpeaking = () => finishCurrent !== null;

// Hlas Rosinky: krátké zvuky ve hře. Jsou jen v tomto tabletu a nikdy se neexportují.
export const KID_SOUNDS = [
  { key: 'jump', text: 'Skok, třeba „hop!“' },
  { key: 'bump', text: 'Náraz do překážky, třeba „bum!“ nebo „au!“' },
  { key: 'gift', text: 'Dárek, třeba „jé!“' },
];

// Přehraje zvuk Rosinky. Když není nahraný, vrátí null. Jinak Promise, která skončí s koncem zvuku.
export function kidSound(id) {
  const url = urls.get(clipKey('kid', id));
  if (!url) return null;
  return new Promise((resolve) => {
    const done = () => { clearTimeout(guard); resolve(); };
    const guard = setTimeout(done, 3000);
    kidAudio.src = url;
    kidAudio.onended = done;
    kidAudio.onerror = done;
    kidAudio.play().catch(done);
  });
}

// Nahrávání a mazání pracuje s klíčem věty (s.key), ne s id.
export async function removeClip(kind, sentence) {
  const key = clipKey(kind, sentence);
  await deleteClip(key);
  URL.revokeObjectURL(urls.get(key));
  urls.delete(key);
}

const pickMime = () => ['audio/mp4', 'audio/webm'].find((t) => window.MediaRecorder?.isTypeSupported(t)) ?? '';

export async function startRecording(kind, sentence) {
  const key = clipKey(kind, sentence);
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const mimeType = pickMime();
  const rec = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
  const chunks = [];
  rec.ondataavailable = (e) => chunks.push(e.data);
  const finished = new Promise((resolve) => {
    rec.onstop = async () => {
      stream.getTracks().forEach((t) => t.stop());
      const blob = new Blob(chunks, { type: rec.mimeType });
      await saveClip(key, blob);
      if (urls.has(key)) URL.revokeObjectURL(urls.get(key));
      urls.set(key, URL.createObjectURL(blob));
      resolve();
    };
  });
  rec.start();
  return () => {
    rec.stop();
    return finished;
  };
}

export const aiCount = (kind) => [...urls.keys()].filter((k) => k.startsWith(`ai:${kind}:`)).length;

// Vlastní nahrávky jednoho rodiče jako ZIP. Slouží jako vzorek hlasu pro ElevenLabs.
export async function exportRecordings(kind) {
  const clips = await loadClips();
  const entries = [];
  for (const s of SENTENCES) {
    const blob = clips.get(clipKey(kind, s.key));
    if (!blob) continue;
    const ext = blob.type.includes('webm') ? 'webm' : 'm4a';
    entries.push({ name: voiceFileName(kind, s, ext), data: new Uint8Array(await blob.arrayBuffer()) });
  }
  return entries.length ? new Blob([makeZip(entries)], { type: 'application/zip' }) : null;
}

// Načte hlasy z ElevenLabs: ZIP nebo jednotlivé soubory. Vrátí počet načtených vět.
export async function importVoices(files) {
  let saved = 0;
  for (const file of files) {
    const entries = file.name.toLowerCase().endsWith('.zip')
      ? await readZip(await file.arrayBuffer())
      : [{ name: file.name, data: new Uint8Array(await file.arrayBuffer()) }];
    for (const { name, data } of entries) {
      const found = parseVoiceFile(name);
      if (!found) continue;
      const key = aiKey(found.kind, found.key);
      const blob = new Blob([data], { type: 'audio/mpeg' });
      await saveClip(key, blob);
      if (urls.has(key)) URL.revokeObjectURL(urls.get(key));
      urls.set(key, URL.createObjectURL(blob));
      saved++;
    }
  }
  return saved;
}

// Smaže jen hlasy z ElevenLabs. Vlastní nahrávky zůstanou.
export async function removeAiVoices() {
  for (const key of [...urls.keys()].filter((k) => k.startsWith('ai:'))) {
    await deleteClip(key);
    URL.revokeObjectURL(urls.get(key));
    urls.delete(key);
  }
}

// Každá věta má dvě nahrávky: maminky a tatínka. Mluví ten, kdo je průvodce.
// Když jeho věta chybí, hraje nahrávka druhého rodiče a potom hlas tabletu.
import { SENTENCES } from './questions.js';
import { deleteClip, loadClips, saveClip } from './storage.js';

const textOf = new Map(SENTENCES.map((s) => [s.id, s.text]));
const urls = new Map();
const audio = new Audio();
let finishCurrent = null;
let audioCtx = null;
let speaker = 'mom';

const clipKey = (kind, id) => `${kind}:${id}`;
const otherOf = (kind) => (kind === 'mom' ? 'dad' : 'mom');

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
  audio.src = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';
  audio.play().catch(() => {});
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

function speakFallback(text, done) {
  if (!window.speechSynthesis) return done();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'cs-CZ';
  u.rate = 0.85;
  const czech = speechSynthesis.getVoices().find((v) => v.lang.startsWith('cs'));
  if (czech) u.voice = czech;
  u.onend = done;
  u.onerror = done;
  speechSynthesis.speak(u);
}

// Vrací Promise, která skončí s koncem věty. Pojistka hru nezasekne, když zvuk selže.
export function say(id, kind = speaker) {
  stopVoice();
  return new Promise((resolve) => {
    const guard = setTimeout(() => finishCurrent?.(), 6000);
    finishCurrent = () => {
      clearTimeout(guard);
      finishCurrent = null;
      resolve();
    };
    const done = () => finishCurrent?.();
    const url = urls.get(clipKey(kind, id)) ?? urls.get(clipKey(otherOf(kind), id));
    if (url) {
      audio.src = url;
      audio.onended = done;
      audio.onerror = done;
      audio.play().catch(done);
    } else {
      speakFallback(textOf.get(id) ?? '', done);
    }
  });
}

export function chime(freq = 660) {
  if (!audioCtx) return;
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

export async function removeClip(kind, id) {
  const key = clipKey(kind, id);
  await deleteClip(key);
  URL.revokeObjectURL(urls.get(key));
  urls.delete(key);
}

const pickMime = () => ['audio/mp4', 'audio/webm'].find((t) => window.MediaRecorder?.isTypeSupported(t)) ?? '';

export async function startRecording(kind, id) {
  const key = clipKey(kind, id);
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

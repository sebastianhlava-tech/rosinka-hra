// Nastavení je v localStorage. Nahrávky hlasu jsou v IndexedDB. Nic neopouští tablet.
import { newProgress, normalizeProgress } from './questions.js';
import { DEFAULT_CHARACTERS } from './character.js';

const KEY = 'rosinka-v1';

const defaults = () => ({
  characters: { child: null, mom: null, dad: null },
  guide: 'both',
  minutes: 5,
  difficulty: 'easy',
  lockNight: true,
  sounds: true,
  lang: 'cs',
  locked: false,
  shops: true,
  stars: 0,
  starBits: 0,
  room: [],
  voicePassword: '',
  voicesVersion: '',
  progress: newProgress(),
});

export function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    return { ...defaults(), ...saved, progress: normalizeProgress(saved?.progress) };
  } catch {
    return defaults();
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Bez úložiště hra běží dál, jen si nepamatuje postup.
  }
}

export const characterOf = (state, kind) => state.characters[kind] ?? DEFAULT_CHARACTERS[kind];

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('rosinka-voice', 1);
    req.onupgradeneeded = () => req.result.createObjectStore('clips');
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function withStore(mode, action) {
  return openDb().then((db) => new Promise((resolve, reject) => {
    const tx = db.transaction('clips', mode);
    const req = action(tx.objectStore('clips'));
    tx.oncomplete = () => resolve(req.result);
    tx.onerror = () => reject(tx.error);
  }));
}

// Safari spolehlivěji ukládá ArrayBuffer než Blob.
export async function saveClip(id, blob) {
  const data = await blob.arrayBuffer();
  await withStore('readwrite', (s) => s.put({ data, type: blob.type }, id));
}

export const deleteClip = (id) => withStore('readwrite', (s) => s.delete(id));

export async function loadClips() {
  const keys = await withStore('readonly', (s) => s.getAllKeys());
  const values = await withStore('readonly', (s) => s.getAll());
  return new Map(keys.map((id, i) => [id, new Blob([values[i].data], { type: values[i].type })]));
}

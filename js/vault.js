// Zašifrované hlasy: ZIP se zamkne heslem (AES-GCM, klíč z hesla přes PBKDF2).
// Soubor voices.enc je veřejně na webu, ale bez hesla je to jen šum.
// Funguje v prohlížeči i v Node (skript tools/make-voices.mjs).

const MAGIC = [82, 86, 49]; // „RV1“
const ROUNDS = 310000;

async function keyFrom(password, salt) {
  const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: ROUNDS, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}

// Uint8Array → Uint8Array: „RV1“ + sůl (16) + iv (12) + šifra.
export async function lock(data, password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const sealed = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await keyFrom(password, salt), data));
  const out = new Uint8Array(3 + 16 + 12 + sealed.length);
  out.set(MAGIC, 0);
  out.set(salt, 3);
  out.set(iv, 19);
  out.set(sealed, 31);
  return out;
}

// Vrátí ArrayBuffer se ZIP. Se špatným heslem vyhodí chybu.
export async function unlock(bytes, password) {
  const b = new Uint8Array(bytes);
  if (MAGIC.some((m, i) => b[i] !== m)) throw new Error('Not a voice file');
  return crypto.subtle.decrypt({ name: 'AES-GCM', iv: b.slice(19, 31) }, await keyFrom(password, b.slice(3, 19)), b.slice(31));
}

// Náhodné heslo: 4 skupiny po 5 písmenech, snadno se přepíše do iPadu.
export function newPassword() {
  const abc = 'abcdefghijkmnpqrstuvwxyz';
  const pick = crypto.getRandomValues(new Uint8Array(20));
  return Array.from({ length: 4 }, (_, g) => Array.from(pick.slice(g * 5, g * 5 + 5), (n) => abc[n % abc.length]).join('')).join('-');
}

// Encrypts the plaintext heatmap data so only ciphertext is committed.
// Usage: HEATMAP_PASSPHRASE='...' node scripts/encrypt-data.mjs data/heatmap-data.json data.enc.json
// Format matches the decryptor in index.html: PBKDF2-SHA256 -> AES-256-GCM.
import { readFileSync, writeFileSync } from 'node:fs';
import { webcrypto as crypto } from 'node:crypto';

const ITERATIONS = 600000;
const [, , input = 'data/heatmap-data.json', output = 'data.enc.json'] = process.argv;
const passphrase = process.env.HEATMAP_PASSPHRASE;
if (!passphrase || passphrase.length < 16) {
  console.error('Set HEATMAP_PASSPHRASE (at least 16 characters).');
  process.exit(1);
}

const b64 = (buf) => Buffer.from(buf).toString('base64');
const plaintext = readFileSync(input);
JSON.parse(plaintext); // fail early on malformed input

const salt = crypto.getRandomValues(new Uint8Array(16));
const iv = crypto.getRandomValues(new Uint8Array(12));
const baseKey = await crypto.subtle.importKey('raw', new TextEncoder().encode(passphrase), 'PBKDF2', false, ['deriveKey']);
const key = await crypto.subtle.deriveKey(
  { name: 'PBKDF2', hash: 'SHA-256', salt, iterations: ITERATIONS },
  baseKey,
  { name: 'AES-GCM', length: 256 },
  false,
  ['encrypt'],
);
const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plaintext);

writeFileSync(output, JSON.stringify({
  v: 1,
  kdf: 'PBKDF2-SHA256',
  iterations: ITERATIONS,
  cipher: 'AES-256-GCM',
  salt: b64(salt),
  iv: b64(iv),
  ct: b64(ciphertext),
}));
console.log(`Encrypted ${plaintext.length} bytes -> ${output}`);

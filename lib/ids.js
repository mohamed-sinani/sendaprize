const crypto = require('crypto');

const ALPHABET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

function randomCode(len = 6) {
  let out = '';
  const bytes = crypto.randomBytes(len);
  for (let i = 0; i < len; i++) out += ALPHABET[bytes[i] % ALPHABET.length];
  return out;
}

let _userCounter = null;

// Deterministic-ish increasing user id, seeded from existing users if possible.
async function nextUserId(store) {
  const files = await store.listFiles('database/users');
  let max = 0;
  for (const f of files) {
    const m = f.match(/^user_(\d+)\.json$/);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return `user_${String(max + 1).padStart(3, '0')}`;
}

function eventId() {
  return `event_${crypto.randomBytes(6).toString('hex')}`;
}

function nowIso() {
  return new Date().toISOString();
}

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`;
}

function sha256(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

module.exports = { randomCode, nextUserId, eventId, nowIso, todayKey, sha256 };

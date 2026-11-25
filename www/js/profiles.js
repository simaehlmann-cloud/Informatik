/* Profile, Passwörter (Regeln + sicheres Speichern), Klassen- und Abgabe-Codes */
'use strict';

/* ---------------- Base64url ---------------- */
const B64 = {
  enc(bytes) { let s = ''; bytes.forEach(b => { s += String.fromCharCode(b); }); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); },
  dec(str) {
    const s = String(str).replace(/-/g, '+').replace(/_/g, '/');
    const bin = atob(s + '==='.slice((s.length + 3) % 4));
    return Uint8Array.from(bin, c => c.charCodeAt(0));
  }
};
const randBytes = n => crypto.getRandomValues(new Uint8Array(n));
const newId = () => B64.enc(randBytes(6));
const cryptoOk = () => !!(window.crypto && crypto.getRandomValues);
const subtleOk = () => !!(window.crypto && crypto.subtle && typeof crypto.subtle.deriveBits === 'function');

/* ---------------- Reserve ohne crypto.subtle: SHA-256, HMAC, PBKDF2 in JavaScript ----------------
   Wird nur genutzt, wenn das Gerät keine eingebaute Web-Kryptografie anbietet. Ergebnisse sind identisch
   (validate.js vergleicht beide). */
const SHA = (() => {
  const K = new Uint32Array([0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2]);
  const W = new Uint32Array(64);
  function digest(msg) {
    const l = msg.length, nb = ((l + 9 + 63) >> 6) << 6;
    const m = new Uint8Array(nb); m.set(msg); m[l] = 0x80;
    const dv = new DataView(m.buffer); dv.setUint32(nb - 4, (l * 8) >>> 0); dv.setUint32(nb - 8, Math.floor(l / 0x20000000));
    let h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a, h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19;
    for (let o = 0; o < nb; o += 64) {
      for (let i = 0; i < 16; i++) W[i] = dv.getUint32(o + i * 4);
      for (let i = 16; i < 64; i++) {
        const a = W[i - 15], b = W[i - 2];
        W[i] = (W[i - 16] + (((a >>> 7) | (a << 25)) ^ ((a >>> 18) | (a << 14)) ^ (a >>> 3)) + W[i - 7] + (((b >>> 17) | (b << 15)) ^ ((b >>> 19) | (b << 13)) ^ (b >>> 10))) | 0;
      }
      let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;
      for (let i = 0; i < 64; i++) {
        const t1 = (h + (((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7))) + ((e & f) ^ (~e & g)) + K[i] + W[i]) | 0;
        const t2 = ((((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10))) + ((a & b) ^ (a & c) ^ (b & c))) | 0;
        h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
      }
      h0 = (h0 + a) | 0; h1 = (h1 + b) | 0; h2 = (h2 + c) | 0; h3 = (h3 + d) | 0; h4 = (h4 + e) | 0; h5 = (h5 + f) | 0; h6 = (h6 + g) | 0; h7 = (h7 + h) | 0;
    }
    const out = new Uint8Array(32), odv = new DataView(out.buffer);
    [h0, h1, h2, h3, h4, h5, h6, h7].forEach((v, i) => odv.setUint32(i * 4, v >>> 0));
    return out;
  }
  function hmac(key, msg) {
    if (key.length > 64) key = digest(key);
    const k = new Uint8Array(64); k.set(key);
    const ip = new Uint8Array(64 + msg.length), op = new Uint8Array(96);
    for (let i = 0; i < 64; i++) { ip[i] = k[i] ^ 0x36; op[i] = k[i] ^ 0x5c; }
    ip.set(msg, 64);
    op.set(digest(ip), 64);
    return digest(op);
  }
  function pbkdf2(pw, salt, iter) {
    const s1 = new Uint8Array(salt.length + 4); s1.set(salt); s1[salt.length + 3] = 1;
    let u = hmac(pw, s1);
    const t = u.slice();
    for (let i = 1; i < iter; i++) { u = hmac(pw, u); for (let j = 0; j < 32; j++) t[j] ^= u[j]; }
    return t;
  }
  return { digest, hmac, pbkdf2 };
})();

/* ---------------- Passwort sicher speichern: PBKDF2-SHA256 mit Salt ---------------- */
const PW_ITER = 120000;
async function pwHash(pw, saltB64, iter = PW_ITER) {
  const salt = saltB64 ? B64.dec(saltB64) : randBytes(16);
  const pwBytes = new TextEncoder().encode(String(pw).normalize('NFC'));
  let bits;
  if (subtleOk()) {
    const key = await crypto.subtle.importKey('raw', pwBytes, 'PBKDF2', false, ['deriveBits']);
    bits = new Uint8Array(await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: iter, hash: 'SHA-256' }, key, 256));
  } else {
    await sleep(30); // Oberfläche erst zeichnen lassen (Rechnung dauert ohne Hardware-Hilfe etwas)
    bits = SHA.pbkdf2(pwBytes, salt, iter);
  }
  return { salt: B64.enc(salt), hash: B64.enc(bits), iter };
}
async function pwVerify(pw, cred) {
  if (!cred) return false;
  const h = await pwHash(pw, cred.salt, cred.iter);
  // Vergleich ohne frühen Abbruch
  let diff = h.hash.length ^ cred.hash.length;
  for (let i = 0; i < Math.max(h.hash.length, cred.hash.length); i++) diff |= (h.hash.charCodeAt(i) || 0) ^ (cred.hash.charCodeAt(i) || 0);
  return diff === 0;
}

/* ---------------- Regeln für ein sicheres Passwort ---------------- */
const PW_COMMON = ['passwort', 'password', 'passw0rt', 'p@ssw0rt', 'hallo', 'hello', 'schule', 'school', 'fussball', 'fußball', 'football', 'qwertz', 'qwerty', 'iloveyou', 'ichliebedich', 'schatz', 'sommer', 'summer', 'winter',
  'admin', 'letmein', 'welcome', 'willkommen', 'master', 'monkey', 'dragon', 'sunshine', 'princess', 'prinzessin', 'freund', 'geheim', 'secret', 'login', 'test', 'baller', 'gaming', 'minecraft', 'pokemon', 'lehrer', 'teacher'];
const KEY_ROWS = ['qwertzuiopü', 'asdfghjklöä', 'yxcvbnm', 'qwertyuiop', 'asdfghjkl', 'zxcvbnm', '1234567890', '1qay2wsx3edc', 'qayxswedc'];
/** Folge von 3 Zeichen, die im Alphabet oder bei Ziffern auf- oder absteigen (123, 987, abc, zyx) */
function hasSequence(s) {
  const t = s.toLowerCase();
  for (let i = 0; i + 2 < t.length; i++) {
    const a = t.charCodeAt(i), b = t.charCodeAt(i + 1), c = t.charCodeAt(i + 2);
    const same = x => (/[0-9]/.test(String.fromCharCode(x)) ? 'd' : /[a-z]/.test(String.fromCharCode(x)) ? 'l' : 'x');
    if (same(a) === 'x' || same(a) !== same(b) || same(b) !== same(c)) continue;
    if ((b - a === 1 && c - b === 1) || (a - b === 1 && b - c === 1)) return true;
  }
  return false;
}
function hasKeyboardRow(s) {
  const t = s.toLowerCase();
  for (const row of KEY_ROWS) for (const r of [row, [...row].reverse().join('')]) for (let i = 0; i + 4 <= r.length; i++) if (t.includes(r.slice(i, i + 4))) return true;
  return false;
}
const charKinds = s => [/[a-zäöüß]/, /[A-ZÄÖÜ]/, /[0-9]/, /[^A-Za-zÄÖÜäöüß0-9]/].filter(r => r.test(s)).length;
/** Liefert alle Regeln mit Ergebnis. ctx.name: Profilname (darf nicht vorkommen) */
function pwRules(pw, ctx = {}) {
  const s = String(pw);
  const len = [...s].length;
  const name = String(ctx.name || '').toLowerCase().replace(/[^a-zäöüß]/g, '');
  return [
    { k: 'pwLen', ok: len >= 12 },  // wie im Lernbaustein „Sichere Passwörter“
    { k: 'pwKinds', ok: charKinds(s) >= 3 || len >= 16 },
    { k: 'pwSeq', ok: !hasSequence(s) },
    { k: 'pwRow', ok: !hasKeyboardRow(s) },
    { k: 'pwRepeat', ok: !/(.)\1\1/.test(s) },
    { k: 'pwCommon', ok: !PW_COMMON.some(w => s.toLowerCase().includes(w)) },
    { k: 'pwName', ok: name.length < 3 || !s.toLowerCase().includes(name) }
  ];
}
const pwOk = (pw, ctx) => pwRules(pw, ctx).every(r => r.ok);
/** Grobe Knack-Zeit in Sekunden (alle Möglichkeiten bei 10 Mrd. Versuchen/s), wie im Knack-Rechner */
function pwCrackSeconds(pw) {
  const s = String(pw);
  const n = [[/[a-zäöüß]/, 26], [/[A-ZÄÖÜ]/, 26], [/[0-9]/, 10], [/[^A-Za-zÄÖÜäöüß0-9]/, 33]].reduce((a, [r, k]) => a + (r.test(s) ? k : 0), 0);
  return Math.pow(n || 1, [...s].length) / 1e10;
}

/** Einmal-Passwort nach dem Zurücksetzen: zwei Wörter und eine Zahl, z. B. „Mond-Tiger-47“ */
const OTP_WORDS = ['Mond', 'Tiger', 'Wolke', 'Anker', 'Kompass', 'Birke', 'Komet', 'Falke', 'Insel', 'Laterne', 'Murmel', 'Pinguin', 'Rakete', 'Sonne', 'Vulkan', 'Zebra'];
function makeOtp() {
  const r = randBytes(3);
  let num = 10 + (r[2] % 90);
  const w1 = OTP_WORDS[r[0] % 16], w2 = OTP_WORDS[(r[1] % 15 + (r[0] % 16) + 1) % 16];
  if (hasSequence(String(num))) num = 47;
  return `${w1}-${w2}-${num}`;
}

/* ---------------- Sperre nach Fehlversuchen ---------------- */
function lockDelay(fails) { return fails < 5 ? 0 : Math.min(15 * 60, 30 * Math.pow(2, fails - 5)) * 1000; }

/* ---------------- Schuljahresende als Löschfrist: 31. Juli nach dem Anlegen ---------------- */
function schoolYearEnd(from = Date.now()) {
  const d = new Date(from);
  const y = d.getMonth() >= 7 ? d.getFullYear() + 1 : d.getFullYear(); // ab August → nächstes Jahr
  return new Date(y, 6, 31, 23, 59, 59).getTime();
}

/* ---------------- Klassen-Code ---------------- */
const CLASS_PREFIX = 'IWK.';
function classCode(c) {
  const json = JSON.stringify({ v: 1, id: c.id, n: c.name, k: c.key, r: c.roster || [], e: c.exp });
  return CLASS_PREFIX + B64.enc(new TextEncoder().encode(json));
}
function parseClassCode(text) {
  const s = String(text || '').trim();
  if (!s.startsWith(CLASS_PREFIX)) return null;
  try {
    const o = JSON.parse(new TextDecoder().decode(B64.dec(s.slice(CLASS_PREFIX.length))));
    if (o.v !== 1 || typeof o.id !== 'string' || typeof o.k !== 'string' || typeof o.n !== 'string') return null;
    return { id: o.id.slice(0, 40), name: o.n.slice(0, 60), key: o.k.slice(0, 60), roster: Array.isArray(o.r) ? o.r.filter(x => typeof x === 'string').map(x => x.slice(0, 40)).slice(0, 60) : [], exp: Number.isFinite(o.e) ? o.e : 0 };
  } catch (e) { return null; }
}

/* ---------------- Abgabe-Code: kompakt, mit Prüfsumme über den Klassenschlüssel ----------------
   Aufbau (Bytes): Version 2 | Klassen-ID (6) | Profil-ID (6) | Zeit in Minuten seit 2025 (4) | letzte Aktivität (4) | Namenslänge (1) | Name (UTF-8)
   | Anzahl Stationen N (1) | Sterne: je Station 3 Stufen × 2 Bit | je Station: Versuche (1), Fehler (2), Tipps (1), Minuten (2) | Prüfsumme (8) */
const RESULT_PREFIX = 'IW2.';
const EPOCH = Date.UTC(2025, 0, 1);
const toMin = ms => Math.max(0, Math.min(0xFFFFFFFF, Math.floor((ms - EPOCH) / 60000)));
const fromMin = m => EPOCH + m * 60000;
async function hmac8(keyB64, bytes) {
  if (!subtleOk()) return SHA.hmac(B64.dec(keyB64), bytes).slice(0, 8);
  const key = await crypto.subtle.importKey('raw', B64.dec(keyB64), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return new Uint8Array(await crypto.subtle.sign('HMAC', key, bytes)).slice(0, 8);
}
async function resultCode(profile, now = Date.now()) {
  const c = profile.cls;
  const order = STATION_ORDER;
  const name = new TextEncoder().encode(profile.name).slice(0, 40);
  const starBytes = Math.ceil(order.length * 6 / 8);
  const len = 1 + 6 + 6 + 4 + 4 + 1 + name.length + 1 + starBytes + order.length * 6;
  const b = new Uint8Array(len);
  const dv = new DataView(b.buffer);
  let o = 0;
  b[o++] = 2;
  b.set(B64.dec(c.id).slice(0, 6), o); o += 6;
  b.set(B64.dec(profile.id).slice(0, 6), o); o += 6;   // unterscheidet Kinder mit gleichem Namen
  dv.setUint32(o, toMin(now)); o += 4;
  dv.setUint32(o, toMin(profile.lastActive || now)); o += 4;
  b[o++] = name.length; b.set(name, o); o += name.length;
  b[o++] = order.length;
  order.forEach((sid, i) => [1, 2, 3].forEach((lvl, j) => {
    const v = profile.stars[sid + '@' + lvl] || 0, bit = (i * 3 + j) * 2;
    b[o + (bit >> 3)] |= v << (6 - (bit & 7));
  }));
  o += starBytes;
  for (const sid of order) {
    const s = profile.stats[sid] || { n: 0, e: 0, h: 0, t: 0 };
    b[o++] = Math.min(255, s.n);
    dv.setUint16(o, Math.min(65535, s.e)); o += 2;
    b[o++] = Math.min(255, s.h);
    dv.setUint16(o, Math.min(65535, Math.round(s.t / 60))); o += 2;
  }
  const mac = await hmac8(c.key, b);
  const all = new Uint8Array(b.length + 8); all.set(b); all.set(mac, b.length);
  return RESULT_PREFIX + B64.enc(all);
}
/** Liest einen Abgabe-Code. Gibt {klass, result} zurück oder {error}. classes: bekannte Klassen auf diesem Gerät. */
async function parseResultCode(text, classes) {
  const s = String(text || '').trim();
  if (!s.startsWith(RESULT_PREFIX)) return { error: 'codeUnknown' };
  let all;
  try { all = B64.dec(s.slice(RESULT_PREFIX.length)); } catch (e) { return { error: 'codeBroken' }; }
  if (all.length < 40) return { error: 'codeBroken' };
  if (all[0] !== 2) return { error: 'codeOld' };
  const b = all.slice(0, all.length - 8), mac = all.slice(all.length - 8);
  const cid = B64.enc(b.slice(1, 7));
  const klass = classes.find(c => B64.enc(B64.dec(c.id).slice(0, 6)) === cid);
  if (!klass) return { error: 'codeOtherClass' };
  const want = await hmac8(klass.key, b);
  if (want.some((x, i) => x !== mac[i])) return { error: 'codeBroken' };
  const dv = new DataView(b.buffer, b.byteOffset, b.byteLength);
  const pid = B64.enc(b.slice(7, 13));
  let o = 13;
  const at = fromMin(dv.getUint32(o)); o += 4;
  const last = fromMin(dv.getUint32(o)); o += 4;
  const nl = b[o++];
  const name = new TextDecoder().decode(b.slice(o, o + nl)); o += nl;
  const n = b[o++];
  if (b.length !== o + Math.ceil(n * 6 / 8) + n * 6) return { error: 'codeBroken' };
  const stars = {}, stats = {};
  for (let i = 0; i < n; i++) for (let j = 0; j < 3; j++) {
    const bit = (i * 3 + j) * 2;
    const v = (b[o + (bit >> 3)] >> (6 - (bit & 7))) & 3;
    if (v && STATION_ORDER[i]) stars[STATION_ORDER[i] + '@' + (j + 1)] = v;
  }
  o += Math.ceil(n * 6 / 8);
  for (let i = 0; i < n; i++) {
    const r = { n: b[o], e: dv.getUint16(o + 1), h: b[o + 3], t: dv.getUint16(o + 4) * 60, at: 0 };
    o += 6;
    if (r.n && STATION_ORDER[i]) stats[STATION_ORDER[i]] = r;
  }
  return { klass, result: { pid, name, at, last, stars, stats } };
}

/* ---------------- Auswertung ---------------- */
/** Bester Stern einer Station über alle Stufen bzw. für eine Stufe */
const bestStars = (stars, sid, lvl) => (lvl ? stars[sid + '@' + lvl] || 0 : Math.max(0, ...[1, 2, 3].map(l => stars[sid + '@' + l] || 0)));
/** Status einer Station: 0 offen, 1 noch üben, 2 sicher */
function stationStatus(stars, stats, sid, lvl) {
  const s = bestStars(stars, sid, lvl);
  if (!s) return 0;
  const st = stats[sid];
  const errRate = st && st.n ? st.e / st.n : 0;
  return s >= 2 && errRate < 4 ? 2 : 1;
}
function summarize(stars, stats, lvl) {
  const ids = CHAPTERS.flatMap(c => c.stations.map(s => s.id));
  const done = ids.filter(id => bestStars(stars, id, lvl) > 0).length;
  const starSum = ids.reduce((a, id) => a + bestStars(stars, id, lvl), 0);
  const tot = Object.values(stats).reduce((a, s) => ({ n: a.n + s.n, e: a.e + s.e, h: a.h + s.h, t: a.t + s.t }), { n: 0, e: 0, h: 0, t: 0 });
  return { done, total: ids.length, starSum, attempts: tot.n, errors: tot.e, hints: tot.h, minutes: Math.round(tot.t / 60) };
}

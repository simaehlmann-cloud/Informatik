/* Bit für Bit – Kern: Speicher, Sprache, DOM-Helfer, Symbole, Töne */
'use strict';

const APP = {
  name: 'Bit für Bit',
  version: '0.4.0',
  mail: 'smaehlmann.appdev@gmail.com'
};

/* ---------------- Speicher (nur auf diesem Gerät) ----------------
   Gerät: Sprache, Darstellung, Modus (Zuhause/Schule), Zugang Eltern/Lehrkraft, Profile, Klassen.
   Profil: Stufe, Sterne, Statistik je Station. Angemeldet ist ein Profil nur für die laufende Sitzung. */
const Store = (() => {
  const KEY = 'infowerk.v2', OLD = 'infowerk.v1', SESSION = 'infowerk.session';
  const IDLE_MS = 15 * 60 * 1000;      // nach 15 Minuten ohne Nutzung abmelden (geteilte Geräte)
  const defaults = () => ({ lang: null, theme: 'auto', big: false, sound: true, mode: null, nameMode: 'self', guest: false, admin: null, adminFails: 0, adminLock: 0, profiles: [], classes: [], legacyStars: null, legacyStats: null, solo: freshSolo() });
  // „Einfach loslegen“: ein Fortschritt für das ganze Gerät, ohne Anmeldung
  const freshSolo = () => ({ id: '__solo', name: '', solo: true, level: 0, stars: {}, stats: {}, cls: null });
  const GUEST = '__guest';
  let guest = null; // Gast: nur in der Sitzung (übersteht Neuladen, nicht das Schließen), nie dauerhaft gespeichert
  let data = defaults();
  let currentId = null;
  const isObj = v => v && typeof v === 'object' && !Array.isArray(v);
  const str = (v, max) => (typeof v === 'string' ? v.slice(0, max) : '');
  const int = (v, min, max) => (Number.isFinite(v) ? Math.min(max, Math.max(min, Math.round(v))) : min);
  function cleanCred(c) {
    return isObj(c) && typeof c.salt === 'string' && typeof c.hash === 'string' && Number.isInteger(c.iter) ? { salt: c.salt, hash: c.hash, iter: c.iter } : null;
  }
  function cleanStars(o) {
    const out = {};
    if (isObj(o)) for (const [k0, v] of Object.entries(o)) {
      const k = /@[123]$/.test(k0) ? k0 : k0 + '@2';
      if (/^[\w-]+@[123]$/.test(k) && Number.isInteger(v) && v >= 1 && v <= 3) out[k] = Math.max(v, out[k] || 0);
    }
    return out;
  }
  function cleanStats(o) {
    const out = {};
    if (isObj(o)) for (const [k, v] of Object.entries(o)) if (/^[\w-]+$/.test(k) && isObj(v)) {
      out[k] = { n: int(v.n, 0, 1e6), e: int(v.e, 0, 1e7), h: int(v.h, 0, 1e6), t: int(v.t, 0, 1e9), at: int(v.at, 0, 1e13) };
    }
    return out;
  }
  function cleanClassRef(c) {
    return isObj(c) && typeof c.id === 'string' && typeof c.key === 'string' ? { id: str(c.id, 40), name: str(c.name, 60), key: str(c.key, 60), exp: int(c.exp, 0, 1e13) } : null;
  }
  function cleanProfile(p) {
    if (!isObj(p) || typeof p.id !== 'string' || typeof p.name !== 'string') return null;
    return { id: str(p.id, 40), name: str(p.name, 40), cred: cleanCred(p.cred), mustChange: p.mustChange === true, fails: int(p.fails, 0, 1000), lockUntil: int(p.lockUntil, 0, 1e13),
      level: [1, 2, 3].includes(p.level) ? p.level : 0, stars: cleanStars(p.stars), stats: cleanStats(p.stats), created: int(p.created, 0, 1e13), lastActive: int(p.lastActive, 0, 1e13), cls: cleanClassRef(p.cls) };
  }
  function cleanResult(r) {
    return isObj(r) && typeof r.name === 'string' ? { pid: str(r.pid, 12), name: str(r.name, 40), at: int(r.at, 0, 1e13), last: int(r.last, 0, 1e13), stars: cleanStars(r.stars), stats: cleanStats(r.stats) } : null;
  }
  function cleanClass(c) {
    if (!isObj(c) || typeof c.id !== 'string' || typeof c.key !== 'string') return null;
    const results = {};
    if (isObj(c.results)) for (const [k, v] of Object.entries(c.results)) { const r = cleanResult(v); if (r) results[str(k, 40)] = r; }
    return { id: str(c.id, 40), name: str(c.name, 60), key: str(c.key, 60), roster: Array.isArray(c.roster) ? c.roster.filter(x => typeof x === 'string').map(x => x.slice(0, 40)).slice(0, 60) : [],
      created: int(c.created, 0, 1e13), exp: int(c.exp, 0, 1e13), results };
  }
  try {
    const raw = localStorage.getItem(KEY);
    const p = raw ? JSON.parse(raw) : null;
    if (isObj(p)) {
      if (p.lang === 'de' || p.lang === 'en') data.lang = p.lang;
      if (['auto', 'light', 'dark'].includes(p.theme)) data.theme = p.theme;
      data.big = p.big === true; data.sound = p.sound !== false;
      if (p.mode === 'home' || p.mode === 'school' || p.mode === 'free') data.mode = p.mode;
      data.guest = p.guest === true;
      if (isObj(p.solo)) data.solo = Object.assign(freshSolo(), { level: [1, 2, 3].includes(p.solo.level) ? p.solo.level : 0, stars: cleanStars(p.solo.stars), stats: cleanStats(p.solo.stats) });
      if (p.nameMode === 'self' || p.nameMode === 'list') data.nameMode = p.nameMode;
      data.admin = cleanCred(p.admin);
      data.adminFails = int(p.adminFails, 0, 1000); data.adminLock = int(p.adminLock, 0, 1e13);
      if (Array.isArray(p.profiles)) data.profiles = p.profiles.map(cleanProfile).filter(Boolean).slice(0, 40);
      if (Array.isArray(p.classes)) data.classes = p.classes.map(cleanClass).filter(Boolean).slice(0, 30);
      data.legacyStars = isObj(p.legacyStars) ? cleanStars(p.legacyStars) : null;
      data.legacyStats = isObj(p.legacyStats) ? cleanStats(p.legacyStats) : null;
    } else {
      // Übernahme aus Fassung 0.1/0.2 (ein Gerät, ohne Profile)
      const old = JSON.parse(localStorage.getItem(OLD) || 'null');
      if (isObj(old)) {
        if (old.lang === 'de' || old.lang === 'en') data.lang = old.lang;
        if (['auto', 'light', 'dark'].includes(old.theme)) data.theme = old.theme;
        data.big = old.big === true; data.sound = old.sound !== false;
        const st = cleanStars(old.stars);
        if (Object.keys(st).length) data.legacyStars = st;
      }
    }
  } catch (e) { /* defekter oder gesperrter Speicher: mit Standardwerten weiter */ }
  // Sitzung (übersteht Neuladen, nicht das Schließen); abgelaufen → abgemeldet
  try {
    const s = JSON.parse(sessionStorage.getItem(SESSION) || 'null');
    if (isObj(s) && Date.now() - s.seen < IDLE_MS && data.profiles.some(p => p.id === s.id)) currentId = s.id;
    // Gast übersteht ein Neuladen, aber nicht das Schließen der App
    else if (isObj(s) && Date.now() - s.seen < IDLE_MS && s.id === GUEST && data.guest && data.mode !== 'free' && isObj(s.g)) {
      guest = Object.assign(freshSolo(), { id: GUEST, name: str(s.g.name, 40), solo: false, guest: true, level: [1, 2, 3].includes(s.g.level) ? s.g.level : 0, stars: cleanStars(s.g.stars), stats: cleanStats(s.g.stats) });
      currentId = GUEST;
    }
  } catch (e) { /* ohne Sitzung */ }
  let warned = false, mirrorTimer = 0;
  function save() {
    if (currentId === GUEST) touchSession();
    const json = JSON.stringify(data);
    try { localStorage.setItem(KEY, json); }
    catch (e) { if (!warned && typeof toast === 'function') { warned = true; toast(t('storageFail')); } }
    // In der App zusätzlich im nativen Speicher sichern – das Betriebssystem kann den Web-Speicher bei Platzmangel leeren
    if (window.Native && Native.isNative) {
      clearTimeout(mirrorTimer);
      mirrorTimer = setTimeout(() => { Native.prefs.set(KEY, json).catch(() => {}); }, 300);
    }
  }
  function touchSession() {
    try { if (currentId) sessionStorage.setItem(SESSION, JSON.stringify(Object.assign({ id: currentId, seen: Date.now() }, currentId === GUEST && guest ? { g: guest } : {}))); else sessionStorage.removeItem(SESSION); } catch (e) { /* egal */ }
  }
  const cur = () => data.mode === 'free' ? data.solo : currentId === GUEST ? guest : data.profiles.find(p => p.id === currentId) || null;
  const mergeStars = (a, b) => { const o = Object.assign({}, a); for (const [k, v] of Object.entries(b || {})) o[k] = Math.max(o[k] || 0, v); return o; };
  const mergeStats = (a, b) => {
    const o = JSON.parse(JSON.stringify(a || {}));
    for (const [k, v] of Object.entries(b || {})) { const x = o[k] || (o[k] = { n: 0, e: 0, h: 0, t: 0, at: 0 }); x.n += v.n; x.e += v.e; x.h += v.h; x.t += v.t; x.at = Math.max(x.at, v.at); }
    return o;
  };
  return {
    KEY,
    get: k => data[k],
    set(k, v) { data[k] = v; save(); },
    save,
    /* Profile */
    profiles: () => data.profiles,
    profile: id => data.profiles.find(p => p.id === id) || null,
    current: cur,
    addProfile(p) { const c = cleanProfile(p); data.profiles.push(c); save(); return c; },
    removeProfile(id) { data.profiles = data.profiles.filter(p => p.id !== id); if (currentId === id) currentId = null; save(); touchSession(); },
    login(id) {
      currentId = id; const p = cur();
      // Fortschritt aus der Zeit ohne Profile geht an das erste Profil
      if (p && (data.legacyStars || data.legacyStats) && data.profiles.length === 1) {
        p.stars = mergeStars(p.stars, data.legacyStars); p.stats = mergeStats(p.stats, data.legacyStats);
        data.legacyStars = null; data.legacyStats = null;
      }
      if (p) p.lastActive = Date.now();
      save(); touchSession();
    },
    logout() { currentId = null; guest = null; touchSession(); },
    /** Üben ohne Anmeldung (nur wenn im Eltern-/Lehrkraftbereich erlaubt); nichts wird gespeichert */
    loginGuest(name) { if (!data.guest) return; guest = Object.assign(freshSolo(), { id: GUEST, name, solo: false, guest: true }); currentId = GUEST; touchSession(); },
    isGuest: () => currentId === GUEST && data.mode !== 'free',
    isFree: () => data.mode === 'free',
    /** Nutzungsart wechseln: 'free' | 'home' | 'school'. Fortschritt ohne Profile wandert mit, solange es noch keine Profile gibt. */
    setMode(m) {
      if (!['free', 'home', 'school'].includes(m)) return;
      const sole = data.solo;
      if (m === 'free' && data.mode !== 'free' && !data.profiles.length && (data.legacyStars || data.legacyStats)) {
        sole.stars = mergeStars(sole.stars, data.legacyStars); sole.stats = mergeStats(sole.stats, data.legacyStats);
        data.legacyStars = null; data.legacyStats = null;
      }
      if (m !== 'free' && data.mode !== 'home' && data.mode !== 'school' && !data.profiles.length && (Object.keys(sole.stars).length || Object.keys(sole.stats).length)) {
        data.legacyStars = mergeStars(data.legacyStars, sole.stars); data.legacyStats = mergeStats(data.legacyStats, sole.stats);
        data.solo = freshSolo();
      }
      data.mode = m; currentId = null; guest = null; save(); touchSession();
    },
    touch() { if (currentId) touchSession(); },
    idleExpired() {
      if (data.mode === 'free') return false;
      try { const s = JSON.parse(sessionStorage.getItem(SESSION) || 'null'); return !!currentId && (!s || Date.now() - s.seen >= IDLE_MS); } catch (e) { return false; }
    },
    /* Stufe und Sterne des angemeldeten Profils */
    level: () => (cur() && cur().level) || 2,
    levelChosen: () => !!(cur() && cur().level),
    setLevel(n) { const p = cur(); if (p) { p.level = n; save(); } },
    stars(id, lvl) { const p = cur(); if (!p) return 0; return p.stars[id + '@' + (lvl || p.level || 2)] || 0; },
    setStars(id, n, lvl) {
      const p = cur(); if (!p) return false;
      const k = id + '@' + (lvl || p.level || 2);
      if (n > (p.stars[k] || 0)) { p.stars[k] = n; save(); return true; }
      return false;
    },
    /** Versuch festhalten: Fehler, Tipps, Sekunden */
    record(id, errors, hints, sec) {
      const p = cur(); if (!p) return;
      const s = p.stats[id] || (p.stats[id] = { n: 0, e: 0, h: 0, t: 0, at: 0 });
      s.n++; s.e += errors; s.h += hints; s.t += Math.max(0, Math.round(sec)); s.at = Date.now();
      p.lastActive = Date.now();
      save();
    },
    resetProgress() { const p = cur(); if (p) { p.stars = {}; p.stats = {}; save(); } },
    /* Klassen (Lehrkraft) */
    classes: () => data.classes,
    klass: id => data.classes.find(c => c.id === id) || null,
    addClass(c) { const k = cleanClass(c); data.classes.push(k); save(); return k; },
    removeClass(id) { data.classes = data.classes.filter(c => c.id !== id); save(); },
    /** Abgelaufene Klassen (Schuljahresende) entfernen – auch Beitritte der Profile */
    purgeExpired(now = Date.now()) {
      const before = data.classes.length;
      data.classes = data.classes.filter(c => !c.exp || c.exp > now);
      let n = before - data.classes.length;
      for (const p of data.profiles) if (p.cls && p.cls.exp && p.cls.exp <= now) { p.cls = null; n++; }
      if (n) save();
      return n;
    },
    /** Alles löschen (z. B. Passwort für den Eltern-/Lehrkraftbereich vergessen) */
    wipe() { const keep = { lang: data.lang, theme: data.theme, big: data.big, sound: data.sound }; data = Object.assign(defaults(), keep); currentId = null; save(); touchSession(); }
  };
})();

/* ---------------- Sprache ---------------- */
let LANG = Store.get('lang') || (/^de\b/i.test(navigator.language || 'de') ? 'de' : 'en');

function t(key, vars) {
  let s = I18N[LANG] && I18N[LANG][key];
  if (s === undefined) s = I18N.de[key];
  if (s === undefined) { console.warn('i18n fehlt:', key); return key; }
  if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
  return s;
}
/** Text aus Inhalten: {de, en} oder einfacher String. */
function L(v) {
  if (v == null) return '';
  if (typeof v === 'string' || typeof v === 'number') return String(v);
  return v[LANG] !== undefined ? v[LANG] : v.de;
}
function setLang(l) {
  LANG = l;
  Store.set('lang', l);
  document.documentElement.lang = l;
}

/* ---------------- Zahlen ---------------- */
function fmtNum(n, digits = 2) {
  return Number(n).toLocaleString(LANG === 'de' ? 'de-DE' : 'en-GB', { maximumFractionDigits: digits });
}
/** Nimmt „14,4“, „14.4“, „ 14 “ an. Gibt NaN zurück, wenn es keine Zahl ist. */
function parseNum(s) {
  const c = String(s).trim().replace(/\s/g, '').replace(',', '.');
  if (!/^-?\d+(\.\d+)?$/.test(c)) return NaN;
  return Number(c);
}
const near = (a, b) => Math.abs(a - b) < 1e-6;

/* ---------------- DOM-Helfer ---------------- */
function h(tag, attrs, ...kids) {
  const el = document.createElement(tag);
  if (attrs) {
    for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'html') el.innerHTML = v;
      else if (k === 'style' && typeof v === 'object') {
        for (const [p, val] of Object.entries(v)) {
          if (p.startsWith('--')) el.style.setProperty(p, val); else el.style[p] = val;
        }
      }
      else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
      else if (v === true) el.setAttribute(k, '');
      else el.setAttribute(k, v);
    }
  }
  for (const c of kids.flat(Infinity)) {
    if (c == null || c === false) continue;
    el.append(c.nodeType ? c : document.createTextNode(String(c)));
  }
  return el;
}
/** Ersetzt den Inhalt eines Elements; Listen werden ausgepackt, null/false weggelassen. */
function fill(el, ...kids) {
  el.replaceChildren(...kids.flat(Infinity).filter(k => k != null && k !== false).map(k => (k.nodeType ? k : document.createTextNode(String(k)))));
  return el;
}
/** SVG aus vertrauenswürdigem, festem Markup (nur eigene Symbole). */
function svg(markup) {
  const tpl = document.createElement('template');
  tpl.innerHTML = markup.trim();
  return tpl.content.firstChild;
}
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
/** Mischt so, dass die Reihenfolge nicht zufällig die Ausgangsreihenfolge ist. */
function shuffleNotSame(arr) {
  if (arr.length < 2) return arr.slice();
  let a;
  do { a = shuffle(arr); } while (a.every((x, i) => x === arr[i]));
  return a;
}
const sleep = ms => new Promise(r => setTimeout(r, ms));

/* ---------------- Symbole ---------------- */
const S = (inner, extra = '') => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${inner}</svg>`;
const ICONS = {
  table: S('<rect x="3" y="4" width="18" height="16" rx="2.5"/><path d="M3 9.5h18M3 14.8h18M9 4v16M15 4v16"/>'),
  key: S('<circle cx="8" cy="15" r="4.2"/><path d="M11 12l9-9M16.5 6.5l2.5 2.5M14 9l2 2"/>'),
  blocks: S('<path d="M4 4h6l1 1.5h2L14 4h5a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z"/><path d="M7 14h4l1 1.5h2L15 14h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1z"/>'),
  lock: S('<rect x="4.5" y="10.5" width="15" height="10.5" rx="2.5"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/><path d="M12 14.5v2.5"/>'),
  chip: S('<rect x="7" y="7" width="10" height="10" rx="1.8"/><path d="M10 3v4M14 3v4M10 17v4M14 17v4M3 10h4M3 14h4M17 10h4M17 14h4"/><rect x="10" y="10" width="4" height="4" rx=".8"/>'),
  binary: S('<ellipse cx="7.5" cy="12" rx="3.2" ry="5.5"/><path d="M14 8.5l3-2.5v12M14 18h6"/>'),
  globe: S('<circle cx="12" cy="5" r="2.5"/><circle cx="5" cy="18" r="2.5"/><circle cx="19" cy="18" r="2.5"/><path d="M10.8 7.2L6.2 15.8M13.2 7.2l4.6 8.6M7.5 18h9"/>'),
  shield: S('<path d="M12 3l7.5 3v5.2c0 4.8-3.2 8.4-7.5 9.8-4.3-1.4-7.5-5-7.5-9.8V6z"/><path d="M9 12.2l2.2 2.2L15.5 10"/>'),
  book: S('<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5V5.5M8 7h8M8 10.5h6"/>'),
  gear: S('<circle cx="12" cy="12" r="3.2"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>'),
  back: S('<path d="M15 5l-7 7 7 7"/>'),
  close: S('<path d="M6 6l12 12M18 6L6 18"/>'),
  speaker: S('<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>'),
  info: S('<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.6v.1"/>', 'stroke-width="2.4"'),
  power: S('<path d="M12 3v8"/><path d="M7 6.5a7 7 0 1 0 10 0"/>', 'stroke-width="2.4"'),
  help: S('<circle cx="12" cy="12" r="9"/><path d="M9.5 9.3a2.6 2.6 0 0 1 5 .9c0 1.8-2.5 2.3-2.5 3.8"/><path d="M12 17.2v.1"/>'),
  check: S('<path d="M5 12.5l4.5 4.5L19 7.5"/>', 'stroke-width="3"'),
  cross: S('<path d="M7 7l10 10M17 7L7 17"/>', 'stroke-width="3"'),
  arrow: S('<path d="M5 12h14M13 6l6 6-6 6"/>'),
  play: S('<path d="M7 5v14l12-7z" fill="currentColor"/>'),
  undo: S('<path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-2"/>'),
  minus: S('<path d="M6 12h12"/>', 'stroke-width="3"'),
  plus: S('<path d="M12 6v12M6 12h12"/>', 'stroke-width="3"'),
  bulb: S('<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z"/>'),
  warn: S('<path d="M12 3l9.5 17H2.5z"/><path d="M12 10v4M12 17.3v.1"/>'),
  monitor: S('<rect x="3" y="4" width="18" height="12.5" rx="2"/><path d="M8.5 20.5h7M12 16.5v4"/>'),
  logo: S('<path d="M8 7l-5 5 5 5M16 7l5 5-5 5M13.5 5l-3 14"/>', 'stroke-width="2.4"')
};
const STAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.6l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.5l-5.9 3.1 1.2-6.5L2.5 9.5l6.6-.9z"/></svg>';
function starRow(n, cls = 'stars') {
  const w = h('span', { class: cls, role: 'img', 'aria-label': t('starsAria', { n }) });
  for (let i = 0; i < 3; i++) { const s = svg(STAR); if (i < n) s.classList.add('on'); w.append(s); }
  return w;
}
const FLAG_DE = '<svg viewBox="0 0 5 3" aria-hidden="true"><rect width="5" height="1" fill="#000"/><rect y="1" width="5" height="1" fill="#DD0000"/><rect y="2" width="5" height="1" fill="#FFCE00"/></svg>';
const FLAG_EN = '<svg viewBox="0 0 60 30" aria-hidden="true"><clipPath id="ukc"><path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z"/></clipPath><path d="M0,0 v30 h60 v-30 z" fill="#012169"/><path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" stroke-width="6"/><path d="M0,0 L60,30 M60,0 L0,30" clip-path="url(#ukc)" stroke="#C8102E" stroke-width="4"/><path d="M30,0 v30 M0,15 h60" stroke="#fff" stroke-width="10"/><path d="M30,0 v30 M0,15 h60" stroke="#C8102E" stroke-width="6"/></svg>';

/* ---------------- Rückmeldungen ---------------- */
let toastTimer = 0;
function toast(msg, ms = 2200) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), ms);
}

const Sound = (() => {
  let ctx = null;
  function tone(freqs, dur = .09, type = 'sine', vol = .06) {
    if (!Store.get('sound')) return;
    try {
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === 'suspended') ctx.resume();
      let t0 = ctx.currentTime;
      for (const f of freqs) {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = type; o.frequency.value = f;
        g.gain.setValueAtTime(vol, t0);
        g.gain.exponentialRampToValueAtTime(.0001, t0 + dur);
        o.connect(g).connect(ctx.destination);
        o.start(t0); o.stop(t0 + dur + .02);
        t0 += dur * .9;
      }
    } catch (e) { /* ohne Ton weiter */ }
  }
  return {
    ok: () => tone([660, 880], .09),
    bad: () => tone([220, 180], .12, 'triangle', .07),
    tick: () => tone([520], .04, 'sine', .035),
    win: () => tone([523, 659, 784, 1047], .11)
  };
})();

/* ---------------- Bottom-Sheet ---------------- */
let sheetCloser = null;
function openSheet(title, content, opts = {}) {
  closeSheet();
  const root = document.getElementById('sheet-root');
  const prevFocus = document.activeElement;
  const closeBtn = h('button', { class: 'icon-btn', 'aria-label': t('close'), onclick: () => closeSheet() }, svg(ICONS.close));
  const card = h('div', { class: 'sheet-card', role: 'dialog', 'aria-modal': 'true', 'aria-label': title },
    h('div', { class: 'grab' }),
    h('div', { class: 'sheet-head' }, h('h2', null, title), closeBtn),
    content);
  if (opts.color) card.style.setProperty('--c', opts.color);
  const bg = h('div', { class: 'sheet-bg', onclick: e => { if (e.target === bg) closeSheet(); } }, card);
  root.append(bg);
  const onKey = e => { if (e.key === 'Escape') closeSheet(); };
  document.addEventListener('keydown', onKey);
  sheetCloser = () => {
    document.removeEventListener('keydown', onKey);
    bg.remove();
    sheetCloser = null;
    if (prevFocus && prevFocus.focus) prevFocus.focus();
    if (opts.onClose) opts.onClose();
  };
  closeBtn.focus();
}
function closeSheet() { if (sheetCloser) sheetCloser(); }

function confirmSheet(title, text, okLabel, onOk) {
  openSheet(title, h('div', null,
    h('p', null, text),
    h('div', { class: 'btn-row' },
      h('button', { class: 'btn', onclick: () => closeSheet() }, t('cancel')),
      h('button', { class: 'btn pri', style: { '--c': 'var(--bad)' }, onclick: () => { closeSheet(); onOk(); } }, okLabel))));
}

/* ---------------- Darstellung ---------------- */
const mqDark = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
function applyTheme() {
  const pref = Store.get('theme');
  const dark = pref === 'dark' || (pref === 'auto' && mqDark && mqDark.matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  document.documentElement.dataset.big = Store.get('big') ? '1' : '0';
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = dark ? '#0E1326' : '#F3F5FB';
}
if (mqDark && mqDark.addEventListener) mqDark.addEventListener('change', applyTheme);

/* ---------------- Vorlesen (Sprachausgabe des Geräts, offline) ---------------- */
const Speech = {
  ok: () => (window.Native && Native.isNative) || ('speechSynthesis' in window && typeof SpeechSynthesisUtterance === 'function'),
  speak(text) {
    if (!Speech.ok() || !text) return;
    if (window.Native && Native.isNative) { Native.speak(text, LANG === 'de' ? 'de-DE' : 'en-GB').catch(() => {}); return; }
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = LANG === 'de' ? 'de-DE' : 'en-GB';
      u.rate = .95;
      speechSynthesis.speak(u);
    } catch (e) { /* ohne Sprachausgabe weiter */ }
  },
  stop() {
    if (window.Native && Native.isNative) { Native.stopSpeak(); return; }
    try { if (Speech.ok()) speechSynthesis.cancel(); } catch (e) { /* egal */ }
  }
};

/* ---------------- Stufen ---------------- */
/** Liefert die Station für eine Stufe: Grundfassung (= Stufe 2) plus Änderungen aus st.levels[lvl].
    pick: {liste: [Indizes]} wählt Einträge aus, add: {liste: [...]} hängt neue an, alles andere ersetzt. */
function resolveStation(st, lvl) {
  const o = (st.levels && st.levels[lvl]) || {};
  const r = Object.assign({}, st);
  delete r.levels;
  if (o.pick) for (const [k, idx] of Object.entries(o.pick)) r[k] = idx.map(i => st[k][i]);
  if (o.add) for (const [k, arr] of Object.entries(o.add)) r[k] = (r[k] || []).concat(arr);
  for (const [k, v] of Object.entries(o)) if (k !== 'pick' && k !== 'add') r[k] = v;
  r.level = lvl;
  return r;
}

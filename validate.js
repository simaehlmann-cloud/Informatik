#!/usr/bin/env node
/* Statische Prüfung: Übersetzungen, Inhalte, Lösbarkeit, verbotene Namen.  node validate.js */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const WWW = path.join(__dirname, 'www');
let checks = 0, fails = 0;
const ok = (cond, msg) => { checks++; if (!cond) { fails++; console.error('✗ ' + msg); } };

/* ---- Skripte in einer Sandbox laden (mit kleinen DOM-Attrappen) ---- */
const store = {};
const sandbox = {
  console, Math, JSON, Object, Array, String, Number, Set, Map, Promise, setTimeout, clearTimeout,
  crypto: globalThis.crypto, btoa, atob, TextEncoder, TextDecoder, Uint8Array, DataView, Date,
  localStorage: { getItem: k => store[k] || null, setItem: (k, v) => { store[k] = v; } },
  sessionStorage: { getItem: () => null, setItem() {}, removeItem() {} },
  navigator: { language: 'de-DE', userAgent: 'validate' },
  window: { matchMedia: () => ({ matches: false, addEventListener() {} }), addEventListener() {}, crypto: globalThis.crypto },
  document: { documentElement: { dataset: {}, lang: 'de' }, querySelector: () => null, getElementById: () => null, addEventListener() {}, createElement: () => ({}) },
  location: { search: '', hash: '' }
};
vm.createContext(sandbox);
for (const f of ['i18n.js', 'core.js', 'content.js', 'devices.js', 'content-hardware.js', 'content-levels.js', 'games-generic.js', 'games-table.js', 'games-security.js', 'games-code.js', 'games-tech.js', 'games-hardware.js', 'profiles.js', 'account.js', 'admin.js']) {
  const code = fs.readFileSync(path.join(WWW, 'js', f), 'utf8');
  // const/let auf oberster Ebene sichtbar machen
  vm.runInContext(code + `\n;Object.assign(globalThis, (() => { try { return { I18N, CHAPTERS, DATA, GAMES, Store, SHA, pwHash, STATION_ORDER, pwRules, pwOk, makeOtp, schoolYearEnd, resultCode, parseResultCode, classCode, parseClassCode, B64, hasSequence, resolveStation, evalFormula, pcCheck, PC_CATS, PC_SLOTS, DEVICES, LEVELS, YEAR, caesar, vigenere, minLength, CHARSETS, shortestHops, NET, SENSORS, ACTION_PATTERNS, countBlocks, toProg, flatten, DIRS, TURN_L, TURN_R, MONTHS, ANIMALS }; } catch (e) { return {}; } })());`, sandbox, { filename: f });
}
const { I18N, CHAPTERS, DATA, GAMES } = sandbox;
ok(Array.isArray(CHAPTERS) && CHAPTERS.length >= 9, 'Themen nicht geladen');
ok(CHAPTERS[0].id === 'hardware', 'Computer & Hardware soll das erste Thema sein');
const allIds = new Set(CHAPTERS.flatMap(c => c.stations.map(s => s.id)));
for (const id of Object.keys(sandbox.LEVELS)) ok(allIds.has(id), `LEVELS für unbekannte Station ${id}`);

/* ---- 1. Übersetzungen ---- */
const de = Object.keys(I18N.de), en = Object.keys(I18N.en);
de.forEach(k => ok(k in I18N.en, `EN fehlt Schlüssel ${k}`));
en.forEach(k => ok(k in I18N.de, `DE fehlt Schlüssel ${k}`));
for (const lang of ['de', 'en']) for (const [k, v] of Object.entries(I18N[lang])) ok(typeof v === 'string' && v.trim().length > 0, `${lang}.${k} leer`);
// Platzhalter gleich?
for (const k of de) {
  const ph = s => (String(s).match(/\{\w+\}/g) || []).sort().join();
  ok(ph(I18N.de[k]) === ph(I18N.en[k]), `Platzhalter unterscheiden sich bei ${k}`);
}
// alle im Code verwendeten Schlüssel vorhanden?
const jsAll = fs.readdirSync(path.join(WWW, 'js')).map(f => fs.readFileSync(path.join(WWW, 'js', f), 'utf8')).join('\n');
const used = new Set([...jsAll.matchAll(/\bt\('([A-Za-z_]+)'(?!\s*\+)/g)].map(m => m[1]));
['res1', 'res2', 'res3', 'btnUp', 'btnDown', 'binTooBig', 'binTooSmall', 'more', 'less', 'thenDo', 'elseDo', 'ch_r', 'ch_g', 'ch_b',
  ...[1, 2, 3].flatMap(n => ['lv' + n, 'lv' + n + 'Sub']), ...sandbox.PC_SLOTS.map(x => 'slot_' + x.id), ...sandbox.PC_CATS.map(c => 'cat_' + c),
  ...['noPower', 'noBoard', 'noCable', 'noCpu', 'noCooler', 'noRam', 'noGpu', 'noDisk'].map(f => 'pcFault_' + f),
  ...Object.keys(sandbox.SENSORS).map(s => 's_' + s), ...Object.keys(sandbox.ACTION_PATTERNS).map(a => 'a_' + a)].forEach(k => used.add(k));
for (const k of used) if (!/_$/.test(k)) ok(k in I18N.de, `Schlüssel im Code, aber nicht in i18n: ${k}`);
for (const k of de) ok(used.has(k) || jsAll.includes(`'${k}'`), `Schlüssel nie benutzt: ${k}`);

/* ---- 2. Inhalte vollständig zweisprachig ---- */
function walk(v, where) {
  if (v == null || typeof v === 'function') return;
  if (Array.isArray(v)) return v.forEach((x, i) => walk(x, `${where}[${i}]`));
  if (typeof v === 'object') {
    if ('de' in v || 'en' in v) {
      ok(typeof v.de === 'string' && v.de.trim() !== '', `${where}: de fehlt`);
      ok(typeof v.en === 'string' && v.en.trim() !== '', `${where}: en fehlt`);
      return;
    }
    for (const [k, x] of Object.entries(v)) walk(x, `${where}.${k}`);
  }
}
walk(CHAPTERS, 'CHAPTERS');
walk(DATA, 'DATA');

/* ---- 3. Struktur ---- */
const ids = new Set();
const L = (v, lang) => (v == null ? '' : typeof v === 'string' || typeof v === 'number' ? String(v) : v[lang]);
for (const ch of CHAPTERS) {
  ok(/^#[0-9A-F]{6}$/i.test(ch.color), `${ch.id}: Farbe`);
  ok(ch.merk.length >= 2, `${ch.id}: Merkkasten zu kurz`);
  for (const k of ['title', 'sub', 'intro', 'kc']) ok(ch[k], `${ch.id}: ${k} fehlt`);
  for (const st of ch.stations) {
    ok(!ids.has(st.id), `doppelte Station ${st.id}`); ids.add(st.id);
    ok(typeof GAMES[st.type] === 'function', `${st.id}: Spieltyp ${st.type} unbekannt`);
    ok(st.title && st.desc && st.how, `${st.id}: Titel/Beschreibung/Hilfe fehlt`);
    ok(st.merk == null || (st.merk >= 0 && st.merk < ch.merk.length), `${st.id}: merk-Index`);
  }
}

/* ---- 4. Lösbarkeit je Spieltyp ---- */
const near = (a, b) => Math.abs(a - b) < 1e-6;
const shop = DATA.shop;
function cellVal(a) { const c = 'ABCDEFGH'.indexOf(a[0]), r = Number(a.slice(1)) - 1; return shop[r][c].v; }
function rangeVals(rg) {
  const [a, b] = rg.split(':'); const c1 = 'ABCDEFGH'.indexOf(a[0]), c2 = 'ABCDEFGH'.indexOf(b[0]);
  const r1 = Number(a.slice(1)), r2 = Number(b.slice(1)); const out = [];
  for (let r = r1; r <= r2; r++) for (let c = c1; c <= c2; c++) out.push(shop[r - 1][c].v);
  return out;
}
function evalFormula(f) {
  let m;
  if ((m = f.match(/^=(SUMME|SUM)\((\w+:\w+)\)$/))) return rangeVals(m[2]).reduce((a, b) => a + b, 0);
  if ((m = f.match(/^=(MITTELWERT|AVERAGE)\((\w+:\w+)\)$/))) { const v = rangeVals(m[2]); return v.reduce((a, b) => a + b, 0) / v.length; }
  if ((m = f.match(/^=MAX\((\w+:\w+)\)$/))) return Math.max(...rangeVals(m[1]));
  if ((m = f.match(/^=MIN\((\w+:\w+)\)$/))) return Math.min(...rangeVals(m[1]));
  if ((m = f.match(/^=(\w\d)\*(\w\d)$/))) return cellVal(m[1]) * cellVal(m[2]);
  if ((m = f.match(/^=(WENN|IF)\((\w\d)>(\d+)[;,]"(\w+)"[;,]"(\w+)"\)$/))) return cellVal(m[2]) > Number(m[3]) ? m[4] : m[5];
  return undefined;
}
// Tabellenwerte selbst stimmig?
for (let r = 1; r <= 5; r++) ok(near(shop[r][3].v, shop[r][1].v * shop[r][2].v), `shop Zeile ${r + 1}: Gesamt falsch`);
ok(near(shop[6][3].v, [1, 2, 3, 4, 5].reduce((a, r) => a + shop[r][3].v, 0)), 'shop Summe falsch');

/* Einsteiger-Regeln: für schwache Lernende machbar */
const words = s => String(s).trim().split(/\s+/).length;
function einsteiger(st, lvl) {
  if (lvl !== 1) return;
  const id = st.id + ' (Einsteiger)';
  const lists = ['items', 'rounds', 'tasks', 'stages', 'mails', 'pairs', 'missions'].filter(k => Array.isArray(st[k]));
  lists.forEach(k => ok(st[k].length <= (k === 'pairs' ? 4 : k === 'items' && st.type === 'sort' ? 8 : 5), `${id}: zu viele ${k} (${st[k].length})`));
  ok(!st.missions, `${id}: Konfigurator ist nur für Profis`);
  if (st.type === 'quiz') st.items.forEach((it, i) => {
    ok(Math.min(it.opts.length, st.maxOpts || 99) <= 3, `${id} #${i}: mehr als 3 Antworten`);
    ok(words(L(it.q, 'de')) <= 25, `${id} #${i}: Frage zu lang (${words(L(it.q, 'de'))} Wörter)`);
  });
  if (st.type === 'sort') ok(st.buckets.length <= 3, `${id}: zu viele Kisten`);
  if (st.type === 'binary') st.rounds.forEach(r => ok(r.bits <= 4 && !r.rand && r.mode !== 'typebin', `${id}: Binär zu schwer`));
  if (st.type === 'maze') st.stages.forEach(s2 => ok(!s2.limit && !s2.loops, `${id}: Labyrinth mit Limit/Schleifen`));
  if (st.type === 'order') st.tasks.forEach(tk => ok(tk.blocks.length <= 5 && tk.blocks.every(b => !b.i), `${id}: Reihenfolge zu lang oder verschachtelt`));
  if (st.type === 'caesar') st.rounds.forEach(r => ok(r.key <= 3 && L(r.text, 'de').length <= 5, `${id}: Caesar zu schwer`));
  if (st.type === 'crack') st.rounds.forEach(r => ok(r.key <= 5, `${id}: Schlüssel zu groß`));
  if (st.type === 'vig') st.rounds.forEach(r => ok(L(r.key, 'de').length <= 2 && r.mode === 'enc' && L(r.text, 'de').length <= 4, `${id}: Vigenère zu schwer`));
  if (st.type === 'rgb') ok(st.tolerance >= 40, `${id}: Farbtoleranz zu streng`);
  if (st.type === 'pwbuild') ok(st.rules.length <= 5, `${id}: zu viele Regeln`);
  if (st.type === 'formula') st.rounds.forEach(r => ok(!!r.choices, `${id}: Einsteiger sollen Ergebnisse auswählen, nicht tippen`));
  if (st.type === 'ascii') ok(!!st.tableOpen, `${id}: Tabelle soll offen sein`);
  if (st.type === 'pcbuild') ok(!!st.labels && !st.withBoard && !st.withCables, `${id}: PC-Werkstatt zu schwer`);
  for (const k of ['task', 'how']) if (st[k]) ok(words(L(st[k], 'de')) <= 45, `${id}: ${k} zu lang`);
}

for (const ch of CHAPTERS) for (const base of ch.stations) for (const lvl of [1, 2, 3]) {
  const st = sandbox.resolveStation(base, lvl);
  const id = st.id;
  einsteiger(st, lvl);
  for (const lang of ['de', 'en']) {
    switch (st.type) {
      case 'quiz':
        st.items.forEach((it, i) => {
          ok(it.opts.length >= 2 && it.a >= 0 && it.a < it.opts.length, `${id} #${i}: Antwortindex`);
          const labels = it.opts.map(o => (o.dev ? L((o.t || sandbox.DEVICES[o.dev].n), lang) : L(o.icon ? o.t : o, lang)));
          it.opts.forEach(o => { if (o.dev) ok(!!sandbox.DEVICES[o.dev], `${id} #${i}: Gerät ${o.dev} unbekannt`); });
          ok(new Set(labels).size === labels.length, `${id} #${i} ${lang}: doppelte Optionen`);
        });
        break;
      case 'sort':
        st.items.forEach((it, i) => {
          ok(st.buckets.some(b => b.id === it.b), `${id} L${lvl} #${i}: Fach ${it.b} fehlt`);
          ok(it.t != null || (it.dev && sandbox.DEVICES[it.dev]), `${id} L${lvl} #${i}: Text/Gerät fehlt`);
          ok(!!it.why, `${id} L${lvl} #${i}: Erklärung fehlt`);
        });
        st.buckets.forEach(b => ok(st.items.some(it => it.b === b.id), `${id} L${lvl}: Kiste ${b.id} bleibt leer`));
        break;
      case 'match': {
        const as = st.pairs.map(p => L(p.a, lang)), bs = st.pairs.map(p => L(p.b, lang));
        ok(new Set(as).size === as.length && new Set(bs).size === bs.length, `${id} ${lang}: doppelte Paare`);
        break;
      }
      case 'order':
        st.tasks.forEach((tk, i) => { const s = tk.blocks.map(b => L(b.t, lang)); ok(new Set(s).size === s.length, `${id} #${i} ${lang}: gleiche Blöcke machen die Reihenfolge mehrdeutig`); });
        break;
      case 'bug':
        st.tasks.forEach((tk, i) => ok(tk.bug >= 0 && tk.bug < tk.blocks.length, `${id} #${i}: bug-Index`));
        break;
      case 'cells':
        st.rounds.forEach((rd, i) => ok(rd.mode === 'range' ? /^[A-D][1-7]:[A-D][1-7]$/.test(rd.target) : /^[A-D][1-7]$/.test(rd.target), `${id} #${i}: Ziel ${rd.target}`));
        // A5 = Muffins, C5 = 1.2, D7 = Formel
        ok(L(cellVal('A5'), 'de') === 'Muffins' && near(cellVal('C5'), 1.2), `${id}: Tabelleninhalt passt nicht zu den Fragen`);
        break;
      case 'formula':
        st.rounds.forEach((rd, i) => {
          let r;
          try { r = sandbox.evalFormula(L(rd.f, lang), DATA.shop); } catch (e) { r = undefined; }
          ok(r !== undefined && r !== null && !Number.isNaN(r), `${id} L${lvl} #${i} ${lang}: Formel ${L(rd.f, lang)} nicht auswertbar`);
          if (rd.choices) ok(rd.choices.filter(c => near(c, r)).length === 1 && new Set(rd.choices).size === rd.choices.length, `${id} L${lvl} #${i}: Auswahl enthält das Ergebnis ${r} nicht genau einmal`);
          else if (rd.opts) ok(rd.opts.filter(o => L(o, lang) === r).length === 1, `${id} L${lvl} #${i} ${lang}: Antwort ${r} nicht in den Optionen`);
          else ok(typeof r === 'number', `${id} L${lvl} #${i} ${lang}: Ergebnis ist keine Zahl (${r})`);
          if (rd.a != null && !rd.opts) ok(near(r, rd.a), `${id} L${lvl} #${i}: hinterlegtes a=${rd.a} ≠ ${r}`);
          if (typeof r === 'number' && !rd.choices) {
            const shown = String(Math.round(r * 100) / 100).replace('.', lang === 'de' ? ',' : '.');
            ok(L(rd.why, lang).includes(shown) || L(rd.why, lang).includes(shown + '0'), `${id} L${lvl} #${i} ${lang}: Erklärung nennt das Ergebnis ${shown} nicht`);
          }
        });
        break;
      case 'filter': {
        const P = DATA.people;
        st.rounds.forEach((rd, i) => {
          ok(typeof rd.calc === 'function', `${id} L${lvl} #${i}: calc fehlt`);
          const a = rd.calc(P);
          if (rd.mode === 'row') ok(P.filter(p => p.name === a).length === 1, `${id} L${lvl} #${i}: Person ${a} nicht eindeutig`);
          else ok(typeof a === 'number' && Number.isFinite(a), `${id} L${lvl} #${i}: Antwort keine Zahl`);
          if (rd.mode === 'num') ok(L(rd.why, lang).includes(String(a).replace('.', ',')) || L(rd.why, lang).includes(String(a)), `${id} L${lvl} #${i} ${lang}: Erklärung nennt ${a} nicht`);
        });
        break;
      }
      case 'pwbuild': {
        const ex = L(st.example, lang);
        st.rules.forEach((rule, i) => ok(rule.test(ex, lang), `${id} ${lang}: Beispiel „${ex}“ verletzt Regel ${i + 1}`));
        ok(!st.rules.every(r => r.test('', lang)), `${id}: leeres Passwort erfüllt alle Regeln`);
        break;
      }
      case 'pwcrack':
        st.rounds.forEach((rd, i) => {
          const sets = rd.sets || ['lower', 'upper', 'digits', 'special'];
          const n = sandbox.CHARSETS.filter(c => sets.includes(c.id)).reduce((a, c) => a + c.n, 0);
          const l = sandbox.minLength(n, rd.sec);
          ok(l >= 1 && l <= 20, `${id} L${lvl} #${i}: Länge ${l} nicht mit dem Regler (1–20) einstellbar`);
          if (rd.sets) ok(L(rd.why, lang).includes(String(l)), `${id} L${lvl} #${i} ${lang}: Erklärung nennt nicht die richtige Länge ${l}`);
        });
        break;
      case 'caesar':
        st.rounds.forEach((rd, i) => ok(/^[A-Z]+$/.test(L(rd.text, lang)) && rd.key > 0 && rd.key < 26, `${id} #${i} ${lang}: Text/Schlüssel`));
        break;
      case 'crack':
        st.rounds.forEach((rd, i) => {
          const p = L(rd.text, lang);
          ok(/^[A-Z ]+$/.test(p) && rd.key > 0 && rd.key < 26, `${id} #${i} ${lang}: Text/Schlüssel`);
          ok(sandbox.caesar(sandbox.caesar(p, rd.key), -rd.key) === p, `${id} #${i}: Caesar nicht umkehrbar`);
        });
        break;
      case 'vig':
        st.rounds.forEach((rd, i) => {
          const p = L(rd.text, lang);
          ok(/^[A-Z]+$/.test(p) && /^[A-Z]+$/.test(L(rd.key, lang)), `${id} #${i} ${lang}: Text/Schlüssel`);
          ok(sandbox.vigenere(sandbox.vigenere(p, L(rd.key, lang), 1), L(rd.key, lang), -1) === p, `${id} #${i}: Vigenère nicht umkehrbar`);
        });
        break;
      case 'maze':
        st.stages.forEach((lv, i) => {
          if (lv.sol.some(x => typeof x !== 'string' && x.body.some(y => typeof y !== 'string'))) ok(lvl === 3, `${id}: verschachtelte Schleifen nur auf Stufe 3`);
          const W = lv.map[0].length;
          ok(lv.map.every(r => r.length === W), `${id} L${i + 1}: Zeilen ungleich lang`);
          const flat = lv.map.join('');
          ok(flat.split('S').length === 2 && flat.split('Z').length === 2, `${id} L${i + 1}: genau ein Start und ein Ziel`);
          const prog = sandbox.toProg(lv.sol);
          if (lv.limit) ok(sandbox.countBlocks(prog) <= lv.limit, `${id} L${i + 1}: Musterlösung über dem Limit`);
          ok(!!lv.loops || !lv.sol.some(x => typeof x !== 'string'), `${id} L${i + 1}: Lösung braucht Schleifen, die nicht erlaubt sind`);
          ok(lv.sol.every(x => typeof x === 'string' || (x.rep >= 2 && x.rep <= 9)), `${id} L${i + 1}: Wiederholungszahl außerhalb 2–9`);
          let pos, dir = lv.dir, reached = false, crash = false;
          lv.map.forEach((r, y) => { const x = r.indexOf('S'); if (x >= 0) pos = { x, y }; });
          for (const op of sandbox.flatten(prog)) {
            if (op === 'l') dir = sandbox.TURN_L[dir]; else if (op === 'r') dir = sandbox.TURN_R[dir];
            else {
              const nx = pos.x + sandbox.DIRS[dir][0], ny = pos.y + sandbox.DIRS[dir][1];
              if (ny < 0 || ny >= lv.map.length || nx < 0 || nx >= W || lv.map[ny][nx] === '#') { crash = true; break; }
              pos = { x: nx, y: ny };
            }
            if (lv.map[pos.y][pos.x] === 'Z') { reached = true; break; }
          }
          ok(reached && !crash, `${id} L${i + 1}: Musterlösung erreicht das Ziel nicht`);
        });
        break;
      case 'matrix':
        st.rounds.forEach((rd, i) => {
          if (rd.mode === 'xy') ok(rd.x >= 0 && rd.x < 5 && rd.y >= 0 && rd.y < 5, `${id} #${i}: Koordinate`);
          else ok(rd.pattern.length === 5 && rd.pattern.every(r => /^[.#]{5}$/.test(r)), `${id} #${i}: Muster`);
        });
        break;
      case 'ifthen':
        st.rounds.forEach((rd, i) => {
          const s = sandbox.SENSORS[rd.sensor];
          ok(!!s, `${id} #${i}: Sensor`);
          if (s && !s.bool) ok(s.vals.includes(rd.val) && ['<', '>'].includes(rd.cmp), `${id} #${i}: Grenzwert nicht wählbar`);
          ok(rd.then in sandbox.ACTION_PATTERNS && rd.else in sandbox.ACTION_PATTERNS, `${id} #${i}: Aktion`);
        });
        break;
      case 'binary':
        st.rounds.forEach((rd, i) => {
          const vals = rd.rand ? rd.rand : [rd.value, rd.value];
          ok(['make', 'read', 'typebin'].includes(rd.mode), `${id} L${lvl} #${i}: Modus`);
          ok(vals.every(v => Number.isInteger(v) && v > 0 && v < Math.pow(2, rd.bits)), `${id} L${lvl} #${i}: Wert passt nicht in ${rd.bits} Bits`);
        });
        break;
      case 'ascii':
        st.rounds.forEach((rd, i) => ok(rd.mode === 'dec' ? /^[A-Z]+$/.test(L(rd.word, lang)) : /^[A-Z]$/.test(rd.ch), `${id} #${i}: nur A–Z`));
        break;
      case 'rgb':
        st.rounds.forEach((rd, i) => ok(rd.target.length === 3 && rd.target.every(v => v >= 0 && v <= 255), `${id} #${i}: Farbe`));
        break;
      case 'route':
        st.rounds.forEach((rd, i) => ok(Number.isFinite(sandbox.shortestHops(rd.broken)), `${id} #${i}: kein Weg zum Server`));
        break;
      case 'phish':
        st.mails.forEach((m, i) => {
          const segs = [m.from, m.subject, ...m.body];
          ok(segs.some(s => s.sus), `${id} #${i}: keine verdächtige Stelle`);
          segs.filter(s => s.sus).forEach(s => ok(!!s.why, `${id} #${i}: Begründung fehlt`));
        });
        break;
      case 'pcbuild':
        if (st.missions) {
          st.missions.forEach((m, i) => {
            ok(sandbox.pcCheck(m.solution, m, st.catalog) === null, `${id} L${lvl} Auftrag ${i + 1}: Musterlösung erfüllt den Auftrag nicht (${JSON.stringify(sandbox.pcCheck(m.solution, m, st.catalog))})`);
            // Lösung sollte nicht trivial sein: billigste Auswahl je Kategorie darf (außer beim ersten Auftrag) nicht passen
            const cheapest = {};
            for (const k of sandbox.PC_CATS) cheapest[k] = st.catalog[k].slice().sort((a, b) => a.price - b.price)[0].id;
            if (i > 0) ok(sandbox.pcCheck(cheapest, m, st.catalog) !== null, `${id} Auftrag ${i + 1}: schon die billigste Auswahl passt`);
            m.req.forEach(r => ok(!!r.msg, `${id} Auftrag ${i + 1}: Meldung fehlt`));
          });
        } else {
          const slots = sandbox.PC_SLOTS.filter(x => (st.withBoard || x.id !== 'board') && (st.withCables || !x.cable));
          slots.forEach(x => ok(st.parts.some(p => p.dev === x.accepts), `${id} L${lvl}: kein Teil für Steckplatz ${x.id}`));
          st.parts.forEach(p => ok(p.outside || slots.some(x => x.accepts === p.dev), `${id} L${lvl}: Teil ${p.dev} hat keinen Platz`));
          st.parts.forEach(p => ok(p.dev.startsWith('cable') || !!sandbox.DEVICES[p.dev], `${id}: Gerät ${p.dev} unbekannt`));
        }
        break;
      default:
        ok(false, `${id}: kein Prüfer für Typ ${st.type}`);
    }
  }
}

/* ---- 5. Verbotene Namen (Marken, Plattformen) in allen ausgelieferten Dateien ---- */
const BANNED = /\b(scratch|calliope|micro:?bit|makecode|excel|libreoffice|openoffice|numbers-app|google|(?<!-)apple|ios|android|app store|play store|microsoft|gobo|password game)\b/i;
function files(dir) { return fs.readdirSync(dir, { withFileTypes: true }).flatMap(d => d.isDirectory() ? (d.name === 'vendor' ? [] : files(path.join(dir, d.name))) : [path.join(dir, d.name)]); }
for (const f of files(WWW)) {
  if (!/\.(html|js|css|webmanifest|svg)$/.test(f)) continue;
  const txt = fs.readFileSync(f, 'utf8');
  txt.split('\n').forEach((line, n) => {
    const m = line.match(BANNED);
    if (m && !/userAgent/.test(line)) ok(false, `${path.relative(__dirname, f)}:${n + 1}: verbotener Name „${m[0]}“`);
    else checks++;
  });
}

/* ---- 6. Rechtstexte vorhanden und verlinkt ---- */
for (const f of ['datenschutz.html', 'datenschutz-en.html', 'impressum.html', 'impressum-en.html']) {
  const p = path.join(WWW, f);
  ok(fs.existsSync(p), `${f} fehlt`);
  if (fs.existsSync(p)) {
    const s = fs.readFileSync(p, 'utf8');
    ok(s.includes('href="index.html"'), `${f}: kein Link zurück`);
    ok(s.includes('Oderstraße 13'), `${f}: Anschrift fehlt`);
  }
}

/* ---- 7. Keine externen Ressourcen ---- */
for (const f of files(WWW)) {
  if (!/\.(html|js|css)$/.test(f)) continue;
  const s = fs.readFileSync(f, 'utf8');
  ok(!/(src|href)\s*=\s*["']https?:/i.test(s) && !/@import\s+url\(\s*['"]?https?:/i.test(s), `${path.relative(__dirname, f)}: lädt externe Ressource`);
}

/* ---- 8. Profile, Passwörter, Codes ---- */
const SO = sandbox.STATION_ORDER;
ok(new Set(SO).size === SO.length, 'STATION_ORDER enthält Doppelte');
ok(SO.length === allIds.size && SO.every(id => allIds.has(id)), 'STATION_ORDER passt nicht zu den Stationen (neue Stationen hinten anhängen!)');
ok(SO.length <= 255, 'Abgabe-Code: höchstens 255 Stationen');
const pwCase = (pw, want, name) => ok(sandbox.pwOk(pw, { name }) === want, `Passwortregel: „${pw}“ sollte ${want ? 'gültig' : 'ungültig'} sein (${sandbox.pwRules(pw, { name }).filter(r => !r.ok).map(r => r.k).join(', ')})`);
[['Passwort123', false], ['Kiwi-Turm-blau-Regen', true], ['Tg7!pQ2#mZ9x', true], ['Lisa2011!x', false], ['Lisa2011!xyQ', true], ['Lisa-2011!xyQ', true], ['Mein1234Hund!', false], ['Hund-987-Katze', false], ['Abc-Dreieck-77', false],
 ['xyz-Dreieck-55', false], ['qwertz!Wolke9', false], ['Wolke!!!Regen7', false], ['kurz!A1', false], ['nurkleinbuchstaben', true], ['nurkleinbuchst', false], ['Sommer-Fest-2026', false],
 ['Rot-Fuchs-Wald-58', true], ['Mond-Tiger-47', true], ['Asdf-Garten-38', false], ['2wsx-Garten-Bus', false]].forEach(([pw, want]) => pwCase(pw, want));
pwCase('Leonie-Tanzt-88!', false, 'Leonie');
pwCase('Leonie-Tanzt-88!', true, 'Jonas');
ok(sandbox.hasSequence('a1b2c3') === false && sandbox.hasSequence('x9876') === true && sandbox.hasSequence('ZYX') === true, 'Folgen-Erkennung');
for (let i = 0; i < 300; i++) { const o = sandbox.makeOtp(); ok(/^[A-Z][a-z]+-[A-Z][a-z]+-\d\d$/.test(o) && !sandbox.hasSequence(o), `Einmal-Passwort ${o}`); }
const ye = (d, want) => ok(new Date(sandbox.schoolYearEnd(new Date(d).getTime())).toISOString().slice(0, 10) === want || new Date(sandbox.schoolYearEnd(new Date(d).getTime())).getMonth() === 6 && new Date(sandbox.schoolYearEnd(new Date(d).getTime())).getFullYear() === Number(want.slice(0, 4)), `Schuljahresende für ${d}`);
ye('2026-11-25', '2027-07-31'); ye('2027-03-01', '2027-07-31'); ye('2027-08-15', '2028-07-31');

(async () => {
  const B = sandbox.B64;
  // Reserve-Kryptografie muss genau dasselbe liefern wie die eingebaute
  const nodeCrypto = require('crypto');
  for (const [msg, key] of [['', 'k'], ['abc', 'Schlüssel'], ['x'.repeat(200), 'y'.repeat(100)]]) {
    const m = new TextEncoder().encode(msg), k = new TextEncoder().encode(key);
    ok(Buffer.from(sandbox.SHA.digest(m)).toString('hex') === nodeCrypto.createHash('sha256').update(Buffer.from(m)).digest('hex'), `SHA-256 (Reserve) falsch für Länge ${msg.length}`);
    ok(Buffer.from(sandbox.SHA.hmac(k, m)).toString('hex') === nodeCrypto.createHmac('sha256', Buffer.from(k)).update(Buffer.from(m)).digest('hex'), 'HMAC (Reserve) falsch');
  }
  const salt = globalThis.crypto.getRandomValues(new Uint8Array(16));
  ok(Buffer.from(sandbox.SHA.pbkdf2(new TextEncoder().encode('Fuchs-Laterne-Insel!7'), salt, 2000)).toString('hex') === nodeCrypto.pbkdf2Sync('Fuchs-Laterne-Insel!7', Buffer.from(salt), 2000, 32, 'sha256').toString('hex'), 'PBKDF2 (Reserve) falsch');
  const viaSubtle = await sandbox.pwHash('Rot-Fuchs-Wald-58', B.enc(salt), 3000);
  ok(viaSubtle.hash === B.enc(sandbox.SHA.pbkdf2(new TextEncoder().encode('Rot-Fuchs-Wald-58'), salt, 3000)), 'Passwort-Hash: eingebaute und Reserve-Rechnung weichen ab');
  const klass = { id: B.enc(globalThis.crypto.getRandomValues(new Uint8Array(6))), name: '9b Informatik', key: B.enc(globalThis.crypto.getRandomValues(new Uint8Array(16))), roster: ['MaKo', 'LeSc'], exp: Date.now() + 1e9, results: {} };
  const cc = sandbox.parseClassCode(sandbox.classCode(klass));
  ok(cc && cc.id === klass.id && cc.key === klass.key && cc.roster.join() === 'MaKo,LeSc' && cc.name === klass.name, 'Klassen-Code hin und zurück');
  ok(sandbox.parseClassCode('IWK.kaputt') === null && sandbox.parseClassCode('hallo') === null, 'kaputter Klassen-Code wird abgelehnt');
  const stars = {}, stats = {};
  SO.forEach((id, i) => { if (i % 3 === 0) stars[id + '@1'] = 3; if (i % 4 === 1) stars[id + '@2'] = 2; if (i % 5 === 2) stars[id + '@3'] = 1; if (i % 2) stats[id] = { n: i % 7 + 1, e: i * 3, h: i % 4, t: i * 60, at: 0 }; });
  const prof = { id: B.enc(globalThis.crypto.getRandomValues(new Uint8Array(6))), name: 'Jöns Ü', stars, stats, lastActive: Date.now() - 3600e3, cls: klass };
  const twin = Object.assign({}, prof, { id: B.enc(globalThis.crypto.getRandomValues(new Uint8Array(6))) });
  const r1 = await sandbox.parseResultCode(await sandbox.resultCode(prof), [klass]), r2 = await sandbox.parseResultCode(await sandbox.resultCode(twin), [klass]);
  ok(r1.result && r2.result && r1.result.pid === prof.id && r2.result.pid === twin.id && r1.result.pid !== r2.result.pid, 'gleiche Namen: Profilkennung unterscheidet die Abgaben');
  const code = await sandbox.resultCode(prof);
  ok(code.length < 600, `Abgabe-Code zu lang (${code.length} Zeichen)`);
  const back = await sandbox.parseResultCode(code, [klass]);
  ok(!back.error && back.result.name === 'Jöns Ü', 'Abgabe-Code: Name');
  ok(!back.error && JSON.stringify(Object.entries(back.result.stars).sort()) === JSON.stringify(Object.entries(stars).sort()), 'Abgabe-Code: Sterne hin und zurück');
  ok(!back.error && Object.entries(stats).every(([id, s]) => back.result.stats[id] && back.result.stats[id].n === s.n && back.result.stats[id].e === s.e && back.result.stats[id].h === s.h && back.result.stats[id].t === s.t), 'Abgabe-Code: Statistik hin und zurück');
  const tampered = code.slice(0, 30) + (code[30] === 'A' ? 'B' : 'A') + code.slice(31);
  ok((await sandbox.parseResultCode(tampered, [klass])).error === 'codeBroken', 'veränderter Abgabe-Code wird erkannt');
  const other = Object.assign({}, klass, { id: B.enc(globalThis.crypto.getRandomValues(new Uint8Array(6))) });
  ok((await sandbox.parseResultCode(code, [other])).error === 'codeOtherClass', 'Code fremder Klasse wird erkannt');
  ok((await sandbox.parseResultCode(code, [Object.assign({}, klass, { key: other.key = B.enc(globalThis.crypto.getRandomValues(new Uint8Array(16))) })])).error === 'codeBroken', 'falscher Schlüssel wird erkannt');
  ok((await sandbox.parseResultCode('IW2.' + 'A'.repeat(80), [klass])).error && (await sandbox.parseResultCode('IW1.' + 'A'.repeat(80), [klass])).error === 'codeUnknown', 'Unsinn wird abgelehnt');
  // ---- „108 Lerneinheiten“: jede Station braucht eigene Aufgaben für Stufe 1 und 3 ----
  vm.runInContext("CHAPTERS.flatMap(c => c.stations).map(s => [s.id, !!(s.levels && s.levels[1] && s.levels[3])])", sandbox)
    .forEach(([id, has]) => ok(has, `${id}: keine eigenen Aufgaben für Stufe 1 und 3 (Zahl der Lerneinheiten stimmt dann nicht)`));
  // ---- iOS-Hülle und Versionen ----
  const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
  const appVersion = vm.runInContext("typeof APP === 'object' ? APP.version : null", sandbox);
  ok(appVersion === pkg.version, `Version: package.json ${pkg.version} ≠ APP.version ${appVersion}`);
  const short = pkg.version.split('.').slice(0, 2).join('.');
  ['datenschutz.html', 'datenschutz-en.html'].forEach(f => ok(fs.readFileSync(path.join(WWW, f), 'utf8').toLowerCase().includes('version ' + short), `${f}: Stand nicht auf Version ${short} (python3 tools/make-legal.py)`));
  const capCfg = JSON.parse(fs.readFileSync(path.join(__dirname, 'capacitor.config.json'), 'utf8'));
  ok(capCfg.appId === 'de.maehlmann.informatikwerkstatt' && capCfg.webDir === 'www', 'capacitor.config.json: appId/webDir');
  const plist = fs.readFileSync(path.join(__dirname, 'ios/App/App/Info.plist'), 'utf8');
  ['NSCameraUsageDescription', 'NSPhotoLibraryUsageDescription', 'ITSAppUsesNonExemptEncryption'].forEach(k => ok(plist.includes('<key>' + k + '</key>'), `Info.plist: ${k} fehlt`));
  const pbx = fs.readFileSync(path.join(__dirname, 'ios/App/App.xcodeproj/project.pbxproj'), 'utf8');
  ok(!/mathejahrmarkt/i.test(pbx) && (pbx.match(/PRODUCT_BUNDLE_IDENTIFIER = de\.maehlmann\.informatikwerkstatt;/g) || []).length === 2, 'project.pbxproj: Bundle-ID');
  ok(!/mathe/i.test(plist), 'Info.plist: Reste der Vorlage');
  const icon = fs.readFileSync(path.join(__dirname, 'ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png'));
  ok(icon.readUInt32BE(16) === 1024 && icon.readUInt32BE(20) === 1024 && icon[25] === 2, 'App-Symbol: 1024×1024 ohne Transparenz (RGB)');
  ok(fs.existsSync(path.join(WWW, 'vendor/native.js')) && fs.readFileSync(path.join(WWW, 'vendor/native.js'), 'utf8').includes('isNative'), 'www/vendor/native.js fehlt (npm run native)');
  ok(fs.existsSync(path.join(__dirname, 'ios/App/App/PrivacyInfo.xcprivacy')), 'PrivacyInfo.xcprivacy fehlt');
  console.log(`${checks} Prüfungen, ${fails} Fehler`);
  process.exit(fails ? 1 : 0);
})();

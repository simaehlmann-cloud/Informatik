/* Eltern- und Lehrkraftbereich: Profile verwalten, Klassen, Einsammeln, Auswertung */
'use strict';

let adminUntil = 0; // Fehlversuche und Sperre werden gespeichert – Neuladen hebt sie nicht auf
const ADMIN_MS = 10 * 60 * 1000;
const adminOpen = () => Date.now() < adminUntil;
const adminTitle = () => t(Store.get('mode') === 'home' ? 'adminHome' : Store.get('mode') === 'school' ? 'adminSchool' : 'adminArea');

function adminGate() {
  const input = h('input', { class: 'field pw-field', type: 'password', autocomplete: 'current-password', 'aria-label': t('password'), placeholder: t('password') });
  const err = h('p', { class: 'form-err', 'aria-live': 'polite' });
  const form = h('form', { onsubmit: async e => {
    e.preventDefault();
    const left = Math.ceil((Store.get('adminLock') - Date.now()) / 1000);
    if (left > 0) { err.textContent = t('lockedFor', { s: left }); return; }
    if (await pwVerify(input.value, Store.get('admin'))) { Store.set('adminFails', 0); adminUntil = Date.now() + ADMIN_MS; render(); }
    else {
      const f = Store.get('adminFails') + 1; Store.set('adminFails', f);
      const d = lockDelay(f); if (d) Store.set('adminLock', Date.now() + d);
      input.value = ''; err.textContent = d ? t('lockedFor', { s: Math.ceil(d / 1000) }) : t('pwWrong'); Sound.bad();
    }
  } }, input, err, h('div', { class: 'btn-row' }, h('button', { class: 'btn pri', type: 'submit' }, t('unlock'))));
  setTimeout(() => input.focus(), 80);
  return h('main', { class: 'view' }, topbar(true),
    h('section', { class: 'stage', style: { maxWidth: '520px', margin: '0 auto' } },
      h('button', { class: 'linkish', onclick: () => go('#') }, '← ' + t('back')),
      h('h1', { class: 'admin-h' }, adminTitle()), h('p', null, t('adminGateInfo')), form,
      h('details', { class: 'more' }, h('summary', null, t('adminForgot')), h('p', null, t('adminForgotInfo')),
        h('button', { class: 'btn', onclick: wipeAll }, t('wipeAll')))));
}
function wipeAll() {
  const input = h('input', { class: 'field', autocomplete: 'off', 'aria-label': t('wipeType'), placeholder: t('wipeWord') });
  openSheet(t('wipeAll'), h('form', { onsubmit: e => {
    e.preventDefault();
    if (input.value.trim().toUpperCase() !== t('wipeWord')) { toast(t('wipeType')); return; }
    Store.wipe(); adminUntil = 0; closeSheet(); go('#'); render(); toast(t('wiped'));
  } }, h('p', null, t('wipeInfo')), h('p', null, h('b', null, t('wipeType'))), input,
    h('div', { class: 'btn-row' }, h('button', { class: 'btn pri', type: 'submit', style: { '--c': 'var(--bad)' } }, t('wipeAll')))));
}

/* ---------------- Übersicht ---------------- */
let focusUseMode = false; // aus Einstellungen → Nutzungsart → Ändern: im Bereich direkt zur Nutzungsart springen
function adminView() {
  if (!adminOpen()) return adminGate();
  adminUntil = Date.now() + ADMIN_MS;
  // Wer den Eltern-/Lehrkraftbereich öffnet, meldet das Kinderprofil auf diesem Gerät ab –
  // nach „Sperren & zurück“ erscheint die Profilübersicht, und das Gerät kann weitergegeben werden.
  if (!Store.isFree() && Store.current()) Store.logout();
  if (focusUseMode) {
    focusUseMode = false;
    setTimeout(() => { const el = document.getElementById('adm-mode'); if (el) { el.scrollIntoView({ block: 'center', behavior: 'smooth' }); el.classList.add('flash'); } }, 80);
  }
  Store.purgeExpired();
  const school = Store.get('mode') === 'school';
  const profs = Store.profiles();
  const profCards = profs.length ? h('div', { class: 'adm-grid' }, profs.map(p => {
    const s = summarize(p.stars, p.stats);
    return h('div', { class: 'adm-card' },
      h('div', { class: 'adm-row' }, h('span', { class: 'avatar', style: { background: avatarColor(p.name) } }, initials(p.name)),
        h('div', { style: { flex: 1, minWidth: 0 } }, h('b', null, p.name), h('small', { class: 'sub', style: { display: 'block', margin: 0 } }, p.cls ? p.cls.name : p.lastActive ? t('lastSeen', { d: fmtDate(p.lastActive) }) : t('neverUsed')))),
      progressLine(s),
      h('div', { class: 'btn-row tight' },
        h('button', { class: 'btn', onclick: () => memberDetail(p.name, p.stars, p.stats) }, t('details')),
        h('button', { class: 'btn', onclick: () => resetPassword(p) }, t('pwReset')),
        h('button', { class: 'btn ghost', 'aria-label': t('deleteProfile') + ': ' + p.name, onclick: () => confirmSheet(t('deleteProfile'), t('deleteProfileInfo', { n: p.name }), t('delete'), () => { Store.removeProfile(p.id); render(); }) }, t('delete'))));
  })) : h('p', { class: 'sub' }, t('noProfilesYet'));
  const classes = Store.classes();
  return h('main', { class: 'view' }, topbar(true),
    h('div', { class: 'adm-head' },
      h('button', { class: 'back-btn dark', onclick: () => { adminUntil = 0; go('#'); } }, svg(ICONS.back), t('lockAndBack')),
      h('h1', { class: 'admin-h' }, adminTitle())),
    school ? h('section', { class: 'adm-sec' },
      h('div', { class: 'adm-sec-h' }, h('h2', null, t('classes')), h('button', { class: 'btn pri', onclick: newClass }, svg(ICONS.plus), t('newClass'))),
      classes.length ? h('div', { class: 'adm-grid' }, classes.map(c => h('a', { class: 'adm-card link', href: '#/admin/k/' + encodeURIComponent(c.id) },
        h('b', null, c.name),
        h('small', { class: 'sub', style: { display: 'block', margin: '2px 0 0' } }, t('classMeta', { n: Object.keys(c.results).length, m: Math.max(c.roster.length, Object.keys(c.results).length) }) + ' · ' + t('deletesOn', { d: fmtDate(c.exp) })))))
        : h('p', { class: 'sub' }, t('noClasses'))) : null,
    h('section', { class: 'adm-sec' }, h('div', { class: 'adm-sec-h' }, h('h2', null, t('profilesHere'))), profCards),
    h('section', { class: 'adm-sec' }, h('h2', null, t('settings')),
      h('div', { class: 'setting', id: 'adm-mode' }, h('span', null, t('useMode')), h('div', { class: 'seg-ctl' },
        ['free', 'home', 'school'].map(m => h('button', { 'aria-pressed': String(Store.get('mode') === m), 'data-mode': m, onclick: () => switchMode(m) }, t(m === 'free' ? 'modeFreeShort' : m === 'home' ? 'modeHome' : 'modeSchool'))))),
      h('p', { class: 'sub' }, t('useModeInfo')),
      !Store.isFree() ? h('div', { class: 'setting' }, h('span', null, h('b', null, t('guestAllow')), h('small', { class: 'sub', style: { display: 'block', margin: 0 } }, t('guestAllowSub'))),
        h('button', { class: 'switch', role: 'switch', id: 'guest-switch', 'aria-checked': String(Store.get('guest')), 'aria-label': t('guestAllow'), onclick: e => {
          const v = !Store.get('guest'); Store.set('guest', v); e.currentTarget.setAttribute('aria-checked', String(v));
        } })) : null,
      school ? h('div', { class: 'setting' }, h('span', null, t('nameModeTitle')), h('div', { class: 'seg-ctl' },
        ['self', 'list'].map(m => h('button', { 'aria-pressed': String(Store.get('nameMode') === m), onclick: () => { Store.set('nameMode', m); render(); } }, t(m === 'self' ? 'nameSelfShort' : 'nameListShort'))))) : null,
      h('div', { class: 'setting' }, h('span', null, t('adminPwChange')), h('button', { class: 'btn', onclick: changeAdminPassword }, t('pwChange'))),
      h('div', { class: 'setting' }, h('span', null, t('wipeAll')), h('button', { class: 'btn', onclick: wipeAll }, t('delete')))));
}
function switchMode(m) {
  if (Store.get('mode') === m) return;
  const apply = () => { Store.setMode(m); toast(t('modeChanged')); render(); };
  // Ohne Profile sieht niemand mehr Profile und Klassen – die Daten bleiben aber erhalten
  if (m === 'free' && (Store.profiles().length || Store.classes().length)) confirmSheet(t('modeFreeShort'), t('toFreeInfo'), t('switchMode'), apply);
  else apply();
}
function progressLine(s) {
  return h('div', { class: 'adm-stats' },
    h('div', { class: 'mini-bar' }, h('span', null, h('i', { style: { width: (100 * s.done / s.total) + '%', background: 'var(--pri)' } })), `${s.done}/${s.total}`),
    h('small', null, t('statLine', { s: s.starSum, e: s.errors, m: s.minutes })));
}
function resetPassword(p) {
  confirmSheet(t('pwReset'), t('pwResetInfo', { n: p.name }), t('pwReset'), async () => {
    const otp = makeOtp();
    p.cred = await pwHash(otp); p.mustChange = true; p.fails = 0; p.lockUntil = 0; Store.save();
    openSheet(t('pwReset'), h('div', null, h('p', null, t('otpInfo', { n: p.name })), h('div', { class: 'otp' }, otp), h('p', { class: 'sub' }, t('otpOnce', { n: p.name }))));
  });
}
function changeAdminPassword() {
  openSheet(t('adminPwChange'), pwForm({ name: '', askOld: true, submitLabel: t('save'), onSubmit: async (pw, oldPw) => {
    if (!(await pwVerify(oldPw, Store.get('admin')))) return t('pwOldWrong');
    Store.set('admin', await pwHash(pw)); closeSheet(); toast(t('pwSaved'));
  } }));
}

/* ---------------- Klassen ---------------- */
function newClass() {
  const name = h('input', { class: 'field', maxlength: '40', 'aria-label': t('className'), placeholder: t('classNamePh') });
  const roster = h('textarea', { class: 'code-text', rows: '6', 'aria-label': t('roster'), placeholder: t('rosterPh') });
  const err = h('p', { class: 'form-err' });
  openSheet(t('newClass'), h('form', { onsubmit: e => {
    e.preventDefault();
    const n = name.value.trim();
    if (n.length < 1) { err.textContent = t('classNameMissing'); return; }
    const list = [...new Set(roster.value.split(/[\n,;]+/).map(x => x.trim().slice(0, 30)).filter(Boolean))].slice(0, 40);
    const c = Store.addClass({ id: newId(), name: n, key: B64.enc(randBytes(16)), roster: list, created: Date.now(), exp: schoolYearEnd(), results: {} });
    closeSheet();
    go('#/admin/k/' + encodeURIComponent(c.id));
    setTimeout(() => showClassCode(c), 100);
  } }, h('label', { class: 'lbl' }, t('className')), name,
    h('label', { class: 'lbl' }, t('roster')), h('p', { class: 'sub', style: { margin: '0 0 6px' } }, t(Store.get('nameMode') === 'list' ? 'rosterInfoList' : 'rosterInfoSelf')), roster, err,
    h('p', { class: 'sub' }, t('classExpiry', { d: fmtDate(schoolYearEnd()) })),
    h('div', { class: 'btn-row' }, h('button', { class: 'btn pri', type: 'submit' }, t('createClass')))));
  setTimeout(() => name.focus(), 80);
}
function showClassCode(c) { showCodes(t('classCodeTitle', { c: c.name }), [{ code: classCode(c), label: c.name }], t('classCodeInfo')); }
function collect(c) {
  let changed = false;
  openScanner({ title: t('collectTitle'), continuous: true, hint: t('collectHint'), onClose: () => { if (changed) setTimeout(render, 0); }, onCode: async text => {
    const r = await parseResultCode(text, [c]);
    if (r.error) return { ok: false, msg: t(r.error) };
    const key = r.result.pid;
    const old = c.results[key];
    if (old && old.at >= r.result.at) return { ok: true, msg: t('alreadyHave', { n: r.result.name }), item: r.result.name + ' (' + t('unchanged') + ')' };
    c.results[key] = r.result;
    Store.save();
    changed = true;
    return { ok: true, msg: t('collected', { n: r.result.name }), item: r.result.name };
  } });
}

let classLevel = 0;
function classView(id) {
  if (!adminOpen()) return adminGate();
  adminUntil = Date.now() + ADMIN_MS;
  const c = Store.klass(id);
  if (!c) { go('#/admin'); return h('div'); }
  const rowsData = classRows(c);
  const lvl = classLevel || undefined;
  const chs = CHAPTERS;
  const head = h('tr', null, h('th', { scope: 'col', class: 'hm-name' }, t('name')),
    chs.map(ch => h('th', { scope: 'col', title: L(ch.title), style: { '--c': ch.color } }, h('span', { class: 'hm-ic' }, svg(ICONS[ch.icon])), h('span', { class: 'sr' }, L(ch.title)))),
    h('th', { scope: 'col' }, t('total')));
  const rows = rowsData.map(({ label: n, r }) => {
    if (!r) return h('tr', { class: 'hm-empty' }, h('th', { scope: 'row', class: 'hm-name' }, n), h('td', { colspan: String(chs.length + 1) }, t('noHandIn')));
    const s = summarize(r.stars, r.stats, lvl);
    return h('tr', null,
      h('th', { scope: 'row', class: 'hm-name' }, h('button', { class: 'linkish', onclick: () => memberDetail(n, r.stars, r.stats, r.at) }, n)),
      chs.map(ch => {
        const st = ch.stations.map(x => stationStatus(r.stars, r.stats, x.id, lvl));
        const sure = st.filter(x => x === 2).length, any = st.filter(x => x > 0).length;
        const pct = Math.round(100 * (sure + any) / (2 * st.length));
        return h('td', { class: 'hm-cell', style: { background: `color-mix(in srgb, ${ch.color} ${pct}%, var(--card))`, color: pct > 55 ? '#fff' : 'var(--ink)' }, title: `${L(ch.title)}: ${any}/${st.length}` }, `${any}/${st.length}`);
      }),
      h('td', { class: 'hm-total' }, `${s.done}/${s.total}`));
  });
  // Wo hakt es? Stationen mit den meisten Fehlern pro Versuch
  const agg = {};
  for (const r of Object.values(c.results)) for (const [sid, s] of Object.entries(r.stats)) { const a = agg[sid] || (agg[sid] = { n: 0, e: 0, kids: 0 }); a.n += s.n; a.e += s.e; a.kids++; }
  const hard = Object.entries(agg).filter(([, a]) => a.n >= 2 && a.e > 0).map(([sid, a]) => ({ sid, rate: a.e / a.n, kids: a.kids })).sort((a, b) => b.rate - a.rate).slice(0, 5);
  const stTitle = sid => { const f = findStation(sid); return f ? L(f.ch.title) + ' – ' + L(f.st.title) : sid; };
  return h('main', { class: 'view' }, topbar(true),
    h('div', { class: 'adm-head' },
      h('button', { class: 'back-btn dark', onclick: () => go('#/admin') }, svg(ICONS.back), adminTitle()),
      h('h1', { class: 'admin-h' }, c.name),
      h('p', { class: 'sub' }, t('classMeta', { n: Object.keys(c.results).length, m: rowsData.length }) + ' · ' + t('deletesOn', { d: fmtDate(c.exp) }))),
    rowsData.some(x => x.dup) ? h('div', { class: 'warn' }, svg(ICONS.warn), h('span', null, t('dupNames'))) : null,
    h('div', { class: 'btn-row' },
      h('button', { class: 'btn pri', onclick: () => collect(c) }, t('collect')),
      h('button', { class: 'btn', onclick: () => showClassCode(c) }, t('showClassCode')),
      h('button', { class: 'btn', onclick: () => exportClass(c) }, t('export')),
      h('button', { class: 'btn ghost', onclick: () => confirmSheet(t('deleteClass'), t('deleteClassInfo', { c: c.name }), t('delete'), () => { Store.removeClass(c.id); go('#/admin'); }) }, t('deleteClass'))),
    h('div', { class: 'setting', style: { borderBottom: 0 } }, h('span', null, t('levelLabel')), h('div', { class: 'seg-ctl' },
      [0, 1, 2, 3].map(n => h('button', { 'aria-pressed': String(classLevel === n), onclick: () => { classLevel = n; render(); } }, n ? t('lv' + n) : t('all'))))),
    rowsData.length ? h('div', { class: 'sheet-wrap' }, h('table', { class: 'heatmap' }, h('thead', null, head), h('tbody', null, rows)))
      : h('p', { class: 'sub' }, t('noMembersYet')),
    h('p', { class: 'sub' }, t('heatLegend')),
    hard.length ? h('section', { class: 'adm-sec' }, h('h2', null, t('hardest')),
      h('ol', { class: 'hard-list' }, hard.map(x => h('li', null, h('b', null, stTitle(x.sid)), ' – ', t('hardLine', { r: fmtNum(x.rate, 1), k: x.kids }))))) : null);
}

/** Zeilen einer Klasse: alle Abgaben (nach Name sortiert) und Kürzel der Liste ohne Abgabe.
    Gleiche Namen von verschiedenen Profilen bekommen eine Nummer. */
function classRows(c) {
  const res = Object.values(c.results).sort((a, b) => a.name.localeCompare(b.name, 'de') || a.at - b.at);
  const count = {}, seen = {};
  res.forEach(r => { count[r.name] = (count[r.name] || 0) + 1; });
  const rows = res.map(r => {
    const dup = count[r.name] > 1;
    seen[r.name] = (seen[r.name] || 0) + 1;
    return { label: dup ? `${r.name} (${seen[r.name]})` : r.name, r, dup };
  });
  for (const code of c.roster) if (!count[code]) rows.push({ label: code, r: null });
  return rows;
}

/* ---------------- Einzelansicht ---------------- */
function memberDetail(name, stars, stats, at) {
  const s = summarize(stars, stats);
  const chapters = CHAPTERS.map(ch => {
    const rows = ch.stations.map(st => {
      const status = stationStatus(stars, stats, st.id);
      const x = stats[st.id];
      return h('div', { class: 'md-row' },
        h('span', { class: 'chip s' + status }, t(['stOpen', 'stPractice', 'stSure'][status])),
        h('span', { class: 'md-t' }, L(st.title)),
        h('span', { class: 'md-lv' }, [1, 2, 3].map(l => h('span', { title: t('lv' + l) }, String(stars[st.id + '@' + l] || 0) + '★'))),
        h('small', { class: 'md-x' }, x ? t('mdStat', { n: x.n, e: x.e, m: Math.round(x.t / 60) }) : ''));
    });
    return h('section', { class: 'md-ch', style: { '--c': ch.color } }, h('h3', null, L(ch.title)), rows);
  });
  const practice = CHAPTERS.flatMap(ch => ch.stations.filter(st => stationStatus(stars, stats, st.id) === 1).map(st => L(st.title)));
  openSheet(name, h('div', { class: 'md' },
    at ? h('p', { class: 'sub' }, t('handedInOn', { d: fmtDate(at) })) : null,
    h('div', { class: 'kpis' },
      h('div', { class: 'kpi' }, h('small', null, t('stationsDone')), h('b', null, `${s.done}/${s.total}`)),
      h('div', { class: 'kpi' }, h('small', null, t('starsTotal')), h('b', null, String(s.starSum))),
      h('div', { class: 'kpi' }, h('small', null, t('practiceTime')), h('b', null, s.minutes + ' min'))),
    practice.length ? h('div', { class: 'tip-box' }, t('practiceThese'), ' ', practice.slice(0, 6).join(', ')) : null,
    h('p', { class: 'sub' }, t('mdLegend')),
    chapters));
}

/* ---------------- Export als Tabelle (CSV) ---------------- */
function exportClass(c) {
  const sep = LANG === 'de' ? ';' : ',';
  // Schutz vor Formel-Ausführung beim Öffnen (CSV-Injection): Texte mit = + − @ am Anfang entschärfen
  const q = v => { let s = String(v); if (typeof v === 'string' && /^[=+\-@\t\r]/.test(s)) s = "'" + s; return /[";,\n']/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
  const ids = CHAPTERS.flatMap(ch => ch.stations.map(st => st.id));
  const head = [t('name'), t('handInDate'), t('stationsDone'), t('starsTotal'), t('errors'), t('hintsCol'), t('minutes')].concat(ids.map(id => L(findStation(id).st.title)));
  const lines = [head.map(q).join(sep)];
  for (const { label: n, r } of classRows(c)) {
    if (!r) { lines.push([n, t('noHandIn')].map(q).join(sep)); continue; }
    const s = summarize(r.stars, r.stats);
    lines.push([n, fmtDate(r.at), s.done, s.starSum, s.errors, s.hints, s.minutes].concat(ids.map(id => bestStars(r.stars, id))).map(q).join(sep));
  }
  const csv = '﻿' + lines.join('\r\n');
  const file = `${c.name.replace(/[^\wäöüÄÖÜß-]+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`;
  openSheet(t('export'), h('div', null, h('p', null, t('exportInfo')),
    h('div', { class: 'btn-row' },
      h('button', { class: 'btn pri', onclick: async () => {
        if (window.Native && Native.isNative) {
          try { await Native.shareText(file, csv, c.name); } catch (e) { if (!/cancel/i.test(String(e && e.message))) toast(t('downloadFailed')); }
          return;
        }
        try {
          const a = h('a', { href: URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' })), download: file });
          document.body.append(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
        } catch (e) { toast(t('downloadFailed')); }
      } }, window.Native && Native.isNative ? t('shareFile') : t('download')),
      h('button', { class: 'btn', onclick: () => copyText(csv) }, t('copyTable')))));
}

/* Bit für Bit – Bildschirme, Navigation, Stationsrahmen */
'use strict';

const root = document.getElementById('app');
const TEST = { solver: null, fast: /[?&]fast=1\b/.test(location.search) };
window.__test = {
  solve: () => (TEST.solver ? TEST.solver() : false),
  hasSolver: () => !!TEST.solver,
  setFast: v => { TEST.fast = !!v; }
};

const chapterById = id => CHAPTERS.find(c => c.id === id);
function findStation(id) {
  for (const ch of CHAPTERS) {
    const i = ch.stations.findIndex(s => s.id === id);
    if (i >= 0) return { ch, st: ch.stations[i], index: i };
  }
  return null;
}
function chapterProgress(ch) {
  const done = ch.stations.filter(s => Store.stars(s.id) > 0).length;
  return { done, total: ch.stations.length };
}

/* ---------------- Navigation ---------------- */
function go(hash) {
  if (location.hash === hash) render(); else location.hash = hash;
}
window.addEventListener('hashchange', render);

let leaveCurrent = null;
function render() {
  closeSheet();
  if (leaveCurrent) { leaveCurrent(); leaveCurrent = null; }
  TEST.solver = null;
  const m = location.hash.match(/^#\/(k|s)\/([\w-]+)$/);
  const adm = location.hash.match(/^#\/admin(?:\/k\/([\w-]+))?$/);
  let view;
  if (!Store.get('mode') || (Store.isFree() && location.hash === '#/setup')) view = setupView();
  else if (adm && Store.get('admin')) view = adm[1] ? classView(adm[1]) : adminView(); // ohne Profile und ohne Bereich gibt es nichts zu öffnen
  else if (!Store.current()) view = loginView();
  else if (m && m[1] === 'k' && chapterById(m[2])) view = chapterView(chapterById(m[2]));
  else if (m && m[1] === 's' && findStation(m[2])) view = stationView(findStation(m[2]));
  else view = homeView();
  root.replaceChildren(view);
  window.scrollTo(0, 0);
  document.title = APP.name;
}

/* ---------------- Kopfleiste ---------------- */
function topbar(minimal) {
  const flag = (code, markup, label) => h('button', {
    class: 'flag', 'aria-pressed': String(LANG === code), 'aria-label': label, title: label,
    onclick: () => { if (LANG !== code) { setLang(code); render(); } }
  }, svg(markup));
  return h('header', { class: 'topbar' },
    h('a', { class: 'brand', href: '#', style: { color: 'inherit', textDecoration: 'none' } },
      h('span', { class: 'brand-mark' }, svg(ICONS.logo)), h('span', { class: 'brand-name' }, APP.name)),
    h('div', { class: 'flags' }, flag('de', FLAG_DE, 'Deutsch'), flag('en', FLAG_EN, 'English')),
    !minimal && Store.current() && !Store.current().solo ? h('button', { class: 'avatar-btn', id: 'profile-btn', 'aria-label': t('profileMenu') + ': ' + Store.current().name, title: Store.current().name, onclick: openProfileMenu },
      h('span', { class: 'avatar', style: { background: avatarColor(Store.current().name) } }, initials(Store.current().name))) : null,
    h('button', { class: 'icon-btn', 'aria-label': t('settings'), title: t('settings'), onclick: openSettings }, svg(ICONS.gear)));
}

/* ---------------- Stufen ---------------- */
const LEVEL_DOTS = n => h('span', { class: 'lv-dots', 'aria-hidden': 'true' }, [1, 2, 3].map(k => h('i', { class: k <= n ? 'on' : '' })));
function levelPicker(onPick) {
  return h('div', { class: 'lv-pick', role: 'radiogroup', 'aria-label': t('levelLabel') }, [1, 2, 3].map(n => h('button', {
    class: 'lv-btn', role: 'radio', 'aria-checked': String(Store.levelChosen() && Store.level() === n), 'data-lv': String(n),
    onclick: () => { Store.setLevel(n); Speech.stop(); if (onPick) onPick(n); else render(); }
  }, LEVEL_DOTS(n), h('b', null, t('lv' + n)), h('small', null, t('lv' + n + 'Sub')))));
}
function openLevelChooser() {
  openSheet(t('levelTitle'), h('div', null, h('p', null, t('levelIntro')), levelPicker(() => { closeSheet(); render(); }), h('p', { class: 'sub', style: { marginTop: '12px' } }, t('levelLater'))));
}

/* ---------------- Startseite ---------------- */
function homeView() {
  let done = 0, total = 0;
  for (const ch of CHAPTERS) { const p = chapterProgress(ch); done += p.done; total += p.total; }
  const grid = h('div', { class: 'grid' }, CHAPTERS.map(ch => {
    const p = chapterProgress(ch);
    const card = h('button', {
      class: 'ch-card' + (p.done === p.total ? ' done' : ''), style: { '--c': ch.color },
      onclick: () => go('#/k/' + ch.id)
    },
    h('span', { class: 'ch-icon' }, svg(ICONS[ch.icon])),
    h('span', { class: 'ch-body' },
      h('span', { class: 'ch-title', style: { display: 'block' } }, L(ch.title)),
      h('span', { class: 'ch-sub', style: { display: 'block' } }, L(ch.sub)),
      h('span', { class: 'mini-bar' }, h('span', null, h('i', { style: { width: (100 * p.done / p.total) + '%' } })), `${p.done}/${p.total}`)));
    return card;
  }));
  return h('main', { class: 'view' },
    topbar(),
    h('section', { class: 'hero' },
      h('div', { class: 'hero-deco', 'aria-hidden': 'true' }, '01001001 01001110\n01000110 01001111\nif (x > 3) { … }\n=SUMME(B2:B6)\nKHOOR ZHOW\n#4255E8'),
      h('h1', null, t('heroTitle')),
      h('p', null, t('heroText')),
      h('div', { class: 'hero-progress' },
        h('div', { class: 'hero-bar' }, h('i', { style: { width: (total ? 100 * done / total : 0) + '%' } })),
        h('span', null, t('progressAll', { n: done, m: total })))),
    h('div', { class: 'lv-row' }, h('span', { class: 'lbl', style: { margin: 0 } }, t('levelLabel')), levelPicker()),
    grid,
    h('footer', { class: 'home-foot' },
      h('div', null, t('privacyShort')),
      h('div', { class: 'links' },
        h('button', { class: 'linkish', onclick: openAbout }, t('about')),
        h('a', { href: legalHref('datenschutz') }, t('privacy')),
        h('a', { href: legalHref('impressum') }, t('imprint')))));
}
const legalHref = name => name + (LANG === 'en' ? '-en' : '') + '.html';

/* ---------------- Kapitel ---------------- */
function chapterView(ch) {
  const list = h('div', { class: 'st-list' }, ch.stations.map((st, i) => {
    const s = Store.stars(st.id);
    return h('button', { class: 'st-row' + (s ? ' done' : ''), onclick: () => go('#/s/' + st.id) },
      h('span', { class: 'st-num' }, String(i + 1)),
      h('span', { class: 'st-text' }, h('b', null, L(st.title)), h('small', null, L(st.desc))),
      starRow(s));
  }));
  const view = h('main', { class: 'view', style: { '--c': ch.color } },
    topbar(),
    h('section', { class: 'ch-head' },
      h('div', { class: 'big-icon', 'aria-hidden': 'true' }, svg(ICONS[ch.icon])),
      h('button', { class: 'back-btn', onclick: () => go('#') }, svg(ICONS.back), t('overview')),
      h('h1', null, L(ch.title)),
      h('p', null, L(ch.intro)),
      h('div', { class: 'ch-actions' },
        h('button', { class: 'pill', onclick: () => openMerk(ch) }, svg(ICONS.book), t('merk')),
        h('button', { class: 'pill', onclick: openLevelChooser, 'aria-label': t('levelLabel') + ': ' + t('lv' + Store.level()) }, LEVEL_DOTS(Store.level()), t('lv' + Store.level())))),
    h('div', { class: 'lbl', style: { marginTop: '0' } }, t('stations')),
    list,
    h('div', { class: 'teacher-note' }, h('b', null, t('forTeachers') + ': '), L(ch.kc)));
  return view;
}

function openMerk(ch, focusIndex) {
  const box = h('div', null, ch.merk.map((m, i) => h('section', { class: 'merk', id: 'merk-' + i },
    h('h3', null, L(m.h)), h('div', { html: L(m.p) }))));
  openSheet(t('merk') + ': ' + L(ch.title), box, { color: ch.color });
  if (focusIndex != null) {
    const el = document.getElementById('merk-' + focusIndex);
    if (el) el.scrollIntoView({ block: 'start' });
  }
}

/* ---------------- Station ---------------- */
function stationView({ ch, st: base, index }) {
  const lvl = Store.level();
  const st = resolveStation(base, lvl);
  const state = { errors: 0, hints: 0, hint: null, hintShown: false, roundErrors: 0, finished: false, timers: [], started: Date.now() };
  const steps = h('div', { class: 'steps', 'aria-hidden': 'true' });
  const stepsLabel = h('span', { class: 'sr' });
  const stage = h('section', { class: 'stage', 'aria-labelledby': 'st-h' });
  const fbTitle = h('b'), fbText = h('div'), fbIcon = h('div', { class: 'fb-ic' });
  const fbBtn = h('button', { class: 'btn', id: 'fb-btn' });
  const fbInner = h('div', { class: 'fb-in', role: 'status', 'aria-live': 'assertive' }, fbIcon, h('div', { class: 'fb-txt' }, fbTitle, fbText), fbBtn);
  const fb = h('div', { class: 'fb', id: 'fb' }, fbInner);
  let fbAction = null;
  fbBtn.addEventListener('click', () => { const a = fbAction; hideFb(); if (a) a(); });
  function hideFb() { fb.classList.remove('show', 'ok', 'bad'); fbAction = null; }
  function showFb(kind, title, text, label, action) {
    fb.classList.remove('ok', 'bad');
    fb.classList.add(kind, 'show');
    fbIcon.replaceChildren(svg(kind === 'ok' ? ICONS.check : ICONS.cross));
    fbTitle.textContent = title;
    if (text && text.nodeType) fbText.replaceChildren(text); else fbText.textContent = text || '';
    fbBtn.textContent = label;
    fbAction = action;
    setTimeout(() => { if (fb.classList.contains('show')) fbBtn.focus({ preventScroll: true }); }, 60);
  }
  const praise = () => { const a = t('praise').split('|'); return a[Math.floor(Math.random() * a.length)]; };

  const api = {
    ch, st, fast: () => TEST.fast,
    progress(i, n) {
      steps.replaceChildren(...Array.from({ length: n }, (_, k) => h('i', { class: k < i ? 'done' : k === i ? 'now' : '' })));
      stepsLabel.textContent = t('stepOf', { n: Math.min(i + 1, n), m: n });
    },
    level: lvl,
    setHint(text) { state.hint = text || null; state.hintShown = false; state.roundErrors = 0; },
    ok(text, next) {
      if (state.finished) return;
      Sound.ok();
      showFb('ok', praise(), text, t('next'), next);
    },
    bad(text) {
      if (state.finished) return;
      state.errors++;
      state.roundErrors++;
      Sound.bad();
      let msg = text || t('tryAgain');
      // Nach wiederholten Fehlern hilft die App von selbst (Einsteiger schon nach 2 Fehlern, kostenlos)
      if (state.hint && state.roundErrors >= (lvl === 1 ? 2 : 3)) {
        if (!state.hintShown && lvl > 1) state.hints++;
        state.hintShown = true;
        msg = h('div', null, msg, h('div', { style: { marginTop: '6px' } }, h('b', null, '💡 '), L(state.hint)));
      }
      showFb('bad', t('notYet'), msg, t('retry'), null);
    },
    miss(text) { if (state.finished) return; state.errors++; state.roundErrors++; Sound.bad(); toast(text || t('notYet')); },
    hideFb,
    solver(fn) { TEST.solver = fn; },
    timer(fn, ms) { const id = setTimeout(fn, ms); state.timers.push(id); return id; },
    done() {
      if (state.finished) return;
      state.finished = true;
      hideFb();
      const pen = state.errors + state.hints;
      const stars = pen === 0 ? 3 : pen <= 2 ? 2 : 1;
      const record = Store.setStars(st.id, stars, lvl);
      Store.record(st.id, state.errors, state.hints, (Date.now() - state.started) / 1000);
      Sound.win();
      showResult(stars, record);
    }
  };

  function showResult(stars, record) {
    TEST.solver = null;
    const nextSt = ch.stations[index + 1];
    stage.replaceChildren(h('div', { class: 'result' },
      starRow(stars, 'big-stars'),
      h('h2', null, t('stationDone')),
      h('p', null, t(stars === 3 ? 'res3' : stars === 2 ? 'res2' : 'res1')),
      h('p', { style: { marginTop: '6px', fontSize: '.9rem' } },
        t('lv' + lvl) + ' · ' + t('resStats', { e: state.errors, h: state.hints }) + (record ? ' · ' + t('newBest') : '')),
      h('div', { class: 'btn-row' },
        h('button', { class: 'btn', onclick: () => render() }, t('again')),
        nextSt
          ? h('button', { class: 'btn pri', id: 'res-next', onclick: () => go('#/s/' + nextSt.id) }, t('nextStation'), svg(ICONS.arrow))
          : h('button', { class: 'btn pri', id: 'res-next', onclick: () => go('#/k/' + ch.id) }, t('chapterOverview'), svg(ICONS.arrow)))));
    steps.querySelectorAll('i').forEach(i => { i.className = 'done'; });
  }

  function openHelp() {
    const box = h('div');
    box.append(h('p', null, L(st.how)));
    if (state.hint) {
      if (state.hintShown) box.append(h('div', { class: 'tip-box' }, L(state.hint)));
      else {
        const b = h('button', { class: 'btn', onclick: () => {
          if (!state.hintShown) { state.hintShown = true; if (lvl > 1) state.hints++; }
          b.replaceWith(h('div', { class: 'tip-box' }, L(state.hint)));
        } }, svg(ICONS.bulb), t('showTip'));
        box.append(h('p', { class: 'sub', style: { margin: '0 0 8px' } }, lvl === 1 ? t('tipFree') : t('tipCost')), b);
      }
    }
    if (st.merk != null) box.append(h('div', { class: 'btn-row' }, h('button', { class: 'btn ghost', onclick: () => openMerk(ch, st.merk) }, svg(ICONS.book), t('openMerk'))));
    openSheet(t('help'), box, { color: ch.color });
  }

  const view = h('main', { class: 'view', style: { '--c': ch.color } },
    h('div', { class: 'st-top' },
      h('button', { class: 'icon-btn', 'aria-label': t('backToChapter'), title: t('backToChapter'), onclick: () => go('#/k/' + ch.id) }, svg(ICONS.back)),
      h('div', { class: 'st-title' }, h('small', null, L(ch.title), ' · ', LEVEL_DOTS(lvl)), h('b', { id: 'st-h' }, L(st.title))),
      Speech.ok() ? h('button', { class: 'icon-btn', 'aria-label': t('readAloud'), title: t('readAloud'), onclick: () => {
        const parts = [...stage.querySelectorAll('.task, .sort-card, .rule:not(.ok)')].map(e => e.textContent);
        Speech.speak(parts.join('. '));
      } }, svg(ICONS.speaker)) : null,
      h('button', { class: 'btn help-btn', onclick: openHelp, 'aria-label': t('help') }, svg(ICONS.help), h('span', { class: 'help-lbl' }, t('help')))),
    steps, stepsLabel, stage, h('div', { class: 'stage-pad' }), fb);

  leaveCurrent = () => { state.timers.forEach(clearTimeout); state.finished = true; Speech.stop(); };
  try {
    GAMES[st.type](stage, st, api);
  } catch (e) {
    console.error(e);
    stage.replaceChildren(h('p', null, t('loadError')));
  }
  return view;
}

/* ---------------- Einstellungen & Über ---------------- */
function openSettings() {
  const segBtn = (key, val, label) => h('button', { 'aria-pressed': String(Store.get(key) === val), onclick: e => {
    Store.set(key, val); applyTheme();
    e.currentTarget.parentNode.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b === e.currentTarget)));
  } }, label);
  const sw = (key, onChange) => h('button', { class: 'switch', role: 'switch', 'aria-checked': String(!!Store.get(key)), 'aria-label': t(key === 'big' ? 'bigFont' : 'sound'), onclick: e => {
    const v = !Store.get(key); Store.set(key, v); e.currentTarget.setAttribute('aria-checked', String(v)); if (onChange) onChange();
  } });
  const langBtn = (code, label) => h('button', { 'aria-pressed': String(LANG === code), onclick: () => { setLang(code); render(); openSettings(); } }, label);
  const box = h('div', null,
    h('div', { class: 'setting' }, h('span', null, t('language')), h('div', { class: 'seg-ctl' }, langBtn('de', 'Deutsch'), langBtn('en', 'English'))),
    h('div', { class: 'setting' }, h('span', null, t('theme')), h('div', { class: 'seg-ctl' },
      segBtn('theme', 'auto', t('themeAuto')), segBtn('theme', 'light', t('themeLight')), segBtn('theme', 'dark', t('themeDark')))),
    h('div', { class: 'setting' }, h('span', null, t('bigFont')), sw('big', applyTheme)),
    h('div', { class: 'setting' }, h('span', null, t('sound')), sw('sound')),
    Store.current() ? h('div', { class: 'setting' }, h('span', null, t('progress')), h('button', { class: 'btn', onclick: () =>
      confirmSheet(t('resetTitle'), t('resetText'), t('reset'), () => { Store.resetProgress(); render(); toast(t('resetDone')); }) }, t('reset'))) : null,
    // Ohne Profile: Bereich öffnen, falls schon einmal eingerichtet, sonst Profile einrichten
    Store.get('mode') && Store.get('admin') ? h('div', { class: 'setting' }, h('span', null, adminTitle()), h('a', { class: 'btn', id: 'open-admin', href: '#/admin', onclick: () => closeSheet() }, t('open'))) : null,
    Store.isFree() && !Store.get('admin') ? h('div', { class: 'setting' }, h('span', null, h('b', null, t('setupProfiles')), h('small', { class: 'sub', style: { display: 'block', margin: 0 } }, t('setupProfilesSub'))),
      h('a', { class: 'btn', id: 'setup-profiles', href: '#/setup', onclick: () => closeSheet() }, t('setupStart'))) : null,
    h('div', { class: 'btn-row' },
      h('button', { class: 'btn ghost', onclick: openAbout }, t('about')),
      h('a', { class: 'btn ghost', href: legalHref('datenschutz') }, t('privacy')),
      h('a', { class: 'btn ghost', href: legalHref('impressum') }, t('imprint')),
      h('a', { class: 'btn ghost', href: legalHref('lizenzen') }, t('licenses')),
      h('a', { class: 'btn ghost', href: feedbackHref() }, t('feedback'))),
    h('p', { class: 'sub', style: { marginTop: '16px' } }, t('version', { v: APP.version })));
  openSheet(t('settings'), box);
}
function feedbackHref() {
  const info = `${APP.name} ${APP.version} · ${LANG} · ${navigator.userAgent}`;
  return `mailto:${APP.mail}?subject=${encodeURIComponent(t('feedbackSubject', { app: APP.name }))}&body=${encodeURIComponent(t('feedbackBody', { info }))}`;
}
function openAbout() {
  const count = CHAPTERS.reduce((n, c) => n + c.stations.length, 0);
  openSheet(t('about'), h('div', { class: 'about' },
    h('p', null, t('aboutText', { n: count, k: CHAPTERS.length })),
    h('p', null, t('aboutStars')),
    h('p', null, t('aboutLevels')),
    h('p', null, t('privacyLong')),
    h('h3', null, t('forTeachers')),
    h('p', null, t('teacherText')),
    h('ul', { class: 'kc-list' }, CHAPTERS.map(c => h('li', null, h('i', { style: { background: c.color } }), h('span', null, h('b', null, L(c.title) + ': '), L(c.kc))))),
    h('p', { class: 'sub', style: { marginTop: '14px' } }, t('version', { v: APP.version }))));
}

/* ---------------- Start ---------------- */
setLang(LANG);
applyTheme();
(async () => {
  // App: Ist der Web-Speicher leer, aber eine native Sicherung da (das Betriebssystem hat geräumt), diese zurückholen
  try {
    if (window.Native && Native.isNative && !localStorage.getItem(Store.KEY)) {
      const backup = await Native.prefs.get(Store.KEY);
      if (backup) { localStorage.setItem(Store.KEY, backup); location.reload(); return; }
    }
  } catch (e) { /* ohne Sicherung weiter */ }
  render();
})();

/* Geteilte Geräte: nach 15 Minuten ohne Nutzung abmelden */
let lastTouch = 0;
['pointerdown', 'keydown'].forEach(ev => document.addEventListener(ev, () => { const n = Date.now(); if (n - lastTouch > 20000) { lastTouch = n; if (!Store.idleExpired()) Store.touch(); } }, { passive: true }));
setInterval(() => { if (Store.idleExpired()) { Store.logout(); closeSheet(); render(); toast(t('autoLogout')); } }, 30000);
document.addEventListener('visibilitychange', () => { if (!document.hidden && Store.idleExpired()) { Store.logout(); render(); } });

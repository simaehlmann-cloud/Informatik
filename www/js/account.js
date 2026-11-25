/* Einrichtung, Anmeldung, Profile, Passwort-Formular, QR anzeigen und scannen */
'use strict';

/* ---------------- QR-Code als SVG ---------------- */
function qrSvg(text) {
  const q = qrcode(0, 'M');
  q.addData(text, 'Byte');
  q.make();
  const n = q.getModuleCount(), m = 4;
  let d = '';
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) d += `M${c + m} ${r + m}h1v1h-1z`;
  return svg(`<svg class="qr" viewBox="0 0 ${n + 2 * m} ${n + 2 * m}" shape-rendering="crispEdges" role="img" aria-label="QR-Code"><rect width="100%" height="100%" fill="#fff"/><path d="${d}" fill="#000"/></svg>`);
}
function copyText(text) {
  try { navigator.clipboard.writeText(text).then(() => toast(t('copied')), () => toast(t('copyFailed'))); }
  catch (e) { toast(t('copyFailed')); }
}
/** Zeigt einen oder mehrere QR-Codes (wechseln automatisch) samt Text-Code zum Kopieren */
function showCodes(title, items, note) {
  let i = 0, timer = 0;
  const box = h('div', { class: 'qr-box' });
  const label = h('div', { class: 'qr-label' });
  const count = h('div', { class: 'sub', style: { textAlign: 'center', margin: '4px 0 0' } });
  const ta = h('textarea', { class: 'code-text', readonly: true, rows: '3', 'aria-label': t('textCode') });
  function draw() {
    const it = items[i];
    box.replaceChildren(qrSvg(it.code));
    label.textContent = it.label || '';
    count.textContent = items.length > 1 ? t('codeOf', { n: i + 1, m: items.length }) : '';
    ta.value = it.code;
  }
  draw();
  if (items.length > 1) timer = setInterval(() => { i = (i + 1) % items.length; draw(); }, 2500);
  openSheet(title, h('div', { class: 'qr-sheet' },
    note ? h('p', null, note) : null,
    box, label, count,
    h('details', { class: 'more' }, h('summary', null, t('noCamera')), ta,
      h('div', { class: 'btn-row' }, h('button', { class: 'btn', onclick: () => copyText(ta.value) }, t('copy'))))),
  { onClose: () => clearInterval(timer) });
}

/* ---------------- Scanner: Kamera, Foto oder eingefügter Text ---------------- */
function openScanner({ title, continuous, onCode, hint, onClose }) {
  let stream = null, raf = 0, stopped = false, busy = false;
  const recent = new Map();
  const video = h('video', { playsinline: true, muted: true, class: 'scan-video' });
  const canvas = document.createElement('canvas');
  const status = h('div', { class: 'scan-status', 'aria-live': 'polite' });
  const list = h('ul', { class: 'scan-list' });
  const camBox = h('div', { class: 'scan-cam' }, video, h('div', { class: 'scan-frame' }));
  async function handle(text) {
    if (busy) return;
    const now = Date.now();
    if (recent.has(text) && now - recent.get(text) < 4000) return;
    recent.set(text, now);
    busy = true;
    try {
      const res = await onCode(text);
      status.textContent = res.msg || '';
      status.className = 'scan-status ' + (res.ok ? 'ok' : 'bad');
      if (res.ok) {
        Sound.ok();
        if (continuous) list.prepend(h('li', null, '✓ ' + (res.item || res.msg)));
        else { closeSheet(); return; }
      } else Sound.bad();
    } finally { busy = false; }
  }
  function scanFrame() {
    if (stopped) return;
    if (video.readyState >= 2 && window.jsQR) {
      const w = Math.min(640, video.videoWidth), hh = Math.round(video.videoHeight * w / video.videoWidth);
      canvas.width = w; canvas.height = hh;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(video, 0, 0, w, hh);
      const res = jsQR(ctx.getImageData(0, 0, w, hh).data, w, hh, { inversionAttempts: 'dontInvert' });
      if (res && res.data) handle(res.data);
    }
    raf = setTimeout(() => requestAnimationFrame(scanFrame), 120);
  }
  async function startCam() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { camBox.replaceWith(h('p', { class: 'sub' }, t('camUnavailable'))); return; }
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
      if (stopped) { stream.getTracks().forEach(tr => tr.stop()); return; }
      video.srcObject = stream;
      await video.play();
      scanFrame();
    } catch (e) {
      camBox.replaceWith(h('p', { class: 'sub' }, t('camDenied')));
    }
  }
  const fileIn = h('input', { type: 'file', accept: 'image/*', capture: 'environment', class: 'sr', onchange: e => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const img = new Image();
    img.onload = () => {
      const w = Math.min(1600, img.width), hh = Math.round(img.height * w / img.width);
      canvas.width = w; canvas.height = hh;
      const ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0, w, hh);
      const res = window.jsQR && jsQR(ctx.getImageData(0, 0, w, hh).data, w, hh);
      URL.revokeObjectURL(img.src);
      if (res && res.data) handle(res.data); else { status.textContent = t('noCodeInPhoto'); status.className = 'scan-status bad'; }
      e.target.value = '';
    };
    img.src = URL.createObjectURL(f);
  } });
  const ta = h('textarea', { class: 'code-text', rows: '3', placeholder: t('pasteCode'), 'aria-label': t('pasteCode') });
  openSheet(title, h('div', { class: 'scan-sheet' },
    hint ? h('p', null, hint) : null,
    camBox, status, list,
    h('div', { class: 'btn-row' }, h('label', { class: 'btn' }, fileIn, t('photoCode'))),
    h('details', { class: 'more' }, h('summary', null, t('pasteInstead')), ta,
      h('div', { class: 'btn-row' }, h('button', { class: 'btn pri', onclick: () => { const v = ta.value.trim(); if (v) { recent.delete(v); handle(v); ta.value = ''; } } }, t('apply'))))),
  { onClose: () => { stopped = true; clearTimeout(raf); if (stream) stream.getTracks().forEach(tr => tr.stop()); if (onClose) onClose(); } });
  startCam();
}

/* ---------------- Passwort-Formular mit Regeln und Knack-Zeit ---------------- */
function pwForm({ name, submitLabel, onSubmit, askOld }) {
  const show = h('button', { class: 'linkish', type: 'button', onclick: () => { const v = pw.type === 'password'; [pw, pw2, old].forEach(x => { if (x) x.type = v ? 'text' : 'password'; }); show.textContent = t(v ? 'pwHide' : 'pwShow'); } }, t('pwShow'));
  const old = askOld ? h('input', { class: 'field pw-field', type: 'password', autocomplete: 'current-password', 'aria-label': t('pwOld'), placeholder: t('pwOld') }) : null;
  const pw = h('input', { class: 'field pw-field', type: 'password', autocomplete: 'new-password', autocapitalize: 'off', spellcheck: 'false', 'aria-label': t('pwNew'), placeholder: t('pwNew') });
  const pw2 = h('input', { class: 'field pw-field', type: 'password', autocomplete: 'new-password', autocapitalize: 'off', spellcheck: 'false', 'aria-label': t('pwRepeatLbl'), placeholder: t('pwRepeatLbl') });
  const rules = h('div', { class: 'rules compact' });
  const meter = h('i'), crack = h('span');
  const btn = h('button', { class: 'btn pri', disabled: true, type: 'submit' }, submitLabel);
  const err = h('p', { class: 'form-err', 'aria-live': 'polite' });
  function upd() {
    const r = pwRules(pw.value, { name });
    rules.replaceChildren(...r.map(x => h('div', { class: 'rule' + (x.ok ? ' ok' : '') }, h('span', { class: 'rn' }, x.ok ? '✓' : '✗'), h('span', null, t(x.k)))));
    const sec = pw.value ? pwCrackSeconds(pw.value) : 0;
    const okN = r.filter(x => x.ok).length;
    meter.style.width = (pw.value ? Math.round(100 * okN / r.length) : 0) + '%';
    meter.style.background = okN < 4 ? 'var(--bad)' : okN < r.length ? 'var(--star)' : 'var(--ok)';
    crack.textContent = pw.value ? t('pwCrack', { d: fmtDuration(sec) }) : '';
    btn.disabled = !(r.every(x => x.ok) && pw.value === pw2.value && (!old || old.value));
    err.textContent = pw2.value && pw.value !== pw2.value ? t('pwMismatch') : '';
  }
  [pw, pw2, old].forEach(x => x && x.addEventListener('input', upd));
  const form = h('form', { class: 'pw-form', onsubmit: async e => {
    e.preventDefault();
    if (btn.disabled) return;
    btn.disabled = true;
    try { const msg = await onSubmit(pw.value, old && old.value); if (msg) { err.textContent = msg; btn.disabled = false; } }
    catch (ex) { console.error(ex); err.textContent = t('pwSaveFail'); btn.disabled = false; }
  } },
  old, pw, h('div', { class: 'meter' }, meter), h('div', { class: 'meter-row' }, crack, show), pw2, err, rules,
  pwTips(),
  h('p', { class: 'sub', style: { margin: '10px 0 0' } }, t('pwOwn')),
  h('div', { class: 'btn-row' }, btn));
  upd();
  setTimeout(() => (old || pw).focus(), 80);
  return form;
}

/** Tipps aus dem Lernbaustein „Sichere Passwörter“ – direkt im Formular, ohne es zu verlassen */
function pwTips() {
  const ch = CHAPTERS.find(c => c.id === 'passwort');
  if (!ch) return null;
  return h('details', { class: 'more pw-tips', style: { '--c': ch.color } },
    h('summary', null, '💡 ', t('pwTipsFrom', { t: L(ch.title) })),
    [0, 2].map(i => h('section', { class: 'merk' }, h('h3', null, L(ch.merk[i].h)), h('div', { html: L(ch.merk[i].p) }))),
    Store.current() ? h('p', { class: 'sub' }, h('a', { href: '#/k/passwort', onclick: () => closeSheet() }, t('pwTipsOpen'))) : h('p', { class: 'sub' }, t('pwTipsLater')));
}

/* ---------------- Ersteinrichtung ---------------- */
let setupState = { step: 1, mode: null };
function setupView() {
  const s = setupState;
  const wrap = h('main', { class: 'view setup' }, topbar(true));
  if (!cryptoOk()) {
    wrap.append(h('section', { class: 'stage' }, h('h1', null, t('setupTitle')), h('p', null, t('noCrypto'))));
    return wrap;
  }
  if (s.step === 1) {
    const fromFree = Store.isFree();
    fill(wrap, [...wrap.childNodes], h('section', { class: 'hero' }, h('h1', null, t(fromFree ? 'setupProfiles' : 'setupTitle')), h('p', null, t(fromFree ? 'setupFromFree' : 'setupIntro'))),
      fromFree ? h('button', { class: 'linkish', onclick: () => go('#') }, '← ' + t('back')) : null,
      h('div', { class: 'mode-pick' },
        fromFree ? null : h('button', { class: 'mode-card', 'data-mode': 'free', onclick: () => { Store.setMode('free'); setupState = { step: 1, mode: null }; go('#'); render(); if (!Store.levelChosen()) openLevelChooser(); } },
          h('span', { class: 'mode-emoji', 'aria-hidden': 'true' }, '🚀'), h('b', null, t('modeFree')), h('small', null, t('modeFreeSub'))),
        modeCard('home', '🏠', t('modeHome'), t('modeHomeSub')),
        modeCard('school', '🏫', t('modeSchool'), t('modeSchoolSub'))));
  } else if (s.step === 2) {
    wrap.append(h('section', { class: 'stage' },
      h('button', { class: 'linkish', onclick: () => { s.step = 1; render(); } }, '← ' + t('back')),
      h('h2', null, t(s.mode === 'home' ? 'adminPwTitleHome' : 'adminPwTitleSchool')),
      h('p', null, t(s.mode === 'home' ? 'adminPwInfoHome' : 'adminPwInfoSchool')),
      h('div', { class: 'warn' }, svg(ICONS.warn), h('span', null, t('adminPwWarn'))),
      pwForm({ name: '', submitLabel: t('next'), onSubmit: async pw => {
        Store.set('admin', await pwHash(pw));
        // Modus erst ganz am Ende speichern – sonst springt die App vor der Namensfrage zur Anmeldung
        if (s.mode === 'school') { s.step = 3; render(); } else finishSetup();
      } })));
  } else {
    wrap.append(h('section', { class: 'stage' },
      h('h2', null, t('nameModeTitle')), h('p', null, t('nameModeInfo')),
      h('div', { class: 'mode-pick' },
        h('button', { class: 'mode-card', onclick: () => { Store.set('nameMode', 'self'); finishSetup(); } }, h('b', null, t('nameSelf')), h('small', null, t('nameSelfSub'))),
        h('button', { class: 'mode-card', onclick: () => { Store.set('nameMode', 'list'); finishSetup(); } }, h('b', null, t('nameList')), h('small', null, t('nameListSub'))))));
  }
  return wrap;
  function modeCard(mode, emoji, title, sub) {
    return h('button', { class: 'mode-card', 'data-mode': mode, onclick: () => { s.mode = mode; s.step = 2; render(); } }, h('span', { class: 'mode-emoji', 'aria-hidden': 'true' }, emoji), h('b', null, title), h('small', null, sub));
  }
}
function finishSetup() { Store.setMode(setupState.mode); setupState = { step: 1, mode: null }; toast(t('setupDone')); go('#'); render(); }

/* ---------------- Anmeldung ---------------- */
function loginView() {
  Store.purgeExpired();
  const profs = Store.profiles();
  const now = Date.now();
  const list = h('div', { class: 'prof-list' }, profs.map(p => h('button', { class: 'prof-btn', 'data-id': p.id, onclick: () => openLogin(p) },
    h('span', { class: 'avatar', style: { background: avatarColor(p.name) } }, initials(p.name)),
    h('span', { class: 'prof-text' }, h('b', null, p.name), h('small', null, p.lockUntil > now ? t('locked') : p.cls ? p.cls.name : p.lastActive ? t('lastSeen', { d: fmtDate(p.lastActive) }) : t('neverUsed'))))));
  const joined = profs.filter(p => p.cls);
  return h('main', { class: 'view' }, topbar(true),
    h('section', { class: 'hero hero-small' }, h('h1', null, t('whoLearns')), h('p', null, profs.length ? t('pickProfile') : t('noProfiles'))),
    profs.length ? list : null,
    h('div', { class: 'btn-row' },
      h('button', { class: 'btn pri', id: 'new-profile', onclick: newProfile }, svg(ICONS.plus), t('newProfile')),
      Store.get('guest') ? h('button', { class: 'btn', id: 'guest-login', onclick: () => { Store.loginGuest(t('guest')); go('#'); render(); toast(t('guestToast')); openLevelChooser(); } }, t('guestLogin')) : null,
      Store.get('mode') === 'school' && joined.length ? h('button', { class: 'btn', onclick: () => handInAll(joined) }, t('handInAll', { n: joined.length })) : null),
    h('footer', { class: 'home-foot' },
      h('div', { class: 'links' },
        h('a', { href: '#/admin' }, adminTitle()),
        h('a', { href: legalHref('datenschutz') }, t('privacy')), h('a', { href: legalHref('impressum') }, t('imprint')))));
}
const initials = n => (String(n).trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2) || '?').toUpperCase();
function avatarColor(n) { let x = 0; for (const c of String(n)) x = (x * 31 + c.charCodeAt(0)) >>> 0; return ['#4255E8', '#12A27A', '#F0700E', '#7B4FE8', '#0E93A8', '#E0434F', '#2F6FE0', '#D2367A'][x % 8]; }
const fmtDate = ms => new Date(ms).toLocaleDateString(LANG === 'de' ? 'de-DE' : 'en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });

function openLogin(p) {
  const input = h('input', { class: 'field pw-field', type: 'password', autocomplete: 'current-password', 'aria-label': t('password'), placeholder: t('password') });
  const err = h('p', { class: 'form-err', 'aria-live': 'polite' });
  const btn = h('button', { class: 'btn pri', type: 'submit' }, t('login'));
  let tick = 0;
  function lockedMsg() {
    const left = Math.ceil((p.lockUntil - Date.now()) / 1000);
    if (left > 0) { err.textContent = t('lockedFor', { s: left }); btn.disabled = true; return true; }
    btn.disabled = false; return false;
  }
  const form = h('form', { onsubmit: async e => {
    e.preventDefault();
    if (lockedMsg()) return;
    btn.disabled = true;
    const okPw = await pwVerify(input.value, p.cred);
    if (okPw) {
      p.fails = 0; p.lockUntil = 0; Store.save();
      closeSheet();
      // Nach dem Zurücksetzen erst ein eigenes Passwort festlegen, dann anmelden
      if (p.mustChange) return forceNewPassword(p);
      Store.login(p.id);
      afterLogin();
    } else {
      p.fails++;
      const d = lockDelay(p.fails);
      if (d) p.lockUntil = Date.now() + d;
      Store.save();
      input.value = ''; input.focus();
      if (!lockedMsg()) err.textContent = p.fails >= 3 ? t('pwWrongAsk') : t('pwWrong');
      Sound.bad();
    }
  } }, input, err, h('div', { class: 'btn-row' }, btn));
  openSheet(p.name, h('div', null, form, h('p', { class: 'sub', style: { marginTop: '12px' } }, t('forgotPw'))), { onClose: () => clearInterval(tick) });
  if (lockedMsg()) tick = setInterval(lockedMsg, 1000);
  setTimeout(() => input.focus(), 80);
}
function afterLogin() {
  go('#');
  render();
  if (!Store.levelChosen()) openLevelChooser();
}
function forceNewPassword(p) {
  openSheet(t('pwChangeNeeded'), h('div', null, h('p', null, t('pwChangeNeededInfo')),
    pwForm({ name: p.name, submitLabel: t('save'), onSubmit: async pw => {
      if (await pwVerify(pw, p.cred)) return t('pwSameAsOld');
      p.cred = await pwHash(pw); p.mustChange = false; Store.save();
      closeSheet(); Store.login(p.id); toast(t('pwSaved')); afterLogin();
    } })));
}

/* ---------------- Neues Profil ---------------- */
function newProfile() {
  if (Store.profiles().length >= 40) { toast(t('tooManyProfiles')); return; }
  if (Store.get('mode') === 'school' && Store.get('nameMode') === 'list') {
    openScanner({ title: t('scanClassTitle'), hint: t('scanClassHint'), onCode: async text => {
      const c = parseClassCode(text);
      if (!c) return { ok: false, msg: t('notClassCode') };
      setTimeout(() => pickCode(c), 50);
      return { ok: true, msg: c.name };
    } });
  } else askName(null);
}
function pickCode(c) {
  if (!c.roster.length) return askName(c);
  const used = new Set(Store.profiles().filter(p => p.cls && p.cls.id === c.id).map(p => p.name));
  openSheet(t('pickCodeTitle', { c: c.name }), h('div', null, h('p', null, t('pickCodeInfo')),
    h('div', { class: 'code-grid' }, c.roster.map(code => h('button', { class: 'btn', disabled: used.has(code) ? true : null, onclick: () => setPassword(code, c) }, code)))));
}
function askName(c) {
  const input = h('input', { class: 'field', maxlength: '30', autocomplete: 'off', 'aria-label': t('yourName'), placeholder: t('yourName') });
  const err = h('p', { class: 'form-err' });
  openSheet(t('newProfile'), h('form', { onsubmit: e => {
    e.preventDefault();
    const n = input.value.trim().replace(/\s+/g, ' ');
    if (n.length < 2) { err.textContent = t('nameShort'); return; }
    if (Store.profiles().some(p => p.name.toLowerCase() === n.toLowerCase())) { err.textContent = t('nameTaken'); return; }
    setPassword(n, c);
  } }, h('p', null, t('nameInfo')), input, err, h('div', { class: 'btn-row' }, h('button', { class: 'btn pri', type: 'submit' }, t('next')))));
  setTimeout(() => input.focus(), 80);
}
function setPassword(name, c) {
  openSheet(t('pwChooseTitle', { n: name }), h('div', null, h('p', null, t('pwChooseInfo')),
    pwForm({ name, submitLabel: t('createProfile'), onSubmit: async pw => {
      const p = Store.addProfile({ id: newId(), name, cred: await pwHash(pw), created: Date.now(), cls: c ? { id: c.id, name: c.name, key: c.key, exp: c.exp } : null });
      closeSheet();
      Store.login(p.id);
      toast(t('profileCreated', { n: name }));
      afterLogin();
    } })));
}

/* ---------------- Profilmenü ---------------- */
function openProfileMenu() {
  const p = Store.current();
  if (!p || p.solo) return;
  if (p.guest) {
    return openSheet(p.name, h('div', { class: 'menu-list' },
      h('p', { class: 'sub' }, t('guestInfo')),
      h('button', { class: 'btn', onclick: openLevelChooser }, LEVEL_DOTS(Store.level()), t('levelLabel') + ': ' + t('lv' + Store.level())),
      h('button', { class: 'btn', id: 'logout', onclick: () => { closeSheet(); Store.logout(); go('#'); render(); } }, t('guestEnd'))));
  }
  const school = Store.get('mode') === 'school';
  openSheet(p.name, h('div', { class: 'menu-list' },
    h('p', { class: 'sub' }, p.cls ? t('inClass', { c: p.cls.name }) : school ? t('noClass') : ''),
    h('button', { class: 'btn', onclick: openLevelChooser }, LEVEL_DOTS(Store.level()), t('levelLabel') + ': ' + t('lv' + Store.level())),
    school ? h('button', { class: 'btn', onclick: () => joinClass(p) }, t(p.cls ? 'changeClass' : 'joinClass')) : null,
    school && p.cls ? h('button', { class: 'btn pri', onclick: () => handIn(p) }, t('handIn')) : null,
    h('button', { class: 'btn', onclick: () => changePassword(p) }, t('pwChange')),
    h('button', { class: 'btn ghost', id: 'delete-own', onclick: () => deleteOwnProfile(p) }, t('deleteOwn')),
    h('button', { class: 'btn', id: 'logout', onclick: () => { closeSheet(); Store.logout(); go('#'); render(); toast(t('loggedOut')); } }, t('logout'))));
}
/** Eigenes Profil löschen (App-Vertriebe verlangen, dass angelegte Konten in der App gelöscht werden können) */
function deleteOwnProfile(p) {
  const input = h('input', { class: 'field pw-field', type: 'password', autocomplete: 'current-password', 'aria-label': t('password'), placeholder: t('password') });
  const err = h('p', { class: 'form-err', 'aria-live': 'polite' });
  openSheet(t('deleteOwn'), h('form', { onsubmit: async e => {
    e.preventDefault();
    if (!(await pwVerify(input.value, p.cred))) { err.textContent = t('pwWrong'); input.value = ''; return; }
    Store.removeProfile(p.id);
    closeSheet(); go('#'); render(); toast(t('ownDeleted'));
  } }, h('p', null, t('deleteOwnInfo')), input, err,
    h('div', { class: 'btn-row' }, h('button', { class: 'btn pri', type: 'submit', style: { '--c': 'var(--bad)' } }, t('deleteOwnBtn')))));
  setTimeout(() => input.focus(), 80);
}
function changePassword(p) {
  openSheet(t('pwChange'), pwForm({ name: p.name, askOld: true, submitLabel: t('save'), onSubmit: async (pw, oldPw) => {
    if (!(await pwVerify(oldPw, p.cred))) return t('pwOldWrong');
    if (await pwVerify(pw, p.cred)) return t('pwSameAsOld');
    p.cred = await pwHash(pw); Store.save(); closeSheet(); toast(t('pwSaved'));
  } }));
}
function joinClass(p) {
  openScanner({ title: t('scanClassTitle'), hint: t('scanClassHint'), onCode: async text => {
    const c = parseClassCode(text);
    if (!c) return { ok: false, msg: t('notClassCode') };
    if (c.exp && c.exp < Date.now()) return { ok: false, msg: t('classExpired') };
    p.cls = { id: c.id, name: c.name, key: c.key, exp: c.exp };
    Store.save();
    setTimeout(() => toast(t('joined', { c: c.name })), 60);
    return { ok: true, msg: t('joined', { c: c.name }) };
  } });
}
async function handIn(p) {
  showCodes(t('handInTitle'), [{ code: await resultCode(p), label: p.name }], t('handInInfo'));
}
async function handInAll(profiles) {
  const items = [];
  for (const p of profiles) items.push({ code: await resultCode(p), label: p.name });
  showCodes(t('handInAllTitle'), items, t('handInAllInfo'));
}

/* Passwörter, Verschlüsselung, Phishing */
'use strict';

const ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const lettersOnly = s => String(s).toUpperCase().replace(/[^A-Z]/g, '');
function caesar(text, k) {
  return String(text).toUpperCase().replace(/[A-Z]/g, ch => ABC[(ABC.indexOf(ch) + k % 26 + 26) % 26]);
}
function vigenere(text, key, dir = 1) {
  const k = lettersOnly(key);
  let j = 0;
  return lettersOnly(text).split('').map(ch => ABC[(ABC.indexOf(ch) + dir * ABC.indexOf(k[j++ % k.length]) + 26) % 26]).join('');
}

/* ---------------- Passwort-Baustelle ---------------- */
GAMES.pwbuild = function (host, st, api) {
  api.progress(0, 1);
  api.setHint(st.hint);
  const rules = st.rules;
  let reached = 1;
  const input = h('input', { class: 'field pw-field', type: 'text', autocomplete: 'off', autocapitalize: 'off', autocorrect: 'off', spellcheck: 'false', 'aria-label': t('pwInput'), placeholder: t('pwPlaceholder') });
  const meter = h('i');
  const lenLbl = h('span'), okLbl = h('span');
  const list = h('div', { class: 'rules', 'aria-live': 'polite' });
  const done = h('button', { class: 'btn pri', disabled: true, onclick: () => api.ok(L(st.final), () => api.done()) }, t('finished'));
  function upd() {
    const s = input.value;
    const res = rules.map(r => !!r.test(s, LANG));
    const firstFail = res.indexOf(false);
    reached = Math.max(reached, firstFail < 0 ? rules.length : firstFail + 1);
    if (s.length === 0) reached = Math.max(reached, 1);
    const shown = rules.slice(0, reached).map((r, k) => ({ r, k, ok: res[k] }));
    shown.sort((a, b) => (a.ok - b.ok) || (b.k - a.k));
    list.replaceChildren(...shown.map(({ r, k, ok }) => h('div', { class: 'rule' + (ok ? ' ok' : '') },
      h('span', { class: 'rn' }, t('ruleN', { n: k + 1 })), h('span', null, L(r.t)))));
    const nOk = res.filter(Boolean).length;
    const pct = Math.round(100 * nOk / rules.length);
    meter.style.width = pct + '%';
    meter.style.background = pct < 40 ? 'var(--bad)' : pct < 80 ? 'var(--star)' : 'var(--ok)';
    lenLbl.textContent = t('chars', { n: [...s].length });
    okLbl.textContent = t('rulesOk', { n: nOk, m: rules.length });
    done.disabled = firstFail >= 0;
  }
  input.addEventListener('input', upd);
  fill(host, 
    h('div', { class: 'warn' }, svg(ICONS.warn), h('span', null, t('pwWarn'))),
    h('p', { class: 'task' }, L(st.task)),
    input,
    h('div', { class: 'meter' }, meter),
    h('div', { class: 'meter-row' }, lenLbl, okLbl),
    list,
    h('div', { class: 'btn-row' }, done));
  upd();
  api.solver(() => { input.value = L(st.example); upd(); done.click(); return true; });
};

/* ---------------- Knack-Rechner ---------------- */
const CHARSETS = [
  { id: 'lower', label: 'a–z', n: 26 },
  { id: 'upper', label: 'A–Z', n: 26 },
  { id: 'digits', label: '0–9', n: 10 },
  { id: 'special', label: '!?#%…', n: 33 }
];
const GUESSES_PER_SECOND = 1e10;
function fmtBig(n) {
  if (n < 1e6) return fmtNum(Math.round(n), 0);
  const e = Math.floor(Math.log10(n));
  const m = n / Math.pow(10, e);
  return h('span', null, fmtNum(m, 1) + ' · 10', h('sup', null, String(e)));
}
function fmtDuration(sec) {
  const Y = 365.25 * 86400;
  const u = (v, one, many) => fmtNum(v, v < 10 ? 1 : 0) + ' ' + (Math.round(v * 10) / 10 === 1 ? one : many);
  if (sec < 1) return t('durInstant');
  if (sec < 60) return u(sec, t('second'), t('seconds'));
  if (sec < 3600) return u(sec / 60, t('minute'), t('minutes'));
  if (sec < 86400) return u(sec / 3600, t('hour'), t('hours'));
  if (sec < Y) return u(sec / 86400, t('day'), t('days'));
  if (sec < 1e6 * Y) return u(sec / Y, t('year'), t('years'));
  if (sec < 1e9 * Y) return u(sec / Y / 1e6, t('mioYear'), t('mioYears'));
  return t('durForever');
}
function minLength(n, sec) { let l = 1; while (Math.pow(n, l) / GUESSES_PER_SECOND <= sec) l++; return l; }

GAMES.pwcrack = function (host, st, api) {
  let i = 0;
  function show() {
    if (i >= st.rounds.length) return api.done();
    api.progress(i, st.rounds.length);
    const rd = st.rounds[i];
    api.setHint(rd.hint);
    const on = new Set(['lower']);
    let len = 6;
    const combos = h('b'), time = h('b');
    const lenOut = h('output', null, String(len));
    const slider = h('input', { type: 'range', min: '1', max: '20', value: String(len), 'aria-label': t('length'), oninput: e => { len = Number(e.target.value); upd(); } });
    const tg = CHARSETS.map(cs => h('button', { class: 'tgl', 'aria-pressed': String(on.has(cs.id)), 'data-cs': cs.id, onclick: e => {
      if (on.has(cs.id)) { if (on.size > 1) on.delete(cs.id); } else on.add(cs.id);
      e.currentTarget.setAttribute('aria-pressed', String(on.has(cs.id)));
      upd();
    } }, cs.label));
    const N = () => CHARSETS.filter(c => on.has(c.id)).reduce((a, c) => a + c.n, 0);
    function upd() {
      const n = N(), total = Math.pow(n, len);
      lenOut.textContent = String(len);
      combos.replaceChildren(fmtBig(total));
      time.textContent = fmtDuration(total / GUESSES_PER_SECOND);
      tg.forEach(b => b.setAttribute('aria-pressed', String(on.has(b.dataset.cs))));
    }
    function doCheck() {
      if (rd.sets) {
        const want = new Set(rd.sets);
        const same = want.size === on.size && [...want].every(x => on.has(x));
        if (!same) return api.bad(t('crackSets'));
      }
      const need = minLength(N(), rd.sec);
      if (len < need) api.bad(t('crackShort'));
      else if (len > need && !rd.atLeast) api.bad(t('crackLong'));
      else api.ok(L(rd.why), () => { i++; show(); });
    }
    fill(host, 
      h('p', { class: 'task' }, L(rd.q)),
      h('p', { class: 'sub' }, t('crackAssume')),
      h('div', { class: 'lbl' }, t('charsets')), h('div', { class: 'toggles' }, tg),
      h('div', { class: 'range-row' }, h('span', null, t('length') + ':'), slider, lenOut),
      h('div', { class: 'kpis' },
        h('div', { class: 'kpi' }, h('small', null, t('possibilities')), combos),
        h('div', { class: 'kpi' }, h('small', null, t('crackTime')), time)),
      h('div', { class: 'btn-row' }, h('button', { class: 'btn pri', onclick: doCheck }, t('check'))));
    upd();
    api.solver(() => {
      on.clear(); (rd.sets || ['lower', 'upper', 'digits', 'special']).forEach(x => on.add(x));
      len = minLength(N(), rd.sec); slider.value = String(len); upd(); doCheck(); return true;
    });
  }
  show();
};

/* ---------------- Caesar-Scheibe ---------------- */
function caesarDisk() {
  const step = 360 / 26;
  let outer = '', inner = '', lines = '';
  for (let i = 0; i < 26; i++) {
    const a = i * step;
    outer += `<text x="150" y="${150 - 127}" font-size="17" transform="rotate(${a} 150 150)">${ABC[i]}</text>`;
    inner += `<text x="150" y="${150 - 90}" font-size="16" transform="rotate(${a} 150 150)" class="il">${ABC[i]}</text>`;
    lines += `<line x1="150" y1="${150 - 145}" x2="150" y2="${150 - 110}" transform="rotate(${a + step / 2} 150 150)"/>`;
  }
  const el = svg(`<svg class="disk" viewBox="0 0 300 300" role="img">
    <circle cx="150" cy="150" r="146" fill="var(--card2)" stroke="var(--line)" stroke-width="2"/>
    <g stroke="var(--line)" stroke-width="1.5">${lines}</g>
    <g fill="var(--ink)">${outer}</g>
    <g class="inner">
      <circle cx="150" cy="150" r="109" fill="color-mix(in srgb, var(--c) 16%, var(--card))" stroke="var(--c)" stroke-width="2"/>
      <g fill="var(--c)">${inner}</g>
      <circle cx="150" cy="150" r="70" fill="var(--card)" stroke="var(--line)" stroke-width="2"/>
    </g>
    <path d="M150 2 l-7 -0 l7 12 l7 -12 z" fill="var(--ink)"/>
    <text x="150" y="142" font-size="13" fill="var(--muted)" class="lab1"></text>
    <text x="150" y="164" font-size="30" fill="var(--ink)" class="lab2">0</text>
  </svg>`);
  return {
    el,
    set(k) {
      el.querySelector('.inner').style.transform = `rotate(${-k * step}deg)`;
      el.querySelector('.lab2').textContent = String(k);
    },
    label(s) { el.querySelector('.lab1').textContent = s; }
  };
}
function caesarStrip(k) {
  return h('div', { class: 'strip', 'aria-hidden': 'true' },
    h('div', null, ABC.split('').map(c => h('span', null, c))),
    h('div', null, ABC.split('').map((c, i) => h('span', null, ABC[(i + k) % 26]))));
}

GAMES.caesar = function (host, st, api) {
  let i = 0;
  function show() {
    if (i >= st.rounds.length) return api.done();
    api.progress(i, st.rounds.length);
    const rd = st.rounds[i];
    api.setHint(rd.hint || t('caesarHint', { k: rd.key }));
    const word = L(rd.text);
    const target = rd.mode === 'enc' ? caesar(word, rd.key) : caesar(word, -rd.key);
    const shown = rd.mode === 'enc' ? word : caesar(word, rd.key);
    let k = 0;
    const disk = caesarDisk();
    disk.label(t('key'));
    const stripHost = h('div');
    const kOut = h('b', null, '0');
    const setK = v => { k = (v + 26) % 26; disk.set(k); kOut.textContent = String(k); stripHost.replaceChildren(caesarStrip(k)); };
    const input = h('input', { class: 'field mono', autocomplete: 'off', autocapitalize: 'characters', spellcheck: 'false', 'aria-label': t('yourAnswer'), placeholder: t('answer'), onkeydown: e => { if (e.key === 'Enter') doCheck(); } });
    function doCheck() {
      const v = lettersOnly(input.value);
      if (!v) { toast(t('enterAnswer')); return; }
      if (v === lettersOnly(target)) api.ok(t('caesarOk', { a: shown, b: target, k: rd.key }), () => { i++; show(); });
      else api.bad(t('caesarWrong'));
    }
    fill(host, 
      h('p', { class: 'task' }, rd.mode === 'enc' ? t('caesarEnc', { k: rd.key }) : t('caesarDec', { k: rd.key })),
      h('div', { class: 'cipherbox' + (rd.mode === 'enc' ? ' plain' : '') }, shown),
      h('div', { class: 'disk-wrap', style: st.noDisk ? { gridTemplateColumns: 'minmax(0, 1fr)' } : null },
        st.noDisk ? null : h('div', null, disk.el,
          h('div', { class: 'keyctl' },
            h('button', { class: 'icon-btn', 'aria-label': t('keyMinus'), onclick: () => setK(k - 1) }, svg(ICONS.minus)),
            h('span', null, t('key') + ': ', kOut),
            h('button', { class: 'icon-btn', 'aria-label': t('keyPlus'), onclick: () => setK(k + 1) }, svg(ICONS.plus)))),
        h('div', null,
          st.noDisk ? null : h('p', { class: 'sub', style: { margin: '0 0 10px' } }, rd.mode === 'enc' ? t('diskReadEnc') : t('diskReadDec')),
          st.noDisk ? h('p', { class: 'sub', style: { margin: '0 0 10px' } }, t('noDisk')) : stripHost,
          h('div', { class: 'lbl' }, rd.mode === 'enc' ? t('cipherText') : t('plainText')),
          h('div', { class: 'answer-row' }, input, h('button', { class: 'btn pri', onclick: doCheck }, t('check'))))));
    setK(0);
    api.solver(() => { input.value = target; doCheck(); return true; });
  }
  show();
};

/* ---------------- Caesar knacken ---------------- */
GAMES.crack = function (host, st, api) {
  let i = 0;
  function show() {
    if (i >= st.rounds.length) return api.done();
    api.progress(i, st.rounds.length);
    const rd = st.rounds[i];
    api.setHint(t('crackHint', { e: LANG === 'de' ? 'E' : 'E' }));
    const plain = L(rd.text);
    const cipher = caesar(plain, rd.key);
    let s = 0;
    const out = h('div', { class: 'cipherbox plain', 'aria-live': 'polite' });
    const sOut = h('output', null, '0');
    const slider = h('input', { type: 'range', min: '0', max: '25', value: '0', 'aria-label': t('shift'), oninput: e => { s = Number(e.target.value); upd(); } });
    function upd() { out.textContent = caesar(cipher, -s); sOut.textContent = String(s); }
    // Häufigkeit der Buchstaben im Geheimtext
    const cnt = ABC.split('').map(c => cipher.split('').filter(x => x === c).length);
    const max = Math.max(...cnt);
    let bars = '';
    cnt.forEach((v, k) => {
      const hgt = max ? 86 * v / max : 0;
      bars += `<rect x="${k * 10 + 1}" y="${94 - hgt}" width="8" height="${hgt}" rx="2" fill="${v === max ? 'var(--c)' : 'var(--muted)'}" opacity="${v === max ? 1 : .45}"/>`;
      bars += `<text x="${k * 10 + 5}" y="108" font-size="7" text-anchor="middle" fill="var(--muted)" font-family="var(--mono)">${ABC[k]}</text>`;
    });
    const chart = svg(`<svg class="freq" viewBox="0 0 260 112" role="img" aria-label="${t('freqAria')}">${bars}</svg>`);
    function doCheck() {
      if (s === rd.key) api.ok(t('crackOk', { k: rd.key }), () => { i++; show(); });
      else api.bad(t('crackWrong'));
    }
    fill(host, 
      h('p', { class: 'task' }, t('crackTask')),
      h('div', { class: 'lbl' }, t('cipherText')), h('div', { class: 'cipherbox' }, cipher),
      h('div', { class: 'lbl' }, t('freq')), chart,
      h('div', { class: 'range-row' }, h('span', null, t('shift') + ':'), slider, sOut),
      h('div', { class: 'lbl' }, t('decrypted')), out,
      h('div', { class: 'btn-row' }, h('button', { class: 'btn pri', onclick: doCheck }, t('readable'))));
    upd();
    api.solver(() => { s = rd.key; slider.value = String(s); upd(); doCheck(); return true; });
  }
  show();
};

/* ---------------- Vigenère ---------------- */
GAMES.vig = function (host, st, api) {
  let i = 0;
  function show() {
    if (i >= st.rounds.length) return api.done();
    api.progress(i, st.rounds.length);
    const rd = st.rounds[i];
    api.setHint(t('vigHint'));
    const plain = lettersOnly(L(rd.text)), key = lettersOnly(L(rd.key));
    const cipher = vigenere(plain, key, 1);
    const given = rd.mode === 'enc' ? plain : cipher;
    const want = rd.mode === 'enc' ? cipher : plain;
    const keyRow = given.split('').map((c, j) => key[j % key.length]);
    const inputs = want.split('').map((c, j) => h('input', { class: 'vc', maxlength: '2', autocomplete: 'off', autocapitalize: 'characters', spellcheck: 'false', 'aria-label': t('letterN', { n: j + 1 }), oninput: e => {
      const v = lettersOnly(e.target.value);
      e.target.value = v.slice(-1);
      e.target.classList.remove('bad', 'good');
      if (e.target.value && inputs[j + 1]) inputs[j + 1].focus();
    }, onkeydown: e => {
      if (e.key === 'Backspace' && !e.target.value && inputs[j - 1]) inputs[j - 1].focus();
      if (e.key === 'Enter') doCheck();
    } }));
    const row = (label, cells) => h('div', { class: 'vig-row' }, h('span', { class: 'rl' }, label), cells);
    function doCheck() {
      if (inputs.some(x => !x.value)) { toast(t('fillAll')); return; }
      let wrong = 0;
      inputs.forEach((x, j) => { const ok = x.value === want[j]; x.classList.toggle('good', ok); x.classList.toggle('bad', !ok); if (!ok) wrong++; });
      if (!wrong) api.ok(t('vigOk', { a: given, b: want, k: key }), () => { i++; show(); });
      else api.bad(t('vigWrong', { n: wrong }));
    }
    fill(host, 
      h('p', { class: 'task' }, rd.mode === 'enc' ? t('vigEnc', { k: key }) : t('vigDec', { k: key })),
      h('div', { class: 'vig' },
        row(rd.mode === 'enc' ? t('plainText') : t('cipherText'), given.split('').map(c => h('span', { class: 'vc' }, c))),
        row(t('key'), keyRow.map(c => h('span', { class: 'vc k' }, c))),
        row(t('shift'), keyRow.map(c => h('span', { class: 'vc n' }, (rd.mode === 'enc' ? '+' : '−') + ABC.indexOf(c)))),
        row(rd.mode === 'enc' ? t('cipherText') : t('plainText'), inputs)),
      h('div', { class: 'btn-row' }, h('button', { class: 'btn pri', onclick: doCheck }, t('check'))),
      h('div', { class: 'alpha', 'aria-hidden': 'true' }, ABC.split('').map((c, k) => h('span', null, h('b', null, c), String(k)))));
    api.solver(() => { inputs.forEach((x, j) => { x.value = want[j]; }); doCheck(); return true; });
  }
  show();
};

/* ---------------- Phishing-Postfach ---------------- */
GAMES.phish = function (host, st, api) {
  let i = 0;
  function show() {
    if (i >= st.mails.length) return api.done();
    api.progress(i, st.mails.length);
    const mail = st.mails[i];
    api.setHint(t('phishHint'));
    const segs = [];
    const seg = s => {
      const b = h('button', { class: 'seg', 'aria-pressed': 'false', onclick: () => {
        const v = b.getAttribute('aria-pressed') !== 'true';
        b.setAttribute('aria-pressed', String(v)); b.classList.toggle('mark', v);
        b.classList.remove('missed');
      } }, L(s.t));
      segs.push({ s, b });
      return b;
    };
    const card = h('div', { class: 'mail' },
      h('div', { class: 'mail-head' },
        h('div', null, h('span', { class: 'ml' }, t('mailFrom')), seg(mail.from)),
        h('div', null, h('span', { class: 'ml' }, t('mailSubject')), seg(mail.subject))),
      h('div', { class: 'mail-body' }, mail.body.map(s => h('div', null, seg(s)))));
    function doCheck() {
      const sus = segs.filter(x => x.s.sus);
      const found = sus.filter(x => x.b.getAttribute('aria-pressed') === 'true').length;
      const falsePos = segs.filter(x => !x.s.sus && x.b.getAttribute('aria-pressed') === 'true').length;
      if (found === sus.length && falsePos === 0) {
        segs.forEach(x => { if (x.s.sus) { x.b.classList.remove('mark'); x.b.classList.add('found'); } x.b.disabled = true; });
        const list = h('ul', { class: 'why-list' }, sus.map(x => h('li', null, L(x.s.why))));
        api.ok(h('div', null, t('phishOk'), list), () => { i++; show(); });
      } else {
        api.bad(t('phishWrong', { f: found, n: sus.length, w: falsePos }));
      }
    }
    fill(host, 
      h('p', { class: 'task' }, t('phishTask')),
      card,
      h('div', { class: 'btn-row' }, h('button', { class: 'btn pri', onclick: doCheck }, t('check'))));
    api.solver(() => {
      segs.forEach(x => { x.b.setAttribute('aria-pressed', String(!!x.s.sus)); x.b.classList.toggle('mark', !!x.s.sus); });
      doCheck(); return true;
    });
  }
  show();
};

/* Tabellenkalkulation: Zellen-Detektiv, Formel-Rechner, Filtern & Sortieren */
'use strict';

const COLS = 'ABCDEFGH';
const addr = (c, r) => COLS[c] + (r + 1);
function parseAddr(a) { return { c: COLS.indexOf(a[0]), r: Number(a.slice(1)) - 1 }; }
function parseRange(rg) {
  const [a, b] = rg.split(':').map(parseAddr);
  return { c1: Math.min(a.c, b.c), c2: Math.max(a.c, b.c), r1: Math.min(a.r, b.r), r2: Math.max(a.r, b.r) };
}
function cellText(cell) {
  if (!cell) return '';
  if (typeof cell.v === 'number') return cell.money ? cell.v.toLocaleString(LANG === 'de' ? 'de-DE' : 'en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : fmtNum(cell.v);
  return L(cell.v);
}

/** Zeichnet eine Tabelle mit Namensfeld und Bearbeitungsleiste. */
function sheetWidget(rows, opts = {}) {
  const nb = h('div', { class: 'nb' }, '–');
  const fv = h('div', { class: 'fv' }, '');
  const fbar = h('div', { class: 'fbar' }, nb, h('div', { class: 'fx' }, 'fx'), fv);
  const nCols = Math.max(...rows.map(r => r.length));
  const tds = [];
  const table = h('table', { class: 'sheet' },
    h('thead', null, h('tr', null, h('th', null, ''), Array.from({ length: nCols }, (_, c) => h('th', { scope: 'col' }, COLS[c])))),
    h('tbody', null, rows.map((row, r) => {
      tds[r] = [];
      return h('tr', null, h('th', { scope: 'row' }, String(r + 1)), Array.from({ length: nCols }, (_, c) => {
        const cell = row[c];
        const td = h('td', { class: (cell && typeof cell.v === 'number' ? 'num' : '') + (r === 0 ? ' hd' : '') },
          h('button', { 'aria-label': addr(c, r) + (cell ? ': ' + cellText(cell) : ''), onclick: () => opts.onCell && opts.onCell(c, r) }, cellText(cell)));
        tds[r][c] = td;
        return td;
      }));
    })));
  function show(c, r) {
    const cell = rows[r] && rows[r][c];
    nb.textContent = addr(c, r);
    fv.textContent = cell ? (cell.f ? L(cell.f) : cellText(cell)) : '';
  }
  function showRange(rg) { nb.textContent = rg; fv.textContent = ''; }
  function clear() { tds.flat().forEach(td => td.classList.remove('sel', 'inrange', 'good')); }
  function mark(c1, r1, c2, r2, cls) {
    for (let r = r1; r <= r2; r++) for (let c = c1; c <= c2; c++) tds[r][c].classList.add(cls);
  }
  return { el: h('div', { class: 'sheet-wrap' }, fbar, table), show, showRange, clear, mark, td: (c, r) => tds[r][c] };
}

/* ---------------- Zellen-Detektiv ---------------- */
GAMES.cells = function (host, st, api) {
  const rounds = st.rounds;
  let i = 0;
  function show() {
    if (i >= rounds.length) return api.done();
    api.progress(i, rounds.length);
    const rd = rounds[i];
    api.setHint(rd.hint || st.hint);
    let sel = null, anchor = null;
    const check = h('button', { class: 'btn pri', disabled: true, onclick: doCheck }, t('check'));
    const sheet = sheetWidget(DATA.shop, { onCell: (c, r) => {
      sheet.clear();
      if (rd.mode === 'range') {
        if (!anchor || sel) { anchor = { c, r }; sel = null; sheet.mark(c, r, c, r, 'sel'); sheet.show(c, r); }
        else {
          const rg = { c1: Math.min(anchor.c, c), c2: Math.max(anchor.c, c), r1: Math.min(anchor.r, r), r2: Math.max(anchor.r, r) };
          sel = rg;
          sheet.mark(rg.c1, rg.r1, rg.c2, rg.r2, 'inrange');
          sheet.showRange(addr(rg.c1, rg.r1) + ':' + addr(rg.c2, rg.r2));
        }
        check.disabled = !sel;
      } else {
        sel = { c, r };
        sheet.mark(c, r, c, r, 'sel');
        sheet.show(c, r);
        check.disabled = false;
      }
    } });
    function doCheck() {
      if (rd.mode === 'range') {
        const tg = parseRange(rd.target);
        if (sel && sel.c1 === tg.c1 && sel.c2 === tg.c2 && sel.r1 === tg.r1 && sel.r2 === tg.r2) {
          sheet.clear(); sheet.mark(tg.c1, tg.r1, tg.c2, tg.r2, 'good');
          api.ok(L(rd.why) || t('rangeIs', { r: rd.target }), () => { i++; show(); });
        } else api.bad(t('rangeWrong', { r: addr(sel.c1, sel.r1) + ':' + addr(sel.c2, sel.r2) }));
      } else {
        const tg = parseAddr(rd.target);
        if (sel.c === tg.c && sel.r === tg.r) {
          sheet.clear(); sheet.mark(tg.c, tg.r, tg.c, tg.r, 'good');
          api.ok(L(rd.why), () => { i++; show(); });
        } else api.bad(t('cellWrong', { a: addr(sel.c, sel.r) }));
      }
    }
    fill(host, h('p', { class: 'task' }, L(rd.q)), sheet.el, h('div', { class: 'btn-row' }, check));
    api.solver(() => {
      if (rd.mode === 'range') {
        const tg = parseRange(rd.target);
        anchor = null; sel = null;
        sheet.td(tg.c1, tg.r1).querySelector('button').click();
        sheet.td(tg.c2, tg.r2).querySelector('button').click();
      } else {
        const tg = parseAddr(rd.target);
        sheet.td(tg.c, tg.r).querySelector('button').click();
      }
      check.click();
      return true;
    });
  }
  show();
};

/* ---------------- Formeln auswerten (kleiner Parser) ----------------
   Kann: Zahlen, Texte in "…", Zellen (B2), Bereiche (B2:B6), + − * /, Vergleiche (> < >= <= = <>),
   SUMME/SUM, MITTELWERT/AVERAGE, MAX, MIN, ANZAHL/COUNT, WENN/IF; Trenner ; oder ,  */
function evalFormula(src, rows) {
  const s = String(src).trim().replace(/^=/, '');
  let p = 0;
  const peek = () => s[p], skip = () => { while (s[p] === ' ') p++; };
  const cell = a => { const c = 'ABCDEFGH'.indexOf(a[0]), r = Number(a.slice(1)) - 1; const x = rows[r] && rows[r][c]; return x ? x.v : 0; };
  const range = (a, b) => {
    const c1 = 'ABCDEFGH'.indexOf(a[0]), c2 = 'ABCDEFGH'.indexOf(b[0]), r1 = Number(a.slice(1)), r2 = Number(b.slice(1)), out = [];
    for (let r = Math.min(r1, r2); r <= Math.max(r1, r2); r++) for (let c = Math.min(c1, c2); c <= Math.max(c1, c2); c++) out.push(cell('ABCDEFGH'[c] + r));
    return out;
  };
  const FN = {
    SUMME: a => a.flat().filter(x => typeof x === 'number').reduce((x, y) => x + y, 0),
    MITTELWERT: a => { const v = a.flat().filter(x => typeof x === 'number'); return v.reduce((x, y) => x + y, 0) / v.length; },
    MAX: a => Math.max(...a.flat().filter(x => typeof x === 'number')),
    MIN: a => Math.min(...a.flat().filter(x => typeof x === 'number')),
    ANZAHL: a => a.flat().filter(x => typeof x === 'number').length,
    WENN: a => (a[0] ? a[1] : a[2])
  };
  FN.SUM = FN.SUMME; FN.AVERAGE = FN.MITTELWERT; FN.COUNT = FN.ANZAHL; FN.IF = FN.WENN;
  function primary() {
    skip();
    let m;
    const rest = s.slice(p);
    if (peek() === '(') { p++; const v = compare(); skip(); p++; return v; }
    if (peek() === '"') { const e = s.indexOf('"', p + 1); const v = s.slice(p + 1, e); p = e + 1; return v; }
    if (peek() === '-') { p++; return -primary(); }
    if ((m = rest.match(/^(\d+(?:\.\d+)?)/))) { p += m[1].length; return Number(m[1]); } // Dezimalpunkt; Komma ist Trenner
    if ((m = rest.match(/^([A-Z]+)\(/)) && FN[m[1]]) {
      p += m[0].length;
      const args = [];
      skip();
      while (peek() !== ')') { args.push(compare()); skip(); if (peek() === ';' || peek() === ',') p++; skip(); }
      p++;
      return FN[m[1]](args);
    }
    if ((m = rest.match(/^([A-H]\d+):([A-H]\d+)/))) { p += m[0].length; return range(m[1], m[2]); }
    if ((m = rest.match(/^([A-H]\d+)/))) { p += m[0].length; return cell(m[1]); }
    throw new Error('Formel nicht lesbar: ' + src);
  }
  function term() {
    let v = primary();
    for (;;) { skip(); const o = peek(); if (o !== '*' && o !== '/') return v; p++; const w = primary(); v = o === '*' ? v * w : v / w; }
  }
  function sum() {
    let v = term();
    for (;;) { skip(); const o = peek(); if (o !== '+' && o !== '-') return v; p++; const w = term(); v = o === '+' ? v + w : v - w; }
  }
  function compare() {
    const a = sum(); skip();
    const m = s.slice(p).match(/^(<>|>=|<=|>|<|=)/);
    if (!m) return a;
    p += m[1].length;
    const b = sum();
    return { '>': a > b, '<': a < b, '>=': a >= b, '<=': a <= b, '=': a === b, '<>': a !== b }[m[1]];
  }
  const v = compare();
  return typeof v === 'number' ? Math.round(v * 1e9) / 1e9 : v;
}

/* ---------------- Formel-Rechner ---------------- */
GAMES.formula = function (host, st, api) {
  const rounds = st.rounds;
  let i = 0;
  function show() {
    if (i >= rounds.length) return api.done();
    api.progress(i, rounds.length);
    const rd = rounds[i];
    api.setHint(rd.hint);
    const sheet = sheetWidget(DATA.shop, { onCell: (c, r) => { sheet.clear(); sheet.mark(c, r, c, r, 'sel'); sheet.show(c, r); } });
    const result = evalFormula(L(rd.f), DATA.shop);
    let answerUi, solve;
    if (rd.choices) {
      // Einsteiger: Ergebnis aus drei Zahlen auswählen
      let solved = false;
      const list = shuffle(rd.choices.slice());
      answerUi = h('div', { class: 'opts two' }, list.map((v, k) => h('button', { class: 'opt', 'data-correct': near(v, result) ? '1' : null, onclick: e => {
        if (solved) return;
        if (near(v, result)) { solved = true; e.currentTarget.classList.add('right'); api.ok(L(rd.why), () => { i++; show(); }); }
        else { e.currentTarget.classList.add('wrong'); api.bad(L(rd.wrong) || t('tryAgain')); }
      } }, h('span', { class: 'key' }, String.fromCharCode(65 + k)), h('span', null, fmtNum(v)))));
      solve = () => answerUi.querySelector('[data-correct="1"]').click();
    } else if (rd.opts) {
      let solved = false;
      const a = rd.opts.findIndex(o => L(o) === result);
      answerUi = h('div', { class: 'opts two' }, rd.opts.map((o, k) => h('button', { class: 'opt', 'data-correct': k === a ? '1' : null, onclick: e => {
        if (solved) return;
        if (k === a) { solved = true; e.currentTarget.classList.add('right'); api.ok(L(rd.why), () => { i++; show(); }); }
        else { e.currentTarget.classList.add('wrong'); api.bad(L(rd.wrong) || t('tryAgain')); }
      } }, h('span', { class: 'key' }, String.fromCharCode(65 + k)), h('span', null, L(o)))));
      solve = () => answerUi.querySelector('[data-correct="1"]').click();
    } else {
      const input = h('input', { class: 'field', inputmode: 'decimal', autocomplete: 'off', 'aria-label': t('yourAnswer'), placeholder: t('result'), onkeydown: e => { if (e.key === 'Enter') go(); } });
      const go = () => {
        const v = parseNum(input.value);
        if (Number.isNaN(v)) { toast(t('enterNumber')); input.focus(); return; }
        if (near(v, result)) api.ok(L(rd.why), () => { i++; show(); });
        else api.bad(L(rd.wrong) || t('numWrong'));
      };
      answerUi = h('div', { class: 'answer-row' }, input, h('button', { class: 'btn pri', onclick: go }, t('check')));
      solve = () => { input.value = fmtNum(result, 4); go(); };
    }
    fill(host, 
      h('p', { class: 'task' }, t('formulaQ')),
      h('div', { class: 'cipherbox', style: { letterSpacing: '.02em' } }, L(rd.f)),
      sheet.el,
      answerUi);
    api.solver(() => { solve(); return true; });
  }
  show();
};

/* ---------------- Filtern & Sortieren ---------------- */
/** Antwort einer Filter-Aufgabe: aus den Daten berechnet (calc) – so kann sie nie falsch hinterlegt sein. */
const filterAnswer = rd => rd.calc(DATA.people);
GAMES.filter = function (host, st, api) {
  const P = DATA.people;
  const rounds = st.rounds;
  let i = 0;
  function show() {
    if (i >= rounds.length) return api.done();
    api.progress(i, rounds.length);
    const rd = rounds[i];
    api.setHint(rd.hint);
    const f = { age: '', sport: '' };
    let sort = null; // { key, dir }
    let picked = null;
    const tbody = h('tbody');
    const note = h('div', { class: 'rows-note' });
    const ages = [...new Set(P.map(p => p.age))].sort((a, b) => a - b);
    const sports = [...new Set(P.map(p => p.sport))];
    const sel = (label, key, values, fmt) => h('label', null, label + ':',
      h('select', { onchange: e => { f[key] = e.target.value; draw(); } },
        h('option', { value: '' }, t('all')), values.map(v => h('option', { value: String(v) }, fmt(v)))));
    const head = (key, label) => h('th', { class: 'colhead', scope: 'col' }, h('button', { onclick: () => {
      sort = !sort || sort.key !== key ? { key, dir: 1 } : sort.dir === 1 ? { key, dir: -1 } : null; draw();
    }, 'aria-label': t('sortBy', { c: label }) }, label, h('span', { 'data-arrow': key }, '')));
    const cols = [['name', t('colName')], ['age', t('colAge')], ['sport', t('colSport')], ['min', t('colMinutes')]];
    const table = h('table', { class: 'sheet compact' },
      h('thead', null, h('tr', null, h('th', null, ''), cols.map(([k, l]) => head(k, l)))), tbody);
    const check = h('button', { class: 'btn pri', disabled: rd.mode === 'row', onclick: doCheck }, t('check'));
    const input = rd.mode === 'num' ? h('input', { class: 'field', inputmode: 'numeric', autocomplete: 'off', 'aria-label': t('yourAnswer'), placeholder: t('number'), onkeydown: e => { if (e.key === 'Enter') doCheck(); } }) : null;
    function visible() {
      let rows = P.map((p, idx) => Object.assign({ idx }, p)).filter(p => (!f.age || String(p.age) === f.age) && (!f.sport || p.sport === f.sport));
      if (sort) rows.sort((a, b) => {
        const x = sort.key === 'sport' ? L(DATA.sports[a.sport]) : a[sort.key], y = sort.key === 'sport' ? L(DATA.sports[b.sport]) : b[sort.key];
        return (x < y ? -1 : x > y ? 1 : 0) * sort.dir;
      });
      return rows;
    }
    function draw() {
      const rows = visible();
      tbody.replaceChildren(...rows.map(p => {
        const pick = () => { if (rd.mode !== 'row') return; picked = p.idx; check.disabled = false; draw(); };
        return h('tr', { class: picked === p.idx ? 'pick' : '' }, h('th', { scope: 'row' }, String(p.idx + 2)),
          [p.name, String(p.age), L(DATA.sports[p.sport]), String(p.min)].map((v, k) =>
            h('td', { class: k === 1 || k === 3 ? 'num' : '' }, h('button', { onclick: pick, 'data-name': k === 0 ? p.name : null }, v))));
      }));
      table.querySelectorAll('[data-arrow]').forEach(s => { s.textContent = sort && sort.key === s.dataset.arrow ? (sort.dir === 1 ? ' ▲' : ' ▼') : ''; });
      note.textContent = t('rowsVisible', { n: rows.length, m: P.length });
    }
    function doCheck() {
      if (rd.mode === 'num') {
        const v = parseNum(input.value);
        if (Number.isNaN(v)) { toast(t('enterNumber')); return; }
        if (near(v, filterAnswer(rd))) api.ok(L(rd.why), () => { i++; show(); });
        else api.bad(L(rd.wrong) || t('numWrong'));
      } else {
        if (P[picked].name === filterAnswer(rd)) api.ok(L(rd.why), () => { i++; show(); });
        else api.bad(t('personWrong', { n: P[picked].name }));
      }
    }
    fill(host, 
      h('p', { class: 'task' }, L(rd.q)),
      h('div', { class: 'filters' },
        sel(t('colAge'), 'age', ages, v => String(v)),
        sel(t('colSport'), 'sport', sports, v => L(DATA.sports[v])),
        note),
      h('div', { class: 'sheet-wrap' }, table),
      h('p', { class: 'sub', style: { margin: '0 0 12px' } }, t('sortHint')),
      h('div', { class: 'answer-row' }, input, check));
    draw();
    api.solver(() => {
      if (rd.mode === 'num') { input.value = fmtNum(filterAnswer(rd)); doCheck(); }
      else { picked = P.findIndex(p => p.name === filterAnswer(rd)); check.disabled = false; doCheck(); }
      return true;
    });
  }
  show();
};

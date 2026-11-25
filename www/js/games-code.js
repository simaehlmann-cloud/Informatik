/* Blockprogrammierung (Roboter-Labyrinth) und Codierung (Binär, ASCII, RGB) */
'use strict';

/* ---------------- Roboter-Labyrinth ---------------- */
const DIRS = { E: [1, 0, 0], S: [0, 1, 90], W: [-1, 0, 180], N: [0, -1, 270] };
const TURN_L = { E: 'N', N: 'W', W: 'S', S: 'E' };
const TURN_R = { E: 'S', S: 'W', W: 'N', N: 'E' };
const ROBOT_SVG = '<svg viewBox="0 0 40 40" aria-hidden="true"><rect x="7" y="9" width="24" height="22" rx="7" fill="var(--c)"/><circle cx="17" cy="17" r="3" fill="#fff"/><circle cx="25" cy="17" r="3" fill="#fff"/><circle cx="18" cy="17" r="1.4" fill="#141B3A"/><circle cx="26" cy="17" r="1.4" fill="#141B3A"/><path d="M31 20l6 0" stroke="var(--c)" stroke-width="3" stroke-linecap="round"/><path d="M33 16l4 4-4 4" fill="none" stroke="var(--c)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><rect x="12" y="25" width="14" height="2.5" rx="1.2" fill="#fff" opacity=".8"/></svg>';

function countBlocks(list) { return list.reduce((n, b) => n + 1 + (b.op === 'rep' ? countBlocks(b.body) : 0), 0); }
function toProg(sol) { return sol.map(x => (typeof x === 'string' ? { op: x } : { op: 'rep', n: x.rep, body: toProg(x.body) })); }
function flatten(list, out = []) {
  for (const b of list) {
    if (out.length > 400) break;
    if (b.op === 'rep') for (let k = 0; k < b.n; k++) flatten(b.body, out); else out.push(b.op);
  }
  return out;
}

GAMES.maze = function (host, st, api) {
  let li = 0;
  function show() {
    if (li >= st.stages.length) return api.done();
    api.progress(li, st.stages.length);
    const lv = st.stages[li];
    api.setHint(lv.hint);
    const H = lv.map.length, W = lv.map[0].length;
    let start = null, goal = null;
    lv.map.forEach((row, y) => row.split('').forEach((ch, x) => { if (ch === 'S') start = { x, y }; if (ch === 'Z') goal = { x, y }; }));
    const isWall = (x, y) => x < 0 || y < 0 || x >= W || y >= H || lv.map[y][x] === '#';
    let prog = [];
    let target = prog;
    let running = false;
    const cells = [];
    const grid = h('div', { class: 'maze', style: { gridTemplateColumns: `repeat(${W}, 1fr)` }, role: 'img', 'aria-label': t('mazeAria') });
    lv.map.forEach((row, y) => row.split('').forEach((ch, x) => {
      const c = h('div', { class: 'mz' + (ch === '#' ? ' wall' : '') + (ch === 'Z' ? ' goal' : '') });
      cells.push(c); grid.append(c);
    }));
    const robot = h('div', { class: 'robot' }, svg(ROBOT_SVG));
    const cellAt = (x, y) => cells[y * W + x];
    let pos, dir;
    function place() {
      cellAt(pos.x, pos.y).append(robot);
      robot.style.transform = `rotate(${DIRS[dir][2]}deg)`;
    }
    function resetRobot() {
      cells.forEach(c => c.classList.remove('trail', 'crash'));
      pos = Object.assign({}, start); dir = lv.dir; place();
    }
    const progBox = h('div', { class: 'prog' });
    const limitLbl = h('span', { class: 'limit' });
    const runBtn = h('button', { class: 'btn pri', onclick: () => run() }, svg(ICONS.play), t('run'));
    const label = op => ({ f: t('mzFwd'), l: t('mzLeft'), r: t('mzRight') }[op]);
    function drawProg() {
      const renderList = (list, cont) => {
        for (const b of list) {
          if (b.op === 'rep') {
            const body = h('div', { class: 'rep-body', 'data-empty': t('mzEmpty') });
            const node = h('div', { class: 'rep' + (target === b.body ? ' target' : '') },
              h('div', { class: 'rep-head' },
                h('button', { class: 'main-tag', style: { color: 'inherit', padding: '0 2px', textTransform: 'none', letterSpacing: '0', fontSize: '.9rem', fontFamily: 'var(--mono)' }, onclick: () => { target = b.body; drawProg(); }, 'aria-label': t('mzSelectRep') }, t('mzRepeat')),
                h('button', { class: 'cnt', 'aria-label': t('mzCount'), onclick: () => { b.n = b.n >= 9 ? 2 : b.n + 1; drawProg(); } }, String(b.n)),
                h('span', null, '×'),
                h('button', { class: 'x', 'aria-label': t('remove'), onclick: () => { removeNode(prog, b); if (containsList(b, target)) target = prog; drawProg(); } }, '✕')),
              body);
            renderList(b.body, body);
            cont.append(node);
          } else {
            cont.append(h('button', { class: 'blk blk-btn motion', 'aria-label': label(b.op) + ' – ' + t('remove'), onclick: () => { removeNode(prog, b); drawProg(); } }, label(b.op), h('span', { class: 'x', 'aria-hidden': 'true' }, '✕')));
          }
        }
      };
      progBox.replaceChildren(h('button', { class: 'main-tag' + (target === prog ? ' target' : ''), onclick: () => { target = prog; drawProg(); } }, t('mzMain')));
      renderList(prog, progBox);
      if (!prog.length) progBox.append(h('span', { class: 'sub', style: { margin: '0' } }, t('mzTapPalette')));
      const n = countBlocks(prog);
      limitLbl.textContent = lv.limit ? t('mzBlocksLimit', { n, m: lv.limit }) : t('mzBlocks', { n });
      limitLbl.classList.toggle('over', !!lv.limit && n > lv.limit);
      runBtn.disabled = !prog.length || running;
    }
    function containsList(node, list) { return node.body === list || node.body.some(b => b.op === 'rep' && containsList(b, list)); }
    function removeNode(list, node) {
      const k = list.indexOf(node);
      if (k >= 0) { list.splice(k, 1); return true; }
      return list.some(b => b.op === 'rep' && removeNode(b.body, node));
    }
    function add(op) {
      if (running) return;
      if (op === 'rep') { const r = { op: 'rep', n: 2, body: [] }; target.push(r); target = r.body; }
      else target.push({ op });
      Sound.tick();
      drawProg();
    }
    const palette = h('div', { class: 'palette' },
      h('button', { class: 'blk blk-btn motion', onclick: () => add('f') }, '＋ ' + t('mzFwd')),
      h('button', { class: 'blk blk-btn motion', onclick: () => add('l') }, '＋ ' + t('mzLeft')),
      h('button', { class: 'blk blk-btn motion', onclick: () => add('r') }, '＋ ' + t('mzRight')),
      lv.loops ? h('button', { class: 'blk blk-btn control', onclick: () => add('rep') }, '＋ ' + t('mzRepeatBlock')) : null);
    async function run() {
      if (running) return;
      if (lv.limit && countBlocks(prog) > lv.limit) return api.bad(t('mzTooMany', { m: lv.limit }));
      running = true; drawProg();
      resetRobot();
      const steps = flatten(prog);
      const delay = api.fast() ? 15 : 320;
      let crashed = false, reached = false;
      for (const op of steps) {
        await sleep(delay);
        if (op === 'l') dir = TURN_L[dir];
        else if (op === 'r') dir = TURN_R[dir];
        else {
          const nx = pos.x + DIRS[dir][0], ny = pos.y + DIRS[dir][1];
          if (isWall(nx, ny)) {
            crashed = true;
            const inside = nx >= 0 && ny >= 0 && nx < W && ny < H;
            (inside ? cellAt(nx, ny) : cellAt(pos.x, pos.y)).classList.add('crash');
            break;
          }
          cellAt(pos.x, pos.y).classList.add('trail');
          pos = { x: nx, y: ny };
        }
        place();
        if (pos.x === goal.x && pos.y === goal.y) { reached = true; break; }
      }
      await sleep(api.fast() ? 10 : 200);
      running = false; drawProg();
      if (reached) api.ok(L(lv.why) || t('mzGoal'), () => { li++; show(); });
      else if (crashed) api.bad(t('mzCrash'));
      else api.bad(t('mzNotReached'));
    }
    fill(host, 
      h('p', { class: 'task' }, L(lv.goal)),
      h('div', { class: 'maze-wrap' },
        h('div', null, grid),
        h('div', null,
          h('div', { class: 'lbl', style: { marginTop: 0 } }, t('mzPalette')), palette,
          h('div', { class: 'lbl' }, t('yourProgram'), ' · ', limitLbl), progBox,
          h('div', { class: 'btn-row' }, runBtn,
            h('button', { class: 'btn ghost', onclick: () => { if (running) return; prog.length = 0; target = prog; resetRobot(); drawProg(); } }, svg(ICONS.undo), t('reset'))))));
    resetRobot();
    drawProg();
    api.solver(() => {
      prog.length = 0; toProg(lv.sol).forEach(b => prog.push(b)); target = prog; drawProg(); run(); return true;
    });
  }
  show();
};

/* ---------------- Binärkarten ---------------- */
GAMES.binary = function (host, st, api) {
  let i = 0;
  function show() {
    if (i >= st.rounds.length) return api.done();
    api.progress(i, st.rounds.length);
    const rd = Object.assign({}, st.rounds[i]);
    // Zufallszahl, damit beim Wiederholen neue Aufgaben kommen (nicht 0, nicht die größte)
    if (rd.rand) rd.value = rd.rand[0] + Math.floor(Math.random() * (rd.rand[1] - rd.rand[0] + 1));
    api.setHint(rd.mode === 'make' ? t('binMakeHint') : rd.mode === 'typebin' ? t('binTypeHint') : t('binReadHint'));
    const vals = Array.from({ length: rd.bits }, (_, k) => Math.pow(2, rd.bits - 1 - k));
    const on = vals.map((v, k) => rd.mode === 'read' ? ((rd.value >> (rd.bits - 1 - k)) & 1) === 1 : false);
    const sum = h('div', { class: 'sumline' });
    const cards = vals.map((v, k) => {
      const dots = v <= 16 ? h('div', { class: 'dots', 'aria-hidden': 'true' }, Array.from({ length: v }, () => h('i'))) : null;
      return h('button', { class: 'bcard', 'aria-pressed': String(on[k]), 'aria-label': t('cardVal', { v }), disabled: rd.mode === 'read', onclick: () => { on[k] = !on[k]; Sound.tick(); upd(); } },
        dots, h('span', { class: 'bv' }, String(v)), h('span', { class: 'bb' }, '0'));
    });
    function upd() {
      cards.forEach((c, k) => { c.classList.toggle('on', on[k]); c.setAttribute('aria-pressed', String(on[k])); c.querySelector('.bb').textContent = on[k] ? '1' : '0'; });
      const bits = on.map(x => (x ? '1' : '0')).join('');
      const total = vals.reduce((a, v, k) => a + (on[k] ? v : 0), 0);
      sum.replaceChildren(h('span', { class: 'mono' }, bits), rd.mode === 'make' ? ' = ' + total : '');
    }
    let ui, solve;
    if (rd.mode === 'typebin') {
      // Profi: ohne Karten – Dezimalzahl als Bitfolge eintippen
      const want = rd.value.toString(2).padStart(rd.bits, '0');
      const input = h('input', { class: 'field mono', inputmode: 'numeric', autocomplete: 'off', maxlength: String(rd.bits), 'aria-label': t('yourAnswer'), placeholder: '0'.repeat(rd.bits), onkeydown: e => { if (e.key === 'Enter') doCheck(); } });
      const doCheck = () => {
        const v = input.value.replace(/\s/g, '');
        if (!/^[01]+$/.test(v)) { toast(t('onlyBits')); return; }
        if (parseInt(v, 2) === rd.value) api.ok(t('binOk', { b: want, n: rd.value }), () => { i++; show(); });
        else api.bad(t('binTypeWrong', { n: parseInt(v, 2) }));
      };
      fill(host, h('p', { class: 'task' }, t('binType', { n: rd.value, b: rd.bits })),
        h('div', { class: 'answer-row', style: { justifyContent: 'center' } }, input, h('button', { class: 'btn pri', onclick: doCheck }, t('check'))),
        h('p', { class: 'sub', style: { marginTop: '12px', textAlign: 'center' } }, vals.join(' · ')));
      api.solver(() => { input.value = want; doCheck(); return true; });
      return;
    }
    if (rd.mode === 'make') {
      const doCheck = () => {
        const total = vals.reduce((a, v, k) => a + (on[k] ? v : 0), 0);
        if (total === rd.value) api.ok(t('binOk', { b: on.map(x => (x ? '1' : '0')).join(''), n: rd.value }), () => { i++; show(); });
        else api.bad(t(total > rd.value ? 'binTooBig' : 'binTooSmall', { n: total }));
      };
      ui = h('div', { class: 'btn-row', style: { justifyContent: 'center' } }, h('button', { class: 'btn pri', onclick: doCheck }, t('check')));
      solve = () => { vals.forEach((v, k) => { on[k] = ((rd.value >> (rd.bits - 1 - k)) & 1) === 1; }); upd(); doCheck(); };
    } else {
      const input = h('input', { class: 'field', inputmode: 'numeric', autocomplete: 'off', 'aria-label': t('yourAnswer'), placeholder: t('decimal'), onkeydown: e => { if (e.key === 'Enter') doCheck(); } });
      const doCheck = () => {
        const v = parseNum(input.value);
        if (Number.isNaN(v)) { toast(t('enterNumber')); return; }
        if (v === rd.value) api.ok(t('binReadOk', { n: rd.value }), () => { i++; show(); });
        else api.bad(t('numWrong'));
      };
      ui = h('div', { class: 'answer-row', style: { justifyContent: 'center' } }, input, h('button', { class: 'btn pri', onclick: doCheck }, t('check')));
      solve = () => { input.value = String(rd.value); doCheck(); };
    }
    fill(host, 
      h('p', { class: 'task' }, rd.mode === 'make' ? t('binMake', { n: rd.value }) : t('binRead')),
      h('div', { class: 'bincards' }, cards), sum, ui);
    upd();
    api.solver(() => { solve(); return true; });
  }
  show();
};

/* ---------------- ASCII ---------------- */
const toBits = (n, len = 8) => n.toString(2).padStart(len, '0');
function asciiTable(open) {
  return h('details', { class: 'more', open: open ? true : null }, h('summary', null, t('asciiTable')),
    h('div', { class: 'ascii-tbl' }, ABC.split('').map(c => h('span', null, `${c} ${c.charCodeAt(0)}`))));
}
GAMES.ascii = function (host, st, api) {
  let i = 0;
  function show() {
    if (i >= st.rounds.length) return api.done();
    api.progress(i, st.rounds.length);
    const rd = st.rounds[i];
    api.setHint(rd.mode === 'dec' ? t('asciiDecHint') : t('asciiEncHint'));
    const places = [128, 64, 32, 16, 8, 4, 2, 1];
    let ui, solve, head;
    if (rd.mode === 'dec') {
      const word = L(rd.word);
      const bits = word.split('').map(c => toBits(c.charCodeAt(0))).join(' ');
      const input = h('input', { class: 'field mono', autocomplete: 'off', autocapitalize: 'characters', spellcheck: 'false', 'aria-label': t('yourAnswer'), placeholder: t('word'), onkeydown: e => { if (e.key === 'Enter') doCheck(); } });
      const doCheck = () => {
        const v = lettersOnly(input.value);
        if (!v) { toast(t('enterAnswer')); return; }
        if (v === word) api.ok(t('asciiDecOk', { w: word, c: word.split('').map(c => c + ' = ' + c.charCodeAt(0)).join(', ') }), () => { i++; show(); });
        else api.bad(t('asciiDecWrong'));
      };
      head = [h('p', { class: 'task' }, t('asciiDec')), h('div', { class: 'cipherbox' }, bits)];
      ui = h('div', { class: 'answer-row' }, input, h('button', { class: 'btn pri', onclick: doCheck }, t('check')));
      solve = () => { input.value = word; doCheck(); };
    } else {
      const code = rd.ch.charCodeAt(0);
      const on = places.map(() => false);
      const dec = h('div', { class: 'sumline' });
      const btns = places.map((p, k) => h('button', { class: 'bit', 'aria-pressed': 'false', 'aria-label': t('bitPlace', { p }), onclick: () => { on[k] = !on[k]; Sound.tick(); upd(); } }, h('b', null, '0'), h('small', null, String(p))));
      function upd() {
        btns.forEach((b, k) => { b.classList.toggle('on', on[k]); b.setAttribute('aria-pressed', String(on[k])); b.querySelector('b').textContent = on[k] ? '1' : '0'; });
        const v = places.reduce((a, p, k) => a + (on[k] ? p : 0), 0);
        dec.textContent = '= ' + v + (v >= 65 && v <= 90 ? ' → ' + String.fromCharCode(v) : '');
      }
      const doCheck = () => {
        const v = places.reduce((a, p, k) => a + (on[k] ? p : 0), 0);
        if (v === code) api.ok(t('asciiEncOk', { c: rd.ch, n: code, b: toBits(code) }), () => { i++; show(); });
        else api.bad(t('asciiEncWrong', { n: v }));
      };
      head = [h('p', { class: 'task' }, t('asciiEnc', { c: rd.ch }))];
      ui = h('div', null, h('div', { class: 'bits' }, btns), dec, h('div', { class: 'btn-row', style: { justifyContent: 'center' } }, h('button', { class: 'btn pri', onclick: doCheck }, t('check'))));
      solve = () => { places.forEach((p, k) => { on[k] = (code & p) !== 0; }); upd(); doCheck(); };
      upd();
    }
    fill(host, ...head, ui, asciiTable(st.tableOpen));
    api.solver(() => { solve(); return true; });
  }
  show();
};

/* ---------------- RGB-Mischpult ---------------- */
GAMES.rgb = function (host, st, api) {
  let i = 0;
  function show() {
    if (i >= st.rounds.length) return api.done();
    api.progress(i, st.rounds.length);
    const rd = st.rounds[i];
    api.setHint(rd.hint);
    const v = [0, 0, 0];
    const mine = h('div', { class: 'swatch' }, h('span', null, t('yourColor')));
    const goal = h('div', { class: 'swatch', style: { background: `rgb(${rd.target.join(',')})` } }, h('span', null, t('targetColor') + ': ' + L(rd.name)));
    const outs = [];
    const sliders = ['r', 'g', 'b'].map((ch, k) => {
      const out = h('output', null, '0');
      outs.push(out);
      const inp = h('input', { type: 'range', min: '0', max: '255', step: '1', value: '0', 'aria-label': t('ch_' + ch), oninput: e => { v[k] = Number(e.target.value); upd(); } });
      return h('div', { class: 'slider-row ' + ch }, h('span', null, ch.toUpperCase()), inp, out);
    });
    const code = h('div', { class: 'sumline' }, h('span', { class: 'mono' }, 'rgb(0, 0, 0)'));
    function upd() {
      mine.style.background = `rgb(${v.join(',')})`;
      outs.forEach((o, k) => { o.textContent = String(v[k]); });
      code.firstChild.textContent = `rgb(${v.join(', ')})`;
    }
    function doCheck() {
      const off = v.map((x, k) => Math.abs(x - rd.target[k]));
      if (off.every(d => d <= st.tolerance)) api.ok(t('rgbOk', { c: `rgb(${rd.target.join(', ')})` }) + (rd.why ? ' ' + L(rd.why) : ''), () => { i++; show(); });
      else {
        const worst = off.indexOf(Math.max(...off));
        api.bad(t('rgbWrong', { c: t('ch_' + 'rgb'[worst]), d: t(v[worst] < rd.target[worst] ? 'more' : 'less') }));
      }
    }
    fill(host, 
      h('p', { class: 'task' }, t('rgbTask')),
      h('div', { class: 'swatches' }, goal, mine),
      sliders, code,
      h('div', { class: 'btn-row' }, h('button', { class: 'btn pri', onclick: doCheck }, t('check'))));
    upd();
    api.solver(() => {
      rd.target.forEach((x, k) => { v[k] = x; sliders[k].querySelector('input').value = String(x); });
      upd(); doCheck(); return true;
    });
  }
  show();
};

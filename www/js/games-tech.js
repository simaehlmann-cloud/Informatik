/* Mikrocontroller (LED-Matrix, Wenn-dann) und Internet (Paketreise) */
'use strict';

function ledGrid(opts = {}) {
  const on = Array.from({ length: 25 }, () => false);
  const leds = Array.from({ length: 25 }, (_, k) => h(opts.small ? 'span' : 'button', {
    class: 'led', 'aria-pressed': opts.small ? null : 'false', 'aria-label': opts.small ? null : t('ledAt', { x: k % 5, y: Math.floor(k / 5) }),
    onclick: opts.small || !opts.onToggle ? null : () => { on[k] = !on[k]; Sound.tick(); draw(); opts.onToggle(); }
  }));
  function draw() { leds.forEach((l, k) => { l.classList.toggle('on', on[k]); if (!opts.small) l.setAttribute('aria-pressed', String(on[k])); }); }
  const el = h('div', { class: 'leds' + (opts.small ? ' small' : '') }, leds);
  return {
    el, on,
    set(pattern) { pattern.join('').split('').forEach((c, k) => { on[k] = c === '#'; }); draw(); },
    get() { return [0, 1, 2, 3, 4].map(y => on.slice(y * 5, y * 5 + 5).map(x => (x ? '#' : '.')).join('')); },
    draw
  };
}
const boardEl = (inner, a) => h('div', { class: 'board' }, h('span', { class: 'bbtn a' + (a ? ' on' : '') }), h('span', { class: 'bbtn b' }), inner);

/* ---------------- LED-Matrix ---------------- */
GAMES.matrix = function (host, st, api) {
  let i = 0;
  function show() {
    if (i >= st.rounds.length) return api.done();
    api.progress(i, st.rounds.length);
    const rd = st.rounds[i];
    api.setHint(rd.hint || t('matrixHint'));
    const target = rd.mode === 'xy' ? [0, 1, 2, 3, 4].map(y => [0, 1, 2, 3, 4].map(x => (x === rd.x && y === rd.y ? '#' : '.')).join('')) : rd.pattern;
    const grid = ledGrid({ onToggle: () => {} });
    const coords = h('div', { class: 'coords', 'aria-hidden': 'true' }, t('matrixAxes'));
    let task, extra = null;
    if (rd.mode === 'xy') task = t('matrixXY', { x: rd.x, y: rd.y });
    else if (rd.mode === 'code') {
      task = t('matrixCode');
      const lines = [];
      target.forEach((row, y) => row.split('').forEach((c, x) => { if (c === '#') lines.push({ t: `${t('plot')} x: ${x} y: ${y}`, k: 'look' }); }));
      extra = renderBlocks([{ t: t('onStart'), k: 'event' }].concat(lines.map(l => Object.assign(l, { i: 1 }))));
    } else {
      task = t('matrixCopy');
      const prev = ledGrid({ small: true }); prev.set(target);
      extra = h('div', { style: { display: 'flex', justifyContent: 'center', marginBottom: '14px' } }, h('div', null, h('div', { class: 'lbl', style: { textAlign: 'center', marginTop: 0 } }, t('template')), boardEl(prev.el)));
    }
    function doCheck() {
      const mine = grid.get();
      const wrong = mine.join('').split('').filter((c, k) => c !== target.join('')[k]).length;
      if (!wrong) api.ok(L(rd.why) || t('matrixOk'), () => { i++; show(); });
      else api.bad(t('matrixWrong', { n: wrong }));
    }
    fill(host, 
      h('p', { class: 'task' }, task),
      h('div', { class: 'mc-wrap' },
        h('div', null, extra),
        h('div', null, boardEl(grid.el), coords)),
      h('div', { class: 'btn-row' },
        h('button', { class: 'btn pri', onclick: doCheck }, t('check')),
        h('button', { class: 'btn ghost', onclick: () => { grid.set(['.....', '.....', '.....', '.....', '.....']); } }, svg(ICONS.undo), t('clear'))));
    api.solver(() => { grid.set(target); doCheck(); return true; });
  }
  show();
};

/* ---------------- Wenn-dann (Sensor → Aktor) ---------------- */
const SENSORS = {
  light: { min: 0, max: 255, unit: '', vals: [20, 50, 100, 200], start: 120 },
  temp: { min: -10, max: 50, unit: ' °C', vals: [0, 20, 30, 40], start: 22 },
  tilt: { min: 0, max: 90, unit: '°', vals: [5, 15, 45], start: 30 },
  btnA: { bool: true }
};
const ACTION_PATTERNS = {
  ledOn: ['#####', '#####', '#####', '#####', '#####'],
  ledOff: ['.....', '.....', '.....', '.....', '.....'],
  check: ['.....', '....#', '...#.', '#.#..', '.#...'],
  cross: ['#...#', '.#.#.', '..#..', '.#.#.', '#...#'],
  tone: ['..##.', '..#.#', '..#..', '###..', '###..'],
  none: ['.....', '.....', '.....', '.....', '.....']
};
GAMES.ifthen = function (host, st, api) {
  let i = 0;
  function show() {
    if (i >= st.rounds.length) return api.done();
    api.progress(i, st.rounds.length);
    const rd = st.rounds[i];
    api.setHint(rd.hint);
    // Neutraler Start: ein anderer Sensor als gesucht, keine Aktionen – nichts von der Lösung vorgeben
    const startSensor = Object.keys(SENSORS).find(k => k !== rd.sensor && !SENSORS[k].bool);
    const cfg = { sensor: startSensor, cmp: '>', val: SENSORS[startSensor].vals[0], then: 'none', else: 'none' };
    let simVal = SENSORS[startSensor].start, simBtn = false;
    const opt = (v, label, cur) => h('option', { value: String(v), selected: String(v) === String(cur) ? true : null }, label);
    const sensorSel = h('select', { 'aria-label': t('sensor'), onchange: e => { cfg.sensor = e.target.value; const s = SENSORS[cfg.sensor]; if (!s.bool) { cfg.val = s.vals[0]; simVal = s.start; } build(); } },
      Object.keys(SENSORS).map(k => opt(k, t('s_' + k), cfg.sensor)));
    const actSel = key => h('select', { 'aria-label': t(key === 'then' ? 'thenDo' : 'elseDo'), onchange: e => { cfg[key] = e.target.value; sim(); } },
      Object.keys(ACTION_PATTERNS).map(k => opt(k, t('a_' + k), cfg[key])));
    const thenSel = actSel('then'), elseSel = actSel('else');
    const condHost = h('span', { style: { display: 'contents' } });
    const simHost = h('div');
    const out = ledGrid({ small: false });
    out.el.querySelectorAll('.led').forEach(l => { l.disabled = true; });
    const board = boardEl(out.el);
    function cond() {
      const s = SENSORS[cfg.sensor];
      if (s.bool) return simBtn;
      return cfg.cmp === '<' ? simVal < cfg.val : simVal > cfg.val;
    }
    function sim() {
      const res = cond() ? cfg.then : cfg.else;
      out.set(ACTION_PATTERNS[res]);
      board.querySelector('.bbtn.a').classList.toggle('on', cfg.sensor === 'btnA' && simBtn);
    }
    function build() {
      const s = SENSORS[cfg.sensor];
      if (s.bool) condHost.replaceChildren(h('span', null, t('isPressed')));
      else condHost.replaceChildren(
        h('select', { 'aria-label': t('compare'), onchange: e => { cfg.cmp = e.target.value; sim(); } }, opt('<', t('lessThan'), cfg.cmp), opt('>', t('greaterThan'), cfg.cmp)),
        h('select', { 'aria-label': t('value'), onchange: e => { cfg.val = Number(e.target.value); sim(); } }, s.vals.map(v => opt(v, v + s.unit, cfg.val))));
      if (s.bool) {
        const b = h('button', { class: 'btn', 'aria-pressed': String(simBtn), onclick: () => { simBtn = !simBtn; b.setAttribute('aria-pressed', String(simBtn)); b.textContent = t(simBtn ? 'btnDown' : 'btnUp'); sim(); } }, t(simBtn ? 'btnDown' : 'btnUp'));
        simHost.replaceChildren(h('div', { class: 'lbl' }, t('simulate') + ': ' + t('s_btnA')), b);
      } else {
        const valOut = h('output', null, simVal + s.unit);
        simHost.replaceChildren(h('div', { class: 'lbl' }, t('simulate') + ': ' + t('s_' + cfg.sensor)),
          h('div', { class: 'range-row', style: { margin: 0 } },
            h('input', { type: 'range', min: String(s.min), max: String(s.max), value: String(simVal), 'aria-label': t('s_' + cfg.sensor), oninput: e => { simVal = Number(e.target.value); valOut.textContent = simVal + s.unit; sim(); } }), valOut));
      }
      sim();
    }
    function doCheck() {
      const s = SENSORS[cfg.sensor];
      const okSensor = cfg.sensor === rd.sensor;
      const okCond = s.bool || (cfg.cmp === rd.cmp && cfg.val === rd.val);
      const okThen = cfg.then === rd.then, okElse = cfg.else === rd.else;
      if (okSensor && okCond && okThen && okElse) api.ok(L(rd.why), () => { i++; show(); });
      else api.bad(!okSensor ? t('ifSensor') : !okCond ? t('ifCond') : !okThen ? t('ifThen') : t('ifElse'));
    }
    fill(host, 
      h('p', { class: 'task' }, L(rd.spec)),
      h('div', { class: 'mc-wrap' },
        h('div', { class: 'ifthen' },
          h('div', { class: 'line if' }, h('span', null, t('if')), sensorSel, condHost),
          h('div', { class: 'line then' }, h('span', null, t('then')), thenSel),
          h('div', { class: 'line if' }, h('span', null, t('else'))),
          h('div', { class: 'line then' }, h('span', null, t('then')), elseSel)),
        h('div', null, board)),
      h('div', { class: 'sim' }, simHost, h('button', { class: 'btn pri', onclick: doCheck }, t('check'))));
    build();
    api.solver(() => {
      cfg.sensor = rd.sensor; cfg.then = rd.then; cfg.else = rd.else;
      if (!SENSORS[rd.sensor].bool) { cfg.cmp = rd.cmp; cfg.val = rd.val; }
      doCheck(); return true;
    });
  }
  show();
};

/* ---------------- Paketreise ---------------- */
const NET = {
  nodes: {
    L: [8, 31], R1: [29, 10], R2: [29, 31], R3: [29, 52], R4: [50, 10], R5: [50, 31], R6: [50, 52],
    R7: [71, 10], R8: [71, 31], R9: [71, 52], S: [92, 31]
  },
  edges: [['L', 'R1'], ['L', 'R2'], ['L', 'R3'], ['R1', 'R2'], ['R2', 'R3'], ['R1', 'R4'], ['R2', 'R5'], ['R3', 'R6'],
    ['R4', 'R5'], ['R5', 'R6'], ['R4', 'R7'], ['R5', 'R8'], ['R6', 'R9'], ['R7', 'R8'], ['R8', 'R9'], ['R7', 'S'], ['R8', 'S'], ['R9', 'S']]
};
const adj = (a, b) => NET.edges.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
function shortestHops(broken) {
  const dist = { L: 0 }, q = ['L'];
  while (q.length) {
    const a = q.shift();
    for (const n of Object.keys(NET.nodes)) if (dist[n] == null && adj(a, n) && !broken.includes(n)) { dist[n] = dist[a] + 1; q.push(n); }
  }
  return dist.S;
}
function shortestPath(broken) {
  const prev = {}, q = ['L'], seen = new Set(['L']);
  while (q.length) {
    const a = q.shift();
    if (a === 'S') break;
    for (const n of Object.keys(NET.nodes)) if (!seen.has(n) && adj(a, n) && !broken.includes(n)) { seen.add(n); prev[n] = a; q.push(n); }
  }
  const p = ['S'];
  while (p[0] !== 'L') p.unshift(prev[p[0]]);
  return p;
}

GAMES.route = function (host, st, api) {
  let i = 0;
  function show() {
    if (i >= st.rounds.length) return api.done();
    api.progress(i, st.rounds.length);
    const rd = st.rounds[i];
    api.setHint(rd.shortest ? t('routeShortHint', { n: shortestHops(rd.broken) }) : t('routeHint'));
    let path = ['L'];
    let busy = false;
    const note = h('p', { class: 'path-note', 'aria-live': 'polite' });
    let edges = '', nodes = '';
    NET.edges.forEach(([a, b], k) => {
      const [x1, y1] = NET.nodes[a], [x2, y2] = NET.nodes[b];
      edges += `<line class="edge" data-e="${a}-${b}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
    });
    for (const [id, [x, y]] of Object.entries(NET.nodes)) {
      const r = id === 'L' || id === 'S' ? 7.5 : 5.6;
      const label = id === 'L' ? t('you') : id === 'S' ? 'Server' : id;
      nodes += `<g class="node${rd.broken.includes(id) ? ' broken' : ''}" data-n="${id}" role="button" tabindex="0" aria-label="${id === 'L' ? t('you') : id === 'S' ? 'Server' : 'Router ' + id}${rd.broken.includes(id) ? ' – ' + t('broken') : ''}"><circle cx="${x}" cy="${y}" r="${r}"/><text x="${x}" y="${y}">${label}</text></g>`;
    }
    const net = svg(`<svg class="net" viewBox="0 0 100 62" role="group" aria-label="${t('netAria')}">${edges}${nodes}<circle class="packet" r="2.2" cx="${NET.nodes.L[0]}" cy="${NET.nodes.L[1]}" opacity="0"/></svg>`);
    function draw() {
      net.querySelectorAll('.node').forEach(g => {
        g.classList.toggle('inpath', path.includes(g.dataset.n));
        g.classList.toggle('cur', path[path.length - 1] === g.dataset.n);
      });
      net.querySelectorAll('.edge').forEach(e => {
        const [a, b] = e.dataset.e.split('-');
        const used = path.some((n, k) => k > 0 && ((path[k - 1] === a && n === b) || (path[k - 1] === b && n === a)));
        e.classList.toggle('used', used);
      });
      note.textContent = path.map(n => (n === 'L' ? t('you') : n === 'S' ? 'Server' : n)).join(' → ');
    }
    async function arrive() {
      const hops = path.length - 1, best = shortestHops(rd.broken);
      if (rd.shortest && hops > best) {
        api.bad(t('routeLong', { n: hops, m: best }));
        path = ['L']; draw(); return;
      }
      busy = true;
      const pk = net.querySelector('.packet');
      pk.setAttribute('opacity', '1');
      for (const n of path) {
        pk.setAttribute('cx', NET.nodes[n][0]); pk.setAttribute('cy', NET.nodes[n][1]);
        await sleep(api.fast() ? 10 : 260);
      }
      busy = false;
      api.ok(t('routeOk', { n: hops }) + (rd.why ? ' ' + L(rd.why) : ''), () => { i++; show(); });
    }
    function tap(n) {
      if (busy) return;
      const last = path[path.length - 1];
      if (last === 'S') return;
      if (n === last) return;
      const at = path.indexOf(n);
      if (at >= 0) { path = path.slice(0, at + 1); draw(); return; }
      if (!adj(last, n)) { toast(t('routeAdj')); return; }
      if (rd.broken.includes(n)) { api.miss(t('routeBroken', { r: n })); return; }
      path.push(n); Sound.tick(); draw();
      if (n === 'S') arrive();
    }
    net.addEventListener('click', e => { const g = e.target.closest('.node'); if (g) tap(g.dataset.n); });
    net.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && e.target.closest('.node')) { e.preventDefault(); tap(e.target.closest('.node').dataset.n); } });
    fill(host, 
      h('p', { class: 'task' }, L(rd.q)),
      net, note,
      h('div', { class: 'btn-row', style: { justifyContent: 'center' } },
        h('button', { class: 'btn ghost', onclick: () => { if (!busy) { path = path.length > 1 && path[path.length - 1] !== 'S' ? path.slice(0, -1) : path; draw(); } } }, svg(ICONS.undo), t('stepBack')),
        h('button', { class: 'btn ghost', onclick: () => { if (!busy) { path = ['L']; draw(); } } }, t('reset'))));
    draw();
    api.solver(() => { path = ['L']; shortestPath(rd.broken).slice(1).forEach(n => tap(n)); return true; });
  }
  show();
};

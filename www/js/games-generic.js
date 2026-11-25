/* Allgemeine Spieltypen: Quiz, Sortieren, Zuordnen, Reihenfolge, Fehler finden */
'use strict';

const GAMES = {};

/** Programmblöcke anzeigen. spec: [{t, k, i}] – t Text, k Art (motion, control, var, op, look, sound, sense, event), i Einrückung */
function renderBlocks(spec, opts = {}) {
  const wrap = h('div', { class: 'blocks' });
  spec.forEach((b, idx) => {
    const props = { class: 'blk ' + (b.k || 'motion') + (b.end ? ' end' : ''), style: { marginLeft: ((b.i || 0) * 22) + 'px' } };
    const el = opts.onTap ? h('button', Object.assign(props, { class: props.class + ' blk-btn', onclick: () => opts.onTap(idx, el) }), L(b.t)) : h('div', props, L(b.t));
    wrap.append(el);
  });
  return wrap;
}

/** Name eines Eintrags: eigener Text oder Gerätename aus DEVICES */
const itemText = it => (it.t != null ? L(it.t) : it.dev && DEVICES[it.dev] ? L(DEVICES[it.dev].n) : '');
function openInfo(it) {
  const d = it.dev && DEVICES[it.dev];
  const text = it.info ? L(it.info) : d ? L(d.i) : '';
  openSheet(itemText(it), h('div', { class: 'info-sheet' },
    d ? h('span', { class: 'dev-big' }, svg(d.svg)) : null,
    h('p', null, text),
    Speech.ok() ? h('button', { class: 'btn ghost', onclick: () => Speech.speak(itemText(it) + '. ' + text) }, svg(ICONS.speaker), t('readAloud')) : null));
}
const hasInfo = it => !!(it.info || (it.dev && DEVICES[it.dev]));

const CHART_ICONS = {
  line: '<svg viewBox="0 0 40 32" aria-hidden="true"><path d="M3 28h34M3 3v25" stroke="currentColor" stroke-width="2" fill="none" opacity=".45"/><path d="M5 22l8-7 7 4 8-11 8 3" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  bar: '<svg viewBox="0 0 40 32" aria-hidden="true"><path d="M3 28h34" stroke="currentColor" stroke-width="2" opacity=".45"/><rect x="6" y="14" width="6" height="14" rx="1.5" fill="currentColor"/><rect x="16" y="6" width="6" height="22" rx="1.5" fill="currentColor"/><rect x="26" y="18" width="6" height="10" rx="1.5" fill="currentColor"/></svg>',
  pie: '<svg viewBox="0 0 40 32" aria-hidden="true"><circle cx="20" cy="16" r="13" fill="currentColor" opacity=".35"/><path d="M20 16V3a13 13 0 0 1 12.4 17z" fill="currentColor"/></svg>',
  scatter: '<svg viewBox="0 0 40 32" aria-hidden="true"><path d="M3 28h34M3 3v25" stroke="currentColor" stroke-width="2" fill="none" opacity=".45"/><g fill="currentColor"><circle cx="9" cy="22" r="2.4"/><circle cx="15" cy="17" r="2.4"/><circle cx="22" cy="19" r="2.4"/><circle cx="27" cy="10" r="2.4"/><circle cx="33" cy="7" r="2.4"/></g></svg>'
};

/* ---------------- Quiz ---------------- */
GAMES.quiz = function (host, st, api) {
  const items = st.shuffleItems ? shuffle(st.items) : st.items;
  let i = 0;
  function show() {
    if (i >= items.length) return api.done();
    api.progress(i, items.length);
    const it = items[i];
    api.setHint(it.hint);
    let keep = it.opts.map((o, k) => k);
    if (st.maxOpts && keep.length > st.maxOpts) keep = [it.a].concat(keep.filter(k => k !== it.a).slice(0, st.maxOpts - 1));
    const order = shuffle(keep);
    const optBox = h('div', { class: 'opts' + (it.opts.some(o => o.icon || o.dev) ? ' two' : '') });
    let solved = false;
    order.forEach((k, pos) => {
      const o = it.opts[k];
      const label = o.icon || o.dev ? (o.t ? L(o.t) : L(DEVICES[o.dev].n)) : L(o);
      const b = h('button', { class: 'opt', 'data-correct': k === it.a ? '1' : null, onclick: () => {
        if (solved || b.disabled) return;
        if (k === it.a) {
          solved = true;
          b.classList.add('right');
          optBox.querySelectorAll('.opt').forEach(x => { x.disabled = true; });
          api.ok(L(it.why), () => { i++; show(); });
        } else {
          b.classList.add('wrong');
          b.disabled = true;
          api.bad(it.wrong ? L(it.wrong) : t('tryAgain'));
        }
      } },
      h('span', { class: 'key' }, String.fromCharCode(65 + pos)),
      o.icon ? h('span', { class: 'opt-ic' }, svg(CHART_ICONS[o.icon])) : null,
      o.dev ? h('span', { class: 'dev-ic' }, svg(DEVICES[o.dev].svg)) : null,
      h('span', null, label));
      optBox.append(b);
    });
    fill(host, 
      h('p', { class: 'task' }, L(it.q)),
      it.dev ? h('div', { class: 'sort-card', style: { cursor: 'default', touchAction: 'auto' } }, h('span', { class: 'dev' }, svg(DEVICES[it.dev].svg)), L(DEVICES[it.dev].n)) : null,
      it.code ? renderBlocks(it.code) : null,
      it.pre ? h('div', { class: 'cipherbox' }, L(it.pre)) : null,
      optBox);
    api.solver(() => { optBox.querySelector('[data-correct="1"]').click(); return true; });
  }
  show();
};

/* ---------------- Sortieren in Fächer ---------------- */
GAMES.sort = function (host, st, api) {
  const items = shuffle(st.items);
  let i = 0;
  function show() {
    if (i >= items.length) return api.done();
    api.progress(i, items.length);
    const it = items[i];
    api.setHint(it.hint || st.hint);
    let solved = false;
    const d = it.dev && DEVICES[it.dev];
    const card = h('div', { class: 'sort-card' + (st.mono ? ' mono' : ''), role: 'group', 'aria-label': itemText(it) },
      d ? h('span', { class: 'dev' }, svg(d.svg)) : null,
      h('span', null, itemText(it)),
      hasInfo(it) ? h('button', { class: 'info-btn', 'aria-label': t('moreInfo'), title: t('moreInfo'), onclick: e => { e.stopPropagation(); openInfo(it); } }, svg(ICONS.info)) : null);
    function choose(bid) {
      if (solved) return;
      if (bid === it.b) {
        solved = true;
        api.ok(L(it.why), () => { i++; show(); });
      } else {
        card.classList.remove('shake'); void card.offsetWidth; card.classList.add('shake');
        api.bad(it.wrong ? L(it.wrong) : t('tryAgain'));
      }
    }
    const buckets = h('div', { class: 'buckets' }, st.buckets.map(bk => h('button', {
      class: 'bucket', 'data-b': bk.id, onclick: () => choose(bk.id)
    }, L(bk.t), bk.sub ? h('small', null, L(bk.sub)) : null)));
    // Ziehen mit Finger oder Maus
    let start = null, dragging = false, over = null;
    const bucketAt = (x, y) => { const el = document.elementsFromPoint(x, y).find(e => e.classList && e.classList.contains('bucket')); return el && buckets.contains(el) ? el : null; };
    card.addEventListener('pointerdown', e => {
      if (solved || e.target.closest('.info-btn')) return;
      start = { x: e.clientX, y: e.clientY }; dragging = false;
      try { card.setPointerCapture(e.pointerId); } catch (err) { /* egal */ }
    });
    card.addEventListener('pointermove', e => {
      if (!start) return;
      const dx = e.clientX - start.x, dy = e.clientY - start.y;
      if (!dragging && Math.hypot(dx, dy) > 6) { dragging = true; card.classList.add('dragging'); }
      if (!dragging) return;
      card.style.transform = `translate(${dx}px, ${dy}px) rotate(${Math.max(-6, Math.min(6, dx / 25))}deg)`;
      const b = bucketAt(e.clientX, e.clientY);
      if (b !== over) { if (over) over.classList.remove('over'); over = b; if (over) over.classList.add('over'); }
    });
    const end = e => {
      if (!start) return;
      const wasDrag = dragging;
      start = null; dragging = false;
      card.classList.remove('dragging'); card.style.transform = '';
      if (over) over.classList.remove('over');
      const b = wasDrag ? bucketAt(e.clientX, e.clientY) : null;
      over = null;
      if (b) choose(b.dataset.b);
    };
    card.addEventListener('pointerup', end);
    card.addEventListener('pointercancel', () => { start = null; dragging = false; card.classList.remove('dragging'); card.style.transform = ''; if (over) over.classList.remove('over'); over = null; });
    fill(host, h('p', { class: 'task' }, L(st.task)), card,
      h('p', { class: 'drag-hint' }, t('dragHint')), buckets,
      h('div', { class: 'count-note' }, t('cardOf', { n: i + 1, m: items.length })));
    api.solver(() => { choose(it.b); return true; });
  }
  show();
};

/* ---------------- Zuordnen (Paare) ---------------- */
GAMES.match = function (host, st, api) {
  const sets = st.sets || [{ pairs: st.pairs, task: st.task }];
  let si = 0;
  function show() {
    if (si >= sets.length) return api.done();
    api.progress(si, sets.length);
    const set = sets[si];
    api.setHint(set.hint || st.hint);
    const n = set.pairs.length;
    let selA = null, selB = null, found = 0;
    const left = h('div', { class: 'match-col' }), right = h('div', { class: 'match-col' });
    const btnsA = [], btnsB = [];
    function tryPair() {
      if (selA == null || selB == null) return;
      const a = btnsA[selA], b = btnsB[selB];
      if (selA === selB) {
        a.classList.remove('sel'); b.classList.remove('sel');
        a.classList.add('ok'); b.classList.add('ok');
        a.disabled = b.disabled = true;
        found++;
        Sound.tick();
        selA = selB = null;
        if (found === n) api.ok(L(set.final || st.final) || t('allPairs'), () => { si++; show(); });
      } else {
        [a, b].forEach(x => { x.classList.remove('sel', 'shake'); void x.offsetWidth; x.classList.add('shake'); });
        selA = selB = null;
        api.miss(t('noPair'));
      }
    }
    shuffle(set.pairs.map((p, k) => k)).forEach(k => {
      const b = h('button', { class: 'm-item term', onclick: () => {
        if (b.disabled) return;
        btnsA.forEach(x => x.classList.remove('sel'));
        selA = k; b.classList.add('sel'); tryPair();
      } }, L(set.pairs[k].a));
      btnsA[k] = b; left.append(b);
    });
    shuffle(set.pairs.map((p, k) => k)).forEach(k => {
      const b = h('button', { class: 'm-item', onclick: () => {
        if (b.disabled) return;
        btnsB.forEach(x => x.classList.remove('sel'));
        selB = k; b.classList.add('sel'); tryPair();
      } }, L(set.pairs[k].b));
      btnsB[k] = b; right.append(b);
    });
    fill(host, h('p', { class: 'task' }, L(set.task || st.task)), h('div', { class: 'match' }, left, right));
    api.solver(() => {
      btnsA.forEach((b, k) => { if (!b.disabled) { b.click(); btnsB[k].click(); } });
      return true;
    });
  }
  show();
};

/* ---------------- Reihenfolge (Blöcke ordnen) ---------------- */
GAMES.order = function (host, st, api) {
  let ti = 0;
  function show() {
    if (ti >= st.tasks.length) return api.done();
    api.progress(ti, st.tasks.length);
    const task = st.tasks[ti];
    api.setHint(task.hint);
    const n = task.blocks.length;
    const poolIdx = shuffleNotSame(task.blocks.map((b, k) => k));
    let prog = [];
    const pool = h('div', { class: 'pool' }), progEl = h('div', { class: 'prog' });
    const check = h('button', { class: 'btn pri', disabled: true, onclick: doCheck }, t('check'));
    function blk(k, onTap) {
      const b = task.blocks[k];
      return h('button', { class: 'blk blk-btn ' + (b.k || 'motion'), style: { marginLeft: ((b.i || 0) * 22) + 'px' }, 'data-k': k, onclick: onTap }, b.dev ? h('span', { class: 'dev-ic', style: { display: 'inline-flex', width: '26px', height: '26px' } }, svg(DEVICES[b.dev].svg)) : null, L(b.t));
    }
    function draw() {
      pool.replaceChildren(...poolIdx.filter(k => !prog.includes(k)).map(k => blk(k, () => { prog.push(k); draw(); })));
      progEl.replaceChildren(...(prog.length ? prog.map((k, pos) => blk(k, () => { prog.splice(pos, 1); draw(); }))
        : [h('span', { class: 'sub', style: { margin: '0' } }, st.plain ? t('tapToAddCards') : t('tapToAdd'))]));
      check.disabled = prog.length !== n;
    }
    function doCheck() {
      const firstWrong = prog.findIndex((k, pos) => k !== pos);
      if (firstWrong < 0) {
        progEl.querySelectorAll('.blk').forEach(b => b.classList.add('good'));
        api.ok(L(task.why), () => { ti++; show(); });
      } else {
        progEl.querySelectorAll('.blk')[firstWrong].classList.add('bad');
        api.bad(t('orderWrong', { n: firstWrong + 1 }));
      }
    }
    fill(host, 
      h('p', { class: 'task' }, L(task.goal)),
      h('div', { class: 'two-col' + (st.plain ? ' chips' : '') },
        h('div', null, h('div', { class: 'lbl' }, st.plain ? t('cardsPool') : t('blocksPool')), pool),
        h('div', null, h('div', { class: 'lbl' }, st.plain ? t('yourOrder') : t('yourProgram')), progEl)),
      h('div', { class: 'btn-row' }, check, h('button', { class: 'btn ghost', onclick: () => { prog = []; draw(); } }, svg(ICONS.undo), t('reset'))));
    draw();
    api.solver(() => { prog = task.blocks.map((b, k) => k); draw(); check.click(); return true; });
  }
  show();
};

/* ---------------- Fehler finden ---------------- */
GAMES.bug = function (host, st, api) {
  let ti = 0;
  function show() {
    if (ti >= st.tasks.length) return api.done();
    api.progress(ti, st.tasks.length);
    const task = st.tasks[ti];
    api.setHint(task.hint);
    let solved = false;
    const blocks = renderBlocks(task.blocks, { onTap: (idx, el) => {
      if (solved) return;
      if (idx === task.bug) {
        solved = true;
        el.classList.add('good');
        api.ok(L(task.why), () => { ti++; show(); });
      } else {
        el.classList.add('bad');
        setTimeout(() => el.classList.remove('bad'), 900);
        api.bad(t('bugWrong'));
      }
    } });
    fill(host, h('p', { class: 'task' }, L(task.goal)), h('p', { class: 'sub' }, t('bugTask')), blocks);
    api.solver(() => { blocks.children[task.bug].click(); return true; });
  }
  show();
};

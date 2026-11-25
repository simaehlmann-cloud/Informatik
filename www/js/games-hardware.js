/* PC-Werkstatt: Bauteile einbauen und einschalten (Stufe 1/2) oder PC nach Auftrag zusammenstellen (Stufe 3) */
'use strict';

/* Steckplätze im Gehäuse (Angaben in % der Gehäusefläche) */
const PC_SLOTS = [
  { id: 'board', accepts: 'board', box: [6, 4, 70, 64], onBoard: false },
  { id: 'cpu', accepts: 'cpu', box: [26, 14, 20, 18], onBoard: true },
  { id: 'cooler', accepts: 'cooler', box: [26, 14, 20, 18], onBoard: true, needs: 'cpu' },
  { id: 'ram', accepts: 'ram', box: [52, 9, 10, 34], onBoard: true },
  { id: 'm2', accepts: 'ssd', box: [14, 37, 30, 7], onBoard: true },
  { id: 'pcie', accepts: 'gpu', box: [10, 48, 60, 11], onBoard: true },
  { id: 'psu', accepts: 'psu', box: [6, 74, 48, 20], onBoard: false },
  { id: 'pwr24', accepts: 'cable24', box: [65, 28, 9, 16], onBoard: true, cable: true },
  { id: 'pwr8', accepts: 'cable8', box: [28, 5, 16, 7], onBoard: true, cable: true }
];
const CABLE_SVG = '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><rect x="14" y="4" width="20" height="12" rx="2" fill="currentColor" fill-opacity=".16"/><path d="M18 8h2M23 8h2M28 8h2M18 12h2M23 12h2M28 12h2M20 16c0 10 8 10 8 20v8M24 16c0 10 8 10 8 20v8"/></svg>';

function monitorEl() {
  const scr = h('div', { class: 'mon-screen' });
  const el = h('div', { class: 'mon' }, scr, h('div', { class: 'mon-foot' }));
  return {
    el,
    off() { scr.className = 'mon-screen'; scr.replaceChildren(); },
    text(lines, cls = '') { scr.className = 'mon-screen on ' + cls; scr.replaceChildren(...lines.map(l => h('div', null, l))); },
    desktop() {
      scr.className = 'mon-screen on desk';
      scr.replaceChildren(h('div', { class: 'desk-icons' }, [0, 1, 2, 3].map(() => h('i'))), h('div', { class: 'desk-bar' }, h('i'), h('span', null, '12:00')));
    }
  };
}

GAMES.pcbuild = function (host, st, api) {
  if (st.missions) return pcConfigurator(host, st, api);
  api.progress(0, 1);
  api.setHint(st.hint);
  const needBoard = !!st.withBoard, cables = !!st.withCables;
  const placed = {};               // slotId -> part
  let selected = null, busy = false;
  const parts = st.parts.map((p, k) => Object.assign({ key: 'p' + k }, p));
  const slots = PC_SLOTS.filter(s => (needBoard || s.id !== 'board') && (cables || !s.cable));
  const caseEl = h('div', { class: 'pc-case' + (needBoard ? '' : ' has-board'), role: 'group', 'aria-label': t('pcCase') });
  const slotEls = {};
  const tray = h('div', { class: 'pc-tray' });
  const mon = monitorEl();
  const led = h('span', { class: 'pc-led' });
  const fan = h('span', { class: 'pc-fan', 'aria-hidden': 'true' });
  const partName = p => (p.dev === 'cable24' ? t('cable24') : p.dev === 'cable8' ? t('cable8') : L(DEVICES[p.dev].n));
  const partSvg = p => (p.dev.startsWith('cable') ? CABLE_SVG : DEVICES[p.dev].svg);

  function boardIn() { return !needBoard || !!placed.board; }
  function drawSlots() {
    for (const s of slots) {
      const el = slotEls[s.id];
      const part = placed[s.id];
      el.classList.toggle('filled', !!part);
      el.classList.toggle('hidden', (s.onBoard && !boardIn()) || (!!s.needs && !placed[s.needs]));
      el.classList.toggle('under', s.id === 'cpu' && !!placed.cooler);
      el.classList.toggle('hint', api.level === 1 && !!selected && !part && selected.dev === s.accepts);
      el.replaceChildren(...(part ? [h('span', { class: 'slot-part' }, svg(partSvg(part)))] : st.labels ? [h('span', { class: 'slot-lbl' }, t('slot_' + s.id))] : []));
      el.setAttribute('aria-label', t('slot_' + s.id) + (part ? ': ' + partName(part) : ''));
    }
    caseEl.classList.toggle('has-board', boardIn());
  }
  function drawTray() {
    const inUse = new Set(Object.values(placed).map(p => p.key));
    const free = parts.filter(p => !inUse.has(p.key));
    tray.replaceChildren(...free.map(p => {
      const card = h('div', { class: 'pc-part' + (selected === p ? ' sel' : ''), role: 'button', tabindex: '0', 'aria-pressed': String(selected === p), 'data-key': p.key },
        h('span', { class: 'pp-ic' }, svg(partSvg(p))), h('span', { class: 'pp-n' }, partName(p)),
        !p.dev.startsWith('cable') ? h('button', { class: 'info-btn pp-i', 'aria-label': t('moreInfo'), onclick: e => { e.stopPropagation(); openInfo({ dev: p.dev, info: p.info }); } }, svg(ICONS.info)) : null);
      card.addEventListener('click', () => { if (busy) return; selected = selected === p ? null : p; drawTray(); drawSlots(); });
      card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.click(); } });
      enableDrag(card, p);
      return card;
    }));
    if (!free.length) tray.append(h('p', { class: 'sub', style: { margin: 0 } }, t('pcAllIn')));
  }
  function place(p, s) {
    if (busy) return;
    if (placed[s.id]) { toast(t('pcSlotFull')); return; }
    if (s.onBoard && !boardIn()) { api.miss(t('pcBoardFirst')); return; }
    if (p.dev !== s.accepts) {
      if (p.outside) api.miss(t('pcOutside', { p: partName(p) }));
      else api.miss(t('pcWrongSlot', { p: partName(p) }) + (p.where ? ' ' + L(p.where) : ''));
      return;
    }
    if (s.needs && !placed[s.needs]) { api.miss(t('pcCpuFirst')); return; }
    placed[s.id] = p; selected = null; Sound.tick();
    drawSlots(); drawTray();
  }
  function remove(s) {
    if (busy || !placed[s.id]) return;
    if (s.id === 'cpu' && placed.cooler) { toast(t('pcCoolerOnTop')); return; }
    if (s.id === 'board' && slots.some(x => x.onBoard && placed[x.id])) { toast(t('pcBoardBusy')); return; }
    delete placed[s.id]; drawSlots(); drawTray();
  }
  for (const s of slots) {
    const [x, y, w, hh] = s.box;
    const el = h('button', { class: 'slot slot-' + s.id, style: { left: x + '%', top: y + '%', width: w + '%', height: hh + '%' }, 'data-slot': s.id,
      onclick: () => { if (selected) place(selected, s); else remove(s); } });
    slotEls[s.id] = el; caseEl.append(el);
  }
  caseEl.append(fan, led);
  // Ziehen eines Bauteils auf einen Steckplatz
  function enableDrag(card, p) {
    let start = null, drag = false, ghost = null;
    card.addEventListener('pointerdown', e => { if (busy || e.target.closest('.info-btn')) return; start = { x: e.clientX, y: e.clientY }; drag = false; try { card.setPointerCapture(e.pointerId); } catch (err) { /* egal */ } });
    card.addEventListener('pointermove', e => {
      if (!start) return;
      if (!drag && Math.hypot(e.clientX - start.x, e.clientY - start.y) > 8) {
        drag = true; selected = p; drawSlots();
        ghost = h('div', { class: 'pc-ghost' }, svg(partSvg(p)));
        document.body.append(ghost);
      }
      if (drag) { ghost.style.left = e.clientX + 'px'; ghost.style.top = e.clientY + 'px'; }
    });
    const end = e => {
      if (!start) return;
      const was = drag; start = null; drag = false;
      if (ghost) { ghost.remove(); ghost = null; }
      if (!was) return;
      card.dataset.dragged = '1'; setTimeout(() => { delete card.dataset.dragged; }, 50);
      const slotEl = document.elementsFromPoint(e.clientX, e.clientY).find(x => x.classList && x.classList.contains('slot') && caseEl.contains(x));
      const s = slotEl && slots.find(x => x.id === slotEl.dataset.slot);
      if (s) place(p, s); else { selected = null; drawSlots(); drawTray(); }
    };
    card.addEventListener('pointerup', end);
    card.addEventListener('pointercancel', () => { start = null; drag = false; if (ghost) { ghost.remove(); ghost = null; } });
    card.addEventListener('click', e => { if (card.dataset.dragged) e.stopImmediatePropagation(); }, true);
  }

  /** Was passiert beim Einschalten? Liefert den ersten Fehler oder null. */
  function diagnose() {
    if (!placed.psu) return 'noPower';
    if (needBoard && !placed.board) return 'noBoard';
    if (cables && (!placed.pwr24 || !placed.pwr8)) return 'noCable';
    if (!placed.cpu) return 'noCpu';
    if (!placed.cooler) return 'noCooler';
    if (!placed.ram) return 'noRam';
    if (!placed.pcie) return 'noGpu';
    if (!placed.m2) return 'noDisk';
    return null;
  }
  async function powerOn() {
    if (busy) return;
    busy = true; selected = null; drawSlots(); drawTray();
    const fast = api.fast();
    const wait = ms => sleep(fast ? 5 : ms);
    const fault = diagnose();
    mon.off();
    if (fault === 'noPower' || fault === 'noBoard' || fault === 'noCable') {
      await wait(700);
    } else {
      led.classList.add('on'); fan.classList.add('spin');
      await wait(600);
      if (fault === 'noCpu') { await wait(600); }
      else if (fault === 'noCooler') { mon.text([t('bootPost')]); await wait(1300); mon.text([t('bootHot')], 'warn'); await wait(900); }
      else if (fault === 'noRam') { Sound.bad(); await wait(250); Sound.bad(); await wait(250); Sound.bad(); await wait(500); }
      else if (fault === 'noGpu') { await wait(900); }
      else if (fault === 'noDisk') { mon.text([t('bootPost'), t('bootRamOk')]); await wait(800); mon.text([t('bootPost'), t('bootRamOk'), t('bootNoOs')], 'warn'); await wait(700); }
      else {
        mon.text([t('bootPost')]); await wait(500);
        mon.text([t('bootPost'), t('bootRamOk')]); await wait(500);
        mon.text([t('bootPost'), t('bootRamOk'), t('bootOs')]); await wait(800);
        mon.desktop(); await wait(500);
      }
    }
    if (fault) {
      led.classList.remove('on'); fan.classList.remove('spin');
      if (fault !== 'noDisk' && fault !== 'noCooler') mon.off();
      busy = false;
      api.bad(t('pcFault_' + fault));
    } else {
      busy = false;
      api.ok(L(st.final), () => api.done());
    }
  }
  fill(host, 
    h('p', { class: 'task' }, L(st.task)),
    h('div', { class: 'pc-wrap' },
      h('div', { class: 'pc-main' }, caseEl,
        h('div', { class: 'lbl' }, t('pcParts')),
        h('p', { class: 'sub', style: { margin: '-2px 0 8px' } }, t('pcHow')),
        tray),
      h('div', { class: 'pc-side' },
        mon.el,
        h('button', { class: 'btn pri power-btn', onclick: powerOn }, svg(ICONS.power), t('powerOn')))));
  drawSlots(); drawTray();
  api.solver(() => {
    for (const s of slots) if (!placed[s.id]) placed[s.id] = parts.find(p => p.dev === s.accepts && !Object.values(placed).includes(p));
    drawSlots(); drawTray(); powerOn(); return true;
  });
};

/* ---------------- Stufe 3: PC nach Auftrag zusammenstellen ---------------- */
const PC_CATS = ['cpu', 'board', 'ram', 'ssd', 'gpu', 'psu'];
/** Prüft eine Auswahl. Gibt [Fehlerschlüssel, Werte] oder null zurück. Auch von validate.js genutzt. */
function pcCheck(sel, mission, cat) {
  const c = k => cat[k].find(x => x.id === sel[k]);
  for (const k of PC_CATS) if (!c(k)) return ['pcPick', { c: k }];
  const cpu = c('cpu'), board = c('board'), gpu = c('gpu'), psu = c('psu');
  if (cpu.socket !== board.socket) return ['pcSocket', { a: cpu.socket, b: board.socket }];
  if (!gpu.watt && !cpu.igpu) return ['pcNoGfx', {}];
  const need = cpu.watt + (gpu.watt || 0) + 60;
  if (psu.watt < need) return ['pcWatt', { n: need, w: psu.watt }];
  const price = PC_CATS.reduce((a, k) => a + c(k).price, 0) + cat.base;
  for (const r of mission.req) {
    const v = c(r.cat)[r.prop];
    if (v < r.min) return ['pcReq', { r: r.id }];
  }
  if (price > mission.budget) return ['pcBudget', { p: price, b: mission.budget }];
  return null;
}
function pcConfigurator(host, st, api) {
  const cat = st.catalog;
  let mi = 0;
  function show() {
    if (mi >= st.missions.length) return api.done();
    api.progress(mi, st.missions.length);
    const m = st.missions[mi];
    api.setHint(m.hint);
    const sel = {};
    const total = h('b'), watt = h('b');
    const mon = monitorEl();
    function upd() {
      const price = PC_CATS.reduce((a, k) => a + ((cat[k].find(x => x.id === sel[k]) || {}).price || 0), 0) + cat.base;
      const cpu = cat.cpu.find(x => x.id === sel.cpu), gpu = cat.gpu.find(x => x.id === sel.gpu);
      total.textContent = fmtNum(price) + ' €';
      total.style.color = price > m.budget ? 'var(--bad)' : '';
      watt.textContent = (cpu ? cpu.watt + (gpu ? gpu.watt || 0 : 0) + 60 : '–') + ' W';
    }
    const rows = PC_CATS.map(k => h('div', { class: 'cfg-row' },
      h('div', { class: 'cfg-head' }, h('span', { class: 'dev-ic' }, svg(DEVICES[k === 'board' ? 'board' : k].svg)), h('b', null, t('cat_' + k))),
      h('div', { class: 'cfg-opts', role: 'radiogroup', 'aria-label': t('cat_' + k) }, cat[k].map(o => h('button', {
        class: 'cfg-opt', role: 'radio', 'aria-checked': 'false', 'data-cat': k, 'data-id': o.id, onclick: e => {
          sel[k] = o.id;
          e.currentTarget.parentNode.querySelectorAll('.cfg-opt').forEach(b => b.setAttribute('aria-checked', String(b === e.currentTarget)));
          upd();
        }
      }, h('b', null, L(o.n)), h('small', null, L(o.d)), h('span', { class: 'price' }, o.price ? fmtNum(o.price) + ' €' : t('free')))))));
    async function build() {
      const err = pcCheck(sel, m, cat);
      if (err && err[0] === 'pcPick') { toast(t('pcPick', { c: t('cat_' + err[1].c) })); return; }
      if (err) {
        if (err[0] === 'pcReq') return api.bad(L(m.req.find(r => r.id === err[1].r).msg));
        return api.bad(t(err[0], err[1]));
      }
      mon.text([t('bootPost')]); await sleep(api.fast() ? 5 : 500);
      mon.text([t('bootPost'), t('bootRamOk'), t('bootOs')]); await sleep(api.fast() ? 5 : 700);
      mon.desktop();
      api.ok(L(m.why), () => { mi++; show(); });
    }
    fill(host, 
      h('p', { class: 'task' }, L(m.task)),
      h('div', { class: 'kpis', style: { marginBottom: '14px' } },
        h('div', { class: 'kpi' }, h('small', null, t('budget')), h('b', null, fmtNum(m.budget) + ' €')),
        h('div', { class: 'kpi' }, h('small', null, t('total')), total),
        h('div', { class: 'kpi' }, h('small', null, t('powerNeed')), watt)),
      h('p', { class: 'sub' }, t('cfgBase', { p: cat.base })),
      rows,
      h('div', { class: 'pc-wrap', style: { marginTop: '16px', gridTemplateColumns: 'minmax(0,1fr)' } },
        h('div', { class: 'pc-side', style: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' } }, mon.el,
          h('button', { class: 'btn pri power-btn', onclick: build }, svg(ICONS.power), t('buildAndStart')))));
    upd();
    api.solver(() => {
      Object.assign(sel, m.solution);
      host.querySelectorAll('.cfg-opt').forEach(b => b.setAttribute('aria-checked', String(sel[b.dataset.cat] === b.dataset.id)));
      upd(); build(); return true;
    });
  }
  show();
}

/* =====================================================
   RON INVENTORY SERVER v3 — G2 Elmsley
   script.js  |  Plain JS, no dependencies, localStorage
   ===================================================== */
'use strict';

/* ══════════════════════════════════════════════════
   §1  BOOT SEQUENCE
══════════════════════════════════════════════════ */
(function boot() {
  const lines  = document.querySelectorAll('.boot-line');
  const bar    = document.getElementById('boot-bar');
  const status = document.getElementById('boot-status');
  const spin   = document.getElementById('boot-spin');
  const screen = document.getElementById('boot-screen');

  const msgs = [
    'Activating node…','Masking location…','Loading inventory…',
    'Enabling secure mode…','Confirming offline state…','Ready.',
  ];
  let i = 0;

  function next() {
    if (i >= lines.length) return;
    const delay = parseInt(lines[i].dataset.delay, 10) || 0;
    setTimeout(() => {
      lines[i].classList.add('vis');
      bar.style.width = Math.round(((i + 1) / lines.length) * 88) + '%';
      status.textContent = msgs[i] || '';
      i++;
      next();
    }, delay);
  }
  next();

  setTimeout(() => { if (spin) spin.classList.add('done'); }, 2600 + 900);

  setTimeout(() => {
    bar.style.width = '100%';
    status.textContent = 'Ready.';
    setTimeout(() => {
      screen.classList.add('fade-out');
      setTimeout(() => {
        screen.style.display = 'none';
        document.getElementById('app').classList.remove('hidden');
        initApp();
      }, 560);
    }, 450);
  }, 4000);
})();

/* ══════════════════════════════════════════════════
   §2  STORAGE KEYS & STATE
══════════════════════════════════════════════════ */
const KEYS = {
  inv:    'ron3_inventory',
  xin:    'ron3_xfer_in',
  xout:   'ron3_xfer_out',
  log:    'ron3_log',
};

let inventory = [];   // G2 inventory items
let xferIn    = [];   // transfer-in records
let xferOut   = [];   // transfer-out records
let actLog    = [];   // activity log entries

// UI filter state
let invSearch = '', invFBrand = '', invFType = '', invFNet = '';
let xiSearch  = '', xiFStore  = '', xiFFrom = '', xiFTo = '';
let xoSearch  = '', xoFStore  = '', xoFFrom = '', xoFTo = '';

// currently editing item id (null = new add)
let editingId = null;
let confirmCallback = null;

/* ══════════════════════════════════════════════════
   §3  DEFAULT INVENTORY DATA
══════════════════════════════════════════════════ */
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function mkItem(brand, ss, model, type, net, notes) {
  return { id: uid(), brand, samsungSeries: ss || '', model, type, network: net || 'Universal', notes: notes || '', qty: 0, updatedAt: null };
}

function buildDefault() {
  const items = [];

  /* ── iPhone ── */
  [
    'iPhone 6','iPhone 6 Plus','iPhone 6S','iPhone 6S Plus',
    'iPhone 7','iPhone 7 Plus','iPhone 8','iPhone 8 Plus',
    'iPhone X','iPhone XR','iPhone XS','iPhone XS Max',
    'iPhone 11','iPhone 11 Pro','iPhone 11 Pro Max',
    'iPhone 12','iPhone 12 Mini','iPhone 12 Pro','iPhone 12 Pro Max',
    'iPhone 13','iPhone 13 Mini','iPhone 13 Pro','iPhone 13 Pro Max',
    'iPhone 14','iPhone 14 Plus','iPhone 14 Pro','iPhone 14 Pro Max',
    'iPhone 15','iPhone 15 Plus','iPhone 15 Pro','iPhone 15 Pro Max',
    'iPhone 16','iPhone 16 Plus','iPhone 16 Pro','iPhone 16 Pro Max',
  ].forEach(m => items.push(mkItem('Apple', '', m, 'LCD', 'Universal', '')));

  /* ── Samsung S ── */
  [
    { m:'Galaxy S8',    n:'Universal' },{ m:'Galaxy S8+',       n:'Universal' },
    { m:'Galaxy S9',    n:'Universal' },{ m:'Galaxy S9+',       n:'Universal' },
    { m:'Galaxy S10',   n:'Universal' },{ m:'Galaxy S10+',      n:'Universal' },
    { m:'Galaxy S10e',  n:'Universal' },{ m:'Galaxy S10 5G',    n:'5G' },
    { m:'Galaxy S20',   n:'4G'        },{ m:'Galaxy S20 5G',    n:'5G' },
    { m:'Galaxy S20+',  n:'4G'        },{ m:'Galaxy S20+ 5G',   n:'5G' },
    { m:'Galaxy S20 Ultra 5G',n:'5G'  },{ m:'Galaxy S20 FE',   n:'4G' },
    { m:'Galaxy S20 FE 5G',n:'5G'     },
    { m:'Galaxy S21',   n:'5G'        },{ m:'Galaxy S21+',      n:'5G' },
    { m:'Galaxy S21 Ultra',n:'5G'     },{ m:'Galaxy S21 FE',    n:'5G' },
    { m:'Galaxy S22',   n:'5G'        },{ m:'Galaxy S22+',      n:'5G' },
    { m:'Galaxy S22 Ultra',n:'5G'     },
    { m:'Galaxy S23',   n:'5G'        },{ m:'Galaxy S23+',      n:'5G' },
    { m:'Galaxy S23 Ultra',n:'5G'     },{ m:'Galaxy S23 FE',    n:'5G' },
    { m:'Galaxy S24',   n:'5G'        },{ m:'Galaxy S24+',      n:'5G' },
    { m:'Galaxy S24 Ultra',n:'5G'     },
    { m:'Galaxy S25',   n:'5G'        },{ m:'Galaxy S25+',      n:'5G' },
    { m:'Galaxy S25 Ultra',n:'5G'     },
  ].forEach(x => items.push(mkItem('Samsung', 'S', x.m, 'LCD', x.n, '')));

  /* ── Samsung Note ── */
  [
    { m:'Galaxy Note 8',     n:'Universal' },{ m:'Galaxy Note 9',      n:'Universal' },
    { m:'Galaxy Note 10',    n:'Universal' },{ m:'Galaxy Note 10+',    n:'Universal' },
    { m:'Galaxy Note 10 5G', n:'5G'        },{ m:'Galaxy Note 20',     n:'4G' },
    { m:'Galaxy Note 20 5G', n:'5G'        },{ m:'Galaxy Note 20 Ultra 5G',n:'5G' },
  ].forEach(x => items.push(mkItem('Samsung', 'Note', x.m, 'LCD', x.n, '')));

  /* ── Samsung A ── */
  [
    { m:'Galaxy A10',    n:'Universal',  no:'' },
    { m:'Galaxy A11',    n:'Universal',  no:'' },
    { m:'Galaxy A12',    n:'Universal',  no:'' },
    { m:'Galaxy A13',    n:'4G',         no:'Verify 4G vs 5G — different flex on some batches' },
    { m:'Galaxy A13 5G', n:'5G',         no:'' },
    { m:'Galaxy A14',    n:'Universal',  no:'4G and 5G share LCD on most batches' },
    { m:'Galaxy A15',    n:'Universal',  no:'4G and 5G LCD compatible — verify supplier batch' },
    { m:'Galaxy A20',    n:'Universal',  no:'' },
    { m:'Galaxy A21',    n:'Universal',  no:'' },
    { m:'Galaxy A21s',   n:'Universal',  no:'' },
    { m:'Galaxy A32',    n:'4G',         no:'' },
    { m:'Galaxy A32 5G', n:'5G',         no:'Different LCD from 4G version' },
    { m:'Galaxy A42 5G', n:'5G',         no:'' },
    { m:'Galaxy A51',    n:'4G',         no:'' },
    { m:'Galaxy A52',    n:'4G',         no:'' },
    { m:'Galaxy A52s 5G',n:'5G',         no:'' },
    { m:'Galaxy A53',    n:'5G',         no:'' },
    { m:'Galaxy A54',    n:'5G',         no:'' },
    { m:'Galaxy A71',    n:'Unknown',    no:'Check 4G or 5G variant before ordering' },
    { m:'Galaxy A72',    n:'4G',         no:'' },
  ].forEach(x => items.push(mkItem('Samsung', 'A', x.m, 'LCD', x.n, x.no)));

  /* ── Motorola ── */
  [
    'Moto E6','Moto E7','Moto E7 Power','Moto E8','Moto E13','Moto E14','Moto E20','Moto E30','Moto E40',
    'Moto G5','Moto G5 Plus','Moto G5S',
    'Moto G6','Moto G6 Play','Moto G6 Plus',
    'Moto G7','Moto G7 Play','Moto G7 Plus','Moto G7 Power',
    'Moto G8','Moto G8 Play','Moto G8 Plus','Moto G8 Power',
    'Moto G9','Moto G9 Play','Moto G9 Plus','Moto G9 Power',
    'Moto G10','Moto G20','Moto G30','Moto G40 Fusion',
    'Moto G50','Moto G51','Moto G52','Moto G53','Moto G54','Moto G62','Moto G71','Moto G82','Moto G84','Moto G85',
    'Moto G Fast','Moto G Pure',
    'Moto G Power (2021)','Moto G Power (2022)','Moto G Power (2023)','Moto G Power (2024)',
    'Moto G Play (2021)','Moto G Play (2023)','Moto G Play (2024)',
    'Moto G Stylus (2021)','Moto G Stylus (2022)','Moto G Stylus (2023)','Moto G Stylus (2024)',
    'Moto Edge','Moto Edge+','Moto Edge 20','Moto Edge 20 Pro',
    'Moto Edge 30','Moto Edge 30 Pro','Moto Edge 30 Fusion',
    'Moto Edge 40','Moto Edge 40 Pro','Moto Edge 40 Neo',
    'Moto Edge 50 Pro','Moto Edge 50 Fusion','Moto Edge 50 Ultra',
    'Moto One','Moto One Action','Moto One Vision','Moto One Fusion',
    'Moto Z3','Moto Z4',
  ].forEach(m => items.push(mkItem('Motorola', '', m, 'LCD', 'Unknown', 'Verify SKU before ordering')));

  /* ── iPad LCD ── */
  [
    'iPad 5th Gen','iPad 6th Gen','iPad 7th Gen','iPad 8th Gen','iPad 9th Gen','iPad 10th Gen',
    'iPad Air 2','iPad Air 3rd Gen','iPad Air 4th Gen','iPad Air 5th Gen','iPad Air M2','iPad Air M3',
    'iPad Mini 4','iPad Mini 5th Gen','iPad Mini 6th Gen',
    'iPad Pro 9.7"','iPad Pro 10.5"',
    'iPad Pro 11" 1st Gen','iPad Pro 11" 2nd Gen','iPad Pro 11" 3rd Gen','iPad Pro 11" 4th Gen',
    'iPad Pro 12.9" 1st Gen','iPad Pro 12.9" 2nd Gen','iPad Pro 12.9" 3rd Gen',
    'iPad Pro 12.9" 4th Gen','iPad Pro 12.9" 5th Gen','iPad Pro 12.9" 6th Gen',
  ].forEach(m => items.push(mkItem('Apple iPad', '', m, 'LCD', 'Universal', '')));

  /* ── iPad Digitizer ── */
  [
    'iPad 5th Gen','iPad 6th Gen','iPad 7th Gen','iPad 8th Gen','iPad 9th Gen','iPad 10th Gen',
    'iPad Air 2','iPad Air 3rd Gen','iPad Air 4th Gen','iPad Air 5th Gen',
    'iPad Mini 4','iPad Mini 5th Gen','iPad Mini 6th Gen',
    'iPad Pro 9.7"','iPad Pro 10.5"',
    'iPad Pro 11" 1st Gen','iPad Pro 11" 2nd Gen',
    'iPad Pro 12.9" 1st Gen','iPad Pro 12.9" 2nd Gen','iPad Pro 12.9" 3rd Gen',
  ].forEach(m => items.push(mkItem('Apple iPad', '', m, 'Digitizer', 'Universal', '')));

  return items;
}

/* ══════════════════════════════════════════════════
   §4  PERSISTENCE
══════════════════════════════════════════════════ */
function saveAll() {
  try {
    localStorage.setItem(KEYS.inv,  JSON.stringify(inventory));
    localStorage.setItem(KEYS.xin,  JSON.stringify(xferIn));
    localStorage.setItem(KEYS.xout, JSON.stringify(xferOut));
    localStorage.setItem(KEYS.log,  JSON.stringify(actLog));
  } catch (e) { showToast('⚠ localStorage save failed'); }
}

function loadAll() {
  try {
    const inv  = localStorage.getItem(KEYS.inv);
    const xi   = localStorage.getItem(KEYS.xin);
    const xo   = localStorage.getItem(KEYS.xout);
    const log  = localStorage.getItem(KEYS.log);
    inventory  = inv  ? JSON.parse(inv)  : buildDefault();
    xferIn     = xi   ? JSON.parse(xi)   : [];
    xferOut    = xo   ? JSON.parse(xo)   : [];
    actLog     = log  ? JSON.parse(log)  : [];
    if (!inv) saveAll();
  } catch (e) {
    inventory = buildDefault(); xferIn = []; xferOut = []; actLog = [];
  }
}

/* ══════════════════════════════════════════════════
   §5  LOGGING
══════════════════════════════════════════════════ */
function logAct(type, message) {
  actLog.unshift({ type, message, ts: Date.now() });
  if (actLog.length > 300) actLog.length = 300;
  saveAll();
  renderLogBadge();
  if (document.getElementById('log-panel').classList.contains('open')) renderLog();
}

function renderLogBadge() {
  const b = document.getElementById('log-badge');
  b.textContent = actLog.length > 99 ? '99+' : actLog.length;
}

function renderLog() {
  const el = document.getElementById('log-list');
  if (!actLog.length) { el.innerHTML = '<div class="log-empty">No activity yet.</div>'; return; }
  el.innerHTML = actLog.map(e => {
    const cls = { add:'add', sub:'sub', xin:'xin', xout:'xout', del:'del', edit:'edit' }[e.type] || 'edit';
    return `<div class="log-item">
      <div class="log-dot ${cls}"></div>
      <div class="log-content">
        <div class="log-action">${esc(e.message)}</div>
        <div class="log-time">${new Date(e.ts).toLocaleString()}</div>
      </div>
    </div>`;
  }).join('');
}

/* ══════════════════════════════════════════════════
   §6  SUMMARY BAR
══════════════════════════════════════════════════ */
function renderSummary() {
  const sum = arr => arr.reduce((s, i) => s + (i.qty || 0), 0);
  document.getElementById('s-total').textContent   = sum(inventory);
  document.getElementById('s-iphone').textContent  = sum(inventory.filter(i => i.brand === 'Apple'));
  document.getElementById('s-samsung').textContent = sum(inventory.filter(i => i.brand === 'Samsung'));
  document.getElementById('s-motorola').textContent= sum(inventory.filter(i => i.brand === 'Motorola'));
  document.getElementById('s-ipad').textContent    = sum(inventory.filter(i => i.brand === 'Apple iPad'));

  // this-week transfers
  const weekAgo = Date.now() - 7 * 86400000;
  const xiSum = xferIn.filter(r => r.createdTs > weekAgo).reduce((s, r) => s + (r.qty || 0), 0);
  const xoSum = xferOut.filter(r => r.createdTs > weekAgo).reduce((s, r) => s + (r.qty || 0), 0);
  document.getElementById('s-xfer-in').textContent  = xiSum;
  document.getElementById('s-xfer-out').textContent = xoSum;
}

// Summary pill brand-filter clicks
document.querySelectorAll('.sum-pill[data-brand]').forEach(pill => {
  pill.addEventListener('click', () => {
    const b = pill.dataset.brand;
    invFBrand = invFBrand === b ? '' : b;
    document.getElementById('inv-f-brand').value = invFBrand;
    document.querySelectorAll('.sum-pill[data-brand]').forEach(p => p.classList.remove('active'));
    if (invFBrand) pill.classList.add('active');
    switchTab('inventory');
    renderInventory();
  });
});

/* ══════════════════════════════════════════════════
   §7  TABS
══════════════════════════════════════════════════ */
function switchTab(name) {
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === name));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.toggle('active', p.id === 'tab-' + name));
}

document.querySelectorAll('.tab').forEach(t =>
  t.addEventListener('click', () => switchTab(t.dataset.tab))
);

/* ══════════════════════════════════════════════════
   §8  RENDER HELPERS
══════════════════════════════════════════════════ */
function esc(s) {
  return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function fmtDate(ts) {
  if (!ts) return '—';
  const d = new Date(ts);
  return `${d.getMonth()+1}/${d.getDate()}/${String(d.getFullYear()).slice(2)}`;
}
function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function todayFileStr() {
  return todayISO();
}

function brandBadge(brand) {
  const m = { 'Apple':['iPhone','bb-iphone'], 'Samsung':['Samsung','bb-samsung'], 'Motorola':['Motorola','bb-motorola'], 'Apple iPad':['iPad','bb-ipad'] };
  const [lbl, cls] = m[brand] || [brand, 'bb-iphone'];
  return `<span class="brand-badge ${cls}">${lbl}</span>`;
}
function typeBadge(t) {
  return t === 'LCD' ? `<span class="type-badge tb-lcd">LCD</span>` : `<span class="type-badge tb-digi">Digitizer</span>`;
}
function netBadge(n) {
  const cls = { '4G':'nb-4g','5G':'nb-5g','Universal':'nb-uni','Unknown':'nb-unk' }[n] || 'nb-unk';
  return `<span class="net-badge ${cls}">${n}</span>`;
}

/* ══════════════════════════════════════════════════
   §9  INVENTORY TABLE
══════════════════════════════════════════════════ */
function getFilteredInventory() {
  const q = invSearch.toLowerCase().trim();
  return inventory.filter(item => {
    if (q) {
      const hay = [item.brand, item.model, item.type, item.network, item.notes].join(' ').toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (invFBrand) {
      if      (invFBrand === 'Samsung-S')    { if (!(item.brand === 'Samsung' && item.samsungSeries === 'S'))    return false; }
      else if (invFBrand === 'Samsung-Note') { if (!(item.brand === 'Samsung' && item.samsungSeries === 'Note')) return false; }
      else if (invFBrand === 'Samsung-A')    { if (!(item.brand === 'Samsung' && item.samsungSeries === 'A'))    return false; }
      else { if (item.brand !== invFBrand) return false; }
    }
    if (invFType && item.type    !== invFType)  return false;
    if (invFNet  && item.network !== invFNet)   return false;
    return true;
  });
}

function renderInventory() {
  const items  = getFilteredInventory();
  const tbody  = document.getElementById('inv-tbody');
  const empty  = document.getElementById('inv-empty');
  const foot   = document.getElementById('inv-foot');

  if (!items.length) {
    tbody.innerHTML = '';
    empty.style.display = '';
    foot.textContent = '';
    return;
  }
  empty.style.display = 'none';
  foot.textContent = `${items.length} item${items.length !== 1 ? 's' : ''} · ${inventory.length} total`;

  tbody.innerHTML = items.map(item => {
    const noteCls  = item.notes ? 'editable' : 'editable empty';
    const noteText = item.notes ? esc(item.notes) : '—';
    return `<tr data-id="${item.id}">
      <td>${brandBadge(item.brand)}</td>
      <td style="font-weight:500">${esc(item.model)}</td>
      <td>${netBadge(item.network)}</td>
      <td>${typeBadge(item.type)}</td>
      <td>
        <div class="qty-ctrl">
          <button class="qty-btn minus" data-id="${item.id}">−</button>
          <input class="qty-inp" type="number" data-id="${item.id}" value="${item.qty}" min="0" />
          <button class="qty-btn plus" data-id="${item.id}">+</button>
        </div>
      </td>
      <td><span class="${noteCls}" data-id="${item.id}" title="Click to edit">${noteText}</span></td>
      <td style="font-family:var(--mono);font-size:11px;color:var(--muted)">${fmtDate(item.updatedAt)}</td>
      <td>
        <div class="row-acts">
          <button class="act-btn edit-item" data-id="${item.id}" title="Edit">✎</button>
          <button class="act-btn del del-item" data-id="${item.id}" title="Delete">🗑</button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

// ── Inventory table delegation ──
document.getElementById('inv-tbody').addEventListener('click', e => {
  const t = e.target;

  if (t.classList.contains('plus') || t.classList.contains('minus')) {
    const item = findById(t.dataset.id);
    if (!item) return;
    const old = item.qty;
    if (t.classList.contains('plus'))  item.qty = (item.qty || 0) + 1;
    else                               item.qty = Math.max(0, (item.qty || 0) - 1);
    item.updatedAt = Date.now();
    logAct(item.qty > old ? 'add' : 'sub', `${item.qty > old ? '+1' : '-1'} ${item.model} (${item.type}) → qty ${item.qty}`);
    saveAll(); renderInventory(); renderSummary();
    return;
  }
  if (t.classList.contains('edit-item') || t.closest('.edit-item')) {
    openItemModal(t.dataset.id || t.closest('.edit-item').dataset.id);
    return;
  }
  if (t.classList.contains('del-item') || t.closest('.del-item')) {
    const id = t.dataset.id || t.closest('.del-item').dataset.id;
    const item = findById(id);
    if (!item) return;
    openConfirm('Delete Item', `Delete "${item.model}" (${item.type}) from G2 inventory? Cannot be undone.`, () => {
      inventory = inventory.filter(i => i.id !== id);
      logAct('del', `Deleted: ${item.model} (${item.type})`);
      saveAll(); renderInventory(); renderSummary();
      showToast('🗑 Item deleted');
    });
    return;
  }
  if (t.classList.contains('editable')) {
    startInlineNoteEdit(t);
  }
});

document.getElementById('inv-tbody').addEventListener('change', e => {
  if (!e.target.classList.contains('qty-inp')) return;
  const item = findById(e.target.dataset.id);
  if (!item) return;
  const v = parseInt(e.target.value, 10);
  item.qty = isNaN(v) || v < 0 ? 0 : v;
  item.updatedAt = Date.now();
  logAct('edit', `Set ${item.model} (${item.type}) qty → ${item.qty}`);
  saveAll(); renderInventory(); renderSummary();
});

function startInlineNoteEdit(el) {
  const id   = el.dataset.id;
  const item = findById(id);
  if (!item) return;
  const inp = document.createElement('input');
  inp.className   = 'inline-input';
  inp.type        = 'text';
  inp.value       = item.notes || '';
  inp.placeholder = 'Add notes…';
  el.replaceWith(inp);
  inp.focus(); inp.select();
  const commit = () => { item.notes = inp.value.trim(); item.updatedAt = Date.now(); logAct('edit', `Notes updated: ${item.model}`); saveAll(); renderInventory(); };
  inp.addEventListener('blur', commit);
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') inp.blur(); if (e.key === 'Escape') renderInventory(); });
}

// ── Inventory filters ──
const invSearchEl = document.getElementById('inv-search');
invSearchEl.addEventListener('input', () => {
  invSearch = invSearchEl.value;
  document.getElementById('inv-search-clear').classList.toggle('vis', !!invSearch);
  renderInventory();
});
document.getElementById('inv-search-clear').addEventListener('click', () => {
  invSearchEl.value = ''; invSearch = '';
  document.getElementById('inv-search-clear').classList.remove('vis');
  invSearchEl.focus(); renderInventory();
});
document.getElementById('inv-f-brand').addEventListener('change', e => { invFBrand = e.target.value; renderInventory(); });
document.getElementById('inv-f-type').addEventListener('change',  e => { invFType  = e.target.value; renderInventory(); });
document.getElementById('inv-f-net').addEventListener('change',   e => { invFNet   = e.target.value; renderInventory(); });
document.getElementById('inv-clear-filters').addEventListener('click', () => {
  invSearch = invFBrand = invFType = invFNet = '';
  invSearchEl.value = '';
  document.getElementById('inv-search-clear').classList.remove('vis');
  document.getElementById('inv-f-brand').value = '';
  document.getElementById('inv-f-type').value  = '';
  document.getElementById('inv-f-net').value   = '';
  document.querySelectorAll('.sum-pill[data-brand]').forEach(p => p.classList.remove('active'));
  renderInventory();
});

/* ══════════════════════════════════════════════════
   §10  ITEM MODAL (Add / Edit)
══════════════════════════════════════════════════ */
const itemModal = document.getElementById('item-modal');
const imBrand   = document.getElementById('im-brand');
const imSSWrap  = document.getElementById('im-ss-wrap');
const imSS      = document.getElementById('im-ss');

imBrand.addEventListener('change', () => {
  imSSWrap.style.display = imBrand.value === 'Samsung' ? '' : 'none';
});

function openItemModal(id) {
  editingId = id || null;
  document.getElementById('item-modal-title').textContent = id ? 'Edit Item' : 'Add New Model';
  if (id) {
    const item = findById(id);
    if (!item) return;
    imBrand.value = item.brand;
    imSSWrap.style.display = item.brand === 'Samsung' ? '' : 'none';
    imSS.value = item.samsungSeries || 'S';
    document.getElementById('im-model').value = item.model;
    document.getElementById('im-type').value  = item.type;
    document.getElementById('im-net').value   = item.network;
    document.getElementById('im-qty').value   = item.qty;
    document.getElementById('im-notes').value = item.notes || '';
  } else {
    imBrand.value = 'Apple'; imSSWrap.style.display = 'none'; imSS.value = 'S';
    document.getElementById('im-model').value = '';
    document.getElementById('im-type').value  = 'LCD';
    document.getElementById('im-net').value   = 'Universal';
    document.getElementById('im-qty').value   = 0;
    document.getElementById('im-notes').value = '';
  }
  itemModal.style.display = 'flex';
  setTimeout(() => document.getElementById('im-model').focus(), 50);
}

function closeItemModal() { itemModal.style.display = 'none'; editingId = null; }
document.getElementById('item-modal-close').addEventListener('click', closeItemModal);
document.getElementById('item-modal-cancel').addEventListener('click', closeItemModal);
itemModal.addEventListener('click', e => { if (e.target === itemModal) closeItemModal(); });

document.getElementById('btn-add-item').addEventListener('click', () => openItemModal(null));

document.getElementById('item-modal-save').addEventListener('click', () => {
  const brand = imBrand.value;
  const model = document.getElementById('im-model').value.trim();
  const type  = document.getElementById('im-type').value;
  const net   = document.getElementById('im-net').value;
  const qty   = parseInt(document.getElementById('im-qty').value, 10) || 0;
  const notes = document.getElementById('im-notes').value.trim();
  const ss    = brand === 'Samsung' ? imSS.value : '';
  if (!model) { showToast('⚠ Model name required'); return; }

  if (editingId) {
    const item = findById(editingId);
    if (item) Object.assign(item, { brand, samsungSeries: ss, model, type, network: net, qty, notes, updatedAt: Date.now() });
    logAct('edit', `Edited: ${model} (${type})`);
    showToast('✓ Item updated');
  } else {
    inventory.push({ id: uid(), brand, samsungSeries: ss, model, type, network: net, qty, notes, updatedAt: Date.now() });
    logAct('add', `Added new: ${model} (${type})`);
    showToast('✓ Item added');
  }
  saveAll(); closeItemModal(); renderInventory(); renderSummary();
});

/* ══════════════════════════════════════════════════
   §11  TRANSFER IN
══════════════════════════════════════════════════ */
function todayInputDefault(elId) {
  const el = document.getElementById(elId);
  if (el && !el.value) el.value = todayISO();
}

function submitTransferIn(from, brand, model, type, net, qty, date, note, source) {
  const qty_n = parseInt(qty, 10);
  if (!model || qty_n < 1) { showToast('⚠ Model and Qty required'); return false; }

  // Find or create inventory item
  let item = findInvMatch(brand, model, type, net);
  if (!item) {
    // auto-create
    const ss = brand === 'Samsung' ? guessSamsungSeries(model) : '';
    item = { id: uid(), brand, samsungSeries: ss, model, type, network: net, notes: '', qty: 0, updatedAt: null };
    inventory.push(item);
  }
  item.qty = (item.qty || 0) + qty_n;
  item.updatedAt = Date.now();

  const rec = {
    id: uid(), date: date || todayISO(), from, brand, model, type, network: net,
    qty: qty_n, note: note || '', createdTs: Date.now(),
  };
  xferIn.push(rec);

  logAct('xin', `Transfer In: +${qty_n} ${model} (${type}) from ${from} [${source}]`);
  saveAll(); renderInventory(); renderSummary(); renderXferIn();
  showToast(`✓ Transfer In: +${qty_n} ${model}`);
  return true;
}

function submitTransferOut(to, brand, model, type, net, qty, date, note, source, forceNeg) {
  const qty_n = parseInt(qty, 10);
  if (!model || qty_n < 1) { showToast('⚠ Model and Qty required'); return false; }

  let item = findInvMatch(brand, model, type, net);
  if (!item) {
    showToast(`⚠ No matching item found: "${model}" (${type})`); return false;
  }

  if (!forceNeg && item.qty < qty_n) {
    openConfirm(
      'Insufficient Stock',
      `G2 has ${item.qty} units of "${item.model}" but you're transferring out ${qty_n}. This will result in negative inventory (${item.qty - qty_n}). Proceed?`,
      () => submitTransferOut(to, brand, model, type, net, qty, date, note, source, true)
    );
    return false;
  }

  item.qty = (item.qty || 0) - qty_n;
  item.updatedAt = Date.now();

  const rec = {
    id: uid(), date: date || todayISO(), to, brand, model, type, network: net,
    qty: qty_n, note: note || '', createdTs: Date.now(),
  };
  xferOut.push(rec);

  logAct('xout', `Transfer Out: -${qty_n} ${model} (${type}) to ${to} [${source}]`);
  saveAll(); renderInventory(); renderSummary(); renderXferOut();
  showToast(`✓ Transfer Out: -${qty_n} ${model}`);
  return true;
}

// ── Main Transfer In form ──
document.getElementById('xi-submit').addEventListener('click', () => {
  const ok = submitTransferIn(
    document.getElementById('xi-from').value,
    document.getElementById('xi-brand').value,
    document.getElementById('xi-model').value.trim(),
    document.getElementById('xi-type').value,
    document.getElementById('xi-net').value,
    document.getElementById('xi-qty').value,
    document.getElementById('xi-date').value,
    document.getElementById('xi-note').value.trim(),
    'main form'
  );
  if (ok) {
    document.getElementById('xi-model').value = '';
    document.getElementById('xi-qty').value   = '1';
    document.getElementById('xi-note').value  = '';
  }
});
document.getElementById('xi-reset').addEventListener('click', () => {
  ['xi-model','xi-note'].forEach(id => { document.getElementById(id).value = ''; });
  document.getElementById('xi-qty').value = '1';
  document.getElementById('xi-date').value = todayISO();
});

// ── Main Transfer Out form ──
document.getElementById('xo-submit').addEventListener('click', () => {
  submitTransferOut(
    document.getElementById('xo-to').value,
    document.getElementById('xo-brand').value,
    document.getElementById('xo-model').value.trim(),
    document.getElementById('xo-type').value,
    document.getElementById('xo-net').value,
    document.getElementById('xo-qty').value,
    document.getElementById('xo-date').value,
    document.getElementById('xo-note').value.trim(),
    'main form', false
  );
  document.getElementById('xo-model').value = '';
  document.getElementById('xo-qty').value   = '1';
  document.getElementById('xo-note').value  = '';
});
document.getElementById('xo-reset').addEventListener('click', () => {
  ['xo-model','xo-note'].forEach(id => { document.getElementById(id).value = ''; });
  document.getElementById('xo-qty').value = '1';
  document.getElementById('xo-date').value = todayISO();
});

/* ── Transfer In render ── */
function getFilteredXferIn() {
  const q = xiSearch.toLowerCase().trim();
  return xferIn.slice().reverse().filter(r => {
    if (q) {
      const hay = [r.from, r.brand, r.model, r.type, r.network, r.note].join(' ').toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (xiFStore && r.from !== xiFStore) return false;
    if (xiFFrom  && r.date < xiFFrom)   return false;
    if (xiFTo    && r.date > xiFTo)     return false;
    return true;
  });
}

function renderXferIn() {
  const rows  = getFilteredXferIn();
  const tbody = document.getElementById('xi-tbody');
  const empty = document.getElementById('xi-empty');
  const foot  = document.getElementById('xi-foot');

  if (!rows.length) { tbody.innerHTML = ''; empty.style.display = ''; foot.textContent = ''; return; }
  empty.style.display = 'none';
  foot.textContent = `${rows.length} record${rows.length !== 1 ? 's' : ''}`;

  tbody.innerHTML = rows.map((r, idx) => `
    <tr class="xin-row" data-id="${r.id}">
      <td>${xferIn.length - xferIn.indexOf(r)}</td>
      <td style="white-space:nowrap">${esc(r.date)}</td>
      <td><span style="font-weight:600;color:var(--xin)">${esc(r.from)}</span></td>
      <td>${brandBadge(r.brand)}</td>
      <td style="font-weight:500">${esc(r.model)}</td>
      <td>${netBadge(r.network)}</td>
      <td>${typeBadge(r.type)}</td>
      <td style="font-family:var(--mono);font-weight:600;color:var(--xin)">+${r.qty}</td>
      <td style="color:var(--dim);font-size:12px">${esc(r.note || '—')}</td>
      <td style="font-family:var(--mono);font-size:11px;color:var(--muted)">${new Date(r.createdTs).toLocaleString()}</td>
      <td><button class="act-btn del del-xi" data-id="${r.id}" title="Delete record">🗑</button></td>
    </tr>`).join('');
}

document.getElementById('xi-tbody').addEventListener('click', e => {
  const btn = e.target.closest('.del-xi');
  if (!btn) return;
  const id = btn.dataset.id;
  openConfirm('Delete Record', 'Delete this Transfer In record? This will NOT adjust G2 inventory.', () => {
    xferIn = xferIn.filter(r => r.id !== id);
    logAct('del', 'Deleted Transfer In record');
    saveAll(); renderXferIn(); renderSummary();
    showToast('🗑 Record deleted');
  });
});

// xfer in filters
const xiSearchEl = document.getElementById('xi-search');
xiSearchEl.addEventListener('input', () => { xiSearch = xiSearchEl.value; renderXferIn(); });
document.getElementById('xi-f-store').addEventListener('change',    e => { xiFStore = e.target.value; renderXferIn(); });
document.getElementById('xi-f-date-from').addEventListener('change',e => { xiFFrom  = e.target.value; renderXferIn(); });
document.getElementById('xi-f-date-to').addEventListener('change',  e => { xiFTo    = e.target.value; renderXferIn(); });
document.getElementById('xi-clear-f').addEventListener('click', () => {
  xiSearch = xiFStore = xiFFrom = xiFTo = '';
  xiSearchEl.value = '';
  document.getElementById('xi-f-store').value = '';
  document.getElementById('xi-f-date-from').value = '';
  document.getElementById('xi-f-date-to').value   = '';
  renderXferIn();
});

/* ── Transfer Out render ── */
function getFilteredXferOut() {
  const q = xoSearch.toLowerCase().trim();
  return xferOut.slice().reverse().filter(r => {
    if (q) {
      const hay = [r.to, r.brand, r.model, r.type, r.network, r.note].join(' ').toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (xoFStore && r.to   !== xoFStore) return false;
    if (xoFFrom  && r.date  < xoFFrom)  return false;
    if (xoFTo    && r.date  > xoFTo)    return false;
    return true;
  });
}

function renderXferOut() {
  const rows  = getFilteredXferOut();
  const tbody = document.getElementById('xo-tbody');
  const empty = document.getElementById('xo-empty');
  const foot  = document.getElementById('xo-foot');

  if (!rows.length) { tbody.innerHTML = ''; empty.style.display = ''; foot.textContent = ''; return; }
  empty.style.display = 'none';
  foot.textContent = `${rows.length} record${rows.length !== 1 ? 's' : ''}`;

  tbody.innerHTML = rows.map(r => `
    <tr class="xout-row" data-id="${r.id}">
      <td>${xferOut.length - xferOut.indexOf(r)}</td>
      <td style="white-space:nowrap">${esc(r.date)}</td>
      <td><span style="font-weight:600;color:var(--xout)">${esc(r.to)}</span></td>
      <td>${brandBadge(r.brand)}</td>
      <td style="font-weight:500">${esc(r.model)}</td>
      <td>${netBadge(r.network)}</td>
      <td>${typeBadge(r.type)}</td>
      <td style="font-family:var(--mono);font-weight:600;color:var(--xout)">-${r.qty}</td>
      <td style="color:var(--dim);font-size:12px">${esc(r.note || '—')}</td>
      <td style="font-family:var(--mono);font-size:11px;color:var(--muted)">${new Date(r.createdTs).toLocaleString()}</td>
      <td><button class="act-btn del del-xo" data-id="${r.id}" title="Delete record">🗑</button></td>
    </tr>`).join('');
}

document.getElementById('xo-tbody').addEventListener('click', e => {
  const btn = e.target.closest('.del-xo');
  if (!btn) return;
  const id = btn.dataset.id;
  openConfirm('Delete Record', 'Delete this Transfer Out record? This will NOT adjust G2 inventory.', () => {
    xferOut = xferOut.filter(r => r.id !== id);
    logAct('del', 'Deleted Transfer Out record');
    saveAll(); renderXferOut(); renderSummary();
    showToast('🗑 Record deleted');
  });
});

// xfer out filters
const xoSearchEl = document.getElementById('xo-search');
xoSearchEl.addEventListener('input', () => { xoSearch = xoSearchEl.value; renderXferOut(); });
document.getElementById('xo-f-store').addEventListener('change',    e => { xoFStore = e.target.value; renderXferOut(); });
document.getElementById('xo-f-date-from').addEventListener('change',e => { xoFFrom  = e.target.value; renderXferOut(); });
document.getElementById('xo-f-date-to').addEventListener('change',  e => { xoFTo    = e.target.value; renderXferOut(); });
document.getElementById('xo-clear-f').addEventListener('click', () => {
  xoSearch = xoFStore = xoFFrom = xoFTo = '';
  xoSearchEl.value = '';
  document.getElementById('xo-f-store').value = '';
  document.getElementById('xo-f-date-from').value = '';
  document.getElementById('xo-f-date-to').value   = '';
  renderXferOut();
});

/* ══════════════════════════════════════════════════
   §12  SIDE PANELS (Assistant + Log)
══════════════════════════════════════════════════ */
const backdrop = document.getElementById('panel-backdrop');

function openPanel(panelId) {
  document.querySelectorAll('.side-panel').forEach(p => p.classList.remove('open'));
  document.getElementById(panelId).classList.add('open');
  backdrop.classList.add('vis');
}
function closePanels() {
  document.querySelectorAll('.side-panel').forEach(p => p.classList.remove('open'));
  backdrop.classList.remove('vis');
}

document.getElementById('btn-open-asst').addEventListener('click', () => openPanel('asst-panel'));
document.getElementById('btn-open-log').addEventListener('click',  () => { openPanel('log-panel'); renderLog(); });
document.getElementById('asst-close').addEventListener('click', closePanels);
document.getElementById('log-close').addEventListener('click', closePanels);
backdrop.addEventListener('click', closePanels);

// ── Assistant panel tabs ──
document.querySelectorAll('.sp-tab').forEach(t => {
  t.addEventListener('click', () => {
    const stab = t.dataset.stab;
    document.querySelectorAll('.sp-tab').forEach(x => x.classList.remove('active'));
    t.classList.add('active');
    document.querySelectorAll('.sp-tab-body').forEach(b => b.classList.remove('active'));
    const body = document.getElementById('stab-' + stab);
    if (body) body.classList.add('active');
  });
});

// ── Assistant: Transfer In form ──
document.getElementById('sp-xi-submit').addEventListener('click', () => {
  const ok = submitTransferIn(
    document.getElementById('sp-xi-from').value,
    document.getElementById('sp-xi-brand').value,
    document.getElementById('sp-xi-model').value.trim(),
    document.getElementById('sp-xi-type').value,
    document.getElementById('sp-xi-net').value,
    document.getElementById('sp-xi-qty').value,
    document.getElementById('sp-xi-date').value,
    document.getElementById('sp-xi-note').value.trim(),
    'assistant'
  );
  if (ok) {
    document.getElementById('sp-xi-model').value = '';
    document.getElementById('sp-xi-qty').value   = '1';
    document.getElementById('sp-xi-note').value  = '';
    hideSuggest('sp-xi-suggest');
  }
});

// ── Assistant: Transfer Out form ──
document.getElementById('sp-xo-submit').addEventListener('click', () => {
  submitTransferOut(
    document.getElementById('sp-xo-to').value,
    document.getElementById('sp-xo-brand').value,
    document.getElementById('sp-xo-model').value.trim(),
    document.getElementById('sp-xo-type').value,
    document.getElementById('sp-xo-net').value,
    document.getElementById('sp-xo-qty').value,
    document.getElementById('sp-xo-date').value,
    document.getElementById('sp-xo-note').value.trim(),
    'assistant', false
  );
  document.getElementById('sp-xo-model').value = '';
  document.getElementById('sp-xo-qty').value   = '1';
  document.getElementById('sp-xo-note').value  = '';
  hideSuggest('sp-xo-suggest');
});

// ── Assistant: Add Inventory form ──
document.getElementById('sp-add-submit').addEventListener('click', () => {
  const brand  = document.getElementById('sp-add-brand').value;
  const model  = document.getElementById('sp-add-model').value.trim();
  const type   = document.getElementById('sp-add-type').value;
  const net    = document.getElementById('sp-add-net').value;
  const qty    = parseInt(document.getElementById('sp-add-qty').value, 10) || 1;
  const note   = document.getElementById('sp-add-note').value.trim();

  if (!model) { showToast('⚠ Model required'); return; }

  let item = findInvMatch(brand, model, type, net);
  if (!item) {
    const ss = brand === 'Samsung' ? guessSamsungSeries(model) : '';
    item = { id: uid(), brand, samsungSeries: ss, model, type, network: net, notes: note || '', qty: 0, updatedAt: null };
    inventory.push(item);
  }
  item.qty = (item.qty || 0) + qty;
  item.updatedAt = Date.now();
  if (note && !item.notes) item.notes = note;
  logAct('add', `Added +${qty} ${model} (${type}) to G2 inventory`);
  saveAll(); renderInventory(); renderSummary();
  showToast(`✓ Added ${qty}× ${model}`);
  document.getElementById('sp-add-model').value = '';
  document.getElementById('sp-add-qty').value   = '1';
  document.getElementById('sp-add-note').value  = '';
  hideSuggest('sp-add-suggest');
});

// ── Assistant: Remove Inventory form ──
document.getElementById('sp-rem-submit').addEventListener('click', () => {
  const brand  = document.getElementById('sp-rem-brand').value;
  const model  = document.getElementById('sp-rem-model').value.trim();
  const type   = document.getElementById('sp-rem-type').value;
  const net    = document.getElementById('sp-rem-net').value;
  const qty    = parseInt(document.getElementById('sp-rem-qty').value, 10) || 1;
  const note   = document.getElementById('sp-rem-note').value.trim();

  if (!model) { showToast('⚠ Model required'); return; }

  const item = findInvMatch(brand, model, type, net);
  if (!item) { showToast(`⚠ No match: "${model}" (${type})`); return; }

  if (item.qty < qty) {
    openConfirm('Insufficient Stock', `G2 has ${item.qty} unit(s) of "${item.model}" but you're removing ${qty}. This will result in negative inventory. Proceed?`, () => {
      item.qty = (item.qty || 0) - qty;
      item.updatedAt = Date.now();
      logAct('sub', `Removed -${qty} ${item.model} (${type}) from G2`);
      saveAll(); renderInventory(); renderSummary();
      showToast(`✓ Removed ${qty}× ${item.model}`);
    });
    return;
  }

  item.qty = (item.qty || 0) - qty;
  item.updatedAt = Date.now();
  logAct('sub', `Removed -${qty} ${item.model} (${type}) from G2`);
  saveAll(); renderInventory(); renderSummary();
  showToast(`✓ Removed ${qty}× ${item.model}`);
  document.getElementById('sp-rem-model').value = '';
  document.getElementById('sp-rem-qty').value   = '1';
  document.getElementById('sp-rem-note').value  = '';
  hideSuggest('sp-rem-suggest');
});

// ── Assistant: Search ──
document.getElementById('sp-search-submit').addEventListener('click', () => {
  const q = document.getElementById('sp-search-q').value.trim();
  if (!q) return;
  const results = inventory.filter(i => {
    const hay = [i.brand, i.model, i.type, i.network, i.notes].join(' ').toLowerCase();
    return hay.includes(q.toLowerCase());
  });
  const el = document.getElementById('sp-search-results');
  if (!results.length) {
    el.innerHTML = '<div style="color:var(--muted);font-size:13px">No results found.</div>';
    return;
  }
  el.innerHTML = results.map(i => `
    <div class="sp-result-item">
      <div class="sp-result-model">${esc(i.model)}</div>
      <div class="sp-result-meta">${esc(i.brand)} · ${i.type} · ${i.network} · <strong>Qty: ${i.qty}</strong></div>
    </div>`).join('');

  // Also filter main inventory tab
  invSearch = q;
  document.getElementById('inv-search').value = q;
  document.getElementById('inv-search-clear').classList.add('vis');
  renderInventory();
});
document.getElementById('sp-search-q').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('sp-search-submit').click();
});

/* ══════════════════════════════════════════════════
   §13  MODEL AUTOCOMPLETE SUGGEST
══════════════════════════════════════════════════ */
function setupSuggest(inputId, suggestId, brandSelId) {
  const input   = document.getElementById(inputId);
  const suggest = document.getElementById(suggestId);
  let activeIdx = -1;

  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    if (!q) { hideSuggest(suggestId); return; }
    const brand = brandSelId ? document.getElementById(brandSelId).value : '';
    const pool  = inventory.filter(i => (!brand || i.brand === brand) && i.model.toLowerCase().includes(q));
    const unique = [...new Map(pool.map(i => [i.model + '|' + i.type, i])).values()].slice(0, 12);
    if (!unique.length) { hideSuggest(suggestId); return; }
    suggest.innerHTML = unique.map((i, idx) =>
      `<div class="ms-item" data-idx="${idx}" data-model="${esc(i.model)}">${esc(i.model)} <span style="color:var(--muted);font-size:11px">${i.type}</span></div>`
    ).join('');
    suggest.classList.add('open');
    activeIdx = -1;
  });

  suggest.addEventListener('click', e => {
    const item = e.target.closest('.ms-item');
    if (!item) return;
    input.value = item.dataset.model;
    hideSuggest(suggestId);
    input.focus();
  });

  input.addEventListener('keydown', e => {
    const items = suggest.querySelectorAll('.ms-item');
    if (!suggest.classList.contains('open') || !items.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); activeIdx = (activeIdx + 1) % items.length; items.forEach((el, i) => el.classList.toggle('active', i === activeIdx)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); activeIdx = (activeIdx - 1 + items.length) % items.length; items.forEach((el, i) => el.classList.toggle('active', i === activeIdx)); }
    if (e.key === 'Enter' && activeIdx >= 0) { e.preventDefault(); items[activeIdx].click(); }
    if (e.key === 'Escape') hideSuggest(suggestId);
  });

  input.addEventListener('blur', () => { setTimeout(() => hideSuggest(suggestId), 180); });
}

function hideSuggest(id) {
  const el = document.getElementById(id);
  if (el) { el.classList.remove('open'); el.innerHTML = ''; }
}

/* ══════════════════════════════════════════════════
   §14  CONFIRM MODAL
══════════════════════════════════════════════════ */
const confirmModal = document.getElementById('confirm-modal');

function openConfirm(title, msg, onOk) {
  document.getElementById('confirm-title').textContent = title;
  document.getElementById('confirm-msg').textContent   = msg;
  confirmCallback = onOk;
  confirmModal.style.display = 'flex';
}
function closeConfirm() { confirmModal.style.display = 'none'; confirmCallback = null; }

document.getElementById('confirm-close').addEventListener('click',  closeConfirm);
document.getElementById('confirm-cancel').addEventListener('click', closeConfirm);
confirmModal.addEventListener('click', e => { if (e.target === confirmModal) closeConfirm(); });
document.getElementById('confirm-ok').addEventListener('click', () => {
  if (confirmCallback) confirmCallback();
  closeConfirm();
});

/* ══════════════════════════════════════════════════
   §15  CSV / JSON EXPORT & IMPORT
══════════════════════════════════════════════════ */
function csvEncode(v) {
  const s = String(v || '');
  return (s.includes(',') || s.includes('"') || s.includes('\n')) ? `"${s.replace(/"/g,'""')}"` : s;
}

function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type });
  const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: filename });
  a.click(); URL.revokeObjectURL(a.href);
}

function exportInvCSV() {
  const hdrs = ['Brand','Samsung Series','Model','Type','Network','Qty','Notes','Updated'];
  const rows = inventory.map(i => [
    csvEncode(i.brand), csvEncode(i.samsungSeries || ''), csvEncode(i.model),
    csvEncode(i.type), csvEncode(i.network), i.qty,
    csvEncode(i.notes || ''), i.updatedAt ? new Date(i.updatedAt).toLocaleDateString() : '',
  ]);
  downloadFile([hdrs.join(','), ...rows.map(r => r.join(','))].join('\n'), `g2_inventory_${todayFileStr()}.csv`, 'text/csv');
  showToast('✓ G2 Inventory CSV exported');
}

function exportXiCSV() {
  const hdrs = ['Date','From','Brand','Model','Network','Type','Qty','Note','Logged'];
  const rows = xferIn.map(r => [
    csvEncode(r.date), csvEncode(r.from), csvEncode(r.brand), csvEncode(r.model),
    csvEncode(r.network), csvEncode(r.type), r.qty, csvEncode(r.note || ''),
    new Date(r.createdTs).toLocaleString(),
  ]);
  downloadFile([hdrs.join(','), ...rows.map(r => r.join(','))].join('\n'), `g2_transfer_in_${todayFileStr()}.csv`, 'text/csv');
  showToast('✓ Transfer In CSV exported');
}

function exportXoCSV() {
  const hdrs = ['Date','To','Brand','Model','Network','Type','Qty','Note','Logged'];
  const rows = xferOut.map(r => [
    csvEncode(r.date), csvEncode(r.to), csvEncode(r.brand), csvEncode(r.model),
    csvEncode(r.network), csvEncode(r.type), r.qty, csvEncode(r.note || ''),
    new Date(r.createdTs).toLocaleString(),
  ]);
  downloadFile([hdrs.join(','), ...rows.map(r => r.join(','))].join('\n'), `g2_transfer_out_${todayFileStr()}.csv`, 'text/csv');
  showToast('✓ Transfer Out CSV exported');
}

function exportJSON() {
  const data = { version: 3, exported: new Date().toISOString(), inventory, xferIn, xferOut, actLog };
  downloadFile(JSON.stringify(data, null, 2), `ron_g2_backup_${todayFileStr()}.json`, 'application/json');
  showToast('✓ Full backup exported');
}

// CSV export buttons (main tab + settings)
document.getElementById('btn-export-inv-csv').addEventListener('click', exportInvCSV);
document.getElementById('btn-export-xi-csv').addEventListener('click', exportXiCSV);
document.getElementById('btn-export-xo-csv').addEventListener('click', exportXoCSV);
document.getElementById('btn-export-inv-csv2').addEventListener('click', exportInvCSV);
document.getElementById('btn-export-xi-csv2').addEventListener('click', exportXiCSV);
document.getElementById('btn-export-xo-csv2').addEventListener('click', exportXoCSV);
document.getElementById('btn-export-json').addEventListener('click', exportJSON);

// JSON import
document.getElementById('btn-import-json').addEventListener('click', () => {
  document.getElementById('json-import-input').click();
});
document.getElementById('json-import-input').addEventListener('change', e => {
  const file = e.target.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const data = JSON.parse(ev.target.result);
      openConfirm('Import Backup', `This will REPLACE all current data with the backup from ${data.exported || 'unknown date'}. Continue?`, () => {
        if (data.inventory) inventory = data.inventory;
        if (data.xferIn)    xferIn    = data.xferIn;
        if (data.xferOut)   xferOut   = data.xferOut;
        if (data.actLog)    actLog    = data.actLog;
        saveAll(); renderAll();
        showToast('✓ Backup imported');
        logAct('edit', 'Imported backup JSON');
      });
    } catch (err) { showToast('⚠ Invalid JSON file'); }
    e.target.value = '';
  };
  reader.readAsText(file);
});

/* ══════════════════════════════════════════════════
   §16  SETTINGS ACTIONS
══════════════════════════════════════════════════ */
document.getElementById('btn-reset-inv').addEventListener('click', () => {
  openConfirm('Reset Inventory', 'Reset G2 inventory to default models (qty 0)? Transfer logs and activity log will be preserved.', () => {
    inventory = buildDefault(); saveAll(); renderInventory(); renderSummary();
    showToast('✓ Inventory reset'); logAct('edit', 'Inventory reset to default');
  });
});
document.getElementById('btn-clear-xi').addEventListener('click', () => {
  openConfirm('Clear Transfer In Log', 'Delete all Transfer In records? G2 inventory will NOT be changed.', () => {
    xferIn = []; saveAll(); renderXferIn(); renderSummary();
    showToast('✓ Transfer In log cleared'); logAct('edit', 'Transfer In log cleared');
  });
});
document.getElementById('btn-clear-xo').addEventListener('click', () => {
  openConfirm('Clear Transfer Out Log', 'Delete all Transfer Out records? G2 inventory will NOT be changed.', () => {
    xferOut = []; saveAll(); renderXferOut(); renderSummary();
    showToast('✓ Transfer Out log cleared'); logAct('edit', 'Transfer Out log cleared');
  });
});
document.getElementById('btn-clear-all').addEventListener('click', () => {
  openConfirm('⚠ Clear ALL Data', 'This will delete ALL inventory, all transfer logs, and all activity. Are you sure?', () => {
    inventory = buildDefault(); xferIn = []; xferOut = []; actLog = [];
    saveAll(); renderAll();
    showToast('✓ All data cleared'); logAct('edit', 'All data cleared and reset');
  });
});
document.getElementById('btn-clear-log').addEventListener('click', () => {
  actLog = []; saveAll(); renderLog(); renderLogBadge(); showToast('✓ Log cleared');
});

/* ══════════════════════════════════════════════════
   §17  SAFE MODEL MATCHING ENGINE
   (Fixed — token-based, number-enforced matching)
══════════════════════════════════════════════════ */

/**
 * normalizeText:
 *  - lowercase
 *  - letter→digit: "iphone11" → "iphone 11"  (NOT digit→letter, so "6s","5g" stay intact)
 *  - "i phone" → "iphone", "i pad" → "ipad"
 */
function normalizeText(raw) {
  return raw
    .toLowerCase()
    .replace(/([a-z])(\d)/g, '$1 $2')
    .replace(/\bi\s+(phone|pad)\b/g, 'i$1')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Same transforms on stored model names. */
function normalizeModelName(name) {
  return name
    .toLowerCase()
    .replace(/([a-z])(\d)/g, '$1 $2')
    .replace(/\bi\s+(phone|pad)\b/g, 'i$1')
    .replace(/\s+/g, ' ')
    .trim();
}

// Tokens that are NEVER part of a model name
const DISCARD_TOKENS = new Set([
  'add','added','remove','removed','subtract','set','transfer','transferred',
  'move','moved','send','sent','got','received','sold','used','take','took',
  'lost','minus','lcd','digitizer','screen','screens','glass','display',
  'unit','units','bro','hey','yo','just','today','please','from','to','at',
  'into','for','piece','pieces','the','an','in','out',
]);

// Single letters that are valid model prefixes only when followed by a number
const MODEL_PREFIX_LETTERS = new Set(['a', 's', 'x']);

/**
 * extractModelFragment — strips action verbs, store codes, type words,
 * transfer clauses, and the leading quantity integer.
 * PRESERVES model numbers (the primary disambiguation signal).
 */
function extractModelFragment(rawText) {
  let s = rawText;
  s = s.replace(/\bg[123]\b/gi, ' ');           // store codes (while intact)
  s = s.replace(/\bfrom\b.+/i, '');             // "from gX" and everything after
  s = s.replace(/\bto\s+\d+\b/gi, '');          // "to <number>" set-qty
  s = s.replace(/\bto\b/gi, '');                // remaining "to"
  s = normalizeText(s);

  const tokens = s.split(/\s+/).filter(Boolean);
  const kept   = [];
  for (let i = 0; i < tokens.length; i++) {
    const tok  = tokens[i];
    const next = tokens[i + 1] || '';
    if (DISCARD_TOKENS.has(tok)) continue;
    if (tok === 'i') continue;
    if (tok.length === 1 && /^[a-z]$/.test(tok)) {
      if (MODEL_PREFIX_LETTERS.has(tok) && /^\d+$/.test(next)) kept.push(tok);
      continue;
    }
    kept.push(tok);
  }
  // Strip the leading quantity integer
  if (kept.length > 0 && /^\d+$/.test(kept[0])) kept.shift();
  return kept.join(' ').trim();
}

/**
 * findBestModelMatch — safe, number-token-enforced model matching.
 *
 * Returns:
 *   { item }                  — single confident match
 *   { ambiguous, candidates } — multiple equally-scored models (ask user)
 *   null                      — no match
 *
 * Algorithm:
 *  1. Hard filter: every number token in query must be a whole token in model.
 *     (This prevents "iphone 11" from ever matching "iPhone 6")
 *  2. Hard filter: every word token must appear as a token in the model.
 *  3. Score by extra-token penalty (prefer "iPhone 11" over "iPhone 11 Pro Max").
 *  4. Ambiguity check on tied scores.
 */
function findBestModelMatch(fragment, partType) {
  if (!fragment) return null;

  const normFrag    = normalizeText(fragment);
  const queryTokens = normFrag.split(/\s+/).filter(Boolean);
  const queryNums   = queryTokens.filter(t => /^\d+$/.test(t));
  const queryWords  = queryTokens.filter(t => !/^\d+$/.test(t));

  let pool = inventory.filter(item => !partType || item.type === partType);
  if (!pool.length) return null;

  // Hard filter 1: number tokens must be whole tokens in model
  if (queryNums.length) {
    const nf = pool.filter(item => {
      const nmToks = normalizeModelName(item.model).split(/\s+/);
      return queryNums.every(n => nmToks.includes(n));
    });
    if (nf.length) pool = nf;
  }

  // Hard filter 2: word tokens must each appear in model tokens
  if (queryWords.length) {
    const wf = pool.filter(item => {
      const nmToks = normalizeModelName(item.model).split(/\s+/);
      return queryWords.every(w =>
        nmToks.some(mt => mt === w || mt.startsWith(w) || w.startsWith(mt))
      );
    });
    if (wf.length) pool = wf;
  }

  if (!pool.length) return null;

  // Score: penalise extra tokens (prefer "iPhone 11" over "iPhone 11 Pro Max" for query "iphone 11")
  const scored = pool.map(item => {
    const normModel = normalizeModelName(item.model);
    const modelToks = normModel.split(/\s+/).filter(Boolean);
    const extra     = Math.max(0, modelToks.length - queryTokens.length);
    const exact     = normModel === normFrag ? 100 : 0;
    return { item, score: 100 - extra * 15 + exact, normModel };
  });

  scored.sort((a, b) => b.score - a.score);

  const topScore   = scored[0].score;
  const topGroup   = scored.filter(x => x.score === topScore);
  const distinct   = [...new Set(topGroup.map(x => x.item.model))];

  if (distinct.length > 1) return { ambiguous: true, candidates: distinct.slice(0, 5) };
  return { item: scored[0].item };
}

/** Find existing inventory item by brand + model + type + network (loose network match). */
function findInvMatch(brand, model, type, net) {
  const normM = normalizeModelName(model);
  // Prefer exact brand+model+type+net match
  let hit = inventory.find(i =>
    i.brand === brand &&
    normalizeModelName(i.model) === normM &&
    i.type  === type &&
    i.network === net
  );
  if (hit) return hit;
  // Fallback: brand+model+type (ignore network)
  hit = inventory.find(i =>
    i.brand === brand &&
    normalizeModelName(i.model) === normM &&
    i.type  === type
  );
  return hit || null;
}

function guessSamsungSeries(model) {
  const m = model.toLowerCase();
  if (/note/.test(m)) return 'Note';
  if (/galaxy\s+a|^a\s*\d/.test(m)) return 'A';
  if (/galaxy\s+s\d|^s\s*\d/.test(m)) return 'S';
  return '';
}

/* ══════════════════════════════════════════════════
   §18  TEXT COMMAND PARSER (chatbot)
══════════════════════════════════════════════════ */
const cmdInput = document.getElementById('cmd-input');
const cmdSend  = document.getElementById('cmd-send');

cmdSend.addEventListener('click',  sendCmd);
cmdInput.addEventListener('keydown', e => { if (e.key === 'Enter') sendCmd(); });

function sendCmd() {
  const raw = cmdInput.value.trim();
  if (!raw) return;
  cmdInput.value = '';
  appendCmd('user', raw);
  const reply = parseCmd(raw);
  setTimeout(() => appendCmd('bot', reply), 200);
}

function appendCmd(role, html) {
  const msgs = document.getElementById('cmd-messages');
  const div  = document.createElement('div');
  div.className = `cmd-msg ${role}`;
  div.innerHTML = `<div class="cmd-bubble">${html}</div>`;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function extractQty(text) {
  const m = text.match(/\b(\d+)\b/);
  return m ? parseInt(m[1], 10) : null;
}
function extractStoreCode(text) {
  const m = text.match(/\b(g[123]|warehouse|other)\b/i);
  return m ? m[1].toUpperCase() : null;
}
function extractPartType(text) {
  if (/digitizer/i.test(text)) return 'Digitizer';
  return 'LCD';
}

function parseCmd(raw) {
  const text   = raw.toLowerCase();

  // ── SHOW / SEARCH ──
  if (/^\s*(show|search|find)\b/.test(text)) {
    const q = raw.replace(/^\s*(show|search|find)\s+/i, '').trim();
    document.getElementById('sp-search-q').value = q;
    document.getElementById('sp-search-submit').click();
    return `🔍 Searching for <em>${esc(q)}</em>…`;
  }

  // ── TRANSFER IN ──
  const isXferIn = /\b(transfer\s+in|received?|got\s+from|from\s+(g[123]|warehouse))\b/i.test(raw);
  // ── TRANSFER OUT ──
  const isXferOut = /\b(transfer\s+out|send|sent|move\s+to|to\s+(g[123]|warehouse))\b/i.test(raw);

  if (isXferIn) {
    const qty      = extractQty(raw) || 1;
    const store    = extractStoreCode(raw) || 'G1';
    const partType = extractPartType(raw);
    const fragment = extractModelFragment(raw);

    if (!fragment) return '❓ Which model? Try: <em>transfer in 3 iphone 11 lcd from g1</em>';

    const result = findBestModelMatch(fragment, partType);
    if (!result)
      return `❓ No ${partType} match for "<em>${esc(fragment)}</em>". Check spelling.`;
    if (result.ambiguous)
      return `❓ Multiple matches — which one?<br>${result.candidates.map(m => `• <em>${esc(m)}</em>`).join('<br>')}`;

    const item = result.item;
    submitTransferIn(store, item.brand, item.model, item.type, item.network, qty, todayISO(), '', 'cmd');
    return `✓ Transfer In: <em>+${qty} ${item.model}</em> (${partType}) from <em>${store}</em>`;
  }

  if (isXferOut) {
    const qty      = extractQty(raw) || 1;
    const store    = extractStoreCode(raw) || 'G1';
    const partType = extractPartType(raw);
    const fragment = extractModelFragment(raw);

    if (!fragment) return '❓ Which model? Try: <em>send 2 iphone 11 lcd to g3</em>';

    const result = findBestModelMatch(fragment, partType);
    if (!result)
      return `❓ No ${partType} match for "<em>${esc(fragment)}</em>". Check spelling.`;
    if (result.ambiguous)
      return `❓ Multiple matches — which one?<br>${result.candidates.map(m => `• <em>${esc(m)}</em>`).join('<br>')}`;

    const item = result.item;
    submitTransferOut(store, item.brand, item.model, item.type, item.network, qty, todayISO(), '', 'cmd', false);
    return `✓ Transfer Out: <em>-${qty} ${item.model}</em> (${partType}) to <em>${store}</em>`;
  }

  // ── REMOVE ──
  if (/\b(remove|subtract|sold|used|take|took|lost|minus)\b/i.test(raw)) {
    const qty      = extractQty(raw) || 1;
    const partType = extractPartType(raw);
    const fragment = extractModelFragment(raw);

    if (!fragment) return '❓ Which model? Try: <em>remove 2 iphone 11 lcd</em>';

    const result = findBestModelMatch(fragment, partType);
    if (!result)      return `❓ No match for "<em>${esc(fragment)}</em>".`;
    if (result.ambiguous) return `❓ Multiple matches:<br>${result.candidates.map(m => `• <em>${esc(m)}</em>`).join('<br>')}`;

    const item = result.item;
    item.qty = Math.max(0, (item.qty || 0) - qty);
    item.updatedAt = Date.now();
    logAct('sub', `Cmd removed -${qty} ${item.model} (${partType})`);
    saveAll(); renderInventory(); renderSummary();
    return `✓ Removed ${qty} — <em>${item.model}</em> (${partType}) → qty now ${item.qty}`;
  }

  // ── ADD (default) ──
  {
    const qty      = extractQty(raw) || 1;
    const partType = extractPartType(raw);
    const fragment = extractModelFragment(raw);

    if (!fragment) return '❓ I didn\'t catch that. Try: <em>add 4 iphone 11 lcd</em>';

    const result = findBestModelMatch(fragment, partType);
    if (!result)      return `❓ No match for "<em>${esc(fragment)}</em>". Check spelling or use the Add form.`;
    if (result.ambiguous) return `❓ Multiple matches — which one?<br>${result.candidates.map(m => `• <em>${esc(m)}</em>`).join('<br>')}`;

    const item = result.item;
    item.qty = (item.qty || 0) + qty;
    item.updatedAt = Date.now();
    logAct('add', `Cmd added +${qty} ${item.model} (${partType})`);
    saveAll(); renderInventory(); renderSummary();
    return `✓ Added ${qty} — <em>${item.model}</em> (${partType}) → qty now ${item.qty}`;
  }
}

/* ══════════════════════════════════════════════════
   §19  TOAST
══════════════════════════════════════════════════ */
let toastTimer = null;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
}

/* ══════════════════════════════════════════════════
   §20  KEYBOARD SHORTCUTS
══════════════════════════════════════════════════ */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.getElementById('item-modal').style.display    = 'none';
    document.getElementById('confirm-modal').style.display = 'none';
    closePanels();
    document.querySelectorAll('.model-suggest').forEach(el => { el.classList.remove('open'); el.innerHTML = ''; });
  }
  if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
    e.preventDefault();
    switchTab('inventory');
    const s = document.getElementById('inv-search');
    s.focus(); s.select();
  }
});

/* ══════════════════════════════════════════════════
   §21  HELPERS
══════════════════════════════════════════════════ */
function findById(id) { return inventory.find(i => i.id === id); }

function renderAll() {
  renderSummary();
  renderInventory();
  renderXferIn();
  renderXferOut();
  renderLogBadge();
}

/* ══════════════════════════════════════════════════
   §22  INIT
══════════════════════════════════════════════════ */
function initApp() {
  loadAll();

  // Set today's date defaults on all date inputs
  ['xi-date','xo-date','sp-xi-date','sp-xo-date'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = todayISO();
  });

  // Wire up autocomplete on all model inputs
  setupSuggest('xi-model',    'xi-suggest',    'xi-brand');
  setupSuggest('xo-model',    'xo-suggest',    'xo-brand');
  setupSuggest('sp-xi-model', 'sp-xi-suggest', 'sp-xi-brand');
  setupSuggest('sp-xo-model', 'sp-xo-suggest', 'sp-xo-brand');
  setupSuggest('sp-add-model','sp-add-suggest','sp-add-brand');
  setupSuggest('sp-rem-model','sp-rem-suggest','sp-rem-brand');

  renderAll();
}

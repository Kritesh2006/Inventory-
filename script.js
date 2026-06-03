/* =====================================================
   RON INVENTORY v2 — script.js
   localStorage · Multi-store · Chatbot · Activity Log
   ===================================================== */

'use strict';

/* ══════════════════════════════════════════════════════
   SECTION 1 — BOOT SEQUENCE
══════════════════════════════════════════════════════ */

(function bootSequence() {
  const lines    = document.querySelectorAll('.boot-line');
  const progress = document.getElementById('boot-progress');
  const status   = document.getElementById('boot-status');
  const loader   = document.getElementById('boot-loader');
  const bootEl   = document.getElementById('boot-screen');

  const statuses = [
    'Activating server node…',
    'Verifying location token…',
    'Loading inventory database…',
    'Establishing secure mode…',
    'Finalizing — offline only…',
    'System ready.',
  ];

  let lineIndex = 0;

  function showNextLine() {
    if (lineIndex >= lines.length) return;
    const line = lines[lineIndex];
    const delay = parseInt(line.dataset.delay, 10) || 0;
    setTimeout(() => {
      line.classList.add('visible');
      // advance progress
      const pct = Math.min(100, Math.round(((lineIndex + 1) / lines.length) * 90));
      progress.style.width = pct + '%';
      status.textContent = statuses[lineIndex] || '';
      lineIndex++;
      showNextLine();
    }, delay);
  }

  showNextLine();

  // finish loader spinner on line 3
  setTimeout(() => {
    if (loader) loader.classList.add('done');
  }, 2600 + 800);

  // complete boot at ~4s
  setTimeout(() => {
    progress.style.width = '100%';
    status.textContent = 'System ready.';
    setTimeout(() => {
      bootEl.classList.add('fade-out');
      setTimeout(() => {
        bootEl.style.display = 'none';
        document.getElementById('app').classList.remove('hidden');
        initApp();
      }, 600);
    }, 500);
  }, 4000);
})();

/* ══════════════════════════════════════════════════════
   SECTION 2 — DATA DEFAULTS & SEEDING
══════════════════════════════════════════════════════ */

const STORAGE_KEY = 'ron_inventory_v2';
const LOG_KEY     = 'ron_activity_log_v2';
const STORES      = ['G1', 'G2', 'G3'];

/** Generate a short unique ID */
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

/**
 * Build a default inventory item.
 * Each item represents ONE model at ONE store.
 */
function makeItem(brand, samsungSeries, model, type, network, notes) {
  return { id: uid(), brand, samsungSeries, model, type, network, notes, qty: 0, updatedAt: null };
}

/**
 * Seed all stores with a model list.
 * Returns array of items (one per model per store).
 */
function seedModels(models) {
  const items = [];
  models.forEach(m => {
    STORES.forEach(store => {
      items.push({ ...makeItem(m.brand, m.ss || '', m.model, m.type, m.net || 'Universal', m.notes || ''), store });
    });
  });
  return items;
}

function buildDefaultInventory() {
  const models = [];

  /* ── iPhone ── */
  const iphones = [
    'iPhone 6', 'iPhone 6 Plus', 'iPhone 6S', 'iPhone 6S Plus',
    'iPhone 7', 'iPhone 7 Plus', 'iPhone 8', 'iPhone 8 Plus',
    'iPhone X', 'iPhone XR', 'iPhone XS', 'iPhone XS Max',
    'iPhone 11', 'iPhone 11 Pro', 'iPhone 11 Pro Max',
    'iPhone 12', 'iPhone 12 Mini', 'iPhone 12 Pro', 'iPhone 12 Pro Max',
    'iPhone 13', 'iPhone 13 Mini', 'iPhone 13 Pro', 'iPhone 13 Pro Max',
    'iPhone 14', 'iPhone 14 Plus', 'iPhone 14 Pro', 'iPhone 14 Pro Max',
    'iPhone 15', 'iPhone 15 Plus', 'iPhone 15 Pro', 'iPhone 15 Pro Max',
    'iPhone 16', 'iPhone 16 Plus', 'iPhone 16 Pro', 'iPhone 16 Pro Max',
  ];
  iphones.forEach(m => models.push({ brand: 'Apple', model: m, type: 'LCD', net: 'Universal' }));

  /* ── Samsung S Series ── */
  const samsungS = [
    { model: 'Galaxy S8',    net: 'Universal' }, { model: 'Galaxy S8+',        net: 'Universal' },
    { model: 'Galaxy S9',    net: 'Universal' }, { model: 'Galaxy S9+',        net: 'Universal' },
    { model: 'Galaxy S10',   net: 'Universal' }, { model: 'Galaxy S10+',       net: 'Universal' },
    { model: 'Galaxy S10e',  net: 'Universal' }, { model: 'Galaxy S10 5G',     net: '5G' },
    { model: 'Galaxy S20',   net: '4G' },        { model: 'Galaxy S20 5G',     net: '5G' },
    { model: 'Galaxy S20+',  net: '4G' },        { model: 'Galaxy S20+ 5G',    net: '5G' },
    { model: 'Galaxy S20 Ultra 5G', net: '5G' },
    { model: 'Galaxy S20 FE', net: '4G' },       { model: 'Galaxy S20 FE 5G',  net: '5G' },
    { model: 'Galaxy S21',   net: '5G' },        { model: 'Galaxy S21+',       net: '5G' },
    { model: 'Galaxy S21 Ultra', net: '5G' },    { model: 'Galaxy S21 FE',     net: '5G' },
    { model: 'Galaxy S22',   net: '5G' },        { model: 'Galaxy S22+',       net: '5G' },
    { model: 'Galaxy S22 Ultra', net: '5G' },
    { model: 'Galaxy S23',   net: '5G' },        { model: 'Galaxy S23+',       net: '5G' },
    { model: 'Galaxy S23 Ultra', net: '5G' },    { model: 'Galaxy S23 FE',     net: '5G' },
    { model: 'Galaxy S24',   net: '5G' },        { model: 'Galaxy S24+',       net: '5G' },
    { model: 'Galaxy S24 Ultra', net: '5G' },
    { model: 'Galaxy S25',   net: '5G' },        { model: 'Galaxy S25+',       net: '5G' },
    { model: 'Galaxy S25 Ultra', net: '5G' },
  ];
  samsungS.forEach(m => models.push({ brand: 'Samsung', ss: 'S', model: m.model, type: 'LCD', net: m.net }));

  /* ── Samsung Note ── */
  const notes_s = [
    { model: 'Galaxy Note 8',       net: 'Universal' },
    { model: 'Galaxy Note 9',       net: 'Universal' },
    { model: 'Galaxy Note 10',      net: 'Universal' },
    { model: 'Galaxy Note 10+',     net: 'Universal' },
    { model: 'Galaxy Note 10 5G',   net: '5G' },
    { model: 'Galaxy Note 20',      net: '4G' },
    { model: 'Galaxy Note 20 5G',   net: '5G' },
    { model: 'Galaxy Note 20 Ultra 5G', net: '5G' },
  ];
  notes_s.forEach(m => models.push({ brand: 'Samsung', ss: 'Note', model: m.model, type: 'LCD', net: m.net }));

  /* ── Samsung A Series ──
     A15: 4G and 5G use compatible LCDs in most cases → Universal
     Others: mark Unknown when unsure about interchangeability */
  const samsungA = [
    { model: 'Galaxy A10',    net: 'Universal' },
    { model: 'Galaxy A11',    net: 'Universal' },
    { model: 'Galaxy A12',    net: 'Universal' },
    { model: 'Galaxy A13',    net: '4G',     notes: 'Verify 4G vs 5G variant — different flex on some batches' },
    { model: 'Galaxy A13 5G', net: '5G' },
    { model: 'Galaxy A14',    net: 'Universal', notes: '4G and 5G share LCD on most batches' },
    { model: 'Galaxy A15',    net: 'Universal', notes: '4G and 5G LCD compatible — verify supplier batch' },
    { model: 'Galaxy A20',    net: 'Universal' },
    { model: 'Galaxy A21',    net: 'Universal' },
    { model: 'Galaxy A21s',   net: 'Universal' },
    { model: 'Galaxy A32',    net: '4G' },
    { model: 'Galaxy A32 5G', net: '5G',     notes: 'Different LCD from 4G version' },
    { model: 'Galaxy A42 5G', net: '5G' },
    { model: 'Galaxy A51',    net: '4G' },
    { model: 'Galaxy A52',    net: '4G' },
    { model: 'Galaxy A52s 5G', net: '5G' },
    { model: 'Galaxy A53',    net: '5G' },
    { model: 'Galaxy A54',    net: '5G' },
    { model: 'Galaxy A71',    net: 'Unknown', notes: 'Check if 4G or 5G variant before ordering' },
    { model: 'Galaxy A72',    net: '4G' },
  ];
  samsungA.forEach(m => models.push({ brand: 'Samsung', ss: 'A', model: m.model, type: 'LCD', net: m.net, notes: m.notes || '' }));

  /* ── Motorola ── */
  const motos = [
    'Moto E6', 'Moto E7', 'Moto E7 Power', 'Moto E8',
    'Moto E13', 'Moto E14', 'Moto E20', 'Moto E30', 'Moto E40',
    'Moto G5', 'Moto G5 Plus', 'Moto G5S',
    'Moto G6', 'Moto G6 Play', 'Moto G6 Plus',
    'Moto G7', 'Moto G7 Play', 'Moto G7 Plus', 'Moto G7 Power',
    'Moto G8', 'Moto G8 Play', 'Moto G8 Plus', 'Moto G8 Power',
    'Moto G9', 'Moto G9 Play', 'Moto G9 Plus', 'Moto G9 Power',
    'Moto G10', 'Moto G20', 'Moto G30', 'Moto G40 Fusion',
    'Moto G50', 'Moto G51', 'Moto G52', 'Moto G53', 'Moto G54', 'Moto G62',
    'Moto G71', 'Moto G82', 'Moto G84', 'Moto G85',
    'Moto G Fast',
    'Moto G Pure',
    'Moto G Power (2021)', 'Moto G Power (2022)', 'Moto G Power (2023)', 'Moto G Power (2024)',
    'Moto G Play (2021)', 'Moto G Play (2023)', 'Moto G Play (2024)',
    'Moto G Stylus (2021)', 'Moto G Stylus (2022)', 'Moto G Stylus (2023)', 'Moto G Stylus (2024)',
    'Moto Edge', 'Moto Edge+',
    'Moto Edge 20', 'Moto Edge 20 Pro',
    'Moto Edge 30', 'Moto Edge 30 Pro', 'Moto Edge 30 Fusion',
    'Moto Edge 40', 'Moto Edge 40 Pro', 'Moto Edge 40 Neo',
    'Moto Edge 50 Pro', 'Moto Edge 50 Fusion', 'Moto Edge 50 Ultra',
    'Moto One', 'Moto One Action', 'Moto One Vision', 'Moto One Fusion',
    'Moto Z3', 'Moto Z4',
  ];
  motos.forEach(m => models.push({ brand: 'Motorola', model: m, type: 'LCD', net: 'Unknown', notes: 'Verify SKU before ordering' }));

  /* ── iPad LCD ── */
  const iPadLCDs = [
    'iPad 5th Gen', 'iPad 6th Gen', 'iPad 7th Gen', 'iPad 8th Gen', 'iPad 9th Gen', 'iPad 10th Gen',
    'iPad Air 2', 'iPad Air 3rd Gen', 'iPad Air 4th Gen', 'iPad Air 5th Gen', 'iPad Air M2', 'iPad Air M3',
    'iPad Mini 4', 'iPad Mini 5th Gen', 'iPad Mini 6th Gen',
    'iPad Pro 9.7"', 'iPad Pro 10.5"',
    'iPad Pro 11" 1st Gen', 'iPad Pro 11" 2nd Gen', 'iPad Pro 11" 3rd Gen', 'iPad Pro 11" 4th Gen',
    'iPad Pro 12.9" 1st Gen', 'iPad Pro 12.9" 2nd Gen', 'iPad Pro 12.9" 3rd Gen',
    'iPad Pro 12.9" 4th Gen', 'iPad Pro 12.9" 5th Gen', 'iPad Pro 12.9" 6th Gen',
  ];
  iPadLCDs.forEach(m => models.push({ brand: 'Apple iPad', model: m, type: 'LCD', net: 'Universal' }));

  /* ── iPad Digitizer ── */
  const iPadDigi = [
    'iPad 5th Gen', 'iPad 6th Gen', 'iPad 7th Gen', 'iPad 8th Gen', 'iPad 9th Gen', 'iPad 10th Gen',
    'iPad Air 2', 'iPad Air 3rd Gen', 'iPad Air 4th Gen', 'iPad Air 5th Gen',
    'iPad Mini 4', 'iPad Mini 5th Gen', 'iPad Mini 6th Gen',
    'iPad Pro 9.7"', 'iPad Pro 10.5"',
    'iPad Pro 11" 1st Gen', 'iPad Pro 11" 2nd Gen',
    'iPad Pro 12.9" 1st Gen', 'iPad Pro 12.9" 2nd Gen', 'iPad Pro 12.9" 3rd Gen',
  ];
  iPadDigi.forEach(m => models.push({ brand: 'Apple iPad', model: m, type: 'Digitizer', net: 'Universal' }));

  return seedModels(models);
}

/* ══════════════════════════════════════════════════════
   SECTION 3 — STATE
══════════════════════════════════════════════════════ */

let inventory   = [];
let activityLog = [];
let searchQ     = '';
let filterBrand = '';
let filterType  = '';
let filterStore = '';
let editingId   = null;
let deleteId    = null;

// Chatbot undo stack (single level)
let lastChatAction = null;   // { type, items: [{id, oldQty, newQty}] }

/* ══════════════════════════════════════════════════════
   SECTION 4 — PERSISTENCE
══════════════════════════════════════════════════════ */

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(inventory));
    localStorage.setItem(LOG_KEY, JSON.stringify(activityLog));
  } catch (e) { showToast('⚠ Save failed'); }
}

function load() {
  try {
    const inv = localStorage.getItem(STORAGE_KEY);
    const log = localStorage.getItem(LOG_KEY);
    inventory   = inv ? JSON.parse(inv) : buildDefaultInventory();
    activityLog = log ? JSON.parse(log) : [];
    if (!inv) save();
  } catch (e) {
    inventory   = buildDefaultInventory();
    activityLog = [];
  }
}

/* ══════════════════════════════════════════════════════
   SECTION 5 — FILTERING
══════════════════════════════════════════════════════ */

function getFiltered() {
  const q = searchQ.toLowerCase().trim();
  return inventory.filter(item => {
    // search
    if (q) {
      const hay = [item.brand, item.model, item.type, item.network, item.store, item.notes].join(' ').toLowerCase();
      if (!hay.includes(q)) return false;
    }
    // brand / series filter
    if (filterBrand) {
      if (filterBrand === 'Samsung-S')    { if (!(item.brand === 'Samsung' && item.samsungSeries === 'S'))    return false; }
      else if (filterBrand === 'Samsung-Note') { if (!(item.brand === 'Samsung' && item.samsungSeries === 'Note')) return false; }
      else if (filterBrand === 'Samsung-A')   { if (!(item.brand === 'Samsung' && item.samsungSeries === 'A'))    return false; }
      else { if (item.brand !== filterBrand) return false; }
    }
    if (filterType  && item.type  !== filterType)  return false;
    if (filterStore && item.store !== filterStore)  return false;
    return true;
  });
}

/* ══════════════════════════════════════════════════════
   SECTION 6 — RENDER
══════════════════════════════════════════════════════ */

function render() {
  renderSummary();
  renderTable();
  renderLogBadge();
}

/** Summary bar totals */
function renderSummary() {
  const sum = arr => arr.reduce((s, i) => s + (i.qty || 0), 0);
  document.getElementById('sum-total-val').textContent = sum(inventory);
  document.getElementById('sum-apple').textContent     = sum(inventory.filter(i => i.brand === 'Apple'));
  document.getElementById('sum-samsung').textContent   = sum(inventory.filter(i => i.brand === 'Samsung'));
  document.getElementById('sum-motorola').textContent  = sum(inventory.filter(i => i.brand === 'Motorola'));
  document.getElementById('sum-ipad').textContent      = sum(inventory.filter(i => i.brand === 'Apple iPad'));
  STORES.forEach(s => {
    document.getElementById('sum-' + s.toLowerCase()).textContent = sum(inventory.filter(i => i.store === s));
  });
}

function brandBadge(brand) {
  const map = {
    'Apple':      ['iPhone',   'badge-iphone'],
    'Samsung':    ['Samsung',  'badge-samsung'],
    'Motorola':   ['Motorola', 'badge-motorola'],
    'Apple iPad': ['iPad',     'badge-ipad'],
  };
  const [label, cls] = map[brand] || [brand, 'badge-iphone'];
  return `<span class="brand-badge ${cls}">${label}</span>`;
}

function typeBadge(type) {
  return type === 'LCD'
    ? `<span class="type-badge type-lcd">LCD</span>`
    : `<span class="type-badge type-digitizer">Digitizer</span>`;
}

function netBadge(net) {
  const cls = { '4G': 'net-4g', '5G': 'net-5g', 'Universal': 'net-universal', 'Unknown': 'net-unknown' }[net] || 'net-unknown';
  return `<span class="net-badge ${cls}">${net}</span>`;
}

function fmtDate(ts) {
  if (!ts) return '—';
  const d = new Date(ts);
  return `${d.getMonth()+1}/${d.getDate()}/${String(d.getFullYear()).slice(2)}`;
}

function renderTable() {
  const items   = getFiltered();
  const tbody   = document.getElementById('inv-tbody');
  const empty   = document.getElementById('empty-state');
  const footer  = document.getElementById('table-footer');

  if (!items.length) {
    tbody.innerHTML = '';
    empty.style.display  = '';
    footer.textContent = '';
    return;
  }
  empty.style.display = 'none';
  footer.textContent  = `${items.length} item${items.length !== 1 ? 's' : ''} shown  ·  ${inventory.length} total`;

  tbody.innerHTML = items.map(item => {
    const noteCls  = item.notes ? 'notes-cell' : 'notes-cell empty';
    const noteText = item.notes ? escHtml(item.notes) : '—';
    return `<tr data-id="${item.id}">
      <td>${brandBadge(item.brand)}</td>
      <td style="font-weight:500; color:var(--text)">${escHtml(item.model)}</td>
      <td>${netBadge(item.network)}</td>
      <td>${typeBadge(item.type)}</td>
      <td><span class="store-badge">${item.store}</span></td>
      <td>
        <div class="qty-ctrl">
          <button class="qty-btn minus" data-id="${item.id}" title="Remove 1">−</button>
          <input class="qty-input" type="number" data-id="${item.id}" value="${item.qty}" min="0" />
          <button class="qty-btn plus"  data-id="${item.id}" title="Add 1">+</button>
        </div>
      </td>
      <td><span class="${noteCls}" data-id="${item.id}">${noteText}</span></td>
      <td class="updated-cell">${fmtDate(item.updatedAt)}</td>
      <td>
        <div class="row-acts">
          <button class="act-btn edit" data-id="${item.id}" title="Edit">✎</button>
          <button class="act-btn del"  data-id="${item.id}" title="Delete">🗑</button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

function escHtml(s) {
  return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* ══════════════════════════════════════════════════════
   SECTION 7 — TABLE EVENTS (delegation)
══════════════════════════════════════════════════════ */

document.getElementById('inv-tbody').addEventListener('click', e => {
  const t = e.target;

  // plus / minus
  if (t.classList.contains('qty-btn')) {
    const id = t.dataset.id;
    const item = findItem(id);
    if (!item) return;
    const old = item.qty;
    if (t.classList.contains('plus'))  item.qty = (item.qty || 0) + 1;
    else                               item.qty = Math.max(0, (item.qty || 0) - 1);
    item.updatedAt = Date.now();
    logActivity(item.qty > old ? 'add' : 'edit',
      `${t.classList.contains('plus') ? '+1' : '-1'} — ${item.model} (${item.type}) [${item.store}] → qty ${item.qty}`);
    save(); render();
    return;
  }

  // edit button
  if (t.classList.contains('edit') || t.closest('.act-btn.edit')) {
    openEditModal(t.dataset.id || t.closest('.act-btn').dataset.id);
    return;
  }

  // delete button
  if (t.classList.contains('del') || t.closest('.act-btn.del')) {
    openDeleteModal(t.dataset.id || t.closest('.act-btn').dataset.id);
    return;
  }

  // notes inline edit
  if (t.classList.contains('notes-cell')) {
    startNotesEdit(t);
    return;
  }
});

// qty manual input
document.getElementById('inv-tbody').addEventListener('change', e => {
  if (!e.target.classList.contains('qty-input')) return;
  const item = findItem(e.target.dataset.id);
  if (!item) return;
  const v = parseInt(e.target.value, 10);
  item.qty = isNaN(v) || v < 0 ? 0 : v;
  item.updatedAt = Date.now();
  logActivity('edit', `Set ${item.model} (${item.type}) [${item.store}] qty to ${item.qty}`);
  save(); render();
});

function startNotesEdit(el) {
  const id   = el.dataset.id;
  const item = findItem(id);
  if (!item) return;
  const input = document.createElement('input');
  input.className   = 'notes-edit-input';
  input.type        = 'text';
  input.value       = item.notes || '';
  input.placeholder = 'Add notes…';
  el.replaceWith(input);
  input.focus(); input.select();
  const commit = () => {
    item.notes     = input.value.trim();
    item.updatedAt = Date.now();
    save(); render();
  };
  input.addEventListener('blur', commit);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') input.blur();
    if (e.key === 'Escape') render();
  });
}

/* ══════════════════════════════════════════════════════
   SECTION 8 — SEARCH & FILTERS
══════════════════════════════════════════════════════ */

const searchInput = document.getElementById('search-input');
const searchClear = document.getElementById('search-clear');

searchInput.addEventListener('input', () => {
  searchQ = searchInput.value;
  searchClear.classList.toggle('visible', searchQ.length > 0);
  renderTable();
});

searchClear.addEventListener('click', () => {
  searchInput.value = '';
  searchQ = '';
  searchClear.classList.remove('visible');
  searchInput.focus();
  renderTable();
});

document.getElementById('filter-brand').addEventListener('change', e => {
  filterBrand = e.target.value;
  renderTable();
});
document.getElementById('filter-type').addEventListener('change', e => {
  filterType = e.target.value;
  renderTable();
});
document.getElementById('filter-store').addEventListener('change', e => {
  filterStore = e.target.value;
  renderTable();
});

document.getElementById('btn-clear-filters').addEventListener('click', () => {
  filterBrand = filterType = filterStore = '';
  document.getElementById('filter-brand').value = '';
  document.getElementById('filter-type').value  = '';
  document.getElementById('filter-store').value = '';
  renderTable();
});

// Summary bar click-to-filter
document.querySelectorAll('.sum-brand').forEach(el => {
  el.addEventListener('click', () => {
    const b = el.dataset.filterBrand;
    filterBrand = (filterBrand === b) ? '' : b;
    document.getElementById('filter-brand').value = filterBrand;
    document.querySelectorAll('.sum-brand, .sum-store').forEach(x => x.classList.remove('active'));
    if (filterBrand) el.classList.add('active');
    renderTable();
  });
});
document.querySelectorAll('.sum-store').forEach(el => {
  el.addEventListener('click', () => {
    const s = el.dataset.filterStore;
    filterStore = (filterStore === s) ? '' : s;
    document.getElementById('filter-store').value = filterStore;
    document.querySelectorAll('.sum-brand, .sum-store').forEach(x => x.classList.remove('active'));
    if (filterStore) el.classList.add('active');
    renderTable();
  });
});

/* ══════════════════════════════════════════════════════
   SECTION 9 — MODAL: Add / Edit
══════════════════════════════════════════════════════ */

const modalOverlay = document.getElementById('modal-overlay');
const fBrand       = document.getElementById('f-brand');
const fSamSeries   = document.getElementById('f-samsung-series');
const fgSamSeries  = document.getElementById('fg-samsung-series');

fBrand.addEventListener('change', () => {
  fgSamSeries.style.display = fBrand.value === 'Samsung' ? '' : 'none';
});

document.getElementById('btn-add').addEventListener('click', () => {
  editingId = null;
  document.getElementById('modal-title').textContent = 'Add New Model';
  fBrand.value   = 'Apple';
  fSamSeries.value = 'S';
  fgSamSeries.style.display = 'none';
  document.getElementById('f-model').value   = '';
  document.getElementById('f-type').value    = 'LCD';
  document.getElementById('f-network').value = 'Universal';
  document.getElementById('f-store').value   = document.getElementById('default-store').value;
  document.getElementById('f-qty').value     = 0;
  document.getElementById('f-notes').value   = '';
  modalOverlay.style.display = 'flex';
  setTimeout(() => document.getElementById('f-model').focus(), 50);
});

function openEditModal(id) {
  const item = findItem(id);
  if (!item) return;
  editingId = id;
  document.getElementById('modal-title').textContent = 'Edit Item';
  fBrand.value = item.brand;
  fgSamSeries.style.display = item.brand === 'Samsung' ? '' : 'none';
  fSamSeries.value = item.samsungSeries || 'S';
  document.getElementById('f-model').value   = item.model;
  document.getElementById('f-type').value    = item.type;
  document.getElementById('f-network').value = item.network || 'Universal';
  document.getElementById('f-store').value   = item.store;
  document.getElementById('f-qty').value     = item.qty;
  document.getElementById('f-notes').value   = item.notes || '';
  modalOverlay.style.display = 'flex';
}

function closeModal() { modalOverlay.style.display = 'none'; editingId = null; }

document.getElementById('modal-close').addEventListener('click', closeModal);
document.getElementById('modal-cancel').addEventListener('click', closeModal);
modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });

document.getElementById('modal-save').addEventListener('click', () => {
  const brand   = fBrand.value;
  const model   = document.getElementById('f-model').value.trim();
  const type    = document.getElementById('f-type').value;
  const network = document.getElementById('f-network').value;
  const store   = document.getElementById('f-store').value;
  const qty     = parseInt(document.getElementById('f-qty').value, 10) || 0;
  const notes   = document.getElementById('f-notes').value.trim();
  const samsungSeries = brand === 'Samsung' ? fSamSeries.value : '';

  if (!model) { showToast('⚠ Model name required'); return; }

  if (editingId) {
    const item = findItem(editingId);
    if (item) Object.assign(item, { brand, samsungSeries, model, type, network, store, qty, notes, updatedAt: Date.now() });
    logActivity('edit', `Edited: ${model} (${type}) [${store}]`);
    showToast('✓ Item updated');
  } else {
    inventory.push({ id: uid(), brand, samsungSeries, model, type, network, store, qty, notes, updatedAt: Date.now() });
    logActivity('add', `Added: ${model} (${type}) [${store}]`);
    showToast('✓ Item added');
  }
  save(); closeModal(); render();
});

/* ══════════════════════════════════════════════════════
   SECTION 10 — MODAL: Delete
══════════════════════════════════════════════════════ */

const deleteOverlay = document.getElementById('delete-overlay');

function openDeleteModal(id) {
  const item = findItem(id);
  if (!item) return;
  deleteId = id;
  document.getElementById('del-msg').textContent =
    `Delete "${item.model}" (${item.type}) at ${item.store}? This cannot be undone.`;
  deleteOverlay.style.display = 'flex';
}
function closeDeleteModal() { deleteOverlay.style.display = 'none'; deleteId = null; }
document.getElementById('del-close').addEventListener('click', closeDeleteModal);
document.getElementById('del-cancel').addEventListener('click', closeDeleteModal);
deleteOverlay.addEventListener('click', e => { if (e.target === deleteOverlay) closeDeleteModal(); });
document.getElementById('del-confirm').addEventListener('click', () => {
  const item = findItem(deleteId);
  if (item) logActivity('del', `Deleted: ${item.model} (${item.type}) [${item.store}]`);
  inventory = inventory.filter(i => i.id !== deleteId);
  save(); closeDeleteModal(); render(); showToast('🗑 Item deleted');
});

/* ══════════════════════════════════════════════════════
   SECTION 11 — MODAL: Reset
══════════════════════════════════════════════════════ */

const resetOverlay = document.getElementById('reset-overlay');
document.getElementById('btn-reset').addEventListener('click', () => { resetOverlay.style.display = 'flex'; });
document.getElementById('reset-close').addEventListener('click', () => { resetOverlay.style.display = 'none'; });
document.getElementById('reset-cancel').addEventListener('click', () => { resetOverlay.style.display = 'none'; });
resetOverlay.addEventListener('click', e => { if (e.target === resetOverlay) resetOverlay.style.display = 'none'; });
document.getElementById('reset-confirm').addEventListener('click', () => {
  inventory   = buildDefaultInventory();
  activityLog = [];
  lastChatAction = null;
  hideChatUndo();
  save(); resetOverlay.style.display = 'none'; render();
  showToast('✓ Reset to demo data');
  logActivity('edit', 'Inventory reset to demo data');
});

/* ══════════════════════════════════════════════════════
   SECTION 12 — CSV EXPORT / IMPORT
══════════════════════════════════════════════════════ */

document.getElementById('btn-export').addEventListener('click', () => {
  const headers = ['Brand','Samsung Series','Model','Type','Network','Store','Quantity','Notes','Last Updated'];
  const rows = inventory.map(i => [
    csv(i.brand), csv(i.samsungSeries || ''), csv(i.model), csv(i.type),
    csv(i.network), csv(i.store), i.qty, csv(i.notes || ''),
    i.updatedAt ? new Date(i.updatedAt).toLocaleDateString() : '',
  ]);
  const blob = new Blob([[headers.join(','), ...rows.map(r => r.join(','))].join('\n')], { type: 'text/csv' });
  const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: `ron_inventory_${todayStr()}.csv` });
  a.click(); URL.revokeObjectURL(a.href);
  showToast('✓ Exported');
  logActivity('edit', `Exported CSV — ${inventory.length} items`);
});

document.getElementById('btn-import').addEventListener('click', () => { document.getElementById('csv-input').click(); });

document.getElementById('csv-input').addEventListener('change', e => {
  const file = e.target.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const rows = parseCSV(ev.target.result);
      if (rows.length < 2) { showToast('⚠ Empty CSV'); return; }
      const h = rows[0].map(s => s.toLowerCase().trim());
      const ix = k => h.indexOf(k);
      const bi = ix('brand'), mi = ix('model'), ti = ix('type'),
            ni = ix('network'), si = ix('store'), qi = ix('quantity'),
            noi = ix('notes'), ssi = ix('samsung series');
      let added = 0, updated = 0;
      rows.slice(1).forEach(row => {
        if (row.every(c => !c.trim())) return;
        const brand = row[bi]?.trim(), model = row[mi]?.trim(), type = row[ti]?.trim();
        if (!brand || !model) return;
        const store = row[si]?.trim() || 'G1';
        const ex = inventory.find(i => i.brand.toLowerCase() === brand.toLowerCase() &&
          i.model.toLowerCase() === model.toLowerCase() &&
          i.type.toLowerCase() === (type || '').toLowerCase() &&
          i.store === store);
        if (ex) {
          if (qi >= 0) ex.qty = parseInt(row[qi], 10) || 0;
          if (noi >= 0) ex.notes = row[noi]?.trim() || '';
          ex.updatedAt = Date.now();
          updated++;
        } else {
          inventory.push({
            id: uid(), brand, samsungSeries: ssi >= 0 ? (row[ssi]?.trim() || '') : '',
            model, type: type || 'LCD', network: ni >= 0 ? (row[ni]?.trim() || 'Unknown') : 'Unknown',
            store, qty: qi >= 0 ? (parseInt(row[qi], 10) || 0) : 0,
            notes: noi >= 0 ? (row[noi]?.trim() || '') : '', updatedAt: Date.now(),
          });
          added++;
        }
      });
      save(); render();
      showToast(`✓ ${added} added · ${updated} updated`);
      logActivity('add', `CSV import: ${added} new, ${updated} updated`);
    } catch (err) { showToast('⚠ CSV parse error'); console.error(err); }
    e.target.value = '';
  };
  reader.readAsText(file);
});

function csv(v) {
  const s = String(v || '');
  return (s.includes(',') || s.includes('"') || s.includes('\n')) ? `"${s.replace(/"/g,'""')}"` : s;
}

function parseCSV(text) {
  return text.split(/\r?\n/).filter(l => l.trim()).map(line => {
    const cols = []; let inQ = false, cur = '';
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') { if (inQ && line[i+1] === '"') { cur += '"'; i++; } else inQ = !inQ; }
      else if (ch === ',' && !inQ) { cols.push(cur); cur = ''; }
      else cur += ch;
    }
    cols.push(cur); return cols;
  });
}

/* ══════════════════════════════════════════════════════
   SECTION 13 — DRAWERS (Chat + Log)
══════════════════════════════════════════════════════ */

const chatDrawer = document.getElementById('chat-drawer');
const logDrawer  = document.getElementById('log-drawer');
const backdrop   = document.getElementById('drawer-backdrop');

function openDrawer(drawer) {
  chatDrawer.classList.remove('open');
  logDrawer.classList.remove('open');
  drawer.classList.add('open');
  backdrop.classList.add('visible');
}
function closeDrawers() {
  chatDrawer.classList.remove('open');
  logDrawer.classList.remove('open');
  backdrop.classList.remove('visible');
}

document.getElementById('btn-toggle-chat').addEventListener('click', () => {
  chatDrawer.classList.contains('open') ? closeDrawers() : openDrawer(chatDrawer);
});
document.getElementById('btn-toggle-log').addEventListener('click', () => {
  logDrawer.classList.contains('open') ? closeDrawers() : openDrawer(logDrawer);
  renderLog();
});
document.getElementById('chat-close').addEventListener('click', closeDrawers);
document.getElementById('log-close').addEventListener('click', closeDrawers);
backdrop.addEventListener('click', closeDrawers);

/* ══════════════════════════════════════════════════════
   SECTION 14 — ACTIVITY LOG
══════════════════════════════════════════════════════ */

function logActivity(type, message) {
  activityLog.unshift({ type, message, ts: Date.now() });
  if (activityLog.length > 200) activityLog.length = 200;
  save();
  renderLogBadge();
  if (logDrawer.classList.contains('open')) renderLog();
}

function renderLogBadge() {
  const badge = document.getElementById('log-badge');
  badge.textContent = activityLog.length > 99 ? '99+' : activityLog.length;
}

function renderLog() {
  const list = document.getElementById('log-list');
  if (!activityLog.length) { list.innerHTML = '<div class="log-empty">No activity yet.</div>'; return; }
  list.innerHTML = activityLog.map(entry => {
    const dotCls = { add: 'add', del: 'del', edit: 'edit' }[entry.type] || 'edit';
    return `<div class="log-item">
      <div class="log-dot ${dotCls}"></div>
      <div class="log-content">
        <div class="log-action">${escHtml(entry.message)}</div>
        <div class="log-time">${new Date(entry.ts).toLocaleString()}</div>
      </div>
    </div>`;
  }).join('');
}

document.getElementById('btn-clear-log').addEventListener('click', () => {
  activityLog = []; save(); renderLog(); renderLogBadge();
});

/* ══════════════════════════════════════════════════════
   SECTION 15 — CHATBOT ENGINE
══════════════════════════════════════════════════════ */

/**
 * The chatbot parses free-form text commands and maps them to
 * inventory actions. It is entirely rule-based — no external API.
 *
 * Supported intents:
 *  ADD    — "add N [model] [type] [to store]"
 *  REMOVE — "remove/subtract N [model] [type] [from store]"
 *  SET    — "set [model] [type] [store] to N"
 *  TRANSFER — "transfer N [model] [from store] to [store]"
 *  SHOW   — "show [model]"
 */

const chatInput = document.getElementById('chat-input');
const chatSend  = document.getElementById('chat-send');

chatSend.addEventListener('click', submitChat);
chatInput.addEventListener('keydown', e => { if (e.key === 'Enter') submitChat(); });

function submitChat() {
  const text = chatInput.value.trim();
  if (!text) return;
  chatInput.value = '';
  appendMsg('user', text);
  const resp = parseCommand(text);
  setTimeout(() => appendMsg('bot', resp), 220);
}

function appendMsg(role, html) {
  const msgs = document.getElementById('chat-messages');
  const div  = document.createElement('div');
  div.className = `chat-msg ${role}`;
  div.innerHTML = `<div class="chat-bubble">${html}</div>`;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

/* ── Normalisation helpers ── */

const BRAND_ALIASES = {
  'iphone': 'Apple', 'apple': 'Apple',
  'samsung': 'Samsung', 'galaxy': 'Samsung',
  'motorola': 'Motorola', 'moto': 'Motorola',
  'ipad': 'Apple iPad',
};

const CASUAL_WORDS = /\b(bro|hey|yo|so|i|got|received|just|today|added|transferred|sent|moved|send|move|transferred)\b/gi;

function normalize(text) {
  return text.toLowerCase().replace(CASUAL_WORDS, '').replace(/\s+/g, ' ').trim();
}

/** Extract a number from the text. Returns null if none found. */
function extractNumber(text) {
  const m = text.match(/\b(\d+)\b/);
  return m ? parseInt(m[1], 10) : null;
}

/** Detect store code in text (g1/g2/g3) */
function extractStore(text) {
  const m = text.match(/\b(g[123])\b/i);
  return m ? m[1].toUpperCase() : null;
}

/** Detect two stores for transfer: "from g1 to g2" */
function extractTransferStores(text) {
  const m = text.match(/from\s+(g[123])\s+to\s+(g[123])/i);
  if (m) return { from: m[1].toUpperCase(), to: m[2].toUpperCase() };
  return null;
}

/** Detect part type */
function extractType(text) {
  if (/digitizer/i.test(text)) return 'Digitizer';
  if (/lcd|screen|glass display/i.test(text)) return 'LCD';
  return 'LCD'; // default
}

/**
 * Find best matching inventory items.
 * Scores by how many words of the query appear in the model name.
 * Returns sorted array (highest score first).
 */
function findMatches(query, store, type) {
  const words = query.toLowerCase().split(/\s+/).filter(w => w.length > 1);
  return inventory
    .map(item => {
      const modelLow = item.model.toLowerCase();
      let score = words.reduce((s, w) => s + (modelLow.includes(w) ? 1 : 0), 0);
      // bonus for store / type match
      if (store && item.store === store) score += 0.5;
      if (type  && item.type  === type)  score += 0.5;
      return { item, score };
    })
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score);
}

/** Build a model name fragment from text (strip stores/numbers/type words) */
function extractModelFragment(text) {
  return text
    .replace(/\b(g[123])\b/gi, '')
    .replace(/\b(add|remove|subtract|set|to|from|transfer|lcd|digitizer|screen|got|received)\b/gi, '')
    .replace(/\b\d+\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/* ── Command parser ── */
function parseCommand(raw) {
  const text  = normalize(raw);
  const defaultStore = document.getElementById('default-store').value;

  // ── SHOW ──
  if (/^show\b/.test(text)) {
    const fragment = text.replace(/^show\s+/, '').trim();
    searchInput.value = fragment;
    searchQ = fragment;
    searchClear.classList.toggle('visible', fragment.length > 0);
    renderTable();
    return `🔍 Showing results for <em>${escHtml(fragment)}</em>`;
  }

  // ── TRANSFER ──
  if (/\b(transfer|move|send)\b/.test(text)) {
    const stores = extractTransferStores(text);
    if (!stores) {
      // try to infer from a single "from gX" and default
      const fromM = text.match(/from\s+(g[123])/i);
      const toM   = text.match(/to\s+(g[123])/i);
      if (!fromM || !toM) return '❓ I need both stores — try: <em>transfer 2 s21 from g1 to g2</em>';
      stores.from = fromM[1].toUpperCase();
      stores.to   = toM[1].toUpperCase();
    }
    const qty      = extractNumber(text) || 1;
    const partType = extractType(text);
    const fragment = extractModelFragment(text);

    const candidates = findMatches(fragment, stores.from, partType)
      .filter(x => x.item.store === stores.from && x.item.type === partType);

    if (!candidates.length) return `❓ Couldn't find a matching model at <em>${stores.from}</em> for "<em>${escHtml(fragment)}</em>"`;

    const srcItem = candidates[0].item;
    // find or create destination item
    let dstItem = inventory.find(i =>
      i.model === srcItem.model && i.type === srcItem.type &&
      i.store === stores.to     && i.brand === srcItem.brand
    );
    if (!dstItem) {
      dstItem = { ...srcItem, id: uid(), store: stores.to, qty: 0, updatedAt: null };
      inventory.push(dstItem);
    }

    const actualQty = Math.min(qty, srcItem.qty);
    saveChatUndo([
      { id: srcItem.id, oldQty: srcItem.qty },
      { id: dstItem.id, oldQty: dstItem.qty },
    ]);

    srcItem.qty = Math.max(0, srcItem.qty - actualQty);
    dstItem.qty = (dstItem.qty || 0) + actualQty;
    srcItem.updatedAt = dstItem.updatedAt = Date.now();

    const msg = `Transferred ${actualQty}x <em>${srcItem.model}</em> (${partType}) from <em>${stores.from}</em> → <em>${stores.to}</em>`;
    logActivity('edit', msg.replace(/<[^>]+>/g, ''));
    save(); render();
    showChatUndo('Last: ' + msg.replace(/<[^>]+>/g, ''));
    return `✓ ${msg}`;
  }

  // ── SET ──
  if (/\bset\b/.test(text) && /\bto\s+\d+/.test(text)) {
    const setQtyM = text.match(/to\s+(\d+)/);
    const qty     = setQtyM ? parseInt(setQtyM[1], 10) : null;
    if (qty === null) return '❓ Tell me what quantity to set — e.g. <em>set iphone 11 lcd g1 to 7</em>';
    const store    = extractStore(text) || defaultStore;
    const partType = extractType(text);
    const fragment = extractModelFragment(text).replace(/\bto\b.*/,'').trim();

    const candidates = findMatches(fragment, store, partType)
      .filter(x => x.item.store === store && x.item.type === partType);
    if (!candidates.length) return `❓ No match for "<em>${escHtml(fragment)}</em>" at ${store}`;

    const item = candidates[0].item;
    saveChatUndo([{ id: item.id, oldQty: item.qty }]);
    item.qty = qty;
    item.updatedAt = Date.now();
    const msg = `Set <em>${item.model}</em> (${partType}) [${store}] to <em>${qty}</em>`;
    logActivity('edit', msg.replace(/<[^>]+>/g,''));
    save(); render();
    showChatUndo('Last: set qty');
    return `✓ ${msg}`;
  }

  // ── REMOVE ──
  if (/\b(remove|subtract|sold|used|take|took|lost|minus)\b/.test(text)) {
    const qty      = extractNumber(text) || 1;
    const store    = extractStore(text) || defaultStore;
    const partType = extractType(text);
    const fragment = extractModelFragment(text);

    const candidates = findMatches(fragment, store, partType)
      .filter(x => x.item.store === store && x.item.type === partType);
    if (!candidates.length) return `❓ No match for "<em>${escHtml(fragment)}</em>" at ${store} for ${partType}`;

    const item = candidates[0].item;
    saveChatUndo([{ id: item.id, oldQty: item.qty }]);
    item.qty = Math.max(0, item.qty - qty);
    item.updatedAt = Date.now();
    const msg = `Removed ${qty} — <em>${item.model}</em> (${partType}) [${store}] → qty now ${item.qty}`;
    logActivity('edit', msg.replace(/<[^>]+>/g,''));
    save(); render();
    showChatUndo('Last: removed ' + qty);
    return `✓ ${msg}`;
  }

  // ── ADD (default intent) ──
  {
    const qty      = extractNumber(text) || 1;
    const store    = extractStore(text) || defaultStore;
    const partType = extractType(text);
    const fragment = extractModelFragment(text);

    if (!fragment) return '❓ I didn\'t catch that. Try: <em>add 4 iphone 11 lcd to g1</em>';

    const candidates = findMatches(fragment, store, partType)
      .filter(x => x.item.store === store && x.item.type === partType);
    if (!candidates.length) return `❓ No match for "<em>${escHtml(fragment)}</em>" at ${store}. Check spelling or use the Add button.`;

    const item = candidates[0].item;
    saveChatUndo([{ id: item.id, oldQty: item.qty }]);
    item.qty = (item.qty || 0) + qty;
    item.updatedAt = Date.now();
    const msg = `Added ${qty} — <em>${item.model}</em> (${partType}) [${store}] → qty now ${item.qty}`;
    logActivity('add', msg.replace(/<[^>]+>/g,''));
    save(); render();
    showChatUndo('Last: added ' + qty);
    return `✓ ${msg}`;
  }
}

/* ── Chat undo ── */
function saveChatUndo(changes) {
  lastChatAction = changes.map(c => {
    const item = findItem(c.id);
    return { id: c.id, oldQty: c.oldQty, newQty: item ? item.qty : c.oldQty };
  });
}

function showChatUndo(label) {
  const bar = document.getElementById('chat-undo-bar');
  bar.style.display = 'flex';
  document.getElementById('chat-undo-label').textContent = label;
}

function hideChatUndo() {
  document.getElementById('chat-undo-bar').style.display = 'none';
}

document.getElementById('btn-undo').addEventListener('click', () => {
  if (!lastChatAction) return;
  lastChatAction.forEach(({ id, oldQty }) => {
    const item = findItem(id);
    if (item) { item.qty = oldQty; item.updatedAt = Date.now(); }
  });
  logActivity('edit', 'Undid last chatbot action');
  save(); render();
  hideChatUndo();
  lastChatAction = null;
  appendMsg('bot', '↩ Last action undone.');
});

/* ══════════════════════════════════════════════════════
   SECTION 16 — UTILITIES
══════════════════════════════════════════════════════ */

function findItem(id) { return inventory.find(i => i.id === id); }

let toastTimer = null;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
}

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.getElementById('modal-overlay').style.display  = 'none';
    document.getElementById('delete-overlay').style.display = 'none';
    document.getElementById('reset-overlay').style.display  = 'none';
    closeDrawers();
  }
  if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
    e.preventDefault();
    searchInput.focus(); searchInput.select();
  }
});

/* ══════════════════════════════════════════════════════
   SECTION 17 — INIT
══════════════════════════════════════════════════════ */

function initApp() {
  load();
  render();
  renderLog();
}

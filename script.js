/* =============================================
   SCREEN INVENTORY — script.js
   ============================================= */

'use strict';

// ─── DEFAULT DATA ───────────────────────────────────────────────
const DEFAULT_ITEMS = [
  // ── iPhone LCDs ──
  ...[
    'iPhone 6', 'iPhone 6 Plus', 'iPhone 6S', 'iPhone 6S Plus',
    'iPhone 7', 'iPhone 7 Plus',
    'iPhone 8', 'iPhone 8 Plus',
    'iPhone X', 'iPhone XR', 'iPhone XS', 'iPhone XS Max',
    'iPhone 11', 'iPhone 11 Pro', 'iPhone 11 Pro Max',
    'iPhone 12', 'iPhone 12 Mini', 'iPhone 12 Pro', 'iPhone 12 Pro Max',
    'iPhone 13', 'iPhone 13 Mini', 'iPhone 13 Pro', 'iPhone 13 Pro Max',
    'iPhone 14', 'iPhone 14 Plus', 'iPhone 14 Pro', 'iPhone 14 Pro Max',
    'iPhone 15', 'iPhone 15 Plus', 'iPhone 15 Pro', 'iPhone 15 Pro Max',
    'iPhone 16', 'iPhone 16 Plus', 'iPhone 16 Pro', 'iPhone 16 Pro Max',
  ].map(m => makeItem('Apple', m, 'LCD', 'samsung-series', '')),

  // ── Samsung S Series ──
  ...[
    'Galaxy S8', 'Galaxy S8+',
    'Galaxy S9', 'Galaxy S9+',
    'Galaxy S10', 'Galaxy S10+', 'Galaxy S10e', 'Galaxy S10 5G',
    'Galaxy S20', 'Galaxy S20+', 'Galaxy S20 Ultra', 'Galaxy S20 FE',
    'Galaxy S21', 'Galaxy S21+', 'Galaxy S21 Ultra', 'Galaxy S21 FE',
    'Galaxy S22', 'Galaxy S22+', 'Galaxy S22 Ultra',
    'Galaxy S23', 'Galaxy S23+', 'Galaxy S23 Ultra', 'Galaxy S23 FE',
    'Galaxy S24', 'Galaxy S24+', 'Galaxy S24 Ultra',
    'Galaxy S25', 'Galaxy S25+', 'Galaxy S25 Ultra',
  ].map(m => makeItem('Samsung', m, 'LCD', 'S', '')),

  // ── Samsung Note Series ──
  ...[
    'Galaxy Note 8',
    'Galaxy Note 9',
    'Galaxy Note 10', 'Galaxy Note 10+',
    'Galaxy Note 20', 'Galaxy Note 20 Ultra',
  ].map(m => makeItem('Samsung', m, 'LCD', 'Note', '')),

  // ── Samsung A Series ──
  ...[
    'Galaxy A03', 'Galaxy A03s',
    'Galaxy A12', 'Galaxy A13', 'Galaxy A14', 'Galaxy A15',
    'Galaxy A20', 'Galaxy A20s',
    'Galaxy A21', 'Galaxy A21s',
    'Galaxy A23',
    'Galaxy A32', 'Galaxy A32 5G',
    'Galaxy A33',
    'Galaxy A42 5G',
    'Galaxy A50', 'Galaxy A50s',
    'Galaxy A51', 'Galaxy A52', 'Galaxy A52s', 'Galaxy A53', 'Galaxy A54', 'Galaxy A55',
    'Galaxy A71', 'Galaxy A72',
  ].map(m => makeItem('Samsung', m, 'LCD', 'A', '')),

  // ── Motorola ──
  ...[
    'Moto E6', 'Moto E7', 'Moto E7 Power', 'Moto E8',
    'Moto E20', 'Moto E30', 'Moto E40', 'Moto E13', 'Moto E14',
    'Moto G5', 'Moto G5S', 'Moto G5 Plus',
    'Moto G6', 'Moto G6 Play', 'Moto G6 Plus',
    'Moto G7', 'Moto G7 Play', 'Moto G7 Plus', 'Moto G7 Power',
    'Moto G8', 'Moto G8 Play', 'Moto G8 Plus', 'Moto G8 Power',
    'Moto G9', 'Moto G9 Play', 'Moto G9 Plus', 'Moto G9 Power',
    'Moto G10', 'Moto G20', 'Moto G30', 'Moto G40 Fusion',
    'Moto G50', 'Moto G51', 'Moto G52', 'Moto G53', 'Moto G54', 'Moto G62',
    'Moto G71', 'Moto G82', 'Moto G84', 'Moto G85',
    'Moto G Power (2022)', 'Moto G Power (2023)', 'Moto G Power (2024)',
    'Moto G Pure', 'Moto G Stylus (2021)', 'Moto G Stylus (2022)',
    'Moto G Stylus (2023)', 'Moto G Stylus (2024)',
    'Moto G Play (2021)', 'Moto G Play (2023)', 'Moto G Play (2024)',
    'Moto G Fast',
    'Moto Edge', 'Moto Edge+', 'Moto Edge 20', 'Moto Edge 20 Pro',
    'Moto Edge 30', 'Moto Edge 30 Pro', 'Moto Edge 30 Fusion',
    'Moto Edge 40', 'Moto Edge 40 Pro', 'Moto Edge 40 Neo',
    'Moto Edge 50 Pro', 'Moto Edge 50 Fusion', 'Moto Edge 50 Ultra',
    'Moto One', 'Moto One Action', 'Moto One Vision', 'Moto One Fusion',
    'Moto Z3', 'Moto Z4',
  ].map(m => makeItem('Motorola', m, 'LCD', '', '')),

  // ── iPad LCDs ──
  ...[
    'iPad 5th Gen', 'iPad 6th Gen', 'iPad 7th Gen', 'iPad 8th Gen',
    'iPad 9th Gen', 'iPad 10th Gen',
    'iPad Air 2', 'iPad Air 3rd Gen', 'iPad Air 4th Gen', 'iPad Air 5th Gen', 'iPad Air M2', 'iPad Air M3',
    'iPad Mini 4', 'iPad Mini 5th Gen', 'iPad Mini 6th Gen',
    'iPad Pro 9.7"', 'iPad Pro 10.5"', 'iPad Pro 11" 1st Gen',
    'iPad Pro 11" 2nd Gen', 'iPad Pro 11" 3rd Gen', 'iPad Pro 11" 4th Gen',
    'iPad Pro 12.9" 1st Gen', 'iPad Pro 12.9" 2nd Gen', 'iPad Pro 12.9" 3rd Gen',
    'iPad Pro 12.9" 4th Gen', 'iPad Pro 12.9" 5th Gen', 'iPad Pro 12.9" 6th Gen',
  ].map(m => makeItem('Apple iPad', m, 'LCD', '', '')),

  // ── iPad Digitizers ──
  ...[
    'iPad 5th Gen', 'iPad 6th Gen', 'iPad 7th Gen', 'iPad 8th Gen', 'iPad 9th Gen', 'iPad 10th Gen',
    'iPad Air 2', 'iPad Air 3rd Gen', 'iPad Air 4th Gen', 'iPad Air 5th Gen', 'iPad Air M2',
    'iPad Mini 4', 'iPad Mini 5th Gen', 'iPad Mini 6th Gen',
    'iPad Pro 9.7"', 'iPad Pro 10.5"', 'iPad Pro 11" 1st Gen', 'iPad Pro 11" 2nd Gen',
    'iPad Pro 12.9" 1st Gen', 'iPad Pro 12.9" 2nd Gen', 'iPad Pro 12.9" 3rd Gen',
  ].map(m => makeItem('Apple iPad', m, 'Digitizer', '', '')),
];

function makeItem(brand, model, type, samsungSeries, notes) {
  return {
    id: uid(),
    brand,
    model,
    type,
    samsungSeries: brand === 'Samsung' ? samsungSeries : '',
    qty: 0,
    minStock: 2,
    notes,
    updatedAt: null,
  };
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ─── STATE ──────────────────────────────────────────────────────
let inventory = [];
let searchQuery = '';
let activeFilter = '';
let editingId = null;  // null = adding new
let deleteTargetId = null;

// ─── PERSISTENCE ────────────────────────────────────────────────
const STORAGE_KEY = 'Phone_inventory_v1';

function saveData() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(inventory));
  } catch (e) {
    showToast('⚠ Could not save — localStorage unavailable');
  }
}

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      inventory = JSON.parse(raw);
    } else {
      inventory = DEFAULT_ITEMS.map(i => ({ ...i }));
      saveData();
    }
  } catch (e) {
    inventory = DEFAULT_ITEMS.map(i => ({ ...i }));
  }
}

// ─── FILTERING ──────────────────────────────────────────────────
function getFilteredItems() {
  const q = searchQuery.toLowerCase().trim();
  return inventory.filter(item => {
    // search
    if (q) {
      const haystack = `${item.brand} ${item.model} ${item.type} ${item.notes} ${item.samsungSeries}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    // filter
    switch (activeFilter) {
      case '': return true;
      case 'Apple': return item.brand === 'Apple';
      case 'Samsung': return item.brand === 'Samsung';
      case 'Samsung-S': return item.brand === 'Samsung' && item.samsungSeries === 'S';
      case 'Samsung-Note': return item.brand === 'Samsung' && item.samsungSeries === 'Note';
      case 'Samsung-A': return item.brand === 'Samsung' && item.samsungSeries === 'A';
      case 'Motorola': return item.brand === 'Motorola';
      case 'Apple iPad': return item.brand === 'Apple iPad';
      case 'low': return item.qty < item.minStock;
      default: return true;
    }
  });
}

// ─── RENDER ─────────────────────────────────────────────────────
function render() {
  renderSummary();
  renderTable();
}

function renderSummary() {
  const allItems = inventory;

  function sumQty(items) {
    return items.reduce((s, i) => s + (i.qty || 0), 0);
  }
  function lowCount(items) {
    return items.filter(i => i.qty < i.minStock).length;
  }

  const iphone = allItems.filter(i => i.brand === 'Apple');
  const samsung = allItems.filter(i => i.brand === 'Samsung');
  const motorola = allItems.filter(i => i.brand === 'Motorola');
  const ipad = allItems.filter(i => i.brand === 'Apple iPad');

  const groups = [
    { id: 'total', items: allItems },
    { id: 'iphone', items: iphone },
    { id: 'samsung', items: samsung },
    { id: 'motorola', items: motorola },
    { id: 'ipad', items: ipad },
  ];

  groups.forEach(({ id, items }) => {
    const countEl = document.getElementById(`summary-${id}`);
    const lowEl = document.getElementById(`summary-low-${id}`);
    if (countEl) countEl.textContent = sumQty(items);
    const lc = lowCount(items);
    if (lowEl) lowEl.textContent = lc > 0 ? `${lc} low stock` : '';
  });
}

function brandBadgeClass(brand) {
  if (brand === 'Apple') return 'badge-apple';
  if (brand === 'Samsung') return 'badge-samsung';
  if (brand === 'Motorola') return 'badge-motorola';
  if (brand === 'Apple iPad') return 'badge-ipad';
  return 'badge-apple';
}

function brandLabel(brand, samsungSeries) {
  if (brand === 'Apple') return 'iPhone';
  if (brand === 'Samsung') {
    if (samsungSeries === 'S') return 'Samsung S';
    if (samsungSeries === 'Note') return 'Samsung Note';
    if (samsungSeries === 'A') return 'Samsung A';
    return 'Samsung';
  }
  if (brand === 'Motorola') return 'Motorola';
  if (brand === 'Apple iPad') return 'iPad';
  return brand;
}

function formatDate(ts) {
  if (!ts) return '—';
  const d = new Date(ts);
  return `${d.getMonth()+1}/${d.getDate()}/${String(d.getFullYear()).slice(2)}`;
}

function renderTable() {
  const items = getFilteredItems();
  const tbody = document.getElementById('inv-tbody');
  const emptyState = document.getElementById('empty-state');
  const footer = document.getElementById('table-footer');

  if (items.length === 0) {
    tbody.innerHTML = '';
    emptyState.style.display = '';
    footer.textContent = '';
    return;
  }
  emptyState.style.display = 'none';
  footer.textContent = `Showing ${items.length} of ${inventory.length} items`;

  tbody.innerHTML = items.map(item => {
    const isLow = item.qty < item.minStock;
    const bc = brandBadgeClass(item.brand);
    const bl = brandLabel(item.brand, item.samsungSeries);
    const tc = item.type === 'LCD' ? 'type-lcd' : 'type-digitizer';
    const notesDisplay = item.notes
      ? escHtml(item.notes)
      : '<em>—</em>';
    const notesClass = item.notes ? 'notes-text' : 'notes-text empty';

    return `<tr data-id="${item.id}" class="${isLow ? 'low-stock' : ''}">
      <td class="col-brand">
        <span class="brand-badge ${bc}">${bl}</span>
      </td>
      <td class="col-model">
        ${escHtml(item.model)}
        ${isLow ? '<span class="low-tag">LOW</span>' : ''}
      </td>
      <td class="col-type">
        <span class="type-badge ${tc}">${item.type}</span>
      </td>
      <td class="col-qty">
        <div class="qty-control">
          <button class="qty-btn minus" data-action="minus" data-id="${item.id}" title="Decrease">−</button>
          <input class="qty-input" type="number" data-id="${item.id}" value="${item.qty}" min="0" title="Edit quantity" />
          <button class="qty-btn plus" data-action="plus" data-id="${item.id}" title="Increase">+</button>
        </div>
      </td>
      <td class="col-min">
        <span class="min-display" data-id="${item.id}" title="Click to edit min stock">${item.minStock}</span>
      </td>
      <td class="col-notes">
        <span class="${notesClass}" data-id="${item.id}" title="Click to edit notes">${notesDisplay}</span>
      </td>
      <td class="col-updated updated-date">${formatDate(item.updatedAt)}</td>
      <td class="col-actions">
        <div class="row-actions">
          <button class="act-btn edit" data-id="${item.id}" title="Edit item">✎</button>
          <button class="act-btn delete" data-id="${item.id}" title="Delete item">🗑</button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ─── TABLE EVENT DELEGATION ──────────────────────────────────────
document.getElementById('inv-tbody').addEventListener('click', e => {
  const target = e.target;

  // Plus / Minus
  if (target.classList.contains('qty-btn')) {
    const id = target.dataset.id;
    const action = target.dataset.action;
    const item = findItem(id);
    if (!item) return;
    if (action === 'plus') {
      item.qty = (item.qty || 0) + 1;
    } else {
      item.qty = Math.max(0, (item.qty || 0) - 1);
    }
    item.updatedAt = Date.now();
    saveData();
    render();
    return;
  }

  // Edit button
  if (target.classList.contains('edit') || target.closest('.act-btn.edit')) {
    const id = (target.dataset.id || target.closest('.act-btn').dataset.id);
    openEditModal(id);
    return;
  }

  // Delete button
  if (target.classList.contains('delete') || target.closest('.act-btn.delete')) {
    const id = (target.dataset.id || target.closest('.act-btn').dataset.id);
    openDeleteModal(id);
    return;
  }

  // Min stock click to edit
  if (target.classList.contains('min-display')) {
    startInlineEdit(target, 'min');
    return;
  }

  // Notes click to edit
  if (target.classList.contains('notes-text')) {
    startInlineEdit(target, 'notes');
    return;
  }
});

// Qty input change
document.getElementById('inv-tbody').addEventListener('change', e => {
  if (e.target.classList.contains('qty-input')) {
    const id = e.target.dataset.id;
    const item = findItem(id);
    if (!item) return;
    const val = parseInt(e.target.value, 10);
    item.qty = isNaN(val) || val < 0 ? 0 : val;
    item.updatedAt = Date.now();
    saveData();
    render();
  }
});

// ─── INLINE EDITING (min/notes) ─────────────────────────────────
function startInlineEdit(el, field) {
  const id = el.dataset.id;
  const item = findItem(id);
  if (!item) return;

  const input = document.createElement('input');
  if (field === 'min') {
    input.className = 'min-edit';
    input.type = 'number';
    input.min = 0;
    input.value = item.minStock;
  } else {
    input.className = 'notes-input';
    input.type = 'text';
    input.value = item.notes || '';
    input.placeholder = 'Add notes…';
  }

  el.replaceWith(input);
  input.focus();
  input.select();

  function commit() {
    if (field === 'min') {
      const v = parseInt(input.value, 10);
      item.minStock = isNaN(v) || v < 0 ? 0 : v;
    } else {
      item.notes = input.value.trim();
    }
    item.updatedAt = Date.now();
    saveData();
    render();
  }

  input.addEventListener('blur', commit);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') { input.blur(); }
    if (e.key === 'Escape') { render(); }
  });
}

// ─── SEARCH ─────────────────────────────────────────────────────
const searchInput = document.getElementById('search-input');
const searchClear = document.getElementById('search-clear');

searchInput.addEventListener('input', () => {
  searchQuery = searchInput.value;
  searchClear.classList.toggle('visible', searchQuery.length > 0);
  renderTable();
  renderSummary();
});

searchClear.addEventListener('click', () => {
  searchInput.value = '';
  searchQuery = '';
  searchClear.classList.remove('visible');
  searchInput.focus();
  renderTable();
  renderSummary();
});

// ─── FILTER TABS ────────────────────────────────────────────────
document.getElementById('filter-tabs').addEventListener('click', e => {
  const tab = e.target.closest('.tab');
  if (!tab) return;
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  tab.classList.add('active');
  activeFilter = tab.dataset.filter;
  renderTable();
});

// Summary card clicks
document.querySelectorAll('.summary-card.clickable').forEach(card => {
  card.addEventListener('click', () => {
    const filter = card.dataset.brandFilter;
    activeFilter = filter;
    // sync tab
    document.querySelectorAll('.tab').forEach(t => {
      t.classList.toggle('active', t.dataset.filter === filter);
    });
    // if no tab matches, clear active tabs except All
    const hasMatch = [...document.querySelectorAll('.tab')].some(t => t.dataset.filter === filter && t.classList.contains('active'));
    if (!hasMatch) {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      if (filter === '') document.querySelector('.tab[data-filter=""]').classList.add('active');
    }
    renderTable();
  });
});

// ─── MODAL: Add / Edit ───────────────────────────────────────────
const modalOverlay = document.getElementById('modal-overlay');
const fBrand = document.getElementById('f-brand');
const fSamsungSeries = document.getElementById('f-samsung-series');
const fgSubSamsung = document.getElementById('fg-sub-samsung');

fBrand.addEventListener('change', () => {
  fgSubSamsung.style.display = fBrand.value === 'Samsung' ? '' : 'none';
});

document.getElementById('btn-add').addEventListener('click', () => {
  editingId = null;
  document.getElementById('modal-title').textContent = 'Add New Model';
  // reset form
  fBrand.value = 'Apple';
  fSamsungSeries.value = 'S';
  fgSubSamsung.style.display = 'none';
  document.getElementById('f-model').value = '';
  document.getElementById('f-type').value = 'LCD';
  document.getElementById('f-qty').value = 0;
  document.getElementById('f-min').value = 2;
  document.getElementById('f-notes').value = '';
  modalOverlay.style.display = 'flex';
  setTimeout(() => document.getElementById('f-model').focus(), 50);
});

function openEditModal(id) {
  const item = findItem(id);
  if (!item) return;
  editingId = id;
  document.getElementById('modal-title').textContent = 'Edit Item';
  fBrand.value = item.brand;
  fgSubSamsung.style.display = item.brand === 'Samsung' ? '' : 'none';
  fSamsungSeries.value = item.samsungSeries || 'S';
  document.getElementById('f-model').value = item.model;
  document.getElementById('f-type').value = item.type;
  document.getElementById('f-qty').value = item.qty;
  document.getElementById('f-min').value = item.minStock;
  document.getElementById('f-notes').value = item.notes || '';
  modalOverlay.style.display = 'flex';
}

function closeModal() {
  modalOverlay.style.display = 'none';
  editingId = null;
}

document.getElementById('modal-close').addEventListener('click', closeModal);
document.getElementById('modal-cancel').addEventListener('click', closeModal);
modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });

document.getElementById('modal-save').addEventListener('click', () => {
  const brand = fBrand.value.trim();
  const model = document.getElementById('f-model').value.trim();
  const type = document.getElementById('f-type').value;
  const qty = parseInt(document.getElementById('f-qty').value, 10) || 0;
  const minStock = parseInt(document.getElementById('f-min').value, 10) || 0;
  const notes = document.getElementById('f-notes').value.trim();
  const samsungSeries = brand === 'Samsung' ? fSamsungSeries.value : '';

  if (!brand || !model) {
    showToast('⚠ Brand and Model are required');
    return;
  }

  if (editingId) {
    const item = findItem(editingId);
    if (item) {
      Object.assign(item, { brand, model, type, qty, minStock, notes, samsungSeries, updatedAt: Date.now() });
      showToast('✓ Item updated');
    }
  } else {
    inventory.push({
      id: uid(),
      brand,
      model,
      type,
      qty,
      minStock,
      notes,
      samsungSeries,
      updatedAt: Date.now(),
    });
    showToast('✓ Item added');
  }

  saveData();
  closeModal();
  render();
});

// ─── MODAL: Delete ───────────────────────────────────────────────
const deleteOverlay = document.getElementById('delete-overlay');

function openDeleteModal(id) {
  const item = findItem(id);
  if (!item) return;
  deleteTargetId = id;
  document.getElementById('delete-msg').textContent =
    `Delete "${item.model}" (${item.type}) from inventory? This cannot be undone.`;
  deleteOverlay.style.display = 'flex';
}

function closeDeleteModal() {
  deleteOverlay.style.display = 'none';
  deleteTargetId = null;
}

document.getElementById('delete-close').addEventListener('click', closeDeleteModal);
document.getElementById('delete-cancel').addEventListener('click', closeDeleteModal);
deleteOverlay.addEventListener('click', e => { if (e.target === deleteOverlay) closeDeleteModal(); });

document.getElementById('delete-confirm').addEventListener('click', () => {
  if (!deleteTargetId) return;
  inventory = inventory.filter(i => i.id !== deleteTargetId);
  saveData();
  closeDeleteModal();
  render();
  showToast('🗑 Item deleted');
});

// ─── EXPORT CSV ─────────────────────────────────────────────────
document.getElementById('btn-export').addEventListener('click', () => {
  const headers = ['Brand', 'Samsung Series', 'Model', 'Type', 'Quantity', 'Min Stock', 'Notes', 'Last Updated'];
  const rows = inventory.map(item => [
    csvCell(item.brand),
    csvCell(item.samsungSeries || ''),
    csvCell(item.model),
    csvCell(item.type),
    item.qty,
    item.minStock,
    csvCell(item.notes || ''),
    item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : '',
  ]);

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Phone_inventory_${todayStr()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('✓ Exported to CSV');
});

function csvCell(val) {
  const s = String(val);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
}

function pad(n) { return String(n).padStart(2, '0'); }

// ─── IMPORT CSV ─────────────────────────────────────────────────
document.getElementById('btn-import').addEventListener('click', () => {
  document.getElementById('csv-file-input').click();
});

document.getElementById('csv-file-input').addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const rows = parseCSV(ev.target.result);
      if (rows.length < 2) { showToast('⚠ CSV is empty or invalid'); return; }
      const headers = rows[0].map(h => h.trim().toLowerCase());
      const brandIdx = headers.indexOf('brand');
      const seriesIdx = headers.indexOf('samsung series');
      const modelIdx = headers.indexOf('model');
      const typeIdx = headers.indexOf('type');
      const qtyIdx = headers.indexOf('quantity');
      const minIdx = headers.indexOf('min stock');
      const notesIdx = headers.indexOf('notes');

      if (brandIdx < 0 || modelIdx < 0 || typeIdx < 0) {
        showToast('⚠ CSV missing required columns (Brand, Model, Type)');
        return;
      }

      let imported = 0;
      let updated = 0;

      rows.slice(1).forEach(row => {
        if (row.every(c => !c.trim())) return; // skip blank rows
        const brand = row[brandIdx]?.trim() || '';
        const model = row[modelIdx]?.trim() || '';
        const type = row[typeIdx]?.trim() || 'LCD';
        if (!brand || !model) return;

        const qty = parseInt(row[qtyIdx], 10) || 0;
        const minStock = parseInt(row[minIdx], 10) || 2;
        const notes = row[notesIdx]?.trim() || '';
        const samsungSeries = seriesIdx >= 0 ? (row[seriesIdx]?.trim() || '') : '';

        // try to find existing item
        const existing = inventory.find(i =>
          i.brand.toLowerCase() === brand.toLowerCase() &&
          i.model.toLowerCase() === model.toLowerCase() &&
          i.type.toLowerCase() === type.toLowerCase()
        );

        if (existing) {
          existing.qty = qty;
          existing.minStock = minStock;
          existing.notes = notes;
          existing.updatedAt = Date.now();
          updated++;
        } else {
          inventory.push({ id: uid(), brand, model, type, qty, minStock, notes, samsungSeries, updatedAt: Date.now() });
          imported++;
        }
      });

      saveData();
      render();
      showToast(`✓ Imported: ${imported} new, ${updated} updated`);
    } catch (err) {
      showToast('⚠ Failed to parse CSV');
      console.error(err);
    }
    e.target.value = '';
  };
  reader.readAsText(file);
});

function parseCSV(text) {
  const rows = [];
  const lines = text.split(/\r?\n/);
  lines.forEach(line => {
    if (!line.trim()) return;
    const cols = [];
    let inQuote = false;
    let cur = '';
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuote && line[i+1] === '"') { cur += '"'; i++; }
        else { inQuote = !inQuote; }
      } else if (ch === ',' && !inQuote) {
        cols.push(cur); cur = '';
      } else {
        cur += ch;
      }
    }
    cols.push(cur);
    rows.push(cols);
  });
  return rows;
}

// ─── TOAST ───────────────────────────────────────────────────────
let toastTimer = null;
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}

// ─── HELPERS ────────────────────────────────────────────────────
function findItem(id) {
  return inventory.find(i => i.id === id);
}

// ─── KEYBOARD ───────────────────────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (deleteOverlay.style.display !== 'none') closeDeleteModal();
    else if (modalOverlay.style.display !== 'none') closeModal();
  }
  // Ctrl+F or Cmd+F focuses search
  if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
    e.preventDefault();
    searchInput.focus();
    searchInput.select();
  }
});

// ─── INIT ────────────────────────────────────────────────────────
LoatData();
render();

// ══════════════════════════════════════════════════════════════
//  RECORDS.JS — Financial Records Page Logic
//
//  HOW TO CONNECT WITH app.js
//  ─────────────────────────────────────────────────────────────
//  This file depends on the following from app.js (already loaded):
//    • Auth          — getToken(), getRole(), getUser(), headers()
//    • Api           — createRecord(), getRecords(), getRecord(),
//                      updateRecord(), deleteRecord()
//    • Toast         — Toast.success(), Toast.error(), Toast.info()
//    • Permissions   — canCreateUser() is reused here for records
//    • ROLES         — ROLES.ADMIN, ROLES.ANALYST, ROLES.VIEWER
//    • formatDate()  — formats ISO date strings for display
//    • formatCurrency() — formats numbers as $1,000
//    • openModal()   — opens a modal overlay by id
//    • closeModal()  — closes a modal overlay by id
//    • debounce()    — debounce helper for search input
//    • requireAuth() — redirects to login.html if not logged in
//
//
//  LOAD ORDER in records.html:
//    <script src="app.js"></script>      ← MUST be first
//    <script src="records.js"></script>  ← this file second
// ══════════════════════════════════════════════════════════════

// ── RECORD PERMISSIONS ──
// Extends the Permissions object pattern from app.js
const RecordPermissions = {
  canCreate: (role) => role === ROLES.ADMIN,
  canEdit: (role) => role === ROLES.ADMIN,
  canDelete: (role) => role === ROLES.ADMIN,
  canView: (role) => [ROLES.ADMIN, ROLES.ANALYST, ROLES.VIEWER].includes(role),
};

// ── LOOKUP MAPS (populated from DB) ──
let TYPE_MAP = {};
let CATEGORY_MAP = {};
let typesList = [];
let categoriesList = [];

// Helper: get category label by id
function getCategoryLabel(categoryId) {
  return CATEGORY_MAP[categoryId]?.label || `Category ${categoryId}`;
}

// Helper: get type label by id
function getTypeLabel(typeId) {
  return TYPE_MAP[typeId]?.label || `Type ${typeId}`;
}

// Extract list from lookup responses
function extractLookupList(res, key) {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data?.[key])) return res.data[key];
  if (Array.isArray(res[key])) return res[key];
  if (Array.isArray(res.data)) return res.data;
  return [];
}

function buildTypeMap(list) {
  TYPE_MAP = {};
  list.forEach((t) => {
    const label = String(t.name || t.label || t.type || "").trim();
    const norm = label.toLowerCase();
    let badgeClass = "badge-inactive";
    let accent = "var(--text-muted)";
    if (norm.includes("income")) {
      badgeClass = "badge-active";
      accent = "var(--accent-green)";
    } else if (norm.includes("expense")) {
      badgeClass = "badge-error";
      accent = "var(--accent-red)";
    }
    TYPE_MAP[t.id] = {
      label: label || `Type ${t.id}`,
      badgeClass,
      accent,
    };
  });
}

function buildCategoryMap(list) {
  CATEGORY_MAP = {};
  list.forEach((c) => {
    CATEGORY_MAP[c.id] = {
      label: c.name || c.label || `Category ${c.id}`,
      typeId: c.type_id || null,
    };
  });
}

// ── STATE ──
let allRecords = []; // raw records from API
let filteredRecords = []; // after search/filter applied
let currentPage = 1;
const PAGE_SIZE = 10;
let editingRecordId = null; // null = create mode, number = edit mode

// ══════════════════════════════════════════════════════════════
//  LOAD RECORDS
//  Calls GET /api/records/get
//  Response shape: { success: true, data: { records: [...] } }
// ══════════════════════════════════════════════════════════════
async function loadRecords() {
  showTableSkeleton();
  setRecordsError("");

  try {
    const res = await Api.getRecords();
    // Extract array from response: data.records
    allRecords = extractRecordsList(res);
  } catch (err) {
    console.warn("[Records] API unavailable:", err.message);
    Toast.error(err.message || "Failed to load records from server.");
    setRecordsError(err.message || "Failed to load records from server.");
    allRecords = [];
  }

  filteredRecords = [...allRecords];
  currentPage = 1;
  updateSummaryStrip();
  updateTotalCount();
  renderTable();
}

function setRecordsError(message) {
  const el = document.getElementById("records-error");
  if (!el) return;
  if (!message) {
    el.textContent = "";
    el.classList.add("hidden");
    return;
  }
  el.textContent = message;
  el.classList.remove("hidden");
}

// ── EXTRACT LIST ──
// Safely pulls the records array from the API response regardless of nesting
function extractRecordsList(res) {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data?.records)) return res.data.records;
  if (Array.isArray(res.records)) return res.records;
  if (Array.isArray(res.data)) return res.data;
  return [];
}

// ══════════════════════════════════════════════════════════════
//  RENDER TABLE
//  Reads from filteredRecords + currentPage
// ══════════════════════════════════════════════════════════════
function renderTable() {
  const tbody = document.getElementById("records-table-body");
  if (!tbody) return;

  const role = Auth.getRole();
  const start = (currentPage - 1) * PAGE_SIZE;
  const slice = filteredRecords.slice(start, start + PAGE_SIZE);

  if (slice.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7">
          <div class="empty-state">
            <div class="empty-icon">🗂</div>
            <div class="empty-title">No records found</div>
            <div class="empty-desc">Try adjusting your search or filters.</div>
          </div>
        </td>
      </tr>`;
    renderPagination();
    return;
  }

  tbody.innerHTML = slice
    .map((rec, idx) => {
      const globalIdx = start + idx + 1;
      const typeInfo = TYPE_MAP[rec.type_id] || {
        label: "—",
        badgeClass: "badge-inactive",
      };
      const catLabel = getCategoryLabel(rec.category_id);
      const amountFmt = formatCurrency(rec.amount);
      const dateFmt = formatDate(rec.record_date);
      const desc = rec.description
        ? escapeHtml(rec.description)
        : '<span style="color:var(--text-muted)">—</span>';

      // Action buttons — only shown to ADMIN
      const actions = RecordPermissions.canEdit(role)
        ? `
      <div class="action-btns">
        <button
          class="icon-btn edit"
          title="Edit record"
          onclick="openEditRecordModal(${rec.id})"
        >✎</button>
        <button
          class="icon-btn delete"
          title="Delete record"
          onclick="openDeleteConfirm(${rec.id})"
        >✕</button>
      </div>`
        : '<span style="color:var(--text-muted);font-size:11px">—</span>';

      return `
      <tr>
        <td style="color:var(--text-muted);font-size:11px">${globalIdx}</td>
        <td style="white-space:nowrap">${dateFmt}</td>
        <td>
          <span class="badge ${typeInfo.badgeClass}">${typeInfo.label}</span>
        </td>
        <td>${escapeHtml(catLabel)}</td>
        <td style="font-weight:600;color:${typeInfo.accent}">${amountFmt}</td>
        <td style="max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap"
            title="${rec.description || ""}">${desc}</td>
        <td>${actions}</td>
      </tr>`;
    })
    .join("");

  renderPagination();
}

// ── SKELETON ROWS while loading ──
function showTableSkeleton() {
  const tbody = document.getElementById("records-table-body");
  if (!tbody) return;
  tbody.innerHTML = Array(5)
    .fill(
      `
    <tr>
      ${Array(7).fill('<td><div class="skeleton" style="height:14px;width:75%">&nbsp;</div></td>').join("")}
    </tr>`,
    )
    .join("");
}

// ══════════════════════════════════════════════════════════════
//  SUMMARY STRIP
//  Calculates income / expense / net from the filtered list
// ══════════════════════════════════════════════════════════════
function updateSummaryStrip() {
  let totalIncome = 0;
  let totalExpense = 0;

  allRecords.forEach((rec) => {
    const amt = parseFloat(rec.amount) || 0;
    if (rec.type_id === 1) totalIncome += amt;
    if (rec.type_id === 2) totalExpense += amt;
  });

  const net = totalIncome - totalExpense;

  const setEl = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  setEl("strip-income", formatCurrency(totalIncome));
  setEl("strip-expense", formatCurrency(totalExpense));
  setEl("strip-net", formatCurrency(net));
  setEl("strip-count", allRecords.length.toString());

  // Colour the net value
  const netEl = document.getElementById("strip-net");
  if (netEl) {
    netEl.className = `stat-value ${net >= 0 ? "stat-positive" : "stat-negative"}`;
  }
}

// ── TOTAL COUNT label ──
function updateTotalCount() {
  const el = document.getElementById("records-total-count");
  if (el) el.textContent = `${allRecords.length} total records`;
}

// ══════════════════════════════════════════════════════════════
//  PAGINATION
// ══════════════════════════════════════════════════════════════
function renderPagination() {
  const total = filteredRecords.length;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const infoEl = document.getElementById("records-pagination-info");
  const ctrlEl = document.getElementById("records-pagination-controls");

  if (infoEl) {
    const start = Math.min((currentPage - 1) * PAGE_SIZE + 1, total);
    const end = Math.min(currentPage * PAGE_SIZE, total);
    infoEl.textContent = total
      ? `Showing ${start}–${end} of ${total} records`
      : "No records";
  }

  if (!ctrlEl) return;

  let html = `
    <button class="page-btn"
      onclick="changePage(${currentPage - 1})"
      ${currentPage === 1 ? "disabled" : ""}>‹</button>`;

  for (let i = 1; i <= totalPages; i++) {
    if (
      totalPages > 7 &&
      Math.abs(i - currentPage) > 2 &&
      i !== 1 &&
      i !== totalPages
    ) {
      if (i === currentPage - 3 || i === currentPage + 3) {
        html += `<span style="color:var(--text-muted);padding:0 4px">…</span>`;
      }
      continue;
    }
    html += `
      <button class="page-btn ${i === currentPage ? "active" : ""}"
        onclick="changePage(${i})">${i}</button>`;
  }

  html += `
    <button class="page-btn"
      onclick="changePage(${currentPage + 1})"
      ${currentPage === totalPages || totalPages === 0 ? "disabled" : ""}>›</button>`;

  ctrlEl.innerHTML = html;
}

function changePage(page) {
  const totalPages = Math.ceil(filteredRecords.length / PAGE_SIZE);
  if (page < 1 || page > totalPages) return;
  currentPage = page;
  renderTable();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ── LOOKUP LOADERS ──
async function loadLookups() {
  try {
    const [typesRes, categoriesRes] = await Promise.all([
      Api.getTypes(),
      Api.getCategories(),
    ]);

    typesList = extractLookupList(typesRes, "types");
    categoriesList = extractLookupList(categoriesRes, "categories");

    buildTypeMap(typesList);
    buildCategoryMap(categoriesList);

    populateTypeDropdown(document.getElementById("filter-type"));
    populateTypeDropdown(document.getElementById("input-type"));
    populateCategoryDropdown(document.getElementById("filter-category"));
    populateCategoryDropdown(document.getElementById("input-category"));
  } catch (err) {
    Toast.error(err.message || "Failed to load types/categories.");
    typesList = [];
    categoriesList = [];
    TYPE_MAP = {};
    CATEGORY_MAP = {};
  }
}

// ══════════════════════════════════════════════════════════════
//  SEARCH & FILTERS
//  All filtering happens client-side on allRecords[]
// ══════════════════════════════════════════════════════════════
function initFilters() {
  const searchInput = document.getElementById("record-search");
  const typeFilter = document.getElementById("filter-type");
  const catFilter = document.getElementById("filter-category");
  const startFilter = document.getElementById("filter-start-date");
  const endFilter = document.getElementById("filter-end-date");
  const resetBtn = document.getElementById("reset-filters-btn");

  const applyFilters = debounce(() => {
    const search = (searchInput?.value || "").toLowerCase().trim();
    const typeId = typeFilter?.value ? parseInt(typeFilter.value) : null;
    const catId = catFilter?.value ? parseInt(catFilter.value) : null;
    const startDate = startFilter?.value || null;
    const endDate = endFilter?.value || null;

    filteredRecords = allRecords.filter((rec) => {
      // Search in description
      const matchSearch =
        !search ||
        (rec.description || "").toLowerCase().includes(search) ||
        getCategoryLabel(rec.category_id).toLowerCase().includes(search);

      // Type filter (type_id: 1=income, 2=expense)
      const matchType = typeId === null || rec.type_id === typeId;

      // Category filter
      const matchCat = catId === null || rec.category_id === catId;

      // Date range
      const recDate = rec.record_date?.slice(0, 10) || "";
      const matchStart = !startDate || recDate >= startDate;
      const matchEnd = !endDate || recDate <= endDate;

      return matchSearch && matchType && matchCat && matchStart && matchEnd;
    });

    currentPage = 1;
    renderTable();
  }, 200);

  searchInput?.addEventListener("input", applyFilters);
  typeFilter?.addEventListener("change", applyFilters);
  catFilter?.addEventListener("change", applyFilters);
  startFilter?.addEventListener("change", applyFilters);
  endFilter?.addEventListener("change", applyFilters);

  resetBtn?.addEventListener("click", () => {
    if (searchInput) searchInput.value = "";
    if (typeFilter) typeFilter.value = "";
    if (catFilter) catFilter.value = "";
    if (startFilter) startFilter.value = "";
    if (endFilter) endFilter.value = "";
    filteredRecords = [...allRecords];
    currentPage = 1;
    renderTable();
  });
}

// Fills a <select> element with all types
function populateTypeDropdown(selectEl) {
  if (!selectEl) return;
  while (selectEl.options.length > 1) selectEl.remove(1);

  typesList.forEach((t) => {
    const opt = document.createElement("option");
    opt.value = t.id;
    opt.textContent = t.name || t.label || `Type ${t.id}`;
    selectEl.appendChild(opt);
  });
}

// Fills a <select> element with all categories
function populateCategoryDropdown(selectEl) {
  if (!selectEl) return;
  // Keep the first default option, remove rest
  while (selectEl.options.length > 1) selectEl.remove(1);

  categoriesList.forEach((cat) => {
    const opt = document.createElement("option");
    opt.value = cat.id;
    opt.textContent = cat.name || cat.label || `Category ${cat.id}`;
    selectEl.appendChild(opt);
  });
}

// ══════════════════════════════════════════════════════════════
//  CREATE RECORD MODAL
//  Opens when "+ Add Record" is clicked
//  Sends POST /api/records
//
//  Request body:
//    { user_id, amount, type_id, category_id, record_date, description }
//
//  Response:
//    { success: true, message: "Record added successfully",
//      data: { records: { id, user_id, amount, type_id, category_id,
//                         record_date, description } } }
// ══════════════════════════════════════════════════════════════
function initCreateRecordBtn() {
  const role = Auth.getRole();
  const createBtn = document.getElementById("create-record-btn");

  if (!RecordPermissions.canCreate(role)) {
    // Hide the button entirely for non-admins
    createBtn?.classList.add("hidden");
    return;
  }

  createBtn?.addEventListener("click", () => {
    editingRecordId = null;
    resetRecordForm();
    document.getElementById("record-modal-title").textContent = "Add Record";
    document.getElementById("record-submit-btn").textContent = "Save Record";
    // Default date to today
    document.getElementById("input-date").value = todayISO();
    openModal("record-modal");
  });
}

function initRecordFormSubmit() {
  const form = document.getElementById("record-form");
  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    await handleRecordFormSubmit();
  });
}

// ── FORM SUBMIT HANDLER ──
// Handles both CREATE and EDIT depending on editingRecordId
async function handleRecordFormSubmit() {
  clearFormError();

  const submitBtn = document.getElementById("record-submit-btn");
  const user = Auth.getUser();

  // Read form values
  const amount = parseFloat(document.getElementById("input-amount").value);
  const type_id = parseInt(document.getElementById("input-type").value);
  const category_id = parseInt(document.getElementById("input-category").value);
  const record_date = document.getElementById("input-date").value;
  const description = document.getElementById("input-description").value.trim();

  // Client-side validation
  if (!amount || amount <= 0) {
    return showFormError("Amount must be greater than 0.");
  }
  if (!type_id) {
    return showFormError("Please select a type (Income or Expense).");
  }
  if (!category_id) {
    return showFormError("Please select a category.");
  }
  if (!record_date) {
    return showFormError("Please select a record date.");
  }
  if (!editingRecordId && !user?.id) {
    return showFormError("User session is missing. Please login again.");
  }

  // Disable button + show loading state
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="loading-spinner"></span> Saving…';

  try {
    if (editingRecordId) {
      // ── UPDATE ──
      // PUT /api/records/update/:id
      // Request: { amount, type_id, category_id, record_date, description }
      const payload = {
        amount,
        type_id,
        category_id,
        record_date,
        description,
      };
      const res = await Api.updateRecord(editingRecordId, payload);

      // Extract updated record from response
      const updated = res?.data?.records || payload;

      // Update in local state
      const idx = allRecords.findIndex((r) => r.id === editingRecordId);
      if (idx !== -1) {
        allRecords[idx] = {
          ...allRecords[idx],
          amount: updated.amount || amount.toFixed(2),
          type_id: updated.type_id || type_id,
          category_id: updated.category_id || category_id,
          record_date: updated.record_date || record_date,
          description: updated.description ?? description,
        };
      }

      Toast.success("Record updated successfully");
    } else {
      // ── CREATE ──
      // POST /api/records
      // Request: { user_id, amount, type_id, category_id, record_date, description }
      const payload = {
        user_id: user.id || 1,
        amount,
        type_id,
        category_id,
        record_date,
        description,
      };

      const res = await Api.createRecord(payload);

      // Extract new record from response: res.data.records
      const created = res?.data?.records || { id: Date.now(), ...payload };

      // Prepend to local state so it shows at top
      allRecords.unshift({
        ...created,
        amount: String(parseFloat(created.amount || amount).toFixed(2)),
      });

      Toast.success("Record added successfully");
    }

    // Sync filtered list + re-render
    filteredRecords = [...allRecords];
    currentPage = 1;
    updateSummaryStrip();
    updateTotalCount();
    renderTable();
    closeModal("record-modal");
    resetRecordForm();
  } catch (err) {
    showFormError(err.message || "Failed to save record. Please try again.");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = editingRecordId ? "Update Record" : "Save Record";
  }
}

// ══════════════════════════════════════════════════════════════
//  EDIT RECORD
//  Called by ✎ button in table row: openEditRecordModal(id)
//  Fetches GET /api/records/get/:id to pre-fill the form
//
//  Response:
//    { success: true, data: { records: { id, user_id, amount,
//      type_id, category_id, record_date, description } } }
// ══════════════════════════════════════════════════════════════
async function openEditRecordModal(id) {
  editingRecordId = id;

  // Try API first, fall back to local state
  let record;
  try {
    const res = await Api.getRecord(id);
    record = res?.data?.records || res?.records || res;
  } catch {
    record = allRecords.find((r) => r.id === id);
  }

  if (!record) {
    Toast.error("Could not load record details.");
    return;
  }

  // Pre-fill form
  document.getElementById("input-amount").value =
    parseFloat(record.amount) || "";
  document.getElementById("input-type").value = record.type_id || "";
  document.getElementById("input-category").value = record.category_id || "";
  document.getElementById("input-date").value =
    record.record_date?.slice(0, 10) || "";
  document.getElementById("input-description").value = record.description || "";

  document.getElementById("record-modal-title").textContent = "Edit Record";
  document.getElementById("record-submit-btn").textContent = "Update Record";

  clearFormError();
  openModal("record-modal");
}

// ══════════════════════════════════════════════════════════════
//  DELETE RECORD
//  Called by ✕ button in table row: openDeleteConfirm(id)
//  Shows a confirmation modal with a record preview,
//  then calls DELETE /api/records/delete/:id on confirm
//
//  Response:
//    { success: true, message: "Record deleted Successfully",
//      data: { records: { id, user_id, amount, type_id,
//                         category_id, record_date, description } } }
// ══════════════════════════════════════════════════════════════
function openDeleteConfirm(id) {
  const record = allRecords.find((r) => r.id === id);
  if (!record) return;

  // Show record details in the confirm modal
  const preview = document.getElementById("delete-record-preview");
  if (preview) {
    preview.innerHTML = `
      <div><span style="color:var(--text-muted)">Amount</span>
           &nbsp;&nbsp;&nbsp;${formatCurrency(record.amount)}</div>
      <div><span style="color:var(--text-muted)">Type</span>
           &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${getTypeLabel(record.type_id)}</div>
      <div><span style="color:var(--text-muted)">Category</span>
           &nbsp;&nbsp;${getCategoryLabel(record.category_id)}</div>
      <div><span style="color:var(--text-muted)">Date</span>
           &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${formatDate(record.record_date)}</div>
      ${
        record.description
          ? `<div><span style="color:var(--text-muted)">Note</span>
                 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${escapeHtml(record.description)}</div>`
          : ""
      }
    `;
  }

  // Attach confirm handler
  const confirmBtn = document.getElementById("delete-record-confirm-btn");
  // Remove old listener to avoid stacking
  const newBtn = confirmBtn.cloneNode(true);
  confirmBtn.parentNode.replaceChild(newBtn, confirmBtn);

  newBtn.addEventListener("click", async () => {
    newBtn.disabled = true;
    newBtn.innerHTML = '<span class="loading-spinner"></span>';

    try {
      await Api.deleteRecord(id);

      // Remove from local state
      allRecords = allRecords.filter((r) => r.id !== id);
      filteredRecords = filteredRecords.filter((r) => r.id !== id);

      closeModal("delete-record-modal");
      updateSummaryStrip();
      updateTotalCount();
      renderTable();
      Toast.success("Record deleted successfully");
    } catch (err) {
      Toast.error(err.message || "Failed to delete record.");
      newBtn.disabled = false;
      newBtn.textContent = "Delete";
    }
  });

  openModal("delete-record-modal");
}

// ══════════════════════════════════════════════════════════════
//  UTILITY HELPERS
// ══════════════════════════════════════════════════════════════

// Returns today's date as YYYY-MM-DD
function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

// Reset the record form to blank state
function resetRecordForm() {
  document.getElementById("record-form")?.reset();
  clearFormError();
  editingRecordId = null;
}

// Show an error inside the modal form
function showFormError(msg) {
  const el = document.getElementById("record-form-error");
  if (el) {
    el.textContent = msg;
    el.style.display = "block";
  }
}

function clearFormError() {
  const el = document.getElementById("record-form-error");
  if (el) {
    el.textContent = "";
    el.style.display = "none";
  }
}

// Escape HTML to prevent XSS from description text
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ══════════════════════════════════════════════════════════════
//  CONNECT DASHBOARD "VIEW RECORDS" BUTTON
//
//  In your index.html (dashboard), add this button wherever you
//  want to navigate to the Records page:
//
//    <a href="records.html" class="btn btn-primary">View Records →</a>
//
//  OR if you have a button with id="goto-records-btn":
//    This block wires it up automatically.
// ══════════════════════════════════════════════════════════════
function wireDashboardRecordsButton() {
  const btn = document.getElementById("goto-records-btn");
  if (btn)
    btn.addEventListener("click", () => {
      window.location.href = "records.html";
    });
}

// ══════════════════════════════════════════════════════════════
//  PAGE INIT
//  Entry point — runs on DOMContentLoaded
// ══════════════════════════════════════════════════════════════
async function initRecordsPage() {
  // 1. Check login — redirects to login.html if not authenticated
  if (!requireAuth()) return;

  // 2. Check role — VIEWER cannot access Records page
  const role = Auth.getRole();
  if (role === ROLES.VIEWER) {
    requireRole([ROLES.ADMIN, ROLES.ANALYST]);
    return;
  }

  // 3. Set up UI components
  await loadLookups(); // types + categories from DB
  initFilters(); // search + filter inputs
  initCreateRecordBtn(); // "+ Add Record" button (hidden for non-ADMIN)
  initRecordFormSubmit(); // form submit handler
  wireDashboardRecordsButton(); // in case called from dashboard context

  // 4. Load records from API
  await loadRecords();
}

// Run on page load
document.addEventListener("DOMContentLoaded", initRecordsPage);

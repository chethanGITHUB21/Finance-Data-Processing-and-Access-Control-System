// Ã¢â€â‚¬Ã¢â€â‚¬ USERS.JS Ã¢â‚¬â€ Users Page Logic Ã¢â€â‚¬Ã¢â€â‚¬

let allUsers = [];
let filteredUsers = [];
let currentPage = 1;
const PAGE_SIZE = 8;
let editingUserId = null;

// Ã¢â€â‚¬Ã¢â€â‚¬ LOAD USERS Ã¢â€â‚¬Ã¢â€â‚¬
async function loadUsers() {
  const tableBody = document.getElementById("users-table-body");
  if (!tableBody) return;

  const role = Auth.getRole();
  const showActions =
    Permissions.canEditUser(role) || Permissions.canDeleteUser(role);
  const skeletonCols = showActions ? 7 : 6;

  // Show skeleton
  tableBody.innerHTML = Array(4)
    .fill(
      `
    <tr>${Array(skeletonCols).fill('<td><div class="skeleton" style="height:16px;width:80%">&nbsp;</div></td>').join("")}</tr>
  `,
    )
    .join("");

  try {
    const res = await Api.getUsers();
    allUsers = Array.isArray(res)
      ? res
      : res.data?.data || res.data || res.users || [];
  } catch (err) {
    allUsers = [];
    Toast.error(err.message || "Failed to load users");
  }

  filteredUsers = [...allUsers];
  currentPage = 1;
  updateUserCount();
  renderUsersTable();
}

// Ã¢â€â‚¬Ã¢â€â‚¬ RENDER TABLE Ã¢â€â‚¬Ã¢â€â‚¬
function renderUsersTable() {
  const tableBody = document.getElementById("users-table-body");
  if (!tableBody) return;

  const role = Auth.getRole();
  const showActions =
    Permissions.canEditUser(role) || Permissions.canDeleteUser(role);
  const colspan = showActions ? 7 : 6;
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageData = filteredUsers.slice(start, start + PAGE_SIZE);

  if (pageData.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="${colspan}">
          <div class="empty-state">
            <div class="empty-icon">Ã°Å¸â€˜Â¤</div>
            <div class="empty-title">No users found</div>
            <div class="empty-desc">Try adjusting your search or filters.</div>
          </div>
        </td>
      </tr>
    `;
    renderPagination();
    return;
  }

  tableBody.innerHTML = pageData
    .map((u, idx) => {
      const globalIdx = start + idx + 1;
      const canEdit = Permissions.canEditUser(role);
      const canDelete = Permissions.canDeleteUser(role);

      const actions =
        canEdit || canDelete
          ? `
      <div class="action-btns">
        ${canEdit ? `<button class="icon-btn edit" title="Edit" onclick="openEditModal(${u.id})">Edit</button>` : ""}
        ${canDelete ? `<button class="icon-btn delete" title="Delete" onclick="confirmDeleteUser(${u.id}, '${escapeHtml(u.username || "")}')">Delete</button>` : ""}
      </div>
    `
          : '<span style="color:var(--text-muted);font-size:11px">Ã¢â‚¬â€</span>';

      return `
      <tr>
        <td style="color:var(--text-muted);font-size:11px">#${globalIdx}</td>
        <td>
          <div style="display:flex;align-items:center;gap:10px">
            <div style="width:30px;height:30px;border-radius:50%;background:var(--accent-glow);border:1px solid var(--border-bright);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:var(--accent)">
              ${(u.username || "?").charAt(0).toUpperCase()}
            </div>
            <span>${escapeHtml(u.username || "Ã¢â‚¬â€")}</span>
          </div>
        </td>
        <td>${escapeHtml(u.email || "Ã¢â‚¬â€")}</td>
        <td><span class="badge badge-${(u.role || "").toLowerCase()}">${u.role || "Ã¢â‚¬â€"}</span></td>
        <td><span class="badge badge-${u.status ? (u.status === "active" ? "active" : "inactive") : "neutral"}">${u.status || "â€”"}</span></td>
        <td>${formatDate(u.created_at || u.createdAt)}</td>
        ${showActions ? `<td>${actions}</td>` : ""}
      </tr>
    `;
    })
    .join("");

  renderPagination();
}

// Ã¢â€â‚¬Ã¢â€â‚¬ PAGINATION Ã¢â€â‚¬Ã¢â€â‚¬
function renderPagination() {
  const totalPages = Math.ceil(filteredUsers.length / PAGE_SIZE);
  const infoEl = document.getElementById("pagination-info");
  const controlsEl = document.getElementById("pagination-controls");

  if (infoEl) {
    const start = Math.min(
      (currentPage - 1) * PAGE_SIZE + 1,
      filteredUsers.length,
    );
    const end = Math.min(currentPage * PAGE_SIZE, filteredUsers.length);
    infoEl.textContent = filteredUsers.length
      ? `Showing ${start}-${end} of ${filteredUsers.length} users`
      : "No users";
  }

  if (!controlsEl) return;

  let html = `<button class="page-btn" onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? "disabled" : ""}><</button>`;

  for (let i = 1; i <= totalPages; i++) {
    if (
      totalPages > 7 &&
      Math.abs(i - currentPage) > 2 &&
      i !== 1 &&
      i !== totalPages
    ) {
      if (i === currentPage - 3 || i === currentPage + 3)
        html += `<span style="color:var(--text-muted);padding:0 4px">...</span>`;
      continue;
    }
    html += `<button class="page-btn ${i === currentPage ? "active" : ""}" onclick="changePage(${i})">${i}</button>`;
  }

  html += `<button class="page-btn" onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? "disabled" : ""}>></button>`;
  controlsEl.innerHTML = html;
}

function changePage(page) {
  const totalPages = Math.ceil(filteredUsers.length / PAGE_SIZE);
  if (page < 1 || page > totalPages) return;
  currentPage = page;
  renderUsersTable();
}

function updateUserCount() {
  const el = document.getElementById("user-total-count");
  if (el) el.textContent = `${allUsers.length} total`;
}

// Ã¢â€â‚¬Ã¢â€â‚¬ SEARCH + FILTER Ã¢â€â‚¬Ã¢â€â‚¬
function initFilters() {
  const searchInput = document.getElementById("user-search");
  const roleFilter = document.getElementById("user-role-filter");
  const statusFilter = document.getElementById("user-status-filter");

  const applyFilters = debounce(() => {
    const search = (searchInput?.value || "").toLowerCase();
    const role = roleFilter?.value || "";
    const status = statusFilter?.value || "";

    filteredUsers = allUsers.filter((u) => {
      const matchSearch =
        !search ||
        (u.username || "").toLowerCase().includes(search) ||
        (u.email || "").toLowerCase().includes(search);
      const matchRole = !role || u.role === role;
      const matchStatus = !status || u.status === status;
      return matchSearch && matchRole && matchStatus;
    });

    currentPage = 1;
    renderUsersTable();
  }, 200);

  searchInput?.addEventListener("input", applyFilters);
  roleFilter?.addEventListener("change", applyFilters);
  statusFilter?.addEventListener("change", applyFilters);
}

// Ã¢â€â‚¬Ã¢â€â‚¬ CREATE USER MODAL Ã¢â€â‚¬Ã¢â€â‚¬
function initCreateUserModal() {
  const role = Auth.getRole();
  const openBtn = document.getElementById("create-user-btn");

  if (!Permissions.canCreateUser(role)) {
    openBtn?.classList.add("hidden");
    return;
  }

  openBtn?.addEventListener("click", () => {
    editingUserId = null;
    document.getElementById("user-modal-title").textContent = "Create User";
    document.getElementById("user-form").reset();
    document.getElementById("user-password-group").style.display = "block";
    openModal("user-modal");
  });

  const form = document.getElementById("user-form");
  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    await handleUserSubmit();
  });
}

async function handleUserSubmit() {
  const submitBtn = document.getElementById("user-submit-btn");
  const originalText = submitBtn?.textContent;
  setUserFormError("");

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="loading-spinner"></span> Saving...';
  }

  const formData = {
    username: document.getElementById("user-name-input")?.value.trim(),
    email: document.getElementById("user-email-input")?.value.trim(),
    role: document.getElementById("user-role-input")?.value,
    status: document.getElementById("user-status-input")?.value,
  };

  const password = document.getElementById("user-password-input")?.value;
  if (password) formData.password = password;

  try {
    if (editingUserId) {
      await Api.updateUser(editingUserId, formData);
      Toast.success("User updated successfully");
      await loadUsers();
    } else {
      await Api.createUser(formData);
      Toast.success("User created successfully");
      await loadUsers();
    }

    closeModal("user-modal");
    currentPage = 1;
    updateUserCount();
    renderUsersTable();
  } catch (err) {
    setUserFormError(err.message || "Failed to save user");
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  }
}

// Ã¢â€â‚¬Ã¢â€â‚¬ EDIT USER Ã¢â€â‚¬Ã¢â€â‚¬
function openEditModal(id) {
  const user = allUsers.find((u) => u.id === id);
  if (!user) return;

  editingUserId = id;
  document.getElementById("user-modal-title").textContent = "Edit User";
  document.getElementById("user-name-input").value = user.username || "";
  document.getElementById("user-email-input").value = user.email || "";
  document.getElementById("user-role-input").value = user.role || "VIEWER";
  document.getElementById("user-status-input").value = user.status || "active";
  document.getElementById("user-password-group").style.display = "none";
  openModal("user-modal");
}

// Ã¢â€â‚¬Ã¢â€â‚¬ DELETE USER Ã¢â€â‚¬Ã¢â€â‚¬
function confirmDeleteUser(id, name) {
  const overlay = document.getElementById("delete-confirm-modal");
  if (!overlay) return;

  document.getElementById("delete-user-name").textContent = name;

  const confirmBtn = document.getElementById("delete-confirm-btn");
  confirmBtn.onclick = async () => {
    confirmBtn.disabled = true;
    confirmBtn.innerHTML = '<span class="loading-spinner"></span>';
    try {
      await Api.deleteUser(id);
      allUsers = allUsers.filter((u) => u.id !== id);
      filteredUsers = filteredUsers.filter((u) => u.id !== id);
      closeModal("delete-confirm-modal");
      updateUserCount();
      renderUsersTable();
      Toast.success("User deleted");
    } catch (err) {
      Toast.error("Failed to delete user");
    } finally {
      confirmBtn.disabled = false;
      confirmBtn.textContent = "Delete";
    }
  };

  openModal("delete-confirm-modal");
}

// Ã¢â€â‚¬Ã¢â€â‚¬ UTILS Ã¢â€â‚¬Ã¢â€â‚¬
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function setUserFormError(message) {
  const el = document.getElementById("user-form-error");
  if (!el) return;
  if (!message) {
    el.textContent = "";
    el.classList.add("hidden");
    return;
  }
  el.textContent = message;
  el.classList.remove("hidden");
}

// Ã¢â€â‚¬Ã¢â€â‚¬ INIT Ã¢â€â‚¬Ã¢â€â‚¬
async function initUsersPage() {
  if (!requireAuth()) return;

  const role = Auth.getRole();

  if (!Permissions.canViewUsers(role)) {
    requireRole([ROLES.ADMIN, ROLES.ANALYST]);
    return;
  }

  if (!Permissions.canEditUser(role) && !Permissions.canDeleteUser(role)) {
    const actionsHeader = document.querySelector("thead th:last-child");
    if (actionsHeader && actionsHeader.textContent.trim() === "Actions") {
      actionsHeader.remove();
    }
  }

  initFilters();
  initCreateUserModal();
  await loadUsers();
}

document.addEventListener("DOMContentLoaded", initUsersPage);

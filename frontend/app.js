// ── APP.JS — Common Logic, Auth, Role Controls ──

const API_BASE = "http://localhost:3001"; // Set to your backend base URL e.g. 'http://localhost:3000'

// ── AUTH HELPERS ──
const Auth = {
  getToken: () => localStorage.getItem("jwt_token"),
  getRole: () => localStorage.getItem("user_role"),
  getUser: () => {
    try {
      return JSON.parse(localStorage.getItem("user_data") || "{}");
    } catch {
      return {};
    }
  },
  isLoggedIn: () => !!localStorage.getItem("jwt_token"),

  save(token, role, userData) {
    localStorage.setItem("jwt_token", token);
    localStorage.setItem("user_role", role);
    localStorage.setItem("user_data", JSON.stringify(userData));
  },

  clear() {
    localStorage.removeItem("jwt_token");
    localStorage.removeItem("user_role");
    localStorage.removeItem("user_data");
  },

  headers() {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.getToken()}`,
    };
  },
};

// ── ROLE CONSTANTS ──
const ROLES = { ADMIN: "ADMIN", ANALYST: "ANALYST", VIEWER: "VIEWER" };

// ── ROLE PERMISSIONS ──
const Permissions = {
  canViewUsers: (role) => role === ROLES.ADMIN || role === ROLES.ANALYST,
  canCreateUser: (role) => role === ROLES.ADMIN,
  canEditUser: (role) => role === ROLES.ADMIN,
  canDeleteUser: (role) => role === ROLES.ADMIN,
  canInteractCharts: (role) => role === ROLES.ADMIN || role === ROLES.ANALYST,
};

// ── API CLIENT ──
const Api = {
  async request(method, endpoint, body = null) {
    const opts = {
      method,
      headers: Auth.headers(),
    };
    if (body) opts.body = JSON.stringify(body);

    const res = await fetch(`${API_BASE}${endpoint}`, opts);

    if (res.status === 401 && !endpoint.startsWith("/api/auth/")) {
      Auth.clear();
      window.location.href = "login.html";
      return null;
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: "Request failed" }));
      throw new Error(err.message || `HTTP ${res.status}`);
    }

    return res.json();
  },

  // Auth
  login: (data) => Api.request("POST", "/api/auth/login", data),
  register: (data) => Api.request("POST", "/api/auth/register", data),

  // Users
  getUsers: () => Api.request("GET", "/api/users"),
  getUser: (id) => Api.request("GET", `/api/users/${id}`),
  createUser: (data) => Api.request("POST", "/api/users", data),
  updateUser: (id, d) => Api.request("PUT", `/api/users/${id}`, d),
  deleteUser: (id) => Api.request("DELETE", `/api/users/${id}`),

  // Records
  createRecord: (data) => Api.request("POST", "/api/records", data),
  getRecords: () => Api.request("GET", "/api/records/get"),
  getRecord: (id) => Api.request("GET", `/api/records/get/${id}`),
  updateRecord: (id, d) => Api.request("PUT", `/api/records/update/${id}`, d),
  deleteRecord: (id) => Api.request("DELETE", `/api/records/delete/${id}`),

  // Summary
  getOverview: () => Api.request("GET", "/api/summary/overview"),
  getCategory: () => Api.request("GET", "/api/summary/Category"),
  getTrends: () => Api.request("GET", "/api/summary/trends"),

  // Lookups
  getTypes: () => Api.request("GET", "/api/lookup/types"),
  getCategories: () => Api.request("GET", "/api/lookup/categories"),

};

// ── TOAST NOTIFICATIONS ──
const Toast = {
  container: null,

  init() {
    this.container = document.createElement("div");
    this.container.className = "toast-container";
    document.body.appendChild(this.container);
  },

  show(msg, type = "info", duration = 3500) {
    const icons = { success: "✓", error: "✕", info: "ℹ" };
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${icons[type] || icons.info}</span><span>${msg}</span>`;
    this.container.appendChild(toast);
    setTimeout(() => {
      toast.style.animation = "slide-in 0.3s ease reverse forwards";
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },

  success: (msg) => Toast.show(msg, "success"),
  error: (msg) => Toast.show(msg, "error"),
  info: (msg) => Toast.show(msg, "info"),
};

// ── NAVBAR SETUP ──
function initNavbar() {
  const role = Auth.getRole();
  const user = Auth.getUser();

  // Role badge
  const roleBadgeEl = document.getElementById("role-badge");
  if (roleBadgeEl && role) {
    roleBadgeEl.textContent = role;
    roleBadgeEl.className = `role-badge ${role.toLowerCase()}`;
  }

  // Username display
  const navUserEl = document.getElementById("nav-user");
  if (navUserEl && user.username) {
    navUserEl.textContent = user.username || user.email || "User";
  }

  // Active link highlight
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-link").forEach((link) => {
    const href = link.getAttribute("href");
    if (href === currentPage) link.classList.add("active");
  });

  // Logout
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      Auth.clear();
      window.location.href = "login.html";
    });
  }
}

// ── GUARD: redirect if not logged in ──
function requireAuth() {
  if (!Auth.isLoggedIn()) {
    window.location.href = "login.html";
    return false;
  }
  return true;
}

// ── GUARD: show access denied if role insufficient ──
function requireRole(allowedRoles) {
  const role = Auth.getRole();
  if (!allowedRoles.includes(role)) {
    document.querySelector("main")?.remove();
    const denied = document.createElement("div");
    denied.className = "access-denied";
    denied.innerHTML = `
      <div class="denied-code">403</div>
      <div class="denied-title">Access Restricted</div>
      <div class="denied-desc">Your role <strong>${role}</strong> does not have permission to view this page.</div>
      <a href="index.html" class="btn btn-secondary" style="margin-top:16px">← Back to Dashboard</a>
    `;
    document.body.appendChild(denied);
    return false;
  }
  return true;
}

// ── FORMAT HELPERS ──
function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatCurrency(val) {
  const n = parseFloat(val) || 0;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatNumber(val) {
  return new Intl.NumberFormat("en-US").format(parseFloat(val) || 0);
}

// ── MODAL HELPERS ──
function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add("open");
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove("open");
}

function initModalCloseListeners() {
  document.querySelectorAll(".modal-overlay").forEach((overlay) => {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) overlay.classList.remove("open");
    });
  });
  document.querySelectorAll(".modal-close").forEach((btn) => {
    btn.addEventListener("click", () => {
      btn.closest(".modal-overlay")?.classList.remove("open");
    });
  });
}

// ── DEBOUNCE ──
function debounce(fn, delay = 300) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}

// ── INIT ──
document.addEventListener("DOMContentLoaded", () => {
  Toast.init();
  initNavbar();
  initModalCloseListeners();
});

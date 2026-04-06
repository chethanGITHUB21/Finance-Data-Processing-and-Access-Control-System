// ── DASHBOARD.JS — Charts & Dashboard Logic ──

let overviewChart = null;
let categoryChart = null;
let trendsChart = null;

// Chart.js defaults for dark theme
function setupChartDefaults() {
  Chart.defaults.color = '#7a99b8';
  Chart.defaults.borderColor = '#1e2d3d';
  Chart.defaults.font.family = "'JetBrains Mono', monospace";
  Chart.defaults.font.size = 11;
}

// ── RENDER OVERVIEW (Bar Chart) ──
function renderOverviewChart(data, interactive) {
  const ctx = document.getElementById('overview-chart')?.getContext('2d');
  if (!ctx) return;

  if (overviewChart) overviewChart.destroy();

  const labels = ['Income', 'Expense', 'Net Balance'];
  const values = [
    parseFloat(data.income || 0),
    parseFloat(data.expense || 0),
    parseFloat(data.netBalance || 0)
  ];
  const colors = ['rgba(0,255,157,0.8)', 'rgba(255,59,92,0.8)', 'rgba(0,212,255,0.8)'];
  const borderColors = ['#00ff9d', '#ff3b5c', '#00d4ff'];

  overviewChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Amount ($)',
        data: values,
        backgroundColor: colors,
        borderColor: borderColors,
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      animation: { duration: interactive ? 800 : 0 },
      interaction: { mode: interactive ? 'index' : 'none' },
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: interactive,
          backgroundColor: '#111820',
          borderColor: '#2a3f52',
          borderWidth: 1,
          titleColor: '#e8f0f8',
          bodyColor: '#7a99b8',
          padding: 12,
          callbacks: {
            label: (ctx) => ` $${ctx.parsed.y.toLocaleString()}`
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(30,45,61,0.5)' },
          ticks: { color: '#7a99b8' }
        },
        y: {
          grid: { color: 'rgba(30,45,61,0.5)' },
          ticks: {
            color: '#7a99b8',
            callback: (v) => '$' + (v >= 1000 ? (v/1000).toFixed(0) + 'k' : v)
          }
        }
      },
      onHover: interactive ? undefined : (e) => { e.native.target.style.cursor = 'default'; },
      events: interactive ? undefined : []
    }
  });
}

function setEmptyChartMessage(canvasId, message) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const parent = canvas.parentElement;
  if (!parent) return;
  let msgEl = parent.querySelector('.empty-chart');
  if (!msgEl) {
    msgEl = document.createElement('div');
    msgEl.className = 'empty-chart';
    msgEl.style.fontSize = '12px';
    msgEl.style.color = 'var(--text-muted)';
    msgEl.style.marginTop = '8px';
    parent.appendChild(msgEl);
  }
  msgEl.textContent = message;
}

function clearEmptyChartMessage(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const parent = canvas.parentElement;
  if (!parent) return;
  const msgEl = parent.querySelector('.empty-chart');
  if (msgEl) msgEl.remove();
}

// ── RENDER CATEGORY (Bar Chart) ──
function renderCategoryChart(data, interactive) {
  const ctx = document.getElementById('category-chart')?.getContext('2d');
  if (!ctx) return;

  if (categoryChart) categoryChart.destroy();

  // Palette for categories
  const palette = [
    'rgba(0,212,255,0.75)', 'rgba(176,106,255,0.75)', 'rgba(0,255,157,0.75)',
    'rgba(255,123,28,0.75)', 'rgba(255,59,92,0.75)',   'rgba(255,220,60,0.75)'
  ];
  const borderPalette = ['#00d4ff','#b06aff','#00ff9d','#ff7b1c','#ff3b5c','#ffdc3c'];

  const labels = data.map(d => d.category || d.name || 'Unknown');
  const values = data.map(d => parseFloat(d.amount || d.total || d.value || 0));

  categoryChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Amount',
        data: values,
        backgroundColor: palette.slice(0, labels.length),
        borderColor: borderPalette.slice(0, labels.length),
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      indexAxis: 'y',
      animation: { duration: interactive ? 800 : 0 },
      interaction: { mode: interactive ? 'index' : 'none' },
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: interactive,
          backgroundColor: '#111820',
          borderColor: '#2a3f52',
          borderWidth: 1,
          titleColor: '#e8f0f8',
          bodyColor: '#7a99b8',
          padding: 12,
          callbacks: {
            label: (ctx) => ` $${ctx.parsed.x.toLocaleString()}`
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(30,45,61,0.5)' },
          ticks: {
            color: '#7a99b8',
            callback: (v) => '$' + (v >= 1000 ? (v/1000).toFixed(0) + 'k' : v)
          }
        },
        y: {
          grid: { display: false },
          ticks: { color: '#7a99b8' }
        }
      },
      events: interactive ? undefined : []
    }
  });
}

// ── RENDER TRENDS (Line Chart) ──
function renderTrendsChart(data, interactive) {
  const ctx = document.getElementById('trends-chart')?.getContext('2d');
  if (!ctx) return;

  if (trendsChart) trendsChart.destroy();

  const labels = data.map(d => d.month || d.period || d.date || '');
  const incomeData = data.map(d => parseFloat(d.income || d.value || 0));
  const expenseData = data.map(d => parseFloat(d.expense || d.cost || 0));

  trendsChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Income',
          data: incomeData,
          borderColor: '#00d4ff',
          backgroundColor: 'rgba(0,212,255,0.08)',
          fill: true,
          tension: 0.4,
          pointRadius: interactive ? 4 : 0,
          pointHoverRadius: interactive ? 6 : 0,
          pointBackgroundColor: '#00d4ff',
          pointBorderColor: '#080b10',
          pointBorderWidth: 2,
          borderWidth: 2,
        },
        {
          label: 'Expense',
          data: expenseData,
          borderColor: '#ff3b5c',
          backgroundColor: 'rgba(255,59,92,0.06)',
          fill: true,
          tension: 0.4,
          pointRadius: interactive ? 4 : 0,
          pointHoverRadius: interactive ? 6 : 0,
          pointBackgroundColor: '#ff3b5c',
          pointBorderColor: '#080b10',
          pointBorderWidth: 2,
          borderWidth: 2,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      animation: { duration: interactive ? 1000 : 0 },
      interaction: { mode: interactive ? 'index' : 'none', intersect: false },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          align: 'end',
          labels: {
            color: '#7a99b8',
            usePointStyle: true,
            pointStyle: 'circle',
            padding: 16,
            font: { size: 10 }
          }
        },
        tooltip: {
          enabled: interactive,
          backgroundColor: '#111820',
          borderColor: '#2a3f52',
          borderWidth: 1,
          titleColor: '#e8f0f8',
          bodyColor: '#7a99b8',
          padding: 12,
          callbacks: {
            label: (ctx) => ` ${ctx.dataset.label}: $${ctx.parsed.y.toLocaleString()}`
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(30,45,61,0.3)' },
          ticks: { color: '#7a99b8' }
        },
        y: {
          grid: { color: 'rgba(30,45,61,0.3)' },
          ticks: {
            color: '#7a99b8',
            callback: (v) => '$' + (v >= 1000 ? (v/1000).toFixed(0) + 'k' : v)
          }
        }
      },
      events: interactive ? undefined : []
    }
  });
}

// ── LOAD CHART DATA ──
async function loadCharts() {
  const role = Auth.getRole();
  const interactive = Permissions.canInteractCharts(role);

  setupChartDefaults();

  try {
    const [overviewData, categoryData, trendsData] = await Promise.all([
      Api.getOverview(),
      Api.getCategory(),
      Api.getTrends(),
    ]);

    const overviewPayload = overviewData?.data?.summary || overviewData;
    const categoryPayload = categoryData?.data?.summary || categoryData;
    const trendsPayload = trendsData?.data?.trend || trendsData;

    // Normalize overview data from backend summary:
    const normalizedOverview = {
      income: parseFloat(overviewPayload.total_income ?? overviewPayload.income ?? 0),
      expense: parseFloat(overviewPayload.total_expense ?? overviewPayload.expense ?? 0),
      netBalance: parseFloat(
        overviewPayload.total_netbalance ??
        overviewPayload.netBalance ??
        (overviewPayload.total_income ?? 0) - (overviewPayload.total_expense ?? 0)
      ),
    };

    // Normalize category data from backend summary:
    // expected fields: category, total_income, total_expense
    const normalizedCategory = (Array.isArray(categoryPayload) ? categoryPayload : []).map((d) => ({
      category: d.category || d.name || 'Unknown',
      value:
        parseFloat(d.total_income ?? d.income ?? 0) +
        parseFloat(d.total_expense ?? d.expense ?? 0),
    }));

    // Normalize trends data from backend summary:
    const normalizedTrends = (Array.isArray(trendsPayload) ? trendsPayload : []).map((d) => ({
      month: d.month || d.period || d.date || '',
      income: parseFloat(d.total_income ?? d.income ?? 0),
      expense: parseFloat(d.total_expense ?? d.expense ?? 0),
    }));

    renderOverviewChart(normalizedOverview, interactive);
    renderCategoryChart(normalizedCategory, interactive);
    renderTrendsChart(normalizedTrends, interactive);

    if (normalizedOverview.income === 0 && normalizedOverview.expense === 0) {
      setEmptyChartMessage('overview-chart', 'No data yet');
    } else {
      clearEmptyChartMessage('overview-chart');
    }

    if (!normalizedCategory.length) {
      setEmptyChartMessage('category-chart', 'No data yet');
    } else {
      clearEmptyChartMessage('category-chart');
    }

    if (!normalizedTrends.length) {
      setEmptyChartMessage('trends-chart', 'No data yet');
    } else {
      clearEmptyChartMessage('trends-chart');
    }
  } catch (err) {
    Toast.error(err.message || 'Failed to load summary charts');
    renderOverviewChart({ income: 0, expense: 0, netBalance: 0 }, interactive);
    renderCategoryChart([], interactive);
    renderTrendsChart([], interactive);
    setEmptyChartMessage('overview-chart', 'No data yet');
    setEmptyChartMessage('category-chart', 'No data yet');
    setEmptyChartMessage('trends-chart', 'No data yet');
  }
}

// ── STAT CARDS ──
function updateStatCards(data) {
  const income = parseFloat(data.income || 0);
  const expense = parseFloat(data.expense || 0);
  const net = parseFloat(data.netBalance || (income - expense));

  const setEl = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  setEl('stat-income',  formatCurrency(income));
  setEl('stat-expense', formatCurrency(expense));
  setEl('stat-net',     formatCurrency(net));

  const netEl = document.getElementById('stat-net');
  if (netEl) {
    netEl.className = `stat-value ${net >= 0 ? 'stat-positive' : 'stat-negative'}`;
  }
}

// Load stat-grid totals from records API
async function loadStatCardsFromRecords() {
  try {
    const res = await Api.getRecords();
    const list =
      Array.isArray(res) ? res :
      (res.data?.records || res.records || res.data || []);

    let totalIncome = 0;
    let totalExpense = 0;
    for (const rec of list) {
      const amt = parseFloat(rec.amount) || 0;
      if (rec.type_id === 1) totalIncome += amt;
      if (rec.type_id === 2) totalExpense += amt;
    }
    const net = totalIncome - totalExpense;

    updateStatCards({ income: totalIncome, expense: totalExpense, netBalance: net });
  } catch (err) {
    Toast.error(err.message || 'Failed to load records for stat cards');
  }
}

// ── DASHBOARD USERS TABLE (mini) ──
function renderDashboardUsers(rows) {
  const tableBody = document.getElementById('dashboard-users-body');
  if (!tableBody) return;

  if (!rows.length) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="5">
          <div class="empty-state">
            <div class="empty-title">No users found</div>
            <div class="empty-desc">Create users to see them here.</div>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = rows.map((u) => {
    const name = u.username || u.name || u.email || '—';
    const email = u.email || '—';
    const role = u.role || '—';
    const status = u.status || '—';
    const created = formatDate(u.created_at || u.createdAt);

    return `
      <tr>
        <td>${name}</td>
        <td>${email}</td>
        <td>${role}</td>
        <td>${status}</td>
        <td>${created}</td>
      </tr>
    `;
  }).join('');
}

async function loadDashboardUsers() {
  const tableBody = document.getElementById('dashboard-users-body');
  if (!tableBody) return;

  try {
    const res = await Api.getUsers();
    const list =
      Array.isArray(res) ? res :
      (res.data?.data || res.data?.users || res.data?.data?.users || res.users || res.data || []);

    if (!Array.isArray(list)) {
      throw new Error('Unexpected users response format');
    }

    const sorted = [...list].sort((a, b) => {
      const at = new Date(a.created_at || a.createdAt || 0).getTime();
      const bt = new Date(b.created_at || b.createdAt || 0).getTime();
      return bt - at;
    });

    renderDashboardUsers(sorted.slice(0, 5));
  } catch (err) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="5">
          <div class="empty-state">
            <div class="empty-title">Failed to load users</div>
            <div class="empty-desc">${err.message || 'Please try again.'}</div>
          </div>
        </td>
      </tr>
    `;
  }
}


// ── DASHBOARD INIT ──
async function initDashboard() {
  if (!requireAuth()) return;

  const role = Auth.getRole();

  // Role-based section visibility
  applyRoleVisibility(role);

  // Load all data
  await Promise.all([
    loadCharts(),
    loadStatCardsFromRecords(),
    loadDashboardUsers(),
  ]);
}

function applyRoleVisibility(role) {
  // Users section
  const usersSection = document.getElementById('dashboard-users-section');
  if (usersSection && !Permissions.canViewUsers(role)) {
    usersSection.classList.add('hidden');
  }

  // Create user button
  const createBtn = document.getElementById('dash-create-user-btn');
  if (createBtn && !Permissions.canCreateUser(role)) {
    createBtn.classList.add('hidden');
  }

  // Viewer notice
  const viewerNotice = document.getElementById('viewer-notice');
  if (viewerNotice && role === ROLES.VIEWER) {
    viewerNotice.classList.remove('hidden');
  }
}

// ── INIT ──
document.addEventListener('DOMContentLoaded', initDashboard);

/**
 * PERSONAL EXPENSE TRACKER
 * Vanilla JavaScript (ES6+) Financial Management Engine
 * BSIT Academic Web Technology Course Project
 * Persistent LocalStorage Architecture
 */

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const STORAGE_KEYS = {
  USERS: 'pet_users',
  CURRENT_USER: 'pet_current_user',
  CURRENCY: 'pet_currency',
  THEME: 'pet_theme',
  TRANSACTIONS: 'pet_transactions',
  CATEGORIES: 'pet_categories',
  BUDGETS: 'pet_budgets',
  SAVINGS: 'pet_savings_goals',
  RECURRING: 'pet_recurring',
  NOTIFICATIONS: 'pet_notifications',
  SETTINGS: 'pet_settings'
};

const CURRENCY_MAP = {
  PKR: { symbol: '₨', name: 'Pakistani Rupee', code: 'PKR', locale: 'en-PK' },
  USD: { symbol: '$', name: 'US Dollar', code: 'USD', locale: 'en-US' },
  EUR: { symbol: '€', name: 'Euro', code: 'EUR', locale: 'de-DE' },
  GBP: { symbol: '£', name: 'British Pound', code: 'GBP', locale: 'en-GB' },
  INR: { symbol: '₹', name: 'Indian Rupee', code: 'INR', locale: 'en-IN' }
};

const CATEGORY_COLORS = [
  '#2563eb', '#16a34a', '#dc2626', '#d97706', '#7c3aed',
  '#0891b2', '#ea580c', '#db2777', '#4b5563', '#059669'
];

const CATEGORY_ICONS = [
  'fa-utensils', 'fa-car', 'fa-graduation-cap', 'fa-bag-shopping',
  'fa-heart-pulse', 'fa-film', 'fa-file-invoice-dollar', 'fa-house',
  'fa-wifi', 'fa-mobile-screen', 'fa-plane', 'fa-user',
  'fa-briefcase', 'fa-laptop-code', 'fa-chart-line', 'fa-gift',
  'fa-shield-halved', 'fa-gamepad', 'fa-dumbbell', 'fa-tag'
];

// Active Chart.js instances cache to avoid canvas re-use errors
const activeCharts = {};

// Application In-Memory State
const appState = {
  currentUser: null,
  currency: 'PKR',
  theme: 'light',
  transactions: [],
  categories: [],
  budgets: [],
  savingsGoals: [],
  recurring: [],
  notifications: [],
  settings: {
    budgetAlerts: true,
    savingsMilestones: true
  },
  currentView: 'dashboard'
};

// ============================================================================
// LOCALSTORAGE DATA HELPERS
// ============================================================================

function saveData(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error('Error saving data to LocalStorage:', err);
    showToast('Failed to save to local storage', 'error');
  }
}

function getData(key, defaultValue = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch (err) {
    console.error('Error reading data from LocalStorage:', err);
    return defaultValue;
  }
}

// Generate unique ID
function generateId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}

// Format Currency
function formatMoney(amount, overrideCurrency = null) {
  const code = overrideCurrency || appState.currency || 'PKR';
  const curr = CURRENCY_MAP[code] || CURRENCY_MAP.PKR;
  const num = Number(amount) || 0;
  return `${curr.symbol} ${num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

// Date Formatter
function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// ============================================================================
// DEFAULT REALISTIC DEMO DATA INITIALIZATION
// ============================================================================

function getInitialDemoCategories() {
  return [
    // Income Categories
    { id: 'cat_inc_1', name: 'Salary', type: 'income', icon: 'fa-briefcase', color: '#16a34a' },
    { id: 'cat_inc_2', name: 'Freelance', type: 'income', icon: 'fa-laptop-code', color: '#0891b2' },
    { id: 'cat_inc_3', name: 'Business', type: 'income', icon: 'fa-building-columns', color: '#2563eb' },
    { id: 'cat_inc_4', name: 'Allowance', type: 'income', icon: 'fa-gift', color: '#d97706' },
    { id: 'cat_inc_5', name: 'Investment', type: 'income', icon: 'fa-chart-line', color: '#7c3aed' },
    { id: 'cat_inc_6', name: 'Other Income', type: 'income', icon: 'fa-coins', color: '#059669' },

    // Expense Categories
    { id: 'cat_exp_1', name: 'Food & Dining', type: 'expense', icon: 'fa-utensils', color: '#ea580c' },
    { id: 'cat_exp_2', name: 'Transportation', type: 'expense', icon: 'fa-car', color: '#2563eb' },
    { id: 'cat_exp_3', name: 'Education & Books', type: 'expense', icon: 'fa-graduation-cap', color: '#7c3aed' },
    { id: 'cat_exp_4', name: 'Shopping & Clothes', type: 'expense', icon: 'fa-bag-shopping', color: '#db2777' },
    { id: 'cat_exp_5', name: 'Healthcare', type: 'expense', icon: 'fa-heart-pulse', color: '#dc2626' },
    { id: 'cat_exp_6', name: 'Entertainment', type: 'expense', icon: 'fa-film', color: '#d97706' },
    { id: 'cat_exp_7', name: 'Bills & Utilities', type: 'expense', icon: 'fa-file-invoice-dollar', color: '#0891b2' },
    { id: 'cat_exp_8', name: 'Rent', type: 'expense', icon: 'fa-house', color: '#4b5563' },
    { id: 'cat_exp_9', name: 'Internet & Tech', type: 'expense', icon: 'fa-wifi', color: '#0284c7' },
    { id: 'cat_exp_10', name: 'Mobile Phone', type: 'expense', icon: 'fa-mobile-screen', color: '#16a34a' },
    { id: 'cat_exp_11', name: 'Travel & Trips', type: 'expense', icon: 'fa-plane', color: '#f59e0b' },
    { id: 'cat_exp_12', name: 'Personal Care', type: 'expense', icon: 'fa-user', color: '#8b5cf6' }
  ];
}

function getInitialDemoTransactions() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const getDateStr = (dayOffset, monthOffset = 0) => {
    const d = new Date(year, month + monthOffset, dayOffset);
    return d.toISOString().split('T')[0];
  };

  return [
    // Income Records (8 records)
    { id: 'tx_inc_1', title: 'Monthly Software Engineer Salary', type: 'income', amount: 185000, category: 'Salary', paymentMethod: 'Bank Transfer', date: getDateStr(1, 0), description: 'Tech Solutions Ltd. monthly salary', notes: 'Tax deducted at source' },
    { id: 'tx_inc_2', title: 'Upwork UI Design Contract', type: 'income', amount: 48000, category: 'Freelance', paymentMethod: 'Bank Transfer', date: getDateStr(5, 0), description: 'Client mobile design milestone', notes: 'Figma prototype delivery' },
    { id: 'tx_inc_3', title: 'Web App Consultation Retainer', type: 'income', amount: 35000, category: 'Freelance', paymentMethod: 'Mobile Wallet', date: getDateStr(12, 0), description: 'Code review & architecture consulting', notes: 'Bi-weekly retainer' },
    { id: 'tx_inc_4', title: 'Quarterly Stock Dividend', type: 'income', amount: 14500, category: 'Investment', paymentMethod: 'Bank Transfer', date: getDateStr(18, 0), description: 'Mutual Fund quarterly distribution', notes: 'Reinvest 50%' },
    { id: 'tx_inc_5', title: 'E-commerce Affiliate Commission', type: 'income', amount: 9200, category: 'Business', paymentMethod: 'Mobile Wallet', date: getDateStr(22, 0), description: 'Course referral earnings', notes: 'Web Tech tutorials' },
    { id: 'tx_inc_6', title: 'Previous Month Salary', type: 'income', amount: 185000, category: 'Salary', paymentMethod: 'Bank Transfer', date: getDateStr(1, -1), description: 'Tech Solutions Ltd.', notes: 'Standard direct deposit' },
    { id: 'tx_inc_7', title: 'University Teaching Assistant Allowance', type: 'income', amount: 20000, category: 'Allowance', paymentMethod: 'Bank Transfer', date: getDateStr(10, -1), description: 'Fall Semester TA stipend', notes: 'Department of Computer Science' },
    { id: 'tx_inc_8', title: 'Freelance API Development', type: 'income', amount: 55000, category: 'Freelance', paymentMethod: 'Bank Transfer', date: getDateStr(20, -1), description: 'Node.js backend development', notes: 'Completed ahead of deadline' },

    // Expense Records (14 records)
    { id: 'tx_exp_1', title: 'Apartment Monthly Rent', type: 'expense', amount: 42000, category: 'Rent', paymentMethod: 'Bank Transfer', date: getDateStr(2, 0), description: 'Landlord monthly payment', notes: 'Receipt issued' },
    { id: 'tx_exp_2', title: 'Monthly Grocery Stock-up', type: 'expense', amount: 21500, category: 'Food & Dining', paymentMethod: 'Debit Card', date: getDateStr(3, 0), description: 'Hyperstar family groceries', notes: 'Organic pantry and household supplies' },
    { id: 'tx_exp_3', title: 'Fiber Internet 100Mbps Bill', type: 'expense', amount: 4200, category: 'Internet & Tech', paymentMethod: 'Mobile Wallet', date: getDateStr(4, 0), description: 'StormFiber connection bill', notes: 'Auto-paid' },
    { id: 'tx_exp_4', title: 'Fuel for Car (Full Tank)', type: 'expense', amount: 11500, category: 'Transportation', paymentMethod: 'Credit Card', date: getDateStr(6, 0), description: 'Shell filling station', notes: 'High-octane petrol' },
    { id: 'tx_exp_5', title: 'Electricity Utility Bill', type: 'expense', amount: 16800, category: 'Bills & Utilities', paymentMethod: 'Bank Transfer', date: getDateStr(8, 0), description: 'K-Electric residential bill', notes: 'Peak season bill' },
    { id: 'tx_exp_6', title: 'Dining Out with University Friends', type: 'expense', amount: 6400, category: 'Food & Dining', paymentMethod: 'Debit Card', date: getDateStr(10, 0), description: 'Dinner buffet celebration', notes: 'Midterm exams celebration' },
    { id: 'tx_exp_7', title: 'Academic Books & Kindle Subscription', type: 'expense', amount: 5500, category: 'Education & Books', paymentMethod: 'Credit Card', date: getDateStr(11, 0), description: 'Algorithms and Web Architecture books', notes: 'Semester reference materials' },
    { id: 'tx_exp_8', title: 'Mobile Postpaid Package', type: 'expense', amount: 2200, category: 'Mobile Phone', paymentMethod: 'Mobile Wallet', date: getDateStr(14, 0), description: 'Monthly unlimited data bundle', notes: 'Jazz Gold package' },
    { id: 'tx_exp_9', title: 'Cinema Tickets & Snacks', type: 'expense', amount: 3800, category: 'Entertainment', paymentMethod: 'Cash', date: getDateStr(16, 0), description: 'Weekend movie with family', notes: 'IMAX 3D' },
    { id: 'tx_exp_10', title: 'Gym & Fitness Membership', type: 'expense', amount: 6000, category: 'Personal Care', paymentMethod: 'Debit Card', date: getDateStr(17, 0), description: 'Monthly gym subscription', notes: 'Crossfit trainer fee included' },
    { id: 'tx_exp_11', title: 'Dental Checkup & Cleaning', type: 'expense', amount: 8000, category: 'Healthcare', paymentMethod: 'Debit Card', date: getDateStr(19, 0), description: 'Routine scaling and checkup', notes: 'Annual dental clinic visit' },
    { id: 'tx_exp_12', title: 'Casual Clothes & Running Shoes', type: 'expense', amount: 13500, category: 'Shopping & Clothes', paymentMethod: 'Credit Card', date: getDateStr(21, 0), description: 'Outfitters & Nike store', notes: 'Seasonal discount sale' },
    { id: 'tx_exp_13', title: 'Ride-Hailing & Toll Taxes', type: 'expense', amount: 3400, category: 'Transportation', paymentMethod: 'Mobile Wallet', date: getDateStr(23, 0), description: 'Uber rides for client meetings', notes: 'Work commute' },
    { id: 'tx_exp_14', title: 'Weekly Cafe Work Sessions', type: 'expense', amount: 2900, category: 'Food & Dining', paymentMethod: 'Cash', date: getDateStr(24, 0), description: 'Coffee & snacks during coding sessions', notes: 'Espresso Bar' }
  ];
}

function getInitialDemoBudgets() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const start = new Date(year, month, 1).toISOString().split('T')[0];
  const end = new Date(year, month + 1, 0).toISOString().split('T')[0];

  return [
    { id: 'bgt_1', name: 'Monthly Food & Groceries', category: 'Food & Dining', amount: 35000, period: 'Monthly', startDate: start, endDate: end },
    { id: 'bgt_2', name: 'Transport & Fuel Cap', category: 'Transportation', amount: 18000, period: 'Monthly', startDate: start, endDate: end },
    { id: 'bgt_3', name: 'Utilities & Internet Limit', category: 'Bills & Utilities', amount: 22000, period: 'Monthly', startDate: start, endDate: end },
    { id: 'bgt_4', name: 'Entertainment & Outings', category: 'Entertainment', amount: 8000, period: 'Monthly', startDate: start, endDate: end },
    { id: 'bgt_5', name: 'Shopping & Apparel', category: 'Shopping & Clothes', amount: 12000, period: 'Monthly', startDate: start, endDate: end }
  ];
}

function getInitialDemoSavings() {
  const now = new Date();
  const nextYear = now.getFullYear() + 1;

  return [
    { id: 'svg_1', name: 'Emergency Safety Cushion', targetAmount: 300000, currentAmount: 185000, targetDate: `${nextYear}-06-30`, description: '6 months of essential living expenses', icon: 'fa-shield-halved', color: '#16a34a' },
    { id: 'svg_2', name: 'MacBook Pro for Capstone Project', targetAmount: 220000, currentAmount: 165000, targetDate: `${nextYear}-03-15`, description: 'M-series workstation for software development', icon: 'fa-laptop', color: '#2563eb' },
    { id: 'svg_3', name: 'Hajj & Umrah Family Fund', targetAmount: 600000, currentAmount: 240000, targetDate: `${nextYear}-12-31`, description: 'Pilgrimage savings reserve', icon: 'fa-kaaba', color: '#7c3aed' },
    { id: 'svg_4', name: 'Cloud & Web Tech Certifications', targetAmount: 60000, currentAmount: 48000, targetDate: `${nextYear}-01-20`, description: 'AWS Solutions Architect & Google Cloud exams', icon: 'fa-certificate', color: '#d97706' }
  ];
}

function getInitialDemoRecurring() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];

  return [
    { id: 'rec_1', title: 'Monthly Salary Direct Deposit', type: 'income', amount: 185000, category: 'Salary', frequency: 'Monthly', startDate: start, paymentMethod: 'Bank Transfer', active: true, lastProcessed: start },
    { id: 'rec_2', title: 'Apartment Rental Lease', type: 'expense', amount: 42000, category: 'Rent', frequency: 'Monthly', startDate: start, paymentMethod: 'Bank Transfer', active: true, lastProcessed: start },
    { id: 'rec_3', title: 'StormFiber High-Speed Internet', type: 'expense', amount: 4200, category: 'Internet & Tech', frequency: 'Monthly', startDate: start, paymentMethod: 'Mobile Wallet', active: true, lastProcessed: start },
    { id: 'rec_4', title: 'Gym & Fitness Membership', type: 'expense', amount: 6000, category: 'Personal Care', frequency: 'Monthly', startDate: start, paymentMethod: 'Debit Card', active: true, lastProcessed: start },
    { id: 'rec_5', title: 'Cloud Server & Domain Hosting', type: 'expense', amount: 2500, category: 'Internet & Tech', frequency: 'Monthly', startDate: start, paymentMethod: 'Credit Card', active: true, lastProcessed: start }
  ];
}

function getInitialDemoNotifications() {
  return [
    { id: 'notif_1', title: 'Welcome to Expense Tracker', message: 'Demonstration account initialized with 22 transactions and realistic budgets.', type: 'info', time: 'Just now', read: false },
    { id: 'notif_2', title: 'Budget Nearing Threshold', message: 'Shopping & Apparel has reached 112% of its allocated limit for this period.', type: 'warning', time: '2 hours ago', read: false },
    { id: 'notif_3', title: 'Savings Milestone Reached', message: 'Cloud & Web Tech Certifications has reached 80% of its target amount!', type: 'success', time: 'Yesterday', read: false },
    { id: 'notif_4', title: 'Recurring Salary Verified', message: 'Monthly Salary rule is scheduled for direct bank deposit simulation.', type: 'info', time: '3 days ago', read: true }
  ];
}

// ============================================================================
// SYSTEM BOOTSTRAP & STATE LOADING
// ============================================================================

function initializeSystemData() {
  // Load users or create default user
  let users = getData(STORAGE_KEYS.USERS);
  if (!users || !Array.isArray(users) || users.length === 0) {
    users = [
      {
        id: 'usr_demo_1',
        name: 'Tufail Ahmed',
        email: 'user@expense.com',
        password: 'user123',
        currency: 'PKR',
        createdAt: '2026-01-15'
      }
    ];
    saveData(STORAGE_KEYS.USERS, users);
  }

  // Load Currency & Theme
  appState.currency = getData(STORAGE_KEYS.CURRENCY, 'PKR');
  appState.theme = getData(STORAGE_KEYS.THEME, 'light');
  applyTheme(appState.theme);

  // Load Categories
  let categories = getData(STORAGE_KEYS.CATEGORIES);
  if (!categories || categories.length === 0) {
    categories = getInitialDemoCategories();
    saveData(STORAGE_KEYS.CATEGORIES, categories);
  }
  appState.categories = categories;

  // Load Transactions
  let transactions = getData(STORAGE_KEYS.TRANSACTIONS);
  if (!transactions || transactions.length === 0) {
    transactions = getInitialDemoTransactions();
    saveData(STORAGE_KEYS.TRANSACTIONS, transactions);
  }
  appState.transactions = transactions;

  // Load Budgets
  let budgets = getData(STORAGE_KEYS.BUDGETS);
  if (!budgets || budgets.length === 0) {
    budgets = getInitialDemoBudgets();
    saveData(STORAGE_KEYS.BUDGETS, budgets);
  }
  appState.budgets = budgets;

  // Load Savings Goals
  let savings = getData(STORAGE_KEYS.SAVINGS);
  if (!savings || savings.length === 0) {
    savings = getInitialDemoSavings();
    saveData(STORAGE_KEYS.SAVINGS, savings);
  }
  appState.savingsGoals = savings;

  // Load Recurring
  let recurring = getData(STORAGE_KEYS.RECURRING);
  if (!recurring || recurring.length === 0) {
    recurring = getInitialDemoRecurring();
    saveData(STORAGE_KEYS.RECURRING, recurring);
  }
  appState.recurring = recurring;

  // Load Notifications
  let notifications = getData(STORAGE_KEYS.NOTIFICATIONS);
  if (!notifications || notifications.length === 0) {
    notifications = getInitialDemoNotifications();
    saveData(STORAGE_KEYS.NOTIFICATIONS, notifications);
  }
  appState.notifications = notifications;

  // Load Current User Session
  const savedCurrentUser = getData(STORAGE_KEYS.CURRENT_USER);
  if (savedCurrentUser) {
    appState.currentUser = savedCurrentUser;
    if (savedCurrentUser.currency) {
      appState.currency = savedCurrentUser.currency;
    }
  }

  // Run Recurring Simulation Engine
  simulateRecurringTransactions();

  // Audit Budget Limits & Push Notifications if any
  auditBudgetWarnings();
}

// ============================================================================
// AUTHENTICATION & SESSION MANAGEMENT
// ============================================================================

function registerUser(name, email, password) {
  const users = getData(STORAGE_KEYS.USERS, []);
  const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (existing) {
    return { success: false, message: 'An account with this email already exists.' };
  }

  const newUser = {
    id: generateId('usr'),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password: password,
    currency: appState.currency || 'PKR',
    createdAt: new Date().toISOString().split('T')[0]
  };

  users.push(newUser);
  saveData(STORAGE_KEYS.USERS, users);

  return { success: true, user: newUser };
}

function loginUser(email, password, remember = true) {
  const users = getData(STORAGE_KEYS.USERS, []);
  const user = users.find(
    u => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
  );

  if (!user) {
    return { success: false, message: 'Invalid email or password credentials.' };
  }

  appState.currentUser = user;
  if (user.currency) {
    appState.currency = user.currency;
    saveData(STORAGE_KEYS.CURRENCY, user.currency);
  }

  if (remember) {
    saveData(STORAGE_KEYS.CURRENT_USER, user);
  } else {
    sessionStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  }

  return { success: true, user };
}

function logoutUser() {
  appState.currentUser = null;
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  sessionStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  showAuthView();
  showToast('You have been signed out successfully.', 'info');
}

function showAuthView() {
  document.getElementById('auth-view').style.display = 'flex';
  document.getElementById('app-view').style.display = 'none';
}

function showAppView() {
  document.getElementById('auth-view').style.display = 'none';
  document.getElementById('app-view').style.display = 'flex';

  updateUserInterfaceProfile();
  syncCurrencyDropdowns();
  renderCurrentView();
}

function updateUserInterfaceProfile() {
  if (!appState.currentUser) return;
  const user = appState.currentUser;

  const initial = user.name ? user.name.charAt(0).toUpperCase() : 'U';
  const avatarEl = document.getElementById('sidebar-user-avatar');
  if (avatarEl) avatarEl.textContent = initial;

  const nameEl = document.getElementById('sidebar-user-name');
  if (nameEl) nameEl.textContent = user.name;

  const emailEl = document.getElementById('sidebar-user-email');
  if (emailEl) emailEl.textContent = user.email;

  // Profile Form fields
  const pName = document.getElementById('profile-name');
  if (pName) pName.value = user.name;

  const pEmail = document.getElementById('profile-email');
  if (pEmail) pEmail.value = user.email;

  const pCurr = document.getElementById('profile-currency-pref');
  if (pCurr) pCurr.value = user.currency || appState.currency;

  const pCreated = document.getElementById('profile-created-date');
  if (pCreated) pCreated.value = formatDate(user.createdAt || '2026-01-15');
}

// ============================================================================
// THEME & LOCALIZATION LOGIC
// ============================================================================

function applyTheme(theme) {
  appState.theme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  saveData(STORAGE_KEYS.THEME, theme);

  // Update theme toggle icons
  const iconClass = theme === 'dark' ? 'fa-sun' : 'fa-moon';
  const landingBtn = document.getElementById('landing-theme-toggle');
  if (landingBtn) landingBtn.innerHTML = `<i class="fa-solid ${iconClass}"></i>`;

  const appBtn = document.getElementById('btn-app-theme-toggle');
  if (appBtn) appBtn.innerHTML = `<i class="fa-solid ${iconClass}"></i>`;

  // Re-render charts to adjust text and grid colors
  if (appState.currentUser) {
    refreshAllCharts();
  }
}

function toggleTheme() {
  const next = appState.theme === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  showToast(`Switched to ${next} mode`, 'info');
}

function updateCurrency(code) {
  if (!CURRENCY_MAP[code]) return;
  appState.currency = code;
  saveData(STORAGE_KEYS.CURRENCY, code);

  if (appState.currentUser) {
    appState.currentUser.currency = code;
    saveData(STORAGE_KEYS.CURRENT_USER, appState.currentUser);

    // Update in users table
    const users = getData(STORAGE_KEYS.USERS, []);
    const idx = users.findIndex(u => u.id === appState.currentUser.id);
    if (idx !== -1) {
      users[idx].currency = code;
      saveData(STORAGE_KEYS.USERS, users);
    }
  }

  syncCurrencyDropdowns();
  renderCurrentView();
  showToast(`Currency changed to ${code} (${CURRENCY_MAP[code].symbol})`, 'success');
}

function syncCurrencyDropdowns() {
  const selects = [
    document.getElementById('header-currency-select'),
    document.getElementById('settings-currency-select'),
    document.getElementById('profile-currency-pref')
  ];

  selects.forEach(select => {
    if (select) select.value = appState.currency;
  });
}

// ============================================================================
// FINANCIAL CALCULATIONS ENGINE
// ============================================================================

function calculateBalance() {
  const totalIncome = appState.transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const totalExpense = appState.transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  return {
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense
  };
}

function calculateMonthlyIncome(year = new Date().getFullYear(), month = new Date().getMonth()) {
  return appState.transactions
    .filter(t => {
      if (t.type !== 'income') return false;
      const d = new Date(t.date);
      return d.getFullYear() === year && d.getMonth() === month;
    })
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);
}

function calculateMonthlyExpenses(year = new Date().getFullYear(), month = new Date().getMonth()) {
  return appState.transactions
    .filter(t => {
      if (t.type !== 'expense') return false;
      const d = new Date(t.date);
      return d.getFullYear() === year && d.getMonth() === month;
    })
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);
}

function calculateActualSpendingForCategory(categoryName, startDate = null, endDate = null) {
  return appState.transactions
    .filter(t => {
      if (t.type !== 'expense' || t.category !== categoryName) return false;
      if (startDate && t.date < startDate) return false;
      if (endDate && t.date > endDate) return false;
      return true;
    })
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);
}

// ============================================================================
// CRUD: TRANSACTIONS
// ============================================================================

function addTransaction(txData) {
  const newTx = {
    id: generateId('tx'),
    title: txData.title.trim(),
    type: txData.type,
    amount: Number(txData.amount),
    category: txData.category,
    paymentMethod: txData.paymentMethod || 'Cash',
    date: txData.date,
    description: txData.description ? txData.description.trim() : '',
    notes: txData.notes ? txData.notes.trim() : ''
  };

  appState.transactions.unshift(newTx);
  saveData(STORAGE_KEYS.TRANSACTIONS, appState.transactions);

  addNotification(
    'Transaction Added',
    `${newTx.type === 'income' ? 'Received' : 'Spent'} ${formatMoney(newTx.amount)} for ${newTx.title}`,
    newTx.type === 'income' ? 'success' : 'info'
  );

  auditBudgetWarnings();
  renderCurrentView();
  showToast('Transaction recorded successfully!', 'success');
  return newTx;
}

function updateTransaction(id, updatedData) {
  const index = appState.transactions.findIndex(t => t.id === id);
  if (index === -1) return false;

  appState.transactions[index] = {
    ...appState.transactions[index],
    title: updatedData.title.trim(),
    type: updatedData.type,
    amount: Number(updatedData.amount),
    category: updatedData.category,
    paymentMethod: updatedData.paymentMethod,
    date: updatedData.date,
    description: updatedData.description ? updatedData.description.trim() : '',
    notes: updatedData.notes ? updatedData.notes.trim() : ''
  };

  saveData(STORAGE_KEYS.TRANSACTIONS, appState.transactions);
  addNotification('Transaction Updated', `Updated "${updatedData.title}" details`, 'info');

  auditBudgetWarnings();
  renderCurrentView();
  showToast('Transaction updated successfully!', 'success');
  return true;
}

function deleteTransaction(id) {
  const tx = appState.transactions.find(t => t.id === id);
  if (!tx) return false;

  appState.transactions = appState.transactions.filter(t => t.id !== id);
  saveData(STORAGE_KEYS.TRANSACTIONS, appState.transactions);

  addNotification('Transaction Deleted', `Removed "${tx.title}" of ${formatMoney(tx.amount)}`, 'warning');

  auditBudgetWarnings();
  renderCurrentView();
  showToast('Transaction deleted.', 'info');
  return true;
}

// ============================================================================
// CRUD: CATEGORIES
// ============================================================================

function addCategory(catData) {
  const newCat = {
    id: generateId('cat'),
    name: catData.name.trim(),
    type: catData.type,
    icon: catData.icon || 'fa-tag',
    color: catData.color || '#2563eb'
  };

  appState.categories.push(newCat);
  saveData(STORAGE_KEYS.CATEGORIES, appState.categories);

  renderCurrentView();
  showToast(`Category "${newCat.name}" created!`, 'success');
  return newCat;
}

function updateCategory(id, updatedData) {
  const index = appState.categories.findIndex(c => c.id === id);
  if (index === -1) return false;

  const oldName = appState.categories[index].name;
  const newName = updatedData.name.trim();

  appState.categories[index] = {
    ...appState.categories[index],
    name: newName,
    type: updatedData.type,
    icon: updatedData.icon,
    color: updatedData.color
  };

  // Also update category references in transactions
  if (oldName !== newName) {
    appState.transactions.forEach(t => {
      if (t.category === oldName) t.category = newName;
    });
    saveData(STORAGE_KEYS.TRANSACTIONS, appState.transactions);
  }

  saveData(STORAGE_KEYS.CATEGORIES, appState.categories);
  renderCurrentView();
  showToast('Category updated!', 'success');
  return true;
}

function deleteCategory(id) {
  const cat = appState.categories.find(c => c.id === id);
  if (!cat) return false;

  // Safety check: Prevent deleting categories with active transactions unless reallocated
  const count = appState.transactions.filter(t => t.category === cat.name).length;
  if (count > 0) {
    showToast(`Cannot delete "${cat.name}": It has ${count} associated transaction(s). Reassign them first.`, 'warning', 4500);
    return false;
  }

  appState.categories = appState.categories.filter(c => c.id !== id);
  saveData(STORAGE_KEYS.CATEGORIES, appState.categories);
  renderCurrentView();
  showToast(`Category "${cat.name}" removed.`, 'info');
  return true;
}

// ============================================================================
// CRUD: BUDGETS & ALERTS
// ============================================================================

function createBudget(bgtData) {
  const newBudget = {
    id: generateId('bgt'),
    name: bgtData.name.trim(),
    category: bgtData.category,
    amount: Number(bgtData.amount),
    period: bgtData.period,
    startDate: bgtData.startDate,
    endDate: bgtData.endDate
  };

  appState.budgets.push(newBudget);
  saveData(STORAGE_KEYS.BUDGETS, appState.budgets);

  auditBudgetWarnings();
  renderCurrentView();
  showToast(`Budget for ${newBudget.category} created!`, 'success');
  return newBudget;
}

function updateBudget(id, updatedData) {
  const index = appState.budgets.findIndex(b => b.id === id);
  if (index === -1) return false;

  appState.budgets[index] = {
    ...appState.budgets[index],
    name: updatedData.name.trim(),
    category: updatedData.category,
    amount: Number(updatedData.amount),
    period: updatedData.period,
    startDate: updatedData.startDate,
    endDate: updatedData.endDate
  };

  saveData(STORAGE_KEYS.BUDGETS, appState.budgets);
  auditBudgetWarnings();
  renderCurrentView();
  showToast('Budget updated successfully!', 'success');
  return true;
}

function deleteBudget(id) {
  appState.budgets = appState.budgets.filter(b => b.id !== id);
  saveData(STORAGE_KEYS.BUDGETS, appState.budgets);
  renderCurrentView();
  showToast('Budget plan removed.', 'info');
  return true;
}

function auditBudgetWarnings() {
  if (!appState.settings.budgetAlerts) return;

  appState.budgets.forEach(b => {
    const spent = calculateActualSpendingForCategory(b.category, b.startDate, b.endDate);
    const usage = (spent / b.amount) * 100;

    if (usage >= 100) {
      // Check if we already alerted recently
      const exists = appState.notifications.some(
        n => n.title.includes('Budget Exceeded') && n.message.includes(b.category)
      );
      if (!exists) {
        addNotification(
          `Budget Exceeded: ${b.category}`,
          `You have spent ${formatMoney(spent)} against your ${formatMoney(b.amount)} cap (${usage.toFixed(0)}%).`,
          'danger'
        );
      }
    } else if (usage >= 90) {
      const exists = appState.notifications.some(
        n => n.title.includes('Budget Critical') && n.message.includes(b.category)
      );
      if (!exists) {
        addNotification(
          `Budget Critical: ${b.category}`,
          `${b.category} spending is at ${usage.toFixed(0)}% of limit. Only ${formatMoney(b.amount - spent)} remaining.`,
          'warning'
        );
      }
    }
  });
}

// ============================================================================
// CRUD: SAVINGS GOALS & CONTRIBUTIONS
// ============================================================================

function createSavingsGoal(goalData) {
  const newGoal = {
    id: generateId('svg'),
    name: goalData.name.trim(),
    targetAmount: Number(goalData.targetAmount),
    currentAmount: Number(goalData.currentAmount || 0),
    targetDate: goalData.targetDate,
    description: goalData.description ? goalData.description.trim() : '',
    icon: goalData.icon || 'fa-bullseye',
    color: goalData.color || '#2563eb'
  };

  appState.savingsGoals.push(newGoal);
  saveData(STORAGE_KEYS.SAVINGS, appState.savingsGoals);

  renderCurrentView();
  showToast(`Savings target "${newGoal.name}" initialized!`, 'success');
  return newGoal;
}

function updateSavingsGoal(id, updatedData) {
  const index = appState.savingsGoals.findIndex(g => g.id === id);
  if (index === -1) return false;

  appState.savingsGoals[index] = {
    ...appState.savingsGoals[index],
    name: updatedData.name.trim(),
    targetAmount: Number(updatedData.targetAmount),
    currentAmount: Number(updatedData.currentAmount),
    targetDate: updatedData.targetDate,
    description: updatedData.description ? updatedData.description.trim() : ''
  };

  saveData(STORAGE_KEYS.SAVINGS, appState.savingsGoals);
  renderCurrentView();
  showToast('Savings goal updated!', 'success');
  return true;
}

function deleteSavingsGoal(id) {
  appState.savingsGoals = appState.savingsGoals.filter(g => g.id !== id);
  saveData(STORAGE_KEYS.SAVINGS, appState.savingsGoals);
  renderCurrentView();
  showToast('Savings goal deleted.', 'info');
  return true;
}

function addSavingsContribution(goalId, amount) {
  const index = appState.savingsGoals.findIndex(g => g.id === goalId);
  if (index === -1) return false;

  const goal = appState.savingsGoals[index];
  const contribution = Number(amount);
  goal.currentAmount += contribution;

  saveData(STORAGE_KEYS.SAVINGS, appState.savingsGoals);

  const progress = (goal.currentAmount / goal.targetAmount) * 100;
  if (progress >= 100) {
    addNotification(
      'Goal Achieved!',
      `Congratulations! You reached 100% of your goal "${goal.name}" (${formatMoney(goal.currentAmount)}).`,
      'success'
    );
  } else {
    addNotification(
      'Savings Contribution',
      `Added ${formatMoney(contribution)} to "${goal.name}". Current progress: ${progress.toFixed(0)}%.`,
      'info'
    );
  }

  renderCurrentView();
  showToast(`Added ${formatMoney(contribution)} to ${goal.name}!`, 'success');
  return true;
}

// ============================================================================
// SIMULATED RECURRING TRANSACTIONS ENGINE
// ============================================================================

function simulateRecurringTransactions() {
  const todayStr = new Date().toISOString().split('T')[0];
  let processedCount = 0;

  appState.recurring.forEach(rule => {
    if (!rule.active) return;

    // Compare last processed date with today
    if (rule.lastProcessed && rule.lastProcessed >= todayStr) {
      return; // Already processed today or in future
    }

    // Process rule
    const newTx = {
      id: generateId('tx_rec'),
      title: `${rule.title} (Recurring)`,
      type: rule.type,
      amount: rule.amount,
      category: rule.category,
      paymentMethod: rule.paymentMethod || 'Bank Transfer',
      date: todayStr,
      description: `Automated ${rule.frequency} execution for ${rule.title}`,
      notes: 'Generated by Recurring Simulator Engine'
    };

    appState.transactions.unshift(newTx);
    rule.lastProcessed = todayStr;
    processedCount++;
  });

  if (processedCount > 0) {
    saveData(STORAGE_KEYS.TRANSACTIONS, appState.transactions);
    saveData(STORAGE_KEYS.RECURRING, appState.recurring);
    addNotification(
      'Recurring Rules Processed',
      `Synchronized ${processedCount} due recurring transaction(s) to your ledger.`,
      'info'
    );
  }
}

function addRecurringRule(data) {
  const newRule = {
    id: generateId('rec'),
    title: data.title.trim(),
    type: data.type,
    amount: Number(data.amount),
    category: data.category,
    frequency: data.frequency,
    startDate: data.startDate,
    paymentMethod: data.paymentMethod || 'Bank Transfer',
    active: true,
    lastProcessed: data.startDate
  };

  appState.recurring.push(newRule);
  saveData(STORAGE_KEYS.RECURRING, appState.recurring);

  renderCurrentView();
  showToast('Recurring rule activated!', 'success');
  return newRule;
}

function toggleRecurringStatus(id) {
  const index = appState.recurring.findIndex(r => r.id === id);
  if (index === -1) return;

  appState.recurring[index].active = !appState.recurring[index].active;
  saveData(STORAGE_KEYS.RECURRING, appState.recurring);
  renderCurrentView();
  showToast(
    `Rule ${appState.recurring[index].active ? 'Activated' : 'Paused'}`,
    'info'
  );
}

function deleteRecurringRule(id) {
  appState.recurring = appState.recurring.filter(r => r.id !== id);
  saveData(STORAGE_KEYS.RECURRING, appState.recurring);
  renderCurrentView();
  showToast('Recurring rule removed.', 'info');
}

// ============================================================================
// NOTIFICATION SYSTEM
// ============================================================================

function addNotification(title, message, type = 'info') {
  const newNotif = {
    id: generateId('notif'),
    title,
    message,
    type,
    time: 'Just now',
    read: false
  };

  appState.notifications.unshift(newNotif);
  if (appState.notifications.length > 30) {
    appState.notifications.pop(); // Keep max 30 notifications
  }
  saveData(STORAGE_KEYS.NOTIFICATIONS, appState.notifications);
  renderNotifications();
}

function markAllNotificationsRead() {
  appState.notifications.forEach(n => (n.read = true));
  saveData(STORAGE_KEYS.NOTIFICATIONS, appState.notifications);
  renderNotifications();
  showToast('All notifications marked as read', 'info');
}

function clearAllNotifications() {
  appState.notifications = [];
  saveData(STORAGE_KEYS.NOTIFICATIONS, appState.notifications);
  renderNotifications();
  showToast('Notifications cleared', 'info');
}

function renderNotifications() {
  const listEl = document.getElementById('notification-items-container');
  const badgeEl = document.getElementById('notification-badge-count');
  const footerCountEl = document.getElementById('notification-footer-count');

  if (!listEl) return;

  const unreadCount = appState.notifications.filter(n => !n.read).length;

  if (badgeEl) {
    if (unreadCount > 0) {
      badgeEl.style.display = 'flex';
      badgeEl.textContent = unreadCount > 9 ? '9+' : unreadCount;
    } else {
      badgeEl.style.display = 'none';
    }
  }

  if (footerCountEl) {
    footerCountEl.textContent = `${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}`;
  }

  if (appState.notifications.length === 0) {
    listEl.innerHTML = `
      <div style="padding: 2rem 1rem; text-align: center; color: var(--text-muted); font-size: 0.85rem;">
        <i class="fa-regular fa-bell-slash" style="font-size: 1.5rem; margin-bottom: 0.5rem; display: block;"></i>
        No notifications to display.
      </div>
    `;
    return;
  }

  listEl.innerHTML = appState.notifications
    .map(n => `
      <div class="notification-item ${n.read ? '' : 'unread'}" data-notif-id="${n.id}">
        <div class="notif-icon ${n.type}">
          <i class="fa-solid ${
            n.type === 'danger'
              ? 'fa-triangle-exclamation'
              : n.type === 'warning'
              ? 'fa-circle-exclamation'
              : n.type === 'success'
              ? 'fa-circle-check'
              : 'fa-circle-info'
          }"></i>
        </div>
        <div class="notif-body">
          <div class="notif-title">${escapeHTML(n.title)}</div>
          <div class="notif-message">${escapeHTML(n.message)}</div>
          <div class="notif-time">${escapeHTML(n.time)}</div>
        </div>
      </div>
    `)
    .join('');

  // Item click marks read
  listEl.querySelectorAll('.notification-item').forEach(item => {
    item.addEventListener('click', () => {
      const id = item.getAttribute('data-notif-id');
      const target = appState.notifications.find(n => n.id === id);
      if (target && !target.read) {
        target.read = true;
        saveData(STORAGE_KEYS.NOTIFICATIONS, appState.notifications);
        renderNotifications();
      }
    });
  });
}

// ============================================================================
// DATA EXPORT & BACKUP/RESTORE SYSTEM
// ============================================================================

function exportTransactionsCSV(transactionsToExport = null) {
  const records = transactionsToExport || appState.transactions;

  if (records.length === 0) {
    showToast('No transactions to export', 'warning');
    return;
  }

  const headers = ['Transaction ID', 'Date', 'Title', 'Type', 'Amount', 'Currency', 'Category', 'Payment Method', 'Description', 'Notes'];
  const rows = records.map(t => [
    `"${t.id}"`,
    `"${t.date}"`,
    `"${(t.title || '').replace(/"/g, '""')}"`,
    `"${t.type}"`,
    `"${Number(t.amount).toFixed(2)}"`,
    `"${appState.currency}"`,
    `"${(t.category || '').replace(/"/g, '""')}"`,
    `"${(t.paymentMethod || '').replace(/"/g, '""')}"`,
    `"${(t.description || '').replace(/"/g, '""')}"`,
    `"${(t.notes || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `ExpenseTracker_Transactions_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showToast('Transactions exported to CSV successfully!', 'success');
}

function exportBackupJSON() {
  const fullBackup = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    currency: appState.currency,
    theme: appState.theme,
    user: appState.currentUser,
    transactions: appState.transactions,
    categories: appState.categories,
    budgets: appState.budgets,
    savingsGoals: appState.savingsGoals,
    recurring: appState.recurring,
    notifications: appState.notifications
  };

  const jsonStr = JSON.stringify(fullBackup, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `ExpenseTracker_Backup_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showToast('Full system backup downloaded as JSON!', 'success');
}

function restoreBackupJSON(file) {
  if (!file) return;

  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);

      // Validate structure integrity
      if (!data || !Array.isArray(data.transactions) || !Array.isArray(data.categories)) {
        showToast('Invalid backup file schema. Restore aborted.', 'error');
        return;
      }

      showConfirmDialog(
        'Confirm System Restore',
        `Restoring this backup will replace current records with ${data.transactions.length} transactions and ${data.categories.length} categories. Proceed?`,
        () => {
          appState.transactions = data.transactions;
          appState.categories = data.categories;
          appState.budgets = data.budgets || [];
          appState.savingsGoals = data.savingsGoals || [];
          appState.recurring = data.recurring || [];
          appState.notifications = data.notifications || [];
          if (data.currency) appState.currency = data.currency;

          saveData(STORAGE_KEYS.TRANSACTIONS, appState.transactions);
          saveData(STORAGE_KEYS.CATEGORIES, appState.categories);
          saveData(STORAGE_KEYS.BUDGETS, appState.budgets);
          saveData(STORAGE_KEYS.SAVINGS, appState.savingsGoals);
          saveData(STORAGE_KEYS.RECURRING, appState.recurring);
          saveData(STORAGE_KEYS.NOTIFICATIONS, appState.notifications);
          saveData(STORAGE_KEYS.CURRENCY, appState.currency);

          syncCurrencyDropdowns();
          renderCurrentView();
          showToast('System backup restored successfully!', 'success');
        }
      );
    } catch (err) {
      console.error(err);
      showToast('Failed to parse backup JSON file.', 'error');
    }
  };
  reader.readAsText(file);
}

function resetToSampleData() {
  showConfirmDialog(
    'Reset to Sample Demo Data',
    'This will reload the initial 22 realistic transactions, categories, and budgets. Are you sure?',
    () => {
      appState.categories = getInitialDemoCategories();
      appState.transactions = getInitialDemoTransactions();
      appState.budgets = getInitialDemoBudgets();
      appState.savingsGoals = getInitialDemoSavings();
      appState.recurring = getInitialDemoRecurring();
      appState.notifications = getInitialDemoNotifications();

      saveData(STORAGE_KEYS.CATEGORIES, appState.categories);
      saveData(STORAGE_KEYS.TRANSACTIONS, appState.transactions);
      saveData(STORAGE_KEYS.BUDGETS, appState.budgets);
      saveData(STORAGE_KEYS.SAVINGS, appState.savingsGoals);
      saveData(STORAGE_KEYS.RECURRING, appState.recurring);
      saveData(STORAGE_KEYS.NOTIFICATIONS, appState.notifications);

      renderCurrentView();
      showToast('Reset to original sample data completed!', 'success');
    }
  );
}

function clearAllAppData() {
  showConfirmDialog(
    'Wipe All Application Data',
    'Warning: This action permanently clears all transactions, budgets, goals, and categories from LocalStorage. Continue?',
    () => {
      appState.transactions = [];
      appState.budgets = [];
      appState.savingsGoals = [];
      appState.recurring = [];
      appState.notifications = [];

      saveData(STORAGE_KEYS.TRANSACTIONS, []);
      saveData(STORAGE_KEYS.BUDGETS, []);
      saveData(STORAGE_KEYS.SAVINGS, []);
      saveData(STORAGE_KEYS.RECURRING, []);
      saveData(STORAGE_KEYS.NOTIFICATIONS, []);

      renderCurrentView();
      showToast('All transaction and ledger records cleared.', 'info');
    }
  );
}

// ============================================================================
// UI RENDERING CONTROLLER (VIEWS)
// ============================================================================

function switchView(viewName) {
  appState.currentView = viewName;

  // Toggle active class on sidebar navigation items
  document.querySelectorAll('.app-sidebar .nav-item').forEach(link => {
    link.classList.toggle('active', link.getAttribute('data-view') === viewName);
  });

  // Toggle active class on section views
  document.querySelectorAll('.app-content .view-section').forEach(sec => {
    sec.classList.toggle('active', sec.id === `view-${viewName}`);
  });

  // Update Header Title & Subtitle
  const titles = {
    dashboard: { title: 'Financial Dashboard', sub: 'Track Your Money. Control Your Spending. Achieve Your Goals.' },
    transactions: { title: 'Transaction Ledger', sub: 'Record, filter, search, and manage master cash movements.' },
    income: { title: 'Income Management', sub: 'Monitor revenue streams, contract earnings, and salary inflows.' },
    expenses: { title: 'Expense Management', sub: 'Analyze outlays, daily burn, and cost reduction opportunities.' },
    categories: { title: 'Category Management', sub: 'Customize budget classification with icons and color themes.' },
    budgets: { title: 'Category Budgets & Alerts', sub: 'Enforce periodic spending limits with proactive visual alerts.' },
    savings: { title: 'Savings Goals', sub: 'Achieve financial milestones with contribution tracking.' },
    reports: { title: 'Reports & Analytics', sub: 'Comprehensive financial breakdowns, trends, and export.' },
    recurring: { title: 'Recurring Transactions', sub: 'Simulate periodic salaries, recurring subscriptions, and bills.' },
    profile: { title: 'User Profile', sub: 'Manage personal details, default currency, and demo security.' },
    settings: { title: 'System Settings', sub: 'Themes, notifications preferences, and database backup controls.' }
  };

  const meta = titles[viewName] || titles.dashboard;
  const titleEl = document.getElementById('header-view-title');
  const subEl = document.getElementById('header-view-subtitle');
  if (titleEl) titleEl.textContent = meta.title;
  if (subEl) subEl.textContent = meta.sub;

  // Close mobile sidebar if open
  closeMobileSidebar();

  // Render specific view
  renderCurrentView();
}

function renderCurrentView() {
  // Update sidebar counter badge
  const badgeEl = document.getElementById('nav-tx-count');
  if (badgeEl) badgeEl.textContent = appState.transactions.length;

  // Always update notification bell
  renderNotifications();

  switch (appState.currentView) {
    case 'dashboard':
      renderDashboardView();
      break;
    case 'transactions':
      renderTransactionsView();
      break;
    case 'income':
      renderIncomeView();
      break;
    case 'expenses':
      renderExpensesView();
      break;
    case 'categories':
      renderCategoriesView();
      break;
    case 'budgets':
      renderBudgetsView();
      break;
    case 'savings':
      renderSavingsView();
      break;
    case 'reports':
      renderReportsView();
      break;
    case 'recurring':
      renderRecurringView();
      break;
    case 'profile':
      updateUserInterfaceProfile();
      break;
    case 'settings':
      syncCurrencyDropdowns();
      break;
  }
}

// ----------------------------------------------------------------------------
// VIEW 1: DASHBOARD
// ----------------------------------------------------------------------------
function renderDashboardView() {
  const { totalIncome, totalExpense, balance } = calculateBalance();
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlyInc = calculateMonthlyIncome(currentYear, currentMonth);
  const monthlyExp = calculateMonthlyExpenses(currentYear, currentMonth);
  const monthlySavings = monthlyInc - monthlyExp;
  const savingsRate = monthlyInc > 0 ? ((monthlySavings / monthlyInc) * 100).toFixed(1) : '0';

  // Total allocated vs remaining in budgets
  const totalBudget = appState.budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpentInBudgets = appState.budgets.reduce((sum, b) => {
    return sum + calculateActualSpendingForCategory(b.category, b.startDate, b.endDate);
  }, 0);
  const budgetRemaining = Math.max(0, totalBudget - totalSpentInBudgets);

  // Savings goals progress
  const totalTarget = appState.savingsGoals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalAccumulated = appState.savingsGoals.reduce((sum, g) => sum + g.currentAmount, 0);
  const goalsPercent = totalTarget > 0 ? ((totalAccumulated / totalTarget) * 100).toFixed(0) : '0';

  // Update KPI Cards
  const elBal = document.getElementById('dash-total-balance');
  if (elBal) {
    elBal.textContent = formatMoney(balance);
    elBal.style.color = balance >= 0 ? 'var(--text-primary)' : 'var(--danger)';
  }

  const elInc = document.getElementById('dash-total-income');
  if (elInc) elInc.textContent = formatMoney(totalIncome);

  const elExp = document.getElementById('dash-total-expenses');
  if (elExp) elExp.textContent = formatMoney(totalExpense);

  const elSav = document.getElementById('dash-monthly-savings');
  if (elSav) elSav.textContent = formatMoney(monthlySavings);

  const elRate = document.getElementById('dash-savings-rate');
  if (elRate) elRate.textContent = `${savingsRate}% Monthly Savings Rate`;

  const elRem = document.getElementById('dash-budget-remaining');
  if (elRem) elRem.textContent = formatMoney(budgetRemaining);

  const elGoalPct = document.getElementById('dash-goals-percent');
  if (elGoalPct) elGoalPct.textContent = `${goalsPercent}%`;

  const elGoalCnt = document.getElementById('dash-goals-count');
  if (elGoalCnt) elGoalCnt.textContent = `${appState.savingsGoals.length} active target goals`;

  const elIncCnt = document.getElementById('dash-income-count');
  if (elIncCnt) elIncCnt.textContent = `${appState.transactions.filter(t => t.type === 'income').length} Inflow Entries`;

  const elExpCnt = document.getElementById('dash-expense-count');
  if (elExpCnt) elExpCnt.textContent = `${appState.transactions.filter(t => t.type === 'expense').length} Outflow Entries`;

  // Render Recent Transactions (Latest 5)
  const recentTbody = document.getElementById('dash-recent-tx-tbody');
  if (recentTbody) {
    const recent = [...appState.transactions].slice(0, 5);
    if (recent.length === 0) {
      recentTbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 2rem; color: var(--text-muted);">No transactions recorded yet.</td></tr>`;
    } else {
      recentTbody.innerHTML = recent
        .map(t => {
          const cat = appState.categories.find(c => c.name === t.category);
          const icon = cat ? cat.icon : 'fa-tag';
          const color = cat ? cat.color : '#2563eb';
          const isInc = t.type === 'income';

          return `
            <tr>
              <td>${formatDate(t.date)}</td>
              <td>
                <div class="item-title-cell">
                  <div class="item-category-icon" style="background-color: ${color}15; color: ${color};">
                    <i class="fa-solid ${icon}"></i>
                  </div>
                  <div>
                    <div>${escapeHTML(t.title)}</div>
                    <small style="color: var(--text-muted);">${escapeHTML(t.paymentMethod || 'Cash')}</small>
                  </div>
                </div>
              </td>
              <td><span class="badge badge-neutral">${escapeHTML(t.category)}</span></td>
              <td><span class="badge ${isInc ? 'badge-income' : 'badge-expense'}">${isInc ? 'Income' : 'Expense'}</span></td>
              <td class="amount ${isInc ? 'amount-income' : 'amount-expense'}" style="text-align: right;">
                ${isInc ? '+' : '-'} ${formatMoney(t.amount)}
              </td>
            </tr>
          `;
        })
        .join('');
    }
  }

  // Render Budget Previews in Dashboard
  const budgetPreview = document.getElementById('dash-budget-preview-container');
  if (budgetPreview) {
    if (appState.budgets.length === 0) {
      budgetPreview.innerHTML = `<p class="text-xs text-muted">No budgets configured.</p>`;
    } else {
      budgetPreview.innerHTML = appState.budgets
        .slice(0, 3)
        .map(b => {
          const spent = calculateActualSpendingForCategory(b.category, b.startDate, b.endDate);
          const usage = Math.min(100, (spent / b.amount) * 100);
          const statusClass = usage >= 100 ? 'exceeded' : usage >= 75 ? 'warning' : 'safe';

          return `
            <div class="progress-container">
              <div class="progress-labels">
                <span>${escapeHTML(b.name)}</span>
                <span class="font-mono">${formatMoney(spent)} / ${formatMoney(b.amount)} (${usage.toFixed(0)}%)</span>
              </div>
              <div class="progress-track">
                <div class="progress-bar ${statusClass}" style="width: ${usage}%"></div>
              </div>
            </div>
          `;
        })
        .join('');
    }
  }

  // Render Savings Goals Preview in Dashboard
  const goalsPreview = document.getElementById('dash-goals-preview-container');
  if (goalsPreview) {
    if (appState.savingsGoals.length === 0) {
      goalsPreview.innerHTML = `<p class="text-xs text-muted">No savings goals created.</p>`;
    } else {
      goalsPreview.innerHTML = appState.savingsGoals
        .slice(0, 3)
        .map(g => {
          const progress = Math.min(100, (g.currentAmount / g.targetAmount) * 100);
          return `
            <div class="progress-container">
              <div class="progress-labels">
                <span>${escapeHTML(g.name)}</span>
                <span class="font-mono">${progress.toFixed(0)}%</span>
              </div>
              <div class="progress-track">
                <div class="progress-bar primary" style="width: ${progress}%"></div>
              </div>
            </div>
          `;
        })
        .join('');
    }
  }

  // Render Dashboard Charts
  renderDashboardCharts();
}

function renderDashboardCharts() {
  if (typeof Chart === 'undefined') return;

  const isDark = appState.theme === 'dark';
  const textColor = isDark ? '#cbd5e1' : '#475569';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)';

  // 1. Last 6 Months Cash Flow Bar Chart
  const ctxCashflow = document.getElementById('chart-dash-cashflow');
  if (ctxCashflow) {
    if (activeCharts.dashCashflow) activeCharts.dashCashflow.destroy();

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const labels = [];
    const incomeData = [];
    const expenseData = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mIdx = d.getMonth();
      const yr = d.getFullYear();
      labels.push(`${monthNames[mIdx]} ${yr.toString().slice(2)}`);

      incomeData.push(calculateMonthlyIncome(yr, mIdx));
      expenseData.push(calculateMonthlyExpenses(yr, mIdx));
    }

    activeCharts.dashCashflow = new Chart(ctxCashflow, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Inflows (Income)',
            data: incomeData,
            backgroundColor: '#16a34a',
            borderRadius: 4
          },
          {
            label: 'Outflows (Expense)',
            data: expenseData,
            backgroundColor: '#dc2626',
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: { color: textColor, font: { family: 'Plus Jakarta Sans', weight: 600 } }
          },
          tooltip: {
            callbacks: {
              label: ctx => ` ${ctx.dataset.label}: ${formatMoney(ctx.raw)}`
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: textColor }
          },
          y: {
            grid: { color: gridColor },
            ticks: {
              color: textColor,
              callback: val => CURRENCY_MAP[appState.currency].symbol + ' ' + (val >= 1000 ? val / 1000 + 'k' : val)
            }
          }
        }
      }
    });
  }

  // 2. Expense Category Doughnut Chart
  const ctxCategories = document.getElementById('chart-dash-categories');
  if (ctxCategories) {
    if (activeCharts.dashCategories) activeCharts.dashCategories.destroy();

    // Group expenses by category
    const categoryTotals = {};
    appState.transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
      });

    const catLabels = Object.keys(categoryTotals);
    const catData = Object.values(categoryTotals);
    const catColors = catLabels.map((name, i) => {
      const cat = appState.categories.find(c => c.name === name);
      return cat ? cat.color : CATEGORY_COLORS[i % CATEGORY_COLORS.length];
    });

    if (catLabels.length === 0) {
      catLabels.push('No Expenses');
      catData.push(1);
      catColors.push('#cbd5e1');
    }

    activeCharts.dashCategories = new Chart(ctxCategories, {
      type: 'doughnut',
      data: {
        labels: catLabels,
        datasets: [
          {
            data: catData,
            backgroundColor: catColors,
            borderWidth: 2,
            borderColor: isDark ? '#131d33' : '#ffffff'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: {
            position: 'right',
            labels: { color: textColor, font: { size: 11, family: 'Plus Jakarta Sans' }, boxWidth: 12 }
          },
          tooltip: {
            callbacks: {
              label: ctx => ` ${ctx.label}: ${formatMoney(ctx.raw)}`
            }
          }
        }
      }
    });
  }
}

// ----------------------------------------------------------------------------
// VIEW 2: TRANSACTIONS MANAGEMENT
// ----------------------------------------------------------------------------
function renderTransactionsView() {
  populateCategorySelects();

  const searchVal = (document.getElementById('tx-search-input')?.value || '').toLowerCase().trim();
  const typeFilter = document.getElementById('tx-filter-type')?.value || 'all';
  const catFilter = document.getElementById('tx-filter-category')?.value || 'all';
  const payFilter = document.getElementById('tx-filter-payment')?.value || 'all';
  const datePreset = document.getElementById('tx-filter-date-preset')?.value || 'this-month';
  const sortBy = document.getElementById('tx-sort-select')?.value || 'date-desc';

  let filtered = [...appState.transactions];

  // 1. Search Query (title, description, notes)
  if (searchVal) {
    filtered = filtered.filter(
      t =>
        (t.title && t.title.toLowerCase().includes(searchVal)) ||
        (t.description && t.description.toLowerCase().includes(searchVal)) ||
        (t.notes && t.notes.toLowerCase().includes(searchVal)) ||
        (t.category && t.category.toLowerCase().includes(searchVal))
    );
  }

  // 2. Type Filter
  if (typeFilter !== 'all') {
    filtered = filtered.filter(t => t.type === typeFilter);
  }

  // 3. Category Filter
  if (catFilter !== 'all') {
    filtered = filtered.filter(t => t.category === catFilter);
  }

  // 4. Payment Method
  if (payFilter !== 'all') {
    filtered = filtered.filter(t => t.paymentMethod === payFilter);
  }

  // 5. Date Presets
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  if (datePreset === 'today') {
    filtered = filtered.filter(t => t.date === todayStr);
  } else if (datePreset === 'this-week') {
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const startStr = startOfWeek.toISOString().split('T')[0];
    filtered = filtered.filter(t => t.date >= startStr && t.date <= todayStr);
  } else if (datePreset === 'this-month') {
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    filtered = filtered.filter(t => t.date >= startOfMonth);
  } else if (datePreset === 'last-month') {
    const startOfLast = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
    const endOfLast = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];
    filtered = filtered.filter(t => t.date >= startOfLast && t.date <= endOfLast);
  } else if (datePreset === 'this-year') {
    const startOfYear = `${now.getFullYear()}-01-01`;
    filtered = filtered.filter(t => t.date >= startOfYear);
  }

  // 6. Sorting
  filtered.sort((a, b) => {
    if (sortBy === 'date-desc') return new Date(b.date) - new Date(a.date);
    if (sortBy === 'date-asc') return new Date(a.date) - new Date(b.date);
    if (sortBy === 'amount-desc') return b.amount - a.amount;
    if (sortBy === 'amount-asc') return a.amount - b.amount;
    if (sortBy === 'title-asc') return (a.title || '').localeCompare(b.title || '');
    return 0;
  });

  // Update counter
  const counterEl = document.getElementById('tx-results-count');
  if (counterEl) {
    counterEl.textContent = `Showing ${filtered.length} of ${appState.transactions.length} transactions`;
  }

  // Render Table
  const tbody = document.getElementById('tx-master-tbody');
  if (!tbody) return;

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7">
          <div class="empty-state">
            <div class="empty-state-icon"><i class="fa-solid fa-receipt"></i></div>
            <h4>No Transactions Found</h4>
            <p>No records matched your search filters. Try adjusting the query or record a new transaction.</p>
            <button class="btn btn-primary" id="btn-empty-add-tx"><i class="fa-solid fa-plus"></i> Add Transaction</button>
          </div>
        </td>
      </tr>
    `;
    const emptyBtn = document.getElementById('btn-empty-add-tx');
    if (emptyBtn) emptyBtn.addEventListener('click', () => openTransactionModal());
    return;
  }

  tbody.innerHTML = filtered
    .map(t => {
      const cat = appState.categories.find(c => c.name === t.category);
      const icon = cat ? cat.icon : 'fa-tag';
      const color = cat ? cat.color : '#2563eb';
      const isInc = t.type === 'income';

      return `
        <tr>
          <td>${formatDate(t.date)}</td>
          <td>
            <div class="item-title-cell" style="cursor: pointer;" onclick="viewTransactionDetail('${t.id}')">
              <div class="item-category-icon" style="background-color: ${color}15; color: ${color};">
                <i class="fa-solid ${icon}"></i>
              </div>
              <div>
                <div style="font-weight: 700; color: var(--text-primary);">${escapeHTML(t.title)}</div>
                ${t.description ? `<small style="color: var(--text-muted);">${escapeHTML(t.description)}</small>` : ''}
              </div>
            </div>
          </td>
          <td><span class="badge badge-neutral">${escapeHTML(t.category)}</span></td>
          <td>${escapeHTML(t.paymentMethod || 'Cash')}</td>
          <td><span class="badge ${isInc ? 'badge-income' : 'badge-expense'}">${isInc ? 'Income' : 'Expense'}</span></td>
          <td class="amount ${isInc ? 'amount-income' : 'amount-expense'}" style="text-align: right;">
            ${isInc ? '+' : '-'} ${formatMoney(t.amount)}
          </td>
          <td style="text-align: center;">
            <div class="table-actions" style="justify-content: center;">
              <button class="action-btn" title="View Details" onclick="viewTransactionDetail('${t.id}')">
                <i class="fa-regular fa-eye"></i>
              </button>
              <button class="action-btn" title="Edit" onclick="editTransactionModal('${t.id}')">
                <i class="fa-regular fa-pen-to-square"></i>
              </button>
              <button class="action-btn delete" title="Delete" onclick="confirmDeleteTransaction('${t.id}')">
                <i class="fa-regular fa-trash-can"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    })
    .join('');
}

// ----------------------------------------------------------------------------
// VIEW 3: INCOME MANAGEMENT
// ----------------------------------------------------------------------------
function renderIncomeView() {
  populateIncomeCategorySelect();

  const incomes = appState.transactions.filter(t => t.type === 'income');
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const total = incomes.reduce((s, t) => s + t.amount, 0);
  const thisMonthTotal = calculateMonthlyIncome(currentYear, currentMonth);
  const monthCount = incomes.filter(t => {
    const d = new Date(t.date);
    return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
  }).length;

  const avg = incomes.length > 0 ? total / incomes.length : 0;

  // Find Top Source
  const categoryTotals = {};
  incomes.forEach(t => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
  });
  let topCat = 'None';
  let topAmt = 0;
  Object.entries(categoryTotals).forEach(([cat, amt]) => {
    if (amt > topAmt) {
      topAmt = amt;
      topCat = cat;
    }
  });

  const elTot = document.getElementById('income-total-kpi');
  if (elTot) elTot.textContent = formatMoney(total);

  const elMon = document.getElementById('income-month-kpi');
  if (elMon) elMon.textContent = formatMoney(thisMonthTotal);

  const elCnt = document.getElementById('income-month-count');
  if (elCnt) elCnt.textContent = `${monthCount} income deposits this month`;

  const elTop = document.getElementById('income-top-source');
  if (elTop) elTop.textContent = topCat;

  const elTopAmt = document.getElementById('income-top-source-amount');
  if (elTopAmt) elTopAmt.textContent = formatMoney(topAmt);

  const elAvg = document.getElementById('income-avg-kpi');
  if (elAvg) elAvg.textContent = formatMoney(avg);

  // Filter Table
  const searchVal = (document.getElementById('income-search-input')?.value || '').toLowerCase().trim();
  const catFilter = document.getElementById('income-filter-category')?.value || 'all';

  let filtered = incomes;
  if (searchVal) {
    filtered = filtered.filter(
      t =>
        (t.title && t.title.toLowerCase().includes(searchVal)) ||
        (t.description && t.description.toLowerCase().includes(searchVal))
    );
  }
  if (catFilter !== 'all') {
    filtered = filtered.filter(t => t.category === catFilter);
  }

  const tbody = document.getElementById('income-table-tbody');
  if (!tbody) return;

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 2.5rem; color: var(--text-muted);">No income entries matched.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered
    .map(t => {
      const cat = appState.categories.find(c => c.name === t.category);
      const icon = cat ? cat.icon : 'fa-briefcase';
      const color = cat ? cat.color : '#16a34a';

      return `
        <tr>
          <td>${formatDate(t.date)}</td>
          <td>
            <div class="item-title-cell">
              <div class="item-category-icon" style="background-color: ${color}15; color: ${color};">
                <i class="fa-solid ${icon}"></i>
              </div>
              <strong>${escapeHTML(t.title)}</strong>
            </div>
          </td>
          <td><span class="badge badge-neutral">${escapeHTML(t.category)}</span></td>
          <td>${escapeHTML(t.paymentMethod || 'Bank Transfer')}</td>
          <td>${escapeHTML(t.description || '-')}</td>
          <td class="amount amount-income" style="text-align: right;">+ ${formatMoney(t.amount)}</td>
          <td style="text-align: center;">
            <div class="table-actions" style="justify-content: center;">
              <button class="action-btn" title="Edit" onclick="editTransactionModal('${t.id}')">
                <i class="fa-regular fa-pen-to-square"></i>
              </button>
              <button class="action-btn delete" title="Delete" onclick="confirmDeleteTransaction('${t.id}')">
                <i class="fa-regular fa-trash-can"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    })
    .join('');
}

// ----------------------------------------------------------------------------
// VIEW 4: EXPENSE MANAGEMENT
// ----------------------------------------------------------------------------
function renderExpensesView() {
  populateExpenseCategorySelect();

  const expenses = appState.transactions.filter(t => t.type === 'expense');
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const total = expenses.reduce((s, t) => s + t.amount, 0);
  const thisMonthTotal = calculateMonthlyExpenses(currentYear, currentMonth);
  const monthCount = expenses.filter(t => {
    const d = new Date(t.date);
    return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
  }).length;

  const currentDay = now.getDate() || 1;
  const dailyAvg = thisMonthTotal / currentDay;

  // Top Category
  const catTotals = {};
  expenses.forEach(t => {
    catTotals[t.category] = (catTotals[t.category] || 0) + t.amount;
  });
  let topCat = 'None';
  let topAmt = 0;
  Object.entries(catTotals).forEach(([cat, amt]) => {
    if (amt > topAmt) {
      topAmt = amt;
      topCat = cat;
    }
  });

  const elTot = document.getElementById('expense-total-kpi');
  if (elTot) elTot.textContent = formatMoney(total);

  const elMon = document.getElementById('expense-month-kpi');
  if (elMon) elMon.textContent = formatMoney(thisMonthTotal);

  const elCnt = document.getElementById('expense-month-count');
  if (elCnt) elCnt.textContent = `${monthCount} outlays recorded this month`;

  const elTop = document.getElementById('expense-top-category');
  if (elTop) elTop.textContent = topCat;

  const elTopAmt = document.getElementById('expense-top-category-amount');
  if (elTopAmt) elTopAmt.textContent = formatMoney(topAmt);

  const elAvg = document.getElementById('expense-daily-avg-kpi');
  if (elAvg) elAvg.textContent = formatMoney(dailyAvg);

  // Filter Table
  const searchVal = (document.getElementById('expense-search-input')?.value || '').toLowerCase().trim();
  const catFilter = document.getElementById('expense-filter-category')?.value || 'all';

  let filtered = expenses;
  if (searchVal) {
    filtered = filtered.filter(
      t =>
        (t.title && t.title.toLowerCase().includes(searchVal)) ||
        (t.description && t.description.toLowerCase().includes(searchVal))
    );
  }
  if (catFilter !== 'all') {
    filtered = filtered.filter(t => t.category === catFilter);
  }

  const tbody = document.getElementById('expense-table-tbody');
  if (!tbody) return;

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 2.5rem; color: var(--text-muted);">No expenses matched.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered
    .map(t => {
      const cat = appState.categories.find(c => c.name === t.category);
      const icon = cat ? cat.icon : 'fa-receipt';
      const color = cat ? cat.color : '#dc2626';

      return `
        <tr>
          <td>${formatDate(t.date)}</td>
          <td>
            <div class="item-title-cell">
              <div class="item-category-icon" style="background-color: ${color}15; color: ${color};">
                <i class="fa-solid ${icon}"></i>
              </div>
              <strong>${escapeHTML(t.title)}</strong>
            </div>
          </td>
          <td><span class="badge badge-neutral">${escapeHTML(t.category)}</span></td>
          <td>${escapeHTML(t.paymentMethod || 'Debit Card')}</td>
          <td>${escapeHTML(t.description || '-')}</td>
          <td class="amount amount-expense" style="text-align: right;">- ${formatMoney(t.amount)}</td>
          <td style="text-align: center;">
            <div class="table-actions" style="justify-content: center;">
              <button class="action-btn" title="Edit" onclick="editTransactionModal('${t.id}')">
                <i class="fa-regular fa-pen-to-square"></i>
              </button>
              <button class="action-btn delete" title="Delete" onclick="confirmDeleteTransaction('${t.id}')">
                <i class="fa-regular fa-trash-can"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    })
    .join('');
}

// ----------------------------------------------------------------------------
// VIEW 5: CATEGORIES MANAGEMENT
// ----------------------------------------------------------------------------
let activeCategoryTypeTab = 'all';

function renderCategoriesView() {
  const searchVal = (document.getElementById('category-search-input')?.value || '').toLowerCase().trim();
  const container = document.getElementById('categories-grid-container');
  if (!container) return;

  let filtered = appState.categories;
  if (activeCategoryTypeTab !== 'all') {
    filtered = filtered.filter(c => c.type === activeCategoryTypeTab);
  }
  if (searchVal) {
    filtered = filtered.filter(c => c.name.toLowerCase().includes(searchVal));
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state-icon"><i class="fa-solid fa-tags"></i></div>
        <h4>No Categories Found</h4>
        <p>No categories matched the criteria. Create custom categories to organize your cashflow.</p>
        <button class="btn btn-primary" id="btn-empty-add-cat"><i class="fa-solid fa-plus"></i> Create Category</button>
      </div>
    `;
    const btn = document.getElementById('btn-empty-add-cat');
    if (btn) btn.addEventListener('click', () => openCategoryModal());
    return;
  }

  container.innerHTML = filtered
    .map(c => {
      const txList = appState.transactions.filter(t => t.category === c.name);
      const txCount = txList.length;
      const totalSum = txList.reduce((s, t) => s + t.amount, 0);

      return `
        <div class="category-card">
          <div class="category-header">
            <div class="category-info">
              <div class="item-category-icon" style="background-color: ${c.color}15; color: ${c.color}; width: 42px; height: 42px; font-size: 1.15rem;">
                <i class="fa-solid ${c.icon}"></i>
              </div>
              <div>
                <h4 style="font-weight: 700; color: var(--text-primary); font-size: 1.05rem;">${escapeHTML(c.name)}</h4>
                <span class="badge ${c.type === 'income' ? 'badge-income' : 'badge-expense'}">${c.type === 'income' ? 'Income Stream' : 'Expense'}</span>
              </div>
            </div>
            <div class="table-actions">
              <button class="action-btn" title="Edit Category" onclick="editCategoryModal('${c.id}')">
                <i class="fa-regular fa-pen-to-square"></i>
              </button>
              <button class="action-btn delete" title="Delete Category" onclick="confirmDeleteCategory('${c.id}')">
                <i class="fa-regular fa-trash-can"></i>
              </button>
            </div>
          </div>

          <div class="goal-meta-row" style="margin-top: 0.5rem;">
            <span>Transactions: <strong>${txCount}</strong></span>
            <span class="font-mono">Volume: <strong>${formatMoney(totalSum)}</strong></span>
          </div>
        </div>
      `;
    })
    .join('');
}

// ----------------------------------------------------------------------------
// VIEW 6: BUDGET MANAGEMENT
// ----------------------------------------------------------------------------
function renderBudgetsView() {
  populateBudgetCategorySelect();

  const totalBudgeted = appState.budgets.reduce((s, b) => s + b.amount, 0);
  let totalSpent = 0;
  let overrunCount = 0;

  appState.budgets.forEach(b => {
    const s = calculateActualSpendingForCategory(b.category, b.startDate, b.endDate);
    totalSpent += s;
    if (s > b.amount) overrunCount++;
  });

  const remaining = Math.max(0, totalBudgeted - totalSpent);
  const overallUsage = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;

  const elBud = document.getElementById('budget-total-allocated');
  if (elBud) elBud.textContent = formatMoney(totalBudgeted);

  const elSp = document.getElementById('budget-total-spent');
  if (elSp) elSp.textContent = formatMoney(totalSpent);

  const elOvPct = document.getElementById('budget-overall-percent');
  if (elOvPct) elOvPct.textContent = `${overallUsage.toFixed(1)}% total utilized`;

  const elRem = document.getElementById('budget-total-remaining');
  if (elRem) elRem.textContent = formatMoney(remaining);

  const elOvCnt = document.getElementById('budget-overrun-count');
  if (elOvCnt) {
    elOvCnt.textContent = overrunCount;
    elOvCnt.style.color = overrunCount > 0 ? 'var(--danger)' : 'var(--text-primary)';
  }

  // Filter by period
  const periodFilter = document.getElementById('budget-filter-period')?.value || 'Monthly';
  let filtered = appState.budgets;
  if (periodFilter !== 'all') {
    filtered = filtered.filter(b => b.period === periodFilter);
  }

  const container = document.getElementById('budgets-grid-container');
  if (!container) return;

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state-icon"><i class="fa-solid fa-chart-pie"></i></div>
        <h4>No Budgets Configured</h4>
        <p>Set a spending budget for essential categories to prevent overspending.</p>
        <button class="btn btn-primary" id="btn-empty-add-budget"><i class="fa-solid fa-plus"></i> Set Category Budget</button>
      </div>
    `;
    const btn = document.getElementById('btn-empty-add-budget');
    if (btn) btn.addEventListener('click', () => openBudgetModal());
    return;
  }

  container.innerHTML = filtered
    .map(b => {
      const cat = appState.categories.find(c => c.name === b.category);
      const icon = cat ? cat.icon : 'fa-chart-pie';
      const color = cat ? cat.color : '#2563eb';

      const spent = calculateActualSpendingForCategory(b.category, b.startDate, b.endDate);
      const usage = b.amount > 0 ? (spent / b.amount) * 100 : 0;
      const progressWidth = Math.min(100, usage);
      const rem = b.amount - spent;

      let statusBadge = '';
      let barClass = 'safe';

      if (usage >= 100) {
        statusBadge = `<span class="budget-status-pill exceeded"><i class="fa-solid fa-circle-exclamation"></i> Over Budget (${usage.toFixed(0)}%)</span>`;
        barClass = 'exceeded';
      } else if (usage >= 90) {
        statusBadge = `<span class="budget-status-pill warning"><i class="fa-solid fa-triangle-exclamation"></i> 90% Alert (${usage.toFixed(0)}%)</span>`;
        barClass = 'warning';
      } else if (usage >= 75) {
        statusBadge = `<span class="budget-status-pill warning">75% Alert</span>`;
        barClass = 'warning';
      } else if (usage >= 50) {
        statusBadge = `<span class="budget-status-pill safe">50% Used</span>`;
        barClass = 'safe';
      } else {
        statusBadge = `<span class="budget-status-pill safe">Under Control</span>`;
        barClass = 'safe';
      }

      return `
        <div class="budget-card">
          <div class="budget-header">
            <div class="budget-category-info">
              <div class="item-category-icon" style="background-color: ${color}15; color: ${color}; width: 38px; height: 38px;">
                <i class="fa-solid ${icon}"></i>
              </div>
              <div>
                <h4 style="font-weight: 700;">${escapeHTML(b.name)}</h4>
                <small style="color: var(--text-muted);">${escapeHTML(b.category)} &bull; ${b.period}</small>
              </div>
            </div>
            ${statusBadge}
          </div>

          <div class="progress-container">
            <div class="progress-labels">
              <span>Spent: <strong class="font-mono">${formatMoney(spent)}</strong></span>
              <span>Cap: <strong class="font-mono">${formatMoney(b.amount)}</strong></span>
            </div>
            <div class="progress-track">
              <div class="progress-bar ${barClass}" style="width: ${progressWidth}%"></div>
            </div>
          </div>

          <div class="budget-meta-row">
            <div>
              <span>${rem >= 0 ? 'Remaining:' : 'Overrun:'} </span>
              <strong class="font-mono" style="color: ${rem >= 0 ? 'var(--success)' : 'var(--danger)'};">
                ${formatMoney(Math.abs(rem))}
              </strong>
            </div>
            <div class="table-actions">
              <button class="action-btn" title="Edit Budget" onclick="editBudgetModal('${b.id}')">
                <i class="fa-regular fa-pen-to-square"></i>
              </button>
              <button class="action-btn delete" title="Delete Budget" onclick="confirmDeleteBudget('${b.id}')">
                <i class="fa-regular fa-trash-can"></i>
              </button>
            </div>
          </div>
        </div>
      `;
    })
    .join('');
}

// ----------------------------------------------------------------------------
// VIEW 7: SAVINGS GOALS
// ----------------------------------------------------------------------------
function renderSavingsView() {
  const totalTarget = appState.savingsGoals.reduce((s, g) => s + g.targetAmount, 0);
  const totalSaved = appState.savingsGoals.reduce((s, g) => s + g.currentAmount, 0);
  const remaining = Math.max(0, totalTarget - totalSaved);
  const completedCount = appState.savingsGoals.filter(g => g.currentAmount >= g.targetAmount).length;
  const overallRate = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  const elTgt = document.getElementById('savings-total-target');
  if (elTgt) elTgt.textContent = formatMoney(totalTarget);

  const elAcc = document.getElementById('savings-total-accumulated');
  if (elAcc) elAcc.textContent = formatMoney(totalSaved);

  const elRate = document.getElementById('savings-overall-rate');
  if (elRate) elRate.textContent = `${overallRate.toFixed(1)}% total funded`;

  const elRem = document.getElementById('savings-total-remaining');
  if (elRem) elRem.textContent = formatMoney(remaining);

  const elCmp = document.getElementById('savings-completed-count');
  if (elCmp) elCmp.textContent = completedCount;

  const container = document.getElementById('savings-grid-container');
  if (!container) return;

  if (appState.savingsGoals.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state-icon"><i class="fa-solid fa-bullseye"></i></div>
        <h4>No Savings Goals Created</h4>
        <p>Set a milestone like an emergency fund or laptop upgrade, and save towards it.</p>
        <button class="btn btn-primary" id="btn-empty-add-goal"><i class="fa-solid fa-plus"></i> New Savings Goal</button>
      </div>
    `;
    const btn = document.getElementById('btn-empty-add-goal');
    if (btn) btn.addEventListener('click', () => openSavingsModal());
    return;
  }

  container.innerHTML = appState.savingsGoals
    .map(g => {
      const progress = g.targetAmount > 0 ? (g.currentAmount / g.targetAmount) * 100 : 0;
      const progressWidth = Math.min(100, progress);
      const isComplete = progress >= 100;
      const rem = Math.max(0, g.targetAmount - g.currentAmount);

      return `
        <div class="goal-card">
          <div class="goal-header">
            <div class="goal-info">
              <div class="item-category-icon" style="background-color: var(--primary-light); color: var(--primary); width: 42px; height: 42px; font-size: 1.15rem;">
                <i class="fa-solid ${g.icon || 'fa-bullseye'}"></i>
              </div>
              <div>
                <h4 style="font-weight: 700; color: var(--text-primary); font-size: 1.05rem;">${escapeHTML(g.name)}</h4>
                <small style="color: var(--text-muted);">Due: ${formatDate(g.targetDate)}</small>
              </div>
            </div>
            ${
              isComplete
                ? `<span class="badge badge-income"><i class="fa-solid fa-trophy"></i> Completed</span>`
                : `<span class="badge badge-neutral">${progress.toFixed(0)}%</span>`
            }
          </div>

          ${g.description ? `<p style="font-size: 0.85rem; color: var(--text-secondary);">${escapeHTML(g.description)}</p>` : ''}

          <div class="progress-container">
            <div class="progress-labels">
              <span>Saved: <strong class="font-mono">${formatMoney(g.currentAmount)}</strong></span>
              <span>Target: <strong class="font-mono">${formatMoney(g.targetAmount)}</strong></span>
            </div>
            <div class="progress-track">
              <div class="progress-bar ${isComplete ? 'safe' : 'primary'}" style="width: ${progressWidth}%"></div>
            </div>
          </div>

          <div class="goal-meta-row">
            <div>
              <span>Remaining: </span>
              <strong class="font-mono">${formatMoney(rem)}</strong>
            </div>
            <div class="table-actions">
              <button class="btn btn-sm btn-outline-primary" onclick="openSavingsContribModal('${g.id}')">
                <i class="fa-solid fa-plus"></i> Contribute
              </button>
              <button class="action-btn" title="Edit" onclick="editSavingsModal('${g.id}')">
                <i class="fa-regular fa-pen-to-square"></i>
              </button>
              <button class="action-btn delete" title="Delete" onclick="confirmDeleteSavings('${g.id}')">
                <i class="fa-regular fa-trash-can"></i>
              </button>
            </div>
          </div>
        </div>
      `;
    })
    .join('');
}

// ----------------------------------------------------------------------------
// VIEW 8: REPORTS & ANALYTICS
// ----------------------------------------------------------------------------
function renderReportsView() {
  const year = parseInt(document.getElementById('report-filter-year')?.value || new Date().getFullYear());
  const monthVal = document.getElementById('report-filter-month')?.value || 'all';

  let filteredTx = appState.transactions.filter(t => {
    const d = new Date(t.date);
    if (d.getFullYear() !== year) return false;
    if (monthVal !== 'all' && d.getMonth() !== parseInt(monthVal)) return false;
    return true;
  });

  const periodIncome = filteredTx
    .filter(t => t.type === 'income')
    .reduce((s, t) => s + t.amount, 0);

  const periodExpense = filteredTx
    .filter(t => t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0);

  const netCashflow = periodIncome - periodExpense;
  const savingsRate = periodIncome > 0 ? ((netCashflow / periodIncome) * 100).toFixed(1) : '0';

  const elInc = document.getElementById('rep-income');
  if (elInc) elInc.textContent = formatMoney(periodIncome);

  const elExp = document.getElementById('rep-expenses');
  if (elExp) elExp.textContent = formatMoney(periodExpense);

  const elNet = document.getElementById('rep-net-cashflow');
  if (elNet) {
    elNet.textContent = formatMoney(netCashflow);
    elNet.style.color = netCashflow >= 0 ? 'var(--success)' : 'var(--danger)';
  }

  const elRate = document.getElementById('rep-savings-rate');
  if (elRate) elRate.textContent = `${savingsRate}%`;

  // Render Report Charts
  renderReportsCharts(year);
}

function renderReportsCharts(year) {
  if (typeof Chart === 'undefined') return;

  const isDark = appState.theme === 'dark';
  const textColor = isDark ? '#cbd5e1' : '#475569';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)';
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // 1. Full 12 Months Bar Chart
  const ctxBar = document.getElementById('chart-rep-monthly-bar');
  if (ctxBar) {
    if (activeCharts.repMonthlyBar) activeCharts.repMonthlyBar.destroy();

    const incMonths = [];
    const expMonths = [];
    for (let m = 0; m < 12; m++) {
      incMonths.push(calculateMonthlyIncome(year, m));
      expMonths.push(calculateMonthlyExpenses(year, m));
    }

    activeCharts.repMonthlyBar = new Chart(ctxBar, {
      type: 'bar',
      data: {
        labels: monthNames,
        datasets: [
          { label: 'Income', data: incMonths, backgroundColor: '#16a34a', borderRadius: 4 },
          { label: 'Expenses', data: expMonths, backgroundColor: '#dc2626', borderRadius: 4 }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: textColor } },
          tooltip: {
            callbacks: {
              label: ctx => ` ${ctx.dataset.label}: ${formatMoney(ctx.raw)}`
            }
          }
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: textColor } },
          y: {
            grid: { color: gridColor },
            ticks: {
              color: textColor,
              callback: val => CURRENCY_MAP[appState.currency].symbol + ' ' + (val >= 1000 ? val / 1000 + 'k' : val)
            }
          }
        }
      }
    });
  }

  // 2. Expense Category Distribution Doughnut
  const ctxDoughnut = document.getElementById('chart-rep-categories-doughnut');
  if (ctxDoughnut) {
    if (activeCharts.repDoughnut) activeCharts.repDoughnut.destroy();

    const catTotals = {};
    appState.transactions
      .filter(t => t.type === 'expense' && new Date(t.date).getFullYear() === year)
      .forEach(t => {
        catTotals[t.category] = (catTotals[t.category] || 0) + t.amount;
      });

    const labels = Object.keys(catTotals);
    const data = Object.values(catTotals);
    const colors = labels.map((l, i) => {
      const c = appState.categories.find(cat => cat.name === l);
      return c ? c.color : CATEGORY_COLORS[i % CATEGORY_COLORS.length];
    });

    activeCharts.repDoughnut = new Chart(ctxDoughnut, {
      type: 'doughnut',
      data: {
        labels: labels.length ? labels : ['No Expenses'],
        datasets: [
          {
            data: data.length ? data : [1],
            backgroundColor: colors.length ? colors : ['#cbd5e1'],
            borderColor: isDark ? '#131d33' : '#ffffff',
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'right', labels: { color: textColor, boxWidth: 12 } },
          tooltip: {
            callbacks: {
              label: ctx => ` ${ctx.label}: ${formatMoney(ctx.raw)}`
            }
          }
        }
      }
    });
  }

  // 3. Monthly Spending Trend Line Chart
  const ctxLine = document.getElementById('chart-rep-spending-trend');
  if (ctxLine) {
    if (activeCharts.repSpendingTrend) activeCharts.repSpendingTrend.destroy();

    const expTrend = [];
    for (let m = 0; m < 12; m++) {
      expTrend.push(calculateMonthlyExpenses(year, m));
    }

    activeCharts.repSpendingTrend = new Chart(ctxLine, {
      type: 'line',
      data: {
        labels: monthNames,
        datasets: [
          {
            label: 'Monthly Expenditure',
            data: expTrend,
            borderColor: '#2563eb',
            backgroundColor: 'rgba(37, 99, 235, 0.12)',
            fill: true,
            tension: 0.35,
            pointBackgroundColor: '#2563eb',
            pointRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: textColor } },
          tooltip: {
            callbacks: {
              label: ctx => ` Spending: ${formatMoney(ctx.raw)}`
            }
          }
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: textColor } },
          y: { grid: { color: gridColor }, ticks: { color: textColor } }
        }
      }
    });
  }

  // 4. Budget Performance Horizontal Bar Chart
  const ctxBudgetPerf = document.getElementById('chart-rep-budget-performance');
  if (ctxBudgetPerf) {
    if (activeCharts.repBudgetPerf) activeCharts.repBudgetPerf.destroy();

    const bgtLabels = appState.budgets.map(b => b.category);
    const bgtAllocated = appState.budgets.map(b => b.amount);
    const bgtActual = appState.budgets.map(b =>
      calculateActualSpendingForCategory(b.category, b.startDate, b.endDate)
    );

    activeCharts.repBudgetPerf = new Chart(ctxBudgetPerf, {
      type: 'bar',
      data: {
        labels: bgtLabels.length ? bgtLabels : ['No Budgets'],
        datasets: [
          { label: 'Budget Cap', data: bgtAllocated, backgroundColor: '#94a3b8' },
          { label: 'Actual Spent', data: bgtActual, backgroundColor: '#ea580c' }
        ]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: textColor } },
          tooltip: {
            callbacks: {
              label: ctx => ` ${ctx.dataset.label}: ${formatMoney(ctx.raw)}`
            }
          }
        },
        scales: {
          x: { grid: { color: gridColor }, ticks: { color: textColor } },
          y: { grid: { display: false }, ticks: { color: textColor } }
        }
      }
    });
  }
}

function refreshAllCharts() {
  if (appState.currentView === 'dashboard') {
    renderDashboardCharts();
  } else if (appState.currentView === 'reports') {
    const yr = parseInt(document.getElementById('report-filter-year')?.value || new Date().getFullYear());
    renderReportsCharts(yr);
  }
}

// ----------------------------------------------------------------------------
// VIEW 9: RECURRING TRANSACTIONS
// ----------------------------------------------------------------------------
function renderRecurringView() {
  populateRecurringCategorySelect();

  const activeCount = appState.recurring.filter(r => r.active).length;

  const projectedExp = appState.recurring
    .filter(r => r.active && r.type === 'expense')
    .reduce((s, r) => s + r.amount, 0);

  const projectedInc = appState.recurring
    .filter(r => r.active && r.type === 'income')
    .reduce((s, r) => s + r.amount, 0);

  const netProj = projectedInc - projectedExp;

  const elAct = document.getElementById('recurring-active-count');
  if (elAct) elAct.textContent = activeCount;

  const elPExp = document.getElementById('recurring-projected-expense');
  if (elPExp) elPExp.textContent = formatMoney(projectedExp);

  const elPInc = document.getElementById('recurring-projected-income');
  if (elPInc) elPInc.textContent = formatMoney(projectedInc);

  const elNetP = document.getElementById('recurring-net-projected');
  if (elNetP) elNetP.textContent = formatMoney(netProj);

  const tbody = document.getElementById('recurring-table-tbody');
  if (!tbody) return;

  if (appState.recurring.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; padding: 2.5rem; color: var(--text-muted);">No recurring rules configured.</td></tr>`;
    return;
  }

  tbody.innerHTML = appState.recurring
    .map(r => {
      const isInc = r.type === 'income';
      return `
        <tr>
          <td><strong>${escapeHTML(r.title)}</strong></td>
          <td><span class="badge ${isInc ? 'badge-income' : 'badge-expense'}">${isInc ? 'Income' : 'Expense'}</span></td>
          <td><span class="badge badge-neutral">${escapeHTML(r.category)}</span></td>
          <td>${r.frequency}</td>
          <td>${escapeHTML(r.paymentMethod || 'Bank Transfer')}</td>
          <td>${formatDate(r.lastProcessed || r.startDate)}</td>
          <td class="amount ${isInc ? 'amount-income' : 'amount-expense'}" style="text-align: right;">
            ${isInc ? '+' : '-'} ${formatMoney(r.amount)}
          </td>
          <td style="text-align: center;">
            <button class="btn btn-sm ${r.active ? 'btn-success' : 'btn-secondary'}" onclick="toggleRecurringStatus('${r.id}')">
              ${r.active ? '<i class="fa-solid fa-circle-play"></i> Active' : '<i class="fa-solid fa-circle-pause"></i> Paused'}
            </button>
          </td>
          <td style="text-align: center;">
            <div class="table-actions" style="justify-content: center;">
              <button class="action-btn delete" title="Delete Rule" onclick="deleteRecurringRule('${r.id}')">
                <i class="fa-regular fa-trash-can"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    })
    .join('');
}

// ============================================================================
// MODALS MANAGEMENT & FORM HANDLING
// ============================================================================

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function showConfirmDialog(title, message, onConfirmCallback) {
  const modal = document.getElementById('modal-confirm');
  const titleEl = document.getElementById('confirm-title');
  const msgEl = document.getElementById('confirm-message');
  const confirmBtn = document.getElementById('btn-confirm-action');

  if (!modal || !confirmBtn) return;

  titleEl.textContent = title;
  msgEl.textContent = message;

  // Replace confirm button listener cleanly
  const newBtn = confirmBtn.cloneNode(true);
  confirmBtn.parentNode.replaceChild(newBtn, confirmBtn);

  newBtn.addEventListener('click', () => {
    closeModal('modal-confirm');
    if (typeof onConfirmCallback === 'function') onConfirmCallback();
  });

  openModal('modal-confirm');
}

// Helper to fill Category Select Dropdowns
function populateCategorySelects() {
  const selects = [
    document.getElementById('tx-filter-category'),
    document.getElementById('tx-form-category')
  ];

  selects.forEach(sel => {
    if (!sel) return;
    const isFilter = sel.id.includes('filter');
    const curVal = sel.value;

    let html = isFilter ? '<option value="all">All Categories</option>' : '';
    html += appState.categories
      .map(c => `<option value="${escapeHTML(c.name)}">${escapeHTML(c.name)} (${c.type})</option>`)
      .join('');

    sel.innerHTML = html;
    if (curVal) sel.value = curVal;
  });
}

function populateIncomeCategorySelect() {
  const sel = document.getElementById('income-filter-category');
  if (!sel) return;
  const curVal = sel.value;
  let html = '<option value="all">All Income Categories</option>';
  html += appState.categories
    .filter(c => c.type === 'income')
    .map(c => `<option value="${escapeHTML(c.name)}">${escapeHTML(c.name)}</option>`)
    .join('');
  sel.innerHTML = html;
  if (curVal) sel.value = curVal;
}

function populateExpenseCategorySelect() {
  const sel = document.getElementById('expense-filter-category');
  if (!sel) return;
  const curVal = sel.value;
  let html = '<option value="all">All Expense Categories</option>';
  html += appState.categories
    .filter(c => c.type === 'expense')
    .map(c => `<option value="${escapeHTML(c.name)}">${escapeHTML(c.name)}</option>`)
    .join('');
  sel.innerHTML = html;
  if (curVal) sel.value = curVal;
}

function populateBudgetCategorySelect() {
  const sel = document.getElementById('budget-form-category');
  if (!sel) return;
  sel.innerHTML = appState.categories
    .filter(c => c.type === 'expense')
    .map(c => `<option value="${escapeHTML(c.name)}">${escapeHTML(c.name)}</option>`)
    .join('');
}

function populateRecurringCategorySelect() {
  const sel = document.getElementById('recurring-form-category');
  if (!sel) return;
  sel.innerHTML = appState.categories
    .map(c => `<option value="${escapeHTML(c.name)}">${escapeHTML(c.name)}</option>`)
    .join('');
}

// 1. Transaction Modal
function openTransactionModal(defaultType = 'expense') {
  populateCategorySelects();
  const form = document.getElementById('form-transaction');
  if (form) form.reset();

  document.getElementById('tx-form-id').value = '';
  document.getElementById('modal-tx-title').textContent = 'Add Transaction';
  document.getElementById('tx-form-type').value = defaultType;
  document.getElementById('tx-form-date').value = new Date().toISOString().split('T')[0];

  // Filter category dropdown based on type
  updateTxCategoryOptions(defaultType);

  openModal('modal-transaction');
}

function editTransactionModal(id) {
  const tx = appState.transactions.find(t => t.id === id);
  if (!tx) return;

  populateCategorySelects();
  document.getElementById('tx-form-id').value = tx.id;
  document.getElementById('modal-tx-title').textContent = 'Edit Transaction';
  document.getElementById('tx-form-type').value = tx.type;
  document.getElementById('tx-form-amount').value = tx.amount;
  document.getElementById('tx-form-title').value = tx.title;

  updateTxCategoryOptions(tx.type);
  document.getElementById('tx-form-category').value = tx.category;

  document.getElementById('tx-form-payment').value = tx.paymentMethod || 'Cash';
  document.getElementById('tx-form-date').value = tx.date;
  document.getElementById('tx-form-desc').value = tx.description || '';
  document.getElementById('tx-form-notes').value = tx.notes || '';

  openModal('modal-transaction');
}

function updateTxCategoryOptions(type) {
  const sel = document.getElementById('tx-form-category');
  if (!sel) return;
  const filtered = appState.categories.filter(c => c.type === type);
  sel.innerHTML = filtered
    .map(c => `<option value="${escapeHTML(c.name)}">${escapeHTML(c.name)}</option>`)
    .join('');
}

function confirmDeleteTransaction(id) {
  const tx = appState.transactions.find(t => t.id === id);
  if (!tx) return;

  showConfirmDialog(
    'Delete Transaction',
    `Are you sure you want to delete "${tx.title}" of ${formatMoney(tx.amount)}? This will adjust your balances immediately.`,
    () => deleteTransaction(id)
  );
}

function viewTransactionDetail(id) {
  const tx = appState.transactions.find(t => t.id === id);
  if (!tx) return;

  const cat = appState.categories.find(c => c.name === tx.category);
  const icon = cat ? cat.icon : 'fa-receipt';
  const color = cat ? cat.color : '#2563eb';
  const isInc = tx.type === 'income';

  const bodyEl = document.getElementById('view-tx-body');
  if (bodyEl) {
    bodyEl.innerHTML = `
      <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
        <div class="item-category-icon" style="background-color: ${color}20; color: ${color}; width: 50px; height: 50px; font-size: 1.4rem;">
          <i class="fa-solid ${icon}"></i>
        </div>
        <div>
          <h3 style="font-size: 1.25rem; font-weight: 800; color: var(--text-primary);">${escapeHTML(tx.title)}</h3>
          <span class="badge ${isInc ? 'badge-income' : 'badge-expense'}">${isInc ? 'Income Record' : 'Expense Record'}</span>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; background-color: var(--bg-body); padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
        <div>
          <span style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700;">Amount</span>
          <div class="font-mono" style="font-size: 1.35rem; font-weight: 800; color: ${isInc ? 'var(--success)' : 'var(--danger)'};">
            ${isInc ? '+' : '-'} ${formatMoney(tx.amount)}
          </div>
        </div>
        <div>
          <span style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700;">Date</span>
          <div style="font-size: 1rem; font-weight: 600;">${formatDate(tx.date)}</div>
        </div>
        <div>
          <span style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700;">Category</span>
          <div style="font-size: 0.95rem; font-weight: 600;">${escapeHTML(tx.category)}</div>
        </div>
        <div>
          <span style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700;">Payment Method</span>
          <div style="font-size: 0.95rem; font-weight: 600;">${escapeHTML(tx.paymentMethod || 'Cash')}</div>
        </div>
      </div>

      ${
        tx.description
          ? `<div style="margin-top: 0.75rem;"><strong style="font-size: 0.85rem;">Description:</strong><p style="color: var(--text-secondary); font-size: 0.9rem;">${escapeHTML(tx.description)}</p></div>`
          : ''
      }
      ${
        tx.notes
          ? `<div style="margin-top: 0.75rem;"><strong style="font-size: 0.85rem;">Notes:</strong><p style="color: var(--text-secondary); font-size: 0.9rem;">${escapeHTML(tx.notes)}</p></div>`
          : ''
      }
      <div style="margin-top: 0.75rem; font-size: 0.75rem; color: var(--text-muted);">Transaction ID: <code>${tx.id}</code></div>
    `;
  }

  const editBtn = document.getElementById('btn-view-tx-edit');
  if (editBtn) {
    editBtn.onclick = () => {
      closeModal('modal-view-tx');
      editTransactionModal(tx.id);
    };
  }

  openModal('modal-view-tx');
}

// 2. Category Modal
function openCategoryModal() {
  const form = document.getElementById('form-category');
  if (form) form.reset();

  document.getElementById('cat-form-id').value = '';
  document.getElementById('modal-cat-title').textContent = 'Create Category';
  renderCategoryIconPicker();
  renderCategoryColorPicker();

  openModal('modal-category');
}

function editCategoryModal(id) {
  const cat = appState.categories.find(c => c.id === id);
  if (!cat) return;

  document.getElementById('cat-form-id').value = cat.id;
  document.getElementById('modal-cat-title').textContent = 'Edit Category';
  document.getElementById('cat-form-name').value = cat.name;
  document.getElementById('cat-form-type').value = cat.type;

  renderCategoryIconPicker(cat.icon);
  renderCategoryColorPicker(cat.color);

  openModal('modal-category');
}

function confirmDeleteCategory(id) {
  const cat = appState.categories.find(c => c.id === id);
  if (!cat) return;

  showConfirmDialog(
    'Delete Category',
    `Are you sure you want to remove the category "${cat.name}"? This check verifies whether any existing transactions depend on it.`,
    () => deleteCategory(id)
  );
}

function renderCategoryIconPicker(selectedIcon = 'fa-tag') {
  const picker = document.getElementById('category-icon-picker');
  const hiddenInput = document.getElementById('cat-form-icon');
  if (!picker || !hiddenInput) return;

  hiddenInput.value = selectedIcon;
  picker.innerHTML = CATEGORY_ICONS.map(
    icon => `
      <button type="button" class="icon-choice-btn ${icon === selectedIcon ? 'selected' : ''}" data-icon="${icon}">
        <i class="fa-solid ${icon}"></i>
      </button>
    `
  ).join('');

  picker.querySelectorAll('.icon-choice-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      picker.querySelectorAll('.icon-choice-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      hiddenInput.value = btn.getAttribute('data-icon');
    });
  });
}

function renderCategoryColorPicker(selectedColor = '#2563eb') {
  const picker = document.getElementById('category-color-picker');
  const hiddenInput = document.getElementById('cat-form-color');
  if (!picker || !hiddenInput) return;

  hiddenInput.value = selectedColor;
  picker.innerHTML = CATEGORY_COLORS.map(
    color => `
      <div class="color-choice-btn ${color === selectedColor ? 'selected' : ''}" style="background-color: ${color};" data-color="${color}"></div>
    `
  ).join('');

  picker.querySelectorAll('.color-choice-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      picker.querySelectorAll('.color-choice-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      hiddenInput.value = btn.getAttribute('data-color');
    });
  });
}

// 3. Budget Modal
function openBudgetModal() {
  populateBudgetCategorySelect();
  const form = document.getElementById('form-budget');
  if (form) form.reset();

  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

  document.getElementById('budget-form-id').value = '';
  document.getElementById('modal-budget-title').textContent = 'Set Category Budget';
  document.getElementById('budget-form-start').value = start;
  document.getElementById('budget-form-end').value = end;

  openModal('modal-budget');
}

function editBudgetModal(id) {
  const b = appState.budgets.find(item => item.id === id);
  if (!b) return;

  populateBudgetCategorySelect();
  document.getElementById('budget-form-id').value = b.id;
  document.getElementById('modal-budget-title').textContent = 'Edit Budget Plan';
  document.getElementById('budget-form-name').value = b.name;
  document.getElementById('budget-form-category').value = b.category;
  document.getElementById('budget-form-period').value = b.period;
  document.getElementById('budget-form-amount').value = b.amount;
  document.getElementById('budget-form-start').value = b.startDate;
  document.getElementById('budget-form-end').value = b.endDate;

  openModal('modal-budget');
}

function confirmDeleteBudget(id) {
  const b = appState.budgets.find(item => item.id === id);
  if (!b) return;

  showConfirmDialog(
    'Delete Budget Plan',
    `Are you sure you want to remove the budget cap for "${b.category}"?`,
    () => deleteBudget(id)
  );
}

// 4. Savings Goal Modal
function openSavingsModal() {
  const form = document.getElementById('form-savings');
  if (form) form.reset();

  const nextYear = new Date().getFullYear() + 1;
  document.getElementById('savings-form-id').value = '';
  document.getElementById('modal-savings-title').textContent = 'Create Savings Goal';
  document.getElementById('savings-form-date').value = `${nextYear}-12-31`;

  openModal('modal-savings');
}

function editSavingsModal(id) {
  const g = appState.savingsGoals.find(item => item.id === id);
  if (!g) return;

  document.getElementById('savings-form-id').value = g.id;
  document.getElementById('modal-savings-title').textContent = 'Edit Savings Goal';
  document.getElementById('savings-form-name').value = g.name;
  document.getElementById('savings-form-target').value = g.targetAmount;
  document.getElementById('savings-form-current').value = g.currentAmount;
  document.getElementById('savings-form-date').value = g.targetDate;
  document.getElementById('savings-form-desc').value = g.description || '';

  openModal('modal-savings');
}

function confirmDeleteSavings(id) {
  const g = appState.savingsGoals.find(item => item.id === id);
  if (!g) return;

  showConfirmDialog(
    'Delete Savings Goal',
    `Remove goal "${g.name}" with saved amount of ${formatMoney(g.currentAmount)}?`,
    () => deleteSavingsGoal(id)
  );
}

function openSavingsContribModal(goalId) {
  const g = appState.savingsGoals.find(item => item.id === goalId);
  if (!g) return;

  document.getElementById('contrib-goal-id').value = g.id;
  document.getElementById('contrib-goal-name').textContent = `Target: ${g.name} (Current: ${formatMoney(g.currentAmount)} / ${formatMoney(g.targetAmount)})`;
  document.getElementById('contrib-amount').value = '';

  openModal('modal-savings-contrib');
}

// 5. Recurring Modal
function openRecurringModal() {
  populateRecurringCategorySelect();
  const form = document.getElementById('form-recurring');
  if (form) form.reset();

  document.getElementById('recurring-form-id').value = '';
  document.getElementById('modal-recurring-title').textContent = 'New Recurring Rule';
  document.getElementById('recurring-form-start').value = new Date().toISOString().split('T')[0];

  openModal('modal-recurring');
}

// ============================================================================
// TOAST NOTIFICATION UTILITY
// ============================================================================

function showToast(message, type = 'info', duration = 3500) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const iconMap = {
    success: 'fa-circle-check',
    error: 'fa-circle-xmark',
    warning: 'fa-triangle-exclamation',
    info: 'fa-circle-info'
  };

  toast.innerHTML = `
    <i class="fa-solid ${iconMap[type] || 'fa-circle-info'} toast-icon"></i>
    <span>${escapeHTML(message)}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    setTimeout(() => toast.remove(), 250);
  }, duration);
}

function escapeHTML(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/[&<>'"]/g, tag => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[tag] || tag));
}

// Mobile Sidebar Controls
function openMobileSidebar() {
  const sidebar = document.getElementById('app-sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');
  if (sidebar) sidebar.classList.add('open');
  if (backdrop) backdrop.classList.add('active');
}

function closeMobileSidebar() {
  const sidebar = document.getElementById('app-sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');
  if (sidebar) sidebar.classList.remove('open');
  if (backdrop) backdrop.classList.remove('active');
}

// ============================================================================
// ATTACH EVENT LISTENERS
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize System Data
  initializeSystemData();

  // 2. Check Auth State
  if (appState.currentUser) {
    showAppView();
  } else {
    showAuthView();
  }

  // 3. Auth Form Handlers
  const tabLogin = document.getElementById('auth-tab-login');
  const tabRegister = document.getElementById('auth-tab-register');
  const formLogin = document.getElementById('form-login');
  const formRegister = document.getElementById('form-register');

  if (tabLogin && tabRegister) {
    tabLogin.addEventListener('click', () => {
      tabLogin.classList.add('active');
      tabRegister.classList.remove('active');
      formLogin.style.display = 'flex';
      formRegister.style.display = 'none';
    });

    tabRegister.addEventListener('click', () => {
      tabRegister.classList.add('active');
      tabLogin.classList.remove('active');
      formRegister.style.display = 'flex';
      formLogin.style.display = 'none';
    });
  }

  // Show/Hide password toggles
  document.querySelectorAll('.toggle-password-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const input = document.getElementById(targetId);
      if (input) {
        const isPwd = input.type === 'password';
        input.type = isPwd ? 'text' : 'password';
        btn.innerHTML = `<i class="fa-regular ${isPwd ? 'fa-eye-slash' : 'fa-eye'}"></i>`;
      }
    });
  });

  // Autofill Demo Account Button
  const btnAutofill = document.getElementById('btn-autofill-demo');
  if (btnAutofill) {
    btnAutofill.addEventListener('click', () => {
      document.getElementById('login-email').value = 'user@expense.com';
      document.getElementById('login-password').value = 'user123';
      showToast('Demo credentials autofilled!', 'info');
    });
  }

  // Forgot password demo notice
  const btnForgot = document.getElementById('btn-forgot-password');
  if (btnForgot) {
    btnForgot.addEventListener('click', () => {
      showToast('In this academic prototype, use the default demo credentials: user@expense.com / user123', 'info', 5000);
    });
  }

  // Login Submit
  if (formLogin) {
    formLogin.addEventListener('submit', e => {
      e.preventDefault();
      const email = document.getElementById('login-email').value;
      const pwd = document.getElementById('login-password').value;
      const remember = document.getElementById('login-remember').checked;

      const res = loginUser(email, pwd, remember);
      if (res.success) {
        showAppView();
        showToast(`Welcome back, ${res.user.name}!`, 'success');
      } else {
        showToast(res.message, 'error');
      }
    });
  }

  // Register Submit
  if (formRegister) {
    formRegister.addEventListener('submit', e => {
      e.preventDefault();
      const name = document.getElementById('reg-name').value;
      const email = document.getElementById('reg-email').value;
      const pwd = document.getElementById('reg-password').value;
      const confirmPwd = document.getElementById('reg-confirm-password').value;

      if (pwd !== confirmPwd) {
        showToast('Passwords do not match.', 'error');
        return;
      }

      const res = registerUser(name, email, pwd);
      if (res.success) {
        loginUser(email, pwd, true);
        showAppView();
        showToast(`Account created! Welcome, ${name}!`, 'success');
      } else {
        showToast(res.message, 'error');
      }
    });
  }

  // Theme Toggles
  const landingThemeBtn = document.getElementById('landing-theme-toggle');
  if (landingThemeBtn) landingThemeBtn.addEventListener('click', toggleTheme);

  const appThemeBtn = document.getElementById('btn-app-theme-toggle');
  if (appThemeBtn) appThemeBtn.addEventListener('click', toggleTheme);

  const settingsThemeBtn = document.getElementById('btn-settings-theme-toggle');
  if (settingsThemeBtn) settingsThemeBtn.addEventListener('click', toggleTheme);

  // Currency Selectors
  const headerCurrSel = document.getElementById('header-currency-select');
  if (headerCurrSel) {
    headerCurrSel.addEventListener('change', e => updateCurrency(e.target.value));
  }
  const settingsCurrSel = document.getElementById('settings-currency-select');
  if (settingsCurrSel) {
    settingsCurrSel.addEventListener('change', e => updateCurrency(e.target.value));
  }

  // Navigation Links
  document.querySelectorAll('.app-sidebar .nav-item').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const view = link.getAttribute('data-view');
      if (view) switchView(view);
    });
  });

  // Dashboard shortcuts with [data-nav]
  document.querySelectorAll('[data-nav]').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-nav');
      if (target) switchView(target);
    });
  });

  // Quick Add Dropdown Toggle
  const quickAddBtn = document.getElementById('btn-quick-add');
  const quickAddDropdown = document.getElementById('quick-add-dropdown');
  if (quickAddBtn && quickAddDropdown) {
    quickAddBtn.addEventListener('click', e => {
      e.stopPropagation();
      quickAddDropdown.classList.toggle('active');
    });

    document.querySelectorAll('.quick-add-option').forEach(opt => {
      opt.addEventListener('click', () => {
        quickAddDropdown.classList.remove('active');
        const act = opt.getAttribute('data-action');
        if (act === 'open-modal-income') openTransactionModal('income');
        if (act === 'open-modal-expense') openTransactionModal('expense');
        if (act === 'open-modal-budget') openBudgetModal();
        if (act === 'open-modal-savings') openSavingsModal();
      });
    });
  }

  // Notification Bell Toggle
  const notifBell = document.getElementById('btn-notification-bell');
  const notifDropdown = document.getElementById('notification-dropdown');
  if (notifBell && notifDropdown) {
    notifBell.addEventListener('click', e => {
      e.stopPropagation();
      notifDropdown.classList.toggle('active');
    });

    const markAllBtn = document.getElementById('btn-mark-all-notifications');
    if (markAllBtn) markAllBtn.addEventListener('click', markAllNotificationsRead);

    const clearAllBtn = document.getElementById('btn-clear-notifications');
    if (clearAllBtn) clearAllBtn.addEventListener('click', clearAllNotifications);
  }

  // Close dropdowns on outside click
  document.addEventListener('click', () => {
    if (quickAddDropdown) quickAddDropdown.classList.remove('active');
    if (notifDropdown) notifDropdown.classList.remove('active');
  });

  // Logout Handlers
  const headerLogout = document.getElementById('btn-header-logout');
  if (headerLogout) {
    headerLogout.addEventListener('click', () => {
      showConfirmDialog('Confirm Sign Out', 'Are you sure you want to log out of your session?', logoutUser);
    });
  }
  const sidebarLogout = document.getElementById('btn-sidebar-logout');
  if (sidebarLogout) {
    sidebarLogout.addEventListener('click', () => {
      showConfirmDialog('Confirm Sign Out', 'Are you sure you want to log out of your session?', logoutUser);
    });
  }

  // Mobile menu hamburger
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  if (mobileToggle) mobileToggle.addEventListener('click', openMobileSidebar);

  const sidebarClose = document.getElementById('sidebar-close-btn');
  if (sidebarClose) sidebarClose.addEventListener('click', closeMobileSidebar);

  const sidebarBackdrop = document.getElementById('sidebar-backdrop');
  if (sidebarBackdrop) sidebarBackdrop.addEventListener('click', closeMobileSidebar);

  // Modal Generic Close Buttons
  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modalId = btn.getAttribute('data-close-modal');
      closeModal(modalId);
    });
  });

  // Close modal on escape key or backdrop click
  document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', e => {
      if (e.target === modal) closeModal(modal.id);
    });
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.active').forEach(m => closeModal(m.id));
      if (quickAddDropdown) quickAddDropdown.classList.remove('active');
      if (notifDropdown) notifDropdown.classList.remove('active');
    }
  });

  // Action Button Openers
  const btnOpenAddTx = document.getElementById('btn-open-add-transaction');
  if (btnOpenAddTx) btnOpenAddTx.addEventListener('click', () => openTransactionModal());

  const btnOpenAddInc = document.getElementById('btn-open-add-income');
  if (btnOpenAddInc) btnOpenAddInc.addEventListener('click', () => openTransactionModal('income'));

  const btnOpenAddExp = document.getElementById('btn-open-add-expense');
  if (btnOpenAddExp) btnOpenAddExp.addEventListener('click', () => openTransactionModal('expense'));

  const btnOpenAddCat = document.getElementById('btn-open-add-category');
  if (btnOpenAddCat) btnOpenAddCat.addEventListener('click', openCategoryModal);

  const btnOpenCreateBgt = document.getElementById('btn-open-create-budget');
  if (btnOpenCreateBgt) btnOpenCreateBgt.addEventListener('click', openBudgetModal);

  const btnOpenCreateSvg = document.getElementById('btn-open-create-savings');
  if (btnOpenCreateSvg) btnOpenCreateSvg.addEventListener('click', openSavingsModal);

  const btnOpenAddRec = document.getElementById('btn-open-add-recurring');
  if (btnOpenAddRec) btnOpenAddRec.addEventListener('click', openRecurringModal);

  // Sync Recurring Rule Button
  const btnSyncRec = document.getElementById('btn-sync-recurring');
  if (btnSyncRec) {
    btnSyncRec.addEventListener('click', () => {
      simulateRecurringTransactions();
      renderCurrentView();
      showToast('Recurring transactions synchronized!', 'success');
    });
  }

  // Export CSV Buttons
  const btnExportTxCsv = document.getElementById('btn-export-tx-csv');
  if (btnExportTxCsv) btnExportTxCsv.addEventListener('click', () => exportTransactionsCSV());

  const btnSettingsExportCsv = document.getElementById('btn-settings-export-csv');
  if (btnSettingsExportCsv) btnSettingsExportCsv.addEventListener('click', () => exportTransactionsCSV());

  const btnExportRepCsv = document.getElementById('btn-export-report-csv');
  if (btnExportRepCsv) btnExportRepCsv.addEventListener('click', () => exportTransactionsCSV());

  // Print Report Button
  const btnPrintRep = document.getElementById('btn-print-report');
  if (btnPrintRep) {
    btnPrintRep.addEventListener('click', () => window.print());
  }

  // Backup & Restore
  const btnBackupJson = document.getElementById('btn-export-backup-json');
  if (btnBackupJson) btnBackupJson.addEventListener('click', exportBackupJSON);

  const btnTriggerRestore = document.getElementById('btn-trigger-restore-json');
  const fileRestore = document.getElementById('file-restore-json');
  if (btnTriggerRestore && fileRestore) {
    btnTriggerRestore.addEventListener('click', () => fileRestore.click());
    fileRestore.addEventListener('change', e => {
      if (e.target.files && e.target.files[0]) {
        restoreBackupJSON(e.target.files[0]);
        e.target.value = ''; // Reset input
      }
    });
  }

  const btnResetDemo = document.getElementById('btn-reset-demo-data');
  if (btnResetDemo) btnResetDemo.addEventListener('click', resetToSampleData);

  const btnWipeData = document.getElementById('btn-wipe-all-data');
  if (btnWipeData) btnWipeData.addEventListener('click', clearAllAppData);

  // Transaction Filters Change Listeners
  const txFilterInputs = [
    'tx-search-input',
    'tx-filter-type',
    'tx-filter-category',
    'tx-filter-payment',
    'tx-filter-date-preset',
    'tx-sort-select'
  ];
  txFilterInputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', renderTransactionsView);
      el.addEventListener('change', renderTransactionsView);
    }
  });

  // Income & Expense Filter Listeners
  const incomeSearch = document.getElementById('income-search-input');
  if (incomeSearch) incomeSearch.addEventListener('input', renderIncomeView);
  const incomeCat = document.getElementById('income-filter-category');
  if (incomeCat) incomeCat.addEventListener('change', renderIncomeView);

  const expSearch = document.getElementById('expense-search-input');
  if (expSearch) expSearch.addEventListener('input', renderExpensesView);
  const expCat = document.getElementById('expense-filter-category');
  if (expCat) expCat.addEventListener('change', renderExpensesView);

  // Category Tab Segments
  document.querySelectorAll('[data-category-type]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-category-type]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategoryTypeTab = btn.getAttribute('data-category-type');
      renderCategoriesView();
    });
  });
  const catSearch = document.getElementById('category-search-input');
  if (catSearch) catSearch.addEventListener('input', renderCategoriesView);

  // Budget Period Filter
  const budgetPeriod = document.getElementById('budget-filter-period');
  if (budgetPeriod) budgetPeriod.addEventListener('change', renderBudgetsView);

  // Report Filters
  const repYear = document.getElementById('report-filter-year');
  if (repYear) repYear.addEventListener('change', renderReportsView);
  const repMonth = document.getElementById('report-filter-month');
  if (repMonth) repMonth.addEventListener('change', renderReportsView);

  // Forms Submissions
  // 1. Transaction Form
  const formTx = document.getElementById('form-transaction');
  if (formTx) {
    const txTypeSelect = document.getElementById('tx-form-type');
    if (txTypeSelect) {
      txTypeSelect.addEventListener('change', e => updateTxCategoryOptions(e.target.value));
    }

    formTx.addEventListener('submit', e => {
      e.preventDefault();
      const id = document.getElementById('tx-form-id').value;
      const data = {
        type: document.getElementById('tx-form-type').value,
        amount: document.getElementById('tx-form-amount').value,
        title: document.getElementById('tx-form-title').value,
        category: document.getElementById('tx-form-category').value,
        paymentMethod: document.getElementById('tx-form-payment').value,
        date: document.getElementById('tx-form-date').value,
        description: document.getElementById('tx-form-desc').value,
        notes: document.getElementById('tx-form-notes').value
      };

      if (id) {
        updateTransaction(id, data);
      } else {
        addTransaction(data);
      }
      closeModal('modal-transaction');
    });
  }

  // 2. Category Form
  const formCat = document.getElementById('form-category');
  if (formCat) {
    formCat.addEventListener('submit', e => {
      e.preventDefault();
      const id = document.getElementById('cat-form-id').value;
      const data = {
        name: document.getElementById('cat-form-name').value,
        type: document.getElementById('cat-form-type').value,
        icon: document.getElementById('cat-form-icon').value,
        color: document.getElementById('cat-form-color').value
      };

      if (id) {
        updateCategory(id, data);
      } else {
        addCategory(data);
      }
      closeModal('modal-category');
    });
  }

  // 3. Budget Form
  const formBudget = document.getElementById('form-budget');
  if (formBudget) {
    formBudget.addEventListener('submit', e => {
      e.preventDefault();
      const id = document.getElementById('budget-form-id').value;
      const data = {
        name: document.getElementById('budget-form-name').value,
        category: document.getElementById('budget-form-category').value,
        period: document.getElementById('budget-form-period').value,
        amount: document.getElementById('budget-form-amount').value,
        startDate: document.getElementById('budget-form-start').value,
        endDate: document.getElementById('budget-form-end').value
      };

      if (id) {
        updateBudget(id, data);
      } else {
        createBudget(data);
      }
      closeModal('modal-budget');
    });
  }

  // 4. Savings Goal Form
  const formSavings = document.getElementById('form-savings');
  if (formSavings) {
    formSavings.addEventListener('submit', e => {
      e.preventDefault();
      const id = document.getElementById('savings-form-id').value;
      const data = {
        name: document.getElementById('savings-form-name').value,
        targetAmount: document.getElementById('savings-form-target').value,
        currentAmount: document.getElementById('savings-form-current').value,
        targetDate: document.getElementById('savings-form-date').value,
        description: document.getElementById('savings-form-desc').value
      };

      if (id) {
        updateSavingsGoal(id, data);
      } else {
        createSavingsGoal(data);
      }
      closeModal('modal-savings');
    });
  }

  // 5. Savings Contribution Form
  const formContrib = document.getElementById('form-savings-contrib');
  if (formContrib) {
    formContrib.addEventListener('submit', e => {
      e.preventDefault();
      const goalId = document.getElementById('contrib-goal-id').value;
      const amount = document.getElementById('contrib-amount').value;
      addSavingsContribution(goalId, amount);
      closeModal('modal-savings-contrib');
    });
  }

  // 6. Recurring Transaction Form
  const formRec = document.getElementById('form-recurring');
  if (formRec) {
    formRec.addEventListener('submit', e => {
      e.preventDefault();
      const data = {
        type: document.getElementById('recurring-form-type').value,
        frequency: document.getElementById('recurring-form-frequency').value,
        title: document.getElementById('recurring-form-title').value,
        amount: document.getElementById('recurring-form-amount').value,
        category: document.getElementById('recurring-form-category').value,
        startDate: document.getElementById('recurring-form-start').value,
        paymentMethod: document.getElementById('recurring-form-payment').value
      };

      addRecurringRule(data);
      closeModal('modal-recurring');
    });
  }

  // 7. Profile Update Form
  const formProfile = document.getElementById('form-edit-profile');
  if (formProfile) {
    formProfile.addEventListener('submit', e => {
      e.preventDefault();
      if (!appState.currentUser) return;

      const newName = document.getElementById('profile-name').value.trim();
      const newEmail = document.getElementById('profile-email').value.trim().toLowerCase();
      const newCurr = document.getElementById('profile-currency-pref').value;

      appState.currentUser.name = newName;
      appState.currentUser.email = newEmail;
      appState.currentUser.currency = newCurr;

      saveData(STORAGE_KEYS.CURRENT_USER, appState.currentUser);

      // Update in users database
      const users = getData(STORAGE_KEYS.USERS, []);
      const idx = users.findIndex(u => u.id === appState.currentUser.id);
      if (idx !== -1) {
        users[idx].name = newName;
        users[idx].email = newEmail;
        users[idx].currency = newCurr;
        saveData(STORAGE_KEYS.USERS, users);
      }

      if (newCurr !== appState.currency) {
        updateCurrency(newCurr);
      } else {
        updateUserInterfaceProfile();
      }

      showToast('Profile updated successfully!', 'success');
    });
  }

  // 8. Change Password Form
  const formChangePwd = document.getElementById('form-change-password');
  if (formChangePwd) {
    formChangePwd.addEventListener('submit', e => {
      e.preventDefault();
      if (!appState.currentUser) return;

      const curPwd = document.getElementById('pwd-current').value;
      const newPwd = document.getElementById('pwd-new').value;
      const confPwd = document.getElementById('pwd-confirm').value;

      if (curPwd !== appState.currentUser.password) {
        showToast('Current password does not match.', 'error');
        return;
      }
      if (newPwd !== confPwd) {
        showToast('New passwords do not match.', 'error');
        return;
      }

      appState.currentUser.password = newPwd;
      saveData(STORAGE_KEYS.CURRENT_USER, appState.currentUser);

      const users = getData(STORAGE_KEYS.USERS, []);
      const idx = users.findIndex(u => u.id === appState.currentUser.id);
      if (idx !== -1) {
        users[idx].password = newPwd;
        saveData(STORAGE_KEYS.USERS, users);
      }

      formChangePwd.reset();
      showToast('Password updated successfully!', 'success');
    });
  }
});

// Expose modal openers to global scope for HTML inline calls
window.viewTransactionDetail = viewTransactionDetail;
window.editTransactionModal = editTransactionModal;
window.confirmDeleteTransaction = confirmDeleteTransaction;
window.editCategoryModal = editCategoryModal;
window.confirmDeleteCategory = confirmDeleteCategory;
window.editBudgetModal = editBudgetModal;
window.confirmDeleteBudget = confirmDeleteBudget;
window.editSavingsModal = editSavingsModal;
window.confirmDeleteSavings = confirmDeleteSavings;
window.openSavingsContribModal = openSavingsContribModal;
window.toggleRecurringStatus = toggleRecurringStatus;
window.deleteRecurringRule = deleteRecurringRule;

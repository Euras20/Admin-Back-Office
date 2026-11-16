// Admin API client — talks to marketplace-backend
const API_BASE = window.API_BASE || 'https://marketplace-app-production-6dae1174.up.railway.app/api';
const TOKEN_KEY = 'admin_token';
const STORE_KEY = 'admin_store_code';

function getToken() {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}
function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}
function getStoreCode() {
  try { return localStorage.getItem(STORE_KEY) || 'agri'; } catch { return 'agri'; }
}
function setStoreCode(code) {
  localStorage.setItem(STORE_KEY, code);
}

async function api(path, options = {}) {
  const isForm = options.body instanceof FormData;
  const headers = {
    'Accept': 'application/json',
    ...(isForm ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers || {}),
  };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  // Store context header (backend can also use session)
  headers['X-Store-Code'] = getStoreCode();

  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    ...options,
    headers,
  });

  if (res.status === 401) {
    setToken(null);
    if (!window.location.pathname.includes('login.html')) {
      window.location.href = 'login.html';
    }
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }

  if (res.status === 204) return null;
  return res.json();
}

// Auth
async function login(email, password) {
  const data = await api('/admin/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  setToken(data.token);
  return data;
}

function logout() {
  setToken(null);
  window.location.href = 'login.html';
}

function isAuthenticated() {
  return !!getToken();
}

// Stores
async function getStores() {
  return api('/admin/stores');
}
async function setStoreContext(code) {
  setStoreCode(code);
  return api('/admin/store-context', {
    method: 'POST',
    body: JSON.stringify({ store_code: code }),
  });
}

// Products
async function getProducts(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return api(`/admin/products${qs ? '?' + qs : ''}`);
}
async function createProduct(payload, isMultipart = false) {
  if (isMultipart || payload instanceof FormData) {
    return api('/admin/products', { method: 'POST', body: payload });
  }
  return api('/admin/products', { method: 'POST', body: JSON.stringify(payload) });
}
async function publishProduct(id) {
  return api(`/admin/products/${id}/publish`, { method: 'POST' });
}
async function archiveProduct(id) {
  return api(`/admin/products/${id}/archive`, { method: 'POST' });
}

// Categories & Brands
async function getCategories() { return api('/admin/categories'); }
async function createCategory(payload) {
  return api('/admin/categories', { method: 'POST', body: JSON.stringify(payload) });
}
async function getBrands() { return api('/admin/brands'); }
async function createBrand(payload) {
  return api('/admin/brands', { method: 'POST', body: JSON.stringify(payload) });
}

// Orders & Payments
async function getOrders(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return api(`/admin/orders${qs ? '?' + qs : ''}`);
}
async function getPayments() { return api('/admin/payments'); }
async function verifyPayment(id) {
  return api(`/admin/payments/${id}/verify`, { method: 'POST' });
}
async function rejectPayment(id, reason) {
  return api(`/admin/payments/${id}/reject`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
}
async function updateOrderStatus(id, action) {
  // action: preparing | shipped | delivered
  return api(`/admin/orders/${id}/${action}`, { method: 'POST' });
}

// Settings
async function getSettings() { return api('/admin/settings'); }
async function updateSettings(settings) {
  return api('/admin/settings', {
    method: 'PATCH',
    body: JSON.stringify({ settings }),
  });
}

window.AdminAPI = {
  api, login, logout, isAuthenticated,
  getToken, setToken, getStoreCode, setStoreCode,
  getStores, setStoreContext,
  getProducts, createProduct, publishProduct, archiveProduct,
  getCategories, createCategory, getBrands, createBrand,
  getOrders, getPayments, verifyPayment, rejectPayment, updateOrderStatus,
  getSettings, updateSettings,
};

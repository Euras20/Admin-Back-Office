// Shared helpers for Commerce Admin (API-backed)
// Auth + store context live in api.js

const STORES = {
  agri: { code: 'agri', name: 'Marketplace Agricole', color: '#00435f' },
  adult: { code: 'adult', name: 'Marketplace Produits Adultes', color: '#5b3601' },
};

function getCurrentStore() {
  return window.AdminAPI ? AdminAPI.getStoreCode() : 'agri';
}

function setCurrentStore(code) {
  if (window.AdminAPI) AdminAPI.setStoreCode(code);
  // Reload to refresh data for the new store
  location.reload();
}

function requireAuth() {
  if (window.AdminAPI && !AdminAPI.isAuthenticated() && !location.pathname.includes('login.html')) {
    location.href = 'login.html';
  }
}

function setupNavigation() {
  const currentPath = location.pathname.split('/').pop() || 'products.html';
  document.querySelectorAll('[data-path], .nav-item').forEach(link => {
    const href = link.getAttribute('href') || '';
    if (href && currentPath.includes(href.replace('.html', ''))) {
      link.classList.add('active', 'bg-primary-container', 'text-on-primary');
    }
  });

  const storeNameEl = document.getElementById('storeName') || document.querySelector('.store-name');
  if (storeNameEl) {
    const store = STORES[getCurrentStore()] || STORES.agri;
    storeNameEl.textContent = store.name;
  }

  const logoutBtn = document.querySelector('[onclick*="logout"], [title="Déconnexion"]');
  if (logoutBtn) {
    logoutBtn.onclick = () => AdminAPI.logout();
  }
}

// Format helpers
function formatPrice(n) {
  return Number(n || 0).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
}

function statusBadge(status) {
  const map = {
    published: 'badge-success',
    draft: 'badge-neutral',
    archived: 'badge-neutral',
    pending_payment: 'badge-warning',
    payment_review: 'badge-warning',
    approved: 'badge-success',
    in_preparation: 'badge-warning',
    shipped: 'badge-success',
    delivered: 'badge-success',
    rejected: 'badge-neutral',
    cancelled: 'badge-neutral',
  };
  return map[status] || 'badge-neutral';
}

document.addEventListener('DOMContentLoaded', setupNavigation);

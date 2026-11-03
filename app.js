// Shared App State for Commerce Admin Back-Office
// Uses localStorage for persistence across pages

const STORES = {
  agri: {
    id: 'STORE-01',
    name: 'Marketplace Agricole',
    short: 'Agri',
    color: '#00435f'
  },
  adult: {
    id: 'STORE-02',
    name: 'Marketplace Produits Adultes',
    short: 'Adultes',
    color: '#5b3601'
  }
};

const DEFAULT_PRODUCTS = {
  agri: [
    { id: 'SKU-AGR-4920', name: 'Tracteur compact 26 CV 4RM Hydrostatique', category: 'Tracteurs & Engins', price: 11890, priceHT: 9908.33, stock: 14, status: 'published', brand: 'John Deere', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDSvRTXrAYJl5sdKRlgpvf5X43Qy_NS0kKklu1IPnlStt4ljigDFMtIcY3TK1gsRLjj38SfAytvPOKoWI4byYBusOnAl-7N9cMjxqCfCUxR0bOI_YKchUb9UK-JAbPNi3cJm3vk3lfQGWhNcJvmnOxNd55FklGHSosqtFPFP2QK1sg4QbBzJIaUDE7hXgdbNvA9v_S_s_gZu7O2sqi6Ao4pxMBfRQH_gBvNgLYb_9xh' },
    { id: 'SKU-BOIS-1033', name: 'Fendeuse de bûches thermique 22T sur châssis', category: 'Chauffage', price: 1649, priceHT: 1374.17, stock: 4, status: 'published', brand: 'Forest Master', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDFMNmu3a1JhGblUotwY9OOazAbqHbrB6AObpE2kjPTWOyvsBDlVXzzaCylPL6Wb6lVJDenGKjpmeu0dRw2YHF-Fz_8CmQAyPHZCrZuteLetYaxzk0Efqa478wet5FFo1KNmUX368ZYdCevgoQB9yiCMSflTHE4tVvM9FEEdequmaSzXPvNCDG64xizXqI4XVjueY9tru78heVfpCsInAlm5M-7NCUronYI3T1lCMx0' },
    { id: 'SKU-BIO-8821', name: 'Palette bois de chauffage 2 stères (Chêne/Hêtre 33cm)', category: 'Chauffage', price: 265, priceHT: 240.91, stock: 82, status: 'published', brand: 'Local', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDVodSGf60o7b1N59sus70k0wX9Ee2xO_8o8qIkuEg7I5VqGu1JcYuHV3gqXEH3CDDFyDWT8vLjsAkxxCGXSxGOr70JWMtCgB22Ycl0m4XsxcZzUiHjq4-TLqHHXvloSBbYplPeO3EsXsCO35kjefuuUt8rU4AG1vFlrrdWLkBnN5he_dKW94id3QGZes0idupAMtPcb_MnAyrnKiZdXsRgX2mtrQVuSBI7EUyvnZO9' },
    { id: 'SKU-HYD-5504', name: 'Pompe immergée grand débit 1.5 kW Inox Pro', category: 'Pompage', price: 489, priceHT: 407.50, stock: 2, status: 'published', brand: 'Grundfos', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB-6NnGN1nSIREPbCE4ewT_DspebfIiPzGtLQCpGDre0HTQt9l3dmRXjQ6qpoJGuTF_RHg3sGpFnCThu5BaOrCU8gRG8uY2RmKT1rairg8G_4NQMWHyiQZzYhv31IlPlDMOoXEYiiqt5DuRjhuwUSqsgiVkyCmt2y4UYPFYPVHgPnmQAoUycs5HKCciY9vi1OZdROpbLVW277t3MOIt5j8IRG5hV-hfGNaXFOkqNL3z' },
    { id: 'SKU-TER-9041', name: 'Motoculteur thermique 7 CV boîte 2+1 avec fraises', category: 'Travail du sol', price: 749, priceHT: 624.17, stock: 6, status: 'draft', brand: 'Stihl', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBgSZ7TJA8t9K_k6falUV3YRDMXTZ6Zlasiab1k9ERl28lUc0kiTnCWFsAtZ3xymXB7y7OPDiETqDuakWeB2O1a8hkCrN0PZrgLEDk9ExVZs1aNjdkEWgAngNocoAUXKvDCGduCv5wA_LUuj1h4sLMkQMyFroPOaeb4_Q35D_D61qdi3SRJryqlSn0GueS1WCSOUg_iwnOenAQSbcytFqK8MBq7O-tEfhg68-ob3Ew7' },
    { id: 'SKU-CLO-0199', name: 'Grillage noué agricole 140/12/15 (Rouleau de 50m)', category: 'Clôtures & Élevage', price: 115, priceHT: 95.83, stock: 0, status: 'published', brand: 'AgriFence', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDOKgy1UImxxhQwY6W6eOgIVFbuuPKfOmyuM5eZSrNvF3v-a6_1mxO_dmx3Kk9IaETLPzfViaQCZSzvCNvRPIkgv6-JwuYAVFI1KxwStwwQpICvE4APA_CfB9cEDKIg5e3-PpOKLKj8iuiXJOXtACdEZg5BCUZ6ylBipXM5o0kWa-V2TYPT7mFZ5mRl36eITWbJJvoEyKneewIMyTgHGi9DxFV1b9YRprmz1V0BD8YI' },
    { id: 'SKU-EPN-3301', name: 'Épandeur d\'engrais centrifuge 300L porté', category: 'Tracteurs & Engins', price: 590, priceHT: 491.67, stock: 8, status: 'published', brand: 'Amazone', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA6NRM--xQS3oh-SWzp4XSyraTIy4sEXXFU8OOI5dt6gBw1QWRcGy3GXBO1oYK91JtdMsZzR7UVdL7v3hHHU6dtG-ewB_n7ZlWMG7F_k76WdMjzEuWu64uGMQMIOE61nSgTgYhjmAXewF13QyjpvWqy3X5EJWLRCk_689RaIEN4rM-NrlIrQzcQtJDj9sFIyUZAS9yWucvW5r5M8B3L4JeLcZLizQjm0xlkTIL2jDMX' }
  ],
  adult: [
    { id: 'SKU-VIB-001', name: 'Vibrateur rabbit rechargeable 10 modes', category: 'Vibrateurs', price: 89.90, priceHT: 74.92, stock: 45, status: 'published', brand: 'LELO', image: 'https://via.placeholder.com/200x200/ff69b4/ffffff?text=Vibrateur' },
    { id: 'SKU-LING-002', name: 'Ensemble lingerie dentelle noire Taille M', category: 'Lingerie', price: 45.00, priceHT: 37.50, stock: 120, status: 'published', brand: 'Lovehoney', image: 'https://via.placeholder.com/200x200/000000/ffffff?text=Lingerie' },
    { id: 'SKU-BOND-003', name: 'Kit bondage débutant 6 pièces', category: 'Bondage', price: 34.99, priceHT: 29.16, stock: 28, status: 'published', brand: 'Fifty Shades', image: 'https://via.placeholder.com/200x200/8b0000/ffffff?text=Bondage' },
    { id: 'SKU-LUB-004', name: 'Lubrifiant silicone longue durée 250ml', category: 'Lubrifiants', price: 18.50, priceHT: 15.42, stock: 200, status: 'published', brand: 'Pjur', image: 'https://via.placeholder.com/200x200/00ced1/ffffff?text=Lube' },
    { id: 'SKU-TOY-005', name: 'Masturbateur masculin realistic', category: 'Toys pour hommes', price: 62.00, priceHT: 51.67, stock: 15, status: 'draft', brand: 'Fleshlight', image: 'https://via.placeholder.com/200x200/4169e1/ffffff?text=Toy' }
  ]
};

const DEFAULT_ORDERS = {
  agri: [
    { id: 'CMD-8942', date: '14/10/2024 14:12', client: 'EARL Les Moissons', contact: 'Jean-Pierre Dumont', items: '1× Fendeuse 22T hydraulique', total: 4890.00, payment: 'verified', status: 'approved', receipt: true },
    { id: 'CMD-8941', date: '14/10/2024 11:45', client: 'Coopérative Val de Loire', contact: 'Sophie Maréchal', items: '3 articles (Attelages & pièces)', total: 1420.00, payment: 'pending', status: 'pending', receipt: true },
    { id: 'CMD-8940', date: '13/10/2024 17:05', client: 'SCEA Beauce Fertile', contact: 'Guillaume Bernard', items: '1× Broyeur d\'accotement 200cm', total: 14850.00, payment: 'verified', status: 'preparing', receipt: true },
    { id: 'CMD-8939', date: '13/10/2024 09:20', client: 'Agri-Bio Occitanie', contact: 'Christophe Vasseur', items: '2× Kit d\'injection fertilisant', total: 870.00, payment: 'verified', status: 'shipped', receipt: true },
    { id: 'CMD-8938', date: '12/10/2024 15:30', client: 'Domaine de la Ronce', contact: 'Élodie Laurent', items: '1× Cuve de stockage 5000L', total: 3240.00, payment: 'rejected', status: 'pending', receipt: true },
    { id: 'CMD-8937', date: '12/10/2024 10:14', client: 'GAEC des Deux Vallées', contact: 'Michel Tardieu', items: '4× Pneus agraires 480/70 R38', total: 5980.00, payment: 'verified', status: 'approved', receipt: true }
  ],
  adult: [
    { id: 'CMD-A-1001', date: '15/10/2024 09:30', client: 'Jean Dupont', contact: 'Jean Dupont', items: '1× Vibrateur rabbit', total: 89.90, payment: 'pending', status: 'pending', receipt: true },
    { id: 'CMD-A-1002', date: '14/10/2024 16:20', client: 'Marie Lefèvre', contact: 'Marie Lefèvre', items: '2× Lingerie + Lubrifiant', total: 108.50, payment: 'verified', status: 'preparing', receipt: true },
    { id: 'CMD-A-1003', date: '13/10/2024 11:00', client: 'Pierre Martin', contact: 'Pierre Martin', items: '1× Kit bondage', total: 34.99, payment: 'verified', status: 'shipped', receipt: true }
  ]
};

const CATEGORIES = {
  agri: ['Tracteurs & Engins', 'Chauffage & Bois', 'Pompage & Irrigation', 'Travail du sol', 'Élevage & Soins', 'Clôtures'],
  adult: ['Vibrateurs', 'Lingerie', 'Bondage & BDSM', 'Lubrifiants', 'Toys pour hommes', 'Accessoires', 'Bien-être']
};

const BRANDS = {
  agri: ['John Deere', 'Forest Master', 'Grundfos', 'Stihl', 'Amazone', 'AgriFence', 'Local'],
  adult: ['LELO', 'We-Vibe', 'Lovehoney', 'Fleshlight', 'Pjur', 'Fifty Shades', 'Adam & Eve']
};

function initData() {
  if (!localStorage.getItem('admin_auth')) {
    localStorage.setItem('admin_auth', 'false');
  }
  if (!localStorage.getItem('current_store')) {
    localStorage.setItem('current_store', 'agri');
  }
  if (!localStorage.getItem('products')) {
    localStorage.setItem('products', JSON.stringify(DEFAULT_PRODUCTS));
  }
  if (!localStorage.getItem('orders')) {
    localStorage.setItem('orders', JSON.stringify(DEFAULT_ORDERS));
  }
}

function isAuthenticated() {
  return localStorage.getItem('admin_auth') === 'true';
}

function login(username, password) {
  if (username === 'admin' && password === 'admin') {
    localStorage.setItem('admin_auth', 'true');
    localStorage.setItem('admin_user', 'Alexandre L.');
    return true;
  }
  return false;
}

function logout() {
  localStorage.setItem('admin_auth', 'false');
  window.location.href = 'login.html';
}

function getCurrentStore() {
  return localStorage.getItem('current_store') || 'agri';
}

function setCurrentStore(store) {
  localStorage.setItem('current_store', store);
  window.location.reload();
}

function getProducts(store) {
  const all = JSON.parse(localStorage.getItem('products') || '{}');
  return all[store] || [];
}

function saveProducts(store, products) {
  const all = JSON.parse(localStorage.getItem('products') || '{}');
  all[store] = products;
  localStorage.setItem('products', JSON.stringify(all));
}

function getOrders(store) {
  const all = JSON.parse(localStorage.getItem('orders') || '{}');
  return all[store] || [];
}

function saveOrders(store, orders) {
  const all = JSON.parse(localStorage.getItem('orders') || '{}');
  all[store] = orders;
  localStorage.setItem('orders', JSON.stringify(all));
}

function updateOrderStatus(store, orderId, newStatus, paymentStatus) {
  const orders = getOrders(store);
  const order = orders.find(o => o.id === orderId);
  if (order) {
    order.status = newStatus;
    if (paymentStatus) order.payment = paymentStatus;
    saveOrders(store, orders);
  }
}

function addProduct(store, product) {
  const products = getProducts(store);
  product.id = 'SKU-' + Date.now().toString().slice(-6);
  products.unshift(product);
  saveProducts(store, products);
  return product;
}

// Navigation helper
function setupNavigation() {
  const currentPath = window.location.pathname.split('/').pop() || 'products.html';
  document.querySelectorAll('[data-path]').forEach(link => {
    const path = link.getAttribute('data-path');
    if (path && currentPath.includes(path.replace(/-/g, '')) || 
        (path === 'liste-des-produits' && currentPath.includes('products')) ||
        (path === 'toutes-les-commandes' && currentPath.includes('orders')) ||
        (path === 'parametres-boutique' && currentPath.includes('settings')) ||
        (path === 'verification-des-paiements' && currentPath.includes('verification'))) {
      link.classList.add('bg-primary-container', 'text-on-primary', 'font-medium', 'shadow-sm');
      link.classList.remove('text-on-surface-variant');
    }
  });

  // Store switcher
  const storeNameEl = document.querySelector('.store-name');
  if (storeNameEl) {
    const store = STORES[getCurrentStore()];
    storeNameEl.textContent = store.name;
  }

  // Logout button
  const logoutBtn = document.querySelector('[title="Déconnexion"]');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  }
}

// Check auth on protected pages
function requireAuth() {
  if (!isAuthenticated() && !window.location.pathname.includes('login.html')) {
    window.location.href = 'login.html';
  }
}

initData();

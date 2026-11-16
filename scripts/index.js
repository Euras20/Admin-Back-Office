

// ---- extracted from index.html ----

if (AdminAPI.isAuthenticated()) {
  window.location.href = 'products.html';
} else {
  window.location.href = 'login.html';
}



// ---- extracted from login.html ----

if (AdminAPI.isAuthenticated()) location.href = 'products.html';
    document.getElementById('loginForm').onsubmit = async function(e) {
      e.preventDefault();
      const errEl = document.getElementById('error');
      errEl.style.display = 'none';
      try {
        await AdminAPI.login(
          document.getElementById('email').value,
          document.getElementById('password').value
        );
        location.href = 'products.html';
      } catch (err) {
        errEl.textContent = 'Identifiants incorrects ou backend indisponible';
        errEl.style.display = 'block';
      }
    };

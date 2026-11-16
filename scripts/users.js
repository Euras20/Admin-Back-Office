

// ---- extracted from users.html ----

requireAuth();

    function loadCredentials() {
      document.getElementById('username').value = localStorage.getItem('admin_username') || 'admin';
      document.getElementById('newPassword').value = '';
      document.getElementById('confirmPassword').value = '';
    }

    document.getElementById('credentialsForm').onsubmit = function(e) {
      e.preventDefault();
      const username = document.getElementById('username').value.trim();
      const newPass = document.getElementById('newPassword').value;
      const confirm = document.getElementById('confirmPassword').value;

      if (!username) {
        alert('Le nom d\'utilisateur est obligatoire');
        return;
      }
      if (newPass && newPass !== confirm) {
        alert('Les mots de passe ne correspondent pas');
        return;
      }

      updateCredentials(username, newPass || null);
      alert('Identifiants mis à jour. Vous allez être déconnecté.');
      logout();
    };

    loadCredentials();

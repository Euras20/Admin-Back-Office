

// ---- extracted from import.html ----

requireAuth();
    document.getElementById('storeName').textContent = (STORES[getCurrentStore()] || STORES.agri).name;

    let currentJobId = null;

    async function downloadTemplate() {
      const token = AdminAPI.getToken();
      const res = await fetch(`${window.API_BASE || 'https://marketplace-app-production-6dae1174.up.railway.app/api'}/admin/imports/template`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'X-Store-Code': AdminAPI.getStoreCode(),
        },
      });
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'import-template.csv';
      a.click();
    }

    document.getElementById('importForm').onsubmit = async (e) => {
      e.preventDefault();
      const msg = document.getElementById('msg');
      msg.style.display = 'none';
      const fd = new FormData(e.target);
      try {
        const token = AdminAPI.getToken();
        const res = await fetch(`${window.API_BASE || 'https://marketplace-app-production-6dae1174.up.railway.app/api'}/admin/imports`, {
          method: 'POST',
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'X-Store-Code': AdminAPI.getStoreCode(),
            'Accept': 'application/json',
          },
          body: fd,
        });
        if (!res.ok) throw new Error(await res.text());
        const job = await res.json();
        currentJobId = job.id;
        showJob(job);
        msg.textContent = 'Fichier reçu. Vérifiez le statut puis confirmez.';
        msg.style.color = '#008060';
        msg.style.display = 'block';
      } catch (err) {
        msg.textContent = err.message || 'Erreur';
        msg.style.color = '#c00';
        msg.style.display = 'block';
      }
    };

    function showJob(job) {
      document.getElementById('jobCard').style.display = 'block';
      document.getElementById('jobInfo').innerHTML = `
        <div><strong>ID :</strong> ${job.id}</div>
        <div><strong>Statut :</strong> ${job.status}</div>
        <div><strong>Lignes :</strong> ${job.total_rows ?? '—'}</div>
      `;
      document.getElementById('btnConfirm').style.display = 'inline-flex';
    }

    document.getElementById('btnConfirm').onclick = async () => {
      if (!currentJobId) return;
      try {
        const job = await AdminAPI.api(`/admin/imports/${currentJobId}/confirm`, { method: 'POST' });
        showJob(job);
        alert('Import confirmé');
      } catch (err) {
        alert(err.message);
      }
    };

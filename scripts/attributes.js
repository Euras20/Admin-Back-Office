

// ---- extracted from attributes.html ----

requireAuth();
    document.getElementById('storeName').textContent = (STORES[getCurrentStore()] || STORES.agri).name;

    function slugify(s) {
      return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    }
    document.getElementById('attrLabel').addEventListener('input', (e) => {
      const code = document.getElementById('attrCode');
      if (!code.dataset.touched) code.value = slugify(e.target.value);
    });
    document.getElementById('attrCode').addEventListener('input', () => {
      document.getElementById('attrCode').dataset.touched = '1';
    });

    async function load() {
      try {
        const json = await AdminAPI.api('/admin/product-attributes');
        const list = json.data || json || [];
        document.getElementById('list').innerHTML = list.map(a => `
          <tr>
            <td style="font-weight:500;">${a.label}</td>
            <td class="text-secondary">${a.code}</td>
            <td>${a.data_type}</td>
            <td>${a.is_filterable ? 'Oui' : 'Non'}</td>
          </tr>
        `).join('') || '<tr><td colspan="4" style="text-align:center;padding:32px;color:#666;">Aucune caractéristique</td></tr>';
      } catch (err) {
        document.getElementById('list').innerHTML = `<tr><td colspan="4" style="text-align:center;padding:32px;color:#666;">${err.message}</td></tr>`;
      }
    }

    function openForm() {
      document.getElementById('formCard').style.display = 'block';
      document.getElementById('attrForm').reset();
      document.getElementById('attrCode').dataset.touched = '';
    }
    function closeForm() { document.getElementById('formCard').style.display = 'none'; }

    document.getElementById('attrForm').onsubmit = async (e) => {
      e.preventDefault();
      const errEl = document.getElementById('formError');
      errEl.style.display = 'none';
      const fd = new FormData(e.target);
      try {
        await AdminAPI.api('/admin/product-attributes', {
          method: 'POST',
          body: JSON.stringify({
            code: fd.get('code'),
            label: fd.get('label'),
            data_type: fd.get('data_type'),
            is_filterable: e.target.querySelector('[name=is_filterable]').checked,
            sort_order: 0,
          }),
        });
        closeForm();
        load();
      } catch (err) {
        errEl.textContent = err.message;
        errEl.style.display = 'block';
      }
    };

    load();



// ---- extracted from categories.html ----

requireAuth();

    let categories = [];

    function slugify(s) {
      return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    }

    document.getElementById('catName').addEventListener('input', (e) => {
      const slug = document.getElementById('catSlug');
      if (!slug.dataset.touched) slug.value = slugify(e.target.value);
    });
    document.getElementById('catSlug').addEventListener('input', () => {
      document.getElementById('catSlug').dataset.touched = '1';
    });

    async function load() {
      const store = getCurrentStore();
      document.getElementById('storeName').textContent = (STORES[store] || STORES.agri).name;

      try {
        const json = await AdminAPI.getCategories();
        categories = json.data || json || [];
        document.getElementById('count').textContent = categories.length + ' catégories';

        const parentMap = Object.fromEntries(categories.map(c => [c.id, c.name]));
        document.getElementById('list').innerHTML = categories.map(c => `
          <tr>
            <td style="font-weight:500;">${c.name}</td>
            <td class="text-secondary">${c.slug}</td>
            <td>${c.parent_id ? (parentMap[c.parent_id] || '—') : '—'}</td>
            <td><span class="badge ${c.is_active ? 'badge-success' : 'badge-neutral'}">${c.is_active ? 'Active' : 'Inactive'}</span></td>
            <td style="text-align:right;">
              <button class="btn" style="height:28px;" onclick="toggleActive(${c.id}, ${!c.is_active})">${c.is_active ? 'Désactiver' : 'Activer'}</button>
            </td>
          </tr>
        `).join('') || '<tr><td colspan="5" style="text-align:center;padding:32px;color:#666;">Aucune catégorie</td></tr>';

        document.getElementById('parentSelect').innerHTML =
          '<option value="">— Aucune —</option>' +
          categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
      } catch (err) {
        document.getElementById('list').innerHTML = `<tr><td colspan="5" style="text-align:center;padding:32px;color:#666;">Impossible de charger (${err.message})</td></tr>`;
      }
    }

    function openForm() {
      document.getElementById('formCard').style.display = 'block';
      document.getElementById('catForm').reset();
      document.getElementById('catSlug').dataset.touched = '';
    }
    function closeForm() {
      document.getElementById('formCard').style.display = 'none';
    }

    document.getElementById('catForm').onsubmit = async (e) => {
      e.preventDefault();
      const errEl = document.getElementById('formError');
      errEl.style.display = 'none';
      const fd = new FormData(e.target);
      const payload = {
        name: fd.get('name'),
        slug: fd.get('slug'),
        parent_id: fd.get('parent_id') ? Number(fd.get('parent_id')) : null,
        description: fd.get('description') || null,
        is_active: e.target.querySelector('[name=is_active]').checked,
        sort_order: 0,
      };
      try {
        await AdminAPI.createCategory(payload);
        closeForm();
        load();
      } catch (err) {
        errEl.textContent = err.message || 'Erreur';
        errEl.style.display = 'block';
      }
    };

    async function toggleActive(id, active) {
      try {
        await AdminAPI.api(`/admin/categories/${id}`, {
          method: 'PATCH',
          body: JSON.stringify({ is_active: active }),
        });
        load();
      } catch (err) {
        alert(err.message);
      }
    }

    load();

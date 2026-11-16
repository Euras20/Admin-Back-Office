

// ---- extracted from brands.html ----

requireAuth();

    function slugify(s) {
      return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    }

    document.getElementById('brandName').addEventListener('input', (e) => {
      const slug = document.getElementById('brandSlug');
      if (!slug.dataset.touched) slug.value = slugify(e.target.value);
    });
    document.getElementById('brandSlug').addEventListener('input', () => {
      document.getElementById('brandSlug').dataset.touched = '1';
    });

    async function load() {
      const store = getCurrentStore();
      document.getElementById('storeName').textContent = (STORES[store] || STORES.agri).name;

      try {
        const json = await AdminAPI.getBrands();
        const brands = json.data || json || [];
        document.getElementById('count').textContent = brands.length + ' marques';

        document.getElementById('list').innerHTML = brands.map(b => `
          <tr>
            <td style="font-weight:500;">${b.name}</td>
            <td class="text-secondary">${b.slug}</td>
            <td><span class="badge ${b.is_active ? 'badge-success' : 'badge-neutral'}">${b.is_active ? 'Active' : 'Inactive'}</span></td>
            <td style="text-align:right;">
              <button class="btn" style="height:28px;" onclick="toggleActive(${b.id}, ${!b.is_active})">${b.is_active ? 'Désactiver' : 'Activer'}</button>
            </td>
          </tr>
        `).join('') || '<tr><td colspan="4" style="text-align:center;padding:32px;color:#666;">Aucune marque</td></tr>';
      } catch (err) {
        document.getElementById('list').innerHTML = `<tr><td colspan="4" style="text-align:center;padding:32px;color:#666;">Impossible de charger (${err.message})</td></tr>`;
      }
    }

    function openForm() {
      document.getElementById('formCard').style.display = 'block';
      document.getElementById('brandForm').reset();
      document.getElementById('brandSlug').dataset.touched = '';
    }
    function closeForm() {
      document.getElementById('formCard').style.display = 'none';
    }

    document.getElementById('brandForm').onsubmit = async (e) => {
      e.preventDefault();
      const errEl = document.getElementById('formError');
      errEl.style.display = 'none';
      const fd = new FormData(e.target);
      const payload = {
        name: fd.get('name'),
        slug: fd.get('slug'),
        is_active: e.target.querySelector('[name=is_active]').checked,
      };
      try {
        await AdminAPI.createBrand(payload);
        closeForm();
        load();
      } catch (err) {
        errEl.textContent = err.message || 'Erreur';
        errEl.style.display = 'block';
      }
    };

    async function toggleActive(id, active) {
      try {
        await AdminAPI.api(`/admin/brands/${id}`, {
          method: 'PATCH',
          body: JSON.stringify({ is_active: active }),
        });
        load();
      } catch (err) {
        alert(err.message);
      }
    }

    load();

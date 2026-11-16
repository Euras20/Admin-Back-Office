

// ---- extracted from products.html ----

requireAuth();

    function toggleDropdown() {
      document.getElementById('storeDropdown').classList.toggle('open');
    }
    function switchStore(store) {
      setCurrentStore(store);
    }

    async function renderProducts() {
      const store = getCurrentStore();
      document.getElementById('storeName').textContent = (STORES[store] || STORES.agri).name;

      const params = {};
      const status = document.getElementById('statusFilter').value;
      const promo = document.getElementById('promoFilter').value;
      if (status !== 'all') params.status = status;
      if (promo === '1') params.is_promo = '1';

      try {
        const json = await AdminAPI.getProducts(params);
        let products = json.data || json || [];

        const search = document.getElementById('searchInput').value.toLowerCase();
        if (search) {
          products = products.filter(p =>
            (p.name || '').toLowerCase().includes(search) ||
            (p.slug || '').toLowerCase().includes(search) ||
            (p.variants || []).some(v => (v.sku || '').toLowerCase().includes(search))
          );
        }

        document.getElementById('productCount').textContent = products.length + ' références';
        document.getElementById('productsTableBody').innerHTML = products.map(p => {
          const first = p.variants?.[0] || {};
          const price = first.price || 0;
          const stock = first.inventory?.on_hand ?? 0;
          const promo = p.is_promo ? '<span class="badge badge-warning" style="margin-left:6px;">Promo</span>' : '';
          return `
            <tr>
              <td><input type="checkbox" /></td>
              <td>
                <div style="width:40px;height:40px;border-radius:6px;overflow:hidden;background:#f1f2f3;">
                  <img src="${p.media?.[0]?.url || 'https://via.placeholder.com/40'}" style="width:100%;height:100%;object-fit:cover;" />
                </div>
              </td>
              <td>
                <div style="font-weight:500;">${p.name}${promo}</div>
                <div class="text-secondary" style="font-size:12px;">${p.slug || p.id}</div>
              </td>
              <td>${p.category?.name || '—'}</td>
              <td>${p.brand?.name || '—'}</td>
              <td style="text-align:right;font-variant-numeric:tabular-nums;">
                <div style="font-weight:500;">${formatPrice(price)}</div>
              </td>
              <td>
                <span class="badge ${stock > 3 ? 'badge-success' : stock > 0 ? 'badge-warning' : 'badge-neutral'}">
                  ${stock > 0 ? stock + ' en stock' : 'Épuisé'}
                </span>
              </td>
              <td>
                <span class="badge ${statusBadge(p.status)}">${p.status}</span>
              </td>
              <td style="text-align:right;white-space:nowrap;">
                <a href="add-product.html?id=${p.id}" class="btn" style="height:28px;padding:0 8px;">Modifier</a>
                <button class="btn" style="height:28px;padding:0 8px;" onclick="deleteProduct('${p.id}')">Supprimer</button>
                ${p.status !== 'published' ? `<button class="btn" style="height:28px;padding:0 8px;" onclick="AdminAPI.publishProduct('${p.id}').then(renderProducts)">Publier</button>` : `<button class="btn" style="height:28px;padding:0 8px;" onclick="AdminAPI.archiveProduct('${p.id}').then(renderProducts)">Archiver</button>`}
              </td>
            </tr>`;
        }).join('');
      } catch (err) {
        document.getElementById('productsTableBody').innerHTML = `<tr><td colspan="7" style="text-align:center;padding:40px;color:#666;">Impossible de charger les produits (${err.message})</td></tr>`;
      }
    }

    async function deleteProduct(id) {
      if (!confirm('Supprimer ce produit ?')) return;
      try {
        await AdminAPI.api('/admin/products/' + id, { method: 'DELETE' });
        renderProducts();
      } catch (err) { alert(err.message); }
    }
    document.getElementById('searchInput').addEventListener('input', renderProducts);
    document.getElementById('statusFilter').addEventListener('change', renderProducts);
    document.getElementById('promoFilter').addEventListener('change', renderProducts);
    renderProducts();

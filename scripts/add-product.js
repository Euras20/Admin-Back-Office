

// ---- extracted from add-product.html ----

requireAuth();

    let variantIndex = 1;

    function slugify(s) {
      return s.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }

    document.getElementById('name').addEventListener('input', (e) => {
      const slug = document.getElementById('slug');
      if (!slug.dataset.touched) slug.value = slugify(e.target.value);
    });
    document.getElementById('slug').addEventListener('input', () => {
      document.getElementById('slug').dataset.touched = '1';
    });

    async function loadSelects() {
      const store = getCurrentStore();
      document.getElementById('storeName').textContent = (STORES[store] || STORES.agri).name;

      try {
        const cats = await AdminAPI.getCategories();
        const list = cats.data || cats || [];
        document.getElementById('categorySelect').innerHTML = list.map(c =>
          `<option value="${c.id}">${c.name}</option>`
        ).join('') || '<option value="">Aucune catégorie</option>';
      } catch (e) {
        document.getElementById('categorySelect').innerHTML = '<option value="">Erreur chargement</option>';
      }

      try {
        const brands = await AdminAPI.getBrands();
        const list = brands.data || brands || [];
        document.getElementById('brandSelect').innerHTML =
          '<option value="">— Aucune —</option>' +
          list.map(b => `<option value="${b.id}">${b.name}</option>`).join('');
      } catch (e) {}
    }

    document.getElementById('addVariant').onclick = () => {
      const i = variantIndex++;
      const div = document.createElement('div');
      div.className = 'variant-row';
      div.style.cssText = 'display:grid;grid-template-columns:1.2fr 1fr 100px 100px 80px;gap:8px;margin-bottom:8px;align-items:end;';
      div.innerHTML = `
        <div><input class="input" name="variants[${i}][sku]" required placeholder="SKU" /></div>
        <div><input class="input" name="variants[${i}][variant_name]" placeholder="Nom variante" /></div>
        <div><input class="input" type="number" step="0.01" name="variants[${i}][price]" required placeholder="Prix" /></div>
        <div><input class="input" type="number" step="0.01" name="variants[${i}][compare_at_price]" placeholder="Barré" /></div>
        <div><input class="input" type="number" name="variants[${i}][quantity]" value="0" /></div>
      `;
      document.getElementById('variants').appendChild(div);
    };

    document.getElementById('productForm').onsubmit = async (e) => {
      e.preventDefault();
      const errEl = document.getElementById('error');
      errEl.style.display = 'none';

      const fd = new FormData(e.target);
      const variants = [];
      const variantMap = {};
      for (const [k, v] of fd.entries()) {
        const m = k.match(/^variants\[(\d+)\]\[(\w+)\]$/);
        if (m) {
          const idx = m[1];
          const field = m[2];
          variantMap[idx] = variantMap[idx] || {};
          variantMap[idx][field] = v === '' ? null : (field === 'price' || field === 'compare_at_price' || field === 'quantity' ? Number(v) : v);
        }
      }
      for (const v of Object.values(variantMap)) {
        if (v.sku && v.price != null) {
          variants.push({
            sku: v.sku,
            variant_name: v.variant_name || null,
            price: v.price,
            compare_at_price: v.compare_at_price || null,
            is_active: true,
            quantity: v.quantity ?? 0,
          });
        }
      }

      const imageUrls = (fd.get('image_urls') || '')
        .split(/\n+/)
        .map(s => s.trim())
        .filter(Boolean);

      const fileInput = document.getElementById('images');
      const hasFiles = fileInput && fileInput.files && fileInput.files.length > 0;

      try {
        if (hasFiles) {
          // Multipart: files + JSON fields
          const body = new FormData();
          body.append('name', fd.get('name'));
          body.append('slug', fd.get('slug'));
          body.append('category_id', fd.get('category_id'));
          if (fd.get('brand_id')) body.append('brand_id', fd.get('brand_id'));
          if (fd.get('description')) body.append('description', fd.get('description'));
          if (fd.get('external_url')) body.append('external_url', fd.get('external_url'));
          body.append('is_promo', document.getElementById('is_promo').checked ? '1' : '0');
          imageUrls.forEach(u => body.append('image_urls[]', u));
          variants.forEach((v, i) => {
            body.append(`variants[${i}][sku]`, v.sku);
            if (v.variant_name) body.append(`variants[${i}][variant_name]`, v.variant_name);
            body.append(`variants[${i}][price]`, v.price);
            if (v.compare_at_price != null) body.append(`variants[${i}][compare_at_price]`, v.compare_at_price);
            body.append(`variants[${i}][quantity]`, v.quantity ?? 0);
            body.append(`variants[${i}][is_active]`, '1');
          });
          for (const file of fileInput.files) body.append('images[]', file);
          document.querySelectorAll('[data-attr]').forEach(el => {
            if (el.value) body.append('attributes[' + el.dataset.attr + ']', el.value);
          });
          if (isEdit) {
            await AdminAPI.api('/admin/products/' + editId, { method: 'POST', body });
          } else {
            await AdminAPI.createProduct(body, true);
          }
        } else {
          const attributes = {};
        document.querySelectorAll('[data-attr]').forEach(el => {
          if (el.value) attributes[el.dataset.attr] = el.value;
        });
        const payload = {
            name: fd.get('name'),
            slug: fd.get('slug'),
            category_id: Number(fd.get('category_id')),
            brand_id: fd.get('brand_id') ? Number(fd.get('brand_id')) : null,
            description: fd.get('description') || null,
            external_url: fd.get('external_url') || null,
            is_promo: document.getElementById('is_promo').checked,
            image_urls: imageUrls,
            variants,
            attributes,
          };
          if (isEdit) {
            await AdminAPI.api('/admin/products/' + editId, { method: 'PUT', body: JSON.stringify(payload) });
          } else {
            await AdminAPI.createProduct(payload);
          }
        }
        if (isEdit) {
          const attributes = {};
          document.querySelectorAll('[data-attr]').forEach(el => {
            if (el.value) attributes[el.dataset.attr] = el.value;
          });
          try {
            await AdminAPI.api('/admin/products/' + editId, {
              method: 'PUT',
              body: JSON.stringify({ attributes })
            });
          } catch (e) {}
        }
        location.href = 'products.html';
      } catch (err) {
        errEl.textContent = err.message || 'Erreur lors de la création';
        errEl.style.display = 'block';
      }
    };

    
    const params = new URLSearchParams(location.search);
    const editId = params.get('id');
    let isEdit = !!editId;

    async function loadForEdit() {
      if (!editId) return;
      document.querySelector('.page-title').textContent = 'Modifier le produit';
      try {
        const p = await AdminAPI.api('/admin/products/' + editId);
        document.querySelector('[name=name]').value = p.name || '';
        document.querySelector('[name=slug]').value = p.slug || '';
        document.querySelector('[name=description]').value = p.description || '';
        document.getElementById('is_promo').checked = !!p.is_promo;
        if (p.category_id) document.querySelector('[name=category_id]').value = p.category_id;
        if (p.brand_id) document.querySelector('[name=brand_id]').value = p.brand_id;
        // Prefill first variant if present
        // Prefill attributes
        const values = {};
        (p.attribute_values || p.attributeValues || []).forEach(av => {
          values[av.attribute_definition_id] = av.value_text ?? av.value_integer ?? av.value_decimal ?? '';
        });
        document.querySelectorAll('[data-attr]').forEach(el => {
          if (values[el.dataset.attr]) el.value = values[el.dataset.attr];
        });

        const v = p.variants?.[0];
        if (v) {
          const row = document.querySelector('.variant-row') || document.querySelector('[name="variants[0][sku]"]')?.closest('.card, .variant');
          const sku = document.querySelector('[name="variants[0][sku]"]') || document.querySelector('[name=sku]');
          if (sku) sku.value = v.sku || '';
          const vn = document.querySelector('[name="variants[0][variant_name]"]');
          if (vn) vn.value = v.variant_name || '';
          const price = document.querySelector('[name="variants[0][price]"]');
          if (price) price.value = v.price || '';
          const cap = document.querySelector('[name="variants[0][compare_at_price]"]');
          if (cap) cap.value = v.compare_at_price || '';
          const qty = document.querySelector('[name="variants[0][quantity]"]');
          if (qty) qty.value = v.inventory?.on_hand ?? '';
        }
      } catch (err) {
        alert('Impossible de charger le produit: ' + err.message);
      }
    }

    
    async function loadAttributes() {
      try {
        const defs = await AdminAPI.api('/admin/product-attributes');
        const list = defs.data || defs || [];
        const box = document.getElementById('attributes');
        if (!list.length) {
          box.innerHTML = '<div>Aucune caractéristique définie. Créez-en dans les paramètres ou via l\'API.</div>';
          return;
        }
        box.innerHTML = list.map(d => `
          <div class="mb-3">
            <label>${d.label}${d.is_required ? ' *' : ''}</label>
            <input class="input" data-attr="${d.id}" data-type="${d.data_type}" placeholder="${d.label}" />
          </div>
        `).join('');
      } catch (e) {
        document.getElementById('attributes').textContent = 'Impossible de charger les caractéristiques';
      }
    }

    loadSelects().then(() => loadAttributes().then(loadForEdit));

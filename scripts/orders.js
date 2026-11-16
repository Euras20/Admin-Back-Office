

// ---- extracted from orders.html ----

requireAuth();

    const statusLabels = {
      pending: 'En attente',
      approved: 'Approuvée',
      preparing: 'En préparation',
      shipped: 'Expédiée',
      delivered: 'Livrée'
    };
    const paymentBadge = {
      pending: 'badge-warning',
      verified: 'badge-success',
      rejected: 'badge-critical'
    };
    const paymentText = {
      pending: 'À vérifier',
      verified: 'Vérifié',
      rejected: 'Rejeté'
    };

    function toggleDropdown() {
      document.getElementById('storeDropdown').classList.toggle('open');
    }
    function switchStore(store) {
      setCurrentStore(store);
    }

    async function renderOrders(filter = 'all') {
      const store = getCurrentStore();
      document.getElementById('storeName').textContent = (STORES[store] || STORES.agri).name;

      try {
        const json = await AdminAPI.getOrders();
        let orders = json.data || json || [];
        const all = [...orders];
        if (filter !== 'all') {
          orders = orders.filter(o => o.status === filter || o.payment_status === filter);
        }

        const labels = {
          pending_payment: 'Paiement en attente',
          payment_review: 'En vérification',
          approved: 'Approuvée',
          in_preparation: 'En préparation',
          shipped: 'Expédiée',
          delivered: 'Livrée',
          rejected: 'Rejetée',
          cancelled: 'Annulée',
          expired: 'Expirée',
        };
        document.getElementById('totalOrders').textContent = all.length;
        document.getElementById('pendingOrders').textContent = all.filter(o => ['pending_payment','payment_review'].includes(o.status)).length;
        document.getElementById('shippingOrders').textContent = all.filter(o => o.status === 'shipped').length;

        document.getElementById('ordersTableBody').innerHTML = orders.map(o => `
          <tr>
            <td><input type="checkbox" /></td>
            <td><a href="verification.html?id=${o.id}" style="color:#1a1a1a;font-weight:500;text-decoration:none;">#${o.order_number || o.id}</a></td>
            <td class="text-secondary">${o.created_at ? new Date(o.created_at).toLocaleDateString('fr-FR') : ''}</td>
            <td>
              <div style="font-weight:500;">${o.contact_name || '—'}</div>
              <div class="text-secondary" style="font-size:12px;">${o.contact_email || ''}</div>
            </td>
            <td>${o.items?.length || 0}</td>
            <td style="text-align:right;font-variant-numeric:tabular-nums;font-weight:500;">${formatPrice(o.grand_total)}</td>
            <td><span class="badge ${statusBadge(o.payment_status)}">${o.payment_status || '—'}</span></td>
            <td><span class="badge ${statusBadge(o.status)}">${labels[o.status] || o.status}</span></td>
            <td style="text-align:right;">
              <a href="verification.html?id=${o.id}" class="btn" style="height:28px;">Détail</a>
              ${['pending_payment','payment_review'].includes(o.status) ? `<button class="btn" style="height:28px;margin-left:6px;" onclick="markPaid(${o.id})">Marquer payé</button>` : ''}
            </td>
          </tr>
        `).join('');
      } catch (err) {
        document.getElementById('ordersTableBody').innerHTML = `<tr><td colspan="8" style="text-align:center;padding:40px;color:#666;">Impossible de charger les commandes (${err.message})</td></tr>`;
      }
    }

    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        renderOrders(tab.dataset.filter);
      });
    });

    async function markPaid(orderId) {
      if (!confirm('Marquer cette commande comme payée et envoyer le reçu ?')) return;
      try {
        await AdminAPI.api('/admin/orders/' + orderId + '/mark-paid', { method: 'POST' });
        alert('Commande approuvée. Reçu envoyé.');
        renderOrders(document.querySelector('.tab.active')?.dataset.filter || 'all');
      } catch (e) {
        alert('Erreur: ' + e.message);
      }
    }

    renderOrders();

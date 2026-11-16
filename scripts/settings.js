

// ---- extracted from settings.html ----

requireAuth();

    async function load() {
      const store = getCurrentStore();
      document.getElementById('storeName').textContent = (STORES[store] || STORES.agri).name;
      document.getElementById('hint').textContent = 'Configuration de ' + (STORES[store] || STORES.agri).name;

      // Delivery
      try {
        const delivery = await AdminAPI.api('/admin/settings/delivery');
        document.getElementById('deliveryAmount').value = delivery.amount ?? '';
        document.getElementById('deliveryThreshold').value = delivery.free_threshold ?? '';
      } catch (e) { console.warn(e); }

      // Payment settings
      try {
        const payments = await AdminAPI.api('/admin/settings/payment');
        const first = (payments.data || payments || [])[0];
        if (first) {
          document.getElementById('payBeneficiary').value = first.account_details?.beneficiary || '';
          document.getElementById('payIban').value = first.account_details?.iban || '';
          document.getElementById('payBic').value = first.account_details?.bic || '';
        }
        const list = payments.data || payments || [];
        const first = list[0];
        if (first) {
          document.getElementById('payCode').value = first.payment_method_code || '';
          document.getElementById('payName').value = first.display_name || '';
          document.getElementById('payInstructions').value = first.instructions || '';
          document.getElementById('payEnabled').checked = !!first.is_enabled;
        }
      } catch (e) { console.warn(e); }

      // Generic settings
      try {
        const settings = await AdminAPI.getSettings();
        const list = settings.data || settings || [];
        document.getElementById('settingsList').innerHTML = list.length
          ? list.map(s => `<div style="padding:6px 0;border-bottom:1px solid var(--border);"><strong>${s.key}</strong> : ${typeof s.value === 'object' ? JSON.stringify(s.value) : s.value}</div>`).join('')
          : 'Aucun paramètre enregistré';
      } catch (e) {
        document.getElementById('settingsList').textContent = 'Impossible de charger';
      }
    }

    document.getElementById('deliveryForm').onsubmit = async (e) => {
      e.preventDefault();
      const msg = document.getElementById('deliveryMsg');
      msg.style.display = 'none';
      const fd = new FormData(e.target);
      try {
        await AdminAPI.api('/admin/settings/delivery', {
          method: 'PATCH',
          body: JSON.stringify({
            amount: Number(fd.get('amount')),
            free_threshold: fd.get('free_threshold') ? Number(fd.get('free_threshold')) : null,
          }),
        });
        msg.textContent = 'Livraison enregistrée';
        msg.style.color = '#008060';
        msg.style.display = 'block';
        load();
      } catch (err) {
        msg.textContent = err.message;
        msg.style.color = '#c00';
        msg.style.display = 'block';
      }
    };

    document.getElementById('paymentForm').onsubmit = async (e) => {
      e.preventDefault();
      const msg = document.getElementById('paymentMsg');
      msg.style.display = 'none';
      const fd = new FormData(e.target);
      try {
        await AdminAPI.api('/admin/settings/payment', {
          method: 'PATCH',
          body: JSON.stringify({
            payment_method_code: fd.get('payment_method_code'),
            display_name: fd.get('display_name'),
            instructions: fd.get('instructions') || null,
            is_enabled: document.getElementById('payEnabled').checked,
            account_details: {
              beneficiary: document.getElementById('payBeneficiary').value || null,
              iban: document.getElementById('payIban').value || null,
              bic: document.getElementById('payBic').value || null,
            },
          }),
        });
        msg.textContent = 'Paiement enregistré';
        msg.style.color = '#008060';
        msg.style.display = 'block';
        load();
      } catch (err) {
        msg.textContent = err.message;
        msg.style.color = '#c00';
        msg.style.display = 'block';
      }
    };

    load();



// ---- extracted from verification.html ----

requireAuth();

    let currentPaymentId = null;

    const statusLabels = {
      submitted: 'Soumis',
      verified: 'Vérifié',
      rejected: 'Rejeté',
      pending: 'En attente',
    };

    async function load() {
      const store = getCurrentStore();
      document.getElementById('storeName').textContent = (STORES[store] || STORES.agri).name;

      try {
        const json = await AdminAPI.getPayments();
        const payments = json.data || json || [];
        document.getElementById('count').textContent = payments.length + ' paiements';

        document.getElementById('list').innerHTML = payments.map(p => `
          <tr>
            <td style="font-weight:500;">#${p.order?.order_number || p.order_id}</td>
            <td>${formatPrice(p.amount)}</td>
            <td>${p.method_code || '—'}</td>
            <td><span class="badge ${statusBadge(p.status)}">${statusLabels[p.status] || p.status}</span></td>
            <td class="text-secondary">${p.submitted_at ? new Date(p.submitted_at).toLocaleDateString('fr-FR') : '—'}</td>
            <td style="text-align:right;">
              <button class="btn" style="height:28px;" onclick="openDetail('${p.id}')">Détail</button>
            </td>
          </tr>
        `).join('') || '<tr><td colspan="6" style="text-align:center;padding:32px;color:#666;">Aucun paiement</td></tr>';
      } catch (err) {
        document.getElementById('list').innerHTML = `<tr><td colspan="6" style="text-align:center;padding:32px;color:#666;">Impossible de charger (${err.message})</td></tr>`;
      }
    }

    async function openProof(paymentId, proofId) {
      try {
        const token = AdminAPI.getToken();
        const store = AdminAPI.getStoreCode();
        const base = (window.API_BASE || 'https://marketplace-app-production-6dae1174.up.railway.app/api').replace(/\/$/, '');
        const res = await fetch(base + '/admin/payments/' + paymentId + '/proofs/' + proofId, {
          headers: {
            'Authorization': 'Bearer ' + token,
            'X-Store-Code': store,
            'Accept': '*/*'
          }
        });
        if (!res.ok) {
          const t = await res.text();
          alert('Preuve introuvable (' + res.status + ') ' + t.slice(0, 180));
          return;
        }
        const raw = await res.blob();
        if (!raw.size) { alert('Fichier vide'); return; }
        const headerType = res.headers.get('content-type') || '';
        const name = (document.querySelector('#proofs')?.textContent || '').toLowerCase();
        let type = headerType.split(';')[0];
        if (!type || type === 'application/octet-stream') {
          if (name.includes('.png')) type = 'image/png';
          else if (name.includes('.jpg') || name.includes('.jpeg')) type = 'image/jpeg';
          else if (name.includes('.pdf')) type = 'application/pdf';
          else if (name.includes('.webp')) type = 'image/webp';
          else type = 'image/png';
        }
        const buf = await raw.arrayBuffer();
        const bytes = new Uint8Array(buf.slice(0, 8));
        const isPng = bytes[0] === 0x89 && bytes[1] === 0x50;
        const isJpg = bytes[0] === 0xFF && bytes[1] === 0xD8;
        const isPdf = bytes[0] === 0x25 && bytes[1] === 0x50;
        if (!isPng && !isJpg && !isPdf) {
          const text = new TextDecoder().decode(buf.slice(0, 400));
          alert('Le serveur n\'a pas renvoyé une image. Début de la réponse :\n' + text);
          return;
        }
        if (isPng) type = 'image/png';
        if (isJpg) type = 'image/jpeg';
        if (isPdf) type = 'application/pdf';
        const blob = new Blob([buf], { type });
        const url = URL.createObjectURL(blob);
        let body = type.includes('pdf')
          ? `<iframe src="${url}" style="width:100%;height:70vh;border:0;"></iframe>`
          : `<img src="${url}" alt="Preuve" style="max-width:100%;max-height:70vh;display:block;margin:0 auto;" />`;
        body += `<div style="margin-top:12px;text-align:center;"><a href="${url}" download="preuve">Télécharger</a></div>`;
        const modal = document.createElement('div');
        modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:80;display:flex;align-items:center;justify-content:center;padding:24px;';
        modal.innerHTML = `<div style="background:#fff;max-width:720px;width:100%;border-radius:12px;padding:16px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
            <strong>Preuve de paiement</strong>
            <button type="button" id="closeProof" style="border:0;background:none;font-size:20px;cursor:pointer;">×</button>
          </div>
          ${body}
        </div>`;
        document.body.appendChild(modal);
        modal.querySelector('#closeProof').onclick = () => { URL.revokeObjectURL(url); modal.remove(); };
        modal.onclick = (e) => { if (e.target === modal) { URL.revokeObjectURL(url); modal.remove(); } };
      } catch (e) {
        alert(e.message);
      }
    }

    async function openDetail(id) {
      currentPaymentId = id;
      document.getElementById('detailError').style.display = 'none';
      document.getElementById('rejectBox').style.display = 'none';
      try {
        const p = await AdminAPI.api(`/admin/payments/${id}`);
        document.getElementById('detailTitle').textContent = `Paiement #${id} · ${statusLabels[p.status] || p.status}`;
        document.getElementById('detailBody').innerHTML = `
          <div><strong>Commande :</strong> #${p.order?.order_number || p.order_id}</div>
          <div><strong>Montant :</strong> ${formatPrice(p.amount)}</div>
          <div><strong>Client :</strong> ${p.order?.contact_name || '—'} · ${p.order?.contact_email || ''}</div>
          ${p.rejection_reason ? `<div style="color:#c00;margin-top:8px;"><strong>Motif rejet :</strong> ${p.rejection_reason}</div>` : ''}
        `;
        const proofs = p.proofs || [];
        document.getElementById('proofs').innerHTML = proofs.length
          ? proofs.map(pr => `<div style="margin-top:6px;"><button type="button" class="btn" style="height:28px;" onclick="openProof(${id}, ${pr.id})">Voir la preuve #${pr.id}</button> <span class="text-secondary">${pr.original_filename || ''}</span></div>`).join('')
          : '<div class="text-secondary" style="margin-top:8px;">Aucune preuve jointe</div>';
        document.getElementById('detailCard').style.display = 'block';
        document.getElementById('btnVerify').style.display = p.status === 'submitted' ? 'inline-flex' : 'none';
        document.getElementById('btnReject').style.display = p.status === 'submitted' ? 'inline-flex' : 'none';
      } catch (err) {
        alert(err.message);
      }
    }

    document.getElementById('btnVerify').onclick = async () => {
      if (!currentPaymentId) return;
      try {
        await AdminAPI.verifyPayment(currentPaymentId);
        document.getElementById('detailCard').style.display = 'none';
        load();
      } catch (err) {
        document.getElementById('detailError').textContent = err.message;
        document.getElementById('detailError').style.display = 'block';
      }
    };

    document.getElementById('btnReject').onclick = () => {
      document.getElementById('rejectBox').style.display = 'block';
    };

    document.getElementById('btnConfirmReject').onclick = async () => {
      const reason = document.getElementById('rejectReason').value.trim();
      if (!reason) return alert('Indiquez un motif');
      try {
        await AdminAPI.rejectPayment(currentPaymentId, reason);
        document.getElementById('detailCard').style.display = 'none';
        load();
      } catch (err) {
        document.getElementById('detailError').textContent = err.message;
        document.getElementById('detailError').style.display = 'block';
      }
    };

    load();

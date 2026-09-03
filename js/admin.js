 /* ==========================================================================
   Pressing Bidè — Espace administrateur
   Dashboard KPIs, gestion commandes, utilisateurs, rapports, export CSV
   ========================================================================== */

"use strict";

document.addEventListener("DOMContentLoaded", () => {
  /* ---------- Garde d'accès : admin uniquement ---------- */
  const session = pbIsAuthenticated();
  if (!session || session.role !== "admin") {
    document.querySelector(".admin-wrapper").innerHTML = `
      <div class="d-flex align-items-center justify-content-center flex-column" style="min-height:60vh;width:100%;">
        <i class="bi bi-shield-lock display-1 mb-3" style="color:var(--pb-dark);"></i>
        <h2 class="h4 fw-bold mb-2">Accès réservé aux administrateurs</h2>
        <p class="text-muted mb-4 text-center" style="max-width:420px;">Connectez-vous avec un compte administrateur pour accéder à cette page.</p>
        <div class="d-flex flex-column flex-sm-row gap-3">
          <a href="login.html" class="btn btn-pb btn-lg"><i class="bi bi-box-arrow-in-right me-2"></i>Se connecter</a>
          <a href="index.html" class="btn btn-outline-pb btn-lg"><i class="bi bi-house me-2"></i>Retour à l'accueil</a>
        </div>
      </div>`;
    return;
  }
  const orders = JSON.parse(localStorage.getItem("pb_orders") || "[]");
  const users = JSON.parse(localStorage.getItem("pb_users") || "[]");

  // Afficher le nom de l'admin
  const adminTitle = document.querySelector(".admin-main h2.h4");
  if (adminTitle && session) {
    adminTitle.innerHTML = `<i class="bi bi-speedometer2 text-pb me-2"></i>Tableau de bord — <small class="text-muted fw-normal">${session.name}</small>`;
  }
  const sidebarName = document.getElementById("admin-sidebar-name");
  if (sidebarName && session) sidebarName.textContent = session.name;
  const bannerName = document.getElementById("admin-banner-name");
  if (bannerName && session) bannerName.textContent = session.name;
  const now = Date.now();
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - 7);

  /* ---------- KPIs ---------- */
  const todayOrders = orders.filter(o => o.createdAt >= todayStart.getTime());
  const weekOrders = orders.filter(o => o.createdAt >= weekStart.getTime());
  const caToday = todayOrders.reduce((s, o) => s + (o.total || 0), 0);
  const caWeek = weekOrders.reduce((s, o) => s + (o.total || 0), 0);

  const elToday = document.getElementById("adm-today");
  const elCaToday = document.getElementById("adm-ca-today");
  const elCaWeek = document.getElementById("adm-ca-week");
  const elUsers = document.getElementById("adm-users");

  if (elToday) elToday.textContent = todayOrders.length;
  if (elCaToday) elCaToday.textContent = pbFormatPrice(caToday);
  if (elCaWeek) elCaWeek.textContent = pbFormatPrice(caWeek);
  if (elUsers) elUsers.textContent = users.length;

  /* ---------- Dernières commandes (dashboard) ---------- */
  const recentTbody = document.querySelector("#adm-recent-table tbody");
  if (recentTbody) {
    const recent = orders.slice(-10).reverse();
    if (recent.length === 0) {
      recentTbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4">Aucune commande.</td></tr>';
    } else {
      recentTbody.innerHTML = renderOrderRows(recent, true);
    }
  }

  /* ---------- Toutes les commandes (page commandes) ---------- */
  const ordersTbody = document.querySelector("#adm-orders-table tbody");
  const filterStatus = document.getElementById("adm-filter-status");

  function renderOrders(filter) {
    const filtered = filter ? orders.filter(o => o.status === filter) : orders;
    if (ordersTbody) {
      ordersTbody.innerHTML = filtered.length
        ? renderOrderRows(filtered.reverse(), false)
        : '<tr><td colspan="7" class="text-center text-muted py-4">Aucune commande.</td></tr>';
    }
    attachStatusHandlers();
  }

  if (filterStatus) {
    filterStatus.addEventListener("change", () => renderOrders(filterStatus.value));
  }
  renderOrders("");

  function renderOrderRows(list, compact) {
    return list.map(o => {
      const dateStr = new Date(o.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
      const statusOptions = ["Reçue", "En cours", "Prête", "Livrée"];
      return `<tr>
        <td><code>${o.ref}</code></td>
        ${compact ? '' : `<td>${o.userId || "—"}</td>`}
        <td>${o.serviceName || "—"}</td>
        ${compact ? '' : `<td>${dateStr}</td>`}
        <td class="fw-bold">${pbFormatPrice(o.total || 0)}</td>
        <td><span class="badge badge-status ${getStatusClass(o.status)}">${o.status}</span></td>
        ${compact ? '' : `<td>
          <select class="form-select form-select-sm status-change" data-ref="${o.ref}" style="width:auto;">
            ${statusOptions.map(s => `<option value="${s}" ${s === o.status ? 'selected' : ''}>${s}</option>`).join('')}
          </select>
        </td>`}
      </tr>`;
    }).join("");
  }

  function getStatusClass(status) {
    return { "Reçue": "badge-received", "En cours": "badge-in-progress", "Prête": "badge-ready", "Livrée": "badge-delivered" }[status] || "badge-received";
  }

  function attachStatusHandlers() {
    document.querySelectorAll(".status-change").forEach(select => {
      select.addEventListener("change", () => {
        const ref = select.dataset.ref;
        const newStatus = select.value;
        const order = orders.find(o => o.ref === ref);
        if (order) {
          order.status = newStatus;
          localStorage.setItem("pb_orders", JSON.stringify(orders));
          pbToast(`Statut de ${ref} mis à jour : ${newStatus}`);
          renderOrders(filterStatus ? filterStatus.value : "");
        }
      });
    });
  }

  /* ---------- Utilisateurs ---------- */
  const usersTbody = document.querySelector("#adm-users-table tbody");
  if (usersTbody) {
    if (users.length === 0) {
      usersTbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4">Aucun utilisateur inscrit.</td></tr>';
    } else {
      usersTbody.innerHTML = users.map(u => `<tr>
        <td>${u.name}</td>
        <td>${u.email}</td>
        <td>${u.phone || "—"}</td>
        <td><span class="badge ${u.accountType === 'professionnel' ? 'bg-pb-accent' : 'bg-pb-light text-pb'}">${u.accountType === 'professionnel' ? 'Pro' : 'Particulier'}</span></td>
        <td>${u.loyaltyPoints || 0}</td>
        <td>${new Date(u.createdAt).toLocaleDateString("fr-FR")}</td>
      </tr>`).join("");
    }
  }

  /* ---------- Services ---------- */
  const servicesTbody = document.querySelector("#adm-services-table tbody");
  if (servicesTbody) {
    servicesTbody.innerHTML = PB_SERVICES.map(s => `<tr>
      <td><strong>${s.name}</strong></td>
      <td>${pbFormatPrice(s.price)}</td>
      <td>${s.unit}</td>
      <td>${s.duration}</td>
      <td><span class="badge bg-pb-light text-pb">${s.category}</span></td>
      <td>${s.popular ? '<i class="bi bi-star-fill text-warning"></i>' : '—'}</td>
    </tr>`).join("");
  }

  /* ---------- Points de vente ---------- */
  const locationsTbody = document.querySelector("#adm-locations-table tbody");
  if (locationsTbody) {
    locationsTbody.innerHTML = PB_LOCATIONS.map(l => `<tr>
      <td><strong>${l.name}</strong></td>
      <td>${l.address}</td>
      <td>${l.phone}</td>
      <td>${l.hours}</td>
      <td><span class="badge ${l.isOpen ? 'bg-success' : 'bg-danger'}">${l.isOpen ? 'Ouvert' : 'Fermé'}</span></td>
    </tr>`).join("");
  }

  /* ---------- Sidebar navigation ---------- */
  document.querySelectorAll("[data-tab]").forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const tab = link.dataset.tab;
      document.querySelectorAll("[data-tab]").forEach(l => l.classList.remove("active"));
      document.querySelectorAll(`[data-tab="${tab}"]`).forEach(l => l.classList.add("active"));
      ["admin-dashboard", "admin-orders", "admin-users", "admin-services", "admin-locations", "admin-reports"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.toggle("d-none", id !== tab);
      });
    });
  });

  /* ---------- Export CSV ---------- */
  function exportCSV(filename, headers, rows) {
    const csv = [headers.join(","), ...rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  }

  const btnExportOrders = document.getElementById("btn-export-orders");
  if (btnExportOrders) {
    btnExportOrders.addEventListener("click", () => {
      const headers = ["Référence", "Service", "Quantité", "Total", "Livraison", "Paiement", "Statut", "Date"];
      const rows = orders.map(o => [o.ref, o.serviceName, o.quantity, o.total, o.delivery, o.payment, o.status, new Date(o.createdAt).toLocaleDateString("fr-FR")]);
      exportCSV("commandes-pressing-bide.csv", headers, rows);
      pbToast("Export CSV commandes téléchargé !");
    });
  }

  const btnExportUsers = document.getElementById("btn-export-users");
  if (btnExportUsers) {
    btnExportUsers.addEventListener("click", () => {
      const headers = ["Nom", "E-mail", "Téléphone", "Type", "Points fidélité", "Inscrit le"];
      const rows = users.map(u => [u.name, u.email, u.phone, u.accountType, u.loyaltyPoints || 0, new Date(u.createdAt).toLocaleDateString("fr-FR")]);
      exportCSV("utilisateurs-pressing-bide.csv", headers, rows);
      pbToast("Export CSV utilisateurs téléchargé !");
    });
  }

  /* ---------- Résumé financier ---------- */
  const btnSummary = document.getElementById("btn-show-summary");
  const summaryCard = document.getElementById("summary-card");
  const summaryData = document.getElementById("summary-data");

  if (btnSummary && summaryCard && summaryData) {
    btnSummary.addEventListener("click", () => {
      summaryCard.classList.remove("d-none");
      const totalCA = orders.reduce((s, o) => s + (o.total || 0), 0);
      const avgOrder = orders.length > 0 ? totalCA / orders.length : 0;
      const deliveredCount = orders.filter(o => o.status === "Livrée" || o.status === "Prête").length;
      const satisfaction = orders.length > 0 ? ((deliveredCount / orders.length) * 100).toFixed(0) : 0;

      summaryData.innerHTML = `
        <div class="col-md-3"><p class="display-5 fw-bold text-pb mb-1">${pbFormatPrice(totalCA)}</p><p class="text-muted small">CA total</p></div>
        <div class="col-md-3"><p class="display-5 fw-bold text-pb-accent mb-1">${pbFormatPrice(avgOrder)}</p><p class="text-muted small">Panier moyen</p></div>
        <div class="col-md-3"><p class="display-5 fw-bold text-pb-secondary mb-1">${orders.length}</p><p class="text-muted small">Commandes totales</p></div>
        <div class="col-md-3"><p class="display-5 fw-bold text-pb mb-1">${satisfaction}%</p><p class="text-muted small">Taux complétion</p></div>
      `;
    });
  }
});

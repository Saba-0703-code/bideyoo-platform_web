/* ==========================================================================
   Pressing Bidè — Espace client (Dashboard)
   Suivi de commandes, fidélité, notifications, profil
   ========================================================================== */

"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const session = pbIsAuthenticated();
  const loginRequired = document.getElementById("dash-login-required");
  const dashContent = document.getElementById("dash-content");

  if (!session) {
    if (loginRequired) loginRequired.classList.remove("d-none");
    if (dashContent) dashContent.classList.add("d-none");
    return;
  }

  if (loginRequired) loginRequired.classList.add("d-none");
  if (dashContent) dashContent.classList.remove("d-none");

  // Afficher le lien admin si l'utilisateur est admin
  if (session.role === "admin") {
    const headerDiv = document.querySelector("#dash-content")?.closest("section")?.previousElementSibling;
    if (headerDiv) {
      const adminLink = document.createElement("a");
      adminLink.href = "admin.html";
      adminLink.className = "btn btn-sm btn-outline-dark";
      adminLink.innerHTML = '<i class="bi bi-shield-lock me-1"></i>Administration';
      const logoutBtn = document.getElementById("btn-logout");
      if (logoutBtn) logoutBtn.parentNode.insertBefore(adminLink, logoutBtn);
    }
  }

  /* ---------- Remplir les infos ---------- */
  
  document.getElementById("dash-name").textContent = session.name || "—";
  document.getElementById("dash-email").textContent = session.email || "—";

  /* ---------- Profil ---------- */

  const pfName = document.getElementById("pf-name");
  const pfPhone = document.getElementById("pf-phone");
  const pfEmail = document.getElementById("pf-email");
  const pfType = document.getElementById("pf-type");
  if (pfName) pfName.value = session.name || "";
  if (pfPhone) pfPhone.value = session.phone || "";
  if (pfEmail) pfEmail.value = session.email || "";
  if (pfType) pfType.value = session.accountType === "professionnel" ? "Professionnel" : "Particulier";

  const profileForm = document.getElementById("profile-form");
  if (profileForm) {
    profileForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const users = JSON.parse(localStorage.getItem("pb_users") || "[]");
      const user = users.find(u => u.id === session.userId);
      if (user) {
        user.name = pbSanitize(pfName.value.trim());
        user.phone = pbSanitize(pfPhone.value.trim());
        localStorage.setItem("pb_users", JSON.stringify(users));
        session.name = user.name;
        session.phone = user.phone;
        localStorage.setItem("pb_session", JSON.stringify(session));
        document.getElementById("dash-name").textContent = user.name;
      }
      pbToast("Profil mis à jour !");
    });
  }

  /* ---------- Commandes ---------- */

  const orders = JSON.parse(localStorage.getItem("pb_orders") || "[]");
  const myOrders = orders.filter(o => o.userId === session.userId).sort((a, b) => b.createdAt - a.createdAt);

  const tbody = document.querySelector("#orders-table tbody");
  const emptyEl = document.getElementById("orders-empty");
  const statTotal = document.getElementById("stat-total");
  const statPending = document.getElementById("stat-pending");
  const statDone = document.getElementById("stat-done");
  const statSpent = document.getElementById("stat-spent");

  if (myOrders.length === 0) {
    if (emptyEl) emptyEl.classList.remove("d-none");
    if (tbody) tbody.parentElement.parentElement.querySelector(".table-responsive").style.display = "none";
  } else {
    if (emptyEl) emptyEl.classList.add("d-none");

    let totalSpent = 0;
    let pending = 0;
    let done = 0;

    const statusBadges = {
      "Reçue": "badge-received",
      "En cours": "badge-in-progress",
      "Prête": "badge-ready",
      "Livrée": "badge-delivered",
    };

    tbody.innerHTML = myOrders.map(o => {
      const statusClass = statusBadges[o.status] || "badge-received";
      const dateStr = new Date(o.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
      totalSpent += o.total || 0;
      if (o.status === "Reçue" || o.status === "En cours") pending++;
      if (o.status === "Prête" || o.status === "Livrée") done++;
      return `<tr>
        <td><code>${o.ref}</code></td>
        <td>${o.serviceName || "—"}</td>
        <td>${dateStr}</td>
        <td class="fw-bold">${pbFormatPrice(o.total || 0)}</td>
        <td><span class="badge badge-status ${statusClass}">${o.status}</span></td>
        <td><button class="btn btn-sm btn-outline-pb btn-order-detail" data-ref="${o.ref}"><i class="bi bi-eye"></i></button></td>
      </tr>`;
    }).join("");

    if (statTotal) statTotal.textContent = myOrders.length;
    if (statPending) statPending.textContent = pending;
    if (statDone) statDone.textContent = done;
    if (statSpent) statSpent.textContent = pbFormatPrice(totalSpent);

    // Suivi de la dernière commande active

    const activeOrder = myOrders.find(o => o.status === "Reçue" || o.status === "En cours");
    const trackerCard = document.getElementById("active-order-card");
    const tracker = document.getElementById("order-tracker");

    if (activeOrder && tracker && trackerCard) {
      trackerCard.style.display = "";
      const statuses = ["Reçue", "En cours", "Prête", "Livrée"];
      const currentIdx = statuses.indexOf(activeOrder.status);
      tracker.innerHTML = statuses.map((s, i) => {
        let cls = "";
        if (i < currentIdx) cls = "completed";
        else if (i === currentIdx) cls = "active";
        return `<div class="tracker-step ${cls}">
          <div class="tracker-dot">${i < currentIdx ? '<i class="bi bi-check-lg"></i>' : (i + 1)}</div>
          <span class="tracker-label">${s}</span>
        </div>`;
      }).join('<div class="step-connector"></div>');
    }
  }

  /* ---------- Fidélité ---------- */
  
  const loyaltyPoints = document.getElementById("loyalty-points");
  const loyaltyBar = document.getElementById("loyalty-bar");
  const loyaltyNext = document.getElementById("loyalty-next");
  const points = session.loyaltyPoints || 0;
  if (loyaltyPoints) loyaltyPoints.textContent = points;
  if (loyaltyBar) loyaltyBar.style.width = Math.min(points, 100) + "%";
  if (loyaltyNext) {
    const thresholds = [30, 50, 100];
    const next = thresholds.find(t => t > points) || 100;
    loyaltyNext.textContent = next;
  }

  /* ---------- Notifications ---------- */

  const notifList = document.getElementById("notifications-list");
  const notifications = JSON.parse(localStorage.getItem("pb_notifications") || "[]");
  const myNotifs = notifications.filter(n => n.userId === session.userId);

  if (notifList && myNotifs.length > 0) {
    notifList.innerHTML = myNotifs.map(n => `
      <div class="notification-item ${n.read ? '' : 'unread'} mb-2">
        <div class="d-flex justify-content-between align-items-start">
          <div>
            <p class="fw-bold small mb-1">${n.title}</p>
            <p class="text-muted small mb-0">${n.message}</p>
          </div>
          <small class="text-muted">${new Date(n.createdAt).toLocaleDateString("fr-FR")}</small>
        </div>
      </div>
    `).join("");
  }

  /* ---------- Déconnexion ---------- */

  document.getElementById("btn-logout").addEventListener("click", () => {
    localStorage.removeItem("pb_session");
    pbToast("Déconnexion réussie.");
    setTimeout(() => { window.location.href = "index.html"; }, 1000);
  });
});

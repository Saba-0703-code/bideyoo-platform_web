/* ==========================================================================
   Pressing Bidè — Réservation multi-étapes
   Sélection service → agence → date/détails → confirmation
   ========================================================================== */

"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const session = pbIsAuthenticated();
  let currentStep = 1;
  let selectedService = null;
  let selectedLocation = null;

  /* ---------- Étape 1 : Services ---------- */
  const serviceCards = document.getElementById("service-cards");
  if (serviceCards) {
    serviceCards.innerHTML = PB_SERVICES.map(s => `
      <div class="col-md-6 col-lg-4">
        <div class="card card-hover h-100 service-select-card ${s.popular ? 'border-2' : ''}" data-id="${s.id}" style="cursor:pointer; ${s.popular ? 'border-color:var(--pb-accent)!important;' : ''}">
          <div class="card-body p-3 text-center">
            <div class="bdy-icon-badge mx-auto mb-2"><i class="bi ${s.icon}"></i></div>
            <h3 class="h6 fw-bold mb-1">${s.name}</h3>
            <p class="text-muted small mb-2">${s.desc.substring(0, 60)}…</p>
            <p class="bdy-price mb-0" style="font-size:1.2rem;">${pbFormatPrice(s.price)} <small>${s.unit}</small></p>
          </div>
        </div>
      </div>
    `).join("");

    serviceCards.querySelectorAll(".service-select-card").forEach(card => {
      card.addEventListener("click", () => {
        serviceCards.querySelectorAll(".service-select-card").forEach(c => c.classList.remove("border-primary"));
        card.classList.add("border-primary");
        card.style.boxShadow = "0 0 0 2px var(--pb-primary)";
        selectedService = pbGetService(card.dataset.id);
      });
    });
  }

  /* ---------- Étape 2 : Locations ---------- */
  const locationCards = document.getElementById("location-cards");
  if (locationCards) {
    locationCards.innerHTML = PB_LOCATIONS.map(l => `
      <div class="col-md-4">
        <div class="card card-hover h-100 location-select-card ${!l.isOpen ? 'opacity-50' : ''}" data-id="${l.id}" style="cursor:${l.isOpen ? 'pointer' : 'not-allowed'};">
          <div class="card-body p-3 text-center">
            <i class="bi bi-geo-alt fs-3 text-pb mb-2 d-block"></i>
            <h3 class="h6 fw-bold mb-1">${l.name}</h3>
            <p class="text-muted small mb-1">${l.address}</p>
            <p class="text-muted small mb-2">${l.hours}</p>
            <span class="badge ${l.isOpen ? 'bg-success' : 'bg-danger'}">${l.isOpen ? 'Ouvert' : 'Fermé'}</span>
          </div>
        </div>
      </div>
    `).join("");

    locationCards.querySelectorAll(".location-select-card").forEach(card => {
      card.addEventListener("click", () => {
        const loc = pbGetLocation(card.dataset.id);
        if (!loc || !loc.isOpen) {
          pbToast("Cette agence est actuellement fermée.", "error");
          return;
        }
        locationCards.querySelectorAll(".location-select-card").forEach(c => c.classList.remove("border-primary"));
        card.classList.add("border-primary");
        card.style.boxShadow = "0 0 0 2px var(--pb-primary)";
        selectedLocation = loc;
      });
    });
  }

  /* ---------- Pré-remplir si connecté ---------- */
  if (session) {
    const nameInput = document.getElementById("bk-name");
    const phoneInput = document.getElementById("bk-phone");
    const emailInput = document.getElementById("bk-email");
    if (nameInput) nameInput.value = session.name || "";
    if (phoneInput) phoneInput.value = session.phone || "";
    if (emailInput) emailInput.value = session.email || "";
  }

  /* ---------- Date min = aujourd'hui ---------- */
  const dateInput = document.getElementById("bk-date");
  if (dateInput) {
    const today = new Date();
    dateInput.min = today.toISOString().split("T")[0];
  }

  /* ---------- Navigation étapes ---------- */
  function goToStep(step) {
    for (let i = 1; i <= 4; i++) {
      const el = document.getElementById("step-" + i);
      if (el) el.classList.toggle("d-none", i !== step);
    }
    document.querySelectorAll(".step-item").forEach(item => {
      const s = parseInt(item.dataset.step);
      item.classList.remove("active", "completed");
      if (s === step) item.classList.add("active");
      else if (s < step) item.classList.add("completed");
    });
    currentStep = step;
  }

  document.getElementById("next-1")?.addEventListener("click", () => {
    if (!selectedService) { pbToast("Veuillez sélectionner un service.", "error"); return; }
    goToStep(2);
  });
  document.getElementById("prev-2")?.addEventListener("click", () => goToStep(1));
  document.getElementById("next-2")?.addEventListener("click", () => {
    if (!selectedLocation) { pbToast("Veuillez sélectionner une agence.", "error"); return; }
    goToStep(3);
  });
  document.getElementById("prev-3")?.addEventListener("click", () => goToStep(2));
  document.getElementById("next-3")?.addEventListener("click", () => {
    // Valider étape 3
    const name = document.getElementById("bk-name");
    const phone = document.getElementById("bk-phone");
    const email = document.getElementById("bk-email");
    const date = document.getElementById("bk-date");
    const slot = document.getElementById("bk-slot");
    const weight = document.getElementById("bk-weight");

    let valid = true;
    if (!name.value.trim()) { pbSetValidity(name, false); valid = false; } else pbSetValidity(name, true);
    if (!/[\d\s]{8,}/.test(phone.value)) { pbSetValidity(phone, false); valid = false; } else pbSetValidity(phone, true);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) { pbSetValidity(email, false); valid = false; } else pbSetValidity(email, true);
    if (!date.value) { pbSetValidity(date, false); valid = false; } else pbSetValidity(date, true);
    if (!slot.value) { pbSetValidity(slot, false); valid = false; } else pbSetValidity(slot, true);
    if (parseInt(weight.value) < 1 || parseInt(weight.value) > 100) { pbSetValidity(weight, false); valid = false; } else pbSetValidity(weight, true);

    if (!valid) { pbToast("Veuillez remplir tous les champs requis.", "error"); return; }

    // Remplir récap
    const qty = parseInt(weight.value) || 5;
    const price = selectedService.unit.includes("/ 5 kg")
      ? selectedService.price * Math.ceil(qty / 5)
      : selectedService.price * qty;

    document.getElementById("bk-rc-service").textContent = selectedService.name;
    document.getElementById("bk-rc-location").textContent = selectedLocation.name;
    document.getElementById("bk-rc-date").textContent = new Date(date.value).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
    document.getElementById("bk-rc-slot").textContent = slot.options[slot.selectedIndex].text;
    document.getElementById("bk-rc-weight").textContent = qty + " kg";
    document.getElementById("bk-rc-type").textContent = document.getElementById("bk-type").options[document.getElementById("bk-type").selectedIndex].text;
    document.getElementById("bk-rc-client").textContent = name.value.trim() + " — " + phone.value.trim();
    document.getElementById("bk-rc-total").textContent = pbFormatPrice(price);

    goToStep(4);
  });
  document.getElementById("prev-4")?.addEventListener("click", () => goToStep(3));

  /* ---------- Confirmer ---------- */
  document.getElementById("btn-book")?.addEventListener("click", () => {
    const qty = parseInt(document.getElementById("bk-weight").value) || 5;
    const price = selectedService.unit.includes("/ 5 kg")
      ? selectedService.price * Math.ceil(qty / 5)
      : selectedService.price * qty;

    const order = {
      ref: pbGenerateRef(),
      userId: session ? session.userId : "guest",
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      locationId: selectedLocation.id,
      locationName: selectedLocation.name,
      date: document.getElementById("bk-date").value,
      slot: document.getElementById("bk-slot").value,
      quantity: qty,
      textileType: document.getElementById("bk-type").value,
      notes: document.getElementById("bk-notes").value.trim(),
      name: pbSanitize(document.getElementById("bk-name").value.trim()),
      phone: pbSanitize(document.getElementById("bk-phone").value.trim()),
      email: document.getElementById("bk-email").value.trim().toLowerCase(),
      total: price,
      status: "Reçue",
      createdAt: Date.now(),
    };

    const orders = JSON.parse(localStorage.getItem("pb_orders") || "[]");
    orders.push(order);
    localStorage.setItem("pb_orders", JSON.stringify(orders));

    // Points fidélité
    if (session) {
      const points = Math.floor(price / 1000);
      session.loyaltyPoints = (session.loyaltyPoints || 0) + points;
      localStorage.setItem("pb_session", JSON.stringify(session));

      // Notification
      const notifs = JSON.parse(localStorage.getItem("pb_notifications") || "[]");
      notifs.push({
        userId: session.userId,
        title: "Nouvelle réservation",
        message: `Votre réservation ${order.ref} pour ${order.serviceName} a été confirmée.`,
        read: false,
        createdAt: Date.now(),
      });
      localStorage.setItem("pb_notifications", JSON.stringify(notifs));
    }

    // Afficher confirmation
    document.getElementById("bk-confirm-ref").textContent = order.ref;
    document.querySelectorAll(".booking-step").forEach(s => s.classList.add("d-none"));
    document.getElementById("step-indicator").classList.add("d-none");
    document.getElementById("booking-confirmed").classList.remove("d-none");

    pbToast("Réservation confirmée ! 🎉");
  });

  /* ---------- Nouvelle réservation ---------- */
  document.getElementById("bk-new")?.addEventListener("click", () => {
    window.location.reload();
  });
});

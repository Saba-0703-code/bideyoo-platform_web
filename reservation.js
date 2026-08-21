/* ==========================================================================
   Bidéyoo — Page Réservation
   Formulaire de prise de rendez-vous : récapitulatif en direct, validation
   complète, sauvegarde locale et confirmation avec référence.
   ========================================================================== */

"use strict";

const BDY_SLOTS = [
  "09:00", "10:00", "11:00", "12:00", "13:00",
  "14:00", "15:00", "16:00", "17:00", "18:00", "19:00",
];

const BOOKINGS_KEY = "bideyoo_bookings";

/* ---------- Lecture / écriture des réservations ---------- */

function bdyGetBookings() {
  try {
    return JSON.parse(localStorage.getItem(BOOKINGS_KEY)) || [];
  } catch {
    return [];
  }
}

function bdySaveBookings(bookings) {
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
}

/* ---------- Initialisation ---------- */

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("booking-form");
  if (!form) return;

  const serviceSelect = document.getElementById("sv-service");
  const slotSelect = document.getElementById("sv-slot");
  const dateInput = document.getElementById("sv-date");
  const quantityInput = document.getElementById("sv-quantity");
  const unitLabel = document.getElementById("sv-unit");
  const modeInputs = document.querySelectorAll('input[name="sv-mode"]');
  const addrField = document.getElementById("addr-field");
  const addressInput = document.getElementById("sv-address");

  /* --- Remplissage du sélecteur de services --- */

  serviceSelect.innerHTML =
    `<option value="" selected disabled>Choisir un service</option>` +
    BDY_SERVICES.map((s) => `<option value="${s.id}">${s.name} — ${bdyFormatPrice(s.price)} ${s.unit}</option>`).join("");

  /* --- Créneaux horaires --- */

  slotSelect.innerHTML =
    `<option value="" selected disabled>Choisir un créneau</option>` +
    BDY_SLOTS.map((t) => `<option value="${t}">${t}</option>`).join("");

  /* --- Date minimale : aujourd'hui --- */

  const today = new Date();
  const isoToday = today.toISOString().split("T")[0];
  dateInput.min = isoToday;
  dateInput.value = isoToday;

  /* --- Pré-sélection via ?service=xxx (depuis la page Services) --- */

  const params = new URLSearchParams(window.location.search);
  const preselected = params.get("service");
  if (preselected && bdyGetService(preselected)) {
    serviceSelect.value = preselected;
    updateUnit();
    updateRecap();
  }

  /* --- Unité selon le service (kg ou pièce) --- */

  function updateUnit() {
    const svc = bdyGetService(serviceSelect.value);
    unitLabel.textContent = svc && svc.unit.includes("pièce") ? "pièce(s)" : "kg";
  }

  /* --- Visibilité du champ adresse selon le mode --- */

  function updateMode() {
    const mode = document.querySelector('input[name="sv-mode"]:checked').value;
    const isHome = mode === "domicile";
    addrField.classList.toggle("d-none", !isHome);
    addressInput.required = isHome;
    if (!isHome) addressInput.value = "";
    updateRecap();
  }
  modeInputs.forEach((m) => m.addEventListener("change", updateMode));

  /* --- Récapitulatif en direct --- */

  function formatDate(iso) {
    if (!iso) return "—";
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  }

  function updateRecap() {
    const svc = bdyGetService(serviceSelect.value);
    const qty = parseInt(quantityInput.value, 10) || 0;
    const mode = document.querySelector('input[name="sv-mode"]:checked')?.value;

    document.getElementById("rc-service").textContent = svc ? svc.name : "—";
    document.getElementById("rc-quantity").textContent = qty > 0 && svc
      ? `${qty} ${svc.unit.includes("pièce") ? "pièce(s)" : "kg"}`
      : "—";
    document.getElementById("rc-date").textContent = formatDate(dateInput.value);
    document.getElementById("rc-slot").textContent = slotSelect.value || "—";
    document.getElementById("rc-mode").textContent =
      mode === "domicile" ? "Retrait à domicile" : mode === "boutique" ? "Dépôt en boutique" : "—";
    document.getElementById("rc-client").textContent =
      [document.getElementById("sv-name").value.trim(), document.getElementById("sv-email").value.trim()]
        .filter(Boolean).join(" · ") || "—";

    const total = svc ? svc.price * Math.max(qty, 0) : 0;
    document.getElementById("rc-total").textContent = bdyFormatPrice(total);
  }

  serviceSelect.addEventListener("change", () => { updateUnit(); updateRecap(); });
  quantityInput.addEventListener("input", updateRecap);
  dateInput.addEventListener("change", updateRecap);
  slotSelect.addEventListener("change", updateRecap);
  document.getElementById("sv-name").addEventListener("input", updateRecap);
  document.getElementById("sv-email").addEventListener("input", updateRecap);

  /* --- Validation personnalisée --- */
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const phoneRe = /^[0-9+][0-9\s.-]{7,}$/;

  function validateField(input, valid) {
    bdySetValidity(input, valid);
    return valid;
  }

  function validate() {
    let ok = true;
    ok = validateField(serviceSelect, serviceSelect.value !== "") && ok;
    const qty = parseInt(quantityInput.value, 10);
    ok = validateField(quantityInput, Number.isInteger(qty) && qty >= 1 && qty <= 50) && ok;
    ok = validateField(dateInput, dateInput.value >= isoToday) && ok;
    ok = validateField(slotSelect, slotSelect.value !== "") && ok;
    const mode = document.querySelector('input[name="sv-mode"]:checked').value;
    if (mode === "domicile") {
      ok = validateField(addressInput, addressInput.value.trim().length >= 5) && ok;
    }
    const nameInput = document.getElementById("sv-name");
    ok = validateField(nameInput, nameInput.value.trim().length >= 3) && ok;
    const phoneInput = document.getElementById("sv-phone");
    ok = validateField(phoneInput, phoneRe.test(phoneInput.value.trim())) && ok;
    const emailInput = document.getElementById("sv-email");
    ok = validateField(emailInput, emailRe.test(emailInput.value.trim())) && ok;
    return ok;
  }

  /* --- Soumission : enregistrement + confirmation --- */

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validate()) {
      bdyToast("Veuillez corriger les champs signalés.", "error");
      form.classList.add("was-validated");
      return;
    }
    form.classList.remove("was-validated");

    const svc = bdyGetService(serviceSelect.value);
    const qty = parseInt(quantityInput.value, 10);
    const mode = document.querySelector('input[name="sv-mode"]:checked').value;
    const booking = {
      ref: "BDY-" + Date.now().toString(36).toUpperCase(),
      serviceId: svc.id,
      serviceName: svc.name,
      unit: svc.unit,
      quantity: qty,
      price: svc.price * qty,
      date: dateInput.value,
      slot: slotSelect.value,
      mode,
      address: mode === "domicile" ? addressInput.value.trim() : "Boutique Bidéyoo",
      name: document.getElementById("sv-name").value.trim(),
      email: document.getElementById("sv-email").value.trim(),
      phone: document.getElementById("sv-phone").value.trim(),
      notes: document.getElementById("sv-notes").value.trim(),
      createdAt: new Date().toISOString(),
    };

    const bookings = bdyGetBookings();
    bookings.push(booking);
    bdySaveBookings(bookings);

    /* --- Affichage de la confirmation --- */

    document.getElementById("cf-name").textContent = booking.name.split(" ")[0];
    document.getElementById("cf-ref").textContent = booking.ref;
    document.getElementById("cf-service").textContent = `${booking.serviceName} × ${booking.quantity}`;
    document.getElementById("cf-datetime").textContent =
      `${formatDate(booking.date)} à ${booking.slot}`;
    document.getElementById("cf-quantity").textContent = `${booking.quantity} ${booking.unit.includes("pièce") ? "pièce(s)" : "kg"}`;
    document.getElementById("cf-mode").textContent =
      booking.mode === "domicile" ? `Retrait à domicile — ${booking.address}` : "Dépôt en boutique";
    document.getElementById("cf-total").textContent = bdyFormatPrice(booking.price);
    document.getElementById("cf-email").textContent = booking.email;

    form.closest(".row").classList.add("d-none");
    document.getElementById("confirmation").classList.remove("d-none");
    window.scrollTo({ top: 0, behavior: "smooth" });
    bdyToast("Réservation enregistrée avec succès !");
  });

  /* --- Bouton "Nouvelle réservation" --- */
  
  document.getElementById("cf-new").addEventListener("click", () => {
    form.reset();
    serviceSelect.value = "";
    slotSelect.value = "";
    dateInput.value = isoToday;
    quantityInput.value = 1;
    updateUnit();
    updateRecap();
    form.querySelectorAll(".is-valid, .is-invalid").forEach((el) =>
      el.classList.remove("is-valid", "is-invalid"));
    document.getElementById("confirmation").classList.add("d-none");
    form.closest(".row").classList.remove("d-none");
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  updateUnit();
  updateRecap();
});

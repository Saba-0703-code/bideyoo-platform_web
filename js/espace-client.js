/* ==========================================================================
   Bidéyoo — Espace client
   Inscription / connexion (stockage local) + tableau de bord :
   historique des réservations et suivi de statut.
   ========================================================================== */

"use strict";

const USERS_KEY = "bideyoo_users";
const SESSION_KEY = "bideyoo_session";
const BOOKINGS_KEY = "bideyoo_bookings";

/* ---------- Accès au stockage ---------- */
function readJSON(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

function getUsers() { return readJSON(USERS_KEY, []); }
function getSession() { return readJSON(SESSION_KEY, null); }
function getBookings() { return readJSON(BOOKINGS_KEY, []); }

function setSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ email: user.email, name: user.name, phone: user.phone }));
}

function clearSession() { localStorage.removeItem(SESSION_KEY); }

/* ---------- Statut d'une réservation ---------- */
function bookingStatus(booking) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const bDate = new Date(booking.date + "T00:00:00");

  if (bDate > today) return { label: "Confirmée", cls: "text-bg-primary" };
  if (bDate.getTime() === today.getTime()) return { label: "En cours", cls: "text-bg-warning" };
  return { label: "Terminée", cls: "text-bg-secondary" };
}

function formatDateFR(iso) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

/* ---------- Rendu du tableau de bord ---------- */
function renderDashboard(user) {
  document.getElementById("auth-view").classList.add("d-none");
  document.getElementById("dashboard-view").classList.remove("d-none");

  document.getElementById("db-name").textContent = user.name.split(" ")[0];
  document.getElementById("db-email").textContent = user.email;

  const mine = getBookings()
    .filter((b) => b.email.toLowerCase() === user.email.toLowerCase())
    .sort((a, b) => (a.date + a.slot).localeCompare(b.date + b.slot));

  const total = mine.reduce((sum, b) => sum + b.price, 0);
  const today = new Date().toISOString().split("T")[0];
  const next = mine.find((b) => b.date >= today);

  document.getElementById("db-count").textContent = mine.length;
  document.getElementById("db-total").textContent = bdyFormatPrice(total);
  document.getElementById("db-next").textContent = next ? `${formatDateFR(next.date)} à ${next.slot}` : "—";
  document.getElementById("db-pending").textContent = mine.filter((b) => bookingStatus(b).label === "En cours").length;

  const tbody = document.querySelector("#db-table tbody");
  const empty = document.getElementById("db-empty");

  if (mine.length === 0) {
    document.getElementById("db-table").classList.add("d-none");
    empty.classList.remove("d-none");
    return;
  }
  document.getElementById("db-table").classList.remove("d-none");
  empty.classList.add("d-none");

  tbody.innerHTML = [...mine].reverse().map((b) => {
    const status = bookingStatus(b);
    return `
      <tr>
        <td><span class="badge rounded-pill bg-bdy-light text-bdy">${b.ref}</span></td>
        <td><strong>${b.serviceName}</strong><br><small class="text-muted">× ${b.quantity} ${b.unit.includes("pièce") ? "pièce(s)" : "kg"}</small></td>
        <td>${formatDateFR(b.date)}</td>
        <td>${b.slot}</td>
        <td>${bdyFormatPrice(b.price)}</td>
        <td><span class="badge badge-status ${status.cls}">${status.label}</span></td>
      </tr>`;
  }).join("");
}

/* ---------- Authentification ---------- */
document.addEventListener("DOMContentLoaded", () => {
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const phoneRe = /^[0-9+][0-9\s.-]{7,}$/;

  /* Session persistante */
  const session = getSession();
  if (session) {
    renderDashboard(session);
  }

  /* Bascule Connexion <-> Inscription */
  document.getElementById("go-register").addEventListener("click", (e) => {
    e.preventDefault();
    const tab = new bootstrap.Tab(document.getElementById("tab-register"));
    tab.show();
  });

  /* --- Connexion --- */
  document.getElementById("login-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("lg-email");
    const password = document.getElementById("lg-password");

    bdySetValidity(email, emailRe.test(email.value.trim()));
    bdySetValidity(password, password.value.length >= 6);

    if (!email.classList.contains("is-valid") || !password.classList.contains("is-valid")) {
      bdyToast("Veuillez corriger les champs signalés.", "error");
      return;
    }

    const user = getUsers().find(
      (u) => u.email.toLowerCase() === email.value.trim().toLowerCase() && u.password === password.value
    );

    if (!user) {
      bdyToast("E-mail ou mot de passe incorrect.", "error");
      password.value = "";
      password.classList.add("is-invalid");
      return;
    }

    setSession(user);
    renderDashboard(user);
    bdyToast(`Bienvenue, ${user.name.split(" ")[0]} !`);
  });

  /* --- Inscription --- */
  document.getElementById("register-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("rg-name");
    const email = document.getElementById("rg-email");
    const phone = document.getElementById("rg-phone");
    const password = document.getElementById("rg-password");
    const confirm = document.getElementById("rg-confirm");

    bdySetValidity(name, name.value.trim().length >= 3);
    bdySetValidity(phone, phoneRe.test(phone.value.trim()));
    bdySetValidity(password, password.value.length >= 6);
    bdySetValidity(confirm, confirm.value === password.value && confirm.value.length >= 6);

    const emailValid = emailRe.test(email.value.trim());
    const emailTaken = getUsers().some((u) => u.email.toLowerCase() === email.value.trim().toLowerCase());
    bdySetValidity(email, emailValid && !emailTaken);

    const fields = [name, email, phone, password, confirm];
    if (!fields.every((f) => f.classList.contains("is-valid"))) {
      bdyToast("Veuillez corriger les champs signalés.", "error");
      return;
    }

    const users = getUsers();
    users.push({
      name: name.value.trim(),
      email: email.value.trim(),
      phone: phone.value.trim(),
      password: password.value,
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    const user = users[users.length - 1];
    setSession(user);
    renderDashboard(user);
    bdyToast(`Compte créé. Bienvenue, ${user.name.split(" ")[0]} !`);
  });

  /* --- Déconnexion --- */
  document.getElementById("btn-logout").addEventListener("click", () => {
    clearSession();
    document.getElementById("dashboard-view").classList.add("d-none");
    document.getElementById("auth-view").classList.remove("d-none");

    const loginForm = document.getElementById("login-form");
    loginForm.reset();
    loginForm.querySelectorAll(".is-valid, .is-invalid").forEach((el) =>
      el.classList.remove("is-valid", "is-invalid"));
    bdyToast("Vous êtes déconnecté(e). À bientôt !", "secondary");
  });
});

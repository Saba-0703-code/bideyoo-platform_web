/* ==========================================================================
   Pressing Bidè — Script partagé
   Injecte la barre de navigation et le pied de page sur toutes les pages,
   gère le lien actif et fournit des utilitaires communs.
   ========================================================================== */

"use strict";

const PB_CONFIG = {
  brand: "Pressing Bidè",
  tagline: "Votre laverie moderne à Lomé",
  phone: "+228 91 00 00 00",
  email: "contact@pressingbide.com",
  address: "Avenue de la Libération, Quartier Bé, Lomé — Togo",
  hours: [
    { d: "Lundi — Vendredi", h: "07 h 00 — 20 h 00" },
    { d: "Samedi", h: "08 h 00 — 19 h 00" },
    { d: "Dimanche", h: "09 h 00 — 18 h 00" },
  ],
};

const NAV_ITEMS = [
  { href: "index.html", label: "Accueil" },
  {
    label: "Services",
    href: "services.html",
    children: [
      { href: "services.html", label: "Nos services" },
      { href: "pricing.html", label: "Tarifs & formules" },
    ],
  },
  { href: "booking.html", label: "Réservation" },
  { href: "locations.html", label: "Agences" },
  {
    label: "Aide",
    children: [
      { href: "faq.html", label: "FAQ" },
      { href: "contact.html", label: "Contact" },
      { href: "a-propos.html", label: "À propos" },
    ],
  },
];

const currentFile = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();

/* ---------- Helper : vérifier si admin ---------- */
function pbIsAdmin() {
  const session = pbIsAuthenticated();
  return session && session.role === "admin";
}

/* ---------- Navbar ---------- */
function renderNavbar() {
  const session = pbIsAuthenticated();
  const isAdmin = pbIsAdmin();

  // Liens principaux
  let links = NAV_ITEMS.map((item) => {
    if (item.children) {
      const isActive = item.children.some((c) => currentFile === c.href.toLowerCase());
      const childLinks = item.children
        .map(
          (c) =>
            `<li><a class="dropdown-item" href="${c.href}">${c.label}</a></li>`
        )
        .join("");
      return `<li class="nav-item dropdown">
        <a class="nav-link dropdown-toggle ${isActive ? "active" : ""}" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">${item.label}</a>
        <ul class="dropdown-menu">${childLinks}</ul>
      </li>`;
    }
    const active = currentFile === item.href.toLowerCase();
    return `<li class="nav-item">
      <a class="nav-link ${active ? "active" : ""}" aria-current="${active ? "page" : "false"}" href="${item.href}">${item.label}</a>
    </li>`;
  }).join("");

  // Lien "Mes commandes" (connecté uniquement)
  let ordersLink = "";
  if (session) {
    const ordersActive = currentFile === "order.html";
    ordersLink = `<li class="nav-item">
      <a class="nav-link ${ordersActive ? "active" : ""}" href="order.html">
        <i class="bi bi-bag-check me-1"></i>Mes commandes
      </a>
    </li>`;
  }

  // Lien "Admin" — toujours visible, redirige vers login si non connecté
  const adminActive = currentFile === "admin.html";
  const adminLink = `<li class="nav-item">
    <a class="nav-link ${adminActive ? "active" : ""}" href="admin.html" title="Administration">
      <i class="bi bi-shield-lock me-1"></i>Admin
    </a>
  </li>`;

  // Bouton compte
  let accountBtn;
  if (session) {
    accountBtn = `<li class="nav-item ms-lg-2 mt-2 mt-lg-0 dropdown">
      <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false" title="Mon compte">
        <i class="bi bi-person-circle fs-5 me-1"></i><span class="d-none d-lg-inline">${session.name}</span>
      </a>
      <ul class="dropdown-menu dropdown-menu-end">
        <li><a class="dropdown-item" href="dashboard.html"><i class="bi bi-speedometer2 me-2"></i>Tableau de bord</a></li>
        <li><a class="dropdown-item" href="order.html"><i class="bi bi-bag me-2"></i>Mes commandes</a></li>
        ${isAdmin ? `<li><a class="dropdown-item" href="admin.html"><i class="bi bi-shield-lock me-2"></i>Administration</a></li>` : ""}
        <li><hr class="dropdown-divider"></li>
        <li><a class="dropdown-item text-danger" href="#" id="nav-logout"><i class="bi bi-box-arrow-right me-2"></i>Déconnexion</a></li>
      </ul>
    </li>`;
  } else {
    accountBtn = `<li class="nav-item ms-lg-2 mt-2 mt-lg-0">
      <a class="nav-link" href="login.html" title="Mon compte">
        <i class="bi bi-person-circle fs-5"></i>
      </a>
    </li>`;
  }

  document.getElementById("bdy-navbar").innerHTML = `
    <div class="container">
      <a class="bdy-brand" href="index.html">
        <img src="assets/logo.jpeg" alt="Logo Pressing Bidè" class="pb-logo-header">
        <span>Pressing <span class="text-brand-accent">Bidè</span></span>
      </a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navMenu"
        aria-controls="navMenu" aria-expanded="false" aria-label="Ouvrir le menu">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navMenu">
        <ul class="navbar-nav ms-auto mb-2 mb-lg-0 align-items-lg-center">
          ${links}
          ${ordersLink}
          ${adminLink}
          <li class="nav-item ms-lg-2 mt-2 mt-lg-0">
            <a class="btn btn-pb w-100 position-relative" href="order.html">
              <i class="bi bi-cart3 me-1"></i>Panier
              <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger d-none" id="cart-badge" style="font-size:.65rem;">0</span>
            </a>
          </li>
          <li class="nav-item ms-lg-2 mt-2 mt-lg-0">
            <a class="btn btn-outline-pb w-100" href="booking.html">
              <i class="bi bi-calendar2-check me-1"></i>Réserver
            </a>
          </li>
          ${accountBtn}
        </ul>
      </div>
    </div>`;

  // Logout handler
  const logoutNav = document.getElementById("nav-logout");
  if (logoutNav) {
    logoutNav.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("pb_session");
      pbToast("Déconnexion réussie.");
      setTimeout(() => { window.location.href = "index.html"; }, 800);
    });
  }
}

/* ---------- Footer ---------- */
function renderFooter() {
  const session = pbIsAuthenticated();
  const isAdmin = pbIsAdmin();

  const hours = PB_CONFIG.hours
    .map((h) => `<li class="d-flex justify-content-between gap-3 py-1"><span>${h.d}</span><span class="text-white">${h.h}</span></li>`)
    .join("");

  // Liens du footer — propres, sans doublons
  let footerLinks = `
    <div class="col-6 col-lg-2">
      <h6>Navigation</h6>
      <ul class="list-unstyled">
        <li class="py-1"><a href="index.html">Accueil</a></li>
        <li class="py-1"><a href="services.html">Services</a></li>
        <li class="py-1"><a href="pricing.html">Tarifs</a></li>
        <li class="py-1"><a href="booking.html">Réservation</a></li>
        <li class="py-1"><a href="locations.html">Agences</a></li>
      </ul>
    </div>
    <div class="col-6 col-lg-2">
      <h6>Aide</h6>
      <ul class="list-unstyled">
        <li class="py-1"><a href="faq.html">FAQ</a></li>
        <li class="py-1"><a href="contact.html">Contact</a></li>
        <li class="py-1"><a href="a-propos.html">À propos</a></li>
      </ul>
    </div>`;

  // Liens du bas du footer
  let bottomLinks = `
    <a href="legal.html">Mentions légales</a>`;
  if (session) {
    bottomLinks += `
    <a href="dashboard.html">Mon compte</a>`;
  } else {
    bottomLinks += `
    <a href="login.html">Connexion</a>`;
  }
  if (isAdmin) {
    bottomLinks += `
    <a href="admin.html">Admin</a>`;
  }

  document.getElementById("bdy-footer").innerHTML = `
    <div class="container py-5">
      <div class="row g-4">
        <div class="col-lg-4">
          <a class="bdy-brand text-white mb-2" href="index.html">
            <img src="assets/logo.jpeg" alt="Logo Pressing Bidè" class="pb-logo-header">
            <span>Pressing <span style="color:var(--pb-accent);">Bidè</span></span>
          </a>
          <p class="mt-3 mb-0 pe-lg-4">${PB_CONFIG.tagline}. Lavage, séchage, repassage, pressing : réservez en ligne, déposez votre linge, récupérez-le impeccable.</p>
          <div class="d-flex gap-3 mt-3">
            <a href="#" class="text-decoration-none text-white" aria-label="Facebook"><i class="bi bi-facebook fs-5"></i></a>
            <a href="#" class="text-decoration-none text-white" aria-label="Instagram"><i class="bi bi-instagram fs-5"></i></a>
            <a href="https://wa.me/22891000000" class="text-decoration-none text-white" target="_blank" rel="noopener" aria-label="WhatsApp"><i class="bi bi-whatsapp fs-5"></i></a>
          </div>
        </div>
        ${footerLinks}
        <div class="col-6 col-lg-2">
          <h6>Contact</h6>
          <ul class="list-unstyled">
            <li class="py-1"><i class="bi bi-geo-alt me-2"></i>${PB_CONFIG.address}</li>
            <li class="py-1"><i class="bi bi-telephone me-2"></i><a href="tel:${PB_CONFIG.phone.replace(/\s/g, "")}">${PB_CONFIG.phone}</a></li>
            <li class="py-1"><i class="bi bi-envelope me-2"></i><a href="mailto:${PB_CONFIG.email}">${PB_CONFIG.email}</a></li>
          </ul>
        </div>
        <div class="col-lg-2">
          <h6>Horaires</h6>
          <ul class="list-unstyled small mb-0">${hours}</ul>
        </div>
      </div>
      <hr class="border-secondary my-4">
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-center gap-2 small">
        <span>© ${new Date().getFullYear()} Pressing Bidè — ${PB_CONFIG.tagline}</span>
        <div class="d-flex align-items-center gap-3">
          ${bottomLinks}
        </div>
      </div>
    </div>`;
}

/* ---------- Utilitaires ---------- */
function pbFormatPrice(value) {
  return new Intl.NumberFormat("fr-FR").format(value) + " FCFA";
}

function pbToast(message, type = "success") {
  const container = document.getElementById("toast-container");
  if (!container) return;
  const el = document.createElement("div");
  el.className = `toast align-items-center text-bg-${type === "error" ? "danger" : type} border-0 show`;
  el.setAttribute("role", "alert");
  el.innerHTML = `<div class="d-flex">
    <div class="toast-body">${message}</div>
    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Fermer"></button>
  </div>`;
  container.appendChild(el);
  setTimeout(() => el.remove(), 5000);
}

function pbSetValidity(input, valid) {
  input.classList.toggle("is-invalid", !valid);
  input.classList.toggle("is-valid", valid);
}

function pbSetFieldError(input, message) {
  pbSetValidity(input, false);
  const feedback = input.nextElementSibling;
  if (feedback && feedback.classList.contains("invalid-feedback")) feedback.textContent = message;
}

function pbGenerateRef() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let ref = "PB-";
  for (let i = 0; i < 8; i++) ref += chars.charAt(Math.floor(Math.random() * chars.length));
  return ref;
}

function pbHashPassword(password) {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return "h_" + Math.abs(hash).toString(36);
}

function pbSanitize(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function pbIsAuthenticated() {
  const session = JSON.parse(localStorage.getItem("pb_session") || "null");
  if (!session) return null;
  if (Date.now() - session.lastActivity > 30 * 60 * 1000) {
    localStorage.removeItem("pb_session");
    return null;
  }
  session.lastActivity = Date.now();
  localStorage.setItem("pb_session", JSON.stringify(session));
  return session;
}

/* ---------- Initialisation ---------- */
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("bdy-navbar")) renderNavbar();
  if (document.getElementById("bdy-footer")) renderFooter();

  // Mettre à jour le compteur panier dans la navbar
  function updateCartBadge() {
    const cart = JSON.parse(localStorage.getItem("pb_cart") || "[]");
    const badge = document.getElementById("cart-badge");
    if (badge) {
      badge.textContent = cart.length;
      badge.classList.toggle("d-none", cart.length === 0);
    }
  }
  updateCartBadge();

  // Exposer globalement pour les autres scripts
  window.pbUpdateCartBadge = updateCartBadge;
});

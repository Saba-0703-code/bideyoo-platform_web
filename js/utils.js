/* ==========================================================================
   Pressing Bidè — Utilitaires partagés
   Validation, sanitisation, formatage
   ========================================================================== */

"use strict";

const PBUtils = {
  /* Validation e-mail */
  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },

  /* Validation téléphone (Togo) */
  isValidPhone(phone) {
    return /[\d\s]{8,}/.test(phone);
  },

  /* Validation mot de passe */
  isValidPassword(pw) {
    return typeof pw === "string" && pw.length >= 6;
  },

  /* Sanitisation anti-XSS */
  sanitize(str) {
    if (typeof str !== "string") return "";
    return str.replace(/[&<>"']/g, (ch) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[ch]));
  },

  /* Générer une référence unique */
  generateRef(prefix = "PB") {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let ref = prefix + "-";
    for (let i = 0; i < 8; i++) ref += chars.charAt(Math.floor(Math.random() * chars.length));
    return ref;
  },

  /* Formater un prix */
  formatPrice(value) {
    return new Intl.NumberFormat("fr-FR").format(value) + " FCFA";
  },

  /* Hachage simple (SHA-256 côté client pour démo) */
  async hashPassword(password) {
    if (typeof crypto !== "undefined" && crypto.subtle) {
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hash = await crypto.subtle.digest("SHA-256", data);
      return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("");
    }
    // Fallback
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      hash = ((hash << 5) - hash) + password.charCodeAt(i);
      hash |= 0;
    }
    return "h_" + Math.abs(hash).toString(36);
  },

  /* Date relative (il y a X jours) */
  relativeDate(timestamp) {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return "à l'instant";
    if (mins < 60) return "il y a " + mins + " min";
    if (hours < 24) return "il y a " + hours + " h";
    if (days < 30) return "il y a " + days + " j";
    return new Date(timestamp).toLocaleDateString("fr-FR");
  },

  /* Debounce */
  debounce(fn, delay = 300) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  },
};

// Exposer globalement
window.PBUtils = PBUtils;

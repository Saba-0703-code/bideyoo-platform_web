/* ==========================================================================
   Pressing Bidè — Système d'authentification
   Inscription, connexion, gestion de session (localStorage)
   ========================================================================== */

"use strict";

document.addEventListener("DOMContentLoaded", () => {
  /* ---------- Toggle mot de passe ---------- */
  const toggleBtn = document.getElementById("toggle-password");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      const input = document.getElementById("lg-password");
      const icon = toggleBtn.querySelector("i");
      if (input.type === "password") {
        input.type = "text";
        icon.classList.replace("bi-eye", "bi-eye-slash");
      } else {
        input.type = "password";
        icon.classList.replace("bi-eye-slash", "bi-eye");
      }
    });
  }

  /* ---------- Redirection si déjà connecté ---------- */

  const session = pbIsAuthenticated();
  if (session && (currentFile === "login.html" || currentFile === "register.html")) {
    window.location.href = "dashboard.html";
    return;
  }

  /* ---------- LOGIN ---------- */
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.getElementById("lg-email");
      const password = document.getElementById("lg-password");

      const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
      const passValid = password.value.length >= 6;

      pbSetValidity(email, emailValid);
      pbSetValidity(password, passValid);

      if (!emailValid || !passValid) {
        pbToast("Veuillez corriger les erreurs.", "error");
        return;
      }

      // Vérifier le compte dans localStorage
      const users = JSON.parse(localStorage.getItem("pb_users") || "[]");
      const user = users.find(u => u.email === email.value.trim().toLowerCase());

      if (!user) {
        pbSetValidity(email, false);
        pbToast("Aucun compte trouvé avec cet e-mail.", "error");
        return;
      }

      if (user.password !== pbHashPassword(password.value)) {
        pbSetValidity(password, false);
        pbToast("Mot de passe incorrect.", "error");
        return;
      }

      // Créer la session
      const sessionData = {
        userId: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        accountType: user.accountType,
        role: user.role || "user",
        loyaltyPoints: user.loyaltyPoints || 0,
        lastActivity: Date.now(),
      };
      localStorage.setItem("pb_session", JSON.stringify(sessionData));

      pbToast("Connexion réussie ! Redirection…");
      setTimeout(() => { window.location.href = "dashboard.html"; }, 1200);
    });
  }

  /* ---------- REGISTER ---------- */
  
  const registerForm = document.getElementById("register-form");
  if (registerForm) {
    registerForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("rg-name");
      const email = document.getElementById("rg-email");
      const phone = document.getElementById("rg-phone");
      const password = document.getElementById("rg-password");
      const confirm = document.getElementById("rg-confirm");
      const accountType = document.getElementById("rg-type");

      const nameValid = name.value.trim().length >= 2;
      const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
      const phoneValid = /[\d\s]{8,}/.test(phone.value.trim());
      const passValid = password.value.length >= 6;
      const confirmValid = confirm.value === password.value && passValid;

      pbSetValidity(name, nameValid);
      pbSetValidity(email, emailValid);
      pbSetValidity(phone, phoneValid);
      pbSetValidity(password, passValid);
      pbSetValidity(confirm, confirmValid);

      if (!nameValid || !emailValid || !phoneValid || !passValid || !confirmValid) {
        pbToast("Veuillez corriger les erreurs.", "error");
        return;
      }

      // Vérifier si l'e-mail existe déjà
      const users = JSON.parse(localStorage.getItem("pb_users") || "[]");
      if (users.some(u => u.email === email.value.trim().toLowerCase())) {
        pbSetValidity(email, false);
        pbToast("Un compte existe déjà avec cet e-mail.", "error");
        return;
      }

      // Déterminer le rôle (admin uniquement pour emails spécifiques)
      const adminEmails = ["admin@pressingbide.com", "akimakako@pressingbide.com"];
      const isAdmin = adminEmails.includes(email.value.trim().toLowerCase());

      // Créer l'utilisateur
      const newUser = {
        id: "u_" + Date.now().toString(36),
        name: pbSanitize(name.value.trim()),
        email: email.value.trim().toLowerCase(),
        phone: pbSanitize(phone.value.trim()),
        password: pbHashPassword(password.value),
        accountType: accountType.value,
        role: isAdmin ? "admin" : "user",
        loyaltyPoints: 0,
        createdAt: Date.now(),
      };

      users.push(newUser);
      localStorage.setItem("pb_users", JSON.stringify(users));

      // Créer la session automatiquement
      const sessionData = {
        userId: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        accountType: newUser.accountType,
        role: newUser.role,
        loyaltyPoints: 0,
        lastActivity: Date.now(),
      };
      localStorage.setItem("pb_session", JSON.stringify(sessionData));

      pbToast("Compte créé avec succès ! Bienvenue 🎉");
      setTimeout(() => { window.location.href = "dashboard.html"; }, 1500);
    });
  }

  /* ---------- Forgot password ---------- */
  const forgotBtn = document.getElementById("forgot-password");
  if (forgotBtn) {
    forgotBtn.addEventListener("click", (e) => {
      e.preventDefault();
      pbToast("Fonctionnalité à venir. Contactez-nous à " + PB_CONFIG.email, "info");
    });
  }
});

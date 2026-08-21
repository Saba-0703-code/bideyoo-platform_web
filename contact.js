/* ==========================================================================
   Pressing Bidè — Formulaire de contact
   ========================================================================== */

"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contact-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("ct-name");
    const email = document.getElementById("ct-email");
    const subject = document.getElementById("ct-subject");
    const message = document.getElementById("ct-message");

    const nameValid = name.value.trim().length >= 2;
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
    const subjectValid = subject.value !== "";
    const messageValid = message.value.trim().length >= 10;

    pbSetValidity(name, nameValid);
    pbSetValidity(email, emailValid);
    pbSetValidity(subject, subjectValid);
    pbSetValidity(message, messageValid);

    if (!nameValid || !emailValid || !subjectValid || !messageValid) {
      pbToast("Veuillez corriger les erreurs.", "error");
      return;
    }

    // Sauvegarder dans localStorage (démo)
    const contacts = JSON.parse(localStorage.getItem("pb_contacts") || "[]");
    contacts.push({
      name: pbSanitize(name.value.trim()),
      email: email.value.trim().toLowerCase(),
      phone: document.getElementById("ct-phone")?.value.trim() || "",
      subject: subject.value,
      message: pbSanitize(message.value.trim()),
      createdAt: Date.now(),
    });
    localStorage.setItem("pb_contacts", JSON.stringify(contacts));

    pbToast("Message envoyé avec succès ! Nous vous répondrons sous 24 h. 📩");
    form.reset();
    form.querySelectorAll(".is-valid").forEach(el => el.classList.remove("is-valid"));
  });
});

/* ==========================================================================
   Pressing Bidè — Page Services
   Génère les cartes de prestations depuis les données partagées.
   ========================================================================== */

"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("services-grid");
  if (!grid) return;

  grid.innerHTML = PB_SERVICES.map((s) => `
    <div class="col-md-6 col-lg-4">
      <div class="card card-hover h-100 ${s.popular ? "border-2" : ""}" ${s.popular ? 'style="border-color: var(--pb-accent) !important;"' : ""}>
        <div class="card-body p-4">
          <div class="d-flex justify-content-between align-items-start mb-3">
            <div class="bdy-icon-badge"><i class="bi ${s.icon}"></i></div>
            <span class="badge rounded-pill bg-pb-light text-pb">${s.duration}</span>
          </div>
          <h3 class="h5 fw-bold">${s.name}</h3>
          <p class="text-muted small">${s.desc}</p>
          <ul class="list-unstyled small mb-4">
            ${s.features.map((f) => `<li class="mb-1"><i class="bi bi-check-circle-fill text-pb me-2"></i>${f}</li>`).join("")}
          </ul>
          <p class="bdy-price mb-3">${pbFormatPrice(s.price)} <small>${s.unit}</small></p>
          <a href="booking.html?service=${s.id}" class="btn ${s.popular ? "btn-pb" : "btn-outline-pb"} w-100">
            <i class="bi bi-calendar2-plus me-1"></i>Réserver ce service
          </a>
        </div>
      </div>
    </div>
  `).join("");
});

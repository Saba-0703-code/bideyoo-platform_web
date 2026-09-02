/* ==========================================================================
   Pressing Bidè — Calculateur de prix interactif
   ========================================================================== */

"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const serviceSelect = document.getElementById("calc-service-select");
  const planSelect = document.getElementById("calc-plan-select");
  const weightInput = document.getElementById("calc-weight-input");
  const calcBtn = document.getElementById("calc-btn");
  const recapService = document.getElementById("calc-service");
  const recapWeight = document.getElementById("calc-weight");
  const recapPlan = document.getElementById("calc-plan");
  const recapTotal = document.getElementById("calc-total");

  if (!calcBtn) return;

  function calculate() {
    const serviceId = serviceSelect.value;
    const planId = planSelect.value;
    const qty = parseInt(weightInput.value, 10) || 0;

    let price = 0;
    let serviceName = "—";
    let planName = "Prix unitaire";
    let unitLabel = "";

    if (planId) {
      const plan = pbGetPlan(planId);
      if (plan) {
        planName = plan.name;
        price = plan.price;
        unitLabel = plan.unit;
        // Calculate based on weight tiers
        if (plan.unit.includes("/ 5 kg")) {
          price = plan.price * Math.ceil(qty / 5);
        } else if (plan.unit.includes("/ 10 kg")) {
          price = plan.price * Math.ceil(qty / 10);
        }
        serviceName = "Formule " + plan.name;
      }
    } else if (serviceId) {
      const service = pbGetService(serviceId);
      if (service) {
        serviceName = service.name;
        price = service.price;
        unitLabel = service.unit;
        if (service.unit.includes("/ 5 kg")) {
          price = service.price * Math.ceil(qty / 5);
        } else if (service.unit.includes("/ cycle") || service.unit.includes("/ pièce")) {
          price = service.price * qty;
        }
      }
    }

    recapService.textContent = serviceName;
    recapWeight.textContent = qty > 0 ? qty + " kg / pièces" : "—";
    recapPlan.textContent = planName;
    recapTotal.textContent = pbFormatPrice(price);
  }

  calcBtn.addEventListener("click", calculate);
  serviceSelect.addEventListener("change", () => {
    if (serviceSelect.value) planSelect.value = "";
    calculate();
  });
  planSelect.addEventListener("change", () => {
    if (planSelect.value) serviceSelect.value = "";
    calculate();
  });
  weightInput.addEventListener("input", calculate);
});

/* ==========================================================================
   Pressing Bidè — Gestion de commande (panier)
   ========================================================================== */

"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const session = pbIsAuthenticated();
  const DELIVERY_FEE = 3000;

  // Charger le panier depuis localStorage
  let cart = JSON.parse(localStorage.getItem("pb_cart") || "[]");

  const cartItems = document.getElementById("cart-items");
  const cartEmpty = document.getElementById("cart-empty");
  const rcSubtotal = document.getElementById("rc-subtotal");
  const rcDelivery = document.getElementById("rc-delivery");
  const rcPoints = document.getElementById("rc-points");
  const rcTotal = document.getElementById("rc-total");
  const btnConfirm = document.getElementById("btn-confirm-order");
  const addressField = document.getElementById("address-field");

  // Toggle livraison
  document.querySelectorAll('input[name="delivery"]').forEach(radio => {
    radio.addEventListener("change", () => {
      addressField.classList.toggle("d-none", radio.value !== "delivery");
      updateRecap();
    });
  });

  function renderCart() {
    if (!cartItems) return;
    if (cart.length === 0) {
      cartItems.innerHTML = `<div class="text-center py-4" id="cart-empty">
        <i class="bi bi-bag-x display-4 text-muted"></i>
        <p class="text-muted mt-2">Votre panier est vide.</p>
        <a href="booking.html" class="btn btn-pb"><i class="bi bi-calendar2-plus me-2"></i>Réserver un service</a>
      </div>`;
      if (btnConfirm) btnConfirm.disabled = true;
      return;
    }

    if (btnConfirm) btnConfirm.disabled = false;

    cartItems.innerHTML = cart.map((item, idx) => {
      const service = pbGetService(item.serviceId);
      const name = service ? service.name : item.serviceName || "Service";
      return `<div class="d-flex justify-content-between align-items-center py-3 border-bottom">
        <div>
          <p class="fw-bold mb-0">${name}</p>
          <p class="text-muted small mb-0">${item.quantity} kg / pièces</p>
        </div>
        <div class="text-end">
          <p class="fw-bold mb-0">${pbFormatPrice(item.price)}</p>
          <button class="btn btn-sm text-danger btn-remove-item" data-idx="${idx}"><i class="bi bi-trash"></i></button>
        </div>
      </div>`;
    }).join("");

    // Supprimer un article
    cartItems.querySelectorAll(".btn-remove-item").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.dataset.idx);
        cart.splice(idx, 1);
        localStorage.setItem("pb_cart", JSON.stringify(cart));
        renderCart();
        updateRecap();
      });
    });

    updateRecap();
  }

  function updateRecap() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price || 0), 0);
    const isDelivery = document.querySelector('input[name="delivery"]:checked')?.value === "delivery";
    const delivery = isDelivery ? DELIVERY_FEE : 0;
    const total = subtotal + delivery;
    const points = Math.floor(total / 1000);

    if (rcSubtotal) rcSubtotal.textContent = pbFormatPrice(subtotal);
    if (rcDelivery) rcDelivery.textContent = delivery > 0 ? pbFormatPrice(delivery) : "Gratuit";
    if (rcPoints) rcPoints.textContent = "+" + points + " pts";
    if (rcTotal) rcTotal.textContent = pbFormatPrice(total);
  }

  // Confirmer la commande
  if (btnConfirm) {
    btnConfirm.addEventListener("click", () => {
      if (cart.length === 0) {
        pbToast("Votre panier est vide.", "error");
        return;
      }

      const isDelivery = document.querySelector('input[name="delivery"]:checked')?.value === "delivery";
      const payment = document.querySelector('input[name="payment"]:checked')?.value || "cash";
      const address = document.getElementById("order-address");

      if (isDelivery && (!address || !address.value.trim())) {
        pbToast("Veuillez indiquer une adresse de livraison.", "error");
        return;
      }

      const subtotal = cart.reduce((sum, item) => sum + (item.price || 0), 0);
      const delivery = isDelivery ? DELIVERY_FEE : 0;
      const total = subtotal + delivery;

      // Créer la commande
      const order = {
        ref: pbGenerateRef(),
        userId: session ? session.userId : "guest",
        serviceName: cart.map(c => {
          const s = pbGetService(c.serviceId);
          return s ? s.name : c.serviceName;
        }).join(", "),
        serviceId: cart[0].serviceId,
        quantity: cart.reduce((sum, c) => sum + (c.quantity || 0), 0),
        total: total,
        delivery: isDelivery ? "Livraison" : "Retrait boutique",
        address: isDelivery ? address.value.trim() : "",
        payment: payment,
        status: "Reçue",
        date: new Date().toISOString(),
        createdAt: Date.now(),
      };

      // Sauvegarder
      const orders = JSON.parse(localStorage.getItem("pb_orders") || "[]");
      orders.push(order);
      localStorage.setItem("pb_orders", JSON.stringify(orders));

      // Points de fidélité
      if (session) {
        const points = Math.floor(total / 1000);
        session.loyaltyPoints = (session.loyaltyPoints || 0) + points;
        localStorage.setItem("pb_session", JSON.stringify(session));

        // Notification
        const notifs = JSON.parse(localStorage.getItem("pb_notifications") || "[]");
        notifs.push({
          userId: session.userId,
          title: "Commande confirmée",
          message: `Votre commande ${order.ref} a été enregistrée. Total : ${pbFormatPrice(total)}`,
          read: false,
          createdAt: Date.now(),
        });
        localStorage.setItem("pb_notifications", JSON.stringify(notifs));
      }

      // Vider le panier
      cart = [];
      localStorage.setItem("pb_cart", JSON.stringify(cart));

      // Afficher confirmation
      document.getElementById("oc-ref").textContent = order.ref;
      document.getElementById("oc-service").textContent = order.serviceName;
      document.getElementById("oc-total").textContent = pbFormatPrice(order.total);
      document.getElementById("oc-payment").textContent = { mobile_money: "Mobile Money", cash: "Espèces", card: "Carte bancaire" }[payment] || payment;

      // Masquer le formulaire, afficher la confirmation
      document.querySelectorAll(".bdy-section .row > .col-lg-7, .bdy-section .row > .col-lg-5").forEach(el => el.classList.add("d-none"));
      document.getElementById("order-confirmed").classList.remove("d-none");

      pbToast("Commande confirmée ! 🎉");
    });
  }

  renderCart();
});

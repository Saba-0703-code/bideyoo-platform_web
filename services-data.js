/* ==========================================================================
   Pressing Bidè — Données des services (source unique, partagée)
   Catalogue complet selon le cahier des charges AKIMAKAKO
   ========================================================================== */

"use strict";

const PB_SERVICES = [
  {
    id: "lavage-classique",
    name: "Lavage classique",
    desc: "Lavage en machine avec détergent hypoallergénique. Idéal pour le quotidien.",
    price: 2500,
    unit: "/ 5 kg",
    duration: "≈ 2 h",
    icon: "bi-droplet-half",
    category: "lavage",
    features: ["Détergent hypoallergénique", "Séchage inclus", "Pliage simple"],
  },
  {
    id: "lavage-premium",
    name: "Lavage premium",
    desc: "Lavage soigné avec parfum au choix, détachage et pliage premium.",
    price: 3500,
    unit: "/ 5 kg",
    duration: "≈ 3 h",
    icon: "bi-stars",
    category: "lavage",
    features: ["Détergent premium", "Détachage inclus", "Parfum au choix", "Pliage soigné"],
    popular: true,
  },
  {
    id: "sechage",
    name: "Séchage",
    desc: "Séchage en sèche-linge professionnel, sans repassage.",
    price: 1500,
    unit: "/ cycle",
    duration: "≈ 1 h",
    icon: "bi-moisture",
    category: "sechage",
    features: ["Sèche-linge professionnel", "Programme adapté", "Anti-grésillement"],
  },
  {
    id: "repassage",
    name: "Repassage",
    desc: "Repassage vapeur à la perfection. Chemises, draps, pantalons…",
    price: 1000,
    unit: "/ pièce",
    duration: "24 h",
    icon: "bi-brightness-high",
    category: "repassage",
    features: ["Vapeur professionnelle", "À la pièce ou au kilo", "Finition impeccable"],
  },
  {
    id: "nettoyage-sec",
    name: "Nettoyage à sec",
    desc: "Nettoyage à sec haute qualité pour costumes, robes et textiles fragiles.",
    price: 4000,
    unit: "/ pièce",
    duration: "48 h",
    icon: "bi-wind",
    category: "pressing",
    features: ["Textiles fragiles", "Détachage professionnel", "Traitement anti-mites"],
  },
  {
    id: "pressing-express",
    name: "Pressing express",
    desc: "Pressing professionnel livré en 2 heures chrono. Pour les urgences.",
    price: 5000,
    unit: "/ pièce",
    duration: "2 h",
    icon: "bi-lightning-charge-fill",
    category: "pressing",
    features: ["Retour en 2 h", "Traitement prioritaire", "Costumes et robes"],
    popular: true,
  },
  {
    id: "collecte-livraison",
    name: "Collecte et livraison à domicile",
    desc: "Nous récupérons et livrons votre linge chez vous. Service tout-en-un.",
    price: 3000,
    unit: "supplément",
    duration: "Variable",
    icon: "bi-truck",
    category: "service",
    features: ["Récupération à domicile", "Livraison à domicile", "Créneau au choix"],
  },
];

/* Forfaits / formules */
const PB_PLANS = [
  {
    id: "essentielle",
    name: "Essentielle",
    desc: "Le nécessaire pour votre linge du quotidien.",
    price: 2500,
    unit: "/ 5 kg",
    icon: "bi-droplet-half",
    color: "#1A73E8",
    features: [
      "Lavage classique",
      "Séchage inclus",
      "Pliage simple",
      "Retour en 2 h",
    ],
    excluded: ["Repassage", "Pressing", "Livraison domicile"],
  },
  {
    id: "confort",
    name: "Confort",
    desc: "Le plus populaire. Lavage premium avec repassage.",
    price: 5000,
    unit: "/ 5 kg",
    icon: "bi-stars",
    color: "#FF6B35",
    popular: true,
    features: [
      "Lavage premium",
      "Séchage et pliage",
      "Repassage inclus",
      "Parfum au choix",
      "Retour en 24 h",
    ],
    excluded: ["Pressing", "Livraison domicile"],
  },
  {
    id: "premium",
    name: "Premium",
    desc: "Service complet sans compromis. Lavage, pressing, livraison.",
    price: 8000,
    unit: "/ 10 kg",
    icon: "bi-gem",
    color: "#00C9A7",
    features: [
      "Lavage premium",
      "Séchage et pliage",
      "Repassage complet",
      "Pressing inclus",
      "Collecte et livraison",
      "Service prioritaire",
    ],
    excluded: [],
  },
];

/* Points de vente */
const PB_LOCATIONS = [
  {
    id: "agence-centrale",
    name: "Agence Centrale — Bé",
    address: "Avenue de la Libération, Quartier Bé, Lomé",
    phone: "+228 91 00 00 00",
    lat: 6.1319,
    lng: 1.2228,
    hours: "Lun-Ven: 07h-20h | Sam: 08h-19h | Dim: 09h-18h",
    isOpen: true,
    services: ["Lavage", "Séchage", "Repassage", "Pressing"],
  },
  {
    id: "agence-kara",
    name: "Agence Kara",
    address: "Quartier Banda, Kara",
    phone: "+228 92 00 00 00",
    lat: 9.5489,
    lng: 1.1864,
    hours: "Lun-Ven: 07h-19h | Sam: 08h-18h",
    isOpen: true,
    services: ["Lavage", "Séchage", "Repassage"],
  },
  {
    id: "agence-sokode",
    name: "Agence Sokodé",
    address: "Quartier Tchamba, Sokodé",
    phone: "+228 93 00 00 00",
    lat: 8.9833,
    lng: 1.1333,
    hours: "Lun-Ven: 08h-18h | Sam: 08h-17h",
    isOpen: false,
    services: ["Lavage", "Séchage"],
  },
];

/* Renvoie un service par son identifiant. */
function pbGetService(id) {
  return PB_SERVICES.find((s) => s.id === id) || null;
}

function pbGetPlan(id) {
  return PB_PLANS.find((p) => p.id === id) || null;
}

function pbGetLocation(id) {
  return PB_LOCATIONS.find((l) => l.id === id) || null;
}

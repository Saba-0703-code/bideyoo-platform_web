# Pressing Bidè — Plateforme web de réservation de services de laverie

> **Votre laverie moderne à Lomé — « C'est fini, j'ai trouvé ma place de lavage. »**

Pressing Bidè est une plateforme web de réservation en ligne de services de laverie
(lavage, séchage, repassage, pressing, nettoyage à sec, livraison à domicile),
développée dans le cadre d'un projet pédagogique pour le compte de **M. Akimakako**,
entrepreneur et propriétaire du projet.

Ce dépôt contient l'intégralité de la plateforme : **15 pages**, un **logo**,
un **système de réservation multi-étapes**, un **espace client** avec suivi de statut
et programme de fidélité, un **espace administrateur** avec KPIs et export CSV,
et une **facture détaillée** de la prestation.

---

## 1. Présentation

| Élément | Détail |
|---|---|
| Client | M. Akimakako — entrepreneur |
| Interlocuteur direct | Le professeur (représentant du propriétaire) |
| Équipe | 4 membres |

<table>
  <tr>
    <td align="center">
      <img src="images/Mr Tchassama.jpg" width="120px"><br>
      <b>TCHASSAMA Noumane</b><br>
        Scrum Master/ Chef de projet
    </td>
     <td align="center">
      <img src="images/Mr SENOU.M.jpeg" width="120px"><br>
      <b>Mawulomi SENOU</b><br>
        Lead développeur Front-end
    </td>
    <td align="center">
      <img src="images/franç.png" width="120px"><br>
      <b>Françoise FOLLY-ADJON</b><br>
        Développeuse Front-end/ Interactions
    </td>
    <td>
      <img src="images/boss logie.png" width="120px"><br>
      <b>Felicio SABA</b><br>
      Développeur intégration & Déploiement 
    </td>
  </tr>
</table>
| Durée du projet | 17/08/2026 → 24/08/2026 à 23 h 59 |
| Stack technique | Bootstrap 5.3, JavaScript (vanilla ES6+), HTML5, CSS3, Git / GitHub |
| Gestion de projet | Trello |
| Type de site | Statique (Bootstrap + JS), données locales (localStorage) |
| Localisation cible | **Lomé — Togo** (version togolaise) |

### Fonctionnalités livrées

- **Accueil** : bannière hero, étapes, services, formules comparatives, avis clients, CTA.
- **Services** : catalogue complet (7 services) avec cartes et grille tarifaire.
- **Tarifs** : page comparative des formules (Essentielle / Confort / Premium) + calculateur interactif.
- **Réservation** : formulaire multi-étapes (service → agence → date/détails → confirmation), référence unique.
- **Points de vente** : carte interactive, liste des agences, horaires, disponibilité en temps réel.
- **FAQ** : questions/réponses par catégories avec recherche et accordéon.
- **À propos** : histoire, fondateur, valeurs, équipe, engagement qualité.
- **Contact** : coordonnées, carte OpenStreetMap, horaires, formulaire validé.
- **Connexion / Inscription** : pages séparées, validation, type de compte (Particulier / Professionnel).
- **Espace client (Dashboard)** : commandes, suivi en temps réel, fidélité, notifications, profil.
- **Commande** : panier, options de livraison, modes de paiement (Mobile Money, Espèces, Carte).
- **Administration** : dashboard KPIs, gestion commandes/utilisateurs/services/agences, export CSV.
- **Mentions légales** : CGU, politique de confidentialité, cookies.
- **404** : page d'erreur soignée.

### Pages du site

| Page | Fichier | Contenu |
|---|---|---|
| Accueil | `index.html` | Hero, étapes, services, formules, à propos, avis, CTA |
| Services | `services.html` | Catalogue complet + grille tarifaire |
| Tarifs | `pricing.html` | Formules comparatives + calculateur de prix |
| Réservation | `booking.html` | Formulaire multi-étapes + confirmation |
| Points de vente | `locations.html` | Carte interactive + agences |
| FAQ | `faq.html` | Questions/réponses + recherche |
| À propos | `a-propos.html` | Histoire, fondateur, valeurs, équipe |
| Contact | `contact.html` | Coordonnées, carte, formulaire |
| Connexion | `login.html` | Formulaire de connexion |
| Inscription | `register.html` | Formulaire d'inscription |
| Dashboard | `dashboard.html` | Commandes, fidélité, notifications, profil |
| Commande | `order.html` | Panier, livraison, paiement, confirmation |
| Administration | `admin.html` | KPIs, gestion, rapports, export CSV |
| Mentions légales | `legal.html` | CGU, confidentialité, cookies |
| 404 | `404.html` | Page d'erreur |

---

## 2. Stack technique et architecture

```
pressing-bide/
├── index.html              # Accueil
├── services.html           # Services & tarifs
├── pricing.html            # Tarifs comparatifs + calculateur
├── booking.html            # Réservation multi-étapes
├── locations.html          # Points de vente
├── faq.html                # FAQ
├── a-propos.html           # À propos
├── contact.html            # Contact & localisation
├── login.html              # Connexion
├── register.html           # Inscription
├── dashboard.html          # Espace client
├── order.html              # Commande / panier
├── admin.html              # Espace administrateur
├── legal.html              # Mentions légales
├── espace-client.html      # Redirection → login/dashboard
├── reservation.html        # Redirection → booking
├── mentions-legales.html   # Ancien → redirige vers legal.html
├── 404.html                # Page d'erreur
├── maquettes.html          # Maquettes
├── css/
│   └── style.css           # Thème personnalisé (variables CSS, composants)
├── js/
│   ├── main.js             # Config, navbar/footer injectés, utilitaires
│   ├── utils.js            # Utilitaires (validation, sanitisation, formatage)
│   ├── services-data.js    # Données des services, forfaits, agences
│   ├── services.js         # Rendu des cartes de services
│   ├── booking.js          # Réservation multi-étapes
│   ├── calculator.js       # Calculateur de prix interactif
│   ├── auth.js             # Inscription / connexion / session
│   ├── dashboard.js        # Espace client (commandes, fidélité, profil)
│   ├── order.js            # Gestion de commande (panier, paiement)
│   ├── admin.js            # Espace admin (KPIs, gestion, export)
│   └── contact.js          # Validation du formulaire de contact
└── assets/
    ├── logo.jpeg           # Logo Pressing Bidè (JPEG)
    └── logo.svg            # Logo original (SVG)
```

### Charte graphique (du cahier des charges)

| Élément | Valeur |
|---|---|
| Couleur primaire | #1A73E8 (Bleu confiance) |
| Couleur secondaire | #00C9A7 (Vert fraîcheur) |
| Couleur d'accent | #FF6B35 (Orange énergie) |
| Police titres | Poppins (Bold 700) |
| Police corps | Inter (Regular 400) |
| Icônes | Bootstrap Icons |

---

## 3. Installation & lancement

Aucun build n'est nécessaire : le site est 100 % statique.

### Option 1 — Ouvrir directement

Ouvrez `index.html` dans votre navigateur (double-clic).

### Option 2 — Serveur local (recommandé)

```bash
# Python
python -m http.server 8000
# puis ouvrir http://localhost:8000

# Ou avec Node.js
npx serve .
```

### Déploiement

Le site peut être déployé gratuitement sur **Netlify**, **Vercel** ou **GitHub Pages**.

---

## 4. Sécurité & bonnes pratiques

- Validation de tous les formulaires côté client (e-mail, téléphone, dates, quantités).
- Données personnelles stockées uniquement en local (démo) — aucune transmission.
- `autocomplete` et attributs ARIA pour l'accessibilité.
- HTML sémantique, `lang="fr"`, méta-descriptions, `alt` sur les images.
- Sanitisation des entrées utilisateur (anti-XSS).
- Session avec expiration automatique après 30 min d'inactivité.
- Mots de passe hachés côté client (SHA-256 ou fallback).

---

© 2026 Pressing Bidè — Projet pédagogique réalisé par une équipe de 4 développeurs.

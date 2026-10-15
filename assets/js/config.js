/* Réglages du site Naiiss Nails : seul fichier à modifier pour brancher l'agenda et le paiement.
   Voir RESERVATION-AGENDA.md (agenda Google via Make) et worker/README.md (paiement Stripe).
   Prix, durées et règles d'acompte sont dans data.js ; le catalogue du Worker se régénère avec : node worker/build-catalog.mjs */
window.NNCFG = {
  /* true = démonstration : créneaux d'exemple, aucun paiement réel, aucune demande envoyée. */
  DEMO_MODE: true,

  /* Agenda (Make → Google Agenda). Contrat décrit dans RESERVATION-AGENDA.md. */
  BOOKING_WEBHOOK: '',      // reçoit le rendez-vous (POST JSON) et crée l'événement dans l'agenda d'Anaïs
  AVAILABILITY_URL: '',     // renvoie les créneaux déjà pris (GET ?from=AAAA-MM-JJ&to=AAAA-MM-JJ)

  /* Paiement de l'acompte et des cartes cadeau.
     'demo'   : simulation claire, aucune carte demandée (état actuel)
     'stripe' : redirection vers Stripe Checkout via le Worker Cloudflare (worker/checkout.js)
     'none'   : pas de paiement en ligne, la demande est envoyée à l'agenda et l'acompte se règle au salon */
  PAYMENT_MODE: 'demo',
  CHECKOUT_ENDPOINT: '',    // ex. https://naiiss-nails-paiement.<compte>.workers.dev/checkout
  GIFT_ENDPOINT: '',        // ex. https://naiiss-nails-paiement.<compte>.workers.dev/gift

  /* Réservation. Horaires : fiche Google (lundi–vendredi 9 h–17 h). */
  MIN_NOTICE_HOURS: 24,
  MAX_DAYS_AHEAD: 90,
  SLOT_STEP_MIN: 30,
  MAX_TOTAL_MIN: 300,

  /* Salon */
  PHONE_DISPLAY: '06 60 53 63 98',
  PHONE_TEL: '+33660536398',
  ADDRESS: '187 quartier Sainte-Catherine, 04300 Forcalquier',
  LAT: 43.9606744,
  LNG: 5.7984054,
  OWNER: 'Anaïs',
  BRAND: 'Naiiss Nails',
  INSTAGRAM: 'https://www.instagram.com/naiiss.nails/',
  MAP_EMBED: 'https://www.google.com/maps?q=43.9606744,5.7984054&z=16&output=embed&hl=fr',

  /* Film du héros : images extraites de la vidéo (assets/frames/d-001.webp… pour ordinateur, assets/frames-m/m-001.webp… pour téléphone en portrait).
     frames = 0 : pas de film, seule l'image fixe (assets/img/hero-poster.webp) est affichée. */
  HERO: { frames: 96, pad: 3, desktop: 'assets/frames/d-', mobile: 'assets/frames-m/m-', ext: '.webp', focusD: [0.5, 0.5], focusM: [0.5, 0.5], v: 2 }
};

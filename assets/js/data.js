/* Naiiss Nails — contenu du site : prestations, horaires, règles de réservation, avis, galerie.
   ⚠ PRIX ET DURÉES = ESTIMATIONS (aucune grille tarifaire publique : ni sur Instagram, ni sur la fiche Google).
   À remplacer par les vrais tarifs d'Anaïs, puis : node worker/build-catalog.mjs  (régénère le catalogue du Worker de paiement).
   Les horaires viennent de la fiche Google (relevée le 14/10/2026). Les avis sont des extraits fidèles des avis Google. */
window.NN = {
  brand: 'Naiiss Nails',
  owner: 'Anaïs',
  pricesAreEstimates: true,

  /* Prestations. `addon` : option qui s'ajoute à une pose (jamais seule). `min` = durée en minutes, `price` = euros entiers. */
  groups: [
    {
      id: 'semi', kicker: 'Tenue & douceur', title: 'Semi renfort',
      photo: 'ig-12', photoAlt: 'Ongles longs bordeaux brillants, ornés de petits strass',
      intro: 'Le semi-permanent renforcé : une base fortifiante sous la couleur, pour des ongles naturels protégés, brillants et impeccables.',
      items: [
        { id: 'semi-pose', name: 'Pose semi-permanent renforcé', min: 75, price: 45, desc: 'Préparation de l’ongle, base renforcée, couleur au choix et finition brillance. Idéal pour garder vos ongles naturels.' },
        { id: 'semi-renouv', name: 'Renouvellement semi renfort', min: 75, price: 40, desc: 'Dépose de la pose précédente puis nouvelle pose complète.' }
      ]
    },
    {
      id: 'gel', kicker: 'Forme & longueur', title: 'Gel',
      photo: 'ig-02', photoAlt: 'Ongles rose pâle et framboise, fleurs en relief et perles dorées',
      intro: 'La pose gel pour sculpter la longueur et la forme que vous rêvez, avec une tenue solide : du naturel sophistiqué au nail art le plus créatif.',
      items: [
        { id: 'gel-pose', name: 'Pose complète gel', min: 120, price: 65, desc: 'Construction en gel sur ongle naturel, forme et longueur sur mesure, couleur au choix.' },
        { id: 'gel-rempl', name: 'Remplissage gel', min: 90, price: 50, desc: 'Entretien de votre pose gel : on comble la repousse, on reprend la forme et la couleur.' }
      ]
    },
    {
      id: 'capsules', kicker: 'Longueur immédiate', title: 'Capsules',
      photo: 'ig-03', photoAlt: 'Ongles stiletto bleu et blanc façon azulejos, dorures et pierres',
      intro: 'Des capsules posées au gel pour des formes parfaites et des longueurs dès la première séance : amande, carré, stiletto, ovale…',
      items: [
        { id: 'caps-pose', name: 'Pose de capsules gel', min: 135, price: 70, desc: 'Capsules sur mesure collées et sculptées au gel, forme et longueur à votre goût, couleur au choix.' },
        { id: 'caps-rempl', name: 'Remplissage capsules', min: 90, price: 50, desc: 'Entretien d’une pose en capsules : repousse comblée, forme et finition refaites.' }
      ]
    },
    {
      id: 'extras', kicker: 'Les petits plus', title: 'Options & soins',
      photo: 'ig-09', photoAlt: 'Ongles courts avec vagues chrome dorées sur fond rose',
      intro: 'Le nail art, c’est la signature : ajoutez-le à votre pose. La dépose peut aussi se réserver seule.',
      items: [
        { id: 'art-leger', name: 'Nail art léger, 2 ongles', min: 15, price: 8, addon: true, desc: 'Petit motif dessiné à la main sur deux ongles.' },
        { id: 'art-complet', name: 'Nail art complet, 10 ongles', min: 45, price: 30, addon: true, desc: 'Un univers complet, dessiné à la main sur toutes les mains : fleurs, léopard, motifs graphiques…' },
        { id: 'french', name: 'French ou baby boomer', min: 20, price: 10, addon: true, desc: 'Une french blanche, colorée ou dégradée.' },
        { id: 'chrome', name: 'Effet chrome ou strass', min: 20, price: 10, addon: true, desc: 'Poudre chrome, bijoux d’ongles ou strass pour une touche éclatante.' },
        { id: 'depose', name: 'Dépose seule', min: 30, price: 15, desc: 'Dépose en douceur d’une pose réalisée ici ou ailleurs, soin des cuticules inclus.' }
      ]
    }
  ],

  /* Horaires de la fiche Google : lundi à vendredi 9 h – 17 h, fermé le week-end. Index = jour JS (0 dimanche). */
  hours: { 0: null, 1: ['09:00', '17:00'], 2: ['09:00', '17:00'], 3: ['09:00', '17:00'], 4: ['09:00', '17:00'], 5: ['09:00', '17:00'], 6: null },

  /* Règles : acompte forfaitaire déduit du total, annulation gratuite jusqu'à X h avant. (À confirmer avec Anaïs.) */
  policy: { depositEuros: 10, lateCancelHours: 48 },

  giftAmounts: [30, 50, 80, 120],

  /* Avis : extraits fidèles d'avis Google 5 étoiles (fiche : 5,0 · 129 avis), prénom + initiale du nom. Aucune citation modifiée. */
  rating: { value: '5,0', count: 129, url: 'https://www.google.com/maps/place/Naiiss+Nails+-+Proth%C3%A9siste+ongulaire+Forcalquier/@43.9606744,5.7984054,17z/data=!4m8!3m7!1s0x12cbb5cbe075ee21:0x37238bb493293a0!8m2!3d43.9606744!4d5.7984054!9m1!1b1!16s%2Fg%2F11y3kn9fh9?hl=fr' },
  reviews: [
    { who: 'Laetitia B.', text: 'Je recommande à 100% ! Naiiss Nails est une prothésiste ongulaire incroyable. Elle est très professionnelle, à l’écoute et toujours de bon conseil. Son travail est soigné, précis et super créatif. Je suis toujours ravie du résultat, mes ongles tiennent parfaitement et je reçois plein de compliments à chaque fois ! Merci encore pour ton talent et ton sérieux, je ne confierai mes ongles à personne d’autre' },
    { who: 'Emma K.', text: 'Anaïs est une artiste, mes ongles sont absolument magnifiques, de vrais bijoux. Je suis hyper satisfaite. Anaïs est très à l\'aise et à l\'écoute de ses clients. Je recommande vivement !!!' },
    { who: 'Louise G.', text: 'Mes ongles sont juste sublimes ! Anaïs est très à l’écoute, hyper agréable et surtout tres compétente. Je ne peux que recommander cette adresse ! Elle a su s’adapter sans difficulté à ma demande et créer des ongles exactement comme je voulais (même mieux je dirais). Merci pour cet accueil et ce travail de grande qualité ! Et à bientôt pour ma part !!^^' },
    { who: 'Ilona K.', text: 'Anaïs est géniale ! Première pose avec elle et j’ai passé un excellent moment. Elle est très compétente et super agréable. J’y retournerai sans aucune hésitation, je recommande à 100%. Encore mille mercis pour la magnifique pose !!' },
    { who: 'Hélène P.', text: 'Très beau moment partagé entre filles avec Anais qui est très pro et très sympa. Une vraie virtuose des ongles ! Je recommande vivement 💅👌😁' },
    { who: 'Manon', text: 'C\'était ma première prestation, et Anais est à l\'écoute, a su me conseiller et me mettre à l\'aise ! Le résultat est vraiment super, et j\'ai passé un moment très agréable ! Je recommande !' },
    { who: 'Loane K.', text: 'Je suis absolument ravie de mes ongles ! Ils sont magnifiques, exactement comme je le voulais, et ils ont tenu parfaitement longtemps. La prothésiste a fait un travail soigné, minutieux et très professionnel. Je recommande à 100 %, merci encore pour ce superbe résultat ! 🥰' },
    { who: 'Marina C.', text: 'Je recommande Anaïs les yeux fermés ! ✨ Très professionnelle, douce et agréable, elle fait un travail impeccable et de grande qualité, avec beaucoup de soin et de précision.' },
    { who: 'Priscilla R.', text: 'Je recommande vivement cette prothésiste ongulaire. Son travail est vraiment super, précis, et elle a un vrai talent. En plus, elle est très agréable et à l’écoute. Je suis ravie de mes ongles !' },
    { who: 'Emmanuelle N.', text: 'Première prestation chez Anaïs et sûrement pas la dernière et je suis ravie ! Très accueillante, professionnelle et attentive. Le résultat est magnifique, je recommande sans hésiter.' },
    { who: 'Lauriane L.', text: 'Première pour moi, j\'ai passé un super moment avec Anais. Elle a su me conseiller sur mes hésitations, le résultat est superbe ! Je recommande à 1000%' },
    { who: 'Anouk G.', text: 'Super moment, un travail de pro. J’adore la pose, elle est Magnifique et Nais est vraiment une personne à l’écoute et agréable.' },
    { who: 'Sophie G.', text: 'Je recommande à 100% 🥰 Anaïs est très à l’écoute et vraiment très agréable. Foncez les yeux fermés. Merci encore 🙏🏼🙏🏼' },
    { who: 'Fabienne M.', text: 'Anaïs est au top! Je la recommande fortement. Très bonne conscience professionnelle, sérieuse et à l’écoute des besoins de ses clientes.' }
  ],

  /* Réalisations : photos publiques du compte Instagram @naiiss.nails (captures de la grille publique, à remplacer par les originaux). */
  gallery: [
    { id: 'ig-02', w: 622, h: 768, alt: 'Ongles rose pâle et framboise, fleurs en relief, motifs léopard et perles dorées' },
    { id: 'ig-01', w: 622, h: 768, alt: 'Ongles longs en amande dans des verts profonds, rehaussés de bijoux d’ongles dorés' },
    { id: 'ig-09', w: 622, h: 830, alt: 'Ongles courts ovales : vagues chrome dorées, fleurs écaille et cadre doré, sur fond rose' },
    { id: 'ig-03', w: 622, h: 768, alt: 'Ongles stiletto bleu et blanc façon azulejos, dorures et pierres bleues' },
    { id: 'ig-04', w: 622, h: 830, alt: 'Ongles amande nude, french blanche, chaînes dorées et motif girafe' },
    { id: 'ig-11', w: 622, h: 660, alt: 'Ongles amande bleu dégradé, fleurs en relief et strass' },
    { id: 'ig-05', w: 622, h: 830, alt: 'Ongles amande nude et écaille de tortue, ornés de strass' },
    { id: 'ig-12', w: 588, h: 830, alt: 'Ongles longs bordeaux brillants, ornés de petits strass' },
    { id: 'ig-07', w: 622, h: 830, alt: 'Ongles nude : chaînes de strass, french brune et rayures zèbre' },
    { id: 'ig-08', w: 622, h: 830, alt: 'Ongles courts carrés nude, french léopard noire et petites étoiles dorées' },
    { id: 'ig-10', w: 588, h: 830, alt: 'Ongles amande noirs brillants, french noire, motif léopard et perles dorées' }
  ]
};

/* Naiiss Nails — carte cadeau : choix du montant, aperçu en direct, paiement Stripe via le Worker (mode démonstration sinon). */
(() => {
  'use strict';

  const CFG = window.NNCFG || {};
  const NN = window.NN || { giftAmounts: [] };
  const $ = (s, el = document) => el.querySelector(s);
  const form = $('#giftForm');
  if (!form) return;
  const eur = n => n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
  const motionOn = () => document.documentElement.dataset.motion !== 'off';

  const amounts = $('#gcAmounts'), view = $('#gcAmountView'), toView = $('#gcToView'), out = $('#gcMsgOut');
  const f = { to: $('#gcTo'), from: $('#gcFrom'), email: $('#gcEmail'), msg: $('#gcMsg'), hp: $('#gcHp') };
  const amount = () => { const c = $('input[name="gcAmount"]:checked', form); return c ? parseInt(c.value, 10) : 0; };

  amounts.innerHTML = NN.giftAmounts.map((a, i) =>
    '<label><input type="radio" name="gcAmount" value="' + a + '"' + (i === 1 ? ' checked' : '') + '><span>' + eur(a) + '</span></label>').join('');
  const preview = () => {
    view.textContent = eur(amount() || 0);
    const t = f.to.value.trim(); toView.textContent = t ? 'Pour ' + t : 'Pour une belle personne';
  };
  amounts.addEventListener('change', preview); f.to.addEventListener('input', preview); preview();

  /* inclinaison de la carte au passage du pointeur */
  const card = $('#giftCard'), wrap = $('.gift__card-wrap');
  if (card && wrap && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    wrap.addEventListener('pointermove', e => {
      if (!motionOn()) return;
      const r = wrap.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      card.style.setProperty('--ry', (x * 22).toFixed(1) + 'deg'); card.style.setProperty('--rx', (-y * 18).toFixed(1) + 'deg'); card.style.setProperty('--sx', (x * 90).toFixed(0) + '%');
    });
    wrap.addEventListener('pointerleave', () => { card.style.setProperty('--ry', '-12deg'); card.style.setProperty('--rx', '8deg'); card.style.setProperty('--sx', '-30%'); });
  }

  const fail = (id, input, msg) => { $(id).textContent = msg; input.setAttribute('aria-invalid', msg ? 'true' : 'false'); input.classList.toggle('is-bad', !!msg); return msg; };
  function validate() {
    const a = fail('#eGcFrom', f.from, f.from.value.trim().length >= 2 ? '' : 'Indiquez votre prénom.');
    const b = fail('#eGcEmail', f.email, /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.value.trim()) ? '' : 'Cette adresse e-mail n’est pas valide.');
    if (a) { f.from.focus(); return false; }
    if (b) { f.email.focus(); return false; }
    return true;
  }
  const btn = $('#gcBtn');
  form.addEventListener('submit', async e => {
    e.preventDefault();
    out.textContent = '';
    if (f.hp.value) return;                                    // pot de miel
    if (!validate()) return;
    const payload = { kind: 'giftcard', amount: amount(), to: f.to.value.trim(), from: f.from.value.trim(), email: f.email.value.trim(), message: f.msg.value.trim(), page: location.href.split('?')[0].split('#')[0] };
    if (!CFG.GIFT_ENDPOINT || CFG.PAYMENT_MODE !== 'stripe') {
      out.textContent = 'Mode démonstration : aucune carte n’a été créée et rien n’a été payé. Avec le compte Stripe d’Anaïs, vous seriez redirigé(e) vers la page de paiement sécurisée pour régler ' + eur(payload.amount) + '.';
      return;
    }
    btn.disabled = true;
    try {
      const r = await fetch(CFG.GIFT_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.url) throw new Error(j.error || 'gift');
      location.href = j.url;
    } catch (err) {
      out.textContent = 'Le paiement n’a pas pu être lancé. Réessayez dans un instant ou appelez le ' + (CFG.PHONE_DISPLAY || '') + '.';
      btn.disabled = false;
    }
  });

  /* retour de Stripe */
  const qs = new URLSearchParams(location.search);
  if (qs.get('cadeau') === 'ok') {
    out.textContent = 'Merci ! Votre carte cadeau est payée. Un e-mail avec le code vous est envoyé, ainsi qu’à la personne à qui vous l’offrez.';
    setTimeout(() => { const s = $('#cadeau'); if (s) s.scrollIntoView(); }, 200);
  } else if (qs.get('cadeau') === 'annule') {
    out.textContent = 'Le paiement a été annulé. Vous pouvez réessayer quand vous voulez.';
  }
})();

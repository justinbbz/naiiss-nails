/* Naiiss Nails — interface : écran d'ouverture, en-tête, révélations, parallaxe, cartes, rituel, galerie, avis, carte, curseur étincelant.
   Tout se coupe avec le bouton « Animations » ou la préférence système « réduire les animations ». */
(() => {
  'use strict';

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const root = document.documentElement;
  const body = document.body;
  const D = window.NN || { groups: [], reviews: [], gallery: [], rating: {} };
  const CFG = window.NNCFG || {};
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const pad = n => String(n).padStart(2, '0');
  const eur = n => n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
  const fmtDur = m => (m < 60 ? m + ' min' : Math.floor(m / 60) + ' h' + (m % 60 ? ' ' + pad(m % 60) : ''));
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* stockage indisponible */ } }
  };

  let ticking = false;   // déclaré en tête : setMotion() appelle onScroll() avant la fin du fichier

  /* ---------- animations : préférence système + bouton ---------- */
  const mq = matchMedia('(prefers-reduced-motion: reduce)');
  const motionBtn = $('#motionBtn');
  const motionOn = () => root.dataset.motion !== 'off';
  function setMotion(on, save) {
    root.dataset.motion = on ? 'on' : 'off';
    if (motionBtn) {
      motionBtn.setAttribute('aria-pressed', String(!on));
      const label = on ? 'Réduire les animations' : 'Rétablir les animations';
      motionBtn.setAttribute('aria-label', label); motionBtn.title = label;
    }
    if (save) store.set('nn-motion', on ? 'on' : 'off');
    window.dispatchEvent(new CustomEvent('nn:motion', { detail: { on } }));
    onScroll();
  }
  const saved = store.get('nn-motion');
  setMotion(saved ? saved === 'on' : !mq.matches, false);
  if (motionBtn) motionBtn.addEventListener('click', () => setMotion(!motionOn(), true));
  mq.addEventListener && mq.addEventListener('change', e => { if (!store.get('nn-motion')) setMotion(!e.matches, false); });

  /* ---------- écran d'ouverture ---------- */
  const pre = $('#pre'), preBar = $('#preBar');
  $$('[data-hero]').forEach((el, i) => el.style.setProperty('--hd', 250 + i * 150));
  let revealed = false;
  function reveal() {
    if (revealed) return; revealed = true;
    if (pre) { pre.classList.add('is-done'); setTimeout(() => pre.remove(), 1500); }
    root.classList.add('is-ready');
    window.dispatchEvent(new Event('nn:ready'));
  }
  if (!pre || !motionOn()) { if (pre) pre.remove(); reveal(); }
  else {
    const t0 = performance.now(); let heroReady = false;
    window.addEventListener('hero:ready', () => { heroReady = true; });
    const tick = () => {
      requestAnimationFrame(tick);                       // d'abord : une erreur ne doit jamais figer la boucle
      if (revealed) return;
      const t = performance.now() - t0;
      if (preBar) preBar.style.setProperty('--p', heroReady ? 1 : Math.min(.92, t / 3400));
      if ((heroReady && t > 1500) || t > 3600) reveal();
    };
    tick();
  }

  /* ---------- en-tête, progression, navigation active ---------- */
  const topBar = $('#topBar'), progress = $('#progressBar');
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const y = window.scrollY, h = document.documentElement.scrollHeight - innerHeight;
      topBar.classList.toggle('is-solid', y > 40);
      if (progress) progress.style.setProperty('--p', h > 0 ? clamp(y / h, 0, 1).toFixed(4) : 0);
      updateParallax();
      updateRitual();
    });
  }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll, { passive: true });

  const navLinks = $$('.nav a');
  if ('IntersectionObserver' in window) {
    const secs = ['prestations', 'creations', 'avis', 'reserver', 'cadeau', 'contact'].map(id => document.getElementById(id)).filter(Boolean);
    const navIO = new IntersectionObserver(es => {
      es.forEach(e => {
        if (!e.isIntersecting) return;
        navLinks.forEach(a => a.removeAttribute('aria-current'));
        const a = navLinks.find(x => x.getAttribute('href') === '#' + e.target.id); if (a) a.setAttribute('aria-current', 'true');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    secs.forEach(s => navIO.observe(s));
  }

  /* ---------- menu mobile et pièges à focus ---------- */
  const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([tabindex="-1"]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
  function trapFocus(container, e) {
    if (e.key !== 'Tab') return;
    const items = $$(FOCUSABLE, container).filter(el => el.offsetParent !== null);
    if (!items.length) return;
    const first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
  const menu = $('#menu'), burger = $('#burger'), menuClose = $('#menuClose');
  let menuFrom = null;
  function openMenu() { menuFrom = document.activeElement; menu.hidden = false; burger.setAttribute('aria-expanded', 'true'); body.classList.add('is-locked'); menuClose.focus(); }
  function closeMenu(restore = true) { menu.hidden = true; burger.setAttribute('aria-expanded', 'false'); body.classList.remove('is-locked'); if (restore && menuFrom) menuFrom.focus(); }
  burger.addEventListener('click', openMenu);
  menuClose.addEventListener('click', () => closeMenu());
  menu.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); else trapFocus(menu, e); });
  $$('a', menu).forEach(a => a.addEventListener('click', () => closeMenu(false)));

  /* ---------- révélations et mots qui montent ---------- */
  function splitWords(el) {
    let i = 0;
    const walk = node => {
      Array.from(node.childNodes).forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(tok => {
            if (!tok) return;
            if (/^\s+$/.test(tok)) { frag.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span'); w.className = 'w';
            const s = document.createElement('span'); s.textContent = tok; s.style.setProperty('--i', i++);
            w.appendChild(s); frag.appendChild(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(el);
  }
  $$('.split').forEach(splitWords);

  const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => {
    es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); if (e.target.matches('.facts')) runCounters(e.target); } });
  }, { threshold: .14, rootMargin: '0px 0px -6% 0px' }) : null;
  function watch(root0 = document) {
    $$('.reveal:not(.is-in), .split:not(.is-in)', root0).forEach((el, i) => {
      if (!el.style.getPropertyValue('--d') && el.classList.contains('reveal')) el.style.setProperty('--d', (i % 4) * 90);
      if (io) io.observe(el); else el.classList.add('is-in');
    });
  }

  function runCounters(scope) {
    $$('[data-count]', scope).forEach(el => {
      const end = parseFloat(el.dataset.count), dec = parseInt(el.dataset.dec || '0', 10);
      const fmt = v => v.toLocaleString('fr-FR', { minimumFractionDigits: dec, maximumFractionDigits: dec });
      if (!motionOn()) { el.textContent = fmt(end); return; }
      const t0 = performance.now(), dur = 1400;
      const step = t => { const k = clamp((t - t0) / dur, 0, 1), e = 1 - Math.pow(1 - k, 3); el.textContent = fmt(end * e); if (k < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    });
  }

  /* ---------- parallaxe douce ---------- */
  const par = $$('[data-speed]').map(el => ({ el, speed: parseFloat(el.dataset.speed) || 0 }));
  function updateParallax() {
    if (!motionOn()) { par.forEach(p => p.el.style.removeProperty('--py')); return; }
    const vh = innerHeight;
    par.forEach(p => {
      const r = p.el.getBoundingClientRect();
      if (r.bottom < -300 || r.top > vh + 300) return;
      p.el.style.setProperty('--py', ((r.top + r.height / 2 - vh / 2) * p.speed).toFixed(1) + 'px');
    });
  }

  /* ---------- prestations ---------- */
  const mains = D.groups.filter(g => g.id !== 'extras');
  const svcGrid = $('#svcGrid');
  if (svcGrid) {
    svcGrid.innerHTML = mains.map((g, i) => {
      const from = Math.min(...g.items.map(x => x.price)), shortest = Math.min(...g.items.map(x => x.min));
      return '<article class="svc reveal" style="--d:' + i * 120 + '">' +
        '<img class="svc__img" src="assets/img/' + g.photo + '-l.webp" alt="' + esc(g.photoAlt) + '" loading="lazy" decoding="async" width="622" height="768">' +
        '<span class="svc__n" aria-hidden="true">0' + (i + 1) + '</span>' +
        '<p class="svc__kicker">' + esc(g.kicker) + '</p><h3>' + esc(g.title) + '</h3><p>' + esc(g.intro) + '</p>' +
        '<div class="svc__meta"><span class="svc__price">à partir de <b>' + eur(from) + '</b> · ' + fmtDur(shortest) + '</span>' +
        '<a class="btn btn--primary btn--small" href="#reserver" data-open="' + g.id + '"><span>Réserver<span class="sr-only"> : ' + esc(g.title) + '</span></span><svg aria-hidden="true"><use href="#i-arrow"/></svg></a></div></article>';
    }).join('');
    $$('[data-open]').forEach(a => a.addEventListener('click', () => setTimeout(() => window.NNBooking && window.NNBooking.openGroup(a.dataset.open), 60)));
    // inclinaison 3D et reflet qui suit le pointeur
    if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
      $$('.svc', svcGrid).forEach(c => {
        c.addEventListener('pointermove', e => {
          if (!motionOn()) return;
          const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
          c.style.setProperty('--ry', ((x - .5) * 9).toFixed(2) + 'deg'); c.style.setProperty('--rx', ((.5 - y) * 9).toFixed(2) + 'deg');
          c.style.setProperty('--mx', (x * 100).toFixed(1) + '%'); c.style.setProperty('--my', (y * 100).toFixed(1) + '%');
        });
        c.addEventListener('pointerleave', () => { c.style.setProperty('--rx', '0deg'); c.style.setProperty('--ry', '0deg'); });
      });
    }
  }
  const extras = (D.groups.find(g => g.id === 'extras') || { items: [] }).items;
  const extrasList = $('#extrasList');
  if (extrasList) extrasList.innerHTML = extras.map(i => '<li>' + esc(i.name) + '<span>' + (i.addon ? '+ ' : '') + eur(i.price) + '</span><small>' + fmtDur(i.min) + '</small></li>').join('');
  const priceNote = $('#priceNote'); if (priceNote && D.pricesAreEstimates && CFG.DEMO_MODE) priceNote.hidden = false;

  /* ---------- le rituel : défilement horizontal épinglé ---------- */
  const rit = $('#rituel'), ritSteps = $('#ritualSteps');
  function updateRitual() {
    if (!rit || !ritSteps) return;
    if (innerWidth <= 860 || !motionOn()) { ritSteps.style.transform = ''; rit.style.setProperty('--p', 1); return; }
    const r = rit.getBoundingClientRect(), total = rit.offsetHeight - innerHeight;
    if (total <= 0) return;
    const p = clamp(-r.top / total, 0, 1);
    const max = Math.max(0, ritSteps.scrollWidth - innerWidth + 8);
    ritSteps.style.transform = 'translate3d(' + (-p * max).toFixed(1) + 'px,0,0)';
    rit.style.setProperty('--p', p.toFixed(4));
  }

  /* ---------- galerie + visionneuse ---------- */
  const gal = $('#gallery');
  function buildGallery() {
    if (!gal) return;
    const cols = innerWidth > 1000 ? 4 : innerWidth > 640 ? 3 : 2;
    if (buildGallery.cols === cols) return;
    buildGallery.cols = cols; gal.innerHTML = '';
    const colEls = Array.from({ length: cols }, () => { const c = document.createElement('div'); c.className = 'gcol'; gal.appendChild(c); return c; });
    D.gallery.forEach((it, i) => {
      const d = document.createElement('div'); d.className = 'gitem reveal'; d.setAttribute('role', 'listitem'); d.style.setProperty('--d', (i % cols) * 110);
      d.innerHTML = '<button type="button" data-i="' + i + '" aria-label="Agrandir la photo : ' + esc(it.alt) + '"><img src="assets/img/' + it.id + '-s.webp" srcset="assets/img/' + it.id + '-s.webp 360w, assets/img/' + it.id + '-l.webp 622w" sizes="(min-width:1000px) 25vw, (min-width:640px) 33vw, 50vw" alt="" loading="lazy" decoding="async" width="' + it.w + '" height="' + it.h + '"><span class="zoom" aria-hidden="true"><svg><use href="#i-plus"/></svg></span></button>';
      colEls[i % cols].appendChild(d);
    });
    watch(gal);
  }
  buildGallery();
  let rsT; addEventListener('resize', () => { clearTimeout(rsT); rsT = setTimeout(buildGallery, 200); });

  const lb = $('#lb'), lbImg = $('#lbImg'), lbCap = $('#lbCap'), lbClose = $('#lbClose');
  let lbIdx = 0, lbFrom = null;
  function lbShow() {
    const it = D.gallery[lbIdx];
    lbImg.src = 'assets/img/' + it.id + '-l.webp'; lbImg.alt = it.alt; lbImg.width = it.w; lbImg.height = it.h;
    lbCap.textContent = it.alt + ' — photo ' + (lbIdx + 1) + ' sur ' + D.gallery.length;
  }
  function lbOpen(i, from) { lbIdx = i; lbFrom = from; lbShow(); lb.hidden = false; body.classList.add('is-locked'); lbClose.focus(); }
  function lbHide() { lb.hidden = true; body.classList.remove('is-locked'); if (lbFrom) lbFrom.focus(); }
  const lbGo = d => { lbIdx = (lbIdx + d + D.gallery.length) % D.gallery.length; lbShow(); };
  if (gal) gal.addEventListener('click', e => { const b = e.target.closest('button[data-i]'); if (b) lbOpen(+b.dataset.i, b); });
  lbClose.addEventListener('click', lbHide);
  $('#lbPrev').addEventListener('click', () => lbGo(-1));
  $('#lbNext').addEventListener('click', () => lbGo(1));
  lb.addEventListener('click', e => { if (e.target === lb) lbHide(); });
  lb.addEventListener('keydown', e => {
    if (e.key === 'Escape') lbHide(); else if (e.key === 'ArrowLeft') lbGo(-1); else if (e.key === 'ArrowRight') lbGo(1); else trapFocus(lb, e);
  });
  let sx = null;
  lb.addEventListener('pointerdown', e => { sx = e.clientX; });
  lb.addEventListener('pointerup', e => { if (sx === null) return; const dx = e.clientX - sx; sx = null; if (Math.abs(dx) > 60) lbGo(dx < 0 ? 1 : -1); });

  /* ---------- avis ---------- */
  const track = $('#sliderTrack');
  if (track) {
    const n = D.reviews.length;
    const star = '<svg aria-hidden="true"><use href="#i-star"/></svg>';
    track.innerHTML = D.reviews.map((r, i) =>
      '<li class="review">' +
      '<span class="stars" role="img" aria-label="5 étoiles sur 5">' + star.repeat(5) + '</span>' +
      '<blockquote><p>' + esc(r.text) + '</p></blockquote>' +
      '<footer><span class="review__av" aria-hidden="true">' + esc(r.who.charAt(0)) + '</span><span class="review__who"><b>' + esc(r.who) + '</b><span>Avis Google</span></span></footer></li>').join('');
    const sCount = $('#sCount'), prev = $('#sPrev'), next = $('#sNext');
    const card = () => track.querySelector('.review');
    const step = () => { const c = card(); return c ? c.getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap || 20) : 300; };
    const upd = () => {
      const i = clamp(Math.round(track.scrollLeft / step()), 0, n - 1);
      sCount.textContent = (i + 1) + ' / ' + n;
      prev.disabled = track.scrollLeft < 8; next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 8;
    };
    track.addEventListener('scroll', () => requestAnimationFrame(upd), { passive: true });
    prev.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: motionOn() ? 'smooth' : 'auto' }));
    next.addEventListener('click', () => track.scrollBy({ left: step(), behavior: motionOn() ? 'smooth' : 'auto' }));
    addEventListener('resize', upd); upd();
    const r = D.rating || {};
    if ($('#scoreN')) $('#scoreN').textContent = r.value || '5,0';
    if ($('#scoreCount')) $('#scoreCount').textContent = r.count || '';
    if ($('#scoreLink') && r.url) $('#scoreLink').href = r.url;
  }

  /* ---------- carte : chargée seulement avec l'accord du visiteur ---------- */
  const mapBtn = $('#mapBtn');
  if (mapBtn) mapBtn.addEventListener('click', () => {
    const f = document.createElement('iframe');
    f.src = CFG.MAP_EMBED; f.title = 'Carte : Naiiss Nails, 187 quartier Sainte-Catherine, Forcalquier'; f.loading = 'lazy'; f.referrerPolicy = 'no-referrer-when-downgrade';
    $('#mapPh').replaceWith(f);
  });

  const yr = $('#year'); if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- curseur étincelant (souris uniquement) ---------- */
  const trail = $('#trail');
  if (trail && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const ctx = trail.getContext('2d');
    let parts = [], running = false, lx = 0, ly = 0, lt = 0, dpr = 1;
    const COLORS = ['#FF9DC3', '#FFD6E3', '#F5DDB0', '#FFFFFF', '#F4A6C3'];
    const fit = () => { dpr = Math.min(2, devicePixelRatio || 1); trail.width = innerWidth * dpr; trail.height = innerHeight * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    fit(); addEventListener('resize', fit);
    function star(x, y, r, rot) {
      ctx.beginPath();
      for (let i = 0; i < 8; i++) { const a = rot + i * Math.PI / 4, rr = i % 2 ? r * .28 : r; ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
      ctx.closePath(); ctx.fill();
    }
    function loop(t) {
      if (!parts.length || !motionOn()) { running = false; ctx.clearRect(0, 0, innerWidth, innerHeight); return; }
      requestAnimationFrame(loop);
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      parts = parts.filter(p => t - p.t0 < p.life);
      parts.forEach(p => {
        const k = (t - p.t0) / p.life;
        ctx.globalAlpha = (1 - k) * .9; ctx.fillStyle = p.c;
        star(p.x + p.vx * k * 30, p.y + p.vy * k * 30 + k * k * 26, p.r * (1 - k * .5), p.rot + k * 2);
      });
      ctx.globalAlpha = 1;
    }
    addEventListener('pointermove', e => {
      if (!motionOn() || e.pointerType !== 'mouse') return;
      const t = performance.now(), d = Math.hypot(e.clientX - lx, e.clientY - ly);
      if (d < 16 || t - lt < 26) return;
      lx = e.clientX; ly = e.clientY; lt = t;
      parts.push({ x: lx + (Math.random() - .5) * 8, y: ly + (Math.random() - .5) * 8, vx: (Math.random() - .5) * 2, vy: (Math.random() - .5) * 2, r: 4 + Math.random() * 6, rot: Math.random() * 3, c: COLORS[Math.floor(Math.random() * COLORS.length)], t0: t, life: 650 + Math.random() * 350 });
      if (parts.length > 60) parts.shift();
      if (!running) { running = true; requestAnimationFrame(loop); }
    }, { passive: true });
  }

  watch();
  window.addEventListener('nn:motion', () => { watch(); updateRitual(); });
  onScroll();
  window.NNUI = { motionOn, watch, trapFocus, eur, fmtDur, esc };
})();

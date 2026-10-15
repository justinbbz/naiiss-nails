/* Naiiss Nails — héros : le film d'un ongle qui reçoit du vernis AVANCE avec le défilement.
   Les images extraites de la vidéo (assets/frames/d-001.webp… et assets/frames-m/m-001.webp… en portrait) sont dessinées sur un <canvas>,
   avec fondu entre images voisines et inertie. Sans images (HERO.frames = 0) : l'image fixe avance doucement à la place. */
(() => {
  'use strict';

  const CFG = window.NNCFG || {}, H = CFG.HERO || {};
  const hero = document.getElementById('accueil');
  const canvas = document.getElementById('heroCanvas');
  const poster = document.getElementById('heroPoster');
  if (!hero || !canvas) return;
  const root = document.documentElement;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const motionOn = () => root.dataset.motion !== 'off';
  const chapters = Array.from(hero.querySelectorAll('#heroChapters li'));
  const meter = document.getElementById('heroMeter');
  const cue = document.getElementById('heroCue');
  const content = hero.querySelector('.hero__content');
  const ctaBox = hero.querySelector('.hero__cta');
  const shade = hero.querySelector('.hero__shade');
  const ctx = canvas.getContext ? canvas.getContext('2d', { alpha: false }) : null;
  const N = H.frames | 0;

  let dirKey = '', frames = [], loaded = [], gen = 0, readyFired = false;
  let dpr = 1, cw = 0, ch = 0;
  let cur = 0, tgt = 0, intro = 0, introT0 = 0, introOn = false, drawnAt = -1, forced = true, drawn = false;
  const INTRO_TO = 0.07;                       // le film démarre tout seul jusqu'à 7 %, puis le défilement prend le relais

  const wantMobile = () => matchMedia('(max-width: 820px) and (orientation: portrait)').matches;
  const pathOf = i => (wantMobile() ? H.mobile : H.desktop) + String(i + 1).padStart(H.pad || 3, '0') + (H.ext || '.webp') + '?v=' + (H.v || 1);
  const focus = () => (wantMobile() ? (H.focusM || [.5, .5]) : (H.focusD || [.5, .5]));
  const fireReady = () => { if (!readyFired) { readyFired = true; window.dispatchEvent(new Event('hero:ready')); } };

  /* ---------- chargement des images : d'abord grossier, puis de plus en plus fin ---------- */
  function load() {
    const key = wantMobile() ? 'm' : 'd';
    if (!N || key === dirKey) return;
    dirKey = key; gen++; const mine = gen;
    frames = new Array(N).fill(null); loaded = new Array(N).fill(false);
    const order = [], seen = new Set();
    [12, 6, 3, 1].forEach(st => {
      for (let i = 0; i < N; i += st) if (!seen.has(i)) { seen.add(i); order.push(i); }
      if (!seen.has(N - 1)) { seen.add(N - 1); order.push(N - 1); }
    });
    const coarse = order.filter((_, idx) => idx < Math.ceil(N / 12) + 1);
    let k = 0, active = 0, coarseDone = 0; const retried = {};
    const pump = () => {
      while (active < 6 && k < order.length) {
        const i = order[k++]; active++;
        const im = new Image(); im.decoding = 'async';
        im.onload = im.onerror = ev => {
          active--;
          if (mine !== gen) return;
          if (ev.type === 'load') { frames[i] = im; loaded[i] = true; forced = true; }
          else if (!retried[i]) {                    // une image perdue (réseau mobile) : un seul nouvel essai, plus tard
            retried[i] = true;
            setTimeout(() => { if (mine !== gen) return; const again = new Image(); again.onload = () => { frames[i] = again; loaded[i] = true; forced = true; }; again.src = pathOf(i) + '&r=1'; }, 2500);
          }
          if (coarse.includes(i)) { coarseDone++; if (coarseDone >= coarse.length) fireReady(); }
          pump();
        };
        im.src = pathOf(i);
      }
    };
    pump();
  }

  /* ---------- dessin ---------- */
  function fit() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    const r = canvas.getBoundingClientRect();
    let w = Math.max(1, Math.round(r.width * dpr)), h = Math.max(1, Math.round(r.height * dpr));
    const px = w * h, cap = 3.4e6;
    if (px > cap) { const s = Math.sqrt(cap / px); w = Math.round(w * s); h = Math.round(h * s); }
    cw = canvas.width = w; ch = canvas.height = h; forced = true;
  }
  function drawImg(im, alpha) {
    const iw = im.naturalWidth, ih = im.naturalHeight;
    if (!iw || !ih) return;
    const f = focus(), s = Math.max(cw / iw, ch / ih), dw = iw * s, dh = ih * s;
    ctx.globalAlpha = alpha;
    ctx.drawImage(im, (cw - dw) * f[0], (ch - dh) * f[1], dw, dh);
  }
  function render(p) {
    if (!ctx || !N) return;
    const t = clamp(p, 0, 1) * (N - 1);
    let a = Math.floor(t), b = Math.ceil(t);
    while (a >= 0 && !loaded[a]) a--;
    while (b < N && !loaded[b]) b++;
    if (a < 0 && b >= N) return;               // rien de chargé encore : l'image fixe reste visible
    if (a < 0) a = b; if (b >= N) b = a;
    drawImg(frames[a], 1);
    if (b !== a) { const k = (t - a) / (b - a); if (k > .002) drawImg(frames[b], clamp(k, 0, 1)); }
    ctx.globalAlpha = 1;
    if (!drawn) { drawn = true; canvas.classList.add('is-drawn'); }
  }

  /* ---------- étincelles dorées (dessinées par-dessus le film) ---------- */
  const gc = document.getElementById('glitter');
  const gx = gc && gc.getContext ? gc.getContext('2d') : null;
  let sparks = [], gw = 0, gh = 0;
  const SC = ['#FFFFFF', '#FFD6E3', '#F5DDB0', '#F4A6C3', '#E9B95B'];
  function seedGlitter() {
    if (!gc) return;
    const r = gc.getBoundingClientRect(), d = Math.min(2, window.devicePixelRatio || 1);
    gw = gc.width = Math.max(1, Math.round(r.width * d)); gh = gc.height = Math.max(1, Math.round(r.height * d));
    sparks = Array.from({ length: r.width < 700 ? 22 : 40 }, () => ({ x: Math.random(), y: Math.random(), r: 2 + Math.random() * 5, ph: Math.random() * 6.28, sp: .5 + Math.random() * 1.1, c: SC[Math.floor(Math.random() * SC.length)] }));
  }
  function drawGlitter(t, p) {
    if (!gx) return;
    gx.clearRect(0, 0, gw, gh);
    sparks.forEach(s => {
      const tw = (Math.sin(t / 1000 * s.sp * 2.2 + s.ph) + 1) / 2;
      const y = (((s.y - p * .3 * s.sp) % 1) + 1) % 1;
      const x = s.x * gw, yy = y * gh, r = s.r * (.45 + tw) * (gw / 1400 + .6);
      gx.globalAlpha = .15 + tw * .85; gx.fillStyle = s.c;
      gx.beginPath();
      for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, rr = i % 2 ? r * .22 : r; gx.lineTo(x + Math.cos(a) * rr, yy + Math.sin(a) * rr); }
      gx.closePath(); gx.fill();
    });
    gx.globalAlpha = 1;
  }

  /* ---------- progression ---------- */
  function scrollP(r) {
    const total = hero.offsetHeight - window.innerHeight;
    return total > 0 ? clamp(-r.top / total, 0, 1) : 0;
  }
  function startIntro() {
    if (!motionOn() || window.scrollY > 6 || introOn || intro >= INTRO_TO) { intro = Math.max(intro, window.scrollY > 6 ? INTRO_TO : 0); return; }
    introOn = true; introT0 = performance.now();
  }
  window.addEventListener('nn:ready', startIntro);
  window.addEventListener('scroll', () => { if (window.scrollY > 6 && introOn) { introOn = false; intro = INTRO_TO; } }, { passive: true });

  let t0 = 0;
  function frame(t) {
    requestAnimationFrame(frame);                // d'abord : une exception ne doit jamais figer la boucle
    const r = hero.getBoundingClientRect();
    const vis = r.bottom > 0 && r.top < window.innerHeight;
    if (cue) cue.classList.toggle('is-off', window.scrollY > 24);
    if (!vis || !motionOn()) return;
    if (introOn) { const k = clamp((t - introT0) / 2200, 0, 1); intro = INTRO_TO * (1 - Math.pow(1 - k, 3)); if (k >= 1) introOn = false; }
    const sp = scrollP(r);
    tgt = intro + (1 - intro) * sp;
    cur += (tgt - cur) * .14;
    if (Math.abs(tgt - cur) < .0004) cur = tgt;
    if (forced || Math.abs(cur - drawnAt) > .0002) { drawnAt = cur; forced = false; N ? render(cur) : push(cur); }
    chapters.forEach(li => li.classList.toggle('is-on', Math.abs(cur - parseFloat(li.dataset.at)) < .14));
    if (meter) meter.style.setProperty('--p', cur.toFixed(3));
    if (content) {
      const o = clamp(1 - (cur - .1) / .2, 0, 1);
      content.style.opacity = o.toFixed(3);
      content.style.transform = 'translateY(' + ((1 - o) * -36).toFixed(1) + 'px)';
      /* le titre reste dans l'arbre d'accessibilité (jamais visibility:hidden) ; seuls les boutons, devenus invisibles, sortent de l'ordre de tabulation */
      if (ctaBox) ctaBox.inert = o < .05;
      /* le voile sombre ne sert qu'à lire le titre : une fois le texte effacé, il s'allège et laisse le film rose et doré ressortir
         (la racine carrée le garde plein tant que le titre est encore bien visible) ; les légendes ont leur propre fond sombre */
      if (shade) shade.style.opacity = (.4 + .6 * Math.sqrt(o)).toFixed(3);
    }
    drawGlitter(t, cur);
  }
  /* sans images : l'image fixe avance (zoom + léger glissement) */
  function push(p) {
    if (!poster) return;
    poster.style.transform = 'scale(' + (1 + p * .42).toFixed(4) + ') translate3d(' + (-p * 4).toFixed(2) + '%,' + (-p * 3).toFixed(2) + '%,0)';
    poster.style.transformOrigin = '62% 58%';
  }

  function refresh() {
    fit(); seedGlitter(); load(); forced = true;
    if (!motionOn()) { if (poster) poster.style.transform = ''; if (content) { content.style.opacity = ''; content.style.transform = ''; } if (ctaBox) ctaBox.inert = false; if (shade) shade.style.opacity = ''; }
  }
  let rt; window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(refresh, 180); });
  window.addEventListener('orientationchange', () => setTimeout(refresh, 300));
  window.addEventListener('nn:motion', refresh);

  refresh();
  if (!N) fireReady();
  setTimeout(fireReady, 3000);                   // le chargement ne doit jamais bloquer l'accueil
  requestAnimationFrame(frame);
  window.NNHero = { refresh };
})();

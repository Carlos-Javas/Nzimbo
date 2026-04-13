/* =====================================================
   NZIMBO — GLOBAL JAVASCRIPT
   ===================================================== */
'use strict';

const LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 62.13 62.13"><rect fill="#fcfcfc" width="62.13" height="62.13" rx="17.09"/><polygon fill="none" stroke="#0c0c0c" stroke-miterlimit="10" stroke-width="2" points="19.62 47.33 23.44 47.33 23.69 21.92 39.45 42.99 39.45 47.33 44.28 47.33 44.28 37.93 47.59 37.93 47.59 33.1 44.03 33.06 44.03 28.77 47.84 28.77 47.84 23.94 44.03 23.94 44.03 14.28 39.2 14.28 39.2 23.94 39.2 35.13 31.06 23.94 23.94 14.28 18.86 14.28 18.86 23.94 14.28 23.94 14.28 29.03 19.11 29.03 19.11 33.35 14.28 33.35 14.28 38.18 19.11 38.18 19.11 46.83 19.11 47.84 19.62 47.33"/></svg>`;

document.querySelectorAll('.logo-icon').forEach(el => { el.innerHTML = LOGO_SVG; });

/* ── NAVBAR SCROLL ────────────────────────────────── */
// Injetar Syne no logo
document.querySelectorAll('.navbar-logo-text').forEach(el => el.style.fontFamily = "'Syne', sans-serif");

const navbar = document.querySelector('.navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });
}

/* ── MOBILE HAMBURGER ─────────────────────────────── */
const hamburger = document.querySelector('.hamburger');
const mobileMenu = document.querySelector('.mobile-menu');
if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open');
  });
  mobileMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
    });
  });
}

/* ── SCROLL REVEAL ────────────────────────────────── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ── COUNTER ANIMATION ────────────────────────────── */
function animateCounter(el) {
  const raw    = el.dataset.target || el.textContent;
  const suffix = raw.replace(/[\d.]/g, '');
  const target = parseFloat(raw);
  const dec    = target % 1 !== 0 ? 1 : 0;
  let start    = null;
  function step(ts) {
    if (!start) start = ts;
    const p    = Math.min((ts - start) / 1400, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    el.textContent = (target * ease).toFixed(dec) + suffix;
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { animateCounter(e.target); counterObserver.unobserve(e.target); }
  });
}, { threshold: 0.5 });
document.querySelectorAll('.stat-num[data-target]').forEach(el => counterObserver.observe(el));

/* ── RIPPLE ───────────────────────────────────────── */
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('click', function(e) {
    const rect   = btn.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.style.cssText = `position:absolute;border-radius:50%;pointer-events:none;width:8px;height:8px;left:${e.clientX-rect.left-4}px;top:${e.clientY-rect.top-4}px;background:rgba(255,255,255,0.2);transform:scale(0);animation:__ripple 0.5s ease forwards;`;
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 520);
  });
});
if (!document.getElementById('_rippleStyle')) {
  const s = document.createElement('style'); s.id = '_rippleStyle';
  s.textContent = '@keyframes __ripple{to{transform:scale(32);opacity:0;}}';
  document.head.appendChild(s);
}

/* ── PAGE TRANSITION ──────────────────────────────── */
function navigateTo(url) {
  document.body.style.transition = 'opacity 0.3s ease';
  document.body.style.opacity = '0';
  setTimeout(() => window.location.href = url, 300);
}

document.body.style.opacity = '0';
window.addEventListener('load', () => {
  document.body.style.transition = 'opacity 0.4s ease';
  document.body.style.opacity = '1';
});

/* ── SEARCH ───────────────────────────────────────── */
document.querySelectorAll('.search-input').forEach(input => {
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const q = input.value.trim();
      if (q) window.location.href = `explorar-produtos.html?q=${encodeURIComponent(q)}`;
    }
  });
});

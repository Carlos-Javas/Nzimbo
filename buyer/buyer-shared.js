/* =====================================================
   NZIMBO — BUYER SHARED JS (auth-aware)
   ===================================================== */
'use strict';

const LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 62.13 62.13"><rect fill="#fcfcfc" width="62.13" height="62.13" rx="17.09"/><polygon fill="none" stroke="#0c0c0c" stroke-miterlimit="10" stroke-width="2" points="19.62 47.33 23.44 47.33 23.69 21.92 39.45 42.99 39.45 47.33 44.28 47.33 44.28 37.93 47.59 37.93 47.59 33.1 44.03 33.06 44.03 28.77 47.84 28.77 47.84 23.94 44.03 23.94 44.03 14.28 39.2 14.28 39.2 23.94 39.2 35.13 31.06 23.94 23.94 14.28 18.86 14.28 18.86 23.94 14.28 23.94 14.28 29.03 19.11 29.03 19.11 33.35 14.28 33.35 14.28 38.18 19.11 38.18 19.11 46.83 19.11 47.84 19.62 47.33"/></svg>`;

/* ── AUTH GUARD ───────────────────────────────────── */
window.addEventListener('DOMContentLoaded', async () => {
  // Aguardar Supabase CDN
  try { await waitSB(); } catch(e) { window.location.href = '../auth/login.html'; return; }
  // Require login via Supabase
  const session = await NzimboAuth.getSession();
  if (!session) { window.location.href = '../auth/login.html'; return; }

  const profile = await NzimboAuth.getProfile();
  if (!profile) { window.location.href = '../auth/login.html'; return; }

  // Injetar logos
  document.querySelectorAll('.topbar-logo-icon, .logo-icon-wrap').forEach(el => el.innerHTML = LOGO_SVG);

  // Topbar
  const avatar = document.querySelector('.topbar-avatar');
  if (avatar) avatar.textContent = (profile.first_name?.[0]||'') + (profile.last_name?.[0]||'');
  const nameEl = document.querySelector('.topbar-user-name');
  if (nameEl) nameEl.textContent = profile.first_name + ' ' + (profile.last_name||'');
  const roleEl = document.querySelector('.topbar-user-role');
  if (roleEl) roleEl.textContent = profile.type === 'creator' ? 'Criador' : 'Comprador';

  // Build sidebar
  buildSidebar(profile);

  // Init
  initReveal();
  initCounters();
  initProgressBars();

  // Expor perfil globalmente para páginas filhas
  window._profile = profile;
});

/* ── BUILD SIDEBAR ────────────────────────────────── */
function buildSidebar(session) {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;
  const page = window.location.pathname.split('/').pop() || '';

  const links = [
    { href:'dashboard.html',             icon:'grid',        label:'Dashboard',        section:'Principal' },
    { href:'meu-perfil.html',            icon:'user',        label:'Meu Perfil',       section:'Principal' },
    { href:'meus-cursos.html',           icon:'book-open',   label:'Meus Cursos',      section:'Aprendizagem' },
    { href:'progresso.html',             icon:'activity',    label:'Progresso',        section:'Aprendizagem' },
    { href:'downloads.html',             icon:'download',    label:'Downloads',        section:'Aprendizagem', badge:'3' },
    { href:'favoritos.html',             icon:'heart',       label:'Favoritos',        section:'Aprendizagem' },
    { href:'minhas-compras.html',        icon:'shopping-bag',label:'Minhas Compras',   section:'Financeiro' },
    { href:'pagamentos.html',            icon:'credit-card', label:'Métodos de Pag.',  section:'Financeiro' },
    { href:'historico-pagamentos.html',  icon:'receipt',     label:'Histórico',        section:'Financeiro' },
    { href:'notificacoes.html',          icon:'bell',        label:'Notificações',     section:'Conta', badge:'5' },
    { href:'configuracoes.html',         icon:'settings',    label:'Configurações',    section:'Conta' },
    { href:'seguranca.html',             icon:'shield',      label:'Segurança',        section:'Conta' },
  ];

  const icons = {
    'grid':         `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`,
    'user':         `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
    'book-open':    `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>`,
    'activity':     `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
    'download':     `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
    'heart':        `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>`,
    'shopping-bag': `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>`,
    'credit-card':  `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>`,
    'receipt':      `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
    'bell':         `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>`,
    'settings':     `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>`,
    'shield':       `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  };

  let currentSection = '';
  let html = '';

  links.forEach(l => {
    if (l.section !== currentSection) {
      if (currentSection) html += `</div>`;
      html += `<div class="sidebar-section"><p class="sidebar-section-label">${l.section}</p>`;
      currentSection = l.section;
    }
    const isActive = page === l.href;
    html += `<a href="${l.href}" class="sidebar-link${isActive ? ' active' : ''}">
      <div class="sidebar-link-icon">${icons[l.icon]||''}</div>
      <span class="sidebar-link-text">${l.label}</span>
      ${l.badge ? `<span class="sidebar-badge">${l.badge}</span>` : ''}
    </a>`;
  });
  html += `</div>`;
  html += `<div class="sidebar-divider"></div>
    <div class="sidebar-bottom">
      <a href="../home.html" class="sidebar-link">
        <div class="sidebar-link-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg></div>
        <span class="sidebar-link-text">Página Inicial</span>
      </a>
      <a href="../auth/logout.html" class="sidebar-link" style="color:rgba(239,68,68,0.7);">
        <div class="sidebar-link-icon" style="color:rgba(239,68,68,0.7);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg></div>
        <span class="sidebar-link-text">Sair</span>
      </a>
    </div>`;

  sidebar.innerHTML = html;
}

/* ── TABS ─────────────────────────────────────────── */
function switchTab(id, btn) {
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(id)?.classList.add('active');
  btn.classList.add('active');
}

/* ── SCROLL REVEAL ────────────────────────────────── */
function initReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}

/* ── COUNTERS ─────────────────────────────────────── */
function initCounters() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const raw = el.dataset.count || el.textContent;
      const suffix = raw.replace(/[\d.,]/g,'');
      const target = parseFloat(raw.replace(/[^0-9.]/g,''));
      const dec = target % 1 !== 0 ? 1 : 0;
      let start = null;
      const step = ts => { if (!start) start=ts; const p=Math.min((ts-start)/1100,1); const ease=1-Math.pow(1-p,3); el.textContent=(target*ease).toFixed(dec)+suffix; if(p<1)requestAnimationFrame(step); };
      requestAnimationFrame(step); obs.unobserve(el);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('[data-count]').forEach(el => obs.observe(el));
}

/* ── PROGRESS BARS ────────────────────────────────── */
function initProgressBars() {
  setTimeout(() => {
    document.querySelectorAll('.progress-fill[data-width]').forEach(bar => {
      bar.style.width = bar.dataset.width;
    });
  }, 300);
}

/* ── TOAST ────────────────────────────────────────── */
function showToast(msg, type) {
  type = type || 'info';
  const colors = {
    success:['#0a1f0a','rgba(34,197,94,0.3)','#86efac'],
    error:  ['#1f0a0a','rgba(239,68,68,0.3)','#fca5a5'],
    info:   ['#1a1a1a','rgba(255,255,255,0.12)','#fff'],
    warning:['#1a1200','rgba(245,166,35,0.3)','#fde68a']
  };
  const [bg,border,color] = colors[type]||colors.info;
  const t = document.createElement('div');
  t.style.cssText = `position:fixed;bottom:24px;right:24px;background:${bg};border:1px solid ${border};color:${color};padding:13px 20px;border-radius:12px;font-size:14px;font-weight:500;z-index:9999;max-width:340px;box-shadow:0 8px 32px rgba(0,0,0,0.5);font-family:inherit;transform:translateY(12px);opacity:0;transition:all 0.3s cubic-bezier(0.16,1,0.3,1);`;
  t.textContent = msg;
  document.body.appendChild(t);
  requestAnimationFrame(() => { t.style.transform='translateY(0)'; t.style.opacity='1'; });
  setTimeout(() => { t.style.transform='translateY(12px)'; t.style.opacity='0'; setTimeout(()=>t.remove(),320); }, 3000);
}

/* ── MOBILE SIDEBAR ───────────────────────────────── */
const menuBtn = document.getElementById('mobileMenuBtn');
if (menuBtn) menuBtn.addEventListener('click',()=>document.getElementById('sidebar')?.classList.toggle('mobile-open'));

/* ── RIPPLE ───────────────────────────────────────── */
document.addEventListener('click', e => {
  const btn = e.target.closest('.btn');
  if (!btn) return;
  const rect = btn.getBoundingClientRect();
  const r = document.createElement('span');
  r.style.cssText = `position:absolute;border-radius:50%;pointer-events:none;width:8px;height:8px;transform:scale(0);left:${e.clientX-rect.left-4}px;top:${e.clientY-rect.top-4}px;background:rgba(255,255,255,0.15);animation:_rpl .45s ease forwards;`;
  btn.style.position='relative'; btn.style.overflow='hidden';
  btn.appendChild(r); setTimeout(()=>r.remove(),460);
});
if (!document.getElementById('_rs')) {
  const s=document.createElement('style');s.id='_rs';
  s.textContent='@keyframes _rpl{to{transform:scale(28);opacity:0;}}';
  document.head.appendChild(s);
}

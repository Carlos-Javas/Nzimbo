/* =====================================================
   NZIMBO — NAVBAR & FOOTER BUILDER (auth-aware)
   ===================================================== */

function buildNav(activePage) {
  activePage = activePage || '';
  const nav = document.getElementById('navbar');
  if (!nav) return;

  // Check if user is logged in
  const session = (window.NzimboAuth && NzimboAuth.getSession()) ||
    (() => { try { return JSON.parse(sessionStorage.getItem('nzimbo_session') || localStorage.getItem('nzimbo_session')); } catch { return null; } })();

  let rightHtml = '';
  if (session) {
    rightHtml = `
      <div class="navbar-actions">
        <a href="buyer/dashboard.html" class="btn btn-dark btn-sm" style="display:flex;align-items:center;gap:7px;">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          Dashboard
        </a>
        <div class="navbar-avatar-wrap" style="display:flex;align-items:center;gap:8px;cursor:pointer;" onclick="window.location.href='buyer/dashboard.html'">
          <div style="width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#F5A623,#D4891A);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;color:#0c0c0c;">${session.avatar || 'U'}</div>
        </div>
      </div>`;
  } else {
    rightHtml = `
      <div class="navbar-actions">
        <a href="auth/login.html" class="btn btn-outline btn-sm">Entrar</a>
        <a href="auth/register.html" class="btn btn-gold btn-sm">Criar conta</a>
      </div>`;
  }

  nav.innerHTML = `
    <div class="navbar-inner">
      <a href="home.html" class="navbar-logo">
        <div class="navbar-logo-icon logo-icon"></div>
        <span class="navbar-logo-text">Nzimbo</span>
      </a>
      <nav class="navbar-links">
        <a href="home.html" ${activePage==='home'?'class="active"':''}>Início</a>
        <a href="explorar-cursos.html" ${activePage==='cursos'?'class="active"':''}>Cursos</a>
        <a href="explorar-produtos.html" ${activePage==='produtos'?'class="active"':''}>Produtos Digitais</a>
        <a href="como-funciona.html" ${activePage==='como'?'class="active"':''}>Como funciona</a>
        <a href="blog.html" ${activePage==='blog'?'class="active"':''}>Blog</a>
      </nav>
      ${rightHtml}
      <button class="hamburger" aria-label="Menu">
        <span></span><span></span><span></span>
      </button>
    </div>
    <div class="mobile-menu">
      <a href="home.html">Início</a>
      <a href="explorar-cursos.html">Cursos</a>
      <a href="explorar-produtos.html">Produtos Digitais</a>
      <a href="como-funciona.html">Como funciona</a>
      <a href="blog.html">Blog</a>
      <a href="faq.html">FAQ</a>
      <a href="sobre.html">Sobre</a>
      <div class="mobile-btns">
        ${session
          ? `<a href="buyer/dashboard.html" class="btn btn-gold">Dashboard</a>
             <a href="auth/logout.html" class="btn btn-outline">Sair</a>`
          : `<a href="auth/login.html" class="btn btn-outline">Entrar</a>
             <a href="auth/register.html" class="btn btn-gold">Criar conta grátis</a>`
        }
      </div>
    </div>
  `;
}

function buildFooter() {
  const footer = document.getElementById('footer');
  if (!footer) return;
  footer.innerHTML = `
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <div class="logo">
            <div class="logo-icon" style="width:36px;height:36px;border-radius:9px;background:#fcfcfc;display:flex;align-items:center;justify-content:center;"></div>
            <span class="logo-text" style="font-size:18px;font-weight:800;">Nzimbo</span>
          </div>
          <p>A plataforma digital de Angola para aprender, criar e monetizar conhecimento.</p>
          <div class="footer-socials" style="margin-top:20px;">
            <a href="#" class="social-link" aria-label="Instagram">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>
            </a>
            <a href="#" class="social-link" aria-label="Facebook">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
            </a>
            <a href="#" class="social-link" aria-label="LinkedIn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
            </a>
            <a href="#" class="social-link" aria-label="YouTube">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 001.46 6.42 29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="currentColor" stroke="none"/></svg>
            </a>
          </div>
        </div>
        <div class="footer-col">
          <h5>Plataforma</h5>
          <a href="explorar-cursos.html">Explorar cursos</a>
          <a href="explorar-produtos.html">Produtos digitais</a>
          <a href="como-funciona.html">Como funciona</a>
          <a href="sobre.html">Sobre a Nzimbo</a>
          <a href="blog.html">Blog</a>
        </div>
        <div class="footer-col">
          <h5>Suporte</h5>
          <a href="faq.html">FAQ</a>
          <a href="contacto.html">Contacto</a>
          <a href="politica-reembolso.html">Política de reembolso</a>
          <a href="termos.html">Termos de uso</a>
          <a href="privacidade.html">Privacidade</a>
        </div>
        <div class="footer-col">
          <h5>Criadores</h5>
          <a href="auth/register.html">Tornar-me criador</a>
          <a href="como-funciona.html">Como vender</a>
          <a href="faq.html">FAQ Criadores</a>
          <a href="contacto.html">Parceria</a>
        </div>
      </div>
      <div class="footer-bottom">
        <p>© 2025 Nzimbo. Todos os direitos reservados. 🇦🇴 Feito em Angola.</p>
        <div style="display:flex;gap:16px;font-size:13px;color:var(--grey);">
          <a href="termos.html" style="color:var(--grey);">Termos</a>
          <a href="privacidade.html" style="color:var(--grey);">Privacidade</a>
          <a href="politica-reembolso.html" style="color:var(--grey);">Reembolso</a>
        </div>
      </div>
    </div>
  `;
  document.querySelectorAll('.logo-icon').forEach(el => { if(typeof LOGO_SVG !== 'undefined') el.innerHTML = LOGO_SVG; });
}

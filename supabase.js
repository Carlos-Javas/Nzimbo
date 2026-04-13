/* ═══════════════════════════════════════════════════════════
   NZIMBO — SUPABASE CLIENT
   ⚠️  CONFIGURA AS TUAS CREDENCIAIS ABAIXO
   ═══════════════════════════════════════════════════════════ */

const SUPABASE_URL  = 'https://nrkcuibxslpevcexteoo.supabase.co';   // ← substitui
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ya2N1aWJ4c2xwZXZjZXh0ZW9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzOTYzMDUsImV4cCI6MjA5MDk3MjMwNX0.Q6YivwsvqU87RV5fulNRJQTlY2WnoaQodGzzoABadkE';                 // ← substitui

/* ── Inicialização segura (aguarda CDN) ─────────────────── */
let _sb;

(function initSB() {
  if (typeof supabase === 'undefined') {
    // CDN ainda não carregou — tentar de novo em 50ms
    return setTimeout(initSB, 50);
  }
  _sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON, {
    auth: {
      persistSession:     true,
      autoRefreshToken:   true,
      detectSessionInUrl: true,
    }
  });
  window._sb = _sb;

  // Criar perfil para OAuth se não existir
  _sb.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' && session) {
      try {
        const { data: ex } = await _sb
          .from('profiles').select('id').eq('id', session.user.id).maybeSingle();
        if (!ex) {
          const m = session.user.user_metadata || {};
          const name = m.full_name || m.name || '';
          const parts = name.trim().split(' ');
          await _sb.from('profiles').insert({
            id:            session.user.id,
            first_name:    parts[0] || 'Utilizador',
            last_name:     parts.slice(1).join(' ') || '',
            type:          'buyer',
            storage_used:  0,
            storage_limit: 6442450944
          });
        }
      } catch(e) { /* ignorar */ }
    }
  });
})();

/* ── Helpers ────────────────────────────────────────────── */
function sbErr(error) {
  if (!error) return null;
  const msg = error.message || error.error_description || String(error);
  const map = {
    'Invalid login credentials':              'Email ou senha incorretos.',
    'Email not confirmed':                    'Email not confirmed',
    'User already registered':               'Este email já está registado. Tenta iniciar sessão.',
    'Password should be at least 6 characters': 'A senha deve ter pelo menos 6 caracteres.',
    'signup is disabled':                     'O registo está temporariamente desativado.',
    'Email rate limit exceeded':              'Demasiadas tentativas. Aguarda alguns minutos.',
    'over_email_send_rate_limit':             'Demasiados emails enviados. Aguarda 1 minuto.',
    'For security purposes':                  'Por segurança, aguarda alguns segundos antes de tentar novamente.',
  };
  for (const [key, val] of Object.entries(map)) {
    if (msg.includes(key)) return new Error(val);
  }
  return new Error(msg);
}
window.sbErr = sbErr;

/* ── Aguardar _sb estar pronto ───────────────────────────── */
function waitSB(timeout) {
  timeout = timeout || 5000;
  return new Promise((resolve, reject) => {
    if (_sb) return resolve(_sb);
    const start = Date.now();
    const iv = setInterval(() => {
      if (_sb) { clearInterval(iv); resolve(_sb); }
      else if (Date.now() - start > timeout) {
        clearInterval(iv);
        reject(new Error('Não foi possível ligar ao servidor. Verifica a tua ligação à internet.'));
      }
    }, 50);
  });
}
window.waitSB = waitSB;

/* ── OAuth helpers ───────────────────────────────────────── */
async function signInWithGoogle() {
  const sb = await waitSB();
  const { data, error } = await sb.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin + '/auth/oauth-callback.html' }
  });
  if (error) throw sbErr(error);
  return data;
}

async function signInWithFacebook() {
  const sb = await waitSB();
  const { data, error } = await sb.auth.signInWithOAuth({
    provider: 'facebook',
    options: { redirectTo: window.location.origin + '/auth/oauth-callback.html' }
  });
  if (error) throw sbErr(error);
  return data;
}

window.signInWithGoogle   = signInWithGoogle;
window.signInWithFacebook = signInWithFacebook;

/* ── Session helpers ─────────────────────────────────────── */
async function getSession() {
  const sb = await waitSB();
  const { data } = await sb.auth.getSession();
  return data.session;
}

async function getProfile(userId) {
  const sb = await waitSB();
  if (!userId) {
    const { data } = await sb.auth.getSession();
    if (!data.session) return null;
    userId = data.session.user.id;
  }
  const { data } = await sb.from('profiles').select('*').eq('id', userId).single();
  return data;
}

window.getSession = getSession;
window.getProfile = getProfile;

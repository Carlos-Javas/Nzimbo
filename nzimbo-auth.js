/* ═══════════════════════════════════════════════════════════
   NZIMBO — AUTH  (Supabase Auth)
   ═══════════════════════════════════════════════════════════ */
'use strict';

const NzimboAuth = {

  async _sb() { return waitSB(); },

  async register({ firstName, lastName, email, phone, password, type }) {
    const sb = await waitSB();
    const { data, error } = await sb.auth.signUp({
      email, password,
      options: {
        data: { first_name: firstName, last_name: lastName||'', type: type||'buyer' },
        emailRedirectTo: window.location.origin + '/auth/confirmar-email.html'
      }
    });
    if (error) throw sbErr(error);

    // Criar perfil imediatamente (não depender apenas do trigger)
    if (data.user) {
      const profileData = {
        id:            data.user.id,
        first_name:    firstName,
        last_name:     lastName || '',
        phone:         phone || '',
        type:          type || 'buyer',
        storage_used:  0,
        storage_limit: 6442450944
      };
      // upsert para não falhar se o trigger já criou
      await sb.from('profiles').upsert(profileData, { onConflict: 'id' });
    }
    return data;
  },

  async login(email, password) {
    const sb = await waitSB();
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw sbErr(error);
    return data;
  },

  async logout() {
    const sb = await waitSB();
    await sb.auth.signOut();
  },

  async getSession() {
    const sb = await waitSB();
    const { data } = await sb.auth.getSession();
    return data.session;
  },

  async getUser() {
    const sb = await waitSB();
    const { data } = await sb.auth.getUser();
    return data.user;
  },

  async getProfile() {
    const sb = await waitSB();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return null;
    let { data } = await sb.from('profiles').select('*').eq('id', user.id).maybeSingle();
    // Fallback: criar perfil se não existir (caso o trigger SQL não esteja activo)
    if (!data) {
      const m = user.user_metadata || {};
      const insertData = {
        id:            user.id,
        first_name:    m.first_name || m.full_name?.split(' ')[0] || 'Utilizador',
        last_name:     m.last_name  || m.full_name?.split(' ').slice(1).join(' ') || '',
        type:          m.type || 'buyer',
        storage_used:  0,
        storage_limit: 6442450944
      };
      const { data: created } = await sb.from('profiles').insert(insertData).select().single();
      data = created;
    }
    return data;
  },

  isLoggedIn() {
    // Verificação rápida síncrona via localStorage
    try {
      const keys = Object.keys(localStorage);
      return keys.some(k => k.includes('supabase') && (k.includes('auth') || k.includes('token')));
    } catch { return false; }
  },

  async requireAuth(loginUrl) {
    const session = await this.getSession();
    if (!session) {
      window.location.href = loginUrl || '../auth/login.html';
      return null;
    }
    return session;
  },

  async updateProfile(fields) {
    const sb = await waitSB();
    const user = await this.getUser();
    if (!user) return false;
    const { error } = await sb.from('profiles')
      .update({ ...fields, updated_at: new Date().toISOString() })
      .eq('id', user.id);
    return !error;
  },

  async changePassword(newPassword) {
    const sb = await waitSB();
    const { error } = await sb.auth.updateUser({ password: newPassword });
    if (error) throw sbErr(error);
  },

  async resetPassword(email) {
    const sb = await waitSB();
    const { error } = await sb.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/auth/nova-senha.html'
    });
    if (error) throw sbErr(error);
  },

  async getStorageInfo() {
    const p = await this.getProfile();
    if (!p) return null;
    const used  = p.storage_used  || 0;
    const limit = p.storage_limit || 6442450944;
    return {
      used, limit,
      pct:      Math.round((used / limit) * 100),
      usedGB:   (used  / 1073741824).toFixed(2),
      limitGB:  (limit / 1073741824).toFixed(0),
      remaining: limit - used,
      plan: p.plan || 'free'
    };
  },

  async useStorage(bytes) {
    const sb = await waitSB();
    const user = await this.getUser();
    if (!user) return false;
    const p = await this.getProfile();
    const newUsed = (p.storage_used || 0) + bytes;
    if (newUsed > (p.storage_limit || 6442450944)) {
      throw new Error('Limite de 6GB atingido. Actualiza o teu plano em Configurações.');
    }
    await sb.from('profiles').update({ storage_used: newUsed }).eq('id', user.id);
    return true;
  },

  async freeStorage(bytes) {
    const sb = await waitSB();
    const user = await this.getUser();
    if (!user) return;
    const p = await this.getProfile();
    await sb.from('profiles')
      .update({ storage_used: Math.max(0, (p.storage_used||0) - bytes) })
      .eq('id', user.id);
  }
};

window.NzimboAuth = NzimboAuth;

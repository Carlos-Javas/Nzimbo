/* =====================================================
   NZIMBO — AUTH GLOBAL JS (usa NzimboAuth)
   ===================================================== */
'use strict';

const LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 62.13 62.13"><rect fill="#fcfcfc" width="62.13" height="62.13" rx="17.09"/><polygon fill="none" stroke="#0c0c0c" stroke-miterlimit="10" stroke-width="2" points="19.62 47.33 23.44 47.33 23.69 21.92 39.45 42.99 39.45 47.33 44.28 47.33 44.28 37.93 47.59 37.93 47.59 33.1 44.03 33.06 44.03 28.77 47.84 28.77 47.84 23.94 44.03 23.94 44.03 14.28 39.2 14.28 39.2 23.94 39.2 35.13 31.06 23.94 23.94 14.28 18.86 14.28 18.86 23.94 14.28 23.94 14.28 29.03 19.11 29.03 19.11 33.35 14.28 33.35 14.28 38.18 19.11 38.18 19.11 46.83 19.11 47.84 19.62 47.33"/></svg>`;

document.querySelectorAll('.logo-icon').forEach(el => { el.innerHTML = LOGO_SVG; });

window.addEventListener('load', () => document.body.classList.add('loaded'));

function navigateTo(url, delay) {
  delay = delay || 320;
  document.body.classList.add('leaving');
  setTimeout(() => window.location.href = url, delay);
}

/* ── VALIDATION ───────────────────────────────────── */
const Validate = {
  email(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()); },
  phone(v) { return /^(\+244|244|9)\d{8,9}$/.test(v.replace(/\s/g,'')); },
  password(v) { return v.length >= 8; },
  name(v) { return v.trim().length >= 2; },
  required(v) { return v.trim().length > 0; },
};

function setFieldError(input, msg) {
  input.classList.remove('is-success');
  input.classList.add('is-error');
  const existing = input.closest('.form-group')?.querySelector('.form-msg');
  if (existing) existing.remove();
  const el = document.createElement('div');
  el.className = 'form-msg error';
  el.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>${msg}`;
  input.closest('.form-group')?.appendChild(el);
}

function setFieldOk(input) {
  input.classList.remove('is-error');
  input.classList.add('is-success');
  const existing = input.closest('.form-group')?.querySelector('.form-msg');
  if (existing) existing.remove();
}

function clearField(input) {
  input.classList.remove('is-error','is-success');
  input.closest('.form-group')?.querySelector('.form-msg')?.remove();
}

/* ── PASSWORD STRENGTH ────────────────────────────── */
function checkPasswordStrength(password) {
  let score = 0;
  if (password.length >= 8)  score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 1) return 'weak';
  if (score <= 3) return 'medium';
  return 'strong';
}

function renderStrength(bars, label, password) {
  if (!bars || !label) return;
  const strength = password ? checkPasswordStrength(password) : '';
  const levels = { weak:1, medium:3, strong:5 };
  const labels = { weak:'Fraca', medium:'Média', strong:'Forte' };
  bars.forEach((bar, i) => {
    bar.className = 'pwd-bar' + (strength && i < levels[strength] ? ` ${strength}` : '');
  });
  label.textContent = strength ? labels[strength] : '';
  label.className = `pwd-label ${strength}`;
}

/* ── PASSWORD TOGGLE ──────────────────────────────── */
function initPasswordToggles() {
  document.querySelectorAll('.form-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.closest('.form-field')?.querySelector('.form-input');
      if (!input) return;
      const isText = input.type === 'text';
      input.type = isText ? 'password' : 'text';
      btn.innerHTML = isText
        ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`
        : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;
    });
  });
}

function setButtonLoading(btn, loading) {
  if (loading) {
    btn.disabled = true;
    btn._original = btn.innerHTML;
    btn.innerHTML = `<div class="btn-spinner"></div>A processar...`;
  } else {
    btn.disabled = false;
    btn.innerHTML = btn._original || btn.innerHTML;
  }
}

function showAlert(container, type, msg) {
  if (!container) return;
  const icons = {
    error:   `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
    success: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>`,
    info:    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
  };
  container.querySelector('.auth-alert')?.remove();
  const el = document.createElement('div');
  el.className = `auth-alert ${type}`;
  el.innerHTML = `${icons[type]||''}<span>${msg}</span>`;
  container.prepend(el);
  setTimeout(() => el.remove(), 6000);
}

function initOtpInputs() {
  const inputs = [...document.querySelectorAll('.otp-input')];
  inputs.forEach((inp, i) => {
    inp.addEventListener('input', e => {
      const val = e.target.value.replace(/\D/g,'');
      e.target.value = val.slice(-1);
      if (val && i < inputs.length-1) inputs[i+1].focus();
      e.target.classList.toggle('filled', !!e.target.value);
      const code = inputs.map(i=>i.value).join('');
      const btn = document.getElementById('otpSubmit');
      if (btn) btn.disabled = code.length !== inputs.length;
    });
    inp.addEventListener('keydown', e => {
      if (e.key==='Backspace' && !e.target.value && i>0) inputs[i-1].focus();
    });
    inp.addEventListener('paste', e => {
      e.preventDefault();
      const pasted = e.clipboardData.getData('text').replace(/\D/g,'').slice(0,inputs.length);
      pasted.split('').forEach((ch,j)=>{ if(inputs[i+j]){inputs[i+j].value=ch;inputs[i+j].classList.add('filled');} });
      inputs[Math.min(i+pasted.length, inputs.length-1)].focus();
    });
  });
}

function startResendCountdown(btnId, seconds) {
  seconds = seconds || 60;
  const btn = document.getElementById(btnId);
  if (!btn) return;
  btn.disabled = true;
  let remaining = seconds;
  btn.textContent = `Reenviar em ${remaining}s`;
  const interval = setInterval(() => {
    remaining--;
    btn.textContent = remaining > 0 ? `Reenviar em ${remaining}s` : 'Reenviar código';
    if (remaining <= 0) { btn.disabled = false; clearInterval(interval); }
  }, 1000);
}

/* ── RIPPLE ───────────────────────────────────────── */
document.addEventListener('click', e => {
  const btn = e.target.closest('.btn-auth');
  if (!btn || btn.disabled) return;
  const r = btn.getBoundingClientRect();
  const rip = document.createElement('span');
  rip.style.cssText = `position:absolute;width:8px;height:8px;border-radius:50%;background:rgba(255,255,255,0.18);pointer-events:none;left:${e.clientX-r.left-4}px;top:${e.clientY-r.top-4}px;transform:scale(0);animation:_rpl .5s ease forwards;`;
  btn.appendChild(rip);
  setTimeout(() => rip.remove(), 520);
});
const _s = document.createElement('style');
_s.textContent = '@keyframes _rpl{to{transform:scale(28);opacity:0;}}';
document.head.appendChild(_s);

/* ── INIT ─────────────────────────────────────────── */
initPasswordToggles();

/**
 * BLACK & GOLD LUXURY PORTAL
 * Supabase Authentication & Session Management
 */

(function () {
  'use strict';

  // ==========================================
  // 1. SUPABASE CLIENT INIT
  // ==========================================
  const SUPABASE_URL            = window.__ENV__?.SUPABASE_URL;
  const SUPABASE_PUBLISHABLE_KEY = window.__ENV__?.SUPABASE_PUBLISHABLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY ||
      SUPABASE_URL.includes('your-project-id') ||
      SUPABASE_PUBLISHABLE_KEY.includes('sb_publishable_xxx')) {
    console.error(
      '[Portal] Supabase credentials are not configured.\n' +
      'Open env.js and replace SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY with your project values.\n' +
      'Find them at: Dashboard → your project → Settings → API Keys'
    );
  }

  const { createClient } = supabase;
  const sb = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

  // ==========================================
  // 2. DOM ELEMENTS
  // ==========================================
  const authScreen       = document.getElementById('auth-screen');
  const dashboardScreen  = document.getElementById('dashboard-screen');

  // Tabs & Forms
  const tabLogin         = document.getElementById('tab-login');
  const tabRegister      = document.getElementById('tab-register');
  const tabSlider        = document.getElementById('tab-slider');
  const loginForm        = document.getElementById('login-form');
  const registerForm     = document.getElementById('register-form');
  const linkToRegister   = document.getElementById('link-to-register');
  const linkToLogin      = document.getElementById('link-to-login');

  // Login inputs & error elements
  const loginEmail        = document.getElementById('login-email');
  const loginPassword     = document.getElementById('login-password');
  const loginEmailError   = document.getElementById('login-email-error');
  const loginPasswordError = document.getElementById('login-password-error');

  // Register inputs & error elements
  const regName          = document.getElementById('reg-name');
  const regEmail         = document.getElementById('reg-email');
  const regPassword      = document.getElementById('reg-password');
  const regConfirm       = document.getElementById('reg-confirm');
  const regNameError     = document.getElementById('reg-name-error');
  const regEmailError    = document.getElementById('reg-email-error');
  const regPasswordError = document.getElementById('reg-password-error');
  const regConfirmError  = document.getElementById('reg-confirm-error');

  // Strength & Match
  const regMeterFill     = document.getElementById('reg-meter-fill');
  const regMeterStatus   = document.getElementById('reg-meter-status');
  const regMatchBadge    = document.getElementById('reg-match-badge');

  // Dashboard & Profile
  const welcomeName         = document.getElementById('welcome-name');
  const avatarText          = document.getElementById('avatar-text');
  const navUserName         = document.getElementById('nav-user-name');
  const profileBtn          = document.getElementById('profile-btn');
  const dropdownMenu        = document.getElementById('dropdown-menu');
  const dropdownFullName    = document.getElementById('dropdown-full-name');
  const dropdownUserEmail   = document.getElementById('dropdown-user-email');
  const btnOpenPasswordModal = document.getElementById('btn-open-password-modal');
  const btnLogout           = document.getElementById('btn-logout');

  // Password Change Modal
  const passwordModal          = document.getElementById('password-modal');
  const btnCloseModal          = document.getElementById('btn-close-modal');
  const btnCancelModal         = document.getElementById('btn-cancel-modal');
  const passwordChangeForm     = document.getElementById('password-change-form');
  const currentPasswordInput   = document.getElementById('current-password');
  const newPasswordInput       = document.getElementById('new-password');
  const confirmNewPasswordInput = document.getElementById('confirm-new-password');
  const currentPasswordError   = document.getElementById('current-password-error');
  const newPasswordError       = document.getElementById('new-password-error');
  const confirmNewPasswordError = document.getElementById('confirm-new-password-error');
  const cpMeterFill            = document.getElementById('cp-meter-fill');
  const cpMeterStatus          = document.getElementById('cp-meter-status');
  const cpMatchBadge           = document.getElementById('cp-match-badge');

  const toastContainer = document.getElementById('toast-container');

  // ==========================================
  // 3. TOAST NOTIFICATIONS
  // ==========================================
  function showToast(message, type = 'info') {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-12px)';
      setTimeout(() => {
        if (toast.parentElement) toast.parentElement.removeChild(toast);
      }, 250);
    }, 3500);
  }

  // ==========================================
  // 4. VALIDATION UTILITIES
  // ==========================================
  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim().toLowerCase());
  }

  function setFieldError(input, errorEl, message) {
    const field = input ? input.closest('.field') : null;
    if (message) {
      if (field) field.classList.add('has-error');
      if (errorEl) errorEl.textContent = message;
    } else {
      if (field) field.classList.remove('has-error');
      if (errorEl) errorEl.textContent = '';
    }
  }

  // Password Visibility Toggle
  document.querySelectorAll('.toggle-eye').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = document.getElementById(btn.getAttribute('data-target'));
      if (input) input.type = input.type === 'password' ? 'text' : 'password';
    });
  });

  // ==========================================
  // 5. REAL-TIME PASSWORD STRENGTH & MATCH
  // ==========================================
  function checkPasswordStrength(password) {
    const hasLen     = password.length >= 6;
    const hasMix     = /[a-zA-Z]/.test(password) && /[0-9!@#$%^&*]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password) && password.length >= 8;
    let score = 0;
    if (hasLen) score++;
    if (hasMix) score++;
    if (hasSpecial) score++;
    return { score };
  }

  function applyStrength(meterFill, meterStatus, password) {
    if (!meterFill || !meterStatus) return;
    const { score } = checkPasswordStrength(password);
    meterFill.className = 'meter-bar-fill';
    meterStatus.className = 'meter-status';
    if (!password) {
      meterStatus.textContent = 'Too short';
    } else if (score === 1) {
      meterFill.classList.add('weak');
      meterStatus.classList.add('weak');
      meterStatus.textContent = 'Weak';
    } else if (score === 2) {
      meterFill.classList.add('medium');
      meterStatus.classList.add('medium');
      meterStatus.textContent = 'Good';
    } else {
      meterFill.classList.add('strong');
      meterStatus.classList.add('strong');
      meterStatus.textContent = 'Strong';
    }
  }

  if (regPassword) {
    regPassword.addEventListener('input', () => {
      applyStrength(regMeterFill, regMeterStatus, regPassword.value);
      checkRegisterMatch();
    });
  }

  function checkRegisterMatch() {
    if (!regPassword || !regConfirm || !regMatchBadge) return;
    if (regPassword.value && regConfirm.value && regPassword.value === regConfirm.value) {
      regMatchBadge.classList.remove('hidden');
    } else {
      regMatchBadge.classList.add('hidden');
    }
  }

  if (regConfirm) regConfirm.addEventListener('input', checkRegisterMatch);

  if (newPasswordInput) {
    newPasswordInput.addEventListener('input', () => {
      applyStrength(cpMeterFill, cpMeterStatus, newPasswordInput.value);
      checkChangePasswordMatch();
    });
  }

  function checkChangePasswordMatch() {
    if (!newPasswordInput || !confirmNewPasswordInput || !cpMatchBadge) return;
    if (newPasswordInput.value && confirmNewPasswordInput.value &&
        newPasswordInput.value === confirmNewPasswordInput.value) {
      cpMatchBadge.classList.remove('hidden');
    } else {
      cpMatchBadge.classList.add('hidden');
    }
  }

  if (confirmNewPasswordInput) {
    confirmNewPasswordInput.addEventListener('input', checkChangePasswordMatch);
  }

  // Clear field errors on input
  [
    [loginEmail, loginEmailError],
    [loginPassword, loginPasswordError],
    [regName, regNameError],
    [regEmail, regEmailError],
    [regPassword, regPasswordError],
    [regConfirm, regConfirmError],
    [currentPasswordInput, currentPasswordError],
    [newPasswordInput, newPasswordError],
    [confirmNewPasswordInput, confirmNewPasswordError],
  ].forEach(([input, errorEl]) => {
    if (input && errorEl) {
      input.addEventListener('input', () => {
        if (errorEl.textContent) setFieldError(input, errorEl, '');
      });
    }
  });

  // ==========================================
  // 6. TABS SWITCHING
  // ==========================================
  function showTab(tab) {
    if (tab === 'register') {
      tabRegister.classList.add('active');
      tabLogin.classList.remove('active');
      tabSlider.style.transform = 'translateX(100%)';
      registerForm.classList.add('active');
      loginForm.classList.remove('active');
      if (regName) regName.focus();
    } else {
      tabLogin.classList.add('active');
      tabRegister.classList.remove('active');
      tabSlider.style.transform = 'translateX(0%)';
      loginForm.classList.add('active');
      registerForm.classList.remove('active');
      if (loginEmail) loginEmail.focus();
    }
  }

  if (tabLogin) tabLogin.addEventListener('click', () => showTab('login'));
  if (tabRegister) tabRegister.addEventListener('click', () => showTab('register'));
  if (linkToRegister) linkToRegister.addEventListener('click', (e) => { e.preventDefault(); showTab('register'); });
  if (linkToLogin) linkToLogin.addEventListener('click', (e) => { e.preventDefault(); showTab('login'); });

  // ==========================================
  // 7. LOADING STATE HELPERS
  // ==========================================
  function setLoading(btn, loading) {
    if (!btn) return;
    btn.disabled = loading;
    btn.querySelector('span').textContent = loading
      ? 'Please wait…'
      : btn.id === 'btn-login' ? 'Sign In'
      : btn.id === 'btn-register' ? 'Create Account'
      : 'Update Password';
  }

  // ==========================================
  // 8. USER REGISTRATION (SUPABASE)
  // ==========================================
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name     = regName.value.trim();
      const email    = regEmail.value.trim();
      const password = regPassword.value;
      const confirm  = regConfirm.value;
      let hasError   = false;

      if (!name) {
        setFieldError(regName, regNameError, 'Full name is required');
        hasError = true;
      } else {
        setFieldError(regName, regNameError, '');
      }

      if (!email) {
        setFieldError(regEmail, regEmailError, 'Email address is required');
        hasError = true;
      } else if (!validateEmail(email)) {
        setFieldError(regEmail, regEmailError, 'Enter a valid email address');
        hasError = true;
      } else {
        setFieldError(regEmail, regEmailError, '');
      }

      if (!password) {
        setFieldError(regPassword, regPasswordError, 'Password is required');
        hasError = true;
      } else if (password.length < 6) {
        setFieldError(regPassword, regPasswordError, 'Password must be at least 6 characters');
        hasError = true;
      } else {
        setFieldError(regPassword, regPasswordError, '');
      }

      if (!confirm) {
        setFieldError(regConfirm, regConfirmError, 'Please confirm your password');
        hasError = true;
      } else if (confirm !== password) {
        setFieldError(regConfirm, regConfirmError, 'Passwords do not match');
        hasError = true;
      } else {
        setFieldError(regConfirm, regConfirmError, '');
      }

      if (hasError) return;

      const btnRegister = document.getElementById('btn-register');
      setLoading(btnRegister, true);

      const { data, error } = await sb.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
        },
      });

      setLoading(btnRegister, false);

      if (error) {
        // Common Supabase error messages → user-friendly text
        if (error.message.includes('already registered') || error.status === 422) {
          setFieldError(regEmail, regEmailError, 'An account with this email already exists');
          showToast('Email already registered. Please sign in.', 'error');
        } else {
          showToast(error.message, 'error');
        }
        return;
      }

      // Supabase may require email confirmation depending on project settings.
      // If email confirmation is OFF, the session is returned immediately.
      if (data.session) {
        registerForm.reset();
        renderLoggedIn(data.user);
        showToast(`Account created! Welcome, ${name} ✨`, 'success');
      } else {
        // Email confirmation required
        registerForm.reset();
        showToast('Account created! Please check your email to confirm.', 'success');
      }
    });
  }

  // ==========================================
  // 9. USER LOGIN (SUPABASE)
  // ==========================================
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email    = loginEmail.value.trim();
      const password = loginPassword.value;
      let hasError   = false;

      if (!email) {
        setFieldError(loginEmail, loginEmailError, 'Email address is required');
        hasError = true;
      } else if (!validateEmail(email)) {
        setFieldError(loginEmail, loginEmailError, 'Enter a valid email address');
        hasError = true;
      } else {
        setFieldError(loginEmail, loginEmailError, '');
      }

      if (!password) {
        setFieldError(loginPassword, loginPasswordError, 'Password is required');
        hasError = true;
      } else {
        setFieldError(loginPassword, loginPasswordError, '');
      }

      if (hasError) return;

      const btnLogin = document.getElementById('btn-login');
      setLoading(btnLogin, true);

      const { data, error } = await sb.auth.signInWithPassword({ email, password });

      setLoading(btnLogin, false);

      if (error) {
        if (error.message.toLowerCase().includes('invalid login')) {
          setFieldError(loginPassword, loginPasswordError, 'Incorrect email or password');
          showToast('Incorrect email or password.', 'error');
        } else if (error.message.toLowerCase().includes('email not confirmed')) {
          showToast('Please confirm your email before signing in.', 'error');
        } else {
          showToast(error.message, 'error');
        }
        return;
      }

      loginForm.reset();
      renderLoggedIn(data.user);
      const name = data.user.user_metadata?.full_name || email.split('@')[0];
      showToast(`Welcome back, ${name}! ⚡`, 'success');
    });
  }

  // ==========================================
  // 10. PROFILE DROPDOWN & LOGOUT
  // ==========================================
  if (profileBtn && dropdownMenu) {
    profileBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdownMenu.classList.toggle('hidden');
      profileBtn.setAttribute('aria-expanded', !dropdownMenu.classList.contains('hidden'));
    });

    document.addEventListener('click', (e) => {
      if (!dropdownMenu.contains(e.target) && !profileBtn.contains(e.target)) {
        dropdownMenu.classList.add('hidden');
        profileBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  if (btnLogout) {
    btnLogout.addEventListener('click', async () => {
      if (dropdownMenu) dropdownMenu.classList.add('hidden');
      await sb.auth.signOut();
      renderLoggedOut();
      showToast('Signed out successfully');
    });
  }

  // ==========================================
  // 11. CHANGE PASSWORD MODAL (SUPABASE)
  // ==========================================
  function openPasswordModal() {
    if (dropdownMenu) dropdownMenu.classList.add('hidden');
    if (profileBtn) profileBtn.setAttribute('aria-expanded', 'false');
    if (passwordChangeForm) passwordChangeForm.reset();

    setFieldError(currentPasswordInput, currentPasswordError, '');
    setFieldError(newPasswordInput, newPasswordError, '');
    setFieldError(confirmNewPasswordInput, confirmNewPasswordError, '');

    if (cpMeterFill) cpMeterFill.className = 'meter-bar-fill';
    if (cpMeterStatus) cpMeterStatus.textContent = 'Enter new password';
    if (cpMatchBadge) cpMatchBadge.classList.add('hidden');

    // Hide the "current password" field — Supabase handles re-auth differently.
    // We only need the new password since the user is already in a valid session.
    if (currentPasswordInput) {
      const currentField = currentPasswordInput.closest('.field');
      if (currentField) currentField.style.display = 'none';
    }

    if (passwordModal) passwordModal.classList.remove('hidden');
    if (newPasswordInput) newPasswordInput.focus();
  }

  function closePasswordModal() {
    if (passwordModal) passwordModal.classList.add('hidden');
    // Restore current password field visibility
    if (currentPasswordInput) {
      const currentField = currentPasswordInput.closest('.field');
      if (currentField) currentField.style.display = '';
    }
  }

  if (btnOpenPasswordModal) btnOpenPasswordModal.addEventListener('click', openPasswordModal);
  if (btnCloseModal) btnCloseModal.addEventListener('click', closePasswordModal);
  if (btnCancelModal) btnCancelModal.addEventListener('click', closePasswordModal);

  if (passwordModal) {
    passwordModal.addEventListener('click', (e) => {
      if (e.target === passwordModal) closePasswordModal();
    });
  }

  if (passwordChangeForm) {
    passwordChangeForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const newPass     = newPasswordInput.value;
      const confirmPass = confirmNewPasswordInput.value;
      let hasError      = false;

      if (!newPass) {
        setFieldError(newPasswordInput, newPasswordError, 'New password is required');
        hasError = true;
      } else if (newPass.length < 6) {
        setFieldError(newPasswordInput, newPasswordError, 'Password must be at least 6 characters');
        hasError = true;
      } else {
        setFieldError(newPasswordInput, newPasswordError, '');
      }

      if (!confirmPass) {
        setFieldError(confirmNewPasswordInput, confirmNewPasswordError, 'Please confirm your new password');
        hasError = true;
      } else if (confirmPass !== newPass) {
        setFieldError(confirmNewPasswordInput, confirmNewPasswordError, 'Passwords do not match');
        hasError = true;
      } else {
        setFieldError(confirmNewPasswordInput, confirmNewPasswordError, '');
      }

      if (hasError) return;

      const btnSubmitPassword = document.getElementById('btn-submit-password');
      setLoading(btnSubmitPassword, true);

      const { error } = await sb.auth.updateUser({ password: newPass });

      setLoading(btnSubmitPassword, false);

      if (error) {
        showToast(error.message, 'error');
        return;
      }

      closePasswordModal();
      showToast('Password updated successfully! ✨', 'success');
    });
  }

  // ==========================================
  // 12. SCREEN RENDERERS
  // ==========================================
  function renderLoggedIn(user) {
    if (!user) return;
    if (authScreen) authScreen.classList.remove('active');
    if (dashboardScreen) dashboardScreen.classList.add('active');

    const name    = user.user_metadata?.full_name || user.email.split('@')[0];
    const initial = name ? name[0].toUpperCase() : 'U';

    if (avatarText) avatarText.textContent = initial;
    if (navUserName) navUserName.textContent = name;
    if (dropdownFullName) dropdownFullName.textContent = name;
    if (dropdownUserEmail) dropdownUserEmail.textContent = user.email;
    if (welcomeName) welcomeName.textContent = name;
  }

  function renderLoggedOut() {
    if (dashboardScreen) dashboardScreen.classList.remove('active');
    if (authScreen) authScreen.classList.add('active');
    if (dropdownMenu) dropdownMenu.classList.add('hidden');
    closePasswordModal();
  }

  // ==========================================
  // 13. SESSION RESTORE ON PAGE LOAD
  // ==========================================
  async function init() {
    const { data: { session } } = await sb.auth.getSession();
    if (session?.user) {
      renderLoggedIn(session.user);
    } else {
      renderLoggedOut();
    }
  }

  // Listen for auth state changes (token refresh, sign-out from another tab, etc.)
  sb.auth.onAuthStateChange((_event, session) => {
    if (session?.user) {
      renderLoggedIn(session.user);
    } else {
      renderLoggedOut();
    }
  });

  init();

})();

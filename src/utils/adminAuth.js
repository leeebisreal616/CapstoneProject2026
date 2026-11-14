// ============================================================
// REAL backend auth - GCO Admin Portal
// Tumatawag na sa gco-api/admin/login.php
// May rate limiting (3 attempts / 30 mins lock) + refresh token
// ============================================================

const API = 'http://localhost/gco-api/admin';
const SESSION_KEY = 'gco_admin';
const ACCESS_KEY = 'gco_admin_access';
const REFRESH_KEY = 'gco_admin_refresh';
const EXPIRES_KEY = 'gco_admin_expires';

export async function login(username, password) {
  try {
    const res = await fetch(`${API}/login.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();

    if (!data.success) {
      return {
        success: false,
        message: data.message || 'Incorrect username or password.',
        locked: data.locked || false,
      };
    }

    // Save session + tokens
    localStorage.setItem(SESSION_KEY, JSON.stringify(data.admin));
    localStorage.setItem(ACCESS_KEY, data.access_token);
    localStorage.setItem(REFRESH_KEY, data.refresh_token);
    localStorage.setItem(EXPIRES_KEY, String(Date.now() + data.expires_in * 1000));

    return { success: true, admin: data.admin };
  } catch (e) {
    return { success: false, message: 'Cannot connect to server. Check if XAMPP is running.' };
  }
}

export async function refreshAccessToken() {
  const refreshToken = localStorage.getItem(REFRESH_KEY);
  if (!refreshToken) return false;

  try {
    const res = await fetch(`${API}/refresh.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    const data = await res.json();
    if (!data.success) return false;

    localStorage.setItem(ACCESS_KEY, data.access_token);
    localStorage.setItem(SESSION_KEY, JSON.stringify(data.admin));
    localStorage.setItem(EXPIRES_KEY, String(Date.now() + data.expires_in * 1000));
    return true;
  } catch {
    return false;
  }
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(EXPIRES_KEY);
  // Linisin din yung lumang sessionStorage para sure
  sessionStorage.removeItem('gco_admin_session');
}

export function isLoggedIn() {
  try {
    return localStorage.getItem(SESSION_KEY) !== null;
  } catch {
    return false;
  }
}

export function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// Alias para kung may ibang file na gumagamit ng getAdmin()
export function getAdmin() {
  return getSession();
}

// ============================================================
// FORGOT / RESET PASSWORD - BAGONG DAGDAG LANG DITO SA BABA
// ============================================================

export async function requestPasswordReset(username) {
  try {
    const res = await fetch(`${API}/forgot-password.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
    });
    return await res.json();
  } catch (e) {
    return { success: false, message: 'Cannot connect to server. Check if XAMPP is running.' };
  }
}

export async function resetPassword(token, password) {
  try {
    const res = await fetch(`${API}/reset-password.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    });
    return await res.json();
  } catch (e) {
    return { success: false, message: 'Cannot connect to server. Check if XAMPP is running.' };
  }
}
// ============================================================
// REAL backend auth - GCO Admin Portal
// Naka-connect na sa Render, hindi na sa localhost / XAMPP
// ============================================================
const API = import.meta.env.VITE_API_URL || 'https://gco-portal-backend.onrender.com';

const SESSION_KEY = 'gco_admin';
const ACCESS_KEY = 'gco_admin_access';
const REFRESH_KEY = 'gco_admin_refresh';
const EXPIRES_KEY = 'gco_admin_expires';

export async function login(username, password) {
  try {
    const res = await fetch(`${API}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!data.success) {
      return { success: false, message: data.message || 'Incorrect username or password.', locked: data.locked || false };
    }
    localStorage.setItem(SESSION_KEY, JSON.stringify(data.admin));
    localStorage.setItem(ACCESS_KEY, data.access_token);
    localStorage.setItem(REFRESH_KEY, data.refresh_token);
    localStorage.setItem(EXPIRES_KEY, String(Date.now() + data.expires_in * 1000));
    return { success: true, admin: data.admin };
  } catch (e) {
    return { success: false, message: 'Cannot connect to server. Check if Render backend is running.' };
  }
}

export async function refreshAccessToken() {
  const refreshToken = localStorage.getItem(REFRESH_KEY);
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${API}/api/admin/refresh`, {
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
  } catch { return false; }
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(EXPIRES_KEY);
  sessionStorage.removeItem('gco_admin_session');
}

export function isLoggedIn() {
  try { return localStorage.getItem(SESSION_KEY) !== null; } catch { return false; }
}

export function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function getAdmin() { return getSession(); }

// ============================================================
// FORGOT / RESET PASSWORD
// ============================================================
export async function requestPasswordReset(username) {
  try {
    const res = await fetch(`${API}/api/admin/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
    });
    return await res.json();
  } catch (e) {
    return { success: false, message: 'Cannot connect to server. Check if Render backend is running.' };
  }
}

export async function resetPassword(token, password) {
  try {
    const res = await fetch(`${API}/api/admin/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    });
    return await res.json();
  } catch (e) {
    return { success: false, message: 'Cannot connect to server. Check if Render backend is running.' };
  }
}

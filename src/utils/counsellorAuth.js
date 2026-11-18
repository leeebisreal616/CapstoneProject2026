// ============================================================
// LOCAL backend auth - GCO Counsellor Login
// Naka-connect na sa localhost / XAMPP
// ============================================================
const API = 'http://localhost/gco-api/counsellor';
const SESSION_KEY = 'gco_counsellor';
const ACCESS_KEY = 'gco_counsellor_access';
const REFRESH_KEY = 'gco_counsellor_refresh';
const EXPIRES_KEY = 'gco_counsellor_expires';

export async function login(username, password) {
  try {
    const res = await fetch(`${API}/login.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!data.success) {
      return { success: false, message: data.message || 'Incorrect username or password.', locked: data.locked || false };
    }
    localStorage.setItem(SESSION_KEY, JSON.stringify(data.counsellor));
    localStorage.setItem(ACCESS_KEY, data.access_token);
    localStorage.setItem(REFRESH_KEY, data.refresh_token);
    localStorage.setItem(EXPIRES_KEY, String(Date.now() + data.expires_in * 1000));
    return { success: true, counsellor: data.counsellor };
  } catch (e) {
    return { success: false, message: 'Cannot connect to server. Check if XAMPP (Apache) is running.' };
  }
}

export async function refreshAccessToken() {
  const refreshToken = localStorage.getItem(REFRESH_KEY);
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${API}/refresh.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    const data = await res.json();
    if (!data.success) return false;
    localStorage.setItem(ACCESS_KEY, data.access_token);
    localStorage.setItem(SESSION_KEY, JSON.stringify(data.counsellor));
    localStorage.setItem(EXPIRES_KEY, String(Date.now() + data.expires_in * 1000));
    return true;
  } catch { return false; }
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(EXPIRES_KEY);
  // Linisin din yung luma para hindi na mabasa ng StudentLogin / History
  localStorage.removeItem('gco_admin');
  localStorage.removeItem('gco_admin_access');
  localStorage.removeItem('gco_admin_refresh');
  localStorage.removeItem('gco_admin_expires');
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

export function getCounsellor() { return getSession(); }
// Backwards compat - pag may ibang file na getAdmin() pa rin yung tawag
export function getAdmin() { return getSession(); }

// ============================================================
// FORGOT / RESET PASSWORD
// ============================================================
export async function requestPasswordReset(username) {
  try {
    const res = await fetch(`${API}/forgot-password.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ username }),
    });
    return await res.json();
  } catch (e) {
    return { success: false, message: 'Cannot connect to server. Check if XAMPP (Apache) is running.' };
  }
}

export async function resetPassword(token, password) {
  try {
    const res = await fetch(`${API}/reset-password.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ token, password }),
    });
    return await res.json();
  } catch (e) {
    return { success: false, message: 'Cannot connect to server. Check if XAMPP (Apache) is running.' };
  }
}
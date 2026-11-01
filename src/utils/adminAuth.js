// ============================================================
// TEMPORARY frontend-only auth for demo/prototype purposes.
// This must be replaced by the IT team's real backend authentication
// before this system goes into production.
// ============================================================
const SESSION_KEY = 'gco_admin_session'

const DEMO_CREDENTIALS = {
  username: 'admin',
  password: 'gco2026',
}

export function login(username, password) {
  if (username === DEMO_CREDENTIALS.username && password === DEMO_CREDENTIALS.password) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({
      username,
      loggedInAt: new Date().toISOString(),
    }))
    window.history.pushState(null, '', window.location.href)
    return { success: true }
  }
  return { success: false, message: 'Incorrect username or password.' }
}

export function logout() {
  sessionStorage.removeItem(SESSION_KEY)
  localStorage.removeItem(SESSION_KEY)
  window.history.replaceState(null, '', '/admin')
}

export function isLoggedIn() {
  try {
    return sessionStorage.getItem(SESSION_KEY) !== null
  } catch {
    return false
  }
}

export function getSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}
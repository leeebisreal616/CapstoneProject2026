// ============================================================
// TEMPORARY frontend-only auth for demo/prototype purposes.
// This must be replaced by the IT team's real backend authentication
// (e.g. verified against the university's staff account database)
// before this system goes into production.
// ============================================================

const SESSION_KEY = 'gco_admin_session'

// Demo credentials — change here only, nowhere else in the codebase
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
    return { success: true }
  }
  return { success: false, message: 'Incorrect username or password.' }
}

export function logout() {
  sessionStorage.removeItem(SESSION_KEY)
}

export function isLoggedIn() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    return raw !== null
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
const API = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname}:8008/api` : 'http://localhost:8008/api')
let csrfToken = ''

async function ensureCsrf() {
  const r = await fetch(`${API}/csrf/`, { credentials: 'include' })
  const data = await r.json()
  csrfToken = data.csrfToken || ''
}
export async function api(path, options = {}) {
  if (!csrfToken && !path.includes('/auth/login/')) await ensureCsrf()
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) }
  if (csrfToken) headers['X-CSRFToken'] = csrfToken
  const response = await fetch(`${API}${path}`, { credentials: 'include', ...options, headers })
  const data = response.status === 204 ? null : await response.json().catch(() => ({}))
  if (!response.ok) {
    if (response.status === 403) { csrfToken = ''; }
    throw new Error(data.detail || Object.values(data).flat().join(' ') || 'Request failed')
  }
  return data
}
export async function login(username, password) {
  await ensureCsrf()
  const r = await fetch(`${API}/auth/login/`, {
    method: 'POST', credentials: 'include',
    headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrfToken },
    body: JSON.stringify({ username, password })
  })
  const data = await r.json()
  if (!r.ok) throw new Error(data.detail || 'Login failed')
  await ensureCsrf() // Fetch the new CSRF token that Django rotated upon login
  return data
}
export async function signup(username, password, email = '') {
  await ensureCsrf()
  const r = await fetch(`${API}/auth/register/`, {
    method: 'POST', credentials: 'include',
    headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrfToken },
    body: JSON.stringify({ username, password, email })
  })
  const data = await r.json()
  if (!r.ok) throw new Error(data.detail || 'Sign up failed')
  await ensureCsrf()
  return data
}


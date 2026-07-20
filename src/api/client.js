const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

const TOKEN_KEY = 'survivor_jwt'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

export async function apiRequest(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  const token = getToken()
  if (token) headers.Authorization = token

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  const authHeader = response.headers.get('Authorization')
  if (authHeader) setToken(authHeader)

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const message = data.errors ? data.errors.join(', ') : 'Request failed'
    throw new Error(message)
  }

  return data
}

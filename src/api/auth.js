import { apiRequest, clearToken } from './client'

export function login(email, password) {
  return apiRequest('/login', {
    method: 'POST',
    body: { user: { email, password } },
  })
}

export function signup(email, password, passwordConfirmation) {
  return apiRequest('/signup', {
    method: 'POST',
    body: {
      user: {
        email,
        password,
        password_confirmation: passwordConfirmation,
      },
    },
  })
}

export async function logout() {
  try {
    await apiRequest('/logout', { method: 'DELETE' })
  } finally {
    clearToken()
  }
}

export function fetchCurrentUser() {
  return apiRequest('/me')
}

import { apiRequest, clearToken } from './client'

export function login(email, password) {
  return apiRequest('/login', {
    method: 'POST',
    body: { user: { email, password } },
  })
}

export function signup({ email, password, passwordConfirmation, username, firstName, lastName }) {
  return apiRequest('/signup', {
    method: 'POST',
    body: {
      user: {
        email,
        password,
        password_confirmation: passwordConfirmation,
        username: username || null,
        first_name: firstName,
        last_name: lastName,
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

export function updateProfile({ username, firstName, lastName }) {
  return apiRequest('/me', {
    method: 'PATCH',
    body: {
      user: {
        username: username || null,
        first_name: firstName,
        last_name: lastName,
      },
    },
  })
}

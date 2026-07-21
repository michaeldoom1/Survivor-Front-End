import { createContext, useContext, useEffect, useState } from 'react'
import { getToken, clearToken } from '../api/client'
import * as authApi from '../api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!getToken()) {
      setLoading(false)
      return
    }

    authApi
      .fetchCurrentUser()
      .then((data) => setUser(data.user))
      .catch(() => clearToken())
      .finally(() => setLoading(false))
  }, [])

  async function login(email, password) {
    const data = await authApi.login(email, password)
    setUser(data.user)
    return data.user
  }

  async function signup(fields) {
    const data = await authApi.signup(fields)
    setUser(data.user)
    return data.user
  }

  async function logout() {
    await authApi.logout()
    setUser(null)
  }

  async function updateProfile(fields) {
    const data = await authApi.updateProfile(fields)
    setUser(data.user)
    return data.user
  }

  const value = { user, loading, login, signup, logout, updateProfile }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

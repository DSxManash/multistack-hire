
import { createContext, useState, useEffect, useCallback } from 'react'
import { loginUser, registerUser, getCurrentUser, logoutUser } from '../api/authApi'
import { appPath } from '../lib/appPaths'


export const AuthContext = createContext(null)

function getAuthErrorMessage(err, fallbackMessage) {
  if (err?.response?.data) {
    const data = err.response.data

    if (typeof data === 'string') {
      return data
    }

    if (typeof data === 'object') {
      return data.detail || data.message || data.error || data.msg || fallbackMessage
    }
  }

  if (err?.code === 'ERR_NETWORK' || err?.message?.includes('Network Error')) {
    return 'Unable to reach the server. Please check that the backend is running and try again.'
  }

  if (err?.response?.status >= 500) {
    return 'The server is currently unavailable. Please try again in a moment.'
  }

  return fallbackMessage
}

function readCachedUser() {
  try {
    const raw = localStorage.getItem('user')
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  // Boot hydration (token + /auth/me) — route guards wait on this
  const [isInitializing, setIsInitializing] = useState(true)
  // Login / register form submit only
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const isAuthenticated = !!user

  useEffect(() => {
    async function loadUserFromStorage() {
      const token = localStorage.getItem('access_token')

      if (!token) {
        setUser(null)
        setIsInitializing(false)
        return
      }

      // Seed from cache so protected routes don't flash as logged-out
      const cached = readCachedUser()
      if (cached) {
        setUser(cached)
      }

      try {
        const userData = await getCurrentUser()
        setUser(userData)
        localStorage.setItem('user', JSON.stringify(userData))
      } catch {
        localStorage.removeItem('access_token')
        localStorage.removeItem('user')
        setUser(null)
      } finally {
        setIsInitializing(false)
      }
    }

    loadUserFromStorage()
  }, [])


  const login = useCallback(async (credentials) => {
    setError(null)
    setIsLoading(true)

    try {
      const data = await loginUser(credentials)

      localStorage.setItem('access_token', data.access_token)
      localStorage.setItem('user', JSON.stringify(data.user))
      setUser(data.user)

      return data.user
    } catch (err) {
      const message = getAuthErrorMessage(err, 'Login failed. Please check your email and password.')
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const register = useCallback(async (userData) => {
    setError(null)
    setIsLoading(true)

    try {
      const data = await registerUser(userData)

      localStorage.setItem('access_token', data.access_token)
      localStorage.setItem('user', JSON.stringify(data.user))
      setUser(data.user)

      return data.user
    } catch (err) {
      const message = getAuthErrorMessage(err, 'Registration failed. Please try again.')
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await logoutUser()
    } catch {
      // ignore network issues; still clear local state
    }

    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
    setUser(null)
    setError(null)
    window.location.href = appPath('/login')
  }, [])

  const clearError = useCallback(() => setError(null), [])

  const value = {
    user,
    isAuthenticated,
    isInitializing,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

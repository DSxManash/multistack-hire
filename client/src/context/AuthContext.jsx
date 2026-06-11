
import { createContext, useState, useEffect, useCallback } from 'react'
import { loginUser, registerUser, getCurrentUser, logoutUser } from '../api/authApi'


export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // Core auth state
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true) 
  const [error, setError] = useState(null)


  const isAuthenticated = !!user  

  useEffect(() => {
    async function loadUserFromStorage() {
      const token = localStorage.getItem('access_token')

      if (!token) {
        setIsLoading(false)
        return
      }

      try {
       
        const userData = await getCurrentUser()
        setUser(userData)
      } catch {
       
        localStorage.removeItem('access_token')
        localStorage.removeItem('user')
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    loadUserFromStorage()
  }, [])


  const login = useCallback(async (credentials) => {
    setError(null)
    setIsLoading(true)

    try {
  
      const data = await loginUser(credentials)

      // Store token so axiosInstance can attach it to future requests
      localStorage.setItem('access_token', data.access_token)
      localStorage.setItem('user', JSON.stringify(data.user))

      // Update React state → triggers re-render → UI updates
      setUser(data.user)

      return data.user  
    } catch (err) {
      const message = err.response?.data?.detail || 'Login failed'
      setError(message)
      throw err  
    } finally {
      setIsLoading(false)
    }
  }, [])

  // ── Register ────────────────────────────────────────────────────
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
      const message = err.response?.data?.detail || 'Registration failed'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  // ── Logout ──────────────────────────────────────────────────────
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
    window.location.href = '/login'
  }, [])

  // ── Clear error ─────────────────────────────────────────────────
  const clearError = useCallback(() => setError(null), [])

  const value = {
    user,          
    isAuthenticated,
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
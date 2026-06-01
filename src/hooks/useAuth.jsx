import { useState, useEffect, createContext, useContext, useCallback } from 'react'
import pb, { setFileToken } from '../lib/pocketbase'
import logger from '../lib/logger'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

// Refresh a bit before PocketBase's default ~3 min file-token lifetime.
const FILE_TOKEN_REFRESH_MS = 2 * 60 * 1000

export function AuthProvider({ children }) {
  const [user, setUser] = useState(pb.authStore.model)
  const [isLoading, setIsLoading] = useState(true)
  // Bumped whenever the file token changes so file URLs re-render with it.
  const [, setFileTokenVersion] = useState(0)

  // Fetch (or clear) the file token used to view protected uploads.
  const refreshFileToken = useCallback(async () => {
    if (!pb.authStore.isValid) {
      setFileToken('')
      setFileTokenVersion((v) => v + 1)
      return
    }
    try {
      const token = await pb.files.getToken()
      setFileToken(token)
      setFileTokenVersion((v) => v + 1)
    } catch (error) {
      logger.error('Auth', 'Failed to fetch file token', { error: error.message })
    }
  }, [])

  useEffect(() => {
    logger.component('AuthProvider', 'mounted', { hasUser: !!pb.authStore.model })

    // The persisted token can look valid locally (authStore.isValid only checks
    // JWT expiry) yet be rejected by the server. Verify it on load so a stale
    // session goes to login instead of a broken, write-failing dashboard.
    const validateSession = async () => {
      if (pb.authStore.isValid) {
        try {
          await pb.collection('users').authRefresh()
        } catch (error) {
          logger.auth('Stored session is no longer valid - clearing', { error: error.message })
          pb.authStore.clear()
        }
      }
      setIsLoading(false)
      refreshFileToken()
    }
    validateSession()

    const unsubscribe = pb.authStore.onChange((token, model) => {
      setUser(model)
      refreshFileToken()
    })
    const interval = setInterval(refreshFileToken, FILE_TOKEN_REFRESH_MS)

    return () => {
      logger.component('AuthProvider', 'unmounted')
      unsubscribe()
      clearInterval(interval)
    }
  }, [refreshFileToken])

  const login = useCallback(async (email, password) => {
    logger.auth('Login attempt', { email })
    try {
      const authData = await pb.collection('users').authWithPassword(email, password)
      logger.auth('Login successful', { email, userId: authData.record.id })
      toast.success('Welcome back!')
      return authData
    } catch (error) {
      logger.error('Auth', 'Login failed', { email, error: error.message })
      toast.error(error.message || 'Login failed')
      throw error
    }
  }, [])

  const register = useCallback(async (email, password, passwordConfirm, name) => {
    logger.auth('Registration attempt', { email, name })
    try {
      const newUser = await pb.collection('users').create({
        email,
        password,
        passwordConfirm,
        name,
      })
      logger.auth('Registration successful', { email, userId: newUser.id })
      await login(email, password)
      toast.success('Account created successfully!')
    } catch (error) {
      logger.error('Auth', 'Registration failed', { email, error: error.message })
      toast.error(error.message || 'Registration failed')
      throw error
    }
  }, [login])

  const logout = useCallback(() => {
    logger.auth('Logout')
    pb.authStore.clear()
    toast.success('Logged out')
  }, [])

  const value = {
    user,
    isLoading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

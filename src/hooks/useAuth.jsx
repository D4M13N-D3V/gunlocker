import { useState, useEffect, createContext, useContext, useCallback } from 'react'
import pb from '../lib/pocketbase'
import logger from '../lib/logger'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(pb.authStore.model)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    logger.component('AuthProvider', 'mounted', { hasUser: !!pb.authStore.model })
    setIsLoading(false)

    const unsubscribe = pb.authStore.onChange((token, model) => {
      setUser(model)
    })

    return () => {
      logger.component('AuthProvider', 'unmounted')
      unsubscribe()
    }
  }, [])

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

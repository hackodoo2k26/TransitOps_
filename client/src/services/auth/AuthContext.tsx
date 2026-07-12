import { useEffect, useState, type ReactNode } from 'react'
import { authService } from './auth.service'
import { onUnauthorized } from './api'
import type { User } from './auth.types'
import { AuthContext } from './context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(authService.getCurrentUser())
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(authService.isAuthenticated())
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    const unsubscribe = onUnauthorized(() => {
      setUser(null)
      setIsAuthenticated(false)
      setIsLoading(false)
    })

    const initializeAuth = async () => {
      if (authService.isAuthenticated()) {
        try {
          const fetchedUser = await authService.checkSession()
          setUser(fetchedUser)
          setIsAuthenticated(true)
        } catch {
          // If checking session failed (e.g. invalid tokens), clear state
          setUser(null)
          setIsAuthenticated(false)
        } finally {
          setIsLoading(false)
        }
      } else {
        setIsLoading(false)
      }
    }

    initializeAuth()

    return () => {
      unsubscribe()
    }
  }, [])

  const login = async (email: string, password: string, rememberMe = false): Promise<User> => {
    setIsLoading(true)
    try {
      const loggedUser = await authService.login(email, password, rememberMe)
      setUser(loggedUser)
      setIsAuthenticated(true)
      return loggedUser
    } catch (error) {
      setUser(null)
      setIsAuthenticated(false)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async (): Promise<void> => {
    setIsLoading(true)
    try {
      await authService.logout()
    } finally {
      setUser(null)
      setIsAuthenticated(false)
      setIsLoading(false)
    }
  }

  const forgotPassword = async (email: string): Promise<void> => {
    await authService.forgotPassword(email)
  }

  const resetPassword = async (token: string, password: string): Promise<void> => {
    await authService.resetPassword(token, password)
  }

  const checkSession = async (): Promise<User> => {
    try {
      const fetchedUser = await authService.checkSession()
      setUser(fetchedUser)
      setIsAuthenticated(true)
      return fetchedUser
    } catch (error) {
      setUser(null)
      setIsAuthenticated(false)
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        forgotPassword,
        resetPassword,
        checkSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}



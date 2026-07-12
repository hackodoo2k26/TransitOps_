import { createContext } from 'react'
import type { User } from './auth.types'

export interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string, rememberMe?: boolean) => Promise<User>
  logout: () => Promise<void>
  forgotPassword: (email: string) => Promise<void>
  resetPassword: (token: string, password: string) => Promise<void>
  checkSession: () => Promise<User>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

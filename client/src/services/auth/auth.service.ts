import { api } from './api'
import { authStorage } from './auth.storage'
import type { User } from './auth.types'

export const authService = {
  async login(email: string, password: string, rememberMe = false): Promise<User> {
    authStorage.setRememberMe(rememberMe)
    try {
      const response = await api.post<{
        accessToken: string
        refreshToken: string
        user: User
      }>('/auth/login', { email, password })
      
      authStorage.saveTokens(response.accessToken, response.refreshToken)
      authStorage.saveUser(response.user)
      return response.user
    } catch (error) {
      authStorage.clear()
      throw error
    }
  },

  async logout(): Promise<void> {
    const refreshToken = authStorage.getRefreshToken()
    if (refreshToken) {
      try {
        await api.post('/auth/logout', { refreshToken })
      } catch {
        // Suppress logout API failure and continue client cleanup
      }
    }
    authStorage.clear()
  },

  async forgotPassword(email: string): Promise<void> {
    await api.post('/auth/forgot-password', { email })
  },

  async resetPassword(token: string, password: string): Promise<void> {
    await api.post('/auth/reset-password', { token, password })
  },

  async checkSession(): Promise<User> {
    try {
      const user = await api.get<User>('/auth/session')
      authStorage.saveUser(user)
      return user
    } catch (error) {
      authStorage.clear()
      throw error
    }
  },

  isAuthenticated(): boolean {
    return !!authStorage.getAccessToken()
  },

  getCurrentUser(): User | null {
    return authStorage.getUser()
  }
}

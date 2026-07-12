import type { User } from './auth.types'

const ACCESS_TOKEN_KEY = 'transitops_access_token'
const REFRESH_TOKEN_KEY = 'transitops_refresh_token'
const USER_KEY = 'transitops_user'
const REMEMBER_KEY = 'transitops_remember_me'

function getStorage(): Storage {
  const remember = localStorage.getItem(REMEMBER_KEY) === 'true'
  return remember ? localStorage : sessionStorage
}

export const authStorage = {
  setRememberMe(remember: boolean) {
    localStorage.setItem(REMEMBER_KEY, String(remember))
  },

  getRememberMe(): boolean {
    return localStorage.getItem(REMEMBER_KEY) === 'true'
  },

  saveTokens(accessToken: string, refreshToken: string) {
    const storage = getStorage()
    storage.setItem(ACCESS_TOKEN_KEY, accessToken)
    storage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  },

  saveUser(user: User) {
    const storage = getStorage()
    storage.setItem(USER_KEY, JSON.stringify(user))
  },

  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY) ?? sessionStorage.getItem(ACCESS_TOKEN_KEY)
  },

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY) ?? sessionStorage.getItem(REFRESH_TOKEN_KEY)
  },

  getUser(): User | null {
    const data = localStorage.getItem(USER_KEY) ?? sessionStorage.getItem(USER_KEY)
    if (!data) return null
    try {
      return JSON.parse(data) as User
    } catch {
      return null
    }
  },

  clear() {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    sessionStorage.removeItem(ACCESS_TOKEN_KEY)
    sessionStorage.removeItem(REFRESH_TOKEN_KEY)
    sessionStorage.removeItem(USER_KEY)
    localStorage.removeItem(REMEMBER_KEY)
  }
}

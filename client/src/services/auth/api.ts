import { authStorage } from './auth.storage'

const BASE_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:3001/api'

interface RequestOptions extends RequestInit {
  params?: Record<string, string>
}

type LogoutListener = () => void
const logoutListeners: Set<LogoutListener> = new Set()

export function onUnauthorized(callback: LogoutListener) {
  logoutListeners.add(callback)
  return () => {
    logoutListeners.delete(callback)
  }
}

function triggerUnauthorized() {
  logoutListeners.forEach((listener) => listener())
}

let isRefreshing = false
let refreshSubscribers: ((token: string) => void)[] = []

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb)
}

function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token))
  refreshSubscribers = []
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { params, headers, ...restOptions } = options

  let url = `${BASE_URL}${path}`
  if (params) {
    const searchParams = new URLSearchParams(params)
    url += `?${searchParams.toString()}`
  }

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  const token = authStorage.getAccessToken()
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`
  }

  const fetchOptions: RequestInit = {
    ...restOptions,
    headers: {
      ...defaultHeaders,
      ...headers,
    },
  }

  let response: Response
  try {
    response = await fetch(url, fetchOptions)
  } catch {
    throw { success: false, message: 'Network connection failed' }
  }

  if (response.status === 401 && !path.includes('/auth/login') && !path.includes('/auth/refresh')) {
    if (!isRefreshing) {
      isRefreshing = true
      const refreshToken = authStorage.getRefreshToken()
      if (refreshToken) {
        try {
          const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }),
          })

          if (refreshRes.ok) {
            const result = await refreshRes.json()
            const { accessToken: newAccess, refreshToken: newRefresh } = result.data
            authStorage.saveTokens(newAccess, newRefresh)
            isRefreshing = false
            onRefreshed(newAccess)
          } else {
            isRefreshing = false
            authStorage.clear()
            triggerUnauthorized()
            throw { success: false, message: 'Unauthorized session expired' }
          }
        } catch (err) {
          isRefreshing = false
          authStorage.clear()
          triggerUnauthorized()
          throw err
        }
      } else {
        authStorage.clear()
        triggerUnauthorized()
        throw { success: false, message: 'Unauthorized' }
      }
    }

    return new Promise<T>((resolve, reject) => {
      subscribeTokenRefresh((newToken) => {
        const newHeaders = {
          ...fetchOptions.headers,
          'Authorization': `Bearer ${newToken}`,
        }
        fetch(url, { ...fetchOptions, headers: newHeaders })
          .then(async (res) => {
            if (!res.ok) {
              const errorData = await res.json().catch(() => ({}))
              reject(errorData)
            } else {
              const resData = await res.json()
              resolve(resData.data)
            }
          })
          .catch(reject)
      })
    })
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw errorData
  }

  const resData = await response.json()
  return resData.data
}

export const api = {
  get<T>(path: string, options?: RequestOptions) {
    return request<T>(path, { ...options, method: 'GET' })
  },
  post<T>(path: string, body?: unknown, options?: RequestOptions) {
    return request<T>(path, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    })
  },
  put<T>(path: string, body?: unknown, options?: RequestOptions) {
    return request<T>(path, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    })
  },
  patch<T>(path: string, body?: unknown, options?: RequestOptions) {
    return request<T>(path, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    })
  },
  delete<T>(path: string, options?: RequestOptions) {
    return request<T>(path, { ...options, method: 'DELETE' })
  },
}

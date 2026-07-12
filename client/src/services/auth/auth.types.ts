export interface User {
  id: number
  organizationId: number | null
  email: string
  name: string
  status?: string
  emailVerifiedAt?: string | null
  roles: string[]
  isSuperAdmin: boolean
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface ApiErrorResponse {
  success: false
  message: string
  errors?: Array<{
    message: string
    path: string[]
    [key: string]: unknown
  }>
}

import type { User } from '../services/auth/auth.types'

export const hasAnyRole = (user: User | null, allowedRoles: string[]) =>
  Boolean(user?.isSuperAdmin || user?.roles.some((role) => allowedRoles.includes(role)))


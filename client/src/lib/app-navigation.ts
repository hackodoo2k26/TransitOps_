import {
  BarChart3,
  Fuel,
  LayoutDashboard,
  Route,
  Settings,
  Truck,
  UserRound,
  Wrench,
  type LucideIcon,
} from 'lucide-react'

export interface AppBreadcrumb {
  label: string
  to?: string
}

export interface AppRouteHandle {
  breadcrumbs?: AppBreadcrumb[]
  title: string
}

export interface AppNavigationItem {
  icon: LucideIcon
  label: string
  path: string
  roles?: string[]
}

export const appNavigationItems: AppNavigationItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/vehicles', label: 'Fleet', icon: Truck, roles: ['FLEET_MANAGER', 'DISPATCHER', 'FINANCIAL_ANALYST'] },
  { path: '/drivers', label: 'Drivers', icon: UserRound, roles: ['FLEET_MANAGER', 'DISPATCHER', 'SAFETY_OFFICER'] },
  { path: '/trips', label: 'Trips', icon: Route, roles: ['FLEET_MANAGER', 'DISPATCHER'] },
  { path: '/maintenance', label: 'Maintenance', icon: Wrench, roles: ['FLEET_MANAGER', 'FINANCIAL_ANALYST'] },
  { path: '/fuel-expenses', label: 'Fuel & Expenses', icon: Fuel, roles: ['FLEET_MANAGER', 'FINANCIAL_ANALYST'] },
  { path: '/reports', label: 'Analytics', icon: BarChart3, roles: ['FLEET_MANAGER', 'FINANCIAL_ANALYST'] },
  { path: '/settings', label: 'Settings', icon: Settings },
]

export function getNavigationItem(pathname: string) {
  return appNavigationItems.find((item) => item.path === pathname)
}

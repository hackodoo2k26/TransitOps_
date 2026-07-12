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
}

export const appNavigationItems: AppNavigationItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/vehicles', label: 'Fleet', icon: Truck },
  { path: '/drivers', label: 'Drivers', icon: UserRound },
  { path: '/trips', label: 'Trips', icon: Route },
  { path: '/maintenance', label: 'Maintenance', icon: Wrench },
  { path: '/fuel-expenses', label: 'Fuel & Expenses', icon: Fuel },
  { path: '/reports', label: 'Analytics', icon: BarChart3 },
  { path: '/settings', label: 'Settings', icon: Settings },
]

export function getNavigationItem(pathname: string) {
  return appNavigationItems.find((item) => item.path === pathname)
}

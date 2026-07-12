import { createBrowserRouter } from 'react-router-dom'

import { AppLayout } from '../components/layout/AppLayout'
import { DashboardPage } from '../pages/DashboardPage'
import { DriversPage } from '../pages/DriversPage'
import { FuelExpensesPage } from '../pages/FuelExpensesPage'
import { LandingPage } from '../pages/LandingPage'
import { LoginPage } from '../pages/LoginPage'
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage'
import { ResetPasswordPage } from '../pages/ResetPasswordPage'
import { MaintenancePage } from '../pages/MaintenancePage'
import { ReportsPage } from '../pages/ReportsPage'
import { SettingsPage } from '../pages/SettingsPage'
import { TripsPage } from '../pages/TripsPage'
import { VehiclesPage } from '../pages/VehiclesPage'
import { ProtectedRoute } from '../components/auth/ProtectedRoute'

export const router = createBrowserRouter([
  { path: '/', Component: LandingPage },
  { path: '/login', Component: LoginPage },
  { path: '/forgot-password', Component: ForgotPasswordPage },
  { path: '/reset-password', Component: ResetPasswordPage },
  {
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: 'dashboard',
        Component: DashboardPage,
        handle: {
          title: 'Dashboard',
          breadcrumbs: [{ label: 'Dashboard' }],
        },
      },
      {
        path: 'vehicles',
        element: <ProtectedRoute allowedRoles={['FLEET_MANAGER', 'DISPATCHER', 'FINANCIAL_ANALYST']}><VehiclesPage /></ProtectedRoute>,
        handle: {
          title: 'Fleet',
          breadcrumbs: [{ label: 'Dashboard', to: '/dashboard' }, { label: 'Fleet' }],
        },
      },
      {
        path: 'drivers',
        element: <ProtectedRoute allowedRoles={['FLEET_MANAGER', 'DISPATCHER', 'SAFETY_OFFICER']}><DriversPage /></ProtectedRoute>,
        handle: {
          title: 'Drivers',
          breadcrumbs: [{ label: 'Dashboard', to: '/dashboard' }, { label: 'Drivers' }],
        },
      },
      {
        path: 'trips',
        element: <ProtectedRoute allowedRoles={['FLEET_MANAGER', 'DISPATCHER']}><TripsPage /></ProtectedRoute>,
        handle: {
          title: 'Trips',
          breadcrumbs: [{ label: 'Dashboard', to: '/dashboard' }, { label: 'Trips' }],
        },
      },
      {
        path: 'maintenance',
        element: <ProtectedRoute allowedRoles={['FLEET_MANAGER', 'FINANCIAL_ANALYST']}><MaintenancePage /></ProtectedRoute>,
        handle: {
          title: 'Maintenance',
          breadcrumbs: [{ label: 'Dashboard', to: '/dashboard' }, { label: 'Maintenance' }],
        },
      },
      {
        path: 'fuel-expenses',
        element: <ProtectedRoute allowedRoles={['FLEET_MANAGER', 'FINANCIAL_ANALYST']}><FuelExpensesPage /></ProtectedRoute>,
        handle: {
          title: 'Fuel & Expenses',
          breadcrumbs: [{ label: 'Dashboard', to: '/dashboard' }, { label: 'Fuel & Expenses' }],
        },
      },
      {
        path: 'reports',
        element: <ProtectedRoute allowedRoles={['FLEET_MANAGER', 'FINANCIAL_ANALYST']}><ReportsPage /></ProtectedRoute>,
        handle: {
          title: 'Analytics',
          breadcrumbs: [{ label: 'Dashboard', to: '/dashboard' }, { label: 'Analytics' }],
        },
      },
      {
        path: 'settings',
        Component: SettingsPage,
        handle: {
          title: 'Settings',
          breadcrumbs: [{ label: 'Dashboard', to: '/dashboard' }, { label: 'Settings' }],
        },
      },
    ],
  },
])

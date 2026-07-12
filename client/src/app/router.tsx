import { createBrowserRouter } from 'react-router-dom'

import { DashboardPage } from '../pages/DashboardPage'
import { DriversPage } from '../pages/DriversPage'
import { FuelExpensesPage } from '../pages/FuelExpensesPage'
import { LandingPage } from '../pages/LandingPage'
import { LoginPage } from '../pages/LoginPage'
import { MaintenancePage } from '../pages/MaintenancePage'
import { ReportsPage } from '../pages/ReportsPage'
import { TripsPage } from '../pages/TripsPage'
import { VehiclesPage } from '../pages/VehiclesPage'

export const router = createBrowserRouter([
  { path: '/', Component: LandingPage },
  { path: '/login', Component: LoginPage },
  { path: '/dashboard', Component: DashboardPage },
  { path: '/vehicles', Component: VehiclesPage },
  { path: '/drivers', Component: DriversPage },
  { path: '/trips', Component: TripsPage },
  { path: '/maintenance', Component: MaintenancePage },
  { path: '/fuel-expenses', Component: FuelExpensesPage },
  { path: '/reports', Component: ReportsPage },
])

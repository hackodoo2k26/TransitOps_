import { authStorage } from '../auth/auth.storage'
import { api } from '../auth/api'
import type {
  Driver,
  Expense,
  FuelLog,
  GlobalDashboard,
  MaintenanceLog,
  OrganizationDashboard,
  Trip,
  Vehicle,
} from './transitops.types'

const BASE_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:3001/api'

const authorizedBlobRequest = async (path: string) => {
  const token = authStorage.getAccessToken()
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw errorData
  }

  return response.blob()
}

export const transitopsService = {
  getOrganizationDashboard() {
    return api.get<OrganizationDashboard>('/dashboards/organization')
  },

  getGlobalDashboard() {
    return api.get<GlobalDashboard>('/dashboards/global')
  },

  listVehicles(search?: string, status?: string) {
    return api.get<Vehicle[]>('/vehicles', {
      params: {
        ...(search ? { search } : {}),
        ...(status && status !== 'all' ? { status } : {}),
      },
    })
  },

  createVehicle(payload: {
    registrationNumber: string
    model: string
    vehicleType: string
    maxCapacity: number
    currentOdometer: number
    acquisitionCost: number
    region?: string
    status?: Vehicle['status']
  }) {
    return api.post<Vehicle>('/vehicles', payload)
  },

  updateVehicle(id: number, payload: Partial<{
    registrationNumber: string
    model: string
    vehicleType: string
    maxCapacity: number
    currentOdometer: number
    acquisitionCost: number
    region?: string
    status?: Vehicle['status']
  }>) {
    return api.patch<Vehicle>(`/vehicles/${id}`, payload)
  },

  deleteVehicle(id: number) {
    return api.delete<Vehicle>(`/vehicles/${id}`)
  },

  listDrivers(search?: string, status?: string) {
    return api.get<Driver[]>('/drivers', {
      params: {
        ...(search ? { search } : {}),
        ...(status && status !== 'all' ? { status } : {}),
      },
    })
  },

  createDriver(payload: {
    name: string
    employeeId: string
    phone: string
    email?: string
    address?: string
    bloodGroup?: string
    licenseNumber: string
    licenseCategory: string
    licenseExpiry: string
    joiningDate: string
    safetyScore?: number
    status?: Driver['status']
  }) {
    return api.post<Driver>('/drivers', payload)
  },

  updateDriver(id: number, payload: Partial<{
    name: string
    employeeId: string
    phone: string
    email?: string
    address?: string
    bloodGroup?: string
    licenseNumber: string
    licenseCategory: string
    licenseExpiry: string
    joiningDate: string
    safetyScore?: number
    status?: Driver['status']
  }>) {
    return api.patch<Driver>(`/drivers/${id}`, payload)
  },

  updateDriverStatus(id: number, status: Driver['status']) {
    return api.post<Driver>(`/drivers/${id}/status`, { status })
  },

  updateDriverSafety(id: number, safetyScore: number) {
    return api.post<Driver>(`/drivers/${id}/safety`, { safetyScore })
  },

  deleteDriver(id: number) {
    return api.delete<Driver>(`/drivers/${id}`)
  },

  listTrips(search?: string, status?: string) {
    return api.get<Trip[]>('/trips', {
      params: {
        ...(search ? { search } : {}),
        ...(status && status !== 'all' ? { status } : {}),
      },
    })
  },

  createTrip(payload: {
    source: string
    destination: string
    vehicleId: number
    driverId: number
    cargoWeight: number
    plannedDistance: number
    revenue?: number
    notes?: string
  }) {
    return api.post<Trip>('/trips', payload)
  },

  dispatchTrip(id: number, startOdometer?: number) {
    return api.post<Trip>(`/trips/${id}/dispatch`, startOdometer ? { startOdometer } : {})
  },

  completeTrip(id: number, payload: {
    endOdometer: number
    actualDistance: number
    fuelConsumed?: number
    revenue?: number
  }) {
    return api.post<Trip>(`/trips/${id}/complete`, payload)
  },

  cancelTrip(id: number, notes?: string) {
    return api.post<Trip>(`/trips/${id}/cancel`, notes ? { notes } : {})
  },

  listMaintenance() {
    return api.get<MaintenanceLog[]>('/maintenance')
  },

  createMaintenance(payload: {
    vehicleId: number
    description: string
    cost: number
    openedAt: string
  }) {
    return api.post<MaintenanceLog>('/maintenance', payload)
  },

  updateMaintenance(id: number, payload: Partial<{
    description: string
    cost: number
    openedAt: string
  }>) {
    return api.patch<MaintenanceLog>(`/maintenance/${id}`, payload)
  },

  closeMaintenance(id: number, closedAt?: string) {
    return api.post<MaintenanceLog>(`/maintenance/${id}/close`, closedAt ? { closedAt } : {})
  },

  listFuelLogs() {
    return api.get<FuelLog[]>('/fuel-logs')
  },

  createFuelLog(payload: {
    vehicleId: number
    tripId?: number
    liters: number
    cost: number
    odometer?: number
    date: string
  }) {
    return api.post<FuelLog>('/fuel-logs', payload)
  },

  updateFuelLog(id: number, payload: Partial<{
    vehicleId: number
    tripId?: number
    liters: number
    cost: number
    odometer?: number
    date: string
  }>) {
    return api.patch<FuelLog>(`/fuel-logs/${id}`, payload)
  },

  deleteFuelLog(id: number) {
    return api.delete<FuelLog>(`/fuel-logs/${id}`)
  },

  listExpenses() {
    return api.get<Expense[]>('/expenses')
  },

  createExpense(payload: {
    vehicleId?: number
    tripId?: number
    type: Expense['type']
    amount: number
    date: string
    notes?: string
  }) {
    return api.post<Expense>('/expenses', payload)
  },

  updateExpense(id: number, payload: Partial<{
    vehicleId?: number
    tripId?: number
    type: Expense['type']
    amount: number
    date: string
    notes?: string
  }>) {
    return api.patch<Expense>(`/expenses/${id}`, payload)
  },

  deleteExpense(id: number) {
    return api.delete<Expense>(`/expenses/${id}`)
  },

  getFuelEfficiencyReport() {
    return api.get<Array<Record<string, unknown>>>('/reports/fuel-efficiency')
  },

  getFleetUtilizationReport() {
    return api.get<Array<Record<string, unknown>>>('/reports/fleet-utilization')
  },

  getVehicleRoiReport() {
    return api.get<Array<Record<string, unknown>>>('/reports/vehicle-roi')
  },

  getOperationalCostReport() {
    return api.get<Array<Record<string, unknown>>>('/reports/operational-cost')
  },

  getMonthlyExpensesReport() {
    return api.get<Array<Record<string, unknown>>>('/reports/monthly-expenses')
  },

  async exportMonthlyExpenses(format: 'csv' | 'pdf') {
    return authorizedBlobRequest(`/reports/monthly-expenses/export?format=${format}`)
  },
}


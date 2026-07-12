export interface Vehicle {
  id: number
  organizationId: number
  registrationNumber: string
  model: string
  vehicleType: string
  maxCapacity: string
  currentOdometer: string
  acquisitionCost: string
  region: string | null
  status: 'available' | 'on_trip' | 'in_shop' | 'retired'
  createdAt: string
  updatedAt: string
}

export interface Driver {
  id: number
  organizationId: number
  name: string
  employeeId: string
  phone: string
  email: string | null
  address: string | null
  bloodGroup: string | null
  licenseNumber: string
  licenseCategory: string
  licenseExpiry: string
  joiningDate: string
  safetyScore: string
  profilePhotoUrl: string | null
  status: 'available' | 'on_trip' | 'off_duty' | 'suspended' | 'inactive'
  createdAt: string
  updatedAt: string
}

export interface Trip {
  id: number
  organizationId: number
  source: string
  destination: string
  vehicleId: number | null
  driverId: number | null
  cargoWeight: string
  plannedDistance: string
  actualDistance: string
  revenue: string
  fuelConsumed: string
  startOdometer: string | null
  endOdometer: string | null
  status: 'draft' | 'dispatched' | 'completed' | 'cancelled'
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface MaintenanceLog {
  id: number
  organizationId: number
  vehicleId: number
  description: string
  cost: string
  openedAt: string
  closedAt: string | null
  status: 'open' | 'closed'
  createdAt: string
  updatedAt: string
}

export interface FuelLog {
  id: number
  organizationId: number
  vehicleId: number
  tripId: number | null
  liters: string
  cost: string
  odometer: string | null
  date: string
  createdAt: string
  updatedAt: string
}

export interface Expense {
  id: number
  organizationId: number
  vehicleId: number | null
  tripId: number | null
  type: 'fuel' | 'maintenance' | 'toll' | 'misc'
  amount: string
  date: string
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface OrganizationDashboard {
  vehicleStats: {
    available: number
    onTrip: number
    inShop: number
  }
  driverStats: {
    available: number
    onTrip: number
    offDuty: number
    suspended: number
  }
  tripStats: {
    pending: number
    completed: number
    cancelled: number
  }
  costs: {
    fuelCost: string
    maintenanceCost: string
    expenseCost: string
  }
}

export interface GlobalDashboard {
  totalOrganizations: number
  activeOrganizations: number
  suspendedOrganizations: number
}


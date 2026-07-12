import { eq } from 'drizzle-orm'

import { ROLE_CODES } from './constants/roles.js'
import { db } from './db/index.js'
import { drivers, expenses, fuelLogs, maintenanceLogs, organizations, trips, users, vehicles } from './db/schema.js'
import { accessRepository } from './repositories/access.repository.js'
import { bootstrapService } from './services/bootstrap.service.js'
import { hashPassword } from './utils/password.js'

async function seedDemoOrganization() {
  const passwordHash = await hashPassword('Admin@123')

  let [organization] = await db.select().from(organizations).where(eq(organizations.slug, 'transitops-demo'))
  if (!organization) {
    ;[organization] = await db.insert(organizations).values({
      name: 'TransitOps Demo',
      slug: 'transitops-demo',
      contactEmail: 'ops@transitops-demo.com',
      status: 'active',
    }).returning()
  }

  const ensureUser = async (payload: {
    name: string
    email: string
    roleCodes: string[]
  }) => {
    let [user] = await db.select().from(users).where(eq(users.email, payload.email))
    if (!user) {
      ;[user] = await db.insert(users).values({
        organizationId: organization.id,
        name: payload.name,
        email: payload.email,
        passwordHash,
        status: 'active',
        emailVerifiedAt: new Date(),
      }).returning()
    } else {
      ;[user] = await db
        .update(users)
        .set({
          organizationId: organization.id,
          name: payload.name,
          passwordHash,
          status: 'active',
          emailVerifiedAt: user.emailVerifiedAt ?? new Date(),
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id))
        .returning()
    }

    const roles = await accessRepository.getRolesByCodes(payload.roleCodes)
    await accessRepository.replaceUserRoles(user.id, roles.map((role: { id: number }) => role.id))
    return user
  }

  const manager = await ensureUser({
    name: 'Fleet Manager',
    email: 'manager@transitops.com',
    roleCodes: [ROLE_CODES.FLEET_MANAGER],
  })

  await ensureUser({
    name: 'Dispatcher',
    email: 'dispatcher@transitops.com',
    roleCodes: [ROLE_CODES.DISPATCHER],
  })

  await ensureUser({
    name: 'Safety Officer',
    email: 'safety@transitops.com',
    roleCodes: [ROLE_CODES.SAFETY_OFFICER],
  })

  await ensureUser({
    name: 'Financial Analyst',
    email: 'analyst@transitops.com',
    roleCodes: [ROLE_CODES.FINANCIAL_ANALYST],
  })

  const existingVehicles = await db.select().from(vehicles).where(eq(vehicles.organizationId, organization.id))
  if (existingVehicles.length) {
    return
  }

  const [vehicleA] = await db.insert(vehicles).values({
    organizationId: organization.id,
    registrationNumber: 'MH12AB1234',
    model: 'Volvo FH16',
    vehicleType: 'Truck',
    maxCapacity: '12000',
    currentOdometer: '152340',
    acquisitionCost: '150000',
    region: 'West',
    status: 'available',
    createdBy: manager.id,
  }).returning()

  const [vehicleB] = await db.insert(vehicles).values({
    organizationId: organization.id,
    registrationNumber: 'DL04CD5678',
    model: 'Ashok Leyland Dost',
    vehicleType: 'Light Truck',
    maxCapacity: '2500',
    currentOdometer: '83420',
    acquisitionCost: '42000',
    region: 'North',
    status: 'in_shop',
    createdBy: manager.id,
  }).returning()

  const [vehicleC] = await db.insert(vehicles).values({
    organizationId: organization.id,
    registrationNumber: 'KA09EF9876',
    model: 'Tata Signa 5530',
    vehicleType: 'Truck',
    maxCapacity: '18000',
    currentOdometer: '224510',
    acquisitionCost: '198000',
    region: 'South',
    status: 'on_trip',
    createdBy: manager.id,
  }).returning()

  const [driverA] = await db.insert(drivers).values({
    organizationId: organization.id,
    name: 'Amit Kumar',
    employeeId: 'DRV-001',
    phone: '9876543210',
    email: 'amit.driver@transitops.com',
    licenseNumber: 'LIC-001',
    licenseCategory: 'HMV',
    licenseExpiry: '2028-06-30',
    joiningDate: '2025-01-10',
    safetyScore: '94',
    status: 'available',
    createdBy: manager.id,
  }).returning()

  const [driverB] = await db.insert(drivers).values({
    organizationId: organization.id,
    name: 'Neha Sharma',
    employeeId: 'DRV-002',
    phone: '9898989898',
    email: 'neha.driver@transitops.com',
    licenseNumber: 'LIC-002',
    licenseCategory: 'HMV',
    licenseExpiry: '2027-12-31',
    joiningDate: '2024-03-05',
    safetyScore: '88',
    status: 'on_trip',
    createdBy: manager.id,
  }).returning()

  await db.insert(maintenanceLogs).values({
    organizationId: organization.id,
    vehicleId: vehicleB.id,
    description: 'Brake pad replacement and general workshop inspection',
    cost: '12500',
    openedAt: '2026-07-10',
    status: 'open',
    createdBy: manager.id,
  })

  const [draftTrip] = await db.insert(trips).values({
    organizationId: organization.id,
    source: 'Pune Depot',
    destination: 'Mumbai Hub',
    vehicleId: vehicleA.id,
    driverId: driverA.id,
    createdBy: manager.id,
    cargoWeight: '4500',
    plannedDistance: '165',
    revenue: '25000',
    status: 'draft',
    notes: 'Consumer goods delivery',
  }).returning()

  const [dispatchedTrip] = await db.insert(trips).values({
    organizationId: organization.id,
    source: 'Bengaluru Yard',
    destination: 'Chennai Port',
    vehicleId: vehicleC.id,
    driverId: driverB.id,
    createdBy: manager.id,
    cargoWeight: '9200',
    plannedDistance: '348',
    actualDistance: '0',
    revenue: '48000',
    fuelConsumed: '0',
    startOdometer: vehicleC.currentOdometer,
    status: 'dispatched',
    dispatchedAt: new Date(),
    notes: 'Time-sensitive electronics shipment',
  }).returning()

  await db.insert(fuelLogs).values([
    {
      organizationId: organization.id,
      vehicleId: vehicleA.id,
      tripId: draftTrip.id,
      liters: '110',
      cost: '9800',
      odometer: '152340',
      date: '2026-07-11',
      createdBy: manager.id,
    },
    {
      organizationId: organization.id,
      vehicleId: vehicleC.id,
      tripId: dispatchedTrip.id,
      liters: '180',
      cost: '16200',
      odometer: '224510',
      date: '2026-07-12',
      createdBy: manager.id,
    },
  ])

  await db.insert(expenses).values([
    {
      organizationId: organization.id,
      vehicleId: vehicleA.id,
      tripId: draftTrip.id,
      type: 'toll',
      amount: '1200',
      date: '2026-07-11',
      notes: 'Expressway toll charges',
      createdBy: manager.id,
    },
    {
      organizationId: organization.id,
      vehicleId: vehicleB.id,
      type: 'maintenance',
      amount: '12500',
      date: '2026-07-10',
      notes: 'Brake replacement invoice',
      createdBy: manager.id,
    },
  ])
}

async function seed() {
  await bootstrapService.initializeAccessControl()
  await bootstrapService.ensureSuperAdmin()
  await seedDemoOrganization()

  process.stdout.write('Seed complete.\n')
  process.stdout.write('Super Admin: admin@transitops.com / Admin@123\n')
  process.stdout.write('Fleet Manager: manager@transitops.com / Admin@123\n')
  process.stdout.write('Dispatcher: dispatcher@transitops.com / Admin@123\n')
  process.stdout.write('Safety Officer: safety@transitops.com / Admin@123\n')
  process.stdout.write('Financial Analyst: analyst@transitops.com / Admin@123\n')
  process.exit(0)
}

seed().catch((error) => {
  process.stderr.write(`Seed failed: ${String(error)}\n`)
  process.exit(1)
})

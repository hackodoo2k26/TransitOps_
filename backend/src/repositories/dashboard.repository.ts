import { eq, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { drivers, expenses, fuelLogs, maintenanceLogs, organizations, trips, vehicles } from "../db/schema.js";

export class DashboardRepository {
  async getOrganizationKpis(organizationId: number) {
    const [vehicleStats] = await db
      .select({
        available: sql<number>`count(*) filter (where ${vehicles.status} = 'available')::int`,
        onTrip: sql<number>`count(*) filter (where ${vehicles.status} = 'on_trip')::int`,
        inShop: sql<number>`count(*) filter (where ${vehicles.status} = 'in_shop')::int`,
      })
      .from(vehicles)
      .where(eq(vehicles.organizationId, organizationId));

    const [driverStats] = await db
      .select({
        available: sql<number>`count(*) filter (where ${drivers.status} = 'available')::int`,
        onTrip: sql<number>`count(*) filter (where ${drivers.status} = 'on_trip')::int`,
        offDuty: sql<number>`count(*) filter (where ${drivers.status} = 'off_duty')::int`,
        suspended: sql<number>`count(*) filter (where ${drivers.status} = 'suspended')::int`,
      })
      .from(drivers)
      .where(eq(drivers.organizationId, organizationId));

    const [tripStats] = await db
      .select({
        pending: sql<number>`count(*) filter (where ${trips.status} = 'draft')::int`,
        completed: sql<number>`count(*) filter (where ${trips.status} = 'completed')::int`,
        cancelled: sql<number>`count(*) filter (where ${trips.status} = 'cancelled')::int`,
      })
      .from(trips)
      .where(eq(trips.organizationId, organizationId));

    const [costs] = await db
      .select({
        fuelCost: sql<string>`coalesce(sum(${fuelLogs.cost}), 0)::text`,
        maintenanceCost: sql<string>`coalesce(sum(${maintenanceLogs.cost}), 0)::text`,
        expenseCost: sql<string>`coalesce(sum(${expenses.amount}), 0)::text`,
      })
      .from(fuelLogs)
      .leftJoin(maintenanceLogs, eq(maintenanceLogs.organizationId, fuelLogs.organizationId))
      .leftJoin(expenses, eq(expenses.organizationId, fuelLogs.organizationId))
      .where(eq(fuelLogs.organizationId, organizationId));

    return { vehicleStats, driverStats, tripStats, costs };
  }

  async getGlobalStats() {
    const [orgStats] = await db
      .select({
        totalOrganizations: sql<number>`count(*)::int`,
        activeOrganizations: sql<number>`count(*) filter (where ${organizations.status} = 'active')::int`,
        suspendedOrganizations: sql<number>`count(*) filter (where ${organizations.status} = 'suspended')::int`,
      })
      .from(organizations);

    return orgStats;
  }
}

export const dashboardRepository = new DashboardRepository();


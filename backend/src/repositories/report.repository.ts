import { eq, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { expenses, fuelLogs, maintenanceLogs, trips, vehicles } from "../db/schema.js";

export class ReportRepository {
  async getFuelEfficiency(organizationId: number) {
    return db
      .select({
        vehicleId: trips.vehicleId,
        totalDistance: sql<string>`coalesce(sum(${trips.actualDistance}), 0)::text`,
        totalFuel: sql<string>`coalesce(sum(${trips.fuelConsumed}), 0)::text`,
        efficiency: sql<string>`case when coalesce(sum(${trips.fuelConsumed}), 0) = 0 then '0' else (sum(${trips.actualDistance}) / sum(${trips.fuelConsumed}))::text end`,
      })
      .from(trips)
      .where(eq(trips.organizationId, organizationId))
      .groupBy(trips.vehicleId);
  }

  async getFleetUtilization(organizationId: number) {
    return db
      .select({
        vehicleId: vehicles.id,
        registrationNumber: vehicles.registrationNumber,
        tripCount: sql<number>`count(${trips.id})::int`,
        revenue: sql<string>`coalesce(sum(${trips.revenue}), 0)::text`,
      })
      .from(vehicles)
      .leftJoin(trips, eq(trips.vehicleId, vehicles.id))
      .where(eq(vehicles.organizationId, organizationId))
      .groupBy(vehicles.id, vehicles.registrationNumber);
  }

  async getVehicleRoi(organizationId: number) {
    return db
      .select({
        vehicleId: vehicles.id,
        registrationNumber: vehicles.registrationNumber,
        acquisitionCost: vehicles.acquisitionCost,
        revenue: sql<string>`coalesce(sum(${trips.revenue}), 0)::text`,
        expenses: sql<string>`coalesce(sum(${expenses.amount}), 0)::text`,
      })
      .from(vehicles)
      .leftJoin(trips, eq(trips.vehicleId, vehicles.id))
      .leftJoin(expenses, eq(expenses.vehicleId, vehicles.id))
      .where(eq(vehicles.organizationId, organizationId))
      .groupBy(vehicles.id, vehicles.registrationNumber, vehicles.acquisitionCost);
  }

  async getOperationalCost(organizationId: number) {
    return db
      .select({
        vehicleId: vehicles.id,
        registrationNumber: vehicles.registrationNumber,
        fuelCost: sql<string>`coalesce(sum(${fuelLogs.cost}), 0)::text`,
        maintenanceCost: sql<string>`coalesce(sum(${maintenanceLogs.cost}), 0)::text`,
        expenseCost: sql<string>`coalesce(sum(${expenses.amount}), 0)::text`,
      })
      .from(vehicles)
      .leftJoin(fuelLogs, eq(fuelLogs.vehicleId, vehicles.id))
      .leftJoin(maintenanceLogs, eq(maintenanceLogs.vehicleId, vehicles.id))
      .leftJoin(expenses, eq(expenses.vehicleId, vehicles.id))
      .where(eq(vehicles.organizationId, organizationId))
      .groupBy(vehicles.id, vehicles.registrationNumber);
  }

  async getMonthlyExpenses(organizationId: number) {
    return db
      .select({
        month: sql<string>`to_char(${expenses.date}, 'YYYY-MM')`,
        type: expenses.type,
        totalAmount: sql<string>`coalesce(sum(${expenses.amount}), 0)::text`,
      })
      .from(expenses)
      .where(eq(expenses.organizationId, organizationId))
      .groupBy(sql`to_char(${expenses.date}, 'YYYY-MM')`, expenses.type)
      .orderBy(sql`to_char(${expenses.date}, 'YYYY-MM') desc`);
  }
}

export const reportRepository = new ReportRepository();


import "dotenv/config";
import { db } from "./db/index.js";
import { users, vehicles, drivers, trips, maintenanceLogs, fuelLogs, expenses } from "./db/schema.js";
import { hashPassword } from "./auth.js";

async function seed() {
  console.log("Seeding database...");

  const pwd = await hashPassword("password123");

  const [fm] = await db.insert(users).values({
    name: "Fleet Manager", email: "manager@transitops.com",
    passwordHash: pwd, role: "fleet_manager",
  }).returning();

  await db.insert(users).values([
    { name: "Driver User", email: "driver@transitops.com", passwordHash: pwd, role: "driver" },
    { name: "Safety Officer", email: "safety@transitops.com", passwordHash: pwd, role: "safety_officer" },
    { name: "Financial Analyst", email: "analyst@transitops.com", passwordHash: pwd, role: "financial_analyst" },
  ]).returning();

  const [v1] = await db.insert(vehicles).values({
    registrationNumber: "VAN-05", modelName: "Ford Transit 350", type: "van",
    maxLoadCapacity: "500", odometer: "45230", acquisitionCost: "35000", region: "North", status: "available",
  }).returning();

  const [v2] = await db.insert(vehicles).values({
    registrationNumber: "TRK-12", modelName: "Volvo FH16", type: "truck",
    maxLoadCapacity: "12000", odometer: "128500", acquisitionCost: "150000", region: "South", status: "on_trip",
  }).returning();

  await db.insert(vehicles).values([
    { registrationNumber: "BUS-08", modelName: "Mercedes Sprinter", type: "bus", maxLoadCapacity: "2000", odometer: "89200", acquisitionCost: "65000", region: "East", status: "in_shop" },
    { registrationNumber: "VAN-03", modelName: "RAM ProMaster", type: "van", maxLoadCapacity: "600", odometer: "31500", acquisitionCost: "42000", region: "West", status: "retired" },
    { registrationNumber: "TRK-07", modelName: "Scania R500", type: "truck", maxLoadCapacity: "15000", odometer: "67200", acquisitionCost: "175000", region: "North", status: "available" },
  ]);

  const [d1] = await db.insert(drivers).values({
    name: "Alex Johnson", licenseNumber: "LIC-12345", licenseCategory: "Class C",
    licenseExpiryDate: "2027-06-15", contactNumber: "+1-555-0101", safetyScore: "95", status: "available",
  }).returning();

  const [d2] = await db.insert(drivers).values({
    name: "Sarah Chen", licenseNumber: "LIC-12346", licenseCategory: "Class A",
    licenseExpiryDate: "2026-03-22", contactNumber: "+1-555-0102", safetyScore: "88", status: "on_trip",
  }).returning();

  await db.insert(drivers).values([
    { name: "Mike Rivera", licenseNumber: "LIC-12347", licenseCategory: "Class B", licenseExpiryDate: "2027-11-30", contactNumber: "+1-555-0103", safetyScore: "72", status: "off_duty" },
    { name: "Emma Wilson", licenseNumber: "LIC-12348", licenseCategory: "Class C", licenseExpiryDate: "2025-01-10", contactNumber: "+1-555-0104", safetyScore: "91", status: "suspended" },
  ]);

  const [t1] = await db.insert(trips).values({
    source: "Warehouse A - North", destination: "Distribution Center 3",
    vehicleId: v2.id, driverId: d2.id, userId: fm.id,
    cargoWeight: "8500", plannedDistance: "340", startOdometer: "128500", status: "dispatched",
  }).returning();

  await db.insert(trips).values([
    { source: "Depot Main", destination: "Retail Hub 7", vehicleId: v1.id, driverId: d1.id, userId: fm.id, cargoWeight: "320", plannedDistance: "85", startOdometer: "45230", endOdometer: "45350", fuelConsumed: "18.5", revenue: "1200", status: "completed" },
    { source: "Port Terminal", destination: "City Depot", vehicleId: v1.id, driverId: d1.id, userId: fm.id, cargoWeight: "150", plannedDistance: "45", status: "draft" },
  ]);

  await db.insert(maintenanceLogs).values([
    { vehicleId: v2.id, description: "Oil change and brake pad replacement", cost: "450", date: "2026-07-08", status: "active" },
    { vehicleId: v1.id, description: "Tire rotation and alignment", cost: "200", date: "2026-06-20", status: "closed" },
    { vehicleId: v2.id, description: "Annual safety inspection", cost: "350", date: "2026-07-01", status: "closed" },
  ]);

  await db.insert(fuelLogs).values([
    { vehicleId: v2.id, liters: "180", cost: "315", date: "2026-07-11" },
    { vehicleId: v1.id, tripId: t1.id, liters: "55", cost: "96.25", date: "2026-07-10" },
    { vehicleId: v2.id, liters: "240", cost: "420", date: "2026-07-09" },
  ]);

  await db.insert(expenses).values([
    { vehicleId: v2.id, type: "toll", amount: "45", date: "2026-07-11" },
    { vehicleId: v1.id, type: "parking", amount: "12", date: "2026-07-10" },
    { vehicleId: v2.id, type: "toll", amount: "55", date: "2026-07-09" },
    { vehicleId: v2.id, type: "misc", amount: "30", date: "2026-07-08" },
  ]);

  console.log("Seed complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});

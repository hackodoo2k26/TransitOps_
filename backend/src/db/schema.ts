import {
  pgTable, serial, text, numeric, date, timestamp, integer,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role", {
    enum: ["fleet_manager", "driver", "safety_officer", "financial_analyst"],
  }).notNull().default("driver"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const vehicles = pgTable("vehicles", {
  id: serial("id").primaryKey(),
  registrationNumber: text("registration_number").notNull().unique(),
  modelName: text("model_name").notNull(),
  type: text("type", { enum: ["van", "truck", "bus", "car"] }).notNull().default("van"),
  maxLoadCapacity: numeric("max_load_capacity", { precision: 10, scale: 2 }).notNull(),
  odometer: numeric("odometer", { precision: 10, scale: 2 }).default("0"),
  acquisitionCost: numeric("acquisition_cost", { precision: 12, scale: 2 }).default("0"),
  region: text("region"),
  status: text("status", {
    enum: ["available", "on_trip", "in_shop", "retired"],
  }).notNull().default("available"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const drivers = pgTable("drivers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  licenseNumber: text("license_number").notNull(),
  licenseCategory: text("license_category").notNull(),
  licenseExpiryDate: date("license_expiry_date").notNull(),
  contactNumber: text("contact_number"),
  safetyScore: numeric("safety_score", { precision: 5, scale: 2 }).default("100"),
  status: text("status", {
    enum: ["available", "on_trip", "off_duty", "suspended"],
  }).notNull().default("available"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const trips = pgTable("trips", {
  id: serial("id").primaryKey(),
  source: text("source").notNull(),
  destination: text("destination").notNull(),
  vehicleId: integer("vehicle_id").references(() => vehicles.id),
  driverId: integer("driver_id").references(() => drivers.id),
  userId: integer("user_id").references(() => users.id),
  cargoWeight: numeric("cargo_weight", { precision: 10, scale: 2 }),
  plannedDistance: numeric("planned_distance", { precision: 10, scale: 2 }),
  startOdometer: numeric("start_odometer", { precision: 10, scale: 2 }),
  endOdometer: numeric("end_odometer", { precision: 10, scale: 2 }),
  fuelConsumed: numeric("fuel_consumed", { precision: 10, scale: 2 }),
  revenue: numeric("revenue", { precision: 12, scale: 2 }),
  status: text("status", {
    enum: ["draft", "dispatched", "completed", "cancelled"],
  }).notNull().default("draft"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const maintenanceLogs = pgTable("maintenance_logs", {
  id: serial("id").primaryKey(),
  vehicleId: integer("vehicle_id").references(() => vehicles.id).notNull(),
  description: text("description").notNull(),
  cost: numeric("cost", { precision: 10, scale: 2 }).notNull(),
  date: date("date").notNull(),
  status: text("status", { enum: ["active", "closed"] }).notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const fuelLogs = pgTable("fuel_logs", {
  id: serial("id").primaryKey(),
  vehicleId: integer("vehicle_id").references(() => vehicles.id).notNull(),
  tripId: integer("trip_id").references(() => trips.id),
  liters: numeric("liters", { precision: 10, scale: 2 }).notNull(),
  cost: numeric("cost", { precision: 10, scale: 2 }).notNull(),
  date: date("date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  vehicleId: integer("vehicle_id").references(() => vehicles.id).notNull(),
  type: text("type", { enum: ["toll", "parking", "misc"] }).notNull().default("misc"),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  date: date("date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const vehiclesRelations = relations(vehicles, ({ many }) => ({
  trips: many(trips),
  maintenanceLogs: many(maintenanceLogs),
  fuelLogs: many(fuelLogs),
  expenses: many(expenses),
}));

export const driversRelations = relations(drivers, ({ many }) => ({
  trips: many(trips),
}));

export const tripsRelations = relations(trips, ({ one }) => ({
  vehicle: one(vehicles, { fields: [trips.vehicleId], references: [vehicles.id] }),
  driver: one(drivers, { fields: [trips.driverId], references: [drivers.id] }),
  user: one(users, { fields: [trips.userId], references: [users.id] }),
}));

import { Router, Request, Response } from "express";
import { db } from "../db/index.js";
import { trips, vehicles, drivers } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { authMiddleware, requireRole } from "../auth.js";

const router = Router();
router.use(authMiddleware);

router.get("/", async (req: Request, res: Response) => {
  const user = (req as any).user;
  const where = user.role === "driver" ? eq(trips.driverId, user.userId) : undefined;
  const rows = await db.select().from(trips)
    .where(where)
    .orderBy(trips.createdAt);
  res.json(rows);
});

router.get("/:id", async (req: Request, res: Response) => {
  const [row] = await db.select().from(trips).where(eq(trips.id, Number(req.params.id)));
  if (!row) { res.status(404).json({ error: "Trip not found" }); return; }
  res.json(row);
});

router.post("/", requireRole("super_admin", "fleet_manager", "dispatcher"), async (req: Request, res: Response) => {
  const data = { ...req.body, userId: (req as any).user.userId, status: "draft" };
  if (data.cargoWeight && data.vehicleId) {
    const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, data.vehicleId));
    if (vehicle && Number(data.cargoWeight) > Number(vehicle.maxLoadCapacity)) {
      res.status(400).json({ error: `Cargo weight exceeds vehicle capacity (${vehicle.maxLoadCapacity} kg)` });
      return;
    }
  }
  const [row] = await db.insert(trips).values(data).returning();
  res.status(201).json(row);
});

router.post("/:id/dispatch", requireRole("super_admin", "fleet_manager", "dispatcher"), async (req: Request, res: Response) => {
  const [trip] = await db.select().from(trips).where(eq(trips.id, Number(req.params.id)));
  if (!trip) { res.status(404).json({ error: "Trip not found" }); return; }
  if (trip.status !== "draft") { res.status(400).json({ error: "Only draft trips can be dispatched" }); return; }

  const driverId = trip.driverId!;
  const vehicleId = trip.vehicleId!;
  const [driver] = await db.select().from(drivers).where(eq(drivers.id, driverId));
  const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, vehicleId));

  if (!driver || !vehicle) { res.status(400).json({ error: "Driver or vehicle not found" }); return; }
  if (driver.status === "suspended") { res.status(400).json({ error: "Suspended driver cannot be assigned" }); return; }
  if (new Date(driver.licenseExpiryDate) < new Date()) { res.status(400).json({ error: "Driver license is expired" }); return; }
  if (vehicle.status === "retired" || vehicle.status === "in_shop") { res.status(400).json({ error: `Vehicle is ${vehicle.status}` }); return; }

  await db.update(trips).set({ status: "dispatched", startOdometer: req.body.startOdometer || vehicle.odometer }).where(eq(trips.id, trip.id));
  await db.update(drivers).set({ status: "on_trip" }).where(eq(drivers.id, driver.id));
  await db.update(vehicles).set({ status: "on_trip" }).where(eq(vehicles.id, vehicle.id));

  const [updated] = await db.select().from(trips).where(eq(trips.id, trip.id));
  res.json(updated);
});

router.post("/:id/complete", requireRole("super_admin", "fleet_manager", "dispatcher", "driver"), async (req: Request, res: Response) => {
  const [trip] = await db.select().from(trips).where(eq(trips.id, Number(req.params.id)));
  if (!trip) { res.status(404).json({ error: "Trip not found" }); return; }
  if (trip.status !== "dispatched") { res.status(400).json({ error: "Only dispatched trips can be completed" }); return; }
  if (!req.body.endOdometer) { res.status(400).json({ error: "End odometer required" }); return; }

  await db.update(trips).set({ status: "completed", ...req.body }).where(eq(trips.id, trip.id));
  if (trip.driverId != null) await db.update(drivers).set({ status: "available" }).where(eq(drivers.id, trip.driverId));
  if (trip.vehicleId != null) {
    await db.update(vehicles).set({ status: "available", odometer: req.body.endOdometer }).where(eq(vehicles.id, trip.vehicleId));
  }

  const [updated] = await db.select().from(trips).where(eq(trips.id, trip.id));
  res.json(updated);
});

router.post("/:id/cancel", requireRole("super_admin", "fleet_manager", "dispatcher"), async (req: Request, res: Response) => {
  const [trip] = await db.select().from(trips).where(eq(trips.id, Number(req.params.id)));
  if (!trip) { res.status(404).json({ error: "Trip not found" }); return; }
  if (trip.status === "completed") { res.status(400).json({ error: "Completed trips cannot be cancelled" }); return; }

  await db.update(trips).set({ status: "cancelled" }).where(eq(trips.id, trip.id));
  if (trip.driverId != null) {
    const [d] = await db.select().from(drivers).where(eq(drivers.id, trip.driverId));
    if (d?.status === "on_trip") await db.update(drivers).set({ status: "available" }).where(eq(drivers.id, trip.driverId));
  }
  if (trip.vehicleId != null) {
    const [v] = await db.select().from(vehicles).where(eq(vehicles.id, trip.vehicleId));
    if (v?.status === "on_trip") await db.update(vehicles).set({ status: "available" }).where(eq(vehicles.id, trip.vehicleId));
  }

  const [updated] = await db.select().from(trips).where(eq(trips.id, trip.id));
  res.json(updated);
});

export default router;

import { Router, Request, Response } from "express";
import { db } from "../db/index.js";
import { drivers } from "../db/schema.js";
import { eq, sql } from "drizzle-orm";
import { authMiddleware, requireRole } from "../auth.js";

const router = Router();
router.use(authMiddleware);

router.get("/", async (_req: Request, res: Response) => {
  const rows = await db.select().from(drivers).orderBy(drivers.name);
  res.json(rows);
});

router.get("/available", async (_req: Request, res: Response) => {
  const rows = await db.select().from(drivers)
    .where(sql`${drivers.status} = 'available' AND ${drivers.licenseExpiryDate} >= CURRENT_DATE`)
    .orderBy(drivers.name);
  res.json(rows);
});

router.get("/:id", async (req: Request, res: Response) => {
  const [row] = await db.select().from(drivers).where(eq(drivers.id, Number(req.params.id)));
  if (!row) { res.status(404).json({ error: "Driver not found" }); return; }
  res.json(row);
});

router.post("/", requireRole("super_admin", "fleet_manager"), async (req: Request, res: Response) => {
  const [row] = await db.insert(drivers).values(req.body).returning();
  res.status(201).json(row);
});

router.put("/:id", requireRole("super_admin", "fleet_manager"), async (req: Request, res: Response) => {
  const [row] = await db.update(drivers).set(req.body)
    .where(eq(drivers.id, Number(req.params.id))).returning();
  if (!row) { res.status(404).json({ error: "Driver not found" }); return; }
  res.json(row);
});

router.put("/:id/status", requireRole("super_admin", "fleet_manager"), async (req: Request, res: Response) => {
  const { status } = req.body;
  if (!status) { res.status(400).json({ error: "Status required" }); return; }
  const validStatuses = ["available", "on_trip", "off_duty", "suspended"];
  if (!validStatuses.includes(status)) { res.status(400).json({ error: "Invalid status" }); return; }
  const [row] = await db.update(drivers).set({ status })
    .where(eq(drivers.id, Number(req.params.id))).returning();
  if (!row) { res.status(404).json({ error: "Driver not found" }); return; }
  res.json(row);
});

router.post("/:id/suspend", requireRole("super_admin", "safety_officer"), async (req: Request, res: Response) => {
  const [row] = await db.select().from(drivers).where(eq(drivers.id, Number(req.params.id)));
  if (!row) { res.status(404).json({ error: "Driver not found" }); return; }
  if (row.status === "suspended") { res.status(400).json({ error: "Driver is already suspended" }); return; }
  if (row.status === "on_trip") { res.status(400).json({ error: "Cannot suspend a driver who is on a trip" }); return; }
  const [updated] = await db.update(drivers).set({ status: "suspended" })
    .where(eq(drivers.id, row.id)).returning();
  res.json(updated);
});

router.delete("/:id", requireRole("super_admin", "fleet_manager"), async (req: Request, res: Response) => {
  const [row] = await db.delete(drivers).where(eq(drivers.id, Number(req.params.id))).returning();
  if (!row) { res.status(404).json({ error: "Driver not found" }); return; }
  res.json({ deleted: true });
});

export default router;

import { Router, Request, Response } from "express";
import { db } from "../db/index.js";
import { maintenanceLogs, vehicles } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { authMiddleware, requireRole } from "../auth.js";

const router = Router();
router.use(authMiddleware);

router.get("/", async (_req: Request, res: Response) => {
  const rows = await db.select().from(maintenanceLogs).orderBy(maintenanceLogs.date);
  res.json(rows);
});

router.get("/:id", async (req: Request, res: Response) => {
  const [row] = await db.select().from(maintenanceLogs).where(eq(maintenanceLogs.id, Number(req.params.id)));
  if (!row) { res.status(404).json({ error: "Maintenance log not found" }); return; }
  res.json(row);
});

router.post("/", requireRole("fleet_manager"), async (req: Request, res: Response) => {
  const data = req.body;
  const [row] = await db.insert(maintenanceLogs).values(data).returning();
  if (row.status === "active") {
    await db.update(vehicles).set({ status: "in_shop" }).where(eq(vehicles.id, row.vehicleId));
  }
  res.status(201).json(row);
});

router.put("/:id", requireRole("fleet_manager"), async (req: Request, res: Response) => {
  const [row] = await db.update(maintenanceLogs).set(req.body)
    .where(eq(maintenanceLogs.id, Number(req.params.id))).returning();
  if (!row) { res.status(404).json({ error: "Maintenance log not found" }); return; }
  res.json(row);
});

router.post("/:id/close", requireRole("fleet_manager"), async (req: Request, res: Response) => {
  const [log] = await db.select().from(maintenanceLogs).where(eq(maintenanceLogs.id, Number(req.params.id)));
  if (!log) { res.status(404).json({ error: "Maintenance log not found" }); return; }
  if (log.status !== "active") { res.status(400).json({ error: "Only active logs can be closed" }); return; }

  const [row] = await db.update(maintenanceLogs).set({ status: "closed" })
    .where(eq(maintenanceLogs.id, log.id)).returning();

  const [v] = await db.select().from(vehicles).where(eq(vehicles.id, log.vehicleId));
  if (v && v.status !== "retired") {
    await db.update(vehicles).set({ status: "available" }).where(eq(vehicles.id, log.vehicleId));
  }

  res.json(row);
});

export default router;

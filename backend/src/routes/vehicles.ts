import { Router, Request, Response } from "express";
import { db } from "../db/index.js";
import { vehicles } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { authMiddleware, requireRole } from "../auth.js";

const router = Router();
router.use(authMiddleware);

router.get("/", async (_req: Request, res: Response) => {
  const rows = await db.select().from(vehicles).orderBy(vehicles.registrationNumber);
  res.json(rows);
});

router.get("/available", async (_req: Request, res: Response) => {
  const rows = await db.select().from(vehicles)
    .where(eq(vehicles.status, "available"))
    .orderBy(vehicles.registrationNumber);
  res.json(rows);
});

router.get("/:id", async (req: Request, res: Response) => {
  const [row] = await db.select().from(vehicles).where(eq(vehicles.id, Number(req.params.id)));
  if (!row) { res.status(404).json({ error: "Vehicle not found" }); return; }
  res.json(row);
});

router.post("/", requireRole("super_admin", "fleet_manager"), async (req: Request, res: Response) => {
  const [row] = await db.insert(vehicles).values(req.body).returning();
  res.status(201).json(row);
});

router.put("/:id", requireRole("super_admin", "fleet_manager"), async (req: Request, res: Response) => {
  const [row] = await db.update(vehicles).set(req.body)
    .where(eq(vehicles.id, Number(req.params.id))).returning();
  if (!row) { res.status(404).json({ error: "Vehicle not found" }); return; }
  res.json(row);
});

router.post("/:id/retire", requireRole("super_admin", "fleet_manager"), async (req: Request, res: Response) => {
  const [row] = await db.select().from(vehicles).where(eq(vehicles.id, Number(req.params.id)));
  if (!row) { res.status(404).json({ error: "Vehicle not found" }); return; }
  if (row.status === "on_trip") { res.status(400).json({ error: "Cannot retire a vehicle that is on a trip" }); return; }
  const [updated] = await db.update(vehicles).set({ status: "retired" })
    .where(eq(vehicles.id, row.id)).returning();
  res.json(updated);
});

router.delete("/:id", requireRole("super_admin", "fleet_manager"), async (req: Request, res: Response) => {
  const [row] = await db.delete(vehicles).where(eq(vehicles.id, Number(req.params.id))).returning();
  if (!row) { res.status(404).json({ error: "Vehicle not found" }); return; }
  res.json({ deleted: true });
});

export default router;

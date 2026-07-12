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

router.post("/", requireRole("fleet_manager"), async (req: Request, res: Response) => {
  const data = req.body;
  const [row] = await db.insert(drivers).values(data).returning();
  res.status(201).json(row);
});

router.put("/:id", requireRole("fleet_manager"), async (req: Request, res: Response) => {
  const [row] = await db.update(drivers).set(req.body)
    .where(eq(drivers.id, Number(req.params.id))).returning();
  if (!row) { res.status(404).json({ error: "Driver not found" }); return; }
  res.json(row);
});

router.delete("/:id", requireRole("fleet_manager"), async (req: Request, res: Response) => {
  const [row] = await db.delete(drivers).where(eq(drivers.id, Number(req.params.id))).returning();
  if (!row) { res.status(404).json({ error: "Driver not found" }); return; }
  res.json({ deleted: true });
});

export default router;

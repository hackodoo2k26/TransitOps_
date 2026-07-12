import { Router, Request, Response } from "express";
import { db } from "../db/index.js";
import { fuelLogs } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { authMiddleware, requireRole } from "../auth.js";

const router = Router();
router.use(authMiddleware);

router.get("/", async (_req: Request, res: Response) => {
  const rows = await db.select().from(fuelLogs).orderBy(fuelLogs.date);
  res.json(rows);
});

router.get("/:id", async (req: Request, res: Response) => {
  const [row] = await db.select().from(fuelLogs).where(eq(fuelLogs.id, Number(req.params.id)));
  if (!row) { res.status(404).json({ error: "Fuel log not found" }); return; }
  res.json(row);
});

router.post("/", requireRole("fleet_manager", "financial_analyst"), async (req: Request, res: Response) => {
  const [row] = await db.insert(fuelLogs).values(req.body).returning();
  res.status(201).json(row);
});

router.put("/:id", requireRole("fleet_manager"), async (req: Request, res: Response) => {
  const [row] = await db.update(fuelLogs).set(req.body)
    .where(eq(fuelLogs.id, Number(req.params.id))).returning();
  if (!row) { res.status(404).json({ error: "Fuel log not found" }); return; }
  res.json(row);
});

router.delete("/:id", requireRole("fleet_manager"), async (req: Request, res: Response) => {
  const [row] = await db.delete(fuelLogs).where(eq(fuelLogs.id, Number(req.params.id))).returning();
  if (!row) { res.status(404).json({ error: "Fuel log not found" }); return; }
  res.json({ deleted: true });
});

export default router;

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

router.post("/", requireRole("fleet_manager"), async (req: Request, res: Response) => {
  const data = req.body;
  const [row] = await db.insert(vehicles).values(data).returning();
  res.status(201).json(row);
});

router.put("/:id", requireRole("fleet_manager"), async (req: Request, res: Response) => {
  const [row] = await db.update(vehicles).set(req.body)
    .where(eq(vehicles.id, Number(req.params.id))).returning();
  if (!row) { res.status(404).json({ error: "Vehicle not found" }); return; }
  res.json(row);
});

router.delete("/:id", requireRole("fleet_manager"), async (req: Request, res: Response) => {
  const [row] = await db.delete(vehicles).where(eq(vehicles.id, Number(req.params.id))).returning();
  if (!row) { res.status(404).json({ error: "Vehicle not found" }); return; }
  res.json({ deleted: true });
});

export default router;

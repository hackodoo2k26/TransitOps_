import { Router, Request, Response } from "express";
import { db } from "../db/index.js";
import { expenses } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { authMiddleware, requireRole } from "../auth.js";

const router = Router();
router.use(authMiddleware);

router.get("/", async (_req: Request, res: Response) => {
  const rows = await db.select().from(expenses).orderBy(expenses.date);
  res.json(rows);
});

router.get("/:id", async (req: Request, res: Response) => {
  const [row] = await db.select().from(expenses).where(eq(expenses.id, Number(req.params.id)));
  if (!row) { res.status(404).json({ error: "Expense not found" }); return; }
  res.json(row);
});

router.post("/", requireRole("fleet_manager", "financial_analyst"), async (req: Request, res: Response) => {
  const [row] = await db.insert(expenses).values(req.body).returning();
  res.status(201).json(row);
});

router.put("/:id", requireRole("fleet_manager"), async (req: Request, res: Response) => {
  const [row] = await db.update(expenses).set(req.body)
    .where(eq(expenses.id, Number(req.params.id))).returning();
  if (!row) { res.status(404).json({ error: "Expense not found" }); return; }
  res.json(row);
});

router.delete("/:id", requireRole("fleet_manager"), async (req: Request, res: Response) => {
  const [row] = await db.delete(expenses).where(eq(expenses.id, Number(req.params.id))).returning();
  if (!row) { res.status(404).json({ error: "Expense not found" }); return; }
  res.json({ deleted: true });
});

export default router;

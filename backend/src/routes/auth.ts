import { Router, Request, Response } from "express";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { loginUser, hashPassword, authMiddleware, requireRole, signToken } from "../auth.js";

const router = Router();

router.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: "Email and password required" });
    return;
  }
  const result = await loginUser(email, password);
  if (!result) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  res.json(result);
});

router.post("/register", async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    res.status(400).json({ error: "Name, email, and password required" });
    return;
  }
  const existing = await db.select().from(users).where(eq(users.email, email));
  if (existing.length) {
    res.status(409).json({ error: "Email already registered" });
    return;
  }
  const passwordHash = await hashPassword(password);
  const [user] = await db.insert(users).values({
    name, email, passwordHash, role: role || "driver",
  }).returning();
  const token = signToken({ userId: user.id, email: user.email, role: user.role });
  res.status(201).json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
});

router.get("/me", authMiddleware, async (req: Request, res: Response) => {
  const payload = (req as any).user;
  const [user] = await db.select().from(users).where(eq(users.id, payload.userId));
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
});

router.get("/roles", (_req: Request, res: Response) => {
  res.json([
    { value: "fleet_manager", label: "Fleet Manager" },
    { value: "driver", label: "Driver" },
    { value: "safety_officer", label: "Safety Officer" },
    { value: "financial_analyst", label: "Financial Analyst" },
  ]);
});

export default router;

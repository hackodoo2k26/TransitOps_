import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { db } from "./db/index.js";
import { users } from "./db/schema.js";
import { eq } from "drizzle-orm";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";

export interface JwtPayload {
  userId: number;
  email: string;
  role: string;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing or invalid token" });
    return;
  }
  const payload = verifyToken(header.slice(7));
  if (!payload) {
    res.status(401).json({ error: "Invalid or expired token" });
    return;
  }
  (req as any).user = payload;
  next();
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user as JwtPayload;
    if (!user || !roles.includes(user.role)) {
      res.status(403).json({ error: "Insufficient permissions" });
      return;
    }
    next();
  };
}

export async function loginUser(email: string, password: string) {
  const [user] = await db.select().from(users).where(eq(users.email, email));
  if (!user) return null;
  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) return null;
  const token = signToken({ userId: user.id, email: user.email, role: user.role });
  return {
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  };
}

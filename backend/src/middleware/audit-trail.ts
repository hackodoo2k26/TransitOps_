import type { NextFunction, Request, Response } from "express";
import { auditRepository } from "../repositories/audit.repository.js";
import { logger } from "../config/logger.js";

const sanitize = (value: unknown): unknown => {
  if (!value || typeof value !== "object") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitize(item));
  }

  const result: Record<string, unknown> = {};
  for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
    if (["password", "currentPassword", "newPassword", "refreshToken", "token"].includes(key)) {
      result[key] = "[redacted]";
      continue;
    }
    result[key] = sanitize(nested);
  }
  return result;
};

export const auditTrail = (req: Request, res: Response, next: NextFunction) => {
  const method = req.method.toUpperCase();
  if (method === "GET") {
    next();
    return;
  }

  res.on("finish", () => {
    if (res.statusCode >= 400) {
      return;
    }

    const entityType = req.path.split("/").filter(Boolean)[0] ?? "unknown";
    void auditRepository
      .create({
        organizationId: req.user?.organizationId ?? null,
        userId: req.user?.userId ?? null,
        action: `${method} ${req.originalUrl}`,
        entityType,
        entityId: Array.isArray(req.params.id) ? req.params.id.join(",") : (req.params.id ?? "n/a"),
        oldData: null,
        newData: sanitize(req.body) as Record<string, unknown> | null,
        ipAddress: req.ip,
        userAgent: Array.isArray(req.headers["user-agent"])
          ? req.headers["user-agent"].join(", ")
          : (req.headers["user-agent"] ?? null),
      })
      .catch((error) => {
        logger.warn("Failed to persist audit log", { error, path: req.originalUrl });
      });
  });

  next();
};

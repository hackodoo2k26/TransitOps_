import type { NextFunction, Request, Response } from "express";
import { and, eq, inArray, isNull } from "drizzle-orm";
import { db } from "../db/index.js";
import { organizations, permissions, rolePermissions, roles, userRoles, users } from "../db/schema.js";
import { verifyAccessToken } from "../utils/jwt.js";
import { ApiError } from "../utils/api-error.js";

export const authenticate = async (req: Request, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    next(new ApiError(401, "Missing or invalid bearer token"));
    return;
  }

  try {
    const payload = verifyAccessToken(header.slice(7));
    const [user] = await db
      .select({
        id: users.id,
        organizationId: users.organizationId,
        email: users.email,
        name: users.name,
        status: users.status,
        isSuperAdmin: users.isSuperAdmin,
        organizationStatus: organizations.status,
      })
      .from(users)
      .leftJoin(organizations, eq(organizations.id, users.organizationId))
      .where(eq(users.id, payload.userId));

    if (!user || user.status !== "active") {
      next(new ApiError(401, "Session is no longer valid"));
      return;
    }

    if (!user.isSuperAdmin && user.organizationId && user.organizationStatus !== "active") {
      next(new ApiError(403, "Organization is not active"));
      return;
    }

    const roleRows = await db
      .select({
        roleCode: roles.code,
      })
      .from(userRoles)
      .innerJoin(roles, eq(roles.id, userRoles.roleId))
      .where(eq(userRoles.userId, user.id));

    const roleIds = await db
      .select({ roleId: userRoles.roleId })
      .from(userRoles)
      .where(eq(userRoles.userId, user.id));

    const permissionRows = roleIds.length
      ? await db
          .select({ code: permissions.code })
          .from(rolePermissions)
          .innerJoin(permissions, eq(permissions.id, rolePermissions.permissionId))
          .where(inArray(rolePermissions.roleId, roleIds.map((row) => row.roleId)))
      : [];

    req.user = {
      userId: user.id,
      organizationId: user.organizationId ?? null,
      isSuperAdmin: user.isSuperAdmin,
      roles: roleRows.map((row) => row.roleCode as never),
      permissions: [...new Set(permissionRows.map((row) => row.code))] as never,
      email: user.email,
      name: user.name,
    };

    next();
  } catch {
    next(new ApiError(401, "Invalid or expired access token"));
  }
};

export const requireOrganization = (req: Request, _res: Response, next: NextFunction) => {
  if (!req.user) {
    next(new ApiError(401, "Authentication required"));
    return;
  }
  if (!req.user.isSuperAdmin && !req.user.organizationId) {
    next(new ApiError(403, "Organization context is required"));
    return;
  }
  next();
};


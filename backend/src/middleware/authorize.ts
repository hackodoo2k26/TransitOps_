import type { NextFunction, Request, Response } from "express";
import type { PermissionCode } from "../constants/permissions.js";
import type { RoleCode } from "../constants/roles.js";
import { ApiError } from "../utils/api-error.js";

export const authorize = (requiredPermission?: PermissionCode, allowedRoles: RoleCode[] = []) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      next(new ApiError(401, "Authentication required"));
      return;
    }

    if (req.user.isSuperAdmin) {
      next();
      return;
    }

    if (allowedRoles.length && req.user.roles.some((role) => allowedRoles.includes(role))) {
      next();
      return;
    }

    if (requiredPermission && req.user.permissions.includes(requiredPermission)) {
      next();
      return;
    }

    next(new ApiError(403, "You do not have permission to perform this action"));
  };


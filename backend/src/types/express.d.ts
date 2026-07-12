import type { PermissionCode } from "../constants/permissions.js";
import type { RoleCode } from "../constants/roles.js";

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        organizationId: number | null;
        isSuperAdmin: boolean;
        roles: RoleCode[];
        permissions: PermissionCode[];
        email: string;
        name: string;
      };
    }
  }
}

export {};


import { and, eq, inArray } from "drizzle-orm";
import { db } from "../db/index.js";
import { permissionCatalog, rolePermissionMap } from "../permissions/catalog.js";
import { permissions, rolePermissions, roles, userRoles } from "../db/schema.js";
import { ROLE_CODES } from "../constants/roles.js";

export class AccessRepository {
  async bootstrap(executor: any = db) {
    for (const permission of permissionCatalog) {
      await executor
        .insert(permissions)
        .values(permission)
        .onConflictDoNothing({ target: permissions.code });
    }

    const roleSeeds = [
      { code: ROLE_CODES.SUPER_ADMIN, name: "Super Admin", description: "Global administrator" },
      { code: ROLE_CODES.FLEET_MANAGER, name: "Fleet Manager", description: "Organization fleet manager" },
      { code: ROLE_CODES.DISPATCHER, name: "Dispatcher", description: "Dispatcher" },
      { code: ROLE_CODES.SAFETY_OFFICER, name: "Safety Officer", description: "Driver compliance manager" },
      { code: ROLE_CODES.FINANCIAL_ANALYST, name: "Financial Analyst", description: "Read only finance role" },
    ];

    for (const role of roleSeeds) {
      await executor
        .insert(roles)
        .values(role)
        .onConflictDoNothing({ target: roles.code });
    }

    const permissionRows = await executor.select().from(permissions);
    const roleRows = await executor.select().from(roles);

    for (const [roleCode, permissionCodes] of Object.entries(rolePermissionMap)) {
      const role = roleRows.find((item: typeof roles.$inferSelect) => item.code === roleCode);
      if (!role) continue;

      for (const permissionCode of permissionCodes) {
        const permission = permissionRows.find((item: typeof permissions.$inferSelect) => item.code === permissionCode);
        if (!permission) continue;

        await executor
          .insert(rolePermissions)
          .values({ roleId: role.id, permissionId: permission.id })
          .onConflictDoNothing({ target: [rolePermissions.roleId, rolePermissions.permissionId] });
      }
    }
  }

  async getRolesByCodes(roleCodes: string[], executor: any = db) {
    return executor.select().from(roles).where(inArray(roles.code, roleCodes));
  }

  async replaceUserRoles(userId: number, roleIds: number[], executor: any = db) {
    await executor.delete(userRoles).where(eq(userRoles.userId, userId));
    if (!roleIds.length) {
      return;
    }
    await executor.insert(userRoles).values(roleIds.map((roleId) => ({ userId, roleId })));
  }

  async getUserRoles(userId: number, executor: any = db) {
    return executor
      .select({
        id: roles.id,
        code: roles.code,
        name: roles.name,
      })
      .from(userRoles)
      .innerJoin(roles, eq(roles.id, userRoles.roleId))
      .where(eq(userRoles.userId, userId));
  }

  async userHasRole(userId: number, roleCode: string, executor: any = db) {
    const [row] = await executor
      .select({ roleId: roles.id })
      .from(userRoles)
      .innerJoin(roles, eq(roles.id, userRoles.roleId))
      .where(and(eq(userRoles.userId, userId), eq(roles.code, roleCode)));
    return Boolean(row);
  }
}

export const accessRepository = new AccessRepository();


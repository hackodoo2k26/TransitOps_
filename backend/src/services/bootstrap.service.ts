import { eq } from "drizzle-orm";
import { accessRepository } from "../repositories/access.repository.js";
import { userRepository } from "../repositories/user.repository.js";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { ROLE_CODES } from "../constants/roles.js";
import { hashPassword } from "../utils/password.js";

export class BootstrapService {
  async initializeAccessControl() {
    await accessRepository.bootstrap();
  }

  async ensureSuperAdmin() {
    await db.transaction(async (tx) => {
      await accessRepository.bootstrap(tx);

      const existing = await userRepository.findByEmail("admin@transitops.com", tx);
      if (existing) {
        return;
      }

      const passwordHash = await hashPassword("Admin@123");
      const user = await userRepository.create(
        {
          name: "Super Admin",
          email: "admin@transitops.com",
          passwordHash,
          status: "active",
          isSuperAdmin: true,
          emailVerifiedAt: new Date(),
        },
        tx,
      );

      const roles = await accessRepository.getRolesByCodes([ROLE_CODES.SUPER_ADMIN], tx);
      await accessRepository.replaceUserRoles(user.id, roles.map((role: { id: number }) => role.id), tx);
      await tx.update(users).set({ createdBy: user.id }).where(eq(users.id, user.id));
    });
  }
}

export const bootstrapService = new BootstrapService();

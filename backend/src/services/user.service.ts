import { db } from "../db/index.js";
import type { RequestContext } from "../types/context.js";
import { ApiError } from "../utils/api-error.js";
import { hashPassword } from "../utils/password.js";
import { generateRandomToken, hashToken } from "../utils/token.js";
import { env } from "../config/env.js";
import { sendMail } from "../mail/mailer.js";
import { accessRepository } from "../repositories/access.repository.js";
import { authRepository } from "../repositories/auth.repository.js";
import { notificationRepository } from "../repositories/notification.repository.js";
import { organizationRepository } from "../repositories/organization.repository.js";
import { userRepository } from "../repositories/user.repository.js";

export class UserService {
  async list(organizationId: number | null, search?: string) {
    return userRepository.list(organizationId, search);
  }

  async create(payload: {
    name: string;
    email: string;
    password: string;
    organizationId?: number;
    roleCodes: string[];
  }, actor: RequestContext) {
    if (await userRepository.findByEmail(payload.email)) {
      throw new ApiError(409, "User email already exists");
    }

    if (!payload.organizationId && !actor.organizationId) {
      throw new ApiError(400, "Organization is required");
    }

    const organizationId = payload.organizationId ?? actor.organizationId;
    if (organizationId) {
      const organization = await organizationRepository.findById(organizationId);
      if (!organization || organization.isDeleted) {
        throw new ApiError(404, "Organization not found");
      }
    }

    return db.transaction(async (tx) => {
      const passwordHash = await hashPassword(payload.password);
      const user = await userRepository.create(
        {
          name: payload.name,
          email: payload.email,
          passwordHash,
          organizationId: organizationId ?? null,
          createdBy: actor.userId ?? undefined,
          status: "active",
          emailVerifiedAt: new Date(),
        },
        tx,
      );
      const roles = await accessRepository.getRolesByCodes(payload.roleCodes, tx);
      await accessRepository.replaceUserRoles(user.id, roles.map((role: { id: number }) => role.id), tx);
      return user;
    });
  }

  async invite(payload: {
    name: string;
    email: string;
    organizationId?: number;
    roleCodes: string[];
  }, actor: RequestContext) {
    if (await userRepository.findByEmail(payload.email)) {
      throw new ApiError(409, "User email already exists");
    }

    const organizationId = payload.organizationId ?? actor.organizationId ?? null;
    if (!organizationId && !payload.roleCodes.includes("SUPER_ADMIN")) {
      throw new ApiError(400, "Organization is required for non-super-admin invites");
    }

    const token = generateRandomToken();
    const invitation = await authRepository.createInvitation({
      organizationId,
      name: payload.name,
      email: payload.email,
      tokenHash: hashToken(token),
      roleCodes: payload.roleCodes,
      invitedBy: actor.userId ?? undefined,
      expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000),
    });

    const link = `${env.FRONTEND_URL}/accept-invitation?token=${token}`;
    await sendMail(payload.email, "TransitOps invitation", `<p>You have been invited to TransitOps.</p><p>${link}</p>`);
    await notificationRepository.create({
      organizationId,
      channel: "email",
      type: "invite_user",
      title: "User invited",
      message: `Invitation sent to ${payload.email}`,
    });

    return invitation;
  }

  async getById(id: number) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    const roles = await accessRepository.getUserRoles(id);
    return { ...user, roles };
  }

  async update(id: number, payload: Record<string, unknown>) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    return userRepository.update(id, payload);
  }

  async assignRoles(id: number, roleCodes: string[]) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    const roles = await accessRepository.getRolesByCodes(roleCodes);
    await accessRepository.replaceUserRoles(id, roles.map((role: { id: number }) => role.id));
    return accessRepository.getUserRoles(id);
  }

  async deactivate(id: number) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    return userRepository.update(id, { status: "deactivated" });
  }

  async resetPassword(id: number, password: string) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    return userRepository.update(id, { passwordHash: await hashPassword(password), status: "active" });
  }
}

export const userService = new UserService();

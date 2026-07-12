import { eq } from "drizzle-orm";
import { env } from "../config/env.js";
import { accessRepository } from "../repositories/access.repository.js";
import { authRepository } from "../repositories/auth.repository.js";
import { notificationRepository } from "../repositories/notification.repository.js";
import { userRepository } from "../repositories/user.repository.js";
import { users } from "../db/schema.js";
import { db } from "../db/index.js";
import { sendMail } from "../mail/mailer.js";
import type { RequestContext } from "../types/context.js";
import { ApiError } from "../utils/api-error.js";
import { comparePassword, hashPassword } from "../utils/password.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt.js";
import { generateRandomToken, hashToken } from "../utils/token.js";

const addDays = (days: number) => new Date(Date.now() + days * 24 * 60 * 60 * 1000);
const addHours = (hours: number) => new Date(Date.now() + hours * 60 * 60 * 1000);
const assertOrganizationAssignment = (user: { isSuperAdmin: boolean; organizationId: number | null }) => {
  if (!user.isSuperAdmin && !user.organizationId) {
    throw new ApiError(403, "User is not assigned to an organization");
  }
};

export class AuthService {
  async login(email: string, password: string, context: RequestContext) {
    const user = await userRepository.findByEmail(email);
    if (!user || !user.passwordHash) {
      throw new ApiError(401, "Invalid credentials");
    }
    if (user.status !== "active") {
      throw new ApiError(403, "User account is not active");
    }

    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) {
      throw new ApiError(401, "Invalid credentials");
    }

    assertOrganizationAssignment(user);

    const roles = await accessRepository.getUserRoles(user.id);
    const payload = {
      userId: user.id,
      organizationId: user.organizationId ?? null,
      isSuperAdmin: user.isSuperAdmin,
    };

    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    await authRepository.createRefreshToken({
      userId: user.id,
      organizationId: user.organizationId ?? null,
      tokenHash: hashToken(refreshToken),
      expiresAt: addDays(env.JWT_REFRESH_EXPIRES_IN_DAYS),
      ipAddress: context.ipAddress ?? undefined,
      userAgent: context.userAgent ?? undefined,
    });

    await userRepository.update(user.id, { lastLoginAt: new Date() });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        organizationId: user.organizationId,
        name: user.name,
        email: user.email,
        roles: roles.map((role: { code: string }) => role.code),
        isSuperAdmin: user.isSuperAdmin,
      },
    };
  }

  async refresh(refreshToken: string, context: RequestContext) {
    const payload = verifyRefreshToken(refreshToken);
    const stored = await authRepository.findActiveRefreshToken(hashToken(refreshToken));
    if (!stored) {
      throw new ApiError(401, "Refresh token is invalid or expired");
    }

    const user = await userRepository.findById(payload.userId);
    if (!user || user.status !== "active") {
      throw new ApiError(401, "User account is not active");
    }

    assertOrganizationAssignment(user);

    await authRepository.revokeRefreshToken(hashToken(refreshToken));

    const newPayload = {
      userId: user.id,
      organizationId: user.organizationId ?? null,
      isSuperAdmin: user.isSuperAdmin,
    };
    const accessToken = signAccessToken(newPayload);
    const nextRefreshToken = signRefreshToken(newPayload);
    await authRepository.createRefreshToken({
      userId: user.id,
      organizationId: user.organizationId ?? null,
      tokenHash: hashToken(nextRefreshToken),
      expiresAt: addDays(env.JWT_REFRESH_EXPIRES_IN_DAYS),
      ipAddress: context.ipAddress ?? undefined,
      userAgent: context.userAgent ?? undefined,
    });

    return { accessToken, refreshToken: nextRefreshToken };
  }

  async logout(refreshToken: string) {
    await authRepository.revokeRefreshToken(hashToken(refreshToken));
  }

  async forgotPassword(email: string) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      return;
    }

    const token = generateRandomToken();
    await authRepository.createPasswordResetToken({
      userId: user.id,
      organizationId: user.organizationId,
      tokenHash: hashToken(token),
      expiresAt: addHours(2),
    });

    const link = `${env.FRONTEND_URL}/reset-password?token=${token}`;
    await sendMail(user.email, "Reset your TransitOps password", `<p>Reset your password using this link:</p><p>${link}</p>`);
    await notificationRepository.create({
      organizationId: user.organizationId,
      userId: user.id,
      channel: "email",
      type: "password_reset",
      title: "Password reset requested",
      message: `Password reset requested for ${user.email}`,
    });
  }

  async resetPassword(token: string, password: string) {
    const resetToken = await authRepository.findValidPasswordResetToken(hashToken(token));
    if (!resetToken) {
      throw new ApiError(400, "Reset token is invalid or expired");
    }

    const passwordHash = await hashPassword(password);
    await db.transaction(async (tx) => {
      await userRepository.update(resetToken.userId, { passwordHash, status: "active" }, tx);
      await authRepository.markPasswordResetUsed(resetToken.id, tx);
      await authRepository.revokeUserRefreshTokens(resetToken.userId, tx);
    });
  }

  async sendEmailVerification(userId: number) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    const token = generateRandomToken();
    await authRepository.createEmailVerificationToken({
      userId: user.id,
      organizationId: user.organizationId,
      tokenHash: hashToken(token),
      expiresAt: addHours(24),
    });
    const link = `${env.FRONTEND_URL}/verify-email?token=${token}`;
    await sendMail(user.email, "Verify your TransitOps email", `<p>Verify your email using this link:</p><p>${link}</p>`);
  }

  async verifyEmail(token: string) {
    const verification = await authRepository.findValidEmailVerificationToken(hashToken(token));
    if (!verification) {
      throw new ApiError(400, "Verification token is invalid or expired");
    }
    await db.transaction(async (tx) => {
      await userRepository.update(verification.userId, { emailVerifiedAt: new Date(), status: "active" }, tx);
      await authRepository.markEmailVerificationUsed(verification.id, tx);
    });
  }

  async acceptInvitation(token: string, password: string) {
    const invitation = await authRepository.findValidInvitation(hashToken(token));
    if (!invitation) {
      throw new ApiError(400, "Invitation is invalid or expired");
    }

    const passwordHash = await hashPassword(password);

    const result = await db.transaction(async (tx) => {
      const existing = await userRepository.findByEmail(invitation.email, tx);
      const roles = await accessRepository.getRolesByCodes(invitation.roleCodes, tx);

      const user =
        existing ??
        (await userRepository.create(
          {
            organizationId: invitation.organizationId ?? null,
            name: invitation.name,
            email: invitation.email,
            passwordHash,
            status: "active",
            emailVerifiedAt: new Date(),
            createdBy: invitation.invitedBy ?? undefined,
          },
          tx,
        ));

      await userRepository.update(user.id, {
        passwordHash,
        status: "active",
        emailVerifiedAt: new Date(),
        organizationId: invitation.organizationId ?? null,
      }, tx);
      await accessRepository.replaceUserRoles(user.id, roles.map((role: { id: number }) => role.id), tx);
      await authRepository.acceptInvitation(invitation.id, tx);

      return user;
    });

    await this.sendEmailVerification(result.id);
    return this.login(invitation.email, password, { userId: null, organizationId: invitation.organizationId ?? null });
  }

  async changePassword(userId: number, currentPassword: string, newPassword: string) {
    const user = await userRepository.findById(userId);
    if (!user || !user.passwordHash) {
      throw new ApiError(404, "User not found");
    }

    const valid = await comparePassword(currentPassword, user.passwordHash);
    if (!valid) {
      throw new ApiError(400, "Current password is incorrect");
    }

    await userRepository.update(user.id, { passwordHash: await hashPassword(newPassword) });
    await authRepository.revokeUserRefreshTokens(user.id);
  }

  async session(userId: number) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    assertOrganizationAssignment(user);

    const roles = await accessRepository.getUserRoles(user.id);
    return {
      id: user.id,
      organizationId: user.organizationId,
      email: user.email,
      name: user.name,
      status: user.status,
      emailVerifiedAt: user.emailVerifiedAt,
      roles: roles.map((role: { code: string }) => role.code),
      isSuperAdmin: user.isSuperAdmin,
    };
  }
}

export const authService = new AuthService();

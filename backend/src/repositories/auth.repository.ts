import { and, eq, gt, isNull } from "drizzle-orm";
import { db } from "../db/index.js";
import {
  emailVerificationTokens,
  invitations,
  passwordResetTokens,
  refreshTokens,
} from "../db/schema.js";

export class AuthRepository {
  async createInvitation(data: typeof invitations.$inferInsert, executor: any = db) {
    const [row] = await executor.insert(invitations).values(data).returning();
    return row;
  }

  async findValidInvitation(tokenHash: string, executor: any = db) {
    const [row] = await executor
      .select()
      .from(invitations)
      .where(and(eq(invitations.tokenHash, tokenHash), isNull(invitations.acceptedAt), isNull(invitations.revokedAt), gt(invitations.expiresAt, new Date())));
    return row;
  }

  async acceptInvitation(id: number, executor: any = db) {
    const [row] = await executor
      .update(invitations)
      .set({ acceptedAt: new Date(), updatedAt: new Date() })
      .where(eq(invitations.id, id))
      .returning();
    return row;
  }

  async createRefreshToken(data: typeof refreshTokens.$inferInsert, executor: any = db) {
    const [row] = await executor.insert(refreshTokens).values(data).returning();
    return row;
  }

  async findActiveRefreshToken(tokenHash: string, executor: any = db) {
    const [row] = await executor
      .select()
      .from(refreshTokens)
      .where(and(eq(refreshTokens.tokenHash, tokenHash), isNull(refreshTokens.revokedAt), gt(refreshTokens.expiresAt, new Date())));
    return row;
  }

  async revokeRefreshToken(tokenHash: string, executor: any = db) {
    const [row] = await executor
      .update(refreshTokens)
      .set({ revokedAt: new Date(), updatedAt: new Date() })
      .where(eq(refreshTokens.tokenHash, tokenHash))
      .returning();
    return row;
  }

  async revokeUserRefreshTokens(userId: number, executor: any = db) {
    await executor
      .update(refreshTokens)
      .set({ revokedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(refreshTokens.userId, userId), isNull(refreshTokens.revokedAt)));
  }

  async createPasswordResetToken(data: typeof passwordResetTokens.$inferInsert, executor: any = db) {
    const [row] = await executor.insert(passwordResetTokens).values(data).returning();
    return row;
  }

  async findValidPasswordResetToken(tokenHash: string, executor: any = db) {
    const [row] = await executor
      .select()
      .from(passwordResetTokens)
      .where(and(eq(passwordResetTokens.tokenHash, tokenHash), isNull(passwordResetTokens.usedAt), gt(passwordResetTokens.expiresAt, new Date())));
    return row;
  }

  async markPasswordResetUsed(id: number, executor: any = db) {
    const [row] = await executor
      .update(passwordResetTokens)
      .set({ usedAt: new Date(), updatedAt: new Date() })
      .where(eq(passwordResetTokens.id, id))
      .returning();
    return row;
  }

  async createEmailVerificationToken(data: typeof emailVerificationTokens.$inferInsert, executor: any = db) {
    const [row] = await executor.insert(emailVerificationTokens).values(data).returning();
    return row;
  }

  async findValidEmailVerificationToken(tokenHash: string, executor: any = db) {
    const [row] = await executor
      .select()
      .from(emailVerificationTokens)
      .where(and(eq(emailVerificationTokens.tokenHash, tokenHash), isNull(emailVerificationTokens.usedAt), gt(emailVerificationTokens.expiresAt, new Date())));
    return row;
  }

  async markEmailVerificationUsed(id: number, executor: any = db) {
    const [row] = await executor
      .update(emailVerificationTokens)
      .set({ usedAt: new Date(), updatedAt: new Date() })
      .where(eq(emailVerificationTokens.id, id))
      .returning();
    return row;
  }
}

export const authRepository = new AuthRepository();


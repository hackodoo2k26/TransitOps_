import { and, desc, eq, isNull, or } from "drizzle-orm";
import { db } from "../db/index.js";
import { notifications } from "../db/schema.js";

export class NotificationRepository {
  async create(entry: typeof notifications.$inferInsert, executor: any = db) {
    const [row] = await executor.insert(notifications).values(entry).returning();
    return row;
  }

  async listForUser(userId: number, organizationId: number | null) {
    return db
      .select()
      .from(notifications)
      .where(
        or(
          eq(notifications.userId, userId),
          organizationId ? and(eq(notifications.organizationId, organizationId), isNull(notifications.userId)) : undefined,
        ),
      )
      .orderBy(desc(notifications.createdAt));
  }
}

export const notificationRepository = new NotificationRepository();


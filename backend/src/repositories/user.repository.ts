import { and, desc, eq, ilike, inArray, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";

export class UserRepository {
  async create(data: typeof users.$inferInsert, executor: any = db) {
    const [row] = await executor.insert(users).values(data).returning();
    return row;
  }

  async findById(id: number, executor: any = db) {
    const [row] = await executor.select().from(users).where(eq(users.id, id));
    return row;
  }

  async findByEmail(email: string, executor: any = db) {
    const [row] = await executor.select().from(users).where(eq(users.email, email));
    return row;
  }

  async update(id: number, data: Partial<typeof users.$inferInsert>, executor: any = db) {
    const [row] = await executor
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return row;
  }

  async list(organizationId: number | null, search?: string) {
    const filters = [
      organizationId ? eq(users.organizationId, organizationId) : undefined,
      search ? ilike(users.name, `%${search}%`) : undefined,
    ].filter(Boolean);

    const where = filters.length ? and(...filters) : undefined;
    const rows = await db.select().from(users).where(where).orderBy(desc(users.createdAt));
    const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(users).where(where);
    return { rows, count };
  }

  async getByIds(ids: number[], executor: any = db) {
    if (!ids.length) return [];
    return executor.select().from(users).where(inArray(users.id, ids));
  }
}

export const userRepository = new UserRepository();


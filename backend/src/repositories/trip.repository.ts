import { and, desc, eq, ilike, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { trips } from "../db/schema.js";

export class TripRepository {
  async create(data: typeof trips.$inferInsert, executor: any = db) {
    const [row] = await executor.insert(trips).values(data).returning();
    return row;
  }

  async findById(id: number, organizationId: number, executor: any = db) {
    const [row] = await executor
      .select()
      .from(trips)
      .where(and(eq(trips.id, id), eq(trips.organizationId, organizationId)));
    return row;
  }

  async update(id: number, organizationId: number, data: Partial<typeof trips.$inferInsert>, executor: any = db) {
    const [row] = await executor
      .update(trips)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(trips.id, id), eq(trips.organizationId, organizationId)))
      .returning();
    return row;
  }

  async list(organizationId: number, search?: string, status?: string) {
    const filters = [
      eq(trips.organizationId, organizationId),
      search ? ilike(trips.source, `%${search}%`) : undefined,
      status ? eq(trips.status, status as never) : undefined,
    ].filter(Boolean);
    const where = and(...filters);
    const rows = await db.select().from(trips).where(where).orderBy(desc(trips.createdAt));
    const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(trips).where(where);
    return { rows, count };
  }
}

export const tripRepository = new TripRepository();


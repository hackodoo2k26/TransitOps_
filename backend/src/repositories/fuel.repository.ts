import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { fuelLogs } from "../db/schema.js";

export class FuelRepository {
  async create(data: typeof fuelLogs.$inferInsert, executor: any = db) {
    const [row] = await executor.insert(fuelLogs).values(data).returning();
    return row;
  }

  async findById(id: number, organizationId: number, executor: any = db) {
    const [row] = await executor
      .select()
      .from(fuelLogs)
      .where(and(eq(fuelLogs.id, id), eq(fuelLogs.organizationId, organizationId)));
    return row;
  }

  async update(id: number, organizationId: number, data: Partial<typeof fuelLogs.$inferInsert>, executor: any = db) {
    const [row] = await executor
      .update(fuelLogs)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(fuelLogs.id, id), eq(fuelLogs.organizationId, organizationId)))
      .returning();
    return row;
  }

  async delete(id: number, organizationId: number, executor: any = db) {
    const [row] = await executor
      .delete(fuelLogs)
      .where(and(eq(fuelLogs.id, id), eq(fuelLogs.organizationId, organizationId)))
      .returning();
    return row;
  }

  async list(organizationId: number) {
    const rows = await db.select().from(fuelLogs).where(eq(fuelLogs.organizationId, organizationId)).orderBy(desc(fuelLogs.date));
    const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(fuelLogs).where(eq(fuelLogs.organizationId, organizationId));
    return { rows, count };
  }
}

export const fuelRepository = new FuelRepository();


import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { maintenanceLogs } from "../db/schema.js";

export class MaintenanceRepository {
  async create(data: typeof maintenanceLogs.$inferInsert, executor: any = db) {
    const [row] = await executor.insert(maintenanceLogs).values(data).returning();
    return row;
  }

  async findById(id: number, organizationId: number, executor: any = db) {
    const [row] = await executor
      .select()
      .from(maintenanceLogs)
      .where(and(eq(maintenanceLogs.id, id), eq(maintenanceLogs.organizationId, organizationId)));
    return row;
  }

  async update(id: number, organizationId: number, data: Partial<typeof maintenanceLogs.$inferInsert>, executor: any = db) {
    const [row] = await executor
      .update(maintenanceLogs)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(maintenanceLogs.id, id), eq(maintenanceLogs.organizationId, organizationId)))
      .returning();
    return row;
  }

  async list(organizationId: number) {
    const rows = await db
      .select()
      .from(maintenanceLogs)
      .where(eq(maintenanceLogs.organizationId, organizationId))
      .orderBy(desc(maintenanceLogs.createdAt));
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(maintenanceLogs)
      .where(eq(maintenanceLogs.organizationId, organizationId));
    return { rows, count };
  }
}

export const maintenanceRepository = new MaintenanceRepository();


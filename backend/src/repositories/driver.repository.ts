import { and, desc, eq, ilike, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { driverDocuments, drivers } from "../db/schema.js";

export class DriverRepository {
  async create(data: typeof drivers.$inferInsert, executor: any = db) {
    const [row] = await executor.insert(drivers).values(data).returning();
    return row;
  }

  async findById(id: number, organizationId: number, executor: any = db) {
    const [row] = await executor
      .select()
      .from(drivers)
      .where(and(eq(drivers.id, id), eq(drivers.organizationId, organizationId), eq(drivers.isDeleted, false)));
    return row;
  }

  async update(id: number, organizationId: number, data: Partial<typeof drivers.$inferInsert>, executor: any = db) {
    const [row] = await executor
      .update(drivers)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(drivers.id, id), eq(drivers.organizationId, organizationId), eq(drivers.isDeleted, false)))
      .returning();
    return row;
  }

  async softDelete(id: number, organizationId: number, executor: any = db) {
    const [row] = await executor
      .update(drivers)
      .set({ isDeleted: true, status: "inactive", updatedAt: new Date() })
      .where(and(eq(drivers.id, id), eq(drivers.organizationId, organizationId), eq(drivers.isDeleted, false)))
      .returning();
    return row;
  }

  async list(organizationId: number, search?: string, status?: string) {
    const filters = [
      eq(drivers.organizationId, organizationId),
      eq(drivers.isDeleted, false),
      search ? ilike(drivers.name, `%${search}%`) : undefined,
      status ? eq(drivers.status, status as never) : undefined,
    ].filter(Boolean);
    const where = and(...filters);
    const rows = await db.select().from(drivers).where(where).orderBy(desc(drivers.createdAt));
    const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(drivers).where(where);
    return { rows, count };
  }

  async createDocument(data: typeof driverDocuments.$inferInsert, executor: any = db) {
    const [row] = await executor.insert(driverDocuments).values(data).returning();
    return row;
  }

  async listDocuments(driverId: number, organizationId: number, executor: any = db) {
    return executor
      .select()
      .from(driverDocuments)
      .where(and(eq(driverDocuments.driverId, driverId), eq(driverDocuments.organizationId, organizationId)))
      .orderBy(desc(driverDocuments.createdAt));
  }
}

export const driverRepository = new DriverRepository();


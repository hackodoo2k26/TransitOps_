import { and, desc, eq, ilike, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { vehicles } from "../db/schema.js";

export class VehicleRepository {
  async create(data: typeof vehicles.$inferInsert, executor: any = db) {
    const [row] = await executor.insert(vehicles).values(data).returning();
    return row;
  }

  async findById(id: number, organizationId: number, executor: any = db) {
    const [row] = await executor
      .select()
      .from(vehicles)
      .where(and(eq(vehicles.id, id), eq(vehicles.organizationId, organizationId)));
    return row;
  }

  async update(id: number, organizationId: number, data: Partial<typeof vehicles.$inferInsert>, executor: any = db) {
    const [row] = await executor
      .update(vehicles)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(vehicles.id, id), eq(vehicles.organizationId, organizationId)))
      .returning();
    return row;
  }

  async delete(id: number, organizationId: number, executor: any = db) {
    const [row] = await executor
      .delete(vehicles)
      .where(and(eq(vehicles.id, id), eq(vehicles.organizationId, organizationId)))
      .returning();
    return row;
  }

  async list(organizationId: number, search?: string, status?: string) {
    const filters = [
      eq(vehicles.organizationId, organizationId),
      search ? ilike(vehicles.registrationNumber, `%${search}%`) : undefined,
      status ? eq(vehicles.status, status as never) : undefined,
    ].filter(Boolean);
    const where = and(...filters);
    const rows = await db.select().from(vehicles).where(where).orderBy(desc(vehicles.createdAt));
    const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(vehicles).where(where);
    return { rows, count };
  }
}

export const vehicleRepository = new VehicleRepository();


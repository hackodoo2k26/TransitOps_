import { and, desc, eq, ilike, ne, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { organizations } from "../db/schema.js";

export class OrganizationRepository {
  async create(data: typeof organizations.$inferInsert, executor: any = db) {
    const [row] = await executor.insert(organizations).values(data).returning();
    return row;
  }

  async findById(id: number, executor: any = db) {
    const [row] = await executor.select().from(organizations).where(eq(organizations.id, id));
    return row;
  }

  async findBySlug(slug: string, executor: any = db) {
    const [row] = await executor.select().from(organizations).where(eq(organizations.slug, slug));
    return row;
  }

  async update(id: number, data: Partial<typeof organizations.$inferInsert>, executor: any = db) {
    const [row] = await executor
      .update(organizations)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(organizations.id, id))
      .returning();
    return row;
  }

  async softDelete(id: number, executor: any = db) {
    const [row] = await executor
      .update(organizations)
      .set({ isDeleted: true, status: "inactive", updatedAt: new Date() })
      .where(eq(organizations.id, id))
      .returning();
    return row;
  }

  async list(search?: string) {
    const where = search
      ? and(eq(organizations.isDeleted, false), ilike(organizations.name, `%${search}%`))
      : eq(organizations.isDeleted, false);

    const rows = await db.select().from(organizations).where(where).orderBy(desc(organizations.createdAt));
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(organizations)
      .where(where);

    return { rows, count };
  }
}

export const organizationRepository = new OrganizationRepository();


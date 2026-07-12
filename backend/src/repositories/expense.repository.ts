import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { expenses } from "../db/schema.js";

export class ExpenseRepository {
  async create(data: typeof expenses.$inferInsert, executor: any = db) {
    const [row] = await executor.insert(expenses).values(data).returning();
    return row;
  }

  async findById(id: number, organizationId: number, executor: any = db) {
    const [row] = await executor
      .select()
      .from(expenses)
      .where(and(eq(expenses.id, id), eq(expenses.organizationId, organizationId)));
    return row;
  }

  async update(id: number, organizationId: number, data: Partial<typeof expenses.$inferInsert>, executor: any = db) {
    const [row] = await executor
      .update(expenses)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(expenses.id, id), eq(expenses.organizationId, organizationId)))
      .returning();
    return row;
  }

  async delete(id: number, organizationId: number, executor: any = db) {
    const [row] = await executor
      .delete(expenses)
      .where(and(eq(expenses.id, id), eq(expenses.organizationId, organizationId)))
      .returning();
    return row;
  }

  async list(organizationId: number) {
    const rows = await db.select().from(expenses).where(eq(expenses.organizationId, organizationId)).orderBy(desc(expenses.date));
    const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(expenses).where(eq(expenses.organizationId, organizationId));
    return { rows, count };
  }
}

export const expenseRepository = new ExpenseRepository();


import { and, desc, eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { auditLogs } from "../db/schema.js";

export class AuditRepository {
  async create(entry: typeof auditLogs.$inferInsert, executor: any = db) {
    const [row] = await executor.insert(auditLogs).values(entry).returning();
    return row;
  }

  async list(organizationId: number | null) {
    const where = organizationId ? eq(auditLogs.organizationId, organizationId) : undefined;
    return db.select().from(auditLogs).where(where).orderBy(desc(auditLogs.createdAt));
  }
}

export const auditRepository = new AuditRepository();


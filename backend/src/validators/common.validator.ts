import { z } from "zod";

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  search: z.string().trim().optional(),
  sortBy: z.string().trim().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  status: z.string().trim().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().min(2000).max(2100).optional(),
  format: z.enum(["csv", "pdf"]).optional(),
});


import { desc } from "drizzle-orm";

export interface PaginationQuery {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  sortOrder: "asc" | "desc";
}

export const getPagination = (query: Record<string, unknown>): PaginationQuery => {
  const page = Math.max(Number(query.page ?? 1), 1);
  const limit = Math.min(Math.max(Number(query.limit ?? 10), 1), 100);
  const search = typeof query.search === "string" && query.search.trim() ? query.search.trim() : undefined;
  const sortBy = typeof query.sortBy === "string" ? query.sortBy : undefined;
  const sortOrder = query.sortOrder === "asc" ? "asc" : "desc";
  return { page, limit, search, sortBy, sortOrder };
};

export const getPaginationMeta = (page: number, limit: number, total: number) => ({
  page,
  limit,
  total,
  totalPages: Math.max(Math.ceil(total / limit), 1),
});

export const toDecimal = (value: string | number | null | undefined) => Number(value ?? 0);
export const defaultDesc = <T>(column: T) => desc(column as never);


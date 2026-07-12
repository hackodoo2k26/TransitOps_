export interface RequestContext {
  userId: number | null;
  organizationId: number | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}


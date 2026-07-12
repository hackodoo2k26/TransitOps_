import { z } from "zod";

export const createOrganizationSchema = z.object({
  name: z.string().min(2),
  slug: z.string().trim().min(2).optional(),
  contactEmail: z.email().optional(),
  contactPhone: z.string().trim().optional(),
  address: z.string().trim().optional(),
});

export const updateOrganizationSchema = createOrganizationSchema.partial();


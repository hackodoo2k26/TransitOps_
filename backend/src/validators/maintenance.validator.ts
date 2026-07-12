import { z } from "zod";

export const createMaintenanceSchema = z.object({
  vehicleId: z.coerce.number().int().positive(),
  description: z.string().min(3),
  cost: z.coerce.number().positive(),
  openedAt: z.string().date(),
});

export const updateMaintenanceSchema = z.object({
  description: z.string().min(3).optional(),
  cost: z.coerce.number().positive().optional(),
  openedAt: z.string().date().optional(),
});

export const closeMaintenanceSchema = z.object({
  closedAt: z.string().date().optional(),
});


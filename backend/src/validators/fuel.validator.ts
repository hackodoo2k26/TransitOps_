import { z } from "zod";

export const createFuelLogSchema = z.object({
  vehicleId: z.coerce.number().int().positive(),
  tripId: z.coerce.number().int().positive().optional(),
  liters: z.coerce.number().positive(),
  cost: z.coerce.number().positive(),
  odometer: z.coerce.number().min(0).optional(),
  date: z.string().date(),
});

export const updateFuelLogSchema = createFuelLogSchema.partial();


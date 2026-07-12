import { z } from "zod";

export const createExpenseSchema = z.object({
  vehicleId: z.coerce.number().int().positive().optional(),
  tripId: z.coerce.number().int().positive().optional(),
  type: z.enum(["fuel", "maintenance", "toll", "misc"]),
  amount: z.coerce.number().positive(),
  date: z.string().date(),
  notes: z.string().trim().optional(),
});

export const updateExpenseSchema = createExpenseSchema.partial();


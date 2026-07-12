import { z } from "zod";

export const createVehicleSchema = z.object({
  registrationNumber: z.string().min(2),
  model: z.string().min(2),
  vehicleType: z.string().min(2),
  maxCapacity: z.coerce.number().positive(),
  currentOdometer: z.coerce.number().min(0).default(0),
  acquisitionCost: z.coerce.number().min(0).default(0),
  region: z.string().trim().optional(),
  status: z.enum(["available", "on_trip", "in_shop", "retired"]).optional(),
});

export const updateVehicleSchema = createVehicleSchema.partial();


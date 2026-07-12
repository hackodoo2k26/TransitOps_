import { z } from "zod";

export const createTripSchema = z.object({
  source: z.string().min(2),
  destination: z.string().min(2),
  vehicleId: z.coerce.number().int().positive(),
  driverId: z.coerce.number().int().positive(),
  cargoWeight: z.coerce.number().min(0),
  plannedDistance: z.coerce.number().min(0),
  revenue: z.coerce.number().min(0).optional(),
  notes: z.string().trim().optional(),
});

export const updateTripSchema = createTripSchema.partial();

export const dispatchTripSchema = z.object({
  startOdometer: z.coerce.number().min(0).optional(),
});

export const completeTripSchema = z.object({
  endOdometer: z.coerce.number().min(0),
  actualDistance: z.coerce.number().min(0),
  fuelConsumed: z.coerce.number().min(0).optional(),
  revenue: z.coerce.number().min(0).optional(),
});

export const cancelTripSchema = z.object({
  notes: z.string().trim().optional(),
});


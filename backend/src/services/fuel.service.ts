import { fuelRepository } from "../repositories/fuel.repository.js";
import { vehicleRepository } from "../repositories/vehicle.repository.js";
import type { RequestContext } from "../types/context.js";
import { ApiError } from "../utils/api-error.js";

export class FuelService {
  async list(organizationId: number) {
    return fuelRepository.list(organizationId);
  }

  async getById(id: number, organizationId: number) {
    const row = await fuelRepository.findById(id, organizationId);
    if (!row) {
      throw new ApiError(404, "Fuel log not found");
    }
    return row;
  }

  async create(payload: Record<string, unknown>, actor: RequestContext) {
    if (!actor.organizationId) {
      throw new ApiError(400, "Organization context is required");
    }
    const vehicle = await vehicleRepository.findById(Number(payload.vehicleId), actor.organizationId);
    if (!vehicle) {
      throw new ApiError(404, "Vehicle not found");
    }
    return fuelRepository.create({
      vehicleId: Number(payload.vehicleId),
      tripId: payload.tripId ? Number(payload.tripId) : undefined,
      date: String(payload.date),
      organizationId: actor.organizationId,
      createdBy: actor.userId ?? undefined,
      liters: String(payload.liters),
      cost: String(payload.cost),
      odometer: payload.odometer ? String(payload.odometer) : undefined,
    });
  }

  async update(id: number, organizationId: number, payload: Record<string, unknown>) {
    await this.getById(id, organizationId);
    return fuelRepository.update(id, organizationId, {
      vehicleId: payload.vehicleId ? Number(payload.vehicleId) : undefined,
      tripId: payload.tripId ? Number(payload.tripId) : undefined,
      date: payload.date ? String(payload.date) : undefined,
      liters: payload.liters ? String(payload.liters) : undefined,
      cost: payload.cost ? String(payload.cost) : undefined,
      odometer: payload.odometer ? String(payload.odometer) : undefined,
    });
  }

  async delete(id: number, organizationId: number) {
    const row = await fuelRepository.delete(id, organizationId);
    if (!row) {
      throw new ApiError(404, "Fuel log not found");
    }
    return row;
  }
}

export const fuelService = new FuelService();

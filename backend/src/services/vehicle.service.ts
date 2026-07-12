import { tripRepository } from "../repositories/trip.repository.js";
import { vehicleRepository } from "../repositories/vehicle.repository.js";
import type { RequestContext } from "../types/context.js";
import { ApiError } from "../utils/api-error.js";

export class VehicleService {
  async list(organizationId: number, search?: string, status?: string) {
    return vehicleRepository.list(organizationId, search, status);
  }

  async getById(id: number, organizationId: number) {
    const vehicle = await vehicleRepository.findById(id, organizationId);
    if (!vehicle) {
      throw new ApiError(404, "Vehicle not found");
    }
    return vehicle;
  }

  async create(payload: Record<string, unknown>, actor: RequestContext) {
    if (!actor.organizationId) {
      throw new ApiError(400, "Organization context is required");
    }
    return vehicleRepository.create({
      registrationNumber: String(payload.registrationNumber),
      model: String(payload.model),
      vehicleType: String(payload.vehicleType),
      maxCapacity: String(payload.maxCapacity),
      currentOdometer: String(payload.currentOdometer ?? 0),
      acquisitionCost: String(payload.acquisitionCost ?? 0),
      region: payload.region ? String(payload.region) : undefined,
      status: (payload.status as "available" | "on_trip" | "in_shop" | "retired" | undefined) ?? "available",
      organizationId: actor.organizationId,
      createdBy: actor.userId ?? undefined,
    });
  }

  async update(id: number, organizationId: number, payload: Record<string, unknown>) {
    await this.getById(id, organizationId);
    const vehicle = await vehicleRepository.update(id, organizationId, payload);
    if (!vehicle) {
      throw new ApiError(404, "Vehicle not found");
    }
    return vehicle;
  }

  async delete(id: number, organizationId: number) {
    const vehicle = await this.getById(id, organizationId);
    if (vehicle.status === "on_trip") {
      throw new ApiError(400, "Vehicle on trip cannot be deleted");
    }
    const deleted = await vehicleRepository.delete(id, organizationId);
    if (!deleted) {
      throw new ApiError(404, "Vehicle not found");
    }
    return deleted;
  }
}

export const vehicleService = new VehicleService();

import { db } from "../db/index.js";
import { maintenanceRepository } from "../repositories/maintenance.repository.js";
import { vehicleRepository } from "../repositories/vehicle.repository.js";
import type { RequestContext } from "../types/context.js";
import { ApiError } from "../utils/api-error.js";

export class MaintenanceService {
  async list(organizationId: number) {
    return maintenanceRepository.list(organizationId);
  }

  async getById(id: number, organizationId: number) {
    const row = await maintenanceRepository.findById(id, organizationId);
    if (!row) {
      throw new ApiError(404, "Maintenance log not found");
    }
    return row;
  }

  async create(payload: { vehicleId: number; description: string; cost: number; openedAt: string }, actor: RequestContext) {
    if (!actor.organizationId) {
      throw new ApiError(400, "Organization context is required");
    }
    const vehicle = await vehicleRepository.findById(payload.vehicleId, actor.organizationId);
    if (!vehicle) {
      throw new ApiError(404, "Vehicle not found");
    }
    if (vehicle.status === "on_trip") {
      throw new ApiError(400, "Vehicle on trip cannot enter maintenance");
    }
    if (vehicle.status === "retired") {
      throw new ApiError(400, "Retired vehicle cannot enter maintenance");
    }

    return db.transaction(async (tx) => {
      const log = await maintenanceRepository.create(
        {
          organizationId: actor.organizationId!,
          vehicleId: payload.vehicleId,
          description: payload.description,
          cost: String(payload.cost),
          openedAt: payload.openedAt,
          createdBy: actor.userId ?? undefined,
          status: "open",
        },
        tx,
      );
      await vehicleRepository.update(payload.vehicleId, actor.organizationId!, { status: "in_shop" }, tx);
      return log;
    });
  }

  async update(id: number, organizationId: number, payload: Record<string, unknown>) {
    await this.getById(id, organizationId);
    const row = await maintenanceRepository.update(id, organizationId, payload);
    if (!row) {
      throw new ApiError(404, "Maintenance log not found");
    }
    return row;
  }

  async close(id: number, organizationId: number, closedAt?: string) {
    const log = await this.getById(id, organizationId);
    if (log.status !== "open") {
      throw new ApiError(400, "Only open maintenance logs can be closed");
    }
    const vehicle = await vehicleRepository.findById(log.vehicleId, organizationId);
    if (!vehicle) {
      throw new ApiError(404, "Vehicle not found");
    }

    return db.transaction(async (tx) => {
      const closed = await maintenanceRepository.update(
        id,
        organizationId,
        { status: "closed", closedAt: closedAt ?? new Date().toISOString().slice(0, 10) },
        tx,
      );
      if (vehicle.status !== "retired") {
        await vehicleRepository.update(vehicle.id, organizationId, { status: "available" }, tx);
      }
      return closed;
    });
  }
}

export const maintenanceService = new MaintenanceService();


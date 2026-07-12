import { db } from "../db/index.js";
import { notificationRepository } from "../repositories/notification.repository.js";
import { driverRepository } from "../repositories/driver.repository.js";
import { tripRepository } from "../repositories/trip.repository.js";
import { vehicleRepository } from "../repositories/vehicle.repository.js";
import type { RequestContext } from "../types/context.js";
import { ApiError } from "../utils/api-error.js";
import { toDecimal } from "../utils/query.js";

const isLicenseExpired = (licenseExpiry: string) => new Date(licenseExpiry) < new Date(new Date().toDateString());

export class TripService {
  async list(organizationId: number, search?: string, status?: string) {
    return tripRepository.list(organizationId, search, status);
  }

  async getById(id: number, organizationId: number) {
    const trip = await tripRepository.findById(id, organizationId);
    if (!trip) {
      throw new ApiError(404, "Trip not found");
    }
    return trip;
  }

  async create(payload: Record<string, unknown>, actor: RequestContext) {
    if (!actor.organizationId) {
      throw new ApiError(400, "Organization context is required");
    }

    const vehicle = await vehicleRepository.findById(Number(payload.vehicleId), actor.organizationId);
    const driver = await driverRepository.findById(Number(payload.driverId), actor.organizationId);
    if (!vehicle || !driver) {
      throw new ApiError(404, "Vehicle or driver not found");
    }

    if (toDecimal(payload.cargoWeight as number) > toDecimal(vehicle.maxCapacity)) {
      throw new ApiError(400, "Cargo weight must not exceed vehicle capacity");
    }

    return tripRepository.create({
      source: String(payload.source),
      destination: String(payload.destination),
      vehicleId: Number(payload.vehicleId),
      driverId: Number(payload.driverId),
      organizationId: actor.organizationId,
      createdBy: actor.userId ?? undefined,
      status: "draft",
      cargoWeight: String(payload.cargoWeight ?? 0),
      plannedDistance: String(payload.plannedDistance ?? 0),
      revenue: String(payload.revenue ?? 0),
      notes: payload.notes ? String(payload.notes) : undefined,
    });
  }

  async dispatch(id: number, organizationId: number, startOdometer?: number) {
    const trip = await this.getById(id, organizationId);
    if (trip.status !== "draft") {
      throw new ApiError(400, "Only draft trips can be dispatched");
    }

    const vehicle = await vehicleRepository.findById(trip.vehicleId ?? 0, organizationId);
    const driver = await driverRepository.findById(trip.driverId ?? 0, organizationId);

    if (!vehicle || !driver) {
      throw new ApiError(400, "Vehicle or driver not found");
    }
    if (vehicle.status === "retired" || vehicle.status === "in_shop" || vehicle.status === "on_trip") {
      throw new ApiError(400, "Vehicle is not available for dispatch");
    }
    if (driver.status === "suspended" || driver.status === "off_duty" || driver.status === "on_trip" || driver.status === "inactive") {
      throw new ApiError(400, "Driver is not available for dispatch");
    }
    if (isLicenseExpired(driver.licenseExpiry)) {
      throw new ApiError(400, "Driver license is expired");
    }
    if (toDecimal(trip.cargoWeight) > toDecimal(vehicle.maxCapacity)) {
      throw new ApiError(400, "Cargo weight must not exceed vehicle capacity");
    }

    return db.transaction(async (tx) => {
      const updatedTrip = await tripRepository.update(
        id,
        organizationId,
        {
          status: "dispatched",
          startOdometer: String(startOdometer ?? vehicle.currentOdometer),
          dispatchedAt: new Date(),
        },
        tx,
      );
      await vehicleRepository.update(vehicle.id, organizationId, { status: "on_trip" }, tx);
      await driverRepository.update(driver.id, organizationId, { status: "on_trip" }, tx);
      await notificationRepository.create(
        {
          organizationId,
          type: "trip_assigned",
          title: "Trip dispatched",
          message: `Trip ${id} has been dispatched`,
        },
        tx,
      );
      return updatedTrip;
    });
  }

  async complete(
    id: number,
    organizationId: number,
    payload: { endOdometer: number; actualDistance: number; fuelConsumed?: number; revenue?: number },
  ) {
    const trip = await this.getById(id, organizationId);
    if (trip.status !== "dispatched") {
      throw new ApiError(400, "Only dispatched trips can be completed");
    }

    const vehicle = await vehicleRepository.findById(trip.vehicleId ?? 0, organizationId);
    const driver = await driverRepository.findById(trip.driverId ?? 0, organizationId);

    return db.transaction(async (tx) => {
      const updatedTrip = await tripRepository.update(
        id,
        organizationId,
        {
          status: "completed",
          endOdometer: String(payload.endOdometer),
          actualDistance: String(payload.actualDistance),
          fuelConsumed: String(payload.fuelConsumed ?? 0),
          revenue: String(payload.revenue ?? trip.revenue ?? 0),
          completedAt: new Date(),
        },
        tx,
      );
      if (vehicle) {
        await vehicleRepository.update(vehicle.id, organizationId, {
          status: vehicle.status === "retired" ? "retired" : "available",
          currentOdometer: String(payload.endOdometer),
        }, tx);
      }
      if (driver) {
        await driverRepository.update(driver.id, organizationId, { status: "available" }, tx);
      }
      await notificationRepository.create(
        {
          organizationId,
          type: "trip_completed",
          title: "Trip completed",
          message: `Trip ${id} has been completed`,
        },
        tx,
      );
      return updatedTrip;
    });
  }

  async cancel(id: number, organizationId: number, notes?: string) {
    const trip = await this.getById(id, organizationId);
    if (trip.status === "completed") {
      throw new ApiError(400, "Completed trips cannot be cancelled");
    }

    return db.transaction(async (tx) => {
      const updatedTrip = await tripRepository.update(
        id,
        organizationId,
        { status: "cancelled", notes, cancelledAt: new Date() },
        tx,
      );
      if (trip.vehicleId) {
        const vehicle = await vehicleRepository.findById(trip.vehicleId, organizationId, tx);
        if (vehicle?.status === "on_trip") {
          await vehicleRepository.update(vehicle.id, organizationId, { status: "available" }, tx);
        }
      }
      if (trip.driverId) {
        const driver = await driverRepository.findById(trip.driverId, organizationId, tx);
        if (driver?.status === "on_trip") {
          await driverRepository.update(driver.id, organizationId, { status: "available" }, tx);
        }
      }
      return updatedTrip;
    });
  }
}

export const tripService = new TripService();

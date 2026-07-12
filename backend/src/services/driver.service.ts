import { driverRepository } from "../repositories/driver.repository.js";
import type { RequestContext } from "../types/context.js";
import { ApiError } from "../utils/api-error.js";

export class DriverService {
  async list(organizationId: number, search?: string, status?: string) {
    return driverRepository.list(organizationId, search, status);
  }

  async getById(id: number, organizationId: number) {
    const driver = await driverRepository.findById(id, organizationId);
    if (!driver) {
      throw new ApiError(404, "Driver not found");
    }
    const documents = await driverRepository.listDocuments(id, organizationId);
    return { ...driver, documents };
  }

  async create(payload: Record<string, unknown>, actor: RequestContext) {
    if (!actor.organizationId) {
      throw new ApiError(400, "Organization context is required");
    }
    return driverRepository.create({
      name: String(payload.name),
      employeeId: String(payload.employeeId),
      phone: String(payload.phone),
      email: payload.email ? String(payload.email) : undefined,
      address: payload.address ? String(payload.address) : undefined,
      emergencyContact: (payload.emergencyContact as { name: string; phone: string } | undefined) ?? null,
      bloodGroup: payload.bloodGroup ? String(payload.bloodGroup) : undefined,
      licenseNumber: String(payload.licenseNumber),
      licenseCategory: String(payload.licenseCategory),
      licenseExpiry: String(payload.licenseExpiry),
      joiningDate: String(payload.joiningDate),
      safetyScore: String(payload.safetyScore ?? 100),
      status: (payload.status as "available" | "on_trip" | "off_duty" | "suspended" | "inactive" | undefined) ?? "available",
      organizationId: actor.organizationId,
      createdBy: actor.userId ?? undefined,
    });
  }

  async update(id: number, organizationId: number, payload: Record<string, unknown>) {
    await this.getById(id, organizationId);
    const driver = await driverRepository.update(id, organizationId, payload);
    if (!driver) {
      throw new ApiError(404, "Driver not found");
    }
    return driver;
  }

  async updateStatus(id: number, organizationId: number, status: string) {
    const driver = await this.getById(id, organizationId);
    if (driver.status === "on_trip" && status === "suspended") {
      throw new ApiError(400, "Driver currently on trip cannot be suspended");
    }
    return this.update(id, organizationId, { status });
  }

  async updateSafety(id: number, organizationId: number, safetyScore: number) {
    return this.update(id, organizationId, { safetyScore: safetyScore.toString() });
  }

  async remove(id: number, organizationId: number) {
    const driver = await this.getById(id, organizationId);
    if (driver.status === "on_trip") {
      throw new ApiError(400, "Driver currently on trip cannot be removed");
    }
    const deleted = await driverRepository.softDelete(id, organizationId);
    if (!deleted) {
      throw new ApiError(404, "Driver not found");
    }
    return deleted;
  }

  async uploadDocument(
    id: number,
    organizationId: number,
    payload: { documentName: string; documentType: string; expiryDate?: string },
    filePath: string,
    actor: RequestContext,
  ) {
    await this.getById(id, organizationId);
    return driverRepository.createDocument({
      organizationId,
      driverId: id,
      documentName: payload.documentName,
      documentType: payload.documentType as never,
      expiryDate: payload.expiryDate,
      uploadedBy: actor.userId ?? undefined,
      fileUrl: filePath,
    });
  }

  async uploadPhoto(id: number, organizationId: number, filePath: string) {
    return this.update(id, organizationId, { profilePhotoUrl: filePath });
  }
}

export const driverService = new DriverService();

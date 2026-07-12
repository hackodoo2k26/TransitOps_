import type { Request, Response } from "express";
import { vehicleService } from "../services/vehicle.service.js";
import { sendPaginated, sendSuccess } from "../utils/response.js";

const getOrganizationId = (req: Request) => Number(req.user!.organizationId);

export class VehicleController {
  list = async (req: Request, res: Response) => {
    const result = await vehicleService.list(
      getOrganizationId(req),
      typeof req.query.search === "string" ? req.query.search : undefined,
      typeof req.query.status === "string" ? req.query.status : undefined,
    );
    sendPaginated(res, "Vehicles fetched successfully", result.rows, { total: result.count });
  };

  create = async (req: Request, res: Response) => {
    const data = await vehicleService.create(req.body, { userId: req.user!.userId, organizationId: req.user!.organizationId });
    sendSuccess(res, "Vehicle created successfully", data, 201);
  };

  getById = async (req: Request, res: Response) => {
    const data = await vehicleService.getById(Number(req.params.id), getOrganizationId(req));
    sendSuccess(res, "Vehicle fetched successfully", data);
  };

  update = async (req: Request, res: Response) => {
    const data = await vehicleService.update(Number(req.params.id), getOrganizationId(req), req.body);
    sendSuccess(res, "Vehicle updated successfully", data);
  };

  remove = async (req: Request, res: Response) => {
    const data = await vehicleService.delete(Number(req.params.id), getOrganizationId(req));
    sendSuccess(res, "Vehicle deleted successfully", data);
  };
}

export const vehicleController = new VehicleController();


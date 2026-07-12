import type { Request, Response } from "express";
import { fuelService } from "../services/fuel.service.js";
import { sendPaginated, sendSuccess } from "../utils/response.js";

const orgId = (req: Request) => Number(req.user!.organizationId);

export class FuelController {
  list = async (req: Request, res: Response) => {
    const result = await fuelService.list(orgId(req));
    sendPaginated(res, "Fuel logs fetched successfully", result.rows, { total: result.count });
  };

  create = async (req: Request, res: Response) => {
    const data = await fuelService.create(req.body, { userId: req.user!.userId, organizationId: req.user!.organizationId });
    sendSuccess(res, "Fuel log created successfully", data, 201);
  };

  getById = async (req: Request, res: Response) => {
    const data = await fuelService.getById(Number(req.params.id), orgId(req));
    sendSuccess(res, "Fuel log fetched successfully", data);
  };

  update = async (req: Request, res: Response) => {
    const data = await fuelService.update(Number(req.params.id), orgId(req), req.body);
    sendSuccess(res, "Fuel log updated successfully", data);
  };

  remove = async (req: Request, res: Response) => {
    const data = await fuelService.delete(Number(req.params.id), orgId(req));
    sendSuccess(res, "Fuel log deleted successfully", data);
  };
}

export const fuelController = new FuelController();


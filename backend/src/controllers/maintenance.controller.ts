import type { Request, Response } from "express";
import { maintenanceService } from "../services/maintenance.service.js";
import { sendPaginated, sendSuccess } from "../utils/response.js";

const orgId = (req: Request) => Number(req.user!.organizationId);

export class MaintenanceController {
  list = async (req: Request, res: Response) => {
    const result = await maintenanceService.list(orgId(req));
    sendPaginated(res, "Maintenance logs fetched successfully", result.rows, { total: result.count });
  };

  create = async (req: Request, res: Response) => {
    const data = await maintenanceService.create(req.body, { userId: req.user!.userId, organizationId: req.user!.organizationId });
    sendSuccess(res, "Maintenance log created successfully", data, 201);
  };

  getById = async (req: Request, res: Response) => {
    const data = await maintenanceService.getById(Number(req.params.id), orgId(req));
    sendSuccess(res, "Maintenance log fetched successfully", data);
  };

  update = async (req: Request, res: Response) => {
    const data = await maintenanceService.update(Number(req.params.id), orgId(req), req.body);
    sendSuccess(res, "Maintenance log updated successfully", data);
  };

  close = async (req: Request, res: Response) => {
    const data = await maintenanceService.close(Number(req.params.id), orgId(req), req.body.closedAt);
    sendSuccess(res, "Maintenance log closed successfully", data);
  };
}

export const maintenanceController = new MaintenanceController();


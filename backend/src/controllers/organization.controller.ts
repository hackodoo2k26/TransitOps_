import type { Request, Response } from "express";
import { organizationService } from "../services/organization.service.js";
import { sendPaginated, sendSuccess } from "../utils/response.js";

export class OrganizationController {
  create = async (req: Request, res: Response) => {
    const data = await organizationService.create(req.body);
    sendSuccess(res, "Organization created successfully", data, 201);
  };

  list = async (req: Request, res: Response) => {
    const result = await organizationService.list(typeof req.query.search === "string" ? req.query.search : undefined);
    sendPaginated(res, "Organizations fetched successfully", result.rows, { total: result.count });
  };

  getById = async (req: Request, res: Response) => {
    const data = await organizationService.getById(Number(req.params.id));
    sendSuccess(res, "Organization fetched successfully", data);
  };

  update = async (req: Request, res: Response) => {
    const data = await organizationService.update(Number(req.params.id), req.body);
    sendSuccess(res, "Organization updated successfully", data);
  };

  suspend = async (req: Request, res: Response) => {
    const data = await organizationService.suspend(Number(req.params.id));
    sendSuccess(res, "Organization suspended successfully", data);
  };

  activate = async (req: Request, res: Response) => {
    const data = await organizationService.activate(Number(req.params.id));
    sendSuccess(res, "Organization activated successfully", data);
  };

  remove = async (req: Request, res: Response) => {
    const data = await organizationService.remove(Number(req.params.id));
    sendSuccess(res, "Organization deleted successfully", data);
  };
}

export const organizationController = new OrganizationController();


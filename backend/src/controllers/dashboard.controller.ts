import type { Request, Response } from "express";
import { dashboardService } from "../services/dashboard.service.js";
import { sendSuccess } from "../utils/response.js";

export class DashboardController {
  organization = async (req: Request, res: Response) => {
    const data = await dashboardService.getOrganizationDashboard(Number(req.user!.organizationId));
    sendSuccess(res, "Dashboard fetched successfully", data);
  };

  global = async (_req: Request, res: Response) => {
    const data = await dashboardService.getGlobalDashboard();
    sendSuccess(res, "Global dashboard fetched successfully", data);
  };
}

export const dashboardController = new DashboardController();


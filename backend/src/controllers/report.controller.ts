import type { Request, Response } from "express";
import { reportService } from "../services/report.service.js";
import { sendSuccess } from "../utils/response.js";

const orgId = (req: Request) => Number(req.user!.organizationId);

export class ReportController {
  fuelEfficiency = async (req: Request, res: Response) => {
    const data = await reportService.getFuelEfficiency(orgId(req));
    sendSuccess(res, "Fuel efficiency report fetched successfully", data);
  };

  fleetUtilization = async (req: Request, res: Response) => {
    const data = await reportService.getFleetUtilization(orgId(req));
    sendSuccess(res, "Fleet utilization report fetched successfully", data);
  };

  vehicleRoi = async (req: Request, res: Response) => {
    const data = await reportService.getVehicleRoi(orgId(req));
    sendSuccess(res, "Vehicle ROI report fetched successfully", data);
  };

  operationalCost = async (req: Request, res: Response) => {
    const data = await reportService.getOperationalCost(orgId(req));
    sendSuccess(res, "Operational cost report fetched successfully", data);
  };

  monthlyExpenses = async (req: Request, res: Response) => {
    const data = await reportService.getMonthlyExpenses(orgId(req));
    sendSuccess(res, "Monthly expenses report fetched successfully", data);
  };

  exportMonthlyExpenses = async (req: Request, res: Response) => {
    const format = (req.query.format === "pdf" ? "pdf" : "csv") as "csv" | "pdf";
    const exported = await reportService.exportMonthlyExpenses(orgId(req), format);
    res.setHeader("Content-Type", exported.contentType);
    res.setHeader("Content-Disposition", `attachment; filename="${exported.filename}"`);
    res.send(exported.buffer);
  };
}

export const reportController = new ReportController();


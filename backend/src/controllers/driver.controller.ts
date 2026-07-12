import type { Request, Response } from "express";
import { driverService } from "../services/driver.service.js";
import { sendPaginated, sendSuccess } from "../utils/response.js";

const orgId = (req: Request) => Number(req.user!.organizationId);

export class DriverController {
  list = async (req: Request, res: Response) => {
    const result = await driverService.list(
      orgId(req),
      typeof req.query.search === "string" ? req.query.search : undefined,
      typeof req.query.status === "string" ? req.query.status : undefined,
    );
    sendPaginated(res, "Drivers fetched successfully", result.rows, { total: result.count });
  };

  create = async (req: Request, res: Response) => {
    const data = await driverService.create(req.body, { userId: req.user!.userId, organizationId: req.user!.organizationId });
    sendSuccess(res, "Driver created successfully", data, 201);
  };

  getById = async (req: Request, res: Response) => {
    const data = await driverService.getById(Number(req.params.id), orgId(req));
    sendSuccess(res, "Driver fetched successfully", data);
  };

  update = async (req: Request, res: Response) => {
    const data = await driverService.update(Number(req.params.id), orgId(req), req.body);
    sendSuccess(res, "Driver updated successfully", data);
  };

  updateStatus = async (req: Request, res: Response) => {
    const data = await driverService.updateStatus(Number(req.params.id), orgId(req), req.body.status);
    sendSuccess(res, "Driver status updated successfully", data);
  };

  updateSafety = async (req: Request, res: Response) => {
    const data = await driverService.updateSafety(Number(req.params.id), orgId(req), req.body.safetyScore);
    sendSuccess(res, "Driver safety score updated successfully", data);
  };

  uploadDocument = async (req: Request, res: Response) => {
    const data = await driverService.uploadDocument(
      Number(req.params.id),
      orgId(req),
      req.body,
      req.file!.path,
      { userId: req.user!.userId, organizationId: req.user!.organizationId },
    );
    sendSuccess(res, "Driver document uploaded successfully", data, 201);
  };

  uploadPhoto = async (req: Request, res: Response) => {
    const data = await driverService.uploadPhoto(Number(req.params.id), orgId(req), req.file!.path);
    sendSuccess(res, "Driver profile photo uploaded successfully", data);
  };

  remove = async (req: Request, res: Response) => {
    const data = await driverService.remove(Number(req.params.id), orgId(req));
    sendSuccess(res, "Driver deactivated successfully", data);
  };
}

export const driverController = new DriverController();


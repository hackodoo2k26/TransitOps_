import type { Request, Response } from "express";
import { tripService } from "../services/trip.service.js";
import { sendPaginated, sendSuccess } from "../utils/response.js";

const orgId = (req: Request) => Number(req.user!.organizationId);

export class TripController {
  list = async (req: Request, res: Response) => {
    const result = await tripService.list(
      orgId(req),
      typeof req.query.search === "string" ? req.query.search : undefined,
      typeof req.query.status === "string" ? req.query.status : undefined,
    );
    sendPaginated(res, "Trips fetched successfully", result.rows, { total: result.count });
  };

  create = async (req: Request, res: Response) => {
    const data = await tripService.create(req.body, { userId: req.user!.userId, organizationId: req.user!.organizationId });
    sendSuccess(res, "Trip created successfully", data, 201);
  };

  getById = async (req: Request, res: Response) => {
    const data = await tripService.getById(Number(req.params.id), orgId(req));
    sendSuccess(res, "Trip fetched successfully", data);
  };

  dispatch = async (req: Request, res: Response) => {
    const data = await tripService.dispatch(Number(req.params.id), orgId(req), req.body.startOdometer);
    sendSuccess(res, "Trip dispatched successfully", data);
  };

  complete = async (req: Request, res: Response) => {
    const data = await tripService.complete(Number(req.params.id), orgId(req), req.body);
    sendSuccess(res, "Trip completed successfully", data);
  };

  cancel = async (req: Request, res: Response) => {
    const data = await tripService.cancel(Number(req.params.id), orgId(req), req.body.notes);
    sendSuccess(res, "Trip cancelled successfully", data);
  };
}

export const tripController = new TripController();


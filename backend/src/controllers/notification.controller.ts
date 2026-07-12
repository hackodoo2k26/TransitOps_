import type { Request, Response } from "express";
import { notificationRepository } from "../repositories/notification.repository.js";
import { sendSuccess } from "../utils/response.js";

export class NotificationController {
  list = async (req: Request, res: Response) => {
    const data = await notificationRepository.listForUser(req.user!.userId, req.user!.organizationId);
    sendSuccess(res, "Notifications fetched successfully", data);
  };
}

export const notificationController = new NotificationController();


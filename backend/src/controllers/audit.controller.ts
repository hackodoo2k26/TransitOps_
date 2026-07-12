import type { Request, Response } from "express";
import { auditRepository } from "../repositories/audit.repository.js";
import { sendSuccess } from "../utils/response.js";

export class AuditController {
  list = async (req: Request, res: Response) => {
    const organizationId = req.user?.isSuperAdmin ? null : req.user?.organizationId ?? null;
    const data = await auditRepository.list(organizationId);
    sendSuccess(res, "Audit logs fetched successfully", data);
  };
}

export const auditController = new AuditController();


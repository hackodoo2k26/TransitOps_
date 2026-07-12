import type { Request, Response } from "express";
import { userService } from "../services/user.service.js";
import { sendPaginated, sendSuccess } from "../utils/response.js";

const getActor = (req: Request) => ({
  userId: req.user?.userId ?? null,
  organizationId: req.user?.organizationId ?? null,
  ipAddress: req.ip,
  userAgent: req.headers["user-agent"] ?? null,
});

export class UserController {
  list = async (req: Request, res: Response) => {
    const orgId = req.user?.isSuperAdmin ? (req.query.organizationId ? Number(req.query.organizationId) : null) : req.user!.organizationId;
    const result = await userService.list(orgId, typeof req.query.search === "string" ? req.query.search : undefined);
    sendPaginated(res, "Users fetched successfully", result.rows, { total: result.count });
  };

  create = async (req: Request, res: Response) => {
    const data = await userService.create(req.body, getActor(req));
    sendSuccess(res, "User created successfully", data, 201);
  };

  invite = async (req: Request, res: Response) => {
    const data = await userService.invite(req.body, getActor(req));
    sendSuccess(res, "Invitation sent successfully", data, 201);
  };

  getById = async (req: Request, res: Response) => {
    const data = await userService.getById(Number(req.params.id));
    sendSuccess(res, "User fetched successfully", data);
  };

  update = async (req: Request, res: Response) => {
    const data = await userService.update(Number(req.params.id), req.body);
    sendSuccess(res, "User updated successfully", data);
  };

  assignRoles = async (req: Request, res: Response) => {
    const data = await userService.assignRoles(Number(req.params.id), req.body.roleCodes);
    sendSuccess(res, "Roles assigned successfully", data);
  };

  deactivate = async (req: Request, res: Response) => {
    const data = await userService.deactivate(Number(req.params.id));
    sendSuccess(res, "User deactivated successfully", data);
  };

  resetPassword = async (req: Request, res: Response) => {
    const data = await userService.resetPassword(Number(req.params.id), req.body.password);
    sendSuccess(res, "Password reset successfully", data);
  };
}

export const userController = new UserController();


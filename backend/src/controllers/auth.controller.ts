import type { Request, Response } from "express";
import { authService } from "../services/auth.service.js";
import { sendSuccess } from "../utils/response.js";

const getContext = (req: Request) => ({
  userId: req.user?.userId ?? null,
  organizationId: req.user?.organizationId ?? null,
  ipAddress: req.ip,
  userAgent: req.headers["user-agent"] ?? null,
});

export class AuthController {
  login = async (req: Request, res: Response) => {
    const data = await authService.login(req.body.email, req.body.password, getContext(req));
    sendSuccess(res, "Login successful", data);
  };

  refresh = async (req: Request, res: Response) => {
    const data = await authService.refresh(req.body.refreshToken, getContext(req));
    sendSuccess(res, "Token refreshed", data);
  };

  logout = async (req: Request, res: Response) => {
    await authService.logout(req.body.refreshToken);
    sendSuccess(res, "Logout successful", {});
  };

  forgotPassword = async (req: Request, res: Response) => {
    await authService.forgotPassword(req.body.email);
    sendSuccess(res, "If the email exists, a reset link has been sent", {});
  };

  resetPassword = async (req: Request, res: Response) => {
    await authService.resetPassword(req.body.token, req.body.password);
    sendSuccess(res, "Password reset successful", {});
  };

  verifyEmail = async (req: Request, res: Response) => {
    await authService.verifyEmail(req.body.token);
    sendSuccess(res, "Email verified successfully", {});
  };

  resendVerification = async (req: Request, res: Response) => {
    await authService.sendEmailVerification(req.user!.userId);
    sendSuccess(res, "Verification email sent", {});
  };

  acceptInvitation = async (req: Request, res: Response) => {
    const data = await authService.acceptInvitation(req.body.token, req.body.password);
    sendSuccess(res, "Invitation accepted", data);
  };

  changePassword = async (req: Request, res: Response) => {
    await authService.changePassword(req.user!.userId, req.body.currentPassword, req.body.newPassword);
    sendSuccess(res, "Password changed successfully", {});
  };

  session = async (req: Request, res: Response) => {
    const data = await authService.session(req.user!.userId);
    sendSuccess(res, "Session validated", data);
  };
}

export const authController = new AuthController();

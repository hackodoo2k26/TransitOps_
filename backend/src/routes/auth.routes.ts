import { Router } from "express";
import { authController } from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { validate } from "../middleware/validate.js";
import {
  acceptInvitationSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  refreshSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from "../validators/auth.validator.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();

router.post("/login", validate({ body: loginSchema }), asyncHandler(authController.login));
router.post("/refresh", validate({ body: refreshSchema }), asyncHandler(authController.refresh));
router.post("/logout", validate({ body: refreshSchema }), asyncHandler(authController.logout));
router.post("/forgot-password", validate({ body: forgotPasswordSchema }), asyncHandler(authController.forgotPassword));
router.post("/reset-password", validate({ body: resetPasswordSchema }), asyncHandler(authController.resetPassword));
router.post("/verify-email", validate({ body: verifyEmailSchema }), asyncHandler(authController.verifyEmail));
router.post("/accept-invitation", validate({ body: acceptInvitationSchema }), asyncHandler(authController.acceptInvitation));
router.post("/change-password", authenticate, validate({ body: changePasswordSchema }), asyncHandler(authController.changePassword));
router.get("/session", authenticate, asyncHandler(authController.session));
router.post("/resend-verification", authenticate, asyncHandler(authController.resendVerification));

export default router;


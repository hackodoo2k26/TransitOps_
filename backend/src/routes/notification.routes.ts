import { Router } from "express";
import { notificationController } from "../controllers/notification.controller.js";
import { PERMISSIONS } from "../constants/permissions.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();

router.use(authenticate);
router.get("/", authorize(PERMISSIONS.NOTIFICATION_READ), asyncHandler(notificationController.list));

export default router;


import { Router } from "express";
import { dashboardController } from "../controllers/dashboard.controller.js";
import { PERMISSIONS } from "../constants/permissions.js";
import { authenticate, requireOrganization } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();

router.use(authenticate);
router.get("/organization", requireOrganization, authorize(PERMISSIONS.DASHBOARD_READ), asyncHandler(dashboardController.organization));
router.get("/global", authorize(PERMISSIONS.ORGANIZATION_ANALYTICS), asyncHandler(dashboardController.global));

export default router;


import { Router } from "express";
import { reportController } from "../controllers/report.controller.js";
import { PERMISSIONS } from "../constants/permissions.js";
import { authenticate, requireOrganization } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../utils/async-handler.js";
import { paginationQuerySchema } from "../validators/common.validator.js";

const router = Router();

router.use(authenticate, requireOrganization);
router.get("/fuel-efficiency", authorize(PERMISSIONS.REPORT_READ), asyncHandler(reportController.fuelEfficiency));
router.get("/fleet-utilization", authorize(PERMISSIONS.REPORT_READ), asyncHandler(reportController.fleetUtilization));
router.get("/vehicle-roi", authorize(PERMISSIONS.REPORT_READ), asyncHandler(reportController.vehicleRoi));
router.get("/operational-cost", authorize(PERMISSIONS.REPORT_READ), asyncHandler(reportController.operationalCost));
router.get("/monthly-expenses", authorize(PERMISSIONS.REPORT_READ), asyncHandler(reportController.monthlyExpenses));
router.get("/monthly-expenses/export", authorize(PERMISSIONS.REPORT_EXPORT), validate({ query: paginationQuerySchema }), asyncHandler(reportController.exportMonthlyExpenses));

export default router;


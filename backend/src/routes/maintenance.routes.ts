import { Router } from "express";
import { maintenanceController } from "../controllers/maintenance.controller.js";
import { PERMISSIONS } from "../constants/permissions.js";
import { ROLE_CODES } from "../constants/roles.js";
import { authenticate, requireOrganization } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../utils/async-handler.js";
import { idParamSchema } from "../validators/common.validator.js";
import { closeMaintenanceSchema, createMaintenanceSchema, updateMaintenanceSchema } from "../validators/maintenance.validator.js";

const router = Router();

router.use(authenticate, requireOrganization);
router.get("/", authorize(PERMISSIONS.MAINTENANCE_READ, [ROLE_CODES.FLEET_MANAGER, ROLE_CODES.FINANCIAL_ANALYST]), asyncHandler(maintenanceController.list));
router.post("/", authorize(PERMISSIONS.MAINTENANCE_CREATE, [ROLE_CODES.FLEET_MANAGER]), validate({ body: createMaintenanceSchema }), asyncHandler(maintenanceController.create));
router.get("/:id", authorize(PERMISSIONS.MAINTENANCE_READ), validate({ params: idParamSchema }), asyncHandler(maintenanceController.getById));
router.patch("/:id", authorize(PERMISSIONS.MAINTENANCE_UPDATE, [ROLE_CODES.FLEET_MANAGER]), validate({ params: idParamSchema, body: updateMaintenanceSchema }), asyncHandler(maintenanceController.update));
router.post("/:id/close", authorize(PERMISSIONS.MAINTENANCE_CLOSE, [ROLE_CODES.FLEET_MANAGER]), validate({ params: idParamSchema, body: closeMaintenanceSchema }), asyncHandler(maintenanceController.close));

export default router;


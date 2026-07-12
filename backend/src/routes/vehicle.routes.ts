import { Router } from "express";
import { vehicleController } from "../controllers/vehicle.controller.js";
import { PERMISSIONS } from "../constants/permissions.js";
import { ROLE_CODES } from "../constants/roles.js";
import { authenticate, requireOrganization } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../utils/async-handler.js";
import { idParamSchema, paginationQuerySchema } from "../validators/common.validator.js";
import { createVehicleSchema, updateVehicleSchema } from "../validators/vehicle.validator.js";

const router = Router();

router.use(authenticate, requireOrganization);
router.get("/", authorize(PERMISSIONS.VEHICLE_READ, [ROLE_CODES.FLEET_MANAGER, ROLE_CODES.DISPATCHER, ROLE_CODES.FINANCIAL_ANALYST]), validate({ query: paginationQuerySchema }), asyncHandler(vehicleController.list));
router.post("/", authorize(PERMISSIONS.VEHICLE_CREATE, [ROLE_CODES.FLEET_MANAGER]), validate({ body: createVehicleSchema }), asyncHandler(vehicleController.create));
router.get("/:id", authorize(PERMISSIONS.VEHICLE_READ), validate({ params: idParamSchema }), asyncHandler(vehicleController.getById));
router.patch("/:id", authorize(PERMISSIONS.VEHICLE_UPDATE, [ROLE_CODES.FLEET_MANAGER]), validate({ params: idParamSchema, body: updateVehicleSchema }), asyncHandler(vehicleController.update));
router.delete("/:id", authorize(PERMISSIONS.VEHICLE_DELETE, [ROLE_CODES.FLEET_MANAGER]), validate({ params: idParamSchema }), asyncHandler(vehicleController.remove));

export default router;


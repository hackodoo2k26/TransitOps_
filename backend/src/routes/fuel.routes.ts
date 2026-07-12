import { Router } from "express";
import { fuelController } from "../controllers/fuel.controller.js";
import { PERMISSIONS } from "../constants/permissions.js";
import { ROLE_CODES } from "../constants/roles.js";
import { authenticate, requireOrganization } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../utils/async-handler.js";
import { idParamSchema } from "../validators/common.validator.js";
import { createFuelLogSchema, updateFuelLogSchema } from "../validators/fuel.validator.js";

const router = Router();

router.use(authenticate, requireOrganization);
router.get("/", authorize(PERMISSIONS.FUEL_READ, [ROLE_CODES.FLEET_MANAGER, ROLE_CODES.FINANCIAL_ANALYST]), asyncHandler(fuelController.list));
router.post("/", authorize(PERMISSIONS.FUEL_CREATE, [ROLE_CODES.FLEET_MANAGER]), validate({ body: createFuelLogSchema }), asyncHandler(fuelController.create));
router.get("/:id", authorize(PERMISSIONS.FUEL_READ), validate({ params: idParamSchema }), asyncHandler(fuelController.getById));
router.patch("/:id", authorize(PERMISSIONS.FUEL_UPDATE, [ROLE_CODES.FLEET_MANAGER]), validate({ params: idParamSchema, body: updateFuelLogSchema }), asyncHandler(fuelController.update));
router.delete("/:id", authorize(PERMISSIONS.FUEL_DELETE, [ROLE_CODES.FLEET_MANAGER]), validate({ params: idParamSchema }), asyncHandler(fuelController.remove));

export default router;


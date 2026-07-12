import { Router } from "express";
import { driverController } from "../controllers/driver.controller.js";
import { PERMISSIONS } from "../constants/permissions.js";
import { ROLE_CODES } from "../constants/roles.js";
import { authenticate, requireOrganization } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { upload } from "../middleware/upload.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../utils/async-handler.js";
import { idParamSchema, paginationQuerySchema } from "../validators/common.validator.js";
import { createDriverSchema, driverDocumentSchema, driverSafetySchema, driverStatusSchema, updateDriverSchema } from "../validators/driver.validator.js";

const router = Router();

router.use(authenticate, requireOrganization);
router.get("/", authorize(PERMISSIONS.DRIVER_READ, [ROLE_CODES.DISPATCHER, ROLE_CODES.SAFETY_OFFICER, ROLE_CODES.FLEET_MANAGER]), validate({ query: paginationQuerySchema }), asyncHandler(driverController.list));
router.post("/", authorize(PERMISSIONS.DRIVER_CREATE, [ROLE_CODES.DISPATCHER]), validate({ body: createDriverSchema }), asyncHandler(driverController.create));
router.get("/:id", authorize(PERMISSIONS.DRIVER_READ), validate({ params: idParamSchema }), asyncHandler(driverController.getById));
router.patch("/:id", authorize(PERMISSIONS.DRIVER_UPDATE, [ROLE_CODES.DISPATCHER]), validate({ params: idParamSchema, body: updateDriverSchema }), asyncHandler(driverController.update));
router.post("/:id/status", authorize(PERMISSIONS.DRIVER_STATUS, [ROLE_CODES.DISPATCHER, ROLE_CODES.SAFETY_OFFICER]), validate({ params: idParamSchema, body: driverStatusSchema }), asyncHandler(driverController.updateStatus));
router.post("/:id/safety", authorize(PERMISSIONS.DRIVER_SAFETY, [ROLE_CODES.SAFETY_OFFICER]), validate({ params: idParamSchema, body: driverSafetySchema }), asyncHandler(driverController.updateSafety));
router.post("/:id/documents", authorize(PERMISSIONS.DRIVER_DOCUMENT_UPLOAD, [ROLE_CODES.DISPATCHER]), upload.single("file"), validate({ params: idParamSchema, body: driverDocumentSchema }), asyncHandler(driverController.uploadDocument));
router.post("/:id/photo", authorize(PERMISSIONS.DRIVER_UPDATE, [ROLE_CODES.DISPATCHER]), upload.single("file"), validate({ params: idParamSchema }), asyncHandler(driverController.uploadPhoto));
router.delete("/:id", authorize(PERMISSIONS.DRIVER_UPDATE, [ROLE_CODES.DISPATCHER]), validate({ params: idParamSchema }), asyncHandler(driverController.remove));

export default router;


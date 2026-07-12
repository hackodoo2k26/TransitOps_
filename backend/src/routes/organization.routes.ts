import { Router } from "express";
import { organizationController } from "../controllers/organization.controller.js";
import { PERMISSIONS } from "../constants/permissions.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../utils/async-handler.js";
import { idParamSchema, paginationQuerySchema } from "../validators/common.validator.js";
import { createOrganizationSchema, updateOrganizationSchema } from "../validators/organization.validator.js";

const router = Router();

router.use(authenticate);
router.get("/", authorize(PERMISSIONS.ORGANIZATION_READ), validate({ query: paginationQuerySchema }), asyncHandler(organizationController.list));
router.post("/", authorize(PERMISSIONS.ORGANIZATION_CREATE), validate({ body: createOrganizationSchema }), asyncHandler(organizationController.create));
router.get("/:id", authorize(PERMISSIONS.ORGANIZATION_READ), validate({ params: idParamSchema }), asyncHandler(organizationController.getById));
router.patch("/:id", authorize(PERMISSIONS.ORGANIZATION_UPDATE), validate({ params: idParamSchema, body: updateOrganizationSchema }), asyncHandler(organizationController.update));
router.post("/:id/suspend", authorize(PERMISSIONS.ORGANIZATION_SUSPEND), validate({ params: idParamSchema }), asyncHandler(organizationController.suspend));
router.post("/:id/activate", authorize(PERMISSIONS.ORGANIZATION_ACTIVATE), validate({ params: idParamSchema }), asyncHandler(organizationController.activate));
router.delete("/:id", authorize(PERMISSIONS.ORGANIZATION_DELETE), validate({ params: idParamSchema }), asyncHandler(organizationController.remove));

export default router;


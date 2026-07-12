import { Router } from "express";
import { userController } from "../controllers/user.controller.js";
import { PERMISSIONS } from "../constants/permissions.js";
import { ROLE_CODES } from "../constants/roles.js";
import { authenticate, requireOrganization } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../utils/async-handler.js";
import { idParamSchema, paginationQuerySchema } from "../validators/common.validator.js";
import { assignRolesSchema, createUserSchema, inviteUserSchema, resetUserPasswordSchema, updateUserSchema } from "../validators/user.validator.js";

const router = Router();

router.use(authenticate);
router.get("/", authorize(PERMISSIONS.USER_READ, [ROLE_CODES.FLEET_MANAGER]), validate({ query: paginationQuerySchema }), asyncHandler(userController.list));
router.post("/", requireOrganization, authorize(PERMISSIONS.USER_CREATE, [ROLE_CODES.FLEET_MANAGER]), validate({ body: createUserSchema }), asyncHandler(userController.create));
router.post("/invite", requireOrganization, authorize(PERMISSIONS.USER_INVITE, [ROLE_CODES.FLEET_MANAGER]), validate({ body: inviteUserSchema }), asyncHandler(userController.invite));
router.get("/:id", authorize(PERMISSIONS.USER_READ, [ROLE_CODES.FLEET_MANAGER]), validate({ params: idParamSchema }), asyncHandler(userController.getById));
router.patch("/:id", authorize(PERMISSIONS.USER_UPDATE, [ROLE_CODES.FLEET_MANAGER]), validate({ params: idParamSchema, body: updateUserSchema }), asyncHandler(userController.update));
router.post("/:id/assign-roles", authorize(PERMISSIONS.USER_ASSIGN_ROLE, [ROLE_CODES.FLEET_MANAGER]), validate({ params: idParamSchema, body: assignRolesSchema }), asyncHandler(userController.assignRoles));
router.post("/:id/deactivate", authorize(PERMISSIONS.USER_DEACTIVATE, [ROLE_CODES.FLEET_MANAGER]), validate({ params: idParamSchema }), asyncHandler(userController.deactivate));
router.post("/:id/reset-password", authorize(PERMISSIONS.USER_RESET_PASSWORD, [ROLE_CODES.FLEET_MANAGER]), validate({ params: idParamSchema, body: resetUserPasswordSchema }), asyncHandler(userController.resetPassword));

export default router;


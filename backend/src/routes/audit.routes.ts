import { Router } from "express";
import { auditController } from "../controllers/audit.controller.js";
import { PERMISSIONS } from "../constants/permissions.js";
import { ROLE_CODES } from "../constants/roles.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();

router.use(authenticate);
router.get("/", authorize(PERMISSIONS.AUDIT_READ, [ROLE_CODES.FLEET_MANAGER]), asyncHandler(auditController.list));

export default router;


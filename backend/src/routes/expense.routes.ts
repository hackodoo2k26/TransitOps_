import { Router } from "express";
import { expenseController } from "../controllers/expense.controller.js";
import { PERMISSIONS } from "../constants/permissions.js";
import { ROLE_CODES } from "../constants/roles.js";
import { authenticate, requireOrganization } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../utils/async-handler.js";
import { idParamSchema } from "../validators/common.validator.js";
import { createExpenseSchema, updateExpenseSchema } from "../validators/expense.validator.js";

const router = Router();

router.use(authenticate, requireOrganization);
router.get("/", authorize(PERMISSIONS.EXPENSE_READ, [ROLE_CODES.FLEET_MANAGER, ROLE_CODES.FINANCIAL_ANALYST]), asyncHandler(expenseController.list));
router.post("/", authorize(PERMISSIONS.EXPENSE_CREATE, [ROLE_CODES.FLEET_MANAGER]), validate({ body: createExpenseSchema }), asyncHandler(expenseController.create));
router.get("/:id", authorize(PERMISSIONS.EXPENSE_READ), validate({ params: idParamSchema }), asyncHandler(expenseController.getById));
router.patch("/:id", authorize(PERMISSIONS.EXPENSE_UPDATE, [ROLE_CODES.FLEET_MANAGER]), validate({ params: idParamSchema, body: updateExpenseSchema }), asyncHandler(expenseController.update));
router.delete("/:id", authorize(PERMISSIONS.EXPENSE_DELETE, [ROLE_CODES.FLEET_MANAGER]), validate({ params: idParamSchema }), asyncHandler(expenseController.remove));

export default router;


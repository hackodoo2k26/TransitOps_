import { Router } from "express";
import { tripController } from "../controllers/trip.controller.js";
import { PERMISSIONS } from "../constants/permissions.js";
import { ROLE_CODES } from "../constants/roles.js";
import { authenticate, requireOrganization } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../utils/async-handler.js";
import { idParamSchema, paginationQuerySchema } from "../validators/common.validator.js";
import { cancelTripSchema, completeTripSchema, createTripSchema, dispatchTripSchema } from "../validators/trip.validator.js";

const router = Router();

router.use(authenticate, requireOrganization);
router.get("/", authorize(PERMISSIONS.TRIP_READ, [ROLE_CODES.DISPATCHER, ROLE_CODES.FLEET_MANAGER, ROLE_CODES.FINANCIAL_ANALYST]), validate({ query: paginationQuerySchema }), asyncHandler(tripController.list));
router.post("/", authorize(PERMISSIONS.TRIP_CREATE, [ROLE_CODES.DISPATCHER]), validate({ body: createTripSchema }), asyncHandler(tripController.create));
router.get("/:id", authorize(PERMISSIONS.TRIP_READ), validate({ params: idParamSchema }), asyncHandler(tripController.getById));
router.post("/:id/dispatch", authorize(PERMISSIONS.TRIP_DISPATCH, [ROLE_CODES.DISPATCHER]), validate({ params: idParamSchema, body: dispatchTripSchema }), asyncHandler(tripController.dispatch));
router.post("/:id/complete", authorize(PERMISSIONS.TRIP_COMPLETE, [ROLE_CODES.DISPATCHER]), validate({ params: idParamSchema, body: completeTripSchema }), asyncHandler(tripController.complete));
router.post("/:id/cancel", authorize(PERMISSIONS.TRIP_CANCEL, [ROLE_CODES.DISPATCHER]), validate({ params: idParamSchema, body: cancelTripSchema }), asyncHandler(tripController.cancel));

export default router;


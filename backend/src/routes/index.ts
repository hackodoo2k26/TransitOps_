import { Router } from "express";
import auditRoutes from "./audit.routes.js";
import authRoutes from "./auth.routes.js";
import dashboardRoutes from "./dashboard.routes.js";
import driverRoutes from "./driver.routes.js";
import expenseRoutes from "./expense.routes.js";
import fuelRoutes from "./fuel.routes.js";
import maintenanceRoutes from "./maintenance.routes.js";
import notificationRoutes from "./notification.routes.js";
import organizationRoutes from "./organization.routes.js";
import reportRoutes from "./report.routes.js";
import tripRoutes from "./trip.routes.js";
import userRoutes from "./user.routes.js";
import vehicleRoutes from "./vehicle.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/audit-logs", auditRoutes);
router.use("/organizations", organizationRoutes);
router.use("/users", userRoutes);
router.use("/vehicles", vehicleRoutes);
router.use("/drivers", driverRoutes);
router.use("/trips", tripRoutes);
router.use("/maintenance", maintenanceRoutes);
router.use("/fuel-logs", fuelRoutes);
router.use("/expenses", expenseRoutes);
router.use("/dashboards", dashboardRoutes);
router.use("/reports", reportRoutes);
router.use("/notifications", notificationRoutes);

export default router;

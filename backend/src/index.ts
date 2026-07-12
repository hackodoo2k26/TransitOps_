import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import vehicleRoutes from "./routes/vehicles.js";
import driverRoutes from "./routes/drivers.js";
import tripRoutes from "./routes/trips.js";
import maintenanceRoutes from "./routes/maintenance.js";
import fuelLogRoutes from "./routes/fuel-logs.js";
import expenseRoutes from "./routes/expenses.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/vehicles", vehicleRoutes);
app.use("/drivers", driverRoutes);
app.use("/trips", tripRoutes);
app.use("/maintenance", maintenanceRoutes);
app.use("/fuel-logs", fuelLogRoutes);
app.use("/expenses", expenseRoutes);

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.listen(PORT, () => console.log(`TransitOps backend running on http://localhost:${PORT}`));

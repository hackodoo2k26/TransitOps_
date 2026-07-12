import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import path from "path";
import swaggerUi from "swagger-ui-express";
import routes from "./routes/index.js";
import { env } from "./config/env.js";
import { morganStream } from "./config/logger.js";
import { auditTrail } from "./middleware/audit-trail.js";
import { errorHandler } from "./middleware/error-handler.js";
import { notFoundHandler } from "./middleware/not-found.js";
import { openApiDocument } from "./swagger/document.js";

export const app = express();

app.use(helmet());
app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);
app.use(
  rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);
app.use(morgan("combined", { stream: morganStream }));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.resolve(env.UPLOAD_DIR)));
app.use(auditTrail);
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));
app.use("/api", routes);
app.get("/health", (_req, res) => {
  res.json({
    success: true,
    message: "TransitOps backend is healthy",
    data: { status: "ok" },
  });
});
app.use(notFoundHandler);
app.use(errorHandler);

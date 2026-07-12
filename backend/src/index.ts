import { app } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { pool } from "./db/index.js";
import { startReminderJobs } from "./jobs/reminders.job.js";
import { bootstrapService } from "./services/bootstrap.service.js";

const start = async () => {
  await pool.query("select 1");
  await bootstrapService.initializeAccessControl();
  await bootstrapService.ensureSuperAdmin();
  startReminderJobs();

  app.listen(env.PORT, () => {
    logger.info(`TransitOps backend listening on http://localhost:${env.PORT}`);
  });
};

start().catch((error) => {
  logger.error("Failed to start TransitOps backend", { error });
  process.exit(1);
});

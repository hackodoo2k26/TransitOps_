import { bootstrapService } from "./services/bootstrap.service.js";

async function seed() {
  await bootstrapService.initializeAccessControl();
  await bootstrapService.ensureSuperAdmin();
  process.stdout.write("Seed complete. Super admin: admin@transitops.com / Admin@123\n");
  process.exit(0);
}

seed().catch((error) => {
  process.stderr.write(`Seed failed: ${String(error)}\n`);
  process.exit(1);
});

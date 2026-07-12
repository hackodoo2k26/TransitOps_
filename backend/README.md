# TransitOps Backend

Production-oriented backend for TransitOps, built into the existing TypeScript + Express + Drizzle project.

## What is included

- Multi-tenant organization isolation
- JWT access tokens and refresh tokens
- Invitation flow, password reset, email verification, session validation
- RBAC with `roles`, `permissions`, `role_permissions`, and `user_roles`
- Domain modules for organizations, users, drivers, vehicles, trips, maintenance, fuel logs, expenses, dashboards, reports, and notifications
- Zod request validation
- Helmet, CORS, rate limiting, Morgan, Winston
- Multer file uploads for driver photos and documents
- Swagger docs at `/api/docs`
- Docker and Docker Compose
- Seed bootstrap for the default super admin

## Default super admin

- Email: `admin@transitops.com`
- Password: `Admin@123`

## Run locally

1. Copy `.env.example` to `.env`
2. Start PostgreSQL
3. Run:

```bash
npm install
npm run build
npm run db:seed
npm run dev
```

## API base

- Base URL: `http://localhost:3001/api`
- Swagger: `http://localhost:3001/api/docs`
- Health: `http://localhost:3001/health`

## Notes

- The implementation stays on the existing Drizzle stack already present in this project.
- The schema was expanded to support multi-tenancy, auth lifecycle tables, RBAC, transport operations, notifications, and audit storage.
- Use `drizzle-kit` with `src/db/schema.ts` to generate and push migrations for your database.


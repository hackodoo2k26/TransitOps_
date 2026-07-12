# TransitOps Backend API

TransitOps is a multi-tenant fleet operations backend built with Express, TypeScript, Drizzle ORM, and PostgreSQL.

This README is the backend API reference for frontend integration, Postman usage, and local development.

## Base URLs

- API base: `http://localhost:3001/api`
- Swagger UI: `http://localhost:3001/api/docs`
- Health check: `http://localhost:3001/health`

## Stack

- Express 5
- TypeScript
- Drizzle ORM
- PostgreSQL
- JWT access and refresh tokens
- Zod request validation
- Winston + Morgan logging
- Multer uploads for driver files

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

## Authentication

Most endpoints require:

```http
Authorization: Bearer <access_token>
```

### Auth flow

1. Call `POST /auth/login`
2. Store `accessToken` and `refreshToken`
3. Send `Authorization: Bearer <accessToken>` on protected requests
4. When the access token expires, call `POST /auth/refresh`
5. Use `GET /auth/session` to fetch the current logged-in user

### Current user

Use:

```http
GET /api/auth/session
Authorization: Bearer <access_token>
```

The response includes the current user identity, `organizationId`, role list, and status.

## Response format

Successful responses use:

```json
{
  "success": true,
  "message": "Human readable message",
  "data": {}
}
```

Paginated list responses use:

```json
{
  "success": true,
  "message": "Human readable message",
  "data": [],
  "meta": {}
}
```

Error responses use the app error handler and typically look like:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": []
}
```

## Roles

The backend currently supports these role codes:

- `SUPER_ADMIN`
- `FLEET_MANAGER`
- `DISPATCHER`
- `SAFETY_OFFICER`
- `FINANCIAL_ANALYST`

## Demo users

Seeded credentials:

| Email | Password | Role |
| --- | --- | --- |
| `admin@transitops.com` | `Admin@123` | `SUPER_ADMIN` |
| `manager@transitops.com` | `Admin@123` | `FLEET_MANAGER` |
| `dispatcher@transitops.com` | `Admin@123` | `DISPATCHER` |
| `safety@transitops.com` | `Admin@123` | `SAFETY_OFFICER` |
| `analyst@transitops.com` | `Admin@123` | `FINANCIAL_ANALYST` |

## Common query params

Several list and report endpoints accept these query parameters when relevant:

| Query param | Type | Notes |
| --- | --- | --- |
| `page` | number | Positive integer |
| `limit` | number | Max `100` |
| `search` | string | Search text |
| `status` | string | Module-specific status filter |
| `sortBy` | string | Sort field |
| `sortOrder` | `asc` or `desc` | Sort direction |
| `from` | string | Date range start |
| `to` | string | Date range end |
| `month` | number | `1-12` |
| `year` | number | `2000-2100` |
| `format` | `csv` or `pdf` | Used by export endpoints |

## API modules

### Auth

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/auth/login` | No | Login with email and password |
| `POST` | `/auth/refresh` | No | Rotate refresh token |
| `POST` | `/auth/logout` | No | Revoke refresh token |
| `POST` | `/auth/forgot-password` | No | Request password reset |
| `POST` | `/auth/reset-password` | No | Reset password using token |
| `POST` | `/auth/verify-email` | No | Verify email token |
| `POST` | `/auth/accept-invitation` | No | Accept invited account |
| `POST` | `/auth/change-password` | Yes | Change current password |
| `GET` | `/auth/session` | Yes | Get current user session |
| `POST` | `/auth/resend-verification` | Yes | Re-send verification email |

Common request bodies:

```json
{
  "email": "manager@transitops.com",
  "password": "Admin@123"
}
```

```json
{
  "refreshToken": "your-refresh-token"
}
```

### Organizations

These endpoints are intended for global administration.

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/organizations` | Yes | List organizations |
| `POST` | `/organizations` | Yes | Create organization |
| `GET` | `/organizations/:id` | Yes | Get organization details |
| `PATCH` | `/organizations/:id` | Yes | Update organization |
| `POST` | `/organizations/:id/suspend` | Yes | Suspend organization |
| `POST` | `/organizations/:id/activate` | Yes | Activate organization |
| `DELETE` | `/organizations/:id` | Yes | Delete organization |

Create or update body fields:

| Field | Type |
| --- | --- |
| `name` | string |
| `slug` | string |
| `contactEmail` | string |
| `contactPhone` | string |
| `address` | string |

### Users

`POST /users` and `POST /users/invite` require organization context for non-super-admin users.

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/users` | Yes | List users |
| `POST` | `/users` | Yes | Create user |
| `POST` | `/users/invite` | Yes | Invite user |
| `GET` | `/users/:id` | Yes | Get user details |
| `PATCH` | `/users/:id` | Yes | Update user |
| `POST` | `/users/:id/assign-roles` | Yes | Replace user roles |
| `POST` | `/users/:id/deactivate` | Yes | Deactivate user |
| `POST` | `/users/:id/reset-password` | Yes | Reset user password |

Create user body:

```json
{
  "name": "New Manager",
  "email": "new.manager@transitops.com",
  "password": "Password@123",
  "organizationId": 1,
  "roleCodes": ["FLEET_MANAGER"]
}
```

Invite user body:

```json
{
  "name": "Ops Analyst",
  "email": "ops.analyst@transitops.com",
  "organizationId": 1,
  "roleCodes": ["FINANCIAL_ANALYST"]
}
```

### Vehicles

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/vehicles` | Yes | List vehicles |
| `POST` | `/vehicles` | Yes | Create vehicle |
| `GET` | `/vehicles/:id` | Yes | Get vehicle details |
| `PATCH` | `/vehicles/:id` | Yes | Update vehicle |
| `DELETE` | `/vehicles/:id` | Yes | Delete vehicle |

Vehicle body fields:

| Field | Type |
| --- | --- |
| `registrationNumber` | string |
| `model` | string |
| `vehicleType` | string |
| `maxCapacity` | number |
| `currentOdometer` | number |
| `acquisitionCost` | number |
| `region` | string |
| `status` | `available`, `on_trip`, `in_shop`, `retired` |

### Drivers

File upload endpoints use `multipart/form-data`.

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/drivers` | Yes | List drivers |
| `POST` | `/drivers` | Yes | Create driver |
| `GET` | `/drivers/:id` | Yes | Get driver details |
| `PATCH` | `/drivers/:id` | Yes | Update driver |
| `POST` | `/drivers/:id/status` | Yes | Update driver status |
| `POST` | `/drivers/:id/safety` | Yes | Update safety score |
| `POST` | `/drivers/:id/documents` | Yes | Upload document |
| `POST` | `/drivers/:id/photo` | Yes | Upload profile photo |
| `DELETE` | `/drivers/:id` | Yes | Soft delete driver |

Create or update driver fields:

| Field | Type |
| --- | --- |
| `name` | string |
| `employeeId` | string |
| `phone` | string |
| `email` | string |
| `address` | string |
| `emergencyContact` | object |
| `bloodGroup` | string |
| `licenseNumber` | string |
| `licenseCategory` | string |
| `licenseExpiry` | `YYYY-MM-DD` |
| `joiningDate` | `YYYY-MM-DD` |
| `safetyScore` | number |
| `status` | `available`, `on_trip`, `off_duty`, `suspended`, `inactive` |

Document upload fields:

| Field | Type |
| --- | --- |
| `file` | file |
| `documentName` | string |
| `documentType` | `driving_license`, `aadhaar`, `pan`, `medical_certificate`, `police_verification`, `experience_certificate`, `other` |
| `expiryDate` | `YYYY-MM-DD` |

### Trips

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/trips` | Yes | List trips |
| `POST` | `/trips` | Yes | Create trip |
| `GET` | `/trips/:id` | Yes | Get trip details |
| `POST` | `/trips/:id/dispatch` | Yes | Dispatch trip |
| `POST` | `/trips/:id/complete` | Yes | Complete trip |
| `POST` | `/trips/:id/cancel` | Yes | Cancel trip |

Create trip body:

```json
{
  "source": "Pune Depot",
  "destination": "Mumbai Hub",
  "vehicleId": 1,
  "driverId": 1,
  "cargoWeight": 4500,
  "plannedDistance": 165,
  "revenue": 25000,
  "notes": "Consumer goods delivery"
}
```

Dispatch body:

```json
{
  "startOdometer": 152340
}
```

Complete body:

```json
{
  "endOdometer": 152505,
  "actualDistance": 165,
  "fuelConsumed": 110,
  "revenue": 25000
}
```

Cancel body:

```json
{
  "notes": "Customer requested cancellation"
}
```

### Maintenance

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/maintenance` | Yes | List maintenance logs |
| `POST` | `/maintenance` | Yes | Create maintenance log |
| `GET` | `/maintenance/:id` | Yes | Get maintenance details |
| `PATCH` | `/maintenance/:id` | Yes | Update maintenance log |
| `POST` | `/maintenance/:id/close` | Yes | Close maintenance log |

Create body:

```json
{
  "vehicleId": 2,
  "description": "Brake pad replacement",
  "cost": 12500,
  "openedAt": "2026-07-10"
}
```

Close body:

```json
{
  "closedAt": "2026-07-12"
}
```

### Fuel Logs

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/fuel-logs` | Yes | List fuel logs |
| `POST` | `/fuel-logs` | Yes | Create fuel log |
| `GET` | `/fuel-logs/:id` | Yes | Get fuel log details |
| `PATCH` | `/fuel-logs/:id` | Yes | Update fuel log |
| `DELETE` | `/fuel-logs/:id` | Yes | Delete fuel log |

Create or update body:

```json
{
  "vehicleId": 1,
  "tripId": 1,
  "liters": 110,
  "cost": 9800,
  "odometer": 152340,
  "date": "2026-07-11"
}
```

### Expenses

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/expenses` | Yes | List expenses |
| `POST` | `/expenses` | Yes | Create expense |
| `GET` | `/expenses/:id` | Yes | Get expense details |
| `PATCH` | `/expenses/:id` | Yes | Update expense |
| `DELETE` | `/expenses/:id` | Yes | Delete expense |

Create or update body:

```json
{
  "vehicleId": 1,
  "tripId": 1,
  "type": "toll",
  "amount": 1200,
  "date": "2026-07-11",
  "notes": "Expressway toll charges"
}
```

Allowed expense types:

- `fuel`
- `maintenance`
- `toll`
- `misc`

### Dashboards

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/dashboards/organization` | Yes | Organization KPIs |
| `GET` | `/dashboards/global` | Yes | Global KPIs across organizations |

### Reports

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/reports/fuel-efficiency` | Yes | Fuel efficiency report |
| `GET` | `/reports/fleet-utilization` | Yes | Fleet utilization report |
| `GET` | `/reports/vehicle-roi` | Yes | Vehicle ROI report |
| `GET` | `/reports/operational-cost` | Yes | Operational cost report |
| `GET` | `/reports/monthly-expenses` | Yes | Monthly expense report |
| `GET` | `/reports/monthly-expenses/export` | Yes | Export monthly expenses |

Export query example:

```http
GET /api/reports/monthly-expenses/export?format=csv&month=7&year=2026
Authorization: Bearer <access_token>
```

### Notifications

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/notifications` | Yes | List notifications for current user |

### Audit Logs

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/audit-logs` | Yes | List audit logs |

## Frontend integration notes

- Login first with `POST /auth/login`
- Persist both tokens on the frontend
- Use `GET /auth/session` after login or app refresh to get the active user
- For organization-scoped screens, make sure the logged-in user has a non-null `organizationId`
- Super admin can access global endpoints such as organizations and global dashboard
- Upload endpoints for driver files must use `multipart/form-data`

## Postman

The project already includes a collection at [TransitOps.postman_collection.json](/D:/C%20Drive%20bkp/Desktop/Odoo26/backend/postman/TransitOps.postman_collection.json).

Recommended Postman variables:

| Variable | Example |
| --- | --- |
| `baseUrl` | `http://localhost:3001/api` |
| `accessToken` | JWT access token |
| `refreshToken` | JWT refresh token |

## Notes

- Swagger is intentionally lightweight and currently serves as a route index, while this README is the fuller integration guide.
- Organization-scoped modules rely on the authenticated user context.
- Request validation is enforced with Zod before controller execution.

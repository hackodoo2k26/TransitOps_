# 🚚 TransitOps — Smart Transport Operations Platform

**A centralized platform to digitize fleet, driver, dispatch, maintenance, and expense management — replacing spreadsheets and logbooks with real-time visibility and enforced business logic.**

![Status](https://img.shields.io/badge/status-hackathon--build-orange)
![React](https://img.shields.io/badge/frontend-React-61DAFB?logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/backend-Node.js%20%2F%20Express-339933?logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/database-PostgreSQL-4169E1?logo=postgresql&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## 📋 Table of Contents

- [Problem Statement](#-problem-statement)
- [Our Solution](#-our-solution)
- [Target Users](#-target-users)
- [Key Features](#-key-features)
- [System Architecture](#️-system-architecture)
- [Database Schema (ER Diagram)](#️-database-schema-er-diagram)
- [State Machines](#-state-machines)
- [Business Rules Enforced](#-business-rules-enforced)
- [User Roles & Permissions](#-user-roles--permissions)
- [Tech Stack](#️-tech-stack)
- [Project Structure](#-project-structure)
- [Frontend Architecture](#-frontend-architecture)
- [Backend Architecture](#-backend-architecture)
- [Authentication](#-authentication)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Demo Walkthrough](#-demo-walkthrough)
- [Assumptions & Design Decisions](#-assumptions--design-decisions)
- [Bonus Features](#-bonus-features)
- [Screenshots](#️-screenshots)
- [Team](#-team)
- [License](#-license)

---

## 🧩 Problem Statement

Most logistics and transport teams still run their operations off spreadsheets and paper logbooks. That leads to a familiar set of failures:

- Vehicles double-booked or dispatched while still under repair
- Drivers assigned trips despite expired licenses or suspended status
- Overloaded vehicles because cargo weight is never checked against capacity
- Maintenance that gets forgotten until something breaks
- No real picture of fuel cost, operational cost, or fleet utilization until someone manually compiles a report

**TransitOps** exists to close that gap — one system covering the full lifecycle of a transport operation, from vehicle registration to trip dispatch to cost reporting, with the business rules baked into the platform instead of left to human memory.

## 💡 Our Solution

TransitOps is a role-based web application that gives every stakeholder — from the Fleet Manager to the Financial Analyst — a live, single source of truth for the fleet. The system doesn't just store data; it **enforces the rules that keep operations safe and efficient**: a driver can't be double-booked, an overloaded trip can't be dispatched, a vehicle in the shop can't be sent out, and every status change cascades automatically instead of relying on manual updates.

## 🎯 Target Users

| Role                       | Responsibility                                                                       |
| -------------------------- | ------------------------------------------------------------------------------------ |
| 🚛 **Fleet Manager**       | Oversees fleet assets, maintenance, vehicle lifecycle, and operational efficiency    |
| 🧭 **Driver / Dispatcher** | Creates trips, assigns vehicles and drivers, monitors active deliveries              |
| 🛡️ **Safety Officer**      | Ensures driver compliance, tracks license validity, monitors safety scores           |
| 📊 **Financial Analyst**   | Reviews operational expenses, fuel consumption, maintenance costs, and profitability |

---

## ✨ Key Features

### 🔐 Authentication & Access

- [x] Secure email/password login with session validation
- [x] Secure password recovery flow (Forgot / Reset password via email link)
- [x] Role-Based Access Control (RBAC) across all four roles (Fleet Manager, Dispatcher, Safety Officer, Financial Analyst)
- [x] Route-level and action-level permission enforcement

### 📊 Operational Dashboard

- [x] Live KPIs — Active Vehicles, Available Vehicles, Vehicles in Maintenance, Active Trips, Pending Trips, Drivers On Duty, Fleet Utilization (%)
- [x] Filters by vehicle type, status, and region
- [x] Global super admin dashboard viewing all organizations

### 🚐 Vehicle Registry

- [x] Master vehicle list — unique Registration Number, Model, Type, Max Load Capacity, Odometer, Acquisition Cost, Status
- [x] Status lifecycle: `Available → On Trip → In Shop → Retired`

### 👤 Driver Management

- [x] Driver profiles — License Number, Category, Expiry Date, Contact, Safety Score, Status
- [x] Driver document uploads (License, PAN, Aadhaar, etc.) and profile photo uploading
- [x] Status lifecycle: `Available / On Trip / Off Duty / Suspended / Inactive`

### 🗺️ Trip Management

- [x] Trip creation with source, destination, vehicle, driver, cargo weight, planned distance
- [x] Full lifecycle: `Draft → Dispatched → Completed / Cancelled`
- [x] Hard validation against cargo capacity, driver/vehicle eligibility, and double-booking

### 🔧 Maintenance Workflow

- [x] Maintenance logging per vehicle with status (`Open` / `Closed`) and cost
- [x] Auto status transition to `In Shop` on active maintenance record — instantly removed from the dispatch pool
- [x] Closing maintenance restores vehicle to `Available`

### ⛽ Fuel & Expense Tracking

- [x] Fuel logs (liters, cost, odometer reference, date) and general expenses (tolls, maintenance, fuel, misc.)
- [x] Auto-computed total operational cost per vehicle (Fuel + Maintenance + Expenses)

### 📈 Reports & Analytics

- [x] Fuel Efficiency (Distance / Fuel)
- [x] Fleet Utilization
- [x] Operational Cost breakdown
- [x] Vehicle ROI
- [x] Monthly Expenses report
- [x] Export capability to both CSV and PDF formats

### 🛡️ Audit & Notifications

- [x] Automated system audit logs tracking entity changes (before/after state, actor, IP, User Agent)
- [x] Notification engine sending system or email notifications (e.g. invite, system alerts)

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    React Frontend (SPA)                 │
│  Dashboard · Vehicles · Drivers · Trips · Maintenance   │
│          Fuel & Expenses · Reports · Admin/RBAC         │
└───────────────────────────┬─────────────────────────────┘
                            │  REST API (JWT-authenticated)
┌───────────────────────────▼─────────────────────────────┐
│              Node.js + Express API Layer                │
│   Auth & RBAC Middleware · Business Rule Validators     │
│   Trip State Machine · Vehicle/Driver Status Engine     │
│   Cost & Efficiency Calculators                         │
└───────────────────────────┬─────────────────────────────┘
                            │  Prisma ORM
┌───────────────────────────▼─────────────────────────────┐
│                 PostgreSQL Database                     │
│  Users · Vehicles · Drivers · Trips · MaintenanceLogs   │
│  FuelLogs · Expenses                                    │
└─────────────────────────────────────────────────────────┘
```

## 🗄️ Database Schema (ER Diagram)

```mermaid
erDiagram
    USER ||--o{ TRIP : creates
    USER {
        string id PK
        string name
        string email
        string passwordHash
        string role
    }
    VEHICLE ||--o{ TRIP : "assigned to"
    VEHICLE ||--o{ MAINTENANCE_LOG : "has"
    VEHICLE ||--o{ FUEL_LOG : "has"
    VEHICLE ||--o{ EXPENSE : "incurs"
    VEHICLE {
        string id PK
        string registrationNumber UK
        string modelName
        string type
        number maxLoadCapacity
        number odometer
        number acquisitionCost
        string region
        string status
    }
    DRIVER ||--o{ TRIP : "assigned to"
    DRIVER {
        string id PK
        string name
        string licenseNumber
        string licenseCategory
        date licenseExpiryDate
        string contactNumber
        number safetyScore
        string status
    }
    TRIP {
        string id PK
        string source
        string destination
        string vehicleId FK
        string driverId FK
        number cargoWeight
        number plannedDistance
        number startOdometer
        number endOdometer
        number fuelConsumed
        number revenue
        string status
    }
    MAINTENANCE_LOG {
        string id PK
        string vehicleId FK
        string description
        number cost
        date date
        string status
    }
    FUEL_LOG {
        string id PK
        string vehicleId FK
        string tripId FK
        number liters
        number cost
        date date
    }
    EXPENSE {
        string id PK
        string vehicleId FK
        string type
        number amount
        date date
    }
```

## 🔄 State Machines

**Trip Lifecycle**

```mermaid
stateDiagram-v2
    [*] --> Draft
    Draft --> Dispatched : dispatch (validations pass)
    Draft --> Cancelled : cancel (no side effects)
    Dispatched --> Completed : complete (odometer + fuel entered)
    Dispatched --> Cancelled : cancel (restores vehicle + driver)
    Completed --> [*]
    Cancelled --> [*]
```

**Vehicle Status**

```mermaid
stateDiagram-v2
    [*] --> Available
    Available --> OnTrip : trip dispatched
    OnTrip --> Available : trip completed / cancelled
    Available --> InShop : maintenance record created
    InShop --> Available : maintenance closed
    Available --> Retired : manually retired (Fleet Manager)
    InShop --> Retired : manually retired (Fleet Manager)
```

**Driver Status**

```mermaid
stateDiagram-v2
    [*] --> Available
    Available --> OnTrip : trip dispatched
    OnTrip --> Available : trip completed / cancelled
    Available --> OffDuty : manual toggle
    Available --> Suspended : Safety Officer action
```

---

## 📏 Business Rules Enforced

| #   | Rule                                                                                     |
| --- | ---------------------------------------------------------------------------------------- |
| 1   | Vehicle registration number must be unique                                               |
| 2   | Retired or In Shop vehicles never appear in dispatch selection                           |
| 3   | Drivers with expired licenses, Suspended, or Off Duty status cannot be assigned to trips |
| 4   | A driver or vehicle already On Trip cannot be assigned to another trip                   |
| 5   | Cargo weight must not exceed the vehicle's max load capacity                             |
| 6   | Dispatch → both vehicle and driver flip to `On Trip`                                     |
| 7   | Complete → both flip back to `Available`                                                 |
| 8   | Cancel (from Dispatched) → both restored to `Available`                                  |
| 9   | Cancel (from Draft) → no side effects, since nothing was ever locked                     |
| 10  | Active maintenance record → vehicle auto-flips to `In Shop`                              |
| 11  | Closing maintenance → vehicle restored to `Available`, unless Retired                    |

## 👥 User Roles & Permissions

| Action                           | Fleet Manager | Driver/Dispatcher | Safety Officer | Financial Analyst |
| -------------------------------- | :-----------: | :---------------: | :------------: | :---------------: |
| Register / edit vehicles         |      ✅       |        ❌         |       ❌       |      👁️ View      |
| Manage driver profiles           |      ✅       |        ❌         |       ✅       |      👁️ View      |
| Create / dispatch trips          |      ✅       |        ✅         |       ❌       |      👁️ View      |
| Log maintenance                  |      ✅       |        ❌         |       ❌       |      👁️ View      |
| Log fuel / expenses              |      ✅       |        ✅         |       ❌       |      👁️ View      |
| View cost & ROI reports          |    👁️ View    |        ❌         |       ❌       |        ✅         |
| Manage license/safety compliance |    👁️ View    |        ❌         |       ✅       |        ❌         |

---

## 🛠️ Tech Stack

| Layer | Technology |
| --- | --- |
| **Frontend** | React 19, React Router v7, Axios, TailwindCSS v4, Framer Motion, Lucide React |
| **Backend** | Node.js, Express.js (v5), TypeScript (run via `tsx`, compiled via `tsc`) |
| **Database** | PostgreSQL |
| **ORM** | Drizzle ORM, Drizzle Kit |
| **Authentication** | JWT (Access + Refresh tokens), bcrypt password hashing |
| **Validation** | Zod schema validation |
| **Logging & Security** | Winston logger, Morgan HTTP logger, Helmet security headers, Express Rate Limit |
| **File Uploads** | Multer |
| **Email Service** | Nodemailer |
| **PDF Generation** | PDFKit |

---

## 📁 Project Structure

```
transitops/
├── client/                      # React Frontend (Vite SPA)
│   ├── src/
│   │   ├── app/                 # Application Entry and Router config (React Router v7)
│   │   ├── components/          # Reusable UI component library, layouts, and auth guards
│   │   │   ├── auth/            # ProtectedRoute and auth components
│   │   │   └── layout/          # AppLayout shell components (Sidebar, Header)
│   │   ├── pages/               # Page views (Dashboard, Vehicles, Drivers, Trips, Maintenance, Fuel/Expenses, Reports, Settings, Auth)
│   │   ├── hooks/               # Custom React hooks (useAuth, etc.)
│   │   ├── lib/                 # Utility libraries (access control helpers, etc.)
│   │   ├── services/            # API client layers using Axios
│   │   ├── styles/              # Global styling configuration
│   │   └── types/               # TypeScript type declarations
│   ├── vite.config.ts           # Vite build configuration
│   └── package.json             # Frontend dependencies
├── backend/                     # Node.js + Express Backend
│   ├── src/
│   │   ├── db/                  # Drizzle ORM database schema and connection config
│   │   ├── routes/              # Express API endpoints
│   │   ├── controllers/         # Request handling logic
│   │   ├── middleware/          # Auth, RBAC, validators, file uploads, rate limiters
│   │   ├── services/            # Business logic and computations
│   │   ├── repositories/        # Database query layers
│   │   ├── validators/          # Zod schema definitions
│   │   ├── mail/                # Email services and templates (Nodemailer)
│   │   ├── constants/           # Roles, permissions, status codes
│   │   └── utils/               # Handlers, calculators, and helpers
│   ├── drizzle.config.ts        # Drizzle ORM generation settings
│   ├── Dockerfile               # Production container config
│   ├── docker-compose.yml       # Docker local compose services
│   └── package.json             # Backend dependencies and scripts
└── README.md                    # Root documentation
```

---

## 💻 Frontend Architecture

The client side is structured as a single-page application built on React 19 and Vite:
- **Routing**: Handled by **React Router v7** using the new router setup configured in [router.tsx](file:///c:/Users/shrey/Everything/TransitOps_/client/src/app/router.tsx).
- **Application Shell**: An [AppLayout](file:///c:/Users/shrey/Everything/TransitOps_/client/src/components/layout/AppLayout.tsx) wraps all internal modules. It features responsive sidebar navigation, a page header, and breadcrumb trails that automatically parse route metadata.
- **Access Control**: A [ProtectedRoute](file:///c:/Users/shrey/Everything/TransitOps_/client/src/components/auth/ProtectedRoute.tsx) intercepts page routing to check authentication status and enforce role-based access. Only authorized roles (e.g. `FLEET_MANAGER`, `DISPATCHER`, `SAFETY_OFFICER`, `FINANCIAL_ANALYST`) can access specific pages.
- **Design System**: Constructed using Tailwind CSS v4 and Framer Motion for rich animations. Layout components are modularized under `client/src/components/ui` (such as Card, Button, Input, Select, Modal, Badge).

---

## ⚙️ Backend Architecture

The backend implements a modular structure built on Express 5 and TypeScript:
- **Modular Routes**: Requests are directed from the main router in [routes/index.ts](file:///c:/Users/shrey/Everything/TransitOps_/backend/src/routes/index.ts) to specialized controllers for `auth`, `audit-logs`, `organizations`, `users`, `vehicles`, `drivers`, `trips`, `maintenance`, `fuel-logs`, `expenses`, `dashboards`, and `reports`.
- **Database Layer**: PostgreSQL managed through **Drizzle ORM**. Schemas are configured with relations and type safety in [db/schema.ts](file:///c:/Users/shrey/Everything/TransitOps_/backend/src/db/schema.ts).
- **Validation**: Incoming request bodies, query params, and route parameters are validated using custom middlewares executing **Zod schemas**.
- **Media Upload**: Utilizes **Multer** for handling local driver document and profile picture uploads, saving files into the local upload directory.
- **Security & Rate Limiting**: Employs Helmet, CORS, and Express Rate Limit to guard endpoints.
- **Reporting & Mail**: A custom Nodemailer transporter triggers transaction emails (such as invitations and password resets), while PDFKit renders printable PDF reports dynamically.

---

## 🔑 Authentication

TransitOps implements a security framework for managing credentials and sessions:
1. **User Credentials**: Passwords are securely hashed using `bcrypt` and stored in the PostgreSQL database.
2. **Access & Refresh Tokens**: On successful authentication, the backend issues an access token (stored in memory) and a cryptographically strong refresh token stored in the database.
3. **Route Guards**: Express endpoints require authorization validation via the `authenticate` middleware, which parses incoming `Bearer` JWT tokens and verifies organization-level access.
4. **Password Recovery**: Users can request password reset links via email. The system generates a secure one-time password reset token, sends a Nodemailer email, validates the token on the front-end page, and updates the user's password hash.

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+ or v20+
- PostgreSQL database instance
- npm or yarn

### Installation & Setup

1. **Clone and Install Dependencies**
   ```bash
   git clone https://github.com/hackodoo2k26/TransitOps_.git
   cd TransitOps_

   # Install Backend dependencies
   cd backend
   npm install

   # Install Frontend dependencies
   cd ../client
   npm install
   ```

2. **Database Migrations & Seeding**
   Configure your backend environment variables (see below), then run:
   ```bash
   cd ../backend
   npm run db:generate  # Generates database migrations
   npm run db:push      # Pushes schemas to the database directly (for dev)
   npm run db:migrate   # Applies database migrations
   npm run db:seed      # Seeds the database with default roles, permissions, and test data
   ```

3. **Running the Application**
   ```bash
   # In the /backend directory
   npm run dev          # Starts the Express backend on http://localhost:3001

   # In the /client directory (in a separate terminal)
   npm run dev          # Starts the Vite frontend on http://localhost:5173
   ```

---

## 🔑 Environment Variables

### Backend Configuration (`backend/.env`)
Create a `.env` file in the `backend/` directory using `.env.example` as a template:
```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgres://postgres:postgres@localhost:5432/transitops
DB_POOL_MAX=10
JWT_SECRET=supersecretjwtvalue123
JWT_REFRESH_SECRET=supersecretrefreshvalue123
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN_DAYS=7
FRONTEND_URL=http://localhost:5173
APP_BASE_URL=http://localhost:3001
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=
SMTP_PASS=
MAIL_FROM=noreply@transitops.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=300
UPLOAD_DIR=uploads
```

### Frontend Configuration (`client/.env`)
Create a `.env` file in the `client/` directory:
```env
VITE_API_URL=http://localhost:3001/api
```

---

## 📜 Available Scripts

### Backend (`/backend`)
- `npm run dev`: Runs the development server using `tsx` (watches `src/index.ts`).
- `npm run build`: Compiles TypeScript files to the `dist/` folder using `tsc`.
- `npm run start`: Runs the compiled production code (`dist/index.js`).
- `npm run db:generate`: Generates migration files based on schema changes.
- `npm run db:push`: Automatically pushes schema changes directly to the database.
- `npm run db:migrate`: Executes pending Drizzle schema migrations.
- `npm run db:seed`: Seeds mock and default data into the database.

### Frontend (`/client`)
- `npm run dev`: Launches the Vite development server.
- `npm run build`: Compiles TypeScript and builds the production-ready static bundle.
- `npm run lint`: Runs ESLint check across all files.
- `npm run preview`: Previews the compiled production bundle locally.

## 🔌 API Reference

| Method | Endpoint | Description | Access Control |
| --- | --- | --- | --- |
| **POST** | `/api/auth/login` | Authenticate user credentials & issue JWTs | Public |
| **POST** | `/api/auth/forgot-password` | Request password reset token via email | Public |
| **POST** | `/api/auth/reset-password` | Reset password using verified token | Public |
| **GET** | `/api/dashboards/organization` | Fetch organization KPIs for dashboard | Authenticated Users |
| **GET** | `/api/dashboards/global` | Fetch global KPIs for super admin view | Super Admins only |
| **GET / POST** | `/api/vehicles` | List vehicles / Register a new vehicle | Fleet Manager |
| **PATCH** | `/api/vehicles/:id` | Update vehicle details | Fleet Manager |
| **DELETE** | `/api/vehicles/:id` | Remove a vehicle from the system | Fleet Manager |
| **GET / POST** | `/api/drivers` | List drivers / Register a new driver profile | Dispatcher, Safety Officer |
| **PATCH** | `/api/drivers/:id` | Update driver details | Dispatcher |
| **POST** | `/api/drivers/:id/status` | Update driver status (`suspended`, etc.) | Dispatcher, Safety Officer |
| **POST** | `/api/drivers/:id/safety` | Adjust safety score (0-100) | Safety Officer |
| **POST** | `/api/drivers/:id/documents` | Upload a compliance document (Multer) | Dispatcher |
| **POST** | `/api/drivers/:id/photo` | Upload driver profile picture (Multer) | Dispatcher |
| **DELETE** | `/api/drivers/:id` | Soft-delete a driver profile | Dispatcher |
| **GET / POST** | `/api/trips` | List trips / Create a new trip | Dispatcher, Fleet Manager |
| **POST** | `/api/trips/:id/dispatch` | Dispatched status transition for trip | Dispatcher, Fleet Manager |
| **POST** | `/api/trips/:id/complete` | Complete trip (records odometer/fuel) | Dispatcher, Fleet Manager |
| **POST** | `/api/trips/:id/cancel` | Cancel trip and revert vehicle/driver status | Dispatcher, Fleet Manager |
| **GET / POST** | `/api/maintenance` | List maintenance logs / Log maintenance | Fleet Manager |
| **POST** | `/api/maintenance/:id/close` | Complete and close maintenance log | Fleet Manager |
| **GET / POST** | `/api/fuel-logs` | List fuel logs / Log fuel receipt | Fleet Manager, Driver |
| **GET / POST** | `/api/expenses` | List expenses / Log operational expense | Fleet Manager |
| **GET** | `/api/reports/fuel-efficiency` | Retrieve fuel efficiency reports | Financial Analyst |
| **GET** | `/api/reports/fleet-utilization` | Retrieve fleet utilization ratios | Financial Analyst |
| **GET** | `/api/reports/vehicle-roi` | Retrieve vehicle ROI reports | Financial Analyst |
| **GET** | `/api/reports/operational-cost` | Retrieve operational cost summary reports | Financial Analyst |
| **GET** | `/api/reports/monthly-expenses` | Retrieve monthly expense calculations | Financial Analyst |
| **GET** | `/api/reports/monthly-expenses/export` | Export monthly expense report (CSV/PDF) | Financial Analyst |

---

## 📊 Demo Walkthrough

1. Register vehicle **Van-05** — max capacity 500 kg, status `Available`
2. Register driver **Alex** with a valid license
3. Create a trip with cargo weight **450 kg**
4. System validates 450 kg ≤ 500 kg → dispatch allowed
5. Vehicle and Driver auto-flip to `On Trip`
6. Complete the trip — enter final odometer and fuel consumed
7. Vehicle and Driver auto-revert to `Available`
8. Create a maintenance record (e.g., Oil Change) — vehicle auto-flips to `In Shop`, disappears from dispatch pool
9. Reports update operational cost and fuel efficiency using the new trip and fuel data

---

## 📝 Assumptions & Design Decisions

The original problem statement leaves a few details open to interpretation. Here's how we resolved each one, and why:

| Gap in the spec | Our resolution |
| --- | --- |
| **Vehicle ROI formula requires "Revenue," which is never defined as a field anywhere** | Added a `revenue` field captured at trip creation/completion (rate × distance or a flat fee), rolled up per vehicle for the ROI report |
| **Dashboard supports a "region" filter, but Vehicle has no region field** | Added a `region` / base-location field to the Vehicle model |
| **Maintenance Log has no defined fields** | Modeled it with description, cost, date, and status (`Open`/`Closed`) — cost feeds directly into Operational Cost, status drives the vehicle auto-transition rule |
| **Trip completion requires "final odometer and fuel consumed," but these fields aren't listed under Trip Management** | Added `startOdometer` (snapshotted at dispatch), `endOdometer`, and `fuelConsumed` to Trip; Fuel Efficiency is computed from actual odometer delta, not planned distance, to prevent gamed numbers |
| **Business rules block expired-license/Suspended drivers but don't mention Off Duty** | Off Duty drivers are excluded from the dispatch pool as well — filtered at selection _and_ re-validated at submission |
| **No rule defines how a vehicle becomes Retired** | Treated as a manual Fleet Manager action, available from any non-`On Trip` status |
| **No rule for cancelling a trip still in Draft** | No side effects on cancel from Draft, since nothing was locked yet — only Dispatched → Cancelled restores vehicle/driver |
| **PDF export listed as both a feature and a bonus item in different sections** | Treated as optional per the explicit rule in the requirements (CSV is mandatory); PDF export listed under Bonus Features |
| **Safety Score has no defined calculation** | Manually editable by the Safety Officer for this build — not derived from an undocumented formula |

## 🎁 Bonus Features & Development Status

- [x] PDF export for reports
- [x] Multi-tenant organization support and isolation
- [x] Database change tracking via system audit logs
- [x] Compliance document management (Driving license, PAN, Aadhaar uploads)
- [x] Custom rate limiters and express helmet integration
- [x] Safety Score adjusting portal
- [ ] Email reminders for expiring driver licenses
- [ ] Real-time GPS coordinate simulation for active dispatches

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) — built for Odoo Hackathon 2026.

---

<p align="center">Built with ⚡ under an 8-hour clock, because fleets don't run on spreadsheets anymore.</p>

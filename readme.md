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
- [x] Role-Based Access Control (RBAC) across all four roles
- [x] Route-level and action-level permission enforcement

### 📊 Operational Dashboard

- [x] Live KPIs — Active Vehicles, Available Vehicles, Vehicles in Maintenance, Active Trips, Pending Trips, Drivers On Duty, Fleet Utilization (%)
- [x] Filters by vehicle type, status, and region

### 🚐 Vehicle Registry

- [x] Master vehicle list — unique Registration Number, Model, Type, Max Load Capacity, Odometer, Acquisition Cost, Status
- [x] Status lifecycle: `Available → On Trip → In Shop → Retired`

### 👤 Driver Management

- [x] Driver profiles — License Number, Category, Expiry Date, Contact, Safety Score, Status
- [x] Status lifecycle: `Available / On Trip / Off Duty / Suspended`

### 🗺️ Trip Management

- [x] Trip creation with source, destination, vehicle, driver, cargo weight, planned distance
- [x] Full lifecycle: `Draft → Dispatched → Completed / Cancelled`
- [x] Hard validation against cargo capacity, driver/vehicle eligibility, and double-booking

### 🔧 Maintenance Workflow

- [x] Maintenance logging per vehicle
- [x] Auto status transition to `In Shop` on active maintenance record — instantly removed from the dispatch pool

### ⛽ Fuel & Expense Tracking

- [x] Fuel logs (liters, cost, date) and general expenses (tolls, misc.)
- [x] Auto-computed total operational cost per vehicle (Fuel + Maintenance)

### 📈 Reports & Analytics

- [x] Fuel Efficiency (Distance / Fuel)
- [x] Fleet Utilization
- [x] Operational Cost breakdown
- [x] Vehicle ROI
- [x] CSV export

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
| Frontend | React, React Router, Axios, Recharts (analytics), TailwindCSS |
| Backend | Node.js, Express.js |
| Database | PostgreSQL |
| ORM | Prisma (or Sequelize/TypeORM) |
| Auth | JWT-based sessions, bcrypt password hashing |
| Validation | Server-side rule engine (custom middleware) |
| Export | CSV generation (`json2csv`) |
| Deployment | Docker-ready / can be hosted on Render, Railway, or Vercel + Neon/Supabase |

## 📁 Project Structure

```
transitops/
├── client/                      # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   │   ├── Dashboard/
│   │   │   ├── Vehicles/
│   │   │   ├── Drivers/
│   │   │   ├── Trips/
│   │   │   ├── Maintenance/
│   │   │   ├── FuelExpenses/
│   │   │   └── Reports/
│   │   ├── context/              # Auth & RBAC context
│   │   └── services/             # API calls
│   └── package.json
├── server/                      # Node.js + Express backend
│   ├── prisma/                  # Prisma schema and migrations
│   ├── routes/
│   ├── controllers/
│   ├── middleware/               # auth, rbac, validators
│   ├── utils/                    # cost/efficiency calculators
│   └── server.js
├── .env.example
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- PostgreSQL (local instance or managed service like Neon/Supabase)
- npm or yarn

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/hackodoo2k26/TransitOps_.git
cd TransitOps_

```

### Running the app

```bash
# Start the backend (from /server)
npm run dev        # runs on http://localhost:5000

# Start the frontend (from /client, in a separate terminal)
npm start           # runs on http://localhost:3000
```

## 🔑 Environment Variables

Create a `.env` file inside `/server` based on `.env.example`:

```env
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/transitops
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d
```

---

## 🔌 API Reference

| Method     | Endpoint                         | Description              | Access                        |
| ---------- | -------------------------------- | ------------------------ | ----------------------------- |
| POST       | `/api/auth/login`                | Authenticate user        | Public                        |
| GET        | `/api/dashboard/kpis`            | Fetch dashboard KPIs     | All roles                     |
| GET / POST | `/api/vehicles`                  | List / register vehicles | Fleet Manager                 |
| PATCH      | `/api/vehicles/:id/status`       | Update vehicle status    | Fleet Manager                 |
| GET / POST | `/api/drivers`                   | List / register drivers  | Fleet Manager, Safety Officer |
| PATCH      | `/api/drivers/:id/status`        | Update driver status     | Safety Officer                |
| GET / POST | `/api/trips`                     | List / create trips      | Driver, Fleet Manager         |
| PATCH      | `/api/trips/:id/dispatch`        | Dispatch a trip          | Driver, Fleet Manager         |
| PATCH      | `/api/trips/:id/complete`        | Complete a trip          | Driver, Fleet Manager         |
| PATCH      | `/api/trips/:id/cancel`          | Cancel a trip            | Driver, Fleet Manager         |
| GET / POST | `/api/maintenance`               | List / log maintenance   | Fleet Manager                 |
| PATCH      | `/api/maintenance/:id/close`     | Close maintenance record | Fleet Manager                 |
| GET / POST | `/api/fuel-logs`                 | List / log fuel entries  | Fleet Manager, Driver         |
| GET / POST | `/api/expenses`                  | List / log expenses      | Fleet Manager                 |
| GET        | `/api/reports/fuel-efficiency`   | Distance/Fuel by vehicle | Financial Analyst             |
| GET        | `/api/reports/utilization`       | Fleet utilization %      | Financial Analyst             |
| GET        | `/api/reports/roi`               | Vehicle ROI              | Financial Analyst             |
| GET        | `/api/reports/export?format=csv` | Export any report as CSV | Financial Analyst             |

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

| Gap in the spec                                                                                                       | Our resolution                                                                                                                                                                                     |
| --------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Vehicle ROI formula requires "Revenue," which is never defined as a field anywhere**                                | Added a `revenue` field captured at trip creation/completion (rate × distance or a flat fee), rolled up per vehicle for the ROI report                                                             |
| **Dashboard supports a "region" filter, but Vehicle has no region field**                                             | Added a `region` / base-location field to the Vehicle model                                                                                                                                        |
| **Maintenance Log has no defined fields**                                                                             | Modeled it with description, cost, date, and status (`Open`/`Closed`) — cost feeds directly into Operational Cost, status drives the vehicle auto-transition rule                                  |
| **Trip completion requires "final odometer and fuel consumed," but these fields aren't listed under Trip Management** | Added `startOdometer` (snapshotted at dispatch), `endOdometer`, and `fuelConsumed` to Trip; Fuel Efficiency is computed from actual odometer delta, not planned distance, to prevent gamed numbers |
| **Business rules block expired-license/Suspended drivers but don't mention Off Duty**                                 | Off Duty drivers are excluded from the dispatch pool as well — filtered at selection _and_ re-validated at submission                                                                              |
| **No rule defines how a vehicle becomes Retired**                                                                     | Treated as a manual Fleet Manager action, available from any non-`On Trip` status                                                                                                                  |
| **No rule for cancelling a trip still in Draft**                                                                      | No side effects on cancel from Draft, since nothing was locked yet — only Dispatched → Cancelled restores vehicle/driver                                                                           |
| **PDF export listed as both a feature and a bonus item in different sections**                                        | Treated as optional per the explicit rule in the requirements (CSV is mandatory); PDF export listed under Bonus Features                                                                           |
| **Safety Score has no defined calculation**                                                                           | Manually editable by the Safety Officer for this build — not derived from an undocumented formula                                                                                                  |

## 🎁 Bonus Features

- [ ] Charts and visual analytics (fleet utilization trends, cost breakdown)
- [ ] PDF export for reports
- [ ] Email reminders for expiring driver licenses
- [ ] Vehicle document management (insurance, registration uploads)
- [ ] Search, filters, and sorting across all list views
- [ ] Dark mode

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) — built for [Hackathon Name] 2026.

---

<p align="center">Built with ⚡ under an 8-hour clock, because fleets don't run on spreadsheets anymore.</p>

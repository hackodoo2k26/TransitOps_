import {
  boolean,
  date,
  decimal,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const organizationStatusEnum = pgEnum("organization_status", ["active", "suspended", "inactive"]);
export const userStatusEnum = pgEnum("user_status", ["invited", "active", "deactivated"]);
export const driverStatusEnum = pgEnum("driver_status", ["available", "on_trip", "off_duty", "suspended", "inactive"]);
export const vehicleStatusEnum = pgEnum("vehicle_status", ["available", "on_trip", "in_shop", "retired"]);
export const tripStatusEnum = pgEnum("trip_status", ["draft", "dispatched", "completed", "cancelled"]);
export const maintenanceStatusEnum = pgEnum("maintenance_status", ["open", "closed"]);
export const expenseTypeEnum = pgEnum("expense_type", ["fuel", "maintenance", "toll", "misc"]);
export const notificationChannelEnum = pgEnum("notification_channel", ["system", "email"]);
export const documentTypeEnum = pgEnum("document_type", [
  "driving_license",
  "aadhaar",
  "pan",
  "medical_certificate",
  "police_verification",
  "experience_certificate",
  "other",
]);

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
};

export const organizations = pgTable(
  "organizations",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    status: organizationStatusEnum("status").notNull().default("active"),
    contactEmail: text("contact_email"),
    contactPhone: text("contact_phone"),
    address: text("address"),
    isDeleted: boolean("is_deleted").notNull().default(false),
    suspendedAt: timestamp("suspended_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => ({
    slugUnique: uniqueIndex("organizations_slug_unique").on(table.slug),
    nameUnique: uniqueIndex("organizations_name_unique").on(table.name),
  }),
);

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    organizationId: integer("organization_id").references(() => organizations.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    email: text("email").notNull(),
    passwordHash: text("password_hash"),
    status: userStatusEnum("status").notNull().default("invited"),
    isSuperAdmin: boolean("is_super_admin").notNull().default(false),
    emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true }),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    createdBy: integer("created_by"),
    ...timestamps,
  },
  (table) => ({
    emailUnique: uniqueIndex("users_email_unique").on(table.email),
    organizationIndex: index("users_organization_idx").on(table.organizationId),
  }),
);

export const roles = pgTable(
  "roles",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    code: text("code").notNull(),
    description: text("description"),
    isSystem: boolean("is_system").notNull().default(true),
    ...timestamps,
  },
  (table) => ({
    roleCodeUnique: uniqueIndex("roles_code_unique").on(table.code),
    roleNameUnique: uniqueIndex("roles_name_unique").on(table.name),
  }),
);

export const permissions = pgTable(
  "permissions",
  {
    id: serial("id").primaryKey(),
    code: text("code").notNull(),
    resource: text("resource").notNull(),
    action: text("action").notNull(),
    description: text("description"),
    ...timestamps,
  },
  (table) => ({
    permissionCodeUnique: uniqueIndex("permissions_code_unique").on(table.code),
  }),
);

export const rolePermissions = pgTable(
  "role_permissions",
  {
    id: serial("id").primaryKey(),
    roleId: integer("role_id").notNull().references(() => roles.id, { onDelete: "cascade" }),
    permissionId: integer("permission_id").notNull().references(() => permissions.id, { onDelete: "cascade" }),
    ...timestamps,
  },
  (table) => ({
    uniqueRolePermission: uniqueIndex("role_permissions_unique").on(table.roleId, table.permissionId),
  }),
);

export const userRoles = pgTable(
  "user_roles",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    roleId: integer("role_id").notNull().references(() => roles.id, { onDelete: "cascade" }),
    ...timestamps,
  },
  (table) => ({
    uniqueUserRole: uniqueIndex("user_roles_unique").on(table.userId, table.roleId),
  }),
);

export const invitations = pgTable(
  "invitations",
  {
    id: serial("id").primaryKey(),
    organizationId: integer("organization_id").references(() => organizations.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    name: text("name").notNull(),
    tokenHash: text("token_hash").notNull(),
    roleCodes: jsonb("role_codes").$type<string[]>().notNull().default([]),
    invitedBy: integer("invited_by").references(() => users.id, { onDelete: "set null" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    acceptedAt: timestamp("accepted_at", { withTimezone: true }),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => ({
    emailIndex: index("invitations_email_idx").on(table.email),
  }),
);

export const refreshTokens = pgTable(
  "refresh_tokens",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    organizationId: integer("organization_id").references(() => organizations.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull(),
    userAgent: text("user_agent"),
    ipAddress: text("ip_address"),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => ({
    tokenHashUnique: uniqueIndex("refresh_tokens_hash_unique").on(table.tokenHash),
    userIndex: index("refresh_tokens_user_idx").on(table.userId),
  }),
);

export const passwordResetTokens = pgTable(
  "password_reset_tokens",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    organizationId: integer("organization_id").references(() => organizations.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => ({
    tokenHashUnique: uniqueIndex("password_reset_hash_unique").on(table.tokenHash),
  }),
);

export const emailVerificationTokens = pgTable(
  "email_verification_tokens",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    organizationId: integer("organization_id").references(() => organizations.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => ({
    tokenHashUnique: uniqueIndex("email_verification_hash_unique").on(table.tokenHash),
  }),
);

export const vehicles = pgTable(
  "vehicles",
  {
    id: serial("id").primaryKey(),
    organizationId: integer("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
    registrationNumber: text("registration_number").notNull(),
    model: text("model").notNull(),
    vehicleType: text("vehicle_type").notNull(),
    maxCapacity: decimal("max_capacity", { precision: 12, scale: 2 }).notNull(),
    currentOdometer: decimal("current_odometer", { precision: 12, scale: 2 }).notNull().default("0"),
    acquisitionCost: decimal("acquisition_cost", { precision: 14, scale: 2 }).notNull().default("0"),
    region: text("region"),
    status: vehicleStatusEnum("status").notNull().default("available"),
    createdBy: integer("created_by").references(() => users.id, { onDelete: "set null" }),
    ...timestamps,
  },
  (table) => ({
    registrationUnique: uniqueIndex("vehicles_registration_unique").on(table.registrationNumber),
    organizationIndex: index("vehicles_organization_idx").on(table.organizationId),
  }),
);

export const drivers = pgTable(
  "drivers",
  {
    id: serial("id").primaryKey(),
    organizationId: integer("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    employeeId: text("employee_id").notNull(),
    phone: text("phone").notNull(),
    email: text("email"),
    address: text("address"),
    emergencyContact: jsonb("emergency_contact").$type<{ name: string; phone: string } | null>().default(null),
    bloodGroup: text("blood_group"),
    licenseNumber: text("license_number").notNull(),
    licenseCategory: text("license_category").notNull(),
    licenseExpiry: date("license_expiry").notNull(),
    joiningDate: date("joining_date").notNull(),
    safetyScore: decimal("safety_score", { precision: 5, scale: 2 }).notNull().default("100"),
    profilePhotoUrl: text("profile_photo_url"),
    status: driverStatusEnum("status").notNull().default("available"),
    createdBy: integer("created_by").references(() => users.id, { onDelete: "set null" }),
    isDeleted: boolean("is_deleted").notNull().default(false),
    ...timestamps,
  },
  (table) => ({
    employeeUnique: uniqueIndex("drivers_employee_unique").on(table.organizationId, table.employeeId),
    licenseUnique: uniqueIndex("drivers_license_unique").on(table.organizationId, table.licenseNumber),
    organizationIndex: index("drivers_organization_idx").on(table.organizationId),
  }),
);

export const driverDocuments = pgTable(
  "driver_documents",
  {
    id: serial("id").primaryKey(),
    organizationId: integer("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
    driverId: integer("driver_id").notNull().references(() => drivers.id, { onDelete: "cascade" }),
    documentName: text("document_name").notNull(),
    documentType: documentTypeEnum("document_type").notNull(),
    expiryDate: date("expiry_date"),
    uploadedBy: integer("uploaded_by").references(() => users.id, { onDelete: "set null" }),
    fileUrl: text("file_url").notNull(),
    ...timestamps,
  },
  (table) => ({
    driverIndex: index("driver_documents_driver_idx").on(table.driverId),
  }),
);

export const trips = pgTable(
  "trips",
  {
    id: serial("id").primaryKey(),
    organizationId: integer("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
    source: text("source").notNull(),
    destination: text("destination").notNull(),
    vehicleId: integer("vehicle_id").references(() => vehicles.id, { onDelete: "set null" }),
    driverId: integer("driver_id").references(() => drivers.id, { onDelete: "set null" }),
    createdBy: integer("created_by").references(() => users.id, { onDelete: "set null" }),
    cargoWeight: decimal("cargo_weight", { precision: 12, scale: 2 }).default("0"),
    plannedDistance: decimal("planned_distance", { precision: 12, scale: 2 }).default("0"),
    actualDistance: decimal("actual_distance", { precision: 12, scale: 2 }).default("0"),
    revenue: decimal("revenue", { precision: 14, scale: 2 }).default("0"),
    fuelConsumed: decimal("fuel_consumed", { precision: 12, scale: 2 }).default("0"),
    startOdometer: decimal("start_odometer", { precision: 12, scale: 2 }),
    endOdometer: decimal("end_odometer", { precision: 12, scale: 2 }),
    status: tripStatusEnum("status").notNull().default("draft"),
    dispatchedAt: timestamp("dispatched_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
    notes: text("notes"),
    ...timestamps,
  },
  (table) => ({
    organizationIndex: index("trips_organization_idx").on(table.organizationId),
    statusIndex: index("trips_status_idx").on(table.status),
  }),
);

export const maintenanceLogs = pgTable(
  "maintenance_logs",
  {
    id: serial("id").primaryKey(),
    organizationId: integer("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
    vehicleId: integer("vehicle_id").notNull().references(() => vehicles.id, { onDelete: "cascade" }),
    description: text("description").notNull(),
    cost: decimal("cost", { precision: 12, scale: 2 }).notNull(),
    openedAt: date("opened_at").notNull(),
    closedAt: date("closed_at"),
    status: maintenanceStatusEnum("status").notNull().default("open"),
    createdBy: integer("created_by").references(() => users.id, { onDelete: "set null" }),
    ...timestamps,
  },
  (table) => ({
    vehicleIndex: index("maintenance_vehicle_idx").on(table.vehicleId),
  }),
);

export const fuelLogs = pgTable(
  "fuel_logs",
  {
    id: serial("id").primaryKey(),
    organizationId: integer("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
    vehicleId: integer("vehicle_id").notNull().references(() => vehicles.id, { onDelete: "cascade" }),
    tripId: integer("trip_id").references(() => trips.id, { onDelete: "set null" }),
    liters: decimal("liters", { precision: 12, scale: 2 }).notNull(),
    cost: decimal("cost", { precision: 12, scale: 2 }).notNull(),
    odometer: decimal("odometer", { precision: 12, scale: 2 }),
    date: date("date").notNull(),
    createdBy: integer("created_by").references(() => users.id, { onDelete: "set null" }),
    ...timestamps,
  },
  (table) => ({
    vehicleIndex: index("fuel_logs_vehicle_idx").on(table.vehicleId),
  }),
);

export const expenses = pgTable(
  "expenses",
  {
    id: serial("id").primaryKey(),
    organizationId: integer("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
    vehicleId: integer("vehicle_id").references(() => vehicles.id, { onDelete: "set null" }),
    tripId: integer("trip_id").references(() => trips.id, { onDelete: "set null" }),
    type: expenseTypeEnum("type").notNull(),
    amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
    date: date("date").notNull(),
    notes: text("notes"),
    createdBy: integer("created_by").references(() => users.id, { onDelete: "set null" }),
    ...timestamps,
  },
  (table) => ({
    organizationIndex: index("expenses_organization_idx").on(table.organizationId),
  }),
);

export const notifications = pgTable(
  "notifications",
  {
    id: serial("id").primaryKey(),
    organizationId: integer("organization_id").references(() => organizations.id, { onDelete: "cascade" }),
    userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
    channel: notificationChannelEnum("channel").notNull().default("system"),
    type: text("type").notNull(),
    title: text("title").notNull(),
    message: text("message").notNull(),
    data: jsonb("data").$type<Record<string, unknown> | null>().default(null),
    readAt: timestamp("read_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => ({
    userIndex: index("notifications_user_idx").on(table.userId),
  }),
);

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: serial("id").primaryKey(),
    organizationId: integer("organization_id").references(() => organizations.id, { onDelete: "cascade" }),
    userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
    action: text("action").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id").notNull(),
    oldData: jsonb("old_data").$type<Record<string, unknown> | null>().default(null),
    newData: jsonb("new_data").$type<Record<string, unknown> | null>().default(null),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    ...timestamps,
  },
  (table) => ({
    organizationIndex: index("audit_logs_organization_idx").on(table.organizationId),
    entityIndex: index("audit_logs_entity_idx").on(table.entityType, table.entityId),
  }),
);


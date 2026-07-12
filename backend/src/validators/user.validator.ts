import { z } from "zod";
import { ROLE_CODES } from "../constants/roles.js";

const roleCodeEnum = z.enum([
  ROLE_CODES.SUPER_ADMIN,
  ROLE_CODES.FLEET_MANAGER,
  ROLE_CODES.DISPATCHER,
  ROLE_CODES.SAFETY_OFFICER,
  ROLE_CODES.FINANCIAL_ANALYST,
]);

export const inviteUserSchema = z.object({
  name: z.string().min(2),
  email: z.email(),
  organizationId: z.coerce.number().int().positive().optional(),
  roleCodes: z.array(roleCodeEnum).min(1),
});

export const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.email(),
  password: z.string().min(8),
  organizationId: z.coerce.number().int().positive().optional(),
  roleCodes: z.array(roleCodeEnum).min(1),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  status: z.enum(["invited", "active", "deactivated"]).optional(),
  organizationId: z.coerce.number().int().positive().optional(),
});

export const assignRolesSchema = z.object({
  roleCodes: z.array(roleCodeEnum).min(1),
});

export const resetUserPasswordSchema = z.object({
  password: z.string().min(8),
});


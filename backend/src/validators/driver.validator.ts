import { z } from "zod";

export const createDriverSchema = z.object({
  name: z.string().min(2),
  employeeId: z.string().min(2),
  phone: z.string().min(5),
  email: z.email().optional(),
  address: z.string().trim().optional(),
  emergencyContact: z
    .object({
      name: z.string().min(2),
      phone: z.string().min(5),
    })
    .optional(),
  bloodGroup: z.string().trim().optional(),
  licenseNumber: z.string().min(3),
  licenseCategory: z.string().min(1),
  licenseExpiry: z.string().date(),
  joiningDate: z.string().date(),
  safetyScore: z.coerce.number().min(0).max(100).optional(),
  status: z.enum(["available", "on_trip", "off_duty", "suspended", "inactive"]).optional(),
});

export const updateDriverSchema = createDriverSchema.partial();

export const driverStatusSchema = z.object({
  status: z.enum(["available", "on_trip", "off_duty", "suspended", "inactive"]),
});

export const driverSafetySchema = z.object({
  safetyScore: z.coerce.number().min(0).max(100),
});

export const driverDocumentSchema = z.object({
  documentName: z.string().min(2),
  documentType: z.enum([
    "driving_license",
    "aadhaar",
    "pan",
    "medical_certificate",
    "police_verification",
    "experience_certificate",
    "other",
  ]),
  expiryDate: z.string().date().optional(),
});


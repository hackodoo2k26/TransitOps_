import { z } from "zod";

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(16),
});

export const forgotPasswordSchema = z.object({
  email: z.email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(16),
  password: z.string().min(8),
});

export const verifyEmailSchema = z.object({
  token: z.string().min(16),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(8),
  newPassword: z.string().min(8),
});

export const acceptInvitationSchema = z.object({
  token: z.string().min(16),
  password: z.string().min(8),
});


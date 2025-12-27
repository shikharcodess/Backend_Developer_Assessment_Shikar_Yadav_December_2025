import { z } from "zod";

export const uuidSchema = z.uuid();
export const emailSchema = z.email();

export const createUserSchema = z.object({
  email: emailSchema,
  name: z.string().min(2).max(100),
  password: z.string().min(8),
});

export const userLoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(8),
});

export const userLogoutSchema = z.object({
  refresh_token: z.string().min(2),
});

export const userRefreshTokenSchema = z.object({
  refresh_token: z.string().min(2),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  isActive: z.boolean().optional(),
});

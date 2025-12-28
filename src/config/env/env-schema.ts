import { z } from "zod";

const bool = z.string().transform((v) => v === "true" || v === "1");

const number = z
  .string()
  .transform((v) => Number(v))
  .refine((v) => !Number.isNaN(v), "Must be a number");

export const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  PORT: number.default(3000),

  ENCRYPTION_KEY: z.string().min(1),
  DATABASE_URL: z.url(),

  // CORS
  CORS_ENABLED: bool.default(false),
  CORS_ALLOWED_HEADERS: z.string().optional(),
  CORS_ALLOWED_METHODS: z.string().optional(),
  CORS_ALLOWED_ORIGIN: z.string().optional(),
  CORS_ALLOW_CREDENTIALS: bool.optional(),

  // Rate limiter
  RATE_LIMITER_DURARION: number.optional(),
  RATE_LIMITER_ALLOWED_REQUESTS: number.optional(),

  // JWT
  JWT_SECRET_KEY: z.string().min(10),
  JWT_ACCESS_EXPIRES_IN: z.string(),
  JWT_REFRESH_EXPIRES_IN: z.string(),

  // Redis
  REDIS_USER: z.string().min(2),
  REDIS_PASSWORD: z.string().min(2),
  REDIS_HOST: z.string().min(2),
  REDIS_PORT: number,

  // RabbitMQ
  RABBITMQ_URL: z.url(),

  // Feature flags
  FEATURE_FLAG_PROJECT_INVITES: bool.optional(),
});

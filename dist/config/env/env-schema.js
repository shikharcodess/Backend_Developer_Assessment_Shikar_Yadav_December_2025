"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.envSchema = void 0;
const zod_1 = require("zod");
const bool = zod_1.z.string().transform((v) => v === "true" || v === "1");
const number = zod_1.z
    .string()
    .transform((v) => Number(v))
    .refine((v) => !Number.isNaN(v), "Must be a number");
exports.envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z
        .enum(["development", "test", "production"])
        .default("development"),
    PORT: number.default(3000),
    ENCRYPTION_KEY: zod_1.z.string().min(1),
    DATABASE_URL: zod_1.z.url(),
    // CORS
    CORS_ENABLED: bool.default(false),
    CORS_ALLOWED_HEADERS: zod_1.z.string().optional(),
    CORS_ALLOWED_METHODS: zod_1.z.string().optional(),
    CORS_ALLOWED_ORIGIN: zod_1.z.string().optional(),
    CORS_ALLOW_CREDENTIALS: bool.optional(),
    // Rate limiter
    RATE_LIMITER_DURARION: number.optional(),
    RATE_LIMITER_ALLOWED_REQUESTS: number.optional(),
    // JWT
    JWT_SECRET_KEY: zod_1.z.string().min(10),
    JWT_ACCESS_EXPIRES_IN: zod_1.z.string(),
    JWT_REFRESH_EXPIRES_IN: zod_1.z.string(),
    // Redis
    REDIS_USER: zod_1.z.string().min(2),
    REDIS_PASSWORD: zod_1.z.string().min(2),
    REDIS_HOST: zod_1.z.string().min(2),
    REDIS_PORT: number,
    // RabbitMQ
    RABBITMQ_URL: zod_1.z.url(),
    // Feature flags
    FEATURE_FLAG_PROJECT_INVITES: bool.optional(),
});
//# sourceMappingURL=env-schema.js.map
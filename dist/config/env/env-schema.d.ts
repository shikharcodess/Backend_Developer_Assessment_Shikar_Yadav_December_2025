import { z } from "zod";
export declare const envSchema: z.ZodObject<{
    NODE_ENV: z.ZodDefault<z.ZodEnum<{
        development: "development";
        test: "test";
        production: "production";
    }>>;
    PORT: z.ZodDefault<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>>;
    ENCRYPTION_KEY: z.ZodString;
    DATABASE_URL: z.ZodURL;
    CORS_ENABLED: z.ZodDefault<z.ZodPipe<z.ZodString, z.ZodTransform<boolean, string>>>;
    CORS_ALLOWED_HEADERS: z.ZodOptional<z.ZodString>;
    CORS_ALLOWED_METHODS: z.ZodOptional<z.ZodString>;
    CORS_ALLOWED_ORIGIN: z.ZodOptional<z.ZodString>;
    CORS_ALLOW_CREDENTIALS: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<boolean, string>>>;
    RATE_LIMITER_DURARION: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>>;
    RATE_LIMITER_ALLOWED_REQUESTS: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>>;
    JWT_SECRET_KEY: z.ZodString;
    JWT_ACCESS_EXPIRES_IN: z.ZodString;
    JWT_REFRESH_EXPIRES_IN: z.ZodString;
    REDIS_USER: z.ZodString;
    REDIS_PASSWORD: z.ZodString;
    REDIS_HOST: z.ZodString;
    REDIS_PORT: z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>;
    RABBITMQ_URL: z.ZodURL;
    FEATURE_FLAG_PROJECT_INVITES: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<boolean, string>>>;
}, z.core.$strip>;

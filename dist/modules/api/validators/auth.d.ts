import { z } from "zod";
export declare const uuidSchema: z.ZodUUID;
export declare const emailSchema: z.ZodEmail;
export declare const createUserSchema: z.ZodObject<{
    email: z.ZodEmail;
    name: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export declare const userLoginSchema: z.ZodObject<{
    email: z.ZodEmail;
    password: z.ZodString;
}, z.core.$strip>;
export declare const userLogoutSchema: z.ZodObject<{
    refresh_token: z.ZodString;
}, z.core.$strip>;
export declare const userRefreshTokenSchema: z.ZodObject<{
    refresh_token: z.ZodString;
}, z.core.$strip>;
export declare const updateUserSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    isActive: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;

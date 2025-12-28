"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserSchema = exports.userRefreshTokenSchema = exports.userLogoutSchema = exports.userLoginSchema = exports.createUserSchema = exports.emailSchema = exports.uuidSchema = void 0;
const zod_1 = require("zod");
exports.uuidSchema = zod_1.z.uuid();
exports.emailSchema = zod_1.z.email();
exports.createUserSchema = zod_1.z.object({
    email: exports.emailSchema,
    name: zod_1.z.string().min(2).max(100),
    password: zod_1.z.string().min(8),
});
exports.userLoginSchema = zod_1.z.object({
    email: exports.emailSchema,
    password: zod_1.z.string().min(8),
});
exports.userLogoutSchema = zod_1.z.object({
    refresh_token: zod_1.z.string().min(2),
});
exports.userRefreshTokenSchema = zod_1.z.object({
    refresh_token: zod_1.z.string().min(2),
});
exports.updateUserSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(100).optional(),
    isActive: zod_1.z.boolean().optional(),
});
//# sourceMappingURL=auth.js.map
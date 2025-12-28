"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workspaceIdParamSchema = exports.updateWorkspaceSchema = exports.createWorkspaceSchema = exports.respondToInviteParamsSchema = exports.createProjectInviteParamsValidator = exports.createProjectInviteRequestBodyValidator = exports.updateProjectMemberRoleSchema = exports.addProjectMemberSchema = exports.projectIdParamSchema = exports.updateProjectSchema = exports.createProjectSchema = exports.emailSchema = exports.uuidSchema = void 0;
const zod_1 = require("zod");
exports.uuidSchema = zod_1.z.uuid();
exports.emailSchema = zod_1.z.email();
exports.createProjectSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(100),
    description: zod_1.z.string().max(500).optional(),
});
exports.updateProjectSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(100).optional(),
    description: zod_1.z.string().max(500).nullable().optional(),
});
exports.projectIdParamSchema = zod_1.z.object({
    projectId: exports.uuidSchema,
});
exports.addProjectMemberSchema = zod_1.z.object({
    userId: exports.uuidSchema,
    role: zod_1.z.enum(["OWNER", "COLLABORATOR", "VIEWER"]),
});
exports.updateProjectMemberRoleSchema = zod_1.z.object({
    role: zod_1.z.enum(["OWNER", "COLLABORATOR", "VIEWER"]),
});
exports.createProjectInviteRequestBodyValidator = zod_1.z.object({
    email: exports.emailSchema,
    role: zod_1.z.enum(["OWNER", "COLLABORATOR", "VIEWER"]),
});
exports.createProjectInviteParamsValidator = zod_1.z.object({
    projectId: zod_1.z.string().min(2),
});
exports.respondToInviteParamsSchema = zod_1.z.object({
    inviteId: exports.uuidSchema,
});
exports.createWorkspaceSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(100),
});
exports.updateWorkspaceSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(100),
});
exports.workspaceIdParamSchema = zod_1.z.object({
    projectId: exports.uuidSchema,
    workspaceId: exports.uuidSchema.optional(),
});
//# sourceMappingURL=projects.js.map
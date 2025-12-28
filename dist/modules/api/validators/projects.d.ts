import { z } from "zod";
export declare const uuidSchema: z.ZodUUID;
export declare const emailSchema: z.ZodEmail;
export declare const createProjectSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const updateProjectSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
export declare const projectIdParamSchema: z.ZodObject<{
    projectId: z.ZodUUID;
}, z.core.$strip>;
export declare const addProjectMemberSchema: z.ZodObject<{
    userId: z.ZodUUID;
    role: z.ZodEnum<{
        OWNER: "OWNER";
        COLLABORATOR: "COLLABORATOR";
        VIEWER: "VIEWER";
    }>;
}, z.core.$strip>;
export declare const updateProjectMemberRoleSchema: z.ZodObject<{
    role: z.ZodEnum<{
        OWNER: "OWNER";
        COLLABORATOR: "COLLABORATOR";
        VIEWER: "VIEWER";
    }>;
}, z.core.$strip>;
export declare const createProjectInviteRequestBodyValidator: z.ZodObject<{
    email: z.ZodEmail;
    role: z.ZodEnum<{
        OWNER: "OWNER";
        COLLABORATOR: "COLLABORATOR";
        VIEWER: "VIEWER";
    }>;
}, z.core.$strip>;
export declare const createProjectInviteParamsValidator: z.ZodObject<{
    projectId: z.ZodString;
}, z.core.$strip>;
export declare const respondToInviteParamsSchema: z.ZodObject<{
    inviteId: z.ZodUUID;
}, z.core.$strip>;
export declare const createWorkspaceSchema: z.ZodObject<{
    name: z.ZodString;
}, z.core.$strip>;
export declare const updateWorkspaceSchema: z.ZodObject<{
    name: z.ZodString;
}, z.core.$strip>;
export declare const workspaceIdParamSchema: z.ZodObject<{
    projectId: z.ZodUUID;
    workspaceId: z.ZodOptional<z.ZodUUID>;
}, z.core.$strip>;

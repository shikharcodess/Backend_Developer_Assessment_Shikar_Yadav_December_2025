import { z } from "zod";

export const uuidSchema = z.uuid();
export const emailSchema = z.email();

export const createProjectSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(500).nullable().optional(),
});

export const projectIdParamSchema = z.object({
  projectId: uuidSchema,
});

export const addProjectMemberSchema = z.object({
  userId: uuidSchema,
  role: z.enum(["OWNER", "COLLABORATOR", "VIEWER"]),
});

export const updateProjectMemberRoleSchema = z.object({
  role: z.enum(["OWNER", "COLLABORATOR", "VIEWER"]),
});

export const createProjectInviteRequestBodyValidator = z.object({
  email: emailSchema,
  role: z.enum(["OWNER", "COLLABORATOR", "VIEWER"]),
});

export const createProjectInviteParamsValidator = z.object({
  projectId: z.string().min(2),
});

export const respondToInviteParamsSchema = z.object({
  inviteId: uuidSchema,
});

export const createWorkspaceSchema = z.object({
  name: z.string().min(2).max(100),
});

export const updateWorkspaceSchema = z.object({
  name: z.string().min(2).max(100),
});

export const workspaceIdParamSchema = z.object({
  workspaceId: uuidSchema,
});

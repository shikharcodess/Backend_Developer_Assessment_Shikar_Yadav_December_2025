"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProject = createProject;
exports.updateProject = updateProject;
exports.deleteProject = deleteProject;
exports.readOneProject = readOneProject;
exports.readAllProject = readAllProject;
exports.getAllProjectMembers = getAllProjectMembers;
exports.createWorkspace = createWorkspace;
exports.updateWorkspace = updateWorkspace;
exports.deleteWorkspace = deleteWorkspace;
exports.getOneWorkspace = getOneWorkspace;
exports.getAllWorkspace = getAllWorkspace;
exports.getAllInvites = getAllInvites;
exports.inviteUser = inviteUser;
exports.acceptInvite = acceptInvite;
exports.rejectInvite = rejectInvite;
const zod_1 = __importDefault(require("zod"));
const db_1 = require("../../../config/db/db");
const projects_1 = require("../validators/projects");
async function createProject(req, res) {
    try {
        const parsed = projects_1.createProjectSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({
                message: "Validation failed",
                errors: zod_1.default.treeifyError(parsed.error),
            });
            return;
        }
        const userData = req.metadata?.userData;
        if (!userData) {
            res.status(401).json({
                message: "Unauthorized",
            });
            return;
        }
        const { name, description } = parsed.data;
        const newProject = await db_1.prisma.$transaction([
            db_1.prisma.project.create({
                data: {
                    name: name,
                    description: description,
                    createdById: userData.id,
                    members: {
                        create: {
                            userId: userData.id,
                            role: "OWNER",
                        },
                    },
                },
            }),
        ]);
        const project = newProject.find((item) => item.name == name);
        if (project) {
            res.status(200).json({ data: project });
            return;
        }
        else {
            throw new Error("Something went wrong");
        }
    }
    catch (error) {
        res.status(500).json({
            message: "Internal server error",
            errors: "Something went wrong",
        });
    }
}
async function updateProject(req, res) {
    try {
        const parsed = projects_1.updateProjectSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({
                message: "Validation failed",
                errors: zod_1.default.treeifyError(parsed.error),
            });
            return;
        }
        const parsedParams = projects_1.projectIdParamSchema.safeParse(req.params);
        if (!parsedParams.success) {
            res.status(400).json({
                message: "Validation failed",
                errors: zod_1.default.treeifyError(parsedParams.error),
            });
            return;
        }
        const { projectId } = parsedParams.data;
        const projectFound = await db_1.prisma.project.findUnique({
            where: { id: projectId },
            select: { id: true },
        });
        if (!projectFound) {
            res.status(400).json({
                message: "Validation failed",
                errors: "Wrong projectId provided",
            });
            return;
        }
        const updatedProject = await db_1.prisma.project.update({
            where: { id: projectFound.id },
            data: { ...parsed.data },
        });
        res.status(200).json({ data: updatedProject });
        return;
    }
    catch (error) {
        res.status(500).json({
            message: "Internal server error",
            errors: "Something went wrong",
        });
    }
}
async function deleteProject(req, res) {
    try {
        const parsedParams = projects_1.projectIdParamSchema.safeParse(req.params);
        if (!parsedParams.success) {
            res.status(400).json({
                message: "Validation failed",
                errors: zod_1.default.treeifyError(parsedParams.error),
            });
            return;
        }
        const { projectId } = parsedParams.data;
        const projectFound = await db_1.prisma.project.findUnique({
            where: { id: projectId },
            select: { id: true },
        });
        if (!projectFound) {
            res.status(400).json({
                message: "Validation failed",
                errors: "Wrong projectId provided",
            });
            return;
        }
        await db_1.prisma.project.delete({ where: { id: projectId } });
        res.status(201).json();
        return;
    }
    catch (error) {
        res.status(500).json({
            message: "Internal server error",
            errors: "Something went wrong",
        });
    }
}
async function readOneProject(req, res) {
    try {
        const parsedParams = projects_1.projectIdParamSchema.safeParse(req.params);
        if (!parsedParams.success) {
            res.status(400).json({
                message: "Validation failed",
                errors: zod_1.default.treeifyError(parsedParams.error),
            });
            return;
        }
        const { projectId } = parsedParams.data;
        const projectFound = await db_1.prisma.project.findUnique({
            where: { id: projectId },
            include: {
                members: {
                    include: { user: true },
                },
                workspaces: true,
                projectInvites: true,
            },
        });
        if (!projectFound) {
            res.status(400).json({
                message: "Validation failed",
                errors: "Wrong projectId provided",
            });
            return;
        }
        res.status(200).json({ data: projectFound });
        return;
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Internal server error",
            errors: "Something went wrong",
        });
        return;
    }
}
async function readAllProject(req, res) {
    try {
        const userData = req.metadata?.userData;
        if (!userData) {
            res.status(401).json({
                message: "Unauthorized",
            });
            return;
        }
        const allProjects = await db_1.prisma.project.findMany({
            where: { members: { some: { userId: userData.id } } },
        });
        res.status(200).json({ data: allProjects });
        return;
    }
    catch (error) {
        res.status(500).json({
            message: "Internal server error",
            errors: "Something went wrong",
        });
        return;
    }
}
async function getAllProjectMembers(req, res) {
    try {
        const parsedParams = projects_1.projectIdParamSchema.safeParse(req.params);
        if (!parsedParams.success) {
            res.status(400).json({
                message: "Validation failed",
                errors: zod_1.default.treeifyError(parsedParams.error),
            });
            return;
        }
        const { projectId } = parsedParams.data;
        const userData = req.metadata?.userData;
        if (!userData) {
            res.status(401).json({
                message: "Unauthorized",
            });
            return;
        }
        const allMembers = await db_1.prisma.projectMember.findMany({
            where: { projectId: projectId },
            include: { user: true },
        });
        res.status(200).json({ data: allMembers });
        return;
    }
    catch (error) {
        res.status(500).json({
            message: "Internal server error",
            errors: "Something went wrong",
        });
        return;
    }
}
async function createWorkspace(req, res) {
    try {
        console.log("wefewwe=======");
        const parsed = projects_1.createWorkspaceSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({
                message: "Validation failed",
                errors: zod_1.default.treeifyError(parsed.error),
            });
            return;
        }
        const parsedParams = projects_1.workspaceIdParamSchema.safeParse(req.params);
        if (!parsedParams.success) {
            res.status(400).json({
                message: "Validation failed",
                errors: zod_1.default.treeifyError(parsedParams.error),
            });
            return;
        }
        const { name } = parsed.data;
        const { projectId } = parsedParams.data;
        const userData = req.metadata?.userData;
        if (!userData) {
            res.status(401).json({
                message: "Unauthorized",
            });
            return;
        }
        console.log(userData);
        const projectMemberData = await db_1.prisma.projectMember.findFirst({
            where: {
                userId: userData?.id,
                projectId: projectId,
            },
        });
        if (!projectMemberData) {
            res.status(401).json({
                message: "Unauthorized",
            });
            return;
        }
        const workspaceData = await db_1.prisma.workspace.create({
            data: { name: name, projectId: projectId },
        });
        console.log(workspaceData);
        res.status(200).json({ data: workspaceData });
        return;
    }
    catch (error) {
        res.status(500).json({
            message: "Internal server error",
            errors: "Something went wrong",
        });
    }
}
async function updateWorkspace(req, res) {
    try {
    }
    catch (error) {
        res.status(500).json({
            message: "Internal server error",
            errors: "Something went wrong",
        });
    }
}
async function deleteWorkspace(req, res) {
    try {
    }
    catch (error) {
        res.status(500).json({
            message: "Internal server error",
            errors: "Something went wrong",
        });
    }
}
async function getOneWorkspace(req, res) {
    try {
    }
    catch (error) {
        res.status(500).json({
            message: "Internal server error",
            errors: "Something went wrong",
        });
    }
}
async function getAllWorkspace(req, res) {
    try {
        const parsedParams = projects_1.workspaceIdParamSchema.safeParse(req.params);
        if (!parsedParams.success) {
            res.status(400).json({
                message: "Validation failed",
                errors: zod_1.default.treeifyError(parsedParams.error),
            });
            return;
        }
        const { projectId } = parsedParams.data;
        const allWorkspaces = await db_1.prisma.workspace.findMany({
            where: { projectId: projectId },
        });
        res.status(200).json({ data: allWorkspaces });
    }
    catch (error) {
        res.status(500).json({
            message: "Internal server error",
            errors: "Something went wrong",
        });
    }
}
async function getAllInvites(req, res) {
    try {
        const parsedParams = projects_1.createProjectInviteParamsValidator.safeParse(req.params);
        if (!parsedParams.success) {
            res.status(400).json({
                message: "Validation failed",
                errors: zod_1.default.treeifyError(parsedParams.error),
            });
            return;
        }
        const { projectId } = parsedParams.data;
        const invites = await db_1.prisma.projectInvite.findMany({
            where: { projectId: projectId },
        });
        res.status(200).json({ data: invites });
        return;
    }
    catch (error) {
        res.status(500).json({
            message: "Internal server error",
            errors: "Something went wrong",
        });
    }
}
async function inviteUser(req, res) {
    try {
        const parsedParams = projects_1.createProjectInviteParamsValidator.safeParse(req.params);
        if (!parsedParams.success) {
            res.status(400).json({
                message: "Validation failed",
                errors: zod_1.default.treeifyError(parsedParams.error),
            });
            return;
        }
        const parsed = projects_1.createProjectInviteRequestBodyValidator.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({
                message: "Validation failed",
                errors: zod_1.default.treeifyError(parsed.error),
            });
            return;
        }
        const { email, role } = parsed.data;
        const { projectId } = parsedParams.data;
        const userData = req.metadata?.userData;
        if (!userData) {
            res.status(401).json({
                message: "Unauthorized",
            });
            return;
        }
        const projectMember = await db_1.prisma.projectMember.findFirst({
            where: { userId: userData.id, projectId: projectId },
            select: { role: true },
        });
        if (!projectMember || projectMember.role !== "OWNER") {
            res.status(401).json({
                message: "Unauthorized",
                errors: "You are not allowed to invite a member",
            });
            return;
        }
        const projectInviteData = await db_1.prisma.projectInvite.create({
            data: {
                role: role,
                email: email,
                projectId: projectId,
                invitedById: userData.id,
            },
        });
        res.status(200).json({ data: projectInviteData });
        return;
    }
    catch (error) {
        res.status(500).json({
            message: "Internal server error",
            errors: "Something went wrong",
        });
    }
}
async function acceptInvite(req, res) {
    try {
        const parsedParams = projects_1.respondToInviteParamsSchema.safeParse(req.params);
        if (!parsedParams.success) {
            res.status(400).json({
                message: "Validation failed",
                errors: zod_1.default.treeifyError(parsedParams.error),
            });
            return;
        }
        const userData = req.metadata?.userData;
        if (!userData) {
            res.status(401).json({
                message: "Unauthorized",
            });
            return;
        }
        const { inviteId } = parsedParams.data;
        const inviteFound = await db_1.prisma.projectInvite.findUnique({
            where: { id: inviteId },
            select: { email: true, projectId: true, role: true },
        });
        if (!inviteFound) {
            res.status(400).json({
                message: "Validation failed",
                errors: "Wrong inviteId provided",
            });
            return;
        }
        if (userData.email !== inviteFound.email) {
            res.status(401).json({
                message: "VUnauthorized",
                errors: "Wrong inviteId provided",
            });
            return;
        }
        await db_1.prisma.$transaction([
            db_1.prisma.projectInvite.update({
                where: { id: inviteId },
                data: {
                    status: "ACCEPTED",
                },
            }),
            db_1.prisma.projectMember.create({
                data: {
                    userId: userData.id,
                    projectId: inviteFound.projectId,
                    role: inviteFound.role,
                },
            }),
        ]);
        res.status(200).json();
        return;
    }
    catch (error) {
        res.status(500).json({
            message: "Internal server error",
            errors: "Something went wrong",
        });
    }
}
async function rejectInvite(req, res) {
    try {
        const parsedParams = projects_1.respondToInviteParamsSchema.safeParse(req.params);
        if (!parsedParams.success) {
            res.status(400).json({
                message: "Validation failed",
                errors: zod_1.default.treeifyError(parsedParams.error),
            });
            return;
        }
        const userData = req.metadata?.userData;
        if (!userData) {
            res.status(401).json({
                message: "Unauthorized",
            });
            return;
        }
        const { inviteId } = parsedParams.data;
        const inviteFound = await db_1.prisma.projectInvite.findUnique({
            where: { id: inviteId },
            select: { email: true, projectId: true, role: true },
        });
        if (!inviteFound) {
            res.status(400).json({
                message: "Validation failed",
                errors: "Wrong inviteId provided",
            });
            return;
        }
        if (userData.email !== inviteFound.email) {
            res.status(401).json({
                message: "VUnauthorized",
                errors: "Wrong inviteId provided",
            });
            return;
        }
        await db_1.prisma.projectInvite.update({
            where: { id: inviteId },
            data: {
                status: "REJECTED",
            },
        });
        res.status(200).json();
        return;
    }
    catch (error) {
        res.status(500).json({
            message: "Internal server error",
            errors: "Something went wrong",
        });
    }
}
/**
 * @openapi
 * /project:
 *   get:
 *     summary: Get all projects
 *     description: Retrieve all projects where the authenticated user is a member
 *     tags:
 *       - Projects
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Projects retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Project'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Create a new project
 *     description: Create a new project with the authenticated user as owner
 *     tags:
 *       - Projects
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: My Project
 *               description:
 *                 type: string
 *                 example: Project description
 *     responses:
 *       200:
 *         description: Project created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Project'
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
/**
 * @openapi
 * /project/{projectId}:
 *   get:
 *     summary: Get a specific project
 *     description: Retrieve details of a specific project
 *     tags:
 *       - Projects
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Project retrieved successfully
 *       400:
 *         description: Invalid project ID
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 *   patch:
 *     summary: Update a project
 *     description: Update project details
 *     tags:
 *       - Projects
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Project updated successfully
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 *   delete:
 *     summary: Delete a project
 *     description: Delete a specific project
 *     tags:
 *       - Projects
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     responses:
 *       201:
 *         description: Project deleted successfully
 *       400:
 *         description: Invalid project ID
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
/**
 * @openapi
 * /project/{projectId}/members:
 *   get:
 *     summary: Get all project members
 *     description: Retrieve details of all members of a project
 *     tags:
 *       - Projects
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Members retrieved successfully
 *       400:
 *         description: Invalid project ID
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
/**
 * @openapi
 * /project/{projectId}/workspace:
 *   get:
 *     summary: Get all workspaces
 *     description: Retrieve all workspaces for a project
 *     tags:
 *       - Workspaces
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Workspaces retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Create a workspace
 *     description: Create a new workspace in a project
 *     tags:
 *       - Workspaces
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Development Workspace
 *     responses:
 *       200:
 *         description: Workspace created successfully
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
/**
 * @openapi
 * /project/{projectId}/workspace/{workspaceId}:
 *   get:
 *     summary: Get a specific workspace
 *     description: Retrieve details of a specific workspace
 *     tags:
 *       - Workspaces
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Workspace retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 *   patch:
 *     summary: Update a workspace
 *     description: Update workspace details
 *     tags:
 *       - Workspaces
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Workspace updated successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 *   delete:
 *     summary: Delete a workspace
 *     description: Delete a specific workspace
 *     tags:
 *       - Workspaces
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Workspace deleted successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
/**
 * @openapi
 * /project/{projectId}/invite:
 *   post:
 *     summary: Invite user to project
 *     description: Send invitation to a user to join the project
 *     tags:
 *       - Project Invitations
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - role
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               role:
 *                 type: string
 *                 enum: [OWNER, COLLABORATOR, VIEWER]
 *     responses:
 *       200:
 *         description: Invitation sent successfully
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
/**
 * @openapi
 * /project/{projectId}/invite:
 *   get:
 *     summary: Get all invites
 *     description: Returna all invite from a project
 *     tags:
 *       - Project Invitations
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Invitation sent successfully
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
/**
 * @openapi
 * /project/{projectId}/invite/{inviteId}/accept:
 *   post:
 *     summary: Accept project invitation
 *     description: Accept an invitation to join a project
 *     tags:
 *       - Project Invitations
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: inviteId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Invitation accepted successfully
 *       400:
 *         description: Invalid invitation
 *       500:
 *         description: Internal server error
 */
/**
 * @openapi
 * /project/{projectId}/invite/{inviteId}/reject:
 *   post:
 *     summary: Reject project invitation
 *     description: Reject an invitation to join a project
 *     tags:
 *       - Project Invitations
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: inviteId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Invitation rejected successfully
 *       400:
 *         description: Invalid invitation
 *       500:
 *         description: Internal server error
 */
/**
 * @openapi
 * components:
 *   schemas:
 *     Project:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         createdById:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */
//# sourceMappingURL=projects.js.map
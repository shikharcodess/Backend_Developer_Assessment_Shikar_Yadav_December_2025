import { Request, Response } from "express";
export declare function createProject(req: Request, res: Response): Promise<void>;
export declare function updateProject(req: Request, res: Response): Promise<void>;
export declare function deleteProject(req: Request, res: Response): Promise<void>;
export declare function readOneProject(req: Request, res: Response): Promise<void>;
export declare function readAllProject(req: Request, res: Response): Promise<void>;
export declare function getAllProjectMembers(req: Request, res: Response): Promise<void>;
export declare function createWorkspace(req: Request, res: Response): Promise<void>;
export declare function updateWorkspace(req: Request, res: Response): Promise<void>;
export declare function deleteWorkspace(req: Request, res: Response): Promise<void>;
export declare function getOneWorkspace(req: Request, res: Response): Promise<void>;
export declare function getAllWorkspace(req: Request, res: Response): Promise<void>;
export declare function getAllInvites(req: Request, res: Response): Promise<void>;
export declare function inviteUser(req: Request, res: Response): Promise<void>;
export declare function acceptInvite(req: Request, res: Response): Promise<void>;
export declare function rejectInvite(req: Request, res: Response): Promise<void>;
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

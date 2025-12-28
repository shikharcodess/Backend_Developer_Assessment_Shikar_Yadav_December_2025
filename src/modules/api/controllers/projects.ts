import { Request, Response } from "express";
import z from "zod";
import { prisma } from "../../../config/db/db";
import {
  createProjectInviteParamsValidator,
  createProjectInviteRequestBodyValidator,
  createProjectSchema,
  createWorkspaceSchema,
  projectIdParamSchema,
  respondToInviteParamsSchema,
  updateProjectSchema,
  workspaceIdParamSchema,
} from "../validators/projects";

export async function createProject(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const parsed = createProjectSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        message: "Validation failed",
        errors: z.treeifyError(parsed.error),
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
    const newProject = await prisma.$transaction([
      prisma.project.create({
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
    } else {
      throw new Error("Something went wrong");
    }
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      errors: "Something went wrong",
    });
  }
}

export async function updateProject(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const parsed = updateProjectSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        message: "Validation failed",
        errors: z.treeifyError(parsed.error),
      });
      return;
    }

    const parsedParams = projectIdParamSchema.safeParse(req.params);
    if (!parsedParams.success) {
      res.status(400).json({
        message: "Validation failed",
        errors: z.treeifyError(parsedParams.error),
      });
      return;
    }

    const { projectId } = parsedParams.data;

    const projectFound = await prisma.project.findUnique({
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

    const updatedProject = await prisma.project.update({
      where: { id: projectFound.id },
      data: { ...parsed.data },
    });
    res.status(200).json({ data: updatedProject });
    return;
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      errors: "Something went wrong",
    });
  }
}

export async function deleteProject(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const parsedParams = projectIdParamSchema.safeParse(req.params);
    if (!parsedParams.success) {
      res.status(400).json({
        message: "Validation failed",
        errors: z.treeifyError(parsedParams.error),
      });
      return;
    }

    const { projectId } = parsedParams.data;

    const projectFound = await prisma.project.findUnique({
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

    await prisma.project.delete({ where: { id: projectId } });
    res.status(201).json();
    return;
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      errors: "Something went wrong",
    });
  }
}

export async function readOneProject(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const parsedParams = projectIdParamSchema.safeParse(req.params);
    if (!parsedParams.success) {
      res.status(400).json({
        message: "Validation failed",
        errors: z.treeifyError(parsedParams.error),
      });
      return;
    }

    const { projectId } = parsedParams.data;

    const projectFound = await prisma.project.findUnique({
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
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
      errors: "Something went wrong",
    });
    return;
  }
}

export async function readAllProject(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const userData = req.metadata?.userData;
    if (!userData) {
      res.status(401).json({
        message: "Unauthorized",
      });
      return;
    }

    const allProjects = await prisma.project.findMany({
      where: { members: { some: { userId: userData.id } } },
    });

    res.status(200).json({ data: allProjects });
    return;
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      errors: "Something went wrong",
    });
    return;
  }
}

export async function getAllProjectMembers(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const parsedParams = projectIdParamSchema.safeParse(req.params);
    if (!parsedParams.success) {
      res.status(400).json({
        message: "Validation failed",
        errors: z.treeifyError(parsedParams.error),
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

    const allMembers = await prisma.projectMember.findMany({
      where: { projectId: projectId },
      include: { user: true },
    });

    res.status(200).json({ data: allMembers });
    return;
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      errors: "Something went wrong",
    });
    return;
  }
}

export async function createWorkspace(
  req: Request,
  res: Response
): Promise<void> {
  try {
    console.log("wefewwe=======");

    const parsed = createWorkspaceSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        message: "Validation failed",
        errors: z.treeifyError(parsed.error),
      });
      return;
    }
    const parsedParams = workspaceIdParamSchema.safeParse(req.params);
    if (!parsedParams.success) {
      res.status(400).json({
        message: "Validation failed",
        errors: z.treeifyError(parsedParams.error),
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

    const projectMemberData = await prisma.projectMember.findFirst({
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

    const workspaceData = await prisma.workspace.create({
      data: { name: name, projectId: projectId },
    });
    console.log(workspaceData);

    res.status(200).json({ data: workspaceData });
    return;
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      errors: "Something went wrong",
    });
  }
}

export async function updateWorkspace(
  req: Request,
  res: Response
): Promise<void> {
  try {
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      errors: "Something went wrong",
    });
  }
}
export async function deleteWorkspace(
  req: Request,
  res: Response
): Promise<void> {
  try {
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      errors: "Something went wrong",
    });
  }
}
export async function getOneWorkspace(
  req: Request,
  res: Response
): Promise<void> {
  try {
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      errors: "Something went wrong",
    });
  }
}
export async function getAllWorkspace(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const parsedParams = workspaceIdParamSchema.safeParse(req.params);
    if (!parsedParams.success) {
      res.status(400).json({
        message: "Validation failed",
        errors: z.treeifyError(parsedParams.error),
      });
      return;
    }

    const { projectId } = parsedParams.data;

    const allWorkspaces = await prisma.workspace.findMany({
      where: { projectId: projectId },
    });

    res.status(200).json({ data: allWorkspaces });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      errors: "Something went wrong",
    });
  }
}

export async function getAllInvites(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const parsedParams = createProjectInviteParamsValidator.safeParse(
      req.params
    );
    if (!parsedParams.success) {
      res.status(400).json({
        message: "Validation failed",
        errors: z.treeifyError(parsedParams.error),
      });
      return;
    }

    const { projectId } = parsedParams.data;

    const invites = await prisma.projectInvite.findMany({
      where: { projectId: projectId },
    });
    res.status(200).json({ data: invites });
    return;
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      errors: "Something went wrong",
    });
  }
}

export async function inviteUser(req: Request, res: Response): Promise<void> {
  try {
    const parsedParams = createProjectInviteParamsValidator.safeParse(
      req.params
    );
    if (!parsedParams.success) {
      res.status(400).json({
        message: "Validation failed",
        errors: z.treeifyError(parsedParams.error),
      });
      return;
    }

    const parsed = createProjectInviteRequestBodyValidator.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        message: "Validation failed",
        errors: z.treeifyError(parsed.error),
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

    const projectMember = await prisma.projectMember.findFirst({
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

    const projectInviteData = await prisma.projectInvite.create({
      data: {
        role: role,
        email: email,
        projectId: projectId,
        invitedById: userData.id,
      },
    });

    res.status(200).json({ data: projectInviteData });
    return;
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      errors: "Something went wrong",
    });
  }
}

export async function acceptInvite(req: Request, res: Response): Promise<void> {
  try {
    const parsedParams = respondToInviteParamsSchema.safeParse(req.params);
    if (!parsedParams.success) {
      res.status(400).json({
        message: "Validation failed",
        errors: z.treeifyError(parsedParams.error),
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
    const inviteFound = await prisma.projectInvite.findUnique({
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

    await prisma.$transaction([
      prisma.projectInvite.update({
        where: { id: inviteId },
        data: {
          status: "ACCEPTED",
        },
      }),
      prisma.projectMember.create({
        data: {
          userId: userData.id,
          projectId: inviteFound.projectId,
          role: inviteFound.role,
        },
      }),
    ]);

    res.status(200).json();
    return;
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      errors: "Something went wrong",
    });
  }
}

export async function rejectInvite(req: Request, res: Response): Promise<void> {
  try {
    const parsedParams = respondToInviteParamsSchema.safeParse(req.params);
    if (!parsedParams.success) {
      res.status(400).json({
        message: "Validation failed",
        errors: z.treeifyError(parsedParams.error),
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
    const inviteFound = await prisma.projectInvite.findUnique({
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

    await prisma.projectInvite.update({
      where: { id: inviteId },
      data: {
        status: "REJECTED",
      },
    });

    res.status(200).json();
    return;
  } catch (error) {
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

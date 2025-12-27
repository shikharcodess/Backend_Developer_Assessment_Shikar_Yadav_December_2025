import { Request, Response } from "express";
import z from "zod";
import { prisma } from "../../../config/db/db";
import {
  createProjectInviteParamsValidator,
  createProjectInviteRequestBodyValidator,
  createProjectSchema,
  projectIdParamSchema,
  respondToInviteParamsSchema,
  updateProjectSchema,
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
        members: true,
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
    res.status(500).json({
      message: "Internal server error",
      errors: "Something went wrong",
    });
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

    res.json(200).json({ data: allProjects });
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

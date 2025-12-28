import { Request, Response, NextFunction } from "express";
import { prisma } from "../../../config/db/db";
import {
  createWorkspaceSchema,
  workspaceIdParamSchema,
} from "../validators/projects";
import z from "zod";

export const workspaceRoleBasedAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const parsedParams = workspaceIdParamSchema.safeParse(req.params);
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

  const readRoles: string[] = ["OWNER", "COLLABORATOR", "VIEWER"];
  const writeRoles: string[] = ["OWNER", "COLLABORATOR"];
  const deleteRoles: string[] = ["OWNER"];

  let allowed: boolean = false;

  switch (req.method.toLowerCase()) {
    case "get":
      if (readRoles.includes(projectMemberData.role)) {
        allowed = true;
      } else {
        allowed = false;
      }
      break;
    case "post":
      if (writeRoles.includes(projectMemberData.role)) {
        allowed = true;
      } else {
        allowed = false;
      }
      break;
    case "patch":
      if (writeRoles.includes(projectMemberData.role)) {
        allowed = true;
      } else {
        allowed = false;
      }
      break;
    case "delete":
      if (deleteRoles.includes(projectMemberData.role)) {
        allowed = true;
      } else {
        allowed = false;
      }
      break;
    default:
      res.status(401).json({
        message: "Unauthorized",
      });
      break;
  }

  if (allowed) {
    next();
  } else {
    res.status(401).json({
      message: "Unauthorized",
    });
    return;
  }
};

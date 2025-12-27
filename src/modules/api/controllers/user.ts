import { Request, Response } from "express";
import { prisma } from "../../../config/db/db";
import {
  createProjectInviteParamsValidator,
  createProjectInviteRequestBodyValidator,
} from "../validators/projects";
import { z } from "zod";

export async function GetCurrentLoggedInUser(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const userFound = req.metadata?.userData;
    if (!userFound) {
      res.status(401).json({
        message: "Unauthorized",
        errors: "Request failed because it lacks valid authentication",
      });
      return;
    }

    const userData = await prisma.user.findUnique({
      where: { id: userFound.id },
      select: {
        id: true,
        name: true,
        projects: true,
        jobs: true,
        memberships: true,
      },
    });

    res.status(200).json({ data: userData });
    return;
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      errors: "Something went wrong",
    });
  }
}

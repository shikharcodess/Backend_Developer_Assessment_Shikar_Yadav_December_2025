import { Request, Response } from "express";
import { prisma } from "../../../config/db/db";
import {
  createProjectInviteParamsValidator,
  createProjectInviteRequestBodyValidator,
} from "../validators/projects";
import { z } from "zod";

/**
 * @openapi
 * /user/me:
 *   get:
 *     summary: Get current user
 *     description: Retrieve details of the currently authenticated user
 *     tags:
 *       - Users
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
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

/**
 * @openapi
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         projects:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Project'
 *         jobs:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Job'
 *         memberships:
 *           type: array
 */

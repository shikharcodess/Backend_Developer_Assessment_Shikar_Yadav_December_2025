import { Request, Response } from "express";
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
export declare function GetCurrentLoggedInUser(req: Request, res: Response): Promise<void>;
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

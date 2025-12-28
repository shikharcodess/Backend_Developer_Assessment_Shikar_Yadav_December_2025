"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetCurrentLoggedInUser = GetCurrentLoggedInUser;
const db_1 = require("../../../config/db/db");
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
async function GetCurrentLoggedInUser(req, res) {
    try {
        const userFound = req.metadata?.userData;
        if (!userFound) {
            res.status(401).json({
                message: "Unauthorized",
                errors: "Request failed because it lacks valid authentication",
            });
            return;
        }
        const userData = await db_1.prisma.user.findUnique({
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
//# sourceMappingURL=user.js.map
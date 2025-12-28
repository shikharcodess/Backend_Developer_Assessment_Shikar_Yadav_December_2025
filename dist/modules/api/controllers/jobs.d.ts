import { Request, Response } from "express";
export declare function createJob(req: Request, res: Response): Promise<void>;
export declare function getOneJob(req: Request, res: Response): Promise<void>;
export declare function getAllJob(req: Request, res: Response): Promise<void>;
/**
 * @openapi
 * /job:
 *   get:
 *     summary: Get all jobs
 *     description: Retrieve all jobs for the authenticated user
 *     tags:
 *       - Jobs
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Jobs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Job'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Create a new job
 *     description: Create a new background job
 *     tags:
 *       - Jobs
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *             properties:
 *               type:
 *                 type: string
 *                 example: data_processing
 *               data:
 *                 type: object
 *     responses:
 *       200:
 *         description: Job created successfully
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
/**
 * @openapi
 * /job/{jobId}:
 *   get:
 *     summary: Get a specific job
 *     description: Retrieve details of a specific job
 *     tags:
 *       - Jobs
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID
 *     responses:
 *       200:
 *         description: Job retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Job'
 *       400:
 *         description: Invalid job ID
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
/**
 * @openapi
 * components:
 *   schemas:
 *     Job:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         type:
 *           type: string
 *         status:
 *           type: string
 *           enum: [PENDING, PROCESSING, COMPLETED, FAILED]
 *         payload:
 *            type: object
 *         result:
 *            type: object
 *         maxAttempts:
 *            type: number
 *         userId:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

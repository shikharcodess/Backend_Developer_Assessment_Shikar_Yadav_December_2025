"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createJob = createJob;
exports.getOneJob = getOneJob;
exports.getAllJob = getAllJob;
const jobs_1 = require("../validators/jobs");
const zod_1 = require("zod");
const db_1 = require("../../../config/db/db");
const crypto_1 = require("crypto");
const rabbitmq_1 = __importDefault(require("../../jobs/rabbitmq"));
async function createJob(req, res) {
    try {
        const parsed = jobs_1.createJobSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({
                message: "Validation failed",
                errors: zod_1.z.treeifyError(parsed.error),
            });
            return;
        }
        const userData = req.metadata?.userData;
        if (!userData) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const { type, payload, idempotencyKey } = parsed.data;
        if (idempotencyKey) {
            const found = await db_1.prisma.job.findUnique({
                where: { idempotencyKey: idempotencyKey },
            });
            if (found) {
                res.status(200).json({ data: found });
                return;
            }
        }
        const job = await db_1.prisma.job.create({
            data: {
                type: type,
                status: "PENDING",
                payload: payload || {},
                userId: userData.id,
                idempotencyKey: idempotencyKey || (0, crypto_1.randomUUID)(),
            },
        });
        try {
            await rabbitmq_1.default.publish(type, { jobId: job.id }, { persistent: true, mandatory: true, contentType: "application/json" });
            console.log("message publised");
        }
        catch (error) {
            await db_1.prisma.job.update({
                where: { id: job.id },
                data: { status: "FAILED" },
            });
            throw error;
        }
        res.status(201).json({ data: job });
        return;
    }
    catch (error) {
        res.status(500).json({
            message: "Internal server error",
            errors: "Something went wrong",
        });
    }
}
async function getOneJob(req, res) {
    try {
        const parsedParams = jobs_1.jobParamsSchema.safeParse(req.body);
        if (!parsedParams.success) {
            res.status(400).json({
                message: "Validation failed",
                errors: zod_1.z.treeifyError(parsedParams.error),
            });
            return;
        }
        const userData = req.metadata?.userData;
        if (!userData) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const { jobId } = parsedParams.data;
        const jobData = await db_1.prisma.job.findUnique({
            where: { id: jobId, userId: userData.id },
        });
        if (!jobData) {
            res.status(400).json({
                message: "RecordNotFound Error",
                errors: "Wrong jobId provided",
            });
            return;
        }
        if (jobData.userId !== userData.id) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        res.status(200).json({ data: jobData });
        return;
    }
    catch (error) {
        res.status(500).json({
            message: "Internal server error",
            errors: "Something went wrong",
        });
    }
}
async function getAllJob(req, res) {
    try {
        const userData = req.metadata?.userData;
        if (!userData) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const allJobs = await db_1.prisma.job.findMany({
            where: { userId: userData.id },
        });
        res.status(200).json({ data: allJobs });
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
//# sourceMappingURL=jobs.js.map
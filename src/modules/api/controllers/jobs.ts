import { Request, Response } from "express";
import { createJobSchema, jobParamsSchema } from "../validators/jobs";
import { z } from "zod";
import { prisma } from "../../../config/db/db";
import { v4 as uuidv4 } from "uuid";
import rabbitMQ from "../../jobs/rabbitmq";

export async function createJob(req: Request, res: Response): Promise<void> {
  try {
    const parsed = createJobSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        message: "Validation failed",
        errors: z.treeifyError(parsed.error),
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
      const found = await prisma.job.findUnique({
        where: { idempotencyKey: idempotencyKey },
      });
      if (found) {
        res.status(200).json({ data: found });
        return;
      }
    }

    const job = await prisma.job.create({
      data: {
        type: type,
        status: "PENDING",
        payload: payload || {},
        userId: userData.id,
        idempotencyKey: idempotencyKey || uuidv4(),
      },
    });

    try {
      await rabbitMQ.publish(
        type,
        { jobId: job.id },
        { persistent: true, mandatory: true, contentType: "application/json" }
      );
    } catch (error) {
      await prisma.job.update({
        where: { id: job.id },
        data: { status: "FAILED" },
      });
      throw error;
    }

    res.status(201).json({ data: job });
    return;
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      errors: "Something went wrong",
    });
  }
}

export async function getOneJob(req: Request, res: Response): Promise<void> {
  try {
    const parsedParams = jobParamsSchema.safeParse(req.body);
    if (!parsedParams.success) {
      res.status(400).json({
        message: "Validation failed",
        errors: z.treeifyError(parsedParams.error),
      });
      return;
    }

    const userData = req.metadata?.userData;
    if (!userData) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { jobId } = parsedParams.data;

    const jobData = await prisma.job.findUnique({
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
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      errors: "Something went wrong",
    });
  }
}

export async function getAllJob(req: Request, res: Response): Promise<void> {
  try {
    const userData = req.metadata?.userData;
    if (!userData) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const allJobs = await prisma.job.findMany({
      where: { userId: userData.id },
    });

    res.status(200).json({ data: allJobs });
    return;
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      errors: "Something went wrong",
    });
  }
}

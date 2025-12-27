import { prisma } from "../../config/db/db";
import rabbitMQ from "./rabbitmq";
import redisService from "../../services/redis";

export async function BackgroundWorker() {
  await rabbitMQ.consume(
    "jobs",
    "BACKGROUND_TASK",
    async (data: { jobId: string }, msg) => {
      const jobData = await prisma.job.findUnique({
        where: { id: data.jobId },
      });
      if (!jobData) {
        throw new Error("Wrong jobId provided");
      }

      if (!jobData.idempotencyKey) {
        throw new Error("Bad job metadata");
      }

      const exists = await redisService.redisClient.get(jobData.idempotencyKey);
      if (exists) {
        throw new Error("Duplicate idempotency key provided");
      }
      await redisService.redisClient.set(
        jobData.idempotencyKey,
        "1",
        "EX",
        86400
      ); // 24 hours

      const payload = jobData.payload as { code: string };

      JSON.parse(payload.code);
    }
  );
}

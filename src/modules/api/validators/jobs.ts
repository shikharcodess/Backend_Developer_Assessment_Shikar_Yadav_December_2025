import { z } from "zod";

export const createJobSchema = z.object({
  type: z.enum(["CODE_EXECUTION", "BACKGROUND_TASK"]),
  payload: z.json(),
  idempotencyKey: z.string().optional(),
});

export const jobParamsSchema = z.object({
  jobId: z.string().min(2),
});

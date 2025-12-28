import { z } from "zod";
export declare const createJobSchema: z.ZodObject<{
    type: z.ZodEnum<{
        CODE_EXECUTION: "CODE_EXECUTION";
        BACKGROUND_TASK: "BACKGROUND_TASK";
    }>;
    payload: z.ZodJSONSchema;
    idempotencyKey: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const jobParamsSchema: z.ZodObject<{
    jobId: z.ZodString;
}, z.core.$strip>;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobParamsSchema = exports.createJobSchema = void 0;
const zod_1 = require("zod");
exports.createJobSchema = zod_1.z.object({
    type: zod_1.z.enum(["CODE_EXECUTION", "BACKGROUND_TASK"]),
    payload: zod_1.z.json(),
    idempotencyKey: zod_1.z.string().optional(),
});
exports.jobParamsSchema = zod_1.z.object({
    jobId: zod_1.z.string().min(2),
});
//# sourceMappingURL=jobs.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authorization_1 = require("../middlewares/authorization");
const jobs_1 = require("../controllers/jobs");
const jobRoutes = (0, express_1.Router)();
jobRoutes.post("/", authorization_1.authMiddleware, jobs_1.createJob);
jobRoutes.get("/", authorization_1.authMiddleware, jobs_1.getAllJob);
jobRoutes.get("/:jobId", authorization_1.authMiddleware, jobs_1.getOneJob);
exports.default = jobRoutes;
//# sourceMappingURL=job-route.js.map
import { Router } from "express";
import { authMiddleware } from "../middlewares/authorization";
import { createJob, getAllJob, getOneJob } from "../controllers/jobs";

const jobRoutes = Router();

jobRoutes.post("/", authMiddleware, createJob);
jobRoutes.get("/", authMiddleware, getAllJob);
jobRoutes.get("/:jobId", authMiddleware, getOneJob);

export default jobRoutes;

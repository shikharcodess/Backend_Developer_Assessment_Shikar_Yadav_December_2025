import { Express, Request, Response } from "express";
import authRoutes from "./routes/auth-route";
import projectRoutes from "./routes/project-route";
import userRoutes from "./routes/user-route";
import jobRoutes from "./routes/job-route";
import { Router } from "express";

export function setupV1ApiRoutes(app: Express) {
  const v1Api = Router();
  v1Api.use("/auth", authRoutes);
  v1Api.use("/project", projectRoutes);
  v1Api.use("/user", userRoutes);
  v1Api.use("/job", jobRoutes);

  app.use("/api/v1", v1Api);
}

export function setupErrorHandling(app: Express) {
  // 404 handler
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: "Route not found",
      path: req.path,
    });
  });
}

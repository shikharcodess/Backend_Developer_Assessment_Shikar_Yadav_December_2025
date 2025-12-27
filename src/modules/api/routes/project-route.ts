import { Router } from "express";
import { authMiddleware } from "../middlewares/authorization";
import {
  acceptInvite,
  createProject,
  deleteProject,
  inviteUser,
  readAllProject,
  readOneProject,
  rejectInvite,
  updateProject,
} from "../controllers/projects";

const projectRoutes = Router();

projectRoutes.get("/", authMiddleware, readAllProject);
projectRoutes.post("/", authMiddleware, createProject);
projectRoutes.get("/:projectId", authMiddleware, readOneProject);
projectRoutes.patch("/:projectId", authMiddleware, updateProject);
projectRoutes.delete("/:projectId", authMiddleware, deleteProject);

projectRoutes.post("/:projectId/invite", authMiddleware, inviteUser);
projectRoutes.post("/:projectId/invite/:inviteId/accept", acceptInvite);
projectRoutes.post("/:projectId/invite/:inviteId/reject", rejectInvite);

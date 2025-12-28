import { Router } from "express";
import { authMiddleware } from "../middlewares/authorization";
import {
  acceptInvite,
  createProject,
  createWorkspace,
  deleteProject,
  deleteWorkspace,
  getAllInvites,
  getAllProjectMembers,
  getAllWorkspace,
  getOneWorkspace,
  inviteUser,
  readAllProject,
  readOneProject,
  rejectInvite,
  updateProject,
  updateWorkspace,
} from "../controllers/projects";
import { workspaceRoleBasedAccess } from "../middlewares/workspace-middleware";
import { requireFeature } from "../middlewares/feature-flag";
import { FeatureFlag } from "../../../common/feature-flags";

const projectRoutes = Router();

projectRoutes.get("/", authMiddleware, readAllProject);
projectRoutes.post("/", authMiddleware, createProject);

projectRoutes.post(
  "/:projectId/workspace",
  authMiddleware,
  workspaceRoleBasedAccess,
  createWorkspace
);
projectRoutes.get(
  "/:projectId/workspace",
  authMiddleware,
  workspaceRoleBasedAccess,
  getAllWorkspace
);
projectRoutes.patch(
  "/:projectId/workspace/:workspaceId",
  authMiddleware,
  workspaceRoleBasedAccess,
  updateWorkspace
);
projectRoutes.delete(
  "/:projectId/workspace/:workspaceId",
  authMiddleware,
  workspaceRoleBasedAccess,
  deleteWorkspace
);
projectRoutes.get(
  "/:projectId/workspace/:workspaceId",
  authMiddleware,
  workspaceRoleBasedAccess,
  getOneWorkspace
);

projectRoutes.get(
  "/:projectId/invite",
  authMiddleware,
  requireFeature(FeatureFlag.PROJECT_INVITES),
  getAllInvites
);
projectRoutes.post(
  "/:projectId/invite",
  authMiddleware,
  requireFeature(FeatureFlag.PROJECT_INVITES),
  inviteUser
);
projectRoutes.post(
  "/:projectId/invite/:inviteId/accept",
  authMiddleware,
  requireFeature(FeatureFlag.PROJECT_INVITES),
  acceptInvite
);
projectRoutes.post(
  "/:projectId/invite/:inviteId/reject",
  authMiddleware,
  requireFeature(FeatureFlag.PROJECT_INVITES),
  rejectInvite
);

projectRoutes.get("/:projectId", authMiddleware, readOneProject);
projectRoutes.patch("/:projectId", authMiddleware, updateProject);
projectRoutes.delete("/:projectId", authMiddleware, deleteProject);
projectRoutes.get("/:projectId/members", authMiddleware, getAllProjectMembers);

export default projectRoutes;

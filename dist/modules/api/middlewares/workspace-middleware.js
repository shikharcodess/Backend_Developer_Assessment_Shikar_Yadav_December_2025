"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.workspaceRoleBasedAccess = void 0;
const db_1 = require("../../../config/db/db");
const projects_1 = require("../validators/projects");
const zod_1 = __importDefault(require("zod"));
const workspaceRoleBasedAccess = async (req, res, next) => {
    const parsedParams = projects_1.workspaceIdParamSchema.safeParse(req.params);
    if (!parsedParams.success) {
        res.status(400).json({
            message: "Validation failed",
            errors: zod_1.default.treeifyError(parsedParams.error),
        });
        return;
    }
    const { projectId } = parsedParams.data;
    const userData = req.metadata?.userData;
    if (!userData) {
        res.status(401).json({
            message: "Unauthorized",
        });
        return;
    }
    const projectMemberData = await db_1.prisma.projectMember.findFirst({
        where: {
            userId: userData?.id,
            projectId: projectId,
        },
    });
    if (!projectMemberData) {
        res.status(401).json({
            message: "Unauthorized",
        });
        return;
    }
    const readRoles = ["OWNER", "COLLABORATOR", "VIEWER"];
    const writeRoles = ["OWNER", "COLLABORATOR"];
    const deleteRoles = ["OWNER"];
    let allowed = false;
    switch (req.method.toLowerCase()) {
        case "get":
            if (readRoles.includes(projectMemberData.role)) {
                allowed = true;
            }
            else {
                allowed = false;
            }
            break;
        case "post":
            if (writeRoles.includes(projectMemberData.role)) {
                allowed = true;
            }
            else {
                allowed = false;
            }
            break;
        case "patch":
            if (writeRoles.includes(projectMemberData.role)) {
                allowed = true;
            }
            else {
                allowed = false;
            }
            break;
        case "delete":
            if (deleteRoles.includes(projectMemberData.role)) {
                allowed = true;
            }
            else {
                allowed = false;
            }
            break;
        default:
            res.status(401).json({
                message: "Unauthorized",
            });
            break;
    }
    if (allowed) {
        next();
    }
    else {
        res.status(401).json({
            message: "Unauthorized",
        });
        return;
    }
};
exports.workspaceRoleBasedAccess = workspaceRoleBasedAccess;
//# sourceMappingURL=workspace-middleware.js.map
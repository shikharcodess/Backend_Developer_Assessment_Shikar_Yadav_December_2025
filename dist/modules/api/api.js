"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupV1ApiRoutes = setupV1ApiRoutes;
exports.setupErrorHandling = setupErrorHandling;
const auth_route_1 = __importDefault(require("./routes/auth-route"));
const project_route_1 = __importDefault(require("./routes/project-route"));
const user_route_1 = __importDefault(require("./routes/user-route"));
const job_route_1 = __importDefault(require("./routes/job-route"));
const express_1 = require("express");
function setupV1ApiRoutes(app) {
    const v1Api = (0, express_1.Router)();
    v1Api.use("/auth", auth_route_1.default);
    v1Api.use("/project", project_route_1.default);
    v1Api.use("/user", user_route_1.default);
    v1Api.use("/job", job_route_1.default);
    app.use("/api/v1", v1Api);
}
function setupErrorHandling(app) {
    // 404 handler
    app.use((req, res) => {
        res.status(404).json({
            success: false,
            error: "Route not found",
            path: req.path,
        });
    });
}
//# sourceMappingURL=api.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const env_1 = require("./config/env/env");
const api_1 = require("./modules/api/api");
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_1 = require("./config/swagger/swagger");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Serve static files from public directory
app.use(express_1.default.static("src/public"));
// CORS configuration
if (env_1.ENV.CORS_ENABLED) {
    app.use((0, cors_1.default)({
        origin: env_1.ENV.CORS_ALLOWED_ORIGIN?.split(",") || "*",
        methods: env_1.ENV.CORS_ALLOWED_METHODS?.split(",") || [
            "GET",
            "POST",
            "PUT",
            "DELETE",
        ],
        allowedHeaders: env_1.ENV.CORS_ALLOWED_HEADERS?.split(",") || [
            "Content-Type",
            "Authorization",
        ],
        credentials: env_1.ENV.CORS_ALLOW_CREDENTIALS === true,
    }));
}
(0, api_1.setupV1ApiRoutes)(app);
app.use("/docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.swaggerSpec, {}));
/**
 * @openapi
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
/**
 * @openapi
 * /health:
 *   get:
 *     summary: Server Health Check
 *     responses:
 *       200:
 *         description: Server Is Healthy
 */
app.get("/health", (req, res) => {
    res.json({ status: "OK" });
    return;
});
(0, api_1.setupErrorHandling)(app);
exports.default = app;
//# sourceMappingURL=app.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const app_1 = __importDefault(require("./app"));
const logger_1 = require("./common/logger");
const env_1 = require("./config/env/env");
const workers_1 = require("./modules/jobs/workers");
const realtime_1 = require("./modules/realtime/realtime");
async function main() {
    const httpServer = http_1.default.createServer(app_1.default);
    try {
        // Start Background Worker
        (0, workers_1.BackgroundWorker)();
        // Initialize WebSocket
        const realtime = await (0, realtime_1.initializeWebSocketServer)(httpServer);
        // Start server
        const PORT = env_1.ENV.PORT || 8888;
        httpServer.listen(PORT, () => {
            logger_1.logger.info(`Server running on port ${PORT}`);
            logger_1.logger.info(`WebSocket available at ws://localhost:${PORT}`);
            logger_1.logger.info(`Environment: ${env_1.ENV.NODE_ENV}`);
        });
        // Graceful shutdown
        process.on("SIGTERM", async () => {
            logger_1.logger.info("SIGTERM received, shutting down gracefully...");
            await realtime.shutdown();
            process.exit(0);
        });
        process.on("SIGINT", async () => {
            logger_1.logger.info("SIGINT received, shutting down gracefully...");
            await realtime.shutdown();
            process.exit(0);
        });
    }
    catch (error) {
        logger_1.logger.error("Failed to start application", error);
        process.exit(1);
    }
}
main();
//# sourceMappingURL=index.js.map
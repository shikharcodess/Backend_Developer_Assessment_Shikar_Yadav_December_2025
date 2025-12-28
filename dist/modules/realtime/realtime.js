"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeWebSocketServer = initializeWebSocketServer;
const logger_1 = require("../../common/logger");
const websocket_1 = __importDefault(require("./websocket"));
async function initializeWebSocketServer(httpServer) {
    try {
        const realtime = new websocket_1.default(httpServer);
        await realtime.initialize();
        logger_1.logger.info("WebSocket server initialized successfully");
        return realtime;
    }
    catch (error) {
        logger_1.logger.error("Failed to initialize WebSocket server", error);
        throw error;
    }
}
//# sourceMappingURL=realtime.js.map
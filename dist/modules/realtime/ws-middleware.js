"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyWorkspaceAccess = exports.getSocketMetadata = exports.wsErrorMiddleware = exports.wsAuthMiddleware = void 0;
const jwt_1 = require("../../common/jwt");
const logger_1 = require("../../common/logger");
const redis_1 = __importDefault(require("../../common/redis"));
/**
 * WebSocket JWT Authentication Middleware
 * Validates JWT token from handshake auth and attaches user data to socket
 */
const wsAuthMiddleware = (socket, next) => {
    try {
        const token = socket.handshake.auth.token ||
            socket.handshake.headers.authorization?.replace("Bearer ", "");
        if (!token) {
            logger_1.logger.warning("WebSocket connection rejected: No token provided", {
                socketId: socket.id,
            });
            return next(new Error("Authentication required. No token provided."));
        }
        const decoded = (0, jwt_1.validateToken)(token);
        if (!decoded) {
            logger_1.logger.warning("WebSocket connection rejected: Invalid token", {
                socketId: socket.id,
            });
            return next(new Error("Invalid or expired token."));
        }
        // Attach user metadata to socket
        const metadata = {
            userId: decoded.sub,
            connectedAt: Date.now(),
        };
        socket.data.metadata = metadata;
        logger_1.logger.info("WebSocket client authenticated", {
            socketId: socket.id,
            userId: metadata.userId,
        });
        next();
    }
    catch (error) {
        logger_1.logger.error("WebSocket authentication middleware error", error);
        next(new Error("Authentication failed"));
    }
};
exports.wsAuthMiddleware = wsAuthMiddleware;
// Error handler middleware for WebSocket connections
const wsErrorMiddleware = (socket, next) => {
    socket.on("error", (error) => {
        logger_1.logger.error("Socket error", {
            socketId: socket.id,
            error: error instanceof Error ? error.message : String(error),
        });
    });
    next();
};
exports.wsErrorMiddleware = wsErrorMiddleware;
const getSocketMetadata = (socket) => {
    return socket.data?.metadata || null;
};
exports.getSocketMetadata = getSocketMetadata;
const verifyWorkspaceAccess = async (socket) => {
    const metadata = (0, exports.getSocketMetadata)(socket);
    if (!metadata) {
        return false;
    }
    const result = await redis_1.default.redisClient.get(`pw-${metadata.userId}`);
    if (!result) {
        return false;
    }
    const payload = JSON.parse(result);
    if (metadata.userId !== payload.userId) {
        return false;
    }
    return true;
};
exports.verifyWorkspaceAccess = verifyWorkspaceAccess;
//# sourceMappingURL=ws-middleware.js.map
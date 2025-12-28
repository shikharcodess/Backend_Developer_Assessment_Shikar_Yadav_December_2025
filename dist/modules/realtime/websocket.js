"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_1 = require("socket.io");
const redis_adapter_1 = require("@socket.io/redis-adapter");
const ioredis_1 = __importDefault(require("ioredis"));
const logger_1 = require("../../common/logger");
const ws_middleware_1 = require("./ws-middleware");
const env_1 = require("../../config/env/env");
const realtime_1 = require("../../types/realtime");
const db_1 = require("../../config/db/db");
// Real-time WebSocket Server using Socket.IO
// Handles WebSocket connections, event broadcasting, and room management
class Realtime {
    constructor(httpServer) {
        this.isInitialized = false;
        this.redisClient = new ioredis_1.default({
            host: env_1.ENV.REDIS_HOST,
            port: env_1.ENV.REDIS_PORT,
            username: env_1.ENV.REDIS_USER,
            password: env_1.ENV.REDIS_PASSWORD,
            maxRetriesPerRequest: null,
        });
        this.redisPubClient = this.redisClient.duplicate();
        this.socketioServer = new socket_io_1.Server(httpServer, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"],
                credentials: true,
            },
            transports: ["websocket"],
            path: "/socket.io",
            serveClient: true,
            pingInterval: 25000,
            pingTimeout: 60000,
        });
    }
    // Initialize the WebSocket server
    async initialize() {
        if (this.isInitialized) {
            logger_1.logger.info("WebSocket server already initialized");
            return;
        }
        try {
            // Connect Redis clients
            await this.redisClient.ping();
            await this.redisPubClient.ping();
            logger_1.logger.info("Redis clients connected for WebSocket");
            // Setup Socket.IO Redis adapter for multi-server support
            const pubClient = new ioredis_1.default({
                host: env_1.ENV.REDIS_HOST,
                port: env_1.ENV.REDIS_PORT,
                username: env_1.ENV.REDIS_USER,
                password: env_1.ENV.REDIS_PASSWORD,
                maxRetriesPerRequest: null,
            });
            const subClient = new ioredis_1.default({
                host: env_1.ENV.REDIS_HOST,
                port: env_1.ENV.REDIS_PORT,
                username: env_1.ENV.REDIS_USER,
                password: env_1.ENV.REDIS_PASSWORD,
                maxRetriesPerRequest: null,
            });
            this.socketioServer.adapter((0, redis_adapter_1.createAdapter)(pubClient, subClient));
            logger_1.logger.info("Socket.IO Redis adapter configured");
            // Register middlewares
            this.setupMiddlewares();
            // Register connection handlers
            this.setupConnectionHandlers();
            // Register event handlers
            this.setupEventHandlers();
            this.isInitialized = true;
            logger_1.logger.info("WebSocket server initialized successfully");
        }
        catch (error) {
            logger_1.logger.error("Failed to initialize WebSocket server", error);
            throw error;
        }
    }
    setupMiddlewares() {
        this.socketioServer.use(ws_middleware_1.wsAuthMiddleware);
        this.socketioServer.use(ws_middleware_1.wsErrorMiddleware);
    }
    // Setup connection and disconnection handlers
    setupConnectionHandlers() {
        this.socketioServer.on("connection", (socket) => {
            const metadata = (0, ws_middleware_1.getSocketMetadata)(socket);
            if (!metadata) {
                logger_1.logger.warning("Socket connected without metadata", {
                    socketId: socket.id,
                });
                socket.disconnect();
                return;
            }
            logger_1.logger.info("User connected to WebSocket", {
                socketId: socket.id,
                userId: metadata.userId,
            });
            // Handle disconnection
            socket.on("disconnect", () => {
                this.handleDisconnect(socket, metadata);
            });
            // Handle reconnection
            socket.on("reconnect", () => {
                logger_1.logger.info("User reconnected", {
                    socketId: socket.id,
                    userId: metadata.userId,
                });
            });
        });
    }
    joinProjectAndWorkspace(socket, metadata) {
        // Join workspace room
        socket.join(`workspace:${metadata.workspaceId}`);
        // Join project room if available
        if (metadata.projectId) {
            socket.join(`project:${metadata.projectId}`);
        }
        // Broadcast user joined event
        this.broadcastEvent(socket, realtime_1.RealtimeEventType.USER_JOINED, {
            userId: metadata.userId,
            workspaceId: metadata.workspaceId,
            projectId: metadata.projectId,
            timestamp: Date.now(),
        });
    }
    leaveProjectAndWorkspace(socket, metadata) {
        socket.leave(`workspace:${metadata.workspaceId}`);
        socket.leave(`project:${metadata.projectId}`);
        // Broadcast user joined event
        this.broadcastEvent(socket, realtime_1.RealtimeEventType.USER_LEFT, {
            userId: metadata.userId,
            workspaceId: metadata.workspaceId,
            projectId: metadata.projectId,
            timestamp: Date.now(),
        });
    }
    // Setup event handlers for real-time events
    setupEventHandlers() {
        this.socketioServer.on("connection", (socket) => {
            const metadata = (0, ws_middleware_1.getSocketMetadata)(socket);
            if (!metadata)
                return;
            // Project Workspace Join Event
            socket.on(realtime_1.RealtimeEventType.PROJECT_WORKSPACE_JOIN, async (payload) => {
                const productMemberData = await db_1.prisma.projectMember.findFirst({
                    where: {
                        userId: metadata.userId,
                        projectId: payload.projectId,
                    },
                    include: {
                        user: true,
                        project: true,
                    },
                });
                if (!productMemberData) {
                    logger_1.logger.error("unauthorized access", payload);
                    socket.send("Unauthorized");
                    socket.disconnect();
                    return;
                }
                const workspacData = await db_1.prisma.workspace.findUnique({
                    where: { id: payload.workspaceId },
                });
                if (!workspacData) {
                    logger_1.logger.error("unauthorized access", payload);
                    socket.send("Unauthorized");
                    socket.disconnect();
                    return;
                }
                const userPW = {
                    userId: metadata.userId,
                    userName: productMemberData.user.name,
                    projectId: payload.projectId,
                    projectName: productMemberData.project.name,
                    workspaceId: payload.workspaceId,
                    workspaceName: workspacData.name,
                    lastSeenAt: Date.now(),
                    userRole: productMemberData.role,
                };
                await this.redisClient.set(`pw-${metadata.userId}`, JSON.stringify(userPW), "EX", 3600);
                this.joinProjectAndWorkspace(socket, userPW);
                socket.data.metadata = {
                    ...metadata,
                    currentProjectAndWorkspace: userPW,
                };
            });
            //   Project Workspace Leave Event
            socket.on(realtime_1.RealtimeEventType.PROJECT_WORKSPACE_LEAVE, async (payload) => {
                const result = await this.redisClient.get(`pw-${metadata.userId}`);
                if (!result) {
                    return;
                }
                const userPW = JSON.parse(result);
                await this.redisClient.del(`pw-${metadata.userId}`);
                this.leaveProjectAndWorkspace(socket, userPW);
                socket.data.metadata = {
                    ...metadata,
                    currentProjectAndWorkspace: null,
                };
            });
            // Handle file change events
            socket.on(realtime_1.RealtimeEventType.FILE_CHANGED, (payload) => {
                if (!(0, ws_middleware_1.verifyWorkspaceAccess)(socket)) {
                    logger_1.logger.warning("Unauthorized file change event", {
                        socketId: socket.id,
                        userId: metadata.userId,
                        projectId: payload.projectId,
                    });
                    return;
                }
                this.broadcastToRoom(`project:${payload.projectId}`, realtime_1.RealtimeEventType.FILE_CHANGED, {
                    ...payload,
                    userId: metadata.userId,
                    timestamp: Date.now(),
                }, socket.id);
                logger_1.logger.info("File change event broadcasted", {
                    projectId: payload.projectId,
                    filePath: payload.filePath,
                });
            });
            // Handle cursor movement events
            socket.on(realtime_1.RealtimeEventType.CURSOR_MOVED, (payload) => {
                if (!(0, ws_middleware_1.verifyWorkspaceAccess)(socket)) {
                    logger_1.logger.warning("Unauthorized cursor event", {
                        socketId: socket.id,
                        userId: metadata.userId,
                        projectId: payload.projectId,
                    });
                    return;
                }
                this.broadcastToRoom(`project:${payload.projectId}`, realtime_1.RealtimeEventType.CURSOR_MOVED, {
                    ...payload,
                    userId: metadata.userId,
                    timestamp: Date.now(),
                }, socket.id);
            });
        });
    }
    // Handle user disconnection
    handleDisconnect(socket, metadata) {
        logger_1.logger.info("User disconnected from WebSocket", {
            socketId: socket.id,
            userId: metadata.userId,
            workspaceId: metadata.currentProjectAndWorkspace?.workspaceId,
        });
        // Broadcast user left event
        const io = this.socketioServer;
        io.to(`workspace:${metadata.currentProjectAndWorkspace?.workspaceId}`).emit(realtime_1.RealtimeEventType.USER_LEFT, {
            userId: metadata.userId,
            workspaceId: metadata.currentProjectAndWorkspace?.workspaceId,
            projectId: metadata.currentProjectAndWorkspace?.projectId,
            timestamp: Date.now(),
        });
    }
    // Broadcast event to all users in a workspace (including sender)
    broadcastEvent(socket, eventType, payload) {
        const metadata = (0, ws_middleware_1.getSocketMetadata)(socket);
        if (!metadata)
            return;
        const event = {
            type: eventType,
            payload,
            timestamp: Date.now(),
            userId: metadata.userId,
        };
        socket
            .to(`workspace:${metadata.currentProjectAndWorkspace?.workspaceId}`)
            .emit(eventType, event.payload);
    }
    // Broadcast event to a specific room
    broadcastToRoom(roomName, eventType, payload, excludeSocketId) {
        const io = this.socketioServer;
        if (excludeSocketId) {
            io.to(roomName).except(excludeSocketId).emit(eventType, payload);
        }
        else {
            io.to(roomName).emit(eventType, payload);
        }
        logger_1.logger.info("Event broadcasted to room", {
            room: roomName,
            eventType,
            excludeSender: !!excludeSocketId,
        });
    }
    // Broadcast event to specific user
    broadcastToUser(userId, eventType, payload) {
        const io = this.socketioServer;
        io.to(`user:${userId}`).emit(eventType, payload);
    }
    // Get Socket.IO server instance
    getServer() {
        return this.socketioServer;
    }
    // Get connected socket count
    getConnectedCount() {
        return this.socketioServer.engine.clientsCount;
    }
    // Join user to a specific room
    joinRoom(socketId, roomName) {
        const socket = this.socketioServer.sockets.sockets.get(socketId);
        if (socket) {
            socket.join(roomName);
            logger_1.logger.info("Socket joined room", { socketId, room: roomName });
        }
    }
    // Remove user from a room
    leaveRoom(socketId, roomName) {
        const socket = this.socketioServer.sockets.sockets.get(socketId);
        if (socket) {
            socket.leave(roomName);
            logger_1.logger.info("Socket left room", { socketId, room: roomName });
        }
    }
    // Shutdown WebSocket server
    async shutdown() {
        try {
            this.socketioServer.disconnectSockets();
            await this.redisClient.quit();
            await this.redisPubClient.quit();
            this.isInitialized = false;
            logger_1.logger.info("WebSocket server shutdown complete");
        }
        catch (error) {
            logger_1.logger.error("Error during WebSocket shutdown", error);
        }
    }
}
exports.default = Realtime;
//# sourceMappingURL=websocket.js.map
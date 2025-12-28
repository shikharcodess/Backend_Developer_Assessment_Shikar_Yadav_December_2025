import { Server as SocketIOServer, Socket } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import IORedis from "ioredis";
import http from "http";
import { logger } from "../../common/logger";
import {
  wsAuthMiddleware,
  wsErrorMiddleware,
  getSocketMetadata,
  verifyWorkspaceAccess,
} from "./ws-middleware";
import { ENV } from "../../config/env/env";
import {
  RealtimeEventType,
  UserJoinedPayload,
  FileChangedPayload,
  CursorMovedPayload,
  SocketMetadata,
  UserLeftPayload,
  RealtimeEvent,
  ProjectWorkspaceJoinPayload,
  CurrentProjectWorkspaceMetadata,
} from "../../types/realtime";
import { prisma } from "../../config/db/db";

// Real-time WebSocket Server using Socket.IO
// Handles WebSocket connections, event broadcasting, and room management
class Realtime {
  private socketioServer: SocketIOServer;
  private redisClient: IORedis;
  private redisPubClient: IORedis;
  private isInitialized = false;

  constructor(httpServer: http.Server) {
    this.redisClient = new IORedis({
      host: ENV.REDIS_HOST,
      port: ENV.REDIS_PORT,
      username: ENV.REDIS_USER,
      password: ENV.REDIS_PASSWORD,
      maxRetriesPerRequest: null,
    });

    this.redisPubClient = this.redisClient.duplicate();

    this.socketioServer = new SocketIOServer(httpServer, {
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
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      logger.info("WebSocket server already initialized");
      return;
    }

    try {
      // Connect Redis clients
      await this.redisClient.ping();
      await this.redisPubClient.ping();

      logger.info("Redis clients connected for WebSocket");

      // Setup Socket.IO Redis adapter for multi-server support
      const pubClient = new IORedis({
        host: ENV.REDIS_HOST,
        port: ENV.REDIS_PORT,
        username: ENV.REDIS_USER,
        password: ENV.REDIS_PASSWORD,
        maxRetriesPerRequest: null,
      });

      const subClient = new IORedis({
        host: ENV.REDIS_HOST,
        port: ENV.REDIS_PORT,
        username: ENV.REDIS_USER,
        password: ENV.REDIS_PASSWORD,
        maxRetriesPerRequest: null,
      });

      this.socketioServer.adapter(createAdapter(pubClient, subClient));

      logger.info("Socket.IO Redis adapter configured");

      // Register middlewares
      this.setupMiddlewares();

      // Register connection handlers
      this.setupConnectionHandlers();

      // Register event handlers
      this.setupEventHandlers();

      this.isInitialized = true;
      logger.info("WebSocket server initialized successfully");
    } catch (error) {
      logger.error("Failed to initialize WebSocket server", error);
      throw error;
    }
  }

  private setupMiddlewares(): void {
    this.socketioServer.use(wsAuthMiddleware);
    this.socketioServer.use(wsErrorMiddleware);
  }

  // Setup connection and disconnection handlers
  private setupConnectionHandlers(): void {
    this.socketioServer.on("connection", (socket: Socket) => {
      const metadata = getSocketMetadata(socket);

      if (!metadata) {
        logger.warning("Socket connected without metadata", {
          socketId: socket.id,
        });
        socket.disconnect();
        return;
      }

      logger.info("User connected to WebSocket", {
        socketId: socket.id,
        userId: metadata.userId,
      });

      // Handle disconnection
      socket.on("disconnect", () => {
        this.handleDisconnect(socket, metadata);
      });

      // Handle reconnection
      socket.on("reconnect", () => {
        logger.info("User reconnected", {
          socketId: socket.id,
          userId: metadata.userId,
        });
      });
    });
  }

  private joinProjectAndWorkspace(
    socket: Socket,
    metadata: CurrentProjectWorkspaceMetadata
  ) {
    // Join workspace room
    socket.join(`workspace:${metadata.workspaceId}`);

    // Join project room if available
    if (metadata.projectId) {
      socket.join(`project:${metadata.projectId}`);
    }

    // Broadcast user joined event
    this.broadcastEvent(socket, RealtimeEventType.USER_JOINED, {
      userId: metadata.userId,
      workspaceId: metadata.workspaceId,
      projectId: metadata.projectId,
      timestamp: Date.now(),
    } as UserJoinedPayload);
  }

  private leaveProjectAndWorkspace(
    socket: Socket,
    metadata: CurrentProjectWorkspaceMetadata
  ) {
    socket.leave(`workspace:${metadata.workspaceId}`);
    socket.leave(`project:${metadata.projectId}`);

    // Broadcast user joined event
    this.broadcastEvent(socket, RealtimeEventType.USER_LEFT, {
      userId: metadata.userId,
      workspaceId: metadata.workspaceId,
      projectId: metadata.projectId,
      timestamp: Date.now(),
    } as UserJoinedPayload);
  }

  // Setup event handlers for real-time events
  private setupEventHandlers(): void {
    this.socketioServer.on("connection", (socket: Socket) => {
      const metadata = getSocketMetadata(socket);

      if (!metadata) return;

      // Project Workspace Join Event
      socket.on(
        RealtimeEventType.PROJECT_WORKSPACE_JOIN,
        async (payload: ProjectWorkspaceJoinPayload) => {
          const productMemberData = await prisma.projectMember.findFirst({
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
            logger.error("unauthorized access", payload);
            socket.send("Unauthorized");
            socket.disconnect();
            return;
          }

          const workspacData = await prisma.workspace.findUnique({
            where: { id: payload.workspaceId },
          });
          if (!workspacData) {
            logger.error("unauthorized access", payload);
            socket.send("Unauthorized");
            socket.disconnect();
            return;
          }

          const userPW: CurrentProjectWorkspaceMetadata = {
            userId: metadata.userId,
            userName: productMemberData.user.name,
            projectId: payload.projectId,
            projectName: productMemberData.project.name,
            workspaceId: payload.workspaceId,
            workspaceName: workspacData.name,
            lastSeenAt: Date.now(),
            userRole: productMemberData.role,
          };

          await this.redisClient.set(
            `pw-${metadata.userId}`,
            JSON.stringify(userPW),
            "EX",
            3600
          );

          this.joinProjectAndWorkspace(socket, userPW);

          socket.data.metadata = {
            ...metadata,
            currentProjectAndWorkspace: userPW,
          };
        }
      );

      //   Project Workspace Leave Event
      socket.on(
        RealtimeEventType.PROJECT_WORKSPACE_LEAVE,
        async (payload: {}) => {
          const result = await this.redisClient.get(`pw-${metadata.userId}`);
          if (!result) {
            return;
          }

          const userPW: CurrentProjectWorkspaceMetadata = JSON.parse(result);

          await this.redisClient.del(`pw-${metadata.userId}`);
          this.leaveProjectAndWorkspace(socket, userPW);
          socket.data.metadata = {
            ...metadata,
            currentProjectAndWorkspace: null,
          };
        }
      );

      // Handle file change events
      socket.on(
        RealtimeEventType.FILE_CHANGED,
        (payload: FileChangedPayload) => {
          if (!verifyWorkspaceAccess(socket)) {
            logger.warning("Unauthorized file change event", {
              socketId: socket.id,
              userId: metadata.userId,
              projectId: payload.projectId,
            });
            return;
          }

          this.broadcastToRoom(
            `project:${payload.projectId}`,
            RealtimeEventType.FILE_CHANGED,
            {
              ...payload,
              userId: metadata.userId,
              timestamp: Date.now(),
            } as FileChangedPayload,
            socket.id
          );

          logger.info("File change event broadcasted", {
            projectId: payload.projectId,
            filePath: payload.filePath,
          });
        }
      );

      // Handle cursor movement events
      socket.on(
        RealtimeEventType.CURSOR_MOVED,
        (payload: CursorMovedPayload) => {
          if (!verifyWorkspaceAccess(socket)) {
            logger.warning("Unauthorized cursor event", {
              socketId: socket.id,
              userId: metadata.userId,
              projectId: payload.projectId,
            });
            return;
          }

          this.broadcastToRoom(
            `project:${payload.projectId}`,
            RealtimeEventType.CURSOR_MOVED,
            {
              ...payload,
              userId: metadata.userId,
              timestamp: Date.now(),
            } as CursorMovedPayload,
            socket.id
          );
        }
      );
    });
  }

  // Handle user disconnection
  private handleDisconnect(socket: Socket, metadata: SocketMetadata): void {
    logger.info("User disconnected from WebSocket", {
      socketId: socket.id,
      userId: metadata.userId,
      workspaceId: metadata.currentProjectAndWorkspace?.workspaceId,
    });

    // Broadcast user left event
    const io = this.socketioServer;
    io.to(`workspace:${metadata.currentProjectAndWorkspace?.workspaceId}`).emit(
      RealtimeEventType.USER_LEFT,
      {
        userId: metadata.userId,
        workspaceId: metadata.currentProjectAndWorkspace?.workspaceId,
        projectId: metadata.currentProjectAndWorkspace?.projectId,
        timestamp: Date.now(),
      } as UserLeftPayload
    );
  }

  // Broadcast event to all users in a workspace (including sender)
  private broadcastEvent(
    socket: Socket,
    eventType: RealtimeEventType,
    payload: any
  ): void {
    const metadata = getSocketMetadata(socket);

    if (!metadata) return;

    const event: RealtimeEvent = {
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
  broadcastToRoom(
    roomName: string,
    eventType: string,
    payload: any,
    excludeSocketId?: string
  ): void {
    const io = this.socketioServer;

    if (excludeSocketId) {
      io.to(roomName).except(excludeSocketId).emit(eventType, payload);
    } else {
      io.to(roomName).emit(eventType, payload);
    }

    logger.info("Event broadcasted to room", {
      room: roomName,
      eventType,
      excludeSender: !!excludeSocketId,
    });
  }

  // Broadcast event to specific user
  broadcastToUser(userId: string, eventType: string, payload: any): void {
    const io = this.socketioServer;
    io.to(`user:${userId}`).emit(eventType, payload);
  }

  // Get Socket.IO server instance
  getServer(): SocketIOServer {
    return this.socketioServer;
  }

  // Get connected socket count
  getConnectedCount(): number {
    return this.socketioServer.engine.clientsCount;
  }

  // Join user to a specific room
  joinRoom(socketId: string, roomName: string): void {
    const socket = this.socketioServer.sockets.sockets.get(socketId);
    if (socket) {
      socket.join(roomName);
      logger.info("Socket joined room", { socketId, room: roomName });
    }
  }

  // Remove user from a room
  leaveRoom(socketId: string, roomName: string): void {
    const socket = this.socketioServer.sockets.sockets.get(socketId);
    if (socket) {
      socket.leave(roomName);
      logger.info("Socket left room", { socketId, room: roomName });
    }
  }

  // Shutdown WebSocket server
  async shutdown(): Promise<void> {
    try {
      this.socketioServer.disconnectSockets();
      await this.redisClient.quit();
      await this.redisPubClient.quit();
      this.isInitialized = false;
      logger.info("WebSocket server shutdown complete");
    } catch (error) {
      logger.error("Error during WebSocket shutdown", error);
    }
  }
}

export default Realtime;

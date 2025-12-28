import { Socket } from "socket.io";
import { validateToken } from "../../common/jwt";
import { logger } from "../../common/logger";
import {
  CurrentProjectWorkspaceMetadata,
  SocketMetadata,
} from "../../types/realtime";
import redisService from "../../common/redis";

/**
 * WebSocket JWT Authentication Middleware
 * Validates JWT token from handshake auth and attaches user data to socket
 */
export const wsAuthMiddleware = (
  socket: Socket,
  next: (err?: Error) => void
) => {
  try {
    const token =
      socket.handshake.auth.token ||
      socket.handshake.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      logger.warning("WebSocket connection rejected: No token provided", {
        socketId: socket.id,
      });
      return next(new Error("Authentication required. No token provided."));
    }

    const decoded = validateToken(token);

    if (!decoded) {
      logger.warning("WebSocket connection rejected: Invalid token", {
        socketId: socket.id,
      });
      return next(new Error("Invalid or expired token."));
    }

    // Attach user metadata to socket
    const metadata: SocketMetadata = {
      userId: decoded.sub,
      connectedAt: Date.now(),
    };

    socket.data.metadata = metadata;

    logger.info("WebSocket client authenticated", {
      socketId: socket.id,
      userId: metadata.userId,
    });

    next();
  } catch (error) {
    logger.error("WebSocket authentication middleware error", error);
    next(new Error("Authentication failed"));
  }
};

// Error handler middleware for WebSocket connections
export const wsErrorMiddleware = (
  socket: Socket,
  next: (err?: Error) => void
) => {
  socket.on("error", (error) => {
    logger.error("Socket error", {
      socketId: socket.id,
      error: error instanceof Error ? error.message : String(error),
    });
  });

  next();
};

export const getSocketMetadata = (socket: Socket): SocketMetadata | null => {
  return socket.data?.metadata || null;
};

export const verifyWorkspaceAccess = async (
  socket: Socket
): Promise<boolean> => {
  const metadata = getSocketMetadata(socket);

  if (!metadata) {
    return false;
  }

  const result = await redisService.redisClient.get(`pw-${metadata.userId}`);
  if (!result) {
    return false;
  }

  const payload: CurrentProjectWorkspaceMetadata = JSON.parse(result);

  if (metadata.userId !== payload.userId) {
    return false;
  }

  return true;
};

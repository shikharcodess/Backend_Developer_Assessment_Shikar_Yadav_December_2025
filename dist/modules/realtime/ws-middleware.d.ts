import { Socket } from "socket.io";
import { SocketMetadata } from "../../types/realtime";
/**
 * WebSocket JWT Authentication Middleware
 * Validates JWT token from handshake auth and attaches user data to socket
 */
export declare const wsAuthMiddleware: (socket: Socket, next: (err?: Error) => void) => void;
export declare const wsErrorMiddleware: (socket: Socket, next: (err?: Error) => void) => void;
export declare const getSocketMetadata: (socket: Socket) => SocketMetadata | null;
export declare const verifyWorkspaceAccess: (socket: Socket) => Promise<boolean>;

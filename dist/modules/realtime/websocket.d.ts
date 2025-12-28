import { Server as SocketIOServer } from "socket.io";
import http from "http";
declare class Realtime {
    private socketioServer;
    private redisClient;
    private redisPubClient;
    private isInitialized;
    constructor(httpServer: http.Server);
    initialize(): Promise<void>;
    private setupMiddlewares;
    private setupConnectionHandlers;
    private joinProjectAndWorkspace;
    private leaveProjectAndWorkspace;
    private setupEventHandlers;
    private handleDisconnect;
    private broadcastEvent;
    broadcastToRoom(roomName: string, eventType: string, payload: any, excludeSocketId?: string): void;
    broadcastToUser(userId: string, eventType: string, payload: any): void;
    getServer(): SocketIOServer;
    getConnectedCount(): number;
    joinRoom(socketId: string, roomName: string): void;
    leaveRoom(socketId: string, roomName: string): void;
    shutdown(): Promise<void>;
}
export default Realtime;

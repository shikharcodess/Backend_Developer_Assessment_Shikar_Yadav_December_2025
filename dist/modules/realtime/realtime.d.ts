import Realtime from "./websocket";
import http from "http";
export declare function initializeWebSocketServer(httpServer: http.Server): Promise<Realtime>;

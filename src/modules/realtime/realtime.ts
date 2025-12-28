import { logger } from "../../common/logger";
import Realtime from "./websocket";
import http from "http";

export async function initializeWebSocketServer(httpServer: http.Server) {
  try {
    const realtime = new Realtime(httpServer);
    await realtime.initialize();
    logger.info("WebSocket server initialized successfully");
    return realtime;
  } catch (error) {
    logger.error("Failed to initialize WebSocket server", error);
    throw error;
  }
}

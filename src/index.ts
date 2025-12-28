import http from "http";
import app from "./app";
import { logger } from "./common/logger";
import { ENV } from "./config/env/env";
import { BackgroundWorker } from "./modules/jobs/workers";
import { initializeWebSocketServer } from "./modules/realtime/realtime";

async function main() {
  const httpServer = http.createServer(app);

  try {
    // Start Background Worker
    BackgroundWorker();

    // Initialize WebSocket
    const realtime = await initializeWebSocketServer(httpServer);

    // Start server
    const PORT = ENV.PORT || 8888;
    httpServer.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`WebSocket available at ws://localhost:${PORT}`);
      logger.info(`Environment: ${ENV.NODE_ENV}`);
    });

    // Graceful shutdown
    process.on("SIGTERM", async () => {
      logger.info("SIGTERM received, shutting down gracefully...");
      await realtime.shutdown();
      process.exit(0);
    });

    process.on("SIGINT", async () => {
      logger.info("SIGINT received, shutting down gracefully...");
      await realtime.shutdown();
      process.exit(0);
    });
  } catch (error) {
    logger.error("Failed to start application", error);
    process.exit(1);
  }
}

main();

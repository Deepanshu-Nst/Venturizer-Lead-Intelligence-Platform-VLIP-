import { createApp } from "./app.js";
import { config } from "./config/index.js";
import { pool } from "./shared/db/pool.js";
import { logger } from "./shared/middleware/logger.js";

const app = createApp();

// ---------------------------------------------------------------------------
// Server
// ---------------------------------------------------------------------------
const server = app.listen(config.port, () => {
  logger.info(`Venturizer API started`, {
    port: config.port,
    env: config.env,
    corsOrigin: config.cors.origin,
  });
});

// ---------------------------------------------------------------------------
// Graceful shutdown
// ---------------------------------------------------------------------------
function shutdown(signal: string) {
  logger.info(`${signal} received — shutting down gracefully`);

  server.close(async () => {
    logger.info("HTTP server closed");

    try {
      await pool.end();
      logger.info("Database pool drained");
    } catch (err) {
      logger.error("Error closing database pool", {
        error: (err as Error).message,
      });
    }

    process.exit(0);
  });

  // Force shutdown after 10s
  setTimeout(() => {
    logger.error("Forced shutdown after timeout");
    process.exit(1);
  }, 10_000).unref();
}

process.on("SIGTERM", () => { shutdown("SIGTERM"); });
process.on("SIGINT", () => { shutdown("SIGINT"); });

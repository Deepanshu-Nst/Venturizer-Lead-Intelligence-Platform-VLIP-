import { Router } from "express";
import { pool } from "../../shared/db/pool.js";
import { asyncHandler } from "../../shared/middleware/asyncHandler.js";
import { success, error } from "../../shared/types/responses.js";
import { logger } from "../../shared/middleware/logger.js";

const router = Router();

// ---------------------------------------------------------------------------
// GET /health — basic liveness probe
// ---------------------------------------------------------------------------
router.get(
  "/",
  asyncHandler((_req, res) => {
    res.json(
      success({
        status: "ok",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      })
    );
  })
);

// ---------------------------------------------------------------------------
// GET /health/ready — readiness probe (checks DB connectivity)
// ---------------------------------------------------------------------------
router.get(
  "/ready",
  asyncHandler(async (_req, res) => {
    try {
      const dbResult = await pool.query<{ alive: number }>("SELECT 1 AS alive");
      const dbAlive = dbResult.rows[0]?.alive === 1;

      if (!dbAlive) {
        res.status(503).json(
          error("SERVICE_UNAVAILABLE", "Database is not responding")
        );
        return;
      }

      res.json(
        success({
          status: "ok",
          database: "connected",
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
        })
      );
    } catch (err) {
      logger.error("Health check — database unreachable", {
        error: (err as Error).message,
      });

      res.status(503).json(
        error("SERVICE_UNAVAILABLE", "Database is unreachable")
      );
    }
  })
);

export default router;

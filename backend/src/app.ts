import express from "express";
import cors from "cors";
import helmet from "helmet";
import { config } from "./config/index.js";
import { requestId } from "./shared/middleware/requestId.js";
import { requestLogger } from "./shared/middleware/logger.js";
import { errorHandler } from "./shared/middleware/errorHandler.js";
import { notFound } from "./shared/middleware/notFound.js";

// Route imports
import healthRoutes from "./features/health/health.routes.js";
import authRoutes from "./features/auth/auth.routes.js";
import qualificationRoutes from "./features/qualification/qualification.routes.js";
import leadsRoutes from "./features/leads/leads.routes.js";
import scoringRoutes from "./features/scoring/scoring.routes.js";
import uploadsRoutes from "./features/uploads/uploads.routes.js";
import dashboardRoutes from "./features/dashboard/routes/dashboard.routes.js";
import leadRoutes from "./features/lead/routes/lead.routes.js";

export function createApp() {
  const app = express();

  // -----------------------------------------------------------------------
  // 1. Request tracing (must be first)
  // -----------------------------------------------------------------------
  app.use(requestId);

  // -----------------------------------------------------------------------
  // 2. Security headers
  // -----------------------------------------------------------------------
  app.use(helmet());

  // -----------------------------------------------------------------------
  // 3. CORS
  // -----------------------------------------------------------------------
  app.use(
    cors({
      origin: config.cors.origin,
      credentials: true,
      methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "x-api-key"],
      maxAge: 600,
    })
  );

  // -----------------------------------------------------------------------
  // 4. Body parsing
  // -----------------------------------------------------------------------
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));

  // -----------------------------------------------------------------------
  // 5. Request logging
  // -----------------------------------------------------------------------
  app.use(requestLogger);

  // -----------------------------------------------------------------------
  // 6. Routes — health (no auth)
  // -----------------------------------------------------------------------
  app.use("/health", healthRoutes);

  // -----------------------------------------------------------------------
  // 7. Routes — API v1
  // -----------------------------------------------------------------------
  const v1 = express.Router();

  v1.use("/auth", authRoutes);
  v1.use("/qualification", qualificationRoutes);
  v1.use("/leads", leadsRoutes);
  v1.use("/scoring", scoringRoutes);
  v1.use("/uploads", uploadsRoutes);
  v1.use("/dashboard", dashboardRoutes);
  v1.use("/lead", leadRoutes);

  app.use("/api/v1", v1);

  // -----------------------------------------------------------------------
  // 8. Catch-all 404
  // -----------------------------------------------------------------------
  app.use(notFound);

  // -----------------------------------------------------------------------
  // 9. Global error handler (must be last)
  // -----------------------------------------------------------------------
  app.use(errorHandler);

  return app;
}

import type { Request, Response, NextFunction } from "express";
import { config } from "../../config/index.js";
import { AppError } from "./errorHandler.js";

/**
 * API key authentication middleware.
 *
 * Expects `x-api-key` header matching the configured API_KEY.
 * Used for dashboard / internal endpoints.
 */
export function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const apiKey = req.headers["x-api-key"] as string | undefined;

  if (!apiKey) {
    next(
      new AppError(401, "UNAUTHORIZED", "Missing x-api-key header", ["x-api-key"])
    );
    return;
  }

  if (apiKey !== config.auth.apiKey) {
    next(new AppError(401, "UNAUTHORIZED", "Invalid API key"));
    return;
  }

  next();
}

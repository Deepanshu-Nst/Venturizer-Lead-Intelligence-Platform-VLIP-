import type { Request, Response, NextFunction } from "express";
import { AppError } from "./errorHandler.js";

/**
 * Catch-all 404 handler.
 * Must be registered AFTER all routes.
 */
export function notFound(
  _req: Request,
  _res: Response,
  next: NextFunction
): void {
  next(new AppError(404, "NOT_FOUND", "The requested resource was not found"));
}

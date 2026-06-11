import type { Request, Response, NextFunction } from "express";
import { config } from "../../config/index.js";
import { logger } from "./logger.js";

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly fields?: string[];

  constructor(statusCode: number, code: string, message: string, fields?: string[]) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    this.fields = fields;

    // Maintain proper prototype chain
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Central error handler.
 *
 * - AppError instances → structured JSON with statusCode, code, message, fields
 * - Unknown errors → 500 INTERNAL_ERROR (details hidden in production)
 * - In dev/test → include stack trace for debugging
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const requestId = req.requestId || "unknown";

  if (err instanceof AppError) {
    logger.warn(`AppError: ${err.message}`, {
      requestId,
      code: err.code,
      statusCode: err.statusCode,
      fields: err.fields,
      path: req.originalUrl,
    });

    res.status(err.statusCode).json({
      data: null,
      error: {
        code: err.code,
        message: err.message,
        fields: err.fields,
      },
    });
    return;
  }

  logger.error(`Unhandled error: ${err.message}`, {
    requestId,
    path: req.originalUrl,
    method: req.method,
    stack: config.isDev ? err.stack : undefined,
  });

  res.status(500).json({
    data: null,
    error: {
      code: "INTERNAL_ERROR",
      message: config.isProd
        ? "An unexpected error occurred"
        : err.message || "An unexpected error occurred",
      ...(config.isDev && err.stack ? { stack: err.stack } : {}),
    },
  });
}

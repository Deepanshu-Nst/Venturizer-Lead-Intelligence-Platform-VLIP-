import type { Request, Response, NextFunction, RequestHandler } from "express";

/**
 * Wraps an async route handler to forward rejected promises
 * to Express error middleware.
 *
 * Express 4 does NOT catch promise rejections from async handlers.
 * This wrapper ensures errors propagate to the error handler.
 */
export function asyncHandler(fn: RequestHandler): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const possiblePromise = fn(req, res, next) as unknown;
      if (possiblePromise instanceof Promise) {
        possiblePromise.catch(next);
      }
    } catch (err) {
      next(err);
    }
  };
}

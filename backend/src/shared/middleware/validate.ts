import type { Request, Response, NextFunction } from "express";
import type { ZodSchema } from "zod";
import { AppError } from "./errorHandler.js";

type RequestSource = "body" | "query" | "params";

/**
 * Express middleware that validates a request property (body / query / params)
 * against a Zod schema.
 *
 * On success — replaces the source with the parsed (coerced) value.
 * On failure — returns a 400 VALIDATION_ERROR with field-level errors.
 */
export function validate<T>(schema: ZodSchema<T>, source: RequestSource = "body") {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const fields = result.error.errors.map((e) => ({
        path: e.path.join("."),
        message: e.message,
        code: e.code,
      }));

      const fieldPaths = fields.map((f) => f.path);

      next(
        new AppError(
          400,
          "VALIDATION_ERROR",
          `Validation failed: ${fields.map((f) => `${f.path} (${f.message})`).join("; ")}`,
          fieldPaths
        )
      );
      return;
    }

    // Replace with parsed (coerced) data
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    (req as any)[source] = result.data;
    next();
  };
}

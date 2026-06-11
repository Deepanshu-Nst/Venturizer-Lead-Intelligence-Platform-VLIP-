import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(3001),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  DATABASE_SSL: z
    .enum(["true", "false"])
    .default("true")
    .transform((v) => v === "true"),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
  LOG_LEVEL: z
    .enum(["debug", "info", "warn", "error"])
    .default("info"),
  API_KEY: z.string().min(8, "API_KEY must be at least 8 characters"),

  // Upload — storage driver
  STORAGE_DRIVER: z.enum(["disk", "s3"]).default("disk"),
  UPLOAD_PATH: z.string().default("./uploads"),

  // Upload — S3 (only required when STORAGE_DRIVER=s3)
  S3_REGION: z.string().default("us-east-1"),
  S3_BUCKET: z.string().default("venturizer-uploads"),
  S3_ACCESS_KEY_ID: z.string().default(""),
  S3_SECRET_ACCESS_KEY: z.string().default(""),
  S3_ENDPOINT: z.string().optional(),
  S3_PUBLIC_URL_BASE: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

let _env: Env | null = null;

export function loadEnv(): Env {
  if (_env) return _env;

  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const errors = result.error.errors
      .map((e) => `  ${e.path.join(".")}: ${e.message}`)
      .join("\n");

    console.error("\n❌ Invalid environment variables:\n");
    console.error(errors);
    console.error();
    process.exit(1);
  }

  _env = result.data;
  return _env;
}

export function getEnv(): Env {
  if (!_env) {
    return loadEnv();
  }
  return _env;
}

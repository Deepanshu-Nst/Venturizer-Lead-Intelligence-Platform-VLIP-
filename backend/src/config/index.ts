import { loadEnv } from "./env.js";

// Load env at import time
const env = loadEnv();

export const config = {
  env: env.NODE_ENV,
  isDev: env.NODE_ENV === "development",
  isProd: env.NODE_ENV === "production",
  isTest: env.NODE_ENV === "test",
  port: env.PORT,
  logLevel: env.LOG_LEVEL,

  database: {
    url: env.DATABASE_URL,
    ssl: env.DATABASE_SSL ? { rejectUnauthorized: false } : false,
    pool: {
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 30000,
      maxUses: 100,
    },
  },

  cors: {
    origin: env.CORS_ORIGIN.includes(",") ? env.CORS_ORIGIN.split(",").map(s => s.trim()) : env.CORS_ORIGIN,
  },

  upload: {
    maxFileSize: 10 * 1024 * 1024,
    allowedMimeTypes: ["application/pdf"] as const,
    storagePath: env.UPLOAD_PATH,
  },

  storage: {
    driver: env.STORAGE_DRIVER,
    diskPath: env.UPLOAD_PATH,
    s3: {
      region: env.S3_REGION,
      bucket: env.S3_BUCKET,
      accessKeyId: env.S3_ACCESS_KEY_ID,
      secretAccessKey: env.S3_SECRET_ACCESS_KEY,
      endpoint: env.S3_ENDPOINT,
      publicUrlBase: env.S3_PUBLIC_URL_BASE,
    },
  },

  auth: {
    apiKey: env.API_KEY,
  },

  groq: {
    apiKey: env.GROQ_API_KEY,
  },
} as const;

export type Config = typeof config;
export { getEnv } from "./env.js";

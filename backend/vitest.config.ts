import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.test.ts"],
    env: {
      DATABASE_URL: "postgresql://localhost:5432/test",
      API_KEY: "test-api-key-min-8-chars",
      NODE_ENV: "test",
    },
  },
});

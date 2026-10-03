import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

const testDatabaseUrl =
  process.env.TEST_DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/clinora_test?schema=public";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.dirname(fileURLToPath(import.meta.url)),
      // `server-only` throws outside React Server Components; it's a no-op for tests.
      "server-only": fileURLToPath(new URL("./tests/support/empty.ts", import.meta.url)),
    },
  },
  test: {
    include: ["tests/integration/**/*.test.ts"],
    environment: "node",
    // Integration tests share one real Postgres database, so run files sequentially.
    fileParallelism: false,
    globalSetup: ["tests/support/global-setup.ts"],
    setupFiles: ["tests/support/setup.ts"],
    env: {
      DATABASE_URL: testDatabaseUrl,
      CLERK_WEBHOOK_SECRET: "whsec_dGVzdC13ZWJob29rLXNlY3JldC1mb3ItY2xpbm9yYQ==",
    },
  },
});

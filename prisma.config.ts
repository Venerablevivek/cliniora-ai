import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // CLI commands (migrate) prefer the direct, non-pooled connection when one is provided —
    // e.g. Neon's direct host — while the app itself connects through DATABASE_URL (pooled).
    // Read lazily (not via `env()`) so `prisma generate` in postinstall works before .env exists;
    // migrate commands still fail loudly if neither is set.
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "",
    // Only needed for `prisma migrate diff --from-migrations` (the CI drift check).
    shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL,
  },
});

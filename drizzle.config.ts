import { defineConfig } from "drizzle-kit";

// Generates migrations from src/db/schema.ts into ./drizzle (committed, applied
// at API startup). `dbCredentials` is only needed for drizzle-kit's push/studio,
// not for `generate`; the running API uses DATABASE_URL.
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
});

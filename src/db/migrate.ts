/**
 * Run pending migrations at startup. Idempotent: Drizzle tracks applied
 * migrations in its own metadata table, so this is safe to run on every boot.
 */
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { migrate } from "drizzle-orm/node-postgres/migrator";

import type { Database } from "./client.js";

// Migrations live in ./drizzle at the project root (two levels up from dist/db).
const migrationsFolder = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "drizzle",
);

export async function runMigrations(db: Database): Promise<void> {
  await migrate(db, { migrationsFolder });
}

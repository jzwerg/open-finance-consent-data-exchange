/**
 * Gateway entrypoint.
 *
 * Exposes a health endpoint and ONE adapter (UK OBIE) serving the canonical
 * account/transaction model — now backed by PostgreSQL — mapped to the OBIE
 * response shape. Signing keys are generated at startup. The full FAPI 2.0 flow,
 * the Berlin Group / FDX adapters, the consent service and the audit log are later
 * milestones — see MILESTONE.md.
 */
import Fastify from "fastify";

import {
  toObieAccountsResponse,
  toObieTransactionsResponse,
} from "./adapters/obie/index.js";
import { CanonicalRepository } from "./canonical/repository.js";
import { createDb } from "./db/client.js";
import { runMigrations } from "./db/migrate.js";
import { seed } from "./db/seed.js";
import { ensureSigningKeys } from "./keys.js";

const PORT = Number(process.env.PORT ?? 3000);
const HOST = process.env.HOST ?? "0.0.0.0";
const FAPI_KEYS_DIR = process.env.FAPI_KEYS_DIR ?? "/keys";

export function buildServer(repo: CanonicalRepository) {
  const app = Fastify({ logger: true });

  app.get("/health", async () => ({ status: "ok" }));

  // UK OBIE adapter — canonical model mapped to OBIE response shapes.
  app.get("/obie/accounts", async () => {
    const accounts = await repo.listAccounts();
    return toObieAccountsResponse(accounts);
  });

  app.get<{ Params: { accountId: string } }>(
    "/obie/accounts/:accountId/transactions",
    async (request, reply) => {
      const { accountId } = request.params;
      const account = await repo.getAccount(accountId);
      if (!account) {
        return reply.code(404).send({ error: "account_not_found" });
      }
      const transactions = await repo.listTransactions(accountId);
      return toObieTransactionsResponse(
        transactions,
        `/obie/accounts/${accountId}/transactions`,
      );
    },
  );

  return app;
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required");
  }

  const keys = ensureSigningKeys(FAPI_KEYS_DIR);
  const { db } = createDb(databaseUrl);

  // Migrations gate startup: the API only listens once the schema is in place.
  await runMigrations(db);
  await seed(db);

  const repo = new CanonicalRepository(db);
  const app = buildServer(repo);
  app.log.info(
    { dir: keys.dir, generated: keys.generated },
    keys.generated ? "generated signing keys" : "using existing signing keys",
  );

  try {
    await app.listen({ port: PORT, host: HOST });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

// Only boot when run directly (not when imported by tests).
if (import.meta.url === `file://${process.argv[1]}`) {
  void main();
}

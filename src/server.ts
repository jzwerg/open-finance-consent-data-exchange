/**
 * Gateway entrypoint (Milestone 0).
 *
 * Exposes a health endpoint and ONE adapter (UK OBIE) serving the canonical
 * account/transaction model mapped to the OBIE response shape. Signing keys are
 * generated at startup. The full FAPI 2.0 flow, the Berlin Group / FDX adapters,
 * the consent service and the audit log are later milestones — see MILESTONE.md.
 */
import Fastify from "fastify";

import { accounts, transactionsForAccount } from "./canonical/mock-data.js";
import {
  toObieAccountsResponse,
  toObieTransactionsResponse,
} from "./adapters/obie/index.js";
import { ensureSigningKeys } from "./keys.js";

const PORT = Number(process.env.PORT ?? 3000);
const HOST = process.env.HOST ?? "0.0.0.0";
const FAPI_KEYS_DIR = process.env.FAPI_KEYS_DIR ?? "/keys";

export function buildServer() {
  const app = Fastify({ logger: true });

  app.get("/health", async () => ({ status: "ok" }));

  // UK OBIE adapter — canonical model mapped to OBIE response shapes.
  app.get("/obie/accounts", async () => toObieAccountsResponse(accounts));

  app.get<{ Params: { accountId: string } }>(
    "/obie/accounts/:accountId/transactions",
    async (request, reply) => {
      const { accountId } = request.params;
      if (!accounts.some((a) => a.id === accountId)) {
        return reply.code(404).send({ error: "account_not_found" });
      }
      return toObieTransactionsResponse(
        transactionsForAccount(accountId),
        `/obie/accounts/${accountId}/transactions`,
      );
    },
  );

  return app;
}

async function main() {
  const keys = ensureSigningKeys(FAPI_KEYS_DIR);
  const app = buildServer();
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

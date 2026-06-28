/**
 * Idempotent seed of the mock canonical data. Uses fixed ids + `on conflict do
 * nothing`, so re-running on every boot (or after `make down && make up`) never
 * creates duplicates.
 */
import {
  accounts as accountSeed,
  transactions as transactionSeed,
} from "../canonical/mock-data.js";
import type { Database } from "./client.js";
import { accounts, transactions } from "./schema.js";

export async function seed(db: Database): Promise<void> {
  await db
    .insert(accounts)
    .values(
      accountSeed.map((a) => ({
        id: a.id,
        displayName: a.displayName,
        type: a.type,
        status: a.status,
        currency: a.currency,
        identifiers: a.identifiers,
        balanceAmount: a.balance.amount,
        balanceCurrency: a.balance.currency,
      })),
    )
    .onConflictDoNothing();

  await db
    .insert(transactions)
    .values(
      transactionSeed.map((t) => ({
        id: t.id,
        accountId: t.accountId,
        bookedAt: new Date(t.bookedAt),
        direction: t.direction,
        status: t.status,
        amount: t.amount.amount,
        currency: t.amount.currency,
        description: t.description,
      })),
    )
    .onConflictDoNothing();
}

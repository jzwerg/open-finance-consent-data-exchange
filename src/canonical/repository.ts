/**
 * Canonical data access. Returns canonical types only — callers (adapters) never
 * see database rows. The row→canonical mappers are pure and unit-tested without a
 * live database; the DB round-trip itself is covered by the smoke check.
 */
import { eq } from "drizzle-orm";

import type { Database } from "../db/client.js";
import { accounts, transactions } from "../db/schema.js";
import type { AccountRow, TransactionRow } from "../db/schema.js";
import type {
  AccountStatus,
  AccountType,
  CanonicalAccount,
  CanonicalTransaction,
  TransactionDirection,
  TransactionStatus,
} from "./model.js";

export function toCanonicalAccount(row: AccountRow): CanonicalAccount {
  return {
    id: row.id,
    displayName: row.displayName,
    type: row.type as AccountType,
    status: row.status as AccountStatus,
    currency: row.currency,
    identifiers: row.identifiers,
    balance: { amount: row.balanceAmount, currency: row.balanceCurrency },
  };
}

export function toCanonicalTransaction(row: TransactionRow): CanonicalTransaction {
  return {
    id: row.id,
    accountId: row.accountId,
    bookedAt: row.bookedAt.toISOString(),
    direction: row.direction as TransactionDirection,
    status: row.status as TransactionStatus,
    amount: { amount: row.amount, currency: row.currency },
    description: row.description,
  };
}

export class CanonicalRepository {
  constructor(private readonly db: Database) {}

  async listAccounts(): Promise<CanonicalAccount[]> {
    const rows = await this.db.select().from(accounts);
    return rows.map(toCanonicalAccount);
  }

  async getAccount(id: string): Promise<CanonicalAccount | null> {
    const rows = await this.db.select().from(accounts).where(eq(accounts.id, id));
    return rows[0] ? toCanonicalAccount(rows[0]) : null;
  }

  async listTransactions(accountId: string): Promise<CanonicalTransaction[]> {
    const rows = await this.db
      .select()
      .from(transactions)
      .where(eq(transactions.accountId, accountId));
    return rows.map(toCanonicalTransaction);
  }
}

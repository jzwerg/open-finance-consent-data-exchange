/**
 * Drizzle schema for the canonical model.
 *
 * These tables mirror the STANDARD-AGNOSTIC canonical model in
 * `src/canonical/model.ts` — not any one open-banking standard. OBIE (and later
 * Berlin Group / FDX) quirks stay in the adapters (docs/adr/0001).
 *
 * Money is stored as `numeric` and surfaced as decimal strings to preserve
 * precision; value objects with no query needs (account identifiers) are jsonb.
 */
import { jsonb, numeric, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import type { AccountIdentifier } from "../canonical/model.js";

export const accounts = pgTable("accounts", {
  id: text("id").primaryKey(),
  displayName: text("display_name").notNull(),
  type: text("type").notNull(),
  status: text("status").notNull(),
  currency: text("currency").notNull(),
  identifiers: jsonb("identifiers").$type<AccountIdentifier[]>().notNull(),
  balanceAmount: numeric("balance_amount").notNull(),
  balanceCurrency: text("balance_currency").notNull(),
});

export const transactions = pgTable("transactions", {
  id: text("id").primaryKey(),
  accountId: text("account_id")
    .notNull()
    .references(() => accounts.id),
  bookedAt: timestamp("booked_at", { withTimezone: true }).notNull(),
  direction: text("direction").notNull(),
  status: text("status").notNull(),
  amount: numeric("amount").notNull(),
  currency: text("currency").notNull(),
  description: text("description").notNull(),
});

export type AccountRow = typeof accounts.$inferSelect;
export type TransactionRow = typeof transactions.$inferSelect;

/**
 * Mock canonical data. This is the SEED SOURCE for the Postgres-backed canonical
 * store (see `src/db/seed.ts`); the gateway reads accounts/transactions from the
 * database via `CanonicalRepository`, not from these arrays directly.
 */
import type { CanonicalAccount, CanonicalTransaction } from "./model.js";

export const accounts: CanonicalAccount[] = [
  {
    id: "acc-001",
    displayName: "Everyday Current",
    type: "CURRENT",
    status: "ACTIVE",
    currency: "GBP",
    identifiers: [
      {
        scheme: "SORT_CODE_ACCOUNT_NUMBER",
        value: "20-00-00 41110010",
        ownerName: "Ada Lovelace",
      },
    ],
    balance: { amount: "1543.22", currency: "GBP" },
  },
  {
    id: "acc-002",
    displayName: "Rainy Day Savings",
    type: "SAVINGS",
    status: "ACTIVE",
    currency: "GBP",
    identifiers: [
      {
        scheme: "SORT_CODE_ACCOUNT_NUMBER",
        value: "20-00-00 41110028",
        ownerName: "Ada Lovelace",
      },
    ],
    balance: { amount: "8800.00", currency: "GBP" },
  },
];

export const transactions: CanonicalTransaction[] = [
  {
    id: "txn-1001",
    accountId: "acc-001",
    bookedAt: "2026-06-20T09:14:00Z",
    direction: "DEBIT",
    status: "BOOKED",
    amount: { amount: "12.50", currency: "GBP" },
    description: "Coffee Roasters Ltd",
  },
  {
    id: "txn-1002",
    accountId: "acc-001",
    bookedAt: "2026-06-21T18:02:00Z",
    direction: "DEBIT",
    status: "BOOKED",
    amount: { amount: "64.30", currency: "GBP" },
    description: "Grocery Market",
  },
  {
    id: "txn-1003",
    accountId: "acc-001",
    bookedAt: "2026-06-25T08:00:00Z",
    direction: "CREDIT",
    status: "BOOKED",
    amount: { amount: "2200.00", currency: "GBP" },
    description: "Salary — ACME Corp",
  },
  {
    id: "txn-2001",
    accountId: "acc-002",
    bookedAt: "2026-06-01T00:00:00Z",
    direction: "CREDIT",
    status: "BOOKED",
    amount: { amount: "500.00", currency: "GBP" },
    description: "Standing order from Everyday Current",
  },
];

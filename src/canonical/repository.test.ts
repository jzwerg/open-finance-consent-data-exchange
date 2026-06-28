import { describe, expect, it } from "vitest";

import type { AccountRow, TransactionRow } from "../db/schema.js";
import { toCanonicalAccount, toCanonicalTransaction } from "./repository.js";

describe("canonical row mappers", () => {
  it("maps an account row to the canonical model", () => {
    const row: AccountRow = {
      id: "acc-001",
      displayName: "Everyday Current",
      type: "CURRENT",
      status: "ACTIVE",
      currency: "GBP",
      identifiers: [
        { scheme: "SORT_CODE_ACCOUNT_NUMBER", value: "20-00-00 41110010", ownerName: "Ada" },
      ],
      balanceAmount: "1543.22",
      balanceCurrency: "GBP",
    };

    expect(toCanonicalAccount(row)).toEqual({
      id: "acc-001",
      displayName: "Everyday Current",
      type: "CURRENT",
      status: "ACTIVE",
      currency: "GBP",
      identifiers: [
        { scheme: "SORT_CODE_ACCOUNT_NUMBER", value: "20-00-00 41110010", ownerName: "Ada" },
      ],
      balance: { amount: "1543.22", currency: "GBP" },
    });
  });

  it("maps a transaction row, surfacing booked_at as an ISO string", () => {
    const row: TransactionRow = {
      id: "txn-1001",
      accountId: "acc-001",
      bookedAt: new Date("2026-06-20T09:14:00Z"),
      direction: "DEBIT",
      status: "BOOKED",
      amount: "12.50",
      currency: "GBP",
      description: "Coffee Roasters Ltd",
    };

    expect(toCanonicalTransaction(row)).toEqual({
      id: "txn-1001",
      accountId: "acc-001",
      bookedAt: "2026-06-20T09:14:00.000Z",
      direction: "DEBIT",
      status: "BOOKED",
      amount: { amount: "12.50", currency: "GBP" },
      description: "Coffee Roasters Ltd",
    });
  });
});

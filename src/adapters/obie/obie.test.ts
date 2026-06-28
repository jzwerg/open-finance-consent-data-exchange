import { describe, expect, it } from "vitest";

import type { CanonicalAccount, CanonicalTransaction } from "../../canonical/model.js";
import type { CanonicalRepository } from "../../canonical/repository.js";
import { toObieAccountsResponse, toObieTransactionsResponse } from "./index.js";
import { buildServer } from "../../server.js";

const account: CanonicalAccount = {
  id: "acc-test",
  displayName: "Test Current",
  type: "CURRENT",
  status: "ACTIVE",
  currency: "GBP",
  identifiers: [
    { scheme: "SORT_CODE_ACCOUNT_NUMBER", value: "10-20-30 12345678", ownerName: "Grace Hopper" },
  ],
  balance: { amount: "100.00", currency: "GBP" },
};

const txn: CanonicalTransaction = {
  id: "txn-test",
  accountId: "acc-test",
  bookedAt: "2026-06-01T12:00:00Z",
  direction: "DEBIT",
  status: "BOOKED",
  amount: { amount: "9.99", currency: "GBP" },
  description: "Test merchant",
};

describe("OBIE adapter", () => {
  it("maps canonical accounts into the OBIE envelope and shape", () => {
    const res = toObieAccountsResponse([account]);
    expect(res.Meta.TotalPages).toBe(1);
    expect(res.Data.Account).toHaveLength(1);

    const obie = res.Data.Account[0];
    expect(obie.AccountId).toBe("acc-test");
    expect(obie.AccountSubType).toBe("CurrentAccount");
    expect(obie.Nickname).toBe("Test Current");
    expect(obie.Account[0].SchemeName).toBe("UK.OBIE.SortCodeAccountNumber");
    expect(obie.Account[0].Identification).toBe("10-20-30 12345678");
  });

  it("maps canonical transactions, translating direction to CreditDebitIndicator", () => {
    const res = toObieTransactionsResponse([txn]);
    const obie = res.Data.Transaction[0];
    expect(obie.CreditDebitIndicator).toBe("Debit");
    expect(obie.Status).toBe("Booked");
    expect(obie.Amount).toEqual({ Amount: "9.99", Currency: "GBP" });
  });
});

// A fake repository keeps the gateway tests DB-free; the real DB round-trip is
// covered by the smoke check (see MILESTONE.md).
const fakeRepo = {
  listAccounts: async () => [account],
  getAccount: async (id: string) => (id === account.id ? account : null),
  listTransactions: async () => [txn],
} as unknown as CanonicalRepository;

describe("gateway", () => {
  it("responds 200 on /health", async () => {
    const app = buildServer(fakeRepo);
    const res = await app.inject({ method: "GET", url: "/health" });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ status: "ok" });
    await app.close();
  });

  it("serves mapped OBIE accounts from the repository", async () => {
    const app = buildServer(fakeRepo);
    const res = await app.inject({ method: "GET", url: "/obie/accounts" });
    expect(res.statusCode).toBe(200);
    expect(res.json().Data.Account[0].AccountId).toBe("acc-test");
    await app.close();
  });

  it("404s for an unknown account on the transactions endpoint", async () => {
    const app = buildServer(fakeRepo);
    const res = await app.inject({
      method: "GET",
      url: "/obie/accounts/does-not-exist/transactions",
    });
    expect(res.statusCode).toBe(404);
    await app.close();
  });
});

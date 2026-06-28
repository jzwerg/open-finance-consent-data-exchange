/**
 * UK OBIE (Open Banking Read/Write API) adapter.
 *
 * Translates the canonical model into OBIE response shapes. All OBIE-specific
 * idiosyncrasies (the `Data`/`Links`/`Meta` envelope, `AccountSubType`,
 * `CreditDebitIndicator`, the `UK.OBIE.*` scheme names) live HERE so they never
 * leak into the canonical core.
 */
import type {
  AccountType,
  CanonicalAccount,
  CanonicalTransaction,
  TransactionDirection,
} from "../../canonical/model.js";

interface ObieEnvelope<T> {
  Data: T;
  Links: { Self: string };
  Meta: { TotalPages: number };
}

interface ObieAccount {
  AccountId: string;
  Currency: string;
  AccountType: "Personal" | "Business";
  AccountSubType: string;
  Nickname: string;
  Account: Array<{
    SchemeName: string;
    Identification: string;
    Name?: string;
  }>;
}

interface ObieTransaction {
  AccountId: string;
  TransactionId: string;
  Status: "Booked" | "Pending";
  BookingDateTime: string;
  CreditDebitIndicator: "Credit" | "Debit";
  Amount: { Amount: string; Currency: string };
  TransactionInformation: string;
}

const ACCOUNT_SUBTYPE: Record<AccountType, string> = {
  CURRENT: "CurrentAccount",
  SAVINGS: "Savings",
  CREDIT_CARD: "CreditCard",
  LOAN: "Loan",
};

const SCHEME_NAME: Record<string, string> = {
  SORT_CODE_ACCOUNT_NUMBER: "UK.OBIE.SortCodeAccountNumber",
  IBAN: "UK.OBIE.IBAN",
  BBAN: "UK.OBIE.BBAN",
};

const DIRECTION: Record<TransactionDirection, "Credit" | "Debit"> = {
  CREDIT: "Credit",
  DEBIT: "Debit",
};

function toObieAccount(account: CanonicalAccount): ObieAccount {
  return {
    AccountId: account.id,
    Currency: account.currency,
    AccountType: "Personal",
    AccountSubType: ACCOUNT_SUBTYPE[account.type],
    Nickname: account.displayName,
    Account: account.identifiers.map((id) => ({
      SchemeName: SCHEME_NAME[id.scheme] ?? id.scheme,
      Identification: id.value,
      ...(id.ownerName ? { Name: id.ownerName } : {}),
    })),
  };
}

function toObieTransaction(txn: CanonicalTransaction): ObieTransaction {
  return {
    AccountId: txn.accountId,
    TransactionId: txn.id,
    Status: txn.status === "BOOKED" ? "Booked" : "Pending",
    BookingDateTime: txn.bookedAt,
    CreditDebitIndicator: DIRECTION[txn.direction],
    Amount: { Amount: txn.amount.amount, Currency: txn.amount.currency },
    TransactionInformation: txn.description,
  };
}

export function toObieAccountsResponse(
  accounts: CanonicalAccount[],
  selfUrl = "/obie/accounts",
): ObieEnvelope<{ Account: ObieAccount[] }> {
  return {
    Data: { Account: accounts.map(toObieAccount) },
    Links: { Self: selfUrl },
    Meta: { TotalPages: 1 },
  };
}

export function toObieTransactionsResponse(
  transactions: CanonicalTransaction[],
  selfUrl = "/obie/transactions",
): ObieEnvelope<{ Transaction: ObieTransaction[] }> {
  return {
    Data: { Transaction: transactions.map(toObieTransaction) },
    Links: { Self: selfUrl },
    Meta: { TotalPages: 1 },
  };
}

export type { ObieAccount, ObieTransaction, ObieEnvelope };

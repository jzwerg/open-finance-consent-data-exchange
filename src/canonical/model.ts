/**
 * Canonical, standard-agnostic financial model.
 *
 * This is the internal source of truth. It deliberately does NOT mirror any one
 * open-banking standard (Berlin Group, OBIE, FDX). Each standard's quirks are
 * absorbed by its adapter (see `src/adapters/*`), keeping the core clean — the
 * anti-corruption-layer decision in docs/adr/0001.
 */

export type AccountType = "CURRENT" | "SAVINGS" | "CREDIT_CARD" | "LOAN";

export type AccountStatus = "ACTIVE" | "INACTIVE" | "CLOSED";

/** Direction of money movement, from the account holder's perspective. */
export type TransactionDirection = "CREDIT" | "DEBIT";

export type TransactionStatus = "BOOKED" | "PENDING";

/** A monetary amount. Stored as a decimal string to avoid float rounding. */
export interface Money {
  amount: string;
  currency: string;
}

/** A scheme-qualified account identifier (e.g. sort-code/account-number, IBAN). */
export interface AccountIdentifier {
  scheme: "SORT_CODE_ACCOUNT_NUMBER" | "IBAN" | "BBAN";
  value: string;
  /** Optional human-facing name of the account owner/holder. */
  ownerName?: string;
}

export interface CanonicalAccount {
  id: string;
  /** Customer-facing label for the account. */
  displayName: string;
  type: AccountType;
  status: AccountStatus;
  currency: string;
  identifiers: AccountIdentifier[];
  balance: Money;
}

export interface CanonicalTransaction {
  id: string;
  accountId: string;
  /** ISO-8601 timestamp the transaction was booked. */
  bookedAt: string;
  direction: TransactionDirection;
  status: TransactionStatus;
  amount: Money;
  description: string;
}

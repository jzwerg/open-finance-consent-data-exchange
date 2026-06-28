# Product Brief — Open Finance Consent & Data Exchange Gateway

> Engineering decisions live in [`docs/adr/`](../adr/). This brief is the product
> counterpart: who it's for, what success looks like, and what we deliberately
> don't build.

## The problem
There is no single global open-banking standard — the UK has OBIE, the EU has Berlin
Group / PSD2, the US has FDX, Singapore has SGFinDex, each with different schemas and
security profiles. Two pains follow: (1) **for the builder**, serving multiple
regions means N integrations and N security models — integration sprawl; (2) **for
the end user**, data sharing is opaque, all-or-nothing, and hard to revoke.

## Who it's for
This is a **platform product** with two distinct users:
- **Primary (platform consumer):** the developer / third-party provider (TPP)
  integrating bank data — they want *one* API and *one* security model, not four.
- **Secondary (end user):** the consumer granting access, who needs to see exactly
  who can read their data, for how long, and cut it off instantly.
- **Economic buyer:** the fintech/aggregator platform team, or a bank exposing
  open-finance APIs.

## Jobs to be done
- *(Builder)* "Let me access a user's bank data across regions through one
  integration, instead of building and maintaining four."
- *(End user)* "Let me see who can touch my financial data, for how long, and revoke
  it instantly."

## What success looks like
- **North Star — time-to-integrate:** engineer-hours to add a new region or onboard
  a new TPP. "Add a region = write an adapter" is the platform-leverage claim, and
  it should be *measured* (adapter size / time), not asserted.
- **Value metrics:** # standards served from one canonical core · consent-revocation
  propagation time (target: next call blocked) · audit-trail completeness.
- **Quality / security metrics:** FAPI 2.0 conformance (PAR + DPoP) ·
  replay-against-revoked-consent rejection rate (100%) · append-only audit integrity.

## Non-goals (what we deliberately don't build)
- **Account information (AIS) focus, not payment initiation (PIS).** Money movement
  is out of scope for this gateway.
- **Not a bank core.** It's a gateway over mock bank data, not a system of record for
  customer funds.
- **Not every standard at once.** A canonical core + three reference adapters
  (Berlin Group, OBIE, FDX) — the point is *extensibility*, not exhaustiveness
  ([ADR 0001](../adr/0001-canonical-model-and-fapi.md)).
- **Not production key-management / CA infrastructure** — standard libraries, not a
  bespoke PKI.
- **Not KYC / onboarding** — consent management only.

## Sequencing — prove the riskiest assumption first
The riskiest *platform* bet is: **does one canonical model truly serve multiple
standards cleanly, without each standard's quirks leaking into the core?**

1. Canonical model + **one** adapter end-to-end, secured with FAPI 2.0.
   *(Prove the anti-corruption layer works at all.)*
2. Add the 2nd and 3rd adapter cheaply — this is the extensibility claim, made real.
3. Consent service: granular scopes, expiry, real-time revocation + append-only
   audit, then the token-replay-against-revoked-consent attack demo. *(The trust
   claim.)*

## Key risks & assumptions
- **Standards drift.** Standards evolve (PSD2 → PSD3/PSR, FDX versions). The adapter
  pattern is precisely the hedge — adapters absorb churn so the core stays stable.
- **Consent UX vs. security tension.** Granular, time-boxed consent is safer but
  higher-friction; sensible defaults are a product judgment, not just a UI detail.
- **Real-time revocation is hard.** Already-issued tokens must be killed fast —
  short-lived tokens + introspection. This is a product SLA ("next call blocked"),
  not only an implementation note.
- **Two-sided adoption.** A gateway matters only if TPPs build on it *and* banks
  expose data; simulated here, but the real wedge is bank partnerships gated on FAPI
  conformance.

## The demo, framed as a user outcome
A user grants a budgeting app 90-day read access to one account. The app pulls that
same account through Berlin Group, OBIE, and FDX response shapes — **one consent,
three standards.** The user hits revoke in the dashboard; the app's very next call
is rejected, and the revocation appears in the append-only audit log.
*One integration for the builder, one switch for the user.*

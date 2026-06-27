# Build Plan — Open Finance Consent & Data Exchange Gateway

## Goal

A consent-driven open-banking gateway that exposes the same underlying financial data through multiple regional standards (Berlin Group, UK OBIE, FDX), secured with FAPI 2.0, with user-permissioned, time-boxed, revocable consent.

## Definition of done

`docker-compose up` serves the same account via all three standards' endpoints; revoking access in the consent dashboard immediately blocks the third-party app, and the attempt is recorded in the audit log.

## Milestones

1. **Canonical data model** — account/transaction schema in PostgreSQL with mock bank data.
2. **Authorization server** — OAuth2 / OIDC with FAPI 2.0 (Pushed Authorization Requests, DPoP-bound tokens).
3. **Standard adapters** — map the canonical model to Berlin Group, UK OBIE, and FDX response shapes.
4. **Consent service** — granular scopes, expiry, revocation, append-only audit log.
5. **Consent dashboard** — React UI to grant, view, and revoke access.
6. **Attack demo** — token replay against a revoked consent is rejected; show the audit trail.
7. **Polish** — README architecture diagram, ADRs, GitHub Actions CI with a meaningful test suite.

## Key technical challenges

- Designing a canonical model expressive enough to map cleanly to all three standards without leaking standard-specific quirks into the core.
- Implementing FAPI 2.0 correctly (PAR + DPoP) rather than plain authorization-code flow.
- Enforcing consent revocation in real time across already-issued tokens.

## Decisions captured

- **Canonical model + adapters (anti-corruption layer)** over standard-specific gateways — see `docs/adr/0001-canonical-model-and-fapi.md`.
- **FAPI 2.0** over plain OAuth2 — see same ADR.

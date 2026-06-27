# ADR 0001 — Canonical data model with per-standard adapters, secured by FAPI 2.0

- **Status:** Accepted
- **Context:** Open banking has multiple incompatible regional standards (Berlin Group / PSD2, UK OBIE, FDX, SGFinDex). We must decide how to structure the gateway and which security profile to implement.

## Decision

1. Build a single **canonical account/transaction model** internally, with **thin adapters** translating it to each standard's response shape (an anti-corruption layer).
2. Secure the gateway with the **FAPI 2.0** security profile: Pushed Authorization Requests (PAR) and sender-constrained (DPoP) tokens.

## Rationale

### Canonical model + adapters over per-standard implementations
- Mirrors how real aggregators (Plaid, TrueLayer, Tink) are built: normalize once, adapt at the edge.
- Adding a new region becomes "write an adapter," not "re-architect the gateway."
- Keeps business logic (consent, audit, data access) standard-agnostic and testable in one place.

### FAPI 2.0 over plain OAuth2
- Plain authorization-code OAuth is insufficient for financial-grade APIs; UK and EU ecosystems mandate FAPI.
- PAR removes request-parameter tampering; DPoP binds tokens to a client key so a stolen bearer token is useless.
- Demonstrating FAPI is the genuinely differentiating signal — most "OAuth demos" stop well short of it.

## Consequences

- More upfront complexity in the auth server, but a far stronger hiring signal and a realistic security posture.
- The canonical model must be designed carefully so no single standard's idiosyncrasies bleed into the core; adapters absorb those quirks.

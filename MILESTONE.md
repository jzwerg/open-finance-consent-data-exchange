# Milestone 1 — Persist the canonical model (Postgres)

The single goal of this milestone: **the canonical account/transaction model lives in
PostgreSQL**, is seeded with mock bank data at boot, and the gateway serves it through
the existing OBIE adapter — reading from the database, not an in-memory array. This is
the foundation every later milestone (auth, consent, audit) builds on. Keep scope tight.

> Previous milestone (first boot) is archived at `docs/milestones/00-first-boot.md`.

## Definition of done
- A **Drizzle** schema + generated migrations define `accounts` and `transactions`
  tables that mirror the **canonical** model (standard-agnostic — *not* an OBIE shape).
- Migrations run **automatically at API startup** (idempotent; safe on every boot) against
  the compose `db` (`postgres:16`), using the existing `DATABASE_URL`.
- Mock bank data is **seeded idempotently** at startup (no duplicate rows on restart).
- A `CanonicalRepository` returns `CanonicalAccount` / `CanonicalTransaction`. The OBIE
  adapter and its mapping tests are **unchanged** — they still map canonical → OBIE.
- `GET /obie/accounts` and `GET /obie/accounts/:accountId/transactions` serve
  **DB-backed** data (the in-memory array is gone from the request path).
- `make up` still brings `db` + `api` + `dashboard` up **healthy**; `make down` tears
  down cleanly; `make test` passes.

## Smoke check (how you know it worked)
- `make up`, then `curl -fsS localhost:8300/obie/accounts` returns the seeded accounts
  in OBIE shape, sourced from Postgres.
- `make down && make up` (a fresh boot) re-seeds **without duplicates** — restart is safe.
- Inspect the DB directly: `docker compose exec db psql -U openfinance -d openfinance -c
  'select id, display_name from accounts;'` lists the seeded accounts.
- `make test` is green (adapter mapping + canonical row-mapping tests).

## Explicitly out of scope (later milestones)
FAPI 2.0 auth (PAR + DPoP), the consent service (scopes/expiry/revocation), the
append-only audit log, the Berlin Group + FDX adapters, live dashboard wiring, and the
token-replay demo. See `PLAN.md`.

## Stack gotchas
- **Keep the schema standard-agnostic.** The tables mirror the canonical model; OBIE (and
  later Berlin Group / FDX) quirks stay in the adapters (see `docs/adr/0001...`).
- **Idempotency twice over:** migrations must be safe to run on every boot, and the seed
  must not duplicate rows on restart (use `on conflict do nothing` / fixed ids).
- **Money keeps precision:** store amounts as `numeric` and surface them as decimal
  **strings** in the canonical model — never floats.
- **No new secrets.** Reuse the `DATABASE_URL` compose already provides; first boot still
  needs nothing external. Migrations gate startup — the API only listens once they apply.
- Use Node `20`, `postgres:16`, and **Drizzle ORM** (no Prisma, no raw-SQL sprawl).

## Shared conventions (portfolio-wide — keep identical across all four repos)
- **Branch:** `claude/product-thinking-repos-cmbegm`.
- **Task interface:** `make up` / `down` / `demo` / `test` / `logs`.
- **First boot needs no secrets** — keys are generated, data is seeded; `.env.example` boots.
- **Compose v2:** `docker compose` (space), not the deprecated `docker-compose`.
- **Host ports:** this project owns the **83xx** range.
- **Validate without a daemon:** `docker compose config -q` parses the stack, `make test`
  runs the DB-free tests, and `tsc` type-checks — but a real boot and the live DB
  round-trip in the smoke check must be verified on a machine with a Docker daemon.

## Paste-ready session kickoff
> Persist the canonical model per `MILESTONE.md`. Add a Drizzle schema + migrations for
> `accounts` and `transactions` mirroring the canonical (standard-agnostic) model; run
> migrations and an idempotent seed at API startup against the compose Postgres. Add a
> `CanonicalRepository` returning canonical types so the OBIE adapter and its tests stay
> unchanged, and make the gateway serve DB-backed data. Don't build auth, consent, the
> audit log, the other adapters, or the replay demo yet. Validate with
> `docker compose config -q`, `make test`, and `tsc`; confirm the smoke check. Commit to
> `claude/product-thinking-repos-cmbegm` and push.

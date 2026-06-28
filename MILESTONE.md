# Milestone 0 — First `docker compose up`

The single goal of this milestone: **`make up` brings the gateway, Postgres, and the
consent dashboard to a healthy state**, serving the canonical model through at least
one adapter. This is *not* the full FAPI flow or the revoke-then-replay demo (those
come later). Keep scope tight.

## Definition of done
- `cp .env.example .env && make up` boots `db`, the `api` (gateway + auth, needs a
  **Node/TS Dockerfile**), and the `dashboard` (a **Vite/React app** under
  `./dashboard` with its own Dockerfile).
- `api` serves a health endpoint on **:8300** and returns canonical account/
  transaction data through **one** adapter (e.g. `GET /obie/accounts`). Signing keys
  are generated at startup.
- The dashboard loads at **:8301**.
- `make down` tears everything down cleanly.

## Smoke check (how you know it worked)
- `curl -fsS localhost:8300/health` → `200`.
- One adapter endpoint returns canonical-mapped mock data.
- The dashboard renders in a browser at `http://localhost:8301`.

## Explicitly out of scope (later milestones)
Full FAPI 2.0 (PAR + DPoP), all three adapters, the consent service (scopes/expiry/
revocation), the append-only audit log, and the token-replay demo. See `PLAN.md`.

## Stack gotchas
- The `dashboard` build context `./dashboard` must exist — create the app there.
- Generate signing keys on startup if absent (write to `FAPI_KEYS_DIR`); don't
  require pre-provisioned secrets for first boot.
- Keep the canonical model standard-agnostic from day one — adapters absorb each
  standard's quirks (see `docs/adr/0001...`).
- Use Node `20` to match CI; `postgres:16` as in compose.

## Shared conventions (portfolio-wide — keep identical across all four repos)
- **Branch:** `claude/product-thinking-repos-cmbegm`.
- **Task interface:** `make up` / `down` / `demo` / `test` / `logs`.
- **First boot needs no secrets** — keys are generated; `.env.example` defaults boot.
- **Compose v2:** `docker compose` (space), not the deprecated `docker-compose`.
- **Host ports:** this project owns the **83xx** range.
- **Validate without a daemon:** `docker compose config -q` parses the stack even
  where Docker can't run (e.g. a Claude Code web session); a real boot must be
  verified on a machine with a Docker daemon.

## Paste-ready session kickoff
> Get this repo to its first `docker compose up` state per `MILESTONE.md`. Add a
> Node/TS Dockerfile and a minimal Fastify gateway with `/health` and one adapter
> endpoint returning canonical-mapped mock data; generate signing keys at startup.
> Create a minimal Vite/React dashboard under `./dashboard` with its own Dockerfile.
> Don't build full FAPI, all adapters, consent revocation, or the replay demo yet.
> Validate with `docker compose config -q`, then confirm the smoke check. Commit to
> `claude/product-thinking-repos-cmbegm` and push.

# Project Overview

## Preliminary Direction

Remove the Next.js layer from the DiffAudit Platform and replace it with a Vite + React SPA served statically, with the auth surface (email/password, 2FA, OAuth, WebAuthn) migrated into the Go gateway, so the product becomes a single-Go-binary container without a Node runtime.

## Current Architecture

```mermaid
flowchart LR
    subgraph Browser
        UI[React SPA components<br/>20 routes]
        MW[Next middleware (proxy.ts)<br/>route guard + demo mode]
    end
    subgraph Next service :3000
        PAGES[Next pages/app router]
        AUTH[Next API routes<br/>auth 12 routes]
        DEMO[Next API routes<br/>demo 2 routes]
        PROXY[Next API routes<br/>/api/v1/* thin proxy]
    end
    subgraph Go gateway :8780
        GO[Read plane + Runtime proxy<br/>DemoJobStore]
    end
    subgraph Data
        SQLITE[(SQLite<br/>drizzle: users/sessions/passkeys/...)]
        SNAPSHOT[(public snapshot dir)]
    end
    UI --> PAGES
    PAGES --> AUTH
    PAGES --> DEMO
    PAGES --> PROXY
    AUTH --> SQLITE
    GO --> SNAPSHOT
    PROXY --> GO
    MW --> PAGES
```

The product is currently deployed in **demo mode**: the Go gateway runs with `--demo-mode=true` serving a seeded `DemoJobStore`, and the frontend's demo data path (`/api/demo/*` + hardcoded TypeScript snapshot) is active. Auth is fully implemented but unused in demo mode.

## Technology Stack

| Layer        | Current                       | Target                          |
|:-------------|:------------------------------|:--------------------------------|
| Language     | TypeScript + Go               | TypeScript + Go (same)          |
| Framework    | Next.js 16.2.11 (React 19)    | React 19 (no meta-framework)    |
| Build Tool   | Next CLI (webpack), standalone output | Vite 7                     |
| Package Mgr  | npm workspaces                | npm workspaces (same)           |
| Database     | SQLite (better-sqlite3 + drizzle) | SQLite (Go driver)          |
| Deployment   | Single Alpine container: Node runtime + Go binary | Single Alpine container: Go binary only |

## Entry Points

- Frontend routes (current, 20): `/` (marketing), `/docs`, `/docs/[...slug]`, `/trial`, workspaces (start/audits/audits:[jobId]/audits:new/model-assets/reports/reports:[track]/risk-findings/settings/account/api-keys), `/login`, `/register`.
- Next API routes (25): `/api/auth/*` (12), `/api/demo/*` (2), `/api/v1/*` (12), health/dev helpers.
- Go gateway routes (GitHub-style REST, 16): `/api/v1/audit/jobs*`, `/api/v1/catalog`, `/api/v1/evidence/attack-defense-table`, `/api/v1/experiments/*`, `/api/v1/models`, `/api/v1/research-boundaries`, `/api/v1/control/runtime`, `/health`.

## Build & Run

- `npm run dev:web` / `build:web` (Next dev/build), `npm run dev:api` (Go run), `npm run test:all` (vitest + playwright), `npm run check:all` (python local checks).
- Container image: multi-stage Dockerfile (web-deps → web-builder → go-builder → Alpine runner) producing one merged container with `start.sh` launching Go API + `node server.js`.

## Testing Baseline

- **Unit/component**: vitest with ~30 spec files (lib modules have paired `.test.ts`, pages have `*.test.tsx`).
- **E2E**: playwright with 4 specs (`smoke`, `user-flows`, `report-flow`, `i18n-navigation`) + fixtures.
- **Go**: `go test ./...` with tests for server, middleware, models in `internal/proxy`.
- Coverage is strong on lib/adapters; e2e currently assumes Next dev server (`next dev`/`next start`); these specs will need retargeting to the Vite preview server.
- Local validation script `scripts/run_local_checks.py --fast` gates commits.

## Project Governance Baseline

- **Single agent entry point**: `apps/web`-level `AGENTS.md` at repo root (Platform); explicit prohibition on per-directory AGENTS.md files.
- **Design authority**: `apps/web/DESIGN.md`; **structure authority**: `docs/project-structure.md`; **deployment authority**: `deploy/README.md`.
- **Public boundary**: `scripts/check_public_boundary.py` (13 rule categories) must pass on every commit.
- **S.U.P.E.R principles**: five principles (Snapshot-first, Unified facades, Public boundary, Explicit SSOT, Reproducible provenance) enforced per module; templates in AGENTS.md Section 1.
- **Agent SOP space**: `.agents/skills/platform-dev/` exists; this planning suite lives under `.agents/planning/`.
- **Memory**: no repo-local memory file; durable facts belong in AGENTS.md / DESIGN.md / project-structure.md.
- **Note**: this monorepo currently has no `docs/progress/MASTER.md`; this is a fresh spec-driven run.

## External Integrations

- **Go gateway** reads `data/public/` snapshot JSON (published by `apps/api-go/scripts/publish_public_snapshot.py`) and optionally proxies to the Runtime service (`/api/v1/audit/*` routes, 3x retry, cache fallback).
- **Next auth** uses OAuth providers (GitHub/Google via `/api/auth/*/callback`), email verification, TOTP 2FA, WebAuthn passkeys against a local SQLite database (better-sqlite3 + drizzle; 6 tables: users, sessions, oauth_accounts, email_verification_tokens, passkeys, two_factor_settings).
- **Container image** is published to GHCR with immutable `sha-<short-sha>` tags; provenance labels and `scripts/verify_image_provenance.py` gate releases.

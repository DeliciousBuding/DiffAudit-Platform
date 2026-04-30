# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

DiffAudit Platform is the product-facing web application for DiffAudit, a privacy-risk audit system for ML models. It is a public, Apache-2.0 licensed monorepo. The companion research system lives in a separate repository (`DiffAudit-Research`).

**Also read `AGENTS.md` at the repo root** — it contains mandatory guardrails for public-safety, sensitive information, structural governance, and validation requirements that apply to every change.

## Commands

```bash
# Install
npm --prefix apps/web install

# Dev
npm run dev:web          # Next.js at http://localhost:3000
npm run dev:api          # Go gateway at http://127.0.0.1:8780

# Build
npm run build:web        # next build --webpack
npm run build:api        # go build ./cmd/platform-api

# Test
npm run test:web         # vitest run (web app)
npm run test:api         # go test ./... (Go gateway)

# Single test file
npx vitest run src/lib/auth.test.ts        # from apps/web/
go test ./internal/proxy/ -run TestHealth  # from apps/api-go/

# Lint / Format
npm run lint:web         # eslint
npm run lint:api         # gofmt -l apps/api-go
npm run format:api       # gofmt -w apps/api-go

# Full validation (mirrors CI)
python scripts/run_local_checks.py         # all checks
python scripts/run_local_checks.py --fast  # skip builds
python scripts/check_public_boundary.py    # scan for leaked secrets/paths
```

## Architecture

### Monorepo Layout

- `apps/web/` — Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4
- `apps/api-go/` — Go API gateway, stdlib only (zero external dependencies)
- `packages/shared/` — Shared contract examples and prompt templates
- `deploy/` — Docker Compose templates with placeholder env vars
- `scripts/` — Repo-level validation and helper scripts

### Data Flow

```
Browser → Next.js Middleware (auth guard, locale propagation)
       → App Router Server Components
       → lib/workspace-source.ts (demo/live mode facade)
       → lib/catalog.ts, lib/attack-defense-table.ts
       → lib/api-proxy.ts → Go Gateway (:8780) → data/public/*.json snapshots
```

- **Demo mode (default):** All data served from `lib/demo-snapshot.ts` — no network calls.
- **Live mode:** Next.js API routes proxy through to the Go gateway, which serves pre-generated JSON snapshots from `apps/api-go/data/public/`.
- **Runtime proxy:** Control-plane routes (audit jobs) can optionally forward to an upstream Runtime service.

### Route Groups

- `(marketing)/` — Public: landing (`/`), docs (`/docs/[...slug]`), trial (`/trial`)
- `(auth)/` — Login (`/login`), register (`/register`)
- `(workspace)/` — Authenticated workspace: dashboard, audits, reports, account, settings
- `api/` — Next.js Route Handlers: auth (`/api/auth/*`), data proxies (`/api/v1/*`), demo (`/api/demo/*`)

### Auth

Custom implementation (no NextAuth). Session cookie `diffaudit_session` (httpOnly, 12h). SQLite via Drizzle ORM (6 tables: users, sessions, oauth_accounts, email_verification_tokens, passkeys, two_factor_settings). Supports password auth, GitHub/Google OAuth, WebAuthn passkeys, and TOTP 2FA.

### i18n

Custom bilingual (en-US / zh-CN). All UI strings live in `lib/workspace-copy.ts` (~1900 lines). Locale stored in cookie `platform-locale-v2`, propagated via middleware header. Components accept a `locale` prop.

### Go Gateway

Single-file server (`apps/api-go/internal/proxy/server.go`) using Go 1.22+ `http.ServeMux` with method-based routing. Two endpoint types: snapshot-backed read routes and optional Runtime-proxied control-plane routes. Retry with exponential backoff, cache fallback, CORS middleware.

## Key Conventions

- **Source-of-truth discipline:** Navigation, labels, status/risk mapping, and data mode selection each have exactly one authoritative file defined in `docs/project-structure.md`. Do not create duplicates.
- **Workspace route components must not import `catalog`, `attack-defense-table`, or `demo-mode` directly.** Go through `workspace-source` facade.
- **Public boundary:** Never commit secrets, private hostnames, local paths, or raw exception strings. Use `research://...` logical identifiers for snapshot paths. Run `python scripts/check_public_boundary.py` before committing.
- **Demo mode is a data mode, not a page shortcut.** Pages consume the same facade-backed view models in both demo and live modes.
- **UI primitives:** Prefer existing `Button`, `Card`, `Tabs`, `Modal`, `Badge`, `WorkspacePageFrame`, `WorkspaceSectionCard` over one-off page chrome. Do not add broad global CSS selectors.
- **Legacy routes** (redirect-only route groups) must not gain new product logic.
- **Tests are colocated** with source files as `.test.ts` / `.test.tsx`.
- **Pre-commit hooks** run via `.pre-commit-config.yaml` (merge-conflict check, YAML validation, trailing whitespace, `check_public_boundary.py --fast`).

## Environment Variables

Key variables (see `apps/web/.env.example` for full list):
- `DIFFAUDIT_DEMO_MODE` / `DIFFAUDIT_FORCE_DEMO_MODE` — control demo vs live data
- `DIFFAUDIT_DB_PATH` — SQLite database location
- `DIFFAUDIT_API_BASE_URL` — Go gateway URL (default `http://127.0.0.1:8780`)
- `DIFFAUDIT_SHARED_USERNAME` / `DIFFAUDIT_SHARED_PASSWORD` — legacy shared user credentials
- `DIFFAUDIT_GITHUB_CLIENT_ID` / `DIFFAUDIT_GITHUB_CLIENT_SECRET` — GitHub OAuth
- `DIFFAUDIT_GOOGLE_CLIENT_ID` / `DIFFAUDIT_GOOGLE_CLIENT_SECRET` — Google OAuth

## CI

GitHub Actions (`ci.yml`) runs on push to `main` and all PRs:
1. `public-boundary` — Python 3.12, scans for leaked secrets/paths
2. `web` — Node 22, lint + test + build
3. `api-go` — Go (version from go.mod), test + build

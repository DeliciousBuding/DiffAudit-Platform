# DiffAudit Platform

Monorepo for the first platformized version of DiffAudit.

This repo is intentionally separate from the research repo:

- sibling research repo `../Project`: algorithms, experiments, datasets, papers
- this repo `./`: product shell, API layer, frontend, integration docs

## Structure

```text
apps/
  web/      Next.js frontend
  api-go/   active Go backend gateway
  api/      legacy FastAPI stub retained for historical reference
packages/
  shared/   shared contracts and copyable prompts
docs/       architecture and integration docs
scripts/    helper scripts
```

## First release scope

The first release is a platform shell, not the final product.

It focuses on:

- a stable frontend structure in Next.js
- a small Go backend gateway
- a minimal audit job contract
- wiring to the existing research repo later

The active platform backend now proxies to the research local API and does not run research jobs directly.

## Quick start

### Frontend

```powershell
cd <platform-repo>
npm --prefix apps/web install
npm run dev:web
```

Frontend gateway variables:

```powershell
copy apps\web\.env.example apps\web\.env.local
```

- `DIFFAUDIT_SESSION_TOKEN`: opaque session cookie value
- `DIFFAUDIT_PORTAL_URL`: Portal login origin, defaults to `http://localhost:3001`
- `DIFFAUDIT_PLATFORM_URL`: public workbench origin, defaults to `http://localhost:3000`
- `DIFFAUDIT_API_BASE_URL`: internal backend URL, defaults to `http://127.0.0.1:8780`

### Backend

```powershell
cd <platform-repo>
npm run dev:api
```

`npm run dev:api` starts the active `apps/api-go` gateway. The legacy
`apps/api` FastAPI stub is not part of the active runtime path.

### Local URLs

- web: `http://localhost:3000`
- api: `http://localhost:8780`

## Development rules

- Keep the platform repo thin; do not copy algorithm code from the research repo.
- Add new audit methods behind clear API contracts first.
- Prefer stable wrappers over deep coupling to the research repo internals.
- Keep the first production path focused on `Stable Diffusion + DDIM recon`.
- `Platform` is a shared collaboration repo. Write docs and handoffs so they work for other people and agents, not just one machine.
- Do not implement features directly in the shared root worktree.
- Use dedicated git worktrees for all implementation tasks.
- Treat the root worktree as integration-only.
- See `AGENTS.md`, `docs/worktree-collaboration.md`, and `docs/merge-playbook.md`.

## CI

GitHub Actions checks:

- Next.js lint / test / build
- Go gateway tests / build
- legacy FastAPI stub ruff / pytest

The legacy `apps/api` FastAPI stub is kept as a historical reference and is not
the active release path, but it is still kept green as a maintained compatibility
surface.

## Deploy Handoff

Deployment and runtime handoff notes live in `docs/public-runtime-handoff.md`.
The executable ops checklist lives in `docs/public-runtime-runbook.md`.

Use that document as the source of truth for:

- active backend ownership
- public edge probe expectations
- private service probe commands
- external dependencies that are not versioned in this repo

## Integration direction

Phase 1:

- backend proxies minimal audit job endpoints
- backend forwards to the local research-facing API service
- frontend consumes job status and result payloads

Phase 2:

- add persistent job store
- add auth / gateway layer
- move long-running compute off the local workstation if needed

## Portal-Owned Login

The current public preview uses Portal as the only login owner:

- Portal issues the shared `HttpOnly` session cookie
- `apps/web` only validates the shared cookie and protects workbench routes
- unauthenticated workbench access redirects to Portal `/login`
- the private platform API behind that gateway remains `apps/api-go`

### Public Probe Boundary

- `/health` and `/api/v1/*` are application routes behind the shared-login
  boundary and should not be treated as anonymous public probe endpoints
- the shortest stable public canary path is `GET /login`, but it still depends
  on external Cloudflare challenge policy
- the stable service probes are private checks on the origin machine, not
  anonymous internet checks

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

Temporary login variables for the frontend:

```powershell
copy apps\web\.env.example apps\web\.env.local
```

- `DIFFAUDIT_SHARED_USERNAME`: shared preview username
- `DIFFAUDIT_SHARED_PASSWORD`: shared preview password
- `DIFFAUDIT_SESSION_TOKEN`: opaque session cookie value
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

- Next.js lint
- Go gateway tests
- Go gateway build

The legacy `apps/api` FastAPI stub is kept as a historical reference and is not
the active release gate.

## Integration direction

Phase 1:

- backend proxies minimal audit job endpoints
- backend forwards to the local research-facing API service
- frontend consumes job status and result payloads

Phase 2:

- add persistent job store
- add auth / gateway layer
- move long-running compute off the local workstation if needed

## Temporary Preview Auth

The current public preview uses a shared temporary login implemented in Next.js:

- `/login` issues an `HttpOnly` cookie after validating the shared credentials
- proxy protection covers platform pages and the public `/api/v1/*` routes
- public ingress should send all requests to the Next.js app
- the private platform API behind that proxy is the `apps/api-go` gateway


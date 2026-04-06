# DiffAudit Platform

Monorepo for the first platformized version of DiffAudit.

This repo is intentionally separate from the research repo:

- `D:\Code\DiffAudit\Project`: algorithms, experiments, datasets, papers
- `D:\Code\DiffAudit\Platform`: product shell, API layer, frontend, integration docs

## Structure

```text
apps/
  web/      Next.js frontend
  api/      legacy FastAPI stub
  api-go/   Go backend gateway
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
cd D:\Code\DiffAudit\Platform
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
- `DIFFAUDIT_API_BASE_URL`: internal backend URL, defaults to `http://127.0.0.1:8000`

### Backend

```powershell
cd D:\Code\DiffAudit\Platform
npm run dev:api
```

### Local URLs

- web: `http://localhost:3000`
- api: `http://localhost:8000`
- api docs: `http://localhost:8000/docs`

## Development rules

- Keep the platform repo thin; do not copy algorithm code from the research repo.
- Add new audit methods behind clear API contracts first.
- Prefer stable wrappers over deep coupling to the research repo internals.
- Keep the first production path focused on `Stable Diffusion + DDIM recon`.

## CI

GitHub Actions checks:

- Next.js lint
- FastAPI lint
- FastAPI tests

## Integration direction

Phase 1:

- backend proxies minimal audit job endpoints
- backend forwards to `D:\Code\DiffAudit\Project\tools\local-api-go`
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
- FastAPI stays on the private side and is consumed through the frontend proxy layer

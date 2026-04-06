# DiffAudit Platform

Monorepo for the first platformized version of DiffAudit.

This repo is intentionally separate from the research repo:

- `D:\Code\DiffAudit\Project`: algorithms, experiments, datasets, papers
- `D:\Code\DiffAudit\Platform`: product shell, API layer, frontend, integration docs

## Structure

```text
apps/
  web/      Next.js frontend
  api/      FastAPI backend
packages/
  shared/   shared contracts and copyable prompts
docs/       architecture and integration docs
scripts/    helper scripts
```

## First release scope

The first release is a platform shell, not the final product.

It focuses on:

- a stable frontend structure in Next.js
- a small FastAPI backend
- a minimal audit job contract
- wiring to the existing research repo later

The first API implementation is a stub and does not yet run the real audit job.

## Quick start

### Frontend

```powershell
cd D:\Code\DiffAudit\Platform
npm --prefix apps/web install
npm run dev:web
```

### Backend

```powershell
cd D:\Code\DiffAudit\Platform
uv sync --directory apps/api
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

- backend exposes minimal audit job endpoints
- backend later shells out to `D:\Code\DiffAudit\Project`
- frontend consumes job status and result payloads

Phase 2:

- add persistent job store
- add auth / gateway layer
- move long-running compute off the local workstation if needed

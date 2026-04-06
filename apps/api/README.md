# DiffAudit Platform API

FastAPI backend for the platform shell.

This service currently provides:

- health endpoint
- model catalog endpoint
- minimal audit job endpoints

The first release returns stubbed job records so the platform can finish API integration
before the real research pipeline is wired in.

## Current Integration Mode

The real local research execution now lives in the research repo:

- [Project/docs/local-api.md](D:\Code\DiffAudit\Project\docs\local-api.md)

Local research API default base URL:

- `http://127.0.0.1:8765`

Recommended integration flow for the platform:

1. Read model choices from `GET /api/v1/models`
2. Read the current strongest `recon` evidence from `GET /api/v1/experiments/recon/best`
3. Submit controlled local jobs to `POST /api/v1/audit/jobs`
4. Poll `GET /api/v1/audit/jobs/{job_id}`

Until this platform app switches from stubbed routes to proxy mode, treat the research repo
local API as the source of truth for local execution.

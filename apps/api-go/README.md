# DiffAudit Platform Go API

Primary backend gateway for the platform shell.

This service proxies platform API calls to the local research control plane in:

- `D:\Code\DiffAudit\Services\Local-API`

Default upstream:

- `http://127.0.0.1:8765`

## Run

```powershell
cd D:\Code\DiffAudit\Platform\apps\api-go
go run ./cmd/platform-api --host 127.0.0.1 --port 8000 --research-api-base-url http://127.0.0.1:8765
```

## Covered Routes

- `GET /health`
- `GET /api/v1/models`
- `GET /api/v1/experiments/recon/best`
- `GET /api/v1/audit/jobs`
- `POST /api/v1/audit/jobs`
- `GET /api/v1/audit/jobs/{job_id}`

## Boundary

This service is a platform gateway only.

- It does not run research jobs directly.
- It does not shell out to Python.
- It forwards to the research local API, which then manages job execution.


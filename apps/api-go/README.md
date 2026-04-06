# DiffAudit Platform Go API

Primary backend gateway for the platform shell.

This service proxies platform API calls to the local research control plane service.

Default upstream:

- `http://127.0.0.1:8765`

## Run

Start the local research control plane first:

```powershell
powershell -ExecutionPolicy Bypass -File D:\Code\DiffAudit\Services\Local-API\run-local-api.ps1
```

Then start the platform gateway on its default port:

```powershell
powershell -ExecutionPolicy Bypass -File D:\Code\DiffAudit\Platform\apps\api-go\run-platform-api.ps1
```

Equivalent explicit form:

```powershell
powershell -ExecutionPolicy Bypass -File D:\Code\DiffAudit\Platform\apps\api-go\run-platform-api.ps1 `
  -ListenHost 127.0.0.1 `
  -ListenPort 8780 `
  -ResearchAPIBaseURL http://127.0.0.1:8765
```

Default listen port is `8780` so the gateway does not collide with the unrelated local service already occupying `8000` on this workstation.

If `8780` is already occupied too, the script exits with a clear warning instead of silently fighting another local service.

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


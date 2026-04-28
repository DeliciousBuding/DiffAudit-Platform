# DiffAudit Platform Go API

`apps/api-go` is the platform gateway. It serves snapshot-backed read endpoints and can optionally proxy audit control-plane calls to a configured Runtime service.

## Run Locally

Start the gateway with defaults:

```powershell
powershell -ExecutionPolicy Bypass -File .\apps\api-go\run-platform-api.ps1
```

Equivalent explicit form:

```powershell
powershell -ExecutionPolicy Bypass -File .\apps\api-go\run-platform-api.ps1 `
  -ListenHost 127.0.0.1 `
  -ListenPort 8780 `
  -PublicDataDir .\apps\api-go\data\public `
  -RuntimeBaseURL http://127.0.0.1:8765
```

The default listen port is `8780`.

## Refresh Snapshot Data

```powershell
py -3 .\apps\api-go\scripts\publish_public_snapshot.py `
  --runtime-base-url http://127.0.0.1:8765 `
  --research-root ..\Research `
  --output-dir .\apps\api-go\data\public
```

When the Runtime control plane is unavailable during publishing, the publisher can reuse existing snapshot files and optionally read admitted evidence from a local Research checkout. This is a publish-time fallback only. Request-time API routes remain snapshot-backed.

## Routes

Snapshot-backed read routes:

- `GET /health`
- `GET /api/v1/catalog`
- `GET /api/v1/evidence/attack-defense-table`
- `GET /api/v1/models`
- `GET /api/v1/experiments/recon/best`
- `GET /api/v1/experiments/{workspace}/summary`

Optional live control-plane routes:

- `GET /api/v1/audit/jobs`
- `POST /api/v1/audit/jobs`
- `GET /api/v1/audit/jobs/{job_id}`
- `DELETE /api/v1/audit/jobs/{job_id}`
- `GET /api/v1/audit/job-template`

## Boundary

This service is a gateway only:

- it does not run research jobs directly;
- it does not shell out to Python during public requests;
- it serves workspace read models from the configured snapshot bundle;
- it forwards only audit control-plane calls to Runtime, and only when that upstream is configured.

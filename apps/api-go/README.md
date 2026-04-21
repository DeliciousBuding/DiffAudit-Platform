# DiffAudit Platform Go API

Primary backend gateway for the platform shell.

This service now has two responsibilities:

- serve snapshot-backed public read endpoints for the workspace
- proxy audit control-plane calls to the live `Runtime`

Default Runtime upstream:

- `http://127.0.0.1:8765`

Default public snapshot directory:

- `./data/public`

## Run

Then start the platform gateway on its default port:

```powershell
powershell -ExecutionPolicy Bypass -File D:\Code\DiffAudit\Platform\apps\api-go\run-platform-api.ps1
```

Equivalent explicit form:

```powershell
powershell -ExecutionPolicy Bypass -File D:\Code\DiffAudit\Platform\apps\api-go\run-platform-api.ps1 `
  -ListenHost 127.0.0.1 `
  -ListenPort 8780 `
  -PublicDataDir D:\Code\DiffAudit\Platform\apps\api-go\data\public `
  -RuntimeBaseURL http://127.0.0.1:8765
```

Default listen port is `8780` so the gateway does not collide with the unrelated local service already occupying `8000` on this workstation.

If `8780` is already occupied too, the script exits with a clear warning instead of silently fighting another local service.

Refresh the public snapshot bundle before a public deploy:

```powershell
py -3 D:\Code\DiffAudit\Platform\apps\api-go\scripts\publish_public_snapshot.py `
  --runtime-base-url http://127.0.0.1:8765 `
  --research-root D:\Code\DiffAudit\Research `
  --output-dir D:\Code\DiffAudit\Platform\apps\api-go\data\public
```

If the local Runtime control plane is temporarily unavailable, the publisher can:

- reuse existing `catalog.json` / `models.json` / `summaries/*`
- direct-sync `attack-defense-table.json` from `Research/workspaces/implementation/artifacts/unified-attack-defense-table.json`

This is a **publish-time fallback only**. Public read routes still remain snapshot-backed and must not fall back to live Runtime requests during serving.

## Covered Routes

Snapshot-backed read routes:

- `GET /health`
- `GET /api/v1/catalog`
- `GET /api/v1/evidence/attack-defense-table`
- `GET /api/v1/models`
- `GET /api/v1/experiments/recon/best`
- `GET /api/v1/experiments/{workspace}/summary`

Live control-plane routes:

- `GET /api/v1/audit/jobs`
- `POST /api/v1/audit/jobs`
- `GET /api/v1/audit/jobs/{job_id}`
- `GET /api/v1/audit/job-template`

Job creation bodies are passed through unchanged and should follow the Runtime
contract, including the required `contract_key`. Contract-specific payload
fields should live under `job_inputs`; `runtime_profile` and `assets` may also
be present for docker-first execution flows. The gateway does not interpret
method-specific fields and forwards them unchanged.

Snapshot-backed read routes must not fall back to the live control plane. If the
snapshot bundle is missing, these routes return `503 snapshot unavailable`.

## Boundary

This service is a platform gateway only.

- It does not run research jobs directly.
- It does not shell out to Python during public requests.
- It serves workspace read models from the committed/deployed snapshot bundle.
- It forwards only audit control-plane calls to the live `Runtime`.


# Platform Go API Proxy Design

## Goal

Replace `Platform/apps/api` with a Go proxy service that fronts the local research control plane in `Services/Local-API`.

This sub-project is intentionally narrow:

- migrate only the platform API/backend gateway to Go
- do not migrate `apps/web`
- do not bypass the research local API
- do not call Python research commands directly from the platform layer

## Why This Scope

The platform API should behave like a thin gateway:

- expose platform-facing endpoints
- forward selected requests to the local research API
- adapt payloads only when the platform contract differs

The actual research execution and summary aggregation already belong to the `Project` repo. Keeping that boundary avoids re-coupling platform code to research internals.

## Chosen Architecture

Introduce a standalone Go service under `apps/api-go/` and treat it as the new platform API.

Flow:

1. frontend or local clients call `Platform` Go API
2. `Platform` Go API calls `Project` local Go API over HTTP
3. `Project` local Go API continues to manage jobs and call Python research CLI

## Rejected Alternatives

### Keep Python FastAPI and only add proxy calls

Rejected because the stated goal is to reduce platform resident overhead and converge the control plane to Go.

### Let platform Go call Python research commands directly

Rejected because that would collapse the platform/research boundary and duplicate job execution logic in the wrong repo.

### Merge platform API into the research API

Rejected because the platform still needs its own gateway responsibility and future room for platform-specific auth or request shaping.

## Directory Layout

New code lives under:

- `apps/api-go/go.mod`
- `apps/api-go/cmd/platform-api/main.go`
- `apps/api-go/internal/...`

The existing Python `apps/api` remains in the repo temporarily as a legacy implementation until the Go proxy is verified, but it should stop being the preferred runtime path.

## External Dependency

The Go proxy depends on the research local API being reachable, defaulting to:

- `http://127.0.0.1:8765`

This must be configurable through environment or flags.

## Platform API Contract

The new Go service must cover the platform endpoints that matter now:

- `GET /health`
- `GET /api/v1/models`
- `GET /api/v1/experiments/recon/best`
- `GET /api/v1/audit/jobs`
- `POST /api/v1/audit/jobs`
- `GET /api/v1/audit/jobs/{job_id}`

If the current platform schema differs from the research schema, the proxy layer must make the translation explicit rather than leaking research internals into the frontend accidentally.

## Contract Strategy

Prefer converging the platform contract to the research local API contract instead of maintaining two incompatible shapes.

That means the Go platform proxy should speak in terms of:

- `job_type`
- `workspace_name`
- `artifact_dir`
- runtime-CLI-compatible job payloads

This is a better long-term boundary than preserving the current Python stub shape of:

- `model_key`
- `audit_method`
- `image_name`

## Configuration

The Go proxy needs at least:

- listen host
- listen port
- research API base URL

Optional future settings such as auth secrets should remain outside this migration unless already required by existing platform behavior.

## Error Handling

### Research API unavailable

Return `502 Bad Gateway` with a direct message that the local research API is unreachable.

### Upstream 4xx responses

Pass through status code and detail payload whenever possible.

### Upstream 5xx responses

Return `502` or `503` at the platform layer with the upstream detail preserved in the body when safe.

## Testing Plan

Use Go tests with `httptest`.

Minimum coverage:

- health endpoint
- forwarding of model list
- forwarding of best `recon` summary
- forwarding of job list
- forwarding of job creation
- forwarding of job detail
- upstream failure mapping to gateway errors

Use stub upstream servers instead of requiring a live research service during tests.

## Rollout Plan

1. scaffold the Go proxy
2. add upstream client tests first
3. implement route forwarding
4. document Go as the primary platform API runtime
5. keep Python `apps/api` only as a temporary fallback until the Go proxy is accepted

## Acceptance Criteria

- platform API runs as Go service
- platform routes successfully proxy to the research local API
- current platform-relevant endpoints are covered
- gateway errors are explicit when the research service is down
- `apps/web` can switch to the Go platform API without another backend redesign


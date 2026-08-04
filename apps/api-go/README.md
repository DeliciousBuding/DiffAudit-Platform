# DiffAudit Platform Go API Gateway

`apps/api-go` is the platform gateway — a Go HTTP server that serves snapshot-backed read endpoints, proxies audit control-plane calls to a configured Runtime service, and hosts a built-in demo mode with time-based job state progression.

## Quick Start

```powershell
# Start with defaults (demo mode, port 8780)
go -C ./apps/api-go run ./cmd/platform-api

# Or use the helper script
python .\apps\api-go\run-platform-api.py

# Explicit configuration
go -C ./apps/api-go run ./cmd/platform-api \
  --host 127.0.0.1 \
  --port 8780 \
  --demo-mode=true \
  --public-data-dir ./apps/api-go/data/public
```

Health check:

```powershell
curl http://127.0.0.1:8780/health
```

## Route Inventory

### Snapshot-Backed Read Routes

These routes serve pre-generated public snapshot data from `data/public/`. They never contact Runtime at request time.

| Method | Path | Description | Demo/Live |
|--------|------|-------------|-----------|
| `GET` | `/health` | Gateway health, snapshot availability, Runtime config status, build info | Always live |
| `GET` | `/api/v1/control/runtime` | Runtime connectivity status (health-checks upstream with 3x retry) | Always live; returns `demo` status when `--demo-mode=true` |
| `GET` | `/api/v1/catalog` | Full audit contract catalog (`catalog.json`) | Snapshot |
| `GET` | `/api/v1/evidence/attack-defense-table` | Attack-defense evaluation results | Snapshot |
| `GET` | `/api/v1/models` | Model inventory (`models.json`) | Snapshot |
| `GET` | `/api/v1/experiments/recon/best` | Best summary for a contract (default: `black-box/recon/sd15-ddim`). Query: `?contract_key=...` | Snapshot |
| `GET` | `/api/v1/experiments/best` | Alias for `/experiments/recon/best` | Snapshot |
| `GET` | `/api/v1/experiments/{workspace}/summary` | Workspace-specific summary from `summaries/{workspace}.json` | Snapshot |

Snapshot-unavailable responses return HTTP 503 with `{"detail": "snapshot unavailable"}`. Invalid catalog payloads return HTTP 502.

### Control-Plane Routes (Runtime Proxy)

These routes proxy to the configured Runtime service. In demo mode, they use the built-in `DemoJobStore` instead.

| Method | Path | Demo behavior | Live behavior |
|--------|------|---------------|---------------|
| `GET` | `/api/v1/audit/job-template` | Returns static demo template with `black-box/recon/sd15-ddim` | Proxies to Runtime |
| `GET` | `/api/v1/audit/jobs` | Returns 6 pre-seeded demo jobs with time-based state progression | Proxies to Runtime |
| `POST` | `/api/v1/audit/jobs` | Creates a demo job (state: `queued`, progresses 2%/s) | Proxies to Runtime |
| `GET` | `/api/v1/audit/jobs/{jobID}` | Returns specific demo job by ID | Proxies to Runtime |
| `DELETE` | `/api/v1/audit/jobs/{jobID}` | Marks demo job as `cancelled` | Proxies to Runtime |
| `GET` | `/api/v1/research-boundaries` | Returns `unavailable` payload with demo flag | Proxies to Runtime; returns `unavailable` on failure |

When Runtime is unreachable during live proxy, the gateway returns HTTP 503 with a generic error hint — never raw hostnames, ports, or stack traces. Cache fallback is attempted for GET requests when available.

### Proxy Safety

- **Retry**: `doWithRetry` retries GET/HEAD requests up to 3 times with 1s delay on transient errors (timeout, connection refused, connection reset, DNS failures). POST/PUT/DELETE are never retried (body consumed on first attempt).
- **Timeout**: Default 15s, configurable via `Config.RuntimeTimeout`.
- **Error classification**: `isRetryableError` uses `net.Error` type checks, not fragile string matching.
- **Cache fallback**: When Runtime is down, GET requests attempt to serve cached snapshots from `data/public/cache/`.

## Demo Mode

Demo mode is the gateway's default operating mode (`--demo-mode=true`). It enables a fully self-contained experience without any Runtime dependency.

### DemoJobStore

Thread-safe in-memory store (`internal/proxy/models.go`) with 6 pre-seeded jobs:

| Job ID | Status | Contract | Track |
|--------|--------|----------|-------|
| `demo-job-001` | completed | `black-box/recon/sd15-ddim` | black-box |
| `demo-job-002` | completed | `gray-box/pia/sd15-ddim` | gray-box |
| `demo-job-003` | running (67%) | `white-box/gsa/sd15-ddim` | white-box |
| `demo-job-004` | running (23%) | `black-box/recon/pixelart-v2` | black-box |
| `demo-job-005` | failed | `gray-box/pia/photoreal-xl` | gray-box |
| `demo-job-006` | cancelled | `white-box/gsa/medmnist-derma-v3` | white-box |

Running jobs progress at 2% per second from their `created_at` timestamp. At 100%, they auto-complete with synthetic metrics (AUC: 0.651, ASR: 0.187, TPR: 0.142).

### Job Creation Validation

`DemoJobStore.Create` validates inputs:
- `contract_key` and `workspace_name`: max 256 chars, printable UTF-8, no control characters except tab/newline
- `job_type`: max 128 chars, same character constraints
- Returns `nil` (HTTP 400) for invalid inputs

### Model and Track Inference

Job creation infers `target_model` and `track` from `contract_key`:
- `sd15-ddim` → `stable-diffusion-v1-4`
- `pixelart` → `pixelart-v2`
- `photoreal` → `photoreal-xl`
- `medmnist` → `medmnist-derma-v3`
- `audio-diffusion` → `audio-diffusion-s`
- Track: `recon` → `black-box`, `pia` → `gray-box`, `gsa` → `white-box`

### Frontend Independence

The frontend has its own demo mode (`apps/web/src/lib/demo-snapshot.ts`). When `DIFFAUDIT_DEMO_MODE=1`, the frontend serves hardcoded TypeScript demo data without calling the Go gateway. To use Go demo data in the browser, set `DIFFAUDIT_DEMO_MODE=0` and ensure the gateway runs with `--demo-mode=true`. This dual-layer design is intentional — each layer is self-contained so either can run standalone.

## Snapshot Publisher

The Python script `scripts/publish_public_snapshot.py` generates the public snapshot bundle at `data/public/` through a 4-tier fallback chain:

| Tier | Source | When used |
|------|--------|-----------|
| 1. Runtime HTTP | Live Runtime control plane | Primary — fetches catalog, models, attack-defense table |
| 2. Curated bundle | `admitted-evidence-bundle.json` from Research | Preferred fallback — Research-blessed contract with boundary metadata |
| 3. Unified table | `unified-attack-defense-table.json` from Research | Legacy fallback — used when curated bundle is absent |
| 4. Existing snapshot | Previously written Platform snapshot files | Last resort — reuses existing `data/public/` files |

### Usage

```powershell
# Full invocation
py -3 .\apps\api-go\scripts\publish_public_snapshot.py \
  --runtime-base-url http://127.0.0.1:8765 \
  --research-root ..\Research \
  --output-dir .\apps\api-go\data\public

# With explicit curated bundle path (decouples sibling-directory assumption for CI/Docker)
py -3 .\apps\api-go\scripts\publish_public_snapshot.py \
  --bundle-path /path/to/admitted-evidence-bundle.json \
  --output-dir .\apps\api-go\data\public

# Via npm script
npm run publish:public-snapshot
```

### Sanitization

The publisher sanitizes all data before writing:
- Local filesystem paths → `research://...` logical identifiers
- Private workspace names → logical artifact identifiers
- Invalid `catalog` or `models` payloads → replaced with empty lists (warning recorded in `manifest.json`)
- Invalid attack-defense tables → replaced with empty `diffaudit.attack_defense_table.v1` table
- All replacements recorded in `manifest.json` warnings

### Output Files

| File | Content |
|------|---------|
| `catalog.json` | Audit contract catalog entries |
| `models.json` | Model inventory |
| `attack-defense-table.json` | Attack-defense evaluation rows |
| `manifest.json` | Publish metadata: warnings, fallback tier used, timestamps |
| `summaries/*.json` | Per-workspace evidence summaries |
| `specs/` | Formal contract, evidence, and runner interface specifications |

## Environment Variables

All gateway configuration is passed via CLI flags or environment variables:

| Variable | Flag | Default | Description |
|----------|------|---------|-------------|
| `DIFFAUDIT_PUBLIC_DATA_DIR` | `--public-data-dir` | `apps/api-go/data/public` | Path to public snapshot bundle |
| `DIFFAUDIT_RUNTIME_BASE_URL` | `--runtime-base-url` | (empty) | Runtime service URL; empty = control plane unavailable |
| `DIFFAUDIT_CORS_ALLOWED_ORIGINS` | (via config) | `http://localhost:3000` | CORS allowed origins (comma-separated) |
| — | `--host` | `127.0.0.1` | Listen host |
| — | `--port` | `8780` | Listen port |
| — | `--demo-mode` | `true` | Enable built-in demo job store |

Build metadata (injected at compile time via Dockerfile ARGs):
- `DIFFAUDIT_BUILD_REVISION` — Git revision
- `DIFFAUDIT_BUILD_DATE` — Build timestamp

## Docker

### Build

```powershell
# From repository root
docker build -f .\apps\api-go\Dockerfile -t diffaudit-platform-api:local .
```

The multi-stage Dockerfile:
1. **Builder** (`golang:1.26.1-bookworm`): downloads modules, compiles static binary (`CGO_ENABLED=0`)
2. **Runner** (`debian:bookworm-slim`): minimal image with OCI labels

OCI labels on the final image:
```
org.opencontainers.image.title="DiffAudit Platform API"
org.opencontainers.image.description="Snapshot-backed Go gateway for DiffAudit Platform"
org.opencontainers.image.source="${IMAGE_SOURCE}"
org.opencontainers.image.revision="${VCS_REF}"
org.opencontainers.image.created="${BUILD_DATE}"
org.opencontainers.image.licenses="Apache-2.0"
```

### Run

```powershell
docker run -p 8780:8780 \
  -v .\apps\api-go\data\public:/app/data/public \
  diffaudit-platform-api:local \
  --host 0.0.0.0 --port 8780 --public-data-dir /app/data/public
```

### GHCR

Published images at `ghcr.io/deliciousbuding/diffaudit-platform-api`:
- `sha-<short-sha>` — immutable revision pin (preferred for production)
- `main` — current default branch
- `latest` — convenience tag

Verify provenance:

```powershell
docker image inspect ghcr.io/deliciousbuding/diffaudit-platform-api:sha-1c9d67d \
  --format '{{ index .Config.Labels "org.opencontainers.image.revision" }}'
```

## Project Structure

```
apps/api-go/
  cmd/
    platform-api/          # Main entry point (flag parsing, CORS, server startup)
  internal/
    proxy/
      server.go            # Route registration, handler implementations, retry logic
      server_test.go       # Route handler tests
      models.go            # Typed models + DemoJobStore
      models_test.go       # DemoJobStore unit tests (15 tests)
      middleware.go         # CORS, logging middleware
      middleware_test.go    # Middleware tests (5 tests)
  data/
    public/                # Snapshot bundle (generated, not committed as runtime artifact)
      catalog.json
      models.json
      attack-defense-table.json
      manifest.json
      summaries/
      specs/               # Formal contract specifications
  scripts/
    publish_public_snapshot.py      # 4-tier fallback snapshot publisher
    test_publish_public_snapshot.py # Publisher unit tests (4 tests)
  Dockerfile              # Multi-stage production build
  run-platform-api.ps1    # Local dev helper script
  go.mod
```

## Test Commands

```powershell
# Run all Go tests (66 tests: models, server, middleware)
go -C ./apps/api-go test ./...

# Run with verbose output
go -C ./apps/api-go test -v ./...

# Run tests for a specific package
go -C ./apps/api-go test ./internal/proxy/...

# Run a specific test
go -C ./apps/api-go test -run TestDemoJobStore_Create ./internal/proxy/...

# Run Python publisher tests
py -3 -m unittest apps.api-go.scripts.test_publish_public_snapshot

# Via npm scripts
npm run test:api
```

### Test Coverage

| Package | Tests | Covers |
|---------|-------|--------|
| `internal/proxy` | 66 | DemoJobStore CRUD + state progression, retry logic, error hints, cache fallback, timeout config, middleware, route handlers |

## Code Quality

```powershell
# Format Go code
go -C ./apps/api-go fmt ./...

# Check formatting (CI gate)
gofmt -l apps/api-go

# Build check
go -C ./apps/api-go build ./cmd/platform-api

# Via npm scripts
npm run lint:api
npm run format:api
npm run build:api
```

## Architecture Constraints

1. **Gateway only**: does not run research jobs, does not shell out to Python during public requests.
2. **Snapshot-backed reads**: all read routes serve from `data/public/`; never discover Research workspaces at request time.
3. **Runtime proxy**: only `/api/v1/audit/*` and `/api/v1/research-boundaries` are forwarded.
4. **Error sanitization**: all errors returned to browsers are generic — no hostnames, ports, paths, tokens, or stack traces.
5. **Retry safety**: only idempotent GET/HEAD methods retry; POST body is never re-consumed.

For the full system architecture, see [docs/architecture.md](../docs/architecture.md).

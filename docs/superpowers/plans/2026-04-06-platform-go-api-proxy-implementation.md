# Platform Go API Proxy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace `Platform/apps/api` Python stub behavior with a Go proxy service that forwards platform API requests to the local research Go API in `Project`.

**Architecture:** Add a standalone Go service under `apps/api-go/` that exposes the platform API routes and forwards them to the research local API over HTTP. The service remains a thin gateway; actual job execution and research state stay in `Services/Local-API`.

**Tech Stack:** Go 1.26, standard library `net/http`, `httptest`, JSON proxying, upstream local research API

---

### Task 1: Scaffold The Go Platform API Service

**Files:**
- Create: `D:\Code\DiffAudit\Platform\apps\api-go\go.mod`
- Create: `D:\Code\DiffAudit\Platform\apps\api-go\cmd\platform-api\main.go`
- Create: `D:\Code\DiffAudit\Platform\apps\api-go\cmd\platform-api\main_test.go`
- Create: `D:\Code\DiffAudit\Platform\apps\api-go\internal\proxy\server.go`
- Create: `D:\Code\DiffAudit\Platform\apps\api-go\internal\proxy\server_test.go`

- [ ] **Step 1: Write the failing tests for config parsing and service bootstrapping**

Cover:

- default host/port
- default research API base URL
- CLI flag overrides

- [ ] **Step 2: Run the Go tests to verify they fail because the service is not implemented yet**

Run:

```powershell
cd D:\Code\DiffAudit\Platform\apps\api-go
go test ./...
```

Expected: FAIL with missing `parseConfig`, `NewServer`, or equivalent symbols.

- [ ] **Step 3: Implement the minimal service bootstrap**

Add:

- module definition
- CLI config parsing
- HTTP server startup
- root server constructor

- [ ] **Step 4: Re-run tests and verify the bootstrap tests pass**

Run:

```powershell
cd D:\Code\DiffAudit\Platform\apps\api-go
go test ./...
```

- [ ] **Step 5: Commit**

```powershell
git -C D:\Code\DiffAudit\Platform add apps/api-go
git -C D:\Code\DiffAudit\Platform commit -m "Scaffold platform Go API proxy"
```

### Task 2: Proxy Health And Read-Only Research Endpoints

**Files:**
- Modify: `D:\Code\DiffAudit\Platform\apps\api-go\internal\proxy\server.go`
- Modify: `D:\Code\DiffAudit\Platform\apps\api-go\internal\proxy\server_test.go`

- [ ] **Step 1: Write the failing tests for proxying**

Cover:

- `GET /health`
- `GET /api/v1/models`
- `GET /api/v1/experiments/recon/best`

Use `httptest` upstream servers that mimic the local research API.

- [ ] **Step 2: Run tests to verify they fail**

Run:

```powershell
cd D:\Code\DiffAudit\Platform\apps\api-go
go test ./...
```

Expected: FAIL for missing routes or forwarding behavior.

- [ ] **Step 3: Implement read-only request forwarding**

Requirements:

- explicit upstream base URL config
- JSON passthrough
- gateway error handling when upstream is unavailable

- [ ] **Step 4: Re-run tests and verify they pass**

Run:

```powershell
cd D:\Code\DiffAudit\Platform\apps\api-go
go test ./...
```

- [ ] **Step 5: Commit**

```powershell
git -C D:\Code\DiffAudit\Platform add apps/api-go
git -C D:\Code\DiffAudit\Platform commit -m "Proxy platform read endpoints to research API"
```

### Task 3: Proxy Job List, Create, And Detail Endpoints

**Files:**
- Modify: `D:\Code\DiffAudit\Platform\apps\api-go\internal\proxy\server.go`
- Modify: `D:\Code\DiffAudit\Platform\apps\api-go\internal\proxy\server_test.go`

- [ ] **Step 1: Write the failing tests for job routes**

Cover:

- `GET /api/v1/audit/jobs`
- `POST /api/v1/audit/jobs`
- `GET /api/v1/audit/jobs/{job_id}`
- upstream `409` pass-through
- upstream `404` pass-through

- [ ] **Step 2: Run tests to verify they fail**

Run:

```powershell
cd D:\Code\DiffAudit\Platform\apps\api-go
go test ./...
```

- [ ] **Step 3: Implement proxy forwarding for job routes**

Requirements:

- preserve request body
- preserve response status code
- preserve response JSON

- [ ] **Step 4: Re-run tests and verify they pass**

Run:

```powershell
cd D:\Code\DiffAudit\Platform\apps\api-go
go test ./...
```

- [ ] **Step 5: Commit**

```powershell
git -C D:\Code\DiffAudit\Platform add apps/api-go
git -C D:\Code\DiffAudit\Platform commit -m "Proxy platform job endpoints to research API"
```

### Task 4: Make Go The Primary Platform API Runtime

**Files:**
- Modify: `D:\Code\DiffAudit\Platform\README.md`
- Modify: `D:\Code\DiffAudit\Platform\apps\api\README.md`
- Create or modify: `D:\Code\DiffAudit\Platform\apps\api-go\README.md`

- [ ] **Step 1: Add a lightweight doc checklist**

Verify docs will state:

- Go proxy is the primary platform API runtime
- Python `apps/api` is legacy/stub
- required research API base URL is documented

- [ ] **Step 2: Update docs**

Document:

- `go run ./cmd/platform-api`
- required upstream local API URL
- expected startup order: `Project` local API first, `Platform` proxy second

- [ ] **Step 3: Manually verify CLI help**

Run:

```powershell
cd D:\Code\DiffAudit\Platform\apps\api-go
go run ./cmd/platform-api --help
```

Expected: usage output with host/port/upstream URL flags.

- [ ] **Step 4: Commit**

```powershell
git -C D:\Code\DiffAudit\Platform add README.md apps/api/README.md apps/api-go/README.md
git -C D:\Code\DiffAudit\Platform commit -m "Document platform Go API proxy runtime"
```

### Task 5: End-To-End Local Integration Verification

**Files:**
- Modify if needed: `D:\Code\DiffAudit\Platform\apps\api-go\README.md`

- [ ] **Step 1: Run the full Go test suite**

```powershell
cd D:\Code\DiffAudit\Platform\apps\api-go
go test ./...
```

- [ ] **Step 2: Start the research local API**

```powershell
cd D:\Code\DiffAudit\Services\Local-API
go run ./cmd/local-api
```

- [ ] **Step 3: Start the platform Go API proxy**

```powershell
cd D:\Code\DiffAudit\Platform\apps\api-go
go run ./cmd/platform-api --research-api-base-url http://127.0.0.1:8765
```

- [ ] **Step 4: Verify proxied calls**

```powershell
curl http://127.0.0.1:8780/health
curl http://127.0.0.1:8780/api/v1/models
curl http://127.0.0.1:8780/api/v1/experiments/recon/best
```

- [ ] **Step 5: Commit final cleanup if needed**

```powershell
git -C D:\Code\DiffAudit\Platform add .
git -C D:\Code\DiffAudit\Platform commit -m "Finish platform Go API proxy integration"
```


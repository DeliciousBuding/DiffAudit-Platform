# Go Gateway Test Gaps

> Generated: 2026-04-30 | Deep dive pass 4

## Coverage Summary

- **Test files:** 2 (`server_test.go` 768 lines, 18 tests; `main_test.go` 84 lines, 4 tests)
- **Endpoints registered:** 12
- **Endpoints tested:** 11 of 12

## Critical Gaps

### 1. `DELETE /api/v1/audit/jobs/{jobID}` — Completely Untested

Neither proxied nor demo mode behavior is tested.

### 2. `normalizeWorkspaceKey` — No Unit Tests

This security-sensitive function handles path traversal inputs (`../`, `..%2F`). No test sends traversal payloads. The function correctly extracts the last path segment, but this behavior has no regression protection.

### 3. Demo Mode Control Plane Handlers — Untested

`handleDemoControlGet`, `handleDemoJobCreation`, `handleControlDelete` in demo mode — all untested. Demo mode is only tested for the runtime health endpoint.

### 4. Retry Logic and Cache Fallback — Untested

`doWithRetry`, `isRetryableError`, `serveCacheFallback` — zero test coverage. The retry-with-backoff and cache fallback chain is effectively dead code from a test perspective.

### 5. CORS Middleware — Zero Coverage

`CORSMiddleware` in `middleware.go` — no test for allowed origins, preflight OPTIONS, disallowed origins, or the permissive empty-list default.

### 6. Structured Logger — Zero Coverage

`NewStructuredLogger` in `middleware.go` — no test. The middleware wrapping is bypassed in all tests (they call `server.Handler()` directly).

### 7. Zero Edge Case Coverage

- Empty request body on POST
- Malformed JSON on POST
- Huge payload (no `MaxBytesReader`)
- Missing fields in demo mode
- Wrong HTTP method

### 8. 4 Tests Are Status-Code-Only

`TestWorkspaceSummaryEndpointUsesSnapshotData`, `TestJobsListEndpointIsProxied`, `TestGetJobEndpointIsProxied`, `TestJobTemplateEndpointIsProxied` — all check only status 200, no body assertions.

## Good Security Assertions

- `TestHealthEndpoint` checks that `runtime_base_url`, `control_api_base_url`, `public_data_dir` are NOT leaked
- `TestRuntimeHealthEndpointDoesNotExposeNetworkErrors` verifies raw IPs don't appear in responses
- `TestControlProxyMisconfigurationDoesNotExposeRawRuntimeBaseURL` asserts misconfigured URLs aren't leaked

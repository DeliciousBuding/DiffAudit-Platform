# Deep Dive: Go API Gateway Internals

> Generated: 2026-04-30 | Deep dive pass 5
> 22 findings: 3 CRITICAL, 7 HIGH, 7 MEDIUM, 3 LOW

---

## CRITICAL

### 1. POST Retry Sends Empty Body on Subsequent Attempts
- **File:** `apps/api-go/internal/proxy/server.go:337, 416-434`
- **Detail:** `forwardControl` reads the request body once into `strings.NewReader(string(body))`. `doWithRetry` calls `s.client.Do(request)` repeatedly. After the first read, the reader is at EOF — all retry attempts send an empty body.
- **Impact:** Job creation retries will send empty POST, potentially creating jobs with null fields or confusing validation errors.

### 2. POST (Non-Idempotent) Requests Are Retied Without Idempotency Key
- **File:** `apps/api-go/internal/proxy/server.go:345, 416-434`
- **Detail:** `doWithRetry` retries POST up to 3 times. If the upstream processes the POST but the response is lost, the retry creates a **duplicate job**. No idempotency key mechanism exists.
- **Impact:** Network blips during job creation silently create duplicate audit jobs.

### 3. Path Traversal in Cache Fallback via Unsanitized `jobID`
- **File:** `apps/api-go/internal/proxy/server.go:536-539`
- **Detail:** `jobID` from the URL path is used directly in `snapshotFile = "jobs/" + jobID + ".json"` without sanitization. While `filepath.Join` normalizes `..` segments, the resolution actually follows the traversal.
- **Impact:** An attacker can read arbitrary `.json` files from the filesystem.

---

## HIGH

### 4. No HTTP Server Timeouts (Slowloris Vulnerability)
- **File:** `apps/api-go/cmd/platform-api/main.go:134`
- **Detail:** Uses `http.ListenAndServe` with zero timeouts — no `ReadTimeout`, `WriteTimeout`, `ReadHeaderTimeout`, or `IdleTimeout`.
- **Impact:** Slowloris attacks can exhaust all available goroutines.

### 5. No Graceful Shutdown — In-Flight Requests Killed on SIGTERM
- **File:** `apps/api-go/cmd/platform-api/main.go:100-138`
- **Detail:** No `signal.Notify`, no `http.Server.Shutdown(ctx)`, no drain period. Rolling deployments drop all in-flight requests.
- **Impact:** Clients see connection resets; jobs may be created without client knowing.

### 6. No Request Body Size Limit on POST Endpoints
- **File:** `apps/api-go/internal/proxy/server.go:205`
- **Detail:** `io.ReadAll(request.Body)` with no `io.LimitReader`. A multi-GB body causes OOM.
- **Impact:** Single malicious request can crash the entire gateway.

### 7. Full Upstream Response Buffering With No Size Limit
- **File:** `apps/api-go/internal/proxy/server.go:355, 394`
- **Detail:** Both `forwardControl` and `forwardControlWithMethod` buffer the entire upstream response with `io.ReadAll`.
- **Impact:** Large job results + concurrent requests = memory exhaustion.

### 8. JSON Injection in Structured Logger
- **File:** `apps/api-go/internal/proxy/middleware.go:68-76`
- **Detail:** URL path interpolated directly into JSON via `Printf`. Paths with `"` or `\` produce malformed JSON. Attackers can inject fake log fields.
- **Impact:** SIEM/log parser corruption, log injection attacks.

### 9. Dockerfile Binds to 127.0.0.1 Inside Container
- **File:** `apps/api-go/Dockerfile:28`
- **Detail:** `CMD ["--host", "127.0.0.1", "--port", "8780"]` — unreachable from outside the container.
- **Impact:** Standalone container deployment will fail with no clear error.

### 10. Fixed Retry Delay — No Exponential Backoff or Jitter (Thundering Herd)
- **File:** `apps/api-go/internal/proxy/server.go:18, 431`
- **Detail:** All retries use `const retryDelay = 1 * time.Second`. No backoff, no jitter. All concurrent requests retry in lockstep.
- **Impact:** Upstream recovery triggers a thundering herd that can re-crash it.

---

## MEDIUM

### 11. `isRetryableError` Uses Fragile String Matching
- **File:** `apps/api-go/internal/proxy/server.go:437-446`
- **Detail:** `strings.Contains(errStr, "timeout")` instead of `errors.Is` or `net.Error` type assertion.

### 12. CORS Allows All Origins by Default
- **File:** `apps/api-go/internal/proxy/middleware.go:45-47`
- **Detail:** Empty `AllowedOrigins` = allow all. Production deployment that forgets to set the flag is wide open.

### 13. No Security Headers
- **File:** `apps/api-go/internal/proxy/middleware.go` (entire file)
- **Detail:** Missing `X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`, `CSP`, `Referrer-Policy`.

### 14. Hardcoded Contract Key in `handleBestReconSummary`
- **File:** `apps/api-go/internal/proxy/server.go:180`
- **Detail:** `entry.ContractKey != "black-box/recon/sd15-ddim"` — adding new recon contracts silently returns 503.

### 15. No-Op Path Rewriting in `forwardControl`
- **File:** `apps/api-go/internal/proxy/server.go:325-328`
- **Detail:** Trims jobID from path, then appends the same jobID. Dead code from incomplete refactoring.

### 16. Cache Fallback Returns 200 OK With Stale Data, No TTL
- **File:** `apps/api-go/internal/proxy/server.go:560-565`
- **Detail:** `X-Data-Source: cache` header not exposed via CORS. No staleness tracking. Cached data persists indefinitely.

### 17. `capturingWriter` Does Not Implement `http.Flusher`
- **File:** `apps/api-go/internal/proxy/middleware.go:82-90`
- **Detail:** Streaming responses and WebSocket upgrades will break through the logging middleware.

---

## LOW

### 18. Upstream Errors Swallowed — No Server-Side Logging
- **File:** `apps/api-go/internal/proxy/server.go:495-505`

### 19. Request ID Not Unique Under Concurrent Load
- **File:** `apps/api-go/internal/proxy/middleware.go:62`
- **Detail:** `start.UnixNano()` encoded as base-36 — concurrent requests in the same nanosecond get the same ID.

### 20. `break` vs `continue` for Empty Workspace
- **File:** `apps/api-go/internal/proxy/server.go:186`

### 21. DELETE Endpoint Has No Retry (Inconsistent With GET/POST)
- **File:** `apps/api-go/internal/proxy/server.go:307-317, 365-402`

### 22. Test Coverage Gaps for Retry, Cache, CORS, and Security Paths
- **File:** `apps/api-go/internal/proxy/server_test.go`
- **Detail:** Zero tests for: `doWithRetry`, `isRetryableError`, `serveCacheFallback`, CORS middleware, DELETE endpoint, POST with malformed body, concurrent requests.

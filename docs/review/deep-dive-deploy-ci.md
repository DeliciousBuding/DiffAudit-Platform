# Deep Dive: Deployment, Docker & CI

> Generated: 2026-04-30 | Deep dive pass 5
> 22 findings: 2 CRITICAL, 5 HIGH, 9 MEDIUM, 6 LOW

---

## CRITICAL

### 1. OAuth Client Secrets Committed to Git History
- **File:** `apps/web/.env.local:6-8`
- **Detail:** Real Google and GitHub OAuth secrets are in a tracked `.env.local`. `.gitignore` has no effect on already-tracked files. Secrets remain in git history until full rewrite.

### 2. `DIFFAUDIT_SESSION_TOKEN` — Dead/Misleading Configuration
- **File:** `apps/web/.env.example:1`
- **Detail:** This env var is never referenced by any code. Sessions use `crypto.randomBytes(32)` stored in SQLite. No server-side signing key exists. The env var is misleading dead configuration.

---

## HIGH

### 3. Containers Run as Root — No USER Directive
- **Files:** `apps/api-go/Dockerfile`, `apps/web/Dockerfile`
- **Detail:** Neither Dockerfile has a `USER` directive. Both run as PID 1 root. RCE = full container root.

### 4. No HEALTHCHECK in Dockerfiles or Docker Compose
- **Files:** Both Dockerfiles, `deploy/docker-compose.example.yml`
- **Detail:** `/health` endpoint exists but no automated detection. `restart: unless-stopped` only restarts on process exit, not app-level failures.

### 5. No Graceful Shutdown (Cross-Verified With Go Gateway Audit)
- **File:** `apps/api-go/cmd/platform-api/main.go:133-137`

### 6. No Rate Limiting (Cross-Verified With DB/Auth Audit)

### 7. Expired Sessions Never Cleaned Up (Cross-Verified)
- **File:** `apps/web/src/lib/auth.ts:485-510`

---

## MEDIUM

### 8. SQL Injection Surface in `ensureColumn` (Cross-Verified)
- **File:** `apps/web/src/lib/db/index.ts:76-81`

### 9. CORS Allows All Origins When Configured Empty (Cross-Verified)
- **File:** `apps/api-go/internal/proxy/middleware.go:41-54`

### 10. No Security Headers in Next.js Config
- **File:** `apps/web/next.config.ts`
- **Detail:** No CSP, X-Frame-Options, X-Content-Type-Options, HSTS.

### 11. No CSRF Protection on State-Changing Endpoints
- **Files:** Login, register, password routes
- **Detail:** Zero results for `csrf|CSRFToken|csrfToken`. Relies solely on `sameSite: "lax"`.

### 12. Path Traversal Mitigation Incomplete in Workspace Key
- **File:** `apps/api-go/internal/proxy/server.go:147-156, 448-461`

### 13. CI Pipeline Missing Security Scanning
- **File:** `.github/workflows/ci.yml`, `.github/workflows/publish-images.yml`
- **Detail:** No `npm audit`, no container scanning, no SAST, no secret scanning. Publishes to GHCR with no security gates.

### 14. Docker Compose `env_file` Not Required — Silent Misconfiguration
- **File:** `deploy/docker-compose.example.yml:13-15, 34-36`
- **Detail:** `required: false` on `runtime.env`. Missing config = silent demo mode with placeholder password.

### 15. Pre-commit Hooks Missing Security-Focused Checks
- **File:** `.pre-commit-config.yaml`
- **Detail:** No `detect-secrets`, `gitleaks`, `hadolint`, `golangci-lint`. The committed `.env.local` could have been prevented.

### 16. Web Container Dockerfile Defaults to 127.0.0.1 Binding
- **File:** `apps/api-go/Dockerfile:28`

---

## LOW

### 17. Go 1.26.1 Version Consistent (Positive Finding)
- **Files:** `go.mod:3`, `Dockerfile:1`

### 18. Structured Logging Lacks Log Level Control
- **File:** `apps/api-go/internal/proxy/middleware.go:57-79`

### 19. No Monitoring, Metrics, or Tracing Integration
- **Detail:** Zero matches for `opentelemetry|sentry|datadog|prometheus` in code.

### 20. Docker Image Uses Full Debian Slim (Could Use `scratch`/`distroless`)
- **File:** `apps/api-go/Dockerfile:10`
- **Detail:** CGO_ENABLED=0 static binary could run on `scratch`. ~75MB vs <10MB.

### 21. Registration Open With No Invitation/Allowlist
- **File:** `apps/web/src/app/api/auth/register/route.ts`

### 22. Docker Compose `depends_on` Without Health Condition
- **File:** `deploy/docker-compose.example.yml:32-33`

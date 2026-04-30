# Type Safety & Deployment Issues

> Generated: 2026-04-30 | Deep dive pass 2
> Reviewer note: 类型安全和部署配置问题，影响运行时可靠性和容器安全。

---

## Type Safety

### 1. No Schema Validation Library — 12 Unsafe `response.json() as T` Casts

- **Severity:** HIGH
- **Detail:** No `zod`, `io-ts`, `valibot`, or any validation library. All API response handling relies on `as SomeType` casts. If the upstream returns malformed data, the code proceeds with wrong assumptions.

**Most dangerous instances (external APIs — no runtime validation at all):**

| File | Line | Cast |
|------|------|------|
| `api/auth/github/callback/route.ts` | 93 | `as GitHubTokenResponse` |
| `api/auth/github/callback/route.ts` | 115 | `as GitHubUserResponse` |
| `api/auth/github/callback/route.ts` | 133 | `as Array<{email, primary, verified}>` |
| `api/auth/google/callback/route.ts` | 108 | `as GoogleTokenResponse` |
| `api/auth/google/callback/route.ts` | 128 | `as GoogleUserResponse` |

If GitHub or Google returns an error response, malformed payload, or schema change, the code proceeds with undefined fields.

**Internal API casts (also unsafe but lower risk):**

| File | Line | Cast |
|------|------|------|
| `lib/evidence-report.ts` | 123 | `as EvidenceSummaryPayload` |
| `components/create-job-button.tsx` | 53 | `as JobTemplatePayload` |
| `components/create-job-button.tsx` | 68 | `as JobCreationResponse` |
| `components/workspace-status-drawer.tsx` | 39 | `as GatewayHealth` |
| `settings/SettingsClient.tsx` | 255 | `as GatewayHealth \| null` |
| `components/runtime-status-badge.tsx` | 30 | `as RuntimeHealthResponse \| null` |
| `reports/[track]/track-report-page.tsx` | 172 | `as EvidenceSummaryPayload` |

- **Recommendation:** Add Zod schemas for all external API responses. At minimum, validate that required fields exist and have correct types.

### 2. `noUncheckedIndexedAccess` Not Enabled in tsconfig

- **File:** `apps/web/tsconfig.json`
- **Severity:** MEDIUM
- **Detail:** Array access like `arr[0]` is typed as `T` instead of `T | undefined`. This hides out-of-bounds access bugs at compile time.
- **Recommendation:** Add `"noUncheckedIndexedAccess": true` to `compilerOptions`.

### 3. Dual Schema Definition — Maintenance Risk

- **Files:** `lib/db/index.ts` (INIT_SQL, lines 16-74), `lib/db/schema.ts` (Drizzle ORM)
- **Severity:** MEDIUM
- **Detail:** The same 6 tables are defined in raw SQL AND Drizzle ORM. Must be kept in sync manually. `ensureColumn` only adds columns, never renames or removes.
- **Recommendation:** Use Drizzle's `migrate` or `push` to generate SQL from the schema, eliminating the manual INIT_SQL.

### 4. Go: Pervasive `map[string]any` — 28+ Instances

- **File:** `apps/api-go/internal/proxy/server.go`
- **Severity:** MEDIUM
- **Detail:** JSON responses built with `map[string]any{...}` throughout. `handleDemoJobCreation` (line 464) unmarshals into `map[string]any` then discards type assertion `ok` values — missing fields silently become zero values.
- **Contrast:** `handleBestReconSummary` defines a proper `catalogEntry` struct (line 158). This is the type-safe approach.
- **Recommendation:** Define typed structs for all JSON request/response bodies.

### 5. Positive Findings

- **Zero `any` usage in TypeScript** — excellent discipline
- **Zero `@ts-ignore` / `@ts-expect-error` / `@ts-nocheck`** — no suppressed checks
- **`strict: true` enabled** in tsconfig
- **Manual runtime validation exists** in `normalizeCatalogEntry`, `normalizeRow`, `normalizeAuditJob` — compensates partially for lack of Zod
- **Drizzle schema and queries are well-aligned** — no type mismatches found

---

## Deployment & Infrastructure

### 6. Both Dockerfiles Run as Root

- **Files:** `apps/web/Dockerfile` (runner stage), `apps/api-go/Dockerfile` (runner stage)
- **Severity:** HIGH
- **Detail:** Neither final stage has a `USER` directive. Both containers run processes as UID 0 (root). If the process is compromised, the attacker has root inside the container.
- **Recommendation:** Add `USER node` (web) and `USER nobody` or `USER 65534` (Go) to final stages.

### 7. Middleware Only Checks Cookie Existence, Not Validity

- **File:** `apps/web/src/middleware.ts` (line 21)
- **Severity:** HIGH
- **Detail:** `request.cookies.has(SESSION_COOKIE)` checks for cookie existence only. An attacker can set a cookie named `diffaudit_session` with any arbitrary value (or reuse an expired token) and bypass the auth guard entirely. Should call `validateSession(cookieValue)` from `auth.ts`.
- **Note:** This is technically a middleware bug, not a deployment issue, but it was discovered during the infrastructure review.

### 8. `ci.yml` Missing `permissions:` Block

- **File:** `.github/workflows/ci.yml`
- **Severity:** HIGH
- **Detail:** No `permissions:` block. Jobs run with default `GITHUB_TOKEN` permissions. For public repos this is mostly read, but best practice is explicit `permissions: contents: read`.
- **Recommendation:** Add top-level `permissions: contents: read`.

### 9. No Health Checks in Docker Compose

- **File:** `deploy/docker-compose.example.yml`
- **Severity:** HIGH
- **Detail:** Neither service defines `healthcheck:`. `web` depends on `api` but starts as soon as the container starts, not when the API is ready. Race condition on startup.
- **Recommendation:** Add health checks. Use `depends_on: api: condition: service_healthy`.

### 10. Pervasive Hardcoded `127.0.0.1:8780` Defaults

- **Files:** `api-proxy.ts`, `catalog.ts`, `attack-defense-table.ts`, `evidence-report.ts`, `audit-jobs.ts`, `track-report-page.tsx` (6 files)
- **Severity:** HIGH
- **Detail:** All use `process.env.DIFFAUDIT_API_BASE_URL ?? "http://127.0.0.1:8780"`. In containers without this env var, these calls hit the container's own loopback where no API server is listening. Silent failure.
- **Additionally:** OAuth routes fall back to `http://localhost:3000` if `DIFFAUDIT_PLATFORM_URL` is unset (5 files).
- **Recommendation:** Fail fast with an explicit error if the env var is missing, rather than defaulting to localhost.

### 11. Floating Base Image Tags in Dockerfiles

- **Files:** Both Dockerfiles
- **Severity:** MEDIUM
- **Detail:** `node:22-bookworm-slim`, `golang:1.26.1-bookworm`, `debian:bookworm-slim` are all floating tags. Builds are not reproducible. A compromised upstream image would be pulled automatically.
- **Recommendation:** Pin to digest or specific patch version.

### 12. GitHub Actions Use Mutable Tags

- **Files:** Both workflow files
- **Severity:** MEDIUM
- **Detail:** All actions referenced by mutable tags (`@v4`, `@v5`, `@v3`). Supply-chain attack vector if a tag is force-pushed.
- **Recommendation:** Pin to SHA digests.

### 13. Go Dockerfile CMD Defaults to `127.0.0.1`

- **File:** `apps/api-go/Dockerfile`
- **Severity:** MEDIUM
- **Detail:** Default CMD `["--host", "127.0.0.1", "--port", "8780"]` means the process only listens on loopback inside the container. Unreachable from other containers without compose override.
- **Recommendation:** Change default to `0.0.0.0` for container use.

### 14. Go Runner Could Use `scratch`/`distroless`

- **File:** `apps/api-go/Dockerfile`
- **Severity:** LOW
- **Detail:** Uses `debian:bookworm-slim` but the Go binary is compiled with `CGO_ENABLED=0`. A `scratch` or `distroless/static` base would be smaller with zero shell/package-manager attack surface.

### 15. `.dockerignore` Missing Entries

- **File:** `.dockerignore`
- **Severity:** LOW
- **Detail:** Missing: `.github/`, `CLAUDE.md`, `*.md`, `apps/api-go/data/`, `.claude/`, `scripts/`. These are copied into the build context needlessly.

### 16. Missing Compose Resource Limits

- **File:** `deploy/docker-compose.example.yml`
- **Severity:** MEDIUM
- **Detail:** No `mem_limit`, `cpus`, or `pids_limit`. A runaway process could consume all host resources.

### 17. No SBOM or Image Signing in Publish Workflow

- **File:** `.github/workflows/publish-images.yml`
- **Severity:** MEDIUM
- **Detail:** Images are built and pushed but not signed or accompanied by an SBOM. For a security-sensitive project, this is a gap.

### 18. `.gitignore` Missing `.env.production`

- **File:** `.gitignore`
- **Severity:** LOW
- **Detail:** Only `.env.local` and `.env.*.local` are excluded. A `.env.production` file would be tracked.

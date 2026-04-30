# Runtime Bugs (Verified by Cross-Examination)

> Generated: 2026-04-30 | Deep dive pass 3 — Cross-verified
> Reviewer note: 实际会在运行时触发的 bug，按严重程度排序。所有条目经过交叉验证。

---

## CRITICAL

### 1. Middleware Auth Bypass — Cookie Existence Only, No Session Validation

- **File:** `apps/web/src/middleware.ts` (line 21)
- **Verified:** CONFIRMED
- **Detail:** `request.cookies.has(SESSION_COOKIE)` checks cookie existence only. Any non-empty value passes. `validateSession()` exists in `auth.ts` (lines 481-506) but is never called by middleware.
- **Impact chain:**
  - `/workspace/*` pages: Attacker sees workspace UI (demo data, not user-private). Medium severity.
  - `/api/v1/*` routes: All 9 proxy route handlers perform ZERO session validation. They proxy directly to the Go backend, which also has zero authentication. Attacker gets full read/write access to catalog, models, evidence, audit job CRUD.
  - The Go backend (`server.go`) has no auth middleware at all — it trusts that requests from `127.0.0.1` are pre-authenticated.
- **Attack vector:** XSS anywhere on the domain allows setting `document.cookie = "diffaudit_session=fake"`. Physical browser access or browser extension also works.
- **Recommendation:** Middleware should call `validateSession(token)` from `auth.ts`. Alternatively, each `/api/v1/*` handler should validate before proxying.

### 2. Path Traversal via Unsanitized Path Parameters

- **Files:**
  - `apps/web/src/app/api/v1/audit/jobs/[jobId]/route.ts` (line 18)
  - `apps/web/src/app/api/v1/experiments/[workspace]/summary/route.ts` (line 8)
- **Verified:** CONFIRMED
- **Detail:** `jobId` and `workspace` are interpolated directly into backend URL paths:
  ```typescript
  proxyJsonToBackend(`/api/v1/audit/jobs/${jobId}`, ...)
  proxyToBackend(`/api/v1/experiments/${workspace}/summary`)
  ```
  A request to `/api/v1/audit/jobs/../../admin/users` produces the backend path `/api/v1/audit/jobs/../../admin/users`, which `new URL()` normalizes to `/api/v1/admin/users`.
- **Combined with Bug 1:** The middleware only checks cookie existence, so any valid-looking cookie suffices to exploit this.
- **Recommendation:** Validate that `jobId` matches `[a-zA-Z0-9_-]+` and `workspace` matches `[a-zA-Z0-9_-]+` before proxying.

### 3. No Auth Context Forwarded to Go Backend

- **File:** `apps/web/src/lib/api-proxy.ts` (lines 48-64)
- **Verified:** CONFIRMED
- **Detail:** `fetchBackend` only sets `content-type: application/json`. No session token, user ID, or auth header is forwarded. The Go backend has no auth middleware. This means either: (a) all proxy requests fail with 401 if the backend has its own auth, or (b) there is zero per-user authorization if the backend doesn't check.
- **Combined with Bugs 1+2:** The entire auth chain is: middleware checks cookie exists → handler proxies to backend → backend trusts all requests. Three layers, zero authentication.
- **Recommendation:** Forward the session token as a `Bearer` header. Add auth middleware to the Go gateway.

---

## HIGH

### 4. `register/route.ts` Bare `catch {}` Hides All Errors as "Already Exists"

- **File:** `apps/web/src/app/api/auth/register/route.ts` (lines 19-27)
- **Verified:** CONFIRMED
- **Detail:** `createUser()` throws a raw SQLite constraint error on duplicates. The bare `catch {}` catches ALL errors (DB locked, corrupted, schema mismatch) and returns 409 "Username or email already exists." A DB corruption during registration appears to the user as a duplicate username.
- **Recommendation:** Catch constraint errors specifically. Let other errors propagate as 500.

### 5. Demo Mode Cookie Parsing Uses `String.includes()` — False Positives

- **File:** `apps/web/src/lib/demo-mode.ts` (lines 24-31)
- **Verified:** CONFIRMED
- **Detail:** Raw `Cookie` header is searched with `String.includes("platform-demo-mode=0")`. A cookie like `some_other_cookie=xplatform-demo-mode=0y` would produce a false positive. The `=0` check also runs before `=1`, so if both substrings appear from different cookies, `=0` always wins.
- **Recommendation:** Parse cookies properly: split by `;`, trim, find exact key match.

### 6. `proxyToBackend` / `proxyJsonToBackend` Drop All Response Headers Except `content-type`

- **File:** `apps/web/src/lib/api-proxy.ts` (lines 7-21, 23-46)
- **Verified:** CONFIRMED
- **Detail:** Both functions construct a new `Response` and only forward `content-type`. `cache-control`, `set-cookie`, `x-request-id`, `retry-after`, `content-disposition` are all silently dropped.
- **Recommendation:** Forward at minimum: `cache-control`, `etag`, `x-request-id`.

### 7. `proxyJsonToBackend` Returns Upstream Status 200 with Synthetic Error Body

- **File:** `apps/web/src/lib/api-proxy.ts` (lines 23-46)
- **Verified:** CONFIRMED
- **Detail:** If upstream returns 200 with non-JSON content, `upstream.json()` fails, `.catch(() => null)` swallows the error, and the function returns `{ detail: "Runtime response unavailable." }` with status 200. The client sees a 200 with an error message.
- **Recommendation:** Return 502 when JSON parsing fails, regardless of upstream status.

### 8. `fetchBackend` Bare `catch {}` Masks Programming Errors

- **File:** `apps/web/src/lib/api-proxy.ts` (lines 48-63)
- **Verified:** CONFIRMED
- **Detail:** Catches `TypeError` from invalid URL construction, `RangeError`, and any other runtime error. All become "Platform gateway unavailable" with 502. No logging.
- **Recommendation:** Log the actual error. Differentiate timeout (504) from connection failure (502) from programming error (re-throw or 500).

---

## MEDIUM

### 9. Permissive CORS Default in Go Gateway

- **File:** `apps/api-go/internal/proxy/middleware.go` (lines 41-54)
- **Verified:** CONFIRMED
- **Detail:** When `AllowedOrigins` is empty, `isAllowedOrigin` returns `true` for any origin. If deployed without setting `AllowedOrigins`, any website can make cross-origin requests to the API.
- **Recommendation:** Default to deny-all when `AllowedOrigins` is empty. Only allow `*` in explicit dev mode.

### 10. Snapshot Manifest Staleness Not Surfaced to Users

- **File:** `apps/api-go/data/public/manifest.json`
- **Verified:** CONFIRMED
- **Detail:** Generated 2026-04-28. All 7 data warnings say "runtime unavailable; reused existing snapshot." No code checks or displays these warnings to end users. The manifest is served as-is.
- **Recommendation:** Surface staleness warnings in the workspace UI (e.g., a banner "Data is X days old").

### 11. `catalog.json` Contains Dead `risk_interpretation` Field

- **File:** `apps/api-go/data/public/catalog.json`
- **Verified:** CONFIRMED
- **Detail:** Every entry has a `risk_interpretation` object with bilingual text and metric interpretations. This field is NOT in `CatalogEntryPayload` (catalog.ts lines 18-37) and is silently dropped by `normalizeCatalogEntry`. The data never reaches the frontend.
- **Structural inconsistency:** Entry 1 has `{en-US, zh-CN}`, Entry 4 has `{baseline_auc, defended_auc, en-US, risk_level_baseline, risk_level_defended, zh-CN}`. Shape varies across entries.
- **Recommendation:** Either add `risk_interpretation` to the type and pass it through, or remove it from the snapshot.

### 12. `createDemoJob` Has No Input Size/Count Limits

- **File:** `apps/web/src/lib/demo-jobs-store.ts` (lines 139-160)
- **Verified:** CONFIRMED
- **Detail:** `contract_key` from user input is stored directly in `globalThis.__diffauditDemoJobs__` with no length limit. No limit on number of jobs either. Repeated POSTs can exhaust server memory.
- **Recommendation:** Add input length validation and a max job count.

---

## CORRECTED FINDINGS (from cross-verification)

### ~~7 dead files~~ → 6 dead files

`components/workspace-frame.tsx` is **ALIVE** — imported by 5 workspace page files. The original claim was false. The 6 confirmed dead files are:

| File | Status |
|------|--------|
| `lib/error-messages.ts` | DEAD (0 imports) |
| `lib/status-utils.ts` | DEAD (0 imports) |
| `components/breadcrumb.tsx` | DEAD (0 imports) |
| `components/metric-label.tsx` | DEAD (0 imports) |
| `components/progress.tsx` | DEAD (0 imports) |
| `hooks/use-demo-mode.ts` | DEAD (0 imports) |
| ~~`components/workspace-frame.tsx`~~ | **ALIVE (5 imports)** — retracted |

### Cookie Security — GOOD (no issues)

`auth.ts` lines 654-660: `httpOnly: true`, `sameSite: "lax"`, `secure` conditional on production, `path: "/"`, no `domain` set, 12-hour maxAge. Follows best practices. Hardening suggestion: use `__Host-` prefix on cookie name.

### Error Message Leakage — GOOD (no leaks)

No stack traces, file paths, SQL errors, or internal URLs leaked in any API response. The Go gateway's `runtimeErrorHint` function maps errors to human-readable hints without exposing internals. Minor finding: `runtime_configured` boolean in runtime error responses reveals internal config state.

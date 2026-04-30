# Code Quality Issues

> Generated: 2026-04-30 | Severity: P1
> Reviewer note: 代码质量问题，影响可维护性和开发效率。

## 1. `auth.ts` — God Module (661 lines)

- **File:** `apps/web/src/lib/auth.ts`
- **Severity:** HIGH
- **Detail:** Contains at least 6 distinct concerns crammed into one file: session management, password hashing, user creation, credential verification, OAuth account linking, email verification, 2FA support. `ensureLegacySharedUser` (line 67) has its own upsert logic that duplicates parts of `createUser` (line 118).
- **Recommendation:** Split into `session.ts`, `password.ts`, `oauth.ts`, `email-verification.ts`, `shared-user.ts`.

## 2. `workspace-copy.ts` — 1,869 lines of Hand-Rolled i18n

- **File:** `apps/web/src/lib/workspace-copy.ts`
- **Severity:** HIGH
- **Detail:**
  - No i18n framework (no `next-intl`, `react-intl`, `i18next`). Components do manual key lookups.
  - No pluralization, no message extraction, no translator workflow.
  - Both locales shipped in full — cannot lazy-load a single locale.
  - Contains template functions as values (non-serializable), blocking future migration to JSON.
  - Imported by 32 files — any string change triggers full recompilation through the dependency graph.
- **Bug:** `emptyWorkspace` section (~line 796-805) is entirely in Chinese inside the `en-US` key. Copy-paste error from `zh-CN`.
- **Recommendation:** Migrate to `next-intl` or similar. At minimum, fix the locale contamination bug immediately.

## 3. `backendBaseUrl()` Duplicated 5 Times

- **Files:**
  - `apps/web/src/lib/api-proxy.ts` (line 1-5)
  - `apps/web/src/lib/catalog.ts` (line 5, 84)
  - `apps/web/src/lib/attack-defense-table.ts` (line 6, 51)
  - `apps/web/src/lib/evidence-report.ts` (line 6, 13)
  - `apps/web/src/lib/audit-jobs.ts` (line 5, 29)
- **Severity:** MEDIUM
- **Detail:** `DEFAULT_API_BASE_URL = "http://127.0.0.1:8780"` and the `backendBaseUrl()` function are copy-pasted independently in 5 files. `api-proxy.ts` exports `proxyToBackend` but not `backendBaseUrl()`, forcing every module to re-declare it.
- **Recommendation:** Export `backendBaseUrl()` from a single `lib/api-config.ts` module. All others import from there.

## 4. OAuth Callback Routes: Massive Copy-Paste

- **Files:**
  - `apps/web/src/app/api/auth/github/callback/route.ts` (177 lines)
  - `apps/web/src/app/api/auth/google/callback/route.ts` (166 lines)
- **Severity:** MEDIUM
- **Detail:** `readStoredState`, `buildRedirectWithProviderStatus`, `buildPlatformRedirect`, state validation flow, connect-mode branching, and session creation are all duplicated. `readStoredState` is literally copy-pasted between files.
- **Recommendation:** Extract shared OAuth callback logic into `lib/oauth-callback.ts`.

## 5. `catalog.ts` and `attack-defense-table.ts` Structural Duplication

- **Files:**
  - `apps/web/src/lib/catalog.ts` (248 lines)
  - `apps/web/src/lib/attack-defense-table.ts` (153 lines)
- **Severity:** MEDIUM
- **Detail:** Both files independently define the same pattern:
  1. `DEFAULT_API_BASE_URL` + `backendBaseUrl()`
  2. `DEFAULT_SERVER_FETCH_TIMEOUT_MS = 600`
  3. `normalizeXxxEntry` with same guard pattern
  4. `summarizeXxx` that normalizes, filters nulls, maps to view models
  5. `fetchXxx` that checks demo mode, calls `fetchWithTimeout`, validates shape
- **Recommendation:** Create a generic `createSnapshotFetcher<T>(config)` factory.

## 6. Go Gateway: `forwardControl` / `forwardControlWithMethod` 80% Duplication

- **File:** `apps/api-go/internal/proxy/server.go` — lines 319-402
- **Severity:** MEDIUM
- **Detail:** Both functions check RuntimeBaseURL, construct upstream URL, create request, set headers, make call, handle errors, write response. They differ only in whether they accept a body and whether they use retry.
- **Recommendation:** Merge into a single function with an options struct.

## 7. `status-utils.ts` Dead + Duplicated

- **Files:**
  - `apps/web/src/lib/status-utils.ts` (28 lines) — zero imports
  - `apps/web/src/lib/audit-jobs.ts` (lines 59-70) — defines identical `statusTone()`
- **Severity:** LOW
- **Detail:** `status-utils.ts` is completely dead code. Meanwhile `audit-jobs.ts` re-implements the same logic.
- **Recommendation:** Delete `status-utils.ts`. If the logic is needed, import from a single source.

## 8. Demo Mode Fragmented Across 4 Files

- **Files:**
  - `apps/web/src/lib/demo-mode-constants.ts` (5 lines, 118 bytes)
  - `apps/web/src/lib/demo-mode.ts` (server-side check)
  - `apps/web/src/lib/demo-mode-client.ts` (client-side check)
  - `apps/web/src/lib/demo-jobs-store.ts` (174 lines, in-memory store)
- **Severity:** LOW
- **Detail:** `demo-mode-constants.ts` exports exactly 2 constants and is only imported by the other two check files. The first three files total 72 lines combined.
- **Recommendation:** Merge `demo-mode-constants.ts`, `demo-mode.ts`, and `demo-mode-client.ts` into a single `demo-mode.ts`.

## 9. `api-proxy.ts` Swallows All Errors With No Logging

- **File:** `apps/web/src/lib/api-proxy.ts` — `fetchBackend` catch block (line 58)
- **Severity:** MEDIUM
- **Detail:** Bare `catch` converts every failure (DNS, TLS, timeout, TypeError) into the same generic 502 "Platform gateway unavailable." No error logging whatsoever.
- **Recommendation:** Add `console.error` or structured logging. Differentiate timeout (504) from connection failure (502).

## 10. Inconsistent Error Response Format

- **Files:** All auth routes vs all v1 routes
- **Severity:** LOW
- **Detail:** Auth routes return `{ message: "..." }`, v1 routes return `{ detail: "..." }` (from Go gateway). Frontend error handling must read different keys depending on route namespace.
- **Recommendation:** Standardize on one error response shape. Suggest `{ error: { code, message } }`.

## 11. `isRetryableError` Uses Brittle String Matching (Go)

- **File:** `apps/api-go/internal/proxy/server.go` — lines 437-446
- **Severity:** LOW
- **Detail:** Matches error messages via `strings.Contains`. Go error messages can change between versions or OS. Should use `errors.Is` or type assertions for `*net.OpError`, `*url.Error`.
- **Recommendation:** Replace with typed error checking.

## 12. 600ms Fetch Timeout Too Aggressive

- **Files:** `catalog.ts`, `attack-defense-table.ts`
- **Severity:** MEDIUM
- **Detail:** `DEFAULT_SERVER_FETCH_TIMEOUT_MS = 600` while Go gateway's `defaultRuntimeTimeout` is 15s. Cold starts easily exceed 600ms. UI silently shows "no data" — a confusing, silent failure.
- **Recommendation:** Increase to 3000ms or make configurable. Consider showing a "slow response" indicator instead of silently returning null.

## 13. `summarizeCatalogEntries` Iterates Array 6 Times

- **File:** `apps/web/src/lib/catalog.ts` — lines 170-216
- **Severity:** LOW
- **Detail:** Filters once for stats, then maps+sorts, then filters 3 more times per track. A single pass could compute all stats and group by track. For small catalogs it's fine but needlessly wasteful.
- **Recommendation:** Refactor to single-pass computation if catalog size grows.

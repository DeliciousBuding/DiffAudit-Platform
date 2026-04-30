# Deep Dive: Data Layer & API Contracts

> Generated: 2026-04-30 | Deep dive pass 5
> 17 findings: 0 CRITICAL, 3 HIGH, 8 MEDIUM, 6 LOW

---

## HIGH

### 1. `evidence-report.ts` Bypasses Demo Mode, Silently Returns Null
- **File:** `apps/web/src/lib/evidence-report.ts:84-128`
- **Detail:** Unlike `fetchCatalogDashboard`, `fetchAttackDefenseTable`, and `fetchAuditJobs`, this function never checks `isDemoModeEnabledServer()`. In demo mode with backend down, returns `null`. Pages show mix of demo data and empty sections.

### 2. `proxyJsonToBackend` Runs Transform on Error Response Bodies
- **File:** `apps/web/src/lib/api-proxy.ts:23-46`
- **Detail:** When upstream returns 400/404/500 with valid JSON, the `transform` callback runs on the error body. `sanitizeAuditJobPayload` will happily process `{ detail: "Not found" }`, wrapping strings through `sanitizeRuntimeText`. Works by accident today; breaks if transform adds/removes fields.

### 3. Demo Mode Defaults to `true` — Silent Production Risk
- **File:** `apps/web/src/lib/demo-mode.ts:18-51`
- **Detail:** Cross-verified with routing audit. Deployment that forgets `DIFFAUDIT_FORCE_DEMO_MODE=0` serves stale demo data without visible indication.

---

## MEDIUM

### 4. `fetchAuditJobs` Skips Demo Mode Check (Inconsistent With Siblings)
- **File:** `apps/web/src/lib/audit-jobs.ts:108-127`
- **Detail:** Unlike `fetchCatalogDashboard` and `fetchAttackDefenseTable`, this function has no demo-mode guard. Only the API route handler checks demo mode.

### 5. `fetchWithTimeout` Does Not Propagate Timeout as Distinguishable Error
- **File:** `apps/web/src/lib/fetch-timeout.ts:1-21`
- **Detail:** All failures (timeout, connection refused, DNS) are silently swallowed by `catch {}` blocks returning `null`. UI cannot distinguish transient from permanent failures.

### 6. Frontend Silently Swallows JSON Parse Errors
- **Files:** `jobs-list.tsx:127`, `live-jobs-panel.tsx:124`, `JobDetailClient.tsx:191`, `TaskListClient.tsx:111`
- **Detail:** `await response.json()` can throw on non-JSON bodies (e.g., HTML 502 pages). Error is caught but discarded with `// Ignore fetch errors`.

### 7. Client/Server Demo Mode Disagreement
- **Files:** `demo-mode-client.ts`, `demo-mode.ts`, `SettingsClient.tsx`
- **Detail:** Client reads from `localStorage` (key `platform-demo-mode-v1`), server reads from cookie (key `platform-demo-mode`). If one is cleared but not the other, UI shows one mode while server serves the other.

### 8. Sequential Network Calls Without Shared Timeout Budget
- **File:** `apps/web/src/lib/evidence-report.ts:84-128`
- **Detail:** Two sequential `fetchWithTimeout` calls, each 600ms. Worst-case 1200ms blocking server-side rendering.

### 9. `proxyToBackend` Drops All Upstream Headers Except `content-type`
- **File:** `apps/web/src/lib/api-proxy.ts:14-20`
- **Detail:** `cache-control`, `x-request-id`, `retry-after`, CORS headers all silently dropped. Distributed debugging impossible.

### 10. Client Components Duplicate Normalization Logic
- **Files:** `jobs-list.tsx:71-107`, `live-jobs-panel.tsx:69-107`, `audit-jobs.ts:87-106`
- **Detail:** Three copies of `summarizeAuditJobs`. Client copies translate status strings, server copy uses raw strings. The `AuditJobViewModel.status` field carries different semantics depending on source.

### 11. `JobDetailClient` Extracts `jobData` With Fragile Heuristic
- **File:** `apps/web/src/app/(workspace)/workspace/audits/[jobId]/JobDetailClient.tsx:191-192`
- **Detail:** `const jobData: JobDetail = data.job ?? data` — on 404, `data = { detail: "Not found" }`, `jobData` becomes the error object typed as `JobDetail`. UI renders with all `undefined` fields.

---

## LOW

### 12. `classifyRisk` Treats AUC=0 as "Low Risk"
- **File:** `apps/web/src/lib/risk-report.ts:3-7`

### 13. `proxyJsonToBackend` Conflates Upstream Content-Type With Produced Content-Type
- **File:** `apps/web/src/lib/api-proxy.ts:23-46`

### 14. `demo-jobs-store.ts` Uses Global Mutable State With No Cleanup
- **File:** `apps/web/src/lib/demo-jobs-store.ts:12-21`

### 15. `sanitizeAuditJobValue` Uses Unsafe `as T` Casts
- **File:** `apps/web/src/lib/audit-job-payload.ts:23-42`

### 16. `control/runtime/route.ts` Does Not Forward Request to Proxy
- **File:** `apps/web/src/app/api/v1/control/runtime/route.ts:4-14`

### 17. `catalog.ts` `toEntryViewModel` Does Not Validate Track Value
- **File:** `apps/web/src/lib/catalog.ts:96`

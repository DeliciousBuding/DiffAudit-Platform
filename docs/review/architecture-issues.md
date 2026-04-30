# Architecture & Organization Issues

> Generated: 2026-04-30 | Severity: P2
> Reviewer note: 架构层面的组织问题，影响代码发现性和扩展性。

## 1. 72 Components in a Flat Directory

- **Directory:** `apps/web/src/components/`
- **Severity:** MEDIUM
- **Detail:** No subdirectories. Mixes:
  - Generic UI primitives: `button.tsx`, `card.tsx`, `badge.tsx`, `modal.tsx`, `tabs.tsx`, `tooltip.tsx`, `skeleton.tsx`
  - Domain components: `contracts-table.tsx`, `audit-filters.tsx`, `jobs-list.tsx`, `compare-view.tsx`, `risk-badge.tsx`
  - Layout/shell: `platform-shell.tsx`, `platform-nav.client.tsx`, `workspace-sidebar.tsx`, `workspace-page.tsx`
  - Full-page components: `marketing-home.tsx` (29KB), `printable-audit-report.tsx` (31KB), `docs-search.tsx` (13KB)
  - Auth: `login-form.tsx`, `register-form.tsx`, `auth-icons.tsx`
  - Charts: 6 `chart-*.tsx` files
  - Naming inconsistency: `theme-toggle.tsx` vs `theme-toggle-button.tsx` (two separate files)
  - Inconsistent `.client.tsx` suffix usage
- **Recommendation:** Group into subdirectories: `ui/` (primitives), `charts/`, `auth/`, `workspace/`, `marketing/`, `layout/`.

## 2. 6 Dead Files (Zero Imports) — Cross-Verified

| File | Lines | Notes |
|------|-------|-------|
| `lib/error-messages.ts` | 79 | i18n error messages, never consumed |
| `lib/status-utils.ts` | 28 | Status tone mapping, duplicated in `audit-jobs.ts` |
| `components/breadcrumb.tsx` | ~40 | Breadcrumb nav, never used |
| `components/metric-label.tsx` | ~25 | Metric display, never used |
| `components/progress.tsx` | ~80 | Progress bar, never used |
| `hooks/use-demo-mode.ts` | 34 | Demo mode hook, zero imports |

**Correction:** `workspace-frame.tsx` was initially reported as dead but is actually imported by 5 workspace page files. Retracted from this list.

- **Severity:** LOW
- **Recommendation:** Delete all 7 files. Add a lint rule or CI check for dead exports (e.g., `ts-prune` or `knip`).

## 3. `workspace-source.ts` — Trivial Facade (48 lines)

- **File:** `apps/web/src/lib/workspace-source.ts`
- **Severity:** LOW
- **Detail:** Every function is a one-line delegation:
  - `getWorkspaceDataMode()` → `isDemoModeEnabledServer()`
  - `getWorkspaceModeState()` → `isDemoModeEnabledServer()` + `isDemoModeForcedServer()`
  - `getWorkspaceCatalogData()` → `fetchCatalogDashboard()`
  - `getWorkspaceAttackDefenseData()` → `fetchAttackDefenseTable()`
  - Re-exports types from `catalog.ts` and `attack-defense-table.ts`
- **Recommendation:** Either add real facade logic (error normalization, caching) or remove the indirection and have callers import directly from source modules.

## 4. `hooks/` Directory Is Effectively Empty

- **Directory:** `apps/web/src/hooks/`
- **Severity:** MEDIUM
- **Detail:** 2 files, 135 lines total. `use-demo-mode.ts` is dead (zero imports). `use-theme.ts` is the only functional hook (3 importers). Meanwhile, 221 hook calls (`useState`, `useEffect`, etc.) across 33 component files are all inline. Notable: `SettingsClient.tsx` has 30 hook calls alone.
- **Recommendation:** Extract reusable stateful logic into hooks. Candidates: form state management, data fetching with retry, modal visibility, pagination state.

## 5. v1 Proxy Routes Are Pointless Thin Wrappers

- **Files:**
  - `apps/web/src/app/api/v1/catalog/route.ts`
  - `apps/web/src/app/api/v1/evidence/attack-defense-table/route.ts`
  - `apps/web/src/app/api/v1/models/route.ts`
  - `apps/web/src/app/api/v1/control/runtime/route.ts`
- **Severity:** LOW
- **Detail:** Each file contains only a single `proxyToBackend()` call. Maintaining 4+ files for what is essentially the same operation adds file navigation overhead without any value.
- **Recommendation:** Replace with a single catch-all proxy route or a dynamic route pattern.

## 6. Demo Mode Fragmented Across 4 Files

- **Files:**
  - `apps/web/src/lib/demo-mode-constants.ts` (5 lines, 118 bytes) — 2 string constants
  - `apps/web/src/lib/demo-mode.ts` — server-side check
  - `apps/web/src/lib/demo-mode-client.ts` — client-side check
  - `apps/web/src/lib/demo-jobs-store.ts` (174 lines) — in-memory job store
- **Severity:** LOW
- **Detail:** `demo-mode-constants.ts` exists solely to export `DEMO_MODE_COOKIE` and `DEMO_MODE_STORAGE_KEY`. Only imported by the two check files. The first three files total 72 lines combined.
- **Recommendation:** Merge constants + server check + client check into a single `demo-mode.ts`. Keep `demo-jobs-store.ts` separate (different concern).

## 7. `demo-jobs-store.ts` Uses Fragile `globalThis` Singleton

- **File:** `apps/web/src/lib/demo-jobs-store.ts` — lines 16-21
- **Severity:** MEDIUM
- **Detail:** `globalThis.__diffauditDemoJobs__` as in-memory store. Works only in Node.js server contexts. Will break in edge runtimes. Silently shares state across unrelated requests in the same process.
- **Recommendation:** Acceptable for demo mode, but document the limitation explicitly. Add a comment about edge runtime incompatibility.

## 8. `demo-jobs-store.ts` Re-Implements Domain Knowledge

- **File:** `apps/web/src/lib/demo-jobs-store.ts` — lines 28-42
- **Severity:** LOW
- **Detail:** `inferTargetModel` and `inferJobType` do string-contains checks on contract keys. This duplicates domain logic that should live in the catalog module.
- **Recommendation:** Import model/type inference from a shared domain utility.

## 9. Test Utility Misplaced in `lib/`

- **File:** `apps/web/src/lib/test-render.tsx` (70 lines)
- **Severity:** LOW
- **Detail:** A test utility living in `lib/` rather than a `__tests__/` or `test-utils/` directory. This gets bundled into production builds unless tree-shaking eliminates it.
- **Recommendation:** Move to `apps/web/src/test-utils/render.tsx` or similar.

## 10. `packages/shared/` Is a Dead Package

- **Directory:** `packages/shared/`
- **Severity:** LOW
- **Detail:** Contains 2 files: `contracts/README.md` (5 lines, stub) and `contracts/audit-job.example.json` (11 lines). Zero imports from `apps/web` or `apps/api-go`. Referenced in 5+ documentation files as an active architectural component.
- **Recommendation:** Either actually use it (import contracts as types) or remove it and update documentation. The current state is misleading.

## 11. No `knip` / `ts-prune` / Dead Code Detection

- **Severity:** MEDIUM
- **Detail:** No tooling to detect unused exports, dead files, or unimported modules. The 7 dead files found in this review accumulated because there's no automated check.
- **Recommendation:** Add `knip` or `ts-prune` to CI. Run it periodically to catch dead code before it accumulates.

## 12. `handleBestReconSummary` Hardcoded Contract Key (Go)

- **File:** `apps/api-go/internal/proxy/server.go` — line 181
- **Severity:** MEDIUM
- **Detail:** `entry.ContractKey != "black-box/recon/sd15-ddim"` is a magic string tying the gateway to a specific experiment. Catalog changes will silently break this endpoint.
- **Recommendation:** Make the "best recon" contract key configurable via the catalog manifest or a config file.

## 13. `serveCacheFallback` Has No Staleness Check (Go)

- **File:** `apps/api-go/internal/proxy/server.go` — lines 525-566
- **Severity:** LOW
- **Detail:** Cache fallback serves data indefinitely when the runtime is down. No TTL, no staleness indicator in the response.
- **Recommendation:** Add a `stale: true` flag to cached responses or include a `cachedAt` timestamp.

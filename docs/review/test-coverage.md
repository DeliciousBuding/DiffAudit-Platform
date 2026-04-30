# Test Coverage & Quality Gaps

> Generated: 2026-04-30 | Deep dive pass 2
> Reviewer note: 测试覆盖缺口，影响产品质量信心和回归检测能力。

---

## Overview

| Metric | Value |
|--------|-------|
| Source files (non-test, `apps/web/src`) | 151 |
| Test files | 46 |
| Files with test coverage | ~38 |
| Files with NO test coverage | ~113 |
| **Coverage ratio** | **~25%** |
| Integration tests | 0 |
| End-to-end tests | 0 |

---

## CRITICAL: Untested Security-Sensitive Code

### 1. All 12 Auth API Route Handlers — ZERO Tests

| Route | Criticality |
|-------|-------------|
| `api/auth/login/route.ts` | **CRITICAL** — credential validation, session creation |
| `api/auth/register/route.ts` | **CRITICAL** — account creation, duplicate detection |
| `api/auth/logout/route.ts` | HIGH — session invalidation |
| `api/auth/me/route.ts` | HIGH — session lookup |
| `api/auth/password/route.ts` | **CRITICAL** — password change |
| `api/auth/email/route.ts` | **CRITICAL** — email update |
| `api/auth/email-verification/route.ts` | **CRITICAL** — verification link generation |
| `api/auth/verify-email/route.ts` | **CRITICAL** — token verification |
| `api/auth/github/route.ts` | HIGH — OAuth initiation |
| `api/auth/github/callback/route.ts` | **CRITICAL** — token exchange, account linking (177 lines, 5 error paths) |
| `api/auth/google/route.ts` | HIGH — OAuth initiation |
| `api/auth/google/callback/route.ts` | **CRITICAL** — token exchange, account linking |

The GitHub callback handler alone has 177 lines with 5 distinct error redirect paths, external token exchange, email fallback logic, and account-linking mode — all untested.

### 2. Middleware — ZERO Tests

- **File:** `apps/web/src/middleware.ts`
- **Severity:** CRITICAL
- **Detail:** Controls session-gated access to all `/workspace/*` pages and `/api/v1/*` routes. Also manages locale header injection. Zero tests.

### 3. Database Layer — No Direct Tests

- **Files:** `lib/db/index.ts`, `lib/db/migrate.ts`, `lib/db/schema.ts`
- **Severity:** HIGH
- **Detail:** `db/index.ts` (connection singleton, schema migration, `ensureColumn` logic) is indirectly exercised by `auth.test.ts` but has no dedicated tests for migration paths or column-addition idempotency. `db/migrate.ts` is untested.

---

## HIGH: Key Logic Without Tests

### 4. `workspace-copy.ts` Key Parity — NOT TESTED

- **File:** `apps/web/src/lib/workspace-copy.ts` (1,869 lines)
- **Severity:** HIGH
- **Detail:** No test validates that `en-US` and `zh-CN` locale objects have the same keys at any level. A missing or misspelled key in one locale silently produces `undefined` at runtime.
- **Known bug:** `emptyWorkspace` section (~line 796-805) is Chinese inside the `en-US` key. A parity test would have caught this.

### 5. `demo-jobs-store.ts` — NOT TESTED

- **File:** `apps/web/src/lib/demo-jobs-store.ts` (174 lines)
- **Severity:** HIGH
- **Detail:** Non-trivial logic: in-memory job store, time-based status transitions (queued → running → completed), metric inference from contract keys, job creation with auto-generated IDs, cancellation. All untested.

### 6. OAuth Callback Routes — NOT TESTED

- **Files:** `api/auth/github/callback/route.ts`, `api/auth/google/callback/route.ts`
- **Severity:** CRITICAL (duplicate from above for emphasis)
- **Detail:** CSRF state validation, external HTTP calls, error redirects for 6+ failure modes, account linking vs login mode, email fallback. Zero tests.

---

## MEDIUM: Component and Visualization Gaps

### 7. Chart Components — ZERO Tests (6 files)

- `chart-attack-comparison.tsx`
- `chart-auc-distribution.tsx`
- `chart-empty-state.tsx`
- `chart-risk-distribution.tsx`
- `chart-risk-radar.tsx`
- `chart-roc-curve.tsx`

Data transformation bugs in these components silently produce wrong visualizations.

### 8. Key UI Components — NOT TESTED

- `login-form.tsx`, `register-form.tsx` — form validation and submission behavior
- `contracts-table.tsx`, `compare-view.tsx`, `results-table.tsx` — data display
- `jobs-list.tsx`, `live-jobs-panel.tsx` — job monitoring
- `workspace-sidebar.tsx`, `platform-shell.tsx` — layout/navigation
- `button.tsx`, `toast-provider.tsx` — core UI primitives
- `error-boundary.tsx` — error handling (itself has no tests, and is never used)

### 9. Demo Mode Subsystem — NOT TESTED

- `demo-mode.ts`, `demo-mode-client.ts`, `demo-mode-constants.ts`, `demo-snapshot.ts` — entire subsystem
- `audit-jobs.ts` — job management logic
- `locale.ts` — locale detection
- `navigation.ts` — navigation logic

---

## Test Quality Assessment

### Existing Tests: Good Lib-Level, Weak Component-Level

**Good:**
- `auth.test.ts`: Real temporary SQLite database, proper cleanup, covers edge cases
- `catalog.test.ts`: Structural assertions (`toEqual`), tests malformed entry resilience
- `audit-client.test.ts`: Happy/error paths, optional fields, metric summarization

**Weak:**
- `modal.test.tsx`: Only checks `aria-labelledby` linkage. Missing: `open={false}`, click-to-close, Escape key, backdrop click, focus trapping
- `tabs.test.tsx`: Only checks ARIA attributes. Missing: `onChange` callback, keyboard navigation, panel visibility

### Missing Patterns

- **No `null`/`undefined`/empty-string edge case testing** — `sanitizeRedirectPath` tested for `https://` and `//` but not for empty string, `null`, or `undefined`
- **No mock of external OAuth providers** — GitHub/Google API responses are never simulated
- **No integration tests** — zero tests exercise a full request lifecycle through middleware → route handler → database
- **No negative tests for `verifyCredentials`** — wrong password, empty username, SQL injection attempts

---

## Recommendations (Priority Order)

1. **Add tests for auth API routes** — especially login, register, password change, OAuth callbacks
2. **Add middleware tests** — session validation, locale propagation, auth redirects
3. **Add `workspace-copy.ts` key parity test** — validate both locales have identical structure
4. **Add `demo-jobs-store.ts` tests** — time-based state transitions are fragile
5. **Enhance component tests** — modal and tabs need interactive behavior tests
6. **Add chart component tests** — at minimum, verify data transformation logic

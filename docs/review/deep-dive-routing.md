# Deep Dive: Next.js Middleware, Routing & Navigation

> Generated: 2026-04-30 | Deep dive pass 5
> 17 findings: 1 CRITICAL, 4 HIGH, 9 MEDIUM, 3 LOW

---

## CRITICAL

### 1. `timingSafeStateEqual` Compares Buffer With Itself
- **File:** `apps/web/src/app/api/auth/github/callback/route.ts:41-49`, `google/callback/route.ts:57-65`
- **Detail:** Cross-verified with DB/auth audit — same bug. On length mismatch, `timingSafeEqual(bufA, bufA)` defeats timing-safe purpose. Also, Node.js throws `RangeError` when buffer lengths differ, so this masks a potential crash.

---

## HIGH

### 2. Session Cookie Validation Is Shallow — Middleware Accepts Forged Cookies
- **File:** `apps/web/src/middleware.ts:21-22`
- **Detail:** Only checks `sessionCookie.value.length >= 32`. Any 32+ character string passes. Not validated against database.

### 3. Middleware Matcher Omits `/api/auth/*` Routes
- **File:** `apps/web/src/middleware.ts:53-63`
- **Detail:** Only `/api/v1/:path*` is matched. `/api/auth/*` routes handle their own auth ad-hoc. `/api/auth/logout` does NOT check session.

### 4. Inconsistent API Response Formats
- **Files:** Multiple API routes
- **Detail:** Auth routes return `{ message: "..." }`, v1 routes return `{ detail: "..." }`, `/api/auth/me` returns `{ user: null }`. Three different error envelope shapes.

### 5. Demo Mode Defaults to Enabled When Cookie Is Ambiguous
- **File:** `apps/web/src/lib/demo-mode.ts:37-51`
- **Detail:** Cross-verified with data-layer audit. `return true` as default when cookie absent, unrecognized, or `cookies()` throws.

---

## MEDIUM

### 6. No Error Boundaries for `(auth)` and `(marketing)` Route Groups
- **Detail:** Only root and workspace have `error.tsx`. Login/register/docs errors bubble to root boundary, causing full page re-render.

### 7. `force-dynamic` on Root Layout Defeats Static Generation
- **File:** `apps/web/src/app/layout.tsx:20`
- **Detail:** Forces dynamic rendering for ALL pages, including marketing/landing that could be SSG.

### 8. `not-found.tsx` and Root `error.tsx` Have Hardcoded Chinese Primary Text
- **Files:** `apps/web/src/app/not-found.tsx:19-21`, `apps/web/src/app/error.tsx:30-32`
- **Detail:** Server components that don't read locale — always Chinese-first regardless of user language.

### 9. Missing `loading.tsx` for api-keys, account, settings, reports/[track]
- **Detail:** These pages show blank content during server component rendering with no loading indicator.

### 10. `resolveTurbopackRoot` Fallback Assumes Fixed Directory Depth
- **File:** `apps/web/next.config.ts:6-24`
- **Detail:** Falls back to `path.resolve(startDir, "../..")` — assumes monorepo layout. Docker/CI may break.

### 11. Logout Does Not Handle API Failures
- **File:** `apps/web/src/components/logout-button.tsx:5-12`
- **Detail:** Fire-and-forget fetch. If network fails, `window.location.assign` never runs. User stays on current page with no feedback.

### 12. `sanitizeRedirectPath` Does Not Block Backslash Variants
- **File:** `apps/web/src/lib/auth.ts:23-31`
- **Detail:** Blocks `//` but not `/\` or control characters. Potential open redirect after authentication.

### 13. `RouteRecovery` Can Cause Infinite Reload Loops
- **File:** `apps/web/src/components/route-recovery.tsx:25-65`
- **Detail:** Recovery marker cleared on successful component mount (`removeItem` at line 31). If chunk error occurs in a child component AFTER `RouteRecovery` mounts, the one-shot guard is defeated, causing infinite reload.

### 14. Workspace `error.tsx` Exposes `error.message` in Production
- **File:** `apps/web/src/app/(workspace)/workspace/error.tsx:50-56`
- **Detail:** Unlike root `error.tsx` (which checks localhost), workspace boundary always renders `error.message` — can leak DB connection strings, file paths, stack traces.

---

## LOW

### 15. Redundant Protection Logic Between Matcher and Helper Functions
- **File:** `apps/web/src/middleware.ts:7-13`

### 16. GitHub/Google OAuth `redirect_uri` Uses Fallback to localhost
- **File:** `apps/web/src/app/api/auth/github/route.ts:48`

### 17. No Rate Limiting (Cross-Verified With DB/Auth Audit)
- **Files:** Login, register endpoints

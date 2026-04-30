# Deep Dive: Database Schema & Auth Flows

> Generated: 2026-04-30 | Deep dive pass 5
> 22 findings: 4 CRITICAL, 4 HIGH, 8 MEDIUM, 6 LOW

---

## CRITICAL

### 1. SQL Injection in `ensureColumn` via String Interpolation
- **File:** `apps/web/src/lib/db/index.ts:76-81`, `apps/web/src/lib/db/migrate.ts:71-76`
- **Detail:** `table` and `ddl` parameters interpolated directly into raw SQL. Callers pass literals today, but the function signature accepts arbitrary strings.

### 2. `timingSafeStateEqual` Compares Buffer With Itself (Our Recent Bug)
- **File:** `apps/web/src/app/api/auth/github/callback/route.ts:41-49`, `apps/web/src/app/api/auth/google/callback/route.ts:57-65`
- **Detail:** When buffer lengths differ, `timingSafeEqual(bufA, bufA)` compares bufA with itself instead of bufB. Copy-paste typo in the fix we just committed.

### 3. No Rate Limiting on Any Auth Endpoint
- **File:** `apps/web/src/app/api/auth/login/route.ts`, `apps/web/src/app/api/auth/register/route.ts`
- **Detail:** Zero rate limiting, account lockout, or throttling. Searched `rate.?limit`, `brute`, `throttle`, `login.*attempts` — zero matches.

### 4. No Password Reset / Forgot Password Flow Exists
- **File:** Entire `apps/web/src/app/api/auth/` directory
- **Detail:** Searched `password.?reset`, `forgot.?password`, `reset.?token` — zero matches. Users who forget their password are permanently locked out.

---

## HIGH

### 5. Sessions Table Missing Index on `user_id`
- **File:** `apps/web/src/lib/db/schema.ts:16-22`
- **Detail:** `sessions.userId` has no index. "Invalidate all sessions for user X" = full table scan. Same for `email_verification_tokens.userId` and `passkeys.userId`.

### 6. No Session Cleanup — Zombie Sessions Accumulate Forever
- **File:** `apps/web/src/lib/auth.ts:485-510`
- **Detail:** Only lazy delete on `validateSession()`. No cron, no setInterval, no background task. Searched `cron`, `setInterval`, `cleanup`, `prune`, `gc(`, `garbage` — zero matches.

### 7. No Limit on Concurrent Sessions Per User
- **File:** `apps/web/src/lib/auth.ts:290-306`
- **Detail:** `createSession()` unconditionally inserts. No `MAX_SESSIONS`, no count check, no old-session revocation on new login.

### 8. WebAuthn/TOTP Tables Exist but Zero Implementation
- **File:** `apps/web/src/lib/db/schema.ts:44-65`
- **Detail:** `passkeys` and `two_factor_settings` tables created, `twoFactorEnabled` queried, but always returns `false`. No routes, no components, no enrollment flow.

---

## MEDIUM

### 9. Registration Form Never Sends the Email Field
- **File:** `apps/web/src/components/register-form.tsx:132`
- **Detail:** Sends `{ username, password, redirectTo }` — email is never included. `createUser` always receives `email: null`.

### 10. Weak Password Policy — 8 Characters, No Complexity
- **File:** `apps/web/src/app/api/auth/register/route.ts:15-17`
- **Detail:** Only `length >= 8`. No uppercase, digit, special character, or dictionary check. `aaaaaaaa` is accepted.

### 11. Email Verification Token Leaked in URL
- **File:** `apps/web/src/lib/auth.ts:334-336`
- **Detail:** Token appears in browser history, server logs, HTTP `Referer` headers. 30-minute expiry window is exploitable.

### 12. No Foreign Key Cascade Deletes — User Deletion Impossible
- **File:** `apps/web/src/lib/db/schema.ts` (all tables)
- **Detail:** No `ON DELETE CASCADE`. With `PRAGMA foreign_keys = ON`, deleting a user with child rows fails. Must manually clean all child tables first.

### 13. TOTP Secret and Recovery Codes Stored as Plain Text
- **File:** `apps/web/src/lib/db/schema.ts:60-61`
- **Detail:** Schema design stores these as plain `text`. If 2FA is ever implemented on this schema, database leak exposes all 2FA.

### 14. `getCurrentUserProfile` Issues 3 Separate Queries (N+1)
- **File:** `apps/web/src/lib/auth.ts:612-656`
- **Detail:** User row, OAuth providers, and 2FA settings fetched as 3 sequential queries instead of a join. Called on every authenticated request.

### 15. `findOrCreateOAuthUser` Is Not Atomic
- **File:** `apps/web/src/lib/auth.ts:517-610`
- **Detail:** Two separate inserts without a transaction. Second insert failure leaves a dangling user with no auth method.

### 16. `syncOAuthProfileToUser` Silently Overwrites User Data
- **File:** `apps/web/src/lib/auth.ts:250-288`
- **Detail:** Every OAuth callback updates displayName, email, avatarUrl from provider without user confirmation. No audit trail.

---

## LOW

### 17. Legacy Shared User Password Auto-Overwrite
- **File:** `apps/web/src/lib/auth.ts:104-118`

### 18. Duplicate `ensureColumn` Logic Across Two Files
- **File:** `apps/web/src/lib/db/index.ts:76-81`, `apps/web/src/lib/db/migrate.ts:71-76`

### 19. Schema Drift Risk — Three Separate Schema Definitions
- **File:** `schema.ts`, `index.ts:INIT_SQL`, `migrate.ts:SCHEMA_SQL`

### 20. Session Cookie `maxAge` Not Enforced Server-Side in Middleware
- **File:** `apps/web/src/middleware.ts:22`

### 21. `email` UNIQUE Constraint Can Cause Race Conditions in OAuth
- **File:** `apps/web/src/lib/db/schema.ts:7`

### 22. No Username Validation Beyond "Not Empty"
- **File:** `apps/web/src/app/api/auth/register/route.ts:11-13`
- **Detail:** No max length, no character set validation. HTML tags, Unicode, control characters all accepted.

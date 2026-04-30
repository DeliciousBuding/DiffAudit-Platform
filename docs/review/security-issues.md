# Security Issues Review

> Generated: 2026-04-30 | Severity: P0
> Reviewer note: 这些是安全层面的硬伤，优先级最高。

## 1. No Login Rate Limiting

- **File:** `apps/web/src/lib/auth.ts` — `verifyCredentials` (line 169), `verifyUserPassword` (line 158)
- **Severity:** HIGH
- **Detail:** No rate limiting, account lockout, or exponential backoff anywhere in the codebase. An attacker can brute-force passwords at bcrypt-speed. The login API route calls `verifyCredentials` directly on every attempt.
- **Recommendation:** Implement per-IP and per-account rate limiting. Consider exponential backoff after N failed attempts, or account lockout with cooldown.

## 2. TOTP Secrets Stored in Plaintext

- **File:** `apps/web/src/lib/db/schema.ts` — `twoFactorSettings.totpSecret` (line 60)
- **Severity:** HIGH
- **Detail:** The TOTP secret is stored as a plain text column in SQLite. If the database file is compromised, all 2FA secrets are immediately usable by the attacker.
- **Recommendation:** Encrypt TOTP secrets at rest using a server-side key (e.g., AES-256-GCM with a key derived from an environment secret).

## 3. Session Tokens Stored in Plaintext

- **File:** `apps/web/src/lib/auth.ts` — session creation (line 289)
- **Severity:** HIGH
- **Detail:** The session token `crypto.randomBytes(32).toString("base64url")` is stored directly in `sessions.token`. If the database leaks, all active sessions are immediately compromised.
- **Recommendation:** Store a SHA-256 hash of the token in the database. Compare hashes during `validateSession`.

## 4. `ensureLegacySharedUser` Silently Overwrites Password

- **File:** `apps/web/src/lib/auth.ts` — lines 108-115
- **Severity:** HIGH
- **Detail:** If the stored password hash does not match the `DIFFAUDIT_SHARED_PASSWORD` environment variable, the function silently overwrites the hash. Restarting the application with a different env value changes the shared user's password without any warning or audit trail.
- **Recommendation:** Log a warning when mismatch is detected. Consider requiring an explicit reset action instead of silent overwrite.

## 5. `ensureColumn` SQL Injection Surface

- **File:** `apps/web/src/lib/db/index.ts` — lines 76-81
- **Severity:** HIGH
- **Detail:** `table` and `column` parameters are interpolated directly into `PRAGMA table_info(${table})` and `ALTER TABLE ${table} ADD COLUMN ${ddl}`. Currently called with hardcoded values only, but the function signature accepts arbitrary strings with no sanitization.
- **Recommendation:** Add input validation or use parameterized queries. At minimum, validate that table/column names match `[a-zA-Z_][a-zA-Z0-9_]*`.

## 6. No Request Body Size Limit (Go Gateway)

- **File:** `apps/api-go/internal/proxy/server.go` — line 206
- **Severity:** HIGH
- **Detail:** `io.ReadAll(request.Body)` with no size limit. An attacker can send a multi-gigabyte body to exhaust server memory.
- **Recommendation:** Wrap `request.Body` with `http.MaxBytesReader` before reading.

## 7. `emailLooksValid` Regex Too Permissive

- **File:** `apps/web/src/lib/auth.ts` — line 242
- **Severity:** LOW
- **Detail:** `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` accepts `a@b.c`, `foo@bar..baz`, and other malformed addresses.
- **Recommendation:** Use a more robust regex or a dedicated email validation library.

## 8. No CSRF Protection on State-Changing Endpoints

- **File:** `apps/web/src/lib/auth.ts` — session cookie `sameSite: "lax"` (line 657)
- **Severity:** MEDIUM
- **Detail:** `sameSite: "lax"` provides partial protection, but POST endpoints (login, register, password change, email change) have no CSRF token validation. A cross-origin top-level navigation could trigger these.
- **Recommendation:** Add CSRF token validation for all state-changing POST endpoints, or use `sameSite: "strict"` for the session cookie.

## 9. OAuth Username TOCTOU Race

- **File:** `apps/web/src/lib/auth.ts` — `findOrCreateOAuthUser` (lines 580-583)
- **Severity:** LOW
- **Detail:** Checks if username is taken, then appends random hex if collision detected. No unique constraint retry — concurrent OAuth logins generating the same base username will cause an unhandled constraint violation.
- **Recommendation:** Wrap in a retry loop that catches unique constraint violations.

## 10. `proxyJsonToBackend` Returns Wrong Status on Parse Failure

- **File:** `apps/web/src/lib/api-proxy.ts` — lines 33-37
- **Severity:** MEDIUM
- **Detail:** If `upstream.json()` fails, the function returns `upstream.status` (which could be 200) with a synthetic error message. The status should be overridden to 502 when the body is malformed.
- **Recommendation:** Return 502 when JSON parsing fails regardless of upstream status.

## 11. All Fetch Errors Silently Swallowed in `api-proxy.ts`

- **File:** `apps/web/src/lib/api-proxy.ts` — `fetchBackend` catch block (line 58)
- **Severity:** MEDIUM
- **Detail:** Bare `catch` converts every possible failure (DNS, TLS, timeout, programming errors) into the same generic 502 with no logging. Production debugging is nearly impossible.
- **Recommendation:** Log the actual error server-side before returning the generic response. Differentiate between timeout (504) and connection failure (502).

## 12. Workspace Path Parameter Not Validated

- **File:** `apps/web/src/app/api/v1/experiments/[workspace]/summary/route.ts` — line 8
- **Severity:** MEDIUM
- **Detail:** The `[workspace]` path parameter is passed directly to `proxyToBackend` without encoding or validation. While the Go gateway's `normalizeWorkspaceKey` takes the last path segment (mitigating traversal), the Next.js side should validate before forwarding.
- **Recommendation:** Validate that workspace matches `[a-zA-Z0-9_-]+` before proxying.

## 13. Go Gateway `forwardControl` Reads Entire Response Into Memory

- **File:** `apps/api-go/internal/proxy/server.go` — line 355
- **Severity:** LOW
- **Detail:** `io.ReadAll(response.Body)` loads the full upstream response into memory. For large payloads this could cause memory pressure.
- **Recommendation:** Stream the response body using `io.Copy` to the response writer instead.

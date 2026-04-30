# Adversarial Review: Our Own Fixes

> Generated: 2026-04-30 | Adversarial pass
> 40 findings: 3 CRITICAL, 9 HIGH, 15 MEDIUM, 12 LOW
> Focus: Are our fixes correct, complete, and well-designed?

---

## CRITICAL — Fix Introduces New Bugs

### 1. `timingSafeStateEqual(bufA, bufA)` — Security Fix Is Broken
- **Files:** `github/callback/route.ts:45`, `google/callback/route.ts:61`
- **Cross-verified:** 3 of 4 agents independently found this
- **Detail:** On length mismatch, compares bufA with itself instead of bufB. Defeats timing-safe purpose. Also, Node.js throws RangeError on length mismatch — this masks a potential crash with a self-comparison that always returns true.
- **Fix:** Either pad the shorter buffer or accept the timing leak on length (it only leaks the length of a fixed-format nonce).

### 2. Password Save Displays Verification-Link Error Message
- **File:** `SettingsClient.tsx:369`
- **Detail:** `catch` block sets `passwordError(copy.account.verificationRequestFailed)`. This message is about email verification links ("Could not generate a verification link right now.") — completely unrelated to password saving. Previous code used `passwordTooShort` (also wrong), replacement is semantically worse.
- **Fix:** Add a dedicated `passwordSaveFailed` key to workspace-copy.

### 3. `SAFE_PATH_SEGMENT` Duplicated — Same Pattern We Just Fixed
- **Files:** `[jobId]/route.ts:6`, `[workspace]/summary/route.ts:3`
- **Detail:** `backendBaseUrl` was deduplicated from 5 files, but the same commit introduces a new duplicated regex constant. No length bound either — 100K-char jobId passes validation.
- **Fix:** Extract to shared `lib/path-validation.ts`, add `value.length <= 128`.

---

## HIGH — Fixes Are Incomplete or Create False Confidence

### 4. Middleware Session Validation Is Security Theater
- **File:** `middleware.ts:22`
- **Cross-verified:** 2 agents found this
- **Detail:** `length >= 32` check does not validate against database. Any 32+ char string passes. Gives false sense of protection. The actual validation happens downstream in `validateSession()`.
- **Recommendation:** Either do real validation (DB lookup) or remove pretense. Current position is worst of both worlds.

### 5. `proxyJsonToBackend` Hardcoded 502 Masks Upstream 4xx
- **File:** `api-proxy.ts:32-37`
- **Detail:** Old code preserved `upstream.status`. New code always returns 502 on parse failure. Backend returning 400 Bad Request with HTML body now appears as 502 — impossible to distinguish "rejected request" from "gateway broken".
- **Fix:** Preserve upstream status when available: `upstream.status >= 200 && upstream.status < 600 ? upstream.status : 502`

### 6. `console.error("[api-proxy]", error)` Leaks Backend Infrastructure Details
- **File:** `api-proxy.ts:58-60`
- **Detail:** Raw fetch errors include full URL (`http://127.0.0.1:8780/...`), connection details, and stack traces. Goes to stdout/stderr captured by log aggregation. Sanitize before logging.

### 7. Registration Error Enables Username Enumeration (409 vs 500)
- **File:** `register/route.ts:27`
- **Detail:** `error.message.includes("UNIQUE")` returns 409 for existing usernames, 500 for other errors. Attacker can enumerate registered usernames. Also, `console.error("Registration failed:", error)` may log the user's password alongside the DB error.

### 8. "Saved" Indicator Cross-Contaminates Across Sections
- **File:** `SettingsClient.tsx:636, 683, 759`
- **Detail:** Three sections compare `savedMsg` against their own `copy.XXX.saved`, but all three are the same string ("Saved" / "已保存"). Saving runtime host shows "Saved" on audit config too.
- **Fix:** Track which section was saved via a `savedSection` enum, not the message text.

### 9. API Key Create/Revoke Is Entirely Client-Side Mock
- **File:** `ApiKeysClient.tsx:51-101`
- **Detail:** `handleCreate` generates fake key with `Math.random()`. `handleRevoke` flips local state. No fetch calls. Created keys vanish on refresh. Users believe they have real API keys.

### 10. `knownViolations` List Is Stale — Suppresses Future Detection
- **File:** `workspace-copy.test.ts:45-53`
- **Detail:** The emptyWorkspace Chinese text was already fixed, but `knownViolations` still whitelists those paths. If Chinese text is re-introduced, the test won't catch it.
- **Fix:** Remove the `knownViolations` set (or make it fail if the paths no longer contain violations).

### 11. Demo Mode Has No Single Enforcement Boundary
- **Cross-verified:** 2 agents found this
- **Detail:** Checked at 10+ call sites. Opt-in guard pattern — forgetting to check means silent live-backend failure. Should be resolved once at the request boundary.

### 12. `error-messages.ts` Deleted Without Replacement
- **File:** `lib/error-messages.ts` (deleted)
- **Detail:** Contained `getErrorMessage()` and `mapErrorToMessage()` — exactly the infrastructure needed for Finding #2. Deletion removed capability without replacement.

---

## MEDIUM

### 13. OAuth State Cookie Is Unsigned
- **File:** `github/callback/route.ts:160`, `google/callback/route.ts:149`
- **Detail:** `storedState.userId` is embedded in base64url-encoded state cookie without HMAC. Cookie injection on subdomain can forge userId in connect mode.

### 14. Demo Mode Defaults to Enabled; Unrecognized Cookie Values Fall Through to `true`
- **File:** `demo-mode.ts:24-50`
- **Detail:** `return true` as default. Production deployment without explicit `DIFFAUDIT_FORCE_DEMO_MODE=0` silently serves stale data.

### 15. 504/AbortError Branch Is Dead Code in Proxy Path
- **File:** `api-proxy.ts:60`
- **Detail:** `fetchBackend` checks for `DOMException` AbortError, but no caller passes AbortSignal. Timeout logic lives in `fetchWithTimeout` (different call path). The 504 classification can never execute.

### 16. `SAFE_PATH_SEGMENT` Has No Length Bound
- **Files:** Two route files
- **Detail:** `^[a-zA-Z0-9_-]+$` accepts arbitrarily long values. 100K-char jobId passes.

### 17. Verify-Email Error Parameter Changed — Client May Depend on Old Values
- **File:** `verify-email/route.ts:15`
- **Detail:** `emailVerified=${result.reason}` changed to `emailVerified=error`. Client code checking for specific reasons (`expired`, `invalid`) breaks.

### 18. `showSaved` Timeout Stacking Race Condition
- **File:** `SettingsClient.tsx:272-275`
- **Detail:** Each `showSaved()` call creates a new `setTimeout` without clearing the previous one. Rapid saves cause premature "Saved" indicator disappear.

### 19. `selectedScopes` Not Reset on Dialog Close
- **File:** `ApiKeysClient.tsx:56-58`
- **Detail:** Cancel/Done resets `showCreate` and `createdKey` but not `selectedScopes`. Reopening dialog shows stale checkbox state.

### 20. API Key Revoke Has No Confirmation Dialog
- **File:** `ApiKeysClient.tsx:97-100`
- **Detail:** Irreversible action with no confirmation. Poor UX precedent.

### 21. `handleRoundsChange`/`handleBatchSizeChange` Write localStorage on Every Keystroke
- **File:** `SettingsClient.tsx:287-298`
- **Detail:** `onChange` triggers `localStorage.setItem` per keystroke. Partial invalid values (empty string) also saved.

### 22. No Rate Limiting on Auth Endpoints (Pre-existing, Not Addressed)
- **Files:** Login, register routes

### 23. Auth Headers Never Forwarded by Proxy
- **File:** `api-proxy.ts:48-66`
- **Detail:** All server-side data fetching to backend is unauthenticated. `backendBaseUrl()` + `fetchWithTimeout` pattern propagates this to future consumers.

### 24. Test `collectKeys` Doesn't Check Value Types, Only Key Paths
- **File:** `workspace-copy.test.ts:5-16`

### 25. Track Report Page Bypasses Route-Level Path Validation
- **File:** `track-report-page.tsx:160`
- **Detail:** Constructs URL directly against backend with `encodeURIComponent`, skipping `SAFE_PATH_SEGMENT` guard.

---

## LOW

### 26. Password Hash Overwriting Is Silent — Could Mask Integrity Issues
- **File:** `auth.ts:108`

### 27. Magic Number 32 for Session Token Length Is Undocumented
- **File:** `middleware.ts:22`

### 28. `timingSafeStateEqual` Duplicated Across Two Files
- **Files:** Both OAuth callback routes

### 29. Path Regex Excludes Dots — Constrains Backend ID Design
- **File:** `[jobId]/route.ts:6-10`

### 30. `DEFAULT_API_BASE_URL` Exported Unnecessarily
- **File:** `api-proxy.ts`

### 31. Lost Diagnostic Distinction Between Parse-Failure Types
- **File:** `api-proxy.ts:32-37`

### 32. Validation Before Demo-Check Creates Format Side-Channel
- **File:** `[jobId]/route.ts:17-19`

### 33. Key ID Uses `Date.now()` — Can Collide
- **File:** `ApiKeysClient.tsx:74-75`

### 34. Clipboard Failure Silently Swallowed
- **File:** `ApiKeysClient.tsx:89-94`

### 35. Deleted Files Confirmed Dead (Zero Imports)
- **All 6 deleted files**

### 36. English Translations Adequate but Slightly More Formal Than Chinese
- **File:** `workspace-copy.ts:797-804`

### 37. Error Log May Include Password on Registration Failure
- **File:** `register/route.ts:27`

### 38. `backendBaseUrl` Exported From Wrong Module (Semantic Coupling)
- **File:** `api-proxy.ts`

### 39. Registration Error `includes("UNIQUE")` Is Overly Broad
- **File:** `register/route.ts:27`

### 40. Verify-Email Still Acts as Token-Validity Oracle
- **File:** `verify-email/route.ts:15`

---

## Top 5 Must-Fix (Our Fixes Need Fixing)

1. **`timingSafeStateEqual(bufA, bufA)`** — security fix has a security bug
2. **Password save shows verification-link error** — wrong copy key
3. **"Saved" indicator cross-contaminates** — same string "Saved" for all sections
4. **`knownViolations` stale** — defeats the purpose of the regression test
5. **`proxyJsonToBackend` hardcoded 502** — masks upstream 4xx status codes

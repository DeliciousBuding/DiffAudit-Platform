# OAuth Security Vulnerabilities

> Generated: 2026-04-30 | Deep dive pass 4

## HIGH

### 1. Connect Mode Does Not Re-Authenticate Current User

- **Files:** `github/callback/route.ts:148`, `google/callback/route.ts:137`
- **Detail:** The callback reads `userId` from the state cookie and passes it directly to `linkOAuthAccount` without verifying the current session belongs to that user. The initiation route checks `getCurrentUserProfile()` but the callback does not repeat this check.
- **Attack:** If an attacker can inject/overwrite the `diffaudit_oauth_state` cookie, they can set `mode: "connect"` and `userId: "<victim>"` to link their own OAuth account to the victim's account.
- **Fix:** Call `getCurrentUserProfile()` at the top of the callback and verify session's userId matches `storedState.userId`.

### 2. OAuth Account Auto-Linking by Email — Account Takeover Vector

- **File:** `auth.ts:547-575` (`findOrCreateOAuthUser`)
- **Detail:** When OAuth returns a verified email matching an existing user's verified email, the system silently links the OAuth account to that user. No notification, no confirmation.
- **Attack:** Attacker compromises email → creates GitHub/Google account with that email → system silently merges OAuth identity into victim's account.
- **Fix:** Require explicit confirmation before auto-linking, or require the user to authenticate with existing credentials first.

## MEDIUM

### 3. OAuth State Comparison Not Timing-Safe

- **Files:** `github/callback/route.ts:65`, `google/callback/route.ts:81`
- **Detail:** State comparison uses `!==` instead of `crypto.timingSafeEqual`. State has 128 bits of entropy making timing attacks infeasible, but this violates defense-in-depth.

## LOW-MEDIUM

### 4. Verification Failure Reason Leaked in URL

- **File:** `verify-email/route.ts:15`
- **Detail:** `result.reason` (`"invalid"`, `"expired"`, `"missing_pending_email"`) reflected into redirect URL. Helps attacker enumerate valid tokens.
- **Fix:** Use generic `emailVerified=error`.

### 5. Verification Token Exposed via GET Query Parameter

- **File:** `verify-email/route.ts:5-6`
- **Detail:** Token in `?token=...` appears in server logs, browser history, Referer headers, CDN logs.
- **Fix:** Use POST endpoint or one-time nonce.

### 6. Google OAuth Missing PKCE and Nonce

- **File:** `google/route.ts:46-56`
- **Detail:** No PKCE, no nonce, `id_token` declared but never validated.

## INFORMATIONAL

### 7. No Server-Side OAuth Code Single-Use Tracking

Both callbacks rely entirely on the provider to reject replayed codes. No defense-in-depth.

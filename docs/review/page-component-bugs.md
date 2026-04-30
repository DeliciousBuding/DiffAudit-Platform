# Page Component Bugs

> Generated: 2026-04-30 | Deep dive pass 4

## ApiKeysClient.tsx — Mostly Non-Functional

### 1. Permission Checkboxes Never Read (HIGH)

- **File:** `ApiKeysClient.tsx:111`
- **Detail:** `defaultChecked` (uncontrolled) checkboxes. `handleCreate` never reads checkbox values. All created keys have empty scopes. The entire permissions UI is non-functional.

### 2. Revoke Button Has No Handler (HIGH)

- **File:** `ApiKeysClient.tsx:232`
- **Detail:** `<button>` with no `onClick`. Clicking does nothing.

### 3. New Key Never Added to List (MEDIUM)

- **File:** `ApiKeysClient.tsx:51`
- **Detail:** `const [keys] = useState<ApiKey[]>(MOCK_KEYS)` — no setter. Created key shows in banner but never in the list.

### 4. Clipboard Copy Shows "Copied!" Even When It Fails (LOW)

- **File:** `ApiKeysClient.tsx:66-67`
- **Detail:** `.catch(() => {})` swallows error, but `setCopied(true)` runs unconditionally.

## SettingsClient.tsx — Multiple Logic Bugs

### 5. Password Error Always Shows "Too Short" (HIGH)

- **File:** `SettingsClient.tsx:354-367`
- **Detail:** Catch block and non-OK response both fall back to `copy.account.passwordTooShort`. Actual errors (wrong current password, server error) are hidden.

### 6. SSRF in Runtime Connection Test (MEDIUM)

- **File:** `SettingsClient.tsx:301-313`
- **Detail:** User-controlled `runtimeHost`/`runtimePort` from localStorage used directly in `fetch()`. Could probe `169.254.169.254` (cloud metadata) or internal services.

### 7. "Saved!" Indicator Never Displays (MEDIUM)

- **File:** `SettingsClient.tsx:634,650`
- **Detail:** `showSaved` called with `copy.auditConfig.defaultRounds` but checked against `copy.auditConfig.saved`. These strings never match. The "Saved!" feedback for audit config is invisible. Runtime config section never calls `showSaved` at all.

### 8. 2FA/Passkey/TOTP UI Completely Missing (MEDIUM)

- **Detail:** DB schema and auth.ts have full 2FA/passkey support. The settings page has zero UI for it.

## Dashboard (page.tsx) — Misleading Visualizations

### 9. Attack Comparison Chart Uses Hardcoded Data (HIGH)

- **File:** `page.tsx:117-123`
- **Detail:** Static numbers (Recon: 0.78, PIA: 0.65, GSA: 0.82). Always the same regardless of actual audit data.

### 10. AUC Trend Uses Array Order, Not Chronological (MEDIUM)

- **File:** `page.tsx:82-93`
- **Detail:** First 5 rows = "recent", next 5 = "previous". No `.sort()` call. Comparison is meaningless if rows aren't date-ordered.

### 11. ROC Curve Is Synthetic (MEDIUM)

- **File:** `page.tsx:106-108`
- **Detail:** `generateRocData(avgAuc)` uses `tpr = fpr^(1-auc)` — a mathematical approximation, not actual model data. Misleading in a security audit context.

### 12. `coverageRatio` Formula Likely Wrong (MEDIUM)

- **File:** `page.tsx:135`
- **Detail:** `1 - (low_risk / total)` measures "proportion of non-low-risk rows", not "audit coverage". Name is misleading.

### 13. `defenseEffectiveness` Saturates at 50% (LOW)

- **File:** `page.tsx:136`
- **Detail:** `* 2` multiplier means 50% defense ratio = 100% effectiveness. Arbitrary and misleading.

## CreateTaskClient.tsx — Input Handling Bugs

### 14. Numeric Input Visual/State Desync (MEDIUM)

- **File:** `CreateTaskClient.tsx:384-388`
- **Detail:** Clearing the input produces `NaN`, which is rejected but the field stays empty while state retains old value. No `value` binding to force re-render.

### 15. Time Estimate Uses Hardcoded 2s/Round (LOW)

- **File:** `CreateTaskClient.tsx:511`
- **Detail:** `form.rounds * 2` with no basis. No minutes conversion for large values.

## JobDetailClient.tsx — Minor Issues

### 16. Cancel Failure Silently Swallowed (LOW)

- **File:** `JobDetailClient.tsx:204-217`
- **Detail:** Failed DELETE does nothing. Modal closes, no error feedback.

### 17. Polling Logic Correct But Fragile (LOW)

- **Detail:** `cancelled` flag is the only guard against stale closures. Adding an `await` between check and `setTimeout` would open a race window.

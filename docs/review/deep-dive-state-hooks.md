# Deep Dive: React State Management & Hooks

> Generated: 2026-04-30 | Deep dive pass 5
> 20 findings: 0 CRITICAL, 2 HIGH, 6 MEDIUM, 12 LOW

---

## HIGH

### 1. `JobsList` Polling Never Stops in Non-English Locales
- **File:** `apps/web/src/components/jobs-list.tsx:137`
- **Detail:** Auto-stop logic checks `j.status === "completed" || j.status === "failed"`, but `status` has already been translated through `statusLabels` at line 98. In zh-CN, the status is `"已完成"` / `"失败"`, never matching the English strings. Polling runs indefinitely (every 3 seconds) even after all jobs are terminal.

### 2. SettingsClient: 31 Separate `useState` Hooks in One Component
- **File:** `apps/web/src/app/(workspace)/workspace/settings/SettingsClient.tsx:153-183`
- **Detail:** 31 state variables covering 5 independent feature areas. Any state change triggers full component re-render. Password form, email editor, runtime test, and audit config all re-render on every keystroke in any input.

---

## MEDIUM

### 3. Timer Leak in `showSaved` Callback
- **File:** `apps/web/src/app/(workspace)/workspace/settings/SettingsClient.tsx:274`
- **Detail:** `window.setTimeout` creates timer that's never tracked or cleared on unmount.

### 4. Duplicate Data-Fetching Components (JobsList vs LiveJobsPanel vs TaskListClient)
- **Files:** `jobs-list.tsx`, `live-jobs-panel.tsx`, `TaskListClient.tsx`
- **Detail:** Three components independently fetch `/api/v1/audit/jobs` with their own copies of type definitions, `statusTone()`, `formatUpdatedAt()`, and `summarizeAuditJobs()`. When rendered on the same page, they issue redundant API requests.

### 5. Missing Cleanup for `setTimeout` in CreateTaskClient
- **File:** `apps/web/src/app/(workspace)/workspace/audits/new/CreateTaskClient.tsx:170-172`
- **Detail:** `setTimeout(() => router.push(...), 900)` — timer never cleared. If user navigates away, `router.push` fires on stale URL.

### 6. ExportReportButton Memory Leak — Print Window Not Cleaned Up on Cancel
- **File:** `apps/web/src/components/export-report-button.tsx:89-185`
- **Detail:** `printWindow.onafterprint = cleanup` only fires on actual print. User cancel does not trigger `onafterprint` in all browsers. Orphaned popup window and React root leak.

### 7. `useSearchParams` Without Suspense Boundary in LoginForm
- **File:** `apps/web/src/components/login-form.tsx:77`
- **Detail:** Next.js App Router requires Suspense boundary above `useSearchParams()`. Login page does not wrap `LoginForm` in `<Suspense>`. Causes client-side rendering deopt.

### 8. Demo Mode Client/Server Inconsistency (Cross-Verified)
- **Files:** `demo-mode-client.ts`, `demo-mode.ts`, `SettingsClient.tsx`
- **Detail:** Client reads `localStorage`, server reads cookie. Key names differ (`-v1` suffix). Divergence causes UI to show different mode than server serves.

### 9. Error Boundary Coverage Gap — Custom ErrorBoundary Never Wired In
- **Files:** `error-boundary.tsx`, `layout.tsx`, `providers.tsx`
- **Detail:** Custom `ErrorBoundary` component exists but is never imported or rendered. Errors in `ToastProvider` or `PlatformShell` crash the entire app with no graceful fallback.

### 10. Login/Register Forms: No `try/catch` Around Fetch
- **Files:** `login-form.tsx:128-143`, `register-form.tsx:129-145`
- **Detail:** Network error during login permanently locks form in pending state. `pending` stays `true` forever, submit button permanently disabled.

---

## LOW

### 11. Modal: `onClose` in useEffect Dependency Array
- **File:** `apps/web/src/components/modal.tsx:72`

### 12. Tooltip: Stale Closure in handleEnter/handleLeave
- **File:** `apps/web/src/components/tooltip.tsx:76-95`

### 13. ParticleField: Canvas Re-creation on Every Theme Toggle
- **File:** `apps/web/src/components/particle-field.tsx:88-268`

### 14. UserAvatar: Stale `avatarError` State Across User Changes
- **File:** `apps/web/src/components/user-avatar.tsx:29, 114`

### 15. SettingsClient: localStorage Read on Every Mount (UI Flicker)
- **File:** `apps/web/src/app/(workspace)/workspace/settings/SettingsClient.tsx:186-211`

### 16. Tabs: `useEffect` Injects Style Tag Without Cleanup
- **File:** `apps/web/src/components/tabs.tsx:53-62`

### 17. LanguagePicker: Suppressed `exhaustive-deps` Lint Rule
- **File:** `apps/web/src/components/language-picker.tsx:79-85`

### 18. RuntimeStatusBadge: No Polling or Refresh Mechanism
- **File:** `apps/web/src/components/runtime-status-badge.tsx:20-53`

### 19. AuditFilters: Stale Closure in emitChange Handlers
- **File:** `apps/web/src/components/audit-filters.tsx:46-69`

### 20. RouteRecovery: Infinite Reload Loop (Cross-Verified With Routing Audit)
- **File:** `apps/web/src/components/route-recovery.tsx:25-65`

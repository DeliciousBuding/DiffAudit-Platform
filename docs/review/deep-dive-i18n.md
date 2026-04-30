# Deep Dive: i18n Completeness & Workspace-Copy Consistency

> Generated: 2026-04-30 | Deep dive pass 5
> 16 findings: 0 CRITICAL, 4 HIGH, 5 MEDIUM, 7 LOW

---

## HIGH

### 1. Chinese Text in en-US `emptyWorkspace` — Test Acknowledges But Doesn't Fix
- **File:** `apps/web/src/lib/workspace-copy.ts:797-805`
- **Detail:** 7 fields contain Chinese text. Test at `workspace-copy.test.ts:45-53` adds them as `knownViolations`, suppressing failure rather than fixing. English users see "还没有审计结果。" as their first impression.

### 2. Hardcoded English in `risk-report.ts` Bypasses workspace-copy
- **File:** `apps/web/src/lib/risk-report.ts:9-29`
- **Detail:** `riskLabel()` and `defenseRecommendation()` use inline ternary with hardcoded "High"/"Medium"/"Low" instead of `WORKSPACE_COPY.riskBadgeLabels`. Inconsistent with workspace-copy which uses "High risk".

### 3. Hardcoded English in `generateReportHTML` — PDF Export
- **File:** `apps/web/src/lib/risk-report.ts:48-181`
- **Detail:** "Diffusion Model Privacy Audit Report", "Date", "Total Results", "Avg. Attack AUC", all table headers, "Conclusions & Recommendations", footer — all hardcoded English. Chinese users export mixed-language PDFs.

### 4. Hardcoded English in `PrintableAuditReport`
- **File:** `apps/web/src/components/printable-audit-report.tsx:406-715`
- **Detail:** "Rows", "Contracts", "Avg AUC", "Model", "Summary", "Risk distribution" — all hardcoded. Chinese users get English summary text mixed with Chinese table content.

---

## MEDIUM

### 5. Hardcoded English in `JobDetailClient` Metric Labels
- **File:** `apps/web/src/app/(workspace)/workspace/audits/[jobId]/JobDetailClient.tsx:332-359, 495`
- **Detail:** "Execution progress", "Membership separation strength", "Attack success rate", "Low false-positive operating point", "Job:" — all English-only.

### 6. Hardcoded English in `ContractsTable` Headers
- **File:** `apps/web/src/components/contracts-table.tsx:43-48`
- **Detail:** All 6 table headers ("Contract", "Status", "Risk", "System Gap", "Workspace", "Action") are hardcoded English.

### 7. Hardcoded English in `audit-jobs.ts` Server-Side Module
- **File:** `apps/web/src/lib/audit-jobs.ts:68-104`
- **Detail:** `formatUpdatedAt()` hardcoded to `"en-US"` locale. Fallback strings: "just now", "unknown-job", "unknown contract", "pending workspace" — all English.

### 8. Hardcoded English Aria-Labels in Navigation Components
- **Files:** `platform-nav.client.tsx:17,47`, `workspace-sidebar.tsx:17`, `user-avatar.tsx:104`, `toast.tsx:49`
- **Detail:** workspace-copy already defines `shell.desktopNavAriaLabel` and `shell.mobileNavAriaLabel`, but components hardcode English instead. Screen reader users with zh-CN hear English landmark labels.

### 9. Login/Register Pages: Brittle Locale-Conditional Logic
- **Files:** `login/page.tsx:63`, `register/page.tsx:59`
- **Detail:** `locale === "zh-CN" ? copy.description.split("。")[0] : "Welcome back to your workspace."` — zh-CN branch uses fragile `.split("。")[0]` truncation; en-US branch hardcodes string not from workspace-copy.

---

## LOW

### 10. `formatDuration()` Not Locale-Aware
- **Files:** `JobDetailClient.tsx:69-79`, `TaskListClient.tsx:64-74`
- **Detail:** Always produces "2m 30s" / "1h 15m" with English suffixes.

### 11. No RTL Support
- **Detail:** Zero matches for `dir=`, `direction.*rtl`, `RTL` across entire `apps/web/src`.

### 12. Cookie Name Fragility — Middleware Imports From Client Component
- **Files:** `language-picker.tsx:6`, `middleware.ts:4`, `locale.ts:3`

### 13. Middleware Does Not Detect `Accept-Language` Header
- **File:** `apps/web/src/middleware.ts:19-50`
- **Detail:** First-time visitors without cookie always see English. No browser language detection.

### 14. Test Only Checks Chinese-in-English, Not English-in-Chinese
- **File:** `apps/web/src/lib/workspace-copy.test.ts:41-68`

### 15. Hardcoded "User" Fallback in `user-avatar.tsx`
- **File:** `apps/web/src/components/user-avatar.tsx:122, 145`

### 16. Hardcoded "pending workspace" Fallback in `live-jobs-panel.tsx`
- **File:** `apps/web/src/components/live-jobs-panel.tsx:100`

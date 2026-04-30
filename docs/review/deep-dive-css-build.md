# Deep Dive: CSS/Styling, Tailwind & Build Configuration

> Generated: 2026-04-30 | Deep dive pass 5
> 15 findings: 0 CRITICAL, 4 HIGH, 6 MEDIUM, 5 LOW

---

## HIGH

### 1. Undefined CSS Variable `--background-rgb` Breaks Header Transparency
- **File:** `apps/web/src/app/globals.css:600, 606`
- **Detail:** `.header` uses `rgba(var(--background-rgb), 0.58)` but `--background-rgb` is never defined. The variable `--background` resolves to a hex value. Passing hex into `rgba()` produces an invalid value. Header translucent background silently broken.

### 2. `.mono` Class Applies Sans-Serif Font Instead of Monospace
- **File:** `apps/web/src/app/globals.css:179`
- **Detail:** `.mono { font-family: var(--font-sans, ...) }` — class name implies monospace but explicitly uses sans-serif. Applied to numerical data (AUC, ASR, TPR values) where monospace alignment matters. Should be `var(--font-mono, ...)`.

### 3. Tailwind `dark:` Variant Does Not Respond to Theme Toggle
- **Files:** `login/page.tsx:45`, `register/page.tsx:41`, `login-form.tsx:236-243`
- **Detail:** Theme system uses `data-theme="dark"` attribute. Tailwind v4 `dark:` defaults to `@media (prefers-color-scheme: dark)`. Manual theme toggle does not activate `dark:` classes. Users who override OS preference see broken dark mode.

### 4. Six Unused Production Dependencies Bloating the Bundle
- **File:** `apps/web/package.json:14-26`
- **Detail:** `@simplewebauthn/browser`, `@simplewebauthn/server`, `html2canvas` (~200KB), `jspdf`, `otpauth`, `qrcode` — all have zero imports. Dead weight in install and bundle.

---

## MEDIUM

### 5. `lucide-react` in `optimizePackageImports` But Not Installed
- **File:** `apps/web/next.config.ts:34`

### 6. `@theme inline` Overrides `next/font/google` Variable
- **File:** `apps/web/src/app/globals.css:129-130`
- **Detail:** Sets `--font-sans: "Google Sans Flex"` which overrides Inter from `next/font/google`. Neither Google Sans Flex nor Google Sans Code are loaded via `@font-face`. Falls back to generic `sans-serif`.

### 7. Duplicate CSS Class Definitions With Inconsistent Properties
- **File:** `apps/web/src/app/globals.css:1592-1609 vs 2222-2238`
- **Detail:** `.workspace-input` defined twice with different `background` values. Second silently overrides first.

### 8. Non-Standard CSS Property `background-opacity`
- **File:** `apps/web/src/app/globals.css:2269, 2322`
- **Detail:** `background-opacity: 0.2` is not a valid CSS property. Silently ignored. Intended semi-transparent background not achieved.

### 9. External Font Request Blocks Rendering
- **File:** `apps/web/src/app/globals.css:4`
- **Detail:** `@import url("https://fonts.googleapis.com/...")` is render-blocking. If Google Fonts CDN is slow/unreachable, delays FCP. Inter is correctly self-hosted via `next/font`.

### 10. Extremely Long `button:not()` Selectors (8-10 Clauses Each)
- **File:** `apps/web/src/app/globals.css:2374-2407, 2081-2089`
- **Detail:** Every new button variant requires another `:not()` clause. Acknowledged as "Legacy broad button fallback. Do not extend" but still active.

---

## LOW

### 11. Z-Index Layering Inconsistency
- **File:** `apps/web/src/app/globals.css`
- **Detail:** Sidebar, site header, and language menu all share z-index 40. Stacking depends on DOM order.

### 12. 2,439-Line Monolithic Global CSS File
- **File:** `apps/web/src/app/globals.css`

### 13. `.env.local` Contains Real OAuth Credentials (Local Risk)
- **File:** `apps/web/.env.local:5-8`

### 14. `eslint-config-next` Version Mismatch
- **File:** `apps/web/package.json:21, 36`
- **Detail:** `next: 16.2.4` vs `eslint-config-next: 16.2.2`.

### 15. `force-dynamic` on Root Layout (Cross-Verified With Routing Audit)
- **File:** `apps/web/src/app/layout.tsx:20`

# Frontend Quality Issues (UX / Accessibility / Performance)

> Generated: 2026-04-30 | Deep dive pass 2
> Reviewer note: 前端体验层面的问题，影响用户可感知的产品质量。

---

## Accessibility

### 1. Form Validation Errors Not Linked to Inputs

- **Files:** `components/login-form.tsx` (lines 170-181), `components/register-form.tsx` (lines 161-206)
- **Severity:** HIGH
- **Detail:** Validation error messages are rendered as plain `<p>` elements beneath inputs. No `aria-invalid`, `aria-describedby`, or `aria-errormessage` on the `<input>` elements. Screen readers will not announce errors when the user focuses the invalid field.
- **Also:** Inline error banners (login-form:153, register-form:150) render `<div>` with error text but no `role="alert"`.
- **Recommendation:** Add `aria-invalid={!!error}` and `aria-describedby="error-id"` to inputs. Add `role="alert"` to error banners.

### 2. Platform Shell Has No Landmark Labels or Skip Navigation

- **File:** `components/platform-shell.tsx`
- **Severity:** MEDIUM
- **Detail:**
  - Line 23: `<aside>` has no `aria-label`
  - Line 44: `<header>` has no `aria-label`
  - Line 67: `<main>` has no `aria-label`
  - No skip-to-content link anywhere — keyboard users must tab through entire sidebar and topbar on every page load
- **Recommendation:** Add `aria-label` to landmarks. Add a visually-hidden skip-to-content link as the first focusable element.

### 3. Marketing Navigation Dropdowns Are Mouse-Only

- **File:** `components/marketing-home.tsx` (lines 708-729)
- **Severity:** HIGH
- **Detail:** Dropdown triggers use `onMouseEnter`/`onMouseLeave` only. Zero keyboard support — no `onKeyDown`, no `aria-expanded`, no `aria-haspopup`. The `DropdownPanel` component (lines 547-607) has no focus management. Keyboard users cannot open or navigate any dropdown menu.
- **Recommendation:** Add keyboard handlers, `aria-expanded`, `aria-haspopup`, and focus management to dropdown menus.

### 4. External Links Missing aria-labels

- **Files:** `components/platform-shell.tsx` (lines 55-62), `components/marketing-home.tsx` (lines 743-749)
- **Severity:** LOW
- **Detail:** GitHub icon links have `title` but no `aria-label`. Links contain only SVG icons with no visible text.
- **Recommendation:** Add `aria-label="GitHub"` to icon-only links.

### 5. Good Examples (for reference)

- `modal.tsx`: Proper `role="dialog"`, `aria-modal="true"`, focus trap, Escape to close, focus restoration
- `tabs.tsx`: Correct ARIA roles, keyboard navigation with Arrow/Home/End keys
- `workspace-sidebar.tsx`: `aria-label` on `<nav>`, `aria-current="page"` on active links

---

## Performance

### 6. Theme Boot Script Defined But Never Injected

- **Files:** `lib/theme.ts` (lines 17-49, `getThemeBootScript()`), `app/layout.tsx` (no `<script>` tag)
- **Severity:** HIGH
- **Detail:** `getThemeBootScript()` is fully implemented and tested, but the root layout never injects it. The `use-theme.ts` hook applies theme in a `useEffect` (after paint). Result: guaranteed flash of wrong theme on every page load.
- **Recommendation:** Inject `getThemeBootScript()` as a blocking `<script>` in the `<head>` of `app/layout.tsx`.

### 7. `printable-audit-report.tsx` — Zero Memoization, 722 Lines

- **File:** `components/printable-audit-report.tsx`
- **Severity:** HIGH
- **Detail:** No `useMemo` or `React.memo`. Every render re-runs: AUC distribution computation (lines 332-342), average AUC (343-345), risk counts (347-353), `computeCoverageGaps(rows)` (line 369), `computeComparePairs(rows)` (line 370), and `chunkArray` calls (371-373). For reports with hundreds of rows, this is significant wasted work.
- **Also:** Lines 361-367 hardcode fake attack comparison data (Recon: 0.78, PIA: 0.65, GSA: 0.82) that has nothing to do with actual `rows`. Every printed report shows the same fabricated chart.
- **Recommendation:** Wrap computations in `useMemo`. Replace hardcoded data with actual computed values.

### 8. `marketing-home.tsx` — 500 Lines of Locale Data in Client Bundle

- **File:** `components/marketing-home.tsx` (905 lines total)
- **Severity:** HIGH
- **Detail:** Approximately 500 lines (91-544) are a hardcoded `HOME_COPY` dictionary with full bilingual content. This entire dictionary ships in the client bundle. The `navItems` array (lines 659-675) is reconstructed on every render with no `useMemo`.
- **Recommendation:** Move `HOME_COPY` to a server-side data file. Use `useMemo` for derived data.

### 9. `particle-field.tsx` — 4000-Particle Continuous Animation

- **File:** `components/particle-field.tsx` (PARTICLE_COUNT = 4000, line 7)
- **Severity:** MEDIUM
- **Detail:** Animation loop (lines 205-257) runs via `requestAnimationFrame` indefinitely. No `IntersectionObserver` to pause when off-screen. No `prefers-reduced-motion` check in JavaScript (only CSS media query in globals.css, which doesn't affect JS canvas). Effect re-runs entirely on theme change (line 268), destroying and recreating all 4000 particles.
- **Recommendation:** Add `IntersectionObserver` to pause when off-screen. Check `matchMedia('(prefers-reduced-motion: reduce)')` in JS. Avoid recreating particles on theme change.

---

## UX Bugs

### 10. Login/Register Forms: Unhandled Fetch Rejections

- **Files:** `components/login-form.tsx` (lines 128-143), `components/register-form.tsx` (lines 129-145)
- **Severity:** MEDIUM
- **Detail:** `fetch` calls have no `.catch()` handler. If the network request throws (offline, DNS failure, CORS), the promise rejection is uncaught. `setPending(false)` is only in the `!response.ok` branch, not in a `finally` block. Result: submit button stays disabled permanently.
- **Recommendation:** Wrap fetch in try/catch/finally. Always call `setPending(false)` in the `finally` block.

### 11. `ErrorBoundary` Component Exists But Is Never Used

- **File:** `components/error-boundary.tsx`
- **Severity:** MEDIUM
- **Detail:** Well-implemented `ErrorBoundary` class with `getDerivedStateFromError`, `componentDidCatch`, reset function, and customizable fallback. Zero imports across the entire app. No error boundary wrapping sidebar, charts, or any workspace section. If a chart throws, the entire report page crashes.
- **Recommendation:** Wrap `PlatformShell` sidebar and main content separately. Wrap chart components individually.

### 12. Root Error Page Has Hardcoded Chinese Without i18n

- **File:** `app/error.tsx` (lines 30-33)
- **Severity:** MEDIUM
- **Detail:** Error page hardcodes "页面发生错误" then appends English below. Not locale-aware. Compare with `app/(workspace)/workspace/error.tsx` which properly uses `WORKSPACE_COPY[locale]`.
- **Recommendation:** Use locale detection and localized error strings.

### 13. Two Competing Theme Toggle Components

- **Files:** `components/theme-toggle.tsx` (simple toggle), `components/theme-toggle-button.tsx` (dropdown with light/dark/system)
- **Severity:** LOW
- **Detail:** Marketing page shows a simple toggle; workspace shows a dropdown. Inconsistent UX. `theme-toggle.tsx` is imported by zero files outside tests — potentially dead code.
- **Recommendation:** Consolidate into one component. Use the dropdown version everywhere.

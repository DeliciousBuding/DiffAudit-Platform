# Platform Frontend Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `apps/web` so the full DiffAudit frontend shell, theme system, and page layouts follow the `codex2api` frontend design language while preserving existing routes and auth behavior.

**Architecture:** Replace the current one-off dark theme and glass-card layout with a reusable light/dark design system, a `codex2api`-style application shell, and shared page primitives. Keep all route paths, proxy protection, and login behavior intact while rewriting the presentation layer across all current frontend pages.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Tailwind CSS v4, Vitest

---

### Task 1: Set Up Isolation And Baseline

**Files:**
- Modify: `.gitignore`
- Create: `.worktrees/codex/platform-frontend-redesign/` (git worktree)
- Create: `docs/superpowers/plans/2026-04-06-platform-frontend-redesign.md`

- [ ] **Step 1: Add `.worktrees/` to git ignore**

Update `.gitignore` so project-local worktrees do not pollute repository status.

- [ ] **Step 2: Commit the ignore rule**

Run: `git add .gitignore`
Run: `git commit -m "Ignore local worktrees"`
Expected: commit succeeds on `main` before worktree creation

- [ ] **Step 3: Create an isolated worktree and branch**

Run: `git worktree add ".worktrees/codex/platform-frontend-redesign" -b "codex/platform-frontend-redesign"`
Expected: new worktree created from current HEAD

- [ ] **Step 4: Verify web baseline inside the worktree**

Run: `npm --prefix apps/web run test`
Run: `npm --prefix apps/web run lint`
Run: `npm --prefix apps/web run build`
Expected: existing tests, lint, and build pass before redesign work begins

- [ ] **Step 5: Commit the saved plan if needed**

Run: `git add docs/superpowers/plans/2026-04-06-platform-frontend-redesign.md`
Run: `git commit -m "Add frontend redesign implementation plan"`

### Task 2: Build Theme Infrastructure First

**Files:**
- Create: `apps/web/src/lib/theme.ts`
- Create: `apps/web/src/lib/theme.test.ts`
- Create: `apps/web/src/components/theme-toggle.tsx`
- Modify: `apps/web/src/app/layout.tsx`
- Modify: `apps/web/src/app/globals.css`

- [ ] **Step 1: Write the failing tests for theme helpers**

Add tests in `apps/web/src/lib/theme.test.ts` for:
- resolving the default theme mode
- validating only supported theme values
- generating the initial document theme value safely

- [ ] **Step 2: Run the theme tests to verify they fail**

Run: `npm --prefix apps/web run test -- src/lib/theme.test.ts`
Expected: FAIL because `src/lib/theme.ts` does not exist yet

- [ ] **Step 3: Implement the minimal theme helper module**

Create `apps/web/src/lib/theme.ts` with small pure helpers for:
- supported theme values
- default theme resolution
- initial theme bootstrap value used by layout and toggle UI

- [ ] **Step 4: Rebuild global theme styling**

Replace `apps/web/src/app/globals.css` with a semantic light/dark token model based on the approved spec and the `codex2api` design language.

- [ ] **Step 5: Add root theme wiring**

Update `apps/web/src/app/layout.tsx` to:
- keep current font setup
- add safe root theme initialization
- prepare body classes for the new theme system

- [ ] **Step 6: Add the theme toggle component**

Create `apps/web/src/components/theme-toggle.tsx` so the shell and login page can switch between light and dark mode consistently.

- [ ] **Step 7: Run theme tests and full web checks**

Run: `npm --prefix apps/web run test -- src/lib/theme.test.ts`
Run: `npm --prefix apps/web run lint`
Run: `npm --prefix apps/web run build`
Expected: all pass with the new theme layer in place

- [ ] **Step 8: Commit the theme layer**

Run: `git add apps/web/src/lib/theme.ts apps/web/src/lib/theme.test.ts apps/web/src/components/theme-toggle.tsx apps/web/src/app/layout.tsx apps/web/src/app/globals.css`
Run: `git commit -m "Rebuild web theme foundation"`

### Task 3: Replace The Application Shell And Shared UI Primitives

**Files:**
- Create: `apps/web/src/components/page-header.tsx`
- Create: `apps/web/src/components/stat-card.tsx`
- Create: `apps/web/src/components/state-shell.tsx`
- Create: `apps/web/src/components/section-card.tsx`
- Create: `apps/web/src/components/status-badge.tsx`
- Create: `apps/web/src/lib/platform-shell.ts`
- Create: `apps/web/src/lib/platform-shell.test.ts`
- Modify: `apps/web/src/components/platform-shell.tsx`
- Modify: `apps/web/src/components/logout-button.tsx`
- Modify: `apps/web/src/lib/navigation.ts`
- Modify: `apps/web/src/app/(platform)/layout.tsx`

- [ ] **Step 1: Write the failing tests for shell metadata helpers**

Add tests in `apps/web/src/lib/platform-shell.test.ts` for:
- resolving the current nav item from a pathname
- handling root and nested route matches
- exposing stable labels needed by the shell

- [ ] **Step 2: Run shell helper tests to verify they fail**

Run: `npm --prefix apps/web run test -- src/lib/platform-shell.test.ts`
Expected: FAIL because helper module does not exist yet

- [ ] **Step 3: Implement the minimal shell helper module**

Create `apps/web/src/lib/platform-shell.ts` with pure route-to-nav helpers used by the shell.

- [ ] **Step 4: Update navigation metadata**

Expand `apps/web/src/lib/navigation.ts` so the shell has enough data for desktop and mobile navigation, subtitles, and badges.

- [ ] **Step 5: Create shared page primitives**

Add lightweight components for:
- page headers
- state containers
- stat cards
- section cards
- status badges

- [ ] **Step 6: Rewrite `PlatformShell`**

Replace the current shell with a `codex2api`-style desktop sidebar, mobile topbar, mobile bottom nav, theme toggle, and brand block adapted for DiffAudit.

- [ ] **Step 7: Adjust logout presentation only**

Update `logout-button.tsx` so it fits the new shell while keeping logout behavior unchanged.

- [ ] **Step 8: Run shell tests and full web checks**

Run: `npm --prefix apps/web run test -- src/lib/platform-shell.test.ts`
Run: `npm --prefix apps/web run lint`
Run: `npm --prefix apps/web run build`
Expected: all pass and the app renders through the new shell

- [ ] **Step 9: Commit the shell layer**

Run: `git add apps/web/src/components/page-header.tsx apps/web/src/components/stat-card.tsx apps/web/src/components/state-shell.tsx apps/web/src/components/section-card.tsx apps/web/src/components/status-badge.tsx apps/web/src/lib/platform-shell.ts apps/web/src/lib/platform-shell.test.ts apps/web/src/components/platform-shell.tsx apps/web/src/components/logout-button.tsx apps/web/src/lib/navigation.ts apps/web/src/app/(platform)/layout.tsx`
Run: `git commit -m "Replace web application shell"`

### Task 4: Rewrite Login And All Platform Pages

**Files:**
- Modify: `apps/web/src/app/login/page.tsx`
- Modify: `apps/web/src/components/login-form.tsx`
- Modify: `apps/web/src/app/page.tsx`
- Modify: `apps/web/src/app/(platform)/audit/page.tsx`
- Modify: `apps/web/src/app/(platform)/dashboard/page.tsx`
- Modify: `apps/web/src/app/(platform)/guide/page.tsx`
- Modify: `apps/web/src/app/(platform)/report/page.tsx`
- Modify: `apps/web/src/app/(platform)/batch/page.tsx`
- Modify: `apps/web/src/app/(platform)/not-found.tsx`

- [ ] **Step 1: Rewrite the login experience**

Refactor `login/page.tsx` and `login-form.tsx` into the new theme system and component grammar while preserving the shared-login POST flow and error handling.

- [ ] **Step 2: Rewrite the dashboard page**

Use the new page header, stat cards, and section cards to present current platform summary data.

- [ ] **Step 3: Rewrite the audit page**

Use the new shell grammar for the main action form, method badges, and side context cards.

- [ ] **Step 4: Rewrite the guide page**

Convert the guide into structured onboarding cards and ordered steps under the new page header.

- [ ] **Step 5: Rewrite the report page**

Convert report content into result summary cards and structured report sections.

- [ ] **Step 6: Rewrite the batch page**

Convert queue placeholders into an operations-style list page matching the new shell.

- [ ] **Step 7: Update the root redirect and not-found presentation**

Make sure `/` and `not-found` stay visually consistent with the new shell and login system.

- [ ] **Step 8: Run targeted and full verification**

Run: `npm --prefix apps/web run test`
Run: `npm --prefix apps/web run lint`
Run: `npm --prefix apps/web run build`
Expected: all tests, lint, and build pass after the full page rewrite

- [ ] **Step 9: Commit the page rewrite**

Run: `git add apps/web/src/app/login/page.tsx apps/web/src/components/login-form.tsx apps/web/src/app/page.tsx apps/web/src/app/(platform)/audit/page.tsx apps/web/src/app/(platform)/dashboard/page.tsx apps/web/src/app/(platform)/guide/page.tsx apps/web/src/app/(platform)/report/page.tsx apps/web/src/app/(platform)/batch/page.tsx apps/web/src/app/(platform)/not-found.tsx`
Run: `git commit -m "Redesign web pages to match new shell"`

### Task 5: Manual Browser Verification

**Files:**
- No code changes required unless defects are found

- [ ] **Step 1: Start the local web app if needed**

Run: `npm --prefix apps/web run dev`

- [ ] **Step 2: Verify core routes in a browser**

Check:
- `/login`
- `/audit`
- `/dashboard`
- `/guide`
- `/report`
- `/batch`

Verify:
- desktop shell layout
- mobile navigation behavior
- light and dark theme switch
- login flow still works
- protected route redirect behavior still works

- [ ] **Step 3: Fix any defects found and rerun checks**

If browser verification reveals issues, patch the minimum necessary files and rerun:
- `npm --prefix apps/web run test`
- `npm --prefix apps/web run lint`
- `npm --prefix apps/web run build`

- [ ] **Step 4: Commit final verification fixes**

Run: `git add <touched-files>`
Run: `git commit -m "Polish redesigned web experience"`

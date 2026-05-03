# DiffAudit Web App

`apps/web` is the Next.js 16 product surface for DiffAudit Platform — a privacy-risk audit workspace for diffusion models.

## Local Development

Install dependencies from the repository root:

```powershell
npm --prefix apps/web install
```

Start the web app:

```powershell
npm --prefix apps/web run dev
```

The default local URL is `http://localhost:3000`. Demo mode is enabled via `DIFFAUDIT_DEMO_MODE=1` in `.env.local`.

## Useful Commands

```powershell
npm --prefix apps/web run lint
npm --prefix apps/web run test        # vitest
npm --prefix apps/web run build
```

## Architecture

### Route Structure

```
app/
  (marketing)/        — Public pages (docs, landing)
  (auth)/             — Login, registration
  (workspace)/        — Authenticated workspace
    workspace/
      start/          — Dashboard (server component)
      audits/         — Task list (client component)
      audits/new/     — Task creation wizard
      audits/[jobId]/ — Job detail with polling
      model-assets/   — Model CRUD + evidence
      risk-findings/  — Findings table + detail panel
      reports/        — Report generation center
      settings/       — System config + templates
      account/        — User profile
  api/                — Next.js route handlers
```

### Key Patterns

- **Server/Client split**: Pages like `start/page.tsx` are async server components. Interactive components (TaskListClient, RiskFindingsClient) are `"use client"`.
- **Data facade**: `lib/workspace-source.ts` provides view models. Pages don't import raw data adapters directly.
- **i18n**: All user-facing copy lives in `lib/workspace-copy.ts` (en-US + zh-CN). No inline locale ternaries.
- **Design tokens**: CSS custom properties in `globals.css`. JSX uses `[color:var(...)]` syntax for Tailwind colors.

### Shared Hooks (`src/hooks/`)

| Hook | Purpose |
|------|---------|
| `use-sort` | Memoized table column sorting |
| `use-scroll-fade` | Horizontal overflow detection (toggles `is-scrollable`) |
| `use-table-keyboard-nav` | Vim-style J/K row navigation |
| `use-count-up` | Animated number count-up |
| `use-theme` | Theme mode state |

### Key Components (`src/components/`)

| Component | Purpose |
|-----------|---------|
| `workspace-sidebar.tsx` | Navigation sidebar with active glow |
| `workspace-frame.tsx` | Page frame with header + actions |
| `command-palette.tsx` | Ctrl+K command palette |
| `workspace-global-search.tsx` | Header search with recent pages |
| `status-badge.tsx` | Compact badge (primary/success/warning/danger/info/neutral) |
| `risk-badge.tsx` | AUC-based risk level badge |
| `sortable-header.tsx` | Table header with sort toggle + aria-sort |
| `info-tooltip.tsx` | Hover tooltip for metric explanations |
| `modal.tsx` | Focus-trapping modal dialog |
| `empty-state.tsx` | Centered empty state with float animation |
| `clickable-row.tsx` | Client component for clickable table rows in server components |
| `animated-value.tsx` | Count-up animation for KPI values |

## Configuration

Use untracked environment files for local values. The root `.env.example` lists the supported variables.

OAuth provider buttons are rendered only when the matching client ID and client secret are configured.

## Repository Hygiene

Use placeholders for credentials and deployment-specific values. Keep local databases, session cookies, and environment files untracked.

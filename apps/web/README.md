# DiffAudit Web App

`apps/web` is the React 19 SPA (Vite 7 + React Router v7) product surface for DiffAudit Platform — a privacy-risk audit workspace for diffusion models. There is no meta-framework and no frontend server runtime; the Go gateway in `apps/api-go` serves the build output and the API.

## Local Development

Install dependencies from the repository root:

```powershell
npm --prefix apps/web install
```

Start the web app:

```powershell
npm --prefix apps/web run dev
```

The default local URL is `http://localhost:3000`. Demo mode is enabled via `DIFFAUDIT_DEMO_MODE=1` in `.env.local`; it can render the workspace, audits, reports, and account surfaces without a live runtime.

## Useful Commands

```powershell
npm --prefix apps/web run lint
npm --prefix apps/web run typecheck
npm --prefix apps/web run test        # vitest
npm --prefix apps/web run build
npm --prefix apps/web run test:e2e    # Playwright (starts gateway + Vite)
```

## Architecture

### Route Structure

```
app/
  (marketing)/        — Public pages (docs, landing)
  (auth)/             — Login, registration
  (workspace)/        — Authenticated workspace
    workspace/
      start/          — Dashboard
      audits/         — Task list
      audits/new/     — Task creation wizard
      audits/[jobId]/ — Job detail with polling
      model-assets/   — Model CRUD + evidence
      risk-findings/  — Findings table + detail panel
      reports/        — Report generation center
      settings/       — System config + templates
      account/        — User profile
  *                   — NotFound
```

### Key Patterns

- **Async page shells**: Page wrappers are async functions suspended via React 19 `use()`; interactive components are client components under `"use client"`.
- **Routing abstraction**: `lib/router/` wraps React Router (Link, useRouter, usePathname, useSearchParams) so page modules keep a stable navigation API.
- **Data facade**: `lib/workspace-source.ts` provides view models. Pages don't import raw data adapters directly.
- **i18n**: All user-facing copy lives in `lib/workspace-copy.ts` (en-US + zh-CN). No inline locale ternaries.
- **Design tokens**: CSS custom properties in `globals.css`. JSX uses `[var(...)]` syntax for Tailwind colors.
- **Demo data**: Client demo stores (`lib/demo-snapshot.ts`, `demo-jobs-store.ts`) back the workspace when demo mode is enabled.
- **Charts**: Small workspace charts are local SVG components. Avoid reintroducing Recharts unless it is verified under the current Vite/React stack.

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

`/workspace/account` reuses the account mode in `SettingsClient`. In demo mode, unauthenticated visitors see GitHub/Google sign-in and local-account creation actions; signed-in users can connect OAuth providers, change local password access, and toggle the local two-factor status. GitHub profile data is preferred for account avatar/name after GitHub sign-in or connection.

## Containers

The production image is built from the repository-root `Dockerfile`: it compiles the SPA with Node, builds the Go single binary with `//go:embed` static assets, and runs the gateway in `alpine`. There is no separate frontend container. For the stack templates, see `deploy/`:

```powershell
Copy-Item .\deploy\compose.env.example .\deploy\.env
Copy-Item .\deploy\runtime.env.example .\deploy\runtime.env
docker compose --env-file .\deploy\.env -f .\deploy\docker-compose.example.yml up -d --build
```

Keep copied env files untracked. Put OAuth secrets, platform URL, CORS origins, and deployment-specific bind addresses in those local files or a secret manager.

## Repository Hygiene

Use placeholders for credentials and deployment-specific values. Keep local databases, session cookies, and environment files untracked.

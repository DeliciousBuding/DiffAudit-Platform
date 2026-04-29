# DiffAudit Platform Project Structure

This document defines the stable engineering boundaries for the Platform repository. It is a maintenance contract, not a progress log.

## Repository Areas

| Area | Owns | Must not own |
| --- | --- | --- |
| `apps/web` | Next.js product surface: marketing, docs, auth, workspace, reports, account, settings, and browser-facing API routes | Raw research execution, private deployment topology, server runbooks |
| `apps/api-go` | Go gateway, public snapshot read plane, optional Runtime proxy, public snapshot publisher | Web UI state, private Runtime implementation, request-time Research workspace discovery |
| `packages/shared` | Public contracts, stable examples, schema notes shared across Platform layers | Operator prompts, private datasets, generated local state |
| `deploy` | Public-safe Docker and compose templates with placeholder configuration | Real environment files, domains, certificates, host bind paths, process-manager notes |
| `docs` | Public architecture, roadmap, API contracts, and engineering governance | Cleanup diaries, agent handoff logs, private deployment notes |
| `scripts` | Repository-level validation and local helper commands | Product runtime logic or private environment setup |

## Web Structure

`apps/web/src/app` is route ownership only:

- `(marketing)` owns public pages and docs.
- `(auth)` owns login and registration pages.
- `(workspace)` owns authenticated product workspace pages.
- `api` owns Next.js route handlers that support the web surface.
- Legacy route groups must not gain new product logic. If a route is only a redirect, treat it as removable compatibility debt.

`apps/web/src/components` is shared UI. Components here must be reusable and product-generic inside Platform. Page-specific composition should stay near the page unless it is reused.

`apps/web/src/lib` is data, contracts, and adapters. Pages should not duplicate source selection logic that already belongs in `lib`.

## Source Of Truth Rules

- Workspace navigation is derived from the workspace registry plus localized workspace copy. Do not add another nav list, icon order, or route-label map.
- Workspace copy, status labels, risk labels, report labels, and filter labels live in `workspace-copy`. Do not hard-code duplicate UI strings in page components when the text is part of a reusable workspace concept.
- Demo/live/snapshot selection belongs in data adapters. Pages should consume view models, not decide ad hoc whether to read snapshot, demo fixtures, or Runtime responses.
- Runtime text shown in public UI must pass through the public-safe sanitization layer.
- Public snapshot paths must use logical identifiers such as `research://...`; request handlers must not discover local Research workspaces at request time.

## Web Source Contract

| Concern | Source of truth | Consumers |
| --- | --- | --- |
| Workspace route order, hrefs, and icons | `apps/web/src/lib/workspace-registry.ts` | `getNavItems(locale)`, shell navigation, active-route helpers |
| Workspace navigation labels | `WORKSPACE_COPY[locale].nav` | `getNavItems(locale)` only |
| Workspace reusable labels | `WORKSPACE_COPY` | Page frames, report tables, risk/status badges, filters |
| Workspace catalog and attack-defense data | `apps/web/src/lib/workspace-source.ts` | Workspace pages and shell chrome |
| Demo/live mode state | `getWorkspaceModeState()` / `getWorkspaceDataMode()` | Shell chrome, account/settings pages |
| Runtime and snapshot payload normalization | `catalog`, `attack-defense-table`, `audit-client`, `evidence-report` helpers | Facades and route handlers |

Workspace route components must not import `catalog`, `attack-defense-table`, or `demo-mode` directly. If a page needs a new view model, extend `workspace-source` first and keep source selection behind that facade.

## UI Primitive Rules

- Prefer explicit primitives (`Button`, `Card`, `WorkspacePageFrame`, `WorkspaceSectionCard`, `Tabs`, `Modal`, badges, tables) over one-off page chrome.
- Do not add new broad global selectors such as `button:not(...)` to control product interaction behavior.
- If a new repeated visual pattern appears in more than one workspace page, promote it into a primitive before adding a third copy.
- Do not introduce a new visual language for workspace pages. Extend the existing tokens, compact cards, badges, tables, and quiet motion.

## Legacy Route Policy

Legacy routes are compatibility debt, not product surface.

- Do not add new behavior under legacy redirect route groups.
- Before deleting a legacy route, scan internal links and tests for references.
- After deletion, route recovery and not-found pages should direct users to the current public paths: `/`, `/docs`, `/workspace`, `/workspace/audits`, and `/workspace/reports`.
- Deleted top-level legacy workspace routes must stay deleted. Do not restore `/audit`, `/batch`, `/dashboard`, `/guide`, or `/report`; use `/workspace`, `/workspace/audits`, `/workspace/reports`, or `/docs` instead.

## Review Checklist

Before merging structural or cross-cutting changes, confirm:

- The change has one clear source of truth.
- The public/private boundary remains intact.
- No private deployment details, hostnames, secrets, local paths, or operator notes were added.
- Existing design primitives were reused or deliberately extended.
- Required validation from `AGENTS.md` passed.

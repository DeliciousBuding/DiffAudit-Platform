# DiffAudit Platform Agent Rules

This repository is public and product-facing. Treat every committed file as material that may be read by users, reviewers, downstream integrators, and security scanners.

## Public Baseline

- Keep the repository suitable for a public GitHub product page.
- Keep README, docs, examples, and comments product-facing; do not write cleanup diaries, operator handoff notes, agent prompts, or private deployment notes into public files.
- Keep the license model Apache-2.0. Do not add restrictive commercial-use terms or approval-gated usage terms unless the maintainer explicitly changes the license.
- Do not introduce invented security gates, marketplace copy, analytics claims, or unrelated compliance claims unless the feature actually exists in this repository and the maintainer explicitly asks for it.

## Sensitive Information

Never commit:

- real API keys, OAuth secrets, session tokens, cookies, private keys, certificates, database dumps, or local `.env` values;
- private hostnames, private domains, SSH aliases, server topology, reverse-proxy details, systemd units, cloud console details, or deployment runbooks;
- machine-local paths, user names, workstation-specific paths, or raw private dataset paths;
- raw Runtime, OS, or network exception strings that reveal local machines, ports, or environment details.

Use placeholders in examples. OAuth and local account examples must be obviously fake.

## Snapshot And Research Data

- Public snapshot paths must use logical artifact identifiers such as `research://...`, not machine-local paths.
- Public snapshot warnings must be generic, for example `runtime unavailable; reused existing snapshot`, not raw exception traces.
- If `apps/api-go/scripts/publish_public_snapshot.py` changes, preserve its public sanitization behavior and update its tests.
- Snapshot files must remain distributable demo/review data. Do not commit raw research workspaces, private datasets, model checkpoints, or unsanitized generated artifacts.

## Product Packaging

- Keep public docs focused on product behavior, architecture, setup, verification, and integration contracts.
- Keep `docs/portability.md` as the source of truth for productization, migration, environment groups, snapshot portability, and public-ready checklists.
- Avoid one-off event packaging in reusable product surfaces unless the maintainer explicitly asks for an event branch.
- Avoid personal test identities. Prefer `demo-reviewer`, `example-user`, `review@diffaudit.test`, and similar neutral fixtures.
- Keep `DiffAudit-Research` references as external research/evidence integration points; do not copy private research workspace structure into public docs.

## Structural Governance

- Treat `docs/project-structure.md` as the source of truth for repository area ownership, web route ownership, and legacy route policy.
- Do not create duplicate sources of truth for workspace navigation, labels, status mapping, risk mapping, data mode selection, or report field interpretation.
- Workspace navigation must be derived from the workspace registry plus localized workspace copy.
- Demo/live/snapshot/Runtime selection belongs in shared data adapters. Page components should consume view models instead of choosing data sources ad hoc.
- Legacy redirect routes must not gain new product logic. Before deleting them, scan internal links and tests; after deletion, route recovery should point users to current routes.
- Do not add new broad global CSS selectors such as `button:not(...)` for product interaction behavior. Prefer explicit primitives or scoped classes.

## UI and Design Rules

- All card containers use `rounded-2xl`. Inner elements (inputs, nested cards) use `rounded-xl`.
- Typography: `text-[13px]` body, `text-[11px]` secondary/captions, `text-[10px]` badges only.
- All Lucide icons use `strokeWidth={1.5}`.
- CSS custom property colors must use `[color:var(...)]` syntax for Tailwind text colors: `text-[color:var(--accent-blue)]`.
- Button text on colored backgrounds uses `text-white` (not `text-background`).
- Dark mode: all colors must use CSS custom properties; no hardcoded hex/rgba in JSX.
- Shared hooks live in `apps/web/src/hooks/`. Reusable patterns across 2+ pages should be extracted into hooks.
- Server components cannot use event handlers (onClick, onKeyDown). Extract interactive elements into `"use client"` components.

## Workspace Page Inventory

| Route | Component | Description |
| --- | --- | --- |
| `/workspace/start` | `start/page.tsx` | Dashboard with Health Score, KPIs, charts, risk cards, recent results |
| `/workspace/audits` | `audits/page.tsx` + `AuditsPageClient.tsx` | Task list with adaptive polling, progress shimmer, ETA |
| `/workspace/audits/new` | `audits/new/CreateTaskClient.tsx` | 4-step task creation wizard |
| `/workspace/audits/[jobId]` | `audits/[jobId]/JobDetailClient.tsx` | Job detail with AbortController polling |
| `/workspace/model-assets` | `model-assets/ModelAssetsClient.tsx` | Model CRUD, evidence table with risk coloring |
| `/workspace/risk-findings` | `risk-findings/RiskFindingsClient.tsx` | Findings table with Priority Sort, J/K nav, share links |
| `/workspace/reports` | `reports/page.tsx` | Report center with track-based generation |
| `/workspace/settings` | `settings/SettingsClient.tsx` | System config, templates, runtime status |
| `/workspace/account` | `account/page.tsx` | User profile, providers, security |

## Knowledge Hygiene

- Treat README, docs, and AGENTS as edited contracts, not append-only logs.
- When code changes affect setup, routes, environment variables, data boundaries, or UI primitives, update the existing authoritative doc section in the same PR.
- Prefer deletion or replacement of stale guidance over adding contradictory notes.
- Use absolute calendar dates if a date is necessary. Do not write vague timeline phrases in durable docs.
- Do not write agent operation diaries, private handoff chatter, or maintainer instructions into product-facing docs.

## Deployment Boundary

- Public deployment material may include Dockerfiles, compose templates, environment examples, and generic validation commands.
- Do not commit real deployment files. Keep copied compose `.env`, runtime env files, host bind addresses, domains, TLS/proxy details, certificates, SSH aliases, and server-local notes outside Git.
- Container images must be traceable to a Git revision. Preserve OCI labels in Dockerfiles and use revision-based tags for deployable images.
- GHCR publishing is allowed through repository workflows. Prefer immutable `sha-<short-sha>` tags for deployable references; do not hard-code private registries or credentials.
- Public compose templates must mount sanitized snapshot bundles only. They must not encode private server paths or runtime topology.
- If deployment helpers change, keep them generic and run `python scripts/check_public_boundary.py`.

## Local Artifacts

Do not commit generated local state:

- `node_modules/`, `.next/`, coverage output, `tmp/`, `__pycache__/`;
- SQLite databases and WAL/SHM files;
- `.env*` files except committed examples;
- local binaries such as Go `.exe` builds.

Use `.worktrees/<branch-name>/` for local worktrees when larger isolated work is needed.

## Validation Before Commit

For code changes, run the relevant gates:

```powershell
python scripts/check_public_boundary.py
npm --prefix apps/web run lint
npm --prefix apps/web run test
npm --prefix apps/web run build
go -C apps/api-go test ./...
go -C apps/api-go build ./cmd/platform-api
```

For snapshot publisher changes, also run:

```powershell
py -3 -m unittest apps.api-go.scripts.test_publish_public_snapshot
```

Before publishing a public baseline, scan for sensitive or off-brand strings and confirm the working tree contains no tracked secrets or generated local artifacts.

Do not rewrite public history or force-push unless the maintainer explicitly asks for a sanitized baseline rewrite.

# DiffAudit Platform Agent Rules

This repository is public and product-facing. This file is the **single agent entry point** for Platform work. All agent-facing rules live here; do not create per-directory AGENTS.md files in `apps/`, `docs/`, or subdirectories.

## 0. Project Identity

**DiffAudit Platform** is an open-source privacy-risk audit workspace for diffusion models. It turns research evidence into a reviewable product experience — contracts, metrics, reports, exports — so that security teams, model developers, and compliance reviewers can inspect training-data membership risks without digging through experiment logs.

- **License**: Apache-2.0 (see root `AGENTS.md` Section 六 for push/release rules)
- **Repository**: `github.com/DeliciousBuding/DiffAudit-Platform`
- **Root governance**: `../AGENTS.md` (root governance — Section 1 directory boundaries, Section 3 Leader checklist, Section 5 anti-bloat rules, Section 6 knowledge hygiene, Section 7 language policy)
- **Repo release policy**: `../AGENTS.md` (root governance — Section 六: mandatory push for Platform, Apache-2.0 publishing, dev/prod config isolation)

## 1. S.U.P.E.R Principles

These five principles govern every Platform design decision:

| Principle | Meaning | Enforced by |
|-----------|---------|-------------|
| **S**napshot-first | Read plane always snapshot-backed. Runtime is optional. No page breaks when Runtime is down. | Go gateway `--public-data-dir`, snapshot publisher tiered fallback |
| **U**nified facades | Data mode selection behind `workspace-source.ts`. Pages consume view models, never raw adapters. | `apps/web/src/lib/workspace-source.ts`, `getWorkspaceModeState()` |
| **P**ublic boundary | Every commit must be safe for a public GitHub product page. No secrets, no private topology, no local paths. | `scripts/check_public_boundary.py` (13 rule categories), `CONTRIBUTING.md` guardrails |
| **E**xplicit SSOT | One source of truth per concern. Extend existing authority docs; never duplicate. | `docs/project-structure.md`, `apps/web/DESIGN.md`, `deploy/README.md` |
| **R**eproducible provenance | Immutable image tags, OCI labels, Git revision traceability. Container images must map to a Git revision. | `scripts/verify_image_provenance.py`, `sha-<short-sha>` tags, OCI labels in Dockerfiles |

## 2. Repository Structure

| Area | Owns | Source of truth |
|------|------|-----------------|
| `apps/web` | Vite + React 19 SPA product surface: marketing, auth, workspace, reports, account, settings (React Router v7, no meta-framework) | `apps/web/DESIGN.md` (design), `apps/web/README.md` (dev) |
| `apps/api-go` | Go gateway: SPA static serving, snapshot read plane, optional Runtime proxy, auth (SQLite), snapshot publisher | `apps/api-go/README.md` (dev onboarding), this file (backend API rules) |
| `packages/shared` | Public contracts, schema notes, example payloads | `packages/shared/contracts/README.md` |
| `deploy` | Public-safe Docker/compose templates with placeholder config | `deploy/README.md` |
| `docs` | Public architecture, roadmap, API contracts, engineering governance | `docs/README.md` (index only — docs are for humans, not agents) |
| `scripts` | Repository validation and local helper commands | This file (validation section) |
| `.agents/skills/` | Agent SOPs reusable across sessions | `platform-dev/SKILL.md` |

**Do NOT create**: `apps/web/AGENTS.md`, `apps/api-go/AGENTS.md`, or `docs/AGENTS.md`. This file is the single agent entry point. Rules specific to a layer belong in this file under the appropriate section.

## 3. Naming Conventions

Naming rules follow the canonical `../Docs/NAMING_CONVENTIONS.md`. This section
repeats Platform-specific highlights; the canonical file is the SSOT for naming.

- **Directories**: semantic English `kebab-case` (e.g., `model-assets`, `risk-findings`, `api-go`)
- **Files**: `kebab-case` for all new files; legacy PascalCase/camelCase files migrate on touch
- **Components**: PascalCase `.tsx` files (React convention); hooks `use-kebab-case.ts`
- **Go packages**: lowercase single-word or abbreviations (`proxy`, `cmd`)
- **Routes**: `/kebab-case` segments (e.g., `/workspace/audits/new`, `/workspace/model-assets`)
- **Environment variables**: `UPPER_SNAKE_CASE` prefixed `DIFFAUDIT_` (e.g., `DIFFAUDIT_DEMO_MODE`, `DIFFAUDIT_RUNTIME_BASE_URL`)
- **Git branches**: `kebab-case` feature branches (e.g., `fix-retry-safety`, `add-reports-page`)
- **OCI image tags**: `sha-<short-sha>` for immutable, `main` for current, `latest` for convenience

## 4. Git Rules

1. **Small commits**: commit each independently coherent change. Do not accumulate unrelated changes in the working tree.
2. **Branch from main**: start feature branches from the latest `main`.
3. **Squash merge**: after review, squash merge to keep history clean.
4. **No force push**: do not rewrite public history unless the maintainer explicitly requests a sanitized baseline rewrite.
5. **Commit messages**: imperative mood, English, describe what changed and why. Prefix with area when clear (e.g., `api-go: add retry safety for POST bodies`, `web: migrate error boundary to WORKSPACE_COPY`).
6. **Worktrees**: use `.worktrees/<branch-name>/` for larger isolated work.
7. **Pre-commit**: run relevant validation gates (see Section 12).
8. **Push mandatory**: Platform must be pushed per root `AGENTS.md` Section 六.

## 5. Boundary Enforcement Matrix

Every architectural boundary in Platform has an explicit enforcement mechanism:

| Boundary | Mechanism | Detail |
|----------|-----------|--------|
| **Web frontend vs Go API** | `apps/web/src/lib/workspace-source.ts` facade + same-origin `fetch` | All frontend→backend calls use relative `/api/*` paths served by the Go gateway; no server-side proxy layer |
| **Read plane vs Control plane** | Route-level separation in Go server | Snapshot-backed `GET` routes never proxy; only `/api/v1/audit/*` routes forward to Runtime |
| **Publish-time vs Request-time** | Snapshot publisher (Python) writes public JSON; Go server reads only from `data/public/` | Request handlers never discover Research workspaces; publisher sanitizes paths to `research://...` |
| **Public vs Private** | `scripts/check_public_boundary.py` | 13 rule categories: secrets, IPs, hostnames, paths, emails, SSH, tokens, private keys, certificates, connection strings, system paths, user names, private datasets |
| **Demo mode vs Live mode** | Cookie + env cascade | `DIFFAUDIT_DEMO_MODE=1` → frontend uses TypeScript demo data; `DIFFAUDIT_DEMO_MODE=0` → frontend calls Go gateway; Go `--demo-mode=true` → Go uses `DemoJobStore` without Runtime |
| **Platform vs Runtime** | Explicit proxy routes with 3x retry | `doWithRetry` only retries GET/HEAD; POST body not re-consumed; cache fallback when Runtime unavailable |

### Demo Data Layer Independence

Each layer's demo mode is built **self-contained** — either can run standalone. This is intentional architectural debt, not a bug:

- **Frontend demo**: `apps/web/src/lib/demo-snapshot.ts` + `demo-jobs-store.ts`. When demo mode is enabled, the SPA imports the hardcoded TypeScript demo data directly — no network call.
- **Go backend demo**: `DemoJobStore` in `internal/proxy/models.go`. When `--demo-mode=true`, Go serves 6 pre-seeded jobs with time-based state progression.
- **To use Go demo data in the browser**: set `DIFFAUDIT_DEMO_MODE=0` (frontend) and ensure Go runs with `--demo-mode=true`.

## 6. Public Baseline

- Keep the repository suitable for a public GitHub product page.
- Keep README, docs, examples, and comments product-facing; do not write cleanup diaries, operator handoff notes, agent prompts, or private deployment notes into public files.
- Keep the license model Apache-2.0. Do not add restrictive commercial-use terms or approval-gated usage terms unless the maintainer explicitly changes the license.
- Do not introduce invented security gates, marketplace copy, analytics claims, or unrelated compliance claims unless the feature actually exists in this repository and the maintainer explicitly asks for it.

## 7. Sensitive Information

Never commit:

- real API keys, OAuth secrets, session tokens, cookies, private keys, certificates, database dumps, or local `.env` values;
- private hostnames, private domains, SSH aliases, server topology, reverse-proxy details, systemd units, cloud console details, or deployment runbooks;
- machine-local paths, user names, workstation-specific paths, or raw private dataset paths;
- raw Runtime, OS, or network exception strings that reveal local machines, ports, or environment details.

Use placeholders in examples. OAuth and local account examples must be obviously fake.

## 8. Snapshot and Research Data

- Public snapshot paths must use logical artifact identifiers such as `research://...`, not machine-local paths.
- Public snapshot warnings must be generic, for example `runtime unavailable; reused existing snapshot`, not raw exception traces.
- If `apps/api-go/scripts/publish_public_snapshot.py` changes, preserve its public sanitization behavior and update its tests.
- Snapshot files must remain distributable demo/review data. Do not commit raw research workspaces, private datasets, model checkpoints, or unsanitized generated artifacts.

## 9. Product Packaging

- Keep public docs focused on product behavior, architecture, setup, verification, and integration contracts.
- Keep `docs/portability.md` as the source of truth for productization, migration, environment groups, snapshot portability, and public-ready checklists.
- Avoid one-off event packaging in reusable product surfaces unless the maintainer explicitly asks for an event branch.
- Avoid personal test identities. Prefer `demo-reviewer`, `example-user`, `review@diffaudit.test`, and similar neutral fixtures.
- Keep `DiffAudit-Research` references as external research/evidence integration points; do not copy private research workspace structure into public docs.

## 10. Structural Governance

- Treat `docs/project-structure.md` as the source of truth for repository area ownership, web route ownership, and legacy route policy.
- Do not create duplicate sources of truth for workspace navigation, labels, status mapping, risk mapping, data mode selection, or report field interpretation.
- Workspace navigation must be derived from the workspace registry plus localized workspace copy.
- Demo/live/snapshot/Runtime selection belongs in shared data adapters. Page components should consume view models instead of choosing data sources ad hoc.
- Legacy redirect routes must not gain new product logic. Before deleting them, scan internal links and tests; after deletion, route recovery should point users to current routes.
- Do not add new broad global CSS selectors such as `button:not(...)` for product interaction behavior. Prefer explicit primitives or scoped classes.

### Documentation Authority

| Document | Role | Extend when |
|----------|------|-------------|
| This file (`AGENTS.md`) | Single agent entry point | New structural rules emerge (e.g., new boundary type, new layer convention) |
| `apps/web/DESIGN.md` | Design authority | 3+ new component patterns appear that need codification |
| `deploy/README.md` | Deployment authority | Compose/container patterns change (new service, new volume mount strategy) |
| `apps/api-go/README.md` | Go gateway dev onboarding | Route inventory, config, or test commands change |
| `packages/shared/contracts/README.md` | Contract structure guide | Contract format or addition process changes |
| `docs/` | Human-facing documentation | Product behavior, architecture, or setup changes |

## 11. UI and Design Rules

- All card containers use `rounded-2xl`. Inner elements (inputs, nested cards) use `rounded-xl`.
- Typography: `text-[13px]` body, `text-[11px]` secondary/captions, `text-[10px]` badges only.
- All Lucide icons use `strokeWidth={1.5}`.
- CSS custom property colors must use `[var(...)]` syntax for Tailwind text colors: `text-[var(--accent-blue)]`.
- Button text on colored backgrounds uses `text-white` (not `text-background`).
- Dark mode: all colors must use CSS custom properties; no hardcoded hex/rgba in JSX.
- Shared hooks live in `apps/web/src/hooks/`. Reusable patterns across 2+ pages should be extracted into hooks.
- Server components cannot use event handlers (onClick, onKeyDown). Extract interactive elements into `"use client"` components.

Full design contract: `apps/web/DESIGN.md`.

## 12. Workspace Page Inventory

| Route | Component | Description |
|-------|-----------|-------------|
| `/workspace/start` | `start/page.tsx` | Dashboard with Health Score, KPIs, charts, risk cards, recent results |
| `/workspace/audits` | `audits/page.tsx` + `AuditsPageClient.tsx` | Task list with adaptive polling, progress shimmer, ETA |
| `/workspace/audits/new` | `audits/new/CreateTaskClient.tsx` | 4-step task creation wizard |
| `/workspace/audits/[jobId]` | `audits/[jobId]/JobDetailClient.tsx` | Job detail with AbortController polling |
| `/workspace/model-assets` | `model-assets/ModelAssetsClient.tsx` | Model CRUD, evidence table with risk coloring |
| `/workspace/risk-findings` | `risk-findings/RiskFindingsClient.tsx` | Findings table with Priority Sort, J/K nav, share links |
| `/workspace/reports` | `reports/page.tsx` | Report center with track-based generation |
| `/workspace/api-keys` | `api-keys/ApiKeysClient.tsx` | API key management and scoped credentials |
| `/workspace/settings` | `settings/SettingsClient.tsx` | System config, templates, runtime status |
| `/workspace/account` | `account/page.tsx` | User profile, providers, security |

## 13. Backend API (apps/api-go)

The Go gateway serves snapshot-backed read endpoints and proxies audit control-plane calls to Runtime.

Full developer onboarding: `apps/api-go/README.md`.

### Typed Models (internal/proxy/models.go)

- `CatalogEntry` — single audit contract (track, attack family, target, availability, evidence level)
- `AttackDefenseRow` — single attack-defense evaluation result (AUC, ASR, TPR, defense, model)
- `AttackDefenseTable` — top-level wrapper with schema, dataset, rows
- `AuditJob` — audit job with status, progress, metrics, contract key
- `JobMetrics` — completed job metrics (AUC, ASR, TPR strings)
- `DemoJobStore` — thread-safe in-memory demo job store with time-based state progression

### Demo Mode

When `--demo-mode=true` (default), the Go API uses `DemoJobStore` for all `/api/v1/audit/jobs*` endpoints:

- `GET /api/v1/audit/jobs` — returns 6 pre-seeded demo jobs (2 completed, 2 running, 1 failed, 1 cancelled)
- `GET /api/v1/audit/jobs/{id}` — returns the specific demo job
- `POST /api/v1/audit/jobs` — creates a new demo job (state: queued, progresses over time)
- `DELETE /api/v1/audit/jobs/{id}` — cancels the demo job

Running demo jobs progress 2% per second until completion, then receive synthetic metrics.

### Frontend Demo Mode (Independent Layer)

The frontend has its own demo mode in `apps/web/src/lib/demo-snapshot.ts` and `demo-jobs-store.ts`. When `DIFFAUDIT_DEMO_MODE=1`, the SPA uses these hardcoded TypeScript demo data stores instead of the Go gateway snapshot.

To use Go backend demo data instead, disable frontend demo mode by setting `DIFFAUDIT_DEMO_MODE=0` and ensure the Go binary is running with `--demo-mode=true`.

## 14. Knowledge Hygiene

- Treat README, docs, and AGENTS as edited contracts, not append-only logs.
- When code changes affect setup, routes, environment variables, data boundaries, or UI primitives, update the existing authoritative doc section in the same PR.
- Prefer deletion or replacement of stale guidance over adding contradictory notes.
- Use absolute calendar dates if a date is necessary. Do not write vague timeline phrases in durable docs.
- Do not write agent operation diaries, private handoff chatter, or maintainer instructions into product-facing docs.
- Docs in `docs/` are for humans, not agents. Do not write agent instructions into `docs/`.

## 15. Deployment Boundary

- Public deployment material may include Dockerfiles, compose templates, environment examples, and generic validation commands.
- Do not commit real deployment files. Keep copied compose `.env`, runtime env files, host bind addresses, domains, TLS/proxy details, certificates, SSH aliases, and server-local notes outside Git.
- Container images must be traceable to a Git revision. Preserve OCI labels in Dockerfiles and use revision-based tags for deployable images.
- GHCR publishing is allowed through repository workflows. Prefer immutable `sha-<short-sha>` tags for deployable references; do not hard-code private registries or credentials.
- Public compose templates must mount sanitized snapshot bundles only. They must not encode private server paths or runtime topology.
- If deployment helpers change, keep them generic and run `python scripts/check_public_boundary.py`.

Full deployment authority: `deploy/README.md`.

## 16. Local Artifacts

Do not commit generated local state:

- `node_modules/`, `.next/`, coverage output, `tmp/`, `__pycache__/`;
- SQLite databases and WAL/SHM files;
- `.env*` files except committed examples;
- local binaries such as Go `.exe` builds.

Use `.worktrees/<branch-name>/` for local worktrees when larger isolated work is needed.

## 17. Validation Before Commit

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

The combined fast check:

```powershell
python scripts/run_local_checks.py --fast
```

Before publishing a public baseline, scan for sensitive or off-brand strings and confirm the working tree contains no tracked secrets or generated local artifacts.

Do not rewrite public history or force-push unless the maintainer explicitly asks for a sanitized baseline rewrite.

## 18. Anti-Proliferation Rules

These paths must **never** contain agent instruction files:

- `apps/web/AGENTS.md` — root `AGENTS.md` already covers web rules adequately
- `apps/api-go/AGENTS.md` — root `AGENTS.md` already covers gateway rules adequately
- `docs/AGENTS.md` — docs are for humans, not agents; no agent instructions belong in `docs/`
- Any subdirectory `AGENTS.md` — this file is the single agent entry point

If a rule only applies to one layer, add it to the appropriate section in this file. Do not fragment agent rules across multiple files.

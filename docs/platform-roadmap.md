# DiffAudit Platform Roadmap

This roadmap tracks product-facing Platform work. It avoids private deployment details and raw research workspaces.

## Operating Principles

- Public demo works without a live Runtime.
- Runtime and Research integration goes through snapshots and HTTP contracts.
- Deployment provenance stays visible; private topology stays out.
- UI changes follow the existing workspace design language.

## Current Baseline

| Area | Status | Notes |
| --- | --- | --- |
| Public repository hygiene | Active | Public boundary scan runs locally and in CI |
| Product portability | Active | Migration contract documents source, snapshot, env, Docker, and GHCR boundaries |
| Docker images | Active | GHCR publishes web and API images with immutable `sha-<short-sha>` tags |
| Deployment traceability | Active | Gateway health exposes redacted build revision and snapshot status |
| Workspace observability | Active | Shell status drawer and Settings show data mode, snapshot state, and build revision |
| Reports | Active | Evidence stack, provenance, track review links, print-safe job-linked producer context, charts, PDF and CSV export, paginated printable report with i18n |
| Demo mode | Active | Snapshot-backed demo data keeps the workspace reviewable offline |
| Runtime bridge | Active | Configurable timeout, retry with method guard, health check hardening, safe error responses |
| CI pipeline | Active | GitHub Actions: lint, typecheck, test (frontend + Go + Python), E2E Playwright, snapshot publish dispatch |
| Workspace controls | Active | Audit filters and create-audit wizard expose named controls, step state, and reduced-motion behavior |
| Public API docs | Active | Docs record snapshot-backed API contracts, optional evidence fields, and request-time fallback boundaries |

## Near-Term Product Work

| Priority | Track | Work |
| --- | --- | --- |
| P2 | Deployment | Add optional image provenance verification helpers for GHCR and local archive deployments |
| P2 | Account | Polish account security state for linked providers, verified email, and password access |
| P2 | Accessibility | Menu roles, chart text summaries, and stronger focus handling in shared primitives |

## Longer-Term Direction

| Track | Direction |
| --- | --- |
| Release management | Signed/provenance-aware images after the GHCR baseline is stable |
| Data source facade | Normalize demo/live response shapes and sanitize Runtime text before rendering |

## Guardrails

- No private hostnames, SSH aliases, reverse-proxy details, TLS paths, or systemd units in public docs.
- No product claims that are not implemented.
- No new visual system for workspace pages; extend the current tokens, cards, badges, and compact section layout.

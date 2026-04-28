# DiffAudit Platform Roadmap

This roadmap tracks product-facing Platform work. It avoids private deployment details and raw research workspaces.

## Operating Principles

- Keep the public demo useful without a live Runtime.
- Keep Runtime and Research integration explicit through snapshots and HTTP contracts.
- Keep deployment provenance visible without exposing private topology.
- Keep UI changes inside the existing workspace design language.

## Current Baseline

| Area | Status | Notes |
| --- | --- | --- |
| Public repository hygiene | Active | Public boundary scan runs locally and in CI |
| Docker images | Active | GHCR publishes web and API images with immutable `sha-<short-sha>` tags |
| Deployment traceability | Active | Gateway health exposes redacted build revision and snapshot status |
| Workspace settings | Active | Settings shows Runtime mode, snapshot state, and build revision |
| Reports | Active | Evidence stack, provenance, charts, PDF and CSV export |
| Demo mode | Active | Snapshot-backed demo data keeps the workspace reviewable offline |

## Near-Term Product Work

| Priority | Track | Work |
| --- | --- | --- |
| P1 | Workspace observability | Add a compact status drawer for snapshot age, build revision, and Runtime mode across workspace pages |
| P1 | Reports | Improve printable report pagination, table wrapping, and long-evidence layout |
| P1 | Audit loop | Make created demo/live jobs route directly into detail and then into matching reports |
| P2 | Docs | Add a public API contract page for catalog, evidence table, and report data shapes |
| P2 | Deployment | Add optional GHCR pull instructions for compose-based deployments |
| P2 | Account | Polish account security state for linked providers, verified email, and password access |

## Longer-Term Direction

| Track | Direction |
| --- | --- |
| Runtime bridge | Better live-job retry, cancellation, and disconnected-state handling |
| Snapshot publisher | More schema validation and clearer warnings before public bundle publication |
| Research handoff | Cleaner admitted-evidence import from DiffAudit-Research without exposing raw paths |
| Product demo | More realistic seeded jobs, reports, and coverage gaps while keeping data sanitized |
| Release management | Signed/provenance-aware images after the GHCR baseline is stable |

## Guardrails

- Do not add private hostnames, SSH aliases, reverse-proxy details, TLS paths, or systemd units to public docs.
- Do not invent product claims that are not implemented.
- Do not introduce a new visual system for workspace pages; extend the current tokens, cards, badges, and compact section layout.

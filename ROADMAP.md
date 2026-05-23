# DiffAudit Platform Roadmap

Last updated: 2026-05-23 21:43 Asia/Hong_Kong

## Current Goal

Tooling hardened, CI in place, cross-repo dispatch configured. Next: accessibility, release provenance, docs polish.

## Active Work

- [x] Dev → main merged (68cafd8): Runtime bridge hardening, CI workflow, retry safety fix, demo audit.
- [x] Cross-repo CI trigger: snapshot-publish.yml dispatch workflow for Research bundle updates.
- [x] docs/platform-roadmap.md: stale Longer-Term items cleaned up (Runtime bridge, snapshot publisher, Research handoff, product demo all completed).

## Review Gates

- [x] Frontend lint passed with zero warnings.
- [x] Frontend tests passed (67 files / 250 tests).
- [x] Go API tests passed (66 tests).
- [x] Python publisher tests passed (4 tests).
- [x] E2E tests passed (123 total / 41 cases × 3 browsers).
- [x] Public boundary check passed.
- [x] i18n key parity: en-US ≡ zh-CN (verified by workspace-copy.test.ts).

## Near-Term Product Work

- [x] Reports, Account, Accessibility, Workspace UX — all completed.
- [x] Runtime bridge: retry, health check, timeout, cache fallback (66 Go tests).
- [x] error-boundary.tsx: hardcoded English strings migrated to WORKSPACE_COPY i18n contract.
- [x] Demo mode: audit the demo experience end-to-end for first-time user quality (no critical issues found).
- [x] CI readiness: GitHub Actions workflow for Platform CI (lint, test, build, E2E).
- [x] Cross-repo CI trigger: snapshot-publish.yml dispatch workflow for Research bundle updates.

## Backlog

- [ ] 国创阶段 migration entry.

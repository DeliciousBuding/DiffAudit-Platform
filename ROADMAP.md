# DiffAudit Platform Roadmap

Last updated: 2026-05-23 21:43 Asia/Hong_Kong

## Current Goal

Dev → main merged (68cafd8). Tooling hardened, CI in place. Next: cross-repo CI trigger, backlog grooming.

## Active Work

- [x] Dev → main merged (68cafd8): Runtime bridge hardening, CI workflow, retry safety fix, demo audit.
- [x] Runtime bridge: retry safety (GET/HEAD only), net.Error types, cross-platform reliability.
- [x] DemoJobStore: 15 unit tests covering all CRUD operations and helpers (66 Go tests total).
- [x] Documentation: architecture.md, CHANGELOG, ROADMAP all current.
- [x] CI: GitHub Actions workflow with 4 jobs, all gates green.

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
- [x] Runtime bridge: retry, health check, timeout, cache fallback (49 Go tests).
- [x] error-boundary.tsx: hardcoded English strings migrated to WORKSPACE_COPY i18n contract.
- [x] Demo mode: audit the demo experience end-to-end for first-time user quality (no critical issues found).
- [x] CI readiness: GitHub Actions workflow for Platform CI (lint, test, build, E2E).
- [x] DemoJobStore: 15 unit tests covering List, Find, Create, Cancel, helpers (66 Go tests total).

## Backlog

- [ ] CI trigger: auto-publish Platform snapshot on Research bundle update (cross-repo).
- [ ] 国创阶段 migration entry.

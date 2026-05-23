# DiffAudit Platform Roadmap

Last updated: 2026-05-23 21:24 Asia/Hong_Kong

## Current Goal

Runtime bridge hardening complete. Next phase: production polish, demo mode quality, CI readiness.

## Active Work

- [x] Merge dev → main (dc6a01b): onboarding UX, Research handoff, publisher tests.
- [x] Research handoff: publisher consumes curated bundle + --bundle-path flag + tests (4/4).
- [x] Runtime bridge: retry logic, health check, configurable timeout, cache fallback (49 Go tests).
- [x] Documentation: architecture.md 4-tier fallback chain, error-boundary.tsx i18n.

## Review Gates

- [x] Frontend lint passed with zero warnings.
- [x] Frontend tests passed (67 files / 250 tests).
- [x] Go API tests passed (49 tests).
- [x] Python publisher tests passed (4 tests).
- [x] E2E tests passed (123 total / 41 cases × 3 browsers).
- [x] Public boundary check passed.
- [x] i18n key parity: en-US ≡ zh-CN (verified by workspace-copy.test.ts).

## Near-Term Product Work

- [x] Reports, Account, Accessibility, Workspace UX — all completed.
- [x] Runtime bridge: retry, health check, timeout, cache fallback (49 Go tests).
- [x] error-boundary.tsx: hardcoded English strings migrated to WORKSPACE_COPY i18n contract.
- [ ] CI readiness: GitHub Actions workflow for Platform CI (lint, test, build, E2E).
- [ ] Demo mode: audit the demo experience end-to-end for first-time user quality.

## Backlog

- [ ] CI trigger: auto-publish Platform snapshot on Research bundle update (cross-repo).
- [ ] 国创阶段 migration entry.

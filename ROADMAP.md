# DiffAudit Platform Roadmap

Last updated: 2026-05-23 08:52 Asia/Hong_Kong

## Current Goal

Dev → main merged (45 commits, dc6a01b). Next phase: Runtime-Server bridge hardening.

## Active Work

- [x] Merge dev → main (dc6a01b): onboarding UX, Research handoff, publisher tests.
- [x] Research handoff: publisher consumes curated bundle + --bundle-path flag + tests (4/4).
- [x] Runtime bridge: improve error messages when runtime is unreachable.
- [x] Documentation: update architecture.md with current handoff flow.
- [x] Runtime bridge: health check retry, connection timeout, error messaging.
- [x] Runtime bridge: configurable timeout, retry on DELETE, cache fallback tests.

## Review Gates

- [x] Frontend lint passed with zero warnings.
- [x] Frontend tests passed (67 files / 250 tests).
- [x] Go API tests passed (39 tests).
- [x] Python publisher tests passed (4 tests).
- [x] E2E tests passed (41/41).
- [x] Public boundary check passed.

## Near-Term Product Work

- [x] Reports, Account, Accessibility, Workspace UX — all completed.
- [x] Runtime bridge: health check retry, connection timeout, error messaging.
- [x] Runtime bridge: configurable timeout, DELETE retry, cache fallback tests (10 new tests, 49 total).

## Backlog

- [ ] CI trigger: auto-publish Platform snapshot on Research bundle update (cross-repo).
- [ ] 国创阶段 migration entry.

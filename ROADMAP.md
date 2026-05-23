# DiffAudit Platform Roadmap

Last updated: 2026-05-23 08:52 Asia/Hong_Kong

## Current Goal

Dev → main merged (45 commits, dc6a01b). Next phase: Runtime-Server bridge hardening.

## Active Work

- [x] Merge dev → main (dc6a01b): onboarding UX, Research handoff, publisher tests.
- [x] Research handoff: publisher consumes curated bundle + --bundle-path flag + tests (4/4).
- [ ] Runtime bridge: improve error messages when runtime is unreachable.
- [ ] Documentation: update architecture.md with current handoff flow.

## Review Gates

- [x] Frontend lint passed with zero warnings.
- [x] Frontend tests passed (67 files / 250 tests).
- [x] Go API tests passed (39 tests).
- [x] Python publisher tests passed (4 tests).
- [x] E2E tests passed (41/41).
- [x] Public boundary check passed.

## Near-Term Product Work

- [x] Reports, Account, Accessibility, Workspace UX — all completed.
- [ ] Runtime bridge: health check retry, connection timeout, error messaging.

## Backlog

- [ ] CI trigger: auto-publish Platform snapshot on Research bundle update (cross-repo).
- [ ] 国创阶段 migration entry.

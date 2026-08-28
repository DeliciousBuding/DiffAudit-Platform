# DiffAudit Platform Next.js Removal -- Progress Tracker

> **Task**: Remove the Next.js layer; Vite + React SPA frontend, auth migrated to the Go gateway, single-binary container, deploy to production.
> **Started**: 2026-08-28
> **Last Updated**: 2026-08-29
> **Mode**: GITHUB_STANDARD
> **Repo**: DeliciousBuding/DiffAudit-Platform

## Status: COMPLETE

All four phases delivered and verified:
- B1 web SPA migration: vitest 223/223, build green
- B2 auth to Go: byte-compatible contract tests green (12 groups)
- B3 build chain: chromium e2e 44/44 (41 + auth regressions), check:fast green
- B4 release: image `sha-7442b74` live on the production host, public chain all 200, auth register/me/logout 200

Main pushed as `4ff1d97..8048c82`; all spec-driven issues #60-#79 closed.

## GitHub Resources
- **All Issues**: `gh issue list -R DeliciousBuding/DiffAudit-Platform --label "spec-driven" --state all`

## References
- [Project Overview](../analysis/project-overview.md)
- [Module Inventory](../analysis/module-inventory.md)
- [Risk Assessment](../analysis/risk-assessment.md)
- [Task Breakdown](../plan/task-breakdown.md)
- [Dependency Graph](../plan/dependency-graph.md)
- [Milestones](../plan/milestones.md)

## Milestones

| Phase | Name | Milestone URL | Open | Closed | Total |
|:------|:-----|:-------------|-----:|-------:|------:|
| 1 | SPA migration | https://github.com/DeliciousBuding/DiffAudit-Platform/milestone/1 | 5 | 0 | 5 |
| 2 | Auth to Go | https://github.com/DeliciousBuding/DiffAudit-Platform/milestone/2 | 7 | 0 | 7 |
| 3 | Build chain | https://github.com/DeliciousBuding/DiffAudit-Platform/milestone/3 | 5 | 0 | 5 |
| 4 | Release | https://github.com/DeliciousBuding/DiffAudit-Platform/milestone/4 | 3 | 0 | 3 |

## Issue Mapping

| Task ID | Issue | Title | Delivery Batch | PR | Status |
|:--------|:------|:------|:---------------|:---|:-------|
| T1.1 | #60 | Vite + React SPA scaffold and route skeleton | B1 | — | open |
| T1.2 | #61 | Static SEO (robots/sitemap/og/metadata) | B1 | — | open |
| T1.3 | #62 | Data layer de-Next-ification | B1 | — | open |
| T1.4 | #63 | Route guard migration | B1 | — | open |
| T1.5 | #64 | Pages & components migration | B1 | — | open |
| T2.1 | #65 | Go SQLite schema 1:1 + migrate | B2 | — | open |
| T2.2 | #66 | Session/cookie middleware + /me + /logout | B2 | — | open |
| T2.3 | #67 | Password register/login/email verification to Go | B2 | — | open |
| T2.4 | #68 | TOTP 2FA + recovery codes to Go | B2 | — | open |
| T2.5 | #69 | WebAuthn passkeys to Go | B2 | — | open |
| T2.6 | #70 | GitHub/Google OAuth to Go | B2 | — | open |
| T2.7 | #71 | Auth contract tests + existing DB compatibility | B2 | — | open |
| T3.1 | #72 | Dockerfile rebuild (Go single binary + embed) | B3 | — | open |
| T3.2 | #73 | Go static serving + SPA fallback | B3 | — | open |
| T3.3 | #74 | Vitest full green + demo contract tests | B3 | — | open |
| T3.4 | #75 | E2E retarget and run green | B3 | — | open |
| T3.5 | #76 | Local check chain + governance docs | B3 | — | open |
| T4.1 | #77 | Image build and publish | B4 | — | open |
| T4.2 | #78 | Production compose upgrade and deploy | B4 | — | open |
| T4.3 | #79 | Post-deploy verification, rollback anchor, STATE/LOG writeback | B4 | — | open |

## Delivery Batches

| Batch | Phase | Issues | Integration Branch | PR | Status |
|:------|:------|:-------|:-------------------|:---|:-------|
| B1 | 1 | #60-#64 | `batch/b1-spa-migration` | — | planned |
| B2 | 2 | #65-#71 | `batch/b2-auth-go` | — | planned |
| B3 | 3 | #72-#76 | `batch/b3-build-chain` | — | planned |
| B4 | 4 | #77-#79 | `batch/b4-release` | — | planned |

## Quick Status Commands

```bash
gh api repos/DeliciousBuding/DiffAudit-Platform/milestones --jq '.[] | "\(.title): \(.open_issues) open, \(.closed_issues) closed"'
gh issue list -R DeliciousBuding/DiffAudit-Platform --label "spec-driven" --state all --json number,title,state,milestone
```

## Phase Checklist
- [ ] Phase 1: SPA migration (0/5 tasks) — [milestone](https://github.com/DeliciousBuding/DiffAudit-Platform/milestone/1)
- [ ] Phase 2: Auth to Go (0/7 tasks) — [milestone](https://github.com/DeliciousBuding/DiffAudit-Platform/milestone/2)
- [ ] Phase 3: Build chain (0/5 tasks) — [milestone](https://github.com/DeliciousBuding/DiffAudit-Platform/milestone/3)
- [ ] Phase 4: Release (0/3 tasks) — [milestone](https://github.com/DeliciousBuding/DiffAudit-Platform/milestone/4)

## Current Status
**Active Phase**: Phase 1
**Active Delivery Batch**: B1
**Active Issues**: #60-#64 / none
**Blockers**: None

## Governance Status
**Shared instruction surface**: `AGENTS.md`
**Claude Code instruction surface**: `CLAUDE.md`
**Other platform rule surfaces**: none
**Memory surface**: native / unavailable — durable facts via AGENTS.md + DESIGN.md + project-structure.md only
**Memory fallback path**: none

## Adaptive State

```yaml
milestones:
  - phase: 1
    total_tasks: 5
    annotate_threshold: 1   # 20% of 5
    replan_threshold: 2     # 40%
    rescope_threshold: 3    # 60%
  - phase: 2
    total_tasks: 7
    annotate_threshold: 1
    replan_threshold: 3
    rescope_threshold: 4
  - phase: 3
    total_tasks: 5
    annotate_threshold: 1
    replan_threshold: 2
    rescope_threshold: 3
  - phase: 4
    total_tasks: 3
    annotate_threshold: 1
    replan_threshold: 1
    rescope_threshold: 2
```

## Next Steps
1. Create worktree `batch/b1-spa-migration` in `.worktrees/` and start T1.1 (Vite scaffold).
2. After B1 integration green, open PR1; concurrently start B2 (auth) from main base.
3. B3 after B1+B2 integration; B4 after B3 green (production deploy per runbook).
4. Then neat-freak: governance docs, public boundary sweep, project STATE update.

## Session Log
| Date | Session | Summary |
|:-----|:--------|:--------|
| 2026-08-28 | 1 | Incident diagnosis (Next 16 standalone static 404); analysis/plan/planning created; 20 issues tracked; MASTER initialized |
| 2026-08-29 | 2 | WIP discovered in main (Vite/Go auth); completed B1-B3 (223 vitest + 41 e2e + go tests green); image sha-7442b74 shipped; production verified (public all 200, auth flow 200); issues closed; STATE/LOG written back |

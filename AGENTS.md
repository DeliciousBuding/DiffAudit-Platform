# Platform 仓库协作指南

这是 `D:\Code\DiffAudit\Platform` 的仓库级协作文件。

先明确边界：

- `Platform` 是平台仓库
- 它承载平台前端、平台后端、部署与联调文档
- 它不复制研究仓库大文件
- 它不承载本机飞书运维规则

对应角色：

- 平台前端/部署 Agent
- 平台后端 + 本地 API Agent
- 总管理 Agent

以下原有平台协作规则继续有效。

---

# DiffAudit Platform Agent Rules

This file is the repo-local coordination contract for the shared `Platform` repository.

This repository is a multi-person and multi-agent collaboration workspace. Rules here are written for shared use, not for one local machine.

## Mandatory Working Model

1. Do not implement features directly in the shared root worktree.
2. Every implementation task must start in a dedicated git worktree.
3. One worktree owns one change stream.
4. Merge back into the shared integration branch only after local verification.
5. Follow `docs/merge-playbook.md` when multiple workers are active.

## Directory Ownership

- `apps/web`: frontend and product presentation
- `apps/api-go`: active backend gateway
- `apps/api`: legacy stub, change only if explicitly required
- `docs/`: specs, plans, handoff, collaboration rules

If a task touches multiple ownership areas, split the work by branch unless the change is truly inseparable.

## Branch and Worktree Rules

- Recommended branch prefixes:
  - `codex/frontend-*`
  - `codex/backend-*`
  - `codex/docs-*`
  - `codex/ops-*`
- Recommended worktree location:
  - `.worktrees/<branch-name>`

Use repository-relative paths in discussions, docs, and handoff notes unless an absolute path is strictly required for a machine-specific operation.

## Shared Root Worktree Rules

The shared root worktree is the integration point.

Allowed in the root worktree:

- inspect status
- review diffs
- merge finished worktrees
- run integration verification
- prepare deployable state

Not allowed in the root worktree:

- feature implementation
- exploratory edits
- mixing unrelated frontend and backend changes

If you need to implement anything beyond a trivial one-file doc fix, create a new worktree first.

## Merge Rules

Before merging any worktree branch:

1. `git status` must be clean in that worktree
2. required checks must pass
3. ownership overlaps must be reviewed
4. conflicts must be resolved intentionally, not by blindly taking one side

When resolving conflicts in shared frontend files:

- preserve approved frontend structure and copy
- preserve any active backend wiring or API behavior already validated on the integration branch

When resolving conflicts in shared backend-facing files:

- preserve validated API behavior from the integration branch
- preserve approved frontend consumption contracts when they are already wired and tested

## Verification Rules

### Frontend

Run all of these before merge:

```powershell
npm --prefix apps/web run test
npm --prefix apps/web run lint
npm --prefix apps/web run build
```

### Backend

Run the backend-specific checks required by the backend owner before merge.

## Deployment Rule

Deploy only from the merged integration result, never from an orphaned feature worktree.

## Coordination Rule

If another agent owns a live change stream in a directory, do not rewrite their files casually. Stop, inspect, and merge with intent.

If a task requires touching another worker's owned area, document why and merge only the smallest necessary change.

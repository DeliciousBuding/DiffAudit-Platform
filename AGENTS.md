# DiffAudit Platform Agent Rules

This file is the repo-local coordination contract for `D:\Code\DiffAudit\Platform`.

## Mandatory Working Model

1. Do not implement features directly in the shared root worktree.
2. Every implementation task must start in a dedicated git worktree.
3. One worktree owns one change stream.
4. Merge back into the shared integration branch only after local verification.

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
  - `D:\Code\DiffAudit\Platform\.worktrees\<branch-name>`

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

## Merge Rules

Before merging any worktree branch:

1. `git status` must be clean in that worktree
2. required checks must pass
3. ownership overlaps must be reviewed
4. conflicts must be resolved intentionally, not by blindly taking one side

When resolving conflicts in shared frontend files:

- preserve approved frontend structure and copy
- preserve any active backend wiring or API behavior already validated on the integration branch

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

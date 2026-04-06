# DiffAudit Platform Collaboration Rules

## Goal

Keep frontend, backend, and deployment work moving in parallel without stepping on each other.

## Non-Negotiable Rules

1. Do not develop directly in the shared repository root worktree unless the task is only inspection or coordination.
2. Every implementation task must use its own git worktree and branch.
3. One worktree owns one change stream. Do not mix unrelated frontend, backend, and infra changes in the same worktree.
4. Before merging, the worker who made the change is responsible for local verification.

## Required Workflow

### 1. Create a dedicated worktree

- Branch naming:
  - frontend: `codex/frontend-*`
  - backend: `codex/backend-*`
  - docs or ops: `codex/docs-*`, `codex/ops-*`
- Recommended location:
  - `D:\Code\DiffAudit\Platform\.worktrees\<branch-name>`

### 2. Keep ownership boundaries clear

- `apps/web`: frontend owner
- `apps/api-go`: backend gateway owner
- `apps/api`: legacy stub, touch only if explicitly needed
- `docs/`: doc or handoff owner

If a task needs cross-cutting changes, split them by branch and merge in order instead of editing everything in one place.

### 3. Merge back through the main working branch

- Treat the shared main worktree as the integration point, not the development workspace.
- Merge finished worktrees back into the current integration branch only after:
  - `git status` is clean in the worktree
  - required checks pass
  - overlapping ownership areas are reviewed

### 4. Push early, push often

- Small commits are required.
- Push the feature branch after meaningful checkpoints so other workers can inspect or merge if needed.

## Verification Rules

### Frontend changes

Run all of these before merge:

```powershell
npm --prefix apps/web run test
npm --prefix apps/web run lint
npm --prefix apps/web run build
```

### Backend changes

Run the backend-specific checks required by the branch owner before merge.

## Coordination Rules

1. If another worker owns a directory, do not rewrite their files casually.
2. If a merge conflict happens in a shared page or shared component, keep both intents:
   - preserve the active backend or API wiring
   - preserve the latest approved frontend structure and copy
3. When in doubt, stop and document the ownership question instead of guessing.

## Production Sync Rule

For deployment work:

1. Merge the approved frontend or backend branch back into the integration branch first.
2. Verify local build or tests.
3. Sync production from the merged branch, not from an orphaned experimental worktree.

## Practical Default

Use this pattern unless there is a strong reason not to:

1. Inspect in the shared main worktree
2. Create a new worktree
3. Implement and verify there
4. Push feature branch
5. Merge back into the integration branch
6. Deploy from the merged result

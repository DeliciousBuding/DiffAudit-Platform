# DiffAudit Platform Collaboration Rules

## Goal

Keep frontend, backend, and deployment work moving in parallel without stepping on each other.

## Non-Negotiable Rules

1. Do not develop directly in the shared repository root worktree unless the task is only inspection or coordination.
2. Every implementation task must use its own git worktree and branch.
3. One worktree owns one change stream. Do not mix unrelated frontend, backend, and infra changes in the same worktree.
4. Before merging, the worker who made the change is responsible for local verification.
5. Deployment must happen from the merged integration result, never from an unmerged feature worktree.
6. If another worker is actively rewriting a subsystem, do not edit that subsystem without explicit coordination.

## Required Workflow

### 1. Create a dedicated worktree

- Branch naming:
  - frontend: `codex/frontend-*`
  - backend: `codex/backend-*`
  - docs or ops: `codex/docs-*`, `codex/ops-*`
- Recommended location:
  - `D:\Code\DiffAudit\Platform\.worktrees\<branch-name>`

### 1a. Treat the repo root as integration-only

The root worktree is not a normal development workspace.

Use it only for:

- status inspection
- review
- merge
- integration verification
- deployment preparation

### 2. Keep ownership boundaries clear

- `apps/web`: frontend owner
- `apps/api-go`: backend gateway owner
- `apps/api`: legacy stub, touch only if explicitly needed
- `docs/`: doc or handoff owner

If a task needs cross-cutting changes, split them by branch and merge in order instead of editing everything in one place.

If a frontend task needs backend changes, or a backend task needs frontend changes, prefer:

1. finish the owning side first
2. merge it
3. then implement the dependent side in a separate worktree

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

### Merge conflict rule

If a merge conflict happens in shared UI pages or shared components:

1. keep validated backend and API wiring from the integration branch
2. keep the latest approved frontend structure, copy, and interaction model from the feature branch
3. re-run frontend verification after conflict resolution

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
4. If production needs a direct server-side edit, mirror the change back into git immediately or stop and document why not.

## Practical Default

Use this pattern unless there is a strong reason not to:

1. Inspect in the shared main worktree
2. Create a new worktree
3. Implement and verify there
4. Push feature branch
5. Merge back into the integration branch
6. Deploy from the merged result

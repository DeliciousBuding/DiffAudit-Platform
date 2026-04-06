# DiffAudit Platform Merge Playbook

## Purpose

Turn the collaboration rules into a concrete operating procedure for a shared repository.

Use this document when multiple people or agents are changing `Platform` in parallel and need a reliable merge path.

## Roles

### Frontend owner

Owns:

- `apps/web`
- frontend-facing docs tied to UI behavior

Primary responsibility:

- user-facing structure
- copy
- interaction model
- frontend validation

### Backend owner

Owns:

- `apps/api-go`
- backend-facing docs tied to API behavior

Primary responsibility:

- gateway logic
- proxy behavior
- route contracts
- backend verification

### Integration owner

Owns:

- shared root worktree
- merge conflict resolution
- final verification on the integration branch
- deployable result preparation

The integration owner does not use the root worktree for normal feature implementation.

## Standard Branch Layout

- frontend feature branch: `codex/frontend-*`
- backend feature branch: `codex/backend-*`
- docs branch: `codex/docs-*`
- ops branch: `codex/ops-*`
- integration branch: the current shared branch used by collaborators

## Worktree Layout

Recommended structure:

```text
.worktrees/
  codex/frontend-*
  codex/backend-*
  codex/docs-*
  codex/ops-*
```

Do not implement non-trivial product changes in the repository root.

## Per-Role Checklist

### Frontend owner checklist

1. Create a frontend worktree
2. Limit edits to frontend-owned paths unless cross-cutting change is explicitly required
3. Run:

```powershell
npm --prefix apps/web run test
npm --prefix apps/web run lint
npm --prefix apps/web run build
```

4. Make sure `git status` is clean
5. Push the feature branch
6. Hand off:
   - branch name
   - worktree path relative to repo root
   - files changed using repo-relative paths
   - verification commands run

### Backend owner checklist

1. Create a backend worktree
2. Limit edits to backend-owned paths unless cross-cutting change is explicitly required
3. Run the backend validation required for that branch
4. Make sure `git status` is clean
5. Push the feature branch
6. Hand off:
   - branch name
   - worktree path relative to repo root
   - files changed using repo-relative paths
   - verification commands run

### Integration owner checklist

1. Inspect the integration branch in the root worktree
2. Confirm incoming worktrees are clean and pushed
3. Merge one branch at a time
4. If conflicts happen, resolve with ownership-aware rules
5. Re-run integration verification
6. Push the merged branch
7. Only then prepare deployable state

## Recommended Merge Order

Use this order unless there is a strong reason not to:

1. backend transport or API contract changes
2. frontend changes that consume those contracts
3. docs and ops follow-up changes

If a frontend branch depends on backend wiring that is not merged yet, merge the backend branch first.

## Conflict Resolution Rules

### Shared frontend pages

Keep:

- the latest approved user-facing structure and copy from the frontend branch
- the already-validated backend data wiring from the integration branch

After resolving, re-run frontend verification.

### Shared backend-facing files

Keep:

- validated backend behavior from the integration branch
- any newly approved contract changes from the backend branch

### If conflict ownership is unclear

Stop and write down:

1. which file is in conflict
2. which branch owns which intent
3. what verification would prove the correct resolution

Do not guess.

## Deploy Sequence

1. merge into the integration branch
2. verify the merged result
3. push the merged result
4. deploy from the merged result

Never deploy from an unmerged feature worktree.

## Handoff Template

Use this template when handing work to another collaborator:

```text
Branch:
Worktree:
Owned area:
Files changed:
Verification run:
Open risks:
Merge notes:
```

## Shared Repo Communication Rule

In all shared docs, handoffs, and status notes:

1. prefer repo-relative paths
2. mention the owning branch
3. mention the owning worktree
4. separate machine-specific deployment details from repository rules

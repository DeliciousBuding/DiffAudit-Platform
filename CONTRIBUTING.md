# Contributing

DiffAudit Platform uses a small PR-based workflow. Keep changes focused, verifiable, and suitable for a public repository.

## Workflow

1. Start from the latest `main`.
2. Create a short feature branch.
3. Prefer isolated worktrees under `.worktrees/<branch-name>/` when doing larger work.
4. Run the relevant local checks.
5. Push the branch and open a PR.
6. Squash merge after review.

## Repository Boundaries

- `apps/web`: Next.js product surface.
- `apps/api-go`: Go API gateway and snapshot read plane.
- `packages/shared`: shared contracts and payload examples.
- `docs`: public architecture and developer documentation.

Keep deployment-specific notes, credentials, and environment-specific values out of source control. Use placeholders in examples.

Container deployment examples are allowed only as public-safe templates. Real compose env files, host-specific bind values, domains, TLS/proxy settings, certificates, SSH aliases, and deployment notes must stay outside Git.

## Public-Suitability Guardrails

This repository is public. Contributions must keep it suitable for a product-facing GitHub project.

Do not commit:

- real secrets, OAuth credentials, API keys, cookies, private keys, certificates, or local environment values;
- private hostnames, deployment topology, reverse-proxy details, SSH aliases, system service files, or operator runbooks;
- machine-local paths, workstation user names, raw private dataset paths, or raw Runtime/OS/network exception traces;
- one-off event packaging, event-only report helpers, or unrelated feature claims in reusable product surfaces;
- restrictive commercial-use or approval-gated licensing language.

For public snapshot data, use logical paths such as `research://...` and generic warnings. If the snapshot publisher changes, preserve sanitization and update its tests.

Neutral test fixtures are expected: use names such as `demo-reviewer`, `example-user`, or `review@diffaudit.test` instead of personal accounts.

## Validation

Run these checks for most changes:

```powershell
python scripts/check_public_boundary.py
npm --prefix apps/web run lint
npm --prefix apps/web run test
npm --prefix apps/web run build
```

If the Go gateway changed, also run:

```powershell
go -C apps/api-go test ./...
```

The combined helper is:

```powershell
python scripts/run_local_checks.py
```

## PR Notes

In the PR description, include:

- what changed and why;
- screenshots for UI changes when useful;
- exact commands run;
- any public API or snapshot schema compatibility notes.

Keep implementation notes concrete and focused on user-visible behavior, compatibility, and validation.

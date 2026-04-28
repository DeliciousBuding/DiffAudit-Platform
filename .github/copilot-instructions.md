# DiffAudit Platform Copilot Review Instructions

This repository is the product and integration layer for DiffAudit.

Repository-level guardrails:

- treat every committed file as public product material;
- flag secrets, real credentials, private hostnames, local user paths, raw OS/network errors, and unsanitized snapshot paths;
- prefer `research://...` logical artifact identifiers in public data instead of machine-local paths;
- keep README/docs product-facing, not as cleanup diaries, deployment runbooks, operator notes, or agent prompts;
- keep licensing aligned with Apache-2.0 and flag restrictive commercial-use or approval-gated usage wording;
- flag invented anti-abuse gates, analytics, marketplace, or unrelated compliance claims unless the feature is actually implemented and requested;
- flag one-off event packaging when it leaks into reusable product surfaces.
- flag deployment changes that commit real env files, hostnames, SSH aliases, TLS/proxy details, certificates, server paths, or runtime topology instead of public-safe templates.
- verify Dockerfiles keep OCI revision labels and deployment examples stay generic.

Prioritize review comments on:

- `apps/web/`, `apps/api-go/`, and shared contracts
- API compatibility, schema drift, auth boundaries, and runtime regressions
- CI failures, dependency risks, and broken workspace or lockfile state
- frontend performance regressions, navigation stalls, and loading-state bugs
- places where platform code wrongly couples itself to research internals
- public snapshot sanitization regressions in `apps/api-go/data/public` and `apps/web/public/snapshot`
- missing screenshots or concrete UI evidence when the PR changes UI structure or visual language

Do not spend review budget on:

- trivial naming or formatting suggestions without runtime impact
- generic framework advice that does not apply to the changed files

When reviewing frontend changes:

- prefer comments about behavior, data flow, accessibility, and actual UX regressions
- avoid cosmetic churn suggestions unless the current change clearly harms usability

When reviewing backend changes:

- focus on handler behavior, proxying, error handling, request validation, and contract stability
- flag hidden assumptions about local ports, service roots, and environment variables

When reviewing CI or dependency changes:

- verify that root lockfiles and workspace lockfiles remain consistent
- treat broken default-branch checks as high priority

Keep comments concrete, implementation-aware, and scoped to merge risk.

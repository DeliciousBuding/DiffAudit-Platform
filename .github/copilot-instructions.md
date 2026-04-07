# DiffAudit Platform Copilot Review Instructions

This repository is the product and integration layer for DiffAudit.

Prioritize review comments on:

- `apps/web/`, `apps/api-go/`, `apps/api/`, and shared contracts
- API compatibility, schema drift, auth boundaries, and runtime regressions
- CI failures, dependency risks, and broken workspace or lockfile state
- frontend performance regressions, navigation stalls, and loading-state bugs
- places where platform code wrongly couples itself to research internals

Do not spend review budget on:

- trivial naming or formatting suggestions without runtime impact
- generic framework advice that does not apply to the changed files
- comments on legacy `apps/api/` unless the PR actually changes it

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

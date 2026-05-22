# DiffAudit Platform Roadmap

Last updated: 2026-05-23 07:37 Asia/Hong_Kong

## Current Goal

Keep the public Platform repository product-ready while advancing workspace UX, report quality, public-safe data boundaries, and deployment portability in small verified increments.

## Principles

- Public demo must work without a live Runtime.
- Runtime and Research integration must go through snapshots and HTTP contracts.
- Public UI and docs must not expose private topology, local paths, secrets, raw Runtime errors, or raw Research workspaces.
- Workspace navigation, copy, status labels, risk labels, and data-mode state must remain derived from the existing registries and facades.
- Workspace UI changes must extend the existing tokens, cards, badges, compact tables, and quiet motion; do not introduce a second visual language.
- `docs/platform-roadmap.md` remains the product-roadmap detail page; this root file is the `/set-goal` execution ledger.

## Active Work

- [x] Create a root `ROADMAP.md` so autonomous Platform work has a repository-local goal ledger.
- [x] Remove render-time browser storage reads from workspace global search to reduce hydration drift risk.
- [x] Clean workspace lint/build signal before deployment consideration.
- [x] Cover the Next proxy auth/demo/locale boundary with regression tests.
- [x] Add Docker/GHCR image provenance verification helpers and clear npm audit.
- [x] Improve printable report pagination and long evidence layout without changing the report data contract.
- [x] Reduce GitHub Actions warning noise by upgrading workflow actions and disabling invalid Go cache lookup.
- [x] Validate publish-time snapshot top-level schemas and surface public-safe manifest warnings.
- [x] Clarify account access state for verified email, linked providers, password access, and two-factor status.
- [x] Strengthen workspace global search combobox semantics, outside-close behavior, and empty-result keyboard bounds.
- [x] Unify theme and language header menu semantics with menu controls and radio-style option state.
- [x] Add accessible title and data summaries to hand-authored SVG charts.
- [x] Strengthen user menu roles, focus return, keyboard wrap handling, and logout menuitem semantics.
- [x] Harden language picker outside-close, Escape close, focus return, and keyboard wrap handling.
- [x] Harden theme picker outside-close, Escape close, focus return, and keyboard wrap handling.
- [x] Extract shared floating-menu focus and keyboard handling for header dropdown controls.
- [x] Extend shared floating-menu focus handling to the report export menu.
- [x] Extract shared dismissible-layer outside-click and Escape handling for the workspace status drawer.
- [x] Move the API key revoke confirmation flow onto the shared Modal primitive.
- [x] Remove redundant model asset delete-dialog Escape handling now covered by the shared Modal primitive.
- [x] Route risk finding slide-over dismissal through shared dismissible-layer behavior.
- [x] Move settings audit-template deletion confirmation onto the shared Modal primitive.
- [x] Route shared Modal outside-click and Escape dismissal through the shared dismissible-layer hook.
- [x] Derive command palette workspace navigation from the shared navigation registry.
- [x] Share workspace navigation shortcut mapping across command palette, shortcut modal, and key handlers.
- [x] Move workspace global search visible copy into the shared workspace copy contract.
- [ ] Continue polishing workspace IA and deep-page consistency through small, reviewable slices.

## Review Gates

- [x] Baseline source and governance docs reviewed.
- [x] Test added or updated for the behavior changed in this slice.
- [x] Frontend lint passed with zero warnings.
- [x] Frontend tests passed.
- [x] Frontend build passed.
- [x] Public boundary check passed.
- [x] Unified local quality gate passed.
- [x] npm audit passed with zero vulnerabilities.
- [x] Go API tests and build passed.
- [x] Git status reviewed before handoff.

## Near-Term Product Work

- [x] Reports: improve printable report pagination, table wrapping, and long-evidence layout.
- [x] Account: polish linked-provider, verified-email, and password-access state.
- [ ] Accessibility: add stronger menu roles, chart text summaries, and focus handling in shared primitives.
- [ ] Workspace UX: keep search, sidebar, topbar, settings, account, API management, and report deep pages visually consistent.

## Backlog

- [x] Snapshot publisher: add more schema validation and clearer warnings before public bundle publication.
- [ ] Research handoff: simplify admitted-evidence import from DiffAudit-Research without exposing raw paths.

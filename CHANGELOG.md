# Changelog

## [2026-09-08] — pnpm Workspace Migration

### Changed
- Web dependency management moved from npm workspaces to pnpm: `pnpm-workspace.yaml` declares `apps/web`, root scripts use `pnpm --filter web …`, and `packageManager` pins the pnpm version for corepack.
- `package-lock.json` is replaced by `pnpm-lock.yaml`. The pnpm lockfile records the optional native bindings for every platform (Tailwind oxide, rollup, esbuild — including `linux-arm64-gnu` and `linux-arm64-musl`), so the Docker build no longer has to re-resolve without a lockfile (the npm/cli#4828 arm64 workaround) and installs with `--frozen-lockfile`.
- CI frontend and e2e jobs install through `pnpm/action-setup` with a pnpm cache; `scripts/run_local_checks.py` and `scripts/check_public_boundary.py` follow the same commands.

### Fixed
- Third-party component types were silently unresolved under npm. `@types/react` was nested in `apps/web/node_modules`, so libraries installed at the repository root could not see it and their props degraded to `any`, which made `tsc --noEmit` a false green. pnpm hoists `@types/react` to the root and exposed five real errors:
  - `lib/router/link.tsx` intersected its own `prefetch?: boolean` with react-router's descriptor union, collapsing the prop to `never`; it now omits `prefetch` from the router props.
  - `ui/command.tsx` forwarded Base UI's render-function `children` into cmdk, which only renders nodes; `CommandDialog` now declares `children?: React.ReactNode`.
  - `ui/sidebar.tsx` annotated the trigger's click event as `React.MouseEvent` instead of Base UI's `BaseUIEvent`; the handler is now contextually typed.

## [2026-07-05] — Security Hardening & Docker Audit

### Added
- Health checks for web and API services in docker-compose (`curl` + `node fetch()`)
- `condition: service_healthy` dependency between web → API
- Non-root USER in both Dockerfiles (`node` for web, `diffaudit` for API)
- Graceful shutdown with `server.Shutdown()` + signal handling in Go API
- Server timeouts (Read/Write/Idle: 10s/30s/120s) + `MaxHeaderBytes`
- Request body size limit (1 MB, `http.MaxBytesReader`) on POST endpoints
- Panic recovery middleware with JSON 500 + stack log
- `ldflags="-w -s"` for smaller Go binary
- `strconv.ParseBool` for DIFFAUDIT_DEMO_MODE (TRUE/1/yes now parse correctly)
- `Vary: Origin` + `Access-Control-Max-Age` headers for CORS correctness
- OCI provenance labels with revision tracking on both Docker images
- SEO foundation: OG/Twitter metadata, `sitemap.ts`, `robots.ts`, JSON-LD `SoftwareApplication`
- `verify_image_provenance.py` helper for deployment verification

### Fixed
- Docker build: removed non-existent `go.sum` COPY (zero external deps)
- `flag.ErrHelp` exit code (2 → 0)
- `curl` installed in Go runner, `node fetch()` for web healthcheck (no curl in slim images)
- npm audit: 5 vulnerabilities resolved (js-yaml, undici, vite) → 0 open
- Pre-push safety: all `D:/Code` paths replaced with relative refs or `<DIFFAUDIT_ROOT>`

### Changed
- Go API CMD binds `0.0.0.0` (was `127.0.0.1`) for container networking
- Enhanced root metadata: title template, 160-char description, `metadataBase`

## Unreleased (dev)

### Added
- CI: GitHub Actions workflow with 4 jobs (frontend, Go, Python, E2E)
- Go API tests: 15 DemoJobStore unit tests + 2 retry method guard tests (66 total)
- Go API tests: 10 tests for retry logic, error hints, cache fallback, timeout config
- Architecture docs: 4-tier publish-time fallback chain documented

### Changed
- Runtime bridge: `forwardControlWithMethod` uses `doWithRetry` (was raw `client.Do`)
- Runtime bridge: configurable `RuntimeTimeout` in proxy config
- Runtime bridge: health check now retries up to 3 times (was 1)
- error-boundary.tsx: hardcoded English strings migrated to WORKSPACE_COPY i18n contract

### Fixed
- Retry safety: `doWithRetry` now only retries GET/HEAD; POST body is not re-consumed on retry
- Retry reliability: `isRetryableError` uses `net.Error` type checks instead of fragile string matching
- copy-button.tsx: removed `navigator.language` anti-pattern, now uses WORKSPACE_COPY via getStoredLocale
- snapshot-publish.yml: sanitized workflow_dispatch inputs to prevent shell injection
- DemoJobStore.Create: input length limits + control character rejection
- Printable report: hardcoded KPI labels migrated to WORKSPACE_COPY
- error-boundary.tsx: hardcoded English strings migrated to WORKSPACE_COPY

### Added
- Research handoff: `--bundle-path` flag for snapshot publisher (decouples sibling-directory assumption)
- Research handoff: publisher now prefers curated `admitted-evidence-bundle.json` over raw unified table
- Publisher tests: 2 new tests for curated bundle + explicit `--bundle-path` (4/4 pass)
- Onboarding: empty start page shows 3-step guide + CTA button (was single gray text line)
- Playwright E2E test infrastructure: 41 tests (smoke, user-flows, report-flow, i18n-navigation, job detail)
- E2E CI job with chromium, artifact upload on failure
- `getTrackDisplayLabel()` shared function in workspace-copy
- Project skill: `.agents/skills/platform-dev/SKILL.md`
- Demo banner on start page dashboard
- Loading skeleton on Settings system status card
- Reports page loading label
- `npm run test:e2e`, `test:e2e:ui`, `test:e2e:chromium`, `test:all` scripts
- `test-results/` and `playwright-report/` in ESLint ignores
- Unit tests: format (22), workspace-registry (7), timing-safe (6), locale (12)
- Go API tests: middleware (5), demo control-plane (9), error safety (2)

### Changed
- **i18n migration**: 21 files migrated to WORKSPACE_COPY contract (~400 keys)
  - All inline COPY/labels/t objects eliminated
  - All user-facing `locale === "zh-CN" ? "..." : "..."` display string ternaries removed
  - 3 demo fixture time strings remain (not user-facing — replaced by live data in production)
  - Shared components: contextual-tip, scroll-to-top, metric-tooltip, printable-audit-report
- Pagination: decoy prev/next → functional client-side pagination (10 items/page)
- Start page: audit cards bilingual, recommendation items bilingual, ROC title from copy
- Auth pages: `shortDescription` replaces fragile `split("。")` hack

### Fixed
- React 19 infinite loop in workspace-global-search (useSyncExternalStore stable refs)
- RISK_NOTE_ZH deduplicated into shared workspace-copy export
- ESLint: 2996 issues → 3 warnings (playwright-report scan excluded)

### Removed
- `docs/workspace-redesign-progress.md` (1090 lines — internal progress diary)
- Dead E2E page objects fixture (220 lines)
- Stale Platform worktrees (74 MB)
- Debug scripts from E2E test runs

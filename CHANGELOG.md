# Changelog

## Unreleased (dev)

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

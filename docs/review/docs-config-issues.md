# Documentation & Configuration Issues

> Generated: 2026-04-30 | Severity: P2
> Reviewer note: 文档和配置层面的混乱，影响新人上手和维护效率。

## 1. Cross-Document Redundancy (6 Documents Say "Don't Leak Secrets")

The same concepts are documented 2-4 times across different files:

| Topic | Documents |
|-------|-----------|
| System architecture / boundary | README, architecture.md, CLAUDE.md |
| Portability / migration | README, portability.md, deploy/README.md, AGENTS.md |
| "Don't commit secrets" | README, AGENTS.md, CLAUDE.md, CONTRIBUTING.md, copilot-instructions.md, SECURITY.md |
| Validation commands | README, AGENTS.md, CLAUDE.md, CONTRIBUTING.md |
| UI primitive rules | DESIGN.md, project-structure.md, AGENTS.md |

- **Severity:** HIGH (maintenance burden, risk of inconsistency)
- **Recommendation:** Each topic should have exactly one authoritative document. Other documents should cross-reference, not restate.

## 2. Environment Variable Naming Contradiction

- **CLAUDE.md** uses: `DIFFAUDIT_GITHUB_CLIENT_ID` / `DIFFAUDIT_GITHUB_CLIENT_SECRET`
- **`.env.example`** and **README.md** use: `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`
- **Severity:** MEDIUM
- **Detail:** Developers will follow one or the other and get confused. One of these is wrong.
- **Recommendation:** Reconcile immediately. Check actual runtime behavior to determine which naming is correct, then update all docs.

## 3. Undocumented Environment Variables

- **File:** `apps/web/.env.example`
- **Severity:** MEDIUM
- **Detail:** Defines `DIFFAUDIT_SESSION_TOKEN` and `DIFFAUDIT_PORTAL_URL` which appear nowhere in the root `.env.example`, README, portability.md, or CLAUDE.md.
- **Recommendation:** Either document them properly or remove them if stale.

## 4. `apps/web/.env.example` Contains Suspicious URL

- **File:** `apps/web/.env.example`
- **Severity:** MEDIUM
- **Detail:** `DIFFAUDIT_TRIAL_FORM_URL` is set to `https://example.feishu.cn/share/base-form` which looks like a real (non-placeholder) Feishu URL. Per AGENTS.md, all examples must use "obviously fake" placeholders.
- **Recommendation:** Change to `https://example.com/your-trial-form` or similar.

## 5. `packages/shared/` Documented as Active but Is Dead

- **Files:** 5+ documentation files reference it
- **Severity:** LOW
- **Detail:** README, architecture.md, portability.md, project-structure.md, CONTRIBUTING.md all describe `packages/shared` as owning "shared contracts and payload examples." In reality it contains one stub JSON file with zero imports.
- **Recommendation:** Either activate it or remove references from documentation.

## 6. `DESIGN.md` Triplicated Rules

- **Files:**
  - `apps/web/DESIGN.md` — sections 5.6, 15, 17
  - `docs/project-structure.md` — "UI Primitive Rules"
  - `AGENTS.md` — "Do not add new broad global CSS selectors"
- **Severity:** LOW
- **Detail:** The `button:not(...)` selector prohibition and UI primitive ownership rules appear in three documents. Risk of them drifting out of sync.
- **Recommendation:** Keep the rule in `project-structure.md` (the structural governance doc). DESIGN.md and AGENTS.md should cross-reference it.

## 7. `deploy/README.md` Overlaps with Root README

- **Files:**
  - `deploy/README.md` (110 lines)
  - `README.md` lines 177-204
- **Severity:** LOW
- **Detail:** Both show `build_docker_images.ps1` commands, compose up commands, GHCR image names, and tag conventions. ~70% overlap.
- **Recommendation:** Root README should link to `deploy/README.md` instead of restating content.

## 8. Doc-to-Code Ratio Is Acceptable

- **Metric:** 2,957 lines of markdown vs 26,057 lines of source code = **1:8.8**
- **Assessment:** Within reasonable bounds. The problem is not volume but redundancy.

## 9. No `knip` or Dead Export Detection in CI

- **Severity:** MEDIUM
- **Recommendation:** Add automated dead code detection to prevent future accumulation of unused files and exports.

## 10. Root `.env.example` vs `apps/web/.env.example` Inconsistency

- **Root** (28 lines): Comprehensive, all variables with comments
- **App** (5 lines): Minimal, only 5 variables, includes vars not in root
- **Severity:** LOW
- **Recommendation:** Consolidate into a single source of truth. The root `.env.example` should be canonical; app-level should either inherit or be auto-generated.

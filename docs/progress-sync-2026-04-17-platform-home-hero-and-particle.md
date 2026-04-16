# Progress Sync Note - 2026-04-17

## Scope

- Repository: `Platform`
- Branch: `main`
- Mainline: Platform frontend experience and runtime sync readiness
- Related feature line: homepage hero locale copy + particle animation rhythm stabilization

## Why This Update

The homepage Chinese hero copy regressed to English text, causing locale mismatch on `/`.
At the same time, particle animation timing and test consistency needed stabilization before push and `gz2` sync.

## What Was Changed

### 1. Homepage zh-CN hero copy restored

Updated `apps/web/src/components/marketing-home.tsx` zh-CN hero copy to:

- 标题: `探明数据记忆边界`
- 副标题: `让生成模型的隐私风险与合规分析有迹可循。`
- 描述: `基于成员推断攻击（MIA）的生成式扩散模型隐私审计平台。`

This fixes the mismatch where zh-CN and en-US hero text appeared identical.

### 2. Locale-facing test corrected

Updated `apps/web/src/components/marketing-home.test.tsx` to assert actual Chinese hero copy for zh-CN.

### 3. Test and type debt cleaned to keep mainline green

Adjusted test fixtures/assertions to align with current component and API contracts:

- `apps/web/src/components/auth-forms.test.tsx`
  - Added required `hidePasswordCta` fixture field.
  - Updated an outdated assertion to match current rendered login structure.
- `apps/web/src/app/(workspace)/workspace/settings/SettingsClient.test.tsx`
  - Added required `twoFactorEnabled` to all `CurrentUserProfile` fixtures.
- `apps/web/src/app/api/auth/verify-email.test.ts`
  - Updated calls to `POST()` to match current zero-argument route handler signature.
- `apps/web/src/components/particle-field.test.ts`
  - Removed stale `MEMBER_COLORS` import/assertion.
  - Synced particle count assertion to current exported value.
- `apps/web/src/app/(auth)/layout.test.tsx`
  - Updated expectations to match current auth layout class structure.

### 4. Particle animation version locked

Kept the approved particle behavior version (the one user selected) in:

- `apps/web/src/components/particle-field.tsx`

## Verification

Executed on `apps/web`:

- `npx tsc --noEmit` -> pass
- `npm run test` -> pass
  - Result: 28 passed test files, 93 passed tests, 0 failed

## Branch and Sync Status (at note time)

- Local branch: `main`
- Local is ahead of `origin/main` with stacked commits in this working sequence
- Remotes configured:
  - `origin` -> GitHub
  - `gz2` -> runtime host bare repo

## Push and Runtime Sync Plan

1. Commit this finalized fix/documentation set to `main`.
2. Push `main` to `origin`.
3. Push `main` to `gz2` (runtime remote) for server-side fast-forward sync.
4. On `gz2` live worktree, fast-forward pull and restart only if service rollout is required.
5. Re-verify:
   - local web routes (`/`, `/login`, `/workspace`)
   - public route headers via runbook sequence

## Handoff Essentials

- Touched top-level directory: `Platform/`
- Mainline: frontend UX/copy stabilization + runtime-ready sync
- Cross-directory boundary touched: no
- Competition materials sync needed: no direct `Docs/competition-materials` changes in this update
- Next reader should start from:
  - `Platform/docs/progress-sync-2026-04-17-platform-home-hero-and-particle.md`
  - `Platform/docs/public-runtime-runbook.md`
  - `Platform/docs/public-runtime-handoff.md`

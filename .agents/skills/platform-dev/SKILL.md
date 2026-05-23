---
name: platform-dev
description: DiffAudit Platform 开发 SOP——copy contract 模式、测试策略、分支管理、代码约定。在 Platform 项目内工作时自动适用。
---

# Platform Dev Skill

> 项目级 SOP，不包含本机路径、凭据、IP。可跨 Agent 复用。

## 快速触发

当 Agent 需要在 Platform 项目内做开发时，先读本文件 + `AGENTS.md` + `ROADMAP.md`。

## 核心约定

### 1. 国际化 (i18n)

所有面向用户的字符串必须通过 `WORKSPACE_COPY` 契约：

```ts
// ✅ 正确
import { WORKSPACE_COPY } from "@/lib/workspace-copy";
const copy = WORKSPACE_COPY[locale].reports;
<h1>{copy.title}</h1>

// ❌ 错误——永远不要这样写
<h1>{locale === "zh-CN" ? "报告" : "Reports"}</h1>
```

新增字符串步骤：
1. 在 `apps/web/src/lib/workspace-copy.ts` 的 type 定义中添加键
2. 在 `en-US` 对象中添加英文值
3. 在 `zh-CN` 对象中添加中文值
4. 在组件中使用 `WORKSPACE_COPY[locale].<section>.<key>`
5. 运行 `npm run test:web` 确保 key parity test 通过

共享函数放 `workspace-copy.ts` 顶部，如 `getTrackDisplayLabel()`。

### 2. 测试策略

| 层级 | 工具 | 用途 |
|---|---|---|
| Unit | Vitest | 工具函数、数据转换、组件逻辑 |
| E2E | Playwright | 页面加载、用户流程、i18n、a11y |

- `npm test` — Vitest unit tests
- `npm run test:e2e` — Playwright E2E (smoke + user-flows)
- `npm run test:all` — 全部

从 Platform 根目录运行: `npm run lint:web`, `npm run test:web`, `npm run build:web`.
新建 lib 工具必须写 test。E2E 测试至少覆盖每个 workspace 页面的加载和核心用户流程。

### 3. 工作台 Copy Contract 速查

| Section | 用途 | 文件数 |
|---|---|---|
| `workspace` | 工作台总览、KPI、图表、审计路线卡片 | start/page.tsx |
| `audits` | 审计任务列表、筛选、分页、状态标签 | AuditsPageClient, TaskListClient |
| `createTask` | 创建任务向导 | CreateTaskClient |
| `reports` | 报告中心、对比视图、审计视图、打印报告 | ReportsPageClient, ReportAuditView, printable-audit-report |
| `apiKeys` | API 密钥管理 | ApiKeysClient |
| `settings` | 系统设置、账户、偏好 | SettingsClient |
| `riskFindings` | 风险发现列表、详情面板 | RiskFindingsClient, FindingDetailPanel |
| `modelAssets` | 模型 toast 消息 | ModelAssetsClient |
| `modelAssetsPage` | 模型资产页面 | model-assets/page.tsx |
| `riskReport` | 风险报告生成 | risk-report.ts |

### 4. 分支策略

- `main` — 稳定发布
- `dev` — 持续开发集成

### 5. Git 约定

- 小范围 commit，每个独立变更一个 commit
- Commit message: `type: what changed` (refactor/test/feat/fix/chore)
- 不用 `--force`、`--no-verify`

### 6. UI 规则 (来自 AGENTS.md)

- Card containers: `rounded-2xl`，内部元素: `rounded-xl`
- Typography: `text-[13px]` body, `text-[11px]` secondary, `text-[10px]` badges
- Lucide icons: `strokeWidth={1.5}`
- 颜色: `text-[var(--accent-blue)]` 等 CSS custom properties
- Button text on colored bg: `text-white`

### 7. 页面清单

| Route | 权限 | Key |
|---|---|---|
| `/workspace/start` | primary | workspace |
| `/workspace/audits` | primary | audits |
| `/workspace/audits/new` | primary | audits |
| `/workspace/audits/[jobId]` | primary | audits |
| `/workspace/model-assets` | primary | modelAssets |
| `/workspace/risk-findings` | primary | riskFindings |
| `/workspace/reports` | primary | reportCenter |
| `/workspace/reports/[track]` | primary | reportCenter |
| `/workspace/api-keys` | account | apiKeys |
| `/workspace/account` | account | account |
| `/workspace/settings` | account | settings |

## 开发循环

1. `git checkout dev` — 确保在 dev 分支
2. 读 `ROADMAP.md` 了解当前 active work
3. 小范围变更 → lint → test → commit
4. 每 3-5 个 commit 跑一次 cross-review
5. 完成阶段性工作后更新 ROADMAP.md

## 质量门

每次 commit 前：
- [ ] `npm run lint:web` — 0 errors
- [ ] `npm run test:web` — all pass
- [ ] `npm run build:web` — success (大型变更时)

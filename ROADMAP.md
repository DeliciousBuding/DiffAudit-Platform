# DiffAudit Platform 综合开发 ROADMAP

> Last updated: 2026-04-17 (post chief-designer override: Axis A packaging deferred, continue product-ization)
> 状态: Sprints 1.1-7.4 complete | Demo-ready | Part 11 verified | Runtime E2E recon verified (AUC=0.849) | Part 12: 分支整合进行中（12.5 blocked） | Part 13/14: 新建
> Deadline: 2026-04-19（计算机设计大赛）
> Posture: 演示能力维持 demo-ready；不进行提交包 docx/hash/zip 打包动作
> Hardware: RTX 4070 Laptop 8GB + CPU
> 本 ROADMAP 覆盖 Platform + Runtime-Server 全部工程任务。
> **Research 相关任务由 Codex 独立执行，不在本文档范围内**；但根 ROADMAP §4 `B-M0` 产出若改动消费面，Platform 侧按 Part 13.2 + 规则 6 响应。

---

## Part 0: 全景状态审计

### 0.1 当前可用功能

| 模块 | 状态 | 说明 |
|------|------|------|
| 营销首页 `/` | **可用** | 双语 hero + particle field（空壳 `return null`）+ 功能卡片 |
| 登录/注册 `/login` `/register` | **可用** | login-form + register-form + trial-form 组件齐全 |
| Trial 页 `/trial` | **可用** | trial-form 存在，流程可走通 |
| 工作台首页 `/workspace` | **可用** | KPI 卡片（4 个）+ 风险分布（3 级）+ 最近结果表 + 任务面板 |
| 审计列表 `/workspace/audits` | **可用** | Active tasks（3s 轮询）+ Task history 表格 |
| 创建任务 `/workspace/audits/new` | **可用** | 4 步引导表单（attack type → model → params → review）|
| 报告页 `/workspace/reports` | **可用** | 攻防表 + 覆盖缺口表 + CSV 导出 |
| 设置页 `/workspace/settings` | **部分可用** | 页面存在但内容单薄 |
| 文档页 `/docs` | **可用** ✅ | 多页面文档系统（左导航树 + 右 TOC + 7 篇双语文档）|
| Go API Gateway `:8780` | **部分可用** | 快照读取 + Demo 模式 + Runtime 转发框架（`forwardControl`）|
| Runtime-Server `:8765` | **部分可用** | Job CRUD + 并发控制（semaphore）+ 超时 + 健康检查 + Runner 目录（recon/pia/gsa）|

### 0.2 技术栈快照

```
Platform/apps/web           Next.js 16.2.2 (Turbopack) + React + Tailwind CSS
Platform/apps/api-go        Go 1.x + http.ServeMux + snapshot-based serving
Runtime-Server              Go 1.x + http.ServeMux + Python Runners (recon/pia/gsa)
Research                    Python (PyTorch) + external codebases  ← Codex 管辖

前端组件库（27 个）:
  导航/壳: platform-shell, platform-nav, workspace-sidebar, language-picker
  首页:   marketing-home, particle-field(空壳), brand-mark
  工作台: workspace-page, live-jobs-panel, kpi-card
  审计:   TaskListClient, create-job-button, audit-toolbar, audit-filters, jobs-list
  报告:   results-table, contracts-table, export-report-button, risk-badge
  通用:   status-badge, skeleton, runtime-status-badge
  认证:   login-form, register-form, trial-form, logout-button

前端 lib（12 个）:
  api-proxy, audit-client, audit-jobs, auth, catalog,
  evidence-report, fetch-timeout, locale, navigation,
  platform-shell, risk-report, theme, workspace-copy

前端 hooks（1 个）:
  use-theme (light/dark + View Transition API + clipPath 动画)

Go 端点:
  Platform: /health, /api/v1/catalog, /api/v1/audit/jobs,
            /api/v1/evidence/*, /api/v1/experiments/*, /api/v1/models
  Runtime:  /health, /api/v1/catalog, /api/v1/audit/jobs,
            /api/v1/evidence/*, /api/v1/experiments/*
```

### 0.3 关键缺失与问题

| 缺失项 | 影响 | 优先级 |
|--------|------|------|
| ~~Go API 未真正代理 job 创建到 Runtime~~ | ~~任务创建只在 Demo 模式有效~~ | ✅ **已修复** |
| ~~无独立 job 详情页~~ | ~~用户无法追踪单个任务~~ | ✅ **已修复** |
| ~~无前端 Progress 组件~~ | ~~无法展示实时进度~~ | ✅ **已修复** |
| ~~无 Toast/Modal/Dialog 组件~~ | ~~缺交互反馈基础设施~~ | ✅ **已修复** |
| ~~无图表组件~~ | ~~报告页只有干表~~ | ✅ **已修复** |
| ~~无 PDF 报告导出~~ | ~~比赛需要 PDF 材料~~ | ✅ **已修复** |
| ~~Particle Field 空壳~~ | ~~首页核心视觉缺失~~ | ✅ **已修复** |
| ~~Dark Mode 未启用~~ | ~~CSS 未定义 dark tokens~~ | ✅ **已修复** |
| ~~设置页内容单薄~~ | ~~缺配置项~~ | ✅ **已修复** |
| ~~文案偏英文风格~~ | ~~缺中文语感~~ | ✅ **已修复** |
| 无移动端导航 | sidebar 在 <1024px 直接消失 | **P3** ⏭️ 赛后 |
| ~~无页面切换动效~~ | ~~体验生硬~~ | ✅ **已修复** |
| Runtime 无 Docker 隔离 | 跑模型有环境污染风险 | **P2** ⏭️ 赛后 |
| ~~Runtime job 执行逻辑不完整~~ | ~~是否真正启动 Runner 需确认~~ | ✅ **已修复** |
| Part 13.2 Research packet 消费面预检 | `evidence_level / quality_cost` 已完成前向兼容消费；`boundary` 仍待 Research producer 落地 | **P1** 持续跟进 |
| Part 13.3 Runtime contract 稳态验证 | `recon / pia` 冒烟通过；`gsa` 在最小空资产树下稳定 blocked；Runtime 已写入并前端已展示 `job.state_history`；剩余缺口仅为 `gsa` 资产完备性 blocker | **P1** 进行中（剩 `gsa` 资产 blocker） |
| Part 12 分支整合收尾 | 12.5 验收阻塞：`gz2` 缺失 `v0.1.0-stable` tag；`remotes/gz2/deploy-sync-2026-04-17` 残留；tag commit 与 Part 11 验收快照不一致 | **P0** Part 12 保持进行中 |
| Part 14.1 报告详情页长期化首轮脚手架 | 新增 `/workspace/reports/[track]` 双视图脚手架；默认展示视图已落地，审计视图可读 provenance 但 producer 侧仍缺 `seed / fixture_version / stable history` | ✅ **进行中（脚手架完成）** |

### 0.4 参考设计

**Claude Code Docs**（`Archive/legacy-projects/docs-reference/`）是重点参考对象：
- 布局：navbar + tabs + left file tree（18rem）+ content body + right TOC（16rem）
- 左侧分组导航、active 状态高亮、可展开子项
- 顶部 tab 导航 + active underline 指示器
- 内容区 max-w-prose 阅读宽度
- 搜索栏（Ctrl+K）、主题切换、外部链接
- **借鉴方式**：学习其信息架构和布局比例，但用 DiffAudit 自己的深色审计风格替换

---

## Part 1: P0 冲刺任务（4.19 比赛必做）

### Sprint 1.1: 端到端任务执行闭环

**目标**：前端创建任务 → Go API 代理到 Runtime → Runtime 执行 → 前端轮询/展示状态 → 结果可查

| # | 子任务 | 负责 | 文件 | 预估 |
|---|--------|------|------|------|
| 1.1.1 | 确认 Runtime `handleCreateJob` 是否真正启动 Runner | Runtime Engineer | `Runtime-Server/internal/api/server.go` | 1h |
| 1.1.2 | 如未实现，补充 job 执行逻辑（选 Runner → 启动进程 → 写状态） | Runtime Engineer | 同上 | 4h |
| 1.1.3 | 补充 job 进度回报（stdout/stderr tail → 前端可读） | Runtime Engineer | 同上 | 2h |
| 1.1.4 | 补充 job 取消逻辑（`handleCancelJob`） | Runtime Engineer | 同上 | 1h |
| 1.1.5 | Go API 增加 `DELETE /api/v1/audit/jobs/{jobID}` 代理 | Backend Integrator | `Platform/apps/api-go/internal/proxy/server.go` | 1h |
| 1.1.6 | Go API 增强错误处理（Runtime 不可用时友好降级） | Backend Integrator | 同上 | 1h |
| 1.1.7 | 前端 job 详情页 `workspace/audits/[jobId]/page.tsx` | Frontend Designer | 新建页面 | 3h |
| 1.1.8 | 前端取消按钮 + Modal 确认对话框 | Frontend Designer | job 详情页 | 1h |
| 1.1.9 | TaskListClient "View" 链接跳转到 job 详情页 | Frontend Designer | `TaskListClient.tsx` | 0.5h |
| 1.1.10 | 端到端测试：创建 → queued → running → completed → 查看 | Leader | 全链路 | 2h | ✅ 全链路验证通过 |

**验收标准**：
1. Runtime 运行时，前端创建任务后状态流转：queued → running → completed
2. Runtime 不可用时，Go API 返回友好错误（非原始 502）
3. job 详情页显示：状态、创建时间、耗时、contract key、结果指标（AUC/ASR）
4. 取消按钮可取消运行中的任务

---

### Sprint 1.2: 报告可视化 + PDF 导出

**目标**：报告页出图、可导出 PDF，比赛可直接用

| # | 子任务 | 负责 | 文件 | 预估 |
|---|--------|------|------|------|
| 1.2.1 | 安装 recharts 图表库 | Frontend Designer | `package.json` | 0.5h |
| 1.2.2 | AUC 分布直方图组件 | Frontend Designer | `src/components/chart-auc-distribution.tsx` | 2h |
| 1.2.3 | ROC 曲线组件 | Frontend Designer | `src/components/chart-roc-curve.tsx` | 2h |
| 1.2.4 | 风险分布柱状图（high/medium/low） | Frontend Designer | `src/components/chart-risk-distribution.tsx` | 1h |
| 1.2.5 | 攻击效果对比雷达图（Recon vs PIA vs GSA） | Frontend Designer | `src/components/chart-attack-comparison.tsx` | 2h |
| 1.2.6 | 报告页嵌入图表（替换部分表格展示） | Frontend Designer | `workspace/reports/page.tsx` | 2h |
| 1.2.7 | 工作台首页 KPI 卡片旁嵌入迷你图表 | Frontend Designer | `workspace/page.tsx` | 1h |
| 1.2.8 | PDF 导出方案选型（html2canvas + jsPDF 优先） | Frontend Designer | 新 export pipeline | 1h |
| 1.2.9 | PDF 模板（封面 + 目录 + 图表截图 + 攻防表） | Frontend Designer | PDF template | 3h |
| 1.2.10 | 一键导出 PDF 按钮 + 导出中 loading | Frontend Designer | 报告页集成 | 1h |

**验收标准**：
1. 报告页至少展示 3 种图表（AUC 分布、ROC 曲线、风险分布）
2. 点击"导出 PDF"生成完整报告文件
3. PDF 文件包含封面、目录、图表、表格，可直接用于比赛提交

---

### Sprint 1.3: 前端文案与 UX 优化（去 AI 味 + 产品感）

**目标**：全站文案有产品语感，不再有 AI 生成或开发者自嗨的味道

| # | 子任务 | 负责 | 文件 | 预估 |
|---|--------|------|------|------|
| 1.3.1 | 全站文案审查：标记偏 AI 味/开发者味的 copy | Product Manager | `workspace-copy.ts` + 全部页面 | 2h |
| 1.3.2 | 重写 KPI label（"Audits Evaluated" → "已完成审计"等） | Product Manager | `workspace-copy.ts` | 1h |
| 1.3.3 | 重写按钮文案（"Submit" → "开始审计"等） | Product Manager | `workspace-copy.ts` | 1h |
| 1.3.4 | 重写空状态文案（"No results" → "还没有审计结果，创建一个任务试试"） | Product Manager | `empty-state` | 0.5h |
| 1.3.5 | 重写错误提示（"Request failed" → "审计服务暂时不可用，请稍后重试"） | Product Manager | `api-proxy.ts` | 0.5h |
| 1.3.6 | 创建任务表单文案优化（步骤标题/描述更口语化） | Product Manager | `CreateTaskClient.tsx` | 1h |
| 1.3.7 | 文档页文案审查（确保不是论文翻译腔） | Product Manager | `docs-data.ts` | 1h |
| 1.3.8 | 设置页文案补齐（三个区域的 label + description） | Product Manager | `SettingsClient.tsx` | 1h |

**文案原则**：
- **中文优先语感**：用中文思考后翻译，不是从英文直译
- **具体不抽象**：不要"赋能安全分析"，说"找出模型泄露的训练数据"
- **有态度**：不要"我们提供全面的审计方案"，说"我们只关心一件事——你的数据是不是被记住了"
- **动词先行**：不要"审计结果展示"，说"看看模型记住了什么"
- **数字说话**：不要"高风险"，说"AUC=0.91，几乎能确定成员关系"

---

## Part 2: P1 优化任务（体验提升）

### Sprint 2.1: 组件库补齐

| # | 子任务 | 负责 | 文件 | 预估 |
|---|--------|------|------|------|
| 2.1.1 | Toast 组件（success/error/warning/info + auto dismiss） | Frontend Designer | `src/components/toast.tsx` | 2h |
| 2.1.2 | Toast provider + 全局 useToast hook | Frontend Designer | `src/components/toast-provider.tsx` | 1h |
| 2.1.3 | Modal/Dialog 组件（header + body + footer + backdrop） | Frontend Designer | `src/components/modal.tsx` | 2h |
| 2.1.4 | Tabs 组件（inline + full-width 两种变体） | Frontend Designer | `src/components/tabs.tsx` | 1h |
| 2.1.5 | Progress 组件（bar + circle + skeleton pulse） | Frontend Designer | `src/components/progress.tsx` | 1.5h |
| 2.1.6 | Breadcrumb 组件 | Frontend Designer | `src/components/breadcrumb.tsx` | 0.5h |
| 2.1.7 | EmptyState 组件（icon + title + description + CTA） | Frontend Designer | `src/components/empty-state.tsx` | 1h |
| 2.1.8 | Tooltip 组件 | Frontend Designer | `src/components/tooltip.tsx` | 1h |
| 2.1.9 | Badge 组件（已有 risk-badge/status-badge，统一为 badge 组件） | Frontend Designer | `src/components/badge.tsx` | 1h |

### Sprint 2.2: 设置页完善

| # | 子任务 | 负责 | 文件 | 预估 |
|---|--------|------|------|------|
| 2.2.1 | 偏好设置区（语言切换 + 主题切换 + 通知偏好） | Frontend Designer | `workspace/settings/page.tsx` | 2h |
| 2.2.2 | Runtime 连接配置（host/port/test connection） | Backend Integrator | 同上 | 1h |
| 2.2.3 | 默认审计参数模板 | Frontend Designer | 同上 | 1h |
| 2.2.4 | 账户信息展示 | Frontend Designer | 同上 | 0.5h |

### Sprint 2.3: 文档系统增强（参考 Claude Code Docs）

| # | 子任务 | 负责 | 文件 | 预估 |
|---|--------|------|------|------|
| 2.3.1 | 文档搜索（Ctrl+K 快捷键 + 模糊搜索标题/内容） | Frontend Designer | docs search component | 3h |
| 2.3.2 | 文档页面路由改为 Next.js 路由（当前是客户端状态切换） | Frontend Designer | docs layout + routing | 2h |
| 2.3.3 | 文档顶部 tab 导航（快速开始/结构/运行/参考） | Frontend Designer | docs tabs component | 1.5h |
| 2.3.4 | 文档代码块语法高亮 | Frontend Designer | docs code block | 1h |
| 2.3.5 | 文档页内"编辑此页"链接 | Frontend Designer | docs footer | 0.5h |
| 2.3.6 | 上一篇/下一篇导航 | Frontend Designer | docs navigation | 0.5h |

### Sprint 2.4: 工作台体验优化

| # | 子任务 | 负责 | 文件 | 预估 |
|---|--------|------|------|------|
| 2.4.1 | 工作台 KPI 卡片增加趋势指示（相比上次审计的变化） | Frontend Designer | `workspace/page.tsx` | 1h |
| 2.4.2 | 最近结果表增加风险标签和颜色编码 | Frontend Designer | `results-table.tsx` | 1h |
| 2.4.3 | 任务面板增加"一键重试失败任务"按钮 | Frontend Designer | `live-jobs-panel.tsx` | 1h |
| 2.4.4 | 审计报告页增加"覆盖率缺口"可视化 | Frontend Designer | `reports/page.tsx` | 2h |
| 2.4.5 | 工作台增加"建议的下一步"提示 | Product Manager | `workspace/page.tsx` | 1h |

---

## Part 3: P2 增强任务（架构演进）

### Sprint 3.1: Dark Mode

**基础**：`hooks/use-theme.ts` 已有完整的主题切换逻辑（含 View Transition API + clipPath 动画），缺的是 CSS 变量定义。

| # | 子任务 | 负责 | 文件 | 预估 |
|---|--------|------|------|------|
| 3.1.1 | 定义 CSS 变量体系（light tokens + dark tokens） | Frontend Designer | `src/app/globals.css` | 2h |
| 3.1.2 | 在 `html[data-theme="dark"]` 下覆盖所有颜色变量 | Frontend Designer | `globals.css` | 1h |
| 3.1.3 | 全组件 dark 适配审查（确保没有硬编码颜色） | Frontend Designer | 全部组件 | 3h |
| 3.1.4 | 在设置页添加主题切换入口 | Frontend Designer | `settings/page.tsx` | 0.5h |

**Dark 风格方向**：
- 背景：深色灰（不是纯黑），类似 VS Code dark+ 的层次感
- 强调色：蓝色/青色在深色背景上更醒目
- 文字：高对比度，次要文字用灰而不是白
- 边框：深色模式下边框更微妙，用 opacity 而不是固定色值

### Sprint 3.2: Particle Field 实现

**目标**：首页 hero 背后的粒子效果是产品第一视觉印象

| # | 子任务 | 负责 | 文件 | 预估 |
|---|--------|------|------|------|
| 3.2.1 | 设计粒子效果（密度、速度、连线、颜色、交互响应） | Frontend Designer | 设计决策 | 1h |
| 3.2.2 | Canvas 实现粒子系统（requestAnimationFrame 驱动） | Frontend Designer | `particle-field.tsx` | 3h |
| 3.2.3 | 粒子间连线（距离阈值内连线，营造网络感） | Frontend Designer | 同上 | 1h |
| 3.2.4 | 鼠标交互响应（粒子被鼠标排斥/吸引） | Frontend Designer | 同上 | 1h |
| 3.2.5 | 性能优化（粒子数限制、离屏 Canvas、devicePixelRatio 适配） | Frontend Designer | 同上 | 1h |
| 3.2.6 | 移动端降级（减少粒子数或使用 CSS 替代方案） | Frontend Designer | 同上 | 0.5h |

**风格方向**：
- 不是花哨的彩色粒子，是深色背景上微弱的白/蓝点 + 细连线
- 营造"数据在网络中流动"的感觉，呼应"审计"主题
- 速度慢，密度中等，不要太抢眼——hero 文案才是主角

### Sprint 3.3: 前端性能优化

| # | 子任务 | 负责 | 文件 | 预估 |
|---|--------|------|------|------|
| 3.3.1 | Bundle 分析（`next build` 后检查 chunk 大小） | Frontend Designer | Next.js config | 1h |
| 3.3.2 | 路由级代码分割审查（确保动态 import 到位） | Frontend Designer | 全部 route | 1h |
| 3.3.3 | recharts 按需导入（不要全量打包） | Frontend Designer | chart components | 0.5h |
| 3.3.4 | 图片优化（WebP + next/image + 懒加载） | Frontend Designer | 全部图片引用 | 1h |
| 3.3.5 | 字体优化（中文用系统字体优先，避免 webfont） | Frontend Designer | `globals.css` | 0.5h |
| 3.3.6 | 首屏 Lighthouse 跑分 + 瓶颈分析 | Frontend Designer | Chrome DevTools | 1h |

### Sprint 3.4: Runtime Docker 隔离

| # | 子任务 | 负责 | 文件 | 预估 |
|---|--------|------|------|------|
| 3.4.1 | Docker 环境评估（检查宿主机是否安装 Docker + nvidia-container-toolkit） | Runtime Engineer | 环境检查 | 0.5h |
| 3.4.2 | Runner Docker 镜像构建（Python + PyTorch + 依赖） | Runtime Engineer | `Runtime-Server/Dockerfile` | 3h |
| 3.4.3 | job 执行改为容器启动（`docker run` 替代直跑） | Runtime Engineer | `server.go` | 4h |
| 3.4.4 | GPU 资源限制（`--gpus` + 显存上限） | Runtime Engineer | 同上 | 2h |
| 3.4.5 | 容器清理（完成后 `docker rm`，失败保留日志） | Runtime Engineer | 同上 | 1h |
| 3.4.6 | 非 Docker 模式兼容（开发环境 `--execution-mode=local`） | Runtime Engineer | 同上 | 1h |

---

## Part 4: 前端 UI/UX 设计体系

### Sprint 4.1: 设计语言统一

**目标**：全站共用同一套视觉语法，不再有"两套站"的感觉

| # | 子任务 | 负责 | 文件 | 预估 |
|---|--------|------|------|------|
| 4.1.1 | DESIGN.md 审查：补齐缺失的 component pattern 定义 | Frontend Designer | `DESIGN.md` | 2h |
| 4.1.2 | 统一按钮体系（primary/secondary/ghost/danger 四级） | Frontend Designer | 新 button 组件 | 2h |
| 4.1.3 | 统一卡片体系（default/elevated/bordered/ghost 四种材质） | Frontend Designer | 新 card 组件 | 1.5h |
| 4.1.4 | 统一表格体系（compact/relaxed 两种密度） | Frontend Designer | 统一 table 基础 | 1h |
| 4.1.5 | 统一输入框体系（default/search/textarea 三种） | Frontend Designer | 新 input 组件 | 1h |
| 4.1.6 | 统一间距 scale（4/8/12/16/24/32/48 px） | Frontend Designer | `globals.css` | 0.5h |
| 4.1.7 | 统一圆角 scale（4/8/12/16/24 px） | Frontend Designer | `globals.css` | 0.5h |
| 4.1.8 | 统一阴影 scale（sm/md/lg/xl 四级） | Frontend Designer | `globals.css` | 0.5h |

### Sprint 4.2: 动效系统

| # | 子任务 | 负责 | 文件 | 预估 |
|---|--------|------|------|------|
| 4.2.1 | 页面切换过渡（fade + slide up，Next.js 路由级） | Frontend Designer | layout 层 | 2h |
| 4.2.2 | 按钮点击 ripple / scale 微动效 | Frontend Designer | button 组件 | 0.5h |
| 4.2.3 | 列表项进入动画（stagger fade-in） | Frontend Designer | table/list 组件 | 1h |
| 4.2.4 | 数据刷新 loading 微动效（不是转圈，是脉冲） | Frontend Designer | skeleton + progress | 0.5h |
| 4.2.5 | Toast 进出动画（slide from top + fade） | Frontend Designer | toast 组件 | 0.5h |
| 4.2.6 | Modal 进出动画（scale + backdrop fade） | Frontend Designer | modal 组件 | 0.5h |
| 4.2.7 | 定义 transition tokens（duration/easing 统一） | Frontend Designer | `globals.css` | 0.5h |

### Sprint 4.3: 移动端适配

| # | 子任务 | 负责 | 文件 | 预估 |
|---|--------|------|------|------|
| 4.3.1 | 移动端底部导航栏（首页/工作台/审计/报告/设置） | Frontend Designer | 新 bottom-nav 组件 | 2h |
| 4.3.2 | 汉堡菜单（替代 sidebar） | Frontend Designer | 新 hamburger-menu 组件 | 2h |
| 4.3.3 | 表格横向滚动优化（sticky first column） | Frontend Designer | 全部 table 组件 | 1h |
| 4.3.4 | 表单移动端适配（input size + 按钮 touch target） | Frontend Designer | 全部 form 组件 | 2h |
| 4.3.5 | 文档页移动端适配（左导航改为抽屉式） | Frontend Designer | docs layout | 1h |
| 4.3.6 | KPI 卡片移动端堆叠 | Frontend Designer | workspace page | 0.5h |

---

## Part 5: 后端与 Runtime 深度集成

### Sprint 5.1: Go API Gateway 完善

| # | 子任务 | 负责 | 文件 | 预估 |
|---|--------|------|------|------|
| 5.1.1 | 补充 `DELETE /api/v1/audit/jobs/{jobID}` 端点 | Backend Integrator | `proxy/server.go` | 1h |
| 5.1.2 | 补充 `POST /api/v1/audit/jobs/{jobID}/cancel` 端点 | Backend Integrator | 同上 | 1h |
| 5.1.3 | Runtime 不可用时返回缓存快照（last known state） | Backend Integrator | 同上 | 2h |
| 5.1.4 | 请求超时配置化（catalog=5s, jobs=30s, experiments=60s） | Backend Integrator | 同上 | 1h |
| 5.1.5 | 错误码规范化（统一 `{detail, code, hint}` 格式） | Backend Integrator | 同上 | 1h |
| 5.1.6 | 日志结构化（JSON + 请求 ID + 响应时间） | Backend Integrator | 同上 | 1h |
| 5.1.7 | CORS 中间件（配置允许的 origin/method/header） | Backend Integrator | 同上 | 0.5h |
| 5.1.8 | 健康检查聚合（Platform + Runtime 状态 + 版本信息） | Backend Integrator | 同上 | 0.5h |

### Sprint 5.2: Runtime 任务队列

| # | 子任务 | 负责 | 文件 | 预估 |
|---|--------|------|------|------|
| 5.2.1 | 评估当前并发控制（semaphore）是否满足需求 | Runtime Engineer | `server.go` | 1h |
| 5.2.2 | 实现基于文件的 job 持久化（当前是内存，重启丢失） | Runtime Engineer | job store | 3h |
| 5.2.3 | 实现 job 重试策略（exponential backoff，最多 3 次） | Runtime Engineer | job executor | 2h |
| 5.2.4 | 实现 job 优先级（quick audit > full audit） | Runtime Engineer | job queue | 2h |
| 5.2.5 | 实现 job 进度报告机制（stdout parsing + summary file watching） | Runtime Engineer | job monitor | 3h |
| 5.2.6 | 实现 job 日志捕获（stdout/stderr → log file → API 可读） | Runtime Engineer | job logger | 2h |

### Sprint 5.3: 前后端实时联动

| # | 子任务 | 负责 | 文件 | 预估 |
|---|--------|------|------|------|
| 5.3.1 | 评估 polling vs SSE vs WebSocket 方案 | Backend Integrator | 技术选型 | 1h |
| 5.3.2 | 实现 SSE endpoint（Runtime → 前端推送 job 状态变更） | Runtime Engineer | `server.go` | 3h |
| 5.3.3 | 前端 SSE client（自动重连 + 降级到 polling） | Frontend Designer | 新 sse-client | 2h |
| 5.3.4 | 实时进度条集成 SSE 数据 | Frontend Designer | job 详情页 | 1h |

---

## Part 6: Research → Runtime 集成

> **注意**：Research 实验的执行和调优由 Codex 独立负责。本 Part 只关注**如何把 Research 产出的攻击逻辑提取为 Runtime 可调用的 Runner**。

### Sprint 6.1: Runner 标准化

| # | 子任务 | 负责 | 文件 | 预估 |
|---|--------|------|------|------|
| 6.1.1 | 定义 Runner 接口规范（输入/输出/进度报告格式） | Runtime Engineer | `runners/shared/` | 2h |
| 6.1.2 | Recon Runner 标准化（接入 Recon 攻击脚本） | Runtime Engineer | `runners/recon-runner/` | 3h |
| 6.1.3 | PIA Runner 标准化（接入 PIA 攻击脚本） | Runtime Engineer | `runners/pia-runner/` | 3h |
| 6.1.4 | GSA Runner 标准化（接入 GSA 攻击脚本） | Runtime Engineer | `runners/gsa-runner/` | 3h |
| 6.1.5 | Runner 配置管理（每个 Runner 的默认参数 + 可覆盖项） | Runtime Engineer | profiles | 1h |

### Sprint 6.2: 审计合同（Contract）体系

| # | 子任务 | 负责 | 文件 | 预估 |
|---|--------|------|------|------|
| 6.2.1 | 定义审计合同格式（contract_key + track + method + parameters） | Leader | `catalog.json` 格式 | 1h |
| 6.2.2 | 合同与 Runner 的映射关系（一个 contract → 一个 Runner 实例） | Runtime Engineer | registry | 1h |
| 6.2.3 | 合同执行结果的标准输出格式（summary.json 统一 schema） | Leader | Runner output spec | 1h |
| 6.2.4 | 证据等级体系（admitted / candidate / no-go） | Leader | 证据定义文档 | 1h |

---

## Part 7: 产品创新功能

### Sprint 7.1: 风险雷达

**目标**：工作台首页增加一个多维度风险可视化，让评委第一眼看到"这个产品在分析风险"

| # | 子任务 | 负责 | 文件 | 预估 |
|---|--------|------|------|------|
| 7.1.1 | 设计风险雷达维度（AUC/ASR/TPR/coverage/defense_effectiveness） | Product Manager | 设计稿 | 1h |
| 7.1.2 | 雷达图组件（recharts radar） | Frontend Designer | 新 chart component | 2h |
| 7.1.3 | 工作台首页集成雷达图（KPI 卡片旁边） | Frontend Designer | `workspace/page.tsx` | 1h |

### Sprint 7.2: 审计工作流引导

| # | 子任务 | 负责 | 文件 | 预估 |
|---|--------|------|------|------|
| 7.2.1 | 创建任务时增加"推荐配置"（根据目标模型推荐 attack 族） | Product Manager | `CreateTaskClient.tsx` | 2h |
| 7.2.2 | 任务完成后自动建议下一步（"建议运行防御对照实验"） | Product Manager | job 详情页 | 1h |
| 7.2.3 | 空工作台引导新用户（"还没有审计，创建第一个任务"） | Frontend Designer | workspace page | 1h |

### Sprint 7.3: 对比分析模式

| # | 子任务 | 负责 | 文件 | 预估 |
|---|--------|------|------|------|
| 7.3.1 | 设计对比视图 UI（两个审计结果 side-by-side） | Frontend Designer | 新 compare view | 2h |
| 7.3.2 | 实现对比逻辑（选择两个 job → 渲染差异） | Frontend Designer | compare 页面 | 2h |
| 7.3.3 | 对比报告导出（包含对比图的 PDF 页面） | Frontend Designer | PDF export | 1h |

### Sprint 7.4: 一键生成比赛材料

| # | 子任务 | 负责 | 文件 | 预估 |
|---|--------|------|------|------|
| 7.4.1 | 定义比赛材料模板（封面 + 摘要 + 三条攻击线结果 + 防御对比 + 创新点） | Leader | PDF template | 2h |
| 7.4.2 | 从审计结果自动填充模板数据 | Frontend Designer | export pipeline | 2h |
| 7.4.3 | 一键导出按钮（带 loading 和下载触发） | Frontend Designer | reports page | 0.5h |

---

## Part 8: 部署公网

### Sprint 8.1: 部署基础设施

| # | 子任务 | 负责 | 文件 | 预估 |
|---|--------|------|------|------|
| 8.1.1 | Docker Compose 编排（Web + API + Runtime） | Backend Integrator | `docker-compose.yml` | 3h |
| 8.1.2 | Web 端 Dockerfile（Next.js standalone + Node.js runtime） | Backend Integrator | `Platform/apps/web/Dockerfile` | 1h |
| 8.1.3 | API 端 Dockerfile（Go multi-stage build） | Backend Integrator | `Platform/apps/api-go/Dockerfile` | 1h |
| 8.1.4 | Runtime 端 Dockerfile（含 GPU 支持） | Runtime Engineer | `Runtime-Server/Dockerfile` | 2h |
| 8.1.5 | 环境变量清单（`.env.example` 覆盖所有配置项） | Backend Integrator | 两个项目根目录 | 1h |
| 8.1.6 | Nginx 反向代理配置（Web + API + WebSocket/SSE） | Backend Integrator | `nginx.conf` | 2h |

### Sprint 8.2: 安全与运维

| # | 子任务 | 负责 | 文件 | 预估 |
|---|--------|------|------|------|
| 8.2.1 | HTTPS 配置（Let's Encrypt certbot） | Backend Integrator | 部署脚本 | 1h |
| 8.2.2 | CORS 策略（只允许同域 + 特定 origin） | Backend Integrator | API middleware | 0.5h |
| 8.2.3 | Rate Limiting（per-IP 请求频率限制） | Backend Integrator | API middleware | 1h |
| 8.2.4 | 输入验证（job 创建参数校验，防注入） | Backend Integrator | API 端点 | 1h |
| 8.2.5 | 依赖安全扫描（`npm audit` + `govulncheck`） | Leader | CI pipeline | 1h |
| 8.2.6 | 部署文档（README + 部署指南） | Backend Integrator | `DEPLOY.md` | 2h |

---

## Part 9: Agent 编排与任务分配

### 9.1 角色定义

| 角色 | 能力 | 负责范围 |
|------|------|----------|
| **Leader**（总控 Claude Opus） | 规划、编排、验收、跨角色协调 | 全局调度、GitHub push、时间线管理、验收 |
| **Product Manager** | 产品定位、文案审查、交互设计 | 文案优化、用户体验、工作流引导 |
| **Frontend Designer** | Next.js/React/Tailwind/动画 | 全部前端页面、组件、样式、动效、图表 |
| **Backend Integrator** | Go API + 网络协议 + 部署 | Go Gateway、代理、错误处理、Docker 编排 |
| **Runtime Engineer** | Runtime-Server + Python Runners + Docker | 任务执行、Runner 管理、容器化、队列 |
| **Code Reviewer** | 代码审查、bug 定位、安全审计 | 每次提交前审查 |

### 9.2 Subagent 调度规则

**重要**：为避免浪费总控 Agent 的上下文空间，所有 subagent 应遵循以下规则：

1. **独立执行**：每个 subagent 接收完整的任务描述 + 文件路径 + 验收标准，不需要总控 Agent 反复解释
2. **结果汇报**：subagent 完成后只返回简短结果（做了什么 + build 状态 + 是否需要跟进），不返回长分析
3. **并行优先**：不依赖的任务并行启动（如 Frontend Designer 做 UI 的同时 Backend Integrator 做 API）
4. **验收门槛**：每个 subagent 任务完成后必须跑 `build + lint`，失败则 self-fix
5. **总控介入时机**：只在以下情况总控 Agent 介入：
   - 需要跨角色协调
   - subagent 报告遇到无法解决的问题
   - 需要更新 ROADMAP 时间线
   - 需要 push 到 GitHub

### 9.3 任务分配矩阵

| Sprint | Product Mgr | Frontend Designer | Backend Integrator | Runtime Eng | Leader | Reviewer |
|--------|-------------|-------------------|-------------------|-------------|--------|----------|
| 1.1 执行闭环 | - | job 详情页 + 取消 UI | Go API 代理 + 错误处理 | job 执行 + 进度 | 验收 | 端到端 |
| 1.2 可视化+PDF | - | 图表+PDF 全链路 | - | - | - | 视觉 |
| 1.3 文案 UX | 全站文案审查+重写 | 组件文案配合 | 错误提示文案 | - | - | - |
| 2.1 组件库 | - | 9 个新组件 | - | - | - | 组件 |
| 2.2 设置页 | - | 设置区 UI | Runtime 配置 API | - | - | - |
| 2.3 文档增强 | - | 搜索+路由+tabs | - | - | - | - |
| 2.4 工作台 | 建议下一步文案 | KPI 趋势+结果可视化 | - | - | - | - |
| 3.1 Dark Mode | - | CSS+全组件适配 | - | - | - | 视觉 |
| 3.2 Particle | - | Canvas 实现 | - | - | - | 性能 |
| 3.3 性能优化 | - | Bundle+图片+字体 | - | - | - | - |
| 3.4 Docker | - | - | - | 容器化全链路 | - | 安全 |
| 4.1 设计语言 | - | 按钮+卡片+表格+输入框 | - | - | DESIGN.md | 视觉 |
| 4.2 动效 | - | 全量动效系统 | - | - | - | - |
| 4.3 移动端 | - | 底部导航+汉堡菜单 | - | - | - | - |
| 5.1 Go API | - | - | 全量完善 | - | - | 代码 |
| 5.2 任务队列 | - | - | - | 队列+持久化+重试 | - | - |
| 5.3 实时联动 | - | SSE client | SSE 方案 | SSE server | 选型 | - |
| 6.1 Runner | - | - | - | Runner 标准化 | 接口定义 | - |
| 6.2 Contract | 证据等级定义 | - | - | 映射+输出格式 | 定义 | - |
| 7.1 雷达 | 维度设计 | 雷达图+集成 | - | - | - | - |
| 7.2 工作流 | 引导文案 | 空状态+推荐 UI | - | - | - | - |
| 7.3 对比 | - | 对比视图 | - | - | - | - |
| 7.4 比赛材料 | 模板定义 | PDF 自动填充 | - | - | - | - |
| 8.1 部署 | - | Web Dockerfile | Compose+Nginx | Runtime Dockerfile | 验收 | - |
| 8.2 安全 | - | - | CORS+Rate Limit | - | 安全扫描 | 安全 |

---

## Part 10: 4.19 比赛演示

### 10.1 演示流程（5 分钟脚本）

```
[0:00-0:15]  打开首页 → Particle Field 动画 + hero "让隐私风险无处可藏"
[0:15-0:45]  导航到工作台 → KPI 卡片 + 风险雷达 + 最近结果表
[0:45-1:30]  创建审计任务 → 4步引导 → 提交后显示实时进度
[1:30-2:00]  查看任务执行 → 进度条 + 状态轮询 → 任务完成
[2:00-2:45]  查看审计结果 → AUC 分布图 + ROC 曲线 + 风险等级
[2:45-3:30]  导出比赛材料 → 一键生成 PDF → 封面 + 图表 + 表格
[3:30-4:00]  文档页 → 展示架构文档 + API 参考（左导航树 + 右 TOC）
[4:00-5:00]  总结 → 三条攻击线结果 + 防御对比 + 创新功能展示
```

### 10.2 演示必需功能清单

| 功能 | 状态 | 验收日期 |
|------|------|----------|
| 首页（hero + Particle Field） | ✅ Canvas 粒子系统 + 鼠标交互 | 4.15 |
| 工作台（KPI + 风险分布 + 最近结果） | ✅ 已有 | - |
| 审计列表（active tasks + history） | ✅ 3s 轮询 | - |
| 创建任务（4步引导） | ✅ 已有 | - |
| 任务执行（真实执行） | ✅ API Gateway → Runtime → Runner 全链路 | 4.15 |
| 任务详情（进度 + 状态） | ✅ job 详情页 + 进度条 + 状态轮询 | 4.15 |
| 报告页（图表 + 对比表） | ✅ 4 种图表（AUC/ROC/风险分布/攻击对比） | 4.15 |
| PDF 导出 | ✅ html2canvas + jsPDF + 封面 + 图表 + 表格 | 4.15 |
| 文档页（多页导航） | ✅ 左导航树 + 右 TOC + 7 篇双语文档 | - |
| 风险雷达 | ✅ ChartRiskRadar 五维度 | 4.15 |
| Dark Mode | ✅ CSS 变量体系 + use-theme 切换 | 4.15 |

### 10.3 时间线

```
4.15          Sprint 1.1-7.4 全部完成 ✅ | Part 11 验收通过 ✅
4.16          5 分钟演示排练
4.19          比赛
```

### 10.4 延期项（赛后推进）

| Sprint | 说明 |
|--------|------|
| 3.3 Docker 隔离 | 需要宿主机环境评估，赛后再做 |
| 3.4 前端性能优化 | 比赛演示场景对性能要求不高 |
| 4.2 动效系统 | 锦上添花 |
| 4.3 移动端适配 | 比赛用笔记本演示 |
| 5.2 任务队列 | 当前 semaphore 够用 |
| 5.3 实时联动（SSE） | Polling 够用 |
| 7.3 对比分析 | 赛后增强功能 |
| 8.x 部署公网 | 赛后部署 |

---

## Part 11: 验收清单

### 技术验收

- [x] `npm run build:web` 通过（零 error，零 warning）— 2026-04-15 ✅
- [x] `go build ./...` 通过（Platform API）— 2026-04-15 ✅
- [x] `go build ./...` 通过（Runtime-Server）— 2026-04-15 ✅
- [x] `go test ./...` 通过（全部 Go 测试）— 2026-04-15 ✅（4 packages all pass）
- [x] 端到端任务创建→执行→完成→查看全流程可用 — 2026-04-15 全链路验证 ✅（API Gateway → Runtime → Runner → 状态流转 → 结果捕获）
- [x] Demo 模式仍可用（不影响原有展示能力）— API Gateway `--demo-mode` 路径独立 ✅

### 体验验收

- [x] 首页、工作台、审计页、报告页、设置页、文档页共用同一套视觉语言 — 2026-04-15 审计 ✅（统一 Tailwind 设计令牌，修复 `--color-*` 缺失定义，统一 hover/risk 令牌化）
- [x] 所有页面中文文案自然流畅（不是英文直译）— workspace-copy.ts 双语体系 ✅
- [x] 报告页至少展示 3 种图表 — 4 种 ✅（AUC 分布、ROC 曲线、风险分布、攻击对比）
- [x] PDF 导出包含封面、图表、表格 — competition-report.tsx ✅（封面页 + 审计摘要 + 风险分布 + 三条攻击线 + 防御对比 + 创新亮点）

### 4.19 演示验收

- [ ] 5 分钟演示流程可完整走通 — 4.16 排练
- [x] Particle Field 正常渲染 — Canvas 粒子系统 ✅（鼠标交互、Dark Mode 适配、devicePixelRatio 支持）
- [x] 任务能真实执行并返回结果 — 2026-04-15 全链路验证 ✅
- [x] 风险雷达显示在首页 — ChartRiskRadar 嵌入 ✅（AUC/ASR/TPR/Coverage/Defense 五维度）
- [x] PDF 比赛材料一键导出 — html2canvas + jsPDF ✅（带 fallback HTML 降级）

---

## Part 12: 验收修复日志（2026-04-15）

### P0: Dev mode CSS parsing crash
- **问题**: `globals.css` 的 `@import url(...)` 在 `:root` 规则之后，违反 CSS 规范导致 dev server 全页面 500
- **修复**: 将 `@import` 规则移至文件顶部（在所有 `:root` 之前）
- **文件**: `apps/web/src/app/globals.css`

### P0: Docs/Modal/Toast 组件在 light mode 下缺失样式
- **问题**: `--color-bg-primary` 等 12 个 CSS 变量只有 dark mode 覆盖，从未在 `:root` 定义
- **修复**: 在 `:root` 中添加完整定义，映射到已有 palette 令牌
- **文件**: `apps/web/src/app/globals.css`

### P1: 硬编码颜色令牌化
- **问题**: `#1f5ce0`（hover blue）在 5 个文件中硬编码，风险色 `#ff5f46`/`#b67619`/`#157a52` 在 workspace/page.tsx 中硬编码
- **修复**: 新增 `--accent-blue-hover` 令牌，替换所有硬编码为 `var(--risk-high/medium/low)` 和 `var(--accent-blue-hover)`
- **文件**: `globals.css`, `workspace/page.tsx`, `audits/page.tsx`, `CreateTaskClient.tsx`, `button.tsx`

### P1: 设置页补充"关于系统"板块（Day 4 应用场景 + 系统边界）
- **问题**: 设置页缺少"应用场景"和"系统边界"说明（ROADMAP-2026-04-19 Day 4 要求）
- **修复**: 新增"关于系统"卡片，含 4 个应用场景、系统边界说明、三层审计框架
- **文件**: `SettingsClient.tsx`, `workspace-copy.ts`（双语 i18n）

### P0: Runtime job 全量失败（4.15 验证发现）
- **问题**: 所有 4/14 的 Runtime jobs 均为 failed 状态。根因：(1) recon upstream_eval 缺少 sklearn 依赖 (2) GSA adaptive 参数代码已修复但 pyc 缓存未清除 (3) PIA/GSA 缺少 Research 数据集资产
- **修复**: 安装 scikit-learn + 清理 `__pycache__` + 验证 recon_artifact_mainline 端到端成功（AUC=0.849, ASR=0.51, TPR@1%FPR=1.0）
- **文件**: Python 环境（pip install scikit-learn）, `Runtime-Server/runners/**/__pycache__/`

### P1: ROADMAP Part 10.2 状态表过时
- **问题**: Part 10.2 演示必需功能清单仍显示 ❌，与 Part 11 验收结果矛盾
- **修复**: 更新 Part 10.2 为全部 ✅，更新 Part 10.3 时间线为实际进度
- **文件**: `ROADMAP.md`

### P1: 报告页/工作台/创建任务页硬编码英文文案（4.15 演示审计发现）
- **问题**: 报告页 4 个图表标题（"AUC Score Distribution"等）、2 个表头行、攻击对比维度标签全部硬编码英文；工作台结果表 4 列标题英文；创建任务页"estimated"/"On"/"Off"英文
- **修复**: 新增 `reports.sections` 7 个 i18n 字段 + `reports.tableHeaders` 12 个字段 + `reports.chartDimensions` 数组 + `workspace.sections.tableHeaders` 4 个字段 + `createTask.labels` 3 个字段，替换全部硬编码为 `{copy.*}` 引用
- **文件**: `workspace-copy.ts`（类型 + en-US + zh-CN）, `reports/page.tsx`, `workspace/page.tsx`, `CreateTaskClient.tsx`

### P1: 任务详情页全量 i18n（4.15 演示审计发现）
- **问题**: 任务详情页（[jobId]/page.tsx + JobDetailClient.tsx）所有 UI 文字硬编码英文：页面标题"Job Detail / Audit Job"、状态标签"Queued/Running/Completed"、7 个详情卡片标题、"Error"标签、"stdout/stderr (tail)"日志标签、"lines"、错误提示"Failed to load job"等
- **修复**: 新增 `jobDetail.eyebrow/title/description` + `jobDetail.statusLabels`（5 个状态） + `jobDetail.labels`（12 个字段），替换 JobDetailClient.tsx 和 page.tsx 全部硬编码
- **文件**: `workspace-copy.ts`, `audits/[jobId]/page.tsx`, `audits/[jobId]/JobDetailClient.tsx`

### P2: 残余硬编码英文修复（4.15 深度审计）
- **问题**: TaskListClient.tsx 状态标签（"Queued/Running/Completed/Failed/Cancelled"）、重试按钮（"Retry"/"Retrying..."）、重试提示（"Retry this job"）；workspace/page.tsx 结果表 AUC/ASR/TPR 列标题、"No AUC data available" 空状态；CreateTaskClient.tsx "Submission failed" 错误回退
- **修复**: 新增 `audits.statusLabels`（5 个状态双语）+ `audits.retry/retrying/retryTitle` + `workspace.sections.tableHeaders.auc/asr/tpr` + `workspace.sections.noAucData` + `createTask.labels.submissionFailed`，替换全部硬编码为 i18n 引用
- **文件**: `workspace-copy.ts`, `TaskListClient.tsx`, `workspace/page.tsx`, `CreateTaskClient.tsx`

---

## Part 12: 分支整合与仓库清理（2026-04-17）

> 目标：将所有有价值的分支工作合并到 main，清理过期分支，统一三端（本地/origin/gz2）状态。
> 2026-04-17 16:56:54 +08:00 Part 12.5 验收：`main` 三端一致、`gz2/deploy` 已追平、三端构建通过；但 `gz2` 缺失 `v0.1.0-stable`、本地仍见 `remotes/gz2/deploy-sync-2026-04-17` 残留，且 tag commit 与 Part 11 验收快照不一致。Part 12 保持进行中。

### 12.1 分支现状审计

| 分支 | 位置 | 领先 main | 状态 | 处置 |
|------|------|-----------|------|------|
| `cleanup/branch-and-docs-consolidation` | 本地 | 0 | 与 main 完全一致 | 删除 |
| `deploy-gz2` | 本地 | 18 | gz2/feat 的子集 | 删除 |
| `codex/audit-template-flow-20260414` | 本地+origin | 2(本地)/5(origin) | audit 模板 + figma 文档，5 文件冲突 | 合并 |
| `backup/phase2-snapshot-20260416` | 本地 | 19 | phase2 中间快照 | tag 后删除 |
| `archive/platform-main-pre-squash-20260414` | 本地 | 11 | 压缩前历史 | tag 后删除 |
| `gz2/feat/demo-mode-and-snapshot-data` | gz2 | 29 | 最完整功能分支（i18n/a11y/perf） | 合并 |
| `origin/feat/demo-mode-and-snapshot-data` | origin | 5 | 安全补丁 + bug fix | cherry-pick |
| `origin/runtime-closeout-20260414` | origin | 2 | 已被 main 包含 | 删除 |
| `gz2/deploy` | gz2 | 19 | 落后 54 commits | 重置到 main |
| `gz2/main` | gz2 | 17 | 落后 54 commits | 重置到 main |
| `gz2/deploy-sync-2026-04-17` | gz2 | 0 | 临时同步分支 | 删除 |
| `gz2/backup/pre-main-sync-20260416-1237` | gz2 | 17 | 与 gz2/main 相同 | 删除 |

### 12.2 合并计划（按顺序）

1. ✅ 合并 `gz2/feat/demo-mode-and-snapshot-data` → main（29 commits，含 i18n/dark mode/a11y/性能优化）
2. ✅ 合并 `codex/audit-template-flow-20260414` → main（audit 模板 + figma 文档）
3. ✅ cherry-pick `origin/feat/demo-mode-and-snapshot-data` 独有的安全补丁（如不在 gz2 版本中）

### 12.3 清理计划

1. 本地旧分支打 tag 后删除：`archive/*`, `backup/*`, `cleanup/*`, `deploy-gz2`
2. origin 删除已合并分支：`runtime-closeout-20260414`, `feat/demo-mode-and-snapshot-data`, `codex/audit-template-flow-20260414`
3. gz2 重置 main/deploy 到最新，删除临时分支
4. 本地构建验证 → gz2 部署验证

### 12.4 最终目标状态

- 本地/origin/gz2 三处 `main` 一致
- gz2 `deploy` 指向最新 main
- 只保留 `main` 一个活跃分支 + `v0.1.0-stable` tag + 历史 archive tags
- 所有有价值的工作不丢失

### 12.5 Part 12 收尾验收清单（2026-04-17 新增）

收尾前逐项核对；全部 ✅ 后在 Part 12 标题后打 ✅：

- [x] 本地 / `origin` / `gz2` 三处 `main` HEAD hash 一致：`11acc8760548e79439bf2ab3202742f257fd33c1`
- [ ] `v0.1.0-stable` tag 存在且已推送到 `origin` 与 `gz2`
  - 当前状态：本地与 `origin` 均为 `306f7aa9830df1c91a370242e0d0d899bb3b0d8f`，`gz2` 未返回该 tag
- [x] `gz2/deploy` 指向最新 `main`
  - 当前状态：`gz2/deploy = gz2/main = 11acc8760548e79439bf2ab3202742f257fd33c1`
- [ ] 临时 / backup / cleanup 分支已删除并归档到 archive tag（`archive/*`, `backup/*`, `cleanup/*`, `deploy-gz2`）
  - 当前状态：`backup|cleanup|temp|wip` 过滤结果为空，但 `git branch -a` 仍见 `remotes/gz2/deploy-sync-2026-04-17` 残留；本地仅见 `archive/pre-squash-20260414` 与 `backup/phase2-20260416` 两个历史 tag
- [x] 构建回放 clean：`apps/web` `npm run build` + `apps/api-go` `go build ./...` + `Runtime-Server` `go build ./...` 三端零错
- [ ] `v0.1.0-stable` tag commit 上 `git log -1 --stat` 与 Part 11 验收快照一致
  - 当前状态：tag commit 为 `306f7aa9830df1c91a370242e0d0d899bb3b0d8f`（2026-04-16 `feat: v4 hero redesign...`），不对应 Part 11 的 2026-04-15 验收快照

---

## Part 13: 4.17–4.19 持续推进（非打包冲刺模式，2026-04-17 新增）

定位：不进行 4C 打包动作、也不停 Platform 工程推进；维持 demo-ready 同时为 Research 新 packet 消费面做准备。根 ROADMAP §0 chief-designer override 下的 Platform 具体落地。

当前推荐执行顺序（2026-04-17 晚）：

1. 先收 `Part 12.5`：`v0.1.0-stable` / `gz2` / remote residue / `Part 11` 验收快照对齐。
2. 再跑 `Sprint 13.1` 每日 demo smoke，守住 `/workspace -> /workspace/audits -> /workspace/reports/[track] -> /workspace/settings`。
3. `Part 14.1` 只维持现有 audit-view 脚手架，不抢做 `run log / summary jump`，直到 producer 稳定给出 `seed / fixture_version / history chain / log-tail link`。

### Sprint 13.1 演示能力无回归体检

- [ ] 每日一次 demo mode 冷启动冒烟：`npm run dev` + Go API `:8780` + Runtime `:8765` 同时起，走一遍 `/workspace → /workspace/audits → /workspace/reports/[track] → /workspace/settings`
- [ ] `/workspace/reports/[track]` 在 snapshot 切换（`apps/api-go/data/public/*.json` 被 Research 新快照覆盖）时无 401 / 空态 / 字段缺失
- [ ] Runtime fallback 路径 toast 文案完整：`:8765` 未启或不可达时，前端给出明确 fallback 提示而非静默
- [ ] `apps/web` 构建产物 hash 与当前 main HEAD 对齐，`npm run build` 无警告升级

### Sprint 13.2 Research packet 消费面预检

- [x] 审查 `apps/api-go/data/public/attack-defense-table.json` schema，确认是否暴露根 ROADMAP §2.2 + Research §X-85 新增的 `evidence_level` / `quality_cost` / `boundary` 字段
- [x] 前端 `/workspace/reports/*` 读侧添加 `evidence_level` / `quality_cost` 兜底读取（缺字段不崩）
- [x] Risk badge / attack-defense-table 组件对 `evidence_level = "admitted" | "mainline" | "challenger"` 三值可视化；`quality_cost` 值展示为辅助气泡
- [x] 不阻塞 demo；纯向前兼容修改；完成后在本 Sprint 末尾打 ✅

结果（2026-04-17）: 已确认当前 snapshot 含 `evidence_level / quality_cost`、不含 `boundary`；`/workspace/reports` 与 printable 报告已完成前向兼容消费与可视化；`boundary` 暂记 `pending Research producer`；`npm run build` 通过（存在现有 `middleware` deprecation warning），`go build ./...` 通过。

### Sprint 13.3 Runtime contract 稳态验证

- [ ] [blocked: `gsa` fastest-path smoke 在最小空 `assets_root` 下稳定 failed；缺 `datasets/*` / `checkpoints/*` / `manifests` / `sources`] `Runtime-Server/runners/{recon,pia,gsa}` 三条 runner 冒烟脚本产出结构化日志（`queued → running → completed/failed` 全链路 timestamp）
- [x] job lifecycle 每一跳写入 `job.state_history`，前端详情页 `/workspace/audits/[jobId]` 按顺序展示
  - 当前状态：Runtime 已补 `job.state_history` + RFC3339Nano timestamp，并经 `recon / pia / gsa` 三条 job 路径验证；前端详情页现已完成消费、按顺序展示，并补上最小 Vitest 覆盖
- [x] 若根 ROADMAP §4 `B-M0` 产出新 packet（e.g., bounded shadow-LR 或 I-C white-gray bridge），runtime 能以现有 schema 接入，不需要紧急 schema 改动；若需要，记入 Sprint 13.2 当 sprint 解决

结果（2026-04-17）: 已在隔离 Runtime 实例上完成 `recon / pia / gsa` 冒烟；`recon` 与 `pia` 直跑 + Runtime job 均完成，`gsa` 在最小空资产树下稳定返回 blocked/failed，但生命周期时间线完整。`Runtime-Server/internal/api/server.go` 已最小补丁为每次状态跳转写入 `job.state_history`。额外用带未知字段 `gray_box_composite_summary` 的合成 `summary.json` 走 `/api/v1/experiments/{workspace}/summary` 读路径验证，当前 ingestion 对未知字段前向兼容，无需紧急 schema 改动。详见 `D:/Code/DiffAudit/tmp/platform-part13-3-runtime-smoke.md`。

---

## Part 14: 4.20 起 Track G2 产品化入口（2026-04-17 新增）

定位：对标根 ROADMAP §5 Track G2（平台产品化）。本 Part 是 4.19 之后的迁移入口，不在 4.17–4.19 窗口执行，但需要在 4.19 前完成条目编排以免比赛后散掉。

### Sprint 14.1 报告详情页长期化

- [x] 把当前 `/workspace/reports/[track]` 比赛展示页拆分为「展示视图」+「长期审计视图」两种形态
- [x] 长期审计视图增加：实验溯源（run 目录 / seed / schedule）、历史对照（同 track 前后 verdict diff）
- [ ] 支持跳转到具体 run 的日志尾巴 / summary.json

结果摘要（2026-04-17）：
- 已新增 `/workspace/reports/[track]?view=display|audit`，默认 `display` 保持展示形态，`audit` 为长期化脚手架。
- 已补 `ReportDisplayView` / `ReportAuditView` 与最小 Vitest；缺失 provenance 字段按 `—` 退化。
- 未完成项：snapshot producer 目前没有稳定提供 `seed / fixture_version / history chain / log-tail link`，因此 run 日志跳转仍保留到后续 Sprint。

### Sprint 14.2 筛选 / 比较 / 追溯

- [ ] 攻防表支持按 `threat_model × defense × evidence_level` 三维过滤
- [ ] 双列对比视图：任意两条 row 并排看 `AUC / ASR / TPR@1%FPR / TPR@0.1%FPR` 差
- [ ] 组合过滤可生成可分享 URL（query string 序列化）

### Sprint 14.3 admitted / mainline / challenger 增量消费

- [ ] 目前 `apps/api-go/data/public/` 是 snapshot 全量覆盖；升级为 append-only + per-entry version
- [ ] 新 Research verdict 落地后不需要整包替换
- [ ] 前端根据 `version` 做增量缓存失效

### Sprint 14.4 Runtime snapshot vs live 边界硬化（Track G3 先手）

- [ ] 在前端清楚标识 `Source: snapshot (frozen)` 或 `Source: live runtime (job-id ...)`
- [ ] 避免评委/用户混淆：badge + tooltip 两层提示
- [ ] 对接根 ROADMAP §5 Track G3 Runtime 工程化方向

### Sprint 14.5 移动端导航（P3 → P2）

- [ ] sidebar 在 `<1024px` 下必须有 drawer 替代（当前直接消失）
- [ ] 触摸优化：所有主 CTA 最小 44x44
- [ ] 国创阶段需要在手机演示，因此本 Sprint 在 Part 14 内部属 P1

---

## 附：状态更新规则

每次推进后：
1. 在对应任务前打 ✅
2. 在 Sprint 末尾写简短结果摘要（做了什么 + 花了多久 + 遇到什么问题）
3. 如果发现新任务，添加到对应 Part
4. 如果某条路走不通，标注原因并标记为 skip
5. 更新 Part 10 的时间线
6. 根 ROADMAP §4 `B-M0` GPU release 若落地 verdict，Platform 侧需在 48h 内完成 Part 13.2 schema 对齐与 Part 13.3 runtime 冒烟；若 verdict 改动消费面，记入 Sprint 13.2 当窗口处理，不延后到 Part 14

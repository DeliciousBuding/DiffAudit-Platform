# DiffAudit Platform 综合开发 ROADMAP

> Last updated: 2026-04-15
> Deadline: 2026-04-19（计算机设计大赛）
> Hardware: RTX 4070 Laptop 8GB + CPU
> 本 ROADMAP 覆盖 Platform + Runtime-Server 全部工程任务。
> **Research 相关任务由 Codex 独立执行，不在本文档范围内。**

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
|--------|------|--------|
| Go API 未真正代理 job 创建到 Runtime | 任务创建只在 Demo 模式有效 | **P0** |
| 无独立 job 详情页（点了"View"无处跳转） | 用户无法追踪单个任务 | **P0** |
| 无前端 Progress 组件 | 无法展示实时进度 | **P1** |
| 无 Toast/Modal/Dialog 组件 | 缺交互反馈基础设施 | **P2** |
| 无图表组件（AUC 分布/ROC 曲线/风险柱状图） | 报告页只有干表 | **P1** |
| 无 PDF 报告导出 | 比赛需要 PDF 材料 | **P1** |
| Particle Field 空壳 | 首页核心视觉缺失 | **P2** |
| Dark Mode 未启用 | 虽然 use-theme 已有基础，但 CSS 未定义 dark tokens | **P2** |
| 设置页内容单薄 | 缺团队/密钥/偏好/Runtime 配置 | **P2** |
| 文案偏英文风格 | workspace-copy.ts 部分 copy 偏英文直译，缺中文语感 | **P1** |
| 无移动端导航 | sidebar 在 <1024px 直接消失 | **P3** |
| 无页面切换动效 | 体验生硬 | **P3** |
| Runtime 无 Docker 隔离 | 跑模型有环境污染风险 | **P2** |
| Runtime job 执行逻辑不完整 | 收到请求后是否真正启动 Runner 需确认 | **P0** |

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
| 1.1.10 | 端到端测试：创建 → queued → running → completed → 查看 | Leader | 全链路 | 2h |

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

| 功能 | 状态 | Sprint |
|------|------|--------|
| 首页（hero + Particle Field） | ❌ Particle Field 空壳 | 3.2 |
| 工作台（KPI + 风险分布 + 最近结果） | ✅ 已有 | - |
| 审计列表（active tasks + history） | ✅ 已有 | - |
| 创建任务（4步引导） | ✅ 已有 | - |
| 任务执行（真实执行） | ❌ Demo 模式 | 1.1 |
| 任务详情（进度 + 状态） | ❌ 无详情页 | 1.1 |
| 报告页（图表 + 对比表） | ❌ 只有表格 | 1.2 |
| PDF 导出 | ❌ 只有 CSV | 1.2 |
| 文档页（多页导航） | ✅ 已有 | - |
| 风险雷达 | ❌ 不存在 | 7.1 |
| Dark Mode | ❌ CSS 未定义 | 3.1（可选）|

### 10.3 时间线

```
4.15（今天）  Sprint 1.1 启动（端到端闭环）+ Sprint 1.3 启动（文案优化）
4.16          Sprint 1.1 验收 + Sprint 1.2 启动（可视化+PDF）
4.17          Sprint 1.2 验收 + Sprint 2.1 启动（组件库）
4.18          Sprint 7.1（雷达）+ Sprint 3.2（Particle）+ 集成测试
4.19          演示彩排 + 比赛
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

- [ ] `npm run build:web` 通过（零 error，零 warning）
- [ ] `go build ./...` 通过（Platform API）
- [ ] `go build ./...` 通过（Runtime-Server）
- [ ] `go test ./...` 通过（全部 Go 测试）
- [ ] 端到端任务创建→执行→完成→查看全流程可用
- [ ] Demo 模式仍可用（不影响原有展示能力）

### 体验验收

- [ ] 首页、工作台、审计页、报告页、设置页、文档页共用同一套视觉语言
- [ ] 所有页面中文文案自然流畅（不是英文直译）
- [ ] 报告页至少展示 3 种图表
- [ ] PDF 导出包含封面、图表、表格

### 4.19 演示验收

- [ ] 5 分钟演示流程可完整走通
- [ ] Particle Field 正常渲染
- [ ] 任务能真实执行并返回结果
- [ ] 风险雷达显示在首页
- [ ] PDF 比赛材料一键导出

---

## 附：状态更新规则

每次推进后：
1. 在对应任务前打 ✅
2. 在 Sprint 末尾写简短结果摘要（做了什么 + 花了多久 + 遇到什么问题）
3. 如果发现新任务，添加到对应 Part
4. 如果某条路走不通，标注原因并标记为 skip
5. 更新 Part 10 的时间线

# DiffAudit Platform 综合开发 ROADMAP

> Last updated: 2026-04-15
> Deadline: 2026-04-19（计算机设计大赛）
> Hardware: RTX 4070 Laptop 8GB + CPU
> 本 ROADMAP 覆盖 Platform 端全部工程任务，可反复发给 Claude 推进直到全部完成。

---

## Part 0: 全景状态审计

### 0.1 当前可用功能

| 模块 | 状态 | 说明 |
|------|------|------|
| 营销首页 `/` | **可用** | 双语 hero + particle field（空壳）+ 功能卡片 |
| 登录/注册 `/login` `/register` | **可用** | 表单组件齐全，缺 trial 流程 |
| Trial 页 `/trial` | **可用** | trial-form 组件存在 |
| 工作台首页 `/workspace` | **可用** | KPI 卡片 + 风险分布 + 最近结果 + 任务面板 |
| 审计列表 `/workspace/audits` | **可用** | Active tasks（3s 轮询）+ Task history 表 |
| 创建任务 `/workspace/audits/new` | **可用** | 4步引导表单，POST 到 Go API |
| 报告页 `/workspace/reports` | **可用** | 攻防表 + 覆盖缺口 + CSV 导出 |
| 设置页 `/workspace/settings` | **部分可用** | 有页面但内容单薄 |
| 文档页 `/docs` | **有 bug** | Module not found 构建错误 |
| Go API Gateway `:8780` | **部分可用** | 快照读取 + Demo 模式 + Runtime 转发框架 |
| Runtime-Server `:8765` | **部分可用** | 并发控制 + 超时 + 健康检查已加 |

### 0.2 关键缺失

| 缺失项 | 影响 | 优先级 |
|--------|------|--------|
| Go API 未真正代理 job 创建到 Runtime | 任务创建只在 Demo 模式有效 | **P0** |
| 无独立 job 详情页 | 点了"View"没有单独页面 | **P0** |
| 无 job 取消 API/前端按钮 | 任务跑了就不能停 | **P1** |
| 无实时进度条（只有轮询状态） | 用户体验差 | **P1** |
| 文档页构建失败 | /docs 不可访问 | **P0** |
| Particle Field 是空壳（`return null`） | 首页核心视觉缺失 | **P2** |
| 无 Dark Mode | 比赛演示场景需要 | **P2** |
| 无 Toast/Modal/Dialog 组件 | 日常交互缺基础设施 | **P2** |
| 无图表组件（折线图/柱状图/ROC 曲线） | 报告页缺少可视化 | **P1** |
| 无 PDF 报告导出 | 比赛材料需要 PDF | **P1** |
| 设置页内容单薄 | 缺团队/密钥/偏好 | **P2** |
| Runtime 无 Docker 隔离 | 跑模型环境污染风险 | **P2** |
| 移动端导航缺失 | sidebar 在 <1024px 直接消失 | **P3** |
| 无页面切换动效 | 体验生硬 | **P3** |
| 文案国际化不完整 | workspace-copy.ts 有部分英文原文 | **P1** |

### 0.3 技术栈快照

```
Platform/apps/web        Next.js 16.2.2 (Turbopack) + React + Tailwind
Platform/apps/api-go     Go 1.x + http.ServeMux
Runtime-Server           Go 1.x + http.ServeMux + Python Runners
Research                 Python (PyTorch) + external codebases
```

---

## Part 1: P0 冲刺任务（比赛必做）

### Sprint 1.1: 端到端任务执行闭环

**目标**：从前端创建任务 → Go API 代理到 Runtime → Runtime 执行 → 前端轮询状态 → 结果可查

| 子任务 | 负责 | 文件 | 预估 |
|--------|------|------|------|
| Go API 实现 `POST /api/v1/audit/jobs` 真正转发到 Runtime | Backend Integrator | `Platform/apps/api-go/internal/proxy/server.go` | 2h |
| Go API 实现 `GET /api/v1/audit/jobs/{jobID}` 代理 | Backend Integrator | 同上 | 1h |
| Go API 实现 `DELETE /api/v1/audit/jobs/{jobID}` 取消任务 | Backend Integrator | 同上 | 1h |
| Go API 实现 `GET /api/v1/audit/jobs/{jobID}/progress` 实时进度 | Backend Integrator | 同上 | 2h |
| Runtime 实现 job 执行逻辑（接收请求 → 选 Runner → 启动进程） | Runtime Engineer | `Runtime-Server/internal/api/server.go` | 4h |
| Runtime 实现 job 进度回报（写文件/内存 → API 可读） | Runtime Engineer | 同上 | 2h |
| 前端 job 详情页 `GET /workspace/audits/[jobId]` | Frontend Designer | `Platform/apps/web/src/app/(workspace)/workspace/audits/[jobId]/page.tsx` | 3h |
| 前端取消按钮 + 确认对话框 | Frontend Designer | job 详情页 + TaskListClient | 1h |
| 端到端测试：创建 → 执行 → 完成 → 查看结果 | Leader | 全链路 | 2h |

**验收标准**：
1. 在 Runtime 运行时，前端创建任务后能看到状态从 queued → running → completed
2. 在 Runtime 不可用时，Go API 返回友好错误（非 502 原始信息）
3. 任务完成后可在详情页查看 AUC/ASR 等核心指标

### Sprint 1.2: 文档页修复与重构

**目标**：修复构建错误，建立多页面文档系统

| 子任务 | 负责 | 文件 | 预估 |
|--------|------|------|------|
| 修复 `/docs` 构建错误 | Frontend Designer | `Platform/apps/web/src/app/(marketing)/docs/page.tsx` | 1h |
| 设计文档系统布局（参考 Claude Code Docs 结构） | Frontend Designer | 新建 doc layout | 3h |
| 实现左侧文档导航树（可展开/折叠） | Frontend Designer | doc layout component | 3h |
| 实现右侧 TOC（目录锚点导航） | Frontend Designer | doc layout component | 2h |
| 第一篇文档：架构概览 | Frontend Designer | `/docs/architecture` | 2h |
| 第二篇文档：API 参考 | Backend Integrator | `/docs/api-reference` | 2h |
| 第三篇文档：攻击线说明 | Researcher | `/docs/attack-lines` | 2h |
| 第四篇文档：风险分级说明 | Researcher | `/docs/risk-classification` | 1h |
| 文档搜索（Ctrl+K 快捷） | Frontend Designer | doc search component | 3h |

**布局参考**（从 Claude Code Docs 提取）：
```
┌────────────────────────────────────────────────────────┐
│  Topbar: Logo + Search(⌘K) + Theme Toggle + Links     │
│  ───────────────────────────────────────────────────── │
│  Navbar tabs: 快速开始 | 架构 | API | 攻击线 | 风险 | ...│
│  ───────────────────────────────────────────────────── │
│  │               │                                    │       │
│  │  Left Nav    │  Main Content Body                  │  TOC  │
│  │  (18rem)     │  (flex-1, max-w-prose)              │ (16rem)│
│  │  - Group 1   │  H1/H2/H3 + code blocks + tables    │ 锚点  │
│  │  - Group 2   │                                     │       │
│  │  - Group 3   │                                     │       │
│  │               │                                    │       │
└──┴───────────────┴────────────────────────────────────┴───────┘
```

**验收标准**：
1. `npm run build:web` 通过，无 Module not found 错误
2. `/docs` 可访问，有左侧导航树 + 右侧 TOC
3. 至少 4 篇文档页面可切换
4. 布局风格与 Platform 统一（共用 DESIGN.md tokens）

### Sprint 1.3: 报告可视化 + PDF 导出

**目标**：让报告页能出图、能导出 PDF，比赛可直接用

| 子任务 | 负责 | 文件 | 预估 |
|--------|------|------|------|
| 安装图表库（recharts 或 chart.js） | Frontend Designer | `package.json` | 0.5h |
| AUC 分布图（直方图 + KDE） | Frontend Designer | 新 chart component | 2h |
| ROC 曲线组件 | Frontend Designer | 新 chart component | 2h |
| 风险分布饼图/柱状图 | Frontend Designer | 新 chart component | 1h |
| 攻击效果对比雷达图 | Frontend Designer | 新 chart component | 2h |
| 报告页嵌入图表 | Frontend Designer | `workspace/reports/page.tsx` | 2h |
| PDF 导出（html2canvas + jsPDF 或 Puppeteer SSR） | Frontend Designer | export pipeline | 4h |
| PDF 模板设计（封面 + 目录 + 图表 + 表格） | Frontend Designer | PDF template | 3h |

**验收标准**：
1. 报告页能看到 AUC 分布、ROC 曲线、风险分布
2. 点击"导出 PDF"生成包含封面、图表、表格的完整报告
3. PDF 文件可直接用于比赛提交

---

## Part 2: P1 优化任务（体验提升）

### Sprint 2.1: 前端文案国际化补全

| 子任务 | 负责 | 文件 | 预估 |
|--------|------|------|------|
| 审计 `workspace-copy.ts` 中英文缺失项 | Frontend Designer | `src/lib/workspace-copy.ts` | 1h |
| 补全审计报告页双语 | Frontend Designer | 同上 | 1h |
| 补全设置页双语 | Frontend Designer | 同上 | 1h |
| 补全创建任务表单双语 | Frontend Designer | 同上 | 1h |
| 补全文档页双语 | Frontend Designer | 同上 | 1h |
| KPI label 全面审查 | Frontend Designer | 同上 | 0.5h |

### Sprint 2.2: 组件库补齐

| 子任务 | 负责 | 文件 | 预估 |
|--------|------|------|------|
| Toast 组件（成功/错误/警告/信息） | Frontend Designer | `src/components/toast.tsx` | 2h |
| Modal/Dialog 组件 | Frontend Designer | `src/components/modal.tsx` | 2h |
| Tabs 组件 | Frontend Designer | `src/components/tabs.tsx` | 1h |
| Skeleton 组件（已有，增强） | Frontend Designer | `src/components/skeleton.tsx` | 0.5h |
| Progress 组件 | Frontend Designer | `src/components/progress.tsx` | 1h |
| Breadcrumb 组件 | Frontend Designer | `src/components/breadcrumb.tsx` | 0.5h |
| EmptyState 组件 | Frontend Designer | `src/components/empty-state.tsx` | 1h |

### Sprint 2.3: 设置页完善

| 子任务 | 负责 | 文件 | 预估 |
|--------|------|------|------|
| 团队设置区（成员列表、角色、邀请） | Frontend Designer | `workspace/settings/page.tsx` | 3h |
| API 密钥管理（生成、撤销、复制） | Frontend Designer | 同上 | 2h |
| 偏好设置（语言、主题、通知） | Frontend Designer | 同上 | 1h |
| Runtime 连接配置 | Backend Integrator | 同上 | 1h |

---

## Part 3: P2 增强任务（架构演进）

### Sprint 3.1: Dark Mode

| 子任务 | 负责 | 文件 | 预估 |
|--------|------|------|------|
| CSS 变量体系（light/dark tokens） | Frontend Designer | `src/app/globals.css` | 2h |
| 主题切换逻辑（`use-theme.ts` 已有基础设施） | Frontend Designer | `src/lib/use-theme.ts` | 1h |
| 全组件 dark 适配审查 | Frontend Designer | 全部组件 | 3h |
| 系统主题自动跟随 | Frontend Designer | `src/lib/use-theme.ts` | 0.5h |

### Sprint 3.2: Particle Field 实现

| 子任务 | 负责 | 文件 | 预估 |
|--------|------|------|------|
| 设计粒子效果（密度、速度、颜色） | Frontend Designer | 设计稿 | 1h |
| Canvas 实现粒子系统 | Frontend Designer | `src/components/particle-field.tsx` | 3h |
| 性能优化（requestAnimationFrame + 离屏渲染） | Frontend Designer | 同上 | 1h |
| 移动端降级（减少粒子数或禁用） | Frontend Designer | 同上 | 0.5h |

### Sprint 3.3: Runtime Docker 隔离

| 子任务 | 负责 | 文件 | 预估 |
|--------|------|------|------|
| Docker 环境评估（宿主机是否安装 Docker） | Runtime Engineer | 环境检查 | 0.5h |
| Runner Docker 镜像构建 | Runtime Engineer | `Runtime-Server/Dockerfile` | 3h |
| Job 执行改为容器启动 | Runtime Engineer | `Runtime-Server/internal/api/server.go` | 4h |
| 容器资源限制（GPU/CPU/内存） | Runtime Engineer | 同上 | 2h |
| 容器清理（完成后自动删除） | Runtime Engineer | 同上 | 1h |
| 非 Docker 模式兼容（开发环境直跑） | Runtime Engineer | 同上 | 1h |

### Sprint 3.4: Go API 通信健壮性

| 子任务 | 负责 | 文件 | 预估 |
|--------|------|------|------|
| Runtime 不可用时优雅降级（返回缓存快照） | Backend Integrator | `Platform/apps/api-go/internal/proxy/server.go` | 2h |
| 请求超时配置化（不同端点不同超时） | Backend Integrator | 同上 | 1h |
| 错误码规范化（统一错误响应格式） | Backend Integrator | 同上 | 1h |
| 日志结构化（JSON 格式 + 请求 ID） | Backend Integrator | 同上 | 1h |
| 健康检查聚合端点（Platform + Runtime 状态） | Backend Integrator | 同上 | 0.5h |

---

## Part 4: P3 探索任务（锦上添花）

### Sprint 4.1: 移动端适配

| 子任务 | 负责 | 文件 | 预估 |
|--------|------|------|------|
| 移动端底部导航栏 | Frontend Designer | 新 component | 2h |
| 表格横向滚动优化 | Frontend Designer | 全部 table 组件 | 1h |
| 表单移动端适配 | Frontend Designer | 全部 form 组件 | 2h |
| 汉堡菜单（替代 sidebar） | Frontend Designer | 新 component | 2h |

### Sprint 4.2: 页面动效

| 子任务 | 负责 | 文件 | 预估 |
|--------|------|------|------|
| 页面切换过渡（fade/slide） | Frontend Designer | layout 层 | 2h |
| 按钮点击 ripple | Frontend Designer | button 组件 | 0.5h |
| Loading skeleton 动画 | Frontend Designer | skeleton 组件 | 0.5h |
| 数据刷新微动效 | Frontend Designer | 全局 | 1h |

### Sprint 4.3: 前端性能优化

| 子任务 | 负责 | 文件 | 预估 |
|--------|------|------|------|
| 路由代码分割审查 | Frontend Designer | Next.js config | 1h |
| 图片优化（WebP + 懒加载） | Frontend Designer | 全部图片引用 | 1h |
| 字体子集化（仅加载中文常用） | Frontend Designer | globals.css | 0.5h |
| 首屏性能分析（Lighthouse CI） | Frontend Designer | CI pipeline | 1h |

---

## Part 5: 部署公网

### Sprint 5.1: 部署准备

| 子任务 | 负责 | 文件 | 预估 |
|--------|------|------|------|
| Docker Compose 编排（Web + API + Runtime） | Backend Integrator | `docker-compose.yml` | 3h |
| 环境变量清单（.env.example） | Backend Integrator | 项目根目录 | 1h |
| Nginx 反向代理配置 | Backend Integrator | `nginx.conf` | 2h |
| HTTPS 证书（Let's Encrypt） | Backend Integrator | 部署脚本 | 1h |
| 数据库迁移（如需持久化） | Backend Integrator | 迁移脚本 | 2h |

### Sprint 5.2: 安全加固

| 子任务 | 负责 | 文件 | 预估 |
|--------|------|------|------|
| CORS 策略配置 | Backend Integrator | API Gateway | 1h |
| Rate Limiting | Backend Integrator | API Gateway | 1h |
| 输入验证与清理 | Backend Integrator | 全部 API 端点 | 2h |
| 敏感信息脱敏（日志不泄露密钥） | Backend Integrator | 全部日志输出 | 1h |
| 依赖安全扫描 | Leader | `npm audit` + `go sec` | 1h |

---

## Part 6: 创新与产品差异化

### 6.1 产品创新点

| 创新方向 | 描述 | 优先级 |
|----------|------|--------|
| **审计工作流引导** | 创建任务时提供"推荐配置"，根据目标模型自动推荐攻击族 | P1 |
| **风险雷达** | 工作台首页增加实时风险雷达图（多维度扫描） | P1 |
| **对比分析模式** | 允许选择两个审计结果做 side-by-side 对比 | P2 |
| **一键生成比赛材料** | 从审计结果直接生成符合比赛格式的 PPT/PDF | P1 |
| **审计日志时间线** | 所有任务按时间线展示，可追溯历史变化趋势 | P2 |
| **智能告警** | AUC 超过阈值时推送通知（邮件/Webhook） | P3 |

### 6.2 技术创新点

| 创新方向 | 描述 | 负责 | 优先级 |
|----------|------|------|--------|
| **自适应采样** | 已实现，集成到 CLI 暴露给用户 | Runtime Engineer | P1 |
| **攻击融合评分** | 多攻击方法 score ensemble 提高准确率 | Researcher | P1 |
| **跨模型迁移攻击** | DDPM 训练的 attack 能否攻击 DDIM/DiT | Researcher | P2 |
| **时序审计** | 微调过程中 membership signal 演变可视化 | Researcher | P2 |
| **Gradient Heatmap** | 白盒攻击的梯度可视化（比赛评委爱看） | Researcher | P1 |

---

## Part 7: Agent 编排分配

### 7.1 角色定义

| 角色 | 能力 | 负责范围 |
|------|------|----------|
| **Leader** | 规划、编排、验收、跨角色协调 | 全局调度、GitHub push、文档治理 |
| **Frontend Designer** | Next.js/React/Tailwind 实现 | 所有前端页面、组件、样式、动效 |
| **Backend Integrator** | Go API + Runtime 联动 | Go Gateway 代理、错误处理、部署 |
| **Runtime Engineer** | Runtime-Server + Python Runners + Docker | 任务执行、并发控制、容器化 |
| **Researcher** | Python/PyTorch 研究实验 | Research 证据生成、创新方法 |
| **Code Reviewer** | 代码审查、bug 定位 | 每次 PR 前审查 |

### 7.2 任务分配矩阵

| Sprint | Leader | Frontend Designer | Backend Integrator | Runtime Engineer | Researcher | Code Reviewer |
|--------|--------|-------------------|-------------------|------------------|------------|---------------|
| 1.1 执行闭环 | 验收 | job 详情页 | Go API 代理 | job 执行逻辑 | - | 端到端审查 |
| 1.2 文档重构 | 规划 | 布局+组件+4篇文档 | API 文档 | - | 攻击线文档 | 构建审查 |
| 1.3 可视化+PDF | - | 图表+PDF 全链路 | - | - | 指标定义 | 视觉审查 |
| 2.1 文案补全 | - | 全量双语审查 | - | - | - | - |
| 2.2 组件库 | - | 7 个新组件 | - | - | - | 组件审查 |
| 2.3 设置页 | - | 3 个设置区 | Runtime 配置 | - | - | - |
| 3.1 Dark Mode | - | CSS+组件适配 | - | - | - | 视觉审查 |
| 3.2 Particle | - | Canvas 实现 | - | - | - | 性能审查 |
| 3.3 Docker | - | - | - | 容器化全链路 | - | 安全审查 |
| 3.4 通信健壮 | - | - | 全量改造 | - | - | 代码审查 |
| 4.x P3 任务 | - | 按需 | 按需 | - | - | - |
| 5.x 部署 | 验收 | - | 全量 | 配合 | - | 安全审查 |
| 6.x 创新 | 规划 | 雷达图等 | 集成 | 自适应采样 | 融合/迁移 | - |

---

## Part 8: 4.19 比赛演示场景

### 8.1 演示流程（5 分钟）

```
1. 打开首页 → 展示产品定位（15s）
2. 导航到工作台 → 展示 KPI + 风险分布（30s）
3. 创建审计任务 → 4步引导流程（45s）
4. 查看任务执行 → 实时进度 + 状态轮询（30s）
5. 查看审计结果 → AUC 分布 + ROC 曲线（45s）
6. 导出报告 → PDF 生成 + 内容预览（45s）
7. 文档页 → 展示架构 + API 文档（30s）
8. 总结 → 三条攻击线 + 防御对比 + 创新点（60s）
```

### 8.2 演示必需功能清单

- [x] 首页（双语 hero + particle field）
- [x] 工作台（KPI + 风险分布 + 最近结果）
- [x] 审计列表（active tasks + history）
- [x] 创建任务（4步引导）
- [ ] 任务执行（真实执行，非 Demo） ← **P0 Sprint 1.1**
- [ ] 任务详情（进度 + 状态 + 结果） ← **P0 Sprint 1.1**
- [ ] 报告页（图表 + 对比表） ← **P1 Sprint 1.3**
- [ ] PDF 导出 ← **P1 Sprint 1.3**
- [ ] 文档页（多页面导航） ← **P0 Sprint 1.2**
- [ ] Dark Mode ← **P2 Sprint 3.1**（可选，比赛现场可能不需要）

---

## Part 9: 执行优先级与时间线

### 4.15-4.16（今天+明天）

- [ ] Sprint 1.1: 端到端执行闭环（Go API + Runtime 联动 + job 详情页）
- [ ] Sprint 1.2: 文档页修复与重构
- [ ] Sprint 2.1: 文案国际化补全

### 4.17

- [ ] Sprint 1.3: 报告可视化 + PDF 导出
- [ ] Sprint 2.2: 组件库补齐
- [ ] Sprint 2.3: 设置页完善

### 4.18

- [ ] Sprint 3.1: Dark Mode（可选）
- [ ] Sprint 3.4: 通信健壮性
- [ ] 端到端集成测试
- [ ] 演示彩排

### 4.19

- [ ] 比赛演示

### 延期项（比赛后推进）

- Sprint 3.2: Particle Field
- Sprint 3.3: Docker 隔离
- Sprint 4.x: P3 探索任务
- Sprint 5.x: 部署公网
- Sprint 6.x: 创新功能

---

## Part 10: 验收清单

### 技术验收

- [ ] `npm run build:web` 通过（零 error，零 warning）
- [ ] `go build ./...` 通过（Platform API）
- [ ] `go build ./...` 通过（Runtime-Server）
- [ ] `go test ./...` 通过（全部 Go 测试）
- [ ] `/docs` 可访问（构建无 error）
- [ ] 端到端任务创建→执行→完成→查看全流程可用
- [ ] Demo 模式仍可用（不影响原有展示能力）

### 体验验收

- [ ] 首页、工作台、审计页、报告页、设置页、文档页共用同一套视觉语言
- [ ] 所有页面中英双语可用
- [ ] 移动端至少可读可用（不必须完美）
- [ ] PDF 报告包含封面、图表、表格，可直接提交

### 部署验收

- [ ] 仓库已 push 到 GitHub（Platform + Runtime + Research）
- [ ] 部署文档完整（README + 部署指南）
- [ ] 环境变量清单完整

---

## 附：快速状态更新指南

每次推进后，在此 ROADMAP 中：
1. 勾选已完成的任务
2. 在对应 Sprint 下写简短结果摘要
3. 如果发现新任务或缺失，添加到对应 Part
4. 如果某条路走不通，标注原因

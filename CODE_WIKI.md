# DiffAudit Platform 代码 Wiki

## 1. 项目概述

DiffAudit Platform 是 DiffAudit 的唯一产品主线仓库，提供了一个完整的平台来管理和执行 AI 模型的安全审计。

- **公网地址**：`https://diffaudit.vectorcontrol.tech/`
- **主要功能**：
  - 黑盒、灰盒、白盒三种审计模式
  - 审计任务管理与执行
  - 报告生成与展示
  - 用户认证与授权
  - 工作台管理

## 2. 项目结构

项目采用模块化架构，清晰分离前端、后端和共享组件。

```
├── apps/                  # 应用目录
│   ├── api-go/            # Go 语言实现的网关服务
│   │   ├── cmd/           # 命令行入口
│   │   ├── data/          # 数据目录（包含公共快照）
│   │   └── internal/      # 内部实现
│   └── web/               # Next.js 前端应用
│       ├── public/         # 静态资源
│       └── src/            # 源代码
│           ├── app/        # 应用路由和页面
│           ├── components/ # 可复用组件
│           ├── hooks/      # 自定义 hooks
│           └── lib/        # 工具库
├── docs/                  # 文档目录
├── packages/              # 共享包
│   └── shared/            # 共享契约与提示
└── scripts/               # 脚本目录
```

## 3. 技术栈

### 前端技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Next.js | 16.2.2 | 前端框架 |
| React | 19.2.4 | UI 库 |
| TypeScript | ^5 | 类型系统 |
| Tailwind CSS | ^4 | 样式框架 |
| Recharts | ^3.8.1 | 图表库 |
| Drizzle ORM | ^0.45.2 | 数据库 ORM |
| SQLite | ^12.9.0 | 本地数据库 |

### 后端技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Go | 1.26.1 | 后端语言 |

## 4. 系统架构

### 4.1 整体架构

DiffAudit Platform 采用分层架构，主要包含以下几层：

1. **前端层**：Next.js 应用，负责用户界面和交互
2. **网关层**：Go 语言实现的 API 网关，负责请求转发和数据处理
3. **运行时层**：Runtime-Server，负责实际的审计任务执行
4. **研究层**：Research 仓库，负责研究代码和实验执行

### 4.2 数据流向

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  前端应用   │────>│  Go 网关    │────>│  Runtime    │────>│  Research   │
│  (Next.js)  │<────│  (api-go)   │<────│  Server     │<────│  仓库       │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

### 4.3 关键架构原则

1. **展示态与控制态分离**：
   - 展示态：默认只读本地 snapshot，由 `Platform/apps/api-go` 管理
   - 控制态：只有审计控制面动作才允许连接 `Runtime`

2. **统一系统模型**：
   - 三线统一维度：`track`、`attack_family`、`target_key`、`mode`、`availability`、`evidence_level`
   - 合同项：`contract_key = <track>/<attack_family>/<target_key>`
   - 核心对象：`catalog_entry`、`evidence_summary`、`audit_job`

## 5. 主要模块

### 5.1 前端模块

#### 5.1.1 认证模块

- **路径**：`apps/web/src/app/(auth)/`
- **功能**：处理用户登录、注册、邮箱验证等认证相关功能
- **主要页面**：
  - `login/page.tsx`：登录页面
  - `register/page.tsx`：注册页面
- **API 路由**：`apps/web/src/app/api/auth/`

#### 5.1.2 工作台模块

- **路径**：`apps/web/src/app/(workspace)/workspace/`
- **功能**：用户工作台，包含审计、报告、设置等功能
- **主要页面**：
  - `audits/`：审计任务管理
  - `reports/`：报告管理
  - `settings/`：用户设置
  - `account/`：账户管理
  - `api-keys/`：API 密钥管理

#### 5.1.3 平台模块

- **路径**：`apps/web/src/app/(platform)/`
- **功能**：平台核心功能，包括审计、批处理、仪表板等
- **主要页面**：
  - `audit/page.tsx`：审计页面
  - `batch/page.tsx`：批处理页面
  - `dashboard/page.tsx`：仪表板页面
  - `guide/page.tsx`：指南页面
  - `report/page.tsx`：报告页面

#### 5.1.4 营销模块

- **路径**：`apps/web/src/app/(marketing)/`
- **功能**：营销相关页面，包括首页、文档、试用等
- **主要页面**：
  - `page.tsx`：首页
  - `docs/`：文档页面
  - `trial/`：试用页面

### 5.2 后端模块

#### 5.2.1 Go 网关

- **路径**：`apps/api-go/`
- **功能**：API 网关，负责请求转发和数据处理
- **主要组件**：
  - `cmd/platform-api/main.go`：服务入口
  - `internal/proxy/`：代理实现

### 5.3 共享模块

#### 5.3.1 共享契约

- **路径**：`packages/shared/contracts/`
- **功能**：定义系统中的共享契约和数据结构

## 6. 核心功能

### 6.1 审计管理

- **功能**：创建、管理和执行审计任务
- **API 接口**：
  - `GET /api/v1/audit/jobs`：获取审计任务列表
  - `POST /api/v1/audit/jobs`：创建新的审计任务
  - `GET /api/v1/audit/jobs/{job_id}`：获取审计任务详情

### 6.2 报告生成

- **功能**：生成和展示审计报告
- **主要组件**：
  - `apps/web/src/components/printable-audit-report.tsx`：可打印的审计报告
  - `apps/web/src/lib/risk-report.ts`：风险报告生成

### 6.3 认证系统

- **功能**：用户认证和授权
- **支持的认证方式**：
  - 邮箱/密码
  - GitHub
  - Google
- **API 接口**：`apps/web/src/app/api/auth/`

### 6.4 目录管理

- **功能**：管理可用的审计能力和模型
- **API 接口**：
  - `GET /api/v1/catalog`：获取能力目录
  - `GET /api/v1/models`：获取模型列表

## 7. 关键类与函数

### 7.1 前端关键组件

#### 7.1.1 审计相关组件

- **CreateTaskClient.tsx**：
  - **路径**：`apps/web/src/app/(workspace)/workspace/audits/new/CreateTaskClient.tsx`
  - **功能**：创建新的审计任务

- **JobDetailClient.tsx**：
  - **路径**：`apps/web/src/app/(workspace)/workspace/audits/[jobId]/JobDetailClient.tsx`
  - **功能**：显示审计任务详情

- **TaskListClient.tsx**：
  - **路径**：`apps/web/src/app/(workspace)/workspace/audits/TaskListClient.tsx`
  - **功能**：显示审计任务列表

#### 7.1.2 报告相关组件

- **ReportAuditView.tsx**：
  - **路径**：`apps/web/src/app/(workspace)/workspace/reports/[track]/ReportAuditView.tsx`
  - **功能**：审计报告视图

- **ReportDisplayView.tsx**：
  - **路径**：`apps/web/src/app/(workspace)/workspace/reports/[track]/ReportDisplayView.tsx`
  - **功能**：报告显示视图

### 7.2 后端关键函数

#### 7.2.1 Go 网关

- **main.go**：
  - **路径**：`apps/api-go/cmd/platform-api/main.go`
  - **功能**：服务入口，解析配置并启动 HTTP 服务器
  - **关键函数**：
    - `parseConfig`：解析命令行参数和环境变量
    - `main`：主函数，启动服务器

- **proxy/server.go**：
  - **路径**：`apps/api-go/internal/proxy/server.go`
  - **功能**：代理服务器实现
  - **关键函数**：
    - `NewServer`：创建新的代理服务器
    - `Handler`：HTTP 处理函数

## 8. 依赖关系

### 8.1 前端依赖

| 依赖 | 用途 |
|------|------|
| next | 前端框架 |
| react | UI 库 |
| react-dom | React DOM 操作 |
| recharts | 图表库 |
| drizzle-orm | 数据库 ORM |
| better-sqlite3 | SQLite 数据库驱动 |
| bcryptjs | 密码加密 |
| @simplewebauthn/browser | WebAuthn 支持 |
| html2canvas | 网页截图 |
| jspdf | PDF 生成 |

### 8.2 后端依赖

| 依赖 | 用途 |
|------|------|
| Go 1.26.1 | 后端语言 |

## 9. 项目运行方式

### 9.1 本地开发

#### 前端开发

```bash
# 安装依赖
npm --prefix apps/web install

# 启动开发服务器
npm --prefix apps/web run dev
```

#### 后端开发

```bash
# 启动 API 网关
npm run dev:api
```

### 9.2 构建与部署

#### 前端构建

```bash
npm --prefix apps/web run build
```

#### 后端构建

```bash
# 在 apps/api-go 目录下执行
go build -o bin/platform-api ./cmd/platform-api
```

### 9.3 环境变量

| 环境变量 | 描述 | 默认值 |
|----------|------|--------|
| DIFFAUDIT_SHARED_USERNAME | 共享用户名 | - |
| DIFFAUDIT_SHARED_PASSWORD | 共享密码 | - |
| DIFFAUDIT_PLATFORM_URL | 平台 URL | - |
| DIFFAUDIT_API_BASE_URL | API 基础 URL | http://127.0.0.1:8780 |
| DIFFAUDIT_PUBLIC_DATA_DIR | 公共数据目录 | ./data/public |
| DIFFAUDIT_RUNTIME_BASE_URL | Runtime 基础 URL | http://127.0.0.1:8765 |
| DIFFAUDIT_DB_PATH | 数据库路径 | - |
| GITHUB_CLIENT_ID | GitHub 客户端 ID | - |
| GITHUB_CLIENT_SECRET | GitHub 客户端密钥 | - |

### 9.4 刷新公网快照

```bash
npm run publish:public-snapshot
```

## 10. 验证与测试

### 10.1 前端测试

```bash
# 运行测试
npm --prefix apps/web run test

# 运行 lint
npm --prefix apps/web run lint

# 构建验证
npm --prefix apps/web run build
```

### 10.2 后端测试

```bash
# 运行 Go 测试
go -C apps/api-go test ./...
```

## 11. 协作流程

1. 从 `main` 拉短分支
2. 在当前工作树开发
3. 跑本地验证
4. push 分支
5. 提 PR
6. 1 个 review 后 squash merge 回 `main`

## 12. 项目状态

### 12.1 当前支持的审计模式

- **黑盒**：已正式纳入目录，`recon` 是第一优先级
- **灰盒**：已纳入统一目录，但只按“准备态或 smoke 态”暴露
- **白盒**：当前只进入统一模型，不进入默认执行面

### 12.2 未来规划

1. **Phase 1**：锁定黑盒主线为统一合同样板
2. **Phase 2**：把灰盒纳入同一目录，不提前承诺可执行
3. **Phase 3**：只有在研究侧形成稳定 workspace + summary 后，才开放第二条任务线
4. **Phase 4**：白盒只在资产条件满足后进入执行面

## 13. 重要文档

- **架构文档**：`docs/architecture.md`
- **运行手册**：`RUNBOOK.md`
- **公网运行时手册**：`docs/public-runtime-runbook.md`
- **公网运行时交接**：`docs/public-runtime-handoff.md`

## 14. 总结

DiffAudit Platform 是一个完整的 AI 模型安全审计平台，采用现代化的技术栈和架构设计。它通过统一的系统模型和 API 接口，为用户提供了一个直观、高效的审计工具，支持黑盒、灰盒、白盒三种审计模式。

平台的核心价值在于：
1. 统一的系统模型，使不同审计模式能够在同一框架下管理
2. 清晰的展示态与控制态分离，提高系统可靠性
3. 模块化的架构设计，便于扩展和维护
4. 现代化的前端界面，提供良好的用户体验

通过不断完善和扩展，DiffAudit Platform 将成为 AI 模型安全审计领域的重要工具，为 AI 系统的安全性提供有力保障。
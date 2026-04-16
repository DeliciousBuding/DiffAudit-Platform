# Platform 仓库操作章程

`Platform` 是 DiffAudit 的唯一产品仓库，也是唯一需要协作开发的网站仓。

## GZ2 Read-First Rule

只要任务涉及 `gz2`、公网域名、部署、服务重启、环境变量或运行时排障，开始动手前必须先读：

1. `RUNBOOK.md`
2. `docs/public-runtime-runbook.md`
3. `docs/public-runtime-handoff.md`

没有完成这一步，不允许直接改 `gz2`。

## 仓库职责

- `apps/web`: 单站网站与工作台
- `apps/api-go`: 当前 Go 网关
- `packages/shared`: 共享提示与契约
- `docs`: 当前有效部署、运行和协作说明

不负责：

- 研究复现
- GPU 实验
- 本机飞书运维

## 页面 IA

- `/`
- `/login`
- `/trial`
- `/workspace`
- `/workspace/audits`
- `/workspace/reports`
- `/workspace/settings`

旧路径只允许做最薄 redirect，不再承载独立信息架构。

## 目录 Ownership

- 前端页面、组件、样式、路由：`apps/web`
- 平台 API 网关与代理：`apps/api-go`
- 部署口径、GitHub 规则、运行说明：`docs`、根级文档、`.github`
- 共享 Agent 提示与协作口径：`packages/shared`

## Design Source

- 主设计文件使用 Figma `DiffAudit`
- Figma 页面捕获、MCP 使用和 PR 对齐规则见 `docs/figma-workflow.md`
- 设计探索不单独维护长期 capture 分支，直接跟随当前 feature branch

## 默认协作流

1. 从 `main` 拉短分支
2. 在当前工作树开发
3. 跑对应本地验证
4. push 分支
5. 提 PR
6. 1 个 review 后 squash merge

涉及 `gz2` 的现场动作，再额外补：

1. 先核对 `systemd` 实际 `WorkingDirectory` 和 `ExecStart`
2. 先确认 `3000` / `8780` 当前由谁占用
3. 变更后必须同时验证 `127.0.0.1` 和公网域名
4. 不允许把未跟踪的临时发布残留留在工作树里

## 最低验证要求

前端改动至少跑：

```powershell
npm --prefix apps/web run test
npm --prefix apps/web run lint
npm --prefix apps/web run build
```

涉及 Go 网关再补：

```powershell
go -C apps/api-go test ./...
```

## 禁止事项

- 不要把研究逻辑写回 `Platform`
- 不要在活跃仓里恢复历史实现、历史迁移说明或旧演示页面壳
- 不要绕过 PR 直接把未验证改动推进到 `main`
- 不要新增与当前 IA 冲突的旧页面入口或旧命名体系

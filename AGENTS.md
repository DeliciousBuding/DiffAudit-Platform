# Platform 仓库操作章程

`Platform` 是 DiffAudit 的唯一产品仓库，也是唯一需要协作开发的网站仓。

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

## 默认协作流

1. 从 `main` 拉短分支
2. 在当前工作树开发
3. 跑对应本地验证
4. push 分支
5. 提 PR
6. 1 个 review 后 squash merge

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

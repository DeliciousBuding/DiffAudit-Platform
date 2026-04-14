# DiffAudit Platform

`Platform` 是 DiffAudit 的唯一产品主线仓库。

公网地址：`https://diffaudit.vectorcontrol.tech/`

当前仓库承载：

- 单站前端：`apps/web`
- 当前 Go 网关：`apps/api-go`
- 共享契约与提示：`packages/shared`
- 部署、架构与协作文档：`docs`

首页、登录、工作台、审计流程、报告和设置都收口在同一个 Next.js 网站里。

## Product Surface

固定页面路径：

- `/`
- `/login`
- `/trial`
- `/workspace`
- `/workspace/audits`
- `/workspace/reports`
- `/workspace/settings`

## Design Source

- 主 Figma 文件：`DiffAudit`
- 协作与 MCP 规则见 `docs/figma-workflow.md`

## Local Start

前端：

```powershell
npm --prefix apps/web install
npm --prefix apps/web run dev
```

后端：

```powershell
npm run dev:api
```

公网默认链路：

- `apps/web` 只连接 `apps/api-go`
- `apps/api-go` 对展示态优先读取 `apps/api-go/data/public/*` snapshot
- 只有审计控制面动作才继续转发到 `Local-API`

刷新公网 snapshot：

```powershell
npm run publish:public-snapshot
```

常用环境变量：

- `DIFFAUDIT_SHARED_USERNAME`
- `DIFFAUDIT_SHARED_PASSWORD`
- `DIFFAUDIT_PLATFORM_URL`
- `DIFFAUDIT_API_BASE_URL`
- `DIFFAUDIT_PUBLIC_DATA_DIR`
- `DIFFAUDIT_CONTROL_API_BASE_URL`
- `DIFFAUDIT_DB_PATH`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`

说明：

- `DIFFAUDIT_SHARED_USERNAME` / `DIFFAUDIT_SHARED_PASSWORD` 现在用于首个共享账号引导。
- 当 SQLite 用户库为空时，登录接口会自动把这对共享账号写入用户表，便于公网首启或替换旧运行时时平滑过渡。
- 会话已经不再依赖固定的 `DIFFAUDIT_SESSION_TOKEN`。
- `DIFFAUDIT_API_BASE_URL` 在公网应指向本机 `apps/api-go`，即 `http://127.0.0.1:8780`，不再直接指向 `Local-API`。

## Collaboration

默认协作流：

1. 从 `main` 拉短分支
2. 在当前工作树开发
3. 跑本地验证
4. push 分支
5. 提 PR
6. 1 个 review 后 squash merge 回 `main`

## Verification

前端标准验证：

```powershell
npm --prefix apps/web run test
npm --prefix apps/web run lint
npm --prefix apps/web run build
```

如涉及 Go 网关，再补：

```powershell
go -C apps/api-go test ./...
```

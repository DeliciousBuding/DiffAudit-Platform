# DiffAudit Platform

`Platform` 是 DiffAudit 的唯一产品主线仓库。

当前仓库承载：

- 单站前端：`apps/web`
- 当前 Go 网关：`apps/api-go`
- 共享契约与提示：`packages/shared`
- 部署、架构与协作文档：`docs`

首页、登录、工作台、审计流程、报告和设置都收口在同一个 Next.js 网站里。

协作边界：

- 日常协作默认只依赖 `Platform` 仓本身
- 协作者不默认拥有 `Research` 或本地 `Archive` 的可见性
- 任何需要私有上游或本地归档的信息，都不能写成前端协作前提

## Product Surface

固定页面路径：

- `/`
- `/login`
- `/trial`
- `/workspace`
- `/workspace/audits`
- `/workspace/reports`
- `/workspace/settings`

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

常用环境变量：

- `DIFFAUDIT_SHARED_USERNAME`
- `DIFFAUDIT_SHARED_PASSWORD`
- `DIFFAUDIT_SESSION_TOKEN`
- `DIFFAUDIT_PLATFORM_URL`
- `DIFFAUDIT_API_BASE_URL`

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

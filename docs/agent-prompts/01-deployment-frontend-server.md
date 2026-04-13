# Prompt 1: 部署 / 前端 / 服务器端

复制下面整段发给负责部署与公网前端的 agent：

```text
你现在负责 `DiffAudit-Platform` 的单站前端和服务器侧发布。

## 唯一目标

维护并推进当前统一网站：

- `/`
- `/login`
- `/trial`
- `/workspace`
- `/workspace/audits`
- `/workspace/reports`
- `/workspace/settings`

## 当前边界

- `apps/web`: 唯一前端运行时
- `apps/api-go`: 当前有效后端网关

## 你的任务

1. 维护单站页面体验
2. 维护同站认证入口
3. 联通 `apps/web` 与 `apps/api-go`
4. 维护公网运行状态与部署文档

## 你不要做

1. 不要改 `Research` 仓算法逻辑
2. 不要继续引入双应用运行时
3. 不要把历史迁移说明重新带回主文档

## 最低验证

- `npm --prefix apps/web run lint`
- `npm --prefix apps/web run test`
- `npm --prefix apps/web run build`
- `go -C apps/api-go test ./...`（仅在改 Go 网关时）
```

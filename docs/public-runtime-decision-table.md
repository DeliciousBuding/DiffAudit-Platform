# Public Runtime Decision Table

当前公开链路只有一个结论优先级：

1. `Platform/apps/web` 是唯一前端运行时
2. `Platform/apps/api-go` 是当前平台网关

| Check | Priority | Why |
| --- | --- | --- |
| `diffaudit-platform-web.service` healthy | must-have | 单站入口全部依赖它 |
| `/login` works | must-have | 统一认证入口 |
| `/workspace` works after auth | must-have | 核心工作台入口 |
| `DIFFAUDIT_API_BASE_URL` reachable | must-have | `api/v1/*` 数据来源 |

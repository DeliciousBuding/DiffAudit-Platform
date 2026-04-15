# Public Runtime Decision Table

当前公开链路只有一个结论优先级：

1. `Platform/apps/web` 是唯一前端运行时
2. `Platform/apps/api-go` 是当前平台网关
3. `Runtime-Server` 只承担控制面，不再是展示态读源

| Check | Priority | Why |
| --- | --- | --- |
| `diffaudit-platform-web.service` healthy | must-have | 单站入口全部依赖它 |
| `diffaudit-platform-api.service` healthy | must-have | 工作台展示态与控制面都经它收口 |
| `/login` works | must-have | 统一认证入口 |
| `/workspace` works after auth | must-have | 核心工作台入口 |
| `apps/api-go/data/public/*` present | must-have | 工作台展示态默认读本地 snapshot |
| `Runtime Server` reachable | control-only | 只影响 jobs / create job / job-template |

# Public Runtime Handoff

当前公网运行时是单站模型。

## Active Runtime Story

- Public domain: `https://diffaudit.vectorcontrol.tech`
- Public edge: Cloudflare
- Edge host: `hk`
- Runtime host: `gz2`
- Public app owner: `Platform/apps/web`
- Backend gateway: `Platform/apps/api-go`
- Control-plane upstream: `Services/Local-API`（Runtime）

当前请求链：

1. public request reaches Cloudflare
2. Cloudflare forwards to `hk`
3. `hk` forwards the full site to `gz2`
   - current upstream target is `http://100.77.212.60`
   - this hop depends on tailnet ACL allowing `hk -> gz2 tcp:80`
4. `gz2` runs one web service for `/`, `/login`, `/trial`, `/workspace*`, `/api/auth/*`
5. `Platform/apps/web` points `DIFFAUDIT_API_BASE_URL` to local `apps/api-go`
6. `Platform/apps/api-go` serves snapshot-backed read routes from `apps/api-go/data/public/*`
7. `Platform/apps/api-go` forwards only audit control-plane routes to `Services/Local-API`（Runtime）
   - current active control-plane owner is `DELICIOUS233` (`100.81.149.78`)
   - this hop depends on tailnet ACL allowing `gz2 -> d233 tcp:8765`

## Current Runtime Owners On `gz2`

- nginx config:
  - `/etc/nginx/sites-available/diffaudit.vectorcontrol.tech`
  - `/etc/nginx/sites-enabled/diffaudit.vectorcontrol.tech`
- web service:
  - `diffaudit-platform-web.service`
  - working tree: `/home/ubuntu/projects/DiffAudit-Platform-deploy-next`
  - listen: `0.0.0.0:3000`
  - env: `/etc/diffaudit-platform-web.env`
- api service:
  - `diffaudit-platform-api.service`
  - listen: `127.0.0.1:8780`
  - public snapshot root: `apps/api-go/data/public`
- Runtime:
  - active owner remains outside `gz2`
  - current owner is `DELICIOUS233` on `0.0.0.0:8765`
  - `DIFFAUDIT_RUNTIME_BASE_URL=http://100.81.149.78:8765`
  - `DIFFAUDIT_API_BASE_URL` on `web` must point to `http://127.0.0.1:8780`

## Handoff Requirements

每次 handoff 至少写清：

- `gz2` 当前 web service 名称
- `DIFFAUDIT_API_BASE_URL` 当前值
- `hk -> gz2` 的单站转发关系
- `apps/web` 是唯一前端运行时

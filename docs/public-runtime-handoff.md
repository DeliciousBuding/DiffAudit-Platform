# Public Runtime Handoff

当前公网运行时是单站模型。

## Active Runtime Story

- Public domain: `https://diffaudit.vectorcontrol.tech`
- Public edge: Cloudflare
- Edge host: `hk`
- Runtime host: `gz2`
- Public app owner: `Platform/apps/web`
- Backend gateway: `Platform/apps/api-go`
- Research-facing upstream: `Services/Local-API`

当前请求链：

1. public request reaches Cloudflare
2. Cloudflare forwards to `hk`
3. `hk` forwards the full site to `gz2`
4. `gz2` runs one web service for `/`, `/login`, `/trial`, `/workspace*`, `/api/auth/*`
5. `Platform/apps/web` proxies `api/v1/*` requests to `DIFFAUDIT_API_BASE_URL`
6. `Services/Local-API` serves catalog and admitted experiment metadata

## Current Runtime Owners On `gz2`

- nginx config:
  - `/etc/nginx/sites-available/diffaudit.vectorcontrol.tech`
  - `/etc/nginx/sites-enabled/diffaudit.vectorcontrol.tech`
- web service:
  - `diffaudit-platform-web.service`
  - working tree: `/home/ubuntu/projects/DiffAudit-Platform-deploy-next`
  - listen: `0.0.0.0:3000`
  - env: `/etc/diffaudit-platform-web.env`
- Local-API:
  - active owner remains outside `gz2`
  - `DIFFAUDIT_API_BASE_URL` points to the active upstream

## Handoff Requirements

每次 handoff 至少写清：

- `gz2` 当前 web service 名称
- `DIFFAUDIT_API_BASE_URL` 当前值
- `hk -> gz2` 的单站转发关系
- `apps/web` 是唯一前端运行时

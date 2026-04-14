# Public Runtime Runbook

这是当前单站公网链路的最短检查清单。

## Runtime Facts

- Public domain: `https://diffaudit.vectorcontrol.tech`
- Public app: `Platform/apps/web`
- Public gateway: `Platform/apps/api-go`
- Public login: `/login`
- Workspace entry: `/workspace`
- Runtime host: `gz2`
- Live web service: `diffaudit-platform-web.service`
- Live api service: `diffaudit-platform-api.service`

## Phase 1: Public Checks

```powershell
curl.exe -I -A "Mozilla/5.0" https://diffaudit.vectorcontrol.tech/
curl.exe -I -A "Mozilla/5.0" https://diffaudit.vectorcontrol.tech/login
curl.exe -I -A "Mozilla/5.0" https://diffaudit.vectorcontrol.tech/workspace
```

预期：

- `/` returns `200`
- `/login` returns `200`
- `/workspace` 未登录时进入统一登录链路

## Phase 2: `gz2` Local Checks

```powershell
curl -I http://127.0.0.1:3000/
curl -I http://127.0.0.1:3000/login
curl -I http://127.0.0.1:3000/workspace
systemctl status diffaudit-platform-web.service --no-pager
systemctl status diffaudit-platform-api.service --no-pager
```

## Phase 3: Snapshot Read Plane

```powershell
ssh gz2 "curl -s -D - http://127.0.0.1:8780/api/v1/catalog"
ssh gz2 "curl -s -D - http://127.0.0.1:8780/api/v1/evidence/attack-defense-table"
ssh gz2 "curl -s -D - http://127.0.0.1:8780/api/v1/models"
```

预期：

- 以上接口都返回 `200`
- `apps/api-go/data/public/*` 存在且能独立服务展示态

## Phase 4: Auth Chain

```powershell
curl -i -H "content-type: application/json" -d "{\"username\":\"<shared-username>\",\"password\":\"<shared-password>\"}" http://127.0.0.1:3000/api/auth/login
curl -I -H "Cookie: diffaudit_session=<token>" http://127.0.0.1:3000/workspace
curl -H "Cookie: diffaudit_session=<token>" http://127.0.0.1:3000/api/v1/catalog
```

预期：

- 登录返回 `Set-Cookie: diffaudit_session=...`
- 认证后 `/workspace` 返回 `200`
- 认证后 `/api/v1/catalog` 返回 catalog JSON

## Phase 5: Control Plane Upstream

当前默认上游：

- `DIFFAUDIT_API_BASE_URL=http://127.0.0.1:8780`
- `DIFFAUDIT_CONTROL_API_BASE_URL=http://100.81.149.78:8765`
- owner: `DELICIOUS233`
- service must listen on `0.0.0.0:8765`
- tailnet ACL must allow `gz2 -> d233 tcp:8765`

检查命令：

```powershell
ssh gz2 "curl -s -D - http://100.81.149.78:8765/health"
ssh gz2 "curl -s -D - http://127.0.0.1:8780/api/v1/audit/jobs"
```

预期：

- `/health` 返回 `200`
- `api-go -> Local-API` 的 jobs 路径返回 `200`
- 即使这一步失败，展示态 `/workspace`、`/reports`、`/settings` 仍应可打开

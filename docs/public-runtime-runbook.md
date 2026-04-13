# Public Runtime Runbook

这是当前单站公网链路的最短检查清单。

## Runtime Facts

- Public domain: `https://diffaudit.vectorcontrol.tech`
- Public app: `Platform/apps/web`
- Public login: `/login`
- Workspace entry: `/workspace`
- Runtime host: `gz2`
- Live web service: `diffaudit-platform-web.service`

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
```

## Phase 3: Auth Chain

```powershell
curl -i -H "content-type: application/json" -d "{\"username\":\"<shared-username>\",\"password\":\"<shared-password>\"}" http://127.0.0.1:3000/api/auth/login
curl -I -H "Cookie: diffaudit_session=<token>" http://127.0.0.1:3000/workspace
curl -H "Cookie: diffaudit_session=<token>" http://127.0.0.1:3000/api/v1/catalog
```

预期：

- 登录返回 `Set-Cookie: diffaudit_session=...`
- 认证后 `/workspace` 返回 `200`
- 认证后 `/api/v1/catalog` 返回 catalog JSON

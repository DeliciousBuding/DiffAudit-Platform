# Public Runtime Runbook

This runbook is the shortest operator checklist for the current public
`DiffAudit` chain.

Use it to answer three questions quickly:

1. Is the public edge still reachable?
2. Are the runtime services on `gz2` still healthy?
3. Is the failure in repo-owned runtime or in external edge systems?

## Current Runtime Facts

- Public domain: `https://diffaudit.vectorcontrol.tech`
- Public edge: Cloudflare
- Edge host: `hk`
- Runtime host: `gz2`
- `hk` role: full-site reverse proxy only
- Portal app: `Platform-Portal` on `127.0.0.1:3001`
- Workbench app: `Platform/apps/web` on `127.0.0.1:3000`
- Local-API: `Services/Local-API` on `127.0.0.1:8765`
- Live systemd units on `gz2`:
  - `diffaudit-portal.service`
  - `diffaudit-platform-web.service`
  - `diffaudit-local-api.service`

## Phase 1: Public Canary

Goal:
confirm the public domain still reaches the portal and workbench entry.

Commands:

```powershell
curl.exe -I -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36" https://diffaudit.vectorcontrol.tech/
curl.exe -I -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36" https://diffaudit.vectorcontrol.tech/login
```

Expected:

- homepage `200`
- login page `200`

## Phase 2: `gz2` Local Service Health

Goal:
confirm the runtime services behind the edge.

Run on `gz2`:

```powershell
curl -I http://127.0.0.1:3001/
curl -I http://127.0.0.1:3001/login
curl -I http://127.0.0.1:3000/audit
curl http://127.0.0.1:8765/health
```

Expected:

- Portal root `200`
- Portal login `200`
- Platform `/audit` redirects to `/login` when unauthenticated
- Local-API `/health` returns `200`

## Phase 3: Auth Chain

Goal:
confirm Portal login still opens the workbench.

Run on `gz2` or from a browser-like public client:

```powershell
curl -i -H "content-type: application/json" -d "{\"username\":\"diffaudit-review\",\"password\":\"<shared-password>\"}" http://127.0.0.1:3001/api/auth/login
curl -I -H "Cookie: diffaudit_session=<token>" http://127.0.0.1:3000/audit
curl -H "Cookie: diffaudit_session=<token>" http://127.0.0.1:3000/api/v1/catalog
```

Expected:

- Portal login returns `Set-Cookie: diffaudit_session=...`
- authenticated `/audit` returns `200`
- authenticated `/api/v1/catalog` returns catalog JSON

## Phase 4: `gz2` nginx Checks

Goal:
confirm `gz2` nginx still owns all path routing.

Checks:

- `/etc/nginx/sites-enabled/diffaudit.vectorcontrol.tech` exists
- `/portal-static/_next/*` rewrites to `/_next/*` before proxying to Portal
- `/` proxies to Portal
- `/audit` and `/api/v1/*` proxy to Platform

## Phase 5: `hk` Edge Checks

Goal:
confirm `hk` has stayed thin.

Checks on `hk`:

- the site config contains one `location /`
- that location proxies to `http://100.77.212.60`
- `hk` does not carry route-specific business logic for DiffAudit

## Exit Criteria

You can call the public chain operational only when all of the following are
true:

- public `/` returns `200`
- public `/login` returns `200`
- public Portal login returns a shared session cookie
- public authenticated `/audit` returns `200`
- public authenticated `/api/v1/catalog` returns catalog JSON
- `gz2` remains the documented runtime owner

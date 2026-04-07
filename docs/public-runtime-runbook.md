# Public Runtime Runbook

This runbook is the shortest operator checklist for the current public
`DiffAudit-Platform` chain.

Use it to answer three questions quickly:

1. Is the public edge still reachable?
2. Are the private origin services still healthy?
3. Is the failure inside repo-owned runtime or in external systems?

## Current Runtime Facts

- Public domain: `https://diffaudit.vectorcontrol.tech`
- Public edge: Cloudflare
- Entry host: `hk`
- Runtime host: `hk`
- Homepage/login app: `Platform-Portal` on `127.0.0.1:3011`
- Workbench app: `Platform/apps/web` on `127.0.0.1:3000`
- Research-facing upstream: `Services/Local-API` on `127.0.0.1:8765`
- Live systemd units:
  - `diffaudit-portal.service`
  - `diffaudit-platform-web.service`
  - `diffaudit-local-api.service`
- Live nginx upstreams:
  - `diffaudit_portal -> 127.0.0.1:3011`
  - `diffaudit_workbench -> 127.0.0.1:3000`
- `gz2` is not in the live path as of `2026-04-08`

## Phase 1: Public Canary

Goal:
confirm the public domain still reaches the platform shell.

Repository-owned expectation:

- the canary paths are `GET /` and `GET /login`

External blocker:

- default bot-like CLI probes may still hit Cloudflare challenge heuristics

Command:

```powershell
curl.exe -I -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36" https://diffaudit.vectorcontrol.tech/
curl.exe -I -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36" https://diffaudit.vectorcontrol.tech/login
```

Expected steady-state result:

- `200`
- and not Cloudflare `403` for a browser-like request

If result is `403` for a browser-like request:

- stop treating this as an app outage
- classify it as an external edge-policy failure
- continue with Phase 2 and Phase 3

## Phase 2: Private Origin Health

Goal:
confirm the actual services on `hk`.

These checks are repository-owned and should work even when the public edge is
blocked.

Run on `hk`:

```powershell
curl http://127.0.0.1:3011/login
curl http://127.0.0.1:3000/health
curl http://127.0.0.1:8765/health
```

Expected result:

- Portal login page reachable on `127.0.0.1:3011`
- Platform `/health` requires auth and returns `401` when unauthenticated
- Local-API health reachable on `127.0.0.1:8765`

If `127.0.0.1:8765/health` fails:

- the issue is inside the origin runtime or its process manager
- continue with Phase 4

## Phase 3: Private Upstream Health

Goal:
confirm `Platform/apps/web` can still reach `Services/Local-API`.

Run on `hk`:

```powershell
sudo sed -n '1,20p' /etc/diffaudit-platform-web.env
curl http://127.0.0.1:8765/health
curl -H "Cookie: diffaudit_session=diffaudit-shared-session-token" http://127.0.0.1:3000/api/v1/catalog
```

Expected result:

- current `DIFFAUDIT_API_BASE_URL` resolves to `http://127.0.0.1:8765`
- upstream `/health` returns `200`
- authenticated `api/v1/catalog` returns catalog JSON

If this fails while Phase 2 passed:

- classify it as upstream connectivity or Local-API availability failure
- check `diffaudit-platform-web.service`
- check `diffaudit-local-api.service`
- check the deployed env file on `hk`

## Phase 4: hk Runtime Checks

Goal:
separate app failure from host or proxy failure.

### `hk`

External-system checks:

- confirm nginx is running
- confirm nginx upstreams still point to `127.0.0.1:3011` and `127.0.0.1:3000`
- confirm these systemd units are active:
  - `diffaudit-portal.service`
  - `diffaudit-platform-web.service`
  - `diffaudit-local-api.service`
- confirm no new Cloudflare rule is forcing browser-like requests into
  challenge

## Phase 5: Cloudflare Allow / Bypass Checklist

This phase is entirely external-system work.

Required steady-state policy:

- keep `/health` and `/api/v1/*` protected
- allow browser-like user requests to hit `/` and `/login`

Minimum operator record:

- which monitoring source IPs or service are allowed
- which Cloudflare rule implements the allow / bypass
- who owns that rule
- when it was last verified

## Repository-Owned Steps

These are the parts you can verify from repo-owned runtime and docs:

- `Platform-Portal` owns the public homepage and login
- `Platform/apps/web` owns the workbench shell
- `/` and `/login` are the public canary targets
- `/health` and `/api/v1/*` are not anonymous probe endpoints
- the runtime handoff and probe boundary are documented in this repo

## External-System Steps

These require systems outside git:

- Cloudflare allow / bypass rules
- `hk` nginx config
- `hk` systemd units
- deployed env values on `hk`

## Exit Criteria

You can call the public chain operational only when all of the following are
true:

- public `/` returns `200` for a browser-like request
- public `/login` returns `200` for a browser-like request
- `hk` local `127.0.0.1:3011/login` is reachable
- `hk` local `127.0.0.1:3000/health` requires auth and responds correctly when
  unauthenticated
- authenticated `hk` local or public `api/v1/catalog` returns `200`
- the Cloudflare and `hk` service ownership is explicitly written in handoff

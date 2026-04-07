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
- Origin host: `gz2`
- Public app: `apps/web`
- Active backend: `apps/api-go`
- Current documented upstream from `gz2`: `http://100.81.149.78:8765`
- Current documented private overlay: Tailscale between `gz2` and the machine
  hosting `Services/Local-API`

## Phase 1: Public Canary

Goal:
confirm the public domain still reaches the platform shell.

Repository-owned expectation:

- the canary path is `GET /login`

External blocker:

- Cloudflare challenge policy can still block this path

Command:

```powershell
curl.exe -I https://diffaudit.vectorcontrol.tech/login
```

Expected steady-state result:

- `200`
- or `302` to a stable login flow
- but not Cloudflare `403` with `Cf-Mitigated: challenge`

If result is `403` with `Cf-Mitigated: challenge`:

- stop treating this as an app outage
- classify it as an external edge-policy failure
- continue with Phase 2 and Phase 3

## Phase 2: Private Origin Health

Goal:
confirm the actual services on `gz2`.

These checks are repository-owned and should work even when the public edge is
blocked.

Run on `gz2`:

```powershell
curl http://127.0.0.1:3000/login
curl http://127.0.0.1:8780/health
```

Expected result:

- web login page reachable on `127.0.0.1:3000`
- `apps/api-go` health reachable on `127.0.0.1:8780`

If `127.0.0.1:8780/health` fails:

- the issue is inside the origin runtime or its process manager
- continue with Phase 4

## Phase 3: Private Upstream Health

Goal:
confirm `apps/api-go` can still reach `Services/Local-API`.

Run on `gz2`:

```powershell
echo $env:DIFFAUDIT_API_BASE_URL
curl http://100.81.149.78:8765/health
```

If the configured upstream differs from `100.81.149.78:8765`, probe the actual
configured value instead.

Expected result:

- current `DIFFAUDIT_API_BASE_URL` resolves to the Tailscale-reachable
  `Local-API`
- upstream `/health` returns `200`

If this fails while Phase 2 passed:

- classify it as upstream connectivity or Local-API availability failure
- check whether Tailscale is up on `gz2`
- check whether the Local-API host is listening on `0.0.0.0:8765`

## Phase 4: hk / gz2 Runtime Checks

Goal:
separate app failure from host or proxy failure.

### `hk`

External-system checks:

- confirm nginx is running
- confirm the domain still proxies to `gz2`
- confirm no new WAF rule is forcing a challenge on `/login`

### `gz2`

External-system checks:

- confirm the web service unit is running
- confirm the `apps/api-go` service or equivalent process is running
- confirm the deploy env still points `DIFFAUDIT_API_BASE_URL` at the intended
  upstream
- confirm Tailscale is connected if the upstream is still the Tailscale IP

## Phase 5: Cloudflare Allow / Bypass Checklist

This phase is entirely external-system work.

Required steady-state policy:

- keep `/health` and `/api/v1/*` protected
- allow the approved monitoring source to hit `GET /login` without challenge

Minimum operator record:

- which monitoring source IPs or service are allowed
- which Cloudflare rule implements the allow / bypass
- who owns that rule
- when it was last verified

## Repository-Owned Steps

These are the parts you can verify from repo-owned runtime and docs:

- `apps/web` is the public app
- `apps/api-go` is the active backend
- `/login` is the public canary target
- `/health` and `/api/v1/*` are not anonymous probe endpoints
- the runtime handoff and probe boundary are documented in this repo

## External-System Steps

These require systems outside git:

- Cloudflare allow / bypass rules
- `hk` nginx config
- `gz2` systemd or equivalent service manager
- Tailscale connectivity between `gz2` and the Local-API host
- deployed env values on `gz2`

## Exit Criteria

You can call the public chain operational only when all of the following are
true:

- public `/login` no longer gets Cloudflare challenge for the approved
  monitoring source
- `gz2` local `127.0.0.1:3000/login` is reachable
- `gz2` local `127.0.0.1:8780/health` returns `200`
- the configured upstream `Local-API` `/health` returns `200`
- the Tailscale dependency, if still present, is explicitly written in handoff

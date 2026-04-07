# Public Runtime Handoff

This document is the deployment and runtime handoff for the current public
`DiffAudit-Platform` chain.

The shortest executable operator checklist lives in
`docs/public-runtime-runbook.md`.

## Active Runtime Story

- Public domain: `https://diffaudit.vectorcontrol.tech`
- Public edge: Cloudflare
- Entry host: `hk`
- Origin host: `gz2`
- Public app: `apps/web`
- Active private backend: `apps/api-go`
- Research-facing upstream behind the gateway: `Services/Local-API`

Current request flow:

1. public request reaches Cloudflare
2. Cloudflare forwards to `hk`
3. `hk` nginx proxies to `gz2`
4. `gz2` serves `apps/web`
5. Next.js route handlers proxy private API traffic to `apps/api-go`
6. `apps/api-go` proxies research-facing routes to `Services/Local-API`

The legacy `apps/api` FastAPI stub is not part of the active runtime path.

## Detectability Model

Current public auth and edge policy mean the following:

- `/health` is not an anonymous public uptime endpoint
- `/api/v1/*` is not an anonymous public uptime endpoint
- both paths sit behind the shared-login boundary and currently also hit
  external Cloudflare challenge policy

As a result, anonymous `curl` probes to `/health` or `/api/v1/*` are currently
unsupported as a reliability signal.

## Shortest Stable Probe Plan

Use a two-layer probe model.

### 1. Public edge canary

Purpose:
confirm the public domain still reaches the platform shell.

Path:

- `GET /login`

Constraint:

- this path is only stable for monitoring after Cloudflare is configured to stop
  challenging the chosen monitoring source

Recommended external config:

- keep `/health` and `/api/v1/*` protected
- add a Cloudflare allow/bypass rule for `GET /login` from the approved
  monitoring source IPs or monitoring service

This is the shortest no-code path to a stable public canary.

### 2. Private origin probes

Purpose:
confirm the actual services behind the public edge.

Run these on `gz2` or from the same private network segment:

```powershell
curl http://127.0.0.1:3000/login
curl http://127.0.0.1:8780/health
```

If the web app is configured to target a different backend base URL, also verify
that resolved target explicitly:

```powershell
echo $env:DIFFAUDIT_API_BASE_URL
curl $env:DIFFAUDIT_API_BASE_URL/health
```

## Unversioned External Dependencies

The following dependencies are real parts of the public chain but are not
versioned in this repository:

- Cloudflare DNS / WAF / challenge policy
- `hk` nginx configuration
- `gz2` process manager or systemd units
- deployment environment variables for `apps/web`
- deployment environment variables for `apps/api-go`

## Tailscale Status

There is currently no repository-grounded evidence that the public Platform
chain depends on Tailscale.

That does not prove Tailscale is absent from the live environment. It means:

- if Tailscale is in the real path, it is currently an undocumented external
  dependency
- until documented, Tailscale must be treated as an external blocker for clean
  handoff

## Handoff Requirements

Any deployment handoff must explicitly record:

- the active `DIFFAUDIT_API_BASE_URL` value or its target host/port
- whether Cloudflare bypass/allow rules exist for the monitoring source
- the exact `hk` to `gz2` proxy path
- the exact `gz2` services or systemd unit names for `apps/web` and
  `apps/api-go`
- whether any private overlay such as Tailscale exists between those hops

If any of the above is unknown, the handoff is incomplete.

# Public Runtime Handoff

This document is the deployment and runtime handoff for the current public
`DiffAudit-Platform` chain.

The shortest executable operator checklist lives in
`docs/public-runtime-runbook.md`.

## Active Runtime Story

- Public domain: `https://diffaudit.vectorcontrol.tech`
- Public edge: Cloudflare
- Runtime host: `hk`
- Public homepage and login owner: `Platform-Portal`
- Public workbench shell: `Platform/apps/web`
- Research-facing upstream behind the workbench shell: `Services/Local-API`

Current request flow:

1. public request reaches Cloudflare
2. Cloudflare forwards to `hk`
3. `hk` nginx proxies `/`, `/login`, `/api/auth/*`, and `/portal-static/_next/*`
   to local `diffaudit-portal.service` on `127.0.0.1:3011`
4. `hk` nginx proxies `/audit`, `/dashboard`, `/guide`, `/report`, `/batch`,
   `/api/v1/*`, `/health`, and `/_next/*` to local
   `diffaudit-platform-web.service` on `127.0.0.1:3000`
5. `Platform/apps/web` validates the shared `diffaudit_session` cookie and
   proxies `api/v1/*` requests to `diffaudit-local-api.service` on
   `127.0.0.1:8765`
6. `Services/Local-API` serves the catalog and admitted experiment metadata
   from its local SQLite registry

The active public path no longer depends on `gz2`, `apps/api-go`, or Tailscale.
`gz2` was removed from the live chain on `2026-04-08` after it became
unreachable on both Tailnet and public SSH.

## Detectability Model

Current public auth and edge policy mean the following:

- `/health` is not an anonymous public uptime endpoint
- `/api/v1/*` is not an anonymous public uptime endpoint
- browser-like public requests to `/` and `/login` should return `200`
- anonymous bot-like `curl` probes may still be challenged by Cloudflare bot
  heuristics even after the explicit custom WAF rule was disabled on
  `2026-04-08`

As a result, anonymous `curl` probes to `/health` or `/api/v1/*` are currently
unsupported as a reliability signal.

## Shortest Stable Probe Plan

Use a two-layer probe model.

### 1. Public edge canary

Purpose:
confirm the public domain still reaches the platform shell.

Paths:

- `GET /`
- `GET /login`

Constraint:

- use a browser-like user agent or a real browser session
- do not treat challenge responses to default `curl` as an application outage

The explicit host-level custom WAF challenge on
`diffaudit.vectorcontrol.tech` was disabled on `2026-04-08`. If fully anonymous
CLI canarying is required, record the exact Cloudflare bot/bypass rule that
allows the monitoring source.

### 2. Private origin probes

Purpose:
confirm the actual services behind the public edge.

Run these on `hk`:

```powershell
curl http://127.0.0.1:3011/login
curl http://127.0.0.1:3000/health
curl http://127.0.0.1:8765/health
```

## Unversioned External Dependencies

The following dependencies are real parts of the public chain but are not
versioned in this repository:

- Cloudflare DNS / bot / challenge policy
- `hk` nginx configuration
- `hk` systemd units:
  - `diffaudit-portal.service`
  - `diffaudit-platform-web.service`
  - `diffaudit-local-api.service`
- deployment environment files:
  - `/etc/diffaudit-portal.env`
  - `/etc/diffaudit-platform-web.env`

## Handoff Requirements

Any deployment handoff must explicitly record:

- the active local service ports on `hk`
- the active `DIFFAUDIT_API_BASE_URL` value or its target host/port
- whether Cloudflare monitoring bypass rules exist for the monitoring source
- the exact `hk` nginx split-routing config
- the exact `hk` systemd unit names for Portal, Platform, and Local-API
- whether `gz2` has been restored or remains explicitly out of the live chain

If any of the above is unknown, the handoff is incomplete.

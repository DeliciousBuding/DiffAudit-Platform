# Public Runtime Handoff

This document is the deployment and runtime handoff for the current public
`DiffAudit` chain.

The shortest executable operator checklist lives in
`docs/public-runtime-runbook.md`.

## Active Runtime Story

- Public domain: `https://diffaudit.vectorcontrol.tech`
- Public edge: Cloudflare
- Edge host: `hk`
- Runtime host: `gz2`
- Public homepage and login owner: `Platform-Portal`
- Public workbench shell: `Platform/apps/web`
- Research-facing upstream behind the workbench shell: `Services/Local-API`
- Active Local-API runtime owner: local workstation, not `gz2`

Current request flow:

1. public request reaches Cloudflare
2. Cloudflare forwards to `hk`
3. `hk` does a single full-site proxy pass to `http://100.77.212.60`
4. `gz2` nginx splits routes locally:
   - `/`, `/login`, `/api/auth/*`, `/portal-static/_next/*` -> Portal on `127.0.0.1:3001`
   - `/audit`, `/dashboard`, `/guide`, `/report`, `/batch`, `/api/v1/*`,
     `/health`, `/_next/*` -> Platform on `127.0.0.1:3000`
5. `Platform/apps/web` validates the shared `diffaudit_session` cookie and
   proxies `api/v1/*` requests to the configured `DIFFAUDIT_API_BASE_URL`
6. the live `gz2` value of `DIFFAUDIT_API_BASE_URL` points to
   `http://100.81.149.78:8765`, which is the Local-API running on the local
   workstation over Tailscale
7. `Services/Local-API` serves the catalog and admitted experiment metadata
   from its local SQLite registry

The active public path is now anchored on `gz2`. `hk` is only the TLS/public
forwarding edge.

## Current Runtime Owners On `gz2`

- nginx config:
  - `/etc/nginx/sites-available/diffaudit.vectorcontrol.tech`
  - `/etc/nginx/sites-enabled/diffaudit.vectorcontrol.tech`
- Portal service:
  - `diffaudit-portal.service`
  - working tree: `/home/ubuntu/projects/DiffAudit-Platform-Portal-deploy`
  - listen: `127.0.0.1:3001`
  - env: `/etc/diffaudit-portal.env`
- Platform service:
  - `diffaudit-platform-web.service`
  - working tree: `/home/ubuntu/projects/DiffAudit-Platform-deploy-next`
  - listen: `0.0.0.0:3000`
  - env: `/etc/diffaudit-platform-web.env`
- Local-API on `gz2`:
  - `diffaudit-local-api.service` is masked and must stay inactive
  - `/home/ubuntu/projects/diffaudit/backup/local-api-copy` is a cold backup only
  - `gz2` reaches the active Local-API over Tailscale at `100.81.149.78:8765`

## Detectability Model

Current public auth and edge policy mean the following:

- `/health` is not an anonymous public uptime endpoint
- `/api/v1/*` is not an anonymous public uptime endpoint
- browser-like public requests to `/` and `/login` should return `200`
- anonymous bot-like `curl` probes may still be challenged by Cloudflare bot
  heuristics

As a result, anonymous `curl` probes to `/health` or `/api/v1/*` are currently
unsupported as a reliability signal.

## Handoff Requirements

Any deployment handoff must explicitly record:

- the active local service ports on `gz2`
- the active `DIFFAUDIT_API_BASE_URL` value on `gz2`
- the exact `gz2` nginx split-routing config
- the exact `gz2` systemd unit names for Portal and Platform
- the fact that `diffaudit-local-api.service` is masked on `gz2`
- the fact that `hk` is now only a full-site forwarding edge

If any of the above is unknown, the handoff is incomplete.

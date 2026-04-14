# Public Runtime Recovery 2026-04-14

## Summary

- Incident window observed on `2026-04-14`
- Public symptom: `https://diffaudit.vectorcontrol.tech` returned `Cloudflare 504 Gateway Timeout`
- Recovery status: restored

## Root Cause

- `gz2` local services were healthy:
  - `diffaudit-platform-web.service` on `127.0.0.1:3000`
  - `diffaudit-portal.service` on `127.0.0.1:3001`
- `hk` nginx still proxied the public domain to `http://100.77.212.60`
- The `hk -> gz2:80` Tailscale flow was blocked by tailnet ACL
  - decisive evidence from `hk`:
    - `tailscale ping 100.77.212.60` succeeded
    - `curl http://100.77.212.60/ -H 'Host: diffaudit.vectorcontrol.tech'` timed out
    - `journalctl -u tailscaled` logged `open-conn-track: flow TCP 100.96.116.54 > 100.77.212.60:80 rejected due to acl`

## What Changed

1. Tailnet ACL
   - added explicit allow for `ipset:public-edge` to reach `host:gz2` on `tcp:80`
   - intent: restore `hk` as the public edge proxy for `gz2`
2. `gz2` nginx compatibility layer
   - backed up `/etc/nginx/sites-available/diffaudit.vectorcontrol.tech`
   - added `/workspace` and `/workspace/` redirects to `https://diffaudit.vectorcontrol.tech/dashboard`
   - reason: current deployed runtime still serves the legacy platform path family (`/dashboard`, `/audit`, `/report`, `/guide`), while public docs still advertise `/workspace`

## Verification

- Public checks
  - `curl -I https://diffaudit.vectorcontrol.tech/` -> `200`
  - `curl -I https://diffaudit.vectorcontrol.tech/login` -> `200`
  - `curl -I https://diffaudit.vectorcontrol.tech/workspace` -> `302` to `/dashboard`
  - `curl -I -L https://diffaudit.vectorcontrol.tech/workspace` -> enters login chain and ends on `/login` with `200`
- `hk -> gz2`
  - `curl -I http://100.77.212.60/ -H 'Host: diffaudit.vectorcontrol.tech'` -> `200`
  - `curl -I http://100.77.212.60/workspace -H 'Host: diffaudit.vectorcontrol.tech'` -> `302` to `https://diffaudit.vectorcontrol.tech/dashboard`
- Authenticated workspace fallback
  - with `Cookie: diffaudit_session=diffaudit-shared-session-token`
  - `curl -I -L https://diffaudit.vectorcontrol.tech/workspace` -> `200` on `/dashboard`

## Remaining Risks

- Deployment drift still exists:
  - docs describe `/workspace*`
  - live `gz2` runtime still uses legacy app routes behind `3000` and `3001`
- `DIFFAUDIT_API_BASE_URL=http://100.81.149.78:8765` was not the cause of the 504, but direct health probes to that upstream timed out during this incident check; API-side latency or reachability should be checked separately
- `Platform/docs/public-runtime-runbook.md` and live routing should be reconciled in a later maintenance window so `/workspace*` no longer depends on nginx compatibility redirects

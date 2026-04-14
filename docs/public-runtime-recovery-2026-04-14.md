# Public Runtime Recovery 2026-04-14

## Summary

- Incident window observed on `2026-04-14`
- Public symptom: `https://diffaudit.vectorcontrol.tech` returned `Cloudflare 504 Gateway Timeout`
- Recovery status: restored
- Same-day follow-up symptom after platform cutover: authenticated `GET /api/v1/catalog` returned `500`
- Same-day follow-up status: restored

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
- Follow-up data-plane root cause after the new single-site deploy:
  - `DIFFAUDIT_API_BASE_URL` on `gz2` correctly pointed at `http://100.81.149.78:8765`
  - `100.81.149.78` is the operator workstation `DELICIOUS233`, not `gz2`
  - Local-API on `DELICIOUS233` was only listening on `127.0.0.1:8765`
  - tailnet ACL also lacked `gz2 -> d233 tcp:8765`
  - decisive evidence:
    - `tailscale ping 100.81.149.78` from `gz2` succeeded
    - TCP connect from `gz2` to `100.81.149.78:8765` failed before the ACL change
    - local `netstat` on `DELICIOUS233` showed `127.0.0.1:8765` only
    - after relaunching Local-API on `0.0.0.0:8765` and adding the ACL grant, `gz2 -> 100.81.149.78:8765/api/v1/catalog` returned `200`

## What Changed

1. Tailnet ACL
  - added explicit allow for `ipset:public-edge` to reach `host:gz2` on `tcp:80`
  - intent: restore `hk` as the public edge proxy for `gz2`
2. `gz2` nginx compatibility layer
   - backed up `/etc/nginx/sites-available/diffaudit.vectorcontrol.tech`
   - added `/workspace` and `/workspace/` redirects to `https://diffaudit.vectorcontrol.tech/dashboard`
   - reason: current deployed runtime still serves the legacy platform path family (`/dashboard`, `/audit`, `/report`, `/guide`), while public docs still advertise `/workspace`
3. Local-API runtime owner
   - kept Local-API outside `gz2`
   - relaunched Local-API on `DELICIOUS233` with `ListenHost=0.0.0.0` and port `8765`
   - preserved `DIFFAUDIT_API_BASE_URL=http://100.81.149.78:8765` on `gz2`
4. Tailnet ACL follow-up
   - added explicit allow for `host:gz2` to reach `host:d233` on `tcp:8765`
   - intent: let `Platform/apps/web` on `gz2` consume the workstation-owned Local-API without moving that service onto `gz2`

## Verification

- Public checks
  - `curl -I https://diffaudit.vectorcontrol.tech/` -> `200`
  - `curl -I https://diffaudit.vectorcontrol.tech/login` -> `200`
  - `curl -I https://diffaudit.vectorcontrol.tech/workspace` -> `307` to `/login?redirectTo=%2Fworkspace`
- `hk -> gz2`
  - `curl -I http://100.77.212.60/ -H 'Host: diffaudit.vectorcontrol.tech'` -> `200`
  - `curl -I http://100.77.212.60/workspace -H 'Host: diffaudit.vectorcontrol.tech'` -> `307` to `/login?redirectTo=%2Fworkspace`
- Local-API upstream
  - `curl http://100.81.149.78:8765/health` from `gz2` -> `200`
  - `curl http://100.81.149.78:8765/api/v1/catalog` from `gz2` -> `200`
- Authenticated workspace
  - shared login returns `Set-Cookie: diffaudit_session=...`
  - `curl -I -H "Cookie: diffaudit_session=<token>" https://diffaudit.vectorcontrol.tech/workspace` -> `200`
  - `curl -H "Cookie: diffaudit_session=<token>" https://diffaudit.vectorcontrol.tech/api/v1/catalog` -> `200` with catalog JSON

## Remaining Risks

- The public data plane now depends on `DELICIOUS233` staying online, connected to Tailscale, and continuing to run Local-API on `0.0.0.0:8765`
- Local-API is currently a workstation-owned process, not a managed Windows service with restart-on-boot semantics
- The helper script `ts.py acl validate/apply` misreports success or failure for the current ACL API response shape; future ACL edits should verify with a fresh `acl get` after apply

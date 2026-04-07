# Public Runtime Decision Table

This document is the hard launch decision table for the current public
`DiffAudit-Platform` chain.

Question:

If the system goes live today, which external items must be confirmed first, and
which items can be carried as explicit risk?

## Same-Day Launch Verdict

Before calling the system ready today, the team must first confirm every
`must-have` item below.

If all `must-have` items are confirmed healthy, the system can run with the
remaining `observability-only` and `known-risk` items still open, but it should
be described as:

- functionally live
- not yet fully handoff-ready
- carrying explicit operational risk

## Decision Table

| Item | Class | Why it matters | If unconfirmed today |
| --- | --- | --- | --- |
| Cloudflare basic edge reachability | `must-have` | Public users need the domain to resolve and reach the edge at all | Do not call launch ready |
| `hk` nginx split routing to local Portal and Platform services | `must-have` | Public requests must still reach the right app on the runtime host | Do not call launch ready |
| `hk` `diffaudit-portal.service` runtime | `must-have` | The public homepage and login depend on it | Do not call launch ready |
| `hk` `diffaudit-platform-web.service` runtime | `must-have` | Logged-in workbench reads depend on it | Do not call launch ready |
| `hk` `diffaudit-local-api.service` runtime | `must-have` | Platform catalog and evidence routes depend on it | Do not call launch ready |
| `hk` deployed `DIFFAUDIT_API_BASE_URL` value | `must-have` | Platform must target the intended upstream | Do not call launch ready |
| Shared cookie contract between Portal and Platform | `must-have` | Login ownership moved to Portal; workbench auth depends on the shared cookie | Do not call launch ready |
| Cloudflare browser-like access to `/` and `/login` | `must-have` | Public users need a working homepage and login entry | Do not call launch ready |
| Cloudflare allow / bypass for monitoring source hitting `/` or `/login` | `observability-only` | Needed for stable CLI canarying, not for already-known user function | Can run with risk |
| Anonymous `/health` probing | `observability-only` | This route is intentionally protected | Can run with risk |
| Anonymous `/api/v1/*` probing | `observability-only` | These routes are intentionally protected | Can run with risk |
| Exact `hk` nginx config recorded in repo-accessible handoff | `known-risk` | Missing documentation slows takeover and incident response | Can run with risk |
| Exact `hk` systemd/process names recorded in repo-accessible handoff | `known-risk` | Missing documentation slows restart and recovery | Can run with risk |
| Exact deployed env values recorded in repo-accessible handoff | `known-risk` | Missing documentation makes diagnosis brittle | Can run with risk |
| Explicit record that `gz2` is currently out of the live chain | `known-risk` | Missing this causes wrong-host diagnosis during incidents | Can run with risk |

## Classification By System

### Cloudflare

- `must-have`:
  - basic public reachability for browser-like requests
- `observability-only`:
  - allow / bypass for monitoring source on `GET /` or `GET /login`

Conclusion:
Cloudflare has both functional and observability roles. As of `2026-04-08`, the
explicit custom WAF challenge on `diffaudit.vectorcontrol.tech` was disabled,
but anonymous default `curl` may still be challenged by bot heuristics.

### `hk`

- `must-have`:
  - nginx split routing to local Portal and Platform services
  - `diffaudit-portal.service`
  - `diffaudit-platform-web.service`
  - `diffaudit-local-api.service`
- `known-risk`:
  - exact config still not captured in repo-managed handoff

### `gz2`

- `known-risk`:
  - host recovery is still unresolved
  - operators must not assume it is part of the current live path

## Hard Gate Conclusion

If launching today, the team must first confirm:

1. Cloudflare still routes traffic to the public edge
2. `hk` nginx still forwards `/` and `/login` to `127.0.0.1:3011`
3. `hk` nginx still forwards workbench and `/api/v1/*` routes to
   `127.0.0.1:3000`
4. `diffaudit-portal.service` is healthy on `hk`
5. `diffaudit-platform-web.service` is healthy on `hk`
6. `diffaudit-local-api.service` is healthy on `hk`
7. shared-cookie login still produces a session accepted by the workbench

Without those confirmations, the system is not launch-ready.

## Risk-Acceptable Items

These may remain open during a same-day launch, but only if called out
explicitly:

- Cloudflare monitoring-source allow / bypass for `/` or `/login`
- repo-managed record of exact `hk` nginx config
- repo-managed record of exact `hk` service-manager details
- repo-managed record of exact deployed env values
- `gz2` recovery plan

If these remain open, the system may function, but:

- external monitoring stays weak
- incident response stays slower
- handoff remains incomplete

## Current External Confirmations Still Missing

- confirmation that Cloudflare has a monitoring-source bypass or allow rule for
  `/` or `/login`
- a durable recovery decision for `gz2`

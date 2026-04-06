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
| `hk` proxy chain to `gz2` | `must-have` | Public requests must still reach the origin host | Do not call launch ready |
| `gz2` `apps/web` runtime | `must-have` | The public shell depends on it | Do not call launch ready |
| `gz2` `apps/api-go` runtime | `must-have` | Logged-in reads and platform API flow depend on it | Do not call launch ready |
| `gz2` deployed `DIFFAUDIT_API_BASE_URL` value | `must-have` | The backend must target the intended upstream | Do not call launch ready |
| `gz2 -> Local-API` connectivity | `must-have` | Current runtime path depends on the research-facing API | Do not call launch ready |
| Tailscale connectivity from `gz2` to `100.81.149.78:8765` | `must-have` in current architecture | The live upstream currently uses the Tailscale path | Do not call launch ready |
| Cloudflare allow / bypass for monitoring source hitting `/login` | `observability-only` | Needed for stable external canarying, not for already-known user function | Can run with risk |
| Anonymous `/health` probing | `observability-only` | This route is intentionally protected | Can run with risk |
| Anonymous `/api/v1/*` probing | `observability-only` | These routes are intentionally protected | Can run with risk |
| Exact `hk` nginx config recorded in repo-accessible handoff | `known-risk` | Missing documentation slows takeover and incident response | Can run with risk |
| Exact `gz2` systemd/process names recorded in repo-accessible handoff | `known-risk` | Missing documentation slows restart and recovery | Can run with risk |
| Exact deployed env values recorded in repo-accessible handoff | `known-risk` | Missing documentation makes diagnosis brittle | Can run with risk |

## Classification By System

### Cloudflare

- `must-have`:
  - basic public reachability
- `observability-only`:
  - allow / bypass for monitoring source on `GET /login`

Conclusion:
Cloudflare has both functional and observability roles. The current unresolved
issue is the observability side, not proven application failure by itself.

### `hk`

- `must-have`:
  - proxy chain from public ingress to `gz2`
- `known-risk`:
  - exact config still not captured in repo-managed handoff

### `gz2`

- `must-have`:
  - `apps/web` runtime
  - `apps/api-go` runtime
  - correct deployed env
- `known-risk`:
  - exact service-manager details still live outside repo-managed handoff

### Tailscale

- `must-have` in the current architecture:
  - live connectivity from `gz2` to the Local-API upstream
- `known-risk`:
  - operator procedure and config are still outside repo-managed handoff

## Hard Gate Conclusion

If launching today, the team must first confirm:

1. Cloudflare still routes traffic to the public edge
2. `hk` still forwards to `gz2`
3. `gz2` is serving `apps/web`
4. `gz2` is serving `apps/api-go`
5. `gz2` deploy env still targets the intended Local-API upstream
6. `gz2` can still reach `100.81.149.78:8765`
7. Tailscale is healthy on the path from `gz2` to the Local-API host

Without those confirmations, the system is not launch-ready.

## Risk-Acceptable Items

These may remain open during a same-day launch, but only if called out
explicitly:

- Cloudflare monitoring-source allow / bypass for `/login`
- repo-managed record of exact `hk` nginx config
- repo-managed record of exact `gz2` service-manager details
- repo-managed record of exact deployed env values

If these remain open, the system may function, but:

- external monitoring stays weak
- incident response stays slower
- handoff remains incomplete

## Current External Confirmations Still Missing

- confirmation that Cloudflare has a monitoring-source bypass or allow rule for
  `/login`
- confirmation of the exact live `hk -> gz2` proxy config
- confirmation of the exact live `gz2` service names or process manager entries
- confirmation of the exact live `DIFFAUDIT_API_BASE_URL` value on `gz2`
- confirmation that the Tailscale path to `100.81.149.78:8765` is healthy right now

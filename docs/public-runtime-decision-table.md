# Public Runtime Decision Table

This document is the hard launch decision table for the current public
`DiffAudit` chain.

## Current Architecture Decision

The live architecture is:

- `Cloudflare -> hk -> gz2 nginx -> Portal/Platform/Local-API`

This is intentional because collaborators currently have `gz2` access, not `hk`
access. The operational rule is:

- `hk` should stay thin
- `gz2` should own the actual runtime details

## Decision Table

| Item | Class | Why it matters | If unconfirmed today |
| --- | --- | --- | --- |
| Cloudflare basic edge reachability | `must-have` | Public users need the domain to resolve and reach the edge at all | Do not call launch ready |
| `hk` full forwarding to `gz2` | `must-have` | The public edge must still reach the runtime host | Do not call launch ready |
| `gz2` nginx split routing | `must-have` | Route ownership now lives on `gz2` | Do not call launch ready |
| `gz2` `diffaudit-portal.service` runtime | `must-have` | The public homepage and login depend on it | Do not call launch ready |
| `gz2` `diffaudit-platform-web.service` runtime | `must-have` | Logged-in workbench reads depend on it | Do not call launch ready |
| `gz2` `diffaudit-local-api.service` runtime | `must-have` | Platform catalog and evidence reads depend on it | Do not call launch ready |
| Shared cookie contract between Portal and Platform | `must-have` | Login ownership moved to Portal; workbench auth depends on the shared cookie | Do not call launch ready |
| Browser-like public access to `/` and `/login` | `must-have` | Public users need a working homepage and login entry | Do not call launch ready |
| Monitoring-source bypass on Cloudflare | `observability-only` | Needed for stable CLI canarying | Can run with risk |
| Exact `gz2` runtime details recorded in repo docs | `known-risk` | Missing docs slow takeover and incident response | Can run with risk |

## Hard Gate Conclusion

Before calling the system ready, confirm:

1. `hk` still proxies the full site to `gz2`
2. `gz2` nginx still owns route splitting
3. Portal login on `gz2` still emits the shared session cookie
4. Platform on `gz2` still accepts that cookie
5. Local-API on `gz2` still returns catalog data

Without those confirmations, the system is not launch-ready.

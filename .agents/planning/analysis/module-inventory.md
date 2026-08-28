# Module Inventory

| Module | Responsibility | Dependencies | Files | Lines | Complexity | S.U.P.E.R Score |
|:-------|:---------------|:-------------|------:|------:|:-----------|:----------------|
| `apps/web` pages + components | Product UI: marketing, auth, workspace, reports | react 19, tailwind 4, lucide, recharts, react-hook-form, zod | ~185 tsx | ~6.5k | High | S🟢 U🟢 P🟡 E🟢 R🟡 |
| `apps/web/src/lib` | Data adapters, demo data, auth client, locale, API facade | zod, ts, go contracts | ~109 ts | ~2.9k | Medium | S🟢 U🟢 P🟢 E🟢 R🟢 |
| `apps/api-go` | Go gateway: snapshot read plane, Runtime proxy, DemoJobStore | stdlib + sqlite driver (planned) | 7 go | 3.2k | Medium | S🟢 U🟢 P🟢 E🟡 R🟢 |
| `apps/web/src/app/api/auth/*` (12 routes) | Real auth: email/password, verification, OAuth, 2FA, WebAuthn | bcryptjs, drizzle, better-sqlite3, simplewebauthn, otpauth | 12 route.ts | ~1.5k | Critical | S🟡 U🟢 P🟡 E🟡 R🟡 |
| `apps/web/src/app/api/v1/*` (12 routes) | Thin proxy to Go gateway (15s timeout) | next/server | 12 route.ts | ~0.3k | Low | S🟢 U🟢 P🟢 E🟢 R🟢 |
| `apps/web/src/app/api/demo/*` (2 routes) | Hardcoded demo data served as JSON | ts | 2 route.ts | ~0.2k | Low | S🟢 U🟢 P🟡 E🟢 R🟢 |
| `apps/web/src/proxy.ts` | Route guard + demo-mode gate + locale header | next/server | 1 ts | ~0.1k | Medium | S🟡 U🟢 P🟡 E🟢 R🟡 |
| `packages/shared` | Public contractual payloads/schemas | none | small | small | Low | S🟢 U🟢 P🟢 E🟢 R🟢 |
| Docker chain (Dockerfile/docker/start.sh) | Single merged-container image | node + go builders | 3 files | ~0.2k | High | S🟢 U🟢 P🟡 E🔴 R🟡 |
| E2E (playwright) | Smoke/user-flows/report-flow/i18n | playwright | 4 specs + fixtures | ~1k | Medium | S🟢 U🟢 P🟢 E🟢 R🟢 |

> **S.U.P.E.R Score**: S=Single-purpose, U=Unidirectional, P=Ports, E=Environment-agnostic, R=Replaceable.

## Module Details

### `apps/web` pages + components
- **Path**: `apps/web/src/app/**` + `apps/web/src/components/**`
- **Responsibility**: All product UI — marketing pages (4), auth pages (2), workspace pages (14), shared component kit (theming, form primitives, navigation shell, report views).
- **Public API**: React components consuming view models from `lib/`; no direct backend access (all through facades).
- **Internal Dependencies**: `lib/` adapters, `components/providers.tsx`, `lib/locale`.
- **External Dependencies**: react 19, tailwind 4, lucide-react, recharts, react-hook-form, zod, vaul, cmdk, sonner, react-resizable-panels, @base-ui/react, react-hook-form, embla-carousel, html2canvas, jspdf.
- **Complexity Rating**: High.
- **Transformation Notes**: Next-specific imports are few and localized — `next/font/google` (Inter, single layout), `next-themes` (3 files, reuse as-is), `next/headers` (locale from header store). Pages use `next/link`, `next/navigation` (`useRouter`, `useSearchParams`, `redirect`), and route groups `(marketing)/(auth)/(workspace)`; all need small mechanical shims (`react-router` equivalents). SEO metadata block in `layout.tsx` and `robots.ts`/`sitemap.ts` move to static files or a small plugin.
- **S.U.P.E.R Assessment**:
  - S: pages have clear single purpose per route group. Component kit is shared (acceptable), no kitchen-sink modules found.
  - U: `pages → lib → api facade` is one-directional; no circular imports observed in the import graph.
  - P: pages consume typed view models; contracts live in `lib/` (🟡: a few pages read raw fetch results via `api-proxy` instead of a facade).
  - E: no machine-local paths; env vars via `process.env.DIFFAUDIT_*` (`DIFFAUDIT_PLATFORM_URL`, `DIFFAUDIT_API_BASE_URL`, demo mode flags).
  - R: component-level replacement is straightforward; route-level replacement is coupled to Next router in ~8 call sites.

### `apps/web/src/lib` (data layer)
- **Path**: `apps/web/src/lib/*.ts`, `apps/web/src/lib/db/*`
- **Responsibility**: Data adapters and view-model assembly — `demo-snapshot.ts`, `catalog.ts`, `audit-client.ts`, `evidence-report.ts`, `risk-report.ts`, `research-boundaries.ts`, `workspace-source…` mode selection, `auth.ts` (client session logic), `db/*` (server-side schema used by Next auth routes).
- **Public API**: typed fetch/demo façade used by pages; `workspace-source` mode selection; `getWorkspaceModeState()`.
- **Internal Dependencies**: `packages/shared` types conventions only (contracts are duplicated per doc note — see `contracts/README.md`).
- **External Dependencies**: zod, ts, none server-side except in `lib/db/*`.
- **Complexity Rating**: Medium.
- **S.U.P.E.R Assessment**:
  - S: dedicated adapter per concern; `api-proxy.ts` is the single frontend→backend facade (15s timeout, retry semantics) — exactly what the S.U.P.E.R table requires.
  - U: server-bound modules (`db/`, `auth.ts` server parts, `api-proxy.ts`) are imported only by Next API routes/middleware; client modules never import them. This separation is the main asset for the SPA migration.
  - P: all payloads typed; demo/live source selection behind `workspace-source.ts`.
  - E: environment via env vars; no hardcoded hostnames.
  - R: replacing the runtime data source does not touch pages.

### `apps/api-go` (Go gateway)
- **Path**: `apps/api-go/cmd/platform-api`, `apps/api-go/internal/proxy`
- **Responsibility**: REST read plane over public snapshots; `/api/v1/audit/*` write/proxy routes to Runtime with 3x retry + cache fallback; `DemoJobStore` (6 seeded jobs, time-based state progression); `/health`.
- **Public API**: 16 routes (see overview); middleware for logging, CORS-ish headers, JSON envelope.
- **Internal Dependencies**: internal/proxy only; stdlib HTTP.
- **External Dependencies**: Go 1.26 stdlib; no ORM (will gain a SQLite driver for auth migration).
- **Complexity Rating**: Medium.
- **Transformation Notes**: stays as-is for Phase 1; becomes the auth host in Phase 2 (sessions, password, OAuth, 2FA, WebAuthn, SQLite). Will also become the static-file server (serving SPA dist) so the container no longer needs a Node runtime.
- **S.U.P.E.R Assessment**:
  - S: single gateway responsibility today; auth adds a second clean subsystem (separate package) — keep `internal/auth` isolated.
  - U: no cycles; routes read from `internal/proxy.Store` interface (demo vs snapshot behind an interface — replaceable).
  - P: JSON contracts mirror `packages/shared`; errors are envelope-structured.
  - E: `--demo-mode`, `--public-data-dir`, `--host/--port` flags; no host assumptions (🟡: snapshot paths currently constructed from `DIFFAUDIT_PUBLIC_DATA_DIR` env).
  - R: `Store` interface makes demo/live swap trivial; Runtime client behind interface with retry.

### Next API auth routes (12)
- **Path**: `apps/web/src/app/api/auth/*`, `apps/web/src/lib/auth.ts`, `apps/web/src/lib/db/*`
- **Responsibility**: Full auth stack — email/password register+login (bcryptjs), email verification tokens, GitHub/Google OAuth (callback flows), TOTP 2FA (`otpauth` + recovery codes), WebAuthn passkeys (`@simplewebauthn/server`), session cookie issuance/rotation, `/me` profile.
- **Internal Dependencies**: `lib/db/*` (drizzle over better-sqlite3), `lib/auth.ts`.
- **External Dependencies**: bcryptjs, drizzle-orm + better-sqlite3, @simplewebauthn/server, otpauth, qrcode, undici.
- **Complexity Rating**: Critical.
- **Transformation Notes**: The largest single migration block. Go equivalents must cover: bcrypt (`golang.org/x/crypto/bcrypt` — drop-in), sessions (crypto/rand token + SQLite), TOTP (`github.com/pquerna/otp` — drop-in), OAuth (stdlib oauth2 + provider endpoints — Google/GitHub), WebAuthn (`github.com/go-webauthn/webauthn` — drop-in for verify), email verification tokens (hash + expiry), SQLite (modernc.org/sqlite or mattn/go-sqlite3, pure-Go preferred for the static binary). Schema is 6 tables — direct port from `schema.ts` with same column names so a DB migrated by the existing node path stays readable.
- **S.U.P.E.R Assessment**:
  - S: auth as one subsystem is fine, but it lives inside the web app today (framework-bound) — the biggest S violation: it should be a product concern, not a framework concern.
  - U: routes → lib/auth → db, one-way.
  - P: JSON contracts exist for all routes (zod-validated) — port to Go structs.
  - E: env-driven (OAuth client IDs/secret via env; no hardcoded providers), but tightly coupled to Next cookies/headers semantics.
  - R: not replaceable as today — a full rewrite into `apps/api-go` makes auth a standalone package testable without a web server.

### Next API demo/v1 proxy routes
- **Path**: `apps/web/src/app/api/demo/*`, `apps/web/src/app/api/v1/*`
- **Responsibility**: demo routes serve hardcoded TS demo payloads (`demo-jobs-store.ts`); v1 routes are one-line `proxyToBackend` passthroughs to the Go gateway.
- **Complexity Rating**: Low.
- **Transformation Notes**: In the SPA these disappear wholesale — demo data is imported client-side (modules already exist and are used by lib), v1 calls go direct to the Go gateway with a `DIFFAUDIT_API_BASE_URL`. The Go gateway accepts the same JSON shapes, so API parity is preserved. Demo gating (`platform-demo-mode` cookie) moves to the lib layer + an optional runtime guard in Go.
- **S.U.P.E.R Assessment**: S🟢 U🟢 P🟢 E🟢 R🟢 — the cleanest module in the codebase; delete-first.

### `apps/web/src/proxy.ts` (middleware)
- **Responsibility**: route protection for `/workspace/**` and `/api/v1/**`, demo-mode bypass, `x-platform-locale` header injection.
- **Transformation Notes**: In the SPA, route guard runs client-side (demo mode always bypass today); the locale header/cookie logic moves to the Go auth middleware + client `fetch` wrapper. Behavior must match: protected routes redirect to `/login?redirectTo=…`, API returns 401 JSON. A server-side guard (Go middleware) should still protect `/api/v1/*` for live mode; workspace page guard is client-side in SPA.
- **S.U.P.E.R Assessment**: S🟡 (two responsibilities: guard + locale), U🟢, P🟡, E🟢, R🟡 — replaced by two thin layers (SPA route guard + Go middleware).

### Docker chain
- **Path**: `Dockerfile`, `docker/start.sh`, `deploy/**`
- **Responsibility**: multi-stage build producing a single container running Go API + Next standalone server via tini; start.sh traps SIGTERM.
- **Transformation Notes**: Root cause of the current incident — `COPY .next/static ./.next/static` and `COPY public ./public` target paths don't match the standalone distribution layout (`/app/apps/web/**`), leaving the Next file-system router's static index empty at startup. In the rebuild: static SPA `dist/` is embedded via `embed.FS` in the Go binary (or copied to `/app/www`), `start.sh` is deleted, and the container runs one process. OCI labels/provenance keep the same conventions.
- **S.U.P.E.R Assessment**: E🔴 (layout coupling) is the violation this incident exposed; the target build removes the whole class of failure by removing Node/Next from the runtime.

### E2E suite
- **Path**: `apps/web/e2e/*`, `playwright.config.ts`
- **Responsibility**: smoke, user-flows, report-flow, i18n-navigation against the dev server.
- **Transformation Notes**: retarget `webServer` config from `next dev`/`next start` to `vite preview` (or the Go gateway with embedded static). Fixtures and selectors stay valid — tests assert on DOM, not on Next internals.
- **S.U.P.E.R Assessment**: S🟢 U🟢 P🟢 E🟢 R🟢 — config-only retarget.

"""Create spec-driven task issues for the DiffAudit Platform Next.js removal.

One-shot helper: reads the task table below and creates one GitHub Issue per
task via the `gh` CLI. stdlib only.
"""

import subprocess
import time

REPO = "DeliciousBuding/DiffAudit-Platform"

TASKS = [
    {
        "id": "T1.1",
        "name": "Vite + React SPA scaffold and route skeleton",
        "phase": 1,
        "priority": "P0",
        "size": "M",
        "lane": "A",
        "batch": "B1",
        "super": "S U P E R",
        "test": "New route-table smoke test; existing page component tests runnable under new config",
        "memory": "AGENTS.md build commands updated (Phase 3 aggregate)",
        "desc": (
            "Introduce Vite 7 + React 19 + TypeScript. Migrate app/layout.tsx "
            "(Inter via @fontsource/inter, ThemeProvider, JsonLd, RouteRecovery). "
            "React Router v7 route table mirroring all 20 existing paths. Keep "
            "globals.css, Tailwind 4 config, `@` alias compatible. Remove Next-only "
            "config (next.config.ts, next-env.d.ts)."
        ),
        "accept": [
            "npm run build:web produces dist/",
            "vite preview serves all 20 routes incl. 404",
            "check:fast passes",
        ],
        "files": ["apps/web/vite.config.ts", "apps/web/src/main.tsx", "apps/web/src/router.tsx", "apps/web/index.html", "apps/web/package.json"],
        "deps": "None",
    },
    {
        "id": "T1.2",
        "name": "Static SEO (robots/sitemap/og/metadata)",
        "phase": 1,
        "priority": "P2",
        "size": "S",
        "lane": "A",
        "batch": "B1",
        "super": "P E",
        "test": "Vitest existence checks for robots.txt / sitemap.xml",
        "memory": "None",
        "desc": (
            "Move robots.ts / sitemap.ts / metadata (og, twitter, icon) to static "
            "robots.txt, sitemap.xml and index.html head template. Keep og images "
            "in /brand/. Docs route stays /docs and /docs/[...slug]."
        ),
        "accept": [
            "Preview serves /robots.txt and /sitemap.xml with correct content",
            "Home page head includes title/description/og tags",
        ],
        "files": ["apps/web/public/robots.txt", "apps/web/public/sitemap.xml", "apps/web/index.html"],
        "deps": "T1.1",
    },
    {
        "id": "T1.3",
        "name": "Data layer de-Next-ification",
        "phase": 1,
        "priority": "P0",
        "size": "L",
        "lane": "A",
        "batch": "B1",
        "super": "P U",
        "test": "Demo contract snapshot test + api-proxy unit tests reworked",
        "memory": "DESIGN.md facade rules updated",
        "desc": (
            "api-proxy.ts becomes browser fetch straight to the Go gateway "
            "(DIFFAUDIT_API_BASE_URL or same-origin); demo modules become client "
            "imports (demo-jobs-store/demo-snapshot); workspace-source.ts stays the "
            "single mode selector; locale.ts is client-cookie based; delete Next API "
            "demo and v1 proxy routes while preserving x-platform-locale behavior."
        ),
        "accept": [
            "Demo mode payloads match pre-refactor JSON shape (snapshot test)",
            "/api/v1/* direct calls keep 401/200 semantics",
        ],
        "files": ["apps/web/src/lib/api-proxy.ts", "apps/web/src/lib/demo-snapshot.ts", "apps/web/src/lib/workspace-source.ts", "apps/web/src/lib/locale.ts"],
        "deps": "T1.1",
    },
    {
        "id": "T1.4",
        "name": "Route guard migration (RouteGuard + login redirect + legacy)",
        "phase": 1,
        "priority": "P0",
        "size": "M",
        "lane": "A",
        "batch": "B1",
        "super": "S U",
        "test": "RouteGuard unit tests + existing legacy route tests migrated",
        "memory": "None",
        "desc": (
            "Move proxy.ts guard logic to SPA RouteGuard: demo mode bypass; non-demo "
            "unauthenticated /workspace/** redirects to /login?redirectTo=...; "
            "legacy-routes.ts table moves into React Router; x-platform-locale cookie "
            "logic client-side."
        ),
        "accept": [
            "Demo mode: no auth gate anywhere",
            "Non-demo: /workspace redirects to login preserving redirectTo",
            "Legacy paths keep original redirect behavior",
        ],
        "files": ["apps/web/src/components/route-guard.tsx", "apps/web/src/lib/legacy-routes.ts", "apps/web/src/proxy.ts"],
        "deps": "T1.3",
    },
    {
        "id": "T1.5",
        "name": "Pages & components migration (20 routes + Next shims)",
        "phase": 1,
        "priority": "P0",
        "size": "XL",
        "lane": "A",
        "batch": "B1",
        "super": "U P R",
        "test": "All page component tests pass under new router; e2e retarget separate (T3.4)",
        "memory": "None",
        "desc": (
            "Migrate all 20 route pages and 185 tsx components. Next shims: "
            "next/link to React Router Link, useRouter to useNavigate, "
            "useSearchParams, redirect/notFound. Delete (auth)/(marketing)/(workspace) "
            "route groups and app/api/** Next routes. Keep next-themes."
        ),
        "accept": [
            "All pages render under React Router",
            "Workspace flows work end-to-end in demo mode",
            "app/api/** removed cleanly",
        ],
        "files": ["apps/web/src/**"],
        "deps": "T1.4",
    },
    {
        "id": "T2.1",
        "name": "Go SQLite schema 1:1 + migrate",
        "phase": 2,
        "priority": "P0",
        "size": "M",
        "lane": "B",
        "batch": "B2",
        "super": "P E",
        "test": "Migrate unit tests (fresh DB and existing DB)",
        "memory": "AGENTS.md auth package documented",
        "desc": (
            "internal/auth package with modernc.org/sqlite (pure Go). Six tables "
            "(users/sessions/oauth_accounts/email_verification_tokens/passkeys/"
            "two_factor_settings) matching the drizzle schema 1:1 (same column names). "
            "Startup migrate with IF NOT EXISTS so the existing diffaudit.db mounts "
            "unchanged."
        ),
        "accept": [
            "Startup against existing DB succeeds without schema errors",
            "Column names/types match drizzle definitions (comparison test)",
        ],
        "files": ["apps/api-go/internal/auth/schema.go", "apps/api-go/internal/auth/migrate.go"],
        "deps": "None",
    },
    {
        "id": "T2.2",
        "name": "Session/cookie middleware + /me + /logout",
        "phase": 2,
        "priority": "P0",
        "size": "M",
        "lane": "B",
        "batch": "B2",
        "super": "S P",
        "test": "Go httptest: login -> /me returns user; logout invalidates; 401 without cookie",
        "memory": "None",
        "desc": (
            "diffaudit_session cookie (HttpOnly/SameSite=Lax/Secure per env). "
            "GET /api/auth/me, POST /api/auth/logout. Middleware guards /api/v1/* with "
            "401 JSON 'Authentication required.'; demo mode bypass matching proxy.ts "
            "env+cookie semantics; preserve x-platform-locale passthrough."
        ),
        "accept": [
            "/me returns the user after login",
            "No-cookie /api/v1/* returns 401 with exact message",
            "Demo mode bypass verified",
        ],
        "files": ["apps/api-go/internal/auth/session.go", "apps/api-go/internal/auth/middleware.go", "apps/api-go/internal/proxy/server.go"],
        "deps": "T2.1",
    },
    {
        "id": "T2.3",
        "name": "Password register/login/email verification to Go",
        "phase": 2,
        "priority": "P0",
        "size": "L",
        "lane": "B",
        "batch": "B2",
        "super": "P E",
        "test": "Go unit tests: register/login/verify/resend/error paths",
        "memory": "None",
        "desc": (
            "Port /api/auth/register, /api/auth/login, /api/auth/password, "
            "/api/auth/email, /api/auth/email-verification, /api/auth/verify-email. "
            "bcrypt via golang.org/x/crypto/bcrypt (compatible with existing hashes). "
            "Verification token hashed + expiry. Zod validation rules translated to Go "
            "with identical messages."
        ),
        "accept": [
            "Responses match Next behavior (fields/errors/status codes)",
            "Existing bcrypt hashes log in without rehash",
        ],
        "files": ["apps/api-go/internal/auth/", "apps/web/src/app/api/auth/**"],
        "deps": "T2.2",
    },
    {
        "id": "T2.4",
        "name": "TOTP 2FA + recovery codes to Go",
        "phase": 2,
        "priority": "P1",
        "size": "M",
        "lane": "B",
        "batch": "B2",
        "super": "P",
        "test": "Go unit tests: TOTP clock and recovery code consumption",
        "memory": "None",
        "desc": (
            "pquerna/otp TOTP; /api/auth/two-factor enable/disable/verify; recovery "
            "code generation and consumption; login challenge flow matches Next "
            "semantics; QR generation via data URL or client."
        ),
        "accept": [
            "Enabling 2FA requires TOTP at login",
            "Recovery codes work and are single-use",
        ],
        "files": ["apps/api-go/internal/auth/totp.go"],
        "deps": "T2.3",
    },
    {
        "id": "T2.5",
        "name": "WebAuthn passkeys to Go",
        "phase": 2,
        "priority": "P1",
        "size": "L",
        "lane": "B",
        "batch": "B2",
        "super": "P",
        "test": "Go unit tests: challenge generate/verify with mocked credentials",
        "memory": "None",
        "desc": (
            "github.com/go-webauthn/webauthn registration/authentication endpoints. "
            "Counter/backup semantics matching @simplewebauthn/server. Multi-step "
            "challenge semantics preserved in login flow."
        ),
        "accept": [
            "Registration followed by successful authentication",
            "Existing passkey table metadata compatible",
        ],
        "files": ["apps/api-go/internal/auth/webauthn.go"],
        "deps": "T2.3",
    },
    {
        "id": "T2.6",
        "name": "GitHub/Google OAuth to Go",
        "phase": 2,
        "priority": "P1",
        "size": "L",
        "lane": "B",
        "batch": "B2",
        "super": "P E",
        "test": "Go unit tests with mocked provider endpoints",
        "memory": "None",
        "desc": (
            "golang.org/x/oauth2; /api/auth/github(+callback) and /api/auth/google"
            "(+callback); oauth_accounts linking; env keys GITHUB_CLIENT_ID/SECRET, "
            "GOOGLE_CLIENT_ID/SECRET and DIFFAUDIT_OAUTH_PROXY_URL semantics unchanged; "
            "no local-loopback config leaks."
        ),
        "accept": [
            "Callback flow issues session",
            "Account linking works for new and existing users",
        ],
        "files": ["apps/api-go/internal/auth/oauth.go"],
        "deps": "T2.3",
    },
    {
        "id": "T2.7",
        "name": "Auth contract tests + existing DB compatibility",
        "phase": 2,
        "priority": "P0",
        "size": "M",
        "lane": "B",
        "batch": "B2",
        "super": "P",
        "test": "This task IS the test suite",
        "memory": "None",
        "desc": (
            "Full httptest integration suite across all auth routes. Contract baseline "
            "= current Next behavior (zod error messages/status codes/fields). Smoke "
            "with an existing diffaudit.db copy (users/sessions readable)."
        ),
        "accept": [
            "go test ./... green",
            "Existing DB smoke passes",
        ],
        "files": ["apps/api-go/internal/auth/*_test.go"],
        "deps": "T2.4, T2.5, T2.6",
    },
    {
        "id": "T3.1",
        "name": "Dockerfile rebuild (Go single binary + embed)",
        "phase": 3,
        "priority": "P0",
        "size": "M",
        "lane": "C",
        "batch": "B3",
        "super": "E R",
        "test": "verify_image_provenance.py passes",
        "memory": "deploy/README.md updated",
        "desc": (
            "Remove node/tini/start.sh. Build Go binary embedding SPA dist, then "
            "Alpine single-binary image. OCI labels/provenance preserved. Multi-arch "
            "parameters unchanged."
        ),
        "accept": [
            "docker build succeeds",
            "Image has no node/node_modules",
            "docker run starts service directly (no script)",
        ],
        "files": ["Dockerfile", "docker/", "apps/web/src/lib/webassets/"],
        "deps": "T1.5, T2.7",
    },
    {
        "id": "T3.2",
        "name": "Go static serving + SPA fallback",
        "phase": 3,
        "priority": "P0",
        "size": "M",
        "lane": "C",
        "batch": "B3",
        "super": "S U",
        "test": "Go unit tests for fallback routing",
        "memory": "None",
        "desc": (
            "embed.FS provides the SPA dist. /health and /api/* handled first; "
            "index.html fallback for non-/api unknown paths; gzip; "
            "DIFFAUDIT_PUBLIC_DATA_DIR data plane unchanged."
        ),
        "accept": [
            "Container curl / and /workspace return index (200)",
            "/api/v1/catalog returns 200",
            "Unknown /api returns JSON 404",
        ],
        "files": ["apps/api-go/internal/server/static.go"],
        "deps": "T3.1",
    },
    {
        "id": "T3.3",
        "name": "Vitest full green + demo contract tests",
        "phase": 3,
        "priority": "P0",
        "size": "M",
        "lane": "C",
        "batch": "B3",
        "super": "P",
        "test": "This task IS the test suite",
        "memory": "None",
        "desc": (
            "Migrate vitest config to Vite environment; full unit suite green with "
            "zero skips; demo contract snapshot tests landed."
        ),
        "accept": ["npm run test:web green"],
        "files": ["apps/web/vitest.config.ts"],
        "deps": "T1.5",
    },
    {
        "id": "T3.4",
        "name": "E2E retarget and run green",
        "phase": 3,
        "priority": "P1",
        "size": "M",
        "lane": "C",
        "batch": "B3",
        "super": "P",
        "test": "This task IS the test suite",
        "memory": "None",
        "desc": (
            "Playwright webServer retarget to vite preview + Go gateway (or combined). "
            "Fix selector-level diffs in smoke/user-flows/report-flow/i18n-navigation."
        ),
        "accept": ["npm run test:e2e green"],
        "files": ["apps/web/playwright.config.ts", "apps/web/e2e/**"],
        "deps": "T3.2, T3.3",
    },
    {
        "id": "T3.5",
        "name": "Local check chain + governance docs",
        "phase": 3,
        "priority": "P1",
        "size": "S",
        "lane": "C",
        "batch": "B3",
        "super": "E",
        "test": "N/A — docs/script changes with explicit rationale",
        "memory": "AGENTS.md, DESIGN.md, project-structure.md, CONTRIBUTING.md updated",
        "desc": (
            "run_local_checks.py drops Next checks and adds Vite/Go checks; "
            "check_public_boundary.py covers new files; update AGENTS.md (architecture "
            "matrix/build commands), apps/web/DESIGN.md (routes/components), "
            "docs/project-structure.md (web layout), deploy/README.md (new image "
            "shape), CONTRIBUTING.md."
        ),
        "accept": ["npm run check:all green", "No broken doc links"],
        "files": ["scripts/", "AGENTS.md", "apps/web/DESIGN.md", "docs/project-structure.md", "deploy/README.md", "CONTRIBUTING.md"],
        "deps": "T3.3, T3.4",
    },
    {
        "id": "T4.1",
        "name": "Image build and publish",
        "phase": 4,
        "priority": "P0",
        "size": "M",
        "lane": "D",
        "batch": "B4",
        "super": "R",
        "test": "verify_image_provenance.py passes",
        "memory": "None",
        "desc": (
            "Build sha-<short-sha> immutable tag + main tag; push to GHCR; provenance "
            "verification. Keep previous tags as rollback anchor."
        ),
        "accept": [
            "New tag visible in GHCR",
            "verify_image_provenance.py passes",
        ],
        "files": ["deploy/", "scripts/"],
        "deps": "T3.5",
    },
    {
        "id": "T4.2",
        "name": "Production compose upgrade and deploy",
        "phase": 4,
        "priority": "P0",
        "size": "M",
        "lane": "D",
        "batch": "B4",
        "super": "E",
        "test": "e2e smoke subset after deploy",
        "memory": "Project STATE updated",
        "desc": (
            "Compose update (single service, drop Node port mapping, env/volumes "
            "unchanged); pull new image; start container; data volume/db not recreated."
        ),
        "accept": [
            "Container healthy",
            "/health 200",
            "Static assets 200 (no 404 regression)",
        ],
        "files": ["deploy/compose.yml"],
        "deps": "T4.1",
    },
    {
        "id": "T4.3",
        "name": "Post-deploy verification, rollback anchor, STATE/LOG writeback",
        "phase": 4,
        "priority": "P0",
        "size": "S",
        "lane": "D",
        "batch": "B4",
        "super": "R",
        "test": "Smoke script",
        "memory": "Project STATE + ops log updated",
        "desc": (
            "Full-chain verification (public ingress, static, demo API, auth smoke). "
            "Rollback anchor = previous image tags recorded. Production facts written "
            "back to project STATE and ops log."
        ),
        "accept": [
            "Public smoke all green",
            "Rollback commands recorded in STATE",
        ],
        "files": ["deploy/README.md"],
        "deps": "T4.2",
    },
]


def build_body(t: dict) -> str:
    accept = "\n".join(f"- [ ] {a}" for a in t["accept"])
    files = "\n".join(f"- `{f}`" for f in t["files"])
    return (
        f"## Task: {t['id']} — {t['name']}\n\n"
        f"**Phase**: {t['phase']} — {PHASE_NAMES[t['phase']]}\n"
        f"**Priority**: {t['priority']} | **Size**: {t['size']} | **Lane**: {t['lane']}\n"
        f"**Delivery Batch**: {t['batch']}\n"
        f"**S.U.P.E.R Drivers**: {t['super']}\n"
        f"**Test Expectation**: {t['test']}\n"
        f"**Memory/Governance Impact**: {t['memory']}\n\n"
        f"### Description\n{t['desc']}\n\n"
        f"### Acceptance Criteria\n{accept}\n"
        f"- [ ] Passes S.U.P.E.R Quick Check for: {t['super']}\n"
        f"- [ ] Satisfies test expectation: {t['test']}\n"
        f"- [ ] Updates the resolved memory or instruction surfaces if durable project knowledge or agent instructions changed\n\n"
        f"### Affected Files\n{files}\n\n"
        f"### Dependencies\n- Depends on: {t['deps']}\n\n"
        f"---\n_Managed by Spec-Driven Develop workflow_"
    )


PHASE_NAMES = {
    1: "SPA migration",
    2: "Auth to Go",
    3: "Build chain",
    4: "Release",
}

if __name__ == "__main__":
    created = []
    for task in TASKS:
        title = f"[{task['id']}] {task['name']}"
        body = build_body(task)
        labels = (
            f"spec-driven,priority:{task['priority']},size:{task['size']},"
            f"phase:{task['phase']},lane:{task['lane']}"
        )
        milestone = f"Phase {task['phase']}: {PHASE_NAMES[task['phase']]}"
        cmd = [
            "gh", "issue", "create", "--repo", REPO,
            "--title", title,
            "--body", body,
            "--label", labels,
            "--milestone", milestone,
        ]
        result = subprocess.run(cmd, capture_output=True, text=True)
        url = result.stdout.strip()
        if result.returncode != 0:
            print(f"FAILED {task['id']}: {result.stderr.strip()[:200]}")
        else:
            print(f"{task['id']}: {url}")
            created.append((task["id"], url))
        time.sleep(1)
    print(f"\nCreated {len(created)}/{len(TASKS)} issues")

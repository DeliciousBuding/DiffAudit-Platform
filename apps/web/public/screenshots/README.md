# Workspace Audits Screenshots

| File | Description |
| --- | --- |
| `audits-recommended-running.png` | `/workspace/audits` showing the recommended contracts column paired with the existing running jobs grid. |
| `audits-running-job.png` | Same page immediately after `Create job` reports success; the newly queued job and updated running jobs list are visible. |

## Repro steps

1. Start the Local API runtime:
   ```powershell
   .\Services\Local-API\run-local-api.ps1 -WorkspaceRoot D:\Code\DiffAudit
   ```
2. Bring up the platform proxies:
   - `npm run dev:api` (from `D:\Code\DiffAudit\Platform`) to forward `/api/v1/*` to `127.0.0.1:8765`.
   - `npm run dev:web` to launch the Next.js server on `localhost:3000`.
3. Obtain an authenticated session cookie (e.g., via `POST http://localhost:3000/api/auth/login` with the test credentials) and copy the `diffaudit_session` value.
4. Run the capture helper (it uses Playwright and the cookie from step 3):
   ```cmd
   cd Platform\apps\web
   set DIFFAUDIT_SESSION=<cookie-from-step-3>
   python scripts\capture_audit_screenshots.py
   ```
   The script writes the PNGs under `public/screenshots`.

The assets stay in-platform (`apps/web/public/screenshots`) and can be refreshed whenever the `/workspace/audits` surface changes.

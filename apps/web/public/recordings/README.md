# Workspace Audits Recording

| File | Description |
| --- | --- |
| `audits-demo.webm` | Playwright-recorded clip showing `/workspace/audits`, the recommended contracts list, and the Create job flow with the running jobs grid refresh. |

## Repro steps

1. Ensure the Local API runtime is available:
   ```powershell
   .\Services\Local-API\run-local-api.ps1 -WorkspaceRoot D:\Code\DiffAudit
   ```
2. Start the Platform proxies from `D:\Code\DiffAudit\Platform`:
   - `npm run dev:api` (routes `/api/v1/*` to the Local API)
   - `npm run dev:web` (serves Next.js on `http://localhost:3000`)
3. Authenticate and copy a `diffaudit_session` cookie value (e.g., via `POST http://localhost:3000/api/auth/login` with the recording credentials).
4. Run the recording helper:
   ```cmd
   cd Platform\apps\web
   set DIFFAUDIT_SESSION=<cookie-value>
   python scripts\capture_audit_recording.py
   ```
   The script records the Playwright session and writes `audits-demo.webm` to this directory. Replace the cookie and rerun if the recording needs refreshing.

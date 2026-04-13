# Workspace Audits recording prep (2026-04-14)

This checklist captures the exact startup, login, and navigation sequence that we rely on when recording or re‑shooting the `/workspace/audits` demo. Follow it step-by-step so the recorded footage always shows the same UI states without touching any copy or visuals.

## 1. Startup order

1. Launch the Local API service so the `/api/v1/*` proxy endpoints are backed by a predictable runtime:
   ```powershell
   .\Services\Local-API\run-local-api.ps1 -WorkspaceRoot D:\Code\DiffAudit
   ```
   Keep this window open; the service listens on `127.0.0.1:8765`.
2. In a separate shell rooted at `D:\Code\DiffAudit\Platform`, start the api proxy and the web server:
   ```powershell
   npm run dev:api        # keeps /api/v1/* routed to Local API
   npm run dev:web        # hosts the Next.js app on http://localhost:3000
   ```
   Start the proxy first so any page refresh immediately finds the backend.

## 2. Authentication and login

1. Use the `/api/auth/register`/`/api/auth/login` pairs to seed `diffaudit_session` before touching `/workspace` routes:
   ```http
   POST http://localhost:3000/api/auth/register
   {
     "username": "recording",
     "email": "recording@example.com",
     "password": "Config!234"
   }
   ```
   ```http
   POST http://localhost:3000/api/auth/login
   {
     "username": "recording",
     "password": "Config!234"
   }
   ```
2. Capture the `diffaudit_session` cookie that the login call returns and keep it handy for both manual exploration and scripted screenshot capture.

## 3. Page navigation & state preparation

1. Open `http://localhost:3000/workspace/audits` in the browser that you will record.
2. Wait until the recommended contracts column and the running jobs grid both render (they fetch catalog + `/api/v1/audit/jobs` before painting).
3. If the running jobs list is empty, rerun the Local API `curl` sequence documented in `Services/Local-API/LOCAL-INTEGRATION.md` to queue a job template so the grid always shows an active record.
4. Click `Create job` on one of the recommended contract cards and hold the success toast in frame long enough for the new job to appear in the `running jobs` grid.
5. Optionally, rerun `curl` against `/api/v1/audit/jobs` to show the backend’s JSON response before zooming back into the UI.

## 4. Screenshot & recording commands

1. Screenshot script (use the same session cookie from step 2):
   ```cmd
   cd Platform\apps\web
   set DIFFAUDIT_SESSION=<cookie-value>
   python scripts\capture_audit_screenshots.py
   ```
   The helper writes `audits-recommended-running.png` and `audits-running-job.png` under `apps/web/public/screenshots`. Review the lookup table in `apps/web/public/screenshots/README.md` before regenerating assets so the flow description and filenames stay in sync.
2. Playwright recording helper:
   ```cmd
   cd Platform\apps\web
   set DIFFAUDIT_SESSION=<cookie-value>
   python scripts\capture_audit_recording.py
   ```
   This script replays the same `/workspace/audits` clicks that the screenshot helper uses while recording the Chromium tab to `public/recordings/audits-demo.webm`. The README inside `public/recordings` explains the output and how to rerun the helper if the UI changes.
3. Screen recording (choose your tool but follow this checklist):
   - Start recording after the `/workspace/audits` page is fully hydrated.
   - Capture the recommended-contract column, then pan to the running jobs grid, and finally click `Create job` (do not edit any copy).
   - Keep the Local API and Next.js server windows visible if you want to prove the backend is healthy.
   - Suggested ffmpeg command for Windows (adjust resolution/title as needed):
     ```cmd
     ffmpeg -f gdigrab -framerate 30 -i desktop -video_size 1280x720 -y recordings/audits-demo.mp4
     ```
   - Stop the recording once the grid shows the new queued job and the success toast disappears.

## 5. Re-run checklist

Before submitting a recording or new screenshot, repeat steps 1–4 in the same order. This guarantees that anyone replaying the demo sees the same backend calls, authentication pattern, and UI states.

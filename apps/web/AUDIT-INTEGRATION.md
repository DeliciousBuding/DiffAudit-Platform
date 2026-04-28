# Audit Integration Notes

This note describes the public-safe audit flow exercised by the workspace.

## Flow Summary

- The audits page fetches catalog, evidence, and job state before rendering.
- Each recommended contract card can request a job template and submit a job.
- The running jobs section renders `GET /api/v1/audit/jobs`.
- In demo mode, the app can show realistic job state without a live Runtime service.

## Local Verification

1. Start the Go gateway:

   ```powershell
   npm run dev:api
   ```

2. Start the web app:

   ```powershell
   npm run dev:web
   ```

3. Open `http://localhost:3000/workspace/audits`.
4. Sign in with a local test account or use the configured demo path.
5. Create a job from a recommended contract and confirm that the running jobs view updates.

When a real Runtime service is configured, the gateway forwards job-template and job-submission calls unchanged. Without Runtime, demo mode should remain usable and should not break the workspace.

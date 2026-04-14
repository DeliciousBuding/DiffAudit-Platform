# Audits-page integration note (2026-04-14)

This file captures what we verified for the `WorkspaceAuditsPage` -> `CreateJobButton` flow so that Platform owners can repeat the same smoke test whenever they touch the audits surface.

## Flow summary

- `WorkspaceAuditsPage` fetches the catalog, the attack/defense table, and the current audit jobs before rendering the UI.
- Each recommended contract card instantiates `CreateJobButton`, which calls `submitAuditJob` from `components/create-job-button.tsx`.
- `submitAuditJob` performs two sequential HTTP calls:
  1. `GET /api/v1/audit/job-template?contract_key=<contract>` to bootstrap a valid job body for the selected contract.
  2. `POST /api/v1/audit/jobs` with that template, expecting an immediate `job_id` and `status`.
- The cards do not hydrate any inputs beyond the template shape, so the backend must still return the correct payload shape for every live contract (black-box/gray-box/white-box).
- The `running jobs` section simply renders the array returned by `GET /api/v1/audit/jobs`.

## Local verification steps

1.  Bring up the Local API service; see `Services/Local-API/LOCAL-INTEGRATION.md` for the exact command and the `job-template -> create job -> jobs` commands we executed on 2026-04-14.
2.  Start the Next.js dev server in `Platform/apps/web` via `npm run dev`.
3.  Open `http://localhost:3000/workspace/audits`, click the `Create job` button on any recommended contract, and observe the success message (it mirrors the `job_id` recorded by Local API).
4.  Alternatively, rerun the CLI commands from step 1 so you can confirm that a new job appears in the `/api/v1/audit/jobs` response; that response is exactly what the `running jobs` cards consume.

## Local dev prerequisites for workspace/audits

1.  Register/login so that the Next.js middleware can set `diffaudit_session` before any `/workspace` or `/api/v1` call:
   - `POST http://localhost:3000/api/auth/register` (body: `username`, `email`, `password`).
    - `POST http://localhost:3000/api/auth/login` (body: `username`, `password`).
    - The backend responds with `diffaudit_session` cookie, which the browser needs for `/workspace` or `/api/v1/*` access.
2.  Start the Local API dev proxy: `npm run dev:api` (defaults to `http://127.0.0.1:8780` talking to `http://127.0.0.1:8765`).
    - The `/api/v1/*` proxy routes in `Platform/apps/web` (see `src/lib/api-proxy.ts`) expect the Local API service to be reachable before `GET /api/v1/audit/job-template` or `POST /api/v1/audit/jobs` succeed.
    - Without `npm run dev:api`, the web dev server responds with `500 fetch failed` even when a valid session cookie is present.
3.  Open `http://localhost:3000/workspace/audits`, confirm the `running jobs` grid populates, and use `Create job` to fire off `audit/job-template` and `/audit/jobs` in sequence.

These steps fully exercise the workspace/audits demo path without touching UI copy or layout and keep the Platform/Services boundary intact.
This note can live alongside the code so that any future tweaks to `CreateJobButton` or the audits page remember to keep this chain intact.

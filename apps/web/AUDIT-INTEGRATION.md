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

This note can live alongside the code so that any future tweaks to `CreateJobButton` or the audits page remember to keep this chain intact.

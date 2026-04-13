# Agent Clone Prompt

Copy and send this to an agent:

```text
Clone the repo `https://github.com/DeliciousBuding/DiffAudit-Platform.git` if you have access.

Then:
1. Read the root README.
2. Treat this as a platform shell repo, not the research repo.
3. Frontend lives in `apps/web` (Next.js).
4. Active backend lives in `apps/api-go` (Go gateway).
5. Shared contracts live in `packages/shared`.
6. Assume you only have `Platform` repo visibility unless the user explicitly provides private upstream context.
7. Do not reimplement research algorithms here. Integrate with upstream services through thin contracts.
8. Before changing architecture, read `docs/architecture.md`.
9. Keep the first runnable path focused on `Stable Diffusion + DDIM recon`.
```

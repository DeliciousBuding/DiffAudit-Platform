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
6. Do not reimplement research algorithms here. Integrate with upstream services through thin contracts.
7. Before changing architecture, read `docs/architecture.md`.
8. Keep the first runnable path focused on `Stable Diffusion + DDIM recon`.
```

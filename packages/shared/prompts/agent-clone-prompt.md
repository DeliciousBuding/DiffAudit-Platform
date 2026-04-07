# Agent Clone Prompt

Copy and send this to an agent:

```text
Clone the public repo `https://github.com/DeliciousBuding/DiffAudit-Platform.git`.

Then:
1. Read the root README.
2. Treat this as a platform shell repo, not the research repo.
3. Frontend lives in `apps/web` (Next.js).
4. Active backend lives in `apps/api-go` (Go gateway).
5. Shared contracts live in `packages/shared`.
6. `apps/api` is a legacy FastAPI stub, not the active runtime path.
7. Do not reimplement research algorithms here. Integrate with the research repo via a thin wrapper.
8. Before changing architecture, read `docs/architecture.md`.
9. Keep the first runnable path focused on `Stable Diffusion + DDIM recon`.
```

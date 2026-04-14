# Draft sync note — 2026-04-14

1. Start `npm run dev:api` before `npm run dev:web` so the Go API proxy can resolve `/api/v1/*` routes before the Next.js dev server begins issuing requests; otherwise the front end will briefly hit an unavailable backend.
2. The submission package should ship `Platform/docs/recording-assets-status.md`, `public/recordings/audits-demo.webm`, and the related manifest/README together so the Leader can point 4C 审核组 to exactly which asset covers which demo step.

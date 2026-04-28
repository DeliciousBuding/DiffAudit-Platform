# DiffAudit Web App

`apps/web` is the Next.js product surface for DiffAudit Platform.

## Local Development

Install dependencies from the repository root:

```powershell
npm --prefix apps/web install
```

Start the web app:

```powershell
npm --prefix apps/web run dev
```

The default local URL is `http://localhost:3000`.

## Useful Commands

```powershell
npm --prefix apps/web run lint
npm --prefix apps/web run test
npm --prefix apps/web run build
```

## Configuration

Use untracked environment files for local values. The root `.env.example` lists the supported variables.

OAuth provider buttons are rendered only when the matching client ID and client secret are configured.

## Repository Hygiene

Use placeholders for credentials and deployment-specific values. Keep local databases, session cookies, and environment files untracked.

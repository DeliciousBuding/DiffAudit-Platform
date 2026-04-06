# Temporary Shared Login Design

## Goal

Add a temporary shared-login gate for `DiffAudit-Platform` without integrating the existing portal auth system.

## Constraints

- shared username and password for all invited reviewers
- minimal code path and fast deployment
- public ingress should not expose the internal platform API directly
- keep the platform repo self-contained

## Selected Design

Use Next.js as the public edge:

- `/login` renders the temporary sign-in page
- `/api/auth/login` validates the shared credentials from environment variables and writes an `HttpOnly` session cookie
- `/api/auth/logout` clears the cookie
- `middleware.ts` protects platform pages and public API routes by checking the cookie value
- Next.js route handlers under `/api/v1/*` and `/health` proxy to the internal `apps/api-go` service on `gz2`
- `hk` nginx proxies all public traffic to the Next.js service only

## Runtime Variables

- `DIFFAUDIT_SHARED_USERNAME`
- `DIFFAUDIT_SHARED_PASSWORD`
- `DIFFAUDIT_SESSION_TOKEN`
- `DIFFAUDIT_API_BASE_URL`

## Why This Path

This is the shortest path that still gives a real session boundary. It avoids
wiring a full identity system, removes direct public access to the active
backend gateway, and keeps the temporary access policy in one place.

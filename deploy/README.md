# Container Deployment Template

This folder contains public-safe Docker deployment templates for DiffAudit Platform.

Only templates are committed. Real environment files, hostnames, TLS settings, proxy rules, OAuth secrets, API keys, and server notes must stay in the deployment environment.

## Files

| File | Purpose |
| --- | --- |
| `docker-compose.example.yml` | Generic two-service compose template for the web app and Go gateway |
| `compose.env.example` | Compose interpolation values such as image tag, bind address, and snapshot host path |
| `runtime.env.example` | Runtime environment variables passed into containers |

## Build Traceable Images

From the repository root:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\build_docker_images.ps1
```

The script tags images with the current Git revision and writes OCI labels including `org.opencontainers.image.revision`.

## Published GHCR Images

The repository can publish release images to GitHub Container Registry through `.github/workflows/publish-images.yml`.

| Image | Purpose |
| --- | --- |
| `ghcr.io/deliciousbuding/diffaudit-platform-web` | Next.js product surface |
| `ghcr.io/deliciousbuding/diffaudit-platform-api` | Go gateway |

The workflow publishes:

- `sha-<short-sha>` for immutable revision pinning;
- `main` for the current default branch image;
- `latest` for simple demos and local evaluation.

Production-like deployments should prefer `sha-<short-sha>` or an explicitly recorded revision tag. `latest` is convenient but should not be the rollback anchor.

## Run With Compose

```powershell
Copy-Item .\deploy\compose.env.example .\deploy\.env
Copy-Item .\deploy\runtime.env.example .\deploy\runtime.env
docker compose --env-file .\deploy\.env -f .\deploy\docker-compose.example.yml up -d --build
```

Before running this outside local development:

- replace placeholder credentials only in untracked files;
- point `DIFFAUDIT_PUBLIC_SNAPSHOT_DIR` at a sanitized snapshot bundle;
- set `DIFFAUDIT_PLATFORM_URL` and `DIFFAUDIT_CORS_ALLOWED_ORIGINS` for the deployment environment;
- pin image tags to a Git revision or GHCR `sha-<short-sha>` tag;
- keep proxy, certificate, firewall, and host-specific process details outside this repository.

## Server-Local Deployment Boundary

Servers may use compose, systemd, or another process manager. Keep those real units and env files local to the server because they usually contain host paths, bind addresses, domains, proxy assumptions, or secret file locations.

A safe deployment record should capture only:

- Git revision;
- image tag and OCI revision label;
- snapshot manifest timestamp;
- health check result.

Do not copy server-local unit files or deployment notes back into the public repository.

## Verify

```powershell
docker compose --env-file .\deploy\.env -f .\deploy\docker-compose.example.yml ps
docker image inspect diffaudit-platform-web:local --format '{{ index .Config.Labels "org.opencontainers.image.revision" }}'
docker image inspect diffaudit-platform-api:local --format '{{ index .Config.Labels "org.opencontainers.image.revision" }}'
```

The gateway should serve `/health`, and the web app should load through the configured platform URL.

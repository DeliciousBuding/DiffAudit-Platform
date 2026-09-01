# syntax=docker/dockerfile:1.7
# DiffAudit Platform — single-binary image (Go gateway + SPA build served from www/)
#
# Runtime: one statically linked Go binary. No Node runtime in the container,
# which removes the standalone-layout failure class of the previous image.

# ── Stage 1: SPA build (vite) ──
FROM --platform=$BUILDPLATFORM node:22-bookworm-slim AS web-builder
WORKDIR /repo

COPY package.json package-lock.json ./
COPY apps/web/package.json ./apps/web/package.json
# npm install (not npm ci): npm ci skips platform-specific optional native
# bindings (PostCSS/Tailwind oxide) when the lockfile was generated on another
# arch, breaking native arm64 builds (npm/cli#4828).
RUN npm install
COPY apps/web ./apps/web

WORKDIR /repo/apps/web
RUN npm run build

# ── Stage 2: Go API static binary ──
FROM --platform=$BUILDPLATFORM golang:1.26.1-bookworm AS go-builder
ARG TARGETOS TARGETARCH
WORKDIR /src
COPY apps/api-go/go.mod ./
RUN go mod download
COPY apps/api-go ./
COPY --from=web-builder /repo/apps/web/dist /out/www
RUN CGO_ENABLED=0 GOOS=$TARGETOS GOARCH=$TARGETARCH \
  go build -trimpath -ldflags="-w -s" -o /out/platform-api ./cmd/platform-api

# ── Stage 3: Runner ──
FROM alpine:3.21

RUN apk add --no-cache ca-certificates

# Run as UID/GID 1002 by default to match the production data volume owner;
# override via build args for other deployment hosts.
ARG APP_UID=1002
ARG APP_GID=1002
RUN addgroup -g ${APP_GID} -S diffaudit && adduser -u ${APP_UID} -S diffaudit -G diffaudit

WORKDIR /app

ARG BUILD_DATE=unknown
ARG IMAGE_SOURCE=https://github.com/DeliciousBuding/DiffAudit-Platform
ARG VCS_REF=unknown
LABEL org.opencontainers.image.title="DiffAudit Platform" \
  org.opencontainers.image.description="Go gateway with embedded SPA for DiffAudit Platform" \
  org.opencontainers.image.source="${IMAGE_SOURCE}" \
  org.opencontainers.image.revision="${VCS_REF}" \
  org.opencontainers.image.created="${BUILD_DATE}" \
  org.opencontainers.image.licenses="Apache-2.0"

COPY --from=go-builder /out/platform-api /usr/local/bin/platform-api
COPY --from=go-builder /out/www ./www

EXPOSE 3000

USER diffaudit
ENTRYPOINT ["platform-api"]
CMD ["--host", "0.0.0.0", "--port", "3000", "--static-dir", "./www"]

# syntax=docker/dockerfile:1.7
# DiffAudit Platform — merged single-container image
# Stage 1: Next.js standalone build
# Stage 2: Go API static binary
# Stage 3: Alpine runner with tini

# ── Stage 1: Next.js dependencies + build ──
FROM node:22-bookworm-slim AS web-deps
WORKDIR /repo

RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
COPY apps/web/package.json ./apps/web/package.json
RUN npm ci
RUN npm install --no-save --workspace apps/web \
  lightningcss-linux-x64-gnu@1.32.0 \
  @tailwindcss/oxide-linux-x64-gnu@4.2.2

FROM node:22-bookworm-slim AS web-builder
WORKDIR /repo
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=web-deps /repo/node_modules ./node_modules
COPY --from=web-deps /repo/apps/web/node_modules ./apps/web/node_modules
COPY package.json package-lock.json ./
COPY apps/web ./apps/web
WORKDIR /repo/apps/web
RUN npm run build

# ── Stage 2: Go API static binary ──
FROM golang:1.26.1-bookworm AS go-builder
WORKDIR /src
COPY apps/api-go/go.mod ./
RUN go mod download
COPY apps/api-go ./
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \
  go build -trimpath -ldflags="-w -s" -o /out/platform-api ./cmd/platform-api

# ── Stage 3: Runner ──
FROM alpine:3.21

RUN apk add --no-cache ca-certificates curl tini nodejs

RUN addgroup -S diffaudit && adduser -S diffaudit -G diffaudit

WORKDIR /app

ARG BUILD_DATE=unknown
ARG IMAGE_SOURCE=https://github.com/DeliciousBuding/DiffAudit-Platform
ARG VCS_REF=unknown
LABEL org.opencontainers.image.title="DiffAudit Platform" \
  org.opencontainers.image.description="Merged Next.js + Go API for DiffAudit Platform" \
  org.opencontainers.image.source="${IMAGE_SOURCE}" \
  org.opencontainers.image.revision="${VCS_REF}" \
  org.opencontainers.image.created="${BUILD_DATE}" \
  org.opencontainers.image.licenses="Apache-2.0"

# Next.js standalone output
COPY --from=web-builder /repo/apps/web/public ./public
COPY --from=web-builder /repo/apps/web/.next/standalone /app
COPY --from=web-builder /repo/apps/web/.next/static ./.next/static
COPY --from=web-builder /repo/node_modules/undici /app/node_modules/undici

# Go API binary
COPY --from=go-builder /out/platform-api /usr/local/bin/platform-api

# Startup script with signal trapping
COPY docker/start.sh /app/start.sh
RUN chmod +x /app/start.sh

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

EXPOSE 3000

USER diffaudit
ENTRYPOINT ["tini", "--"]
CMD ["/app/start.sh"]

FROM node:22-bookworm-slim AS deps
WORKDIR /repo

RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
COPY apps/web/package.json ./apps/web/package.json
RUN npm ci
# The lockfile is authored on Windows, so install Linux native optional deps explicitly.
RUN npm install --no-save --workspace apps/web \
  lightningcss-linux-x64-gnu@1.32.0 \
  @tailwindcss/oxide-linux-x64-gnu@4.2.2

FROM node:22-bookworm-slim AS builder
WORKDIR /repo
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /repo/node_modules ./node_modules
COPY --from=deps /repo/apps/web/node_modules ./apps/web/node_modules
COPY package.json package-lock.json ./
COPY apps/web ./apps/web
WORKDIR /repo/apps/web
RUN npm run build

FROM node:22-bookworm-slim AS runner
WORKDIR /app/apps/web
ARG BUILD_DATE=unknown
ARG IMAGE_SOURCE=https://github.com/DeliciousBuding/DiffAudit-Platform
ARG VCS_REF=unknown
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
LABEL org.opencontainers.image.title="DiffAudit Platform Web" \
  org.opencontainers.image.description="Next.js product surface for DiffAudit Platform" \
  org.opencontainers.image.source="${IMAGE_SOURCE}" \
  org.opencontainers.image.revision="${VCS_REF}" \
  org.opencontainers.image.created="${BUILD_DATE}" \
  org.opencontainers.image.licenses="Apache-2.0"

COPY --from=builder /repo/apps/web/public ./public
COPY --from=builder /repo/apps/web/.next/standalone /app
COPY --from=builder /repo/apps/web/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]

FROM node:22-bookworm-slim AS deps
WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

COPY apps/web/package.json apps/web/package-lock.json ./
RUN npm ci

FROM node:22-bookworm-slim AS builder
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY apps/web ./
RUN npm run build

FROM node:22-bookworm-slim AS runner
WORKDIR /app
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

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]

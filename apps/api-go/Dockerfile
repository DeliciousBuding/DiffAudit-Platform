FROM golang:1.26.1-bookworm AS builder
WORKDIR /src

COPY apps/api-go/go.mod ./
# Note: go.sum not needed — module has zero external dependencies
RUN go mod download

COPY apps/api-go ./
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags="-w -s" -o /out/platform-api ./cmd/platform-api

FROM debian:bookworm-slim AS runner
RUN apt-get update \
  && apt-get install -y --no-install-recommends curl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
RUN groupadd -r diffaudit && useradd -r -g diffaudit diffaudit
WORKDIR /app
ARG BUILD_DATE=unknown
ARG IMAGE_SOURCE=https://github.com/DeliciousBuding/DiffAudit-Platform
ARG VCS_REF=unknown
LABEL org.opencontainers.image.title="DiffAudit Platform API" \
  org.opencontainers.image.description="Snapshot-backed Go gateway for DiffAudit Platform" \
  org.opencontainers.image.source="${IMAGE_SOURCE}" \
  org.opencontainers.image.revision="${VCS_REF}" \
  org.opencontainers.image.created="${BUILD_DATE}" \
  org.opencontainers.image.licenses="Apache-2.0"
ENV DIFFAUDIT_BUILD_REVISION="${VCS_REF}"
ENV DIFFAUDIT_BUILD_DATE="${BUILD_DATE}"

COPY --from=builder /out/platform-api /usr/local/bin/platform-api

EXPOSE 8780
USER diffaudit
ENTRYPOINT ["/usr/local/bin/platform-api"]
CMD ["--host", "0.0.0.0", "--port", "8780"]

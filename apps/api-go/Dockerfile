FROM golang:1.26.1-bookworm AS builder
WORKDIR /src

COPY apps/api-go/go.mod ./
RUN go mod download

COPY apps/api-go ./
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o /out/platform-api ./cmd/platform-api

FROM debian:bookworm-slim AS runner
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
ENTRYPOINT ["/usr/local/bin/platform-api"]
CMD ["--host", "127.0.0.1", "--port", "8780"]

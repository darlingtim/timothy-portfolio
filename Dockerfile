# =========================================================================
# Multi-Stage Dockerfile for Timothy Ododo Go Portfolio Service
# =========================================================================

# Stage 1: Build binary
FROM golang:1.22-alpine AS builder

WORKDIR /app

# Install ca-certificates and build tools
RUN apk add --no-cache git ca-certificates tzdata

# Copy Go module manifests
COPY go.mod go.sum* ./
RUN go mod download

# Copy application source
COPY . .

# Build statically linked binary without debug symbols for minimal size
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build \
    -ldflags="-w -s" \
    -o /app/bin/web ./cmd/web

# Stage 2: Minimal runtime image
FROM alpine:3.19 AS runner

WORKDIR /app

# Install root CA certificates for outbound HTTPS
RUN apk --no-cache add ca-certificates tzdata

# Create non-root user for security compliance
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy compiled binary and necessary assets from builder
COPY --from=builder /app/bin/web /app/web
COPY --from=builder /app/content /app/content
COPY --from=builder /app/templates /app/templates
COPY --from=builder /app/static /app/static

RUN chown -R appuser:appgroup /app

USER appuser

# Configure Default Environment
ENV PORT=8080 \
    APP_ENV=production \
    CONTENT_DIR=/app/content \
    TEMPLATES_DIR=/app/templates \
    STATIC_DIR=/app/static

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:${PORT}/health || exit 1

ENTRYPOINT ["/app/web"]

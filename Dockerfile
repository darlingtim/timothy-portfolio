# =========================================================================
# Multi-Stage Dockerfile for Timothy Ododo Portfolio
# The app serves the modern React UI via a Go binary, with the legacy template site removed.
# =========================================================================

# Stage 1: Build the React frontend
FROM node:22-alpine AS frontend-builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Build the Go backend binary
FROM golang:1.22-alpine AS go-builder
WORKDIR /app

RUN apk add --no-cache git ca-certificates tzdata

COPY go.mod go.sum* ./
RUN go mod download

COPY . .
COPY --from=frontend-builder /app/dist ./dist

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build \
    -ldflags="-w -s" \
    -o /app/bin/web ./cmd/web

# Stage 3: Runtime image
FROM alpine:3.19 AS runner
WORKDIR /app

RUN apk --no-cache add ca-certificates tzdata
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=go-builder /app/bin/web /app/web
COPY --from=go-builder /app/content /app/content
COPY --from=go-builder /app/dist /app/dist

RUN chown -R appuser:appgroup /app

USER appuser

ENV PORT=8080 \
    APP_ENV=production \
    CONTENT_DIR=/app/content

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:${PORT}/health || exit 1

ENTRYPOINT ["/app/web"]

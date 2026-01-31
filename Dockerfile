# Build stage for frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source
COPY . .

# Build frontend
RUN npm run build

# Production stage
FROM alpine:3.19

# Install dependencies
RUN apk add --no-cache \
    ca-certificates \
    unzip \
    wget \
    curl

# Set PocketBase version
ENV PB_VERSION=0.23.12

# Download and install PocketBase (multi-arch support)
ARG TARGETARCH
RUN case "${TARGETARCH}" in \
        "amd64") PB_ARCH="amd64" ;; \
        "arm64") PB_ARCH="arm64" ;; \
        *) PB_ARCH="amd64" ;; \
    esac && \
    wget -q https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_${PB_ARCH}.zip \
    && unzip pocketbase_${PB_VERSION}_linux_${PB_ARCH}.zip -d /pb \
    && rm pocketbase_${PB_VERSION}_linux_${PB_ARCH}.zip \
    && chmod +x /pb/pocketbase

# Copy built frontend to PocketBase public directory
COPY --from=frontend-builder /app/dist /pb/pb_public

# Copy PocketBase schema
COPY pb_schema.json /pb/pb_schema.json

# Copy entrypoint script
COPY entrypoint.sh /pb/entrypoint.sh
RUN chmod +x /pb/entrypoint.sh

# Create data directory
RUN mkdir -p /pb/pb_data

# Environment variables for initial setup
ENV PB_ADMIN_EMAIL=admin@gunlocker.local
ENV PB_ADMIN_PASSWORD=changeme123

# Expose port
EXPOSE 8090

# Set working directory
WORKDIR /pb

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8090/api/health || exit 1

# Run entrypoint
ENTRYPOINT ["./entrypoint.sh"]

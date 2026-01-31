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
    wget

# Set PocketBase version
ENV PB_VERSION=0.22.27

# Download and install PocketBase
RUN wget -q https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip \
    && unzip pocketbase_${PB_VERSION}_linux_amd64.zip -d /pb \
    && rm pocketbase_${PB_VERSION}_linux_amd64.zip \
    && chmod +x /pb/pocketbase

# Copy built frontend to PocketBase public directory
COPY --from=frontend-builder /app/dist /pb/pb_public

# Copy PocketBase schema for migrations
COPY pb_schema.json /pb/pb_schema.json

# Create data directory
RUN mkdir -p /pb/pb_data

# Expose port
EXPOSE 8090

# Set working directory
WORKDIR /pb

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8090/api/health || exit 1

# Run PocketBase
CMD ["./pocketbase", "serve", "--http=0.0.0.0:8090"]

#!/bin/bash

# PocketBase Setup Script for Gun Locker
# Downloads PocketBase v0.36.1 and sets up the database

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
PB_DIR="$PROJECT_DIR/pocketbase"
PB_VERSION="0.36.1"

# Detect OS and architecture
OS=$(uname -s | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m)

case "$ARCH" in
    x86_64) ARCH="amd64" ;;
    aarch64|arm64) ARCH="arm64" ;;
    armv7l) ARCH="armv7" ;;
    i386|i686) ARCH="386" ;;
esac

# Build download URL
if [ "$OS" = "darwin" ]; then
    FILENAME="pocketbase_${PB_VERSION}_darwin_${ARCH}.zip"
elif [ "$OS" = "linux" ]; then
    FILENAME="pocketbase_${PB_VERSION}_linux_${ARCH}.zip"
else
    echo "Unsupported OS: $OS"
    exit 1
fi

DOWNLOAD_URL="https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/${FILENAME}"

echo "Setting up PocketBase v${PB_VERSION} for ${OS}/${ARCH}..."

# Create pocketbase directory
mkdir -p "$PB_DIR"
cd "$PB_DIR"

# Download if not exists
if [ ! -f "pocketbase" ]; then
    echo "Downloading PocketBase from ${DOWNLOAD_URL}..."
    curl -L -o pocketbase.zip "$DOWNLOAD_URL"

    echo "Extracting..."
    unzip -o pocketbase.zip
    rm pocketbase.zip

    chmod +x pocketbase
    echo "PocketBase downloaded and extracted."
else
    echo "PocketBase already exists."
fi

echo ""
echo "Setup complete!"
echo ""
echo "To start PocketBase, run:"
echo "  npm run pocketbase"
echo ""
echo "Or manually:"
echo "  cd pocketbase && ./pocketbase serve"
echo ""
echo "Admin UI will be available at: http://127.0.0.1:8090/_/"
echo ""
echo "After starting PocketBase for the first time:"
echo "1. Create an admin account at http://127.0.0.1:8090/_/"
echo "2. Go to Settings > Import collections"
echo "3. Import the pb_schema.json file from the project root"

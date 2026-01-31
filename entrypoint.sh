#!/bin/sh
set -e

DATA_DIR="/pb/pb_data"
SCHEMA_FILE="/pb/pb_schema.json"
SETUP_MARKER="$DATA_DIR/.setup_complete"

# Default admin credentials (should be overridden via env vars)
PB_ADMIN_EMAIL="${PB_ADMIN_EMAIL:-admin@gunlocker.local}"
PB_ADMIN_PASSWORD="${PB_ADMIN_PASSWORD:-changeme123}"

# If setup is already complete, just run PocketBase
if [ -f "$SETUP_MARKER" ]; then
    echo "Gun Locker already initialized, starting PocketBase..."
    exec ./pocketbase serve --http=0.0.0.0:8090
fi

echo "==================================="
echo "  Gun Locker - First Time Setup"
echo "==================================="

# Create superuser
echo "Creating admin user: $PB_ADMIN_EMAIL"
./pocketbase superuser upsert "$PB_ADMIN_EMAIL" "$PB_ADMIN_PASSWORD" || true

# Start PocketBase in background for API setup
./pocketbase serve --http=0.0.0.0:8090 &
PB_PID=$!

# Wait for PocketBase to be ready
echo "Waiting for PocketBase to start..."
for i in $(seq 1 30); do
    if wget -q --spider http://localhost:8090/api/health 2>/dev/null; then
        echo "PocketBase is ready"
        break
    fi
    sleep 1
done

# Authenticate as superuser (PocketBase 0.23+ uses _superusers collection)
echo "Authenticating..."
AUTH_RESPONSE=$(curl -s -X POST http://localhost:8090/api/collections/_superusers/auth-with-password \
    -H "Content-Type: application/json" \
    -d "{\"identity\":\"$PB_ADMIN_EMAIL\",\"password\":\"$PB_ADMIN_PASSWORD\"}" 2>/dev/null || echo "")

TOKEN=$(echo "$AUTH_RESPONSE" | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')

if [ -z "$TOKEN" ]; then
    echo "Warning: Could not authenticate. Schema import may fail."
    echo "You can manually import pb_schema.json via the admin UI."
else
    # Import collections schema
    echo "Importing collections schema..."
    if [ -f "$SCHEMA_FILE" ]; then
        IMPORT_RESULT=$(curl -s -X PUT http://localhost:8090/api/collections/import \
            -H "Authorization: $TOKEN" \
            -H "Content-Type: application/json" \
            -d @"$SCHEMA_FILE" 2>/dev/null || echo "failed")

        if echo "$IMPORT_RESULT" | grep -q "code"; then
            echo "Warning: Schema import may have failed: $IMPORT_RESULT"
            echo "You can manually import pb_schema.json via the admin UI."
        else
            echo "Schema imported successfully!"
        fi
    fi

    # Set application settings
    echo "Configuring application settings..."
    curl -s -X PATCH http://localhost:8090/api/settings \
        -H "Authorization: $TOKEN" \
        -H "Content-Type: application/json" \
        -d '{"meta":{"appName":"Gun Locker","appUrl":"","hideControls":false,"senderName":"Gun Locker","senderAddress":"noreply@gunlocker.local"}}' 2>/dev/null || echo "Warning: Could not set app settings"

    echo "Application configured!"
fi

# Stop background PocketBase
kill $PB_PID 2>/dev/null || true
wait $PB_PID 2>/dev/null || true

# Mark setup as complete
touch "$SETUP_MARKER"

echo "==================================="
echo "  Setup Complete!"
echo "  Admin: $PB_ADMIN_EMAIL"
echo "==================================="
echo ""

# Start PocketBase in foreground
exec ./pocketbase serve --http=0.0.0.0:8090

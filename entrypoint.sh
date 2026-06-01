#!/bin/sh
set -e

DATA_DIR="/pb/pb_data"
SCHEMA_FILE="/pb/pb_schema.json"
SETUP_MARKER="$DATA_DIR/.setup_complete"

# Admin email defaults; the password must never default to a weak shared value.
PB_ADMIN_EMAIL="${PB_ADMIN_EMAIL:-admin@gunlocker.local}"

# If no admin password was provided, generate a strong random one and print it
# once so the operator can retrieve it. This avoids shipping a known default
# password (previously "changeme123") that left every deployment exploitable.
GENERATED_PASSWORD=0
if [ -z "$PB_ADMIN_PASSWORD" ]; then
    PB_ADMIN_PASSWORD="$(head -c 24 /dev/urandom | base64 | tr -dc 'A-Za-z0-9' | head -c 24)"
    GENERATED_PASSWORD=1
fi

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
    echo "ERROR: Could not authenticate as superuser; cannot import schema."
    echo "Auth response was: $AUTH_RESPONSE"
    kill $PB_PID 2>/dev/null || true
    exit 1
else
    # Import collections schema.
    #
    # pb_schema.json is a bare JSON array of collections, but PocketBase 0.23's
    # PUT /api/collections/import expects an OBJECT:
    #   {"collections": [...], "deleteMissing": false}
    # Sending the raw array binds an empty collection list, imports nothing, and
    # still returns 200 -- so we MUST wrap it before sending.
    echo "Importing collections schema..."
    if [ -f "$SCHEMA_FILE" ]; then
        printf '{"collections":%s,"deleteMissing":false}' "$(cat "$SCHEMA_FILE")" > /tmp/import.json

        IMPORT_RESULT=$(curl -s -X PUT http://localhost:8090/api/collections/import \
            -H "Authorization: $TOKEN" \
            -H "Content-Type: application/json" \
            -d @/tmp/import.json 2>/dev/null || echo "failed")

        # An error response carries a "code"; a successful import returns 204 (empty body).
        if echo "$IMPORT_RESULT" | grep -q '"code"'; then
            echo "ERROR: Schema import failed: $IMPORT_RESULT"
            kill $PB_PID 2>/dev/null || true
            exit 1
        fi

        # Verify the custom collections actually exist instead of trusting the
        # status code. List collections and confirm our expected names are present.
        EXPECTED="firearms ammunition gear optics accessories maintenance_logs range_trips range_trip_ammo"
        COLLECTIONS_JSON=$(curl -s "http://localhost:8090/api/collections?perPage=200" \
            -H "Authorization: $TOKEN" 2>/dev/null || echo "")

        MISSING=""
        for name in $EXPECTED; do
            if ! echo "$COLLECTIONS_JSON" | grep -q "\"name\":\"$name\""; then
                MISSING="$MISSING $name"
            fi
        done

        if [ -n "$MISSING" ]; then
            echo "ERROR: Schema import reported success but these collections are missing:$MISSING"
            echo "Import response was: $IMPORT_RESULT"
            kill $PB_PID 2>/dev/null || true
            exit 1
        fi

        echo "Schema imported successfully! Verified collections:$( for n in $EXPECTED; do printf ' %s' "$n"; done )"
    fi

    # Set application settings. appUrl is intentionally omitted: PocketBase
    # rejects a blank appUrl with "Cannot be blank", and we don't know the
    # deployment URL at first boot. Operators can set it later in the admin UI.
    echo "Configuring application settings..."
    curl -s -X PATCH http://localhost:8090/api/settings \
        -H "Authorization: $TOKEN" \
        -H "Content-Type: application/json" \
        -d '{"meta":{"appName":"Gun Locker","hideControls":false,"senderName":"Gun Locker","senderAddress":"noreply@gunlocker.local"}}' 2>/dev/null || echo "Warning: Could not set app settings"

    # Harden the built-in users collection so an authenticated user can only
    # list/view their OWN account. PocketBase defaults can otherwise let any
    # logged-in user enumerate every account and harvest emails. Non-fatal.
    echo "Hardening users collection access rules..."
    curl -s -X PATCH http://localhost:8090/api/collections/users \
        -H "Authorization: $TOKEN" \
        -H "Content-Type: application/json" \
        -d '{"listRule":"id = @request.auth.id","viewRule":"id = @request.auth.id"}' >/dev/null 2>&1 \
        || echo "Warning: Could not harden users collection (set listRule/viewRule manually in the admin UI)"

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
if [ "$GENERATED_PASSWORD" = "1" ]; then
    echo "  Generated admin password: $PB_ADMIN_PASSWORD"
    echo "  ^ Save this now and change it in the admin panel."
    echo "    It will NOT be shown again."
fi
echo "==================================="
echo ""

# Start PocketBase in foreground
exec ./pocketbase serve --http=0.0.0.0:8090

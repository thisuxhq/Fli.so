#!/bin/sh
# scripts/start-pocketbase.sh

# Wait for PocketBase to be ready
until wget -q --spider http://localhost:8090/api/health; do
    echo "Waiting for PocketBase to be ready..."
    sleep 2
done

# Execute migrations using bun
for migration in /pb_migrations/*.js; do
    if [ -f "$migration" ]; then
        echo "Executing migration: $migration"
        bun run "$migration"
    fi
done

# Keep container running
tail -f /dev/null
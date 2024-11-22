# Wait for PocketBase to start
start_pocketbase() {
    /app/pocketbase serve --http=0.0.0.0:8090 --encryptionEnv=ENCRYPTION &
    PB_PID=$!
    
    # Wait for PocketBase to be ready
    until wget --spider --quiet http://localhost:8090/api/health; do
        echo 'Waiting for PocketBase to be ready...'
        sleep 1
    done
    
    echo "PocketBase is ready!"
}

# Run migrations
run_migrations() {
    echo "Running migrations..."
    
    # Loop through all .js files in the migrations directory
    for migration in /pb_migrations/*.js; do
        if [ -f "$migration" ]; then
            echo "Applying migration: $migration"
            # Execute the migration file
            /app/pocketbase migrate "$migration"
        fi
    done
    
    echo "Migrations completed!"
}

# Start PocketBase in background
start_pocketbase

# Run migrations
run_migrations

# Wait for PocketBase process
wait $PB_PID
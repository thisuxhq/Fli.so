#!/bin/sh

echo "Starting PocketBase..."
cd pocketbase

# Function to check if PocketBase is ready
check_pocketbase() {
    wget --no-verbose --tries=1 --spider http://localhost:8090/api/health
    return $?
}

# Start PocketBase
./pocketbase serve --http=0.0.0.0:8090 &
PB_PID=$!

# Wait for PocketBase to be ready
echo "Waiting for PocketBase to be ready..."
until check_pocketbase; do
    sleep 2
done

echo "PocketBase is ready. Running migrations..."

# Run migrations
if ./pocketbase migrate; then
    echo "Migrations completed successfully"
else
    echo "Migration failed"
    kill $PB_PID
    exit 1
fi

# Wait for the PocketBase process
wait $PB_PID

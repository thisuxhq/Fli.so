#!/bin/sh

# Wait for PocketBase to be ready
until ./pocketbase migrate; do
    echo "Waiting for PocketBase to be ready..."
    sleep 2
done

# Start PocketBase
exec ./pocketbase serve --http=0.0.0.0:8090


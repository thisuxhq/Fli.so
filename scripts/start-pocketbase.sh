#!/bin/sh

echo "Starting PocketBase..."
cd pocketbase

# Start PocketBase
exec ./pocketbase serve --http=0.0.0.0:8090

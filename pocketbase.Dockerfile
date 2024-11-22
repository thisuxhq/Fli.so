FROM alpine:latest

WORKDIR /app

# Install required dependencies
RUN apk add --no-cache \
    ca-certificates \
    unzip \
    wget \
    bash

# Download and install PocketBase
RUN wget https://github.com/pocketbase/pocketbase/releases/latest/download/pocketbase_linux_amd64.zip \
    && unzip pocketbase_linux_amd64.zip \
    && rm pocketbase_linux_amd64.zip \
    && chmod +x /app/pocketbase

# Create startup script
COPY ./scripts/start-pocketbase.sh /app/start-pocketbase.sh
RUN chmod +x /app/start-pocketbase.sh

EXPOSE 8090

# Create directories for PocketBase data
RUN mkdir -p /pb_data /pb_public /pb_hooks /pb_migrations

# Use the startup script as entrypoint
ENTRYPOINT ["/app/start-pocketbase.sh"]

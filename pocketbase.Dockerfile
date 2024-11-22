# pocketbase.Dockerfile
FROM alpine:3 as downloader

ARG TARGETOS
ARG TARGETARCH
ARG TARGETVARIANT
ARG VERSION=0.21.3

ENV BUILDX_ARCH="${TARGETOS:-linux}_${TARGETARCH:-amd64}${TARGETVARIANT}"

RUN wget https://github.com/pocketbase/pocketbase/releases/download/v${VERSION}/pocketbase_${VERSION}_${BUILDX_ARCH}.zip \
    && unzip pocketbase_${VERSION}_${BUILDX_ARCH}.zip \
    && chmod +x /pocketbase

FROM oven/bun:1-slim

# Install required packages
RUN apt-get update && apt-get install -y \
    ca-certificates \
    wget \
    && rm -rf /var/cache/apt/*

WORKDIR /app

# Copy PocketBase binary
COPY --from=downloader /pocketbase /usr/local/bin/pocketbase

# Copy start script and set permissions
COPY scripts/start-pocketbase.sh /app/start-pocketbase.sh
RUN chmod +x /app/start-pocketbase.sh

EXPOSE 8090

# Use the start script as entrypoint
ENTRYPOINT ["/app/start-pocketbase.sh"]
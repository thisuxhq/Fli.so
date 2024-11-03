# Build stage
FROM oven/bun AS builder

WORKDIR /app

# Install dependencies
COPY package.json bun.lockb ./
RUN bun install

# Copy all files
COPY . .

# Build the application
RUN bun run build

# Production stage
FROM oven/bun AS runner

WORKDIR /app

# Copy only necessary files from builder
COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json ./

# Install only production dependencies
RUN bun install --production

# Expose the port
EXPOSE 3000

# Set the host environment variable
ENV HOST=0.0.0.0

# Start the application
CMD ["bun", "./build/index.js"]

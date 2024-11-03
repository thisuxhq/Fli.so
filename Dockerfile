FROM oven/bun

WORKDIR /app

# Install dependencies
COPY package.json bun.lockb ./
RUN bun install

# Copy all files
COPY . .

# Build the application
RUN bun run build

# Expose the port
EXPOSE 3000

# Set the host environment variable
ENV HOST=0.0.0.0

# Start the application
CMD ["bun", "./build/index.js"]
